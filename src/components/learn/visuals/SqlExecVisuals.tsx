// SQL-eksekvering & query-mekanikk: visuelle komponenter for flashcards i
// category: "sql". Hver export er en theme-aware SVG/JSX-figur som viser
// HVORDAN spørringen jobber under panseret — eval-pipeline, join-mekanikk,
// dedup, isolasjonsfenomener, B-tree-vedlikehold osv. Alle figurene følger
// mønsteret i Visuals.tsx: <figure> + <figcaption>, currentColor-stroke,
// fill-current/text-foreground, tailwind for tekstklasser.

import type { FC } from "react";

const STROKE = "currentColor";

// ============= EVAL PIPELINE (FROM → ... → LIMIT) =============
// Viser konkrete rader som strømmer gjennom hvert steg og blir filtrert /
// gruppert / sortert / kuttet. Komplementerer det enklere `sql-eval-order`.
export const SqlExecEvalPipeline: FC = () => {
  const stages: { id: string; note: string; rows: string }[] = [
    { id: "FROM", note: "henter alle rader", rows: "6 rader" },
    { id: "WHERE", note: "filtrerer rader", rows: "4 rader" },
    { id: "GROUP BY", note: "samler i bins", rows: "2 grupper" },
    { id: "HAVING", note: "filtrerer grupper", rows: "1 gruppe" },
    { id: "SELECT", note: "projiserer kolonner", rows: "1 gruppe" },
    { id: "ORDER BY", note: "sorterer", rows: "1 gruppe" },
    { id: "LIMIT", note: "kutter topp-N", rows: "1 gruppe" },
  ];
  return (
    <figure className="my-4">
      <div className="text-[10px] text-muted-foreground text-center mb-2 font-mono">
        SELECT avd, COUNT(*) FROM emp WHERE aktiv=1 GROUP BY avd HAVING COUNT(*)&gt;=2 ORDER BY 2 DESC LIMIT 1
      </div>
      <div className="flex flex-col gap-1 max-w-md mx-auto">
        {stages.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded border border-border bg-card/60 px-3 py-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-brand/15 text-brand text-[10px] font-mono font-semibold">
                {i + 1}
              </span>
              <span className="font-mono text-xs font-semibold w-20">{s.id}</span>
              <span className="text-[11px] text-muted-foreground flex-1">{s.note}</span>
              <span className="text-[10px] font-mono text-success">{s.rows}</span>
            </div>
            {i < stages.length - 1 && (
              <span className="text-muted-foreground text-xs">↓</span>
            )}
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Data smalner ved hvert steg — rader filtreres, grupperes, projiseres og kuttes.
      </figcaption>
    </figure>
  );
};

// ============= WHERE vs HAVING =============
// Viser at WHERE jobber på rader, HAVING jobber på grupper.
export const SqlExecWhereVsHaving: FC = () => {
  const rows = [
    { dept: "Sales", aktiv: 1 },
    { dept: "Sales", aktiv: 1 },
    { dept: "Sales", aktiv: 0 },
    { dept: "IT", aktiv: 1 },
    { dept: "IT", aktiv: 1 },
    { dept: "IT", aktiv: 1 },
    { dept: "HR", aktiv: 1 },
  ];
  const afterWhere = rows.filter((r) => r.aktiv === 1);
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
        {/* Step 1: raw rows */}
        <div className="rounded border border-border p-2">
          <div className="font-semibold text-center text-[11px] mb-1">FROM</div>
          <table className="w-full font-mono">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left">dept</th>
                <th className="text-right">aktiv</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.aktiv === 0 ? "opacity-50 line-through" : ""}>
                  <td>{r.dept}</td>
                  <td className="text-right">{r.aktiv}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-muted-foreground mt-1 text-center">7 rader</div>
        </div>
        {/* Step 2: WHERE filters rows */}
        <div className="rounded border-2 border-brand/40 p-2">
          <div className="font-semibold text-center text-[11px] mb-1">
            <span className="font-mono text-brand">WHERE aktiv=1</span>
          </div>
          <table className="w-full font-mono">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left">dept</th>
              </tr>
            </thead>
            <tbody>
              {afterWhere.map((r, i) => (
                <tr key={i}>
                  <td>{r.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-muted-foreground mt-1 text-center">
            6 rader (filtrert på RAD-nivå)
          </div>
        </div>
        {/* Step 3: GROUP BY + HAVING filters groups */}
        <div className="rounded border-2 border-success/40 p-2">
          <div className="font-semibold text-center text-[11px] mb-1">
            <span className="font-mono text-success">GROUP BY dept</span>
            <br />
            <span className="font-mono text-success">HAVING COUNT(*)&gt;=2</span>
          </div>
          <table className="w-full font-mono">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left">dept</th>
                <th className="text-right">COUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sales</td>
                <td className="text-right">2</td>
              </tr>
              <tr>
                <td>IT</td>
                <td className="text-right">3</td>
              </tr>
              <tr className="opacity-50 line-through">
                <td>HR</td>
                <td className="text-right">1</td>
              </tr>
            </tbody>
          </table>
          <div className="text-[9px] text-muted-foreground mt-1 text-center">
            2 grupper (HR kuttet på GRUPPE-nivå)
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        WHERE kutter rader før gruppering. HAVING kutter hele grupper etterpå.
      </figcaption>
    </figure>
  );
};

// ============= SELECT (projeksjon + kolonnevalg) =============
export const SqlExecSelectStar: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border border-border p-2">
        <div className="font-mono text-[10px] mb-1 text-muted-foreground">SELECT *</div>
        <table className="w-full font-mono text-[10px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="border border-border px-1 text-left">id</th>
              <th className="border border-border px-1 text-left">navn</th>
              <th className="border border-border px-1 text-left">epost</th>
              <th className="border border-border px-1 text-left">opprettet</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-1">1</td>
              <td className="border border-border px-1">Ola</td>
              <td className="border border-border px-1">ola@x.no</td>
              <td className="border border-border px-1">2024-01-02</td>
            </tr>
            <tr>
              <td className="border border-border px-1">2</td>
              <td className="border border-border px-1">Kari</td>
              <td className="border border-border px-1">kari@x.no</td>
              <td className="border border-border px-1">2024-03-15</td>
            </tr>
          </tbody>
        </table>
        <div className="text-[9px] text-muted-foreground mt-1">alle kolonner</div>
      </div>
      <div className="rounded border-2 border-success/40 p-2">
        <div className="font-mono text-[10px] mb-1 text-success">SELECT id, navn</div>
        <table className="w-full font-mono text-[10px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="border border-border px-1 text-left">id</th>
              <th className="border border-border px-1 text-left">navn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-border px-1">1</td>
              <td className="border border-border px-1">Ola</td>
            </tr>
            <tr>
              <td className="border border-border px-1">2</td>
              <td className="border border-border px-1">Kari</td>
            </tr>
          </tbody>
        </table>
        <div className="text-[9px] text-muted-foreground mt-1">projeksjon — bare valgte kolonner</div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      <span className="font-mono">SELECT</span> velger hvilke kolonner som returneres (projeksjon).
    </figcaption>
  </figure>
);

// ============= NULL — THREE-VALUED LOGIC =============
// Viktigste forklaring på "hvorfor virker ikke WHERE x = NULL".
export const SqlExecNullTriValued: FC = () => {
  const T = "T";
  const F = "F";
  const N = "N";
  type V = "T" | "F" | "N";
  const cell = (v: V) =>
    v === T
      ? "bg-success/20 text-success font-semibold"
      : v === F
      ? "bg-destructive/15 text-destructive"
      : "bg-muted/40 text-muted-foreground";
  const Row: FC<{ label: string; vals: V[] }> = ({ label, vals }) => (
    <tr>
      <th className="border border-border px-2 py-1 text-left font-mono bg-muted/30">{label}</th>
      {vals.map((v, i) => (
        <td key={i} className={`border border-border px-2 py-1 text-center font-mono ${cell(v)}`}>
          {v === N ? "NULL" : v === T ? "TRUE" : "FALSE"}
        </td>
      ))}
    </tr>
  );
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
        <div>
          <div className="font-semibold text-[11px] mb-1 text-center">AND</div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border px-2 py-1"></th>
                <th className="border border-border px-2 py-1 font-mono">TRUE</th>
                <th className="border border-border px-2 py-1 font-mono">FALSE</th>
                <th className="border border-border px-2 py-1 font-mono">NULL</th>
              </tr>
            </thead>
            <tbody>
              <Row label="TRUE" vals={["T", "F", "N"]} />
              <Row label="FALSE" vals={["F", "F", "F"]} />
              <Row label="NULL" vals={["N", "F", "N"]} />
            </tbody>
          </table>
        </div>
        <div>
          <div className="font-semibold text-[11px] mb-1 text-center">OR</div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border px-2 py-1"></th>
                <th className="border border-border px-2 py-1 font-mono">TRUE</th>
                <th className="border border-border px-2 py-1 font-mono">FALSE</th>
                <th className="border border-border px-2 py-1 font-mono">NULL</th>
              </tr>
            </thead>
            <tbody>
              <Row label="TRUE" vals={["T", "T", "T"]} />
              <Row label="FALSE" vals={["T", "F", "N"]} />
              <Row label="NULL" vals={["T", "N", "N"]} />
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-center text-muted-foreground">
        <span className="font-mono">x = NULL</span> gir <span className="font-mono bg-muted/40 px-1">NULL</span> — aldri TRUE.
        Bruk <span className="font-mono text-success">IS NULL</span>.
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        SQL bruker tre-verdi-logikk (TVL): TRUE, FALSE, NULL (ukjent).
      </figcaption>
    </figure>
  );
};

// ============= ORDER BY (ASC vs DESC) =============
export const SqlExecOrderBy: FC = () => {
  const data = [
    { navn: "Per", pris: 800 },
    { navn: "Kari", pris: 200 },
    { navn: "Ola", pris: 1200 },
    { navn: "Liv", pris: 500 },
  ];
  const asc = [...data].sort((a, b) => a.pris - b.pris);
  const desc = [...data].sort((a, b) => b.pris - a.pris);
  const Table: FC<{ title: string; rows: typeof data; color: string }> = ({ title, rows, color }) => (
    <div className={`rounded border-2 ${color} p-2`}>
      <div className="font-mono text-[10px] text-center mb-1">{title}</div>
      <table className="w-full font-mono text-[10px]">
        <thead>
          <tr className="bg-muted/40">
            <th className="border border-border px-1 text-left">navn</th>
            <th className="border border-border px-1 text-right">pris</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.navn}>
              <td className="border border-border px-1">{r.navn}</td>
              <td className="border border-border px-1 text-right">{r.pris}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <figure className="my-4">
      <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
        <Table title="(uten ORDER BY)" rows={data} color="border-border" />
        <Table title="ORDER BY pris ASC" rows={asc} color="border-success/40" />
        <Table title="ORDER BY pris DESC" rows={desc} color="border-brand/40" />
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        ASC = stigende (standard). DESC = synkende — høyeste verdier først.
      </figcaption>
    </figure>
  );
};

// ============= DISTINCT — DEDUP-FUNNEL =============
export const SqlExecDistinct: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Input pile */}
      <g>
        <text x="50" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
          input
        </text>
        {[
          { y: 24, t: "Sales" },
          { y: 44, t: "IT" },
          { y: 64, t: "Sales" },
          { y: 84, t: "HR" },
          { y: 104, t: "IT" },
          { y: 124, t: "Sales" },
          { y: 144, t: "HR" },
          { y: 164, t: "IT" },
        ].map((r, i) => (
          <g key={i}>
            <rect
              x="10"
              y={r.y}
              width="80"
              height="16"
              rx="2"
              fill="color-mix(in oklch, var(--brand) 12%, transparent)"
              stroke={STROKE}
              strokeWidth="0.5"
            />
            <text x="50" y={r.y + 11} textAnchor="middle" className="text-[10px] fill-current font-mono">
              {r.t}
            </text>
          </g>
        ))}
      </g>

      {/* Funnel */}
      <path
        d="M 110 30 L 240 30 L 200 110 L 200 170 L 150 170 L 150 110 Z"
        fill="color-mix(in oklch, var(--success) 8%, transparent)"
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <text x="175" y="70" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">
        DISTINCT
      </text>
      <text x="175" y="88" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        hash-sett
      </text>

      {/* Output unique */}
      <g>
        <text x="310" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
          output
        </text>
        {[
          { y: 60, t: "Sales" },
          { y: 90, t: "IT" },
          { y: 120, t: "HR" },
        ].map((r, i) => (
          <g key={i}>
            <rect
              x="270"
              y={r.y}
              width="80"
              height="16"
              rx="2"
              fill="color-mix(in oklch, var(--success) 20%, transparent)"
              stroke={STROKE}
              strokeWidth="0.5"
            />
            <text x="310" y={r.y + 11} textAnchor="middle" className="text-[10px] fill-current font-mono">
              {r.t}
            </text>
          </g>
        ))}
      </g>

      {/* Arrow into funnel */}
      <path
        d="M90 95 L 115 95"
        stroke={STROKE}
        strokeWidth="1.2"
        markerEnd="url(#arrDist)"
      />
      <path
        d="M205 130 L 265 95"
        stroke={STROKE}
        strokeWidth="1.2"
        markerEnd="url(#arrDist)"
      />
      <defs>
        <marker id="arrDist" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      <span className="font-mono">DISTINCT</span> deduper — beholder hver unike kombinasjon én gang.
    </figcaption>
  </figure>
);

// ============= LIKE WILDCARDS =============
export const SqlExecLikeWildcards: FC = () => {
  const cases: { pattern: string; matches: { v: string; ok: boolean }[]; note: string }[] = [
    {
      pattern: "'A%'",
      note: "starter med A",
      matches: [
        { v: "Anna", ok: true },
        { v: "Arne", ok: true },
        { v: "Berit", ok: false },
        { v: "Kari", ok: false },
      ],
    },
    {
      pattern: "'%sen'",
      note: "slutter på sen",
      matches: [
        { v: "Hansen", ok: true },
        { v: "Jensen", ok: true },
        { v: "Berg", ok: false },
        { v: "Sentral", ok: false },
      ],
    },
    {
      pattern: "'%ann%'",
      note: "inneholder ann",
      matches: [
        { v: "Anna", ok: true },
        { v: "Hannelore", ok: true },
        { v: "Janne", ok: true },
        { v: "Kari", ok: false },
      ],
    },
    {
      pattern: "'K_ri'",
      note: "K, ett tegn, ri",
      matches: [
        { v: "Kari", ok: true },
        { v: "Kåri", ok: true },
        { v: "Karli", ok: false },
        { v: "Kri", ok: false },
      ],
    },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
        {cases.map((c) => (
          <div key={c.pattern} className="rounded border border-border p-2">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-xs font-semibold text-brand">{c.pattern}</span>
              <span className="text-[10px] text-muted-foreground">{c.note}</span>
            </div>
            <ul className="space-y-0.5 font-mono">
              {c.matches.map((m) => (
                <li
                  key={m.v}
                  className={
                    m.ok
                      ? "text-success"
                      : "text-muted-foreground line-through opacity-60"
                  }
                >
                  {m.ok ? "✓" : "✗"} {m.v}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        <span className="font-mono">%</span> = vilkårlig antall tegn. <span className="font-mono">_</span> = nøyaktig ett tegn.
      </figcaption>
    </figure>
  );
};

// ============= BETWEEN — INCLUSIVE NUMBER LINE =============
export const SqlExecBetween: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 110" className="w-full max-w-md mx-auto text-foreground">
      {/* axis */}
      <line x1="30" y1="60" x2="330" y2="60" stroke={STROKE} strokeWidth="1.2" />
      {[0, 100, 200, 300, 400, 500, 600].map((v, i) => {
        const x = 30 + i * 50;
        return (
          <g key={v}>
            <line x1={x} y1="55" x2={x} y2="65" stroke={STROKE} strokeWidth="0.8" />
            <text x={x} y="78" textAnchor="middle" className="text-[9px] fill-current opacity-70">
              {v}
            </text>
          </g>
        );
      })}
      {/* inclusive interval [100, 500] */}
      <rect
        x={30 + 50}
        y="42"
        width={50 * 4}
        height="36"
        fill="color-mix(in oklch, var(--success) 18%, transparent)"
        stroke={STROKE}
        strokeWidth="0.6"
      />
      <circle cx={30 + 50} cy="60" r="5" fill="var(--success)" stroke={STROKE} strokeWidth="0.8" />
      <circle cx={30 + 50 * 5} cy="60" r="5" fill="var(--success)" stroke={STROKE} strokeWidth="0.8" />
      <text x={180} y="34" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">
        BETWEEN 100 AND 500
      </text>
      <text x={30 + 50} y="100" textAnchor="middle" className="text-[9px] fill-current text-success">
        inkludert
      </text>
      <text x={30 + 50 * 5} y="100" textAnchor="middle" className="text-[9px] fill-current text-success">
        inkludert
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      <span className="font-mono">BETWEEN a AND b</span> er <span className="font-semibold">inklusiv</span> — som <span className="font-mono">x &gt;= a AND x &lt;= b</span>.
    </figcaption>
  </figure>
);

// ============= IN — SET MEMBERSHIP =============
export const SqlExecIn: FC = () => {
  const candidates = [1, 2, 3, 4, 5, 6, 7];
  const set = new Set([1, 2, 5]);
  return (
    <figure className="my-4">
      <div className="text-[10px] text-center mb-2 font-mono">WHERE kundenr IN (1, 2, 5)</div>
      <div className="flex flex-wrap justify-center gap-2">
        {candidates.map((v) => (
          <div
            key={v}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs border ${
              set.has(v)
                ? "bg-success/20 border-success text-success font-bold"
                : "bg-muted/30 border-border text-muted-foreground opacity-60"
            }`}
          >
            {v}
          </div>
        ))}
      </div>
      <div className="text-center text-[10px] text-muted-foreground mt-2">
        ekvivalent: <span className="font-mono">kundenr = 1 OR kundenr = 2 OR kundenr = 5</span>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        <span className="font-mono">IN</span> sjekker om verdien finnes i en gitt mengde — kortform for mange OR.
      </figcaption>
    </figure>
  );
};

// ============= GROUP BY ANATOMY =============
// Bins → aggregate funksjon → ett tall per gruppe.
export const SqlExecGroupByAnatomy: FC = () => {
  const rows = [
    { dept: "Sales", lønn: 500 },
    { dept: "Sales", lønn: 700 },
    { dept: "IT", lønn: 800 },
    { dept: "IT", lønn: 900 },
    { dept: "IT", lønn: 1000 },
    { dept: "HR", lønn: 600 },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start text-[10px]">
        <div className="rounded border border-border p-2">
          <div className="font-semibold text-[11px] text-center mb-1">rader</div>
          <table className="w-full font-mono">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1 text-left">dept</th>
                <th className="border border-border px-1 text-right">lønn</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="border border-border px-1">{r.dept}</td>
                  <td className="border border-border px-1 text-right">{r.lønn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded border-2 border-brand/40 p-2">
          <div className="font-semibold text-[11px] text-center mb-1 font-mono">GROUP BY dept</div>
          <ul className="space-y-1">
            <li>
              <div className="text-brand font-mono">Sales</div>
              <div className="ml-2 font-mono text-muted-foreground">500, 700</div>
            </li>
            <li>
              <div className="text-brand font-mono">IT</div>
              <div className="ml-2 font-mono text-muted-foreground">800, 900, 1000</div>
            </li>
            <li>
              <div className="text-brand font-mono">HR</div>
              <div className="ml-2 font-mono text-muted-foreground">600</div>
            </li>
          </ul>
          <div className="text-[9px] text-muted-foreground mt-1">3 bins</div>
        </div>
        <div className="rounded border-2 border-success/40 p-2">
          <div className="font-semibold text-[11px] text-center mb-1 font-mono">AVG(lønn)</div>
          <table className="w-full font-mono">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1 text-left">dept</th>
                <th className="border border-border px-1 text-right">avg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-1">Sales</td>
                <td className="border border-border px-1 text-right">600</td>
              </tr>
              <tr>
                <td className="border border-border px-1">IT</td>
                <td className="border border-border px-1 text-right">900</td>
              </tr>
              <tr>
                <td className="border border-border px-1">HR</td>
                <td className="border border-border px-1 text-right">600</td>
              </tr>
            </tbody>
          </table>
          <div className="text-[9px] text-muted-foreground mt-1">én rad per gruppe</div>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        <span className="font-mono">GROUP BY</span> samler rader i bins; aggregatet kollapser hver bin til ett tall.
      </figcaption>
    </figure>
  );
};

// ============= COUNT(*) vs COUNT(col) =============
export const SqlExecCountStar: FC = () => {
  const rows = [
    { id: 1, epost: "ola@x.no" },
    { id: 2, epost: null },
    { id: 3, epost: "kari@x.no" },
    { id: 4, epost: null },
    { id: 5, epost: "per@x.no" },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] items-start">
        <div className="rounded border border-border p-2">
          <div className="font-semibold text-center text-[11px] mb-1">tabell</div>
          <table className="w-full font-mono text-[10px]">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1 text-left">id</th>
                <th className="border border-border px-1 text-left">epost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="border border-border px-1">{r.id}</td>
                  <td className="border border-border px-1">
                    {r.epost === null ? (
                      <span className="text-muted-foreground italic">NULL</span>
                    ) : (
                      r.epost
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded border-2 border-brand/40 p-3 text-center">
          <div className="font-mono text-[11px] mb-2">COUNT(*)</div>
          <div className="text-4xl font-mono font-bold text-brand">5</div>
          <div className="text-[10px] text-muted-foreground mt-2">alle rader</div>
        </div>
        <div className="rounded border-2 border-success/40 p-3 text-center">
          <div className="font-mono text-[11px] mb-2">COUNT(epost)</div>
          <div className="text-4xl font-mono font-bold text-success">3</div>
          <div className="text-[10px] text-muted-foreground mt-2">
            hopper over <span className="font-mono">NULL</span>
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        <span className="font-mono">COUNT(*)</span> teller rader. <span className="font-mono">COUNT(kol)</span> teller ikke-NULL-verdier.
      </figcaption>
    </figure>
  );
};

// ============= NESTED LOOP JOIN =============
export const SqlExecNestedLoopJoin: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Outer table */}
      <text x="60" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        ytre (R)
      </text>
      {["r1", "r2", "r3"].map((r, i) => (
        <g key={r}>
          <rect
            x="20"
            y={24 + i * 28}
            width="80"
            height="22"
            rx="2"
            fill={
              i === 1
                ? "color-mix(in oklch, var(--brand) 35%, transparent)"
                : "color-mix(in oklch, var(--brand) 12%, transparent)"
            }
            stroke={STROKE}
            strokeWidth="0.6"
          />
          <text x="60" y={39 + i * 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {r}
          </text>
        </g>
      ))}

      {/* Inner table */}
      <text x="320" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        indre (S)
      </text>
      {["s1", "s2", "s3", "s4"].map((s, i) => (
        <g key={s}>
          <rect
            x="280"
            y={24 + i * 28}
            width="80"
            height="22"
            rx="2"
            fill={
              i === 2
                ? "color-mix(in oklch, var(--success) 35%, transparent)"
                : "color-mix(in oklch, var(--success) 12%, transparent)"
            }
            stroke={STROKE}
            strokeWidth="0.6"
          />
          <text x="320" y={39 + i * 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {s}
          </text>
        </g>
      ))}

      {/* Loop arrows from r2 to all s */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="100"
          y1={52}
          x2="280"
          y2={35 + i * 28}
          stroke={STROKE}
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.5"
        />
      ))}
      {/* highlight the match */}
      <line x1="100" y1="52" x2="280" y2="91" stroke="var(--success)" strokeWidth="1.6" />

      <text x="190" y="175" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        for each r in R:
      </text>
      <text x="190" y="190" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        &nbsp;&nbsp;for each s in S:
      </text>
      <text x="190" y="205" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        &nbsp;&nbsp;&nbsp;&nbsp;if r.key = s.key → emit
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Nested-loop join: |R| × |S| sammenligninger — enkelt, men tregt på store tabeller.
    </figcaption>
  </figure>
);

// ============= HASH JOIN — BUILD + PROBE =============
export const SqlExecHashJoin: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 400 230" className="w-full max-w-lg mx-auto text-foreground">
      {/* Build side */}
      <text x="50" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        BUILD (R, mindre)
      </text>
      {[
        { k: "k=1", v: "r1" },
        { k: "k=2", v: "r2" },
        { k: "k=4", v: "r3" },
      ].map((row, i) => (
        <g key={i}>
          <rect
            x="10"
            y={24 + i * 28}
            width="80"
            height="22"
            rx="2"
            fill="color-mix(in oklch, var(--brand) 15%, transparent)"
            stroke={STROKE}
            strokeWidth="0.6"
          />
          <text x="50" y={39 + i * 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {row.k} → {row.v}
          </text>
        </g>
      ))}

      {/* arrow → hash table */}
      <path d="M95 50 L 150 80" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrHJ)" />
      <text x="100" y="68" className="text-[9px] fill-current opacity-70">build</text>

      {/* Hash table */}
      <rect
        x="150"
        y="60"
        width="100"
        height="100"
        rx="3"
        fill="color-mix(in oklch, var(--success) 10%, transparent)"
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <text x="200" y="75" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        hash-tabell
      </text>
      <line x1="155" y1="82" x2="245" y2="82" stroke={STROKE} strokeWidth="0.5" opacity="0.5" />
      {[
        { h: "h(1)", v: "r1" },
        { h: "h(2)", v: "r2" },
        { h: "h(4)", v: "r3" },
      ].map((b, i) => (
        <text
          key={i}
          x="200"
          y={100 + i * 18}
          textAnchor="middle"
          className="text-[9px] fill-current font-mono"
        >
          {b.h} → {b.v}
        </text>
      ))}

      {/* Probe side */}
      <text x="350" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        PROBE (S, større)
      </text>
      {[
        { k: "k=2", v: "s1", hit: true },
        { k: "k=3", v: "s2", hit: false },
        { k: "k=4", v: "s3", hit: true },
        { k: "k=5", v: "s4", hit: false },
      ].map((row, i) => (
        <g key={i}>
          <rect
            x="310"
            y={24 + i * 28}
            width="80"
            height="22"
            rx="2"
            fill={
              row.hit
                ? "color-mix(in oklch, var(--success) 30%, transparent)"
                : "color-mix(in oklch, var(--muted) 30%, transparent)"
            }
            stroke={STROKE}
            strokeWidth="0.6"
          />
          <text x="350" y={39 + i * 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {row.k} {row.hit ? "✓" : "✗"}
          </text>
        </g>
      ))}
      <path d="M310 50 L 255 95" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrHJ)" />
      <text x="265" y="65" className="text-[9px] fill-current opacity-70">probe</text>

      <text x="200" y="195" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        1) BUILD: scan R, sett inn i hash(key)
      </text>
      <text x="200" y="210" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        2) PROBE: for hver s, slå opp hash(s.key) → match
      </text>
      <defs>
        <marker id="arrHJ" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Hash join — O(|R|+|S|). Den minste siden bygges som hash-tabell først.
    </figcaption>
  </figure>
);

// ============= SORT-MERGE JOIN =============
export const SqlExecSortMergeJoin: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 200" className="w-full max-w-md mx-auto text-foreground">
      <text x="60" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        sortert R
      </text>
      <text x="280" y="14" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        sortert S
      </text>
      {[1, 3, 4, 4, 7].map((k, i) => (
        <g key={i}>
          <rect
            x="30"
            y={24 + i * 28}
            width="60"
            height="22"
            rx="2"
            fill={
              k === 4
                ? "color-mix(in oklch, var(--success) 30%, transparent)"
                : "color-mix(in oklch, var(--brand) 12%, transparent)"
            }
            stroke={STROKE}
            strokeWidth="0.6"
          />
          <text x="60" y={39 + i * 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {k}
          </text>
        </g>
      ))}
      {[2, 4, 4, 5, 8].map((k, i) => (
        <g key={i}>
          <rect
            x="250"
            y={24 + i * 28}
            width="60"
            height="22"
            rx="2"
            fill={
              k === 4
                ? "color-mix(in oklch, var(--success) 30%, transparent)"
                : "color-mix(in oklch, var(--brand) 12%, transparent)"
            }
            stroke={STROKE}
            strokeWidth="0.6"
          />
          <text x="280" y={39 + i * 28} textAnchor="middle" className="text-[10px] fill-current font-mono">
            {k}
          </text>
        </g>
      ))}
      {/* pointers */}
      <text x="105" y="78" className="text-[10px] fill-current font-mono text-brand">
        ← i
      </text>
      <text x="225" y="78" className="text-[10px] fill-current font-mono text-brand">
        j →
      </text>
      {/* match lines for 4 ↔ 4 */}
      <line x1="90" y1="80" x2="250" y2="80" stroke="var(--success)" strokeWidth="1" />
      <line x1="90" y1="108" x2="250" y2="80" stroke="var(--success)" strokeWidth="0.8" />
      <line x1="90" y1="80" x2="250" y2="108" stroke="var(--success)" strokeWidth="0.8" />
      <line x1="90" y1="108" x2="250" y2="108" stroke="var(--success)" strokeWidth="1" />

      <text x="190" y="180" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        flytt mindre peker frem til nøklene er like → emit cross-pairs
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Sort-merge join — krever sorterte input, men er minneeffektivt og stabilt.
    </figcaption>
  </figure>
);

// ============= CROSS JOIN — CARTESIAN PRODUCT =============
export const SqlExecCrossJoin: FC = () => {
  const A = ["a1", "a2", "a3"];
  const B = ["b1", "b2"];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-[auto_1fr] gap-3 max-w-sm mx-auto items-center">
        <div className="flex flex-col gap-1 text-[10px] font-mono">
          {A.map((a) => (
            <div
              key={a}
              className="rounded bg-brand/15 border border-border px-2 py-1 text-center"
            >
              {a}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
          {A.flatMap((a) =>
            B.map((b) => (
              <div
                key={`${a}-${b}`}
                className="rounded bg-success/15 border border-border px-2 py-1 text-center"
              >
                {a}·{b}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="text-center text-[10px] text-muted-foreground mt-2 font-mono">
        |A| × |B| = 3 × 2 = 6 rader
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        CROSS JOIN = kartesisk produkt — alle par. Stort raskt!
      </figcaption>
    </figure>
  );
};

// ============= RIGHT JOIN ≡ LEFT JOIN (swapped) =============
export const SqlExecRightJoinSwap: FC = () => (
  <figure className="my-4">
    <div className="space-y-2 max-w-md mx-auto text-[11px]">
      <div className="rounded border border-border p-2 font-mono text-[11px] bg-muted/20">
        SELECT * FROM A <span className="text-brand">RIGHT JOIN</span> B ON A.id = B.aid
      </div>
      <div className="text-center text-muted-foreground text-[10px]">↕ ekvivalent ↕</div>
      <div className="rounded border-2 border-success/40 p-2 font-mono text-[11px] bg-muted/20">
        SELECT * FROM B <span className="text-success">LEFT JOIN</span> A ON A.id = B.aid
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      RIGHT JOIN brukes sjelden — bytt tabellrekkefølge og skriv LEFT JOIN.
    </figcaption>
  </figure>
);

// ============= SUBQUERY (korrelert vs ikke-korrelert) =============
export const SqlExecSubqueryCorrelation: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border border-border p-3">
        <div className="font-semibold text-center text-[11px] mb-2">Ikke-korrelert</div>
        <pre className="font-mono text-[10px] leading-snug bg-muted/30 rounded p-2 overflow-x-auto">
{`SELECT navn FROM kunde
WHERE kundenr IN (
  SELECT kundenr FROM utleie  -- ↘ kjøres ÉN gang
);`}
        </pre>
        <div className="text-[10px] text-muted-foreground mt-2">
          Indre query er uavhengig — kjøres én gang, resultatet caches.
        </div>
      </div>
      <div className="rounded border-2 border-brand/40 p-3">
        <div className="font-semibold text-center text-[11px] mb-2">Korrelert</div>
        <pre className="font-mono text-[10px] leading-snug bg-muted/30 rounded p-2 overflow-x-auto">
{`SELECT navn FROM kunde k
WHERE EXISTS (
  SELECT 1 FROM utleie u
  WHERE u.kundenr = k.kundenr  -- ↙ ref. ytre
);`}
        </pre>
        <div className="text-[10px] text-muted-foreground mt-2">
          Indre query refererer ytre rad — kjøres på <span className="font-semibold">nytt for hver rad</span>.
        </div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Korrelasjon avgjør om subquery kjøres én gang eller N ganger.
    </figcaption>
  </figure>
);

// ============= INSERT BEFORE/AFTER =============
export const SqlExecInsertBeforeAfter: FC = () => {
  const before = [
    { id: 1, navn: "Ola" },
    { id: 2, navn: "Kari" },
  ];
  const after = [...before, { id: 1003, navn: "Per" }];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center text-[10px]">
        <div className="rounded border border-border p-2">
          <div className="font-semibold text-center text-[11px] mb-1">før</div>
          <table className="w-full font-mono">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1 text-left">id</th>
                <th className="border border-border px-1 text-left">navn</th>
              </tr>
            </thead>
            <tbody>
              {before.map((r) => (
                <tr key={r.id}>
                  <td className="border border-border px-1">{r.id}</td>
                  <td className="border border-border px-1">{r.navn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center">
          <div className="font-mono text-[10px] text-brand">INSERT</div>
          <div className="text-2xl">→</div>
        </div>
        <div className="rounded border-2 border-success/40 p-2">
          <div className="font-semibold text-center text-[11px] mb-1">etter</div>
          <table className="w-full font-mono">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1 text-left">id</th>
                <th className="border border-border px-1 text-left">navn</th>
              </tr>
            </thead>
            <tbody>
              {after.map((r, i) => (
                <tr key={r.id} className={i === after.length - 1 ? "bg-success/15 font-semibold" : ""}>
                  <td className="border border-border px-1">{r.id}</td>
                  <td className="border border-border px-1">{r.navn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-center text-[10px] font-mono text-muted-foreground mt-2">
        INSERT INTO kunde (id, navn) VALUES (1003, 'Per');
      </div>
    </figure>
  );
};

// ============= UPDATE — WHERE eller ikke =============
export const SqlExecUpdateWhereTrap: FC = () => {
  const before = [
    { id: 1, navn: "Ola" },
    { id: 2, navn: "Kari" },
    { id: 3, navn: "Per", changed: true },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
        <div className="rounded border-2 border-success/40 p-2">
          <div className="font-mono text-[10px] mb-1 text-success text-center">
            UPDATE … WHERE id = 3
          </div>
          <table className="w-full font-mono">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1">id</th>
                <th className="border border-border px-1">navn</th>
              </tr>
            </thead>
            <tbody>
              {before.map((r) => (
                <tr key={r.id} className={r.changed ? "bg-success/20 font-semibold" : ""}>
                  <td className="border border-border px-1 text-center">{r.id}</td>
                  <td className="border border-border px-1">{r.changed ? "Pål" : r.navn}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-muted-foreground mt-1 text-center">1 rad endret</div>
        </div>
        <div className="rounded border-2 border-destructive/50 p-2">
          <div className="font-mono text-[10px] mb-1 text-destructive text-center">
            UPDATE … (uten WHERE)
          </div>
          <table className="w-full font-mono">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-1">id</th>
                <th className="border border-border px-1">navn</th>
              </tr>
            </thead>
            <tbody>
              {before.map((r) => (
                <tr key={r.id} className="bg-destructive/15">
                  <td className="border border-border px-1 text-center">{r.id}</td>
                  <td className="border border-border px-1">Pål</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-[9px] text-destructive mt-1 text-center">
            ALLE rader endret!
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Uten WHERE oppdateres hele tabellen — test alltid med SELECT først.
      </figcaption>
    </figure>
  );
};

// ============= DELETE — WHERE eller ikke =============
export const SqlExecDeleteWhereTrap: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
      <div className="rounded border-2 border-success/40 p-2">
        <div className="font-mono text-[10px] mb-1 text-success text-center">
          DELETE FROM t WHERE id = 3
        </div>
        <ul className="space-y-1 font-mono">
          {[1, 2, 3, 4, 5].map((id) => (
            <li
              key={id}
              className={
                id === 3
                  ? "line-through text-destructive bg-destructive/10 rounded px-1"
                  : ""
              }
            >
              rad {id}
            </li>
          ))}
        </ul>
        <div className="text-[9px] text-muted-foreground mt-1 text-center">1 slettet</div>
      </div>
      <div className="rounded border-2 border-destructive/50 p-2">
        <div className="font-mono text-[10px] mb-1 text-destructive text-center">
          DELETE FROM t (uten WHERE)
        </div>
        <ul className="space-y-1 font-mono">
          {[1, 2, 3, 4, 5].map((id) => (
            <li
              key={id}
              className="line-through text-destructive bg-destructive/10 rounded px-1"
            >
              rad {id}
            </li>
          ))}
        </ul>
        <div className="text-[9px] text-destructive mt-1 text-center">
          ALT borte!
        </div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      DELETE uten WHERE tømmer tabellen. Bruk transaksjon ved tvil — så kan du ROLLBACK.
    </figcaption>
  </figure>
);

// ============= VIEW — virtuell tabell =============
export const SqlExecView: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Base tables */}
      <rect
        x="20"
        y="120"
        width="100"
        height="80"
        rx="3"
        fill="color-mix(in oklch, var(--brand) 12%, transparent)"
        stroke={STROKE}
        strokeWidth="1"
      />
      <text x="70" y="138" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">
        kunde
      </text>
      <text x="70" y="160" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        id, navn,
      </text>
      <text x="70" y="172" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        epost
      </text>

      <rect
        x="160"
        y="120"
        width="100"
        height="80"
        rx="3"
        fill="color-mix(in oklch, var(--brand) 12%, transparent)"
        stroke={STROKE}
        strokeWidth="1"
      />
      <text x="210" y="138" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">
        utleie
      </text>
      <text x="210" y="160" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        kundenr, pris
      </text>

      {/* View as window */}
      <rect
        x="80"
        y="20"
        width="220"
        height="60"
        rx="4"
        fill="color-mix(in oklch, var(--success) 12%, transparent)"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <text x="190" y="40" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold text-success">
        VIEW v_kundetotal
      </text>
      <text x="190" y="56" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        SELECT navn, SUM(pris) FROM kunde JOIN utleie
      </text>
      <text x="190" y="68" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        GROUP BY navn
      </text>

      {/* arrows */}
      <path d="M120 120 L 150 85" stroke={STROKE} strokeWidth="0.8" markerEnd="url(#arrView)" />
      <path d="M210 120 L 220 85" stroke={STROKE} strokeWidth="0.8" markerEnd="url(#arrView)" />

      <defs>
        <marker id="arrView" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Et view er en lagret SELECT — et "vindu" mot underliggende tabeller, ikke egne data.
    </figcaption>
  </figure>
);

// ============= TRANSAKSJON — BEGIN/COMMIT/ROLLBACK timeline =============
export const SqlExecTransaction: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 400 160" className="w-full max-w-md mx-auto text-foreground">
      <line x1="20" y1="80" x2="380" y2="80" stroke={STROKE} strokeWidth="1" />
      {/* BEGIN */}
      <circle cx="40" cy="80" r="5" fill="var(--brand)" stroke={STROKE} strokeWidth="0.5" />
      <text x="40" y="65" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">
        BEGIN
      </text>
      {/* op1 */}
      <circle cx="120" cy="80" r="4" fill={STROKE} />
      <text x="120" y="100" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        UPDATE A
      </text>
      {/* op2 */}
      <circle cx="200" cy="80" r="4" fill={STROKE} />
      <text x="200" y="100" textAnchor="middle" className="text-[9px] fill-current opacity-80">
        UPDATE B
      </text>
      {/* COMMIT */}
      <circle cx="290" cy="80" r="6" fill="var(--success)" stroke={STROKE} strokeWidth="0.5" />
      <text x="290" y="65" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold text-success">
        COMMIT
      </text>
      <text x="290" y="118" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        endringer synlige
      </text>
      {/* ROLLBACK branch */}
      <path d="M200 80 Q 250 130 290 130" stroke="var(--destructive)" strokeDasharray="3 2" strokeWidth="1" fill="none" />
      <circle cx="290" cy="130" r="6" fill="var(--destructive)" stroke={STROKE} strokeWidth="0.5" />
      <text x="320" y="135" className="text-[10px] fill-current font-mono font-semibold text-destructive">
        ROLLBACK
      </text>
      <text x="320" y="148" className="text-[9px] fill-current opacity-70">
        alt forkastet
      </text>

      <text x="200" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        ÉN logisk enhet — alt eller ingenting
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      En transaksjon grupperer flere SQL-operasjoner som én ACID-enhet.
    </figcaption>
  </figure>
);

// ============= ACID — CONSISTENCY =============
export const SqlExecAcidConsistency: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      {/* Before */}
      <rect x="10" y="40" width="120" height="100" rx="4" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} strokeWidth="1" />
      <text x="70" y="60" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        FØR
      </text>
      <text x="70" y="80" textAnchor="middle" className="text-[10px] fill-current font-mono">
        A=100, B=50
      </text>
      <text x="70" y="100" textAnchor="middle" className="text-[10px] fill-current text-success">
        sum = 150 ✓
      </text>
      <text x="70" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        invariant gyldig
      </text>

      {/* Tx */}
      <rect x="150" y="60" width="80" height="60" rx="4" fill="color-mix(in oklch, var(--success) 8%, transparent)" stroke={STROKE} strokeDasharray="3 2" strokeWidth="1" />
      <text x="190" y="80" textAnchor="middle" className="text-[10px] fill-current font-mono">
        A −20
      </text>
      <text x="190" y="98" textAnchor="middle" className="text-[10px] fill-current font-mono">
        B +20
      </text>

      {/* After */}
      <rect x="250" y="40" width="120" height="100" rx="4" fill="color-mix(in oklch, var(--success) 10%, transparent)" stroke={STROKE} strokeWidth="1" />
      <text x="310" y="60" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        ETTER
      </text>
      <text x="310" y="80" textAnchor="middle" className="text-[10px] fill-current font-mono">
        A=80, B=70
      </text>
      <text x="310" y="100" textAnchor="middle" className="text-[10px] fill-current text-success">
        sum = 150 ✓
      </text>
      <text x="310" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        invariant fortsatt gyldig
      </text>

      <path d="M130 90 L 150 90" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrC)" />
      <path d="M230 90 L 250 90" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrC)" />
      <text x="190" y="155" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        Constraint: A + B = 150 (regnskaps-balanse)
      </text>
      <defs>
        <marker id="arrC" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Consistency — transaksjonen tar databasen fra én gyldig tilstand til en annen.
    </figcaption>
  </figure>
);

// ============= ACID — DURABILITY (WAL) =============
export const SqlExecAcidDurability: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      {/* RAM buffer */}
      <rect x="20" y="20" width="140" height="70" rx="4" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} strokeWidth="1" />
      <text x="90" y="38" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        RAM (buffer)
      </text>
      <text x="90" y="56" textAnchor="middle" className="text-[9px] fill-current font-mono opacity-80">
        dirty page (ennå ikke flushet)
      </text>
      <text x="90" y="76" textAnchor="middle" className="text-[9px] fill-current opacity-60">
        ⚡ tapes ved strømbrudd
      </text>

      {/* WAL */}
      <rect x="210" y="20" width="150" height="70" rx="4" fill="color-mix(in oklch, var(--success) 12%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="285" y="38" textAnchor="middle" className="text-[10px] fill-current font-semibold text-success">
        WAL (disk)
      </text>
      <text x="285" y="56" textAnchor="middle" className="text-[9px] fill-current font-mono">
        LSN:5 UPDATE A
      </text>
      <text x="285" y="68" textAnchor="middle" className="text-[9px] fill-current font-mono">
        LSN:6 COMMIT
      </text>
      <text x="285" y="84" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        fsync() → varig
      </text>

      {/* Data file */}
      <rect x="20" y="120" width="340" height="40" rx="4" fill="color-mix(in oklch, var(--muted) 35%, transparent)" stroke={STROKE} strokeWidth="1" />
      <text x="190" y="138" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        datafil (disk) — oppdateres senere
      </text>
      <text x="190" y="152" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        recovery: les WAL og redo til konsistens
      </text>

      <path d="M160 55 L 210 55" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrD)" />
      <text x="185" y="48" textAnchor="middle" className="text-[8px] fill-current opacity-70">
        write
      </text>
      <defs>
        <marker id="arrD" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Durability via write-ahead log — COMMIT er trygt så snart WAL er fsync'et.
    </figcaption>
  </figure>
);

// ============= COMMIT vs ROLLBACK (split) =============
export const SqlExecCommitVsRollback: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border-2 border-success/40 p-3">
        <div className="font-semibold text-center mb-2 font-mono text-success">COMMIT</div>
        <div className="text-center text-3xl mb-2">✓</div>
        <ul className="text-[10px] space-y-1">
          <li>• endringer blir permanente</li>
          <li>• synlige for andre transaksjoner</li>
          <li>• låser slippes</li>
          <li>• WAL fsync'es til disk</li>
        </ul>
      </div>
      <div className="rounded border-2 border-destructive/40 p-3">
        <div className="font-semibold text-center mb-2 font-mono text-destructive">ROLLBACK</div>
        <div className="text-center text-3xl mb-2">↶</div>
        <ul className="text-[10px] space-y-1">
          <li>• alle endringer forkastes</li>
          <li>• tilstand tilbake til BEGIN</li>
          <li>• låser slippes</li>
          <li>• som om transaksjonen aldri skjedde</li>
        </ul>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Hver transaksjon ender i nøyaktig én av disse — det er det atomicity betyr.
    </figcaption>
  </figure>
);

// ============= DATATYPER — INT/VARCHAR/DATE/DECIMAL OVERVIEW =============
export const SqlExecDataTypesOverview: FC = () => {
  const types = [
    { name: "INT", icon: "123", note: "heltall, ~2 mrd", color: "brand" },
    { name: "BIGINT", icon: "1.2e18", note: "store heltall", color: "brand" },
    { name: "DECIMAL(10,2)", icon: "99.95", note: "eksakt — penger", color: "success" },
    { name: "FLOAT", icon: "≈π", note: "binær, avrundes", color: "muted" },
    { name: "VARCHAR(n)", icon: "Aa", note: "kort tekst, indekserbart", color: "brand" },
    { name: "TEXT", icon: "¶", note: "lang tekst", color: "muted" },
    { name: "DATE", icon: "📅", note: "YYYY-MM-DD", color: "success" },
    { name: "DATETIME", icon: "🕐", note: "+ tid, ingen tz", color: "success" },
    { name: "TIMESTAMP", icon: "🌐", note: "+ tid, tz, 1970–2038", color: "success" },
    { name: "BOOLEAN", icon: "T/F", note: "ofte TINYINT(1)", color: "brand" },
  ];
  const palette: Record<string, string> = {
    brand: "bg-brand/15 text-brand border-brand/30",
    success: "bg-success/15 text-success border-success/30",
    muted: "bg-muted/40 text-muted-foreground border-border",
  };
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
        {types.map((t) => (
          <div
            key={t.name}
            className={`rounded border p-2 ${palette[t.color]}`}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-semibold text-[11px]">{t.name}</span>
              <span className="font-mono text-[10px] opacity-70">{t.icon}</span>
            </div>
            <div className="text-[10px] opacity-90 mt-0.5">{t.note}</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Velg typen som matcher dataens natur — feil valg gir feil resultater.
      </figcaption>
    </figure>
  );
};

// ============= VARCHAR vs TEXT =============
export const SqlExecVarcharVsText: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border-2 border-brand/40 p-3">
        <div className="font-mono font-semibold text-brand text-center mb-2">VARCHAR(50)</div>
        <ul className="text-[10px] space-y-1">
          <li>• maks 50 tegn</li>
          <li>• fullt indekserbar</li>
          <li>• bra for navn, e-post, koder</li>
          <li>• DEFAULT støttes</li>
        </ul>
        <div className="mt-2 font-mono text-[10px] bg-muted/30 rounded p-1.5">
          [Hansen______________________________________]
        </div>
      </div>
      <div className="rounded border-2 border-muted p-3">
        <div className="font-mono font-semibold text-center mb-2">TEXT</div>
        <ul className="text-[10px] space-y-1">
          <li>• opp til 64 KB</li>
          <li>• kan kun ha prefiks-indeks</li>
          <li>• bra for kommentarer, artikler</li>
          <li>• ingen DEFAULT i MySQL</li>
        </ul>
        <div className="mt-2 font-mono text-[10px] bg-muted/30 rounded p-1.5 break-all">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod...
        </div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      VARCHAR for korte felter, TEXT for langt fritekst.
    </figcaption>
  </figure>
);

// ============= DATE vs DATETIME vs TIMESTAMP =============
export const SqlExecDateTypes: FC = () => (
  <figure className="my-4">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[10px] max-w-md mx-auto">
        <thead>
          <tr className="bg-muted/40">
            <th className="border border-border px-2 py-1 text-left font-mono">type</th>
            <th className="border border-border px-2 py-1 text-left">format</th>
            <th className="border border-border px-2 py-1 text-left">tz?</th>
            <th className="border border-border px-2 py-1 text-left">rekkevidde</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-border px-2 py-1 font-mono text-brand">DATE</td>
            <td className="border border-border px-2 py-1 font-mono">2026-05-17</td>
            <td className="border border-border px-2 py-1">–</td>
            <td className="border border-border px-2 py-1">1000–9999</td>
          </tr>
          <tr>
            <td className="border border-border px-2 py-1 font-mono text-brand">DATETIME</td>
            <td className="border border-border px-2 py-1 font-mono">2026-05-17 14:32:00</td>
            <td className="border border-border px-2 py-1">nei</td>
            <td className="border border-border px-2 py-1">1000–9999</td>
          </tr>
          <tr>
            <td className="border border-border px-2 py-1 font-mono text-success">TIMESTAMP</td>
            <td className="border border-border px-2 py-1 font-mono">2026-05-17 14:32:00</td>
            <td className="border border-border px-2 py-1 text-success">ja (UTC)</td>
            <td className="border border-border px-2 py-1 text-destructive">1970–2038</td>
          </tr>
        </tbody>
      </table>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      DATETIME for fremtidige datoer, TIMESTAMP når tidssone trengs (men maks år 2038).
    </figcaption>
  </figure>
);

// ============= DECIMAL vs FLOAT (penger) =============
export const SqlExecDecimalVsFloat: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border-2 border-destructive/40 p-3">
        <div className="font-mono font-semibold text-destructive text-center mb-2">FLOAT</div>
        <pre className="font-mono text-[10px] bg-muted/30 rounded p-2 leading-snug">
{`0.1 + 0.2
  = 0.30000000000000004`}
        </pre>
        <div className="text-[10px] text-destructive mt-2">binær — kan ikke uttrykke 0.1 eksakt</div>
      </div>
      <div className="rounded border-2 border-success/40 p-3">
        <div className="font-mono font-semibold text-success text-center mb-2">DECIMAL(10,2)</div>
        <pre className="font-mono text-[10px] bg-muted/30 rounded p-2 leading-snug">
{`0.10 + 0.20
  = 0.30`}
        </pre>
        <div className="text-[10px] text-success mt-2">desimal — eksakt for penger</div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Bruk DECIMAL for valuta. FLOAT bare for målinger der avrunding er OK.
    </figcaption>
  </figure>
);

// ============= NOT NULL + DEFAULT =============
export const SqlExecNotNullDefault: FC = () => (
  <figure className="my-4">
    <div className="space-y-2 max-w-md mx-auto text-[11px]">
      <pre className="font-mono text-[10px] bg-muted/30 rounded p-2 leading-snug">
{`Status VARCHAR(20) NOT NULL DEFAULT 'aktiv'`}
      </pre>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded border border-success/40 p-2">
          <div className="font-mono text-[10px] text-success mb-1">INSERT med verdi</div>
          <div className="font-mono text-[10px] bg-muted/30 rounded p-1.5">
            INSERT (Status) VALUES ('sperret');
          </div>
          <div className="font-mono text-[10px] mt-1">→ Status = 'sperret'</div>
        </div>
        <div className="rounded border border-success/40 p-2">
          <div className="font-mono text-[10px] text-success mb-1">INSERT uten Status</div>
          <div className="font-mono text-[10px] bg-muted/30 rounded p-1.5">
            INSERT (KundeNr) VALUES (5);
          </div>
          <div className="font-mono text-[10px] mt-1">→ Status = 'aktiv' (DEFAULT)</div>
        </div>
        <div className="rounded border border-destructive/40 p-2 sm:col-span-2">
          <div className="font-mono text-[10px] text-destructive mb-1">INSERT NULL eksplisitt</div>
          <div className="font-mono text-[10px] bg-muted/30 rounded p-1.5">
            INSERT (Status) VALUES (NULL);
          </div>
          <div className="font-mono text-[10px] mt-1 text-destructive">→ ERROR: cannot be NULL</div>
        </div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      NOT NULL forbyr ukjente verdier. DEFAULT gir automatisk verdi når ingen oppgis.
    </figcaption>
  </figure>
);

// ============= ISOLATION — DIRTY READ =============
export const SqlExecIsolationDirty: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 200" className="w-full max-w-md mx-auto text-foreground">
      {/* lifelines */}
      <line x1="80" y1="30" x2="80" y2="190" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="300" y1="30" x2="300" y2="190" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      <text x="80" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        T1
      </text>
      <text x="300" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        T2
      </text>

      {/* T2 writes (uncommitted) */}
      <rect x="270" y="40" width="60" height="16" fill="color-mix(in oklch, var(--destructive) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="300" y="52" textAnchor="middle" className="text-[9px] fill-current font-mono">
        UPDATE
      </text>
      <text x="335" y="52" className="text-[9px] fill-current opacity-70">
        ikke commit
      </text>

      {/* T1 reads */}
      <path d="M270 75 L 95 75" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrIso1)" />
      <text x="180" y="70" textAnchor="middle" className="text-[9px] fill-current">
        T1 leser ny verdi
      </text>
      <rect x="50" y="70" width="60" height="16" fill="color-mix(in oklch, var(--destructive) 20%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="80" y="82" textAnchor="middle" className="text-[9px] fill-current font-mono">
        SELECT
      </text>

      {/* T2 ROLLBACK */}
      <rect x="270" y="115" width="60" height="16" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="300" y="127" textAnchor="middle" className="text-[9px] fill-current font-mono">
        ROLLBACK
      </text>

      {/* fallout */}
      <text x="80" y="165" textAnchor="middle" className="text-[10px] fill-current text-destructive font-semibold">
        T1 har lest "ugyldig" data
      </text>
      <text x="80" y="180" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        — som aldri eksisterte
      </text>

      <defs>
        <marker id="arrIso1" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Dirty read — T1 ser T2 sine ikke-committede endringer. Forhindres fra READ COMMITTED.
    </figcaption>
  </figure>
);

// ============= ISOLATION — NON-REPEATABLE READ =============
export const SqlExecIsolationNonRepeatable: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 210" className="w-full max-w-md mx-auto text-foreground">
      <line x1="80" y1="30" x2="80" y2="200" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="300" y1="30" x2="300" y2="200" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      <text x="80" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        T1
      </text>
      <text x="300" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        T2
      </text>

      {/* T1 read 1 */}
      <rect x="50" y="45" width="60" height="16" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="80" y="57" textAnchor="middle" className="text-[9px] fill-current font-mono">
        SELECT
      </text>
      <text x="115" y="57" className="text-[9px] fill-current opacity-70">
        → 100
      </text>

      {/* T2 update + commit */}
      <rect x="270" y="80" width="60" height="16" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="300" y="92" textAnchor="middle" className="text-[9px] fill-current font-mono">
        UPDATE
      </text>
      <rect x="270" y="100" width="60" height="16" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="300" y="112" textAnchor="middle" className="text-[9px] fill-current font-mono">
        COMMIT
      </text>

      {/* T1 read 2 — different! */}
      <rect x="50" y="140" width="60" height="16" fill="color-mix(in oklch, var(--destructive) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="80" y="152" textAnchor="middle" className="text-[9px] fill-current font-mono">
        SELECT
      </text>
      <text x="115" y="152" className="text-[9px] fill-current opacity-70">
        → 200 (!)
      </text>

      <text x="190" y="185" textAnchor="middle" className="text-[10px] fill-current text-destructive font-semibold">
        samme spørring, ulikt svar
      </text>
      <text x="190" y="198" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        forhindres fra REPEATABLE READ
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Non-repeatable read — T1 leser samme rad to ganger og får ulike verdier.
    </figcaption>
  </figure>
);

// ============= ISOLATION — PHANTOM READ =============
export const SqlExecIsolationPhantom: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
      <line x1="80" y1="30" x2="80" y2="210" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="300" y1="30" x2="300" y2="210" stroke={STROKE} strokeWidth="0.5" strokeDasharray="2 2" />
      <text x="80" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        T1
      </text>
      <text x="300" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        T2
      </text>

      {/* T1: COUNT */}
      <rect x="30" y="45" width="100" height="16" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="80" y="57" textAnchor="middle" className="text-[9px] fill-current font-mono">
        COUNT(*) WHERE pris&gt;500
      </text>
      <text x="145" y="57" className="text-[9px] fill-current opacity-70">
        → 3
      </text>

      {/* T2: INSERT */}
      <rect x="260" y="90" width="80" height="16" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="300" y="102" textAnchor="middle" className="text-[9px] fill-current font-mono">
        INSERT pris=600
      </text>
      <rect x="270" y="110" width="60" height="16" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="300" y="122" textAnchor="middle" className="text-[9px] fill-current font-mono">
        COMMIT
      </text>

      {/* T1: COUNT again */}
      <rect x="30" y="150" width="100" height="16" fill="color-mix(in oklch, var(--destructive) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="80" y="162" textAnchor="middle" className="text-[9px] fill-current font-mono">
        COUNT(*) WHERE pris&gt;500
      </text>
      <text x="145" y="162" className="text-[9px] fill-current opacity-70">
        → 4 (👻)
      </text>

      <text x="190" y="195" textAnchor="middle" className="text-[10px] fill-current text-destructive font-semibold">
        ny rad har dukket opp i resultatsettet
      </text>
      <text x="190" y="207" textAnchor="middle" className="text-[9px] fill-current opacity-70">
        forhindres på SERIALIZABLE
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Phantom read — antall matchende rader endrer seg mellom to lesninger.
    </figcaption>
  </figure>
);

// ============= ISOLATION LEVELS — MATRISE =============
export const SqlExecIsolationLevels: FC = () => {
  type Cell = "✓" | "✗";
  const rows: { level: string; dirty: Cell; nonRep: Cell; phantom: Cell }[] = [
    { level: "READ UNCOMMITTED", dirty: "✓", nonRep: "✓", phantom: "✓" },
    { level: "READ COMMITTED", dirty: "✗", nonRep: "✓", phantom: "✓" },
    { level: "REPEATABLE READ", dirty: "✗", nonRep: "✗", phantom: "✓" },
    { level: "SERIALIZABLE", dirty: "✗", nonRep: "✗", phantom: "✗" },
  ];
  const mark = (c: Cell) =>
    c === "✓" ? (
      <span className="text-destructive font-bold">kan skje</span>
    ) : (
      <span className="text-success">forhindret</span>
    );
  return (
    <figure className="my-4">
      <table className="w-full max-w-md mx-auto border-collapse text-[10px]">
        <thead>
          <tr className="bg-muted/40">
            <th className="border border-border px-2 py-1 text-left font-mono">isolasjonsnivå</th>
            <th className="border border-border px-2 py-1 text-center">dirty</th>
            <th className="border border-border px-2 py-1 text-center">non-rep</th>
            <th className="border border-border px-2 py-1 text-center">phantom</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.level}>
              <td className="border border-border px-2 py-1 font-mono">{r.level}</td>
              <td className="border border-border px-2 py-1 text-center">{mark(r.dirty)}</td>
              <td className="border border-border px-2 py-1 text-center">{mark(r.nonRep)}</td>
              <td className="border border-border px-2 py-1 text-center">{mark(r.phantom)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Høyere isolasjon = færre anomalier, men mer låsing → lavere samtidighet.
      </figcaption>
    </figure>
  );
};

// ============= REGISTRY =============
export const SQL_EXEC_VISUALS: Record<string, FC> = {
  "sql-exec-eval-pipeline": SqlExecEvalPipeline,
  "sql-exec-where-vs-having": SqlExecWhereVsHaving,
  "sql-exec-select-star": SqlExecSelectStar,
  "sql-exec-null-tritri": SqlExecNullTriValued,
  "sql-exec-order-by": SqlExecOrderBy,
  "sql-exec-distinct": SqlExecDistinct,
  "sql-exec-like-wildcards": SqlExecLikeWildcards,
  "sql-exec-between": SqlExecBetween,
  "sql-exec-in": SqlExecIn,
  "sql-exec-group-by-anatomy": SqlExecGroupByAnatomy,
  "sql-exec-count-star": SqlExecCountStar,
  "sql-exec-nested-loop-join": SqlExecNestedLoopJoin,
  "sql-exec-hash-join": SqlExecHashJoin,
  "sql-exec-sort-merge-join": SqlExecSortMergeJoin,
  "sql-exec-cross-join": SqlExecCrossJoin,
  "sql-exec-right-join-swap": SqlExecRightJoinSwap,
  "sql-exec-subquery": SqlExecSubqueryCorrelation,
  "sql-exec-insert-before-after": SqlExecInsertBeforeAfter,
  "sql-exec-update-where-trap": SqlExecUpdateWhereTrap,
  "sql-exec-delete-where-trap": SqlExecDeleteWhereTrap,
  "sql-exec-view": SqlExecView,
  "sql-exec-transaction": SqlExecTransaction,
  "sql-exec-acid-consistency": SqlExecAcidConsistency,
  "sql-exec-acid-durability": SqlExecAcidDurability,
  "sql-exec-commit-vs-rollback": SqlExecCommitVsRollback,
  "sql-exec-datatypes-overview": SqlExecDataTypesOverview,
  "sql-exec-varchar-vs-text": SqlExecVarcharVsText,
  "sql-exec-date-types": SqlExecDateTypes,
  "sql-exec-decimal-vs-float": SqlExecDecimalVsFloat,
  "sql-exec-not-null-default": SqlExecNotNullDefault,
  "sql-exec-isolation-dirty": SqlExecIsolationDirty,
  "sql-exec-isolation-non-repeatable": SqlExecIsolationNonRepeatable,
  "sql-exec-isolation-phantom": SqlExecIsolationPhantom,
  "sql-exec-isolation-levels": SqlExecIsolationLevels,
};
