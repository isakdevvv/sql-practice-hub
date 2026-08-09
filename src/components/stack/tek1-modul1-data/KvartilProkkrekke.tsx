import { useRef, useState } from "react";
import { MoveHorizontal, Plus, RotateCcw, Trash2 } from "lucide-react";
import { gjennomsnitt, kvartiler, median } from "@/lib/tek1501/oppgaveSjekk";

// ---------------------------------------------------------------------------
// Guidet simulering for atomene A2–A4: sentralmål, kvartiler og spredning.
//
// Studenten drar observasjonene langs en tallinje og ser fem-tallsoppsummeringen,
// gjennomsnittet og boksplottet oppdatere seg live. Det interessante skjer når
// man drar ÉN observasjon langt ut til høyre: gjennomsnittet følger etter, mens
// medianen og kvartilene knapt rikker seg. Det er hele robusthetspoenget vist i
// stedet for forklart — og det er svaret på anslå-så-sjekk-oppgaven om
// millioninntekten.
//
// Kvartilene regnes med «median av halvdelene»-metoden (se kvartiler() i
// oppgaveSjekk.ts), som er den norske innføringskurs bruker for håndregning.
// ---------------------------------------------------------------------------

const START = [12, 15, 18, 19, 21, 24, 26, 29, 33, 41];
const MIN = 0;
const MAX = 100;

// SVG-geometri
const V_BREDDE = 460;
const V_HOYDE = 190;
const M_VENSTRE = 24;
const M_HOYRE = 24;
const AKSE_Y = 150;
const BOKS_Y = 58;
const BOKS_H = 44;

export function KvartilProkkrekke() {
  const [data, setData] = useState<number[]>(START);
  const [drar, setDrar] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const sortert = [...data].sort((a, b) => a - b);
  const { q1, q2, q3 } = kvartiler(data);
  const snitt = gjennomsnitt(data);
  const iqr = q3 - q1;
  const min = sortert[0];
  const maks = sortert[sortert.length - 1];

  // Verdi → x-koordinat i SVG-rommet.
  const xAv = (v: number) =>
    M_VENSTRE + ((v - MIN) / (MAX - MIN)) * (V_BREDDE - M_VENSTRE - M_HOYRE);

  // Peker-posisjon → verdi, klemt til [MIN, MAX] og avrundet til heltall.
  function verdiFraPeker(clientX: number): number {
    const svg = svgRef.current;
    if (!svg) return MIN;
    const boks = svg.getBoundingClientRect();
    const relativ = ((clientX - boks.left) / boks.width) * V_BREDDE;
    const andel = (relativ - M_VENSTRE) / (V_BREDDE - M_VENSTRE - M_HOYRE);
    const v = MIN + andel * (MAX - MIN);
    return Math.round(Math.min(MAX, Math.max(MIN, v)));
  }

  function onPekerFlytt(e: React.PointerEvent) {
    if (drar == null) return;
    const v = verdiFraPeker(e.clientX);
    setData((d) => d.map((x, i) => (i === drar ? v : x)));
  }

  function leggTil() {
    setData((d) => [...d, Math.round(median(d))]);
  }
  function fjernSiste() {
    setData((d) => (d.length > 4 ? d.slice(0, -1) : d));
  }
  function nullstill() {
    setData(START);
  }
  function settOutlier() {
    // Erstatt den største observasjonen med en ekstrem verdi — poenget i A2.
    setData((d) => {
      const maksIdx = d.indexOf(Math.max(...d));
      return d.map((x, i) => (i === maksIdx ? 98 : x));
    });
  }

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <MoveHorizontal className="h-4 w-4 text-brand" />
        <h3 className="font-semibold text-foreground">
          Dra observasjonene — se hva som flytter seg og hva som står stille
        </h3>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Hver prikk er én måling. Dra i dem. Følg med på de to tallene nederst: gjennomsnittet henger
        etter hver eneste bevegelse, mens medianen bare bryr seg om hvilken observasjon som ligger i
        midten — ikke hvor langt ute de ytterste er.
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${V_BREDDE} ${V_HOYDE}`}
        className="w-full touch-none select-none"
        onPointerMove={onPekerFlytt}
        onPointerUp={() => setDrar(null)}
        onPointerLeave={() => setDrar(null)}
        role="img"
        aria-label={`Tallinje med ${data.length} observasjoner. Median ${q2}, gjennomsnitt ${snitt.toFixed(1)}, kvartilbredde ${iqr}.`}
      >
        {/* Boksplott: IQR-boksen fra Q1 til Q3, med median-strek */}
        <line
          x1={xAv(min)}
          x2={xAv(q1)}
          y1={BOKS_Y + BOKS_H / 2}
          y2={BOKS_Y + BOKS_H / 2}
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth={1.5}
        />
        <line
          x1={xAv(q3)}
          x2={xAv(maks)}
          y1={BOKS_Y + BOKS_H / 2}
          y2={BOKS_Y + BOKS_H / 2}
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth={1.5}
        />
        <rect
          x={xAv(q1)}
          y={BOKS_Y}
          width={Math.max(1, xAv(q3) - xAv(q1))}
          height={BOKS_H}
          rx={3}
          className="fill-brand/15 stroke-brand"
          strokeWidth={1.5}
        />
        <line
          x1={xAv(q2)}
          x2={xAv(q2)}
          y1={BOKS_Y}
          y2={BOKS_Y + BOKS_H}
          stroke="var(--brand)"
          strokeWidth={3}
        />
        <text
          x={xAv(q2)}
          y={BOKS_Y - 6}
          textAnchor="middle"
          className="fill-brand text-[11px] font-semibold"
        >
          median {q2}
        </text>
        <text
          x={xAv(q1)}
          y={BOKS_Y + BOKS_H + 14}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          Q1 {q1}
        </text>
        <text
          x={xAv(q3)}
          y={BOKS_Y + BOKS_H + 14}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          Q3 {q3}
        </text>

        {/* Gjennomsnittet som egen markør — den som lar seg dra med av uteliggere */}
        <polygon
          points={`${xAv(snitt)},${AKSE_Y - 26} ${xAv(snitt) - 6},${AKSE_Y - 14} ${xAv(snitt) + 6},${AKSE_Y - 14}`}
          className="fill-amber-500"
        />
        <text
          x={xAv(snitt)}
          y={AKSE_Y - 30}
          textAnchor="middle"
          className="fill-amber-600 text-[10px] font-semibold dark:fill-amber-400"
        >
          x̄ {snitt.toFixed(1)}
        </text>

        {/* Tallinjen */}
        <line
          x1={M_VENSTRE}
          x2={V_BREDDE - M_HOYRE}
          y1={AKSE_Y}
          y2={AKSE_Y}
          stroke="currentColor"
          className="text-border"
          strokeWidth={1.5}
        />
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line
              x1={xAv(t)}
              x2={xAv(t)}
              y1={AKSE_Y}
              y2={AKSE_Y + 5}
              stroke="currentColor"
              className="text-border"
            />
            <text
              x={xAv(t)}
              y={AKSE_Y + 18}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Observasjonene */}
        {data.map((v, i) => (
          <circle
            key={i}
            cx={xAv(v)}
            cy={AKSE_Y}
            r={drar === i ? 9 : 7}
            className={
              drar === i
                ? "cursor-grabbing fill-brand stroke-background"
                : "cursor-grab fill-brand/70 stroke-background hover:fill-brand"
            }
            strokeWidth={1.5}
            onPointerDown={(e) => {
              e.preventDefault();
              setDrar(i);
            }}
          />
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={settOutlier}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
        >
          Dra den største helt ut til 98
        </button>
        <button
          onClick={leggTil}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Legg til observasjon
        </button>
        <button
          onClick={fjernSiste}
          disabled={data.length <= 4}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" /> Fjern siste
        </button>
        <button
          onClick={nullstill}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <Tall label="Gjennomsnitt x̄" verdi={snitt.toFixed(2)} tone="amber" />
        <Tall label="Median Q2" verdi={String(q2)} tone="brand" />
        <Tall label="Kvartilbredde IQR = Q3 − Q1" verdi={`${iqr} (${q1}–${q3})`} tone="nøytral" />
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1.5 text-left font-semibold">Fem-tallsoppsummering</th>
              <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">minste</th>
              <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">Q1</th>
              <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">median</th>
              <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">Q3</th>
              <th className="px-2 py-1.5 text-left font-normal text-muted-foreground">største</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border font-mono">
              <td className="px-2 py-1.5 font-sans text-muted-foreground">n = {data.length}</td>
              <td className="px-2 py-1.5">{min}</td>
              <td className="px-2 py-1.5">{q1}</td>
              <td className="px-2 py-1.5">{q2}</td>
              <td className="px-2 py-1.5">{q3}</td>
              <td className="px-2 py-1.5">{maks}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Legg merke til:</strong> når du drar den høyeste
        observasjonen mot 100, spretter x̄ etter, mens boksen (Q1 til Q3) står nesten helt stille.
        Boksen bygger bare på <em>rekkefølgen</em> til observasjonene, ikke på hvor store de er.
        Derfor er median og IQR de trygge målene når dataene har lange haler — inntekt, ventetid,
        huspriser.
      </p>
    </div>
  );
}

function Tall({
  label,
  verdi,
  tone,
}: {
  label: string;
  verdi: string;
  tone: "amber" | "brand" | "nøytral";
}) {
  const cls =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/5"
      : tone === "brand"
        ? "border-brand/30 bg-brand/5"
        : "border-border bg-muted/30";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-base font-semibold text-foreground">{verdi}</div>
    </div>
  );
}
