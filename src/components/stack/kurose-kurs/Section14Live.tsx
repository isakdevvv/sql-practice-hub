import { useMemo, useState } from "react";
import { Cpu, Hourglass, Send, Radio, MapPin } from "lucide-react";

// Levende versjon av seksjon 1.4: forsinkelses-kalkulator. Justér pakkestørrelse,
// lenkerate, avstand, kø og antall hopp — se hvordan hver av de fire
// forsinkelses-komponentene (prosessering, kø, transmisjon, propagasjon)
// vokser eller krymper, og hvilken som dominerer.

// ---- Forhåndsdefinerte scenarier (alle tall er våre egne overslag, ikke
// kopiert fra noen lærebok). Avstander er omtrentlige store-sirkler.
type Scenario = {
  id: string;
  name: string;
  blurb: string;
  L: number; // bytes
  R: number; // bps
  dist: number; // meter
  kø: number; // pakker
  hops: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "lan",
    name: "Hjemme-LAN",
    blurb: "PC til ruter i samme rom — fiber-rate, ingen kø.",
    L: 1500,
    R: 1_000_000_000, // 1 Gbps
    dist: 1_000, // 1 km
    kø: 0,
    hops: 1,
  },
  {
    id: "bergen-oslo",
    name: "Bergen → Oslo",
    blurb: "Pakke fra studenten i Bergen til en server hos en aktør i Oslo.",
    L: 1500,
    R: 100_000_000, // 100 Mbps aksess
    dist: 400_000, // 400 km
    kø: 3,
    hops: 6,
  },
  {
    id: "tromsø-ny",
    name: "Tromsø → New York",
    blurb: "Undersjøisk fiberkabel over Atlanteren.",
    L: 1500,
    R: 1_000_000_000,
    dist: 5_800_000, // 5800 km
    kø: 5,
    hops: 11,
  },
  {
    id: "oslo-tokyo",
    name: "Oslo → Tokyo",
    blurb: "Lang fiber-rute via Sibir/Kina — propagasjon dominerer.",
    L: 1500,
    R: 1_000_000_000,
    dist: 9_000_000, // 9000 km
    kø: 8,
    hops: 14,
  },
  {
    id: "stor-pakke-tregt-nett",
    name: "Stor pakke, tregt nett",
    blurb: "Stor fil over en eldre mobilforbindelse — transmisjon dominerer.",
    L: 9_000,
    R: 5_000_000, // 5 Mbps
    dist: 50_000, // 50 km
    kø: 2,
    hops: 4,
  },
];

// ---- Slider-grenser. Log-skala for R og dist; lineær for L, kø, hops.
const L_MIN = 100;
const L_MAX = 10_000;
const R_LOG_MIN = Math.log10(1_000_000); // 1 Mbps
const R_LOG_MAX = Math.log10(10_000_000_000); // 10 Gbps
const DIST_LOG_MIN = Math.log10(1_000); // 1 km
const DIST_LOG_MAX = Math.log10(10_000_000); // 10 000 km
const KØ_MIN = 0;
const KØ_MAX = 50;
const HOPS_MIN = 1;
const HOPS_MAX = 15;

const SPEED_IN_FIBER = 2e8; // m/s — omtrent 2/3 av lysfart i vakuum
const D_PROC_PER_HOP = 1e-6; // 1 µs per hop, en grei tommelfingerregel

type Component = "proc" | "kø" | "trans" | "prop";

const COMP_LABEL: Record<Component, string> = {
  proc: "Prosessering",
  kø: "Kø",
  trans: "Transmisjon",
  prop: "Propagasjon",
};
const COMP_BG: Record<Component, string> = {
  proc: "bg-purple-500",
  kø: "bg-amber-500",
  trans: "bg-brand",
  prop: "bg-success",
};
const COMP_TEXT: Record<Component, string> = {
  proc: "text-purple-600 dark:text-purple-300",
  kø: "text-amber-600 dark:text-amber-300",
  trans: "text-brand",
  prop: "text-success",
};
const COMP_BORDER: Record<Component, string> = {
  proc: "border-purple-500/40",
  kø: "border-amber-500/40",
  trans: "border-brand/40",
  prop: "border-success/40",
};
const COMP_ICON: Record<Component, React.ComponentType<{ className?: string }>> = {
  proc: Cpu,
  kø: Hourglass,
  trans: Send,
  prop: Radio,
};

export function Section14Live() {
  const [L, setL] = useState(1500);
  const [R, setR] = useState(100_000_000); // 100 Mbps
  const [dist, setDist] = useState(400_000); // 400 km
  const [kø, setKø] = useState(3);
  const [hops, setHops] = useState(6);

  // Beregninger — alt i sekunder, formatteres ved render.
  const calc = useMemo(() => {
    const dTransPerHop = (L * 8) / R; // s
    const dPropTotal = dist / SPEED_IN_FIBER; // s
    const dProcTotal = D_PROC_PER_HOP * hops; // s
    const dKøPerHop = kø * dTransPerHop; // forenklet: kø-pakker foran må sendes ut først
    // Vi modellerer at kø/transmisjon/prosessering skjer ved hver ruter (hops),
    // men kø er typisk konsentrert ved én flaskehals — vi bruker hops som
    // multiplikator for proc/trans og lar kø være på samme størrelse hele veien.
    // Det er en god nok tilnærming for å vise proporsjonene.
    const dTransTotal = dTransPerHop * hops;
    const dKøTotal = dKøPerHop; // ikke ganget med hops — kø dominerer typisk ved én flaskehals
    const total = dProcTotal + dKøTotal + dTransTotal + dPropTotal;

    const parts: Record<Component, number> = {
      proc: dProcTotal,
      kø: dKøTotal,
      trans: dTransTotal,
      prop: dPropTotal,
    };

    // Hvilken komponent dominerer?
    let dominant: Component = "proc";
    for (const k of ["proc", "kø", "trans", "prop"] as Component[]) {
      if (parts[k] > parts[dominant]) dominant = k;
    }

    return { parts, total, dominant, dTransPerHop, dPropTotal, dKøPerHop };
  }, [L, R, dist, kø, hops]);

  function applyScenario(s: Scenario) {
    setL(s.L);
    setR(s.R);
    setDist(s.dist);
    setKø(s.kø);
    setHops(s.hops);
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-b border-border flex items-center gap-3">
        <span className="font-medium text-foreground">Forsinkelses-kalkulator</span>
        <span className="ml-auto font-mono">
          {COMP_LABEL[calc.dominant].toLowerCase()} dominerer
        </span>
      </div>

      {/* Scenario-knapper */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5 border-b border-border bg-muted/20">
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mr-1">
          <MapPin className="h-3 w-3" /> Scenario:
        </span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => applyScenario(s)}
            title={s.blurb}
            className="rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 hover:bg-brand/5"
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Slidere */}
      <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 border-b border-border">
        <SliderRow
          label="Pakkestørrelse L"
          value={`${L} B`}
          min={L_MIN}
          max={L_MAX}
          step={50}
          val={L}
          onChange={setL}
          hint={`= ${(L * 8).toLocaleString("nb-NO")} bits`}
        />
        <SliderRow
          label="Lenke-rate R"
          value={formatRate(R)}
          min={R_LOG_MIN}
          max={R_LOG_MAX}
          step={0.01}
          val={Math.log10(R)}
          onChange={(v) => setR(Math.round(Math.pow(10, v)))}
          hint="logaritmisk skala"
        />
        <SliderRow
          label="Avstand"
          value={formatDist(dist)}
          min={DIST_LOG_MIN}
          max={DIST_LOG_MAX}
          step={0.01}
          val={Math.log10(dist)}
          onChange={(v) => setDist(Math.round(Math.pow(10, v)))}
          hint="logaritmisk skala"
        />
        <SliderRow
          label="Antall hopp (rutere)"
          value={`${hops}`}
          min={HOPS_MIN}
          max={HOPS_MAX}
          step={1}
          val={hops}
          onChange={(v) => setHops(Math.round(v))}
          hint="kjede av rutere mellom A og B"
        />
        <SliderRow
          label="Kø-lengde (pakker foran)"
          value={`${kø}`}
          min={KØ_MIN}
          max={KØ_MAX}
          step={1}
          val={kø}
          onChange={(v) => setKø(Math.round(v))}
          hint="ved flaskehals-ruteren"
        />
        <div className="text-[11px] text-muted-foreground self-end pb-1">
          Lyset i fiber: ~2·10⁸ m/s. Prosessering: ~1 µs per hopp.
        </div>
      </div>

      {/* Stacked bar — proporsjoner */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[11px] text-muted-foreground mb-1.5 flex justify-between">
          <span>Proporsjoner av total ende-til-ende-forsinkelse</span>
          <span className="font-mono">{formatTime(calc.total)}</span>
        </div>
        <StackedBar parts={calc.parts} total={calc.total} dominant={calc.dominant} />
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          {(["proc", "kø", "trans", "prop"] as Component[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${COMP_BG[k]}`} />
              {COMP_LABEL[k]} — {pct(calc.parts[k], calc.total)}%
            </span>
          ))}
        </div>
      </div>

      {/* Tabell — komponent-for-komponent */}
      <div className="px-4 py-3 border-b border-border">
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left font-medium py-1.5 px-1">Komponent</th>
              <th className="text-left font-medium py-1.5 px-1">Formel</th>
              <th className="text-right font-medium py-1.5 px-1">Verdi</th>
              <th className="text-right font-medium py-1.5 px-1">Andel</th>
            </tr>
          </thead>
          <tbody>
            <CompRow
              kind="proc"
              formula={`1 µs × ${hops} hopp`}
              value={calc.parts.proc}
              total={calc.total}
              dominant={calc.dominant}
            />
            <CompRow
              kind="kø"
              formula={`${kø} pakker × ${formatTime(calc.dTransPerHop)} /pakke`}
              value={calc.parts.kø}
              total={calc.total}
              dominant={calc.dominant}
            />
            <CompRow
              kind="trans"
              formula={`(${L}·8) / ${formatRate(R)} × ${hops}`}
              value={calc.parts.trans}
              total={calc.total}
              dominant={calc.dominant}
            />
            <CompRow
              kind="prop"
              formula={`${formatDist(dist)} / (2·10⁸ m/s)`}
              value={calc.parts.prop}
              total={calc.total}
              dominant={calc.dominant}
            />
            <tr className="border-t-2 border-border">
              <td className="py-2 px-1 font-semibold">Total</td>
              <td className="py-2 px-1 text-muted-foreground">d_proc + d_kø + d_trans + d_prop</td>
              <td className="py-2 px-1 text-right font-mono font-semibold">
                {formatTime(calc.total)}
              </td>
              <td className="py-2 px-1 text-right text-muted-foreground">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Forklaring */}
      <div className="px-4 py-3 text-[12px] text-muted-foreground">
        <p>
          <span className={`font-semibold ${COMP_TEXT[calc.dominant]}`}>
            {COMP_LABEL[calc.dominant]}
          </span>{" "}
          dominerer i denne konfigurasjonen.{" "}
          {explainDominant(calc.dominant, { L, R, dist, kø, hops })}
        </p>
      </div>
    </div>
  );
}

// ---------------- Helpers ----------------

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  val,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  val: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <span className="text-xs font-mono text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand"
      />
      {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

function StackedBar({
  parts,
  total,
  dominant,
}: {
  parts: Record<Component, number>;
  total: number;
  dominant: Component;
}) {
  if (total <= 0) return null;
  const order: Component[] = ["proc", "kø", "trans", "prop"];
  return (
    <div className="flex w-full h-7 rounded overflow-hidden border border-border">
      {order.map((k) => {
        const w = (parts[k] / total) * 100;
        if (w <= 0.05) return null;
        const isDom = k === dominant;
        return (
          <div
            key={k}
            style={{ width: `${w}%` }}
            className={`${COMP_BG[k]} ${isDom ? "ring-2 ring-inset ring-foreground/40" : ""} flex items-center justify-center text-[10px] font-semibold text-white/95`}
            title={`${COMP_LABEL[k]}: ${formatTime(parts[k])} (${w.toFixed(1)}%)`}
          >
            {w > 8 ? `${w.toFixed(0)}%` : ""}
          </div>
        );
      })}
    </div>
  );
}

function CompRow({
  kind,
  formula,
  value,
  total,
  dominant,
}: {
  kind: Component;
  formula: string;
  value: number;
  total: number;
  dominant: Component;
}) {
  const Icon = COMP_ICON[kind];
  const isDom = kind === dominant;
  return (
    <tr className={`border-b border-border/60 ${isDom ? `bg-muted/40 ${COMP_BORDER[kind]}` : ""}`}>
      <td className="py-1.5 px-1">
        <span className="inline-flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${COMP_BG[kind]}`} />
          <Icon className={`h-3 w-3 ${COMP_TEXT[kind]}`} />
          <span className={`font-medium ${isDom ? COMP_TEXT[kind] : ""}`}>{COMP_LABEL[kind]}</span>
        </span>
      </td>
      <td className="py-1.5 px-1 text-muted-foreground font-mono text-[11px]">{formula}</td>
      <td className={`py-1.5 px-1 text-right font-mono ${isDom ? "font-semibold" : ""}`}>
        {formatTime(value)}
      </td>
      <td className="py-1.5 px-1 text-right text-muted-foreground">{pct(value, total)}%</td>
    </tr>
  );
}

function formatTime(s: number): string {
  if (s <= 0) return "0";
  if (s < 1e-6) return `${(s * 1e9).toFixed(1)} ns`;
  if (s < 1e-3) return `${(s * 1e6).toFixed(s * 1e6 >= 100 ? 0 : 1)} µs`;
  if (s < 1) return `${(s * 1e3).toFixed(s * 1e3 >= 100 ? 0 : s * 1e3 >= 10 ? 1 : 2)} ms`;
  return `${s.toFixed(2)} s`;
}

function formatRate(bps: number): string {
  if (bps >= 1e9) return `${(bps / 1e9).toFixed(bps / 1e9 >= 10 ? 0 : 1)} Gbps`;
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(bps / 1e6 >= 10 ? 0 : 1)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} kbps`;
  return `${bps} bps`;
}

function formatDist(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(m / 1000 >= 100 ? 0 : 1)} km`;
  return `${m.toFixed(0)} m`;
}

function pct(part: number, total: number): string {
  if (total <= 0) return "0";
  const p = (part / total) * 100;
  if (p < 0.1) return "<0.1";
  if (p < 10) return p.toFixed(1);
  return p.toFixed(0);
}

function explainDominant(
  dom: Component,
  ctx: { L: number; R: number; dist: number; kø: number; hops: number },
): string {
  switch (dom) {
    case "proc":
      return "Med høy lenke-rate, kort avstand og tom kø blir det å lese header på hver ruter den største kostnaden — men dette er alltid mikrosekunder, sjelden noe man merker.";
    case "kø":
      return `Med ${ctx.kø} pakker foran i køen må vår pakke vente på at hver av dem klemmes ut. Kø-forsinkelse er den eneste komponenten som varierer dramatisk fra øyeblikk til øyeblikk.`;
    case "trans":
      return "Stor pakke delt på en treig lenke gjør at det rett og slett tar lang tid å få ut alle bits. Dette er fast per pakke — bestemmes av L og R, ikke av avstand.";
    case "prop":
      return "På lange avstander må selv lyset i fiber bruke tid. Dette gulvet kan du ikke kjøpe deg unna — bare båndbredden, ikke latencyen, skaleres med raskere lenker.";
  }
}
