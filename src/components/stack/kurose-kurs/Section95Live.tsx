import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Activity, AlertTriangle } from "lucide-react";

// Section95Live — fullskala interaktiv simulator for Kurose-seksjon 9.5
// (Network QoS, DiffServ).
//
// Pedagogisk hovedpoeng: i en best-effort FIFO-kø behandles VoIP-pakker og
// store nedlastinger likt — VoIP-pakkene venter bak en monsterkø av store
// data-pakker og opplever stor kø-delay. DiffServ klassifiserer pakkene ved
// kanten (markerer DSCP-felt) og lar kjernen behandle dem etter klasse:
//   - EF (Expedited Forwarding): real-time, prioritets-kø (alltid foran).
//   - AF (Assured Forwarding): bedriftens-data, vektet kø.
//   - BE (Best Effort): default, alt annet.
//
// Brukeren skrur trafikkbelastning (kbps total) og blandingsforhold, og
// sammenligner total kø-delay for EF-pakker i to scenarier: én FIFO-kø vs.
// strict-priority + WFQ.

type Klasse = "EF" | "AF" | "BE";

type PacketEvent = {
  id: number;
  klasse: Klasse;
  tArrive: number; // simulert ms ankomst ruteren
  sizeBytes: number;
  tDepartFifo: number; // tid pakken forlater ruteren ved FIFO
  tDepartQos: number; // tid pakken forlater ved DiffServ
};

// ---------- Konstanter ----------
const LINE_RATE_KBPS = 4000; // serverings-rate ut av ruteren (4 Mbps, smalt nok til å se kø)
const SIM_DURATION_MS = 4000; // simulerings-vindu
const TIME_SCALE = 1.5; // 1 ms simulert = 1.5 ms vegg-tid (litt sakteree enn ekte tid for å se kø-veksten)
const SLOTS_TIMELINE = 60;

// ---------- Generator ----------
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function generatePackets(
  totalLoadKbps: number,
  efPct: number,
  afPct: number,
  seed: number,
): { tArrive: number; klasse: Klasse; sizeBytes: number; id: number }[] {
  const rng = makeRng(seed);
  // Vi genererer pakker for hele SIM_DURATION_MS.
  // - EF (VoIP): faste 200-byte pakker hvert 20 ms.
  // - AF: 800-byte pakker, Poisson-ankomst proporsjonal til AF-andel.
  // - BE: 1500-byte pakker, Poisson-ankomst proporsjonal til BE-andel.
  const efRate = (totalLoadKbps * efPct) / 100; // kbps
  const afRate = (totalLoadKbps * afPct) / 100;
  const beRate = (totalLoadKbps * (100 - efPct - afPct)) / 100;

  const packets: { tArrive: number; klasse: Klasse; sizeBytes: number; id: number }[] = [];
  let nextId = 0;

  // EF: deterministisk 20 ms-takt hvis efRate > 0
  if (efRate > 0) {
    // Antall pakker som passer raten: efRate / (8 * 200 / 0.020) = efRate * 0.000125 pakker/ms.
    // Vi gjør det enkelt: 1 pakke hvert 20 ms gir 200 bytes * 8 / 20 ms = 80 kbps.
    // Hvis efRate > 80 kbps trenger vi flere taler. Vi gjør N parallelle samtaler:
    const calls = Math.max(1, Math.round(efRate / 80));
    for (let t = 0; t < SIM_DURATION_MS; t += 20) {
      for (let c = 0; c < calls; c++) {
        // litt jitter på ankomst (±2 ms) så ikke alle samtaler synkroniseres
        const j = (rng() * 2 - 1) * 2;
        packets.push({ id: nextId++, tArrive: t + j + c * 0.3, klasse: "EF", sizeBytes: 200 });
      }
    }
  }

  // AF: Poisson — mean inter-arrival = (8 * 800) / afRate ms (kbps = kbit/s = bit/ms)
  if (afRate > 0) {
    const meanInter = (8 * 800) / afRate;
    let t = 0;
    while (t < SIM_DURATION_MS) {
      // exponentielt fordelt
      const r = Math.max(1e-6, rng());
      t += -meanInter * Math.log(r);
      if (t < SIM_DURATION_MS) {
        packets.push({ id: nextId++, tArrive: t, klasse: "AF", sizeBytes: 800 });
      }
    }
  }

  // BE: Poisson
  if (beRate > 0) {
    const meanInter = (8 * 1500) / beRate;
    let t = 0;
    while (t < SIM_DURATION_MS) {
      const r = Math.max(1e-6, rng());
      t += -meanInter * Math.log(r);
      if (t < SIM_DURATION_MS) {
        packets.push({ id: nextId++, tArrive: t, klasse: "BE", sizeBytes: 1500 });
      }
    }
  }

  // Sortér etter ankomst
  packets.sort((a, b) => a.tArrive - b.tArrive);
  return packets;
}

// ---------- Service-modeller ----------
// FIFO: én kø, alle pakker behandles i ankomst-rekkefølge.
function serveFifo(packets: { tArrive: number; sizeBytes: number; klasse: Klasse; id: number }[]) {
  let lastDepart = 0;
  return packets.map((p) => {
    const start = Math.max(lastDepart, p.tArrive);
    // serverings-tid = sizeBytes * 8 / (lineRate kbps) ms = (8 * size) / (rate * 1) ms hvor rate er kbps
    const serveMs = (8 * p.sizeBytes) / LINE_RATE_KBPS;
    const depart = start + serveMs;
    lastDepart = depart;
    return { ...p, tDepart: depart };
  });
}

// DiffServ-PHB: strikt prioritet for EF, WFQ-vektet mellom AF og BE.
// Vi forenkler ved tids-skritt-simulering med ms-step. Per ms sjekker vi om
// linja er ledig; hvis ja velg neste pakke etter prioritet:
//   1. EF foran alt
//   2. AF og BE veksler vektet (vekt 4:1 til AF)
function serveDiffserv(
  packets: { tArrive: number; sizeBytes: number; klasse: Klasse; id: number }[],
): { id: number; tDepart: number }[] {
  // For hver klasse hold en kø av indexer i original-array.
  type Item = { idx: number; remaining: number };
  const efQ: Item[] = [];
  const afQ: Item[] = [];
  const beQ: Item[] = [];
  // En tabell over hvilket index som er sendt i hvilken ms
  const departures: { id: number; tDepart: number }[] = [];

  // Vi bruker en event-drevet event-list i stedet for tette tids-steg:
  // - "arrive" event ved hver pakkes tArrive
  // - "depart" event når sender er ferdig med pakka
  // Forenklet: bruk små tids-steg på 0.5 ms.
  const DT = 0.5;
  let arrIdx = 0;
  let currentlySending: { idx: number; finishAt: number } | null = null;
  // Vektet round-robin teller mellom AF og BE: vi tillater AF å sende 4 pakker for hver 1 BE
  let afCredit = 4;
  let beCredit = 1;

  for (let t = 0; t <= SIM_DURATION_MS + 100; t += DT) {
    // Behandle ankomster
    while (arrIdx < packets.length && packets[arrIdx].tArrive <= t) {
      const p = packets[arrIdx];
      if (p.klasse === "EF") efQ.push({ idx: arrIdx, remaining: p.sizeBytes });
      else if (p.klasse === "AF") afQ.push({ idx: arrIdx, remaining: p.sizeBytes });
      else beQ.push({ idx: arrIdx, remaining: p.sizeBytes });
      arrIdx++;
    }

    // Sjekk om vi er ferdig med nåværende
    if (currentlySending && t >= currentlySending.finishAt) {
      const p = packets[currentlySending.idx];
      departures.push({ id: p.id, tDepart: currentlySending.finishAt });
      currentlySending = null;
    }

    if (!currentlySending) {
      // Velg neste
      let next: Item | undefined;
      let fromAf = false;
      let fromBe = false;
      if (efQ.length > 0) {
        next = efQ.shift();
      } else if (afQ.length > 0 && (afCredit > 0 || beQ.length === 0)) {
        next = afQ.shift();
        fromAf = true;
      } else if (beQ.length > 0) {
        next = beQ.shift();
        fromBe = true;
      } else if (afQ.length > 0) {
        next = afQ.shift();
        fromAf = true;
      }
      if (next) {
        const p = packets[next.idx];
        const serveMs = (8 * p.sizeBytes) / LINE_RATE_KBPS;
        currentlySending = { idx: next.idx, finishAt: t + serveMs };
        if (fromAf) {
          afCredit--;
          if (afCredit <= 0) {
            afCredit = 4;
            beCredit = 1;
          }
        } else if (fromBe) {
          beCredit--;
          if (beCredit <= 0) {
            afCredit = 4;
            beCredit = 1;
          }
        }
      }
    }
  }
  return departures;
}

// ---------- Komponenten ----------

export function Section95Live() {
  const [totalLoadKbps, setTotalLoadKbps] = useState(3500);
  const [efPct, setEfPct] = useState(10);
  const [afPct, setAfPct] = useState(30);
  const [seed, setSeed] = useState(31);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // Genererte pakker (samme for begge strategier; rekkefølgen er bevart)
  const packets = useMemo(
    () => generatePackets(totalLoadKbps, efPct, afPct, seed),
    [totalLoadKbps, efPct, afPct, seed],
  );

  const fifoOut = useMemo(() => serveFifo(packets), [packets]);
  const qosOutArr = useMemo(() => serveDiffserv(packets), [packets]);
  const qosOut = useMemo(() => {
    const map = new Map<number, number>();
    qosOutArr.forEach((d) => map.set(d.id, d.tDepart));
    return packets.map((p) => ({ ...p, tDepart: map.get(p.id) ?? p.tArrive }));
  }, [packets, qosOutArr]);

  // Build PacketEvent[]
  const events: PacketEvent[] = useMemo(() => {
    return packets.map((p, i) => ({
      id: p.id,
      klasse: p.klasse,
      tArrive: p.tArrive,
      sizeBytes: p.sizeBytes,
      tDepartFifo: fifoOut[i].tDepart,
      tDepartQos: qosOut[i].tDepart,
    }));
  }, [packets, fifoOut, qosOut]);

  // Animasjon
  useEffect(() => {
    if (!playing) {
      lastRef.current = 0;
      return;
    }
    function tick(now: number) {
      if (!lastRef.current) lastRef.current = now;
      const dtWall = now - lastRef.current;
      lastRef.current = now;
      const dtSim = dtWall / TIME_SCALE;
      setT((prev) => {
        const next = prev + dtSim;
        if (next > SIM_DURATION_MS + 600) return 0;
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing]);

  function reset() {
    setT(0);
    setPlaying(true);
  }
  function resample() {
    setSeed((s) => (s + 1) & 0xffffffff);
    setT(0);
  }

  // Stats: per-klasse gjennomsnitts-kø-delay
  const stats = useMemo(() => {
    const acc: {
      fifo: Record<Klasse, { sum: number; n: number; max: number }>;
      qos: Record<Klasse, { sum: number; n: number; max: number }>;
    } = {
      fifo: { EF: { sum: 0, n: 0, max: 0 }, AF: { sum: 0, n: 0, max: 0 }, BE: { sum: 0, n: 0, max: 0 } },
      qos: { EF: { sum: 0, n: 0, max: 0 }, AF: { sum: 0, n: 0, max: 0 }, BE: { sum: 0, n: 0, max: 0 } },
    };
    for (const e of events) {
      const dFifo = e.tDepartFifo - e.tArrive;
      const dQos = e.tDepartQos - e.tArrive;
      acc.fifo[e.klasse].sum += dFifo;
      acc.fifo[e.klasse].n++;
      if (dFifo > acc.fifo[e.klasse].max) acc.fifo[e.klasse].max = dFifo;
      acc.qos[e.klasse].sum += dQos;
      acc.qos[e.klasse].n++;
      if (dQos > acc.qos[e.klasse].max) acc.qos[e.klasse].max = dQos;
    }
    return acc;
  }, [events]);

  // ---------- SVG-layout ----------
  // 820 × 460:
  //   Header (20)
  //   Top bane FIFO: 30..200
  //   Bottom bane DiffServ: 210..380
  //   Stats: 390..460
  const PLOT_X0 = 90;
  const PLOT_X1 = 780;
  const FIFO_Y_IN = 80;
  const FIFO_Y_OUT = 160;
  const QOS_Y_IN = 250;
  const QOS_Y_OUT = 350;

  function xForTime(simT: number) {
    return PLOT_X0 + (simT / SIM_DURATION_MS) * (PLOT_X1 - PLOT_X0);
  }

  function yForKlasse(k: Klasse, yIn: number) {
    if (k === "EF") return yIn - 20;
    if (k === "AF") return yIn;
    return yIn + 20;
  }

  function colorForKlasse(k: Klasse): string {
    if (k === "EF") return "fill-red-500";
    if (k === "AF") return "fill-amber-500";
    return "fill-cyan-500";
  }

  const cursorX = xForTime(Math.min(SIM_DURATION_MS, t));

  // For å unngå å rendere tusenvis av sirkler, vis kun pakker innenfor ±1500 ms av cursoren
  const VISIBLE_WINDOW = 1800;
  const visibleEvents = events.filter((e) => Math.abs(e.tArrive - t) < VISIBLE_WINDOW || Math.abs(e.tDepartQos - t) < VISIBLE_WINDOW || Math.abs(e.tDepartFifo - t) < VISIBLE_WINDOW);

  // Strikk inn statistikken — formater
  const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : "—");
  const efFifoMean = stats.fifo.EF.n ? stats.fifo.EF.sum / stats.fifo.EF.n : 0;
  const efQosMean = stats.qos.EF.n ? stats.qos.EF.sum / stats.qos.EF.n : 0;
  const afFifoMean = stats.fifo.AF.n ? stats.fifo.AF.sum / stats.fifo.AF.n : 0;
  const afQosMean = stats.qos.AF.n ? stats.qos.AF.sum / stats.qos.AF.n : 0;
  const beFifoMean = stats.fifo.BE.n ? stats.fifo.BE.sum / stats.fifo.BE.n : 0;
  const beQosMean = stats.qos.BE.n ? stats.qos.BE.sum / stats.qos.BE.n : 0;

  const utilizationPct = Math.round((totalLoadKbps / LINE_RATE_KBPS) * 100);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">
          DiffServ: pakker klassifiseres ved kanten, prioriteres i kjernen
        </span>
        <span className="ml-auto font-mono">
          Belastning: {totalLoadKbps} / {LINE_RATE_KBPS} kbps ({utilizationPct} %)
        </span>
      </div>

      <svg viewBox="0 0 820 460" className="w-full h-auto bg-muted/10">
        {/* Header for FIFO */}
        <text x={20} y={45} className="fill-foreground text-[12px] font-semibold">
          FIFO best-effort
        </text>
        <text x={20} y={58} className="fill-muted-foreground text-[9px]">
          alle pakker, samme kø
        </text>

        {/* FIFO inn-strek + ut-strek */}
        <line x1={PLOT_X0} y1={FIFO_Y_IN} x2={PLOT_X1} y2={FIFO_Y_IN} className="stroke-muted-foreground/30" strokeWidth={1} strokeDasharray="2 3" />
        <line x1={PLOT_X0} y1={FIFO_Y_OUT} x2={PLOT_X1} y2={FIFO_Y_OUT} className="stroke-foreground/40" strokeWidth={1.5} />
        <text x={PLOT_X0 - 10} y={FIFO_Y_IN + 4} textAnchor="end" className="fill-muted-foreground text-[9px]">inn</text>
        <text x={PLOT_X0 - 10} y={FIFO_Y_OUT + 4} textAnchor="end" className="fill-foreground text-[9px] font-semibold">ut</text>

        {/* FIFO router-illustrasjon */}
        <g transform={`translate(${PLOT_X0 - 60}, ${(FIFO_Y_IN + FIFO_Y_OUT) / 2 - 20})`}>
          <rect width={50} height={40} rx={4} className="fill-card stroke-foreground/60" strokeWidth={1.5} />
          <text x={25} y={16} textAnchor="middle" className="fill-foreground text-[9px] font-bold">FIFO</text>
          <text x={25} y={28} textAnchor="middle" className="fill-muted-foreground text-[8px]">én kø</text>
        </g>

        {/* DiffServ */}
        <text x={20} y={232} className="fill-foreground text-[12px] font-semibold">
          DiffServ (EF prioritert, AF:BE WFQ 4:1)
        </text>
        <text x={20} y={245} className="fill-muted-foreground text-[9px]">
          kantruteren markerer DSCP; kjernen sorterer
        </text>
        <line x1={PLOT_X0} y1={QOS_Y_IN} x2={PLOT_X1} y2={QOS_Y_IN} className="stroke-muted-foreground/30" strokeWidth={1} strokeDasharray="2 3" />
        <line x1={PLOT_X0} y1={QOS_Y_OUT} x2={PLOT_X1} y2={QOS_Y_OUT} className="stroke-foreground/40" strokeWidth={1.5} />
        <text x={PLOT_X0 - 10} y={QOS_Y_IN + 4} textAnchor="end" className="fill-muted-foreground text-[9px]">inn</text>
        <text x={PLOT_X0 - 10} y={QOS_Y_OUT + 4} textAnchor="end" className="fill-foreground text-[9px] font-semibold">ut</text>

        <g transform={`translate(${PLOT_X0 - 60}, ${(QOS_Y_IN + QOS_Y_OUT) / 2 - 28})`}>
          <rect width={50} height={56} rx={4} className="fill-card stroke-foreground/60" strokeWidth={1.5} />
          <text x={25} y={14} textAnchor="middle" className="fill-foreground text-[8px] font-bold">DiffServ</text>
          {/* tre kø-streker */}
          <rect x={6} y={20} width={38} height={6} rx={2} className="fill-red-500/30 stroke-red-500" strokeWidth={1} />
          <text x={25} y={25} textAnchor="middle" className="fill-red-500 text-[7px] font-bold">EF</text>
          <rect x={6} y={28} width={38} height={6} rx={2} className="fill-amber-500/30 stroke-amber-500" strokeWidth={1} />
          <text x={25} y={33} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 text-[7px] font-bold">AF</text>
          <rect x={6} y={36} width={38} height={6} rx={2} className="fill-cyan-500/30 stroke-cyan-500" strokeWidth={1} />
          <text x={25} y={41} textAnchor="middle" className="fill-cyan-700 dark:fill-cyan-300 text-[7px] font-bold">BE</text>
          <text x={25} y={52} textAnchor="middle" className="fill-muted-foreground text-[7px]">3 køer</text>
        </g>

        {/* Pakker FIFO */}
        {visibleEvents.map((e) => {
          if (e.tArrive > t) return null;
          const yIn = yForKlasse(e.klasse, FIFO_Y_IN);
          const xIn = xForTime(e.tArrive);
          const xOut = xForTime(e.tDepartFifo);
          if (e.tDepartFifo <= t) {
            return (
              <g key={`fifo-${e.id}-done`}>
                <line x1={xIn} y1={yIn} x2={xOut} y2={FIFO_Y_OUT} className="stroke-muted-foreground/15" strokeWidth={0.5} />
                <circle cx={xOut} cy={FIFO_Y_OUT} r={3} className={colorForKlasse(e.klasse)} opacity={0.5} />
              </g>
            );
          }
          // Pakka er enten på vei eller i kø — interpoler langs en kurve fra (xIn, yIn) til (xOut, FIFO_Y_OUT)
          const u = Math.min(1, Math.max(0, (t - e.tArrive) / Math.max(1, e.tDepartFifo - e.tArrive)));
          const x = xIn + (xOut - xIn) * u;
          const y = yIn + (FIFO_Y_OUT - yIn) * u;
          return (
            <g key={`fifo-${e.id}`}>
              <circle cx={x} cy={y} r={4} className={`${colorForKlasse(e.klasse)} stroke-background`} strokeWidth={0.5} opacity={0.9} />
            </g>
          );
        })}

        {/* Pakker DiffServ */}
        {visibleEvents.map((e) => {
          if (e.tArrive > t) return null;
          const yIn = yForKlasse(e.klasse, QOS_Y_IN);
          const xIn = xForTime(e.tArrive);
          const xOut = xForTime(e.tDepartQos);
          if (e.tDepartQos <= t) {
            return (
              <g key={`qos-${e.id}-done`}>
                <line x1={xIn} y1={yIn} x2={xOut} y2={QOS_Y_OUT} className="stroke-muted-foreground/15" strokeWidth={0.5} />
                <circle cx={xOut} cy={QOS_Y_OUT} r={3} className={colorForKlasse(e.klasse)} opacity={0.5} />
              </g>
            );
          }
          const u = Math.min(1, Math.max(0, (t - e.tArrive) / Math.max(1, e.tDepartQos - e.tArrive)));
          const x = xIn + (xOut - xIn) * u;
          const y = yIn + (QOS_Y_OUT - yIn) * u;
          return (
            <g key={`qos-${e.id}`}>
              <circle cx={x} cy={y} r={4} className={`${colorForKlasse(e.klasse)} stroke-background`} strokeWidth={0.5} opacity={0.9} />
            </g>
          );
        })}

        {/* Tids-cursor (vertikal linje gjennom begge banene) */}
        <line x1={cursorX} y1={30} x2={cursorX} y2={QOS_Y_OUT + 5} className="stroke-brand/60" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={cursorX + 4} y={40} className="fill-brand text-[9px] font-mono">
          t = {Math.round(t)} ms
        </text>

        {/* Stats-rad */}
        <g transform="translate(0, 390)">
          <rect x={0} y={0} width={820} height={70} className="fill-muted/40" />

          <text x={20} y={16} className="fill-foreground text-[11px] font-semibold">
            Gjennomsnittlig kø-delay per klasse (ms)
          </text>

          {/* Tabell */}
          <text x={20} y={32} className="fill-muted-foreground text-[9px]">klasse</text>
          <text x={140} y={32} className="fill-muted-foreground text-[9px] font-semibold">FIFO</text>
          <text x={220} y={32} className="fill-muted-foreground text-[9px] font-semibold">DiffServ</text>
          <text x={310} y={32} className="fill-muted-foreground text-[9px]">FIFO maks</text>
          <text x={400} y={32} className="fill-muted-foreground text-[9px]">DiffServ maks</text>

          <text x={20} y={46} className="fill-red-500 font-mono text-[10px] font-semibold">EF (VoIP)</text>
          <text x={140} y={46} className="fill-foreground font-mono text-[10px]">{fmt(efFifoMean)}</text>
          <text x={220} y={46} className="fill-foreground font-mono text-[10px] font-semibold">{fmt(efQosMean)}</text>
          <text x={310} y={46} className="fill-foreground font-mono text-[10px]">{fmt(stats.fifo.EF.max)}</text>
          <text x={400} y={46} className="fill-foreground font-mono text-[10px] font-semibold">{fmt(stats.qos.EF.max)}</text>

          <text x={20} y={58} className="fill-amber-500 font-mono text-[10px] font-semibold">AF (bedrift)</text>
          <text x={140} y={58} className="fill-foreground font-mono text-[10px]">{fmt(afFifoMean)}</text>
          <text x={220} y={58} className="fill-foreground font-mono text-[10px]">{fmt(afQosMean)}</text>
          <text x={310} y={58} className="fill-foreground font-mono text-[10px]">{fmt(stats.fifo.AF.max)}</text>
          <text x={400} y={58} className="fill-foreground font-mono text-[10px]">{fmt(stats.qos.AF.max)}</text>

          <g transform="translate(0, 12)">
            <text x={20} y={58} className="fill-cyan-500 font-mono text-[10px] font-semibold">BE (default)</text>
            <text x={140} y={58} className="fill-foreground font-mono text-[10px]">{fmt(beFifoMean)}</text>
            <text x={220} y={58} className="fill-foreground font-mono text-[10px]">{fmt(beQosMean)}</text>
            <text x={310} y={58} className="fill-foreground font-mono text-[10px]">{fmt(stats.fifo.BE.max)}</text>
            <text x={400} y={58} className="fill-foreground font-mono text-[10px]">{fmt(stats.qos.BE.max)}</text>
          </g>

          {/* Forbedring */}
          {efFifoMean > 0 && (
            <g transform="translate(500, 24)">
              <rect x={0} y={0} width={300} height={44} rx={4} className="fill-card stroke-border" strokeWidth={1} />
              <text x={10} y={14} className="fill-foreground text-[10px] font-semibold">
                EF-delay-reduksjon med DiffServ
              </text>
              <text x={10} y={30} className="fill-success text-[14px] font-mono font-bold">
                {efFifoMean > 0 ? `${(((efFifoMean - efQosMean) / efFifoMean) * 100).toFixed(0)} %` : "—"}
              </text>
              <text x={70} y={30} className="fill-muted-foreground text-[9px]">
                {efFifoMean.toFixed(0)} → {efQosMean.toFixed(0)} ms
              </text>
              <text x={10} y={42} className="fill-muted-foreground text-[8px] italic">
                Gevinsten kommer fra at EF aldri venter bak BE-pakker.
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Kontroller */}
      <div className="px-4 py-3 border-t border-border bg-muted/20 grid gap-3 md:grid-cols-2">
        <SliderField
          label="Total trafikkbelastning (kbps)"
          value={totalLoadKbps}
          min={500}
          max={6000}
          step={100}
          unit=""
          onChange={setTotalLoadKbps}
          help={`Linje-kapasitet er ${LINE_RATE_KBPS} kbps. Over kapasiteten = bygges opp kø.`}
        />
        <SliderField
          label="EF-andel (VoIP)"
          value={efPct}
          min={0}
          max={50}
          step={5}
          unit="%"
          onChange={(v) => {
            // Sørg for at EF + AF ≤ 100
            const newEf = Math.min(v, 100 - afPct);
            setEfPct(newEf);
          }}
          help="Hvor stor del av trafikken er real-time. EF nyter strict priority i DiffServ."
          accent="red"
        />
        <SliderField
          label="AF-andel (bedriftsdata)"
          value={afPct}
          min={0}
          max={80}
          step={5}
          unit="%"
          onChange={(v) => {
            const newAf = Math.min(v, 100 - efPct);
            setAfPct(newAf);
          }}
          help="Vektet 4:1 over BE. Resten av trafikken (100 − EF − AF %) regnes som BE."
          accent="amber"
        />
        <div>
          <div className="text-xs font-medium text-foreground">Resulterende blanding</div>
          <div className="mt-1 h-3 w-full rounded-full bg-muted overflow-hidden flex">
            <div className="bg-red-500" style={{ width: `${efPct}%` }} title={`EF ${efPct}%`} />
            <div className="bg-amber-500" style={{ width: `${afPct}%` }} title={`AF ${afPct}%`} />
            <div className="bg-cyan-500" style={{ width: `${100 - efPct - afPct}%` }} title={`BE ${100 - efPct - afPct}%`} />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground font-mono">
            EF {efPct}% · AF {afPct}% · BE {100 - efPct - afPct}%
          </div>
        </div>
      </div>

      <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-t border-border bg-muted/10">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "Pause" : "Spill"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
        <button
          onClick={resample}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          Ny seed
        </button>

        <span className="ml-2 text-[10px] text-muted-foreground">Scenarier:</span>
        <PresetBtn label="Stille kveld" onClick={() => { setTotalLoadKbps(1500); setEfPct(15); setAfPct(35); setT(0); }} />
        <PresetBtn label="Travel kontor" onClick={() => { setTotalLoadKbps(3800); setEfPct(10); setAfPct(40); setT(0); }} />
        <PresetBtn label="Backup-overlast" onClick={() => { setTotalLoadKbps(5500); setEfPct(8); setAfPct(20); setT(0); }} />
        <PresetBtn label="VoIP-tungt" onClick={() => { setTotalLoadKbps(3500); setEfPct(35); setAfPct(15); setT(0); }} />
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500" /> EF (Expedited — VoIP, 200 B / 20 ms)
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" /> AF (Assured — bedriftsdata, 800 B)
        <span className="inline-block w-2 h-2 rounded-full bg-cyan-500" /> BE (Best Effort — default, 1500 B)
      </div>

      <Verdict
        utilizationPct={utilizationPct}
        efFifoMean={efFifoMean}
        efQosMean={efQosMean}
        beFifoMean={beFifoMean}
        beQosMean={beQosMean}
      />
    </div>
  );
}

function Verdict({
  utilizationPct,
  efFifoMean,
  efQosMean,
  beFifoMean,
  beQosMean,
}: {
  utilizationPct: number;
  efFifoMean: number;
  efQosMean: number;
  beFifoMean: number;
  beQosMean: number;
}) {
  let icon = <Activity className="h-4 w-4 text-muted-foreground" />;
  let title = "Linja er rolig — knapt noen kø";
  let body =
    "Ved lav belastning serveres alle pakker raskere enn de ankommer. Begge strategier ser like ut. QoS gir kun verdi når kapasiteten presses.";
  let color = "text-muted-foreground";

  if (utilizationPct >= 90) {
    icon = <AlertTriangle className="h-4 w-4 text-red-500" />;
    title = `Linja er overlastet (${utilizationPct} %) — kø bygges uten ende`;
    body = `Selv DiffServ kan ikke gjøre noe når trafikken overstiger kapasiteten. EF får fortsatt prioritet (delay ${efQosMean.toFixed(0)} ms), men BE-køen vokser ubegrenset (${beQosMean.toFixed(0)} ms snitt). Den eneste fiksen er admission control eller mer båndbredde.`;
    color = "text-red-500";
  } else if (utilizationPct >= 70 && efFifoMean > efQosMean + 20) {
    icon = <Activity className="h-4 w-4 text-success" />;
    title = `DiffServ leverer det den lover (${(((efFifoMean - efQosMean) / efFifoMean) * 100).toFixed(0)} % mindre EF-delay)`;
    body = `Ved ${utilizationPct} % belastning bygger FIFO-køen opp og EF-pakkene venter ${efFifoMean.toFixed(0)} ms. DiffServ slipper dem foran og holder dem på ${efQosMean.toFixed(0)} ms. Prisen: BE-trafikken merker det knapt — fra ${beFifoMean.toFixed(0)} til ${beQosMean.toFixed(0)} ms.`;
    color = "text-success";
  } else if (utilizationPct < 70) {
    icon = <Activity className="h-4 w-4 text-muted-foreground" />;
    title = `Moderat last (${utilizationPct} %) — DiffServ-gevinst beskjeden`;
    body = `Linja har nok plass til at FIFO også klarer seg greit. EF-delay ${efFifoMean.toFixed(0)} → ${efQosMean.toFixed(0)} ms. Skru opp belastningen for å se hvor DiffServ virkelig betyr noe.`;
    color = "text-muted-foreground";
  }

  return (
    <div className="px-4 py-2 border-t border-border bg-muted/10 flex items-start gap-2">
      {icon}
      <div>
        <div className={`text-[12px] font-semibold ${color}`}>{title}</div>
        <div className="text-[11px] text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function SliderField({
  label, value, min, max, step, unit, onChange, help, accent,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (n: number) => void; help?: string; accent?: "red" | "amber";
}) {
  const accentClass =
    accent === "red" ? "accent-red-500" :
    accent === "amber" ? "accent-amber-500" :
    "accent-brand";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <span className="text-xs font-mono text-foreground">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1 w-full ${accentClass}`} />
      {help && <p className="mt-0.5 text-[10px] text-muted-foreground">{help}</p>}
    </div>
  );
}

function PresetBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="rounded border border-border bg-background px-2 py-1 text-[10px] hover:border-brand/60">
      {label}
    </button>
  );
}
