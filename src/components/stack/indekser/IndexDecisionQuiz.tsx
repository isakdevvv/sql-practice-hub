import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

/**
 * IndexDecisionQuiz — 8 scenarier. Brukeren velger riktig indeksstrategi,
 * får forklart hvorfor.
 *
 * Pedagogisk: dette er testen som binder sammen alle indeks-konseptene —
 * leftmost-prefix, covered, kardinalitet, tradeoffs ved skriving.
 */

type Option = { id: string; label: string };

type Scenario = {
  id: string;
  prompt: string;
  context: string;
  options: Option[];
  correct: string;
  explain: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "olap",
    prompt: "Rapport-tungt OLAP-system",
    context:
      "Datavarehus med 500M rader. Lite skriving (nattlige batcher). Brukere kjører ad-hoc rapporter med SUM/AVG/GROUP BY på 5-7 ulike kolonne-kombinasjoner.",
    options: [
      { id: "a", label: "Bare PK + én indeks på dato" },
      { id: "b", label: "Covered composite-indekser for hver rapport-mønster" },
      { id: "c", label: "Ingen indekser — la systemet kjøre seq scan" },
      { id: "d", label: "Bitmap-indekser kun på de største tekst-kolonnene" },
    ],
    correct: "b",
    explain:
      "Lite skriving + dyre rapporter = optimal arena for store covered composite-indekser. Index Only Scan på de tunge rapportene kutter disk-I/O drastisk. Writes lider, men kjøres nattlig så ingen merker det.",
  },
  {
    id: "oltp",
    prompt: "INSERT-tungt OLTP — sensor-strøm",
    context:
      "IoT-system: 50 000 INSERTs per sekund inn i 'measurement'-tabellen. Reads er sjeldne (debug/oversikt). Tabellen vokser ~100 GB per dag.",
    options: [
      { id: "a", label: "PK + 5 indekser så vi 'er forberedt' for ad-hoc reads" },
      { id: "b", label: "Kun PK (event_id). Eventuelt én tidsserie-indeks på (sensor, ts)." },
      { id: "c", label: "Covered indeks med alle kolonner" },
      { id: "d", label: "Hash-indeks på alle kolonner" },
    ],
    correct: "b",
    explain:
      "Hver indeks må oppdateres for hver INSERT — 5 indekser betyr 5x flere disk-skriv. Hold antall indekser nede. Hvis du virkelig trenger sensor+tid-spørringer, legg én composite-indeks, ikke flere.",
  },
  {
    id: "searchbox",
    prompt: "Søkeboks med likhet + range",
    context:
      "Webapp lar brukere søke produkter på kategori (likhet) OG prisinterval. Avgrenset til ca 50 kategorier, priser 0-100k.",
    options: [
      { id: "a", label: "Hash på category, B-tree på price (to separate indekser)" },
      { id: "b", label: "B-tree composite på (category, price)" },
      { id: "c", label: "Bitmap på begge" },
      { id: "d", label: "Ingen indeks — bare cache resultatet" },
    ],
    correct: "b",
    explain:
      "Composite (category, price) treffer både likhet på første kolonne og range på andre. Hash kan ikke kombineres effektivt med range. Bitmap er upraktisk for ulike kombinasjoner. (a) krever bitmap-AND mellom to indekser — fungerer, men er som regel mindre effektivt enn ett composite-scan.",
  },
  {
    id: "lowcard",
    prompt: "Stor lav-kardinalitet-kolonne",
    context:
      "Tabellen har 10M rader og en 'status'-kolonne med 4 mulige verdier (paid/shipped/refunded/cancelled). Vanlige queries: WHERE status = 'paid'.",
    options: [
      { id: "a", label: "B-tree på status" },
      { id: "b", label: "Hash på status" },
      { id: "c", label: "Bitmap på status (eller bruk Postgres' BRIN ved tidsserie-ordnet data)" },
      { id: "d", label: "Ingen indeks" },
    ],
    correct: "c",
    explain:
      "Lav-kardinalitet er klassisk bitmap-territorium: 4 bits per rad = 40M bits = 5 MB. Kompakt og rask AND/OR. B-tree fungerer også, men bruker mer plass. Bitmap er sjeldnere i OLTP — sjekk hva DB-en din støtter.",
  },
  {
    id: "leftmost",
    prompt: "Leftmost-prefix-felle",
    context:
      "Du har indeks (last_name, first_name, age). En ny rapport-spørring filtrerer på WHERE first_name = 'Kari'. Den er treg.",
    options: [
      {
        id: "a",
        label: "Indeksen brukes — første kolonne i WHERE matcher første kolonne i indeksen",
      },
      { id: "b", label: "Indeksen brukes ikke effektivt — first_name står ikke først" },
      { id: "c", label: "Indeksen brukes via 'index skip scan' og det går alltid raskt" },
      { id: "d", label: "Indeksen brukes fordi first_name er den nest mest selektive" },
    ],
    correct: "b",
    explain:
      "Leftmost-prefix-regelen: en B-tree-indeks er sortert leksikografisk. Hopper du over første kolonne (last_name), kan DB ikke navigere ned i treet effektivt. Løsning: bygg én ny indeks (first_name), eller omarranger composite-en.",
  },
  {
    id: "covering",
    prompt: "Heap-fetch dominerer kosten",
    context:
      "Spørring: SELECT user_id, score FROM ranking WHERE league = 'gold'. Indeks finnes på (league), men EXPLAIN viser at 95% av tiden brukes på Heap Fetches.",
    options: [
      {
        id: "a",
        label:
          "Legg til ny indeks (league, user_id, score) eller (league) INCLUDE (user_id, score)",
      },
      { id: "b", label: "Slett alle indekser og kjør seq scan" },
      { id: "c", label: "Bytt til hash-indeks på league" },
      { id: "d", label: "Lag tre separate indekser, én per kolonne" },
    ],
    correct: "a",
    explain:
      "En covered indeks (composite eller INCLUDE) lar DB svare direkte fra indeksen → Index Only Scan, ingen heap-fetch. Trade-off: indeksen blir litt større, men du kutter random I/O.",
  },
  {
    id: "smalltable",
    prompt: "Liten tabell",
    context:
      "Oppslagstabell 'land' med 200 rader. Du legger til CREATE INDEX idx_land_kode på (kode). EXPLAIN viser fortsatt Seq Scan.",
    options: [
      { id: "a", label: "Planneren har en bug — bytt DB" },
      {
        id: "b",
        label: "200 rader = 1-2 pages. Seq scan er raskere enn å hoppe gjennom indeksen.",
      },
      { id: "c", label: "Du må kjøre VACUUM før indeksen virker" },
      { id: "d", label: "Hash-indeks ville løst det" },
    ],
    correct: "b",
    explain:
      "Indekser har overhead (extra disk-hopp, tre-traversering). Når hele tabellen ligger på 1-2 pages, er seq scan O(n) faktisk billigere. Optimisten velger bevisst seq scan — som forventet.",
  },
  {
    id: "function",
    prompt: "Funksjon på indekskolonne",
    context:
      "Indeks finnes på Bruker(epost). Spørring: WHERE LOWER(epost) = 'kari@b.no'. EXPLAIN viser Seq Scan.",
    options: [
      { id: "a", label: "Slett indeksen og lag den på nytt" },
      {
        id: "b",
        label:
          "Indeksen er bygd på rådata. LOWER() bryter den. Lag en funksjons-indeks: CREATE INDEX ... ON Bruker (LOWER(epost)).",
      },
      { id: "c", label: "Bytt til hash-indeks" },
      { id: "d", label: "VACUUM ANALYZE løser det" },
    ],
    correct: "b",
    explain:
      "Funksjons- eller cast-anrop på indekskolonnen dropper indeksen, fordi DB ikke kan regne baklengs. Løsninger: lagre kolonnen normalisert (alltid lowercase), bruk citext-typen, eller lag en funksjons-indeks som forhåndsberegner LOWER().",
  },
];

export function IndexDecisionQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const answer = (sid: string, oid: string) => {
    setAnswers((a) => ({ ...a, [sid]: oid }));
    setRevealed((r) => ({ ...r, [sid]: true }));
  };

  const reset = () => {
    setAnswers({});
    setRevealed({});
  };

  const score = useMemo(() => {
    let s = 0;
    for (const sc of SCENARIOS) {
      if (revealed[sc.id] && answers[sc.id] === sc.correct) s++;
    }
    return s;
  }, [answers, revealed]);

  const totalAnswered = Object.keys(revealed).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="font-semibold">Quiz: velg riktig indeksstrategi</h3>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          Score: {score}/{totalAnswered || "0"}
        </span>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-border hover:bg-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Nullstill
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        8 scenarier. Velg svaret du tror er best — riktig svar + forklaring vises umiddelbart.
      </p>

      <div className="space-y-3">
        {SCENARIOS.map((sc, i) => {
          const picked = answers[sc.id];
          const isRev = revealed[sc.id];
          return (
            <div key={sc.id} className="rounded-lg border border-border bg-background p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Scenario {i + 1}: {sc.prompt}
              </div>
              <p className="text-sm mb-3">{sc.context}</p>
              <div className="space-y-1.5">
                {sc.options.map((opt) => {
                  const isPicked = picked === opt.id;
                  const isCorrect = opt.id === sc.correct;
                  const showCorrect = isRev && isCorrect;
                  const showWrong = isRev && isPicked && !isCorrect;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isRev}
                      onClick={() => answer(sc.id, opt.id)}
                      className={`w-full text-left text-xs px-3 py-2 rounded border flex items-start gap-2 transition-colors ${
                        showCorrect
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : showWrong
                            ? "border-rose-500/40 bg-rose-500/10"
                            : isRev
                              ? "border-border bg-muted/30 opacity-70"
                              : "border-border hover:bg-muted"
                      }`}
                    >
                      <span className="font-mono text-xs mt-0.5">{opt.id})</span>
                      <span className="flex-1">{opt.label}</span>
                      {showCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      {showWrong && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {isRev && (
                <div className="mt-3 rounded border border-brand/30 bg-brand/5 p-3 text-xs">
                  <strong>Hvorfor:</strong> {sc.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
