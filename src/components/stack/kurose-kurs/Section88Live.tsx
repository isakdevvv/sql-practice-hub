import { useEffect, useMemo, useState } from "react";
import { Wifi, ShieldOff, Shield, ShieldCheck } from "lucide-react";
import { OutcomeRow, Controls } from "./Section82Live";

// Levende versjon av 8.8: WiFi-sikkerhet — WEP, WPA2, WPA3.
// Tre moduser med ulik handshake-sekvens.
// WEP   — kort, knust. Vi viser hvorfor.
// WPA2  — 4-way handshake (EAPOL). Vi viser at det fungerer men sårbarheter
//          finnes (KRACK, dictionary mot PSK).
// WPA3  — SAE (Dragonfly). Vi viser hvorfor passordet aldri sendes.

// ----------------------------------------------------------------------
// Topologi
// ----------------------------------------------------------------------

type NodeId = "client" | "ap" | "eve";

const NODES = [
  { id: "client" as NodeId, label: "Alice", sublabel: "klient (STA)", x: 80, y: 210 },
  { id: "ap" as NodeId, label: "AP", sublabel: "Access Point", x: 600, y: 210 },
  { id: "eve" as NodeId, label: "Eve", sublabel: "sniffer + cracker", x: 340, y: 115 },
];

// ----------------------------------------------------------------------
// Skript
// ----------------------------------------------------------------------

type Mode = "wep" | "wpa2" | "wpa3";

type Step = {
  title: string;
  text: string;
  from?: NodeId;
  to?: NodeId;
  label?: string;
  tone?: "good" | "bad" | "neutral";
  client?: string;
  ap?: string;
  eve?: string;
  outcome?: { kind: "ok" | "bad" | "info"; text: string };
};

const SCRIPT: Record<Mode, Step[]> = {
  wep: [
    {
      title: "1. AP og klient deler én statisk WEP-nøkkel K (40 eller 104 bits)",
      text:
        "WEP («Wired Equivalent Privacy») bruker RC4 stream-cipher med en delt nøkkel. Hver pakke får en 24-bit Initialization Vector (IV) som prepended kjøres til K → keystream.",
      client: "Har K",
      ap: "Har K",
      eve: "Lytter passivt",
      outcome: {
        kind: "info",
        text: "Bare 24 bits IV: gjentas etter ca 5000 pakker (bursdagsparadokset) eller 16M pakker (lineært).",
      },
    },
    {
      title: "2. Klient sender pakke kryptert med RC4(IV ‖ K)",
      text:
        "C = P ⊕ RC4(IV ‖ K), og IV sendes i klartekst foran. Det er hele beskyttelsen.",
      from: "client",
      to: "ap",
      label: "IV ‖ C",
      tone: "bad",
    },
    {
      title: "3. Eve fanger nok pakker — IV gjentas",
      text:
        "Med 24-bit IV gjentas verdier raskt. Når to pakker har samme IV: C1 ⊕ C2 = P1 ⊕ P2 → keystream avsløres delvis. Etter ca 50 000 pakker (få minutter på travelt nett) er Eve ferdig.",
      eve: "Crack ferdig — har K på ~5 min",
      outcome: {
        kind: "bad",
        text: "WEP er totalknust. Aircrack-ng kan finne K på minutter. WEP ble deprekert i 2004; ikke bruk under noen omstendighet.",
      },
    },
    {
      title: "4. Eve kan nå lese ALLE pakker, fortid og fremtid",
      text:
        "Statisk nøkkel + svak IV-rotasjon = ingen forward secrecy. Eve kan dekryptere historikk hun har lagret, og alt nytt som sendes.",
      eve: "Leser alt klientene gjør",
      outcome: {
        kind: "bad",
        text: "Lærdom: en stream cipher uten unik nonce-per-pakke OG uten meldings-autentisering er en katastrofe.",
      },
    },
  ],
  wpa2: [
    {
      title: "1. Pre-shared key (PSK) — fra WiFi-passord",
      text:
        "PSK = PBKDF2(passord, SSID, 4096 iter, 256 bits). Begge sider deriverer samme PSK fra passordet. Selve passordet sendes aldri.",
      client: "Har PSK",
      ap: "Har PSK",
      eve: "Vet SSID, gjetter passord",
    },
    {
      title: "2. Msg 1: AP → klient sender ANonce",
      text:
        "AP genererer en fersk ANonce (Authenticator-nonce) og sender den uten kryptering. Eve ser denne — det er greit.",
      from: "ap",
      to: "client",
      label: "ANonce",
      tone: "neutral",
      eve: "Ser ANonce",
    },
    {
      title: "3. Msg 2: klient → AP sender SNonce + MIC",
      text:
        "Klient lager SNonce og beregner PTK = PRF(PSK, ANonce, SNonce, MAC_A, MAC_AP). Hun sender SNonce + en MIC (Message Integrity Code) over PTK.",
      from: "client",
      to: "ap",
      label: "SNonce + MIC",
      tone: "good",
      client: "Har PTK",
      eve: "Ser SNonce + MIC — kan starte offline crack",
    },
    {
      title: "4. Msg 3: AP → klient bekreftelse + GTK",
      text:
        "AP beregner samme PTK selv (den har PSK, ANonce, SNonce, begge MAC-er). Sender en MIC tilbake + en kryptert Group Temporal Key (GTK) for broadcast.",
      from: "ap",
      to: "client",
      label: "GTK + MIC",
      tone: "good",
      ap: "Har PTK",
    },
    {
      title: "5. Msg 4: klient → AP ACK",
      text:
        "Klient bekrefter at GTK er mottatt. Nå er PTK aktiv og all videre trafikk krypteres med AES-CCMP (eller AES-GCMP) under PTK.",
      from: "client",
      to: "ap",
      label: "ACK",
      tone: "good",
      outcome: {
        kind: "info",
        text: "4-way handshake gir frisk per-session PTK og verifiserer at begge sider har PSK. Men: PSK selv er kun så sterk som passordet.",
      },
    },
    {
      title: "6. Eve angriper — offline dictionary",
      text:
        "Eve har sniffet ANonce, SNonce, MAC-ene og MIC-en fra steg 3. Hun kan nå brute-force passordet OFFLINE: for hver kandidat → beregn PSK → beregn PTK → sjekk MIC. Ingen rate-limit, ingen lockout.",
      eve: "Tester 100k passord/s på GPU",
      outcome: {
        kind: "bad",
        text: "Svake passord faller på minutter. KRACK-angrepet (2017) viste også at nonce-gjenbruk under retransmission åpner for klartekst-lekkasje. WPA3 fikser begge.",
      },
    },
  ],
  wpa3: [
    {
      title: "1. SAE-handshake (Dragonfly) — utveksling av commit",
      text:
        "WPA3 erstatter 4-way med SAE. Klient og AP velger hver sin private skalar + element (på en elliptisk kurve), og sender 'commit' = scalar + element til den andre. Passordet brukes til å derivere en kurve-base, ikke sendt direkte.",
      from: "client",
      to: "ap",
      label: "Commit (scalar_A, element_A)",
      tone: "good",
      client: "Velger random a",
      ap: "Velger random b",
      eve: "Ser commits — men kan ikke utlede passordet",
    },
    {
      title: "2. AP returnerer sin commit",
      text:
        "AP svarer med sin (scalar_B, element_B). Begge har nå nok til å beregne en delt nøkkel via en Diffie-Hellman-lignende operasjon — men hvor diskret-log-problemet er KOBLET til riktig passord.",
      from: "ap",
      to: "client",
      label: "Commit (scalar_B, element_B)",
      tone: "good",
    },
    {
      title: "3. Begge utleder felles PMK",
      text:
        "PMK = utledet fra (a, b, element_B, element_A, password-derived-point). Hvis passordet er feil hos klient: hun får en annen PMK enn AP — handshake feiler i bekreftelses-fasen.",
      client: "Har PMK_a",
      ap: "Har PMK_b",
      outcome: {
        kind: "info",
        text: "Crucial: hvert SAE-forsøk gir Eve PRESIS ÉN gjetning. Hun kan ikke offline-prøve milliarder mot fanget trafikk — fordi hver gjetning krever en ny SAE-runde mot AP, som rate-limites.",
      },
    },
    {
      title: "4. Confirm-utveksling",
      text:
        "Begge sender en KCK-MIC over commit-meldingene. Hvis MIC-ene stemmer på begge sider → PMK er bekreftet. Hvis ikke → forbindelsen avbrytes.",
      from: "client",
      to: "ap",
      label: "Confirm (MIC)",
      tone: "good",
    },
    {
      title: "5. Forward secrecy + ingen offline crack",
      text:
        "Selv om Eve senere får tak i passordet, kan hun ikke dekryptere tidligere sesjoner — de ephemerale a, b er borte. Og hun kan ikke crack-e passordet offline fra sniffet trafikk.",
      eve: "Stoppet — må online-gjette",
      outcome: {
        kind: "ok",
        text: "WPA3 + SAE gir det WEP og WPA2 manglet: motstand mot offline-ordbok-angrep, forward secrecy, beskyttelse selv ved svakt passord (i praksis).",
      },
    },
  ],
};

// ----------------------------------------------------------------------
// Komponent
// ----------------------------------------------------------------------

export function Section88Live() {
  const [mode, setMode] = useState<Mode>("wep");
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
    wep: {
      label: "WEP (knust)",
      icon: ShieldOff,
      activeClass: "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300",
    },
    wpa2: {
      label: "WPA2 (4-way)",
      icon: Shield,
      activeClass: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    wpa3: {
      label: "WPA3 (SAE)",
      icon: ShieldCheck,
      activeClass: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center flex-wrap gap-3">
        <Wifi className="h-3.5 w-3.5 text-brand" />
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {(Object.keys(modeMeta) as Mode[]).map((m) => {
            const meta = modeMeta[m];
            const Icon = meta.icon;
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition ${
                  isActive ? meta.activeClass : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <svg viewBox="0 0 680 300" className="w-full h-auto bg-muted/10">
        {/* RF-buer mellom klient og AP for å antyde radio */}
        <RadioArc x1={80} y1={210} x2={600} y2={210} />

        {/* Eve-linjer */}
        <line x1={80} y1={210} x2={340} y2={115} className="stroke-red-500/30" strokeWidth={1.3} strokeDasharray="3 4" />
        <line x1={340} y1={115} x2={600} y2={210} className="stroke-red-500/30" strokeWidth={1.3} strokeDasharray="3 4" />

        {NODES.map((n) => (
          <NodeShape key={n.id} node={n} />
        ))}

        {step.client && <Bubble x={80} y={290} text={step.client} tone="amber" />}
        {step.ap && <Bubble x={600} y={290} text={step.ap} tone="sky" />}
        {step.eve && <Bubble x={340} y={42} text={step.eve} tone="red" />}

        {packetPos && step.label && (
          <g>
            <rect
              x={packetPos.x - 60}
              y={packetPos.y - 12}
              width={120}
              height={24}
              rx={5}
              className={`${
                step.tone === "good"
                  ? "fill-emerald-500"
                  : step.tone === "bad"
                    ? "fill-red-500"
                    : "fill-sky-500"
              } stroke-background`}
              strokeWidth={2}
            />
            <text x={packetPos.x} y={packetPos.y + 4} textAnchor="middle" className="fill-background text-[9px] font-bold">
              {step.label}
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

      {/* Sammenligning */}
      <div className="px-4 py-3 grid gap-2 sm:grid-cols-3 border-t border-border text-[11px]">
        <Card title="WEP" active={mode === "wep"} color="red" subtitle="1997, deprekert 2004">
          <li>RC4 + 24-bit IV (gjenbrukes)</li>
          <li>Statisk nøkkel</li>
          <li>Ingen meldings-autentisering</li>
          <li>Knekkes på minutter</li>
          <li>Ingen forward secrecy</li>
        </Card>
        <Card title="WPA2" active={mode === "wpa2"} color="amber" subtitle="2004, fortsatt vanlig">
          <li>AES-CCMP + 4-way handshake</li>
          <li>Frisk PTK per session</li>
          <li>Sårbart mot offline-dict (PSK)</li>
          <li>KRACK-angrep (2017) på nonce-reuse</li>
          <li>Enterprise-variant bruker EAP/802.1X</li>
        </Card>
        <Card title="WPA3" active={mode === "wpa3"} color="emerald" subtitle="2018, anbefalt">
          <li>SAE/Dragonfly handshake</li>
          <li>Hver gjetning krever ny online-runde</li>
          <li>Forward secrecy (ephemeral a, b)</li>
          <li>192-bit mode for enterprise</li>
          <li>Beskyttede management-frames</li>
        </Card>
      </div>

      {/* Sammenligning av angriper-evne */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[11px] font-medium text-foreground mb-2">Hva kan Eve gjøre?</div>
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4 text-[10px]">
          <AttackCell label="Passivt avlytte" wep="JA" wpa2="NEI" wpa3="NEI" />
          <AttackCell label="Crack-e nøkkel offline" wep="JA (min)" wpa2="JA (svakt pwd)" wpa3="NEI" />
          <AttackCell label="Replay-angrep" wep="JA" wpa2="DELVIS (KRACK)" wpa3="NEI" />
          <AttackCell label="Dekryptere historikk" wep="JA" wpa2="JA hvis pwd kjent" wpa3="NEI (FS)" />
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-komponenter
// ----------------------------------------------------------------------

function RadioArc({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  return (
    <g opacity={0.4}>
      {[10, 25, 40].map((r, i) => (
        <circle key={i} cx={mid.x} cy={mid.y} r={r * 5} className="fill-none stroke-sky-500/30" strokeWidth={1} strokeDasharray="3 4" />
      ))}
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-sky-500/40" strokeWidth={1.6} strokeDasharray="6 4" />
    </g>
  );
}

function Card({
  title,
  subtitle,
  active,
  color,
  children,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  color: "red" | "amber" | "emerald";
  children: React.ReactNode;
}) {
  const ringMap = {
    red: "bg-red-500/10 ring-1 ring-red-500/40",
    amber: "bg-amber-500/10 ring-1 ring-amber-500/40",
    emerald: "bg-emerald-500/10 ring-1 ring-emerald-500/40",
  };
  return (
    <div className={`rounded p-2 ${active ? ringMap[color] : "bg-muted/20"}`}>
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-muted-foreground text-[9px] italic">{subtitle}</div>
      <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc pl-4">{children}</ul>
    </div>
  );
}

function AttackCell({ label, wep, wpa2, wpa3 }: { label: string; wep: string; wpa2: string; wpa3: string }) {
  const toneOf = (s: string) =>
    s === "NEI" || s.startsWith("NEI")
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : s.startsWith("DELVIS")
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "bg-red-500/10 text-red-700 dark:text-red-300";
  return (
    <div className="rounded p-2 bg-muted/20">
      <div className="font-medium text-foreground">{label}</div>
      <div className="mt-1 grid grid-cols-3 gap-0.5 text-center font-mono">
        <span className={`rounded px-1 ${toneOf(wep)}`}>WEP: {wep}</span>
        <span className={`rounded px-1 ${toneOf(wpa2)}`}>WPA2: {wpa2}</span>
        <span className={`rounded px-1 ${toneOf(wpa3)}`}>WPA3: {wpa3}</span>
      </div>
    </div>
  );
}

function NodeShape({ node }: { node: (typeof NODES)[number] }) {
  if (node.id === "client") {
    return (
      <g>
        <circle cx={node.x} cy={node.y} r={22} className="fill-amber-500/15 stroke-amber-500" strokeWidth={2.5} />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 text-[11px] font-bold">
          A
        </text>
        <text x={node.x} y={node.y + 42} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
          {node.label}
        </text>
        <text x={node.x} y={node.y + 54} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {node.sublabel}
        </text>
      </g>
    );
  }
  if (node.id === "ap") {
    return (
      <g>
        <rect x={node.x - 22} y={node.y - 18} width={44} height={36} rx={4} className="fill-sky-500/15 stroke-sky-500" strokeWidth={2.5} />
        <text x={node.x} y={node.y + 5} textAnchor="middle" className="fill-sky-700 dark:fill-sky-300 text-[11px] font-bold">
          AP
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
  // Eve
  return (
    <g>
      <polygon
        points={`${node.x},${node.y - 22} ${node.x + 22},${node.y + 14} ${node.x - 22},${node.y + 14}`}
        className="fill-red-500/15 stroke-red-500"
        strokeWidth={2.5}
      />
      <text x={node.x} y={node.y + 6} textAnchor="middle" className="fill-red-700 dark:fill-red-300 text-[11px] font-bold">
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

function Bubble({ x, y, text, tone }: { x: number; y: number; text: string; tone: "amber" | "sky" | "red" }) {
  const fillMap = {
    amber: "fill-amber-500/10 stroke-amber-500/50",
    sky: "fill-sky-500/10 stroke-sky-500/50",
    red: "fill-red-500/10 stroke-red-500/50",
  };
  const textMap = {
    amber: "fill-amber-700 dark:fill-amber-300",
    sky: "fill-sky-700 dark:fill-sky-300",
    red: "fill-red-700 dark:fill-red-300",
  };
  const width = Math.max(120, text.length * 5.6);
  return (
    <g>
      <rect x={x - width / 2} y={y - 14} width={width} height={20} rx={5} className={fillMap[tone]} strokeWidth={1} />
      <text x={x} y={y} textAnchor="middle" className={`${textMap[tone]} text-[10px] font-medium`}>
        {text}
      </text>
    </g>
  );
}
