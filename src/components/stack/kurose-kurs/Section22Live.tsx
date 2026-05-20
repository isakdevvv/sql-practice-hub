import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Globe,
  Layers,
  Zap,
} from "lucide-react";

// Levende versjon av seksjon 2.2: HTTP-protokollen i tre generasjoner.
//
// Pedagogisk poeng:
//   HTTP/1.1 — én request av gangen per TCP-forbindelse (head-of-line blokkering på app-nivå)
//   HTTP/2  — multiplexing: mange parallelle streams over ÉN TCP-forbindelse
//   HTTP/3  — som /2, men over QUIC (UDP) → ingen TCP head-of-line ved pakketap
//
// Vi simulerer en side med 12 ressurser (HTML + CSS + JS + bilder) og viser
// hvor lang tid hver versjon bruker. Tall er forenklet til 1 RTT = 50 ms,
// hvert objekt = 1 RTT å hente (idealisert, ingen serialiserings-tid).

type Version = "h1" | "h2" | "h3";

const RTT_MS = 50; // round-trip time per "tikk"

// 12 ressurser (HTML først, så avhengige). I virkeligheten ville HTML
// først returnert, deretter browser-en finner referansene og henter dem.
const RESOURCES = [
  { name: "index.html", kind: "html" as const },
  { name: "main.css", kind: "css" as const },
  { name: "app.js", kind: "js" as const },
  { name: "logo.png", kind: "img" as const },
  { name: "hero.jpg", kind: "img" as const },
  { name: "icons.svg", kind: "img" as const },
  { name: "fonts.woff2", kind: "font" as const },
  { name: "analytics.js", kind: "js" as const },
  { name: "ads.js", kind: "js" as const },
  { name: "thumb1.jpg", kind: "img" as const },
  { name: "thumb2.jpg", kind: "img" as const },
  { name: "thumb3.jpg", kind: "img" as const },
];

const COLOR_KIND: Record<string, string> = {
  html: "bg-rose-500",
  css: "bg-sky-500",
  js: "bg-amber-500",
  img: "bg-emerald-500",
  font: "bg-purple-500",
};

const COLOR_KIND_TEXT: Record<string, string> = {
  html: "text-rose-500",
  css: "text-sky-500",
  js: "text-amber-500",
  img: "text-emerald-500",
  font: "text-purple-500",
};

// HTTP/1.1: én TCP-forbindelse, sekvensiell. Vi later som
// browser-en åpner 6 parallelle TCP-forbindelser (vanlig grense).
// Hver forbindelse plukker neste ledige ressurs.
function scheduleH1(resources: typeof RESOURCES, parallelConns = 6) {
  // Hver "connection" har en current-time-pointer
  const conns = Array.from({ length: parallelConns }, () => ({
    busyUntil: 1, // RTT 1 = TCP-handshake antas å være over
    items: [] as { idx: number; start: number; end: number }[],
  }));
  // RTT 0..1: TCP-handshake (alle conns parallelt — vi forenkler)
  const result: { idx: number; conn: number; start: number; end: number }[] = [];
  // HTML først, må komme tilbake før browseren kan finne referansene
  // (kritisk path). Vi simulerer: HTML på conn 0, deretter venter resten
  // til HTML er hjemme.
  result.push({ idx: 0, conn: 0, start: 1, end: 2 });
  conns[0].busyUntil = 2;

  // Etter HTML (tilgjengelig ved tid 2) — fordel rest til ledige conns.
  for (let i = 1; i < resources.length; i++) {
    // Velg conn med tidligst busyUntil
    let best = 0;
    for (let c = 1; c < conns.length; c++) {
      if (conns[c].busyUntil < conns[best].busyUntil) best = c;
    }
    const start = Math.max(conns[best].busyUntil, 2);
    const end = start + 1;
    result.push({ idx: i, conn: best, start, end });
    conns[best].busyUntil = end;
  }
  const totalRtt = Math.max(...result.map((r) => r.end));
  return { events: result, totalRtt };
}

// HTTP/2: én TCP-forbindelse, alle ressurser multiplekses parallelt
// over streams. Vi modellerer som: HTML først (kritisk path), så
// alle resten parallelt i én RTT (i praksis begrenset av båndbredde,
// men idealisert her).
function scheduleH2(resources: typeof RESOURCES) {
  const events: { idx: number; conn: number; start: number; end: number }[] = [];
  // RTT 1: TCP+TLS handshake (forenklet)
  events.push({ idx: 0, conn: 0, start: 1, end: 2 });
  // RTT 2: alle resterende ressurser samtidig over én forbindelse
  for (let i = 1; i < resources.length; i++) {
    events.push({ idx: i, conn: 0, start: 2, end: 3 });
  }
  return { events, totalRtt: 3 };
}

// HTTP/3: QUIC (UDP). Etablerer sesjon på 1 RTT (0-RTT ved gjenbesøk).
// Multiplexing som /2, men ingen TCP head-of-line: pakketap på én
// stream blokkerer ikke andre.
function scheduleH3(resources: typeof RESOURCES) {
  const events: { idx: number; conn: number; start: number; end: number }[] = [];
  // RTT 0..0.5: QUIC handshake (samme RTT som TLS, men kombinert)
  events.push({ idx: 0, conn: 0, start: 0.5, end: 1.5 });
  for (let i = 1; i < resources.length; i++) {
    events.push({ idx: i, conn: 0, start: 1.5, end: 2.5 });
  }
  return { events, totalRtt: 2.5 };
}

export function Section22Live() {
  const [version, setVersion] = useState<Version>("h1");
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0); // virtuell tid i RTT
  const [showCompare, setShowCompare] = useState(false);

  const schedule = useMemo(() => {
    if (version === "h1") return scheduleH1(RESOURCES);
    if (version === "h2") return scheduleH2(RESOURCES);
    return scheduleH3(RESOURCES);
  }, [version]);

  // Animasjon
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 1 / 1200; // 1 RTT = 1.2 s i visualiseringen
    function tick(now: number) {
      const dt = now - last;
      last = now;
      setT((cur) => {
        const next = cur + dt * SPEED;
        if (next >= schedule.totalRtt + 0.5) {
          setPlaying(false);
          return schedule.totalRtt + 0.5;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, schedule.totalRtt]);

  function switchVersion(v: Version) {
    if (v === version) return;
    setVersion(v);
    setT(0);
    setPlaying(false);
  }

  function reset() {
    setT(0);
    setPlaying(false);
  }

  function jumpEnd() {
    setT(schedule.totalRtt);
    setPlaying(false);
  }

  function jumpStart() {
    setT(0);
    setPlaying(false);
  }

  const elapsedMs = Math.round(t * RTT_MS);
  const totalMs = Math.round(schedule.totalRtt * RTT_MS);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Versjon-toggle */}
      <div className="bg-muted/30 px-4 py-2 text-xs border-b border-border flex items-center gap-2 flex-wrap">
        <span className="font-medium text-foreground">
          Laster vg.no — {RESOURCES.length} ressurser, 1 RTT = {RTT_MS} ms
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => switchVersion("h1")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              version === "h1"
                ? "bg-rose-500/15 text-rose-500"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Globe className="h-3 w-3" /> HTTP/1.1
          </button>
          <button
            onClick={() => switchVersion("h2")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              version === "h2"
                ? "bg-amber-500/15 text-amber-500"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Layers className="h-3 w-3" /> HTTP/2
          </button>
          <button
            onClick={() => switchVersion("h3")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              version === "h3"
                ? "bg-emerald-500/15 text-emerald-500"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Zap className="h-3 w-3" /> HTTP/3
          </button>
        </div>
      </div>

      {/* Waterfall-diagram */}
      <Waterfall
        version={version}
        events={schedule.events}
        totalRtt={schedule.totalRtt}
        t={t}
      />

      {/* Forklaring */}
      <div className="px-4 py-3 text-sm text-muted-foreground border-t border-border">
        <p>{describe(version)}</p>
      </div>

      {/* Tid + last/progress */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Tid brukt</span>
          <span className="font-mono text-foreground">
            {elapsedMs} / {totalMs} ms ({schedule.totalRtt.toFixed(1)} RTT)
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-[width] duration-100 ${
              version === "h1"
                ? "bg-rose-500"
                : version === "h2"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
            style={{
              width: `${Math.min(100, (t / schedule.totalRtt) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Kontroller */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20">
        <button
          onClick={jumpStart}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <SkipBack className="h-3 w-3" /> Start
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : t >= schedule.totalRtt ? "Spill av igjen" : "Spill av"}
        </button>
        <button
          onClick={jumpEnd}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          Slutt <SkipForward className="h-3 w-3" />
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
          title="Reset"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <button
          onClick={() => setShowCompare((s) => !s)}
          className={`ml-auto inline-flex items-center gap-1 rounded border px-2 py-1 text-xs ${
            showCompare
              ? "border-brand/60 bg-brand/15 text-brand"
              : "border-border bg-background hover:border-brand/60"
          }`}
        >
          {showCompare ? "Skjul sammenligning" : "Sammenlign alle tre"}
        </button>
      </div>

      {showCompare && <CompareAll />}

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_KIND.html}`} /> HTML
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_KIND.css}`} /> CSS
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_KIND.js}`} /> JS
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_KIND.img}`} /> Bilde
        <span className={`inline-block w-2 h-2 rounded-full ${COLOR_KIND.font}`} /> Font
      </div>
    </div>
  );
}

// ============================================================
// Waterfall-visualisering
// ============================================================
function Waterfall({
  version,
  events,
  totalRtt,
  t,
}: {
  version: Version;
  events: { idx: number; conn: number; start: number; end: number }[];
  totalRtt: number;
  t: number;
}) {
  const W = 800;
  const H = 360;
  const LEFT = 140;
  const RIGHT = 20;
  const TOP = 30;
  const ROW_H = 24;
  const innerW = W - LEFT - RIGHT;

  const xOfRtt = (r: number) => LEFT + (r / (totalRtt + 0.2)) * innerW;

  // Group events by resource
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-muted/10">
      {/* RTT-tidsmarkører */}
      {Array.from({ length: Math.ceil(totalRtt) + 1 }).map((_, i) => (
        <g key={i}>
          <line
            x1={xOfRtt(i)}
            y1={TOP - 8}
            x2={xOfRtt(i)}
            y2={H - 30}
            className="stroke-muted-foreground/15"
            strokeDasharray="2 3"
          />
          <text
            x={xOfRtt(i)}
            y={TOP - 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px] font-mono"
          >
            {i === 0 ? "0" : `${i} RTT`}
          </text>
        </g>
      ))}

      {/* Forbindelses-bånd-bakgrunn (kun for HTTP/1.1) */}
      {version === "h1" &&
        Array.from({ length: 6 }).map((_, c) => (
          <rect
            key={c}
            x={LEFT - 6}
            y={TOP + c * 6 + 2}
            width={innerW + 12}
            height={3}
            className="fill-muted/40"
            rx={1.5}
          />
        ))}

      {/* Etiketter for forbindelser */}
      {version === "h1" ? (
        <text
          x={LEFT - 8}
          y={TOP + 22}
          textAnchor="end"
          className="fill-muted-foreground text-[9px] font-mono"
        >
          6 TCP-forbindelser
        </text>
      ) : (
        <text
          x={LEFT - 8}
          y={TOP + 22}
          textAnchor="end"
          className="fill-muted-foreground text-[9px] font-mono"
        >
          {version === "h2" ? "1 TCP-forbindelse" : "1 QUIC-sesjon"}
        </text>
      )}

      {/* Hver ressurs som en rad */}
      {RESOURCES.map((res, i) => {
        const y = TOP + 30 + i * ROW_H;
        const ev = events.find((e) => e.idx === i);
        if (!ev) return null;
        const x1 = xOfRtt(ev.start);
        const x2 = xOfRtt(ev.end);
        const visibleEnd = Math.min(t, ev.end);
        const visiblePct =
          visibleEnd <= ev.start
            ? 0
            : Math.min(1, (visibleEnd - ev.start) / (ev.end - ev.start));
        const isDone = t >= ev.end;
        const isActive = t >= ev.start && t < ev.end;

        return (
          <g key={res.name}>
            {/* Navn */}
            <text
              x={LEFT - 10}
              y={y + 11}
              textAnchor="end"
              className={`text-[10px] font-mono ${
                isDone
                  ? "fill-foreground"
                  : isActive
                    ? "fill-foreground"
                    : "fill-muted-foreground/70"
              }`}
            >
              {res.name}
            </text>
            {/* Skygge-bar (full bredde) */}
            <rect
              x={x1}
              y={y + 4}
              width={Math.max(2, x2 - x1)}
              height={14}
              rx={2}
              className="fill-muted/40"
            />
            {/* Aktiv bar */}
            <rect
              x={x1}
              y={y + 4}
              width={Math.max(2, (x2 - x1) * visiblePct)}
              height={14}
              rx={2}
              className={COLOR_KIND[res.kind]}
              opacity={isDone || isActive ? 0.9 : 0.5}
            />
            {/* Conn-indikator (kun /1.1) */}
            {version === "h1" && (
              <text
                x={x1 + 4}
                y={y + 14}
                className="fill-white text-[8px] font-mono"
                opacity={0.9}
              >
                c{ev.conn}
              </text>
            )}
          </g>
        );
      })}

      {/* Tids-cursor */}
      <line
        x1={xOfRtt(Math.min(t, totalRtt + 0.2))}
        y1={TOP - 4}
        x2={xOfRtt(Math.min(t, totalRtt + 0.2))}
        y2={H - 30}
        className="stroke-foreground"
        strokeWidth={1}
      />
    </svg>
  );
}

// ============================================================
// Bunntekst — beskrivelse av versjon
// ============================================================
function describe(v: Version): string {
  if (v === "h1") {
    return "HTTP/1.1 åpner én TCP-forbindelse per request (eller bruker keep-alive sekvensielt). For å laste mange ressurser åpner browser-en typisk 6 parallelle TCP-forbindelser per origin. Hver av dem henter én ressurs av gangen — så du får 6 i parallell, men ikke flere. Resultatet er en lang waterfall med 'trapper' når forbindelsene serialiserer requests.";
  }
  if (v === "h2") {
    return "HTTP/2 multiplekser mange requests over én TCP-forbindelse. Hver request er en 'stream' med egen ID. Browser-en sender alle requests samtidig, serveren returnerer svar i den rekkefølgen som passer. Ingen 'connection limit' og ingen oppstart-kostnad for flere forbindelser. Achilleshæl: hvis én TCP-pakke tapes, blokkerer det ALLE streams (TCP head-of-line blocking).";
  }
  return "HTTP/3 erstatter TCP med QUIC (over UDP). Streams er uavhengige helt ned til transport-laget — pakketap på én stream stopper ikke de andre. QUIC kombinerer transport + TLS, så handshake tar 1 RTT (0-RTT ved gjenbesøk). Spesielt nyttig på mobile nett der pakketap er vanlig.";
}

// ============================================================
// Sammenligningspanel
// ============================================================
function CompareAll() {
  const s1 = scheduleH1(RESOURCES);
  const s2 = scheduleH2(RESOURCES);
  const s3 = scheduleH3(RESOURCES);
  const max = Math.max(s1.totalRtt, s2.totalRtt, s3.totalRtt);

  const rows = [
    { v: "HTTP/1.1", rtt: s1.totalRtt, color: "bg-rose-500" },
    { v: "HTTP/2", rtt: s2.totalRtt, color: "bg-amber-500" },
    { v: "HTTP/3", rtt: s3.totalRtt, color: "bg-emerald-500" },
  ];

  return (
    <div className="px-4 py-3 border-t border-border bg-muted/10 space-y-2">
      <p className="text-[11px] text-muted-foreground">
        Total tid for å laste {RESOURCES.length} ressurser (idealisert):
      </p>
      {rows.map((r) => (
        <div key={r.v} className="flex items-center gap-2 text-xs">
          <span className="w-16 font-mono text-foreground">{r.v}</span>
          <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
            <div
              className={`h-full ${r.color}`}
              style={{ width: `${(r.rtt / max) * 100}%` }}
            />
          </div>
          <span className="w-20 text-right font-mono text-muted-foreground">
            {(r.rtt * RTT_MS).toFixed(0)} ms
          </span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground pt-1">
        Antagelser: 1 RTT = {RTT_MS} ms, 1 ressurs = 1 RTT å hente, HTML er kritisk path (må
        komme tilbake først). HTTP/1.1 åpner 6 parallelle TCP-forbindelser. HTTP/2 og /3
        multiplekser over én. Reelle tall avhenger sterkt av båndbredde, server-CPU og pakketap.
      </p>
    </div>
  );
}
