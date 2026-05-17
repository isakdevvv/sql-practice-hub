import { useEffect, useMemo, useState } from "react";
import {
  Play,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  ShieldX,
  AlertCircle,
  GripVertical,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Pakkeflyt-simulator
// ---------------------------------------------------------------------------
// Pedagogisk poeng: en brannmur er en serie if-setninger pa pakker. Reglene
// matches sekvensielt fra topp; forste match vinner. Hvis ingen regel matcher,
// gjelder default-policy (ACCEPT eller DROP).
//
// Brukeren ser pakken vandre nedover regellisten, regel-for-regel. Hver regel
// "tester" pakken — green pulse hvis match, grey ellers. Forste match
// avgjor utfallet (ALLOW / DROP / REJECT).
//
// Bryt-modus: brukeren kan dra regler opp/ned for a se hvordan rekkefolge
// endrer utfallet. Klassisk feilkonfigurasjon: ALLOW * over DENY 22 = port
// 22 apen for alle.
// ---------------------------------------------------------------------------

type Action = "ALLOW" | "DROP" | "REJECT";

type Direction = "in" | "out";

type Protocol = "TCP" | "UDP" | "ICMP";

type Packet = {
  id: string;
  label: string;
  protocol: Protocol;
  srcIp: string;
  dstIp: string;
  srcPort?: number;
  dstPort?: number;
  flags?: string; // "SYN", "SYN-ACK", "ACK", "ECHO"
  direction: Direction;
};

type Rule = {
  id: string;
  label: string;
  action: Action;
  protocol?: Protocol | "ANY";
  direction?: Direction | "ANY";
  srcIp?: string;
  dstIp?: string;
  srcPort?: number | "ANY";
  dstPort?: number | "ANY";
  flags?: string; // hvis satt, må matche
};

const SAMPLE_PACKETS: Packet[] = [
  {
    id: "tcp-syn-in",
    label: "TCP SYN inn (ekstern → web 80)",
    protocol: "TCP",
    srcIp: "203.0.113.7",
    dstIp: "10.0.0.5",
    srcPort: 51234,
    dstPort: 80,
    flags: "SYN",
    direction: "in",
  },
  {
    id: "tcp-synack-out",
    label: "TCP SYN-ACK ut (web 80 → ekstern)",
    protocol: "TCP",
    srcIp: "10.0.0.5",
    dstIp: "203.0.113.7",
    srcPort: 80,
    dstPort: 51234,
    flags: "SYN-ACK",
    direction: "out",
  },
  {
    id: "icmp-echo",
    label: "ICMP echo (ping inn)",
    protocol: "ICMP",
    srcIp: "203.0.113.42",
    dstIp: "10.0.0.5",
    flags: "ECHO",
    direction: "in",
  },
  {
    id: "udp-dns-reply",
    label: "UDP DNS-svar ut (53 → klient)",
    protocol: "UDP",
    srcIp: "10.0.0.5",
    dstIp: "203.0.113.99",
    srcPort: 53,
    dstPort: 44321,
    direction: "out",
  },
];

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    label: "ALLOW TCP inn → port 80 (web)",
    action: "ALLOW",
    protocol: "TCP",
    direction: "in",
    dstPort: 80,
  },
  {
    id: "r2",
    label: "ALLOW UDP ut fra port 53 (DNS-svar)",
    action: "ALLOW",
    protocol: "UDP",
    direction: "out",
    srcPort: 53,
  },
  {
    id: "r3",
    label: "ALLOW TCP ut → ANY (klient initierer)",
    action: "ALLOW",
    protocol: "TCP",
    direction: "out",
  },
  {
    id: "r4",
    label: "DROP ICMP inn (skjul oss for ping)",
    action: "DROP",
    protocol: "ICMP",
    direction: "in",
  },
  {
    id: "r5",
    label: "REJECT TCP inn → port 22 (SSH-skanning)",
    action: "REJECT",
    protocol: "TCP",
    direction: "in",
    dstPort: 22,
  },
];

function matchesRule(packet: Packet, rule: Rule): boolean {
  if (rule.protocol && rule.protocol !== "ANY" && rule.protocol !== packet.protocol) return false;
  if (rule.direction && rule.direction !== "ANY" && rule.direction !== packet.direction) return false;
  if (rule.dstPort !== undefined && rule.dstPort !== "ANY" && rule.dstPort !== packet.dstPort) return false;
  if (rule.srcPort !== undefined && rule.srcPort !== "ANY" && rule.srcPort !== packet.srcPort) return false;
  if (rule.flags && rule.flags !== packet.flags) return false;
  if (rule.srcIp && rule.srcIp !== packet.srcIp) return false;
  if (rule.dstIp && rule.dstIp !== packet.dstIp) return false;
  return true;
}

type Evaluation = {
  matchedIndex: number; // -1 hvis ingen match
  finalAction: Action;
  reason: string;
};

function evaluate(packet: Packet, rules: Rule[], defaultPolicy: Action): Evaluation {
  for (let i = 0; i < rules.length; i++) {
    if (matchesRule(packet, rules[i])) {
      return {
        matchedIndex: i,
        finalAction: rules[i].action,
        reason: `Regel ${i + 1} matchet — handling: ${rules[i].action}`,
      };
    }
  }
  return {
    matchedIndex: -1,
    finalAction: defaultPolicy,
    reason: `Ingen regel matchet — default-policy (${defaultPolicy}) gjelder`,
  };
}

export function PacketFlowSimulator() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [editMode, setEditMode] = useState(false);
  const [defaultPolicy, setDefaultPolicy] = useState<Action>("DROP");
  const [selectedPacketId, setSelectedPacketId] = useState<string>(SAMPLE_PACKETS[0].id);
  const [running, setRunning] = useState(false);
  const [currentRule, setCurrentRule] = useState(-1); // -1 = ikke startet, n = teste regel n, rules.length = ferdig
  const [verdict, setVerdict] = useState<Evaluation | null>(null);

  const packet = useMemo(
    () => SAMPLE_PACKETS.find((p) => p.id === selectedPacketId) ?? SAMPLE_PACKETS[0],
    [selectedPacketId]
  );

  useEffect(() => {
    if (!running) return;
    // Animer: 600ms per regel-test, og stopp pa forste match.
    if (currentRule >= rules.length) {
      setVerdict(evaluate(packet, rules, defaultPolicy));
      setRunning(false);
      return;
    }
    if (currentRule >= 0 && matchesRule(packet, rules[currentRule])) {
      // Match — vis et lite ekstra hold og avslutt
      const t = setTimeout(() => {
        setVerdict(evaluate(packet, rules, defaultPolicy));
        setRunning(false);
      }, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCurrentRule((c) => c + 1);
    }, 600);
    return () => clearTimeout(t);
  }, [running, currentRule, rules, packet, defaultPolicy]);

  function run() {
    setCurrentRule(0);
    setVerdict(null);
    setRunning(true);
  }

  function reset() {
    setRunning(false);
    setCurrentRule(-1);
    setVerdict(null);
  }

  function move(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= rules.length) return;
    const copy = rules.slice();
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setRules(copy);
    reset();
  }

  function restoreDefaults() {
    setRules(DEFAULT_RULES);
    setDefaultPolicy("DROP");
    reset();
  }

  // Beregn forhåndsutfall (uten animasjon) — vises som badge til høyre når vi
  // ikke kjører, slik at brukeren ser umiddelbart hva endringer gjør.
  const previewVerdict = useMemo(
    () => evaluate(packet, rules, defaultPolicy),
    [packet, rules, defaultPolicy]
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Pakke-gjennom-regler</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Velg en pakke, kjør evaluering, og se hvilken regel som matcher først.
            Endre rekkefølge for å se hvordan utfallet skifter.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør evaluering
          </button>
          <button
            type="button"
            onClick={() => setEditMode((e) => !e)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm ${
              editMode ? "border-amber-500/60 text-amber-500" : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <GripVertical className="h-3.5 w-3.5" />
            {editMode ? "Lås rekkefølge" : "Rediger regler"}
          </button>
          <button
            type="button"
            onClick={restoreDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Nullstill
          </button>
        </div>
      </div>

      {/* Pakke-velger */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          1. Velg pakke
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_PACKETS.map((p) => {
            const selected = p.id === selectedPacketId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPacketId(p.id);
                  reset();
                }}
                className={`text-left rounded-md border p-2 text-xs transition-colors ${
                  selected
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{p.label}</span>
                  {p.direction === "in" ? (
                    <ArrowDown className="h-3 w-3 text-amber-500 shrink-0" />
                  ) : (
                    <ArrowUp className="h-3 w-3 text-cyan-500 shrink-0" />
                  )}
                </div>
                <div className="mt-1 font-mono text-[10px] opacity-80">
                  {p.protocol} {p.srcIp}
                  {p.srcPort !== undefined ? `:${p.srcPort}` : ""} → {p.dstIp}
                  {p.dstPort !== undefined ? `:${p.dstPort}` : ""}
                  {p.flags ? ` [${p.flags}]` : ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Default-policy toggle */}
      <div className="flex items-center justify-between rounded-md border border-border bg-background/40 p-3">
        <div>
          <div className="text-xs font-semibold">Default-policy (siste-ord hvis ingen regel matcher)</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Klassisk sikker konfig: <code>DROP</code>. Klassisk feil: <code>ACCEPT</code> — da slipper alt
            ukjent gjennom.
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setDefaultPolicy((p) => (p === "DROP" ? "ALLOW" : "DROP"));
            reset();
          }}
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
            defaultPolicy === "DROP"
              ? "border-emerald-500/60 text-emerald-500"
              : "border-amber-500/60 text-amber-500"
          }`}
        >
          {defaultPolicy === "DROP" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          <span className="font-mono">{defaultPolicy}</span>
        </button>
      </div>

      {/* Pakke + regelkjede */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          2. Regelkjede (testes ovenfra og ned)
        </div>

        <div className="rounded-md border border-dashed border-border bg-background/40 p-2 mb-2 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Pakken:</span>
          <span className="font-mono">
            {packet.protocol} {packet.srcIp}
            {packet.srcPort !== undefined ? `:${packet.srcPort}` : ""} → {packet.dstIp}
            {packet.dstPort !== undefined ? `:${packet.dstPort}` : ""}
            {packet.flags ? ` [${packet.flags}]` : ""}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
            {packet.direction === "in" ? (
              <>
                <ArrowDown className="h-3 w-3 text-amber-500" /> inn
              </>
            ) : (
              <>
                <ArrowUp className="h-3 w-3 text-cyan-500" /> ut
              </>
            )}
          </span>
        </div>

        <ol className="space-y-1.5">
          {rules.map((rule, idx) => {
            const isTested = running && currentRule >= idx;
            const isActive = running && currentRule === idx;
            const isMatch = isTested && matchesRule(packet, rule);
            const isFinalMatch =
              !running && verdict !== null && verdict.matchedIndex === idx;
            const isSkipped =
              !running && verdict !== null && verdict.matchedIndex !== -1 && idx > verdict.matchedIndex;

            return (
              <li
                key={rule.id}
                className={`rounded-md border p-2 transition-colors ${
                  isActive && !isMatch
                    ? "border-yellow-500/60 bg-yellow-500/5"
                    : isFinalMatch || (isMatch && isActive)
                      ? rule.action === "ALLOW"
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : "border-red-500/60 bg-red-500/10"
                      : isSkipped
                        ? "border-border bg-muted/20 opacity-40"
                        : "border-border bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] font-mono inline-flex items-center justify-center w-5 h-5 rounded ${
                        rule.action === "ALLOW"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : rule.action === "DROP"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-orange-500/20 text-orange-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs truncate">{rule.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActive && !isMatch && (
                      <span className="text-[10px] text-yellow-500 animate-pulse">tester…</span>
                    )}
                    {isMatch && (
                      <span className="text-[10px] text-emerald-500 font-semibold">MATCH</span>
                    )}
                    {editMode && (
                      <>
                        <button
                          type="button"
                          onClick={() => move(idx, -1)}
                          disabled={idx === 0}
                          className="rounded border border-border px-1 text-[10px] disabled:opacity-30 hover:bg-muted"
                          title="Flytt opp"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(idx, 1)}
                          disabled={idx === rules.length - 1}
                          className="rounded border border-border px-1 text-[10px] disabled:opacity-30 hover:bg-muted"
                          title="Flytt ned"
                        >
                          ↓
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Default-policy som siste linje */}
        <div
          className={`mt-1.5 rounded-md border border-dashed p-2 text-xs flex items-center gap-2 ${
            verdict && verdict.matchedIndex === -1
              ? defaultPolicy === "ALLOW"
                ? "border-emerald-500/60 bg-emerald-500/10"
                : "border-red-500/60 bg-red-500/10"
              : "border-border bg-background/40 text-muted-foreground"
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider">default</span>
          <span className="font-mono">{defaultPolicy}</span>
          {verdict && verdict.matchedIndex === -1 && (
            <span className="ml-auto text-[10px] font-semibold">FALT GJENNOM</span>
          )}
        </div>
      </div>

      {/* Utfall */}
      <Verdict
        verdict={verdict ?? previewVerdict}
        live={verdict !== null}
        rules={rules}
        packet={packet}
      />
    </div>
  );
}

function Verdict({
  verdict,
  live,
  rules,
  packet,
}: {
  verdict: Evaluation;
  live: boolean;
  rules: Rule[];
  packet: Packet;
}) {
  const palette =
    verdict.finalAction === "ALLOW"
      ? { box: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-500" }
      : verdict.finalAction === "DROP"
        ? { box: "border-red-500/40 bg-red-500/5", text: "text-red-500" }
        : { box: "border-orange-500/40 bg-orange-500/5", text: "text-orange-500" };
  const Icon =
    verdict.finalAction === "ALLOW" ? ShieldCheck : verdict.finalAction === "DROP" ? ShieldX : AlertCircle;

  // Hvis pakken er en "klassisk svikt"-scenario (SSH-skanning, men SSH-regel
  // er flyttet under ALLOW-ALL), gi en hint.
  const insight = useMemo(() => {
    if (packet.dstPort === 22 && verdict.finalAction === "ALLOW") {
      return "Brannmuren slipper inn SSH-trafikk. Hvis dette ikke var hensikten, sjekk om en ALLOW-regel ligger over DENY-regelen for port 22.";
    }
    if (packet.protocol === "ICMP" && verdict.finalAction === "ALLOW") {
      return "ICMP slipper gjennom — pingbar. OK for intern debugging, men skjuler ikke nettverket utad.";
    }
    if (verdict.matchedIndex === -1) {
      return "Ingen eksplisitt regel — utfallet styres helt av default-policy. Endre policy for å se kontrasten.";
    }
    return null;
  }, [packet, verdict]);

  return (
    <div className={`rounded-md border ${palette.box} p-3`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${palette.text}`} />
        <span className={`text-sm font-semibold ${palette.text}`}>
          {live ? "Utfall: " : "Forhåndsutfall: "}
          {verdict.finalAction}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {verdict.matchedIndex === -1
            ? "default-policy"
            : `regel ${verdict.matchedIndex + 1}/${rules.length}`}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{verdict.reason}</div>
      {insight && <div className="mt-2 text-xs text-foreground">{insight}</div>}
      <div className="mt-2 text-[11px] text-muted-foreground border-t border-border/60 pt-2 space-y-0.5">
        <div>
          <span className="font-mono text-emerald-500">ALLOW</span> = slipp pakken gjennom (forward til
          mål).
        </div>
        <div>
          <span className="font-mono text-red-500">DROP</span> = slett stille. Avsender får timeout (best
          mot port-skann).
        </div>
        <div>
          <span className="font-mono text-orange-500">REJECT</span> = slett + send ICMP «Destination
          Unreachable». Høflig, men avslører at vi eksisterer.
        </div>
      </div>
    </div>
  );
}
