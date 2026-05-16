import { useState } from "react";
import { RotateCcw, History, Droplet, Zap } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for transistorer.
// Fem moduser:
//   1. MOSFET (NMOS)        — schematic, gate-spenning åpner/blokkerer kanalen.
//   2. Vannmetafor          — samme NMOS som hose+ventil. Intuitionspumpe.
//   3. NOT-gate             — pull-up motstand + NMOS som trekker output til GND.
//   4. NAND fra to NMOS     — to NMOS i serie + PMOS pull-up. Sannhetstabell.
//   5. CMOS-inverter        — PMOS + NMOS i par. Alltid nøyaktig én leder.
// Elektroner = små grønne prikker som beveger seg langs ledere via CSS keyframes.
// --------------------------------------------------------------------------

type Mode = "nmos" | "water" | "not" | "nand" | "cmos";

const MODES: { id: Mode; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "nmos", label: "MOSFET (NMOS)", sub: "Gate styrer kanalen", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "water", label: "Vannmetafor", sub: "Hose + ventil", icon: <Droplet className="h-3.5 w-3.5" /> },
  { id: "not", label: "NOT-gate", sub: "Pull-up + NMOS", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "nand", label: "NAND", sub: "2× NMOS i serie", icon: <Zap className="h-3.5 w-3.5" /> },
  { id: "cmos", label: "CMOS-inverter", sub: "PMOS + NMOS i par", icon: <Zap className="h-3.5 w-3.5" /> },
];

const HIGH = "#22c55e";
const LOW = "#9ca3af";

const wireColor = (v: 0 | 1) => (v === 1 ? HIGH : LOW);
const wireStroke = (v: 0 | 1) => (v === 1 ? 3 : 2);

// ============================================================
// Hovedkomponent
// ============================================================

export function TransistorVisualizer() {
  const [mode, setMode] = useState<Mode>("nmos");
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);

  const reset = () => {
    setA(0);
    setB(0);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Transistor">
      {/* Topp-bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Transistorer — vri gate-spenninger, se elektronene flyte
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Nullstill brytere
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setA(0);
                setB(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brytere */}
      <div className="px-4 py-3 border-b border-border bg-muted/10">
        <div className="flex items-center gap-4 flex-wrap">
          <ToggleSwitch
            label={mode === "water" ? "Håndtak" : mode === "nmos" ? "Gate (Vg)" : "A"}
            value={a}
            onChange={setA}
          />
          {mode === "nand" && (
            <ToggleSwitch label="B" value={b} onChange={setB} />
          )}
          <div className="ml-auto text-[11px] text-muted-foreground italic max-w-xs">
            {mode === "nmos" && "Sett gate høy → kanalen åpnes mellom S og D."}
            {mode === "water" && "Skru håndtaket → ventilen åpnes, vannet flyter."}
            {mode === "not" && "Når A er høy, drar NMOS-en utgangen ned til GND."}
            {mode === "nand" && "Begge transistorer må lede før utgangen synker."}
            {mode === "cmos" && "Nøyaktig én av PMOS/NMOS leder — aldri begge."}
          </div>
        </div>
      </div>

      {/* Hoved-visning */}
      <div className="p-6 bg-background">
        {mode === "nmos" && <NmosView gate={a} />}
        {mode === "water" && <WaterMetaphorView open={a} />}
        {mode === "not" && <NotGateView input={a} />}
        {mode === "nand" && <NandView a={a} b={b} />}
        {mode === "cmos" && <CmosInverterView input={a} />}
      </div>

      {/* Historie-fotnote */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground flex items-start gap-2">
        <History className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand" />
        <div>
          <span className="font-semibold text-foreground">Historie:</span>{" "}
          Den første transistoren ble bygd hos Bell Labs i 1947 — kloss
          stor som en tommel. <strong>Moores lov</strong> (Gordon Moore,
          1965) spådde at antall transistorer per chip ville fordobles
          omtrent hvert 2. år. Den har holdt seg i over 60 år: fra 2 300
          transistorer i Intel 4004 (1971) til ~100 milliarder i moderne
          M-series-chips (2024). Fra 1947 til nano-skala på under et
          menneskeliv.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Bryterknapp 0/1
// ============================================================

function ToggleSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 0 | 1;
  onChange: (v: 0 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-semibold text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange((value ^ 1) as 0 | 1)}
        className={`relative w-14 h-7 rounded-full border-2 transition-colors ${
          value === 1
            ? "bg-success/20 border-success"
            : "bg-muted border-border"
        }`}
        aria-label={`Sett ${label} til ${value === 1 ? 0 : 1}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 ease-out font-mono text-[10px] font-bold flex items-center justify-center ${
            value === 1
              ? "left-7 bg-success text-success-foreground"
              : "left-0.5 bg-card text-muted-foreground"
          }`}
        >
          {value}
        </span>
      </button>
    </div>
  );
}

// ============================================================
// Ledningen + elektron-prikker
// ============================================================

function Wire({
  d,
  value,
  dashed = false,
}: {
  d: string;
  value: 0 | 1;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      stroke={wireColor(value)}
      strokeWidth={wireStroke(value)}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={dashed ? "4 4" : undefined}
      style={{ transition: "stroke 200ms ease-out, stroke-width 200ms ease-out" }}
    />
  );
}

/**
 * Flytende elektron-prikker langs en path. `pathId` må samsvare med en
 * `<path id="..." />` definert i en `<defs>`-blokk i samme svg.
 * `flowing` styrer om prikkene bevegtes (true) eller står stille (false).
 */
function ElectronStream({
  pathId,
  flowing,
  count = 4,
  duration = 2.2,
  reverse = false,
}: {
  pathId: string;
  flowing: boolean;
  count?: number;
  duration?: number;
  reverse?: boolean;
}) {
  if (!flowing) return null;
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      {dots.map((i) => (
        <circle key={i} r={2.4} fill="#22c55e" opacity={0.9}>
          <animateMotion
            dur={`${duration}s`}
            repeatCount="indefinite"
            begin={`${(i * duration) / count}s`}
            keyPoints={reverse ? "1;0" : "0;1"}
            keyTimes="0;1"
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}
    </>
  );
}

// ============================================================
// Status-pill (PÅ / AV)
// ============================================================

function StatusPill({ on, label }: { on: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
        on
          ? "bg-success/15 border-success text-success"
          : "bg-muted border-border text-muted-foreground"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-success" : "bg-muted-foreground"}`} />
      {label ?? (on ? "PÅ — leder" : "AV — blokkert")}
    </span>
  );
}

function OutputBulb({ value, label = "OUT" }: { value: 0 | 1; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono font-bold text-lg transition-all duration-200 ${
          value === 1
            ? "bg-success/30 border-success text-success shadow-[0_0_18px_rgba(34,197,94,0.6)]"
            : "bg-muted border-border text-muted-foreground"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
    </div>
  );
}

// ============================================================
// Mode 1: NMOS — schematic
// ============================================================
// Klassisk NMOS-symbol: Drain på topp, Source på bunn, Gate på venstre side
// med liten luftgap til vertikalstreken (oksid). En grønn "kanal" tegnes
// mellom D og S når gate er høy, med elektroner som flyter fra S til D.

function NmosView({ gate }: { gate: 0 | 1 }) {
  const conducting = gate === 1;
  return (
    <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
      <div>
        <svg viewBox="0 0 360 280" className="w-full max-w-md text-foreground/80 mx-auto block">
          <defs>
            <path id="nmos-channel" d="M 200 90 L 200 200" />
          </defs>

          {/* Vdd-merke (drain-rail) */}
          <Wire d="M 200 30 L 200 90" value={conducting ? 1 : 1} />
          <text x={208} y={36} fontSize={10} fontFamily="ui-monospace, monospace" fill="currentColor">
            Vdd (+)
          </text>
          {/* Drain-label */}
          <text x={208} y={86} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            D (drain)
          </text>

          {/* NMOS-symbol — vertikalstrek for kanal (oksid-grense) på x=200 mellom y=90 og y=200.
              Gate-stang på x=160 mellom y=110 og y=180, med liten luftgap fra kanalstreken. */}
          {/* Drain-stub */}
          <line x1={200} y1={90} x2={200} y2={110} stroke="currentColor" strokeWidth={1.5} />
          {/* Kanalstrek (silisium) */}
          <line
            x1={200}
            y1={110}
            x2={200}
            y2={180}
            stroke={conducting ? HIGH : "currentColor"}
            strokeWidth={conducting ? 4 : 2}
            style={{ transition: "stroke 250ms ease-out, stroke-width 250ms ease-out" }}
          />
          {/* Source-stub */}
          <line x1={200} y1={180} x2={200} y2={200} stroke="currentColor" strokeWidth={1.5} />

          {/* Gate-stang og gate-ledning */}
          <line x1={170} y1={110} x2={170} y2={180} stroke="currentColor" strokeWidth={2} />
          <line x1={170} y1={145} x2={90} y2={145} stroke={wireColor(gate)} strokeWidth={wireStroke(gate)}
            style={{ transition: "stroke 200ms ease-out, stroke-width 200ms ease-out" }} />
          <text x={50} y={141} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            G (gate)
          </text>
          <text x={50} y={155} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor">
            Vg = {gate}
          </text>

          {/* Pil inn på gate (indikerer N-kanal) */}
          <polygon
            points="178,141 178,149 184,145"
            fill="currentColor"
          />

          {/* Inversjonslag-glow når gate er på */}
          {conducting && (
            <rect
              x={193}
              y={110}
              width={14}
              height={70}
              rx={3}
              fill={HIGH}
              opacity={0.18}
            />
          )}

          {/* Source-grein til GND */}
          <Wire d={`M 200 200 L 200 240`} value={conducting ? 1 : 0} />
          <line x1={185} y1={240} x2={215} y2={240} stroke="currentColor" strokeWidth={2} />
          <line x1={190} y1={246} x2={210} y2={246} stroke="currentColor" strokeWidth={2} />
          <line x1={195} y1={252} x2={205} y2={252} stroke="currentColor" strokeWidth={2} />
          <text x={220} y={244} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            S (source) — GND
          </text>

          {/* Elektron-flyt mellom S og D når kanalen er åpen */}
          <ElectronStream pathId="nmos-channel" flowing={conducting} reverse={true} count={5} duration={2.0} />

          {/* "Ingen kanal"-X når av */}
          {!conducting && (
            <g>
              <line x1={188} y1={133} x2={212} y2={157} stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />
              <line x1={212} y1={133} x2={188} y2={157} stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />
            </g>
          )}
        </svg>
        <div className="mt-3 flex items-center gap-3">
          <StatusPill on={conducting} />
          <div className="text-xs text-muted-foreground font-mono">
            Vg = {gate} {conducting ? "≥ Vt → kanal åpen" : "< Vt → ingen kanal"}
          </div>
        </div>
      </div>
      <aside className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Hva skjer
        </div>
        <p>
          Når gate-spenningen (Vg) overstiger terskelen Vt (typisk ~0.5 V),
          tiltrekker den positive ladningen elektroner i p-substratet og
          danner en tynn n-kanal rett under oksidet.
        </p>
        <p>
          Med kanalen åpen kan elektroner strømme fra <span className="font-mono font-semibold">source</span> til{" "}
          <span className="font-mono font-semibold">drain</span> — transistoren leder.
        </p>
        <div className="rounded border border-border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed">
          Vg = 0  → kanal stengt → AV
          <br />
          Vg = 1  → kanal åpen   → PÅ
        </div>
      </aside>
    </div>
  );
}

// ============================================================
// Mode 2: Vannmetafor (samme NMOS, men hose + ventil)
// ============================================================

function WaterMetaphorView({ open }: { open: 0 | 1 }) {
  const flowing = open === 1;
  return (
    <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
      <div>
        <svg viewBox="0 0 380 280" className="w-full max-w-md text-foreground/80 mx-auto block">
          <defs>
            <path id="water-pipe-anim" d="M 70 80 L 200 80 L 200 200 L 340 200" />
          </defs>

          {/* Vannkilde (tank) på venstre side */}
          <rect x={20} y={50} width={50} height={60} rx={4} fill="#3b82f6" opacity={0.25} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={45} y={130} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="middle">
            Source
          </text>
          <text x={45} y={142} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor" textAnchor="middle">
            (vannkilde)
          </text>

          {/* Hovedrør: source → ventil → drain */}
          <line x1={70} y1={80} x2={190} y2={80} stroke="currentColor" strokeWidth={3} />
          <line x1={210} y1={80} x2={210} y2={200} stroke="currentColor" strokeWidth={3} opacity={0.4} />
          <line x1={210} y1={200} x2={340} y2={200} stroke="currentColor" strokeWidth={3} />
          {/* Synlig flow-rør (det "interne" der vannet faktisk er) */}
          <line
            x1={70}
            y1={80}
            x2={200}
            y2={80}
            stroke="#3b82f6"
            strokeWidth={6}
            opacity={flowing ? 0.7 : 0.2}
            strokeLinecap="round"
            style={{ transition: "opacity 250ms" }}
          />
          <line
            x1={200}
            y1={flowing ? 80 : 80}
            x2={200}
            y2={flowing ? 200 : 80}
            stroke="#3b82f6"
            strokeWidth={6}
            opacity={flowing ? 0.7 : 0}
            strokeLinecap="round"
            style={{ transition: "opacity 250ms" }}
          />
          <line
            x1={200}
            y1={200}
            x2={340}
            y2={200}
            stroke="#3b82f6"
            strokeWidth={6}
            opacity={flowing ? 0.7 : 0.2}
            strokeLinecap="round"
            style={{ transition: "opacity 250ms" }}
          />

          {/* Ventilen i midten (åpen/lukket) */}
          <rect x={185} y={120} width={30} height={40} rx={4} fill="var(--card, #fff)" stroke="currentColor" strokeWidth={1.5} />
          <text x={200} y={114} fontSize={9} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="middle">
            Ventil
          </text>
          {/* "Klaff" — vertikal når åpen, horisontal når lukket */}
          <line
            x1={flowing ? 200 : 188}
            y1={flowing ? 124 : 140}
            x2={flowing ? 200 : 212}
            y2={flowing ? 156 : 140}
            stroke={flowing ? HIGH : "#ef4444"}
            strokeWidth={3}
            strokeLinecap="round"
            style={{ transition: "all 220ms ease-out" }}
          />

          {/* Håndtak / Gate */}
          <line x1={200} y1={120} x2={200} y2={70} stroke="currentColor" strokeWidth={2} />
          <line x1={180} y1={70} x2={220} y2={70} stroke={wireColor(open)} strokeWidth={4} strokeLinecap="round"
            style={{ transition: "stroke 200ms" }} />
          <circle cx={200} cy={70} r={4} fill={wireColor(open)} />
          <text x={200} y={56} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="middle">
            Håndtak = Gate
          </text>
          <text x={200} y={44} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor" textAnchor="middle">
            {open === 1 ? "ÅPEN" : "LUKKET"}
          </text>

          {/* Drain (utløp) — bøtte */}
          <path
            d="M 340 195 L 360 195 L 358 235 L 342 235 Z"
            fill="#3b82f6"
            opacity={flowing ? 0.5 : 0.15}
            stroke="#3b82f6"
            strokeWidth={1.5}
            style={{ transition: "opacity 250ms" }}
          />
          <text x={350} y={252} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="middle">
            Drain
          </text>
          <text x={350} y={264} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor" textAnchor="middle">
            (utløp)
          </text>

          {flowing &&
            Array.from({ length: 6 }, (_, i) => (
              <circle key={i} r={3.2} fill="#60a5fa" opacity={0.9}>
                <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${(i * 2.4) / 6}s`}>
                  <mpath href="#water-pipe-anim" />
                </animateMotion>
              </circle>
            ))}
        </svg>
        <div className="mt-3 flex items-center gap-3">
          <StatusPill on={flowing} label={flowing ? "Vann flyter" : "Ventil lukket"} />
          <div className="text-xs text-muted-foreground">
            {flowing
              ? "Du har åpnet ventilen — vannet renner fra kilden til utløpet."
              : "Ventilen blokkerer. Vannet venter ved kilden."}
          </div>
        </div>
      </div>
      <aside className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Mapping til MOSFET
        </div>
        <ul className="space-y-1 list-disc pl-4 marker:text-muted-foreground">
          <li>Håndtak ↔ <span className="font-mono font-semibold">Gate (G)</span></li>
          <li>Vannkilde ↔ <span className="font-mono font-semibold">Source (S)</span></li>
          <li>Utløp ↔ <span className="font-mono font-semibold">Drain (D)</span></li>
          <li>Vann ↔ <span className="font-mono font-semibold">elektroner</span></li>
          <li>Ventilklaff ↔ <span className="font-mono font-semibold">inversjonslag</span> i silisiumet</li>
        </ul>
        <p className="text-muted-foreground italic">
          Intuisjonen er nyttig — men i en ekte MOSFET «strømmer» det ikke
          gjennom gate-håndtaket. Det er bare en spenning som tiltrekker
          ladning i kanalen under.
        </p>
      </aside>
    </div>
  );
}

// ============================================================
// Mode 3: NOT-gate fra én NMOS + pull-up motstand
// ============================================================
// Vdd — R (pull-up) — OUT — D NMOS — S — GND
// Når input HØY  → NMOS leder → OUT trekkes ned til GND  → OUT = 0
// Når input LAV  → NMOS sperrer → OUT trekkes opp av R   → OUT = 1

function NotGateView({ input }: { input: 0 | 1 }) {
  const nmosOn = input === 1;
  const out: 0 | 1 = nmosOn ? 0 : 1;

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-6 items-start">
      <div>
        <svg viewBox="0 0 360 320" className="w-full max-w-md text-foreground/80 mx-auto block">
          <defs>
            <path id="not-pullup" d="M 220 40 L 220 200" />
            <path id="not-channel" d="M 220 200 L 220 270" />
          </defs>

          {/* Vdd-rail */}
          <line x1={140} y1={40} x2={300} y2={40} stroke="currentColor" strokeWidth={2} />
          <text x={296} y={32} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="end">
            Vdd (+)
          </text>

          {/* Pull-up motstand: ziggzag mellom (220, 60) og (220, 130) */}
          <line x1={220} y1={40} x2={220} y2={60} stroke={wireColor(1)} strokeWidth={wireStroke(1)} />
          <polyline
            points="220,60 210,68 230,76 210,84 230,92 210,100 230,108 210,116 220,122"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          <text x={240} y={92} fontSize={10} fontFamily="ui-monospace, monospace" fill="currentColor">
            R (pull-up)
          </text>
          {/* Wire fra motstand til drain — denne er på "OUT"-nivået */}
          <Wire d="M 220 122 L 220 200" value={out} />

          {/* OUT-tap */}
          <Wire d="M 220 160 L 300 160" value={out} />
          <text x={304} y={156} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            OUT
          </text>
          <text x={304} y={168} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor">
            = {out}
          </text>

          {/* NMOS-transistor (drain over, source under, gate venstre) */}
          {/* Drain-stub */}
          <line x1={220} y1={200} x2={220} y2={220} stroke="currentColor" strokeWidth={1.5} />
          {/* Kanal */}
          <line
            x1={220}
            y1={220}
            x2={220}
            y2={270}
            stroke={nmosOn ? HIGH : "currentColor"}
            strokeWidth={nmosOn ? 4 : 2}
            style={{ transition: "stroke 250ms, stroke-width 250ms" }}
          />
          {/* Source-stub */}
          <line x1={220} y1={270} x2={220} y2={285} stroke="currentColor" strokeWidth={1.5} />
          {/* Gate-stang */}
          <line x1={190} y1={220} x2={190} y2={270} stroke="currentColor" strokeWidth={2} />
          {/* Gate-pil */}
          <polygon points="198,241 198,249 204,245" fill="currentColor" />
          {/* Gate-ledning fra input */}
          <Wire d="M 190 245 L 60 245" value={input} />
          <text x={20} y={241} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            IN = {input}
          </text>

          {/* Glow når NMOS leder */}
          {nmosOn && (
            <rect x={213} y={220} width={14} height={50} rx={3} fill={HIGH} opacity={0.18} />
          )}

          {/* GND-symbol */}
          <line x1={220} y1={285} x2={220} y2={295} stroke="currentColor" strokeWidth={1.5} />
          <line x1={205} y1={295} x2={235} y2={295} stroke="currentColor" strokeWidth={2} />
          <line x1={210} y1={300} x2={230} y2={300} stroke="currentColor" strokeWidth={2} />
          <line x1={215} y1={305} x2={225} y2={305} stroke="currentColor" strokeWidth={2} />

          {/* Elektron-flyt:
              - Når NMOS er på: strømmer fra GND oppover gjennom kanal, OUT trekkes ned (pull-down).
              - Når NMOS er av: liten strøm gjennom pull-up holder OUT høy (her: animer pull-up). */}
          <ElectronStream pathId="not-channel" flowing={nmosOn} count={4} duration={1.8} reverse={true} />
          <ElectronStream pathId="not-pullup" flowing={!nmosOn} count={5} duration={2.4} />
        </svg>

        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <OutputBulb value={out} label="OUT" />
          <div className="text-xs font-mono text-muted-foreground space-y-1">
            <div>IN = <span className="font-bold text-foreground">{input}</span></div>
            <div>
              NMOS: <StatusPill on={nmosOn} label={nmosOn ? "leder" : "blokkert"} />
            </div>
            <div>
              OUT = NOT(IN) ={" "}
              <span className="font-bold text-foreground">{out}</span>
            </div>
          </div>
        </div>
      </div>
      <aside className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Hvorfor dette er en NOT
        </div>
        <p>
          Pull-up-motstanden vil <em>som standard</em> dra OUT mot Vdd
          (logisk 1). Når NMOS leder, kobler den OUT direkte til GND og
          «vinner» over motstanden — OUT faller til 0.
        </p>
        <div className="rounded border border-border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed">
          IN = 0  → NMOS av  → OUT = 1
          <br />
          IN = 1  → NMOS på  → OUT = 0
        </div>
        <p className="text-muted-foreground italic">
          Ulempen: når OUT = 0 går det hele tiden strøm gjennom R fra Vdd
          til GND. CMOS løser dette — se neste modus.
        </p>
      </aside>
    </div>
  );
}

// ============================================================
// Mode 4: NAND fra to NMOS i serie + PMOS pull-up
// ============================================================
// Vdd — PMOS (parallell pull-up, leder når både A og B er 0/1?)
// Forenklet 2-input NAND i CMOS:
//   Pull-up: PMOS_A og PMOS_B i PARALLELL (en av dem leder hvis A=0 ELLER B=0)
//   Pull-down: NMOS_A og NMOS_B i SERIE   (begge må lede → bare når A=1 OG B=1)
// Vi tegner en forenklet variant: bare pull-up symbol + to NMOS i serie i
// pull-down-nettet.
// Sannhetstabell: OUT = NOT(A AND B).

function NandView({ a, b }: { a: 0 | 1; b: 0 | 1 }) {
  const out: 0 | 1 = (a & b) === 1 ? 0 : 1;
  const nmosA = a === 1;
  const nmosB = b === 1;
  const seriesConducting = nmosA && nmosB;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground italic">
        Pull-down-nettet: to NMOS-er i serie. Begge må lede før utgangen
        kobles til GND. Pull-up: PMOS-er i parallell trekker OUT høy hvis
        minst én av A/B er 0.
      </div>
      <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
        <div>
          <svg viewBox="0 0 380 420" className="w-full max-w-md text-foreground/80 mx-auto block">
            <defs>
              <path id="nand-pulldown" d="M 220 160 L 220 380" />
              <path id="nand-pullup" d="M 220 40 L 220 160" />
            </defs>

            {/* Vdd-rail */}
            <line x1={140} y1={40} x2={320} y2={40} stroke="currentColor" strokeWidth={2} />
            <text x={316} y={32} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="end">
              Vdd (+)
            </text>

            {/* PMOS pull-up — forenklet boks med bobble */}
            <g>
              <rect x={195} y={70} width={50} height={50} rx={5} fill="var(--card,#fff)" stroke="currentColor" strokeWidth={1.5} />
              <circle cx={220} cy={66} r={4} fill="var(--card,#fff)" stroke="currentColor" strokeWidth={1.5} />
              <text x={220} y={100} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="middle">
                PMOS
              </text>
              <text x={220} y={113} fontSize={8} fontFamily="ui-monospace, monospace" fill="currentColor" textAnchor="middle">
                A‖B
              </text>
            </g>

            {/* Vdd → PMOS → OUT-node */}
            <line x1={220} y1={40} x2={220} y2={70} stroke={wireColor(1)} strokeWidth={wireStroke(1)} />
            <Wire d="M 220 120 L 220 160" value={out} />

            {/* OUT-tap (på (220,160)) */}
            <Wire d="M 220 160 L 320 160" value={out} />
            <text x={324} y={156} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
              OUT
            </text>
            <text x={324} y={168} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor">
              = {out}
            </text>

            {/* NMOS A (øverste) — drain 180, source 240 */}
            <line x1={220} y1={160} x2={220} y2={180} stroke="currentColor" strokeWidth={1.5} />
            <line
              x1={220}
              y1={180}
              x2={220}
              y2={240}
              stroke={nmosA ? HIGH : "currentColor"}
              strokeWidth={nmosA ? 4 : 2}
              style={{ transition: "stroke 250ms, stroke-width 250ms" }}
            />
            <line x1={220} y1={240} x2={220} y2={258} stroke="currentColor" strokeWidth={1.5} />
            <line x1={190} y1={180} x2={190} y2={240} stroke="currentColor" strokeWidth={2} />
            <polygon points="198,206 198,214 204,210" fill="currentColor" />
            <Wire d="M 190 210 L 60 210" value={a} />
            <text x={16} y={206} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
              A = {a}
            </text>
            {nmosA && <rect x={213} y={180} width={14} height={60} rx={3} fill={HIGH} opacity={0.18} />}

            {/* NMOS B (nederste) — drain 258, source 320 */}
            <line x1={220} y1={258} x2={220} y2={278} stroke="currentColor" strokeWidth={1.5} />
            <line
              x1={220}
              y1={278}
              x2={220}
              y2={340}
              stroke={seriesConducting ? HIGH : nmosB ? HIGH : "currentColor"}
              strokeWidth={nmosB ? 4 : 2}
              style={{ transition: "stroke 250ms, stroke-width 250ms" }}
            />
            <line x1={220} y1={340} x2={220} y2={360} stroke="currentColor" strokeWidth={1.5} />
            <line x1={190} y1={278} x2={190} y2={340} stroke="currentColor" strokeWidth={2} />
            <polygon points="198,305 198,313 204,309" fill="currentColor" />
            <Wire d="M 190 309 L 60 309" value={b} />
            <text x={16} y={305} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
              B = {b}
            </text>
            {nmosB && <rect x={213} y={278} width={14} height={62} rx={3} fill={HIGH} opacity={0.18} />}

            {/* GND-symbol */}
            <line x1={220} y1={360} x2={220} y2={370} stroke="currentColor" strokeWidth={1.5} />
            <line x1={205} y1={370} x2={235} y2={370} stroke="currentColor" strokeWidth={2} />
            <line x1={210} y1={376} x2={230} y2={376} stroke="currentColor" strokeWidth={2} />
            <line x1={215} y1={382} x2={225} y2={382} stroke="currentColor" strokeWidth={2} />

            {/* Elektron-strøm: bare når begge NMOS-er leder kan strøm gå gjennom pull-down */}
            <ElectronStream pathId="nand-pulldown" flowing={seriesConducting} count={5} duration={2.0} reverse={true} />
            {/* Pull-up aktiv når OUT = 1 */}
            <ElectronStream pathId="nand-pullup" flowing={out === 1} count={4} duration={2.4} />
          </svg>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <OutputBulb value={out} label="OUT = NAND(A,B)" />
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Sannhetstabell — NAND
            </div>
            <table className="text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-1 px-2">A</th>
                  <th className="text-left py-1 px-2">B</th>
                  <th className="text-left py-1 px-2">OUT</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [0, 0],
                  [0, 1],
                  [1, 0],
                  [1, 1],
                ].map(([ra, rb]) => {
                  const ra1 = ra as 0 | 1;
                  const rb1 = rb as 0 | 1;
                  const y: 0 | 1 = (ra1 & rb1) === 1 ? 0 : 1;
                  const cur = ra1 === a && rb1 === b;
                  return (
                    <tr
                      key={`${ra}-${rb}`}
                      className={cur ? "bg-brand/10 text-brand font-bold" : "text-foreground/80"}
                    >
                      <td className="py-1 px-2">{ra}</td>
                      <td className="py-1 px-2">{rb}</td>
                      <td className={cur ? "py-1 px-2" : `py-1 px-2 ${y === 1 ? "text-success" : ""}`}>{y}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Bare når <strong>begge</strong> NMOS-ene leder (A=1 og B=1)
            koples OUT til GND. Da synker den til 0. For alle andre
            kombinasjoner holder pull-up den høy.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Mode 5: CMOS-inverter (PMOS + NMOS i par)
// ============================================================
// Vdd — PMOS — OUT — NMOS — GND
//   IN = 0 → PMOS leder, NMOS av → OUT = 1
//   IN = 1 → PMOS av, NMOS leder → OUT = 0
// Akkurat én leder — ingen statisk strøm fra Vdd til GND.

function CmosInverterView({ input }: { input: 0 | 1 }) {
  const pmosOn = input === 0;
  const nmosOn = input === 1;
  const out: 0 | 1 = nmosOn ? 0 : 1;

  return (
    <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
      <div>
        <svg viewBox="0 0 380 360" className="w-full max-w-md text-foreground/80 mx-auto block">
          <defs>
            <path id="cmos-pmos" d="M 220 40 L 220 180" />
            <path id="cmos-nmos" d="M 220 180 L 220 320" />
          </defs>

          {/* Vdd-rail */}
          <line x1={140} y1={40} x2={320} y2={40} stroke="currentColor" strokeWidth={2} />
          <text x={316} y={32} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" textAnchor="end">
            Vdd (+)
          </text>

          {/* PMOS-symbol (med bubble på gate) — source øverst, drain nederst */}
          <line x1={220} y1={40} x2={220} y2={70} stroke={wireColor(pmosOn ? 1 : 1)} strokeWidth={wireStroke(1)} />
          {/* Source-stub */}
          <line x1={220} y1={70} x2={220} y2={90} stroke="currentColor" strokeWidth={1.5} />
          {/* Kanal */}
          <line
            x1={220}
            y1={90}
            x2={220}
            y2={150}
            stroke={pmosOn ? HIGH : "currentColor"}
            strokeWidth={pmosOn ? 4 : 2}
            style={{ transition: "stroke 250ms, stroke-width 250ms" }}
          />
          {/* Drain-stub */}
          <line x1={220} y1={150} x2={220} y2={170} stroke="currentColor" strokeWidth={1.5} />
          {/* Gate-stang */}
          <line x1={190} y1={90} x2={190} y2={150} stroke="currentColor" strokeWidth={2} />
          {/* Bubble på gate (PMOS) — mellom gate-ledning og stang */}
          <circle cx={178} cy={120} r={4} fill="var(--card,#fff)" stroke="currentColor" strokeWidth={1.5} />
          {/* Gate-ledning inn fra venstre, stopper ved bubble */}
          <Wire d="M 174 120 L 60 120" value={input} />
          {/* Liten linje fra bubble til gate-stang */}
          <line x1={182} y1={120} x2={190} y2={120} stroke="currentColor" strokeWidth={1.5} />
          <text x={150} y={86} fontSize={9} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            PMOS
          </text>
          {pmosOn && <rect x={213} y={90} width={14} height={60} rx={3} fill={HIGH} opacity={0.18} />}

          {/* OUT-node ved (220, 180) */}
          <Wire d="M 220 170 L 220 200" value={out} />
          <Wire d="M 220 185 L 320 185" value={out} />
          <text x={324} y={181} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            OUT
          </text>
          <text x={324} y={193} fontSize={9} fontFamily="ui-monospace, monospace" fill="currentColor">
            = {out}
          </text>

          {/* NMOS-symbol — drain øverst, source nederst */}
          <line x1={220} y1={200} x2={220} y2={220} stroke="currentColor" strokeWidth={1.5} />
          <line
            x1={220}
            y1={220}
            x2={220}
            y2={290}
            stroke={nmosOn ? HIGH : "currentColor"}
            strokeWidth={nmosOn ? 4 : 2}
            style={{ transition: "stroke 250ms, stroke-width 250ms" }}
          />
          <line x1={220} y1={290} x2={220} y2={310} stroke="currentColor" strokeWidth={1.5} />
          <line x1={190} y1={220} x2={190} y2={290} stroke="currentColor" strokeWidth={2} />
          <polygon points="198,251 198,259 204,255" fill="currentColor" />
          {/* Gate-ledning samme input */}
          <Wire d="M 190 255 L 60 255" value={input} />
          <text x={150} y={216} fontSize={9} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            NMOS
          </text>
          {nmosOn && <rect x={213} y={220} width={14} height={70} rx={3} fill={HIGH} opacity={0.18} />}

          {/* Felles input-label */}
          <text x={16} y={186} fontSize={10} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">
            IN = {input}
          </text>
          {/* Input-bus som forgrener seg til begge gates */}
          <Wire d="M 60 120 L 60 255" value={input} />
          <circle cx={60} cy={186} r={3} fill={wireColor(input)} />

          {/* GND-symbol */}
          <line x1={220} y1={310} x2={220} y2={320} stroke="currentColor" strokeWidth={1.5} />
          <line x1={205} y1={320} x2={235} y2={320} stroke="currentColor" strokeWidth={2} />
          <line x1={210} y1={326} x2={230} y2={326} stroke="currentColor" strokeWidth={2} />
          <line x1={215} y1={332} x2={225} y2={332} stroke="currentColor" strokeWidth={2} />

          {/* Strøm: bare gjennom den ene som leder */}
          <ElectronStream pathId="cmos-pmos" flowing={pmosOn} count={5} duration={2.2} />
          <ElectronStream pathId="cmos-nmos" flowing={nmosOn} count={5} duration={2.2} reverse={true} />
        </svg>
      </div>
      <div className="space-y-3">
        <OutputBulb value={out} label="OUT = NOT(IN)" />
        <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Status
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono">PMOS</span>
            <StatusPill on={pmosOn} label={pmosOn ? "leder" : "blokkert"} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono">NMOS</span>
            <StatusPill on={nmosOn} label={nmosOn ? "leder" : "blokkert"} />
          </div>
          <div className="rounded border border-border bg-muted/30 p-2 font-mono text-[10px] leading-relaxed">
            IN = 0  → PMOS på, NMOS av → OUT = 1
            <br />
            IN = 1  → PMOS av, NMOS på → OUT = 0
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          <strong>Hvorfor CMOS er genialt:</strong> nøyaktig én av de to
          leder. Det er aldri en direkte vei fra Vdd til GND i steady
          state. Derfor bruker en moderne chip nesten ingen strøm når
          ingenting skifter — den «koster» bare under overganger.
        </p>
      </div>
    </div>
  );
}
