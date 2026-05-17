import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, Database, Key, Clock, Eye } from "lucide-react";

// ---------------------------------------------------------------------------
// SqlInjectionSandbox — interaktiv login-form med to modi.
//
// vulnerable → server bygger SQL ved streng-konkatenering. Brukerens input
//              kan bryte ut av strengen og endre WHERE-klausulen.
// safe       → server bruker prepared statement med bind-parametere. Driveren
//              sender query og data i to separate kanaler — data tolkes
//              ALDRI som SQL.
//
// Vi simulerer en mini-USERS-tabell og en mini-SECRETS-tabell for å vise
// UNION-injection. EXPLAIN-output vises for å illustrere hva planneren ser.
// ---------------------------------------------------------------------------

type Mode = "vulnerable" | "safe";
type AttackKind = "bypass" | "union" | "boolean-blind" | "time-based" | "none";

type User = { id: number; username: string; password: string; role: string };
type Secret = { id: number; label: string; value: string };

const USERS: User[] = [
  { id: 1, username: "admin", password: "tr0ub4dor", role: "admin" },
  { id: 2, username: "ola", password: "hunter2", role: "user" },
  { id: 3, username: "kari", password: "passord1", role: "user" },
];

const SECRETS: Secret[] = [
  { id: 1, label: "API_KEY",  value: "sk-live-9f3a...e7d1" },
  { id: 2, label: "DB_PASS",  value: "prod-db-pass-2024" },
  { id: 3, label: "JWT_SEED", value: "0xCAFEBABE-deadbeef" },
];

const PRESETS: { id: AttackKind; label: string; icon: typeof Key; user: string; pass: string; explain: string }[] = [
  {
    id: "bypass",
    label: "Auth-bypass",
    icon: Key,
    user: `admin' --`,
    pass: `whatever`,
    explain:
      "username = `admin' --` lukker strengen, og -- kommenterer ut resten av WHERE-klausulen. Server logger inn som admin uten å sjekke passordet.",
  },
  {
    id: "union",
    label: "UNION-injection",
    icon: Database,
    user: `x' UNION SELECT id, label, value, 'leak' FROM secrets --`,
    pass: ``,
    explain:
      "UNION SELECT henter en helt annen tabell og limer på resultatet. Driveren returnerer secrets-rader sammen med (tomt) users-resultat.",
  },
  {
    id: "boolean-blind",
    label: "Boolean blind",
    icon: Eye,
    user: `admin' AND SUBSTR(password,1,1)='t' --`,
    pass: ``,
    explain:
      "Server returnerer kun ja/nei (logget inn / ikke). Angriper gjetter passordet tegn for tegn — hver request svarer på ETT bit informasjon. Sakte men sikkert.",
  },
  {
    id: "time-based",
    label: "Time-based blind",
    icon: Clock,
    user: `admin' AND IF(SUBSTR(password,1,1)='t', SLEEP(2), 0) --`,
    pass: ``,
    explain:
      "Når response-tid > 2s → tegnet stemmer. Funker selv når server ikke avslører noe i responsen.",
  },
];

function buildQuery(mode: Mode, u: string, p: string): { sql: string; params?: string[] } {
  if (mode === "vulnerable") {
    return {
      sql: `SELECT id, username, role FROM users\nWHERE username = '${u}' AND password = '${p}'`,
    };
  }
  return {
    sql: `SELECT id, username, role FROM users\nWHERE username = ? AND password = ?`,
    params: [u, p],
  };
}

// Mini-SQL-simulator. NOT a real parser — den gjenkjenner mønstrene som
// presets-ene bruker. Nok til å vise effekten.
function runVulnerable(u: string, p: string): {
  rows: Record<string, unknown>[];
  attack: AttackKind;
  note: string;
  explain: string[];
  slept: number;
} {
  const raw = `SELECT id, username, role FROM users WHERE username = '${u}' AND password = '${p}'`;

  // Detect attack
  let attack: AttackKind = "none";
  if (u.includes("UNION SELECT")) attack = "union";
  else if (/^[^']*'[^a-z]*--/i.test(u) || u.includes("' OR '1'='1")) attack = "bypass";
  else if (u.includes("SLEEP(") || u.includes("BENCHMARK(")) attack = "time-based";
  else if (u.includes("SUBSTR(") && u.includes("=")) attack = "boolean-blind";

  const explain: string[] = [];
  let rows: Record<string, unknown>[] = [];
  let note = "";
  let slept = 0;

  switch (attack) {
    case "bypass":
      explain.push(`SCAN users`);
      explain.push(`FILTER: username = 'admin' (kommentaren -- slukker resten av WHERE)`);
      explain.push(`MATCH: row id=1 returnert UTEN passord-sjekk`);
      rows = USERS.filter((x) => x.username === u.split("'")[0]).map((x) => ({
        id: x.id,
        username: x.username,
        role: x.role,
      }));
      if (rows.length === 0)
        rows = [{ id: 1, username: "admin", role: "admin" }];
      note = "Bypass lyktes — innlogget som admin uten å vite passordet";
      break;
    case "union":
      explain.push(`SCAN users — FILTER tom (x' matcher ingen)`);
      explain.push(`UNION SELECT id, label, value, 'leak' FROM secrets — kjøres separat`);
      explain.push(`MERGE: 0 users-rader + 3 secrets-rader → 3 rader returnert`);
      rows = SECRETS.map((s) => ({
        id: s.id,
        username: s.label,
        role: s.value,
      }));
      note = "Data-lekkasje — secrets-tabellen dumpet via UNION";
      break;
    case "boolean-blind":
      explain.push(`SCAN users — FILTER username = 'admin' AND SUBSTR(password,1,1)='t'`);
      explain.push(`Admin-passord starter med 't' (tr0ub4dor) → match`);
      explain.push(`Login lyktes → angriper vet at første tegn = 't'`);
      rows = [{ id: 1, username: "admin", role: "admin" }];
      note = "Ett bit lekket: passordets første tegn er 't'. Gjenta med 'r', 'o', 'u' ...";
      break;
    case "time-based":
      slept = 2000;
      explain.push(`SCAN users — FILTER username = 'admin' AND IF(...)`);
      explain.push(`IF (substr = 't', SLEEP(2), 0) → kjører SLEEP(2)`);
      explain.push(`Response forsinket 2s → angriper vet at tegnet stemmer`);
      rows = [];
      note = "Tidsmåling avslørte at passordets første tegn er 't'. Funker selv uten output.";
      break;
    default: {
      // Standard query — match on username AND password
      explain.push(`SCAN users`);
      explain.push(`FILTER: username = '${u}' AND password = '${p}'`);
      const match = USERS.find((x) => x.username === u && x.password === p);
      if (match) {
        rows = [{ id: match.id, username: match.username, role: match.role }];
        note = "Login OK";
      } else {
        rows = [];
        note = "Ingen match — login feilet";
      }
    }
  }

  return { rows, attack, note, explain, slept };
}

function runSafe(u: string, p: string): {
  rows: Record<string, unknown>[];
  note: string;
  explain: string[];
} {
  // Prepared statement: u og p er ren data — sammenligner som streng.
  const explain = [
    `PREPARE: SELECT id, username, role FROM users WHERE username = ? AND password = ?`,
    `BIND $1 = literal string "${u}" (ingen SQL-tolkning)`,
    `BIND $2 = literal string "${p}"`,
    `EXECUTE: SEEK INDEX idx_users_username = "${u}" → match | no-match`,
  ];

  const match = USERS.find((x) => x.username === u && x.password === p);
  if (match) {
    return {
      rows: [{ id: match.id, username: match.username, role: match.role }],
      note: "Login OK — input ble behandlet som ren tekst, ingen SQL-injection mulig",
      explain,
    };
  }
  return {
    rows: [],
    note: "Ingen match — login feilet. (Selv om input inneholdt SQL-syntaks ble den tolket som streng-data.)",
    explain,
  };
}

export function SqlInjectionSandbox() {
  const [mode, setMode] = useState<Mode>("vulnerable");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<{
    rows: Record<string, unknown>[];
    note: string;
    explain: string[];
    attack?: AttackKind;
    slept?: number;
  } | null>(null);

  const query = useMemo(() => buildQuery(mode, username, password), [mode, username, password]);

  const run = () => {
    if (mode === "vulnerable") {
      const r = runVulnerable(username, password);
      setResult({
        rows: r.rows,
        note: r.note,
        explain: r.explain,
        attack: r.attack,
        slept: r.slept,
      });
    } else {
      setResult(runSafe(username, password));
    }
  };

  const applyPreset = (id: AttackKind) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setUsername(p.user);
    setPassword(p.pass);
  };

  const reset = () => {
    setUsername("");
    setPassword("");
    setResult(null);
  };

  const isVulnerable = mode === "vulnerable";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div
        className={`px-5 py-3 border-b border-border ${
          isVulnerable ? "bg-destructive/10" : "bg-success/10"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {isVulnerable ? (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-success" />
            )}
            <h3 className={`font-semibold ${isVulnerable ? "text-destructive" : "text-success"}`}>
              SQL-injection-sandbox — {isVulnerable ? "sårbar (string-concat)" : "trygg (prepared statement)"}
            </h3>
          </div>
          <div className="flex gap-1.5">
            {(["vulnerable", "safe"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setResult(null);
                }}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  mode === m
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                {m === "vulnerable" ? "Sårbar modus" : "Sikker modus"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-0 divide-x divide-border">
        {/* Venstre: form + presets */}
        <div className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Login
          </div>
          <div className="space-y-2 mb-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full font-mono text-xs rounded border border-border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full font-mono text-xs rounded border border-border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <div className="flex gap-2">
              <button
                onClick={run}
                className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Logg inn
              </button>
              <button
                onClick={reset}
                className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-muted"
              >
                Nullstill
              </button>
            </div>
          </div>

          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Generert query
          </div>
          <pre
            className={`rounded border p-3 font-mono text-[11px] overflow-x-auto whitespace-pre ${
              isVulnerable
                ? "border-destructive/30 bg-destructive/5"
                : "border-success/30 bg-success/5"
            }`}
          >
            {query.sql}
            {query.params && (
              <span className="block mt-1 text-muted-foreground">
                -- params: {query.params.map((p, i) => `$${i + 1}="${p}"`).join(", ")}
              </span>
            )}
          </pre>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Angreps-presets {!isVulnerable && "(prøv mot sikker modus også!)"}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="text-left rounded border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 p-2.5"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <p.icon className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs font-medium text-destructive">{p.label}</span>
                  </div>
                  <code className="block text-[10px] font-mono text-muted-foreground break-all">
                    user: {p.user}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Høyre: resultat + EXPLAIN */}
        <div className="p-5 bg-muted/20">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Resultat
          </div>
          {!result ? (
            <div className="text-xs text-muted-foreground italic rounded border border-dashed border-border p-3">
              Skriv brukernavn/passord (eller velg et preset) og klikk "Logg inn".
            </div>
          ) : (
            <>
              {result.rows.length > 0 ? (
                <div className="overflow-x-auto rounded border border-border bg-background">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        {Object.keys(result.rows[0]).map((k) => (
                          <th key={k} className="px-3 py-2 font-mono font-semibold">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((r, i) => (
                        <tr key={i} className="border-t border-border">
                          {Object.values(r).map((v, j) => (
                            <td key={j} className="px-3 py-1.5 font-mono">
                              {String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded border border-border bg-background p-3 text-xs text-muted-foreground italic">
                  (0 rader)
                </div>
              )}

              <div
                className={`mt-3 rounded p-2.5 text-xs ${
                  result.attack && result.attack !== "none"
                    ? "bg-destructive/10 border border-destructive/30 text-destructive"
                    : isVulnerable
                    ? "bg-muted/30 border border-border text-foreground"
                    : "bg-success/10 border border-success/30 text-success"
                }`}
              >
                {result.note}
              </div>

              {result.slept ? (
                <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                  Simulert response-tid: {result.slept}ms (SLEEP({(result.slept / 1000).toFixed(0)}) trigget)
                </div>
              ) : null}

              <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                EXPLAIN
              </div>
              <ul className="rounded border border-border bg-background p-3 font-mono text-[11px] space-y-1">
                {result.explain.map((line, i) => (
                  <li key={i} className="text-muted-foreground">
                    {i + 1}. {line}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border bg-background text-xs">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-destructive mb-1">Hvorfor sårbar?</div>
            <p className="text-muted-foreground">
              Server limer streng-konkatenering: <code>"... WHERE username = '" + u + "'"</code>.
              Når <code>u</code> inneholder <code>'</code> bryter angriperen ut av strengen og
              kan skrive vilkårlig SQL. SQL-parseren ser ingen forskjell på data og kode.
            </p>
          </div>
          <div>
            <div className="font-semibold text-success mb-1">Hvorfor trygg?</div>
            <p className="text-muted-foreground">
              Prepared statement: query og data sendes som to separate meldinger til
              database-driveren. <code>?</code> er en placeholder — driveren kompilerer
              spørringen først, og BINDER deretter data som <em>verdier</em>, aldri som
              SQL-syntaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
