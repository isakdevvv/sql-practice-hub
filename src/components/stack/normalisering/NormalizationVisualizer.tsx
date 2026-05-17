import { useMemo, useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  Lightbulb,
  MousePointerClick,
  Database,
  TableProperties,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --------------------------------------------------------------------------
// Interaktiv normaliserings-visualisering: 1NF → 2NF → 3NF → BCNF + FD-lab.
// Hver modus tar samme prinsipp (én rotete tabell + en metafor) og animerer
// «før / etter» med CSS-overganger. Bruker «Funksjonelle avhengigheter»-
// modusen kan klikke kolonner for å markere FD-er; vi beregner attributt-
// closure A⁺ og fremhever hva hver FD bestemmer.
// --------------------------------------------------------------------------

type Mode = "u-1nf" | "1-2nf" | "2-3nf" | "3-bcnf" | "fd" | "anomali";

type ColRole = "pk" | "fk" | "non-key" | "transitive" | "partial" | "candidate";

type Col = { name: string; role?: ColRole; sub?: string };

type Table = {
  navn: string;
  pk: string[];
  fk?: Record<string, string>;
  kolonner: Col[];
  rader: (string | number)[][];
  ny?: boolean;
  note?: string;
  /** Kolonner som er duplisert-rødt-markert i før-tabellen. */
  problem?: string[];
};

/** En SQL-spørring + resultatet den produserer fra de normaliserte tabellene.
 *  Brukes til å vise at ingen data går tapt — du henter samme info via JOIN. */
type JoinDemo = {
  /** Klartekst-overskrift over query-boksen. */
  tittel: string;
  /** Multi-line SQL-spørring, formatert klar til visning. */
  sql: string;
  /** Kolonnenavn i resultatraden. */
  resultKolonner: string[];
  /** Rader i resultatet — bevisst valgt så den matcher FØR-tabellen. */
  resultRader: (string | number)[][];
  /** Kort linje under resultatet — forklarer hvorfor dette beviser noe. */
  poeng: string;
};

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "u-1nf", label: "Unormalisert → 1NF", sub: "splitt lister i celler" },
  { id: "1-2nf", label: "1NF → 2NF", sub: "partielle avhengigheter" },
  { id: "2-3nf", label: "2NF → 3NF", sub: "transitive avhengigheter" },
  { id: "3-bcnf", label: "3NF → BCNF", sub: "overlappende kandidatnøkler" },
  { id: "fd", label: "FD-lab", sub: "klikk og finn A⁺" },
  { id: "anomali", label: "Anomali-demo", sub: "se redundansen koste" },
];

const METAFORER: Record<Mode, { kort: string; lang: string }> = {
  "u-1nf": {
    kort: "Som å ikke pakke flere bøker i én bok",
    lang:
      "Tenk hyllen i klasserommet: hver bok skal ha sin egen plass — ikke buntes sammen med tape. Hver celle = én verdi, ellers finner du aldri en bestemt bok igjen.",
  },
  "1-2nf": {
    kort: "Kafé-menyen står ikke på hver ordrekvittering",
    lang:
      "På kafeen får du ikke trykt hele menyen ned på kvitteringen. Produktets navn og pris hører til produktet — ikke til hver enkelt ordrelinje.",
  },
  "2-3nf": {
    kort: "Ansatte og avdelinger — adressen tilhører bygget",
    lang:
      "Hvis hver ansatt har avdelingsnavnet sitt påført, må alle ansatte rettes når avdelingen bytter navn. Avdelingsinfo hører til avdelingen, ikke til hver ansatt.",
  },
  "3-bcnf": {
    kort: "To gyldige måter å identifisere noe på — men én av dem bestemmer mer",
    lang:
      "Tenk en lærer som ALLTID underviser ett fag. (elev, fag) identifiserer en time, men også (elev, lærer) — og lærer alene bestemmer faget. Det skaper en ulovlig binding 3NF lar slippe gjennom.",
  },
  fd: {
    kort: "Funksjonell avhengighet = «hvis jeg vet X, vet jeg Y»",
    lang:
      "Klikk en kolonne for å sette den som determinant (X). Klikk så kolonner for å legge dem til høyresiden (Y). Vi viser hva X⁺ (closure) blir — alt som kan utledes fra X.",
  },
  anomali: {
    kort: "Redundans = tre slags feil som lurer i hver oppdatering",
    lang:
      "Prøv å oppdatere prisen på 'Te' i den unormaliserte tabellen — du må endre samme verdi på tre rader. Glemmer du én, blir databasen selv-motsigende.",
  },
};

// --------------------------------------------------------------------------
// Felles eksempel-data
// --------------------------------------------------------------------------

const UNORM_COLS: Col[] = [
  { name: "ordreNr", role: "pk" },
  { name: "prodNr", role: "pk" },
  { name: "antall", role: "non-key" },
  { name: "kundeNr", role: "transitive" },
  { name: "kundeNavn", role: "transitive" },
  { name: "prodNavn", role: "partial" },
  { name: "prodPris", role: "partial" },
  { name: "telefonNumre", role: "non-key" },
];

const UNORM_ROWS: (string | number)[][] = [
  [1001, 50, 2, 42, "Anne Holm", "Te", 49, "22 11 33, 99 88 77"],
  [1001, 51, 1, 42, "Anne Holm", "Kaffe", 89, "22 11 33, 99 88 77"],
  [1002, 50, 3, 43, "Bjørn Ås", "Te", 49, "76 12 88"],
];

// --------------------------------------------------------------------------
// Mode-spesifikke før/etter-konfigurasjoner
// --------------------------------------------------------------------------

function buildModeData(mode: Mode): {
  for: Table[];
  etter: Table[];
  join?: JoinDemo;
} {
  switch (mode) {
    case "u-1nf":
      return {
        join: {
          tittel: "Hent samme info tilbake via JOIN",
          sql: `SELECT k.kundeNr,
       k.kundeNavn,
       GROUP_CONCAT(t.nummer, ', ') AS telefoner
FROM   Kunde   k
LEFT JOIN Telefon t ON t.kundeNr = k.kundeNr
GROUP BY k.kundeNr, k.kundeNavn;`,
          resultKolonner: ["kundeNr", "kundeNavn", "telefoner"],
          resultRader: [
            [42, "Anne Holm", "22 11 33, 99 88 77"],
            [43, "Bjørn Ås", "76 12 88"],
            [44, "Cathrine Lie", "55 12 12, 91 33 22, 22 99 88"],
          ],
          poeng:
            "Resultatet er identisk med FØR-tabellen — men nå er hver telefon en ekte verdi som kan indekseres, sjekkes med UNIQUE og joines mot.",
        },
        for: [
          {
            navn: "Kunde (unormalisert)",
            pk: ["kundeNr"],
            kolonner: [
              { name: "kundeNr", role: "pk" },
              { name: "kundeNavn" },
              { name: "telefonNumre", role: "non-key" },
            ],
            rader: [
              [42, "Anne Holm", "22 11 33, 99 88 77"],
              [43, "Bjørn Ås", "76 12 88"],
              [44, "Cathrine Lie", "55 12 12, 91 33 22, 22 99 88"],
            ],
            problem: ["telefonNumre"],
            note: "telefonNumre = liste i én celle. Bryter 1NF — verdier skal være atomiske.",
          },
        ],
        etter: [
          {
            navn: "Kunde",
            pk: ["kundeNr"],
            kolonner: [
              { name: "kundeNr", role: "pk" },
              { name: "kundeNavn" },
            ],
            rader: [
              [42, "Anne Holm"],
              [43, "Bjørn Ås"],
              [44, "Cathrine Lie"],
            ],
            note: "Kunden uten lister — enkel, atomisk.",
          },
          {
            navn: "Telefon",
            pk: ["kundeNr", "nummer"],
            fk: { kundeNr: "Kunde.kundeNr" },
            kolonner: [
              { name: "kundeNr", role: "pk" },
              { name: "nummer", role: "pk" },
            ],
            rader: [
              [42, "22 11 33"],
              [42, "99 88 77"],
              [43, "76 12 88"],
              [44, "55 12 12"],
              [44, "91 33 22"],
              [44, "22 99 88"],
            ],
            ny: true,
            note: "Hver telefon = én rad. PK er sammensatt (kundeNr + nummer).",
          },
        ],
      };

    case "1-2nf":
      return {
        join: {
          tittel: "Hent samme info tilbake via JOIN",
          sql: `SELECT ol.ordreNr,
       ol.prodNr,
       ol.antall,
       p.prodNavn,
       p.prodPris
FROM   OrdreLinje ol
JOIN   Produkt    p  ON p.prodNr = ol.prodNr;`,
          resultKolonner: ["ordreNr", "prodNr", "antall", "prodNavn", "prodPris"],
          resultRader: [
            [1001, 50, 2, "Te", 49],
            [1001, 51, 1, "Kaffe", 89],
            [1002, 50, 3, "Te", 49],
            [1003, 52, 1, "Sukker", 19],
          ],
          poeng:
            "Samme rader som FØR. Men 'Te = 49' lagres nå i ÉN celle i Produkt — ikke duplisert på hver ordrelinje.",
        },
        for: [
          {
            navn: "OrdreLinje (1NF, sammensatt PK)",
            pk: ["ordreNr", "prodNr"],
            kolonner: [
              { name: "ordreNr", role: "pk" },
              { name: "prodNr", role: "pk" },
              { name: "antall", role: "non-key", sub: "PK → antall" },
              { name: "prodNavn", role: "partial", sub: "prodNr → prodNavn" },
              { name: "prodPris", role: "partial", sub: "prodNr → prodPris" },
            ],
            rader: [
              [1001, 50, 2, "Te", 49],
              [1001, 51, 1, "Kaffe", 89],
              [1002, 50, 3, "Te", 49],
              [1003, 52, 1, "Sukker", 19],
            ],
            problem: ["prodNavn", "prodPris"],
            note: "prodNavn og prodPris avhenger bare av prodNr — halve PK. Partiell avhengighet.",
          },
        ],
        etter: [
          {
            navn: "OrdreLinje",
            pk: ["ordreNr", "prodNr"],
            fk: { prodNr: "Produkt.prodNr" },
            kolonner: [
              { name: "ordreNr", role: "pk" },
              { name: "prodNr", role: "pk" },
              { name: "antall", role: "non-key" },
            ],
            rader: [
              [1001, 50, 2],
              [1001, 51, 1],
              [1002, 50, 3],
              [1003, 52, 1],
            ],
            note: "Bare det som faktisk hører til ordrelinja.",
          },
          {
            navn: "Produkt",
            pk: ["prodNr"],
            kolonner: [
              { name: "prodNr", role: "pk" },
              { name: "prodNavn" },
              { name: "prodPris" },
            ],
            rader: [
              [50, "Te", 49],
              [51, "Kaffe", 89],
              [52, "Sukker", 19],
            ],
            ny: true,
            note: "Produktinfo lagres ÉN gang. Pris-endring → ett sted å oppdatere.",
          },
        ],
      };

    case "2-3nf":
      return {
        join: {
          tittel: "Hent samme info tilbake via JOIN",
          sql: `SELECT a.empId,
       a.navn,
       a.deptId,
       d.deptNavn
FROM   Ansatt   a
JOIN   Avdeling d ON d.deptId = a.deptId;`,
          resultKolonner: ["empId", "navn", "deptId", "deptNavn"],
          resultRader: [
            [1, "Anne", 10, "Salg"],
            [2, "Bjørn", 10, "Salg"],
            [3, "Cathrine", 20, "Utvikling"],
            [4, "Dan", 20, "Utvikling"],
          ],
          poeng:
            "Samme svar — men 'Salg' og 'Utvikling' lagres bare ÉN gang. Endrer Salg navn til Marked? UPDATE rammer 1 rad, ikke 2.",
        },
        for: [
          {
            navn: "Ansatt (2NF, men transitiv)",
            pk: ["empId"],
            kolonner: [
              { name: "empId", role: "pk" },
              { name: "navn" },
              { name: "deptId", role: "transitive", sub: "empId → deptId" },
              { name: "deptNavn", role: "transitive", sub: "deptId → deptNavn" },
            ],
            rader: [
              [1, "Anne", 10, "Salg"],
              [2, "Bjørn", 10, "Salg"],
              [3, "Cathrine", 20, "Utvikling"],
              [4, "Dan", 20, "Utvikling"],
            ],
            problem: ["deptNavn"],
            note: "empId → deptId → deptNavn er en kjede. deptNavn avhenger transitivt av empId.",
          },
        ],
        etter: [
          {
            navn: "Ansatt",
            pk: ["empId"],
            fk: { deptId: "Avdeling.deptId" },
            kolonner: [
              { name: "empId", role: "pk" },
              { name: "navn" },
              { name: "deptId", role: "fk" },
            ],
            rader: [
              [1, "Anne", 10],
              [2, "Bjørn", 10],
              [3, "Cathrine", 20],
              [4, "Dan", 20],
            ],
            note: "Ansatt kjenner bare avdelings-ID-en. Resten finnes via JOIN.",
          },
          {
            navn: "Avdeling",
            pk: ["deptId"],
            kolonner: [
              { name: "deptId", role: "pk" },
              { name: "deptNavn" },
            ],
            rader: [
              [10, "Salg"],
              [20, "Utvikling"],
            ],
            ny: true,
            note: "Endrer 'Salg' navn til 'Marked'? ÉN rad å oppdatere.",
          },
        ],
      };

    case "3-bcnf":
      return {
        join: {
          tittel: "Hent samme info tilbake via JOIN",
          sql: `SELECT v.student,
       vd.fag,
       v.veileder
FROM   Veiledning v
JOIN   Veileder   vd ON vd.veileder = v.veileder;`,
          resultKolonner: ["student", "fag", "veileder"],
          resultRader: [
            ["Anne", "DB", "Olsen"],
            ["Bjørn", "DB", "Olsen"],
            ["Anne", "Algo", "Hansen"],
            ["Cathrine", "DB", "Pedersen"],
          ],
          poeng:
            "Samme tabell — men nå er det umulig å registrere 'Olsen underviser Algo'. Skjemaet håndhever regelen «én veileder, ett fag».",
        },
        for: [
          {
            navn: "Veiledning (3NF, ikke BCNF)",
            pk: ["student", "fag"],
            kolonner: [
              { name: "student", role: "candidate" },
              { name: "fag", role: "candidate" },
              { name: "veileder", role: "non-key", sub: "veileder → fag" },
            ],
            rader: [
              ["Anne", "DB", "Olsen"],
              ["Bjørn", "DB", "Olsen"],
              ["Anne", "Algo", "Hansen"],
              ["Cathrine", "DB", "Pedersen"],
            ],
            problem: ["veileder"],
            note: "(student, fag) er PK. Men veileder bestemmer fag — og veileder er IKKE kandidatnøkkel. 3NF tillater det, BCNF gjør ikke.",
          },
        ],
        etter: [
          {
            navn: "Veileder",
            pk: ["veileder"],
            kolonner: [
              { name: "veileder", role: "pk" },
              { name: "fag" },
            ],
            rader: [
              ["Olsen", "DB"],
              ["Hansen", "Algo"],
              ["Pedersen", "DB"],
            ],
            ny: true,
            note: "Hver veileder ETT fag. veileder → fag lever her.",
          },
          {
            navn: "Veiledning",
            pk: ["student", "veileder"],
            fk: { veileder: "Veileder.veileder" },
            kolonner: [
              { name: "student", role: "pk" },
              { name: "veileder", role: "pk" },
            ],
            rader: [
              ["Anne", "Olsen"],
              ["Bjørn", "Olsen"],
              ["Anne", "Hansen"],
              ["Cathrine", "Pedersen"],
            ],
            note: "Faget hentes via Veileder. Ingen FD med ikke-superkey som determinant.",
          },
        ],
      };

    default:
      return { for: [], etter: [] };
  }
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------

export function NormalizationVisualizer() {
  const [mode, setMode] = useState<Mode>("u-1nf");
  const [showAfter, setShowAfter] = useState(false);

  const data = useMemo(() => buildModeData(mode), [mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setShowAfter(false);
  };

  return (
    <section
      id="visualizer"
      className="mb-12 rounded-2xl border-2 border-brand/30 bg-card p-5"
     role="region" aria-label="Interaktiv visualisering: Normalisering">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            Interaktiv visualisering
          </div>
          <h2 className="text-xl font-semibold">
            Normaliseringsverkstedet — bygg om tabellene steg for steg
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Velg en overgang. Vis «før / etter» og se kolonner flyttes,
            duplikater forsvinne og hver FD havne i rett tabell.
          </p>
        </div>
      </div>

      {/* Modus-velger */}
      <div className="flex flex-wrap gap-2 mb-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs transition-colors text-left",
              mode === m.id
                ? "border-brand bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            <div className="font-semibold">{m.label}</div>
            <div className="text-[10px] opacity-80 mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>

      {/* Metafor-panel */}
      <div className="mb-5 rounded-lg border border-brand/30 bg-brand/5 p-3 flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <div className="text-sm">
          <strong className="text-brand">Metafor:</strong>{" "}
          <span className="text-foreground">{METAFORER[mode].kort}</span>
          <p className="text-xs text-muted-foreground mt-1">
            {METAFORER[mode].lang}
          </p>
        </div>
      </div>

      {/* Selve visualiseringen */}
      {mode === "fd" ? (
        <FdLab />
      ) : mode === "anomali" ? (
        <AnomaliDemo />
      ) : (
        <BeforeAfter
          data={data}
          showAfter={showAfter}
          onToggle={() => setShowAfter((v) => !v)}
        />
      )}

      {/* Fargeforklaring */}
      <Legend />
    </section>
  );
}

// --------------------------------------------------------------------------
// Før/Etter-visning brukt av de fire normalformene
// --------------------------------------------------------------------------

function BeforeAfter({
  data,
  showAfter,
  onToggle,
}: {
  data: { for: Table[]; etter: Table[]; join?: JoinDemo };
  showAfter: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "rounded-full px-3 py-1 border text-xs font-semibold transition-colors",
              !showAfter
                ? "border-destructive/50 bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground",
            )}
          >
            FØR
          </span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <span
            className={cn(
              "rounded-full px-3 py-1 border text-xs font-semibold transition-colors",
              showAfter
                ? "border-success/50 bg-success/10 text-success"
                : "border-border text-muted-foreground",
            )}
          >
            ETTER
          </span>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 rounded-lg border border-brand bg-brand text-white px-4 py-1.5 text-sm font-semibold hover:bg-brand/90 transition-colors"
        >
          {showAfter ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Vis FØR igjen
            </>
          ) : (
            <>
              Normaliser
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* FØR */}
        <div
          className={cn(
            "rounded-xl border-2 p-3 transition-all duration-500",
            !showAfter
              ? "border-destructive/40 bg-destructive/5"
              : "border-border bg-muted/20 opacity-60",
          )}
        >
          <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-2">
            Før — bryter normalformen
          </div>
          <div className="space-y-3">
            {data.for.map((t, i) => (
              <TabellView key={`for-${i}`} t={t} variant="before" />
            ))}
          </div>
        </div>

        {/* ETTER */}
        <div
          className={cn(
            "rounded-xl border-2 p-3 transition-all duration-500",
            showAfter
              ? "border-success/40 bg-success/5"
              : "border-border bg-muted/20 opacity-60",
          )}
        >
          <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-2">
            Etter — normalformen tilfredsstilt
          </div>
          <div
            className={cn(
              "space-y-3 transition-all duration-500",
              showAfter
                ? "translate-x-0 opacity-100"
                : "translate-x-2 opacity-40",
            )}
          >
            {data.etter.map((t, i) => (
              <TabellView key={`etter-${i}`} t={t} variant="after" />
            ))}
          </div>
        </div>
      </div>

      {data.join && (
        <JoinResultPanel join={data.join} visible={showAfter} />
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// JOIN-rekonstruksjon: vis at samme info kan hentes via SQL — ingen data tapt
// --------------------------------------------------------------------------

function JoinResultPanel({
  join,
  visible,
}: {
  join: JoinDemo;
  visible: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-4 rounded-xl border-2 p-3 transition-all duration-500",
        visible
          ? "border-brand/40 bg-brand/5 opacity-100"
          : "border-border bg-muted/20 opacity-50",
      )}
    >
      <div className="flex items-center gap-2 mb-3 text-[10px] uppercase tracking-wider text-brand font-semibold">
        <Database className="h-3.5 w-3.5" />
        {join.tittel}
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* SQL-spørringen */}
        <div className="rounded-lg border border-border bg-card p-3 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
            <span className="font-mono text-brand">SQL</span>
            <span>—</span>
            <span>JOIN mot de nye tabellene</span>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed whitespace-pre overflow-x-auto text-foreground">
            {join.sql}
          </pre>
        </div>

        {/* Resultat-tabell */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
            <TableProperties className="h-3 w-3" />
            Resultat — samme rader som FØR
          </div>
          <div className="overflow-x-auto">
            <table className="text-[11px] font-mono w-full">
              <thead className="bg-muted/40">
                <tr>
                  {join.resultKolonner.map((c) => (
                    <th
                      key={c}
                      className="px-2 py-1.5 text-left border-b border-border whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {join.resultRader.map((rad, ri) => (
                  <tr
                    key={ri}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    {rad.map((celle, ci) => (
                      <td key={ci} className="px-2 py-1 whitespace-nowrap">
                        {celle === null || celle === undefined
                          ? "—"
                          : String(celle)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-foreground/80 italic flex items-start gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
        <span>{join.poeng}</span>
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------
// Tabell-visning
// --------------------------------------------------------------------------

function TabellView({
  t,
  variant,
}: {
  t: Table;
  variant: "before" | "after";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card p-3 transition-all duration-500",
        t.ny && variant === "after"
          ? "border-success/50 shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
          : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h4 className="font-semibold text-xs flex items-center gap-2">
          {t.navn}
          {t.ny && variant === "after" && (
            <span className="inline-block rounded bg-success/15 text-success text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5">
              ny
            </span>
          )}
        </h4>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <KeyRound className="h-3 w-3 text-success" />
          PK = (
          <span className="text-success font-mono">{t.pk.join(", ")}</span>)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-[11px] font-mono w-full">
          <thead className="bg-muted/40">
            <tr>
              {t.kolonner.map((c) => {
                const isPk = t.pk.includes(c.name);
                const isFk = t.fk && c.name in t.fk;
                const isProblem =
                  variant === "before" && t.problem?.includes(c.name);
                return (
                  <th
                    key={c.name}
                    className={cn(
                      "px-2 py-1.5 text-left border-b border-border whitespace-nowrap relative",
                      isPk && "text-success",
                      c.role === "transitive" &&
                        !isPk &&
                        "text-amber-600 dark:text-amber-400",
                      c.role === "partial" &&
                        !isPk &&
                        "text-purple-600 dark:text-purple-400",
                      c.role === "candidate" && "text-cyan-600 dark:text-cyan-400",
                      isProblem &&
                        "bg-destructive/15 text-destructive line-through",
                    )}
                    title={isFk ? `FK → ${t.fk![c.name]}` : c.sub}
                  >
                    {c.name}
                    {isFk && (
                      <span className="ml-1 text-[8px] text-brand">FK</span>
                    )}
                    {c.sub && (
                      <div className="text-[8px] text-muted-foreground font-normal lowercase mt-0.5 normal-case italic">
                        {c.sub}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {t.rader.map((rad, ri) => (
              <tr
                key={ri}
                className="border-b border-border/60 last:border-b-0"
              >
                {rad.map((celle, ci) => {
                  const col = t.kolonner[ci];
                  const isProblem =
                    variant === "before" && t.problem?.includes(col?.name);
                  const isList =
                    typeof celle === "string" && celle.includes(",");
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-2 py-1 whitespace-nowrap transition-colors",
                        isProblem && "bg-destructive/10 text-destructive",
                        isList &&
                          variant === "before" &&
                          "ring-1 ring-destructive/40 rounded",
                      )}
                    >
                      {celle === null || celle === undefined
                        ? "—"
                        : String(celle)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {t.note && (
        <p
          className={cn(
            "mt-2 text-[11px] italic",
            variant === "before" && t.problem
              ? "text-destructive/80"
              : "text-muted-foreground",
          )}
        >
          {t.note}
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// FD-lab — klikkbar, beregner closure
// --------------------------------------------------------------------------

type Fd = { lhs: string[]; rhs: string[] };

const FD_COLS = [
  "ordreNr",
  "prodNr",
  "antall",
  "kundeNr",
  "kundeNavn",
  "postNr",
  "poststed",
];

const STANDARD_FDS: Fd[] = [
  { lhs: ["ordreNr", "prodNr"], rhs: ["antall"] },
  { lhs: ["ordreNr"], rhs: ["kundeNr"] },
  { lhs: ["kundeNr"], rhs: ["kundeNavn", "postNr"] },
  { lhs: ["postNr"], rhs: ["poststed"] },
  { lhs: ["prodNr"], rhs: ["prodNavn"] },
];

function computeClosure(seed: string[], fds: Fd[]): Set<string> {
  const out = new Set(seed);
  let changed = true;
  while (changed) {
    changed = false;
    for (const fd of fds) {
      if (fd.lhs.every((c) => out.has(c))) {
        for (const r of fd.rhs) {
          if (!out.has(r)) {
            out.add(r);
            changed = true;
          }
        }
      }
    }
  }
  return out;
}

function FdLab() {
  const [lhs, setLhs] = useState<string[]>(["ordreNr"]);

  const closure = useMemo(
    () => computeClosure(lhs, STANDARD_FDS),
    [lhs],
  );

  const toggle = (c: string) => {
    setLhs((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
    );
  };

  const isSuperkey = FD_COLS.every((c) => closure.has(c));

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-start gap-2 text-xs text-muted-foreground">
        <MousePointerClick className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Klikk kolonner under for å bygge venstresiden av en FD. Vi viser
          attributt-closure (alt som kan utledes) — og om utvalget er
          superkey.
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FD_COLS.map((c) => {
          const isSelected = lhs.includes(c);
          const isDerived = !isSelected && closure.has(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-mono transition-all duration-300",
                isSelected &&
                  "border-brand bg-brand text-white shadow-md scale-105",
                isDerived &&
                  "border-success/60 bg-success/15 text-success",
                !isSelected &&
                  !isDerived &&
                  "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <div className="text-xs font-mono mb-2">
          <span className="text-brand font-bold">
            {"{ " + (lhs.length ? lhs.join(", ") : "∅") + " }"}
          </span>
          <span className="mx-1.5">⁺ =</span>
          <span className="text-success font-bold">
            {"{ " + Array.from(closure).join(", ") + " }"}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          {lhs.length === 0
            ? "Velg minst én kolonne for å starte."
            : isSuperkey ? (
              <span className="text-success font-semibold">
                Superkey: bestemmer alle attributter.
                {lhs.length === 1
                  ? " Sannsynligvis også kandidatnøkkel."
                  : " Sjekk om noe mindre også bestemmer alt — da er dette ikke minimalt."}
              </span>
            ) : (
              <>
                Ikke superkey — disse manglet:{" "}
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  {FD_COLS.filter((c) => !closure.has(c)).join(", ")}
                </span>
              </>
            )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Aktive FD-er
        </div>
        <ul className="space-y-1 text-xs font-mono">
          {STANDARD_FDS.map((fd, i) => {
            const fires = fd.lhs.every((c) => closure.has(c));
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded px-2 py-1 transition-colors",
                  fires
                    ? "bg-success/10 text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <span className="text-brand">{fd.lhs.join(", ")}</span>
                <ArrowRight className="h-3 w-3" />
                <span className={cn(fires && "text-success font-semibold")}>
                  {fd.rhs.join(", ")}
                </span>
                {fires && (
                  <CheckCircle2 className="h-3 w-3 text-success ml-auto" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Anomali-demo
// --------------------------------------------------------------------------

type AnomaliRow = { ordreNr: number; prodNr: number; prodNavn: string; prodPris: number };

const INIT_ANOMALI: AnomaliRow[] = [
  { ordreNr: 1001, prodNr: 50, prodNavn: "Te", prodPris: 49 },
  { ordreNr: 1001, prodNr: 51, prodNavn: "Kaffe", prodPris: 89 },
  { ordreNr: 1002, prodNr: 50, prodNavn: "Te", prodPris: 49 },
  { ordreNr: 1003, prodNr: 50, prodNavn: "Te", prodPris: 49 },
];

function AnomaliDemo() {
  const [rows, setRows] = useState<AnomaliRow[]>(INIT_ANOMALI);
  type LogEntry = { type: "ok" | "feil"; tekst: string };
  const [log, setLog] = useState<LogEntry[]>([]);
  const [highlight, setHighlight] = useState<number[]>([]);

  const reset = () => {
    setRows(INIT_ANOMALI);
    setLog([]);
    setHighlight([]);
  };

  const flashRows = (idxs: number[]) => {
    setHighlight(idxs);
    setTimeout(() => setHighlight([]), 1200);
  };

  // OPPDATERING — endre prisen på Te bare på én rad (typisk feil)
  const updateLazy = () => {
    const idx = rows.findIndex((r) => r.prodNavn === "Te");
    if (idx === -1) return;
    const next = [...rows];
    next[idx] = { ...next[idx], prodPris: 55 };
    setRows(next);
    flashRows([idx]);
    const entry: LogEntry = {
      type: "feil",
      tekst:
        "Oppdaterings-anomali: bare én rad endret. Te koster nå både 49 og 55 i databasen. Inkonsistent.",
    };
    setLog((l) => [entry, ...l].slice(0, 6));
  };

  // OPPDATERING — gjør det riktig
  const updateAll = () => {
    const idxs: number[] = [];
    const next = rows.map((r, i) => {
      if (r.prodNavn === "Te") {
        idxs.push(i);
        return { ...r, prodPris: 55 };
      }
      return r;
    });
    setRows(next);
    flashRows(idxs);
    const entry: LogEntry = {
      type: "ok",
      tekst: `UPDATE OK, men måtte treffe ${idxs.length} rader. I 3NF hadde det vært 1 rad i Produkt.`,
    };
    setLog((l) => [entry, ...l].slice(0, 6));
  };

  // SLETTING — slett siste ordre med Kaffe → mister Kaffe-info helt
  const deleteLastKaffe = () => {
    const kaffeIdx = rows.findIndex((r) => r.prodNavn === "Kaffe");
    if (kaffeIdx === -1) return;
    const next = rows.filter((_, i) => i !== kaffeIdx);
    setRows(next);
    flashRows([]);
    const entry: LogEntry = {
      type: "feil",
      tekst:
        "Slettings-anomali: vi slettet ordrelinja for Kaffe, og Kaffe forsvant helt fra databasen — selv om produktet finnes.",
    };
    setLog((l) => [entry, ...l].slice(0, 6));
  };

  // INNSETTING — prøv å legge inn nytt produkt uten ordrelinje
  const insertProduct = () => {
    const entry: LogEntry = {
      type: "feil",
      tekst:
        "Innsettings-anomali: kan ikke registrere et nytt produkt før noen bestiller det — PK krever (ordreNr, prodNr). Produkt-info trenger sin egen tabell.",
    };
    setLog((l) => [entry, ...l].slice(0, 6));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Tabell + knapper */}
      <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-2">
          OrdreLinje (unormalisert — bryter 2NF)
        </div>
        <table className="text-xs font-mono w-full mb-3">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-2 py-1.5 text-left text-success">ordreNr</th>
              <th className="px-2 py-1.5 text-left text-success">prodNr</th>
              <th className="px-2 py-1.5 text-left">prodNavn</th>
              <th className="px-2 py-1.5 text-left">prodPris</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={`${r.ordreNr}-${r.prodNr}-${i}`}
                className={cn(
                  "border-b border-border/60 last:border-b-0 transition-colors duration-700",
                  highlight.includes(i) && "bg-amber-500/30",
                )}
              >
                <td className="px-2 py-1">{r.ordreNr}</td>
                <td className="px-2 py-1">{r.prodNr}</td>
                <td className="px-2 py-1">{r.prodNavn}</td>
                <td className="px-2 py-1">{r.prodPris}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-3 text-center text-muted-foreground italic"
                >
                  (tom)
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={updateLazy}
            className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1.5 text-[11px] font-semibold hover:bg-amber-500/20"
          >
            <Pencil className="h-3 w-3" />
            UPDATE 1 rad (Te → 55)
          </button>
          <button
            onClick={updateAll}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] hover:bg-accent"
          >
            <Pencil className="h-3 w-3" />
            UPDATE ALLE (Te → 55)
          </button>
          <button
            onClick={deleteLastKaffe}
            className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1.5 text-[11px] font-semibold hover:bg-amber-500/20"
          >
            <Trash2 className="h-3 w-3" />
            DELETE eneste Kaffe-rad
          </button>
          <button
            onClick={insertProduct}
            className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-1.5 text-[11px] font-semibold hover:bg-amber-500/20"
          >
            <Plus className="h-3 w-3" />
            INSERT nytt produkt (uten ordre)
          </button>
        </div>
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-[11px] hover:bg-accent"
        >
          <RotateCcw className="h-3 w-3" />
          Tilbakestill tabell
        </button>
      </div>

      {/* Log */}
      <div className="rounded-xl border border-border bg-background p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Hva som skjedde
        </div>
        {log.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Klikk en operasjon til venstre. Du vil se hvorfor redundansen
            koster — selv på 4 rader.
          </p>
        ) : (
          <ul className="space-y-2">
            {log.map((entry, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-md border p-2 text-xs",
                  entry.type === "feil"
                    ? "border-destructive/40 bg-destructive/5 text-foreground"
                    : "border-success/40 bg-success/5 text-foreground",
                )}
              >
                {entry.type === "feil" ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                )}
                <span>{entry.tekst}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-2.5 text-[11px] text-foreground">
          <strong className="text-brand">Lærdom:</strong> alle anomaliene
          forsvinner når Produkt-info bor i egen tabell. Det er hele poenget
          med 2NF/3NF.
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Fargeforklaring
// --------------------------------------------------------------------------

function Legend() {
  const items: { label: string; klass: string }[] = [
    { label: "PK / kandidatnøkkel", klass: "bg-success/15 text-success" },
    { label: "FK", klass: "bg-brand/15 text-brand" },
    {
      label: "Partiell avhengighet",
      klass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Transitiv avhengighet",
      klass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
    {
      label: "Overlappende kandidat",
      klass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Bryter regelen",
      klass: "bg-destructive/15 text-destructive",
    },
  ];
  return (
    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2 text-[10px]">
      {items.map((it) => (
        <span
          key={it.label}
          className={cn("rounded-full px-2 py-0.5", it.klass)}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}

// Silence: kept for parity with reference visualizer scaffolding.
export { UNORM_COLS, UNORM_ROWS };
