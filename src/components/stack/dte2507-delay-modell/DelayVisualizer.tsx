import { useEffect, useMemo, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Server } from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv delay-visualisering for en to-rutertopologi:
//   sender → R1 → R2 → mottaker
// Studenten justerer L (pakkestørrelse), R (båndbredde) og d (avstand) for
// hver av tre lenker, samt køen foran hver ruter. Komponentene
// (d_proc, d_queue, d_trans, d_prop) regnes ut live, vises som stablet bar
// per hop, brutt ut til mattebrokker, og animeres som en pakke som først
// presses ut av en ruter (transmisjon) og deretter sklir bortover lenken
// (propagasjon).
// --------------------------------------------------------------------------

type LinkParams = {
  R: number; // bps
  dKm: number; // distanse i km
  queue: number; // antall pakker foran i køen ved AVSENDERSIDEN av lenken
};

type Mode = "slim" | "lang" | "trafikk" | "ds" | "custom";

const D_PROC_S = 50e-6; // 50 µs per ruter — konstant i denne modellen
const S_MS = 2e8; // signal-hastighet i fiber, m/s

const PRESETS: Record<Exclude<Mode, "custom">, {
  label: string;
  sub: string;
  L: number; // bytes
  links: [LinkParams, LinkParams, LinkParams];
}> = {
  slim: {
    label: "Slim link",
    sub: "lav R → d_trans dominerer",
    L: 1500,
    links: [
      { R: 10_000_000, dKm: 50, queue: 0 },
      { R: 10_000_000, dKm: 50, queue: 0 },
      { R: 10_000_000, dKm: 50, queue: 0 },
    ],
  },
  lang: {
    label: "Lang strekk",
    sub: "satellitt → d_prop dominerer",
    L: 1500,
    links: [
      { R: 1_000_000_000, dKm: 50, queue: 0 },
      { R: 100_000_000, dKm: 8000, queue: 0 },
      { R: 1_000_000_000, dKm: 50, queue: 0 },
    ],
  },
  trafikk: {
    label: "Trafikkpropp",
    sub: "lang kø ved R1 → d_queue dominerer",
    L: 1500,
    links: [
      { R: 1_000_000_000, dKm: 5, queue: 5 },
      { R: 100_000_000, dKm: 100, queue: 4 },
      { R: 1_000_000_000, dKm: 5, queue: 0 },
    ],
  },
  ds: {
    label: "Datasenter",
    sub: "alt kort og raskt — alt mikroskopisk",
    L: 1500,
    links: [
      { R: 10_000_000_000, dKm: 1, queue: 0 },
      { R: 10_000_000_000, dKm: 1, queue: 0 },
      { R: 10_000_000_000, dKm: 1, queue: 0 },
    ],
  },
};

const MODES: { id: Exclude<Mode, "custom">; label: string; sub: string }[] = (
  Object.keys(PRESETS) as Array<Exclude<Mode, "custom">>
).map((id) => ({ id, label: PRESETS[id].label, sub: PRESETS[id].sub }));

// -------- Hjelpere -------------------------------------------------------

function fmtTime(s: number): string {
  if (s >= 1) return `${s.toFixed(3)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(3)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toFixed(1)} µs`;
  return `${(s * 1e9).toFixed(0)} ns`;
}

function fmtRate(bps: number): string {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)} Gbps`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(0)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} kbps`;
  return `${bps.toFixed(0)} bps`;
}

function fmtDist(km: number): string {
  if (km >= 1000) return `${km.toFixed(0)} km`;
  if (km >= 1) return `${km.toFixed(0)} km`;
  return `${(km * 1000).toFixed(0)} m`;
}

function fmtR(bps: number): string {
  // for math-uttrykk
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(1)}·10⁹`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(0)}·10⁶`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)}·10³`;
  return `${bps}`;
}

// -------- Komponent -------------------------------------------------------

export function DelayVisualizer() {
  const [mode, setMode] = useState<Mode>("slim");
  const [L, setL] = useState<number>(PRESETS.slim.L); // bytes
  const [links, setLinks] = useState<[LinkParams, LinkParams, LinkParams]>(() => [
    { ...PRESETS.slim.links[0] },
    { ...PRESETS.slim.links[1] },
    { ...PRESETS.slim.links[2] },
  ]);

  const applyMode = (m: Exclude<Mode, "custom">) => {
    setMode(m);
    setL(PRESETS[m].L);
    setLinks([
      { ...PRESETS[m].links[0] },
      { ...PRESETS[m].links[1] },
      { ...PRESETS[m].links[2] },
    ]);
    setPlaying(false);
    setTNow(0);
  };

  const updateLink = (i: 0 | 1 | 2, patch: Partial<LinkParams>) => {
    setMode("custom");
    setLinks((cur) => {
      const next = [...cur] as [LinkParams, LinkParams, LinkParams];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  // ---- Beregninger per hop --------------------------------------------
  // For hop i (i = 0,1,2) er lenken som pakken nettopp ble lagt ut på.
  // Køen på hop i representerer pakker foran «vår» pakke i kø ved
  // utgående link i. d_proc treffer på R1 og R2 (ikke på sender, ikke på
  // mottaker — men vi modellerer at d_proc treffer FØR hop 1 og hop 2
  // for å vise hva ruterne tilfører).
  //
  // L er bytes → ganges med 8 for bits.

  const Lbits = L * 8;

  const hops = useMemo(() => {
    return links.map((lk, i) => {
      const d_trans = Lbits / lk.R; // s
      const d_prop = (lk.dKm * 1000) / S_MS; // s
      // køen består av lk.queue pakker som hver må transmitteres med lk.R
      const d_queue = (lk.queue * Lbits) / lk.R; // s
      // d_proc legger vi til på hop 1 og hop 2 (ruterne) men ikke hop 0 (sender).
      const d_proc = i === 0 ? 0 : D_PROC_S;
      const total = d_proc + d_queue + d_trans + d_prop;
      return { idx: i, d_proc, d_queue, d_trans, d_prop, total };
    });
  }, [links, Lbits]);

  const totalEnd2End = hops.reduce((acc, h) => acc + h.total, 0);

  // ---- Animasjon ------------------------------------------------------

  // Vi spiller av reelle tider (slik som regnet) men skalerer slik at hele
  // turen tar mellom 1.5 og 6 sek. Stoppes/restartes når noe endres.
  const [playing, setPlaying] = useState(false);
  const [tNow, setTNow] = useState(0); // s i sim-tid (samme som de regnede s)
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // Skalerings-faktor: anim-sekund per sim-sekund.
  // Vi vil at hele totalEnd2End skal vises på ~3 sekunder.
  const animSpeed = useMemo(() => {
    if (totalEnd2End <= 0) return 1;
    const targetAnimSeconds = 3;
    return targetAnimSeconds / totalEnd2End;
  }, [totalEnd2End]);

  useEffect(() => {
    // Stopp animasjonen når parametre endres slik at vi ikke leter etter
    // gamle tNow > nye totalt.
    setPlaying(false);
    setTNow(0);
  }, [Lbits, links]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dtMs = ts - lastRef.current;
      lastRef.current = ts;
      const dtSimS = (dtMs / 1000) / animSpeed;
      setTNow((cur) => {
        const next = cur + dtSimS;
        if (next >= totalEnd2End) {
          setPlaying(false);
          return totalEnd2End;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, animSpeed, totalEnd2End]);

  const togglePlay = () => {
    if (tNow >= totalEnd2End) setTNow(0);
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setTNow(0);
  };

  // ---- Hvor er pakken nå? -------------------------------------------
  // For hver hop har vi 4 faser: proc, queue, trans, prop.
  // Pakken «eksisterer» som et rektangel i en av disse fasene.
  // Vi finner aktiv hop og fase basert på akkumulert tid.
  const phase = useMemo(() => {
    let t = tNow;
    for (let i = 0; i < hops.length; i++) {
      const h = hops[i];
      if (t < h.d_proc) return { hop: i, kind: "proc" as const, frac: t / Math.max(h.d_proc, 1e-12) };
      t -= h.d_proc;
      if (t < h.d_queue) return { hop: i, kind: "queue" as const, frac: t / Math.max(h.d_queue, 1e-12) };
      t -= h.d_queue;
      if (t < h.d_trans) return { hop: i, kind: "trans" as const, frac: t / Math.max(h.d_trans, 1e-12) };
      t -= h.d_trans;
      if (t < h.d_prop) return { hop: i, kind: "prop" as const, frac: t / Math.max(h.d_prop, 1e-12) };
      t -= h.d_prop;
    }
    return { hop: 2, kind: "done" as const, frac: 1 };
  }, [tNow, hops]);

  // ---- Bar-skalering ------------------------------------------------
  const maxHopTotal = Math.max(...hops.map((h) => h.total), 1e-12);

  // ---- Visuell layout for topologi ----------------------------------
  // Vi tegner sender, R1, R2, mottaker som fire bokser, og tre lenker
  // mellom dem som horisontale «spor» der pakken kan ligge.
  // Hver lenke har sin egen rad slik at vi ikke trenger SVG.

  const LinkRow = ({ i }: { i: 0 | 1 | 2 }) => {
    const h = hops[i];
    const isActive = phase.hop === i && phase.kind !== "done";
    // posisjons-bregning for pakke-rektangelet langs lenken
    // - i "proc"-fasen sitter pakken i ruteren (vises som overlay over ruter-boksen, ikke i lenkeraden)
    // - i "queue" sitter pakken på avsenderside (helt til venstre i lenken), bredde = liten
    // - i "trans" er ledende kant på 0, halen kommer ut etter hvert. Bredde fra 0..100% i bredde-akse,
    //   posisjonen er klistret til venstre. Vi viser bredde = frac*100%.
    //   Visuelt blir det at pakken "presses ut" fra ruteren.
    // - i "prop" har hele pakken forlatt ruteren. Den glir bortover lenken.
    //   venstre kant = frac*(100% - pakkebredde), pakkebredde liten konstant.
    const queueWidthPct = 10;
    const propPacketWidthPct = 12;
    let leftPct = 0;
    let widthPct = 0;
    let visible = false;
    let color = "bg-orange-500";
    if (isActive) {
      visible = true;
      if (phase.kind === "queue") {
        leftPct = 0;
        widthPct = queueWidthPct;
        color = "bg-rose-500";
      } else if (phase.kind === "trans") {
        leftPct = 0;
        widthPct = Math.max(2, phase.frac * 30); // pakke vokser ut av ruter
        color = "bg-orange-500";
      } else if (phase.kind === "prop") {
        leftPct = phase.frac * (100 - propPacketWidthPct);
        widthPct = propPacketWidthPct;
        color = "bg-blue-500";
      } else {
        visible = false; // proc skjules i lenkeraden
      }
    } else if (phase.hop > i) {
      // pakken har passert denne lenken — vises som ferdig markert helt til høyre
      leftPct = 100 - propPacketWidthPct;
      widthPct = propPacketWidthPct;
      visible = true;
      color = "bg-emerald-500/40";
    }

    return (
      <div className="relative h-9 rounded-md bg-muted/40 border border-border overflow-hidden">
        {/* køposisjon-markering hvis denne lenken har kø foran */}
        {links[i].queue > 0 && (
          <div className="absolute top-0 bottom-0 left-0 flex items-center pl-1 gap-0.5 z-0">
            {Array.from({ length: links[i].queue }).map((_, k) => (
              <div
                key={k}
                className="h-5 w-2.5 rounded-sm bg-rose-300/70 border border-rose-400/50"
                title="Pakke foran i køen"
              />
            ))}
          </div>
        )}
        {/* selve pakken */}
        {visible && (
          <div
            className={`absolute top-1.5 bottom-1.5 ${color} rounded-sm shadow-sm transition-none`}
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          />
        )}
        <div className="absolute right-2 top-1 text-[10px] font-mono text-muted-foreground bg-card/70 rounded px-1">
          Lenke {i + 1} · {fmtRate(links[i].R)} · {fmtDist(links[i].dKm)}
        </div>
      </div>
    );
  };

  const Node = ({ label, sub, active, kind }: { label: string; sub: string; active: boolean; kind?: "proc" | "queue" }) => (
    <div
      className={`relative w-24 shrink-0 rounded-md border ${active ? "border-brand bg-brand/10" : "border-border bg-card"} p-2 text-center`}
    >
      <Server className={`h-4 w-4 mx-auto ${active ? "text-brand" : "text-muted-foreground"}`} />
      <div className="text-[11px] font-semibold mt-0.5">{label}</div>
      <div className="text-[9px] text-muted-foreground leading-tight">{sub}</div>
      {active && kind === "proc" && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono bg-slate-500 text-white rounded px-1">
          d_proc
        </div>
      )}
    </div>
  );

  // hopper hvor en av disse ruterne er aktive i proc-fasen
  const r1Active = phase.hop === 1 && phase.kind === "proc";
  const r2Active = phase.hop === 2 && phase.kind === "proc";

  // Bar-segment-data
  const palette = {
    proc: "bg-slate-400",
    queue: "bg-rose-500",
    trans: "bg-orange-500",
    prop: "bg-blue-500",
  };

  const labels = {
    proc: "d_proc",
    queue: "d_queue",
    trans: "d_trans",
    prop: "d_prop",
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden" role="region" aria-label="Interaktiv visualisering: Forsinkelses-modell">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Delay-visualisering · to-rutertopologi
          </div>
          <div className="text-[11px] text-muted-foreground">
            Studer hvordan L, R, d og kølengde flytter dominansen mellom de fire forsinkelsene.
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => applyMode(m.id)}
              className={`px-2 py-1 text-[11px] font-medium rounded-md border text-left ${
                mode === m.id
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-card hover:border-brand/40 text-foreground"
              }`}
              title={m.sub}
            >
              <div>{m.label}</div>
              <div className="text-[9px] text-muted-foreground leading-tight">{m.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Topologi med animasjon ----------------------------------------- */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-[6rem_1fr_6rem_1fr_6rem_1fr_6rem] items-center gap-2">
          <Node label="Sender" sub="kilde" active={phase.hop === 0 && phase.kind !== "done"} />
          <LinkRow i={0} />
          <Node label="R1" sub="ruter" active={r1Active || (phase.hop === 1 && phase.kind === "queue")} kind={r1Active ? "proc" : "queue"} />
          <LinkRow i={1} />
          <Node label="R2" sub="ruter" active={r2Active || (phase.hop === 2 && phase.kind === "queue")} kind={r2Active ? "proc" : "queue"} />
          <LinkRow i={2} />
          <Node label="Mottaker" sub="dest" active={phase.kind === "done"} />
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand bg-brand text-brand-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "Pause" : tNow >= totalEnd2End ? "Spill av igjen" : "Spill av"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-brand/40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
          <div className="text-[11px] text-muted-foreground font-mono">
            sim-tid: {fmtTime(tNow)} / {fmtTime(totalEnd2End)} ·{" "}
            <span className={
              phase.kind === "proc" ? "text-slate-500" :
              phase.kind === "queue" ? "text-rose-500" :
              phase.kind === "trans" ? "text-orange-500" :
              phase.kind === "prop" ? "text-blue-500" : "text-emerald-500"
            }>
              {phase.kind === "done" ? "ferdig" : `hop ${phase.hop + 1} · ${labels[phase.kind]}`}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> d_proc</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> d_queue</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> d_trans</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> d_prop</span>
        </div>
      </div>

      {/* Kontroll + matte ----------------------------------------------- */}
      <div className="grid md:grid-cols-[1fr_320px]">
        <div className="p-4 space-y-5">
          {/* Pakkestørrelse */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-brand">L (pakkestørrelse)</span>
              <span className="font-mono">{L} byte = {Lbits} bits</span>
            </div>
            <Slider
              min={100}
              max={1500}
              step={50}
              value={[L]}
              onValueChange={(v) => { setMode("custom"); setL(v[0]); }}
            />
          </div>

          {/* Per lenke */}
          {[0, 1, 2].map((i) => {
            const lk = links[i as 0 | 1 | 2];
            return (
              <div key={i} className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-brand">
                  Lenke {i + 1} {i === 0 ? "(sender → R1)" : i === 1 ? "(R1 → R2)" : "(R2 → mottaker)"}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono">R (båndbredde)</span>
                    <span className="font-mono">{fmtRate(lk.R)}</span>
                  </div>
                  <input
                    type="range"
                    min={7}
                    max={10}
                    step={0.05}
                    value={Math.log10(lk.R)}
                    onChange={(e) => updateLink(i as 0 | 1 | 2, { R: Math.round(Math.pow(10, parseFloat(e.target.value))) })}
                    className="w-full accent-brand"
                  />
                  <div className="text-[10px] text-muted-foreground">10 Mbps … 10 Gbps</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono">d (avstand)</span>
                    <span className="font-mono">{fmtDist(lk.dKm)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={0.05}
                    value={Math.log10(Math.max(1, lk.dKm))}
                    onChange={(e) => updateLink(i as 0 | 1 | 2, { dKm: Math.round(Math.pow(10, parseFloat(e.target.value))) })}
                    className="w-full accent-brand"
                  />
                  <div className="text-[10px] text-muted-foreground">1 km … 10 000 km</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-mono">Pakker i kø foran</span>
                    <span className="font-mono">{lk.queue}</span>
                  </div>
                  <Slider
                    min={0}
                    max={5}
                    step={1}
                    value={[lk.queue]}
                    onValueChange={(v) => updateLink(i as 0 | 1 | 2, { queue: v[0] })}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Matematikk-kolonne */}
        <div className="p-4 border-t md:border-t-0 md:border-l border-border bg-muted/10 text-xs space-y-3">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Live matematikk per hop
          </div>

          {hops.map((h, i) => (
            <div key={i} className="rounded-md border border-border/60 bg-card p-2 space-y-1">
              <div className="font-semibold text-brand text-[11px]">
                Hop {i + 1} {i === 0 ? "(sender → R1)" : i === 1 ? "(R1 → R2)" : "(R2 → mottaker)"}
              </div>
              {h.d_proc > 0 && (
                <div className="font-mono text-[10.5px] leading-snug">
                  d_proc = {fmtTime(h.d_proc)}{" "}
                  <span className="text-muted-foreground">(konstant per ruter)</span>
                </div>
              )}
              <div className="font-mono text-[10.5px] leading-snug">
                d_queue = N·L/R = {links[i].queue} · {Lbits} / {fmtR(links[i].R)} ={" "}
                <span className="text-rose-600 font-semibold">{fmtTime(h.d_queue)}</span>
              </div>
              <div className="font-mono text-[10.5px] leading-snug">
                d_trans = L/R = {Lbits} / {fmtR(links[i].R)} ={" "}
                <span className="text-orange-600 font-semibold">{fmtTime(h.d_trans)}</span>
              </div>
              <div className="font-mono text-[10.5px] leading-snug">
                d_prop = d/s = {(links[i].dKm * 1000).toLocaleString("no")} m / {(S_MS / 1e8).toFixed(0)}·10⁸ m/s ={" "}
                <span className="text-blue-600 font-semibold">{fmtTime(h.d_prop)}</span>
              </div>
              <div className="font-mono text-[10.5px] leading-snug border-t border-border/60 pt-1 mt-1">
                d_nodal = <span className="font-semibold">{fmtTime(h.total)}</span>
              </div>
            </div>
          ))}

          <div className="rounded-md border border-brand/40 bg-brand/5 p-2 font-mono text-[11px] leading-snug">
            <div className="text-muted-foreground text-[10px] mb-0.5">End-to-end</div>
            d_e2e = Σ d_nodal = <span className="font-bold text-brand">{fmtTime(totalEnd2End)}</span>
          </div>
        </div>
      </div>

      {/* Stablet bar-chart per hop ------------------------------------- */}
      <div className="border-t border-border p-4 bg-muted/10">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
          Hvor går tiden? — stablet søyle per hop
        </div>
        <div className="space-y-2">
          {hops.map((h, i) => {
            const widthPct = (h.total / maxHopTotal) * 100;
            const segs = (["proc", "queue", "trans", "prop"] as const).map((k) => ({
              k,
              v: h[`d_${k}` as const],
            }));
            return (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-mono mb-0.5">
                  <span className="text-brand">Hop {i + 1}</span>
                  <span>{fmtTime(h.total)}</span>
                </div>
                <div className="h-5 rounded bg-muted/40 border border-border overflow-hidden relative">
                  <div className="absolute top-0 bottom-0 left-0 flex" style={{ width: `${widthPct}%` }}>
                    {segs.map((seg) => {
                      const segPct = h.total > 0 ? (seg.v / h.total) * 100 : 0;
                      if (segPct < 0.1) return null;
                      return (
                        <div
                          key={seg.k}
                          className={`${palette[seg.k]} h-full flex items-center justify-center text-[9px] font-mono text-white/95`}
                          style={{ width: `${segPct}%` }}
                          title={`${labels[seg.k]} = ${fmtTime(seg.v)}`}
                        >
                          {segPct >= 14 ? labels[seg.k] : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-[10.5px] text-muted-foreground leading-snug">
          Tips: prøv «Slim link» og se hvordan orange (d_trans) dominerer. Bytt til «Lang strekk» —
          plutselig er det blå (d_prop) som spiser tiden. Skru opp kølengden i hop 2 i «Trafikkpropp»
          for å se røde d_queue ta over.
        </div>
      </div>
    </div>
  );
}
