import { useMemo, useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// Venn-lab for TEK-1501 modul 2 (framdriftsplanen, uke 34: «mengdelære,
// Venn-diagram»).
//
// Poenget med å bygge denne i det hele tatt: modulen forklarte
// addisjonssetningen i prosa — «minusleddet er ikke pynt, uten det telles
// utfallene i både A og B to ganger». Det er en påstand studenten må tro på.
// Her kan hen se den: skru på dobbelttellingen og se summen krype over 1.
//
// Det avgjørende valget er at **arealene er geometrisk riktige.** De fleste
// Venn-diagrammer i lærebøker er skjematiske — to like sirkler med et fast
// overlapp, uansett hva tallene sier. Da illustrerer figuren, den regner ikke,
// og studenten lærer å lese den som et bilde i stedet for som en modell. Her
// løses sirkelavstanden numerisk slik at overlappsarealet faktisk er P(A ∩ B).
// Drar du snittet mot null, glir sirklene fra hverandre av seg selv.
// ---------------------------------------------------------------------------

/** Området brukeren kan velge å markere. */
type Region = "A" | "B" | "snitt" | "union" | "aMinusB" | "komplement";

const REGIONER: { id: Region; label: string; notasjon: string; forklaring: string }[] = [
  { id: "A", label: "A", notasjon: "A", forklaring: "Alt som ligger i A, uansett om det også ligger i B." },
  { id: "B", label: "B", notasjon: "B", forklaring: "Alt som ligger i B, uansett om det også ligger i A." },
  {
    id: "snitt",
    label: "Snitt",
    notasjon: "A ∩ B",
    forklaring: "Bare det som ligger i begge. Det er dette leddet som blir talt to ganger hvis du bare legger sammen.",
  },
  {
    id: "union",
    label: "Union",
    notasjon: "A ∪ B",
    forklaring: "Alt som ligger i minst én av dem. «Eller» i matematikk er alltid inkluderende — begge teller også.",
  },
  {
    id: "aMinusB",
    label: "Differens",
    notasjon: "A \\ B",
    forklaring: "I A, men ikke i B. Legg merke til at A \\ B og B \\ A er forskjellige mengder.",
  },
  {
    id: "komplement",
    label: "Komplement",
    notasjon: "(A ∪ B)ᶜ",
    forklaring: "Alt utenfor begge. P(Aᶜ) = 1 − P(A) er ofte den korteste veien til svaret — «minst én» regnes nesten alltid som 1 minus «ingen».",
  },
];

/* --------------------------------------------------------------- geometri */

/** Arealet av overlappet mellom to sirkler med radius r1, r2 og senteravstand d. */
function linseAreal(r1: number, r2: number, d: number): number {
  if (d >= r1 + r2) return 0; // helt adskilt
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2; // den ene inni den andre
  const a =
    r1 ** 2 * Math.acos((d ** 2 + r1 ** 2 - r2 ** 2) / (2 * d * r1)) +
    r2 ** 2 * Math.acos((d ** 2 + r2 ** 2 - r1 ** 2) / (2 * d * r2)) -
    0.5 *
      Math.sqrt(
        Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)),
      );
  return a;
}

/**
 * Finner senteravstanden som gir nøyaktig ønsket overlappsareal. Linsearealet
 * er strengt avtakende i d, så halveringsmetoden konvergerer alltid — 40
 * runder gir mer presisjon enn en skjerm kan vise.
 */
function avstandFor(r1: number, r2: number, malAreal: number): number {
  if (malAreal <= 0) return r1 + r2;
  const maks = Math.PI * Math.min(r1, r2) ** 2;
  if (malAreal >= maks) return Math.abs(r1 - r2);
  let lav = Math.abs(r1 - r2);
  let hoy = r1 + r2;
  for (let i = 0; i < 40; i++) {
    const midt = (lav + hoy) / 2;
    if (linseAreal(r1, r2, midt) > malAreal) lav = midt;
    else hoy = midt;
  }
  return (lav + hoy) / 2;
}

/* ------------------------------------------------------------- komponenten */

const START = { pa: 0.45, pb: 0.35, snitt: 0.15 };

export function VennMengdelab() {
  const [pa, setPa] = useState(START.pa);
  const [pb, setPb] = useState(START.pb);
  const [snitt, setSnitt] = useState(START.snitt);
  const [region, setRegion] = useState<Region>("union");
  const [glemMinus, setGlemMinus] = useState(false);

  /**
   * Snittet kan aldri være større enn den minste av de to — og union kan
   * aldri overstige 1. Begge grensene håndheves, fordi en umulig tilstand er
   * det eneste stedet figuren kan lyve. Grensene er samtidig pensum:
   * max(0, P(A)+P(B)−1) ≤ P(A ∩ B) ≤ min(P(A), P(B)).
   */
  const snittMaks = Math.min(pa, pb);
  const snittMin = Math.max(0, pa + pb - 1);
  const s = Math.min(snittMaks, Math.max(snittMin, snitt));

  const union = pa + pb - s;
  const feilUnion = pa + pb; // det du får hvis du glemmer minusleddet
  const utenfor = 1 - union;
  const disjunkte = s === 0;

  // Sirkelradier fra sannsynlighetene. SKALA er valgt slik at den største
  // lovlige sirkelen (P = 1) får plass i tegneflata.
  const SKALA = 14000;
  const { cx1, cx2, r1, r2 } = useMemo(() => {
    const rA = Math.sqrt((Math.max(pa, 0.001) * SKALA) / Math.PI);
    const rB = Math.sqrt((Math.max(pb, 0.001) * SKALA) / Math.PI);
    // Sirkelarealet er π·r² = P·SKALA, så måltallet for linsa er s·SKALA.
    const d = avstandFor(rA, rB, s * SKALA);
    return { cx1: 200 - d / 2, cx2: 200 + d / 2, r1: rA, r2: rB };
  }, [pa, pb, s]);

  const valgt = REGIONER.find((r) => r.id === region)!;

  /** Sannsynligheten for den markerte regionen. */
  const regionP: Record<Region, number> = {
    A: pa,
    B: pb,
    snitt: s,
    union,
    aMinusB: pa - s,
    komplement: utenfor,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-muted/40 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Venn-lab — arealene stemmer med tallene
        </span>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[1fr_16rem]">
        {/* ------------------------------------------------------- figuren */}
        <div>
          <svg
            viewBox="0 0 400 250"
            className="h-auto w-full rounded-lg bg-background"
            role="img"
            aria-label={`Venn-diagram. P(A) = ${pa.toFixed(2)}, P(B) = ${pb.toFixed(2)}, P(A snitt B) = ${s.toFixed(2)}. Markert region: ${valgt.notasjon}, sannsynlighet ${regionP[region].toFixed(2)}.`}
          >
            <defs>
              {/* Snittet klippes ut som overlappet mellom de to sirklene. */}
              <clipPath id="klippB">
                <circle cx={cx2} cy={125} r={r2} />
              </clipPath>
            </defs>

            {/* Ω — hele utfallsrommet. Rammen er en del av modellen: alt som
                ikke er i sirklene, er komplementet. */}
            <rect
              x={2}
              y={2}
              width={396}
              height={246}
              rx={8}
              className={
                region === "komplement" ? "fill-amber-500/25 stroke-amber-500" : "fill-muted/40 stroke-border"
              }
              strokeWidth={2}
            />
            <text x={12} y={22} className="fill-muted-foreground" fontSize={13}>
              Ω
            </text>

            {/* A og B som grunnflater */}
            <circle
              cx={cx1}
              cy={125}
              r={r1}
              className={
                region === "A" || region === "union" || region === "aMinusB"
                  ? "fill-brand/35 stroke-brand"
                  : "fill-brand/10 stroke-brand/50"
              }
              strokeWidth={2}
            />
            <circle
              cx={cx2}
              cy={125}
              r={r2}
              className={
                region === "B" || region === "union"
                  ? "fill-violet-500/35 stroke-violet-500"
                  : "fill-violet-500/10 stroke-violet-500/50"
              }
              strokeWidth={2}
            />

            {/* Differens: A markert, så snittet «stanses ut» igjen. */}
            {region === "aMinusB" && (
              <g clipPath="url(#klippB)">
                <circle cx={cx1} cy={125} r={r1} className="fill-background" />
                <circle cx={cx1} cy={125} r={r1} className="fill-muted/40" />
              </g>
            )}

            {/* Snittet — tegnet sist så det ligger øverst. */}
            {(region === "snitt" || region === "union") && (
              <g clipPath="url(#klippB)">
                <circle
                  cx={cx1}
                  cy={125}
                  r={r1}
                  className={region === "snitt" ? "fill-amber-500/70" : "fill-amber-500/40"}
                />
              </g>
            )}

            <text x={cx1 - r1 * 0.55} y={125 - r1 * 0.55} className="fill-brand font-semibold" fontSize={16}>
              A
            </text>
            <text
              x={cx2 + r2 * 0.4}
              y={125 - r2 * 0.55}
              className="fill-violet-600 font-semibold dark:fill-violet-400"
              fontSize={16}
            >
              B
            </text>

            {disjunkte && (
              <text x={200} y={238} textAnchor="middle" className="fill-muted-foreground" fontSize={11}>
                sirklene rører ikke hverandre — A og B er disjunkte
              </text>
            )}
          </svg>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {REGIONER.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegion(r.id)}
                className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                  region === r.id
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-muted-foreground hover:border-brand/40"
                }`}
              >
                {r.notasjon}
              </button>
            ))}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <span className="font-mono text-foreground">
              P({valgt.notasjon}) = {regionP[region].toFixed(3)}
            </span>{" "}
            — {valgt.forklaring}
          </p>
        </div>

        {/* ------------------------------------------------------ kontroller */}
        <div className="space-y-3">
          <Skyver label="P(A)" verdi={pa} min={0.05} maks={0.95} onEndre={setPa} farge="accent-brand" />
          <Skyver label="P(B)" verdi={pb} min={0.05} maks={0.95} onEndre={setPb} farge="accent-violet-500" />
          <Skyver
            label="P(A ∩ B)"
            verdi={s}
            min={snittMin}
            maks={snittMaks}
            onEndre={setSnitt}
            farge="accent-amber-500"
          />

          {/* Grensene er ikke en teknisk detalj — de er pensum. */}
          <p className="rounded-md border border-border bg-background p-2 text-[11px] leading-relaxed text-muted-foreground">
            Snittet er låst til intervallet{" "}
            <span className="font-mono">
              [{snittMin.toFixed(2)}, {snittMaks.toFixed(2)}]
            </span>
            . Det kan ikke bli større enn den minste mengden, og når P(A) + P(B) overstiger 1 må de
            overlappe — det er ikke plass i Ω til noe annet.
          </p>

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Addisjonssetningen
            </div>
            <div className="font-mono text-sm leading-relaxed">
              <div className={glemMinus ? "text-muted-foreground line-through" : "text-foreground"}>
                {pa.toFixed(2)} + {pb.toFixed(2)} − {s.toFixed(2)} = {union.toFixed(2)}
              </div>
              {glemMinus && (
                <div className={feilUnion > 1 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}>
                  {pa.toFixed(2)} + {pb.toFixed(2)} = {feilUnion.toFixed(2)}
                </div>
              )}
            </div>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={glemMinus}
                onChange={(e) => setGlemMinus(e.target.checked)}
                className="accent-rose-500"
              />
              Glem minusleddet
            </label>
            {glemMinus && feilUnion > 1 && (
              <p className="mt-2 flex items-start gap-1.5 rounded border border-rose-500/30 bg-rose-500/5 p-2 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {feilUnion.toFixed(2)} er større enn 1, altså umulig. Det er den gratis feilsjekken:
                får du et tall utenfor [0, 1], har du gjort noe galt — alltid.
              </p>
            )}
            {glemMinus && feilUnion <= 1 && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Her holder feilsvaret seg under 1, så tallet <em>ser</em> gyldig ut. Det er derfor
                feilen er farlig: den avslører seg ikke alltid. Dra P(A) og P(B) oppover til summen
                sprekker.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-background p-3 text-xs">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              De fire delene, som alltid summerer til 1
            </div>
            <Del navn="bare A" verdi={pa - s} />
            <Del navn="A ∩ B" verdi={s} />
            <Del navn="bare B" verdi={pb - s} />
            <Del navn="utenfor begge" verdi={utenfor} />
          </div>

          <button
            type="button"
            onClick={() => {
              setPa(START.pa);
              setPb(START.pb);
              setSnitt(START.snitt);
              setGlemMinus(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Nullstill
          </button>
        </div>
      </div>
    </div>
  );
}

function Skyver({
  label,
  verdi,
  min,
  maks,
  onEndre,
  farge,
}: {
  label: string;
  verdi: number;
  min: number;
  maks: number;
  onEndre: (v: number) => void;
  farge: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-mono text-foreground">{label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">{verdi.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={maks}
        step={0.01}
        value={verdi}
        onChange={(e) => onEndre(Number(e.target.value))}
        className={`w-full ${farge}`}
        aria-label={label}
      />
    </label>
  );
}

function Del({ navn, verdi }: { navn: string; verdi: number }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-24 shrink-0 text-muted-foreground">{navn}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand/60" style={{ width: `${verdi * 100}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-mono tabular-nums text-foreground">
        {verdi.toFixed(2)}
      </span>
    </div>
  );
}
