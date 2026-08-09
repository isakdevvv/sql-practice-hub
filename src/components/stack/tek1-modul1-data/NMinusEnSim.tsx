import { useMemo, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import { gjennomsnitt, lagRng, normalTrekk } from "@/lib/tek1501/oppgaveSjekk";

// ---------------------------------------------------------------------------
// Guidet simulering for atom A5: hvorfor deler vi på n − 1?
//
// Argumentet «vi brukte opp én frihetsgrad på å estimere gjennomsnittet» er
// riktig, men det overbeviser ingen første gang de hører det. Det som overbeviser
// er å se skjevheten: trekk 1000 utvalg fra en populasjon der vi VET at
// variansen er 225, regn begge versjonene på hvert utvalg, og se at
// n-versjonen i snitt lander for lavt — hver eneste gang, systematisk, og at
// avviket er nøyaktig faktoren (n − 1)/n.
//
// Null prestasjonskrav (oppgavetype 2): studenten drar i n og ser hva som skjer.
// ---------------------------------------------------------------------------

const SANN_MY = 100; // μ — populasjonens sanne gjennomsnitt
const SANN_SIGMA = 15; // σ — populasjonens sanne standardavvik
const SANN_VARIANS = SANN_SIGMA ** 2; // σ² = 225
const ANTALL_UTVALG = 1000;

function simuler(n: number, seed: number) {
  const rng = lagRng(seed);
  const medN: number[] = [];
  const medNMinusEn: number[] = [];
  for (let i = 0; i < ANTALL_UTVALG; i++) {
    const utvalg: number[] = [];
    for (let j = 0; j < n; j++) utvalg.push(normalTrekk(rng, SANN_MY, SANN_SIGMA));
    const m = gjennomsnitt(utvalg);
    const kvadratsum = utvalg.reduce((s, x) => s + (x - m) ** 2, 0);
    medN.push(kvadratsum / n);
    medNMinusEn.push(kvadratsum / (n - 1));
  }
  return {
    snittMedN: gjennomsnitt(medN),
    snittMedNMinusEn: gjennomsnitt(medNMinusEn),
  };
}

export function NMinusEnSim() {
  const [n, setN] = useState(4);
  const [seed, setSeed] = useState(20261214);

  const res = useMemo(() => simuler(n, seed), [n, seed]);

  // Felles skala for begge søylene, med litt luft over den største.
  const maks = Math.max(res.snittMedN, res.snittMedNMinusEn, SANN_VARIANS) * 1.25;
  const H = 190;
  const bunn = 210;
  const hoyde = (v: number) => (v / maks) * H;

  const sannY = bunn - hoyde(SANN_VARIANS);
  const nY = bunn - hoyde(res.snittMedN);
  const nm1Y = bunn - hoyde(res.snittMedNMinusEn);

  const skjevhetProsent = ((res.snittMedN - SANN_VARIANS) / SANN_VARIANS) * 100;
  const teoretiskFaktor = (n - 1) / n;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Dices className="h-4 w-4 text-brand" />
        <h3 className="font-semibold text-foreground">Hvorfor n − 1? Se skjevheten selv</h3>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Vi later som vi kjenner populasjonen: den er normalfordelt med sant gjennomsnitt{" "}
        <span className="font-mono">μ = {SANN_MY}</span> og sant standardavvik{" "}
        <span className="font-mono">σ = {SANN_SIGMA}</span>, altså sann varians{" "}
        <span className="font-mono">σ² = {SANN_VARIANS}</span>. Så trekker vi{" "}
        <strong>{ANTALL_UTVALG}</strong> utvalg à <strong>n = {n}</strong> observasjoner og regner
        variansen på begge måter i hvert eneste utvalg. Søylene viser gjennomsnittet av de{" "}
        {ANTALL_UTVALG} svarene.
      </p>

      <label className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="w-40 shrink-0 text-muted-foreground">
          Utvalgsstørrelse n = <strong className="text-foreground">{n}</strong>
        </span>
        <input
          type="range"
          min={2}
          max={40}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="min-w-[180px] flex-1 accent-[var(--brand)]"
        />
      </label>

      <svg
        viewBox="0 0 420 250"
        className="w-full"
        role="img"
        aria-label={`Søylediagram: deling på n gir ${res.snittMedN.toFixed(1)}, deling på n minus 1 gir ${res.snittMedNMinusEn.toFixed(1)}, sann varians er ${SANN_VARIANS}`}
      >
        {/* Referanselinje: sann varians */}
        <line
          x1={20}
          x2={400}
          y1={sannY}
          y2={sannY}
          stroke="var(--brand)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text
          x={400}
          y={sannY - 6}
          textAnchor="end"
          className="fill-brand text-[11px] font-semibold"
        >
          sann σ² = {SANN_VARIANS}
        </text>

        {/* Søyle: del på n */}
        <rect x={70} y={nY} width={100} height={bunn - nY} rx={3} className="fill-amber-500/70" />
        <text
          x={120}
          y={nY - 8}
          textAnchor="middle"
          className="fill-foreground text-[13px] font-semibold"
        >
          {res.snittMedN.toFixed(1)}
        </text>
        <text
          x={120}
          y={bunn + 18}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          del på n
        </text>
        <text
          x={120}
          y={bunn + 32}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          (populasjonsvarians)
        </text>

        {/* Søyle: del på n − 1 */}
        <rect
          x={230}
          y={nm1Y}
          width={100}
          height={bunn - nm1Y}
          rx={3}
          className="fill-success/70"
        />
        <text
          x={280}
          y={nm1Y - 8}
          textAnchor="middle"
          className="fill-foreground text-[13px] font-semibold"
        >
          {res.snittMedNMinusEn.toFixed(1)}
        </text>
        <text
          x={280}
          y={bunn + 18}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          del på n − 1
        </text>
        <text
          x={280}
          y={bunn + 32}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          (stikkprøvevarians s²)
        </text>

        {/* Grunnlinje */}
        <line
          x1={20}
          x2={400}
          y1={bunn}
          y2={bunn}
          stroke="currentColor"
          className="text-border"
          strokeWidth={1}
        />
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Del på n
          </div>
          <p className="mt-1 leading-relaxed text-foreground">
            Bommer i snitt <strong>{skjevhetProsent.toFixed(1)} %</strong> — og alltid samme vei:
            for lavt. Det er ikke uflaks, det er innebygd. Teorien sier at den treffer{" "}
            <span className="font-mono">(n − 1)/n = {teoretiskFaktor.toFixed(3)}</span> ganger sann
            σ², altså {(teoretiskFaktor * SANN_VARIANS).toFixed(1)}.
          </p>
        </div>
        <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-success">
            Del på n − 1
          </div>
          <p className="mt-1 leading-relaxed text-foreground">
            Treffer sann σ² i snitt. Enkeltutvalg bommer fortsatt — men bommene fordeler seg jevnt
            over og under, i stedet for systematisk under. Det er det som menes med at s² er{" "}
            <em>forventningsrett</em>.
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
        <strong className="text-foreground">Hvorfor blir n-versjonen for lav?</strong> Fordi vi
        måler avstandene fra <span className="font-mono">x̄</span> (utvalgets eget gjennomsnitt),
        ikke fra <span className="font-mono">μ</span>. Og <span className="font-mono">x̄</span>{" "}
        ligger per definisjon midt i akkurat disse observasjonene — den er valgt for å gjøre
        kvadratsummen så liten som mulig. Enhver annen verdi, inkludert den sanne{" "}
        <span className="font-mono">μ</span>, ville gitt en større kvadratsum. Vi måler altså
        systematisk for kort. Dra n mot 2 og se hvor grovt det slår ut når det er lite data å
        fordele skjevheten på.
      </div>

      <button
        onClick={() => setSeed((s) => s + 1)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Trekk {ANTALL_UTVALG} nye utvalg
      </button>
    </div>
  );
}
