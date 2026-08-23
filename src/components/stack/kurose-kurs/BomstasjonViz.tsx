import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

/**
 * Transmisjon vs. propagasjon — bomstasjons-analogien gjort kjørbar.
 *
 * Poenget som er vanskelig å få tak i fra tekst alene: de to forsinkelsene er
 * HELT uavhengige. Transmisjonstiden henger på hvor fort du får bitene ut på
 * lenken (L/R). Propagasjonstiden henger på hvor lang lenken er (d/s). Å
 * doble farten på bomstasjonen gjør ingenting med hvor lang veien er — og det
 * er nettopp det man ser når man skrur på skyvebryterne her.
 *
 * Bilene er bits, kolonnen er pakken, bomstasjonen er lenkens sendeside.
 */

const ROAD_X0 = 120;
const ROAD_X1 = 660;
const ROAD_Y = 150;

type Modus = "bil" | "nett";

export function BomstasjonViz() {
  const [modus, setModus] = useState<Modus>("bil");
  const [antall, setAntall] = useState(10); // biler i kolonnen / bits i pakken
  const [servicetid, setServicetid] = useState(12); // sek per bil = 1/R per bit
  const [avstand, setAvstand] = useState(100); // km
  const [fart, setFart] = useState(100); // km/t

  const [t, setT] = useState(0); // simulert tid i sekunder
  const [spiller, setSpiller] = useState(false);
  const raf = useRef<number | null>(null);
  const sist = useRef<number | null>(null);

  const propTid = (avstand / fart) * 3600; // sekunder
  const transTid = antall * servicetid; // sekunder
  const total = transTid + propTid;

  // Animasjonen komprimerer simulert tid slik at hele forløpet tar ~9 sekunder
  // uansett parametre — ellers blir en 62-minutters kolonne uutholdelig å se på.
  const skala = total / 9;

  useEffect(() => {
    if (!spiller) {
      sist.current = null;
      return;
    }
    const steg = (ms: number) => {
      if (sist.current == null) sist.current = ms;
      const dt = (ms - sist.current) / 1000;
      sist.current = ms;
      setT((prev) => {
        const neste = prev + dt * skala;
        if (neste >= total) {
          setSpiller(false);
          return total;
        }
        return neste;
      });
      raf.current = requestAnimationFrame(steg);
    };
    raf.current = requestAnimationFrame(steg);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [spiller, skala, total]);

  function reset() {
    setT(0);
    setSpiller(false);
  }

  // Bil i slipper bomstasjonen ved (i+1)*servicetid, og bruker propTid på veien.
  const biler = useMemo(() => {
    return Array.from({ length: antall }, (_, i) => {
      const slippTid = (i + 1) * servicetid;
      if (t < slippTid) {
        // Står fortsatt i kø foran bomstasjonen, stablet bakover.
        const iKo = i - Math.floor(t / servicetid);
        return { i, x: ROAD_X0 - 18 - Math.max(0, iKo) * 15, framme: false, ventet: true };
      }
      const p = Math.min(1, (t - slippTid) / propTid);
      return {
        i,
        x: ROAD_X0 + p * (ROAD_X1 - ROAD_X0),
        framme: p >= 1,
        ventet: false,
      };
    });
  }, [antall, servicetid, propTid, t]);

  const antallFramme = biler.filter((b) => b.framme).length;
  const sluppet = Math.min(antall, Math.floor(t / servicetid));

  const erNett = modus === "nett";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-2">
        <span className="text-sm font-semibold">
          {erNett ? "Pakke over en lenke" : "Bilkolonne gjennom to bomstasjoner"}
        </span>
        <div className="ml-auto flex rounded border border-border overflow-hidden text-xs">
          <button
            onClick={() => setModus("bil")}
            className={`px-2 py-1 ${!erNett ? "bg-brand text-background font-medium" : "hover:bg-muted"}`}
          >
            Analogi
          </button>
          <button
            onClick={() => setModus("nett")}
            className={`px-2 py-1 ${erNett ? "bg-brand text-background font-medium" : "hover:bg-muted"}`}
          >
            Nettverk
          </button>
        </div>
      </div>

      <svg viewBox="0 0 760 230" className="w-full">
        {/* Veien / lenken */}
        <line
          x1={ROAD_X0}
          y1={ROAD_Y}
          x2={ROAD_X1}
          y2={ROAD_Y}
          className="stroke-muted-foreground/30"
          strokeWidth={20}
        />
        <line
          x1={ROAD_X0}
          y1={ROAD_Y}
          x2={ROAD_X1}
          y2={ROAD_Y}
          className="stroke-muted-foreground/40"
          strokeWidth={1}
          strokeDasharray="8 8"
        />

        {/* Bomstasjon 1 = sendesiden */}
        <g>
          <rect
            x={ROAD_X0 - 14}
            y={ROAD_Y - 46}
            width={14}
            height={38}
            rx={2}
            className="fill-card stroke-brand"
            strokeWidth={2}
          />
          <text x={ROAD_X0 - 7} y={ROAD_Y - 54} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
            {erNett ? "Sender" : "Bom 1"}
          </text>
          <text x={ROAD_X0 - 7} y={ROAD_Y + 34} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {erNett ? `R = 1 bit / ${servicetid} s` : `${servicetid} s per bil`}
          </text>
        </g>

        {/* Bomstasjon 2 = mottakersiden */}
        <g>
          <rect
            x={ROAD_X1}
            y={ROAD_Y - 46}
            width={14}
            height={38}
            rx={2}
            className="fill-card stroke-success"
            strokeWidth={2}
          />
          <text x={ROAD_X1 + 7} y={ROAD_Y - 54} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
            {erNett ? "Mottaker" : "Bom 2"}
          </text>
        </g>

        {/* Avstandsmarkør */}
        <line x1={ROAD_X0} y1={ROAD_Y + 46} x2={ROAD_X1} y2={ROAD_Y + 46} className="stroke-muted-foreground/40" strokeWidth={1} />
        <text x={(ROAD_X0 + ROAD_X1) / 2} y={ROAD_Y + 60} textAnchor="middle" className="fill-muted-foreground text-[10px]">
          {avstand} km {erNett && "— propagasjon avhenger KUN av denne"}
        </text>

        {/* Bilene / bitene */}
        {biler.map((b) => (
          <g key={b.i}>
            <rect
              x={b.x - 6}
              y={ROAD_Y - 7}
              width={13}
              height={14}
              rx={2}
              className={
                b.framme
                  ? "fill-success/70 stroke-success"
                  : b.ventet
                    ? "fill-muted-foreground/20 stroke-muted-foreground/50"
                    : "fill-brand/70 stroke-brand"
              }
              strokeWidth={1.5}
            />
            <text x={b.x} y={ROAD_Y + 3} textAnchor="middle" className="fill-background text-[7px] font-bold">
              {erNett ? "1" : b.i + 1}
            </text>
          </g>
        ))}

        {/* Tidslinje */}
        <text x={20} y={30} className="fill-foreground text-[11px] font-semibold">
          t = {formatTid(t)}
        </text>
        <text x={20} y={46} className="fill-muted-foreground text-[10px]">
          {erNett ? "bits ute på lenken" : "sluppet gjennom bom 1"}: {sluppet} / {antall}
        </text>
        <text x={20} y={60} className="fill-muted-foreground text-[10px]">
          framme: {antallFramme} / {antall}
        </text>
      </svg>

      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20 px-4 py-2">
        <button
          onClick={() => {
            if (t >= total) setT(0);
            setSpiller((s) => !s);
          }}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20"
        >
          {spiller ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {spiller ? "Pause" : t >= total ? "Spill av igjen" : "Spill av"}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
        <input
          type="range"
          min={0}
          max={total}
          step={total / 200}
          value={t}
          onChange={(e) => {
            setSpiller(false);
            setT(Number(e.target.value));
          }}
          className="ml-2 flex-1 min-w-[140px] accent-brand"
          aria-label="Skrubb gjennom tiden"
        />
      </div>

      {/* Parametre */}
      <div className="grid gap-3 border-t border-border px-4 py-3 sm:grid-cols-2">
        <Skyv
          label={erNett ? "Bits i pakken (L)" : "Biler i kolonnen"}
          verdi={antall}
          min={2}
          max={20}
          onChange={(v) => {
            setAntall(v);
            reset();
          }}
        />
        <Skyv
          label={erNett ? "Sekunder per bit (1/R)" : "Servicetid per bil (s)"}
          verdi={servicetid}
          min={2}
          max={30}
          onChange={(v) => {
            setServicetid(v);
            reset();
          }}
        />
        <Skyv
          label="Avstand (km)"
          verdi={avstand}
          min={10}
          max={400}
          steg={10}
          onChange={(v) => {
            setAvstand(v);
            reset();
          }}
        />
        <Skyv
          label={erNett ? "Signalfart (km/t)" : "Fart (km/t)"}
          verdi={fart}
          min={50}
          max={400}
          steg={10}
          onChange={(v) => {
            setFart(v);
            reset();
          }}
        />
      </div>

      {/* Regnestykket */}
      <div className="grid gap-2 border-t border-border bg-muted/10 px-4 py-3 text-xs sm:grid-cols-3">
        <Rute
          tittel={erNett ? "Transmisjonstid  L/R" : "Transmisjonstid"}
          verdi={formatTid(transTid)}
          formel={erNett ? `${antall} bit ÷ (1 bit / ${servicetid} s)` : `${antall} biler × ${servicetid} s`}
          farge="brand"
        />
        <Rute
          tittel={erNett ? "Propagasjonstid  d/s" : "Propagasjonstid"}
          verdi={formatTid(propTid)}
          formel={`${avstand} km ÷ ${fart} km/t`}
          farge="success"
        />
        <Rute tittel="Totalt" verdi={formatTid(total)} formel="transmisjon + propagasjon" farge="fg" />
      </div>

      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Prøv dette:</strong> halver servicetiden. Transmisjonstiden
        halveres — propagasjonstiden rører seg ikke. Dra så avstanden opp: nå skjer det motsatte. De to
        er uavhengige størrelser, og det er hele poenget. En rask lenke gjør ikke veien kortere.
      </p>
    </div>
  );
}

function Skyv({
  label,
  verdi,
  min,
  max,
  steg = 1,
  onChange,
}: {
  label: string;
  verdi: number;
  min: number;
  max: number;
  steg?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="flex justify-between text-muted-foreground">
        {label}
        <span className="font-mono font-semibold text-foreground">{verdi}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={steg}
        value={verdi}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-brand"
      />
    </label>
  );
}

function Rute({
  tittel,
  verdi,
  formel,
  farge,
}: {
  tittel: string;
  verdi: string;
  formel: string;
  farge: "brand" | "success" | "fg";
}) {
  const ring =
    farge === "brand"
      ? "border-brand/40 bg-brand/5"
      : farge === "success"
        ? "border-success/40 bg-success/5"
        : "border-border bg-background";
  return (
    <div className={`rounded-lg border px-3 py-2 ${ring}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{tittel}</div>
      <div className="font-mono text-sm font-semibold text-foreground">{verdi}</div>
      <div className="text-[10px] text-muted-foreground">{formel}</div>
    </div>
  );
}

function formatTid(sek: number): string {
  if (sek < 90) return `${sek.toFixed(sek < 10 ? 1 : 0)} s`;
  const min = Math.floor(sek / 60);
  const rest = Math.round(sek % 60);
  return rest === 0 ? `${min} min` : `${min} min ${rest} s`;
}
