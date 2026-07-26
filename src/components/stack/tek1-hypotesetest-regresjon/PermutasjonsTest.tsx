import { useMemo, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";

/**
 * Permutasjonstest — nullhypotesen som noe man gjør, ikke noe man slår opp.
 *
 * Idéen er kjernen i Berkeley Data 8, og den beste veien inn i hypotesetesting
 * som finnes: hvis behandlingen ikke betyr noe, er gruppeetikettene «A» og «B»
 * bare merkelapper vi kunne ha klistret hvor som helst. Så stokk dem om, regn
 * ut forskjellen på nytt, og gjenta. Haugen du får er nullfordelingen — ikke
 * hentet fra en tabell, men bygget av dine egne data.
 *
 * p-verdien blir da helt konkret: hvor stor andel av de omstokkede verdenene
 * ga en forskjell minst så stor som den ekte? Ingen t-fordeling, ingen
 * frihetsgrader, ingen antakelser om normalitet.
 */

const GRUPPE_A = [12.1, 14.3, 11.8, 15.2, 13.6, 12.9, 16.1, 13.0];
const GRUPPE_B = [10.4, 11.2, 9.8, 12.6, 10.1, 11.9, 9.2, 10.8];

const snitt = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

export function PermutasjonsTest() {
  const alle = useMemo(() => [...GRUPPE_A, ...GRUPPE_B], []);
  const ekteDiff = useMemo(() => snitt(GRUPPE_A) - snitt(GRUPPE_B), []);

  const [differ, setDiffer] = useState<number[]>([]);
  const [sisteStokk, setSisteStokk] = useState<{ a: number[]; b: number[] } | null>(null);

  function stokk(antall: number) {
    const nye: number[] = [];
    let sisteA: number[] = [];
    let sisteB: number[] = [];
    for (let i = 0; i < antall; i++) {
      const kopi = [...alle];
      // Fisher–Yates
      for (let j = kopi.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [kopi[j], kopi[k]] = [kopi[k], kopi[j]];
      }
      sisteA = kopi.slice(0, GRUPPE_A.length);
      sisteB = kopi.slice(GRUPPE_A.length);
      nye.push(snitt(sisteA) - snitt(sisteB));
    }
    setSisteStokk({ a: sisteA, b: sisteB });
    setDiffer((d) => [...d, ...nye]);
  }

  const minstSaEkstrem = differ.filter((d) => Math.abs(d) >= Math.abs(ekteDiff)).length;
  const pVerdi = differ.length === 0 ? null : minstSaEkstrem / differ.length;

  // Histogram
  const W = 520;
  const H = 150;
  const grense = Math.max(3, Math.abs(ekteDiff) * 1.35, ...differ.map(Math.abs));
  const BINS = 31;
  const bins = useMemo(() => {
    const b = new Array(BINS).fill(0);
    for (const d of differ) {
      const i = Math.min(BINS - 1, Math.max(0, Math.floor(((d + grense) / (2 * grense)) * BINS)));
      b[i] += 1;
    }
    return b;
  }, [differ, grense]);
  const maks = Math.max(1, ...bins);
  const xPos = (v: number) => ((v + grense) / (2 * grense)) * W;

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Permutasjonstest — bygg nullfordelingen selv</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          To grupper med 8 målinger hver. Forskjellen i gjennomsnitt er{" "}
          <span className="font-mono font-bold text-brand">{ekteDiff.toFixed(2)}</span>. Er den
          reell, eller kunne tilfeldighetene alene gitt oss noe like stort? Hvis gruppene egentlig
          er like, er etikettene «A» og «B» bare merkelapper — så la oss stokke dem om og se hva som
          skjer.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => stokk(1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
        >
          <Shuffle className="h-4 w-4" /> Stokk én gang
        </button>
        <button
          type="button"
          onClick={() => stokk(200)}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          Stokk 200 ganger
        </button>
        <button
          type="button"
          onClick={() => {
            setDiffer([]);
            setSisteStokk(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Hva én omstokking faktisk gjør */}
      {sisteStokk && (
        <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs">
          <div className="mb-1 font-semibold text-muted-foreground">Siste omstokking</div>
          <div className="font-mono">A: {sisteStokk.a.map((v) => v.toFixed(1)).join(", ")}</div>
          <div className="font-mono">B: {sisteStokk.b.map((v) => v.toFixed(1)).join(", ")}</div>
          <div className="mt-1">
            forskjell ={" "}
            <span className="font-mono font-bold">
              {(snitt(sisteStokk.a) - snitt(sisteStokk.b)).toFixed(2)}
            </span>{" "}
            — samme tall, bare fordelt tilfeldig på de to gruppene
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 26}`} className="w-full min-w-[420px]">
          {bins.map((c, i) => {
            const h = (c / maks) * (H - 12);
            const bw = W / BINS;
            return (
              <rect
                key={i}
                x={(i * bw + 0.5).toFixed(2)}
                y={(H - h).toFixed(2)}
                width={(bw - 1).toFixed(2)}
                height={h.toFixed(2)}
                className="fill-muted-foreground"
                opacity={0.55}
              />
            );
          })}
          {/* Den ekte forskjellen */}
          <line
            x1={xPos(ekteDiff).toFixed(2)}
            y1={4}
            x2={xPos(ekteDiff).toFixed(2)}
            y2={H}
            className="stroke-brand"
            strokeWidth={2.5}
          />
          <text
            x={xPos(ekteDiff).toFixed(2)}
            y={H + 16}
            textAnchor="middle"
            className="fill-brand text-[10px] font-semibold"
          >
            ekte: {ekteDiff.toFixed(2)}
          </text>
          <line x1={0} y1={H} x2={W} y2={H} className="stroke-border" strokeWidth={1} />
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Omstokkinger
          </div>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums">{differ.length}</div>
          <div className="text-xs text-muted-foreground">
            {minstSaEkstrem} av dem ga en forskjell minst så stor som den ekte
          </div>
        </div>
        <div className="rounded-lg border-2 border-brand/40 bg-brand/5 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">
            p-verdi, uten tabelloppslag
          </div>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums">
            {pVerdi === null ? "—" : pVerdi.toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground">
            {pVerdi === null
              ? "Stokk noen ganger for å bygge fordelingen"
              : `${minstSaEkstrem}/${differ.length} tilfeldige verdener var minst så ekstreme`}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Dette er definisjonen på p-verdi
        </div>
        <p className="mt-1">
          Haugen du nettopp bygde <em>er</em> nullfordelingen: alle forskjellene tilfeldighetene
          kunne produsert hvis gruppene egentlig var like. p-verdien er bare andelen av dem som er
          minst så ekstreme som det du faktisk observerte. Ingen t-fordeling, ingen frihetsgrader,
          ingen antakelse om normalitet — bare telling.
        </p>
        <p className="mt-2 text-muted-foreground">
          En t-test gir omtrent samme svar, men tar veien om en teoretisk kurve. Permutasjonstesten
          viser hva den kurven prøver å tilnærme. Har du sett dette, er «hvis H₀ er sann, hvor
          sannsynlig er data minst så ekstreme» ikke lenger en formulering å pugge.
        </p>
      </div>
    </div>
  );
}
