import { useEffect, useMemo, useState } from "react";
import { Hash, PenLine, Eye, EyeOff } from "lucide-react";
import { OutcomeRow, Controls } from "./Section82Live";

// Levende versjon av 8.3: Meldings-integritet (HMAC) og digitale signaturer.
// To moduser:
//   * "hmac"      — Alice og Bob deler en hemmelig nøkkel k_AB. MAC = H(k || m).
//                  Begge kan lage MAC; ingen 3.part kan bevise hvem som gjorde det.
//   * "signature" — Alice signerer med sin private nøkkel d_A.
//                  Hvem som helst kan verifisere med offentlig e_A.
//                  Gir IKKE-AVVISNING.
// I begge spor viser vi at Eve kan forsøke å endre meldingen, og hva som skjer.

// ----------------------------------------------------------------------
// Topologi
// ----------------------------------------------------------------------

type NodeId = "alice" | "bob" | "eve" | "judge";

const NODES = [
  { id: "alice" as NodeId, label: "Alice", sublabel: "avsender", x: 80, y: 200 },
  { id: "bob" as NodeId, label: "Bob", sublabel: "mottaker", x: 600, y: 200 },
  { id: "eve" as NodeId, label: "Eve", sublabel: "tukler med m", x: 340, y: 110 },
  { id: "judge" as NodeId, label: "Dommer", sublabel: "ved tvist", x: 340, y: 310 },
];

// ----------------------------------------------------------------------
// Skript
// ----------------------------------------------------------------------

type Mode = "hmac" | "signature";

type Token = "msg" | "mac" | "msg-mac" | "sig" | "msg-sig" | "msg-tampered" | "msg-mac-bad";

type Step = {
  title: string;
  text: string;
  from?: NodeId;
  to?: NodeId;
  token?: Token;
  alice?: string;
  bob?: string;
  eve?: string;
  judge?: string;
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
};

const SCRIPT: Record<Mode, Step[]> = {
  hmac: [
    {
      title: "1. Alice og Bob har en delt hemmelig nøkkel k_AB",
      text:
        "HMAC krever en hemmelighet som BEGGE har — typisk distribuert i forkant (over TLS, fysisk møte, eller utledet fra Diffie-Hellman).",
      alice: "Har k_AB",
      bob: "Har k_AB",
      eve: "Kjenner ikke k_AB",
      outcome: {
        kind: "info",
        text: "HMAC = H(k_AB ⊕ opad || H(k_AB ⊕ ipad || m)). Hash-strukturen forhindrer length-extension-angrep.",
      },
    },
    {
      title: "2. Alice beregner MAC over meldingen",
      text:
        "Alice tar m = «Overfør 100 kr til Bob», beregner tag = HMAC(k_AB, m), og sender (m, tag).",
      alice: "Sender (m, tag)",
      bob: "Venter",
      eve: "Ser ingenting ennå",
    },
    {
      title: "3. (m, tag) på vei over nettet",
      text:
        "HMAC gir IKKE konfidensialitet — m er fortsatt synlig. Men ingen kan endre den uten å bli oppdaget, fordi de mangler k_AB.",
      from: "alice",
      to: "bob",
      token: "msg-mac",
      alice: "Sendt",
      bob: "Mottar snart",
      eve: "Avlytter — ser m i klartekst",
    },
    {
      title: "4. Eve prøver å endre beløpet",
      text:
        "Eve flipper «100» til «900». Hun må også produsere ny gyldig tag — men HMAC krever k_AB. Hun gjetter en tag og håper på flaks.",
      from: "eve",
      to: "bob",
      token: "msg-mac-bad",
      eve: "Sender m' = 900 med gjettet tag'",
      bob: "Mottar (m', tag')",
    },
    {
      title: "5. Bob verifiserer tag",
      text:
        "Bob beregner HMAC(k_AB, m') og sammenligner med mottatt tag. Eves gjettede tag stemmer ikke → pakken forkastes. Sannsynligheten for hell er 2^-128 — null.",
      bob: "tag' ≠ HMAC(k_AB, m'): forkast",
      eve: "Kan ikke forfalske",
      outcome: {
        kind: "ok",
        text: "Integritet OK. Men: hvis det senere oppstår tvist om hvem som sendte hva, har vi et problem — Bob har k_AB selv og KUNNE ha laget hvilken som helst (m, tag). HMAC gir ikke ikke-avvisning.",
      },
    },
    {
      title: "6. Tvist: Alice nekter å ha sendt overføringen",
      text:
        "Alice påstår at hun aldri sendte «Overfør 100 kr». Bob viser frem (m, tag). Men dommeren kan ikke avgjøre: både Alice OG Bob har k_AB — Bob kunne ha laget det selv.",
      judge: "Kan ikke avgjøre — k_AB er delt",
      outcome: {
        kind: "bad",
        text: "HMAC løser integritet, ikke ikke-avvisning. Når vi trenger juridisk binding, må vi over til digital signatur.",
      },
    },
  ],
  signature: [
    {
      title: "1. Alice har et nøkkel-par (e_A, d_A)",
      text:
        "Privat nøkkel d_A bor hos Alice — ingen andre. Offentlig e_A er publisert i et X.509-sertifikat signert av en CA.",
      alice: "Har (e_A, d_A)",
      bob: "Har CA-rot",
      eve: "Vet ingenting nyttig",
    },
    {
      title: "2. Alice signerer m",
      text:
        "Hun beregner h = SHA-256(m), så sig = RSA_dA(h) (eller ECDSA(d_A, h)). Sender (m, sig).",
      alice: "Sender (m, sig)",
      bob: "Venter",
      eve: "—",
    },
    {
      title: "3. (m, sig) over nettet",
      text:
        "Som med HMAC: konfidensialitet er ikke målet. Vi vil at MOTTAKEREN og en eventuell DOMMER kan bekrefte avsender.",
      from: "alice",
      to: "bob",
      token: "msg-sig",
      alice: "Sendt",
      bob: "Mottar snart",
      eve: "Ser (m, sig) — men kan ikke forfalske",
    },
    {
      title: "4. Eve prøver å endre m",
      text:
        "Eve endrer m → m'. Hun må også produsere en ny sig' = RSA_dA(SHA-256(m')) — men hun har ikke d_A. Hun har bare e_A som hjelper med å VERIFISERE, ikke signere.",
      from: "eve",
      to: "bob",
      token: "msg-tampered",
      eve: "Mangler d_A",
      bob: "—",
    },
    {
      title: "5. Bob verifiserer signaturen",
      text:
        "Bob beregner h' = SHA-256(m') og sammenligner med RSA_eA(sig). Stemmer ikke → forkast. Stemmer → m er ekte, OG den må komme fra noen med tilgang til d_A.",
      bob: "RSA_eA(sig) == SHA-256(m)? ✓",
      eve: "Stoppet",
      outcome: {
        kind: "ok",
        text: "Integritet + autentisitet sikret.",
      },
    },
    {
      title: "6. Tvist: Alice nekter — dommeren kan avgjøre",
      text:
        "Dommeren tar e_A fra Alices sertifikat (signert av CA) og kjører selv RSA_eA(sig) == SHA-256(m). Hvis det stemmer: kun innehaveren av d_A kunne ha laget sig. Det er Alice — ingen andre.",
      judge: "Verifikasjon ok → Alice signerte",
      outcome: {
        kind: "ok",
        text: "Ikke-avvisning oppnådd. Digital signatur gir det MAC aldri kunne: matematisk bevis for avsender, etterprøvbart av tredjepart.",
      },
    },
  ],
};

// ----------------------------------------------------------------------
// Farger
// ----------------------------------------------------------------------

const TOKEN_FILL: Record<Token, string> = {
  msg: "fill-amber-500",
  mac: "fill-emerald-500",
  "msg-mac": "fill-emerald-500",
  sig: "fill-violet-600",
  "msg-sig": "fill-violet-600",
  "msg-tampered": "fill-red-500",
  "msg-mac-bad": "fill-red-500",
};
const TOKEN_LABEL: Record<Token, string> = {
  msg: "m",
  mac: "MAC",
  "msg-mac": "m + MAC",
  sig: "SIG",
  "msg-sig": "m + SIG",
  "msg-tampered": "m'",
  "msg-mac-bad": "m'?",
};

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section83Live() {
  const [mode, setMode] = useState<Mode>("hmac");
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
            onClick={() => setMode("hmac")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "hmac"
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-background text-muted-foreground hover:border-emerald-500/40"
            }`}
          >
            <Hash className="h-3 w-3" /> HMAC (delt nøkkel)
          </button>
          <button
            onClick={() => setMode("signature")}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
              mode === "signature"
                ? "border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                : "border-border bg-background text-muted-foreground hover:border-violet-500/40"
            }`}
          >
            <PenLine className="h-3 w-3" /> Digital signatur
          </button>
        </div>
      </div>

      <svg viewBox="0 0 680 370" className="w-full h-auto bg-muted/10">
        <line x1={80} y1={200} x2={600} y2={200} className="stroke-muted-foreground/40" strokeWidth={1.6} strokeDasharray="5 4" />
        <line x1={80} y1={200} x2={340} y2={110} className="stroke-red-500/30" strokeWidth={1.4} strokeDasharray="3 4" />
        <line x1={340} y1={110} x2={600} y2={200} className="stroke-red-500/30" strokeWidth={1.4} strokeDasharray="3 4" />
        <line x1={80} y1={200} x2={340} y2={310} className="stroke-muted-foreground/20" strokeWidth={1.2} strokeDasharray="2 3" />
        <line x1={340} y1={310} x2={600} y2={200} className="stroke-muted-foreground/20" strokeWidth={1.2} strokeDasharray="2 3" />

        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} active={step.judge !== undefined ? n.id === "judge" : true} />
        ))}

        {step.alice && <Bubble x={80} y={282} text={step.alice} tone="amber" />}
        {step.bob && <Bubble x={600} y={282} text={step.bob} tone="emerald" />}
        {step.eve && <Bubble x={340} y={36} text={step.eve} tone="red" />}
        {step.judge && <Bubble x={340} y={360} text={step.judge} tone="slate" />}

        {packetPos && step.token && (
          <g>
            <rect
              x={packetPos.x - 22}
              y={packetPos.y - 12}
              width={44}
              height={24}
              rx={5}
              className={`${TOKEN_FILL[step.token]} stroke-background`}
              strokeWidth={2}
            />
            <text x={packetPos.x} y={packetPos.y + 4} textAnchor="middle" className="fill-background text-[9px] font-bold">
              {TOKEN_LABEL[step.token]}
            </text>
          </g>
        )}
      </svg>

      <div className="px-4 py-3 text-sm border-t border-border">
        <p className="text-muted-foreground">{step.text}</p>
        {step.outcome && <OutcomeRow outcome={step.outcome} />}
      </div>

      <Controls
        stepIdx={stepIdx}
        total={steps.length}
        playing={playing}
        onPrev={() => {
          setStepIdx((i) => Math.max(0, i - 1));
          setProgress(0);
        }}
        onNext={() => {
          setStepIdx((i) => Math.min(steps.length - 1, i + 1));
          setProgress(0);
        }}
        onPlay={() => setPlaying((p) => !p)}
        onReset={() => {
          setStepIdx(0);
          setProgress(0);
          setPlaying(false);
        }}
        onJump={(i) => {
          setStepIdx(i);
          setProgress(0);
        }}
        progress={progress}
      />

      {/* Sammenlikning */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-2 border-t border-border text-[11px]">
        <div className={`rounded p-2 ${mode === "hmac" ? "bg-emerald-500/10 ring-1 ring-emerald-500/40" : "bg-muted/20"}`}>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Hash className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            HMAC
          </div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>Krever delt hemmelighet k_AB</li>
            <li>Integritet: JA</li>
            <li>Autentisitet (peer-to-peer): JA</li>
            <li>Ikke-avvisning (mot 3.part): NEI</li>
            <li>Symmetrisk, raskt</li>
          </ul>
        </div>
        <div className={`rounded p-2 ${mode === "signature" ? "bg-violet-500/10 ring-1 ring-violet-500/40" : "bg-muted/20"}`}>
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <PenLine className="h-3 w-3 text-violet-600 dark:text-violet-400" />
            Digital signatur
          </div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>Ingen delt hemmelighet — kun (e_A, d_A)</li>
            <li>Integritet: JA</li>
            <li>Autentisitet: JA</li>
            <li>Ikke-avvisning: JA — dommer kan verifisere</li>
            <li>Asymmetrisk, tregere</li>
          </ul>
        </div>
      </div>

      {/* Eve-perspektiv */}
      <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border">
        <Eye className="h-3 w-3" />
        <span>Eve ser m i begge moduser (HMAC og signatur gir ikke konfidensialitet). Hun stoppes av at hun ikke kan produsere gyldig tag/sig uten henholdsvis k_AB eller d_A.</span>
        <EyeOff className="h-3 w-3 ml-auto" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-komponenter
// ----------------------------------------------------------------------

function NodeShape({ node, active = true }: { node: (typeof NODES)[number]; active?: boolean }) {
  const dim = active ? 1 : 0.35;
  if (node.id === "alice" || node.id === "bob") {
    const ring = node.id === "alice" ? "stroke-amber-500" : "stroke-emerald-500";
    const fill = node.id === "alice" ? "fill-amber-500/15" : "fill-emerald-500/15";
    const text =
      node.id === "alice" ? "fill-amber-700 dark:fill-amber-300" : "fill-emerald-700 dark:fill-emerald-300";
    return (
      <g opacity={dim}>
        <circle cx={node.x} cy={node.y} r={26} className={`${fill} ${ring}`} strokeWidth={2.5} />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className={`${text} text-[12px] font-bold`}>
          {node.label[0]}
        </text>
        <text x={node.x} y={node.y + 48} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {node.label}
        </text>
        <text x={node.x} y={node.y + 60} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {node.sublabel}
        </text>
      </g>
    );
  }
  if (node.id === "eve") {
    return (
      <g opacity={dim}>
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
        <text x={node.x} y={node.y - 42} textAnchor="middle" className="fill-red-600/80 dark:fill-red-400/80 text-[9px] font-medium">
          {node.sublabel}
        </text>
      </g>
    );
  }
  // Judge
  return (
    <g opacity={dim}>
      <rect x={node.x - 22} y={node.y - 18} width={44} height={36} rx={4} className="fill-slate-500/15 stroke-slate-500" strokeWidth={2.5} />
      <text x={node.x} y={node.y + 5} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-[12px] font-bold">
        §
      </text>
      <text x={node.x} y={node.y + 32} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        {node.label}
      </text>
      <text x={node.x} y={node.y + 44} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {node.sublabel}
      </text>
    </g>
  );
}

function Bubble({ x, y, text, tone }: { x: number; y: number; text: string; tone: "amber" | "emerald" | "red" | "slate" }) {
  const fillMap = {
    amber: "fill-amber-500/10 stroke-amber-500/50",
    emerald: "fill-emerald-500/10 stroke-emerald-500/50",
    red: "fill-red-500/10 stroke-red-500/50",
    slate: "fill-slate-500/10 stroke-slate-500/50",
  };
  const textMap = {
    amber: "fill-amber-700 dark:fill-amber-300",
    emerald: "fill-emerald-700 dark:fill-emerald-300",
    red: "fill-red-700 dark:fill-red-300",
    slate: "fill-slate-700 dark:fill-slate-200",
  };
  const width = Math.max(110, text.length * 5.6);
  return (
    <g>
      <rect x={x - width / 2} y={y - 14} width={width} height={20} rx={5} className={fillMap[tone]} strokeWidth={1} />
      <text x={x} y={y} textAnchor="middle" className={`${textMap[tone]} text-[10px] font-medium`}>
        {text}
      </text>
    </g>
  );
}
