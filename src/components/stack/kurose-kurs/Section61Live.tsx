import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Levende versjon av seksjon 6.1: Hvordan en Ethernet-ramme (frame) bygges
// felt for felt på avsender-side, sendes som bits over et delt link-medium,
// og deretter dekodes og verifiseres på mottaker-side.
//
// Designet er original — vi bygger sekvensielt fra venstre (payload) og
// pakker på preamble, MAC-adresser, type-felt og FCS. Etter sending speiler
// vi mottakerens dekoding: sjekk preamble, sjekk dst-MAC, sjekk FCS, lever
// payload videre opp i stakken.

type FieldId =
  | "payload"
  | "type"
  | "src"
  | "dst"
  | "preamble"
  | "fcs";

type Field = {
  id: FieldId;
  /** Vist navn på feltet. */
  label: string;
  /** Bytes — ikke skalert direkte (vi tegner bredder relativt). */
  bytes: number;
  /** Konkret eksempel-verdi. */
  value: string;
  /** Tooltip / forklaring. */
  description: string;
  /** Tailwind-fyll-klasse for SVG. */
  fill: string;
  /** Tailwind-stroke-klasse for SVG. */
  stroke: string;
  /** Bakgrunn for chip i legend. */
  chip: string;
};

// Rekkefølge på kabelen = preamble, dst, src, type, payload, fcs.
const FIELDS: Field[] = [
  {
    id: "preamble",
    label: "Preamble + SFD",
    bytes: 8,
    value: "10101010…AB",
    description:
      "8 bytes med fast bitmønster (skiftende 1-0-1-0) etterfulgt av SFD (10101011). " +
      "Lar mottakerens NIC synkronisere klokka og finne grensen til selve rammen.",
    fill: "fill-slate-400",
    stroke: "stroke-slate-500",
    chip: "bg-slate-400",
  },
  {
    id: "dst",
    label: "Dst MAC",
    bytes: 6,
    value: "BB:02:CC:11:22:33",
    description:
      "Hvem skal motta rammen på dette lokalnettet. NIC-en filtrerer i hardware: " +
      "matcher ikke MAC-en min eller broadcast/multicast, så kastes rammen før OS-et ser den.",
    fill: "fill-purple-500",
    stroke: "stroke-purple-500",
    chip: "bg-purple-500",
  },
  {
    id: "src",
    label: "Src MAC",
    bytes: 6,
    value: "AA:01:DE:AD:BE:EF",
    description:
      "Hvem sender. Brukes blant annet av switcher til å lære hvilken port " +
      "en gitt MAC sitter på (self-learning).",
    fill: "fill-purple-400",
    stroke: "stroke-purple-500",
    chip: "bg-purple-400",
  },
  {
    id: "type",
    label: "Type",
    bytes: 2,
    value: "0x0800 (IPv4)",
    description:
      "Identifiserer hvilken protokoll som ligger i payload. 0x0800 = IPv4, " +
      "0x86DD = IPv6, 0x0806 = ARP. Slik vet linklaget hvilket lag det skal levere oppover til.",
    fill: "fill-amber-500",
    stroke: "stroke-amber-500",
    chip: "bg-amber-500",
  },
  {
    id: "payload",
    label: "Payload (IP-datagram)",
    bytes: 1500,
    value: "IP-header + TCP/UDP + appdata",
    description:
      "Selve nyttelasten — opptil 1500 bytes på standard Ethernet (MTU). For oss " +
      "er dette IP-datagrammet linklaget fikk fra nettverkslaget. Linklaget kikker IKKE oppi det.",
    fill: "fill-brand",
    stroke: "stroke-brand",
    chip: "bg-brand",
  },
  {
    id: "fcs",
    label: "FCS (CRC-32)",
    bytes: 4,
    value: "0xA13F92CC",
    description:
      "Frame Check Sequence — 4 bytes med CRC-32 over alle de andre feltene. " +
      "Mottaker regner ut CRC-32 selv og sammenligner. Stemmer ikke = ramme dumpes stille.",
    fill: "fill-success",
    stroke: "stroke-success",
    chip: "bg-success",
  },
];

type Phase = "build" | "wire" | "decode";

type Step = {
  title: string;
  description: string;
  phase: Phase;
  /** Hvilke felter som er synlige akkurat nå (på senderens side eller mottakerens side). */
  visible: FieldId[];
  /** Felt som akkurat nå legges på (build) eller skrelles av (decode) — vises med animasjon. */
  focus?: FieldId;
  /** Tekst som vises i “status-strip” over selve rammen. */
  status: string;
};

const STEPS: Step[] = [
  {
    title: "1. IP-datagrammet kommer ned fra nettverkslaget",
    description:
      "Nettverkslaget leverer ferdig IP-datagram til linklaget — opp til 1500 bytes med IP-header, TCP/UDP og app-data inni. Linklaget bryr seg ikke om innholdet, det er bare en blob av bytes som skal pakkes inn.",
    phase: "build",
    visible: ["payload"],
    focus: "payload",
    status: "Payload mottatt. Skal pakkes inn i Ethernet-ramme.",
  },
  {
    title: "2. Linklaget legger på Type-feltet",
    description:
      "For at mottakeren skal vite at payload er et IPv4-datagram, settes Type = 0x0800 rett foran. Dette er to bytes. Hadde det vært IPv6, hadde vi satt 0x86DD; ARP er 0x0806.",
    phase: "build",
    visible: ["type", "payload"],
    focus: "type",
    status: "Type-felt på plass — mottakeren vet det er IPv4 oppover.",
  },
  {
    title: "3. Src MAC settes på",
    description:
      "Senderens egen MAC-adresse (avlest fra NIC-en) settes inn som «source». 6 bytes. Switcher mellom oss og mottakeren bruker dette feltet til å lære hvilken port vår MAC sitter på.",
    phase: "build",
    visible: ["src", "type", "payload"],
    focus: "src",
    status: "Src MAC satt. Nå mangler dst og preamble + FCS.",
  },
  {
    title: "4. Dst MAC settes på",
    description:
      "Hvor på lokalnettet skal rammen? Hvis vi snakker direkte med en host på samme link, brukes hostens MAC. Skal pakken videre via ruter, settes ruterens MAC her — selv om endelig IP er på et helt annet kontinent.",
    phase: "build",
    visible: ["dst", "src", "type", "payload"],
    focus: "dst",
    status: "Dst MAC satt. Rammen vet hvor den skal på lokalnettet.",
  },
  {
    title: "5. NIC legger på Preamble og SFD",
    description:
      "Helt foran rammen settes 7 bytes med skiftende 1-0-1-0-mønster, etterfulgt av 1 byte SFD (10101011). Dette gjør at mottakerens NIC kan synkronisere klokka si og finne ut nøyaktig hvor selve rammen starter.",
    phase: "build",
    visible: ["preamble", "dst", "src", "type", "payload"],
    focus: "preamble",
    status: "Preamble + SFD foran rammen — klokke-sync er gratis.",
  },
  {
    title: "6. NIC beregner FCS (CRC-32) og henger den bakerst",
    description:
      "Til slutt regner NIC-en CRC-32 over dst+src+type+payload og legger resultatet inn som FCS. Hvis så mye som én bit endrer seg under transport, vil mottakerens CRC-utregning ikke stemme — og rammen dumpes stille.",
    phase: "build",
    visible: ["preamble", "dst", "src", "type", "payload", "fcs"],
    focus: "fcs",
    status: "FCS påført. Rammen er klar til å gå ut på kabelen.",
  },
  {
    title: "7. Bits sendes ut på det fysiske mediet",
    description:
      "NIC-en serialiserer rammen — én bit av gangen — som spennings-svingninger i kobber, lysblink i fiber, eller radiobølger. Selve representasjonen endrer seg, men bytene er nøyaktig de samme.",
    phase: "wire",
    visible: ["preamble", "dst", "src", "type", "payload", "fcs"],
    status: "Rammen er på kabelen som en bit-strøm.",
  },
  {
    title: "8. Mottakerens NIC synkroniserer på preamble og leser ramma",
    description:
      "Mottakerens klokke låser seg på det skiftende mønsteret i preamblen og finner SFD. Da vet den at neste byte er starten på selve rammen. Preamble og SFD «forbrukes» og er ikke en del av rammen oppover.",
    phase: "decode",
    visible: ["dst", "src", "type", "payload", "fcs"],
    focus: "preamble",
    status: "Preamble forbrukt — NIC er synkronisert.",
  },
  {
    title: "9. NIC sjekker Dst MAC i hardware",
    description:
      "Matcher destinasjons-MAC-en min egen MAC (eller broadcast/multicast jeg har abonnert på)? Hvis nei, drop. Hvis ja, fortsett. Dette skjer i NIC-silisiumet uten å vekke CPU-en.",
    phase: "decode",
    visible: ["dst", "src", "type", "payload", "fcs"],
    focus: "dst",
    status: "Dst MAC matchet — rammen er til meg.",
  },
  {
    title: "10. NIC verifiserer FCS",
    description:
      "NIC-en kjører CRC-32 over dst+src+type+payload og sammenligner med FCS-feltet. Stemmer det? Bra. Stemmer det ikke? Rammen kastes — TCP eller applikasjonen får aldri se den. Telleren rx_crc_errors øker, men ingen feilmelding leveres oppover.",
    phase: "decode",
    visible: ["dst", "src", "type", "payload", "fcs"],
    focus: "fcs",
    status: "FCS OK — ingen bit-feil oppdaget.",
  },
  {
    title: "11. Header skrelles av — payload leveres opp",
    description:
      "Type-feltet (0x0800) sier «IPv4». NIC-driveren fjerner Ethernet-header + FCS og rekker payload videre til IP-laget i kjernen. Linklaget er ferdig med jobben sin for denne rammen.",
    phase: "decode",
    visible: ["payload"],
    focus: "payload",
    status: "Payload levert til IP-laget. Ramme-livssyklus fullført.",
  },
];

// --- Geometri --- //
const VIEW_W = 800;
const VIEW_H = 320;
const FRAME_Y = 130; // y-senter for ramme-blokken
const FRAME_H = 60;
const TRACK_Y = FRAME_Y + 120; // y for kabel-stripa
const TRACK_X1 = 60;
const TRACK_X2 = VIEW_W - 60;

// Vi tegner bredder log-skalert (ellers blir payload monstrøs ved siden av 2-byte type-felt).
function fieldWidth(bytes: number): number {
  // Min 50 px, vokser med kvadratrot av bytes.
  return 26 + Math.sqrt(bytes) * 12;
}

function visibleLayout(visible: FieldId[]): { x: number; w: number; field: Field }[] {
  // Rekkefølge på kabelen.
  const order: FieldId[] = ["preamble", "dst", "src", "type", "payload", "fcs"];
  const ordered = order.filter((id) => visible.includes(id));
  const widths = ordered.map((id) => fieldWidth(FIELDS.find((f) => f.id === id)!.bytes));
  const total = widths.reduce((a, b) => a + b, 0);
  const startX = (VIEW_W - total) / 2;
  let x = startX;
  return ordered.map((id, i) => {
    const w = widths[i];
    const seg = { x, w, field: FIELDS.find((f) => f.id === id)! };
    x += w;
    return seg;
  });
}

export function Section61Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = STEPS[stepIdx];

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2200; // ~2.2s per steg
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setProgress((p) => {
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

  const layout = useMemo(() => visibleLayout(step.visible), [step.visible]);
  const focusField = step.focus ? FIELDS.find((f) => f.id === step.focus) ?? null : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto bg-muted/10">
        {/* Side-etikett: hvem er aktiv akkurat nå */}
        <text
          x={VIEW_W / 2}
          y={28}
          textAnchor="middle"
          className="fill-foreground text-[13px] font-semibold"
        >
          {step.phase === "build" && "Avsender — NIC bygger ramme"}
          {step.phase === "wire" && "Kabel / radio / fiber — bits underveis"}
          {step.phase === "decode" && "Mottaker — NIC dekoder ramme"}
        </text>
        <text x={VIEW_W / 2} y={46} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          {step.status}
        </text>

        {/* Ramme-blokk: en horisontal rekke av rektangler */}
        {step.phase !== "wire" && (
          <g>
            {layout.map(({ x, w, field }) => {
              const isFocus = field.id === step.focus;
              // Fade-effekt: under build fader fokus inn; under decode fader fokus ut.
              const opacity =
                isFocus && step.phase === "build"
                  ? 0.2 + 0.8 * progress
                  : isFocus && step.phase === "decode" && field.id !== "payload"
                    ? 1 - 0.7 * progress
                    : 1;
              return (
                <g key={field.id} opacity={opacity}>
                  <rect
                    x={x}
                    y={FRAME_Y - FRAME_H / 2}
                    width={w}
                    height={FRAME_H}
                    rx={4}
                    className={`${field.fill} ${field.stroke}`}
                    strokeWidth={isFocus ? 2.5 : 1.2}
                    fillOpacity={0.85}
                  />
                  <text
                    x={x + w / 2}
                    y={FRAME_Y - 4}
                    textAnchor="middle"
                    className="fill-background text-[10px] font-bold pointer-events-none"
                  >
                    {field.label}
                  </text>
                  <text
                    x={x + w / 2}
                    y={FRAME_Y + 10}
                    textAnchor="middle"
                    className="fill-background/80 text-[9px] font-mono pointer-events-none"
                  >
                    {field.bytes} B
                  </text>
                  <text
                    x={x + w / 2}
                    y={FRAME_Y + FRAME_H / 2 + 14}
                    textAnchor="middle"
                    className="fill-foreground text-[9px] font-mono"
                  >
                    {field.value.length > 18 ? field.value.slice(0, 16) + "…" : field.value}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Wire-fase: tegn rammen som bits over kabel */}
        {step.phase === "wire" && (
          <g>
            <line
              x1={TRACK_X1}
              y1={FRAME_Y}
              x2={TRACK_X2}
              y2={FRAME_Y}
              className="stroke-muted-foreground/40"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={VIEW_W / 2}
              y={FRAME_Y - 22}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              kabel / radio / fiber
            </text>
            <BitsStripe progress={progress} y={FRAME_Y} x1={TRACK_X1 + 10} x2={TRACK_X2 - 10} />
            <BlockGlide progress={progress} y={FRAME_Y + 50} x1={TRACK_X1} x2={TRACK_X2} />
          </g>
        )}

        {/* Liten oppsummering av aktivt felt under */}
        {focusField && step.phase !== "wire" && (
          <g>
            <rect
              x={40}
              y={TRACK_Y - 30}
              width={VIEW_W - 80}
              height={62}
              rx={6}
              className="fill-card stroke-border"
              strokeWidth={1}
            />
            <text x={56} y={TRACK_Y - 12} className="fill-foreground text-[11px] font-semibold">
              {focusField.label} ({focusField.bytes} bytes)
            </text>
            <text x={56} y={TRACK_Y + 4} className="fill-muted-foreground text-[10px] font-mono">
              {focusField.value}
            </text>
            <foreignObject x={56} y={TRACK_Y + 8} width={VIEW_W - 112} height={26}>
              <div
                style={{
                  font: "10px ui-sans-serif, system-ui",
                  color: "rgb(115, 115, 115)",
                  lineHeight: 1.25,
                }}
              >
                {focusField.description}
              </div>
            </foreignObject>
          </g>
        )}
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Controls */}
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
            : stepIdx === STEPS.length - 1 && progress >= 0.99
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
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 ml-auto"
          aria-label="Tilbakestill"
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        <div className="ml-2 flex gap-1">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Felt-legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        {FIELDS.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${f.chip}`} />
            <span>
              {f.label} <span className="font-mono">({f.bytes} B)</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Subkomponenter --- //

function BitsStripe({
  progress,
  y,
  x1,
  x2,
}: {
  progress: number;
  y: number;
  x1: number;
  x2: number;
}) {
  // Tegn pseudo-tilfeldige bits som glir høyre.
  const N = 32;
  const totalW = x2 - x1;
  const pattern = "10101010101011011100010110100101";
  return (
    <g>
      {Array.from({ length: N }).map((_, i) => {
        const baseT = i / N;
        const t = (baseT + progress) % 1;
        const x = x1 + t * totalW;
        const bit = pattern[i % pattern.length];
        return (
          <text
            key={i}
            x={x}
            y={y + 4}
            textAnchor="middle"
            className="fill-brand font-mono text-[11px] font-bold"
            opacity={0.75}
          >
            {bit}
          </text>
        );
      })}
    </g>
  );
}

function BlockGlide({
  progress,
  y,
  x1,
  x2,
}: {
  progress: number;
  y: number;
  x1: number;
  x2: number;
}) {
  // En liten oransje «pakke» som forteller at HELE rammen er underveis.
  const x = x1 + (x2 - x1 - 80) * progress;
  return (
    <g>
      <rect
        x={x}
        y={y - 9}
        width={80}
        height={18}
        rx={4}
        className="fill-brand/80 stroke-brand"
        strokeWidth={1.2}
      />
      <text
        x={x + 40}
        y={y + 4}
        textAnchor="middle"
        className="fill-background text-[10px] font-semibold"
      >
        Ethernet-ramme
      </text>
    </g>
  );
}
