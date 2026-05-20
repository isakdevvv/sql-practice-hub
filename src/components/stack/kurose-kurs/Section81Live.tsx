import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Shield,
  ShieldOff,
  Lock,
  Key,
  Hash,
  PenLine,
  Activity,
} from "lucide-react";

// Levende versjon av seksjon 8.1: Alice, Bob og Eve. Vi viser hva ulike
// sikkerhetsegenskaper beskytter mot ved å la deg toggle "Uten sikkerhet"
// vs "Med sikkerhet", og step-vise alle fire angrep:
//   Confidentiality  → Eve leser
//   Integrity        → Eve endrer
//   Authenticity     → Eve utgir seg for Alice
//   Availability     → Eve flooder Bob (DDoS)

// ----------------------------------------------------------------------
// Topologi
// ----------------------------------------------------------------------

type NodeId = "alice" | "bob" | "eve" | "router1" | "router2";

type Node = {
  id: NodeId;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "alice" | "bob" | "eve" | "router";
};

const NODES: Node[] = [
  { id: "alice", label: "Alice", sublabel: "avsender", x: 70, y: 180, kind: "alice" },
  { id: "router1", label: "R1", x: 220, y: 180, kind: "router" },
  { id: "router2", label: "R2", x: 460, y: 180, kind: "router" },
  { id: "bob", label: "Bob", sublabel: "mottaker", x: 610, y: 180, kind: "bob" },
  { id: "eve", label: "Eve", sublabel: "angriper", x: 340, y: 70, kind: "eve" },
];

// Lenker som vises. Eve sitter mellom R1 og R2 og kan lytte/endre/injisere.
const EDGES: [NodeId, NodeId][] = [
  ["alice", "router1"],
  ["router1", "router2"],
  ["router2", "bob"],
  ["router1", "eve"], // Eve tapper inn
  ["router2", "eve"],
];

// ----------------------------------------------------------------------
// Sikkerhetsegenskaper
// ----------------------------------------------------------------------

type Goal =
  | "confidentiality"
  | "integrity"
  | "authenticity"
  | "non-repudiation"
  | "availability";

const GOAL_META: Record<Goal, { label: string; short: string; defense: string; icon: typeof Lock }> = {
  confidentiality: {
    label: "Konfidensialitet",
    short: "Bare Bob skal kunne lese",
    defense: "Kryptering (AES, ChaCha20)",
    icon: Lock,
  },
  integrity: {
    label: "Integritet",
    short: "Ingen bit endret uoppdaget",
    defense: "MAC / hash (HMAC, GMAC)",
    icon: Hash,
  },
  authenticity: {
    label: "Autentisitet",
    short: "Avsender er den hun utgir seg for",
    defense: "Digital signatur / sertifikat",
    icon: PenLine,
  },
  "non-repudiation": {
    label: "Ikke-avvisning",
    short: "Alice kan ikke senere nekte",
    defense: "Digital signatur (asymmetrisk)",
    icon: Key,
  },
  availability: {
    label: "Tilgjengelighet",
    short: "Tjenesten lever når den trengs",
    defense: "Rate-limit, scrubbing, anycast",
    icon: Activity,
  },
};

// ----------------------------------------------------------------------
// Steg-skript
// ----------------------------------------------------------------------

type PacketColor =
  | "plain"
  | "cipher"
  | "tampered"
  | "fake"
  | "flood"
  | "mac"
  | "signed";

type Step = {
  scenario: Goal;
  title: string;
  withoutText: string;
  withText: string;
  /** Path packet animates along (node-IDer). */
  path: NodeId[];
  /** Color when running without security. */
  withoutColor: PacketColor;
  /** Color when running with security. */
  withColor: PacketColor;
  /** Optional: Eve's reaction marker — vises som tekst-bobble nær Eve. */
  eveBubbleWithout?: string;
  eveBubbleWith?: string;
};

const STEPS: Step[] = [
  // ─── Confidentiality ───
  {
    scenario: "confidentiality",
    title: "1. Konfidensialitet — Alice sender melding til Bob",
    withoutText:
      "Alice sender en melding i klartekst: «Møt meg kl. 19, jeg har med pengene». Pakken passerer Eve på veien.",
    withText:
      "Alice krypterer meldingen med Bobs offentlige nøkkel (eller en delt symmetrisk nøkkel). Pakken som forlater Alice er allerede chiffer-tekst.",
    path: ["alice", "router1", "router2", "bob"],
    withoutColor: "plain",
    withColor: "cipher",
  },
  {
    scenario: "confidentiality",
    title: "2. Eve tapper linja mellom R1 og R2",
    withoutText:
      "Eve speiler trafikken på en switch eller sitter på et åpent WiFi. Hun ser hele meldingen i klartekst. Konfidensialitet brutt.",
    withText:
      "Eve ser pakken, men det er bare chiffer-tekst — bytes uten mening. Uten Bobs private nøkkel kan hun ikke dekryptere. Konfidensialitet bevart.",
    path: ["router1", "eve"],
    withoutColor: "plain",
    withColor: "cipher",
    eveBubbleWithout: "Eve leser klartekst",
    eveBubbleWith: "Eve ser bare base64-støy",
  },

  // ─── Integrity ───
  {
    scenario: "integrity",
    title: "3. Integritet — Eve forsøker å endre beløpet",
    withoutText:
      "Alice sender «Overfør 100 kr til Bob». Pakken er ren tekst (eller bare kryptert med CTR — som ikke beskytter integritet). Eve fanger den.",
    withText:
      "Alice beregner HMAC(nøkkel, melding) og hekter på som tag. Beløp + tag sendes sammen.",
    path: ["alice", "router1"],
    withoutColor: "plain",
    withColor: "mac",
  },
  {
    scenario: "integrity",
    title: "4. Eve flipper bit: 100 → 900",
    withoutText:
      "Eve endrer beløpet til «900 kr» og sender pakken videre. Bob har ingen måte å vite at det er endret. Integritet brutt.",
    withText:
      "Eve endrer beløpet, men kan ikke beregne ny HMAC uten den hemmelige nøkkelen. Hun sender enten ugyldig tag eller gammel tag.",
    path: ["eve", "router2", "bob"],
    withoutColor: "tampered",
    withColor: "tampered",
    eveBubbleWithout: "Eve injiserer «900»",
    eveBubbleWith: "Eve har ingen MAC-nøkkel",
  },
  {
    scenario: "integrity",
    title: "5. Bob verifiserer",
    withoutText:
      "Bob aksepterer «900 kr» — han har ingen måte å oppdage manipulasjonen. Pengene er borte.",
    withText:
      "Bob beregner HMAC selv og sammenligner. Tag passer ikke → pakken forkastes. Integritet bevart.",
    path: ["router2", "bob"],
    withoutColor: "tampered",
    withColor: "mac",
  },

  // ─── Authenticity ───
  {
    scenario: "authenticity",
    title: "6. Autentisitet — Eve utgir seg for Alice",
    withoutText:
      "Eve åpner en TCP-forbindelse mot Bob og setter avsender-IP til Alices adresse (IP-spoofing). Pakken «kommer fra Alice».",
    withText:
      "Alice har på forhånd et X.509-sertifikat med sin offentlige nøkkel. Når hun sender, signerer hun meldingen med sin private nøkkel.",
    path: ["eve", "router2", "bob"],
    withoutColor: "fake",
    withColor: "signed",
    eveBubbleWithout: "«Hei, det er Alice»",
    eveBubbleWith: "Eve mangler Alices privatnøkkel",
  },
  {
    scenario: "authenticity",
    title: "7. Bob aksepterer eller avviser",
    withoutText:
      "Bob har ingen måte å verifisere. Han tror han snakker med Alice — autentisitet brutt. Han kan bli lurt til å sende sensitiv info tilbake.",
    withText:
      "Bob verifiserer signaturen mot Alices offentlige nøkkel (fra sertifikat signert av CA han stoler på). Signaturen passer ikke → forbindelsen avvises.",
    path: ["router2", "bob"],
    withoutColor: "fake",
    withColor: "signed",
  },

  // ─── Availability ───
  {
    scenario: "availability",
    title: "8. Tilgjengelighet — Eve starter en flood",
    withoutText:
      "Eve har et botnett på 100 000 maskiner. Alle sender SYN-pakker mot Bob samtidig — klassisk SYN-flood / volumetric DDoS.",
    withText:
      "Bob sitter bak en scrubbing-tjeneste (Cloudflare, AWS Shield) med massiv anycast-kapasitet og rate-limit per IP.",
    path: ["eve", "router2", "bob"],
    withoutColor: "flood",
    withColor: "flood",
    eveBubbleWithout: "1M pakker/sek",
    eveBubbleWith: "Botnet-trafikken absorberes",
  },
  {
    scenario: "availability",
    title: "9. Alice forsøker å nå Bob",
    withoutText:
      "Bob er overlesset. Hans legitime ressurser (CPU, båndbredde, halvåpne TCP-sockets) er brukt opp. Alices ekte forespørsel timer ut. Tilgjengelighet brutt.",
    withText:
      "Scrubberen filtrerer bort flood-pakker basert på rate, geo og signaturer. Bob ser bare den ekte trafikken og svarer Alice normalt.",
    path: ["alice", "router1", "router2", "bob"],
    withoutColor: "plain",
    withColor: "plain",
  },
];

// ----------------------------------------------------------------------
// Farger
// ----------------------------------------------------------------------

const PKT_FILL: Record<PacketColor, string> = {
  plain: "fill-amber-500",
  cipher: "fill-cyan-500",
  tampered: "fill-red-500",
  fake: "fill-fuchsia-500",
  flood: "fill-red-600",
  mac: "fill-emerald-500",
  signed: "fill-violet-500",
};
const PKT_BG: Record<PacketColor, string> = {
  plain: "bg-amber-500",
  cipher: "bg-cyan-500",
  tampered: "bg-red-500",
  fake: "bg-fuchsia-500",
  flood: "bg-red-600",
  mac: "bg-emerald-500",
  signed: "bg-violet-500",
};
const PKT_LABEL: Record<PacketColor, string> = {
  plain: "TXT",
  cipher: "ENC",
  tampered: "✗",
  fake: "FAKE",
  flood: "DoS",
  mac: "MAC",
  signed: "SIG",
};

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section81Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pktProgress, setPktProgress] = useState(0);
  const [secured, setSecured] = useState(false);

  const step = STEPS[stepIdx];
  const color = secured ? step.withColor : step.withoutColor;
  const description = secured ? step.withText : step.withoutText;
  const eveBubble = secured ? step.eveBubbleWith : step.eveBubbleWithout;

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2500;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setPktProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= STEPS.length) {
              setPlaying(false);
              return i;
            }
            return i + 1;
          });
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  function nextStep() {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    setPktProgress(0);
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
    setPktProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setPktProgress(0);
    setPlaying(false);
  }

  const packetPos = useMemo(() => packetPosition(step.path, pktProgress), [step, pktProgress]);
  const activeEdges = useMemo(() => pathToEdges(step.path), [step]);

  // Flood: tegn flere pakker
  const floodPackets = useMemo(() => {
    if (color !== "flood") return null;
    const out: { x: number; y: number; k: number }[] = [];
    for (let k = 0; k < 6; k++) {
      const t = (pktProgress + k / 6) % 1;
      const p = packetPosition(step.path, t);
      if (p) out.push({ ...p, k });
    }
    return out;
  }, [color, pktProgress, step.path]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header: scenario + toggle */}
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <ScenarioBadge goal={step.scenario} />
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setSecured(false)}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              !secured
                ? "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300"
                : "border-border bg-background text-muted-foreground hover:border-red-500/40"
            }`}
          >
            <ShieldOff className="h-3 w-3" /> Uten sikkerhet
          </button>
          <button
            onClick={() => setSecured(true)}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              secured
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-background text-muted-foreground hover:border-emerald-500/40"
            }`}
          >
            <Shield className="h-3 w-3" /> Med sikkerhet
          </button>
        </div>
      </div>

      {/* SVG */}
      <svg viewBox="0 0 680 260" className="w-full h-auto bg-muted/10">
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES.find((n) => n.id === a)!;
          const nb = NODES.find((n) => n.id === b)!;
          const isActive = activeEdges.some(
            ([x, y]) => (x === a && y === b) || (x === b && y === a),
          );
          const isEveLink = a === "eve" || b === "eve";
          return (
            <line
              key={i}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className={
                isActive
                  ? "stroke-foreground/70"
                  : isEveLink
                    ? "stroke-red-500/30"
                    : "stroke-muted-foreground/30"
              }
              strokeWidth={isActive ? 2.2 : 1.5}
              strokeDasharray={isEveLink && !isActive ? "4 3" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {/* Eve-bobble */}
        {eveBubble && (
          <g>
            <rect
              x={250}
              y={20}
              width={185}
              height={22}
              rx={6}
              className={
                secured
                  ? "fill-emerald-500/10 stroke-emerald-500/50"
                  : "fill-red-500/10 stroke-red-500/50"
              }
              strokeWidth={1}
            />
            <text
              x={342}
              y={35}
              textAnchor="middle"
              className={
                secured
                  ? "fill-emerald-700 dark:fill-emerald-300 text-[10px] font-medium"
                  : "fill-red-700 dark:fill-red-300 text-[10px] font-medium"
              }
            >
              {eveBubble}
            </text>
          </g>
        )}

        {/* Flood-pakker eller enkelt-pakke */}
        {floodPackets
          ? floodPackets.map((p) => (
              <circle
                key={p.k}
                cx={p.x}
                cy={p.y}
                r={7}
                className={`${PKT_FILL.flood} stroke-background`}
                strokeWidth={1.5}
                opacity={0.7}
              />
            ))
          : packetPos && (
              <g>
                <circle
                  cx={packetPos.x}
                  cy={packetPos.y}
                  r={11}
                  className={`${PKT_FILL[color]} stroke-background`}
                  strokeWidth={2}
                />
                <text
                  x={packetPos.x}
                  y={packetPos.y + 3}
                  textAnchor="middle"
                  className="fill-background text-[8px] font-bold pointer-events-none"
                >
                  {PKT_LABEL[color]}
                </text>
              </g>
            )}
      </svg>

      {/* Beskrivelse + utfall */}
      <div className="px-4 py-3 text-sm border-t border-border">
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          {secured ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-medium">
              <Shield className="h-3 w-3" /> Forsvart: {GOAL_META[step.scenario].defense}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-red-700 dark:text-red-300 font-medium">
              <ShieldOff className="h-3 w-3" /> {GOAL_META[step.scenario].label} brutt
            </span>
          )}
        </div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prevStep}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <SkipBack className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing
            ? "Pause"
            : stepIdx === STEPS.length - 1 && pktProgress >= 0.99
              ? "Spill av igjen"
              : "Spill av"}
        </button>
        <button
          onClick={nextStep}
          disabled={stepIdx === STEPS.length - 1}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          Neste <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
          title="Tilbakestill"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        <div className="ml-2 flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setPktProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>

        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      {/* Legend / sikkerhetsmål */}
      <div className="px-4 py-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 border-t border-border text-[11px]">
        {(Object.keys(GOAL_META) as Goal[]).map((g) => {
          const meta = GOAL_META[g];
          const Icon = meta.icon;
          const isActive = step.scenario === g;
          return (
            <div
              key={g}
              className={`flex items-start gap-1.5 rounded px-2 py-1 ${
                isActive
                  ? "bg-brand/10 ring-1 ring-brand/40"
                  : "bg-muted/20"
              }`}
            >
              <Icon className="h-3 w-3 mt-0.5 shrink-0 text-brand" />
              <div className="leading-tight">
                <div className="font-semibold text-foreground">{meta.label}</div>
                <div className="text-muted-foreground">{meta.short}</div>
                <div className="text-muted-foreground/80 text-[10px] mt-0.5">
                  Forsvar: {meta.defense}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pakke-fargenøkkel */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="font-medium text-foreground">Pakke-typer:</span>
        <LegendDot color="plain" /> Klartekst
        <LegendDot color="cipher" /> Kryptert
        <LegendDot color="mac" /> Med MAC
        <LegendDot color="signed" /> Signert
        <LegendDot color="tampered" /> Endret
        <LegendDot color="fake" /> Forfalsket
        <LegendDot color="flood" /> Flood / DDoS
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Hjelpe-komponenter
// ----------------------------------------------------------------------

function ScenarioBadge({ goal }: { goal: Goal }) {
  const meta = GOAL_META[goal];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand ring-1 ring-brand/30">
      <Icon className="h-3 w-3" /> {meta.label}
    </span>
  );
}

function NodeShape({ node }: { node: Node }) {
  if (node.kind === "alice" || node.kind === "bob") {
    const ringColor = node.kind === "alice" ? "stroke-amber-500" : "stroke-emerald-500";
    const fillFace = node.kind === "alice" ? "fill-amber-500/15" : "fill-emerald-500/15";
    const textColor =
      node.kind === "alice"
        ? "fill-amber-700 dark:fill-amber-300"
        : "fill-emerald-700 dark:fill-emerald-300";
    return (
      <g>
        <circle
          cx={node.x}
          cy={node.y}
          r={22}
          className={`${fillFace} ${ringColor}`}
          strokeWidth={2.5}
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className={`${textColor} text-[11px] font-bold`}
        >
          {node.label[0]}
        </text>
        <text
          x={node.x}
          y={node.y + 42}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + 54}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  if (node.kind === "eve") {
    return (
      <g>
        <polygon
          points={`${node.x},${node.y - 22} ${node.x + 22},${node.y + 14} ${node.x - 22},${node.y + 14}`}
          className="fill-red-500/15 stroke-red-500"
          strokeWidth={2.5}
        />
        <text
          x={node.x}
          y={node.y + 6}
          textAnchor="middle"
          className="fill-red-700 dark:fill-red-300 text-[11px] font-bold"
        >
          E
        </text>
        <text
          x={node.x}
          y={node.y - 30}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-semibold"
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y - 42}
            textAnchor="middle"
            className="fill-red-600/80 dark:fill-red-400/80 text-[9px] font-medium"
          >
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  // router
  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r={14}
        className="fill-card stroke-foreground/60"
        strokeWidth={2}
      />
      <text
        x={node.x}
        y={node.y + 4}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-bold"
      >
        R
      </text>
      <text
        x={node.x}
        y={node.y + 30}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
      >
        {node.label}
      </text>
    </g>
  );
}

function LegendDot({ color }: { color: PacketColor }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-2 h-2 rounded-full ${PKT_BG[color]}`} />
    </span>
  );
}

// ----------------------------------------------------------------------
// Geometri
// ----------------------------------------------------------------------

function nodeById(id: NodeId): Node | undefined {
  return NODES.find((n) => n.id === id);
}

function pathToEdges(path: NodeId[]): [NodeId, NodeId][] {
  const out: [NodeId, NodeId][] = [];
  for (let i = 0; i < path.length - 1; i++) out.push([path[i], path[i + 1]]);
  return out;
}

function packetPosition(path: NodeId[], progress: number): { x: number; y: number } | null {
  if (path.length < 2) return null;
  const segments = path.length - 1;
  const safeProgress = Number.isFinite(progress) ? Math.min(Math.max(progress, 0), 0.999) : 0;
  const t = safeProgress * segments;
  const segIdx = Math.min(segments - 1, Math.floor(t));
  const segT = t - segIdx;
  const a = nodeById(path[segIdx]);
  const b = nodeById(path[segIdx + 1]);
  if (!a || !b) return null;
  return {
    x: a.x + (b.x - a.x) * segT,
    y: a.y + (b.y - a.y) * segT,
  };
}
