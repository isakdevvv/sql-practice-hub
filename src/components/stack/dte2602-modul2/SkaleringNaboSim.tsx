import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Type 2 — guidet simulering til atom A07 (feature scaling / skalering).
 *
 * Regelen «husk å skalere før kNN» er lett å pugge og umulig å tro på før du
 * har sett hva den gjør. Derfor er denne simuleringen bygget rundt ett eneste
 * spørsmål: hvem er de nærmeste naboene?
 *
 * Datasettet har to features med vilt forskjellige tallområder — alder i år
 * (tosifret) og årsinntekt i kroner (sekssifret). Avstanden mellom to personer
 * blir da nesten utelukkende bestemt av inntekten, fordi differansene der er
 * fire størrelsesordener større. Alderen er teknisk sett med i regnestykket,
 * men har ingen praktisk innflytelse.
 *
 * Alt som vises er regnet ut i komponenten. Standardiseringen er den vanlige:
 * trekk fra gjennomsnittet og del på standardavviket, kolonne for kolonne.
 */

type Person = {
  id: string;
  navn: string;
  alder: number;
  inntekt: number;
  /** Fasit i treningsdataene: sa kunden opp abonnementet? */
  saOpp: boolean;
};

const TRENING: Person[] = [
  { id: "p1", navn: "A", alder: 28, inntekt: 520_000, saOpp: true },
  { id: "p2", navn: "B", alder: 32, inntekt: 470_000, saOpp: true },
  { id: "p3", navn: "C", alder: 29, inntekt: 545_000, saOpp: true },
  { id: "p4", navn: "D", alder: 62, inntekt: 505_000, saOpp: false },
  { id: "p5", navn: "E", alder: 58, inntekt: 498_000, saOpp: false },
  { id: "p6", navn: "F", alder: 65, inntekt: 512_000, saOpp: false },
];

/** Personen vi skal gjette på. Fasit finnes ikke — det er hele poenget. */
const NY = { alder: 30, inntekt: 500_000 };

const K = 3;

function snitt(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function standardavvik(xs: number[]): number {
  const m = snitt(xs);
  return Math.sqrt(snitt(xs.map((x) => (x - m) ** 2)));
}

export function SkaleringNaboSim() {
  const [skalert, setSkalert] = useState(false);

  const stat = useMemo(() => {
    const aldre = TRENING.map((p) => p.alder);
    const inntekter = TRENING.map((p) => p.inntekt);
    return {
      alderSnitt: snitt(aldre),
      alderSd: standardavvik(aldre),
      inntektSnitt: snitt(inntekter),
      inntektSd: standardavvik(inntekter),
    };
  }, []);

  /** Koordinatene avstanden faktisk regnes i. */
  function koord(alder: number, inntekt: number): [number, number] {
    if (!skalert) return [alder, inntekt];
    return [
      (alder - stat.alderSnitt) / stat.alderSd,
      (inntekt - stat.inntektSnitt) / stat.inntektSd,
    ];
  }

  const naboer = useMemo(() => {
    const [nx, ny] = koord(NY.alder, NY.inntekt);
    return TRENING.map((p) => {
      const [px, py] = koord(p.alder, p.inntekt);
      const dAlder = px - nx;
      const dInntekt = py - ny;
      return {
        person: p,
        avstand: Math.hypot(dAlder, dInntekt),
        bidragAlder: dAlder ** 2,
        bidragInntekt: dInntekt ** 2,
      };
    }).sort((a, b) => a.avstand - b.avstand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skalert, stat]);

  const kNaermeste = naboer.slice(0, K);
  const stemmerOpp = kNaermeste.filter((n) => n.person.saOpp).length;
  const dom = stemmerOpp > K / 2;

  /** Hvor stor andel av kvadrert avstand som kommer fra inntektskolonnen. */
  const inntektsandel = useMemo(() => {
    const sumInntekt = naboer.reduce((a, n) => a + n.bidragInntekt, 0);
    const sumAlder = naboer.reduce((a, n) => a + n.bidragAlder, 0);
    return sumInntekt / (sumInntekt + sumAlder);
  }, [naboer]);

  // --- Plott -------------------------------------------------------------
  const B = { v: 52, h: 14, t: 14, b: 34 };
  const W = 460;
  const H = 300;
  const pw = W - B.v - B.h;
  const ph = H - B.t - B.b;

  const alleX = [...TRENING.map((p) => p.alder), NY.alder];
  const alleY = [...TRENING.map((p) => p.inntekt), NY.inntekt];
  const xVerdier = skalert ? alleX.map((a) => koord(a, 0)[0]) : alleX;
  const yVerdier = skalert ? alleY.map((i) => koord(0, i)[1]) : alleY;

  const xMin = Math.min(...xVerdier);
  const xMax = Math.max(...xVerdier);
  const yMin = Math.min(...yVerdier);
  const yMax = Math.max(...yVerdier);
  const padX = (xMax - xMin) * 0.15 || 1;
  const padY = (yMax - yMin) * 0.15 || 1;

  function px(alder: number): number {
    const v = koord(alder, 0)[0];
    return B.v + ((v - (xMin - padX)) / (xMax - xMin + 2 * padX)) * pw;
  }
  function py(inntekt: number): number {
    const v = koord(0, inntekt)[1];
    return B.t + ph - ((v - (yMin - padY)) / (yMax - yMin + 2 * padY)) * ph;
  }

  const nyX = px(NY.alder);
  const nyY = py(NY.inntekt);
  const iKNaermeste = new Set(kNaermeste.map((n) => n.person.id));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
          Guidet simulering · ingenting telles
        </div>
        <h3 className="mt-0.5 font-semibold text-foreground">Hvem er egentlig naboene?</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Vi skal gjette om en ny kunde på {NY.alder} år med {NY.inntekt.toLocaleString("nb-NO")}{" "}
          kroner i årsinntekt kommer til å si opp. Metoden er den enkleste som finnes: finn de {K}{" "}
          kundene som ligner mest, og la dem stemme. Alt henger dermed på hva «ligner» betyr.
        </p>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-border bg-muted/30 p-1">
        <button
          onClick={() => setSkalert(false)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            !skalert
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Rå tall (år og kroner)
        </button>
        <button
          onClick={() => setSkalert(true)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            skalert
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Standardisert
        </button>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[380px]" role="img">
          <title>Spredningsplott av alder mot inntekt, med de {K} nærmeste naboene markert</title>
          {/* Akser */}
          <line
            x1={B.v}
            y1={B.t + ph}
            x2={B.v + pw}
            y2={B.t + ph}
            className="stroke-border"
            strokeWidth={1}
          />
          <line
            x1={B.v}
            y1={B.t}
            x2={B.v}
            y2={B.t + ph}
            className="stroke-border"
            strokeWidth={1}
          />
          <text
            x={B.v + pw / 2}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {skalert ? "alder (standardisert)" : "alder (år)"}
          </text>
          <text
            x={12}
            y={B.t + ph / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${B.t + ph / 2})`}
            className="fill-muted-foreground text-[9px]"
          >
            {skalert ? "inntekt (standardisert)" : "inntekt (kr)"}
          </text>

          {/* Akseverdier i hjørnene, slik at størrelsesordenen er synlig */}
          <text
            x={B.v}
            y={B.t + ph + 13}
            textAnchor="start"
            className="fill-muted-foreground text-[8px]"
          >
            {skalert ? (xMin - padX).toFixed(1) : Math.round(xMin - padX)}
          </text>
          <text
            x={B.v + pw}
            y={B.t + ph + 13}
            textAnchor="end"
            className="fill-muted-foreground text-[8px]"
          >
            {skalert ? (xMax + padX).toFixed(1) : Math.round(xMax + padX)}
          </text>
          <text
            x={B.v - 4}
            y={B.t + ph}
            textAnchor="end"
            className="fill-muted-foreground text-[8px]"
          >
            {skalert
              ? (yMin - padY).toFixed(1)
              : Math.round((yMin - padY) / 1000).toLocaleString("nb-NO") + "k"}
          </text>
          <text
            x={B.v - 4}
            y={B.t + 8}
            textAnchor="end"
            className="fill-muted-foreground text-[8px]"
          >
            {skalert
              ? (yMax + padY).toFixed(1)
              : Math.round((yMax + padY) / 1000).toLocaleString("nb-NO") + "k"}
          </text>

          {/* Linjer til de k nærmeste */}
          {kNaermeste.map((n) => (
            <line
              key={`l-${n.person.id}`}
              x1={nyX}
              y1={nyY}
              x2={px(n.person.alder)}
              y2={py(n.person.inntekt)}
              className="stroke-brand"
              strokeWidth={1.2}
              strokeDasharray="3 2"
              opacity={0.75}
            />
          ))}

          {/* Treningspunkter */}
          {TRENING.map((p) => {
            const valgt = iKNaermeste.has(p.id);
            return (
              <g key={p.id}>
                <circle
                  cx={px(p.alder)}
                  cy={py(p.inntekt)}
                  r={valgt ? 8 : 6}
                  className={p.saOpp ? "fill-red-500" : "fill-sky-500"}
                  opacity={valgt ? 1 : 0.4}
                  stroke={valgt ? "currentColor" : "none"}
                  strokeWidth={valgt ? 1.5 : 0}
                />
                <text
                  x={px(p.alder)}
                  y={py(p.inntekt) - 11}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[8px]"
                >
                  {p.navn}
                </text>
              </g>
            );
          })}

          {/* Den nye kunden */}
          <g>
            <circle
              cx={nyX}
              cy={nyY}
              r={7}
              className="fill-background stroke-foreground"
              strokeWidth={2}
            />
            <circle cx={nyX} cy={nyY} r={2} className="fill-foreground" />
          </g>
        </svg>
      </div>

      <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> sa opp
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> ble værende
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground bg-background" /> ny
          kunde
        </span>
      </div>

      {/* Avstandstabell */}
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 border-b border-border bg-muted/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="w-4">#</span>
          <span>Kunde</span>
          <span className="w-24 text-right">Avstand</span>
          <span className="w-16 text-right">Fasit</span>
        </div>
        {naboer.map((n, idx) => (
          <div
            key={n.person.id}
            className={cn(
              "grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 border-b border-border/60 px-3 py-1.5 text-xs last:border-b-0",
              idx < K ? "bg-brand/5" : "opacity-55",
            )}
          >
            <span className="w-4 tabular-nums text-muted-foreground">{idx + 1}</span>
            <span className="text-foreground">
              {n.person.navn} — {n.person.alder} år, {n.person.inntekt.toLocaleString("nb-NO")} kr
            </span>
            <span className="w-24 text-right font-mono tabular-nums text-muted-foreground">
              {skalert ? n.avstand.toFixed(2) : Math.round(n.avstand).toLocaleString("nb-NO")}
            </span>
            <span
              className={cn(
                "w-16 text-right font-medium",
                n.person.saOpp
                  ? "text-red-600 dark:text-red-400"
                  : "text-sky-600 dark:text-sky-400",
              )}
            >
              {n.person.saOpp ? "sa opp" : "ble"}
            </span>
          </div>
        ))}
      </div>

      {/* Domen */}
      <div
        className={cn(
          "mt-3 rounded-lg border p-4",
          skalert ? "border-success/40 bg-success/5" : "border-amber-500/40 bg-amber-500/5",
        )}
      >
        <div className="text-sm font-medium text-foreground">
          Modellen gjetter:{" "}
          <span
            className={dom ? "text-red-600 dark:text-red-400" : "text-sky-600 dark:text-sky-400"}
          >
            {dom ? "sier opp" : "blir værende"}
          </span>{" "}
          <span className="font-normal text-muted-foreground">
            ({stemmerOpp} av {K} naboer sa opp)
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {skalert ? (
            <>
              Etter standardisering måles begge kolonnene i «antall standardavvik fra
              gjennomsnittet». Da teller ett års forskjell i alder like mye som én tilsvarende
              forskjell i inntekt, og naboene blir de som faktisk ligner: kunder på samme alder{" "}
              <em>og</em> med liknende inntekt. Inntektskolonnen står nå for{" "}
              {Math.round(inntektsandel * 100)} % av avstanden.
            </>
          ) : (
            <>
              Med rå tall er inntektsdifferansene sekssifrede og aldersdifferansene tosifrede.
              Inntektskolonnen står for{" "}
              <span className="font-medium text-foreground">
                {Math.round(inntektsandel * 100)} %
              </span>{" "}
              av avstanden — alderen er teknisk sett med i regnestykket, men uten praktisk
              innflytelse. Modellen bruker altså i praksis bare én av de to kolonnene du ga den, og
              du fikk aldri beskjed om det.
            </>
          )}
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Bytt fram og tilbake noen ganger.</span> Det
        som er verdt å legge merke til er ikke at det ene svaret er «riktig» — det er at{" "}
        <em>samme algoritme på samme data</em> gir to forskjellige svar, avhengig av en
        forbehandling ingen ser i resultatet. Derfor gjelder regelen: metoder som regner avstand (k
        nærmeste naboer, k-means, støttevektormaskin) trenger skalering. Beslutningstrær og random
        forest gjør det ikke, fordi de sammenligner én kolonne av gangen mot en terskel og aldri
        legger kolonner sammen.
      </div>
    </div>
  );
}
