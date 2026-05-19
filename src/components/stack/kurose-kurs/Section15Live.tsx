import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Levende versjon av seksjon 1.5: encapsulation (innkapsling) i den
// 5-lags TCP/IP-modellen. En HTTP-melding bygges opp lag for lag på
// avsender-side (headers legges på nedover), sendes over linja som bits,
// og pakkes opp lag for lag på mottaker-side (headers skrelles av).
//
// Original design — bok-figurer er ikke gjenskapt. To stabler med 5 lag
// (venstre = avsender, høyre = mottaker), bits-stripe i midten.

type LayerId = "app" | "transport" | "network" | "link" | "physical";

type Layer = {
  id: LayerId;
  name: string;
  short: string;
  protocols: string;
  /** Hvilken farge tilhører headeren som DETTE laget legger på. */
  headerColor: HeaderColor;
};

type HeaderColor = "app" | "tcp" | "ip" | "eth";

const LAYERS: Layer[] = [
  {
    id: "app",
    name: "Applikasjon",
    short: "App",
    protocols: "HTTP, SMTP, DNS",
    headerColor: "app",
  },
  {
    id: "transport",
    name: "Transport",
    short: "TCP",
    protocols: "TCP, UDP — portnumre",
    headerColor: "tcp",
  },
  {
    id: "network",
    name: "Nettverk",
    short: "IP",
    protocols: "IP — IP-adresser, ruting",
    headerColor: "ip",
  },
  {
    id: "link",
    name: "Link",
    short: "Eth",
    protocols: "Ethernet, WiFi — MAC-adresser",
    headerColor: "eth",
  },
  {
    id: "physical",
    name: "Fysisk",
    short: "Bits",
    protocols: "kabel, radio, lys",
    headerColor: "eth",
  },
];

// Hvilke headere som er pakket på meldingen på et gitt steg.
// Rekkefølge i array = utenfra og inn (yttersts header først).
type HeaderStack = HeaderColor[];

type Side = "send" | "wire" | "recv";

type Step = {
  title: string;
  description: string;
  /** Hvilken side av diagrammet pakken vises på. */
  side: Side;
  /** Hvilket lag pakken er ved (brukes for y-posisjon). */
  layer: LayerId;
  /** Headere på pakken AKKURAT NÅ. App-header er alltid innerst (data). */
  headers: HeaderStack;
  /** Om laget akkurat nå legger på (add) eller skreller av (strip) en header. */
  action: "create" | "add" | "wire" | "strip" | "deliver";
};

const STEPS: Step[] = [
  {
    title: "1. Applikasjon lager meldingen",
    description:
      "Nettleseren bygger en HTTP-forespørsel: «GET / HTTP/1.1». På dette tidspunktet er det bare ren data — ingen header er lagt på enda. Vi tegner den som én blokk.",
    side: "send",
    layer: "app",
    headers: ["app"],
    action: "create",
  },
  {
    title: "2. Transport pakker inn (TCP)",
    description:
      "Meldingen sendes ned til transportlaget. TCP legger på sin header med kildeport og målport (her: port 443 for HTTPS), samt sekvensnummer for pålitelig levering. Pakken har nå 2 lag.",
    side: "send",
    layer: "transport",
    headers: ["tcp", "app"],
    action: "add",
  },
  {
    title: "3. Nettverk pakker inn (IP)",
    description:
      "Transport-segmentet sendes ned til nettverkslaget. IP legger på sin header med kilde-IP og mål-IP, sånn at rutere underveis vet hvor pakken skal. Pakken har nå 3 lag.",
    side: "send",
    layer: "network",
    headers: ["ip", "tcp", "app"],
    action: "add",
  },
  {
    title: "4. Link pakker inn (Ethernet)",
    description:
      "IP-datagrammet pakkes inn i en Ethernet-ramme. Linklaget legger på sin header med MAC-adresser — som identifiserer kortet på neste hopp, ikke endemålet. Pakken har nå 4 lag.",
    side: "send",
    layer: "link",
    headers: ["eth", "ip", "tcp", "app"],
    action: "add",
  },
  {
    title: "5. Fysisk lag sender bits over linja",
    description:
      "Den ferdige rammen blir til en strøm av nuller og enere — som spenningssvingninger i kobber, lysblink i fiber eller radiobølger i luft. Selve innholdet er det samme; bare formen endrer seg.",
    side: "wire",
    layer: "physical",
    headers: ["eth", "ip", "tcp", "app"],
    action: "wire",
  },
  {
    title: "6. Mottaker — link skreller av Ethernet",
    description:
      "Bits-strømmen blir til en ramme igjen. Linklaget på mottakeren sjekker MAC-adressen, fjerner Ethernet-headeren og sender det som er igjen oppover.",
    side: "recv",
    layer: "link",
    headers: ["ip", "tcp", "app"],
    action: "strip",
  },
  {
    title: "7. Mottaker — nettverk og transport skreller av",
    description:
      "Nettverkslaget sjekker IP-adressen og fjerner IP-headeren. Transport tar over, sjekker port og sekvensnummer, og fjerner TCP-headeren. Bare den opprinnelige HTTP-meldingen står igjen.",
    side: "recv",
    layer: "transport",
    headers: ["app"],
    action: "strip",
  },
  {
    title: "8. Applikasjon leverer meldingen",
    description:
      "HTTP-meldingen er nå identisk med det avsenderen sendte ut — bit for bit. Web-serveren leser «GET / HTTP/1.1» og kan begynne å svare. Hver lag-overgang har vært usynlig for applikasjonen.",
    side: "recv",
    layer: "app",
    headers: ["app"],
    action: "deliver",
  },
];

// Header-farger — egne maps for SVG (fill-*) og span (bg-*).
const HEADER_FILL: Record<HeaderColor, string> = {
  app: "fill-success",
  tcp: "fill-amber-500",
  ip: "fill-brand",
  eth: "fill-purple-500",
};
const HEADER_STROKE: Record<HeaderColor, string> = {
  app: "stroke-success",
  tcp: "stroke-amber-500",
  ip: "stroke-brand",
  eth: "stroke-purple-500",
};
const HEADER_LABEL: Record<HeaderColor, string> = {
  app: "HTTP",
  tcp: "TCP",
  ip: "IP",
  eth: "Eth",
};
const BG_CLASS: Record<HeaderColor, string> = {
  app: "bg-success",
  tcp: "bg-amber-500",
  ip: "bg-brand",
  eth: "bg-purple-500",
};

// Geometri
const VIEW_W = 780;
const VIEW_H = 400;
const SEND_X = 80; // venstre stabel x-senter
const RECV_X = 700; // høyre stabel x-senter
const STACK_W = 140; // bredden på hver lag-boks
const LAYER_H = 56; // høyden på hvert lag
const STACK_TOP = 40; // topp y for første lag
const WIRE_Y = STACK_TOP + LAYER_H * 5 + 18; // y for bits-stripa

function layerY(id: LayerId): number {
  const idx = LAYERS.findIndex((l) => l.id === id);
  return STACK_TOP + idx * LAYER_H + LAYER_H / 2;
}

export function Section15Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 innenfor nåværende steg

  const step = STEPS[stepIdx];

  // Animasjons-loop
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 2500; // ~2.5 sek per steg
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

  // Beregn pakke-posisjon basert på side og lag
  const packetPos = useMemo(() => computePacketPos(step, progress), [step, progress]);

  // Pakke-bredde øker med antall headere
  const packetWidth = step.headers.length * 22 + 18;
  const packetHeight = 30;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto bg-muted/10">
        {/* Side-etiketter */}
        <text
          x={SEND_X}
          y={20}
          textAnchor="middle"
          className="fill-foreground text-[12px] font-semibold"
        >
          Avsender
        </text>
        <text
          x={RECV_X}
          y={20}
          textAnchor="middle"
          className="fill-foreground text-[12px] font-semibold"
        >
          Mottaker
        </text>

        {/* Pil-indikator mellom stablene som viser flyt-retning */}
        <FlowArrows currentStep={step} />

        {/* Avsender-stabel */}
        {LAYERS.map((layer) => (
          <LayerBox
            key={`s-${layer.id}`}
            layer={layer}
            x={SEND_X}
            isActive={step.side === "send" && step.layer === layer.id}
          />
        ))}

        {/* Mottaker-stabel */}
        {LAYERS.map((layer) => (
          <LayerBox
            key={`r-${layer.id}`}
            layer={layer}
            x={RECV_X}
            isActive={step.side === "recv" && step.layer === layer.id}
          />
        ))}

        {/* Linja i midten (det fysiske mediet) */}
        <g>
          <line
            x1={SEND_X + STACK_W / 2}
            y1={WIRE_Y}
            x2={RECV_X - STACK_W / 2}
            y2={WIRE_Y}
            className={step.side === "wire" ? "stroke-foreground/70" : "stroke-muted-foreground/40"}
            strokeWidth={step.side === "wire" ? 2.5 : 1.5}
            strokeDasharray="4 3"
          />
          <text
            x={(SEND_X + RECV_X) / 2}
            y={WIRE_Y - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            kabel / radio / fiber
          </text>

          {/* Bits-stripe når vi er på wire-steget */}
          {step.side === "wire" && (
            <BitsStripe
              progress={progress}
              y={WIRE_Y}
              x1={SEND_X + STACK_W / 2 + 12}
              x2={RECV_X - STACK_W / 2 - 12}
            />
          )}
        </g>

        {/* Animert pakke (skjules på wire-steget, der bits-stripa erstatter den) */}
        {step.side !== "wire" && (
          <PacketShape
            cx={packetPos.x}
            cy={packetPos.y}
            width={packetWidth}
            height={packetHeight}
            headers={step.headers}
            action={step.action}
            progress={progress}
          />
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
        >
          <RotateCcw className="h-3 w-3" />
        </button>

        {/* Steg-prikker */}
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

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <LegendDot color="app" /> HTTP-data (applikasjon)
        <LegendDot color="tcp" /> TCP-header (transport)
        <LegendDot color="ip" /> IP-header (nettverk)
        <LegendDot color="eth" /> Ethernet-header (link)
      </div>
    </div>
  );
}

// --- Subkomponenter ---

function LayerBox({ layer, x, isActive }: { layer: Layer; x: number; isActive: boolean }) {
  const y = layerY(layer.id) - LAYER_H / 2;
  return (
    <g>
      <rect
        x={x - STACK_W / 2}
        y={y}
        width={STACK_W}
        height={LAYER_H - 4}
        rx={6}
        className={isActive ? "fill-brand/10 stroke-brand" : "fill-card stroke-border"}
        strokeWidth={isActive ? 2 : 1.2}
      />
      <text
        x={x}
        y={y + 18}
        textAnchor="middle"
        className={`text-[11px] font-semibold ${isActive ? "fill-brand" : "fill-foreground"}`}
      >
        {layer.name}
      </text>
      <text x={x} y={y + 34} textAnchor="middle" className="fill-muted-foreground text-[9px]">
        {layer.protocols}
      </text>
      <text x={x} y={y + 46} textAnchor="middle" className="fill-muted-foreground/70 text-[8px]">
        Lag {LAYERS.findIndex((l) => l.id === layer.id) + 1}
      </text>
    </g>
  );
}

function PacketShape({
  cx,
  cy,
  width,
  height,
  headers,
  action,
  progress,
}: {
  cx: number;
  cy: number;
  width: number;
  height: number;
  headers: HeaderStack;
  action: Step["action"];
  progress: number;
}) {
  // headers[0] = ytterste header. headers[siste] = "app" (HTTP-data).
  // Vi tegner blokker side om side, der ytterste header er lengst til venstre.
  const headerW = 22;
  const dataW = width - headerW * (headers.length - 1);
  let xCursor = cx - width / 2;

  // Fade-effekt: når vi legger på en header (add), fader ytterste inn.
  // Når vi skreller av (strip), fader ytterste ut.
  const outerOpacity = action === "add" ? progress : action === "strip" ? 1 - progress : 1;

  return (
    <g>
      {headers.map((h, i) => {
        const isOuter = i === 0;
        const isData = i === headers.length - 1;
        const w = isData ? dataW : headerW;
        const x = xCursor;
        xCursor += w;
        const opacity = isOuter && (action === "add" || action === "strip") ? outerOpacity : 1;
        return (
          <g key={`${h}-${i}`} opacity={opacity}>
            <rect
              x={x}
              y={cy - height / 2}
              width={w}
              height={height}
              rx={3}
              className={`${HEADER_FILL[h]} ${HEADER_STROKE[h]}`}
              strokeWidth={1.2}
              fillOpacity={0.85}
            />
            <text
              x={x + w / 2}
              y={cy + 3}
              textAnchor="middle"
              className="fill-background text-[9px] font-bold pointer-events-none"
            >
              {HEADER_LABEL[h]}
            </text>
          </g>
        );
      })}
    </g>
  );
}

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
  // Tegn ~28 "bits" som beveger seg fra venstre til høyre.
  const N = 28;
  const totalW = x2 - x1;
  const pattern = "10110100110010111010001101"; // pseudo-tilfeldig bit-mønster
  return (
    <g>
      {Array.from({ length: N }).map((_, i) => {
        // Posisjon basert på progress: bit i starter til venstre og glir høyre.
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

function FlowArrows({ currentStep }: { currentStep: Step }) {
  // Tegn små piler langs avsender-stabelen (peker nedover, lag for lag)
  // og langs mottaker-stabelen (peker oppover). Highlight den aktive.
  const items: { x: number; y: number; dir: "down" | "up"; active: boolean }[] = [];

  // Avsender: piler mellom hver lag-overgang
  for (let i = 0; i < LAYERS.length - 1; i++) {
    const fromY = layerY(LAYERS[i].id) + LAYER_H / 2 - 4;
    const isActive =
      currentStep.side === "send" && LAYERS.findIndex((l) => l.id === currentStep.layer) === i + 1;
    items.push({
      x: SEND_X + STACK_W / 2 + 16,
      y: fromY + 6,
      dir: "down",
      active: isActive,
    });
  }
  // Mottaker: piler mellom hver lag-overgang (peker opp)
  for (let i = LAYERS.length - 1; i > 0; i--) {
    const fromY = layerY(LAYERS[i].id) - LAYER_H / 2 + 4;
    const isActive =
      currentStep.side === "recv" && LAYERS.findIndex((l) => l.id === currentStep.layer) === i - 1;
    items.push({
      x: RECV_X - STACK_W / 2 - 16,
      y: fromY + 6,
      dir: "up",
      active: isActive,
    });
  }

  return (
    <g>
      {items.map((it, i) => (
        <g key={i}>
          <line
            x1={it.x}
            y1={it.y - 8}
            x2={it.x}
            y2={it.y + 8}
            className={it.active ? "stroke-brand" : "stroke-muted-foreground/40"}
            strokeWidth={it.active ? 2 : 1.2}
          />
          <polygon
            points={
              it.dir === "down"
                ? `${it.x - 4},${it.y + 4} ${it.x + 4},${it.y + 4} ${it.x},${it.y + 10}`
                : `${it.x - 4},${it.y - 4} ${it.x + 4},${it.y - 4} ${it.x},${it.y - 10}`
            }
            className={it.active ? "fill-brand" : "fill-muted-foreground/40"}
          />
        </g>
      ))}
    </g>
  );
}

function LegendDot({ color }: { color: HeaderColor }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${BG_CLASS[color]}`} />;
}

// --- Hjelpefunksjoner ---

function computePacketPos(step: Step, progress: number): { x: number; y: number } {
  // Pakkens posisjon er forankret til den aktive stabelens senter på y-aksen
  // for laget. Animasjonen lar pakken "gli" mellom forrige og nåværende lag
  // for å antyde bevegelsen mellom lagene.
  const targetY = layerY(step.layer);
  const targetX = step.side === "recv" ? RECV_X : SEND_X;

  // Lite "wobble" på add/strip — pakken peker mot laget den forlater.
  if (step.action === "add") {
    // Kommer fra laget OVER, glir ned til targetY
    const prevIdx = Math.max(0, LAYERS.findIndex((l) => l.id === step.layer) - 1);
    const startY = layerY(LAYERS[prevIdx].id);
    const y = startY + (targetY - startY) * progress;
    return { x: targetX, y };
  }
  if (step.action === "strip") {
    // Skreller av — glir oppover mot laget OVER neste steg
    const nextIdx = Math.max(0, LAYERS.findIndex((l) => l.id === step.layer) - 1);
    const endY = layerY(LAYERS[nextIdx].id);
    const y = targetY + (endY - targetY) * progress;
    return { x: targetX, y };
  }
  if (step.action === "deliver") {
    return { x: targetX, y: targetY };
  }
  // create / wire
  return { x: targetX, y: targetY };
}
