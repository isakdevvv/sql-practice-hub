import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import {
  bonferroni,
  familievisFeilrate,
  simulerMultipleTester,
} from "@/lib/tek1501/inferens";

// ---------------------------------------------------------------------------
// Guidet simulering (oppgavetype 2) for multiple sammenligninger.
//
// Dette er den ene sentrale simuleringen TEK-1501-sidene ikke hadde fra før.
// Alle de andre eksisterende komponentene gjenbrukes; denne måtte bygges, fordi
// feilslutningen den viser — å kjøre mange tester og rapportere den som ble
// signifikant — er blant de tyngste eksamensfellene og lar seg ikke forklare
// like overbevisende med ord.
//
// Oppsettet: m uavhengige tester der ALLE nullhypotesene faktisk er sanne. Det
// finnes altså ingen ekte effekt noe sted. Alt som lyser opp er en falsk positiv.
// All logikk ligger i src/lib/tek1501/inferens.ts, så tallene kan etterprøves
// uten å rendre noe.
// ---------------------------------------------------------------------------

const KOLONNER = 10;

export function MultippelTestingSim() {
  const [m, setM] = useState(20);
  const [korrigert, setKorrigert] = useState(false);
  const [seed, setSeed] = useState(12345);

  const { pVerdier, signifikante, grense } = useMemo(
    () => simulerMultipleTester({ m, alfa: 0.05, seed, korrigert }),
    [m, seed, korrigert],
  );

  const forventetAntall = m * grense;
  const minstEn = korrigert
    ? familievisFeilrate(bonferroni(0.05, m), m)
    : familievisFeilrate(0.05, m);

  const rader = Math.ceil(m / KOLONNER);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-1 text-sm font-semibold text-foreground">
        Hva skjer når du tester mange ting samtidig?
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Under kjøres <strong>{m}</strong> uavhengige tester der{" "}
        <strong>alle nullhypotesene er sanne</strong> — det finnes altså ingen ekte effekt noe sted.
        Hver rute er én test. Lyser en rute rødt, er den en <em>falsk positiv</em>: et «funn» som
        ikke finnes.
      </p>

      {/* --- Kontroller --- */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Antall tester (m):</span>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={m}
            onChange={(e) => setM(Number(e.target.value))}
            className="w-40 accent-[var(--brand)]"
          />
          <span className="w-8 font-mono tabular-nums text-foreground">{m}</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={korrigert}
            onChange={(e) => setKorrigert(e.target.checked)}
            className="accent-[var(--brand)]"
          />
          <span className="text-foreground">Bonferroni-korriger (bruk α/m)</span>
        </label>

        <button
          onClick={() => setSeed((s) => (s * 1103515245 + 12345) >>> 0)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Kjør på nytt
        </button>
      </div>

      {/* --- Rutenettet av tester --- */}
      <div
        className="mb-4 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${KOLONNER}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`${m} tester, ${signifikante.length} av dem falskt signifikante`}
      >
        {pVerdier.map((p, i) => {
          const signifikant = p < grense;
          return (
            <div
              key={i}
              title={`Test ${i + 1}: p = ${p.toFixed(3)}`}
              className={`flex h-8 items-center justify-center rounded border text-[10px] font-mono tabular-nums ${
                signifikant
                  ? "border-destructive bg-destructive/20 font-bold text-destructive"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {p.toFixed(2).slice(1)}
            </div>
          );
        })}
        {/* Fyll ut siste rad så rutenettet ikke blir skjevt. */}
        {Array.from({ length: rader * KOLONNER - m }).map((_, i) => (
          <div key={`tom-${i}`} className="h-8" />
        ))}
      </div>

      {/* --- Fasit i tall --- */}
      <div className="grid gap-2 sm:grid-cols-3">
        <Rute
          label="Signifikansgrense"
          verdi={grense < 0.001 ? grense.toExponential(1) : grense.toFixed(4)}
          note={korrigert ? `α/m = 0,05/${m}` : "α = 0,05"}
        />
        <Rute
          label="Falske funn nå"
          verdi={`${signifikante.length} av ${m}`}
          note={`forventet: ${formatterForventet(forventetAntall)}`}
          alarm={signifikante.length > 0}
        />
        <Rute
          label="P(minst ett falskt funn)"
          verdi={`${(minstEn * 100).toFixed(1)} %`}
          note={korrigert ? "holdt nede av korreksjonen" : "1 − (1 − α)^m"}
          alarm={!korrigert && minstEn > 0.2}
        />
      </div>

      <div
        className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
          korrigert
            ? "border-success/40 bg-success/5"
            : "border-amber-500/40 bg-amber-500/5"
        }`}
      >
        {korrigert ? (
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        )}
        <div className="leading-relaxed text-foreground">
          {korrigert ? (
            <>
              Med Bonferroni kreves p under {grense < 0.001 ? grense.toExponential(1) : grense.toFixed(4)}{" "}
              for hver enkelt test. Sannsynligheten for <em>minst</em> ett falskt funn i hele serien
              er nå {(minstEn * 100).toFixed(1)} % — altså tilbake på noe som ligner de 5 % du trodde
              du hadde. Prisen er at ekte, små effekter lettere blir oversett: styrken faller.
            </>
          ) : (
            <>
              Uten korreksjon har <em>hver</em> test 5 % sjanse for å slå ut ved ren tilfeldighet.
              Med m = {m} tester er sannsynligheten for minst ett falskt funn{" "}
              <strong>{(minstEn * 100).toFixed(1)} %</strong>. Skru opp m og se hvor fort det
              nærmer seg sikkerhet — og legg merke til at det ikke finnes én ekte effekt i hele
              rutenettet.
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Formaterer forventet antall falske funn med fornuftig antall desimaler. */
function formatterForventet(x: number): string {
  return x < 1 ? x.toFixed(2).replace(".", ",") : x.toFixed(1).replace(".", ",");
}

function Rute({
  label,
  verdi,
  note,
  alarm = false,
}: {
  label: string;
  verdi: string;
  note: string;
  alarm?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        alarm ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/30"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 font-mono text-lg font-semibold tabular-nums ${
          alarm ? "text-destructive" : "text-foreground"
        }`}
      >
        {verdi}
      </div>
      <div className="text-[11px] text-muted-foreground">{note}</div>
    </div>
  );
}
