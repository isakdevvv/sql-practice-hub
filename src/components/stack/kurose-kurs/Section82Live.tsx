import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Key,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// Levende versjon av 8.2: Symmetrisk (AES) vs. Public-key (RSA).
// Vi kjører to parallelle scenarier og viser key-exchange-problemet:
//   * I symmetrisk må Alice og Bob på en eller annen måte få samme hemmelige
//     nøkkel før de kan kommunisere. Eve kan lytte på selve key-exchangen.
//   * I public-key kan Alice fritt sende Bobs offentlige nøkkel over åpen
//     linje. Bob krypterer ALDRIG med private. Eve ser cipher men kan ikke
//     dekryptere.

// ----------------------------------------------------------------------
// Topologi (gjenbruker Alice/Bob/Eve)
// ----------------------------------------------------------------------

type NodeId = "alice" | "bob" | "eve";

type Node = {
  id: NodeId;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "alice" | "bob" | "eve";
};

const NODES: Node[] = [
  { id: "alice", label: "Alice", sublabel: "avsender", x: 80, y: 180, kind: "alice" },
  { id: "bob", label: "Bob", sublabel: "mottaker", x: 600, y: 180, kind: "bob" },
  { id: "eve", label: "Eve", sublabel: "lytter på linja", x: 340, y: 95, kind: "eve" },
];

// ----------------------------------------------------------------------
// Skript
// ----------------------------------------------------------------------

type Mode = "symmetric" | "public";

type Token = "key-sym" | "pub" | "priv" | "plaintext" | "cipher-sym" | "cipher-asym";

type Step = {
  title: string;
  text: string;
  // Hvilken retning og hvilken token vises som "pakke"?
  from?: NodeId;
  to?: NodeId;
  token?: Token;
  // Statusbobler å vise ved hver part. null = behold forrige.
  alice?: string;
  bob?: string;
  eve?: string;
  // Outcome-vurdering nederst i panel.
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
};

const SCRIPT: Record<Mode, Step[]> = {
  symmetric: [
    {
      title: "1. Alice og Bob må først dele en hemmelig nøkkel K",
      text:
        "Symmetrisk krypto (AES, ChaCha20) krever at SAMME nøkkel finnes på begge sider. Spørsmålet er: hvordan får Bob tak i K uten at Eve ser den?",
      alice: "Har K",
      bob: "Mangler K",
      eve: "Lytter",
      outcome: {
        kind: "info",
        text: "Dette er key-exchange-problemet. Hele 8.2 dreier seg om å løse det.",
      },
    },
    {
      title: "2. Naivt forsøk — Alice sender K i klartekst",
      text:
        "Alice sender den hemmelige nøkkelen K direkte over nettet. Det er det eneste hun har for hånden, men nettet er IKKE konfidensielt.",
      from: "alice",
      to: "bob",
      token: "key-sym",
      alice: "Sender K",
      bob: "Venter…",
      eve: "Avlytter!",
    },
    {
      title: "3. Eve fanger K",
      text:
        "Eve sitter på linja (åpen WiFi, kompromittert router, ISP-tapping). Hun ser K passere. Hele scenariet er nå knust før første ekte melding er sendt.",
      from: "alice",
      to: "eve",
      token: "key-sym",
      alice: "K sendt",
      bob: "K mottatt",
      eve: "Har K nå",
      outcome: {
        kind: "bad",
        text: "Konfidensialitet brutt før vi engang har begynt. Symmetrisk krypto over åpen kanal funker ikke uten en separat sikker key-exchange.",
      },
    },
    {
      title: "4. Alice krypterer melding med K",
      text:
        "Alice tar klartekst m og kjører c = AES_K(m). Cipher c sendes til Bob. AES er rask og deterministisk (m, K) → c.",
      from: "alice",
      to: "bob",
      token: "cipher-sym",
      alice: "Sender c = AES_K(m)",
      bob: "Får cipher",
      eve: "Har K, har c",
    },
    {
      title: "5. Bob dekrypterer — og Eve også",
      text:
        "Bob beregner m = AES_K^{-1}(c) og leser meldingen. Men Eve har ALLEREDE K fra steg 3 og kan gjøre nøyaktig det samme. Symmetrisk krypto beskytter ikke mot en angriper som så key-exchangen.",
      from: "alice",
      to: "bob",
      token: "cipher-sym",
      alice: "Ferdig",
      bob: "Leser m",
      eve: "Leser m også",
      outcome: {
        kind: "bad",
        text: "Lærdom: symmetrisk krypto er rask og god — men nøkkelen må først distribueres trygt. Det er det public-key-krypto løser.",
      },
    },
  ],
  public: [
    {
      title: "1. Bob har et nøkkel-par (e_B, d_B)",
      text:
        "Bob genererer en gang for alle et RSA- eller EC-nøkkelpar. Den offentlige nøkkelen e_B kan publiseres åpent. Den private d_B holdes hemmelig på Bobs maskin — den forlater ALDRI Bob.",
      alice: "Trenger e_B",
      bob: "Har (e_B, d_B)",
      eve: "Vet at Bob har nøkkel-par",
      outcome: {
        kind: "info",
        text: "Asymmetrien: det er enkelt å gå fra m til c med e_B, men umulig (uten enorm regnekraft) å gå tilbake uten d_B.",
      },
    },
    {
      title: "2. Bob sender offentlig nøkkel e_B over åpen linje",
      text:
        "Bob publiserer e_B på sin nettside, i et sertifikat eller direkte over TCP. Alice trenger den for å kryptere. Det gjør ingenting at Eve ser den — den er offentlig per definisjon.",
      from: "bob",
      to: "alice",
      token: "pub",
      alice: "Mottar e_B",
      bob: "Sender e_B",
      eve: "Ser e_B (uvesentlig)",
    },
    {
      title: "3. Eve fanger e_B — men det hjelper henne ikke",
      text:
        "Eve har nå e_B. Hun kan kryptere meldinger TIL Bob med den (alle kan), men hun kan ikke dekryptere noe. Privat-nøkkelen d_B forlot aldri Bobs maskin.",
      from: "bob",
      to: "eve",
      token: "pub",
      alice: "Har e_B",
      bob: "Har d_B",
      eve: "Har e_B (offentlig — ingen verdi for å lese)",
      outcome: {
        kind: "ok",
        text: "Ingen key-exchange-problem. Den offentlige nøkkelen er ufarlig å lekke.",
      },
    },
    {
      title: "4. Alice krypterer med e_B",
      text:
        "Alice beregner c = RSA_eB(m). Hun bruker kun offentlige operasjoner. Cipher c sendes til Bob.",
      from: "alice",
      to: "bob",
      token: "cipher-asym",
      alice: "Sender c = E_eB(m)",
      bob: "Får c",
      eve: "Ser c",
    },
    {
      title: "5. Bob dekrypterer — Eve kan ikke",
      text:
        "Bob beregner m = RSA_dB(c). Eve har e_B og c, men trenger d_B for å gå tilbake. RSA-problemet (faktorisering av store primtall) er antatt umulig i polynomtid.",
      from: "alice",
      to: "bob",
      token: "cipher-asym",
      alice: "Ferdig",
      bob: "Leser m",
      eve: "Ser bare støy",
      outcome: {
        kind: "ok",
        text: "Konfidensialitet bevart UTEN forhåndsdelt hemmelig nøkkel. Det er hele grunnen til at public-key-krypto endret nettverkssikkerhet i 1976 (Diffie-Hellman) og 1977 (RSA).",
      },
    },
  ],
};

// ----------------------------------------------------------------------
// Token-utseende
// ----------------------------------------------------------------------

const TOKEN_FILL: Record<Token, string> = {
  "key-sym": "fill-amber-500",
  pub: "fill-sky-500",
  priv: "fill-violet-600",
  plaintext: "fill-amber-400",
  "cipher-sym": "fill-emerald-500",
  "cipher-asym": "fill-cyan-500",
};
const TOKEN_LABEL: Record<Token, string> = {
  "key-sym": "K",
  pub: "e_B",
  priv: "d_B",
  plaintext: "m",
  "cipher-sym": "AES",
  "cipher-asym": "ENC",
};

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section82Live() {
  const [mode, setMode] = useState<Mode>("symmetric");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = SCRIPT[mode];
  const step = steps[stepIdx];

  useEffect(() => {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2400;
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = p + dt * SPEED;
        if (next >= 1) {
          setStepIdx((i) => {
            if (i + 1 >= steps.length) {
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
  }, [playing, steps.length]);

  function nextStep() {
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
    setProgress(0);
  }
  function prevStep() {
    setStepIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  const packetPos = useMemo(() => {
    if (!step.from || !step.to) return null;
    const a = NODES.find((n) => n.id === step.from)!;
    const b = NODES.find((n) => n.id === step.to)!;
    const t = Math.min(Math.max(progress, 0), 0.999);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }, [step, progress]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Mode toggle */}
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setMode("symmetric")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "symmetric"
                ? "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-border bg-background text-muted-foreground hover:border-amber-500/40"
            }`}
          >
            <Key className="h-3 w-3" /> Symmetrisk (AES)
          </button>
          <button
            onClick={() => setMode("public")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "public"
                ? "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                : "border-border bg-background text-muted-foreground hover:border-sky-500/40"
            }`}
          >
            <KeyRound className="h-3 w-3" /> Public-key (RSA)
          </button>
        </div>
      </div>

      {/* SVG */}
      <svg viewBox="0 0 680 280" className="w-full h-auto bg-muted/10">
        {/* Linker */}
        <line x1={80} y1={180} x2={600} y2={180} className="stroke-muted-foreground/40" strokeWidth={1.6} strokeDasharray="5 4" />
        <line x1={80} y1={180} x2={340} y2={95} className="stroke-red-500/30" strokeWidth={1.4} strokeDasharray="3 4" />
        <line x1={340} y1={95} x2={600} y2={180} className="stroke-red-500/30" strokeWidth={1.4} strokeDasharray="3 4" />

        {/* Nodes */}
        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {/* Bobles */}
        {step.alice && <Bubble x={80} y={262} text={step.alice} tone="amber" />}
        {step.bob && <Bubble x={600} y={262} text={step.bob} tone="emerald" />}
        {step.eve && <Bubble x={340} y={22} text={step.eve} tone="red" />}

        {/* Pakke */}
        {packetPos && step.token && (
          <g>
            <circle
              cx={packetPos.x}
              cy={packetPos.y}
              r={14}
              className={`${TOKEN_FILL[step.token]} stroke-background`}
              strokeWidth={2}
            />
            <text
              x={packetPos.x}
              y={packetPos.y + 4}
              textAnchor="middle"
              className="fill-background text-[9px] font-bold pointer-events-none"
            >
              {TOKEN_LABEL[step.token]}
            </text>
          </g>
        )}
      </svg>

      {/* Beskrivelse */}
      <div className="px-4 py-3 text-sm border-t border-border">
        <p className="text-muted-foreground">{step.text}</p>
        {step.outcome && <OutcomeRow outcome={step.outcome} />}
      </div>

      {/* Kontroller */}
      <Controls
        stepIdx={stepIdx}
        total={steps.length}
        playing={playing}
        onPrev={prevStep}
        onNext={nextStep}
        onPlay={() => setPlaying((p) => !p)}
        onReset={reset}
        onJump={(i) => {
          setStepIdx(i);
          setProgress(0);
        }}
        progress={progress}
      />

      {/* Sammenligning */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-2 border-t border-border text-[11px]">
        <div className={`rounded p-2 ${mode === "symmetric" ? "bg-amber-500/10 ring-1 ring-amber-500/40" : "bg-muted/20"}`}>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Key className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            Symmetrisk
          </div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>Samme nøkkel K på begge sider</li>
            <li>Rask: AES-NI ~ 5 GB/s per kjerne</li>
            <li>Krever sikker key-exchange</li>
            <li>Skalering: N parter → N² nøkler</li>
          </ul>
        </div>
        <div className={`rounded p-2 ${mode === "public" ? "bg-sky-500/10 ring-1 ring-sky-500/40" : "bg-muted/20"}`}>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <KeyRound className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            Public-key
          </div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>Nøkkel-par (e, d) per part</li>
            <li>Langsom: ~1000× tregere enn AES</li>
            <li>Ingen forhåndsdelt hemmelighet</li>
            <li>Skalering: N parter → 2N nøkler</li>
          </ul>
        </div>
      </div>

      {/* Token-legende */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="font-medium text-foreground">Tokens:</span>
        <Legend token="key-sym" label="K (delt hemmelig)" />
        <Legend token="pub" label="e_B (offentlig)" />
        <Legend token="priv" label="d_B (privat — forlater aldri Bob)" />
        <Legend token="cipher-sym" label="AES-cipher" />
        <Legend token="cipher-asym" label="RSA-cipher" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-komponenter
// ----------------------------------------------------------------------

function NodeShape({ node }: { node: Node }) {
  if (node.kind === "alice" || node.kind === "bob") {
    const ring = node.kind === "alice" ? "stroke-amber-500" : "stroke-emerald-500";
    const fill = node.kind === "alice" ? "fill-amber-500/15" : "fill-emerald-500/15";
    const text =
      node.kind === "alice"
        ? "fill-amber-700 dark:fill-amber-300"
        : "fill-emerald-700 dark:fill-emerald-300";
    return (
      <g>
        <circle cx={node.x} cy={node.y} r={26} className={`${fill} ${ring}`} strokeWidth={2.5} />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className={`${text} text-[12px] font-bold`}>
          {node.label[0]}
        </text>
        <text x={node.x} y={node.y + 48} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {node.label}
        </text>
        {node.sublabel && (
          <text x={node.x} y={node.y + 60} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {node.sublabel}
          </text>
        )}
      </g>
    );
  }
  return (
    <g>
      <polygon
        points={`${node.x},${node.y - 24} ${node.x + 24},${node.y + 14} ${node.x - 24},${node.y + 14}`}
        className="fill-red-500/15 stroke-red-500"
        strokeWidth={2.5}
      />
      <text x={node.x} y={node.y + 6} textAnchor="middle" className="fill-red-700 dark:fill-red-300 text-[12px] font-bold">
        E
      </text>
      <text x={node.x} y={node.y - 30} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        {node.label}
      </text>
      {node.sublabel && (
        <text x={node.x} y={node.y - 42} textAnchor="middle" className="fill-red-600/80 dark:fill-red-400/80 text-[9px] font-medium">
          {node.sublabel}
        </text>
      )}
    </g>
  );
}

function Bubble({ x, y, text, tone }: { x: number; y: number; text: string; tone: "amber" | "emerald" | "red" }) {
  const fill =
    tone === "amber"
      ? "fill-amber-500/10 stroke-amber-500/50"
      : tone === "emerald"
        ? "fill-emerald-500/10 stroke-emerald-500/50"
        : "fill-red-500/10 stroke-red-500/50";
  const textColor =
    tone === "amber"
      ? "fill-amber-700 dark:fill-amber-300"
      : tone === "emerald"
        ? "fill-emerald-700 dark:fill-emerald-300"
        : "fill-red-700 dark:fill-red-300";
  const width = Math.max(90, text.length * 5.5);
  return (
    <g>
      <rect x={x - width / 2} y={y - 14} width={width} height={20} rx={5} className={fill} strokeWidth={1} />
      <text x={x} y={y} textAnchor="middle" className={`${textColor} text-[10px] font-medium`}>
        {text}
      </text>
    </g>
  );
}

export function OutcomeRow({ outcome }: { outcome: { kind: "ok" | "bad" | "info"; text: string } }) {
  if (outcome.kind === "ok") {
    return (
      <div className="mt-2 flex items-start gap-1.5 rounded bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>{outcome.text}</span>
      </div>
    );
  }
  if (outcome.kind === "bad") {
    return (
      <div className="mt-2 flex items-start gap-1.5 rounded bg-red-500/10 px-2 py-1.5 text-xs text-red-700 dark:text-red-300">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>{outcome.text}</span>
      </div>
    );
  }
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded bg-sky-500/10 px-2 py-1.5 text-xs text-sky-700 dark:text-sky-300">
      <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>{outcome.text}</span>
    </div>
  );
}

export function Controls({
  stepIdx,
  total,
  playing,
  onPrev,
  onNext,
  onPlay,
  onReset,
  onJump,
  progress,
}: {
  stepIdx: number;
  total: number;
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onReset: () => void;
  onJump: (i: number) => void;
  progress: number;
}) {
  return (
    <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
      <button
        onClick={onPrev}
        disabled={stepIdx === 0}
        className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
      >
        <SkipBack className="h-3 w-3" /> Forrige
      </button>
      <button
        onClick={onPlay}
        className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
      >
        {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {playing
          ? "Pause"
          : stepIdx === total - 1 && progress >= 0.99
            ? "Spill av igjen"
            : "Spill av"}
      </button>
      <button
        onClick={onNext}
        disabled={stepIdx === total - 1}
        className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
      >
        Neste <SkipForward className="h-3 w-3" />
      </button>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        title="Tilbakestill"
      >
        <RotateCcw className="h-3 w-3" />
      </button>

      <div className="ml-2 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`h-1.5 w-4 rounded-full ${
              i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
            }`}
            aria-label={`Gå til steg ${i + 1}`}
          />
        ))}
      </div>

      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
        Steg {stepIdx + 1} / {total}
      </span>
    </div>
  );
}

function Legend({ token, label }: { token: Token; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${TOKEN_FILL[token].replace("fill-", "bg-")}`} />
      <span>{label}</span>
    </span>
  );
}

// Re-export Unlock so we don't trigger unused-import lint
void Unlock;
