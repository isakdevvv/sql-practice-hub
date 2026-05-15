import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ChevronsRight, Radio } from "lucide-react";

// ---------------------------------------------------------------------------
// CSMA-progresjonen — ALOHA → slottet ALOHA → CSMA → CSMA/CD → CSMA/CA + RTS/CTS.
// Hver modus pre-computer en tidslinje fra en seedet RNG, slik at "Step" og
// "Play" bare avanserer en peker over et ferdig-beregnet hendelsesforløp.
// Tidslinjen tegnes som horisontale baner — en per sender. Transmisjoner er
// farget; kollisjoner får rødt overlapp; backoff vises som grå skravur.
// ---------------------------------------------------------------------------

type Mode = "aloha" | "slotted" | "csma" | "csmacd" | "csmaca";

type Segment = {
  /** Sender-indeks (0-basert) */
  sender: number;
  start: number;
  end: number;
  kind:
    | "tx" // vellykket eller pågående sending
    | "collision" // kolliderte med en annen sending
    | "backoff" // vente-vindu etter kollisjon
    | "wait" // 1-persistent venting på idle kanal
    | "rts" // RTS-pakke (CSMA/CA)
    | "cts" // CTS-pakke (CSMA/CA)
    | "ack"; // ACK-pakke (CSMA/CA)
  attempt?: number; // brukes for CD-backoff-tekst
};

type Timeline = {
  totalTime: number;
  segments: Segment[];
  events: string[]; // korte tekstbeskrivelser av sentrale hendelser
  throughput: number; // andel tid kanalen brukes produktivt
};

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "aloha", label: "Pure ALOHA", sub: "send når du vil — håp om det beste" },
  { id: "slotted", label: "Slottet ALOHA", sub: "synkronisert til tidsluker" },
  { id: "csma", label: "CSMA (1-persistent)", sub: "lytt før du sender" },
  { id: "csmacd", label: "CSMA/CD", sub: "oppdage kollisjon + binær eksponentiell backoff" },
  { id: "csmaca", label: "CSMA/CA + RTS/CTS", sub: "WiFi — løser skjult-terminal" },
];

const MODE_INTRO: Record<Mode, string> = {
  aloha:
    "Hver sender velger tidspunkt fra en Poisson-aktig prosess og fyrer av. Ingen lytter. Kollisjoner = overlapp ⇒ begge rammene tapes. Maks teoretisk gjennomstrømming: 18%.",
  slotted:
    "Tiden er delt i like luker. En sender starter bare på en luke-grense. Hvis to velger samme luke kolliderer de fortsatt — men halvparten av overlapps-vinduet er borte. Maks: 37%.",
  csma:
    "1-persistent: lytt — hvis idle, send straks. Problemet: hvis flere ventet samtidig, fyrer alle av i samme øyeblikk kanalen blir ledig. Propageringsforsinkelse gjør at de oppdager kollisjonen for sent.",
  csmacd:
    "Carrier sense + collision detection. Senderen lytter mens den sender. Oppdager kollisjon ⇒ avbryt umiddelbart + send jam + binær eksponentiell backoff: forsøk n velger tilfeldig fra {0, 1, …, 2ⁿ−1} slots. Ethernet-klassisk.",
  csmaca:
    "Trådløst kan ikke høre seg selv mens det sender (skjult-terminal-problemet). Løses med RTS/CTS-håndtrykk før dataoverføring: avsender ber om kanalen, mottaker kunngjør reservasjonen til alle naboer. Etterpå sendes ACK.",
};

// ---------- seedet RNG (mulberry32) -----------
function makeRng(seed: number) {
  let s = seed >>> 0;
  return function rng() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- modus-spesifikke simulasjoner ----------

const FRAME_LEN = 6; // tidsslukk frame tar
const PROP_DELAY = 1; // hvor lenge etter start en annen station fortsatt kan starte (CSMA)
const SIM_TIME = 70;

type RawAttempt = { sender: number; start: number };

function generateAttempts(
  numSenders: number,
  rate: number,
  rng: () => number,
  align?: number, // hvis satt: rund opp til nærmeste multiplum (slottet)
): RawAttempt[] {
  // rate = forventet antall forsøk per sender per tidsenhet
  const out: RawAttempt[] = [];
  for (let s = 0; s < numSenders; s++) {
    let t = 0;
    while (t < SIM_TIME) {
      const u = Math.max(rng(), 1e-6);
      const dt = -Math.log(u) / rate;
      t += dt;
      if (t >= SIM_TIME) break;
      let start = t;
      if (align && align > 0) start = Math.ceil(t / align) * align;
      out.push({ sender: s, start });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

function simulateAloha(
  numSenders: number,
  rate: number,
  seed: number,
  slotted: boolean,
): Timeline {
  const rng = makeRng(seed);
  const attempts = generateAttempts(numSenders, rate, rng, slotted ? FRAME_LEN : undefined);
  // For pure ALOHA: kollisjon hvis to forsøk overlapper i [start, start+FRAME].
  // For slottet: kollisjon hvis to har samme start.
  const segments: Segment[] = [];
  const events: string[] = [];
  // marker hvilke som kolliderer
  const collided = new Array(attempts.length).fill(false);
  for (let i = 0; i < attempts.length; i++) {
    for (let j = i + 1; j < attempts.length; j++) {
      const a = attempts[i];
      const b = attempts[j];
      const overlap = slotted
        ? a.start === b.start
        : a.start + FRAME_LEN > b.start && b.start + FRAME_LEN > a.start;
      if (overlap) {
        collided[i] = true;
        collided[j] = true;
      }
    }
  }
  let productive = 0;
  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    const end = Math.min(a.start + FRAME_LEN, SIM_TIME);
    segments.push({
      sender: a.sender,
      start: a.start,
      end,
      kind: collided[i] ? "collision" : "tx",
    });
    if (!collided[i]) productive += end - a.start;
    if (collided[i] && events.length < 8) {
      events.push(
        `t=${a.start.toFixed(1)}: sender ${String.fromCharCode(65 + a.sender)} kolliderte`,
      );
    }
  }
  if (events.length === 0) events.push("Ingen kollisjoner i dette tilfellet — heldig seed.");
  return {
    totalTime: SIM_TIME,
    segments,
    events,
    throughput: productive / SIM_TIME,
  };
}

function simulateCsma(numSenders: number, rate: number, seed: number): Timeline {
  // 1-persistent: hver sender genererer "ønsker"-tidspunkter. Når kanalen blir
  // idle, alle ventende ønsker starter samtidig (klassisk problem).
  const rng = makeRng(seed);
  const wishes = generateAttempts(numSenders, rate, rng);
  const segments: Segment[] = [];
  const events: string[] = [];
  // grunnleggende simulasjon: itererer i tid
  type Active = { sender: number; start: number; end: number };
  const active: Active[] = [];
  const queued: { sender: number; since: number }[] = [];
  let wi = 0;
  let t = 0;
  let productive = 0;
  let lastIdleStart = 0;
  // hjelp: kanal er busy hvis noen pågående
  const isBusy = () => active.length > 0;
  while (t < SIM_TIME) {
    // ta inn nye ønsker som har «modnet»
    while (wi < wishes.length && wishes[wi].start <= t) {
      const w = wishes[wi++];
      if (!queued.find((q) => q.sender === w.sender) && !active.find((a) => a.sender === w.sender)) {
        if (isBusy()) {
          queued.push({ sender: w.sender, since: w.start });
        } else {
          // starter med en gang
          active.push({ sender: w.sender, start: w.start, end: w.start + FRAME_LEN });
        }
      }
    }
    // hvis kanalen er ledig OG det finnes ventende → alle starter (1-persistent)
    if (!isBusy() && queued.length > 0) {
      for (const q of queued) {
        active.push({ sender: q.sender, start: t, end: t + FRAME_LEN });
      }
      queued.length = 0;
    }
    if (!isBusy()) {
      // hopp til neste hendelse
      const nextWish = wi < wishes.length ? wishes[wi].start : SIM_TIME;
      t = Math.max(t + 0.01, nextWish);
      lastIdleStart = t;
      continue;
    }
    // finn neste hendelse: enten en pågående slutter, eller en kollisjon innen prop-vindu
    const earliestEnd = Math.min(...active.map((a) => a.end));
    t = earliestEnd;
    // sjekk kollisjon: alle pågående som startet innen PROP_DELAY av hverandre kolliderer
    const collisions = new Set<number>();
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        if (Math.abs(active[i].start - active[j].start) <= PROP_DELAY) {
          collisions.add(i);
          collisions.add(j);
        }
      }
    }
    for (let i = 0; i < active.length; i++) {
      const a = active[i];
      if (collisions.has(i)) {
        segments.push({ sender: a.sender, start: a.start, end: a.end, kind: "collision" });
        if (events.length < 8)
          events.push(
            `t=${a.start.toFixed(1)}: ${String.fromCharCode(
              65 + a.sender,
            )} startet samtidig som annen sender — kollisjon`,
          );
      } else {
        segments.push({ sender: a.sender, start: a.start, end: a.end, kind: "tx" });
        productive += a.end - a.start;
      }
    }
    active.length = 0;
    void lastIdleStart;
  }
  // visualiser ventetider for ennå-ikke-startede ønsker som "wait"
  // (vi har allerede konsumert dem ved å starte sending)
  return { totalTime: SIM_TIME, segments, events: events.length ? events : ["Alt gikk fint."], throughput: productive / SIM_TIME };
}

function simulateCsmaCd(numSenders: number, rate: number, seed: number): Timeline {
  const rng = makeRng(seed);
  const wishes = generateAttempts(numSenders, rate, rng);
  const segments: Segment[] = [];
  const events: string[] = [];
  type Pending = { sender: number; readyAt: number; attempt: number };
  const queue: Pending[] = wishes.map((w) => ({ sender: w.sender, readyAt: w.start, attempt: 0 }));
  let productive = 0;
  let t = 0;
  const COLLISION_DETECT = PROP_DELAY + 0.4; // tid før kollisjon detekteres
  // greedy: hvert iterasjons-pass plukker alle som er klare og kanalen er fri
  let busyUntil = 0;
  while (queue.length > 0) {
    // ta de neste klare
    queue.sort((a, b) => a.readyAt - b.readyAt);
    const next = queue[0];
    if (next.readyAt >= SIM_TIME) break;
    t = Math.max(t, next.readyAt, busyUntil);
    if (t >= SIM_TIME) break;
    // hvor mange andre er klare innen PROP_DELAY av t? (samtidig fyring)
    const firing: Pending[] = [];
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].readyAt <= t + PROP_DELAY) {
        firing.push(queue[i]);
        queue.splice(i, 1);
      }
    }
    if (firing.length === 1) {
      const f = firing[0];
      const end = Math.min(t + FRAME_LEN, SIM_TIME);
      segments.push({ sender: f.sender, start: t, end, kind: "tx" });
      productive += end - t;
      busyUntil = end;
    } else {
      // kollisjon — detekteres etter COLLISION_DETECT, alle aborterer, backoff
      const detectEnd = Math.min(t + COLLISION_DETECT, SIM_TIME);
      for (const f of firing) {
        segments.push({ sender: f.sender, start: t, end: detectEnd, kind: "collision", attempt: f.attempt + 1 });
      }
      if (events.length < 8) {
        events.push(
          `t=${t.toFixed(1)}: kollisjon (${firing
            .map((f) => String.fromCharCode(65 + f.sender))
            .join(", ")}) → eksponentiell backoff`,
        );
      }
      busyUntil = detectEnd;
      // backoff: hver part velger tilfeldig fra [0, 2^n − 1] slots, slot ≈ FRAME_LEN/4
      const SLOT = 1.5;
      for (const f of firing) {
        const attempt = f.attempt + 1;
        const window = (1 << Math.min(attempt, 10)) - 1; // 2^n − 1
        const k = Math.floor(rng() * (window + 1));
        const backoffLen = k * SLOT + 0.001;
        const backoffEnd = Math.min(detectEnd + backoffLen, SIM_TIME);
        segments.push({
          sender: f.sender,
          start: detectEnd,
          end: backoffEnd,
          kind: "backoff",
          attempt,
        });
        queue.push({ sender: f.sender, readyAt: backoffEnd, attempt });
      }
    }
  }
  if (events.length === 0) events.push("Ingen kollisjoner — sjelden, men mulig.");
  return { totalTime: SIM_TIME, segments, events, throughput: productive / SIM_TIME };
}

function simulateCsmaCa(numSenders: number, rate: number, seed: number): Timeline {
  // Forenklet: A og C (skjult for hverandre) vil sende til AP/B. Vi sender RTS,
  // hvis ingen RTS-kollisjon: B svarer CTS, deretter data + ACK. Hvis to RTS
  // kolliderer → backoff. Bruker numSenders som faktiske parter (men minst 2).
  const n = Math.max(2, numSenders);
  const rng = makeRng(seed);
  const wishes = generateAttempts(n, rate, rng);
  const segments: Segment[] = [];
  const events: string[] = [];
  const RTS_LEN = 1;
  const CTS_LEN = 1;
  const ACK_LEN = 1;
  const SIFS = 0.4;
  type Pending = { sender: number; readyAt: number; attempt: number };
  const queue: Pending[] = wishes.map((w) => ({ sender: w.sender, readyAt: w.start, attempt: 0 }));
  let busyUntil = 0;
  let productive = 0;
  while (queue.length > 0) {
    queue.sort((a, b) => a.readyAt - b.readyAt);
    const next = queue[0];
    if (next.readyAt >= SIM_TIME) break;
    let t = Math.max(next.readyAt, busyUntil);
    if (t >= SIM_TIME) break;
    const firing: Pending[] = [];
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].readyAt <= t + PROP_DELAY) {
        firing.push(queue[i]);
        queue.splice(i, 1);
      }
    }
    if (firing.length === 1) {
      const f = firing[0];
      // RTS
      const rtsEnd = Math.min(t + RTS_LEN, SIM_TIME);
      segments.push({ sender: f.sender, start: t, end: rtsEnd, kind: "rts" });
      // CTS fra AP — vi tegner den i en egen "lane" (siste indeks = AP)
      const ctsStart = rtsEnd + SIFS;
      const ctsEnd = Math.min(ctsStart + CTS_LEN, SIM_TIME);
      segments.push({ sender: n, start: ctsStart, end: ctsEnd, kind: "cts" });
      // DATA
      const dataStart = ctsEnd + SIFS;
      const dataEnd = Math.min(dataStart + FRAME_LEN, SIM_TIME);
      segments.push({ sender: f.sender, start: dataStart, end: dataEnd, kind: "tx" });
      productive += dataEnd - dataStart;
      // ACK
      const ackStart = dataEnd + SIFS;
      const ackEnd = Math.min(ackStart + ACK_LEN, SIM_TIME);
      segments.push({ sender: n, start: ackStart, end: ackEnd, kind: "ack" });
      busyUntil = ackEnd;
      if (events.length < 6) {
        events.push(
          `t=${t.toFixed(1)}: ${String.fromCharCode(
            65 + f.sender,
          )} sendte RTS → CTS → DATA → ACK uten kollisjon`,
        );
      }
    } else {
      // RTS-kollisjon
      const rtsEnd = Math.min(t + RTS_LEN + 0.2, SIM_TIME);
      for (const f of firing) {
        segments.push({
          sender: f.sender,
          start: t,
          end: rtsEnd,
          kind: "collision",
          attempt: f.attempt + 1,
        });
      }
      busyUntil = rtsEnd;
      if (events.length < 6) {
        events.push(
          `t=${t.toFixed(1)}: RTS-kollisjon (${firing
            .map((f) => String.fromCharCode(65 + f.sender))
            .join(", ")}) — men kun korte RTS-rammer tapes`,
        );
      }
      const SLOT = 1.5;
      for (const f of firing) {
        const attempt = f.attempt + 1;
        const window = (1 << Math.min(attempt, 10)) - 1;
        const k = Math.floor(rng() * (window + 1));
        const backoffEnd = Math.min(rtsEnd + k * SLOT + 0.001, SIM_TIME);
        segments.push({ sender: f.sender, start: rtsEnd, end: backoffEnd, kind: "backoff", attempt });
        queue.push({ sender: f.sender, readyAt: backoffEnd, attempt });
      }
    }
  }
  if (events.length === 0)
    events.push("Trafikken gikk gjennom uten kollisjon — RTS/CTS reserverte kanalen rent.");
  return { totalTime: SIM_TIME, segments, events, throughput: productive / SIM_TIME };
}

function buildTimeline(mode: Mode, numSenders: number, rate: number, seed: number): Timeline {
  if (mode === "aloha") return simulateAloha(numSenders, rate, seed, false);
  if (mode === "slotted") return simulateAloha(numSenders, rate, seed, true);
  if (mode === "csma") return simulateCsma(numSenders, rate, seed);
  if (mode === "csmacd") return simulateCsmaCd(numSenders, rate, seed);
  return simulateCsmaCa(numSenders, rate, seed);
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------

export function CsmaVisualizer() {
  const [mode, setMode] = useState<Mode>("aloha");
  const [numSenders, setNumSenders] = useState(3);
  const [rate, setRate] = useState(0.06); // forsøk per tidsenhet per sender
  const [seed, setSeed] = useState(7);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const timeline = useMemo(
    () => buildTimeline(mode, numSenders, rate, seed),
    [mode, numSenders, rate, seed],
  );

  // I CSMA/CA legger vi en ekstra "AP"-bane på toppen
  const lanes = mode === "csmaca" ? numSenders + 1 : numSenders;

  // --- play-loop ---
  useEffect(() => {
    if (!playing) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (!lastTickRef.current) lastTickRef.current = ts;
      const dt = (ts - lastTickRef.current) / 1000;
      lastTickRef.current = ts;
      setPlayhead((p) => {
        const next = p + dt * 12; // 12 simulering-enheter per sekund
        if (next >= timeline.totalTime) {
          setPlaying(false);
          return timeline.totalTime;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [playing, timeline.totalTime]);

  // reset playhead når parametre endres
  useEffect(() => {
    setPlayhead(0);
    setPlaying(false);
  }, [mode, numSenders, rate, seed]);

  const reset = () => {
    setPlayhead(0);
    setPlaying(false);
  };
  const step = () => {
    setPlaying(false);
    setPlayhead((p) => Math.min(p + 2, timeline.totalTime));
  };

  // ----------- Tegning -----------
  const TICK_PX = 11;
  const LANE_HEIGHT = 38;
  const LABEL_W = 60;
  const svgW = LABEL_W + timeline.totalTime * TICK_PX + 16;
  const svgH = LANE_HEIGHT * lanes + 36;

  const visibleSegs = timeline.segments.filter((s) => s.start <= playhead);

  const senderName = (i: number) =>
    mode === "csmaca" && i === numSenders ? "AP" : String.fromCharCode(65 + i);

  const colorFor = (kind: Segment["kind"]) => {
    switch (kind) {
      case "tx":
        return { fill: "rgb(34 197 94 / 0.85)", stroke: "rgb(22 163 74)", text: "DATA" };
      case "collision":
        return { fill: "rgb(244 63 94 / 0.85)", stroke: "rgb(225 29 72)", text: "✗ koll." };
      case "backoff":
        return { fill: "url(#hatch)", stroke: "rgb(120 113 108)", text: "backoff" };
      case "wait":
        return { fill: "rgb(148 163 184 / 0.4)", stroke: "rgb(100 116 139)", text: "vent" };
      case "rts":
        return { fill: "rgb(59 130 246 / 0.85)", stroke: "rgb(37 99 235)", text: "RTS" };
      case "cts":
        return { fill: "rgb(168 85 247 / 0.85)", stroke: "rgb(147 51 234)", text: "CTS" };
      case "ack":
        return { fill: "rgb(20 184 166 / 0.85)", stroke: "rgb(13 148 136)", text: "ACK" };
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header med modus-velger */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-brand" />
              MAC-progresjonen: ALOHA → CSMA → CSMA/CD → CSMA/CA
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
              title={m.sub}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{MODE_INTRO[mode]}</p>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-0">
        {/* Kontrollpanel */}
        <div className="border-b md:border-b-0 md:border-r border-border p-4 space-y-4">
          <div>
            <label
              htmlFor="csma-n"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Antall sendere ({numSenders})
            </label>
            <input
              id="csma-n"
              type="range"
              min={2}
              max={5}
              value={numSenders}
              onChange={(e) => setNumSenders(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor="csma-rate"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Ankomstrate (λ = {rate.toFixed(2)} / tidsenhet · sender)
            </label>
            <input
              id="csma-rate"
              type="range"
              min={0.02}
              max={0.2}
              step={0.01}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label
              htmlFor="csma-seed"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Seed (samme seed = samme sekvens)
            </label>
            <div className="mt-1 flex gap-1.5">
              <input
                id="csma-seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value || "0", 10))}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setSeed(Math.floor(Math.random() * 1000))}
                className="text-xs px-2 rounded-md border border-border hover:bg-muted"
                title="Tilfeldig seed"
              >
                🎲
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex items-center gap-1 rounded-md border border-brand bg-brand/10 text-brand px-3 py-1.5 text-xs font-medium hover:bg-brand/20"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={step}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
              Step
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="pt-2 border-t border-border space-y-1">
            <Stat label="t (nå)" value={`${playhead.toFixed(1)} / ${timeline.totalTime}`} />
            <Stat label="Nyttetid" value={`${(timeline.throughput * 100).toFixed(0)}%`} />
            <Stat
              label="Kollisjoner"
              value={String(
                timeline.segments.filter((s) => s.kind === "collision").length /
                  // hver kollisjon teller én per deltakende sender — del på 2 for grovt antall
                  Math.max(1, mode === "csmaca" ? 1 : 1),
              )}
            />
          </div>
        </div>

        {/* Tidslinje */}
        <div className="p-4">
          {mode === "csmaca" && <HiddenTerminalDiagram />}
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Tidslinje per sender — kanal vises som overlapp
          </div>
          <div className="overflow-x-auto rounded-md border border-border bg-background">
            <svg width={svgW} height={svgH} role="img" aria-label={`Tidslinje for ${mode}`}>
              <defs>
                <pattern
                  id="hatch"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill="rgb(229 231 235)" />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="rgb(120 113 108)" strokeWidth="1.5" />
                </pattern>
              </defs>

              {/* lane-bakgrunner */}
              {Array.from({ length: lanes }).map((_, i) => (
                <g key={i}>
                  <rect
                    x={0}
                    y={i * LANE_HEIGHT + 4}
                    width={svgW}
                    height={LANE_HEIGHT - 6}
                    fill={i % 2 === 0 ? "rgb(248 250 252 / 0.6)" : "transparent"}
                  />
                  <text
                    x={6}
                    y={i * LANE_HEIGHT + LANE_HEIGHT / 2 + 4}
                    className="fill-muted-foreground"
                    style={{ font: "11px ui-sans-serif, system-ui" }}
                  >
                    {senderName(i)}
                  </text>
                  <line
                    x1={LABEL_W}
                    y1={i * LANE_HEIGHT + LANE_HEIGHT / 2}
                    x2={svgW - 8}
                    y2={i * LANE_HEIGHT + LANE_HEIGHT / 2}
                    stroke="rgb(226 232 240)"
                    strokeDasharray="2,3"
                  />
                </g>
              ))}

              {/* slot-grid for slotted ALOHA */}
              {mode === "slotted" &&
                Array.from({ length: Math.ceil(timeline.totalTime / FRAME_LEN) + 1 }).map(
                  (_, k) => (
                    <line
                      key={k}
                      x1={LABEL_W + k * FRAME_LEN * TICK_PX}
                      y1={2}
                      x2={LABEL_W + k * FRAME_LEN * TICK_PX}
                      y2={LANE_HEIGHT * lanes}
                      stroke="rgb(203 213 225)"
                      strokeWidth={0.5}
                    />
                  ),
                )}

              {/* segmenter */}
              {visibleSegs.map((s, idx) => {
                const c = colorFor(s.kind);
                const x = LABEL_W + s.start * TICK_PX;
                const visEnd = Math.min(s.end, playhead);
                const w = Math.max(2, (visEnd - s.start) * TICK_PX);
                const y = s.sender * LANE_HEIGHT + 8;
                const h = LANE_HEIGHT - 14;
                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth={1}
                      rx={3}
                    />
                    {w > 32 && (
                      <text
                        x={x + 4}
                        y={y + h / 2 + 4}
                        style={{
                          font: "10px ui-monospace, monospace",
                          fill: s.kind === "backoff" ? "rgb(68 64 60)" : "white",
                        }}
                      >
                        {s.kind === "backoff" && s.attempt
                          ? `n=${s.attempt} (≤2^${s.attempt}−1)`
                          : c.text}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* playhead */}
              <line
                x1={LABEL_W + playhead * TICK_PX}
                y1={0}
                x2={LABEL_W + playhead * TICK_PX}
                y2={LANE_HEIGHT * lanes}
                stroke="rgb(234 88 12)"
                strokeWidth={1.5}
              />

              {/* tidsakse */}
              <g transform={`translate(0,${LANE_HEIGHT * lanes + 6})`}>
                {Array.from({ length: Math.ceil(timeline.totalTime / 5) + 1 }).map((_, k) => {
                  const x = LABEL_W + k * 5 * TICK_PX;
                  return (
                    <g key={k}>
                      <line x1={x} y1={0} x2={x} y2={4} stroke="rgb(148 163 184)" />
                      <text
                        x={x}
                        y={18}
                        textAnchor="middle"
                        style={{ font: "10px ui-monospace, monospace", fill: "rgb(100 116 139)" }}
                      >
                        {k * 5}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Forklaring */}
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <Legend swatchClass="bg-green-500" label="DATA — vellykket" />
            <Legend swatchClass="bg-rose-500" label="Kollisjon" />
            <Legend swatchClass="bg-stone-300" label="Backoff" hatched />
            {mode === "csmaca" && (
              <>
                <Legend swatchClass="bg-blue-500" label="RTS" />
                <Legend swatchClass="bg-purple-500" label="CTS" />
                <Legend swatchClass="bg-teal-500" label="ACK" />
              </>
            )}
          </div>

          {/* Hendelseslogg */}
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Hendelser
            </div>
            <ul className="text-xs space-y-0.5 font-mono text-muted-foreground">
              {timeline.events.slice(0, 6).map((e, i) => (
                <li key={i}>· {e}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function Legend({
  swatchClass,
  label,
  hatched,
}: {
  swatchClass: string;
  label: string;
  hatched?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-3 w-4 rounded-sm ${swatchClass} ${hatched ? "bg-stripes" : ""}`}
        style={
          hatched
            ? {
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgb(120 113 108) 0 1.5px, rgb(229 231 235) 1.5px 6px)",
              }
            : undefined
        }
      />
      {label}
    </span>
  );
}

function HiddenTerminalDiagram() {
  // Topologi: A — AP — C. B er ute av rekkevidde for A og C men begge ser AP.
  return (
    <div className="mb-4 rounded-md border border-border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        Skjult-terminal-topologi
      </div>
      <svg viewBox="0 0 300 90" className="w-full h-20" role="img" aria-label="Skjult-terminal">
        {/* dekningssirkler */}
        <circle cx={60} cy={45} r={55} fill="rgb(59 130 246 / 0.08)" stroke="rgb(59 130 246 / 0.35)" />
        <circle cx={240} cy={45} r={55} fill="rgb(168 85 247 / 0.08)" stroke="rgb(168 85 247 / 0.35)" />
        {/* noder */}
        <circle cx={60} cy={45} r={10} fill="rgb(59 130 246)" />
        <text x={60} y={49} textAnchor="middle" style={{ font: "11px ui-sans-serif", fill: "white" }}>
          A
        </text>
        <circle cx={150} cy={45} r={10} fill="rgb(234 88 12)" />
        <text x={150} y={49} textAnchor="middle" style={{ font: "10px ui-sans-serif", fill: "white" }}>
          AP
        </text>
        <circle cx={240} cy={45} r={10} fill="rgb(168 85 247)" />
        <text x={240} y={49} textAnchor="middle" style={{ font: "11px ui-sans-serif", fill: "white" }}>
          C
        </text>
        <text
          x={150}
          y={85}
          textAnchor="middle"
          style={{ font: "10px ui-sans-serif", fill: "rgb(100 116 139)" }}
        >
          A og C ser ikke hverandre — RTS/CTS via AP løser det.
        </text>
      </svg>
    </div>
  );
}
