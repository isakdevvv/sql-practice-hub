import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Server, Laptop, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// HTTP Request Flow Animator — 6 forhåndsdefinerte scenarier
// ---------------------------------------------------------------------------
// Pedagogisk poeng: en statuskode er konsekvens av en kjede beslutninger på
// serversiden. Hvert scenario nedenfor animerer kjeden steg for steg og
// avslutter med riktig statuskode. Brukeren kan toggle parametre (auth-header,
// gyldig body, server-helse) og se hvordan resultatet endrer seg.
// ---------------------------------------------------------------------------

type ScenarioId = "get-cached" | "post-create" | "invalid-form" | "no-auth" | "rate-limited" | "server-crash";

type Param = {
  id: string;
  label: string;
  defaultOn: boolean;
};

type Step = {
  side: "client" | "server" | "wire";
  text: string;
  /** When set, this step is conditional on a param being ON (true) or OFF (false). */
  ifParam?: { id: string; value: boolean };
};

type ScenarioOutcome = {
  code: string;
  name: string;
  klasse: "2xx" | "3xx" | "4xx" | "5xx";
  why: string;
};

type Scenario = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  params: Param[];
  /** Steps when ALL params are at their default. */
  baseSteps: Step[];
  /** Function that derives the outcome from current param values. */
  outcome: (params: Record<string, boolean>) => ScenarioOutcome;
};

const SCENARIOS: Scenario[] = [
  {
    id: "get-cached",
    title: "GET en eksisterende side med cache",
    subtitle: "Klassisk lese-flyt. Cache-header kan vippe oss mellom 200 og 304.",
    params: [
      { id: "etagMatches", label: "Klientens If-None-Match matcher serverens ETag", defaultOn: true },
    ],
    baseSteps: [
      { side: "client", text: "Nettleseren har /artikkel/42 i cache med ETag \"v7\"" },
      { side: "wire", text: "GET /artikkel/42  If-None-Match: \"v7\"" },
      { side: "server", text: "Slår opp /artikkel/42 — finnes" },
      { side: "server", text: "Sammenligner ETag: \"v7\" vs lagret \"v7\"", ifParam: { id: "etagMatches", value: true } },
      { side: "server", text: "Sammenligner ETag: \"v7\" vs lagret \"v9\" — mismatch", ifParam: { id: "etagMatches", value: false } },
      { side: "server", text: "Innholdet er uendret → ingen body trenger sendes", ifParam: { id: "etagMatches", value: true } },
      { side: "server", text: "Innholdet er endret → send fersk versjon", ifParam: { id: "etagMatches", value: false } },
    ],
    outcome: (p) => p.etagMatches
      ? { code: "304", name: "Not Modified", klasse: "3xx", why: "ETag matchet, så vi sparer båndbredde. Klienten bruker cachet versjon." }
      : { code: "200", name: "OK", klasse: "2xx", why: "ETag stemte ikke — innholdet har endret seg. Send full body med ny ETag." },
  },
  {
    id: "post-create",
    title: "POST som oppretter en ny bruker",
    subtitle: "Lykkes som standard, men hver feilmodus åpner en ny statuskode.",
    params: [
      { id: "validBody", label: "JSON-body er gyldig og passerer validering", defaultOn: true },
      { id: "uniqueEmail", label: "E-postadressen er ledig (ingen kollisjon)", defaultOn: true },
    ],
    baseSteps: [
      { side: "client", text: "Bruker fyller ut registreringsskjema" },
      { side: "wire", text: "POST /users  Content-Type: application/json" },
      { side: "server", text: "Parser JSON-body — OK", ifParam: { id: "validBody", value: true } },
      { side: "server", text: "Parser JSON-body — feiler", ifParam: { id: "validBody", value: false } },
      { side: "server", text: "Sjekker om email finnes fra før", ifParam: { id: "validBody", value: true } },
      { side: "server", text: "Email er unik → INSERT users (...)", ifParam: { id: "uniqueEmail", value: true } },
      { side: "server", text: "Email finnes allerede → avbryt", ifParam: { id: "uniqueEmail", value: false } },
    ],
    outcome: (p) => {
      if (!p.validBody) return { code: "422", name: "Unprocessable Entity", klasse: "4xx", why: "JSON parser, men felt-validering feilet (passord for kort, manglende felt)." };
      if (!p.uniqueEmail) return { code: "409", name: "Conflict", klasse: "4xx", why: "Forretningslogikken sier kollisjon: e-post er allerede tatt." };
      return { code: "201", name: "Created", klasse: "2xx", why: "Ny bruker opprettet. Server svarer med Location: /users/42." };
    },
  },
  {
    id: "invalid-form",
    title: "POST med ødelagt JSON",
    subtitle: "Skiller skarpt mellom syntaktisk og semantisk ugyldighet.",
    params: [
      { id: "parsable", label: "Klienten klarte i det minste å lage gyldig JSON-syntaks", defaultOn: false },
    ],
    baseSteps: [
      { side: "client", text: "JS i nettleseren forsøker å sende et skjema" },
      { side: "wire", text: "POST /comments  body: {\"name\":, missing-value}" },
      { side: "server", text: "Forsøker JSON.parse → SyntaxError", ifParam: { id: "parsable", value: false } },
      { side: "server", text: "Forsøker JSON.parse → OK, validerer felter", ifParam: { id: "parsable", value: true } },
    ],
    outcome: (p) => p.parsable
      ? { code: "422", name: "Unprocessable Entity", klasse: "4xx", why: "Parse OK, men felter passerer ikke validering (manglende, ugyldig, …)." }
      : { code: "400", name: "Bad Request", klasse: "4xx", why: "Bodyen kunne ikke i det hele tatt parses. Søppel på inngangsporten." },
  },
  {
    id: "no-auth",
    title: "GET en beskyttet ressurs uten tokens",
    subtitle: "401 vs 403 er det mest forvirrende skillet i hele HTTP.",
    params: [
      { id: "hasToken", label: "Klienten sender en gyldig Authorization-header", defaultOn: false },
      { id: "hasPermission", label: "Brukeren har rettighet til denne ressursen", defaultOn: false },
    ],
    baseSteps: [
      { side: "client", text: "Bruker prøver å åpne /admin/logs" },
      { side: "wire", text: "GET /admin/logs  (mangler Authorization)" },
      { side: "server", text: "Sjekker Authorization-header — fraværende", ifParam: { id: "hasToken", value: false } },
      { side: "server", text: "Sjekker Authorization-header — gyldig token", ifParam: { id: "hasToken", value: true } },
      { side: "server", text: "Slår opp brukerens rettigheter", ifParam: { id: "hasToken", value: true } },
      { side: "server", text: "Bruker har admin-rolle → tilgang", ifParam: { id: "hasPermission", value: true } },
      { side: "server", text: "Bruker mangler admin-rolle → nekt", ifParam: { id: "hasPermission", value: false } },
    ],
    outcome: (p) => {
      if (!p.hasToken) return { code: "401", name: "Unauthorized", klasse: "4xx", why: "Vi vet ikke hvem du er. Send WWW-Authenticate: Bearer." };
      if (!p.hasPermission) return { code: "403", name: "Forbidden", klasse: "4xx", why: "Vi vet hvem du er, men du får ikke. Ingen WWW-Authenticate — ny innlogging hjelper ikke." };
      return { code: "200", name: "OK", klasse: "2xx", why: "Autentisert + autorisert. Returner ressursen." };
    },
  },
  {
    id: "rate-limited",
    title: "Skript som hamrer på et API",
    subtitle: "Rate-limiteren slår inn — Retry-After forteller når man kan komme tilbake.",
    params: [
      { id: "withinQuota", label: "Klientens forrige request var innenfor kvoten", defaultOn: false },
    ],
    baseSteps: [
      { side: "client", text: "Skript fyrer av 100 requests/sek mot /search" },
      { side: "wire", text: "GET /search?q=test  (request nr. 1001 i dette vinduet)" },
      { side: "server", text: "Token-bucket sjekker: kvote = 1000/min", ifParam: { id: "withinQuota", value: false } },
      { side: "server", text: "Token-bucket sjekker: 1 token igjen — godta", ifParam: { id: "withinQuota", value: true } },
      { side: "server", text: "Over kvoten → bremses", ifParam: { id: "withinQuota", value: false } },
    ],
    outcome: (p) => p.withinQuota
      ? { code: "200", name: "OK", klasse: "2xx", why: "Innenfor kvoten — klienten har ennå tokens igjen." }
      : { code: "429", name: "Too Many Requests", klasse: "4xx", why: "Over kvoten. Send Retry-After: 60 så vet klienten hvor lenge den må vente." },
  },
  {
    id: "server-crash",
    title: "Server kaster en uventet exception",
    subtitle: "Klassisk 500 — versus 502/504 når feilen er på et annet lag.",
    params: [
      { id: "originReachable", label: "Origin-serveren svarer på alle (proxy ser den)", defaultOn: false },
      { id: "originHealthy", label: "Origin-serveren har faktisk lovlig respons", defaultOn: false },
    ],
    baseSteps: [
      { side: "client", text: "Vanlig sluttbruker laster startsiden" },
      { side: "wire", text: "GET /  Host: example.com" },
      { side: "server", text: "Reverse proxy (nginx) prøver å nå origin" },
      { side: "server", text: "Origin svarer ikke i det hele tatt — timeout", ifParam: { id: "originReachable", value: false } },
      { side: "server", text: "Origin svarer, men returnerer søppel-bytes", ifParam: { id: "originHealthy", value: false } },
      { side: "server", text: "Origin returnerer 500 fra Python-koden (uncaught exception)", ifParam: { id: "originHealthy", value: true } },
    ],
    outcome: (p) => {
      if (!p.originReachable) return { code: "504", name: "Gateway Timeout", klasse: "5xx", why: "Proxy ventet på origin, men tida rant ut. Origin lever kanskje, men er for treg." };
      if (!p.originHealthy) return { code: "502", name: "Bad Gateway", klasse: "5xx", why: "Origin svarte, men med ugyldig respons. Proxyen kunne ikke videresende noe meningsfullt." };
      return { code: "500", name: "Internal Server Error", klasse: "5xx", why: "Origin krasjet selv (stack trace). Logg, alert, fiks bug." };
    },
  },
];

const CLASS_COLOR: Record<"2xx" | "3xx" | "4xx" | "5xx", string> = {
  "2xx": "text-emerald-500 border-emerald-500/40 bg-emerald-500/10",
  "3xx": "text-sky-500 border-sky-500/40 bg-sky-500/10",
  "4xx": "text-amber-500 border-amber-500/40 bg-amber-500/10",
  "5xx": "text-red-500 border-red-500/40 bg-red-500/10",
};

export function RequestFlowAnimator() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("post-create");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const [params, setParams] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(scenario.params.map((p) => [p.id, p.defaultOn]))
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter the steps to those that match current params.
  const activeSteps = useMemo(() => {
    return scenario.baseSteps.filter((s) => {
      if (!s.ifParam) return true;
      return params[s.ifParam.id] === s.ifParam.value;
    });
  }, [scenario, params]);

  // Reset when scenario or params change
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [scenarioId, params]);

  // Reset params when scenario changes
  useEffect(() => {
    setParams(Object.fromEntries(scenario.params.map((p) => [p.id, p.defaultOn])));
  }, [scenarioId, scenario]);

  // Animation loop
  useEffect(() => {
    if (!playing) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= activeSteps.length) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [playing, activeSteps.length]);

  const outcome = scenario.outcome(params);
  const done = step >= activeSteps.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Request Flow Animator</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Velg et scenario, juster parametre og spill av request-flyten. Statuskoden faller ut av kjeden av beslutninger.
          </p>
        </div>
      </div>

      {/* Scenario picker */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenarioId(s.id)}
            className={`text-left text-xs px-2.5 py-2 rounded border transition-colors ${
              s.id === scenarioId
                ? "border-brand bg-brand/5"
                : "border-border hover:bg-muted"
            }`}
          >
            <div className="font-medium">{s.title}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{s.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Params */}
      {scenario.params.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Parametre</div>
          {scenario.params.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={params[p.id] ?? false}
                onChange={(e) => setParams((cur) => ({ ...cur, [p.id]: e.target.checked }))}
                className="rounded"
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Stage */}
      <div className="rounded-md border border-border bg-background p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
          <div className="rounded-md border border-sky-500/30 bg-sky-500/5 p-2 flex items-center gap-2">
            <Laptop className="h-4 w-4 text-sky-500" />
            <div className="text-xs font-semibold">Klient</div>
          </div>
          <div className="text-muted-foreground"><ArrowRight className="h-3 w-3" /></div>
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 flex items-center gap-2 justify-end">
            <div className="text-xs font-semibold">Server</div>
            <Server className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        <div className="space-y-1.5">
          {activeSteps.map((s, i) => {
            const active = i < step;
            const sideClass =
              s.side === "client"
                ? "border-sky-500/30 bg-sky-500/5 mr-auto"
                : s.side === "server"
                ? "border-amber-500/30 bg-amber-500/5 ml-auto text-right"
                : "border-border bg-muted/40 mx-auto";
            return (
              <div
                key={i}
                className={`rounded border px-3 py-1.5 text-xs max-w-[88%] transition-opacity duration-300 ${sideClass} ${
                  active ? "opacity-100" : "opacity-25"
                }`}
              >
                {s.side === "wire" && (
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground mr-1">on the wire</span>
                )}
                <span className={s.side === "wire" ? "font-mono" : ""}>{s.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (step >= activeSteps.length) setStep(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand text-brand-foreground text-xs font-medium hover:opacity-90"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? "Pause" : done ? "Spill av igjen" : "Spill av"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setPlaying(false);
            }}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded border border-border text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <div className="text-[11px] text-muted-foreground ml-1">
            Steg {Math.min(step, activeSteps.length)} / {activeSteps.length}
          </div>
        </div>
      </div>

      {/* Outcome */}
      <div
        className={`rounded-lg border-2 p-4 transition-opacity ${
          done ? "opacity-100" : "opacity-40"
        } ${CLASS_COLOR[outcome.klasse]}`}
      >
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1">Resultat</div>
        <div className="flex items-baseline gap-3">
          <div className="text-3xl font-bold font-mono">{outcome.code}</div>
          <div className="text-lg font-semibold">{outcome.name}</div>
          <span className="text-[10px] uppercase tracking-wider opacity-80">
            {outcome.klasse}
          </span>
        </div>
        <p className="text-xs mt-2 opacity-90">{outcome.why}</p>
      </div>
    </div>
  );
}
