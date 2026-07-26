import { useMemo, useState } from "react";

/**
 * Naturlige frekvenser — base rate-fellen gjort ufarlig.
 *
 * Det klassiske resultatet (Gigerenzer & Hoffrage 1995): stilt med
 * betingede sannsynligheter bommer selv leger grovt på hvor sannsynlig
 * sykdom er ved positiv test. Stilt med naturlige frekvenser — «av 1000
 * personer, hvor mange …» — svarer folk flest riktig.
 *
 * Derfor viser denne begge formuleringene av NØYAKTIG samme regnestykke,
 * side om side. Poenget er ikke at Bayes' formel er vanskelig, men at
 * hjernen regner lettere med hele mennesker enn med desimaltall.
 *
 * Sammenhengen med Bayes: rutenettet ER formelen. P(syk | positiv) er
 * bare «sanne positive delt på alle positive», og de to tallene står
 * fysisk foran deg.
 */

const N = 1000;

export function NaturligeFrekvenser() {
  const [prevalens, setPrevalens] = useState(1); // % som faktisk er syke
  const [sensitivitet, setSensitivitet] = useState(90); // % av syke som tester positivt
  const [spesifisitet, setSpesifisitet] = useState(91); // % av friske som tester negativt

  const t = useMemo(() => {
    const syke = Math.round((prevalens / 100) * N);
    const friske = N - syke;
    const sannPos = Math.round((sensitivitet / 100) * syke);
    const falskNeg = syke - sannPos;
    const sannNeg = Math.round((spesifisitet / 100) * friske);
    const falskPos = friske - sannNeg;
    const allePos = sannPos + falskPos;
    return {
      syke,
      friske,
      sannPos,
      falskNeg,
      sannNeg,
      falskPos,
      allePos,
      ppv: allePos === 0 ? 0 : (sannPos / allePos) * 100,
    };
  }, [prevalens, sensitivitet, spesifisitet]);

  const Skyv = ({
    navn,
    verdi,
    sett,
    forklaring,
  }: {
    navn: string;
    verdi: number;
    sett: (n: number) => void;
    forklaring: string;
  }) => (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between text-[11px]">
        <span className="font-semibold uppercase tracking-wider text-muted-foreground">{navn}</span>
        <span className="font-mono font-bold">{verdi} %</span>
      </div>
      <input
        type="range"
        min={verdi === prevalens ? 0.1 : 50}
        max={99}
        step={verdi === prevalens ? 0.1 : 1}
        value={verdi}
        onChange={(e) => sett(Number(e.target.value))}
        className="w-full accent-brand"
        aria-label={navn}
      />
      <p className="mt-0.5 text-[10px] text-muted-foreground">{forklaring}</p>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <div>
        <h3 className="font-semibold">
          Naturlige frekvenser — hvorfor positiv test ikke betyr syk
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Samme regnestykke, to formuleringer. Den ene får folk til å bomme grovt, den andre får dem
          til å svare riktig. Forskjellen er bare om vi teller mennesker eller regner med
          desimaltall.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Skyv
          navn="Forekomst"
          verdi={prevalens}
          sett={setPrevalens}
          forklaring="Hvor stor andel som faktisk har sykdommen"
        />
        <Skyv
          navn="Sensitivitet"
          verdi={sensitivitet}
          sett={setSensitivitet}
          forklaring="Andel av de syke som testen fanger opp"
        />
        <Skyv
          navn="Spesifisitet"
          verdi={spesifisitet}
          sett={setSpesifisitet}
          forklaring="Andel av de friske som får riktig negativt svar"
        />
      </div>

      {/* Frekvens-treet: hele mennesker, ikke desimaltall */}
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tenk deg {N} personer
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2.5">
            <div className="text-xs font-semibold">
              {t.syke} er syke
              <span className="ml-1 font-normal text-muted-foreground">({prevalens} %)</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-xs">
              <li className="flex justify-between">
                <span>tester positivt (sanne positive)</span>
                <span className="font-mono font-bold text-destructive">{t.sannPos}</span>
              </li>
              <li className="flex justify-between text-muted-foreground">
                <span>tester negativt (oversett)</span>
                <span className="font-mono">{t.falskNeg}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-2.5">
            <div className="text-xs font-semibold">
              {t.friske} er friske
              <span className="ml-1 font-normal text-muted-foreground">
                ({(100 - prevalens).toFixed(1)} %)
              </span>
            </div>
            <ul className="mt-1.5 space-y-1 text-xs">
              <li className="flex justify-between">
                <span>tester positivt (falske alarmer)</span>
                <span className="font-mono font-bold text-warning">{t.falskPos}</span>
              </li>
              <li className="flex justify-between text-muted-foreground">
                <span>tester negativt</span>
                <span className="font-mono">{t.sannNeg}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Svaret, formulert som telling */}
      <div className="rounded-lg border-2 border-brand/40 bg-brand/5 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          Av alle som får positivt svar
        </div>
        <p className="mt-1 text-sm">
          <span className="font-mono font-bold">{t.allePos}</span> personer tester positivt. Av dem
          er <span className="font-mono font-bold text-destructive">{t.sannPos}</span> faktisk syke.
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-brand">{t.ppv.toFixed(1)} %</span>
          <span className="text-sm text-muted-foreground">
            sannsynlighet for å være syk gitt positiv test
          </span>
        </div>
        {/* Visuell andel */}
        <div className="mt-2 flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-destructive"
            style={{ width: `${t.allePos === 0 ? 0 : (t.sannPos / t.allePos) * 100}%` }}
          />
          <div
            className="bg-warning/60"
            style={{ width: `${t.allePos === 0 ? 0 : (t.falskPos / t.allePos) * 100}%` }}
          />
        </div>
        <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-destructive" /> faktisk syke
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-warning/60" /> falske alarmer
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Hvorfor intuisjonen bommer
        </div>
        <p className="mt-1">
          Med lav forekomst finnes det svært mange flere friske enn syke. Selv en test som tar feil
          på bare noen få prosent av de friske, produserer da flere falske alarmer enn det finnes
          ekte tilfeller. Testens kvalitet er ikke problemet — det er at den brukes på en gruppe der
          nesten ingen er syke.
        </p>
        <p className="mt-2 text-muted-foreground">
          Dra forekomsten opp mot 20 %, så snur bildet: nå er de fleste positive ekte. Det er derfor
          screening av friske og testing av folk med symptomer er to helt ulike ting — og hvorfor
          «testen er 90 % sikker» er en meningsløs setning uten forekomsten.
        </p>
      </div>
    </div>
  );
}
