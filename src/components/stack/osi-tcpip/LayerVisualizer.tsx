import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  ArrowDown,
  ArrowUp,
  Network,
  Layers,
  Route,
} from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering: lagdelt innkapsling (encapsulation), avkapsling
// (decapsulation), OSI vs TCP/IP side-om-side, og to-vert-reise gjennom en
// ruter. Implementert i SVG/HTML med Tailwind. Ingen eksterne avhengigheter
// utover lucide-react.
//
// Modus-styringen følger samme mønster som NatVisualizer/LinkedStructures-
// Visualizer: en moduselektor + Steg/Spill/Reset på toppen.
// --------------------------------------------------------------------------

type Mode = "encap" | "decap" | "models" | "journey";

const MODES: { id: Mode; label: string; sub: string; icon: typeof Layers }[] = [
  { id: "encap", label: "Innkapsling (ned)", sub: "App → Transport → Nett → Lenke", icon: ArrowDown },
  { id: "decap", label: "Avkapsling (opp)", sub: "Mottaker stripper headere", icon: ArrowUp },
  { id: "models", label: "OSI vs TCP/IP", sub: "7-lags og 5-lagsmodell", icon: Layers },
  { id: "journey", label: "To-vert-reise", sub: "A → ruter → B", icon: Route },
];

const MODE_NOTE: Record<Mode, string> = {
  encap:
    "Hver gang pakken går ned ett lag legges en ny header på (Ethernet legger også på en trailer/FCS).",
  decap:
    "Mottakeren reverserer: stripper én header per lag opp gjennom stakken, leverer payload til applikasjonen.",
  models:
    "OSI samler app-logikk i tre lag (5–7), TCP/IP slår dem sammen til ett. Klikk et lag for protokoller og eksempler.",
  journey:
    "Mellom-rutere opererer på lag 3 (IP). Lenkelag-headeren (Ethernet) rewrittes på hvert hopp, men IP-adressene står stille.",
};

// Lagdefinisjoner — brukt i flere moduser. Farger gjenbrukes konsekvent.
type LayerDef = {
  num: number;
  name: string;
  pdu: string;
  /** Tailwind bg/text/border-klasser for header-blokken */
  headerBg: string;
  headerText: string;
  border: string;
  /** Mørkere tone for "current layer" */
  active: string;
  protocols: string[];
  exampleHeader: string;
  reads: string;
};

const LAYERS: LayerDef[] = [
  {
    num: 5,
    name: "Applikasjon",
    pdu: "Melding",
    headerBg: "bg-violet-500",
    headerText: "text-violet-50",
    border: "border-violet-500/40",
    active: "ring-violet-500/60",
    protocols: ["HTTP", "HTTPS", "DNS", "SMTP", "SSH", "FTP"],
    exampleHeader: "GET /index.html HTTP/1.1",
    reads: "Leser HTTP-headere og body, leverer til nettleseren.",
  },
  {
    num: 4,
    name: "Transport",
    pdu: "Segment",
    headerBg: "bg-sky-500",
    headerText: "text-sky-50",
    border: "border-sky-500/40",
    active: "ring-sky-500/60",
    protocols: ["TCP", "UDP"],
    exampleHeader: "TCP src=54321 dst=80 seq=… ack=…",
    reads: "Leser src/dst-port — dirigerer til riktig socket/prosess.",
  },
  {
    num: 3,
    name: "Nettverk",
    pdu: "Pakke",
    headerBg: "bg-emerald-500",
    headerText: "text-emerald-50",
    border: "border-emerald-500/40",
    active: "ring-emerald-500/60",
    protocols: ["IP", "ICMP", "OSPF", "BGP"],
    exampleHeader: "IP src=10.0.0.5 dst=93.184.216.34 TTL=64",
    reads: "Sjekker dst-IP, bestemmer neste hopp / leverer lokalt.",
  },
  {
    num: 2,
    name: "Lenke",
    pdu: "Frame",
    headerBg: "bg-amber-500",
    headerText: "text-amber-50",
    border: "border-amber-500/40",
    active: "ring-amber-500/60",
    protocols: ["Ethernet", "WiFi", "ARP"],
    exampleHeader: "Eth src=aa:bb:… dst=cc:dd:… type=0x0800",
    reads: "Sjekker dst-MAC. Stripper Ethernet og leverer til IP-laget.",
  },
  {
    num: 1,
    name: "Fysisk",
    pdu: "Bits",
    headerBg: "bg-slate-500",
    headerText: "text-slate-50",
    border: "border-slate-500/40",
    active: "ring-slate-500/60",
    protocols: ["Kobber", "Fiber", "Radio"],
    exampleHeader: "010110100011…",
    reads: "Mottar bit-strømmen fra mediet og setter sammen til en frame.",
  },
];

// Praktisk: indeks 0 = Applikasjon (lag 5), indeks 4 = Fysisk (lag 1).

// ----------------------------------------------------------------------
// Hovedkomponent
// ----------------------------------------------------------------------
export function LayerVisualizer() {
  const [mode, setMode] = useState<Mode>("encap");
  const [payload, setPayload] = useState<string>("GET /index.html HTTP/1.1");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Lag-innkapsling — pakka gjennom stakken
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  mode === m.id
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:bg-muted"
                }`}
                title={m.sub}
              >
                <Icon className="h-3 w-3" />
                {m.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-muted-foreground italic">
          {MODE_NOTE[mode]}
        </div>
        {(mode === "encap" || mode === "decap" || mode === "journey") && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <label className="text-xs text-muted-foreground">Payload:</label>
            <input
              type="text"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="flex-1 min-w-[200px] max-w-md text-xs font-mono px-2 py-1 rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="GET /index.html HTTP/1.1"
            />
          </div>
        )}
      </div>

      {mode === "encap" && <EncapPanel payload={payload} direction="down" />}
      {mode === "decap" && <EncapPanel payload={payload} direction="up" />}
      {mode === "models" && <ModelsPanel />}
      {mode === "journey" && <JourneyPanel payload={payload} />}
    </div>
  );
}

// ----------------------------------------------------------------------
// PANEL 1 + 2: Encapsulation / Decapsulation
// ----------------------------------------------------------------------
function EncapPanel({
  payload,
  direction,
}: {
  payload: string;
  direction: "down" | "up";
}) {
  // step 0 = ingenting, step k = etter at k header-tilbygg har skjedd.
  // For "down": step går 0 → 4 (legg på Transport, Nettverk, Lenke, Fysisk)
  // For "up":   start på 4, går 4 → 0 (strip i revers).
  const total = 4;
  const initialStep = direction === "down" ? 0 : total;
  const [step, setStep] = useState(initialStep);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Reset når retning eller payload endres
  useEffect(() => {
    setStep(direction === "down" ? 0 : total);
    setPlaying(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [direction, payload]);

  const atEnd = direction === "down" ? step >= total : step <= 0;

  const advance = () => {
    if (direction === "down") {
      setStep((s) => Math.min(total, s + 1));
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };
  const reset = () => {
    setPlaying(false);
    setStep(direction === "down" ? 0 : total);
  };

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => advance(), 1100);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, atEnd]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  // Hvilke headere er på pakken nå? down: step=1 har Transport, step=2 har Transport+Network, …
  // up: step=4 har alle, step=3 har Transport+Network+Link (Physical strippet først), osv.
  // Headerne legges på (down) i rekkefølge: Transport (lag 4) → Network (lag 3) → Link (lag 2)
  // og Fysisk omgjør hele pakka til bits — vises som en "bits"-strek i step=4.
  // For symmetri lar vi step=4 representere "på kabelen".
  const headersOn = step; // 0..4
  // index i LAYERS: 0=App, 1=Transport, 2=Nettverk, 3=Lenke, 4=Fysisk
  // headere som er på pakken (innerst → ytterst): Transport (1), Nettverk (2), Lenke (3)
  // step 1: Transport
  // step 2: Transport + Nettverk
  // step 3: Transport + Nettverk + Lenke
  // step 4: bits (samme pakke, sendes som signal)
  const onWire = headersOn >= 4;

  const activeLayerIdx = (() => {
    // Hvilket lag er "aktivt" (animasjons-fokus)
    if (direction === "down") {
      if (step === 0) return 0;
      return Math.min(step, 4); // 1=Transport,2=Net,3=Link,4=Phys
    } else {
      if (step === total) return 4; // bits først
      return step; // 3=Link, 2=Net, 1=Transport, 0=App
    }
  })();

  return (
    <div className="p-4 bg-background">
      {/* Kontroller */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="text-xs text-muted-foreground tabular-nums">
          Steg{" "}
          {direction === "down"
            ? Math.min(step, total)
            : Math.max(0, total - step)}
          {" / "}
          {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (atEnd) reset();
              else advance();
            }}
            disabled={playing}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40"
          >
            <StepForward className="h-3 w-3" />
            Steg
          </button>
          <button
            type="button"
            onClick={() => {
              if (atEnd) {
                reset();
                setTimeout(() => setPlaying(true), 50);
                return;
              }
              setPlaying((p) => !p);
            }}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? "Pause" : "Spill"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[160px_1fr] gap-4">
        {/* Lag-stakk (venstre) */}
        <div className="flex flex-col gap-2">
          {LAYERS.map((layer, i) => {
            const isActive = i === activeLayerIdx;
            return (
              <div
                key={layer.num}
                className={`rounded-lg border ${layer.border} bg-card px-3 py-2 text-xs transition-all ${
                  isActive ? `ring-2 ${layer.active}` : "opacity-70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">Lag {layer.num}</div>
                    <div className="text-muted-foreground">{layer.name}</div>
                  </div>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${layer.headerBg} ${layer.headerText}`}
                  >
                    {layer.pdu}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pakke-visning (høyre) */}
        <div className="flex flex-col items-center justify-start min-h-[320px] py-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            {direction === "down" ? "Sender" : "Mottaker"}
          </div>
          <div className="w-full max-w-xl">
            <PacketBox
              payload={payload}
              transportOn={headersOn >= 1 && !onWire}
              networkOn={headersOn >= 2 && !onWire}
              linkOn={headersOn >= 3 && !onWire}
              onWire={onWire}
            />
          </div>

          {/* Beskrivelse av nåværende steg */}
          <div className="mt-4 w-full max-w-xl rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <StepDescription
              direction={direction}
              step={step}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDescription({
  direction,
  step,
  total,
}: {
  direction: "down" | "up";
  step: number;
  total: number;
}) {
  // For "down": step=0 → ingenting; step=1..3 → header k lagt på; step=4 → bits.
  // For "up": step=4 → mottar bits; step=3 → Link strippet; ... step=0 → app leser melding.
  if (direction === "down") {
    switch (step) {
      case 0:
        return (
          <span>
            Applikasjonen har en melding klar. Trykk Steg/Spill for å sende den
            ned gjennom stakken.
          </span>
        );
      case 1:
        return (
          <span>
            <strong>Lag 4 (Transport):</strong> TCP-headeren legger på src-/dst-port,
            sekvens- og ack-nummer. Resultatet kalles et <em>segment</em>.
          </span>
        );
      case 2:
        return (
          <span>
            <strong>Lag 3 (Nettverk):</strong> IP-headeren legger på src-/dst-IP og TTL.
            Resultatet kalles en <em>pakke</em>.
          </span>
        );
      case 3:
        return (
          <span>
            <strong>Lag 2 (Lenke):</strong> Ethernet-headeren legger på src-/dst-MAC, og
            trailer (FCS) legges på baksiden for feildeteksjon. Resultatet kalles
            en <em>frame</em>.
          </span>
        );
      case 4:
        return (
          <span>
            <strong>Lag 1 (Fysisk):</strong> Hele framen sendes som bits over
            kabel/fiber/radio. Ferdig — pakken er på trådene.
          </span>
        );
    }
  } else {
    switch (step) {
      case total:
        return (
          <span>
            <strong>Lag 1 (Fysisk):</strong> Mottar bit-strømmen og setter den
            sammen til en frame.
          </span>
        );
      case 3:
        return (
          <span>
            <strong>Lag 2 (Lenke):</strong> Sjekker dst-MAC og FCS, stripper
            Ethernet-headeren og -traileren, leverer IP-pakka oppover.
          </span>
        );
      case 2:
        return (
          <span>
            <strong>Lag 3 (Nettverk):</strong> Sjekker dst-IP. Pakka er addressert til
            denne maskinen → stripper IP-headeren, leverer segmentet til transport.
          </span>
        );
      case 1:
        return (
          <span>
            <strong>Lag 4 (Transport):</strong> Sjekker dst-port, finner riktig
            socket. Stripper TCP-headeren, leverer payloaden til applikasjonen.
          </span>
        );
      case 0:
        return (
          <span>
            <strong>Lag 5 (Applikasjon):</strong> Nettleseren leser HTTP-meldingen
            og rendrer siden. Ferdig.
          </span>
        );
    }
  }
  return null;
}

// ----------------------------------------------------------------------
// PacketBox — viser pakken med voksende headere
// ----------------------------------------------------------------------
function PacketBox({
  payload,
  transportOn,
  networkOn,
  linkOn,
  onWire,
}: {
  payload: string;
  transportOn: boolean;
  networkOn: boolean;
  linkOn: boolean;
  onWire: boolean;
}) {
  if (onWire) {
    return (
      <div className="rounded-lg border border-slate-500/40 bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Fysisk lag — bits på kabelen
        </div>
        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all leading-relaxed">
          0101001011010110001011010110100011010110110100101101011000101101011010001101011011010010110101100010110101101000110101101101001011010110001011010110100011010110…
        </div>
      </div>
    );
  }

  // Bygg pakka som boxes-i-boxes. Innerst = payload, ytterst = Ethernet.
  return (
    <div className="space-y-2">
      <PacketLayer
        active={linkOn}
        label="Lag 2 — Ethernet"
        header="Eth src=aa:bb:cc:dd:ee:ff dst=cc:dd:ee:ff:00:11 type=0x0800"
        trailer="FCS"
        headerBg="bg-amber-500"
        headerText="text-amber-50"
        border="border-amber-500/40"
      >
        <PacketLayer
          active={networkOn}
          label="Lag 3 — IP"
          header="IP src=10.0.0.5 dst=93.184.216.34 TTL=64 proto=TCP"
          headerBg="bg-emerald-500"
          headerText="text-emerald-50"
          border="border-emerald-500/40"
        >
          <PacketLayer
            active={transportOn}
            label="Lag 4 — TCP"
            header="TCP src=54321 dst=80 seq=1 ack=0 flags=PSH,ACK"
            headerBg="bg-sky-500"
            headerText="text-sky-50"
            border="border-sky-500/40"
          >
            <div className="rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-1 font-semibold">
                Lag 5 — Applikasjon (payload)
              </div>
              <div className="font-mono text-xs break-all">{payload}</div>
            </div>
          </PacketLayer>
        </PacketLayer>
      </PacketLayer>
    </div>
  );
}

function PacketLayer({
  active,
  label,
  header,
  trailer,
  headerBg,
  headerText,
  border,
  children,
}: {
  active: boolean;
  label: string;
  header: string;
  trailer?: string;
  headerBg: string;
  headerText: string;
  border: string;
  children: React.ReactNode;
}) {
  if (!active) {
    return <>{children}</>;
  }
  return (
    <div
      className={`rounded-md border ${border} bg-card p-2 transition-all duration-500`}
      style={{ animation: "layer-grow 320ms ease-out" }}
    >
      <div
        className={`rounded ${headerBg} ${headerText} px-2 py-1 font-mono text-[10px] mb-2`}
      >
        <span className="opacity-80 mr-1">[{label}]</span>
        {header}
      </div>
      {children}
      {trailer && (
        <div
          className={`mt-2 rounded ${headerBg} ${headerText} px-2 py-1 font-mono text-[10px] inline-block`}
        >
          <span className="opacity-80 mr-1">[trailer]</span>
          {trailer}
        </div>
      )}
      <style>{`
        @keyframes layer-grow {
          from { transform: scaleY(0.85); opacity: 0; }
          to { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ----------------------------------------------------------------------
// PANEL 3: OSI vs TCP/IP side om side
// ----------------------------------------------------------------------
function ModelsPanel() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  // OSI: 7 lag, top-down: Application, Presentation, Session, Transport,
  // Network, Data Link, Physical
  // TCP/IP (5-lag, slik kurset bruker): Application, Transport, Network,
  // Link, Physical
  const osi = [
    { n: 7, name: "Application", tcpipMap: 5 },
    { n: 6, name: "Presentation", tcpipMap: 5 },
    { n: 5, name: "Session", tcpipMap: 5 },
    { n: 4, name: "Transport", tcpipMap: 4 },
    { n: 3, name: "Network", tcpipMap: 3 },
    { n: 2, name: "Data Link", tcpipMap: 2 },
    { n: 1, name: "Physical", tcpipMap: 1 },
  ];
  const tcpip = [
    { n: 5, name: "Application" },
    { n: 4, name: "Transport" },
    { n: 3, name: "Network" },
    { n: 2, name: "Link" },
    { n: 1, name: "Physical" },
  ];

  const layerDetail = (num: number) => LAYERS.find((l) => l.num === num);

  return (
    <div className="p-4 bg-background">
      <div className="grid sm:grid-cols-[1fr_60px_1fr] gap-3 items-start">
        {/* OSI venstre */}
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
            OSI — 7 lag
          </div>
          {osi.map((l) => {
            const detail = layerDetail(l.tcpipMap)!;
            const isSelected = selectedLayer === l.tcpipMap;
            return (
              <button
                key={l.n}
                type="button"
                onClick={() => setSelectedLayer(l.tcpipMap)}
                className={`w-full text-left rounded-md border ${detail.border} px-3 py-2 text-xs transition-all ${
                  isSelected
                    ? `ring-2 ${detail.active} bg-card`
                    : "bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>
                    <span className="font-mono text-muted-foreground mr-2">{l.n}.</span>
                    <span className="font-semibold">{l.name}</span>
                  </span>
                  <span
                    className={`inline-block w-3 h-3 rounded-sm ${detail.headerBg}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Mapping-pilene (midten) */}
        <div className="hidden sm:flex flex-col items-center justify-center text-muted-foreground text-xs h-full pt-6">
          <svg viewBox="0 0 60 360" width="60" height="360" className="overflow-visible">
            {/* Lag 7,6,5 (OSI) → 5 (TCP/IP): tre piler inn på app */}
            <Mapping y1={28} y2={28} />
            <Mapping y1={70} y2={28} />
            <Mapping y1={112} y2={28} />
            {/* Lag 4 OSI → 4 TCP */}
            <Mapping y1={154} y2={70} />
            {/* Lag 3 OSI → 3 TCP */}
            <Mapping y1={196} y2={112} />
            {/* Lag 2 OSI → 2 TCP */}
            <Mapping y1={238} y2={154} />
            {/* Lag 1 OSI → 1 TCP */}
            <Mapping y1={280} y2={196} />
          </svg>
        </div>

        {/* TCP/IP høyre */}
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
            TCP/IP — 5 lag
          </div>
          {tcpip.map((l) => {
            const detail = layerDetail(l.n)!;
            const isSelected = selectedLayer === l.n;
            return (
              <button
                key={l.n}
                type="button"
                onClick={() => setSelectedLayer(l.n)}
                className={`w-full text-left rounded-md border ${detail.border} px-3 py-2 text-xs transition-all ${
                  isSelected
                    ? `ring-2 ${detail.active} bg-card`
                    : "bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>
                    <span className="font-mono text-muted-foreground mr-2">{l.n}.</span>
                    <span className="font-semibold">{l.name}</span>
                  </span>
                  <span
                    className={`inline-block w-3 h-3 rounded-sm ${detail.headerBg}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalj-panel */}
      <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 text-sm min-h-[120px]">
        {selectedLayer === null ? (
          <div className="text-xs text-muted-foreground italic">
            Klikk på et lag for å se protokoller, PDU og hva laget faktisk gjør.
          </div>
        ) : (
          (() => {
            const detail = layerDetail(selectedLayer)!;
            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-sm ${detail.headerBg}`}
                  />
                  <span className="font-semibold">
                    Lag {detail.num} — {detail.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (PDU: {detail.pdu})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {detail.reads}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {detail.protocols.map((p) => (
                    <span
                      key={p}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${detail.headerBg} ${detail.headerText}`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  Eks. header: {detail.exampleHeader}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

function Mapping({ y1, y2 }: { y1: number; y2: number }) {
  return (
    <path
      d={`M 0 ${y1} C 30 ${y1}, 30 ${y2}, 60 ${y2}`}
      stroke="currentColor"
      strokeWidth="1.2"
      className="text-border"
      fill="none"
    />
  );
}

// ----------------------------------------------------------------------
// PANEL 4: To-vert-reise (A → ruter → B)
// ----------------------------------------------------------------------
type JourneyStep = {
  label: string;
  /** Hvem holder pakken nå */
  node: "A" | "R" | "B";
  /** Hvilket lag pakken befinner seg på (1..5) — 0 = på mediet */
  layer: number;
  description: string;
  ethSrc: string;
  ethDst: string;
  ipSrc: string;
  ipDst: string;
  /** Rewrite-flagg for highlight */
  ethRewrite?: boolean;
};

function buildJourneySteps(): JourneyStep[] {
  // A: 10.0.0.5, MAC aa:..:aa
  // R: LAN-IF 10.0.0.1, MAC bb:..:01 — WAN-IF 192.168.1.1, MAC bb:..:02
  // B: 192.168.1.5, MAC cc:..:cc
  return [
    {
      label: "1) A bygger pakka",
      node: "A",
      layer: 5,
      description:
        "Vert A pakker payloaden inn i TCP/IP/Ethernet. Dst-MAC settes til ruterens LAN-MAC (default gateway) — fordi B er på et annet nett.",
      ethSrc: "aa:aa:aa:aa:aa:aa",
      ethDst: "bb:bb:bb:bb:bb:01",
      ipSrc: "10.0.0.5",
      ipDst: "192.168.1.5",
    },
    {
      label: "2) A → ruter (lenke-hopp 1)",
      node: "R",
      layer: 2,
      description:
        "Pakka går over LAN-en. Ruteren leser dst-MAC, ser at framen er til seg, stripper Ethernet og leverer IP-pakka oppover til lag 3.",
      ethSrc: "aa:aa:aa:aa:aa:aa",
      ethDst: "bb:bb:bb:bb:bb:01",
      ipSrc: "10.0.0.5",
      ipDst: "192.168.1.5",
    },
    {
      label: "3) Ruteren slår opp dst-IP",
      node: "R",
      layer: 3,
      description:
        "Ruteren ser på dst-IP=192.168.1.5, gjør oppslag i sin rutetabell, finner ut at neste hopp er B på WAN-grensesnittet. Ruteren opererer på lag 3.",
      ethSrc: "aa:aa:aa:aa:aa:aa",
      ethDst: "bb:bb:bb:bb:bb:01",
      ipSrc: "10.0.0.5",
      ipDst: "192.168.1.5",
    },
    {
      label: "4) Ruteren skriver om lenkelag-headeren",
      node: "R",
      layer: 2,
      description:
        "Ny Ethernet-header legges på: src-MAC = ruterens WAN-MAC, dst-MAC = B sin MAC (slått opp via ARP). Merk: IP-adressene står stille — bare lenkelag-headeren skiftes på hvert hopp.",
      ethSrc: "bb:bb:bb:bb:bb:02",
      ethDst: "cc:cc:cc:cc:cc:cc",
      ipSrc: "10.0.0.5",
      ipDst: "192.168.1.5",
      ethRewrite: true,
    },
    {
      label: "5) Ruter → B (lenke-hopp 2)",
      node: "B",
      layer: 2,
      description:
        "Framen krysser WAN-en. B leser dst-MAC, ser at framen er til seg, stripper Ethernet.",
      ethSrc: "bb:bb:bb:bb:bb:02",
      ethDst: "cc:cc:cc:cc:cc:cc",
      ipSrc: "10.0.0.5",
      ipDst: "192.168.1.5",
    },
    {
      label: "6) B leverer til applikasjonen",
      node: "B",
      layer: 5,
      description:
        "B avkapsler videre oppover: IP-headeren stemmer (dst=192.168.1.5 = meg), TCP-headeren peker på en åpen socket, applikasjonen mottar payloaden.",
      ethSrc: "bb:bb:bb:bb:bb:02",
      ethDst: "cc:cc:cc:cc:cc:cc",
      ipSrc: "10.0.0.5",
      ipDst: "192.168.1.5",
    },
  ];
}

function JourneyPanel({ payload }: { payload: string }) {
  const steps = useMemo(() => buildJourneySteps(), []);
  const total = steps.length;
  const [step, setStep] = useState(0); // 0 = ikke startet, 1..total = etter steg k
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = step > 0 ? steps[step - 1] : null;

  const advance = () => setStep((s) => Math.min(total, s + 1));
  const reset = () => {
    setPlaying(false);
    setStep(0);
  };

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => advance(), 1300);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, total]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  // Pakke-posisjon i SVG (basert på node A=120, R=380, B=640 ; y=160)
  const packetPos = (() => {
    if (!current) return null;
    const nodeX: Record<"A" | "R" | "B", number> = { A: 120, R: 380, B: 640 };
    return { x: nodeX[current.node], y: 160 };
  })();

  return (
    <div className="p-4 bg-background">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="text-xs text-muted-foreground tabular-nums">
          Steg {Math.min(step, total)} / {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (step >= total) reset();
              else advance();
            }}
            disabled={playing}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40"
          >
            <StepForward className="h-3 w-3" />
            Steg
          </button>
          <button
            type="button"
            onClick={() => {
              if (step >= total) {
                reset();
                setTimeout(() => setPlaying(true), 50);
                return;
              }
              setPlaying((p) => !p);
            }}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {playing ? "Pause" : "Spill"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      <svg viewBox="0 0 760 280" className="w-full h-auto" style={{ maxHeight: 300 }}>
        {/* LAN-soner */}
        <rect x="30" y="60" width="220" height="180" fill="currentColor" className="text-sky-500/5" rx="12" />
        <rect x="510" y="60" width="220" height="180" fill="currentColor" className="text-emerald-500/5" rx="12" />
        <text x="140" y="52" className="fill-sky-700 dark:fill-sky-300" fontSize="11" fontWeight="600" textAnchor="middle">
          Nett A — 10.0.0.0/24
        </text>
        <text x="620" y="52" className="fill-emerald-700 dark:fill-emerald-300" fontSize="11" fontWeight="600" textAnchor="middle">
          Nett B — 192.168.1.0/24
        </text>

        {/* Kabel-linjer */}
        <line x1="180" y1="160" x2="320" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />
        <line x1="440" y1="160" x2="580" y2="160" stroke="currentColor" className="text-border" strokeWidth="1.5" />

        {/* Verts-bokser */}
        <JourneyNode x={120} y={160} label="A" ip="10.0.0.5" mac="aa:…aa" tone="sky" />
        <JourneyNode x={380} y={160} label="Ruter" ip="10.0.0.1 / 192.168.1.1" mac="bb:…01 / bb:…02" tone="indigo" wide />
        <JourneyNode x={640} y={160} label="B" ip="192.168.1.5" mac="cc:…cc" tone="emerald" />

        {/* Hvilket lag ruteren går opp til (vises som annoteringer) */}
        <text x="380" y="100" className="fill-indigo-700 dark:fill-indigo-300" fontSize="10" fontWeight="600" textAnchor="middle">
          Lag 3-enhet
        </text>

        {/* Pakke */}
        {packetPos && (
          <g
            style={{
              transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)",
              transform: `translate(${packetPos.x - 380}px, ${packetPos.y - 220}px)`,
            }}
          >
            <rect
              x={380 - 75}
              y={220 - 12}
              width="150"
              height="24"
              rx="6"
              className={current?.ethRewrite ? "fill-amber-500" : "fill-sky-500"}
              opacity="0.92"
            />
            <text
              x={380}
              y={220 + 4}
              className="fill-white"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
            >
              {current?.ethRewrite ? "Eth-header rewrittet" : "frame"}
            </text>
          </g>
        )}
      </svg>

      {/* Detalj-rute */}
      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Nåværende steg
          </div>
          {current ? (
            <>
              <div className="font-semibold mb-1">{current.label}</div>
              <div className="text-muted-foreground">{current.description}</div>
            </>
          ) : (
            <div className="text-muted-foreground italic">
              Trykk Steg eller Spill for å starte reisen.
            </div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Headere på pakka
          </div>
          {current ? (
            <div className="font-mono text-[11px] space-y-1">
              <div
                className={`px-2 py-1 rounded ${
                  current.ethRewrite
                    ? "bg-amber-500/20 ring-1 ring-amber-500"
                    : "bg-amber-500/10"
                }`}
              >
                <span className="text-amber-700 dark:text-amber-300">[Eth]</span>{" "}
                src={current.ethSrc} dst={current.ethDst}
              </div>
              <div className="px-2 py-1 rounded bg-emerald-500/10">
                <span className="text-emerald-700 dark:text-emerald-300">[IP]</span>{" "}
                src={current.ipSrc} dst={current.ipDst}
              </div>
              <div className="px-2 py-1 rounded bg-sky-500/10">
                <span className="text-sky-700 dark:text-sky-300">[TCP]</span>{" "}
                src=54321 dst=80
              </div>
              <div className="px-2 py-1 rounded bg-violet-500/10 break-all">
                <span className="text-violet-700 dark:text-violet-300">[App]</span>{" "}
                {payload}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground italic">—</div>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-card p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <Network className="h-3 w-3 text-brand" />
          <span className="font-semibold">Hovedlærdom</span>
        </div>
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
          <li>
            <strong>IP-adressene står stille</strong> hele veien fra A til B.
          </li>
          <li>
            <strong>Ethernet-headeren skiftes på hvert hopp</strong> — én ny src/dst-MAC per lenke.
          </li>
          <li>
            <strong>Ruteren opererer på lag 3</strong>: den må opp til IP-laget for å se hvor pakka skal videre.
          </li>
        </ul>
      </div>
    </div>
  );
}

function JourneyNode({
  x,
  y,
  label,
  ip,
  mac,
  tone,
  wide,
}: {
  x: number;
  y: number;
  label: string;
  ip: string;
  mac: string;
  tone: "sky" | "emerald" | "indigo";
  wide?: boolean;
}) {
  const fillTone: Record<typeof tone, string> = {
    sky: "text-sky-500/20 dark:text-sky-400/25",
    emerald: "text-emerald-500/20 dark:text-emerald-400/25",
    indigo: "text-indigo-500/20 dark:text-indigo-400/25",
  };
  const strokeTone: Record<typeof tone, string> = {
    sky: "text-sky-500",
    emerald: "text-emerald-500",
    indigo: "text-indigo-500",
  };
  const w = wide ? 130 : 110;
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 32}
        width={w}
        height="64"
        rx="10"
        fill="currentColor"
        className={fillTone[tone]}
      />
      <rect
        x={x - w / 2}
        y={y - 32}
        width={w}
        height="64"
        rx="10"
        fill="none"
        stroke="currentColor"
        className={strokeTone[tone]}
        strokeWidth="1.5"
        opacity="0.55"
      />
      <text x={x} y={y - 12} className="fill-foreground" fontSize="12" fontWeight="700" textAnchor="middle">
        {label}
      </text>
      <text x={x} y={y + 4} className="fill-muted-foreground" fontSize="9" fontFamily="monospace" textAnchor="middle">
        {ip}
      </text>
      <text x={x} y={y + 18} className="fill-muted-foreground" fontSize="9" fontFamily="monospace" textAnchor="middle">
        {mac}
      </text>
    </g>
  );
}
