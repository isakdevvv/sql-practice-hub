import { useEffect, useMemo, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

// Interaktiv visualisering av seksjon 3.1 / 3.2 — multipleksing og demultipleksing.
// Tre applikasjoner (nettleser, e-post, Spotify) på avsendermaskinen deler én
// IP-adresse og ett nettverksgrensesnitt. Hver app har sin egen socket med et
// portnummer. Pakker fra ulike apper går ned via TCP eller UDP til IP-laget,
// ut på lenken, og på mottakeren demultiplekses tilbake til riktig app basert
// på destinasjons-portnummeret i transport-headeren.

type AppId = "browser" | "email" | "spotify";
type Side = "send" | "recv";
type Layer = "app" | "transport" | "ip" | "link";

type AppDef = {
  id: AppId;
  label: string;
  sublabel: string;
  /** TCP eller UDP — bestemmer farge og demux-tuppelmodus. */
  transport: "tcp" | "udp";
  /** Lokal port (klient-siden) — typisk ephemeral i virkeligheten. */
  srcPort: number;
  /** Server-side / fjern-port. */
  dstPort: number;
};

const APPS: AppDef[] = [
  {
    id: "browser",
    label: "Nettleser",
    sublabel: "HTTPS · vg.no",
    transport: "tcp",
    srcPort: 51001,
    dstPort: 443,
  },
  {
    id: "email",
    label: "E-post",
    sublabel: "IMAPS · gmail",
    transport: "tcp",
    srcPort: 51002,
    dstPort: 993,
  },
  {
    id: "spotify",
    label: "Spotify",
    sublabel: "audio-stream",
    transport: "udp",
    srcPort: 51003,
    dstPort: 5004,
  },
];

// Layout-koordinater (viewBox 0 0 840 360).
// Venstre kolonne (sender), midt = link, høyre kolonne (mottaker).
const SENDER_X = 130;
const RECEIVER_X = 710;

// Y-posisjoner per applikasjon — brukes for både socket-ikon og pil-start på app-laget.
const APP_Y: Record<AppId, number> = {
  browser: 50,
  email: 110,
  spotify: 170,
};

// Y-posisjoner for de fire lagene (app, transport, IP, link).
const LAYER_Y: Record<Layer, number> = {
  app: 110, // gjennomsnitt av app-rader, brukes ikke direkte
  transport: 230,
  ip: 280,
  link: 320,
};

// Beregn punkter pakken passerer for et gitt step (sender → mottaker eller motsatt).
function pathFor(app: AppId, side: Side): Array<{ x: number; y: number }> {
  const ay = APP_Y[app];
  if (side === "send") {
    return [
      { x: SENDER_X, y: ay }, // app-socket
      { x: SENDER_X, y: LAYER_Y.transport }, // transport
      { x: SENDER_X, y: LAYER_Y.ip }, // ip
      { x: SENDER_X, y: LAYER_Y.link }, // link ut
      { x: RECEIVER_X, y: LAYER_Y.link }, // link inn
    ];
  }
  // recv: pakka kommer inn fra venstre og puttes på riktig socket på høyre side
  return [
    { x: SENDER_X, y: LAYER_Y.link },
    { x: RECEIVER_X, y: LAYER_Y.link }, // link inn
    { x: RECEIVER_X, y: LAYER_Y.ip }, // ip
    { x: RECEIVER_X, y: LAYER_Y.transport }, // transport (demux)
    { x: RECEIVER_X, y: ay }, // riktig socket på app-laget
  ];
}

type StepKind =
  | "intro"
  | "send-app"
  | "send-transport"
  | "send-ip"
  | "send-link"
  | "recv-ip"
  | "recv-demux"
  | "recv-app"
  | "summary";

type Step = {
  kind: StepKind;
  app: AppId;
  title: string;
  body: string;
};

function buildSteps(): Step[] {
  const out: Step[] = [
    {
      kind: "intro",
      app: "browser",
      title: "Tre apper, én IP-adresse, ett kabel",
      body: "Maskinen kjører tre nettverks-apper samtidig: nettleseren (TCP, port 51001 → 443), e-post (TCP, port 51002 → 993) og Spotify (UDP, port 51003 → 5004). Alle deler den samme IP-adressen og det samme fysiske grensesnittet. Hvordan holder OS-en orden på hvem sine bytes som skal hvor? Trykk «Neste» for å følge en pakke fra hver app gjennom stacken.",
    },
  ];

  for (const app of APPS) {
    const isTcp = app.transport === "tcp";
    const proto = isTcp ? "TCP" : "UDP";
    out.push(
      {
        kind: "send-app",
        app: app.id,
        title: `${app.label}: app-laget skriver til socket`,
        body: `${app.label} kaller send() på sin socket. Dataene har ingen portnumre ennå — applikasjonen ser bare en kanal. OS-en vet at akkurat denne socketen er bundet til lokal port ${app.srcPort} og snakker ${proto} mot fjern-port ${app.dstPort}.`,
      },
      {
        kind: "send-transport",
        app: app.id,
        title: `${proto}-laget pakker inn med portnumre (MUX)`,
        body: `${proto} legger på en header med kilde-port ${app.srcPort} og dest-port ${app.dstPort}. Dette er multipleksingen: tre forskjellige app-strømmer slås sammen til én strøm ned til IP. ${
          isTcp
            ? "TCP legger også på sekvensnummer og ACK, men det er tema for 3.4."
            : "UDP-headeren er bare 8 bytes — minimum mulig."
        }`,
      },
      {
        kind: "send-ip",
        app: app.id,
        title: `IP-laget legger på adresser`,
        body: `IP-laget ser bare en byte-blob fra transport-laget pluss «hvilket protokoll-nummer» (6 = TCP, 17 = UDP). Det legger på en IP-header med kilde- og dest-IP og sender datagrammet videre til lenke-laget. Portnumre er usynlige for IP — de er begravet i transport-headeren.`,
      },
      {
        kind: "send-link",
        app: app.id,
        title: `Lenke-laget sender ut på kabelen`,
        body: `Lenke-laget (Ethernet/WiFi) legger på MAC-adresser og sender ut bitene. Pakker fra alle tre appene står i kø og kommer ut én etter én. Mottakeren har ingen anelse — ennå — om hvilken app som «eier» pakken.`,
      },
      {
        kind: "recv-ip",
        app: app.id,
        title: `Mottaker: IP-laget plukker ut transport-segmentet`,
        body: `Mottakeren mottar datagrammet, sjekker checksum, og finner ut at protokoll-feltet er ${isTcp ? "6 (TCP)" : "17 (UDP)"}. Den leverer det innkapslede segmentet til riktig transport-stack — TCP eller UDP — på sin egen maskin.`,
      },
      {
        kind: "recv-demux",
        app: app.id,
        title: `${proto}: demux-oppslag på portnummer`,
        body: isTcp
          ? `TCP-stacken på mottakeren slår opp 4-tuppelen (kilde-IP, ${app.srcPort}, dest-IP, ${app.dstPort}) i sin socket-tabell. Hver aktiv forbindelse har en egen socket, så her finnes det presis én treff. Hadde to klienter koblet til samme server-port, ville hver hatt sin egen 4-tuppel.`
          : `UDP-stacken på mottakeren slår opp 2-tuppelen (dest-IP, ${app.dstPort}) i sin socket-tabell. Én socket pr. lyttende UDP-port — applikasjonen får alle pakker som har den dest-porten, og leser kilde-adressen selv via recvfrom().`,
      },
      {
        kind: "recv-app",
        app: app.id,
        title: `${app.label}-server leser dataene`,
        body: `Demux-oppslaget treffer riktig socket → recv() returnerer dataene til ${app.label}-prosessen på serveren. Headere er strippet bort underveis: app-laget ser bare den opprinnelige byte-strømmen. Ingen av de andre to appene merker noe til denne pakken.`,
      },
    );
  }

  out.push({
    kind: "summary",
    app: "browser",
    title: "Oppsummering: 3 apper, 1 IP, presis sortering",
    body: "Alle tre pakkene reiste over samme IP-adresse og samme lenke, men ingen havnet feil. Magien er portnumrene i transport-headeren: avsender legger dem på (mux), mottaker leser dem og slår opp i socket-tabellen (demux). TCP bruker 4-tuppel (kilde-IP, kilde-port, dest-IP, dest-port) så hver forbindelse er unik; UDP bruker bare 2-tuppel (dest-IP, dest-port). Bytt step-prikk for å hoppe direkte til en bestemt app eller fase.",
  });

  return out;
}

const STEPS = buildSteps();

const APP_COLOR_FILL: Record<AppId, string> = {
  browser: "fill-brand",
  email: "fill-purple-500",
  spotify: "fill-success",
};
const APP_COLOR_STROKE: Record<AppId, string> = {
  browser: "stroke-brand",
  email: "stroke-purple-500",
  spotify: "stroke-success",
};
const APP_COLOR_BG: Record<AppId, string> = {
  browser: "bg-brand",
  email: "bg-purple-500",
  spotify: "bg-success",
};

const PROTO_BADGE: Record<"tcp" | "udp", string> = {
  tcp: "bg-amber-500/15 text-amber-600 border-amber-500/40",
  udp: "bg-cyan-500/15 text-cyan-600 border-cyan-500/40",
};

export function Section31Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const step = STEPS[stepIdx];
  const app = APPS.find((a) => a.id === step.app)!;

  // Hvilken side animeres? Send-fasen, link-overgang, eller recv-fasen.
  const side: Side | "none" =
    step.kind === "send-app" ||
    step.kind === "send-transport" ||
    step.kind === "send-ip" ||
    step.kind === "send-link"
      ? "send"
      : step.kind === "recv-ip" || step.kind === "recv-demux" || step.kind === "recv-app"
        ? "recv"
        : "none";

  // Hvor langt på «riktig» path skal pakken være på dette steget?
  // Vi mapper hvert step til et delsegment av den 5-punkt-pathen.
  const subProgress: { from: number; to: number } | null = (() => {
    switch (step.kind) {
      case "send-app":
        return { from: 0, to: 1 }; // app -> transport
      case "send-transport":
        return { from: 1, to: 2 }; // transport -> ip
      case "send-ip":
        return { from: 2, to: 3 }; // ip -> link
      case "send-link":
        return { from: 3, to: 4 }; // link out -> link in (over kabelen)
      case "recv-ip":
        return { from: 1, to: 2 }; // link in -> ip
      case "recv-demux":
        return { from: 2, to: 3 }; // ip -> transport (demux)
      case "recv-app":
        return { from: 3, to: 4 }; // transport -> riktig socket
      default:
        return null;
    }
  })();

  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const SPEED = 1 / 1800;
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

  const packetPos = useMemo(() => {
    if (side === "none" || !subProgress) return null;
    const path = pathFor(app.id, side);
    const a = path[subProgress.from];
    const b = path[subProgress.to];
    return {
      x: a.x + (b.x - a.x) * progress,
      y: a.y + (b.y - a.y) * progress,
    };
  }, [side, subProgress, app.id, progress]);

  // Hvilke socket-piler er aktive på app-laget (highlightes når pakken er på app-laget).
  const activeSocketSide: Side | null =
    step.kind === "send-app" ? "send" : step.kind === "recv-app" ? "recv" : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">{step.title}</span>
        <span
          className={`px-1.5 py-0.5 rounded border text-[10px] font-mono uppercase ${PROTO_BADGE[app.transport]}`}
        >
          {app.transport}
        </span>
        <span className="ml-auto font-mono">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      <svg viewBox="0 0 840 360" className="w-full h-auto bg-muted/10">
        {/* Lag-bånd (svake horisontale striper for transport, ip, link) */}
        <LayerBand y={LAYER_Y.transport - 18} label="Transport (TCP/UDP)" sublabel="mux + demux" />
        <LayerBand y={LAYER_Y.ip - 18} label="IP" sublabel="kilde- og dest-IP" tone="muted" />
        <LayerBand
          y={LAYER_Y.link - 18}
          label="Lenke (Ethernet/WiFi)"
          sublabel="bits over kabel"
          tone="muted"
        />

        {/* Vertikale stack-søyler */}
        <StackColumn x={SENDER_X} label="Avsender" />
        <StackColumn x={RECEIVER_X} label="Mottaker" />

        {/* Linje fra avsender til mottaker på link-laget */}
        <line
          x1={SENDER_X}
          y1={LAYER_Y.link}
          x2={RECEIVER_X}
          y2={LAYER_Y.link}
          className="stroke-muted-foreground/40"
          strokeWidth={2}
          strokeDasharray="4 3"
        />

        {/* Apper på sender-siden */}
        {APPS.map((a) => (
          <AppNode
            key={"send-" + a.id}
            x={SENDER_X}
            y={APP_Y[a.id]}
            side="send"
            app={a}
            highlight={a.id === app.id && activeSocketSide === "send"}
          />
        ))}

        {/* Apper på mottaker-siden */}
        {APPS.map((a) => (
          <AppNode
            key={"recv-" + a.id}
            x={RECEIVER_X}
            y={APP_Y[a.id]}
            side="recv"
            app={a}
            highlight={a.id === app.id && activeSocketSide === "recv"}
          />
        ))}

        {/* Socket-piler fra app ned til transport-laget (sender-siden) */}
        {APPS.map((a) => (
          <SocketWire
            key={"sw-send-" + a.id}
            x={SENDER_X}
            y1={APP_Y[a.id]}
            y2={LAYER_Y.transport}
            color={a.id}
            active={a.id === app.id && side === "send"}
            label={`:${a.srcPort}`}
            labelSide="right"
          />
        ))}

        {/* Socket-piler på mottaker-siden — fra transport opp til app */}
        {APPS.map((a) => (
          <SocketWire
            key={"sw-recv-" + a.id}
            x={RECEIVER_X}
            y1={APP_Y[a.id]}
            y2={LAYER_Y.transport}
            color={a.id}
            active={a.id === app.id && side === "recv"}
            label={`:${a.dstPort}`}
            labelSide="left"
          />
        ))}

        {/* Demux-oppslagsbokser på transport-laget (mottaker) — vises i recv-demux-steg */}
        {step.kind === "recv-demux" && <DemuxTable app={app} />}

        {/* Mux-oppslagsbokser på transport-laget (sender) — vises i send-transport-steg */}
        {step.kind === "send-transport" && <MuxBadge app={app} />}

        {/* Pakke i bevegelse */}
        {packetPos && <Packet x={packetPos.x} y={packetPos.y} app={app} step={step} />}
      </svg>

      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.body}
      </div>

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

        <div className="ml-2 flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-3 rounded-full ${
                i === stepIdx
                  ? APP_COLOR_BG[s.app]
                  : i < stepIdx
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
              aria-label={`Gå til steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-brand" /> Nettleser (TCP)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500" /> E-post (TCP)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-success" /> Spotify (UDP)
        </span>
        <span className="ml-auto">
          <span className="font-mono">port-tuppel</span>: TCP = 4-tuppel, UDP = 2-tuppel
        </span>
      </div>
    </div>
  );
}

function LayerBand({
  y,
  label,
  sublabel,
  tone = "default",
}: {
  y: number;
  label: string;
  sublabel?: string;
  tone?: "default" | "muted";
}) {
  return (
    <g>
      <rect
        x={20}
        y={y}
        width={800}
        height={28}
        rx={3}
        className={
          tone === "muted"
            ? "fill-muted-foreground/5 stroke-muted-foreground/15"
            : "fill-brand/5 stroke-brand/20"
        }
        strokeWidth={1}
      />
      <text x={30} y={y + 18} className="fill-foreground text-[10px] font-semibold">
        {label}
      </text>
      {sublabel && (
        <text x={30} y={y + 18} dx={92} className="fill-muted-foreground text-[9px]">
          {sublabel}
        </text>
      )}
    </g>
  );
}

function StackColumn({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <line
        x1={x}
        y1={20}
        x2={x}
        y2={LAYER_Y.link}
        className="stroke-muted-foreground/15"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <text
        x={x}
        y={14}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold tracking-wide uppercase"
      >
        {label}
      </text>
    </g>
  );
}

function AppNode({
  x,
  y,
  side,
  app,
  highlight,
}: {
  x: number;
  y: number;
  side: Side;
  app: AppDef;
  highlight: boolean;
}) {
  // Send-siden viser appen til venstre for stack-søylen, recv-siden til høyre.
  const w = 110;
  const h = 32;
  const rx = side === "send" ? x - w - 8 : x + 8;
  return (
    <g>
      <rect
        x={rx}
        y={y - h / 2}
        width={w}
        height={h}
        rx={4}
        className={`fill-card ${APP_COLOR_STROKE[app.id]} ${highlight ? "" : "opacity-90"}`}
        strokeWidth={highlight ? 2.5 : 1.5}
      />
      <text
        x={rx + w / 2}
        y={y - 2}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
      >
        {app.label}
      </text>
      <text
        x={rx + w / 2}
        y={y + 9}
        textAnchor="middle"
        className="fill-muted-foreground text-[8px]"
      >
        {app.sublabel}
      </text>
      {/* Socket-prikk på siden som vender mot stack-søylen */}
      <circle
        cx={side === "send" ? rx + w : rx}
        cy={y}
        r={4}
        className={`${APP_COLOR_FILL[app.id]} stroke-background`}
        strokeWidth={1.5}
      />
    </g>
  );
}

function SocketWire({
  x,
  y1,
  y2,
  color,
  active,
  label,
  labelSide,
}: {
  x: number;
  y1: number;
  y2: number;
  color: AppId;
  active: boolean;
  label: string;
  labelSide: "left" | "right";
}) {
  const labelX = labelSide === "right" ? x + 6 : x - 6;
  const anchor = labelSide === "right" ? "start" : "end";
  return (
    <g>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        className={
          active
            ? APP_COLOR_STROKE[color]
            : color === "browser"
              ? "stroke-brand/30"
              : color === "email"
                ? "stroke-purple-500/30"
                : "stroke-success/30"
        }
        strokeWidth={active ? 2.5 : 1.5}
      />
      <text
        x={labelX}
        y={(y1 + y2) / 2 + 3}
        textAnchor={anchor}
        className={
          active
            ? "fill-foreground text-[9px] font-mono font-semibold"
            : "fill-muted-foreground text-[9px] font-mono"
        }
      >
        {label}
      </text>
    </g>
  );
}

function MuxBadge({ app }: { app: AppDef }) {
  // Vises midt på transport-bandet på sender-siden når MUX-en pakker headeren.
  return (
    <g>
      <rect
        x={SENDER_X - 70}
        y={LAYER_Y.transport - 50}
        width={140}
        height={26}
        rx={4}
        className={`fill-card ${APP_COLOR_STROKE[app.id]}`}
        strokeWidth={1.5}
      />
      <text
        x={SENDER_X}
        y={LAYER_Y.transport - 33}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-mono"
      >
        src=:{app.srcPort} → dst=:{app.dstPort}
      </text>
    </g>
  );
}

function DemuxTable({ app }: { app: AppDef }) {
  // Vises på mottaker-siden under transport-bandet i recv-demux-steget.
  const tcp = app.transport === "tcp";
  return (
    <g>
      <rect
        x={RECEIVER_X - 130}
        y={LAYER_Y.transport - 76}
        width={260}
        height={56}
        rx={4}
        className="fill-card stroke-foreground/30"
        strokeWidth={1.2}
      />
      <text
        x={RECEIVER_X}
        y={LAYER_Y.transport - 60}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        Socket-tabell ({tcp ? "TCP 4-tuppel" : "UDP 2-tuppel"})
      </text>
      <text
        x={RECEIVER_X}
        y={LAYER_Y.transport - 46}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] font-mono"
      >
        {tcp
          ? `(srcIP, :${app.srcPort}, dstIP, :${app.dstPort})`
          : `(dstIP, :${app.dstPort})`}
      </text>
      <text
        x={RECEIVER_X}
        y={LAYER_Y.transport - 32}
        textAnchor="middle"
        className={`text-[9px] font-semibold ${
          app.id === "browser"
            ? "fill-brand"
            : app.id === "email"
              ? "fill-purple-500"
              : "fill-success"
        }`}
      >
        → match: {app.label}
      </text>
    </g>
  );
}

function Packet({
  x,
  y,
  app,
  step,
}: {
  x: number;
  y: number;
  app: AppDef;
  step: Step;
}) {
  // Hva står på pakken — endrer seg etter hvor i stacken vi er.
  const onTransport =
    step.kind === "send-transport" || step.kind === "recv-demux" || step.kind === "send-ip";
  const onIp = step.kind === "send-ip" || step.kind === "recv-ip" || step.kind === "send-link";
  const label = onIp
    ? "IP+" + app.transport.toUpperCase()
    : onTransport
      ? app.transport.toUpperCase()
      : "data";

  return (
    <g>
      <rect
        x={x - 18}
        y={y - 9}
        width={36}
        height={18}
        rx={3}
        className={`${APP_COLOR_FILL[app.id]} stroke-background`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        className="fill-background text-[8px] font-semibold pointer-events-none"
      >
        {label}
      </text>
    </g>
  );
}
