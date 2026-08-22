// Referanse-implementasjon av innholdskontrakten. Den ligger her, ikke under
// `fag/`, fordi den ikke er pensum — den er malen innholdsforfattere leser for
// å se hvordan en skjerm faktisk ser ut i kode. Tilgjengelig på /kurs/demo.

import { useState } from "react";
import { SkjermFlate, SkjermTittel, useSkjerm } from "@/components/skjerm";
import type { Fag } from "./types";

function Intro() {
  return (
    <SkjermFlate>
      <SkjermTittel>Hva skjer når to programmer vil ha samme minne?</SkjermTittel>
      <p className="text-muted-foreground">
        Vi skal finne ut hvordan operativsystemet klarer å gi hvert program
        følelsen av å ha maskinen for seg selv — uten at de tråkker i hverandres
        data.
      </p>
    </SkjermFlate>
  );
}

function Konsept() {
  return (
    <SkjermFlate>
      <SkjermTittel>Én idé per skjerm</SkjermTittel>
      <p className="text-muted-foreground">
        En skjerm skal kunne leses ferdig uten å scrolle. Trenger du mer plass,
        er det et tegn på at det egentlig er to idéer — del dem i to skjermer.
      </p>
      <p className="text-muted-foreground">
        Forkortelser skrives helt ut første gang: TLB (translation lookaside
        buffer), ikke bare TLB.
      </p>
    </SkjermFlate>
  );
}

function Anslag() {
  const { besvart } = useSkjerm();
  const [valg, setValg] = useState<number | null>(null);
  const alternativer = ["Rundt 10 ganger", "Rundt 100 ganger", "Rundt 10 000 ganger"];

  return (
    <SkjermFlate>
      <SkjermTittel>Gjett først</SkjermTittel>
      <p className="text-muted-foreground">
        Hvor mye tregere er et oppslag i hovedminnet enn i CPU-ens hurtigbuffer
        (cache)? Du skal ikke kunne dette ennå — poenget er at et anslag gjør
        fasiten lettere å huske.
      </p>
      <div className="flex flex-col gap-2">
        {alternativer.map((a, i) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setValg(i);
              besvart();
            }}
            className={`min-h-12 rounded-xl border px-4 text-left transition-colors ${
              valg === i ? "border-brand bg-brand/10" : "border-border hover:bg-accent"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      {valg !== null && (
        <p className="rounded-xl bg-muted p-4 text-sm">
          Fasit: rundt 100 ganger. Det er derfor hurtigbufferen finnes i det
          hele tatt.
        </p>
      )}
    </SkjermFlate>
  );
}

function Oppsummering() {
  return (
    <SkjermFlate>
      <SkjermTittel>Det du sitter igjen med</SkjermTittel>
      <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
        <li>Én skjerm = én idé, uten scroll.</li>
        <li>Anslag før fasit gjør fasiten festere.</li>
        <li>Recall-kort kommer først her, på slutten — aldri som inngang.</li>
      </ul>
    </SkjermFlate>
  );
}

export const DEMO_FAG: Fag = {
  slug: "demo",
  kode: "DEMO",
  navn: "Slik er en skjerm-økt bygd",
  emner: [
    {
      slug: "kontrakten",
      tittel: "Innholdskontrakten",
      sporsmal: "Hvordan skriver jeg innhold som funker på telefon?",
      undertemaer: [
        {
          slug: "en-okt",
          tittel: "Anatomien i én økt",
          utbytte: "Du vet hvordan skjermtypene henger sammen",
          skjermer: [
            { id: "intro", type: "intro", tittel: "Spørsmålet", Component: Intro, sekunder: 20 },
            { id: "konsept", type: "konsept", tittel: "Én idé", Component: Konsept },
            {
              id: "anslag",
              type: "anslag",
              tittel: "Gjett først",
              Component: Anslag,
              krevesSvar: true,
              sekunder: 60,
            },
            {
              id: "oppsummering",
              type: "oppsummering",
              tittel: "Oppsummering",
              Component: Oppsummering,
              sekunder: 20,
            },
          ],
        },
      ],
    },
  ],
};
