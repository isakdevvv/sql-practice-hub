import { useEffect, useMemo, useState } from "react";
import { ShieldOff, Shield, RefreshCw } from "lucide-react";
import { OutcomeRow, Controls } from "./Section82Live";

// Levende versjon av 8.4: Endpoint-autentisering.
// Tre protokoller side om side, alle med Eve som passiv-så-aktiv angriper:
//   * "password"  — Alice sender hemmelig P. Eve sniffer og replay-er.
//   * "nonce"     — Bob sender en fersk R. Alice svarer med E_K(R). Eve kan
//                  ikke gjenbruke svaret fordi R aldri kommer igjen.
//   * "mutual"    — Begge utfordrer hverandre. Gjensidig autentisering.

type NodeId = "alice" | "bob" | "eve";

const NODES = [
  { id: "alice" as NodeId, label: "Alice", sublabel: "klient", x: 80, y: 200 },
  { id: "bob" as NodeId, label: "Bob", sublabel: "server", x: 600, y: 200 },
  { id: "eve" as NodeId, label: "Eve", sublabel: "lytter + replay", x: 340, y: 110 },
];

type Mode = "password" | "nonce" | "mutual";

type Token = "pw" | "nonce" | "resp" | "noncea" | "respa" | "replay" | "ok" | "fail";

type Step = {
  title: string;
  text: string;
  from?: NodeId;
  to?: NodeId;
  token?: Token;
  label?: string;
  alice?: string;
  bob?: string;
  eve?: string;
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
};

const SCRIPT: Record<Mode, Step[]> = {
  password: [
    {
      title: "1. Alice sender brukernavn + passord",
      text: "Klassisk autentisering: «jeg er Alice, passordet er solrik123». Sendes typisk over TCP.",
      from: "alice",
      to: "bob",
      token: "pw",
      label: "«Alice, solrik123»",
      alice: "Sender P",
      bob: "Venter",
      eve: "Lytter",
    },
    {
      title: "2. Eve sniffer passordet",
      text: "På åpen WiFi, kompromittert NAT, eller bare ved en ARP-spoof — Eve fanger pakken. Hun har nå P i klartekst.",
      from: "alice",
      to: "eve",
      token: "pw",
      eve: "Har P!",
      outcome: {
        kind: "bad",
        text: "Statisk passord over klartekst er katastrofalt. Selv over HTTPS er det sårbart hvis Bob ble lurt til å akseptere et falskt sertifikat.",
      },
    },
    {
      title: "3. Eve replayer — utgir seg for Alice",
      text: "Senere kobler Eve seg til Bob og sender (Alice, P). Bob har ingen måte å skille henne fra ekte Alice — passord er det eneste han ber om.",
      from: "eve",
      to: "bob",
      token: "replay",
      label: "«Alice, solrik123»",
      bob: "Tror det er Alice",
      eve: "Innsmugler",
      outcome: {
        kind: "bad",
        text: "Replay-angrep er trivielt mot statisk hemmelighet. Vi trenger noe som er FERSKT — en nonce.",
      },
    },
  ],
  nonce: [
    {
      title: "1. Alice annonserer hvem hun er",
      text: "«Hei Bob, det er Alice». Hun viser ennå ikke noe bevis. Bob må utfordre.",
      from: "alice",
      to: "bob",
      label: "«jeg er Alice»",
      alice: "Sender ID",
      bob: "Venter — vil utfordre",
      eve: "Lytter",
    },
    {
      title: "2. Bob velger en nonce R og sender",
      text: "R er et tilfeldig tall, brukes ÉN gang («Number used ONCE»). Helst 128 bits. Bob lagrer R lokalt og venter på svar.",
      from: "bob",
      to: "alice",
      token: "nonce",
      label: "R = 0x9c4b…",
      bob: "Sender R",
      alice: "Mottar R",
      eve: "Ser R",
    },
    {
      title: "3. Alice beregner svar = MAC_K(R) (eller signatur)",
      text: "Alice bruker en delt nøkkel K (eller signerer R med sin private). Bare hun kan lage gyldig svar — fordi bare hun har K eller d_A.",
      alice: "Beregner MAC_K(R)",
    },
    {
      title: "4. Alice sender svaret",
      text: "Svaret kobler Alice (som har K) til den SPESIFIKKE nonce R. Det er bundet i tid.",
      from: "alice",
      to: "bob",
      token: "resp",
      label: "MAC_K(R)",
      bob: "Verifiserer",
      eve: "Ser MAC_K(R) — men for DENNE R",
    },
    {
      title: "5. Bob verifiserer og aksepterer",
      text: "Bob beregner MAC_K(R) selv og sammenligner. Stemmer → Alice er ekte. Han forkaster R (den brukes aldri igjen).",
      bob: "OK — Alice autentisert",
      outcome: {
        kind: "ok",
        text: "Forbindelsen er åpnet.",
      },
    },
    {
      title: "6. Eve forsøker replay senere",
      text: "Eve kobler seg til Bob og sender det gamle svaret MAC_K(R). Men Bob velger en NY nonce R' denne gangen. Det gamle svaret passer ikke R'.",
      from: "eve",
      to: "bob",
      token: "replay",
      label: "(gammelt MAC_K(R) til ny R')",
      bob: "Forkaster — feil R",
      eve: "Stoppet",
      outcome: {
        kind: "ok",
        text: "Nonce-basert challenge-response slår replay. Eve må kunne BEREGNE MAC_K(R') i sanntid — men har ikke K.",
      },
    },
  ],
  mutual: [
    {
      title: "1. Alice sender ID + sin egen nonce R_A",
      text: "I gjensidig autentisering vil BEGGE parter ha bevis. Alice starter med å sende både ID og en utfordring til Bob.",
      from: "alice",
      to: "bob",
      token: "noncea",
      label: "«Alice, R_A»",
      alice: "Genererer R_A",
      bob: "Mottar",
    },
    {
      title: "2. Bob svarer med MAC_K(R_A) + sin egen nonce R_B",
      text: "Bob beviser at HAN kjenner K ved å signere Alices R_A, og kaster samtidig en utfordring tilbake.",
      from: "bob",
      to: "alice",
      token: "resp",
      label: "MAC_K(R_A), R_B",
      bob: "Sender bevis + R_B",
      alice: "Verifiserer Bob",
    },
    {
      title: "3. Alice verifiserer Bob — han er ekte",
      text: "MAC_K(R_A) stemmer → Bob har K. Nå vet Alice at hun snakker med ekte Bob, ikke en falsk server.",
      alice: "Bob OK",
      outcome: { kind: "info", text: "Halve protokollen er ferdig. Bob mangler fortsatt bevis på at Alice er Alice." },
    },
    {
      title: "4. Alice svarer på Bobs utfordring",
      text: "Alice beregner MAC_K(R_B) og sender. Nå har begge fått ferskt bevis fra den andre.",
      from: "alice",
      to: "bob",
      token: "respa",
      label: "MAC_K(R_B)",
      bob: "Verifiserer Alice",
      eve: "Ser begge utfordringer, ingen K",
      outcome: {
        kind: "ok",
        text: "Gjensidig autentisering ferdig. Brukes i TLS-handshake (kapittel 8.6), WPA-EAP og IPsec IKE.",
      },
    },
    {
      title: "5. Eve kan verken replay eller man-in-the-middle",
      text: "Hver session har ferske R_A og R_B. Selv om Eve fanger alle pakker, kan hun ikke gjenbruke dem mot en ny session — verdiene er ulike. Og uten K kan hun ikke beregne nye MAC-er.",
      eve: "Stoppet av friske nonces + K",
      outcome: {
        kind: "ok",
        text: "Dette er kjernen i moderne autentisering. TLS 1.3 og WireGuard bygger på samme prinsipp med Diffie-Hellman på toppen for forward secrecy.",
      },
    },
  ],
};

// ----------------------------------------------------------------------
// Farger
// ----------------------------------------------------------------------

const TOKEN_FILL: Record<Token, string> = {
  pw: "fill-amber-500",
  nonce: "fill-sky-500",
  resp: "fill-emerald-500",
  noncea: "fill-amber-400",
  respa: "fill-emerald-400",
  replay: "fill-red-500",
  ok: "fill-emerald-600",
  fail: "fill-red-600",
};

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section84Live() {
  const [mode, setMode] = useState<Mode>("password");
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

  const modeMeta: Record<Mode, { label: string; icon: typeof Shield; activeClass: string }> = {
    password: {
      label: "Statisk passord",
      icon: ShieldOff,
      activeClass: "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300",
    },
    nonce: {
      label: "Nonce challenge",
      icon: Shield,
      activeClass: "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    },
    mutual: {
      label: "Gjensidig",
      icon: RefreshCw,
      activeClass:
        "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {(Object.keys(modeMeta) as Mode[]).map((m) => {
            const meta = modeMeta[m];
            const Icon = meta.icon;
            const isActive = mode === m;
            const colorClasses = isActive
              ? meta.activeClass
              : "border-border bg-background text-muted-foreground hover:border-brand/40";
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${colorClasses}`}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <svg viewBox="0 0 680 290" className="w-full h-auto bg-muted/10">
        <line x1={80} y1={200} x2={600} y2={200} className="stroke-muted-foreground/40" strokeWidth={1.6} strokeDasharray="5 4" />
        <line x1={80} y1={200} x2={340} y2={110} className="stroke-red-500/30" strokeWidth={1.4} strokeDasharray="3 4" />
        <line x1={340} y1={110} x2={600} y2={200} className="stroke-red-500/30" strokeWidth={1.4} strokeDasharray="3 4" />

        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {step.alice && <Bubble x={80} y={282} text={step.alice} tone="amber" />}
        {step.bob && <Bubble x={600} y={282} text={step.bob} tone="emerald" />}
        {step.eve && <Bubble x={340} y={36} text={step.eve} tone="red" />}

        {packetPos && step.token && (
          <g>
            <rect
              x={packetPos.x - 50}
              y={packetPos.y - 12}
              width={100}
              height={24}
              rx={5}
              className={`${TOKEN_FILL[step.token]} stroke-background`}
              strokeWidth={2}
            />
            <text x={packetPos.x} y={packetPos.y + 4} textAnchor="middle" className="fill-background text-[9px] font-bold">
              {step.label ?? step.token}
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

      {/* Protokoll-egenskaper */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-3 border-t border-border text-[11px]">
        <Card title="Statisk passord" active={mode === "password"} color="red">
          <li>Sårbar mot sniffing</li>
          <li>Sårbar mot replay</li>
          <li>Ingen friskhet</li>
          <li>Ingen autentisering av server</li>
        </Card>
        <Card title="Nonce challenge" active={mode === "nonce"} color="sky">
          <li>Replay slått av fersk R</li>
          <li>Krever delt K eller PKI</li>
          <li>Server autentiserer klient</li>
          <li>Klient stoler blindt på server</li>
        </Card>
        <Card title="Gjensidig" active={mode === "mutual"} color="emerald">
          <li>Begge utfordrer</li>
          <li>Beskyttet mot MITM</li>
          <li>Brukes i TLS, IKE, EAP</li>
          <li>Trinn til DH for forward secrecy</li>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  active,
  color,
  children,
}: {
  title: string;
  active: boolean;
  color: "red" | "sky" | "emerald";
  children: React.ReactNode;
}) {
  const ringMap = {
    red: "bg-red-500/10 ring-1 ring-red-500/40",
    sky: "bg-sky-500/10 ring-1 ring-sky-500/40",
    emerald: "bg-emerald-500/10 ring-1 ring-emerald-500/40",
  };
  return (
    <div className={`rounded p-2 ${active ? ringMap[color] : "bg-muted/20"}`}>
      <div className="font-semibold text-foreground">{title}</div>
      <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">{children}</ul>
    </div>
  );
}

function NodeShape({ node }: { node: (typeof NODES)[number] }) {
  if (node.id === "alice" || node.id === "bob") {
    const ring = node.id === "alice" ? "stroke-amber-500" : "stroke-emerald-500";
    const fill = node.id === "alice" ? "fill-amber-500/15" : "fill-emerald-500/15";
    const text =
      node.id === "alice" ? "fill-amber-700 dark:fill-amber-300" : "fill-emerald-700 dark:fill-emerald-300";
    return (
      <g>
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
      <text x={node.x} y={node.y - 42} textAnchor="middle" className="fill-red-600/80 dark:fill-red-400/80 text-[9px] font-medium">
        {node.sublabel}
      </text>
    </g>
  );
}

function Bubble({ x, y, text, tone }: { x: number; y: number; text: string; tone: "amber" | "emerald" | "red" }) {
  const fillMap = {
    amber: "fill-amber-500/10 stroke-amber-500/50",
    emerald: "fill-emerald-500/10 stroke-emerald-500/50",
    red: "fill-red-500/10 stroke-red-500/50",
  };
  const textMap = {
    amber: "fill-amber-700 dark:fill-amber-300",
    emerald: "fill-emerald-700 dark:fill-emerald-300",
    red: "fill-red-700 dark:fill-red-300",
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
