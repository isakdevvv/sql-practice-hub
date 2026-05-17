import { useEffect, useMemo, useState } from "react";
import {
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Activity,
  Clock,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Stateful connection-tracking-tabell
// ---------------------------------------------------------------------------
// Pedagogisk poeng (Kurose 8.9.3):
//   - Stateless brannmur ser hver pakke isolert. En pakke med ACK=1 fra
//     internet ser "ut som" del av eksisterende forbindelse — og slipper inn
//     selv om handshake aldri skjedde. Dette er en kjent svakhet.
//   - Stateful brannmur ledger conntrack-tabell. NY pakke ma matche regel.
//     ESTABLISHED-pakker matches mot tabellen og slippes raskt gjennom uten
//     re-evaluering av hele regellisten.
//   - Bryt-modus: send en forfalsket "ACK fra internet" pakke. Stateless
//     slipper den inn. Stateful sier "ingen entry i tabellen" og avviser.
// ---------------------------------------------------------------------------

type State = "NEW" | "ESTABLISHED" | "CLOSED";
type Mode = "stateful" | "stateless";
type Verdict = "allowed" | "denied" | "fast-allow";

type ConnEntry = {
  id: string;
  intIp: string;
  intPort: number;
  extIp: string;
  extPort: number;
  proto: "TCP" | "UDP";
  state: State;
  ttl: number; // sekunder igjen (vises som "TTL")
  ttlMax: number;
};

type LogLine = {
  step: number;
  desc: string;
  state: State | "—";
  verdict: Verdict;
  reason: string;
};

type Scenario = {
  id: "handshake" | "fake-ack" | "udp-dns" | "long-tcp";
  label: string;
  blurb: string;
  steps: Array<{ desc: string; ev: "syn" | "synack" | "ack" | "fin" | "fake-ack" | "udp" }>;
};

const SCENARIOS: Scenario[] = [
  {
    id: "handshake",
    label: "Legitim TCP-handshake",
    blurb:
      "Intern klient åpner TCP til ekstern web. Tre pakker (SYN → SYN-ACK → ACK) bygger ESTABLISHED-state.",
    steps: [
      { desc: "Klient → ekstern: SYN (NY)", ev: "syn" },
      { desc: "Ekstern → klient: SYN-ACK (svar)", ev: "synack" },
      { desc: "Klient → ekstern: ACK (handshake ferdig)", ev: "ack" },
      { desc: "Data flyter — ESTABLISHED i 5 dager", ev: "ack" },
    ],
  },
  {
    id: "fake-ack",
    label: "Bryt-modus: forfalsket ACK fra internet",
    blurb:
      "Angriper sender en pakke med ACK=1 og dst=intern. Pakken «ser ut som» del av en pågående forbindelse. Stateless slipper inn. Stateful slår opp i conntrack — finner ingenting — avviser.",
    steps: [
      { desc: "Angriper → intern host: ACK (uten forutgående SYN)", ev: "fake-ack" },
    ],
  },
  {
    id: "udp-dns",
    label: "UDP DNS-oppslag",
    blurb:
      "UDP er stateless — det finnes ingen handshake. Stateful FW lager pseudo-state ved første pakke ut, og slipper svaret inn hvis det kommer innen 30 s.",
    steps: [
      { desc: "Klient → 8.8.8.8:53 DNS-spørring (NY)", ev: "udp" },
      { desc: "8.8.8.8:53 → klient: svar (ESTABLISHED-match, TTL 30 s)", ev: "udp" },
    ],
  },
  {
    id: "long-tcp",
    label: "Lang TCP-forbindelse (FIN-avslutning)",
    blurb: "ESTABLISHED → klient sender FIN → connection går til CLOSED og fjernes fra tabellen.",
    steps: [
      { desc: "Klient → server: SYN", ev: "syn" },
      { desc: "Server → klient: SYN-ACK", ev: "synack" },
      { desc: "Klient → server: ACK (ESTABLISHED)", ev: "ack" },
      { desc: "Klient → server: FIN (CLOSED)", ev: "fin" },
    ],
  },
];

export function StatefulConnectionTable() {
  const [mode, setMode] = useState<Mode>("stateful");
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("handshake");
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [table, setTable] = useState<ConnEntry[]>([]);
  const [log, setLog] = useState<LogLine[]>([]);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId]
  );

  function reset() {
    setStepIdx(-1);
    setRunning(false);
    setTable([]);
    setLog([]);
  }

  useEffect(() => {
    if (!running) return;
    if (stepIdx >= scenario.steps.length) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => {
      const step = scenario.steps[stepIdx];
      applyEvent(step.ev, step.desc);
      setStepIdx((s) => s + 1);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, stepIdx, scenario]);

  function applyEvent(
    ev: "syn" | "synack" | "ack" | "fin" | "fake-ack" | "udp",
    desc: string
  ) {
    setTable((cur) => {
      const next = cur.slice();
      let state: State | "—" = "—";
      let verdict: Verdict = "allowed";
      let reason = "";

      const intKey = "10.0.0.5";
      const extKey = "203.0.113.20";

      if (ev === "syn") {
        const entry: ConnEntry = {
          id: "c1",
          intIp: intKey,
          intPort: 49152,
          extIp: extKey,
          extPort: 80,
          proto: "TCP",
          state: "NEW",
          ttl: 60,
          ttlMax: 60,
        };
        const existing = next.find((e) => e.id === "c1");
        if (!existing) next.push(entry);
        state = "NEW";
        verdict = mode === "stateful" ? "allowed" : "allowed";
        reason =
          mode === "stateful"
            ? "Conntrack opprettet: state=NEW, venter pa SYN-ACK fra ekstern."
            : "Stateless: pakken matcher 'ALLOW TCP ut' — slipper gjennom uten state.";
      }
      if (ev === "synack") {
        const e = next.find((c) => c.id === "c1");
        if (e) e.state = "NEW";
        state = "NEW";
        verdict = mode === "stateful" ? "fast-allow" : "allowed";
        reason =
          mode === "stateful"
            ? "Stateful: matchet conntrack — slippes inn uten regel-evaluering."
            : "Stateless: ACK-pakke fra internet matcher 'ALLOW ACK=1' (typisk regel) — slippes inn.";
      }
      if (ev === "ack") {
        const e = next.find((c) => c.id === "c1");
        if (e) {
          e.state = "ESTABLISHED";
          e.ttl = 5 * 24 * 3600;
          e.ttlMax = 5 * 24 * 3600;
        }
        state = "ESTABLISHED";
        verdict = "fast-allow";
        reason =
          mode === "stateful"
            ? "Handshake komplett. State=ESTABLISHED, TTL=5 dager. Resten av sesjonen matches mot tabellen — lynrask."
            : "Stateless: hver eneste pakke evalueres mot regellisten pa nytt. Ingen 'rask vei'.";
      }
      if (ev === "fin") {
        const e = next.find((c) => c.id === "c1");
        if (e) {
          e.state = "CLOSED";
          e.ttl = 30;
        }
        state = "CLOSED";
        verdict = "fast-allow";
        reason = "FIN mottatt. State=CLOSED — entry fjernes etter 30 s grace.";
      }
      if (ev === "fake-ack") {
        // Forfalsket ACK fra internet uten foregaende SYN
        if (mode === "stateful") {
          state = "—";
          verdict = "denied";
          reason =
            "Stateful: pakken bærer ACK=1, men ingen entry i conntrack for denne 4-tuppelen. Det matcher INGEN etablert forbindelse → DROP.";
        } else {
          state = "—";
          verdict = "allowed";
          reason =
            "Stateless: pakken har ACK=1 og matcher regelen 'ALLOW TCP inn med ACK=1 (antatt retur)'. Slippes inn — angriperen lurer brannmuren.";
        }
      }
      if (ev === "udp") {
        const existing = next.find((c) => c.id === "c2");
        if (!existing) {
          next.push({
            id: "c2",
            intIp: intKey,
            intPort: 51010,
            extIp: "8.8.8.8",
            extPort: 53,
            proto: "UDP",
            state: "ESTABLISHED",
            ttl: 30,
            ttlMax: 30,
          });
        }
        state = "ESTABLISHED";
        verdict = mode === "stateful" ? "fast-allow" : "allowed";
        reason =
          mode === "stateful"
            ? "Pseudo-state for UDP. TTL=30 s — svaret må komme raskt."
            : "Stateless: matcher 'ALLOW UDP 53 inn' (rå regel).";
      }

      setLog((l) => [
        ...l,
        { step: l.length + 1, desc, state, verdict, reason },
      ]);

      return next;
    });
  }

  function run() {
    reset();
    setRunning(true);
    setStepIdx(0);
  }

  // Reset når mode eller scenario endres
  useEffect(() => {
    reset();
  }, [mode, scenarioId]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand" />
            Connection tracking — state-overganger
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Stateless eller stateful? Bytt modus og se hvordan brannmuren tolker pakkene.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode((m) => (m === "stateful" ? "stateless" : "stateful"))}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${
              mode === "stateful"
                ? "border-emerald-500/60 text-emerald-500"
                : "border-amber-500/60 text-amber-500"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Modus: {mode === "stateful" ? "STATEFUL" : "STATELESS"}
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør scenario
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nullstill
          </button>
        </div>
      </div>

      {/* Scenario-velger */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Scenario
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCENARIOS.map((s) => {
            const selected = s.id === scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                className={`text-left rounded-md border p-2 text-xs ${
                  selected
                    ? "border-brand bg-brand/10"
                    : "border-border bg-background/40 hover:bg-muted/40"
                }`}
              >
                <div className="font-medium text-foreground">
                  {s.id === "fake-ack" && (
                    <AlertTriangle className="inline h-3 w-3 mr-1 text-amber-500" />
                  )}
                  {s.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.blurb}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conntrack-tabell */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <span>Conntrack-tabell {mode === "stateless" && <em className="text-amber-500">(brannmuren bruker den ikke i stateless-modus)</em>}</span>
        </div>
        <div className="rounded-md border border-border bg-background/40 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-1.5 px-2">Intern</th>
                <th className="py-1.5 px-2">Ekstern</th>
                <th className="py-1.5 px-2">Proto</th>
                <th className="py-1.5 px-2">State</th>
                <th className="py-1.5 px-2">TTL</th>
              </tr>
            </thead>
            <tbody>
              {table.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-3 px-2 text-center text-muted-foreground italic">
                    Tom — ingen aktive forbindelser
                  </td>
                </tr>
              )}
              {table.map((e) => (
                <tr key={e.id} className="border-b border-border/40 last:border-0 font-mono">
                  <td className="py-1.5 px-2">{e.intIp}:{e.intPort}</td>
                  <td className="py-1.5 px-2">{e.extIp}:{e.extPort}</td>
                  <td className="py-1.5 px-2">{e.proto}</td>
                  <td className="py-1.5 px-2">
                    <StateBadge state={e.state} />
                  </td>
                  <td className="py-1.5 px-2 text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTtl(e.ttl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          TCP default-TTL: <span className="font-mono">5 dager</span> (ESTABLISHED). UDP:
          <span className="font-mono"> 30 s</span>. ICMP echo: <span className="font-mono">30 s</span>.
          Tomgang lengre enn TTL ⇒ entry felles, og neste pakke må gjennom regel-evaluering på nytt.
        </div>
      </div>

      {/* Hendelses-logg */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Hendelseslogg
        </div>
        <div className="space-y-1.5">
          {log.length === 0 && (
            <div className="rounded-md border border-dashed border-border bg-background/40 p-3 text-xs text-muted-foreground italic">
              Trykk «Kjør scenario» for å se brannmuren reagere på hver pakke.
            </div>
          )}
          {log.map((l) => {
            const VerdictIcon =
              l.verdict === "denied" ? ShieldX : l.verdict === "fast-allow" ? Zap : ShieldCheck;
            const palette =
              l.verdict === "denied"
                ? { box: "border-red-500/40 bg-red-500/5", text: "text-red-500" }
                : l.verdict === "fast-allow"
                  ? { box: "border-cyan-500/40 bg-cyan-500/5", text: "text-cyan-500" }
                  : { box: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-500" };
            return (
              <div
                key={l.step}
                className={`rounded-md border ${palette.box} p-2`}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground">
                    {l.step}. {l.desc}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${palette.text} text-[11px] font-semibold uppercase`}>
                    <VerdictIcon className="h-3 w-3" />
                    {l.verdict === "denied" ? "AVVIST" : l.verdict === "fast-allow" ? "RASK-AKSEPT" : "ALLOW"}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{l.reason}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StateBadge({ state }: { state: State }) {
  const colors: Record<State, string> = {
    NEW: "bg-amber-500/20 text-amber-500",
    ESTABLISHED: "bg-emerald-500/20 text-emerald-500",
    CLOSED: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-mono ${colors[state]}`}>
      {state}
    </span>
  );
}

function formatTtl(seconds: number): string {
  if (seconds >= 86400) return `${(seconds / 86400).toFixed(0)} d`;
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(0)} h`;
  if (seconds >= 60) return `${(seconds / 60).toFixed(0)} min`;
  return `${seconds} s`;
}
