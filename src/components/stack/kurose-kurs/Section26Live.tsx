import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Server,
  Smartphone,
} from "lucide-react";

// Levende versjon av seksjon 2.6: TCP socket-programmering.
//
// Vi viser kall-sekvensen mellom en TCP-server og en TCP-klient,
// med pseudo-Python på begge sider og en visuell socket-state-maskin
// som lyser opp på hvert steg.
//
// Server-kall:  socket → bind → listen → accept → recv/send → close
// Klient-kall:  socket → connect → send/recv → close
//
// På midten viser vi en "rør" (TCP-byte-stream) som data flyter gjennom.

type Step = {
  title: string;
  description: string;
  serverCode: string[]; // Linjer som er "aktive" i server-koden (idx)
  clientCode: string[];
  serverHL?: number; // hvilken linje er fremhevet på server
  clientHL?: number;
  flow?: "syn" | "synack" | "ack" | "data-cs" | "data-sc" | "fin";
  serverState: SocketState;
  clientState: SocketState;
  payload?: string;
};

type SocketState =
  | "none"
  | "created"
  | "bound"
  | "listening"
  | "syn-rcvd"
  | "established"
  | "fin-wait"
  | "closed";

const SERVER_CODE = [
  "s = socket(AF_INET, SOCK_STREAM)",
  "s.bind((HOST, 65432))",
  "s.listen(5)",
  "conn, addr = s.accept()",
  "data = conn.recv(1024)",
  "conn.send(b'Hei, ' + data)",
  "conn.close()",
];

const CLIENT_CODE = [
  "s = socket(AF_INET, SOCK_STREAM)",
  "s.connect((SERVER, 65432))",
  "s.send(b'Alice')",
  "reply = s.recv(1024)",
  "s.close()",
];

const STEPS: Step[] = [
  {
    title: "1. Server lager socket",
    description:
      "socket(AF_INET, SOCK_STREAM) returnerer en file-descriptor for en ny TCP-socket. Den er ikke koblet til noe ennå — bare en tom plass i kernel-tabellen som kan brukes til IPv4 + TCP.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 0,
    serverState: "created",
    clientState: "none",
  },
  {
    title: "2. Server binder seg til port 65432",
    description:
      "bind() forteller kernel-en hvilken (IP, port) socket-en skal lytte på. HOST='' betyr 'alle nett-interfaces'. Port < 1024 krever root. 65432 er over privileged-grensen, så ingen krav.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 1,
    serverState: "bound",
    clientState: "none",
  },
  {
    title: "3. Server går i lytte-modus",
    description:
      "listen(5) forteller kernel-en at socket-en skal akseptere innkommende forbindelser. Tallet 5 er backlog: kernel kan ha opptil 5 halvferdige tilkoblinger ventende mens vi behandler andre.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 2,
    serverState: "listening",
    clientState: "none",
  },
  {
    title: "4. Server blokkerer i accept()",
    description:
      "accept() er et blokkerende kall. Tråden sover til en klient kobler seg til. Det er server-en sin 'venter på dørklokken'-tilstand.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 3,
    serverState: "listening",
    clientState: "none",
  },
  {
    title: "5. Klient lager sin socket",
    description:
      "Klienten kjører også socket(AF_INET, SOCK_STREAM). Identisk kall, men ingen bind() — kernel-en velger en tilfeldig høy port for klient-siden.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 3,
    clientHL: 0,
    serverState: "listening",
    clientState: "created",
  },
  {
    title: "6. Klient connect() — TCP SYN",
    description:
      "connect() trigger 3-veis handshake. Klienten sender SYN-pakke til server-IP:65432. Klient-siden er nå i SYN_SENT-tilstand.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 3,
    clientHL: 1,
    flow: "syn",
    serverState: "listening",
    clientState: "created",
  },
  {
    title: "7. Server svarer SYN+ACK",
    description:
      "Kernel-en på server-siden mottar SYN, allokerer en ny socket og svarer SYN+ACK. accept()-tråden i server-prosessen sover fortsatt — kernel-en gjør handshake i bakgrunnen.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 3,
    clientHL: 1,
    flow: "synack",
    serverState: "syn-rcvd",
    clientState: "created",
  },
  {
    title: "8. Klient svarer ACK — established",
    description:
      "Klienten sender ACK. Nå er TCP-forbindelsen etablert begge veier. Server-kernel-en gir conn-socket-en til den ventende accept()-tråden. Klient-siden returnerer fra connect().",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 3,
    clientHL: 1,
    flow: "ack",
    serverState: "established",
    clientState: "established",
  },
  {
    title: "9. Klient sender 'Alice'",
    description:
      "send(b'Alice') skriver bytes inn i kernel-buffer-en for socket-en. TCP segmenterer, legger på header, ruter ut. Server-kernel-en mottar og legger i sin recv-buffer.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 4,
    clientHL: 2,
    flow: "data-cs",
    serverState: "established",
    clientState: "established",
    payload: "Alice",
  },
  {
    title: "10. Server recv() returnerer",
    description:
      "Server var i recv(1024). Så snart bytes ankommer, returnerer kallet med opptil 1024 byte. Server kan nå behandle data og forberede svar.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 4,
    clientHL: 3,
    serverState: "established",
    clientState: "established",
  },
  {
    title: "11. Server sender svar",
    description:
      "send(b'Hei, ' + data) sender 'Hei, Alice' tilbake. Klient-siden venter i recv() og våkner.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 5,
    clientHL: 3,
    flow: "data-sc",
    serverState: "established",
    clientState: "established",
    payload: "Hei, Alice",
  },
  {
    title: "12. Server close() — TCP FIN",
    description:
      "Server kaller close() på conn. Kernel sender FIN. Server-siden er nå FIN_WAIT, klient-siden går mot CLOSE_WAIT.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 6,
    clientHL: 3,
    flow: "fin",
    serverState: "fin-wait",
    clientState: "established",
  },
  {
    title: "13. Klient close() — forbindelsen er nede",
    description:
      "Klient kaller close(). Begge sider er nå i CLOSED. Socket-deskriptorene frigis. Server-prosessen kan gå tilbake til accept() for å ta imot neste klient.",
    serverCode: SERVER_CODE,
    clientCode: CLIENT_CODE,
    serverHL: 6,
    clientHL: 4,
    serverState: "closed",
    clientState: "closed",
  },
];

const FLOW_LABEL: Record<NonNullable<Step["flow"]>, { label: string; color: string }> = {
  syn: { label: "SYN", color: "fill-amber-500" },
  synack: { label: "SYN+ACK", color: "fill-purple-500" },
  ack: { label: "ACK", color: "fill-emerald-500" },
  "data-cs": { label: "DATA →", color: "fill-sky-500" },
  "data-sc": { label: "← DATA", color: "fill-sky-500" },
  fin: { label: "FIN", color: "fill-rose-500" },
};

const STATE_BADGE: Record<SocketState, { label: string; cls: string }> = {
  none: { label: "—", cls: "bg-muted text-muted-foreground" },
  created: { label: "CREATED", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  bound: { label: "BOUND", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  listening: { label: "LISTEN", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  "syn-rcvd": { label: "SYN_RCVD", cls: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  established: {
    label: "ESTABLISHED",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  "fin-wait": { label: "FIN_WAIT", cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  closed: { label: "CLOSED", cls: "bg-muted text-muted-foreground" },
};

export function Section26Live() {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[stepIdx];

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
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

  function next() {
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
    setProgress(0);
  }
  function prev() {
    setStepIdx((i) => Math.max(0, i - 1));
    setProgress(0);
  }
  function reset() {
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground">{step.title}</span>
        <span className="ml-auto font-mono text-muted-foreground">
          Steg {stepIdx + 1} / {STEPS.length}
        </span>
      </div>

      {/* Hovedscene: kode + nettverk + kode */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px_1fr] gap-2 p-3 bg-muted/10">
        {/* Klient-kode */}
        <CodePanel
          title="Klient (client.py)"
          icon={<Smartphone className="h-3 w-3" />}
          code={CLIENT_CODE}
          highlight={step.clientHL}
          state={step.clientState}
        />

        {/* Mellom-scene: SVG av flow */}
        <div className="rounded border border-border bg-card p-2 flex flex-col">
          <div className="text-[10px] text-muted-foreground uppercase font-mono text-center mb-1">
            TCP-bytestream
          </div>
          <svg viewBox="0 0 260 320" className="w-full h-auto flex-1">
            {/* Klient og server bokser */}
            <g>
              <rect
                x={10}
                y={20}
                width={70}
                height={40}
                rx={4}
                className="fill-brand/10 stroke-brand"
                strokeWidth={2}
              />
              <text x={45} y={42} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
                Klient
              </text>
            </g>
            <g>
              <rect
                x={180}
                y={20}
                width={70}
                height={40}
                rx={4}
                className={
                  step.serverState === "listening" || step.serverState === "established"
                    ? "fill-emerald-500/15 stroke-emerald-500"
                    : "fill-card stroke-muted-foreground/40"
                }
                strokeWidth={2}
              />
              <text x={215} y={42} textAnchor="middle" className="fill-foreground text-[10px] font-bold">
                Server
              </text>
            </g>

            {/* "Rør" mellom dem */}
            <rect
              x={45}
              y={60}
              width={170}
              height={240}
              fill="none"
              className={
                step.serverState === "established" && step.clientState === "established"
                  ? "stroke-emerald-500/60"
                  : "stroke-muted-foreground/30"
              }
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />

            {/* Flow-pil */}
            {step.flow && (
              <g>
                {(() => {
                  // Pil-retning
                  const goingToServer = ["syn", "ack", "data-cs"].includes(step.flow);
                  const x1 = goingToServer ? 80 : 180;
                  const x2 = goingToServer ? 180 : 80;
                  const y = 80 + (stepIdx % 5) * 35;
                  const x = x1 + (x2 - x1) * progress;
                  return (
                    <>
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        className="stroke-muted-foreground/30"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                      />
                      <rect
                        x={x - 28}
                        y={y - 10}
                        width={56}
                        height={20}
                        rx={2}
                        className={`${FLOW_LABEL[step.flow].color} stroke-background`}
                        strokeWidth={1.5}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        className="fill-white text-[9px] font-bold"
                      >
                        {FLOW_LABEL[step.flow].label}
                      </text>
                      {step.payload && (
                        <text
                          x={x}
                          y={y + 22}
                          textAnchor="middle"
                          className="fill-foreground text-[9px] font-mono"
                        >
                          "{step.payload}"
                        </text>
                      )}
                    </>
                  );
                })()}
              </g>
            )}

            {/* Tilstands-merker under */}
            <g>
              <text
                x={45}
                y={314}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px] font-mono uppercase"
              >
                {STATE_BADGE[step.clientState].label}
              </text>
              <text
                x={215}
                y={314}
                textAnchor="middle"
                className="fill-muted-foreground text-[8px] font-mono uppercase"
              >
                {STATE_BADGE[step.serverState].label}
              </text>
            </g>
          </svg>
        </div>

        {/* Server-kode */}
        <CodePanel
          title="Server (server.py)"
          icon={<Server className="h-3 w-3" />}
          code={SERVER_CODE}
          highlight={step.serverHL}
          state={step.serverState}
        />
      </div>

      {/* Beskrivelse */}
      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={prev}
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
          onClick={next}
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
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-3 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Steg ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CodePanel({
  title,
  icon,
  code,
  highlight,
  state,
}: {
  title: string;
  icon: React.ReactNode;
  code: string[];
  highlight?: number;
  state: SocketState;
}) {
  const badge = STATE_BADGE[state];
  return (
    <div className="rounded border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 text-[10px] font-mono border-b border-border">
        {icon}
        <span className="text-foreground font-semibold">{title}</span>
        <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
      <pre className="text-[10px] font-mono leading-relaxed p-2 m-0 overflow-x-auto">
        {code.map((line, i) => (
          <div
            key={i}
            className={`px-1 rounded ${
              i === highlight
                ? "bg-amber-500/15 text-foreground font-semibold"
                : "text-muted-foreground"
            }`}
          >
            <span className="inline-block w-4 text-muted-foreground/50 select-none">{i + 1}</span>
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
}
