import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Simpsons paradoks — når summen sier det motsatte av delene.
 *
 * Dette er den klassiske grunnen til at deskriptiv statistikk må gjøres med
 * omhu: en behandling kan være best på HVER pasientgruppe og likevel se
 * dårligst ut totalt. Årsaken er ikke regnefeil, men at gruppene har ulik
 * vanskelighetsgrad og ulik størrelse — så totalen vekter dem forskjellig.
 *
 * Tallene under er den ekte nyrestein-studien (Charig m.fl., 1986), som er
 * standardeksempelet nettopp fordi det ikke er konstruert.
 *
 * Pedagogisk poeng: brukeren kan dra på gruppestørrelsene og se reverseringen
 * oppstå og forsvinne. Da blir paradokset et mekanisk fenomen man forstår,
 * ikke en kuriositet man husker.
 */

interface Celle {
  vellykket: number;
  totalt: number;
}

const START = {
  aSmaa: { vellykket: 81, totalt: 87 },
  aStor: { vellykket: 192, totalt: 263 },
  bSmaa: { vellykket: 234, totalt: 270 },
  bStor: { vellykket: 55, totalt: 80 },
};

function pst(c: Celle): number {
  return c.totalt === 0 ? 0 : (c.vellykket / c.totalt) * 100;
}

function RateBar({ verdi, vinner }: { verdi: number; vinner: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${vinner ? "bg-success" : "bg-muted-foreground/50"}`}
          style={{ width: `${verdi}%` }}
        />
      </div>
      <span
        className={`w-14 shrink-0 text-right font-mono text-sm tabular-nums ${
          vinner ? "font-bold text-success" : ""
        }`}
      >
        {verdi.toFixed(1)} %
      </span>
    </div>
  );
}

export function SimpsonsParadoks() {
  const [d, setD] = useState(START);

  const rater = useMemo(() => {
    const aTot: Celle = {
      vellykket: d.aSmaa.vellykket + d.aStor.vellykket,
      totalt: d.aSmaa.totalt + d.aStor.totalt,
    };
    const bTot: Celle = {
      vellykket: d.bSmaa.vellykket + d.bStor.vellykket,
      totalt: d.bSmaa.totalt + d.bStor.totalt,
    };
    return {
      aSmaa: pst(d.aSmaa),
      bSmaa: pst(d.bSmaa),
      aStor: pst(d.aStor),
      bStor: pst(d.bStor),
      aTot: pst(aTot),
      bTot: pst(bTot),
      aTotC: aTot,
      bTotC: bTot,
    };
  }, [d]);

  const aVinnerBegge = rater.aSmaa > rater.bSmaa && rater.aStor > rater.bStor;
  const bVinnerBegge = rater.bSmaa > rater.aSmaa && rater.bStor > rater.aStor;
  const totalVinner = rater.aTot > rater.bTot ? "A" : rater.bTot > rater.aTot ? "B" : "likt";
  const reversering =
    (aVinnerBegge && totalVinner === "B") || (bVinnerBegge && totalVinner === "A");

  function settTotalt(nokkel: keyof typeof START, nyttTotalt: number) {
    setD((gammel) => {
      const c = gammel[nokkel];
      const andel = c.totalt === 0 ? 0 : c.vellykket / c.totalt;
      const t = Math.max(1, nyttTotalt);
      return { ...gammel, [nokkel]: { totalt: t, vellykket: Math.round(andel * t) } };
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Simpsons paradoks — når totalen sier det motsatte</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ekte tall fra en nyrestein-studie. Behandling A er best på små stein <em>og</em> best på
          store stein — men ser dårligst ut totalt. Ingen av tallene er feil. Dra på
          gruppestørrelsene og se når reverseringen oppstår.
        </p>
      </div>

      {/* Undergruppene */}
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            { navn: "Små stein", a: "aSmaa", b: "bSmaa", ra: rater.aSmaa, rb: rater.bSmaa },
            { navn: "Store stein", a: "aStor", b: "bStor", ra: rater.aStor, rb: rater.bStor },
          ] as const
        ).map((g) => (
          <div key={g.navn} className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.navn}
            </div>
            {(
              [
                { m: "A", k: g.a, r: g.ra, c: d[g.a] },
                { m: "B", k: g.b, r: g.rb, c: d[g.b] },
              ] as const
            ).map((rad) => (
              <div key={rad.m} className="mb-2 last:mb-0">
                <div className="mb-0.5 flex items-baseline justify-between text-xs">
                  <span className="font-semibold">Behandling {rad.m}</span>
                  <span className="font-mono text-muted-foreground">
                    {rad.c.vellykket}/{rad.c.totalt}
                  </span>
                </div>
                <RateBar verdi={rad.r} vinner={rad.r > (rad.m === "A" ? g.rb : g.ra)} />
                <input
                  type="range"
                  min={10}
                  max={400}
                  value={rad.c.totalt}
                  onChange={(e) => settTotalt(rad.k, Number(e.target.value))}
                  className="mt-1 w-full accent-brand"
                  aria-label={`Antall pasienter, ${g.navn}, behandling ${rad.m}`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Totalen */}
      <div className="rounded-lg border-2 border-border bg-muted/30 p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Alle pasienter sett under ett
        </div>
        {(
          [
            { m: "A", r: rater.aTot, c: rater.aTotC, mot: rater.bTot },
            { m: "B", r: rater.bTot, c: rater.bTotC, mot: rater.aTot },
          ] as const
        ).map((rad) => (
          <div key={rad.m} className="mb-2 last:mb-0">
            <div className="mb-0.5 flex items-baseline justify-between text-xs">
              <span className="font-semibold">Behandling {rad.m}</span>
              <span className="font-mono text-muted-foreground">
                {rad.c.vellykket}/{rad.c.totalt}
              </span>
            </div>
            <RateBar verdi={rad.r} vinner={rad.r > rad.mot} />
          </div>
        ))}
      </div>

      {/* Diagnosen */}
      {reversering ? (
        <div className="flex gap-2.5 rounded-lg border border-warning/50 bg-warning/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="text-sm">
            <strong>Paradokset er der nå.</strong> Behandling {aVinnerBegge ? "A" : "B"} vinner i
            begge gruppene, men {totalVinner} vinner totalt. Forklaringen ligger i
            gruppestørrelsene: den behandlingen som ser best ut totalt har fått flest av de{" "}
            <em>enkle</em> tilfellene. Totalen blander sammen «hvor god er behandlingen» med «hvor
            vanskelige pasienter fikk den».
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          Ingen reversering med disse tallene — totalen peker samme vei som undergruppene. Dra
          gruppestørrelsene slik at den ene behandlingen får mange lette tilfeller og den andre
          mange tunge, så dukker paradokset opp igjen.
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Lærdommen
        </div>
        <p className="mt-1">
          En andel regnet på blandede grupper er bare meningsfull hvis gruppene er sammenlignbare.
          Her er de ikke det: store stein er vanskeligere å behandle, og de to behandlingene fikk
          ulik andel av dem. Variabelen «steinstørrelse» er en{" "}
          <strong>konfunderende variabel</strong> — den påvirker både hvilken behandling som ble
          valgt og hvordan det gikk.
        </p>
        <p className="mt-2 text-muted-foreground">
          Derfor randomiserer man i kliniske studier: da fordeles de vanskelige tilfellene jevnt, og
          totalen blir til å stole på. Og derfor er det alltid verdt å spørre «er dette
          gjennomsnittet regnet over grupper som faktisk kan sammenlignes?».
        </p>
      </div>

      <button
        type="button"
        onClick={() => setD(START)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted"
      >
        Tilbake til studiens ekte tall
      </button>
    </div>
  );
}
