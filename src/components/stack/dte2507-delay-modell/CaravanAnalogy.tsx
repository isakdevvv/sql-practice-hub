import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

/**
 * Kurose & Ross sin karavananalogi (s. 37–38):
 * - 10 biler i karavane
 * - 2 bomstasjoner, 100 km fra hverandre
 * - hver bom serverer 1 bil hver 12. sekund (transmisjon = "service time")
 * - biler kjører 100 km/t mellom bomstasjonene (propagasjon)
 *
 * Mapping:
 *   bil  = bit
 *   karavane = pakke
 *   bomstasjon = ruter
 *   service-tid 12 s/bil = transmission delay L/R
 *   kjøretid 100 km / 100 km/t = 1 t = propagation delay d/s
 */

const NUM_CARS = 10;
const TOLL_SERVICE_S = 12; // 12 sekunder per bil
const SPEED_KMH = 100; // mellom bomstasjoner
const STATION_DISTANCE_KM = 100;

type Car = {
  id: number;
  /** distance fra start, i km */
  pos: number;
  /** "queue-pos" når i kø ved bom (hvilken plass i køen) */
  state: "queue1" | "service1" | "traveling" | "queue2" | "service2" | "done";
  /** tid til ferdig service ved nåværende bom */
  serviceUntil?: number;
};

export function CaravanAnalogy() {
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0); // simulert tid, sekunder
  const [speed, setSpeed] = useState(20); // hvor mange simulerte sekunder per sann sekund (visningsfart)
  const rafRef = useRef<number | undefined>(undefined);
  const lastRef = useRef<number | undefined>(undefined);

  const [cars, setCars] = useState<Car[]>(() =>
    Array.from({ length: NUM_CARS }, (_, i) => ({ id: i, pos: 0, state: "queue1" }))
  );

  function reset() {
    setRunning(false);
    setT(0);
    setCars(Array.from({ length: NUM_CARS }, (_, i) => ({ id: i, pos: 0, state: "queue1" })));
  }

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = undefined;
      return;
    }
    function step(ts: number) {
      if (lastRef.current === undefined) lastRef.current = ts;
      const realDt = (ts - lastRef.current) / 1000; // sekunder, real
      lastRef.current = ts;
      const dt = realDt * speed; // simulerte sekunder

      setT((prev) => prev + dt);
      setCars((prev) => advanceCars(prev, dt, t));

      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed]);

  // Posisjons-prosent for visning langs en horisontal "vei"
  // 0 -> bom 1, 50% -> bom 2, 100% -> ferdig
  function carX(car: Car): number {
    if (car.state === "queue1" || car.state === "service1") return 0;
    if (car.state === "traveling") return (car.pos / STATION_DISTANCE_KM) * 50;
    if (car.state === "queue2" || car.state === "service2") return 50;
    return 100;
  }

  const allDone = cars.every((c) => c.state === "done");

  // Beregn modellresultatene (sann tid for hele karavanen):
  // Boken: trans-delay = 10 biler * 12 s = 120 s, prop = 100 km / 100 km/t = 3600 s
  // Total end-to-end for hele karavanen til siste bil er ute av siste bom:
  //   tid til siste bil ferdig ved bom1: 120 s
  //   + propagasjon 1->2: 3600 s
  //   + service ved bom2 for 10 biler: 120 s
  //   = 3840 s (om de holder seg sammen — boken viser detaljer)
  const transDelayPerStation = NUM_CARS * TOLL_SERVICE_S;
  const propDelay = (STATION_DISTANCE_KM / SPEED_KMH) * 3600;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Kurose-Ross karavananalogi
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-[11px] text-muted-foreground">visnings­fart:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-[11px] bg-card border border-border rounded px-1.5 py-0.5"
          >
            <option value={5}>5&times;</option>
            <option value={20}>20&times;</option>
            <option value={100}>100&times;</option>
            <option value={500}>500&times;</option>
          </select>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand text-brand-foreground text-[11px] font-medium px-2.5 py-1"
          >
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/40 text-[11px] font-medium px-2.5 py-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative h-24 rounded-md border border-border bg-muted/20 overflow-hidden">
          {/* veibane */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted-foreground/20 -translate-y-1/2" />
          {/* bomstasjon 1 */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
          <div className="absolute left-1 top-1 text-[10px] font-semibold text-amber-600">Bom 1</div>
          {/* bomstasjon 2 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-500 -translate-x-1/2" />
          <div className="absolute left-[51%] top-1 text-[10px] font-semibold text-amber-600">Bom 2</div>
          {/* mål */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500" />
          <div className="absolute right-1 top-1 text-[10px] font-semibold text-emerald-600">Mål</div>

          {cars.map((c) => (
            <div
              key={c.id}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-sm transition-none ${
                c.state === "done"
                  ? "bg-emerald-500"
                  : c.state === "service1" || c.state === "service2"
                    ? "bg-orange-500"
                    : c.state === "traveling"
                      ? "bg-blue-500"
                      : "bg-slate-400"
              }`}
              style={{
                left: `calc(${carX(c)}% - ${c.id * 4}px)`,
              }}
              title={`bil ${c.id} — ${c.state}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <Stat label="Simulert tid" value={`${t.toFixed(0)} s`} />
          <Stat
            label="Trans-delay (1 bom)"
            value={`${transDelayPerStation} s`}
            sub="10 biler &times; 12 s"
          />
          <Stat
            label="Prop-delay (1 strekk)"
            value={`${propDelay} s`}
            sub="100 km / 100 km/t = 1 t"
          />
          <Stat
            label={allDone ? "Alle ferdige" : `Ferdige: ${cars.filter((c) => c.state === "done").length}/${NUM_CARS}`}
            value=""
          />
        </div>

        <div className="rounded-md border border-border bg-muted/20 p-3 text-[12px] leading-relaxed">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-brand mb-1">Legge merke til</div>
          <ul className="space-y-1 list-disc pl-4 text-muted-foreground">
            <li>
              Selv om hele karavanen <em>kjører</em> i 100 km/t — den siste bilen kan ikke forlate bom 1 før den har blitt servet (trans-delay).
            </li>
            <li>
              <span className="text-foreground">Prop-delay (3600 s)</span> er <strong>uavhengig</strong> av hvor lang karavanen er.
              <span className="text-foreground"> Trans-delay (120 s per bom)</span> er <strong>uavhengig</strong> av avstanden.
            </li>
            <li>
              Hadde service tatt 6 s/bil (dobbelt så rask bom), ville trans-delay halvert seg — prop-delay endrer seg ikke.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/** Avansere karavane-tilstand med dt simulerte sekunder. */
function advanceCars(cars: Car[], dt: number, tNow: number): Car[] {
  // Litt forenklet model: prosesser i rekkefølge.
  // Hver bom kan kun servere 1 bil om gangen (TOLL_SERVICE_S = 12 s).
  // Etter service går bilen i "traveling" og kjører mot bom 2 i 100 km/t.
  const out = cars.map((c) => ({ ...c }));

  // bom 1
  let inService1 = out.find((c) => c.state === "service1");
  if (inService1 && inService1.serviceUntil !== undefined && tNow + dt >= inService1.serviceUntil) {
    inService1.state = "traveling";
    inService1.pos = 0;
    inService1.serviceUntil = undefined;
  }
  if (!out.some((c) => c.state === "service1")) {
    const next = out.find((c) => c.state === "queue1");
    if (next) {
      next.state = "service1";
      next.serviceUntil = tNow + TOLL_SERVICE_S;
    }
  }

  // bom 2
  let inService2 = out.find((c) => c.state === "service2");
  if (inService2 && inService2.serviceUntil !== undefined && tNow + dt >= inService2.serviceUntil) {
    inService2.state = "done";
    inService2.serviceUntil = undefined;
  }
  if (!out.some((c) => c.state === "service2")) {
    const next = out.find((c) => c.state === "queue2");
    if (next) {
      next.state = "service2";
      next.serviceUntil = tNow + TOLL_SERVICE_S;
    }
  }

  // traveling — flytt frem
  // Hastighet 100 km/t = 100/3600 km/s
  const kmPerSec = SPEED_KMH / 3600;
  for (const c of out) {
    if (c.state === "traveling") {
      c.pos += kmPerSec * dt;
      if (c.pos >= STATION_DISTANCE_KM) {
        c.pos = STATION_DISTANCE_KM;
        c.state = "queue2";
      }
    }
  }
  return out;
}
