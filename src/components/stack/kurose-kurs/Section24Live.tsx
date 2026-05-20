import { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Bell,
  Inbox,
} from "lucide-react";

// Levende versjon av seksjon 2.4: e-post-stien fra Alice til Bob.
// Viser hvordan SMTP brukes mellom mailservere (push), mens IMAP/POP
// brukes mellom mailbox og klient (pull eller push).
//
// Tre noder pluss mottak: Alice (klient) → Alices SMTP-server →
// Bobs SMTP-server → Bobs mailbox → Bobs klient (IMAP).
//
// Toggle: IMAP pull (klienten henter når brukeren åpner appen)
//         vs IMAP IDLE / push (server holder forbindelsen og pusher).

type Mode = "pull" | "push";

const A_CLIENT = { x: 50, y: 100, label: "Alice", sub: "Mail.app" };
const A_SERVER = { x: 220, y: 100, label: "Alice-MTA", sub: "smtp.uit.no" };
const B_SERVER = { x: 460, y: 100, label: "Bob-MTA", sub: "mail.bob.no" };
const B_MAILBOX = { x: 620, y: 100, label: "Mailbox", sub: "Bobs INBOX" };
const B_CLIENT = { x: 620, y: 270, label: "Bob", sub: "Mail.app" };

type Flow = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  protocol: string;
  payload: string;
  kind: "smtp" | "imap-pull" | "imap-push" | "store";
};

type Step = {
  title: string;
  description: string;
  flow?: Flow;
  highlight?: string;
  delaySec?: number; // tid som "går" mellom steg (push-modus)
  serverState?: { aQueue: number; bMailbox: number; idle: boolean };
};

const COMMON_STEPS: Step[] = [
  {
    title: "1. Alice skriver melding",
    description:
      "Alice trykker Send i Mail.app. Klienten åpner en TCP-forbindelse til UiTs SMTP-server (smtp.uit.no, port 587 med STARTTLS). Klienten authentiserer seg med SMTP AUTH.",
    flow: {
      from: A_CLIENT,
      to: A_SERVER,
      protocol: "SMTP",
      payload: "MAIL FROM, RCPT TO, DATA",
      kind: "smtp",
    },
    serverState: { aQueue: 0, bMailbox: 0, idle: false },
    highlight: "Alice",
  },
  {
    title: "2. Alices server tar over",
    description:
      "smtp.uit.no aksepterer meldingen og kommer den i en utgående kø. Klienten kan lukke sin forbindelse — serveren tar ansvar for resten. Dette er 'store and forward' i praksis.",
    serverState: { aQueue: 1, bMailbox: 0, idle: false },
    highlight: "Alice-MTA",
  },
  {
    title: "3. DNS MX-oppslag på bob.no",
    description:
      "smtp.uit.no slår opp MX-record for bob.no i DNS — det forteller hvilken server som tar imot e-post for bob.no (typisk mail.bob.no). Denne adressen er ikke nødvendigvis samme som A-record-en.",
    serverState: { aQueue: 1, bMailbox: 0, idle: false },
  },
  {
    title: "4. SMTP fra server til server",
    description:
      "smtp.uit.no åpner TCP til mail.bob.no port 25. Snakker SMTP: HELO → MAIL FROM → RCPT TO → DATA → meldingen. Mottaker-server svarer 250 OK når meldingen er trygt lagret.",
    flow: {
      from: A_SERVER,
      to: B_SERVER,
      protocol: "SMTP",
      payload: "DATA",
      kind: "smtp",
    },
    serverState: { aQueue: 1, bMailbox: 0, idle: false },
  },
  {
    title: "5. Bobs server lagrer i mailbox",
    description:
      "mail.bob.no skriver meldingen til Bobs INBOX (en mailbox på disk eller i en database). Alices server har fått 250 OK og kan slette fra køen sin.",
    flow: {
      from: B_SERVER,
      to: B_MAILBOX,
      protocol: "intern",
      payload: "lagre",
      kind: "store",
    },
    serverState: { aQueue: 0, bMailbox: 1, idle: false },
    highlight: "Mailbox",
  },
];

// Pull-modus: Bob må aktivt sjekke. Klienten henter ikke før brukeren åpner appen.
const PULL_STEPS: Step[] = [
  ...COMMON_STEPS,
  {
    title: "6. Bobs telefon vet ingenting",
    description:
      "Meldingen ligger i mailbox-en, men Bobs klient har ingen anelse. Den må eksplisitt spørre — og gjør det bare når brukeren åpner appen eller en intervall-timer går av (poll-basert).",
    serverState: { aQueue: 0, bMailbox: 1, idle: false },
    delaySec: 600, // 10 min
  },
  {
    title: "7. Bob åpner Mail.app — IMAP-poll",
    description:
      "10 minutter senere åpner Bob appen. Klienten åpner TCP til mail.bob.no port 993 (IMAPS), authentiserer, og kjører IMAP FETCH for å se hva som er nytt i INBOX.",
    flow: {
      from: B_CLIENT,
      to: B_MAILBOX,
      protocol: "IMAP",
      payload: "FETCH NEW",
      kind: "imap-pull",
    },
    serverState: { aQueue: 0, bMailbox: 1, idle: false },
    highlight: "Bob",
  },
  {
    title: "8. Klienten får meldingen",
    description:
      "Mailbox svarer med meldingen. Bob ser den i UI-en. Latens fra sendt → mottatt = SMTP-leveringen + tiden frem til Bob åpnet appen (kan være timer).",
    flow: {
      from: B_MAILBOX,
      to: B_CLIENT,
      protocol: "IMAP",
      payload: "meldingen",
      kind: "imap-pull",
    },
    serverState: { aQueue: 0, bMailbox: 1, idle: false },
  },
];

// Push-modus: klienten holder en åpen IDLE-forbindelse. Server pusher.
const PUSH_STEPS: Step[] = [
  {
    title: "0. Bobs klient holder IDLE-forbindelse",
    description:
      "Før Alice sender, har Bobs Mail.app allerede åpnet en IMAP IDLE-forbindelse mot mail.bob.no. Klienten sa 'IDLE' og venter passivt på melding fra server. TCP holdes åpen, ingen polling.",
    serverState: { aQueue: 0, bMailbox: 0, idle: true },
    highlight: "Bob",
  },
  ...COMMON_STEPS.map((s, idx) =>
    idx >= 0 ? { ...s, serverState: { ...s.serverState!, idle: true } } : s,
  ),
  {
    title: "6. Server pusher til IDLE-klient",
    description:
      "Så snart meldingen er i mailbox, sender server en EXISTS-notifikasjon ned den åpne IDLE-forbindelsen. Innen sekunder etter at Alice trykket Send, har Bobs telefon en push-varsling.",
    flow: {
      from: B_MAILBOX,
      to: B_CLIENT,
      protocol: "IMAP IDLE",
      payload: "* EXISTS",
      kind: "imap-push",
    },
    serverState: { aQueue: 0, bMailbox: 1, idle: true },
    highlight: "Bob",
  },
  {
    title: "7. Klienten henter meldingen",
    description:
      "Klienten svarer ut av IDLE og kjører FETCH for den nye meldingen. Bob får varslet på låseskjermen før han har rukket å lese tilbake til Alice.",
    flow: {
      from: B_MAILBOX,
      to: B_CLIENT,
      protocol: "IMAP",
      payload: "FETCH 42",
      kind: "imap-pull",
    },
    serverState: { aQueue: 0, bMailbox: 1, idle: true },
  },
];

const FLOW_COLOR: Record<Flow["kind"], { fill: string; stroke: string; bg: string }> = {
  smtp: {
    fill: "fill-rose-500",
    stroke: "stroke-rose-500/50",
    bg: "bg-rose-500",
  },
  "imap-pull": {
    fill: "fill-sky-500",
    stroke: "stroke-sky-500/50",
    bg: "bg-sky-500",
  },
  "imap-push": {
    fill: "fill-emerald-500",
    stroke: "stroke-emerald-500/50",
    bg: "bg-emerald-500",
  },
  store: {
    fill: "fill-purple-500",
    stroke: "stroke-purple-500/50",
    bg: "bg-purple-500",
  },
};

export function Section24Live() {
  const [mode, setMode] = useState<Mode>("push");
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps: Step[] = mode === "pull" ? PULL_STEPS : PUSH_STEPS;
  const step = steps[stepIdx];

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 1 / 2000;
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

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setStepIdx(0);
    setProgress(0);
    setPlaying(false);
  }

  function next() {
    setStepIdx((i) => Math.min(steps.length - 1, i + 1));
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
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground">{step.title}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => switchMode("pull")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
              mode === "pull"
                ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Inbox className="h-3 w-3" /> Pull (poll)
          </button>
          <button
            onClick={() => switchMode("push")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${
              mode === "push"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Bell className="h-3 w-3" /> Push (IDLE)
          </button>
          <span className="ml-2 font-mono text-muted-foreground">
            Steg {stepIdx + 1} / {steps.length}
          </span>
        </div>
      </div>

      <svg viewBox="0 0 700 360" className="w-full h-auto bg-muted/10">
        {/* Hovedlinje Alice → A-MTA → B-MTA → Mailbox */}
        {[
          [A_CLIENT, A_SERVER],
          [A_SERVER, B_SERVER],
          [B_SERVER, B_MAILBOX],
        ].map(([a, b], i) => (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="stroke-muted-foreground/25"
            strokeDasharray="3 3"
          />
        ))}
        {/* Mailbox ↔ Bob */}
        <line
          x1={B_MAILBOX.x}
          y1={B_MAILBOX.y}
          x2={B_CLIENT.x}
          y2={B_CLIENT.y}
          className={
            step.serverState?.idle
              ? "stroke-emerald-500/60"
              : "stroke-muted-foreground/25"
          }
          strokeDasharray={step.serverState?.idle ? undefined : "3 3"}
          strokeWidth={step.serverState?.idle ? 1.5 : 1}
        />
        {step.serverState?.idle && (
          <text
            x={(B_MAILBOX.x + B_CLIENT.x) / 2 + 8}
            y={(B_MAILBOX.y + B_CLIENT.y) / 2}
            className="fill-emerald-600 text-[9px] font-mono"
          >
            IDLE-forbindelse
          </text>
        )}

        {/* Aktiv flow */}
        {step.flow && (
          <line
            x1={step.flow.from.x}
            y1={step.flow.from.y}
            x2={step.flow.to.x}
            y2={step.flow.to.y}
            className={FLOW_COLOR[step.flow.kind].stroke}
            strokeWidth={2.5}
          />
        )}

        {/* Noder */}
        {[A_CLIENT, A_SERVER, B_SERVER, B_MAILBOX, B_CLIENT].map((n) => {
          const isHL = step.highlight === n.label;
          const isClient = n.label === "Alice" || n.label === "Bob";
          const isMailbox = n.label === "Mailbox";
          return (
            <g key={n.label}>
              {isClient ? (
                <g transform={`translate(${n.x - 16}, ${n.y - 22})`}>
                  <rect
                    width={32}
                    height={44}
                    rx={5}
                    className={
                      isHL ? "fill-brand/20 stroke-brand" : "fill-card stroke-muted-foreground/40"
                    }
                    strokeWidth={2}
                  />
                  <rect
                    x={4}
                    y={5}
                    width={24}
                    height={28}
                    className={isHL ? "fill-brand/30" : "fill-muted/40"}
                  />
                </g>
              ) : isMailbox ? (
                <g transform={`translate(${n.x - 26}, ${n.y - 22})`}>
                  <rect
                    width={52}
                    height={44}
                    rx={4}
                    className={
                      isHL
                        ? "fill-purple-500/15 stroke-purple-500"
                        : "fill-card stroke-muted-foreground/40"
                    }
                    strokeWidth={2}
                  />
                  {[0, 1, 2].map((i) => (
                    <line
                      key={i}
                      x1={6}
                      y1={10 + i * 10}
                      x2={46}
                      y2={10 + i * 10}
                      className="stroke-muted-foreground/40"
                    />
                  ))}
                </g>
              ) : (
                <rect
                  x={n.x - 32}
                  y={n.y - 22}
                  width={64}
                  height={44}
                  rx={4}
                  className={
                    isHL
                      ? "fill-rose-500/15 stroke-rose-500"
                      : "fill-card stroke-muted-foreground/40"
                  }
                  strokeWidth={2}
                />
              )}
              <text
                x={n.x}
                y={n.y + 40}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-semibold"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 52}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                {n.sub}
              </text>
              {/* Queue-indikator for servere */}
              {n.label === "Alice-MTA" && step.serverState && step.serverState.aQueue > 0 && (
                <text
                  x={n.x}
                  y={n.y - 30}
                  textAnchor="middle"
                  className="fill-amber-600 text-[9px] font-mono font-semibold"
                >
                  kø: {step.serverState.aQueue}
                </text>
              )}
              {n.label === "Mailbox" && step.serverState && step.serverState.bMailbox > 0 && (
                <text
                  x={n.x}
                  y={n.y - 30}
                  textAnchor="middle"
                  className="fill-emerald-600 text-[9px] font-mono font-semibold"
                >
                  ny melding
                </text>
              )}
            </g>
          );
        })}

        {/* Pakke */}
        {step.flow && (
          <g>
            {(() => {
              const x = step.flow.from.x + (step.flow.to.x - step.flow.from.x) * progress;
              const y = step.flow.from.y + (step.flow.to.y - step.flow.from.y) * progress;
              return (
                <>
                  <rect
                    x={x - 12}
                    y={y - 8}
                    width={24}
                    height={16}
                    rx={2}
                    className={`${FLOW_COLOR[step.flow.kind].fill} stroke-background`}
                    strokeWidth={1.5}
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-white text-[8px] font-bold"
                  >
                    {step.flow.protocol}
                  </text>
                  <text
                    x={x}
                    y={y - 14}
                    textAnchor="middle"
                    className="fill-foreground text-[9px] font-mono"
                  >
                    {step.flow.payload}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Delay-tekst (pull-modus) */}
        {step.delaySec && (
          <text
            x={350}
            y={210}
            textAnchor="middle"
            className="fill-amber-600 text-[11px] font-mono"
          >
            ⏱ {step.delaySec} sekunder går — ingen aktivitet
          </text>
        )}
      </svg>

      {/* Beskrivelse */}
      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        {step.description}
      </div>

      {/* Sammenligning */}
      <div className="px-4 py-2 border-t border-border bg-muted/20">
        <div className="text-[11px] text-muted-foreground">
          {mode === "pull"
            ? "Pull-modus: latens = SMTP-tid + tid til neste poll. Energieffektivt (ingen open socket), men dårlig opplevelse."
            : "Push-modus: latens = SMTP-tid + ~1 RTT. Klient + server holder TCP-forbindelse åpen hele tiden — koster batteri."}
        </div>
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
          {playing ? "Pause" : "Spill av"}
        </button>
        <button
          onClick={next}
          disabled={stepIdx === steps.length - 1}
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
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setStepIdx(i);
                setProgress(0);
              }}
              className={`h-1.5 w-4 rounded-full ${
                i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-brand/40" : "bg-muted-foreground/20"
              }`}
              aria-label={`Steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className={`inline-block w-2 h-2 rounded-full ${FLOW_COLOR.smtp.bg}`} /> SMTP
        <span className={`inline-block w-2 h-2 rounded-full ${FLOW_COLOR["imap-pull"].bg}`} /> IMAP pull
        <span className={`inline-block w-2 h-2 rounded-full ${FLOW_COLOR["imap-push"].bg}`} /> IMAP push
        <span className={`inline-block w-2 h-2 rounded-full ${FLOW_COLOR.store.bg}`} /> intern lagring
      </div>
    </div>
  );
}
