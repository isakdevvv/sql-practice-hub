import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";

// Visualizer for the 1NF → 2NF → 3NF transformation on a concrete messy table.
// Same example as the OrdreLinje-walkthrough text above the component, but here
// the student can step through each transformation and see the tables change.

type Step = {
  navn: string;
  beskrivelse: string;
  brudd?: { regel: string; forklaring: string };
  fiks?: string;
  tabeller: Tabell[];
};

type Tabell = {
  navn: string;
  /** PK columns (in order) — used for the green underline. */
  pk: string[];
  /** FK columns mapped to "target table.col" for tooltip. */
  fk?: Record<string, string>;
  kolonner: string[];
  /** Rows, parallel to kolonner. */
  rader: (string | number)[][];
  /** Columns that are highlighted as «about to be removed» (red) on THIS step. */
  fjernes?: string[];
  /** Mark this entire table as «new in this step» (green outline). */
  ny?: boolean;
  /** Inline note shown under the table. */
  note?: string;
};

// Reusable raw data — different rows used across steps.
const ORDRE_RAW = [
  [1001, 50, 2, 42, "Anne Holm", "9011", "Tromsø", "Te", 49, "22 11 33, 99 88 77"],
  [1001, 51, 1, 42, "Anne Holm", "9011", "Tromsø", "Kaffe", 89, "22 11 33, 99 88 77"],
  [1002, 50, 3, 43, "Bjørn Ås", "9020", "Tromsø", "Te", 49, "76 12 88"],
  [1003, 52, 1, 42, "Anne Holm", "9011", "Tromsø", "Sukker", 19, "22 11 33, 99 88 77"],
];

const RAW_COLS = [
  "ordreNr",
  "prodNr",
  "antall",
  "kundeNr",
  "kundeNavn",
  "postNr",
  "poststed",
  "prodNavn",
  "prodPris",
  "telefonNumre",
];

// After 1NF: telefonNumre removed; Telefon-table added
const STEP_1_COLS = RAW_COLS.filter((c) => c !== "telefonNumre");
const STEP_1_ROWS = ORDRE_RAW.map((r) => r.slice(0, -1) as (string | number)[]);

const TELEFON_ROWS: (string | number)[][] = [
  [42, "22 11 33"],
  [42, "99 88 77"],
  [43, "76 12 88"],
];

// After 2NF: prodNavn, prodPris removed; Produkt-table added
const STEP_2_COLS = STEP_1_COLS.filter((c) => c !== "prodNavn" && c !== "prodPris");
const STEP_2_ROWS = STEP_1_ROWS.map((r) => r.filter((_, i) => i !== 7 && i !== 8) as (string | number)[]);

const PRODUKT_ROWS: (string | number)[][] = [
  [50, "Te", 49],
  [51, "Kaffe", 89],
  [52, "Sukker", 19],
];

// After 3NF: kundeNavn, postNr, poststed removed from OrdreLinje;
// Split into Ordre, Kunde, Poststed
const STEP_3_ORDRELINJE_COLS = ["ordreNr", "prodNr", "antall"];
const STEP_3_ORDRELINJE_ROWS: (string | number)[][] = [
  [1001, 50, 2],
  [1001, 51, 1],
  [1002, 50, 3],
  [1003, 52, 1],
];

const STEP_3_ORDRE_ROWS: (string | number)[][] = [
  [1001, 42],
  [1002, 43],
  [1003, 42],
];

const STEP_3_KUNDE_ROWS: (string | number)[][] = [
  [42, "Anne Holm", "9011"],
  [43, "Bjørn Ås", "9020"],
];

const STEP_3_POSTSTED_ROWS: (string | number)[][] = [
  ["9011", "Tromsø"],
  ["9020", "Tromsø"],
];

const STEGN: Step[] = [
  {
    navn: "Start — unormalisert",
    beskrivelse:
      "Én tabell prøver å lagre ALT. Vi har duplisering på flere nivåer + en liste i én kolonne. Klassisk «alt-i-én»-design som virker enkelt men gjør hver oppdatering smertefull.",
    tabeller: [
      {
        navn: "OrdreLinje (unormalisert)",
        pk: ["ordreNr", "prodNr"],
        kolonner: RAW_COLS,
        rader: ORDRE_RAW,
        fjernes: ["telefonNumre"],
        note:
          "Marker: telefonNumre er en liste — bryter 1NF. Skal flyttes ut i steg 1.",
      },
    ],
  },
  {
    navn: "Etter 1NF",
    beskrivelse:
      "1NF krever atomiske verdier — én verdi per celle, ingen lister. Vi flytter telefonene ut til en egen tabell. Hver telefon blir én rad.",
    brudd: {
      regel: "1NF — atomiske verdier",
      forklaring:
        "telefonNumre = '22 11 33, 99 88 77' er en liste. Det er ikke atomisk.",
    },
    fiks: "Flytt ut til ny tabell Telefon(kundeNr, nummer). PK = (kundeNr, nummer). FK kundeNr → Kunde.",
    tabeller: [
      {
        navn: "OrdreLinje (telefon-kolonnen fjernet)",
        pk: ["ordreNr", "prodNr"],
        kolonner: STEP_1_COLS,
        rader: STEP_1_ROWS,
        // Now the partial dependency becomes the next problem
        fjernes: ["prodNavn", "prodPris"],
        note:
          "Nytt problem: prodNavn og prodPris avhenger bare av prodNr — del av PK. Bryter 2NF. Skal ut i steg 2.",
      },
      {
        navn: "Telefon (NY)",
        pk: ["kundeNr", "nummer"],
        fk: { kundeNr: "Kunde.kundeNr" },
        kolonner: ["kundeNr", "nummer"],
        rader: TELEFON_ROWS,
        ny: true,
        note: "Hver telefon = én rad. PK er sammensatt (kundeNr + nummer).",
      },
    ],
  },
  {
    navn: "Etter 2NF",
    beskrivelse:
      "2NF krever at hvert ikke-nøkkelfelt avhenger av HELE PK. prodNavn og prodPris avhenger bare av prodNr (halve PK-en (ordreNr, prodNr)). Flytt dem ut.",
    brudd: {
      regel: "2NF — ingen partielle avhengigheter",
      forklaring:
        "PK = (ordreNr, prodNr). Men prodNavn og prodPris avhenger BARE av prodNr — halve nøkkelen.",
    },
    fiks: "Flytt ut til ny tabell Produkt(prodNr, prodNavn, prodPris). FK prodNr → Produkt i OrdreLinje.",
    tabeller: [
      {
        navn: "OrdreLinje (produkt-info fjernet)",
        pk: ["ordreNr", "prodNr"],
        fk: { prodNr: "Produkt.prodNr" },
        kolonner: STEP_2_COLS,
        rader: STEP_2_ROWS,
        // Now the transitive becomes visible
        fjernes: ["kundeNavn", "postNr", "poststed"],
        note:
          "Nytt problem: kundeNavn, postNr, poststed avhenger av kundeNr — ikke direkte av PK. Transitivt. Bryter 3NF.",
      },
      {
        navn: "Produkt (NY)",
        pk: ["prodNr"],
        kolonner: ["prodNr", "prodNavn", "prodPris"],
        rader: PRODUKT_ROWS,
        ny: true,
        note: "Hvert produkt lagres ÉN gang. Endrer Te pris fra 49 til 55? Ett sted å oppdatere.",
      },
      {
        navn: "Telefon (uendret)",
        pk: ["kundeNr", "nummer"],
        fk: { kundeNr: "Kunde.kundeNr" },
        kolonner: ["kundeNr", "nummer"],
        rader: TELEFON_ROWS,
      },
    ],
  },
  {
    navn: "Etter 3NF",
    beskrivelse:
      "3NF krever ingen transitive avhengigheter. kundeNavn avhenger av kundeNr (som er FK), og poststed avhenger av postNr (også via kundeNr). Vi deler i Ordre, Kunde og Poststed.",
    brudd: {
      regel: "3NF — ingen transitive avhengigheter",
      forklaring:
        "ordreNr → kundeNr → kundeNavn er en kjede. kundeNr → postNr → poststed er en til. Ikke-PK-felter må ikke avhenge av andre ikke-PK-felter.",
    },
    fiks:
      "Split ut til Ordre(ordreNr, kundeNr), Kunde(kundeNr, kundeNavn, postNr) og Poststed(postNr, poststed).",
    tabeller: [
      {
        navn: "OrdreLinje (kun det som faktisk hører til linja)",
        pk: ["ordreNr", "prodNr"],
        fk: { ordreNr: "Ordre.ordreNr", prodNr: "Produkt.prodNr" },
        kolonner: STEP_3_ORDRELINJE_COLS,
        rader: STEP_3_ORDRELINJE_ROWS,
        note: "Bare relasjon-attributter (antall) og FK-ene. Slank og 3NF-klar.",
      },
      {
        navn: "Ordre (NY)",
        pk: ["ordreNr"],
        fk: { kundeNr: "Kunde.kundeNr" },
        kolonner: ["ordreNr", "kundeNr"],
        rader: STEP_3_ORDRE_ROWS,
        ny: true,
        note: "Mapper ordre til kunde. Hadde det vært en dato på ordren, hørte den hjemme her.",
      },
      {
        navn: "Kunde (NY)",
        pk: ["kundeNr"],
        fk: { postNr: "Poststed.postNr" },
        kolonner: ["kundeNr", "kundeNavn", "postNr"],
        rader: STEP_3_KUNDE_ROWS,
        ny: true,
        note: "Kundeinfo lagres ÉN gang. kundeNavn er det Anne Holm står oppført med på ALLE ordrene sine — uten dobling.",
      },
      {
        navn: "Poststed (NY)",
        pk: ["postNr"],
        kolonner: ["postNr", "poststed"],
        rader: STEP_3_POSTSTED_ROWS,
        ny: true,
        note: "Klassisk oppslag-tabell. Posten kan endre stedsnavn ÉN gang.",
      },
      {
        navn: "Produkt (uendret)",
        pk: ["prodNr"],
        kolonner: ["prodNr", "prodNavn", "prodPris"],
        rader: PRODUKT_ROWS,
      },
      {
        navn: "Telefon (uendret)",
        pk: ["kundeNr", "nummer"],
        fk: { kundeNr: "Kunde.kundeNr" },
        kolonner: ["kundeNr", "nummer"],
        rader: TELEFON_ROWS,
      },
    ],
  },
];

export function NormaliseringSteps() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEGN[stepIdx];

  return (
    <section id="visuelt" className="mb-10">
      <h2 className="text-xl font-semibold mb-3">Visuelt: hvordan tabellen forandres</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Samme eksempel som over, men nå kan du klikke deg gjennom hvert normaliseringssteg
        og se hvordan tabellene faktisk endres. Rød markering = «skal ut i neste steg», grønn
        ramme = «ny tabell i dette steget».
      </p>

      {/* Stepper UI */}
      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-2">
            {STEGN.map((s, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  i === stepIdx
                    ? "border-brand bg-brand/10 text-brand"
                    : i < stepIdx
                      ? "border-success/50 text-success hover:bg-success/5"
                      : "border-border text-muted-foreground hover:bg-accent",
                )}
              >
                {i + 1}. {s.navn}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
              disabled={stepIdx === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Forrige steg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {stepIdx + 1} / {STEGN.length}
            </span>
            <button
              onClick={() => setStepIdx(Math.min(STEGN.length - 1, stepIdx + 1))}
              disabled={stepIdx === STEGN.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Neste steg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step beskrivelse + brudd-boks */}
        <p className="text-sm text-foreground mb-3">{step.beskrivelse}</p>

        {step.brudd && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-2 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <strong className="text-destructive">{step.brudd.regel}:</strong>{" "}
              <span className="text-foreground">{step.brudd.forklaring}</span>
            </div>
          </div>
        )}

        {step.fiks && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <div className="text-sm">
              <strong className="text-success">Fiks:</strong>{" "}
              <span className="text-foreground">{step.fiks}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabellene for dette steget */}
      <div className="space-y-4">
        {step.tabeller.map((t, i) => (
          <TabellView key={`${stepIdx}-${i}`} t={t} />
        ))}
      </div>
    </section>
  );
}

function TabellView({ t }: { t: Tabell }) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card p-4",
        t.ny ? "border-success/50" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h3 className="font-semibold text-sm">
          {t.navn}
          {t.ny && (
            <span className="ml-2 inline-block rounded bg-success/15 text-success text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5">
              ny
            </span>
          )}
        </h3>
        <div className="text-xs text-muted-foreground">
          PK = (<span className="text-success font-mono">{t.pk.join(", ")}</span>)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs font-mono w-full">
          <thead className="bg-muted/40">
            <tr>
              {t.kolonner.map((c) => {
                const isPk = t.pk.includes(c);
                const isFk = t.fk && c in t.fk;
                const willBeRemoved = t.fjernes?.includes(c);
                return (
                  <th
                    key={c}
                    className={cn(
                      "px-2 py-1.5 text-left border-b border-border whitespace-nowrap",
                      isPk && "text-success",
                      willBeRemoved && "bg-destructive/15 text-destructive line-through",
                    )}
                    title={isFk ? `FK → ${t.fk![c]}` : undefined}
                  >
                    {c}
                    {isFk && <span className="ml-1 text-[9px] text-brand">FK</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {t.rader.map((rad, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-b-0">
                {rad.map((celle, ci) => {
                  const col = t.kolonner[ci];
                  const willBeRemoved = t.fjernes?.includes(col);
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-2 py-1 whitespace-nowrap",
                        willBeRemoved && "bg-destructive/10 text-destructive line-through",
                      )}
                    >
                      {celle === null || celle === undefined ? (
                        <span className="text-muted-foreground/50">NULL</span>
                      ) : (
                        String(celle)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {t.note && (
        <p className="mt-2 text-xs text-muted-foreground italic">{t.note}</p>
      )}
    </div>
  );
}
