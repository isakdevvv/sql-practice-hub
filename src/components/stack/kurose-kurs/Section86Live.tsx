import { useEffect, useMemo, useState } from "react";
import { Lock, Eye, EyeOff, Globe } from "lucide-react";
import { OutcomeRow, Controls } from "./Section82Live";

// Levende versjon av 8.6: TLS-handshake (TLS 1.2-stil for klarhet, med note
// om TLS 1.3 i sammendraget). Alice = klient, Bob = server, Eve = passiv
// avlytter mellom dem. For hvert steg viser vi:
//   * Hvilken pakke som flytter seg (ClientHello, ServerHello + cert, …)
//   * Hva Alice/Bob nå vet
//   * Hva Eve ser (sertifikat-metadata) vs. hva hun IKKE ser (app-data)

// ----------------------------------------------------------------------
// Topologi
// ----------------------------------------------------------------------

type NodeId = "alice" | "bob" | "eve";

const NODES = [
  { id: "alice" as NodeId, label: "Alice", sublabel: "TLS-klient", x: 80, y: 200 },
  { id: "bob" as NodeId, label: "Bob", sublabel: "TLS-server", x: 600, y: 200 },
  { id: "eve" as NodeId, label: "Eve", sublabel: "passiv avlytter", x: 340, y: 115 },
];

// ----------------------------------------------------------------------
// Skript — 7 handshake-steg + 1 app-data
// ----------------------------------------------------------------------

type Step = {
  title: string;
  text: string;
  from?: NodeId;
  to?: NodeId;
  pktLabel?: string;
  pktColor?: "hello" | "cert" | "key" | "finished" | "appdata";
  eveSees?: string;
  state?: { alice?: string; bob?: string };
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
};

const SCRIPT: Step[] = [
  {
    title: "1. ClientHello — Alice initierer",
    text: "Alice sender et ClientHello: TLS-versjon (1.2), tilfeldig nonce R_A (32 bytes), cipher-suiter hun støtter (f.eks. TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384), og SNI = «bob.example.com».",
    from: "alice",
    to: "bob",
    pktLabel: "ClientHello",
    pktColor: "hello",
    eveSees: "Versjon, nonce, ciphers, SNI (klartekst!)",
    state: { alice: "Sendt R_A", bob: "Mottar" },
    outcome: { kind: "info", text: "SNI er fortsatt klartekst i TLS 1.2 — Eve vet hvilken host du besøker, selv om innholdet senere skjules." },
  },
  {
    title: "2. ServerHello — Bob velger ciphersuite",
    text: "Bob svarer med ServerHello: valgt cipher-suite, sin egen nonce R_B, og session-ID. Han starter også å sende sertifikatkjeden.",
    from: "bob",
    to: "alice",
    pktLabel: "ServerHello",
    pktColor: "hello",
    eveSees: "Cipher-valg, R_B, session-id",
    state: { alice: "Har R_A, R_B", bob: "Sendt R_B" },
  },
  {
    title: "3. Certificate — Bob sender sertifikatkjede",
    text: "Bob sender X.509-sertifikatet sitt (med offentlig nøkkel e_B) + eventuelle mellomsertifikater opp til en root-CA. Alice vil verifisere kjeden mot sin lokale CA-store.",
    from: "bob",
    to: "alice",
    pktLabel: "Certificate",
    pktColor: "cert",
    eveSees: "HELE sertifikatet — navn, CN, SAN, public key, utsteder, gyldighet",
    state: { alice: "Verifiserer cert mot CA-store", bob: "Sendt cert" },
    outcome: {
      kind: "info",
      text: "Sertifikatets metadata er klartekst. Eve kan se hvem du snakker med, selv om hun ikke kan lese hva.",
    },
  },
  {
    title: "4. ServerKeyExchange — DH-parametre + signatur",
    text: "I ECDHE-suite sender Bob sin ephemeral ECDH-public Y_B og signerer den med d_B. Slik kan Alice bekrefte at Y_B faktisk kommer fra eieren av sertifikatet.",
    from: "bob",
    to: "alice",
    pktLabel: "ServerKeyExchange (Y_B + sig)",
    pktColor: "key",
    eveSees: "Y_B og signaturen — men signaturen krever d_A (server-private) for å forfalskes",
    state: { alice: "Verifiserer sig over Y_B", bob: "Sendt Y_B" },
  },
  {
    title: "5. ClientKeyExchange — Alice sender Y_A",
    text: "Alice genererer sin ephemeral ECDH-private x_A og sender Y_A = g^x_A. Nå kan begge beregne pre-master-secret PMS = Y_B^x_A = Y_A^x_B = g^(x_A x_B).",
    from: "alice",
    to: "bob",
    pktLabel: "ClientKeyExchange (Y_A)",
    pktColor: "key",
    eveSees: "Y_A — men kan ikke finne x_A (discrete log er hardt)",
    state: { alice: "Beregner PMS", bob: "Beregner PMS" },
    outcome: {
      kind: "ok",
      text: "Eve ser både Y_A og Y_B, men kan IKKE utlede PMS uten å løse ECDLP. Dette gir forward secrecy: selv om d_B lekker senere, kan ikke tidligere sesjoner dekrypteres.",
    },
  },
  {
    title: "6. Begge utleder master-secret + session-nøkler",
    text: "Master-secret = PRF(PMS, R_A, R_B). Fra denne hentes 4 nøkler: client-write-key, server-write-key, client-MAC-key, server-MAC-key.",
    state: { alice: "Har alle session-nøkler", bob: "Har alle session-nøkler" },
    eveSees: "Ingenting nytt — alt skjer lokalt",
  },
  {
    title: "7. ChangeCipherSpec + Finished — bekreft handshake",
    text: "Begge sender en Finished-melding som er kryptert under de nye nøklene og inneholder en MAC over hele handshake-historikken. Hvis MAC-en stemmer, vet hver part at den andre har samme nøkler — og at ingen har endret handshake-meldingene underveis.",
    from: "alice",
    to: "bob",
    pktLabel: "Finished (krypt.)",
    pktColor: "finished",
    eveSees: "Krypterte bytes — ingen synlig struktur lenger",
    state: { alice: "Handshake komplett", bob: "Handshake komplett" },
    outcome: {
      kind: "ok",
      text: "Vi har nå en autentisert, konfidensiell, integritets-beskyttet kanal. Alle senere bytes går gjennom AES-GCM under session-nøklene.",
    },
  },
  {
    title: "8. Application data — selve trafikken",
    text: "Alice kan nå sende «GET / HTTP/1.1». Pakken krypteres med client-write-key, MAC-es, og sendes. Bob svarer tilsvarende. Eve ser bare lengder, timing og IP-adresser.",
    from: "alice",
    to: "bob",
    pktLabel: "App data (AES-GCM)",
    pktColor: "appdata",
    eveSees: "Bare lengder + timing. Selve innholdet er base64-støy.",
    state: { alice: "Sender HTTP-request", bob: "Behandler" },
    outcome: {
      kind: "ok",
      text: "TLS 1.3 strammer dette opp: kun ett round-trip handshake, alle handshake-meldinger etter ServerHello er krypterte, og DH er obligatorisk. Men ideene er de samme.",
    },
  },
];

// ----------------------------------------------------------------------
// Farger
// ----------------------------------------------------------------------

const COLOR_FILL: Record<NonNullable<Step["pktColor"]>, string> = {
  hello: "fill-sky-500",
  cert: "fill-amber-500",
  key: "fill-violet-500",
  finished: "fill-emerald-500",
  appdata: "fill-emerald-600",
};

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section86Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = SCRIPT[stepIdx];

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
            if (i + 1 >= SCRIPT.length) {
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

  const packetPos = useMemo(() => {
    if (!step.from || !step.to) return null;
    const a = NODES.find((n) => n.id === step.from)!;
    const b = NODES.find((n) => n.id === step.to)!;
    const t = Math.min(Math.max(progress, 0), 0.999);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }, [step, progress]);

  // For hvert steg har Eve to forskjellige synspunkter avhengig av om
  // handshake er ferdig eller ikke
  const handshakeDone = stepIdx >= 7;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <Globe className="h-3.5 w-3.5 text-brand" />
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          TLS 1.2 (ECDHE-RSA-AES256-GCM-SHA384)
        </span>
      </div>

      <svg viewBox="0 0 680 300" className="w-full h-auto bg-muted/10">
        {/* Eve-segl: oransje "krypter-skjold" som tones inn etter step 7 */}
        <rect
          x={80}
          y={190}
          width={520}
          height={20}
          rx={4}
          className={
            handshakeDone
              ? "fill-emerald-500/20 stroke-emerald-500/60"
              : "fill-amber-500/10 stroke-amber-500/40"
          }
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <text
          x={340}
          y={215}
          textAnchor="middle"
          className={`${handshakeDone ? "fill-emerald-700 dark:fill-emerald-300" : "fill-amber-700 dark:fill-amber-300"} text-[9px] font-medium`}
        >
          {handshakeDone ? "Kryptert kanal (AES-GCM)" : "Klartekst-handshake — Eve ser meta"}
        </text>

        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {step.state?.alice && <Bubble x={80} y={282} text={step.state.alice} tone="amber" />}
        {step.state?.bob && <Bubble x={600} y={282} text={step.state.bob} tone="emerald" />}
        {step.eveSees && <Bubble x={340} y={38} text={`Eve: ${step.eveSees}`} tone="red" maxWidth={520} />}

        {packetPos && step.pktLabel && step.pktColor && (
          <g>
            <rect
              x={packetPos.x - 60}
              y={packetPos.y - 12}
              width={120}
              height={24}
              rx={5}
              className={`${COLOR_FILL[step.pktColor]} stroke-background`}
              strokeWidth={2}
            />
            <text x={packetPos.x} y={packetPos.y + 4} textAnchor="middle" className="fill-background text-[9px] font-bold">
              {step.pktLabel}
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
        total={SCRIPT.length}
        playing={playing}
        onPrev={() => {
          setStepIdx((i) => Math.max(0, i - 1));
          setProgress(0);
        }}
        onNext={() => {
          setStepIdx((i) => Math.min(SCRIPT.length - 1, i + 1));
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

      {/* Hva ser Eve? */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-2 border-t border-border text-[11px]">
        <div className="rounded p-2 bg-red-500/10 ring-1 ring-red-500/40">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-red-600 dark:text-red-400" />
            Eve ser
          </div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>SNI (hostname) — alltid klartekst i TLS 1.2</li>
            <li>Sertifikat-kjeden inkludert CN/SAN</li>
            <li>Cipher-valg, nonces, lengder</li>
            <li>IP, timing, pakke-mønstre</li>
          </ul>
        </div>
        <div className="rounded p-2 bg-emerald-500/10 ring-1 ring-emerald-500/40">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <EyeOff className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Eve ser IKKE
          </div>
          <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">
            <li>PMS / master-secret (utledes av ECDHE)</li>
            <li>Session-nøklene</li>
            <li>Innholdet i requests/responses</li>
            <li>HTTP-headers, cookies, body</li>
          </ul>
        </div>
      </div>

      {/* Bunn-legende */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="font-medium text-foreground">Pakker:</span>
        <Legend color="hello" label="Hello" />
        <Legend color="cert" label="Certificate" />
        <Legend color="key" label="KeyExchange" />
        <Legend color="finished" label="Finished" />
        <Legend color="appdata" label="App data" />
        <span className="ml-auto inline-flex items-center gap-1">
          <Lock className="h-3 w-3" /> TLS 1.3 krypterer alt fra og med Certificate.
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-komponenter
// ----------------------------------------------------------------------

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

function Bubble({
  x,
  y,
  text,
  tone,
  maxWidth = 280,
}: {
  x: number;
  y: number;
  text: string;
  tone: "amber" | "emerald" | "red";
  maxWidth?: number;
}) {
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
  const width = Math.min(maxWidth, Math.max(110, text.length * 5.4));
  return (
    <g>
      <rect x={x - width / 2} y={y - 14} width={width} height={20} rx={5} className={fillMap[tone]} strokeWidth={1} />
      <text x={x} y={y} textAnchor="middle" className={`${textMap[tone]} text-[10px] font-medium`}>
        {text}
      </text>
    </g>
  );
}

function Legend({ color, label }: { color: NonNullable<Step["pktColor"]>; label: string }) {
  const bgMap: Record<NonNullable<Step["pktColor"]>, string> = {
    hello: "bg-sky-500",
    cert: "bg-amber-500",
    key: "bg-violet-500",
    finished: "bg-emerald-500",
    appdata: "bg-emerald-600",
  };
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${bgMap[color]}`} />
      <span>{label}</span>
    </span>
  );
}
