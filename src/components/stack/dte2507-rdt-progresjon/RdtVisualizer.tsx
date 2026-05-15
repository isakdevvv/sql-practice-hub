import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, RotateCcw, Clock } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv pakke-tidslinje for rdt 1.0 → 3.0 (+ pipelined GBN).
// Sender til venstre, mottaker til høyre, tid flyter nedover. Pakker animeres
// som diagonale piler. Mode-velger styrer hvilken protokoll som simuleres,
// og toggles injiserer feil (korrupt data, mistet ACK, tap av pakke).
// --------------------------------------------------------------------------

type Mode = "rdt10" | "rdt20" | "rdt21" | "rdt22" | "rdt30" | "gbn";

type ErrorInjection = {
  corruptData2: boolean;
  loseAck1: boolean;
  losePacket3: boolean;
};

type Direction = "send" | "recv";

/**
 * Et `Arrow` er en pakke som flyr fra én side til andre. `tStart` = simuleringstid
 * pakken sendes, `tEnd` = simuleringstid den ankommer. `corrupt` markerer bit-feil
 * (kommer fram, men kasseres), `lost` markerer at pakken aldri ankommer (vises
 * kun halvveis, til × midt på reisen).
 */
type Arrow = {
  id: string;
  dir: Direction;
  tStart: number;
  tEnd: number;
  label: string;
  kind: "data" | "ack" | "nak";
  corrupt?: boolean;
  lost?: boolean;
};

/**
 * `Marker` = stjerne/klokke i én av kolonnene, f.eks. timeout-symbol hos sender
 * eller "kastet" hos mottaker.
 */
type Marker = {
  id: string;
  side: "left" | "right";
  t: number;
  icon: "timeout" | "drop" | "deliver";
  label: string;
};

/** Liten linje for senderens/mottakerens nåværende tilstand på en gitt tid. */
type StateBand = {
  side: "left" | "right";
  tStart: number;
  tEnd: number;
  label: string;
};

type Scenario = {
  arrows: Arrow[];
  markers: Marker[];
  bands: StateBand[];
  /** Totalvarighet i simuleringstid (samme enhet som tStart/tEnd). */
  total: number;
  /** Kort tekst som forklarer hva som skjer i scenariet. */
  note: string;
};

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "rdt10", label: "rdt 1.0", sub: "perfekt kanal" },
  { id: "rdt20", label: "rdt 2.0", sub: "ACK / NAK" },
  { id: "rdt21", label: "rdt 2.1", sub: "seq# 0/1" },
  { id: "rdt22", label: "rdt 2.2", sub: "kun ACK (m. seq#)" },
  { id: "rdt30", label: "rdt 3.0", sub: "timer + retransmit" },
  { id: "gbn", label: "GBN", sub: "pipelined, vindu N=4" },
];

const MODE_NOTE: Record<Mode, string> = {
  rdt10:
    "Ingen feil, ingen ACK. Senderen lemper bare data nedover, mottakeren tar imot. Bare en referansepunkt — ekte kanaler ser aldri slik ut.",
  rdt20:
    "Hver pakke kvitteres. Korrupt pakke → NAK → senderen retransmitterer. Fungerer helt til en ACK/NAK selv blir korrupt — da har vi ingen måte å skille.",
  rdt21:
    "Sekvensnummer 0/1 alternerer. Mottakeren ACK-er uansett (også duplikater), men leverer bare nye pakker oppover. Korrupt ACK → senderen sender på nytt, mottakeren oppdager duplikat.",
  rdt22:
    "Identisk med 2.1, men uten NAK. Korrupt pakke → mottakeren sender duplikat-ACK for forrige seq#. Senderen tolker som «den nye gikk ikke gjennom».",
  rdt30:
    "Senderen starter en timer hver gang han sender. Får han ikke ACK før den utløper → retransmitter. Håndterer både tapte data-pakker og tapte ACK-er.",
  gbn:
    "Pipelining: sender kan ha N=4 pakker «in flight». Kumulativ ACK. Ved timeout retransmitteres ALLE upakkede fra base.",
};

// --------------------------------------------------------------------------
// Scenarier — én scenariofunksjon per mode. Returnerer hele tidslinjen ferdig
// (pre-computed) sånn at animasjon bare er sample-av-tid.
// --------------------------------------------------------------------------

const TRAVEL = 1.0; // tid pakka er på reise mellom sender/mottaker
const PROC = 0.3; // mottakerens prosesseringstid
const TIMEOUT = 3.0; // rdt3.0-timer
const GAP = 0.4; // tid senderen bruker før neste pakke etter ACK

function buildRdt10(): Scenario {
  const arrows: Arrow[] = [];
  const markers: Marker[] = [];
  const bands: StateBand[] = [];
  let t = 0;
  for (let i = 0; i < 4; i++) {
    const start = t;
    arrows.push({
      id: `d${i}`,
      dir: "send",
      tStart: start,
      tEnd: start + TRAVEL,
      label: `pkt${i}`,
      kind: "data",
    });
    markers.push({
      id: `del${i}`,
      side: "right",
      t: start + TRAVEL + 0.1,
      icon: "deliver",
      label: "deliver",
    });
    t = start + TRAVEL + 0.4;
  }
  bands.push({ side: "left", tStart: 0, tEnd: t, label: "vent fra app" });
  bands.push({ side: "right", tStart: 0, tEnd: t, label: "vent fra under" });
  return {
    arrows,
    markers,
    bands,
    total: t + 0.3,
    note: "Ingen ACK. Pakker bare flyter. Hvis underkanalen er garantert feilfri trenger vi ikke noe mer.",
  };
}

function buildRdt20(corruptPkt2: boolean): Scenario {
  const arrows: Arrow[] = [];
  const markers: Marker[] = [];
  let t = 0;
  for (let i = 0; i < 4; i++) {
    const corrupt = corruptPkt2 && i === 1;
    const sStart = t;
    const sEnd = sStart + TRAVEL;
    arrows.push({
      id: `d${i}-${sStart.toFixed(1)}`,
      dir: "send",
      tStart: sStart,
      tEnd: sEnd,
      label: `pkt${i}`,
      kind: "data",
      corrupt,
    });
    if (corrupt) {
      markers.push({
        id: `cdrop${i}-${sStart}`,
        side: "right",
        t: sEnd + 0.1,
        icon: "drop",
        label: "korrupt",
      });
    } else {
      markers.push({
        id: `del${i}-${sStart}`,
        side: "right",
        t: sEnd + 0.1,
        icon: "deliver",
        label: "deliver",
      });
    }
    const aStart = sEnd + PROC;
    const aEnd = aStart + TRAVEL;
    arrows.push({
      id: `a${i}-${sStart.toFixed(1)}`,
      dir: "recv",
      tStart: aStart,
      tEnd: aEnd,
      label: corrupt ? "NAK" : "ACK",
      kind: corrupt ? "nak" : "ack",
    });
    t = aEnd + GAP;
    if (corrupt) {
      // retransmitter samme pakke
      const rStart = t;
      const rEnd = rStart + TRAVEL;
      arrows.push({
        id: `d${i}r-${rStart}`,
        dir: "send",
        tStart: rStart,
        tEnd: rEnd,
        label: `pkt${i} (re-tx)`,
        kind: "data",
      });
      markers.push({
        id: `del${i}r`,
        side: "right",
        t: rEnd + 0.1,
        icon: "deliver",
        label: "deliver",
      });
      const aStart2 = rEnd + PROC;
      const aEnd2 = aStart2 + TRAVEL;
      arrows.push({
        id: `a${i}r-${rStart}`,
        dir: "recv",
        tStart: aStart2,
        tEnd: aEnd2,
        label: "ACK",
        kind: "ack",
      });
      t = aEnd2 + GAP;
    }
  }
  return {
    arrows,
    markers,
    bands: [],
    total: t + 0.3,
    note: corruptPkt2
      ? "Pkt 1 ankommer korrupt. Mottakeren sender NAK, senderen retransmitterer. Men: hva om NAK-en selv ble korrupt? Da må vi videre til 2.1."
      : "Stop-and-wait med ACK. Alt går bra så lenge ingen ACK/NAK blir korrupt.",
  };
}

function buildRdt21(corruptPkt2: boolean, loseAck1: boolean): Scenario {
  const arrows: Arrow[] = [];
  const markers: Marker[] = [];
  let t = 0;
  let seq = 0;
  let lostAckUsed = false;
  let corruptDataUsed = false;
  // Vi sender 4 logiske pakker (#0..#3) men kan retransmittere underveis.
  let logical = 0;
  while (logical < 4 && t < 30) {
    const isCorruptThis = corruptPkt2 && logical === 1 && !corruptDataUsed;
    if (isCorruptThis) corruptDataUsed = true;
    const sStart = t;
    const sEnd = sStart + TRAVEL;
    arrows.push({
      id: `d${logical}-${sStart.toFixed(2)}`,
      dir: "send",
      tStart: sStart,
      tEnd: sEnd,
      label: `pkt${seq}`,
      kind: "data",
      corrupt: isCorruptThis,
    });
    if (isCorruptThis) {
      markers.push({
        id: `dr-${sStart}`,
        side: "right",
        t: sEnd + 0.1,
        icon: "drop",
        label: "korrupt",
      });
      // Send NAK / forrige-ACK
      const aStart = sEnd + PROC;
      const aEnd = aStart + TRAVEL;
      arrows.push({
        id: `a-prev-${sStart}`,
        dir: "recv",
        tStart: aStart,
        tEnd: aEnd,
        label: `ACK${1 - seq}`,
        kind: "ack",
      });
      t = aEnd + GAP;
      continue; // samme logical, samme seq → retransmit
    }
    // Mottakeren leverer:
    markers.push({
      id: `dl${logical}-${sStart}`,
      side: "right",
      t: sEnd + 0.1,
      icon: "deliver",
      label: `deliver #${logical}`,
    });
    // ACK med riktig seq
    const aStart = sEnd + PROC;
    const aEnd = aStart + TRAVEL;
    const ackLost = loseAck1 && logical === 0 && !lostAckUsed;
    if (ackLost) lostAckUsed = true;
    arrows.push({
      id: `a${logical}-${sStart}`,
      dir: "recv",
      tStart: aStart,
      tEnd: aEnd,
      label: `ACK${seq}`,
      kind: "ack",
      corrupt: ackLost, // viser × halvveis
    });
    if (ackLost) {
      // Senderen vet ikke; for å holde animasjonen interessant, simulerer vi at
      // senderen timer ut og retransmitterer (en blanding av 2.1+3.0 — men gir
      // riktig følelse: «mottakeren får duplikat, oppdager seq#=samme»).
      const tWait = aEnd + 1.2;
      markers.push({
        id: `to-${logical}-${tWait}`,
        side: "left",
        t: tWait,
        icon: "timeout",
        label: "timeout",
      });
      const rStart = tWait + 0.2;
      const rEnd = rStart + TRAVEL;
      arrows.push({
        id: `dup${logical}-${rStart}`,
        dir: "send",
        tStart: rStart,
        tEnd: rEnd,
        label: `pkt${seq} (re-tx)`,
        kind: "data",
      });
      markers.push({
        id: `dup-drop-${rStart}`,
        side: "right",
        t: rEnd + 0.1,
        icon: "drop",
        label: "duplikat",
      });
      const aStart2 = rEnd + PROC;
      const aEnd2 = aStart2 + TRAVEL;
      arrows.push({
        id: `a-dup-${rStart}`,
        dir: "recv",
        tStart: aStart2,
        tEnd: aEnd2,
        label: `ACK${seq}`,
        kind: "ack",
      });
      t = aEnd2 + GAP;
      seq = 1 - seq;
      logical += 1;
      continue;
    }
    t = aEnd + GAP;
    seq = 1 - seq;
    logical += 1;
  }
  return {
    arrows,
    markers,
    bands: [],
    total: t + 0.3,
    note:
      corruptPkt2 || loseAck1
        ? "Sekvensnummer-bitet skiller original fra duplikat. Mottaker ACK-er uansett, men leverer bare nye."
        : "Standardflyt: 0,1,0,1 alternerer. Uten feil ser det helt likt ut som rdt2.0.",
  };
}

function buildRdt22(corruptPkt2: boolean): Scenario {
  // Som 2.1 men ingen NAK noensinne — kun ACK med seq#.
  const arrows: Arrow[] = [];
  const markers: Marker[] = [];
  let t = 0;
  let seq = 0;
  let lastDelivered = -1; // hvilket seq# vi sist leverte (for duplikat-ACK)
  let logical = 0;
  let corruptUsed = false;
  while (logical < 4 && t < 30) {
    const isCorruptThis = corruptPkt2 && logical === 1 && !corruptUsed;
    if (isCorruptThis) corruptUsed = true;
    const sStart = t;
    const sEnd = sStart + TRAVEL;
    arrows.push({
      id: `d-${sStart}`,
      dir: "send",
      tStart: sStart,
      tEnd: sEnd,
      label: `pkt${seq}`,
      kind: "data",
      corrupt: isCorruptThis,
    });
    if (isCorruptThis) {
      markers.push({
        id: `dr-${sStart}`,
        side: "right",
        t: sEnd + 0.1,
        icon: "drop",
        label: "korrupt",
      });
      // Duplikat-ACK = ACK for forrige seq#
      const prev = lastDelivered === -1 ? 1 - seq : lastDelivered;
      const aStart = sEnd + PROC;
      const aEnd = aStart + TRAVEL;
      arrows.push({
        id: `adup-${sStart}`,
        dir: "recv",
        tStart: aStart,
        tEnd: aEnd,
        label: `ACK${prev}`,
        kind: "ack",
      });
      t = aEnd + GAP;
      continue;
    }
    markers.push({
      id: `dl-${sStart}`,
      side: "right",
      t: sEnd + 0.1,
      icon: "deliver",
      label: `deliver #${logical}`,
    });
    const aStart = sEnd + PROC;
    const aEnd = aStart + TRAVEL;
    arrows.push({
      id: `a-${sStart}`,
      dir: "recv",
      tStart: aStart,
      tEnd: aEnd,
      label: `ACK${seq}`,
      kind: "ack",
    });
    lastDelivered = seq;
    t = aEnd + GAP;
    seq = 1 - seq;
    logical += 1;
  }
  return {
    arrows,
    markers,
    bands: [],
    total: t + 0.3,
    note: corruptPkt2
      ? "Korrupt pkt → mottakeren ACK-er forrige seq# (duplikat-ACK). Senderen ser at det ikke matcher den han ventet på → retransmitter."
      : "Uten feil ser 2.2 ut nøyaktig som 2.1. Forskjellen kommer fram først ved bit-feil.",
  };
}

function buildRdt30(losePacket3: boolean, loseAck1: boolean): Scenario {
  const arrows: Arrow[] = [];
  const markers: Marker[] = [];
  let t = 0;
  let seq = 0;
  let lostPktUsed = false;
  let lostAckUsed = false;
  let logical = 0;
  while (logical < 4 && t < 40) {
    const losePkt = losePacket3 && logical === 2 && !lostPktUsed;
    const loseAck = loseAck1 && logical === 0 && !lostAckUsed;
    const sStart = t;
    const sEnd = sStart + TRAVEL;
    if (losePkt) lostPktUsed = true;
    arrows.push({
      id: `d-${sStart}`,
      dir: "send",
      tStart: sStart,
      tEnd: sEnd,
      label: `pkt${seq}`,
      kind: "data",
      lost: losePkt,
    });
    if (losePkt) {
      // Pakken kommer aldri fram. Senderen timer ut etter TIMEOUT.
      const toT = sStart + TIMEOUT;
      markers.push({
        id: `to-${sStart}`,
        side: "left",
        t: toT,
        icon: "timeout",
        label: "timeout",
      });
      t = toT + 0.2;
      continue;
    }
    markers.push({
      id: `dl-${sStart}`,
      side: "right",
      t: sEnd + 0.1,
      icon: "deliver",
      label: `deliver #${logical}`,
    });
    const aStart = sEnd + PROC;
    const aEnd = aStart + TRAVEL;
    if (loseAck) lostAckUsed = true;
    arrows.push({
      id: `a-${sStart}`,
      dir: "recv",
      tStart: aStart,
      tEnd: aEnd,
      label: `ACK${seq}`,
      kind: "ack",
      lost: loseAck,
    });
    if (loseAck) {
      const toT = sStart + TIMEOUT;
      markers.push({
        id: `to-${sStart}`,
        side: "left",
        t: toT,
        icon: "timeout",
        label: "timeout",
      });
      t = toT + 0.2;
      // Samme seq, samme logical → retransmit, men neste runde vil mottakeren se duplikat
      // og levere som vanlig — vi bytter ikke seq her.
      // For å holde tellingen riktig: la oss legge inn retransmit med duplikat-deteksjon.
      const rStart = t;
      const rEnd = rStart + TRAVEL;
      arrows.push({
        id: `dr-${rStart}`,
        dir: "send",
        tStart: rStart,
        tEnd: rEnd,
        label: `pkt${seq} (re-tx)`,
        kind: "data",
      });
      markers.push({
        id: `dup-${rStart}`,
        side: "right",
        t: rEnd + 0.1,
        icon: "drop",
        label: "duplikat",
      });
      const aStart2 = rEnd + PROC;
      const aEnd2 = aStart2 + TRAVEL;
      arrows.push({
        id: `a2-${rStart}`,
        dir: "recv",
        tStart: aStart2,
        tEnd: aEnd2,
        label: `ACK${seq}`,
        kind: "ack",
      });
      t = aEnd2 + GAP;
      seq = 1 - seq;
      logical += 1;
      continue;
    }
    t = aEnd + GAP;
    seq = 1 - seq;
    logical += 1;
  }
  return {
    arrows,
    markers,
    bands: [],
    total: t + 0.3,
    note:
      losePacket3 && loseAck1
        ? "Begge feil-typer: tap av data og tap av ACK. Timeren redder oss begge gangene."
        : losePacket3
          ? "Pakke 2 forsvinner. Senderens timer utløper → retransmit. Mottakeren får aldri vite forskjellen."
          : loseAck1
            ? "ACK 0 forsvinner. Senderens timer utløper → retransmit. Mottakeren detekterer duplikat via seq#, kaster, men ACK-er på nytt."
            : "Uten injiserte feil ser flyten ut som 2.2. Forskjellen er at timeren tikker i bakgrunnen.",
  };
}

function buildGbn(losePacket3: boolean): Scenario {
  const N = 4;
  const arrows: Arrow[] = [];
  const markers: Marker[] = [];
  // Send 8 pakker, vindu N=4. Hvis losePacket3 → pakke #2 forsvinner og base blokkerer.
  const sendT = 0.5; // tid mellom suksessive sendinger
  let t = 0;
  const sentAt: number[] = [];
  // Først: send N pakker i pipeline.
  for (let i = 0; i < N; i++) {
    sentAt.push(t);
    const losing = losePacket3 && i === 2;
    arrows.push({
      id: `d${i}`,
      dir: "send",
      tStart: t,
      tEnd: t + TRAVEL,
      label: `pkt${i}`,
      kind: "data",
      lost: losing,
    });
    t += sendT;
  }
  // Mottak + ACK
  let highestAcked = -1;
  let expected = 0;
  type AckEvent = { recvT: number; ackSeq: number; deliver: number | null };
  const ackEvents: AckEvent[] = [];
  for (let i = 0; i < N; i++) {
    const recvT = sentAt[i] + TRAVEL;
    const losing = losePacket3 && i === 2;
    if (losing) {
      // Pakken forsvant, ingen ACK.
      continue;
    }
    if (i === expected) {
      // Leverer og sender ACK
      markers.push({
        id: `dl${i}`,
        side: "right",
        t: recvT + 0.05,
        icon: "deliver",
        label: `deliver #${i}`,
      });
      ackEvents.push({ recvT, ackSeq: i, deliver: i });
      expected = i + 1;
    } else {
      // Ute av orden → kast, send duplikat-ACK for siste forventet - 1
      markers.push({
        id: `oo${i}`,
        side: "right",
        t: recvT + 0.05,
        icon: "drop",
        label: "out-of-order, kast",
      });
      ackEvents.push({ recvT, ackSeq: expected - 1, deliver: null });
    }
  }
  for (const a of ackEvents) {
    arrows.push({
      id: `a${a.recvT}`,
      dir: "recv",
      tStart: a.recvT + PROC,
      tEnd: a.recvT + PROC + TRAVEL,
      label: `ACK${a.ackSeq}`,
      kind: "ack",
    });
    if (a.ackSeq > highestAcked) highestAcked = a.ackSeq;
  }
  if (losePacket3) {
    // Timeout etter første pakke i vinduet (base = 0 hvis ACK0 ikke kommet enda;
    // her sier vi at base=2 fordi 0 og 1 ble ACK-et) → retransmitter 2,3,...
    const toT = sentAt[2] + TIMEOUT;
    markers.push({
      id: "to-gbn",
      side: "left",
      t: toT,
      icon: "timeout",
      label: "timeout — retransmit fra base",
    });
    // Retransmit pakke 2 og 3
    let rt = toT + 0.2;
    for (let i = 2; i < 4; i++) {
      arrows.push({
        id: `dr${i}`,
        dir: "send",
        tStart: rt,
        tEnd: rt + TRAVEL,
        label: `pkt${i} (re-tx)`,
        kind: "data",
      });
      const recvT = rt + TRAVEL;
      markers.push({
        id: `dlr${i}`,
        side: "right",
        t: recvT + 0.05,
        icon: "deliver",
        label: `deliver #${i}`,
      });
      arrows.push({
        id: `ar${i}`,
        dir: "recv",
        tStart: recvT + PROC,
        tEnd: recvT + PROC + TRAVEL,
        label: `ACK${i}`,
        kind: "ack",
      });
      rt += sendT;
    }
    t = rt + TRAVEL + 0.5;
  } else {
    t = sentAt[N - 1] + TRAVEL + PROC + TRAVEL + 0.5;
  }
  return {
    arrows,
    markers,
    bands: [],
    total: t,
    note: losePacket3
      ? "Pkt 2 forsvinner → ACK0, ACK1 kommer (kumulativ stopper på 1). Mottakeren kaster 3 (out-of-order). Senderens timer går ut → retransmitter ALT fra base=2."
      : "Pipelining med vindu N=4: fire pakker «in flight» samtidig. Throughput er ~4× stop-and-wait fordi vi ikke står og venter mellom hver.",
  };
}

// --------------------------------------------------------------------------

function buildScenario(mode: Mode, err: ErrorInjection): Scenario {
  switch (mode) {
    case "rdt10":
      return buildRdt10();
    case "rdt20":
      return buildRdt20(err.corruptData2);
    case "rdt21":
      return buildRdt21(err.corruptData2, err.loseAck1);
    case "rdt22":
      return buildRdt22(err.corruptData2);
    case "rdt30":
      return buildRdt30(err.losePacket3, err.loseAck1);
    case "gbn":
      return buildGbn(err.losePacket3);
  }
}

// --------------------------------------------------------------------------
// Selve komponenten
// --------------------------------------------------------------------------

export function RdtVisualizer() {
  const [mode, setMode] = useState<Mode>("rdt30");
  const [err, setErr] = useState<ErrorInjection>({
    corruptData2: false,
    loseAck1: false,
    losePacket3: true,
  });
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const scenario = useMemo(() => buildScenario(mode, err), [mode, err]);
  // Hvilke feil-toggles som faktisk har effekt for valgt mode
  const errorOptionsFor = (m: Mode) => ({
    corruptData2: ["rdt20", "rdt21", "rdt22"].includes(m),
    loseAck1: ["rdt21", "rdt30"].includes(m),
    losePacket3: ["rdt30", "gbn"].includes(m),
  });
  const errOpts = errorOptionsFor(mode);

  // Animasjonsløkke
  useEffect(() => {
    if (!playing) {
      lastTickRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (lastTickRef.current == null) lastTickRef.current = ts;
      const dt = (ts - lastTickRef.current) / 1000;
      lastTickRef.current = ts;
      setNow((cur) => {
        const next = cur + dt * 1.2;
        if (next >= scenario.total) {
          setPlaying(false);
          return scenario.total;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, scenario.total]);

  // Reset når mode/err endres
  useEffect(() => {
    setNow(0);
    setPlaying(false);
  }, [mode, err]);

  const reset = () => {
    setNow(0);
    setPlaying(false);
  };
  const stepForward = () => {
    setPlaying(false);
    // Hopp til neste hendelse etter `now`
    const all: number[] = [];
    for (const a of scenario.arrows) {
      all.push(a.tStart);
      all.push(a.tEnd);
    }
    for (const m of scenario.markers) all.push(m.t);
    all.sort((a, b) => a - b);
    const next = all.find((x) => x > now + 0.001);
    if (next != null) setNow(Math.min(next + 0.001, scenario.total));
    else setNow(scenario.total);
  };

  // Layout-konstanter
  const W = 640;
  const padTop = 30;
  const padBottom = 30;
  const sideX = { left: 110, right: W - 110 };
  const TIME_TO_PX = 70; // 1 enhet tid = 70 px
  const H = padTop + padBottom + Math.max(scenario.total * TIME_TO_PX, 200);

  const yFor = (t: number) => padTop + t * TIME_TO_PX;

  // Sender/mottaker-tilstand på `now`
  const senderState = describeSender(mode, scenario, now);
  const recvState = describeReceiver(mode, scenario, now);

  return (
    <figure className="my-6 rounded-xl border border-border bg-card">
      <figcaption className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Interaktiv pakke-tidslinje
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-xs rounded-md border px-2 py-1 transition-colors ${
                  mode === m.id
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background hover:border-brand/40 text-muted-foreground"
                }`}
                title={m.sub}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </figcaption>

      <div className="grid md:grid-cols-[260px_1fr]">
        <div className="border-b md:border-b-0 md:border-r border-border p-4 space-y-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Avspilling
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (now >= scenario.total) setNow(0);
                  setPlaying((p) => !p);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/40"
              >
                {playing ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Play
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={stepForward}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/40"
                aria-label="Hopp til neste hendelse"
                title="Hopp til neste hendelse"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs hover:border-brand/40"
                aria-label="Nullstill"
                title="Nullstill"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={scenario.total}
              step={0.01}
              value={now}
              onChange={(e) => {
                setPlaying(false);
                setNow(parseFloat(e.target.value));
              }}
              className="mt-2 w-full"
              aria-label="Tidsglider"
            />
            <div className="mt-1 text-[10px] text-muted-foreground font-mono">
              t = {now.toFixed(2)} / {scenario.total.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Injiser feil
            </div>
            <div className="space-y-1.5">
              <ErrorToggle
                checked={err.corruptData2}
                disabled={!errOpts.corruptData2}
                onChange={(v) => setErr((e) => ({ ...e, corruptData2: v }))}
                label="korruptér data-pkt #1"
              />
              <ErrorToggle
                checked={err.loseAck1}
                disabled={!errOpts.loseAck1}
                onChange={(v) => setErr((e) => ({ ...e, loseAck1: v }))}
                label="mist ACK 0"
              />
              <ErrorToggle
                checked={err.losePacket3}
                disabled={!errOpts.losePacket3}
                onChange={(v) => setErr((e) => ({ ...e, losePacket3: v }))}
                label="mist data-pkt #2"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              Feil som ikke gjelder for valgt mode er grå. F.eks. har ikke rdt 1.0 noen
              ACK å miste.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Mode-notat
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{MODE_NOTE[mode]}</p>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StateBox title="Senderens tilstand" body={senderState} side="left" />
            <StateBox title="Mottakerens tilstand" body={recvState} side="right" />
          </div>

          <div className="overflow-x-auto rounded-md border border-border bg-background">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              style={{ maxWidth: W }}
              role="img"
              aria-label="Tidsdiagram for RDT-protokoll"
            >
              <defs>
                <marker
                  id="rdt-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {/* Headers */}
              <text
                x={sideX.left}
                y={16}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
              >
                sender
              </text>
              <text
                x={sideX.right}
                y={16}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
              >
                mottaker
              </text>
              {/* Vertikale tidslinjer */}
              <line
                x1={sideX.left}
                y1={padTop}
                x2={sideX.left}
                y2={H - padBottom}
                className="stroke-border"
                strokeWidth={2}
              />
              <line
                x1={sideX.right}
                y1={padTop}
                x2={sideX.right}
                y2={H - padBottom}
                className="stroke-border"
                strokeWidth={2}
              />
              {/* Tid-akse-tikker */}
              {Array.from({ length: Math.floor(scenario.total) + 1 }).map((_, i) => (
                <g key={i}>
                  <line
                    x1={sideX.left - 4}
                    y1={yFor(i)}
                    x2={sideX.left + 4}
                    y2={yFor(i)}
                    className="stroke-muted-foreground"
                  />
                  <text
                    x={sideX.left - 10}
                    y={yFor(i) + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px] font-mono"
                  >
                    t={i}
                  </text>
                </g>
              ))}
              {/* Now-indikator */}
              <line
                x1={sideX.left - 8}
                y1={yFor(now)}
                x2={sideX.right + 8}
                y2={yFor(now)}
                className="stroke-brand"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
              />
              <circle cx={sideX.left} cy={yFor(now)} r={4} className="fill-brand" />
              <circle cx={sideX.right} cy={yFor(now)} r={4} className="fill-brand" />

              {/* Markører (timeout, drop, deliver) */}
              {scenario.markers.map((m) => {
                if (m.t > now + 0.001) return null;
                const x = m.side === "left" ? sideX.left - 38 : sideX.right + 38;
                const y = yFor(m.t);
                return <MarkerIcon key={m.id} marker={m} x={x} y={y} />;
              })}

              {/* Piler */}
              {scenario.arrows.map((a) => (
                <ArrowSvg
                  key={a.id}
                  arrow={a}
                  now={now}
                  fromX={a.dir === "send" ? sideX.left : sideX.right}
                  toX={a.dir === "send" ? sideX.right : sideX.left}
                  yFor={yFor}
                />
              ))}
            </svg>
          </div>

          <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-foreground leading-relaxed">
            <span className="font-semibold">Scenario:</span> {scenario.note}
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
            <Legend
              swatch={<span className="inline-block w-3 h-[2px] bg-foreground align-middle" />}
              label="data-pakke"
            />
            <Legend
              swatch={
                <span className="inline-block w-3 h-[2px] bg-emerald-500 align-middle" />
              }
              label="ACK"
            />
            <Legend
              swatch={
                <span className="inline-block w-3 h-[2px] bg-rose-500 align-middle" />
              }
              label="NAK / korrupt"
            />
            <Legend
              swatch={<Clock className="h-3 w-3 inline-block text-amber-500 align-middle" />}
              label="timeout"
            />
          </div>
        </div>
      </div>
    </figure>
  );
}

// --------------------------------------------------------------------------

function ErrorToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-xs ${
        disabled ? "text-muted-foreground/60 cursor-not-allowed" : "text-foreground cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={disabled ? false : checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border"
      />
      <span>{label}</span>
    </label>
  );
}

function StateBox({
  title,
  body,
  side,
}: {
  title: string;
  body: string;
  side: "left" | "right";
}) {
  return (
    <div
      className={`rounded-md border border-border bg-background p-2 ${
        side === "left" ? "" : "text-right"
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="text-xs font-mono mt-0.5">{body}</div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {swatch}
      <span>{label}</span>
    </div>
  );
}

function MarkerIcon({
  marker,
  x,
  y,
}: {
  marker: Marker;
  x: number;
  y: number;
}) {
  if (marker.icon === "timeout") {
    return (
      <g transform={`translate(${x - 6} ${y - 6})`}>
        <circle cx={6} cy={6} r={8} className="fill-amber-500/15 stroke-amber-500" strokeWidth={1} />
        <text x={6} y={9} textAnchor="middle" className="fill-amber-600 text-[9px] font-semibold">
          ⏱
        </text>
        <text x={20} y={9} className="fill-amber-600 text-[9px] font-mono">
          {marker.label}
        </text>
      </g>
    );
  }
  if (marker.icon === "drop") {
    return (
      <g transform={`translate(${x - 6} ${y - 6})`}>
        <text x={6} y={9} textAnchor="middle" className="fill-rose-500 text-[11px] font-bold">
          ✗
        </text>
        <text x={16} y={9} className="fill-rose-500 text-[9px] font-mono">
          {marker.label}
        </text>
      </g>
    );
  }
  // deliver
  return (
    <g transform={`translate(${x - 6} ${y - 6})`}>
      <circle cx={6} cy={6} r={4} className="fill-emerald-500" />
      <text x={16} y={9} className="fill-emerald-600 text-[9px] font-mono">
        {marker.label}
      </text>
    </g>
  );
}

function ArrowSvg({
  arrow,
  now,
  fromX,
  toX,
  yFor,
}: {
  arrow: Arrow;
  now: number;
  fromX: number;
  toX: number;
  yFor: (t: number) => number;
}) {
  if (now < arrow.tStart) return null;
  const tEnd = Math.min(now, arrow.tEnd);
  const progress = (tEnd - arrow.tStart) / (arrow.tEnd - arrow.tStart);
  const y1 = yFor(arrow.tStart);
  const y2 = yFor(tEnd);
  // hvis pakka er tapt: stopp halvveis og marker ×
  const effectiveProgress = arrow.lost ? Math.min(progress, 0.5) : progress;
  const xEnd = fromX + (toX - fromX) * effectiveProgress;
  const yEnd = y1 + (y2 - y1) * (arrow.lost ? (Math.min(progress, 0.5) / Math.max(progress, 0.001)) : 1);

  const colorClass =
    arrow.kind === "ack"
      ? "stroke-emerald-500 text-emerald-500"
      : arrow.kind === "nak" || arrow.corrupt
        ? "stroke-rose-500 text-rose-500"
        : "stroke-foreground text-foreground";
  const isDashed = arrow.lost;
  const showHead = !arrow.lost && progress >= 1;
  // label-posisjon: midt på pilen, justert litt bort fra linja
  const labelX = (fromX + xEnd) / 2;
  const labelY = (y1 + yEnd) / 2 - 4;
  const goingRight = toX > fromX;
  return (
    <g className={colorClass}>
      <line
        x1={fromX}
        y1={y1}
        x2={xEnd}
        y2={yEnd}
        strokeWidth={1.5}
        stroke="currentColor"
        strokeDasharray={isDashed ? "4 3" : undefined}
        markerEnd={showHead ? "url(#rdt-arrow)" : undefined}
      />
      {arrow.lost && progress >= 0.5 && (
        <text
          x={xEnd}
          y={yEnd + 4}
          textAnchor="middle"
          className="fill-rose-500 text-[11px] font-bold"
        >
          ✗
        </text>
      )}
      {(arrow.corrupt && !arrow.lost) && progress >= 1 && (
        <text
          x={xEnd - (goingRight ? 8 : -8)}
          y={yEnd - 4}
          className="fill-rose-500 text-[11px] font-bold"
        >
          ✗
        </text>
      )}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        className="text-[10px] font-mono"
        fill="currentColor"
      >
        {arrow.label}
      </text>
    </g>
  );
}

// --------------------------------------------------------------------------
// Tilstandsbeskrivelser — for boksene over diagrammet.
// --------------------------------------------------------------------------

function describeSender(mode: Mode, sc: Scenario, t: number): string {
  // Hva gjør senderen akkurat NÅ?
  // Heuristikk: hvis vi er innenfor tStart..tEnd på en send-pil → «sender pkt..»
  // Hvis det nylig var en timeout → «timeout, retransmitter»
  // Ellers, hvis vi venter på ACK → «vent på ACK»
  const sending = sc.arrows.find(
    (a) => a.dir === "send" && t >= a.tStart && t <= a.tEnd,
  );
  if (sending) return `sender ${sending.label}`;
  const recentTimeout = sc.markers
    .filter((m) => m.icon === "timeout" && m.t <= t && m.t >= t - 0.6)
    .pop();
  if (recentTimeout) return "TIMEOUT → re-tx";
  // ventet på ACK?
  const lastSend = [...sc.arrows]
    .filter((a) => a.dir === "send" && a.tEnd <= t)
    .pop();
  const followingAck = sc.arrows.find(
    (a) => a.dir === "recv" && a.tStart > t && a.tStart <= t + 2,
  );
  if (lastSend && (mode === "rdt10" || mode === "gbn")) {
    if (mode === "rdt10") return "klar — neste pakke";
    return "vindu — pipelining";
  }
  if (followingAck) return "vent på ACK";
  if (lastSend) return "vent på ACK";
  return "idle";
}

function describeReceiver(mode: Mode, sc: Scenario, t: number): string {
  const incoming = sc.arrows.find(
    (a) => a.dir === "send" && t >= a.tStart && t <= a.tEnd,
  );
  if (incoming) return `mottar ${incoming.label}…`;
  const recentDrop = sc.markers
    .filter((m) => m.side === "right" && m.t <= t && m.t >= t - 0.4)
    .pop();
  if (recentDrop) return recentDrop.label;
  if (mode === "rdt10") return "vent fra under";
  return "vent på pkt";
}
