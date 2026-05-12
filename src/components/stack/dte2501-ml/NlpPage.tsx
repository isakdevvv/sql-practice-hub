import { Link } from "@tanstack/react-router";
import { Lightbulb, MessageSquare } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva er NLP?", anchor: "intro" },
  { title: "Tokenisering, stemming, lemmatisering", anchor: "tokens" },
  { title: "Bag-of-words", anchor: "bow" },
  { title: "TF-IDF", anchor: "tfidf" },
  { title: "Word embeddings — Word2Vec, GloVe", anchor: "embeddings" },
  { title: "Tekst-klassifikasjon", anchor: "classify" },
  { title: "Pseudokode + sklearn", anchor: "code" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function NlpPage() {
  return (
    <StackPageShell title="Natural Language Processing" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · NLP
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            NLP — å lære maskiner å lese
          </h1>
          <p className="mt-3 text-muted-foreground">
            Tekst er ikke tall. Hele NLP handler om hvordan vi forvandler ord til
            vektorer ML-modeller kan jobbe med. Vi går fra det enkleste
            (bag-of-words) til moderne embeddings.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> ord → tokens → vektorer
              → ML-modell. Hvert steg gir tap (eller ny info).
            </div>
          </div>
        </div>

        <CourseOutline courseId="dte2501-nlp" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva er NLP?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            NLP (Natural Language Processing) er fagfeltet som behandler tekst
            (og tale) med datamaskiner. Typiske oppgaver:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klassifikasjon:     spam vs ikke-spam, sentiment (pos/neg)
Sekvens-merking:    Named Entity Recognition (NER), POS-tagging
Generering:         oversettelse, oppsummering, chat
Søk / matching:     informationsgjenfinning, similaritet
Spørsmål-svar:      QA-systemer

Felles utfordring: tekst er DISKRET og VARIABEL lengde.
Vi må omforme den til faste vektorer.`}</pre>
          </div>
        </section>

        <section id="tokens" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Tokenisering, stemming, lemmatisering</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`TOKENISERING — del tekst i tokens (typisk ord):
    "Hunden løper raskt!"
        → ["Hunden", "løper", "raskt", "!"]

Komplikasjoner:
    - Apostrofer: "don't" → ["do", "n't"] eller ["don't"]?
    - Sammensatte ord (norsk): "tannlegekontor"?
    - Punktum i forkortelser: "Dr. Hansen kom kl. 10."

STEMMING — kutt av endelser, regel-basert:
    løper, løpe, løpt → "løp"
    studying, studies, student → "studi" (engelsk Porter-stemmer)

LEMMATISERING — slå opp grunnform i ordbok:
    bedre → "god"
    var → "være"
    løp → "løpe"

Lemmatisering er bedre, men krever ordbok (NLTK WordNet, spaCy).
Stemming er rask og «good enough» for søk og BoW.

STOPPORD — fjern «og, i, eller, å, det» — gir lite signal.
NORMALISERING — lowercase, fjern punktum, fjern emojis...

Pipeline: raw text → lowercase → split → fjern stoppord → stem/lem`}</pre>
          </div>
        </section>

        <section id="bow" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bag-of-words</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den eldste vektoriseringen. Tell hvor mange ganger hvert ord forekommer
            — ignorer rekkefølge.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Korpus (treningsdokumenter):
    D1: "katten sover"
    D2: "hunden løper, katten løper"
    D3: "hunden sover"

Vokabular V = {katten, sover, hunden, løper}    |V| = 4

BoW-matrise (rader = dokumenter, kolonner = ord):

          katten  sover  hunden  løper
    D1 :    1       1      0      0
    D2 :    1       0      1      2
    D3 :    0       1      1      0

Hvert dokument → vektor i ℝ^|V|. ML-modeller jobber med dette.

Begrensninger:
   - Mister rekkefølge: «hunden biter mannen» = «mannen biter hunden»
   - Mister kontekst: «ikke god» = «god» + «ikke»
   - Sparse: vokabular på 50 000 ord → mest 0-er
   - Ingen semantikk: «bil» og «kjøretøy» er like fjerne som «bil» og «pizza»`}</pre>
          </div>
        </section>

        <section id="tfidf" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. TF-IDF</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bag-of-words vekter alle ord likt. «og» som forekommer 100 ganger
            drukner «kvantefysikk». TF-IDF retter dette.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`TF — Term Frequency:
    tf(t, d) = #(t i d)        eller normalisert: #(t)/|d|

IDF — Inverse Document Frequency:
                    N
    idf(t) = log ──────────────
                  df(t) + 1
    der N = antall dokumenter, df(t) = #dok der t forekommer

TF-IDF = tf · idf

Intuisjon:
    - Ord som er VANLIGE i ÉTT dokument får høy tf
    - Ord som er SJELDNE på tvers av dokumenter får høy idf
    - "og" → høy tf, men IDF ≈ 0 (forekommer overalt) → nedvekt
    - "kvantefysikk" → kanskje tf=2, men IDF høy → høy TF-IDF

I sklearn:
    from sklearn.feature_extraction.text import TfidfVectorizer
    v = TfidfVectorizer(stop_words="english")
    X = v.fit_transform(["doc1 text...", "doc2 text..."])`}</pre>
          </div>
        </section>

        <section id="embeddings" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Word embeddings — Word2Vec, GloVe</h2>
          <p className="text-sm text-muted-foreground mb-4">
            BoW gir 0/1-vektor med 50 000 dimensjoner. Word embeddings gir en{" "}
            <em>tett</em> vektor i 100-300 dimensjoner — der lignende ord ligger
            nær hverandre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Distributional hypothesis (Firth, 1957):
   «Du kjenner ord på selskapet det holder.»
   Ord som forekommer i lignende kontekster → lignende mening.

WORD2VEC (Mikolov et al., 2013):
   Tren et lite nevralt nett på «predikér naboordene» (skip-gram)
   eller «predikér målordet fra naboene» (CBOW). Vektene i den
   skjulte laget BLIR ordvektorene.

GloVe (Pennington et al., 2014):
   Faktoriser global co-occurrence-matrise. Annen matematisk
   tilnærming, lignende resultat.

Magisk egenskap:
    vec("konge") − vec("mann") + vec("kvinne") ≈ vec("dronning")

Embeddings gir oss:
    - tette 300-dim vektorer (mot 50 000 sparse for BoW)
    - semantisk likhet via cosine-similarity
    - transferlæring — last ned forhåndstrente vektorer (GoogleNews,
      norske: NorBERT, NB-BERT) og bruk direkte

Begrensning: hver ord har EN vektor — kan ikke skille polysemi
("bank" = pengeinstitusjon vs elvebredd). Løses av transformers/BERT.`}</pre>
          </div>
        </section>

        <section id="classify" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Tekst-klassifikasjon</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vanligste praktiske NLP-task. Pipeline:
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Eksempel: spam-detection

raw email text
    │
    ▼
tokenisering + normalisering + stoppord-fjerning
    │
    ▼
TF-IDF vektorisering (eller embeddings)
    │
    ▼
klassifikator (logistic regression / naive Bayes / SVM / NN)
    │
    ▼
P(spam | text) — terskel 0.5 → spam/ikke-spam

Naive Bayes er klassisk her — bygger på Bayes' teorem og
betinget uavhengighet (se "Bayes"-trinnet under klassisk-AI).
Forutsetter at hver feature (ord) er uavhengig gitt klassen.

Andre populære oppgaver:
   - Sentiment (positiv/negativ/nøytral)
   - Topic classification (sport/politikk/økonomi)
   - Spam-filter
   - Språkdeteksjon`}</pre>
          </div>
        </section>

        <section id="code" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Pseudokode + sklearn</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report

# 20-newsgroups: standard NLP-benchmark
from sklearn.datasets import fetch_20newsgroups
data = fetch_20newsgroups(
    subset="train",
    categories=["sci.med", "comp.graphics"]
)

pipe = make_pipeline(
    TfidfVectorizer(stop_words="english", ngram_range=(1, 2)),
    MultinomialNB()
)
pipe.fit(data.data, data.target)
preds = pipe.predict(["The patient has a fever"])
print(data.target_names[preds[0]])     # → "sci.med"`}</pre>
          </div>
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Forskjell på stemming og lemmatisering?»</strong>{" "}
              Stemming = regel-basert ord-kutting. Lemmatisering = slå opp grunnform
              i ordbok. Lemmatisering er mer korrekt, stemming er raskere.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor TF-IDF i stedet for BoW?»</strong>{" "}
              For å nedvekte vanlige ord («og, det, i») og oppvekte spesifikke
              («kvantefysikk») som faktisk skiller dokumenter.
            </li>
            <li>
              <strong className="text-foreground">«Hva er fordelen med embeddings?»</strong>{" "}
              Semantisk likhet — lignende ord ligger nær i vektorrommet. Tette
              vektorer (300-dim) i stedet for sparse (50 000).
            </li>
            <li>
              <strong className="text-foreground">«Hva gjør distributional hypothesis?»</strong>{" "}
              Sier at ord som forekommer i lignende kontekster har lignende mening
              — fundamentet for alle moderne embeddings.
            </li>
            <li>
              <strong className="text-foreground">«Begrensning ved Word2Vec?»</strong>{" "}
              Hver token har ÉN vektor — kan ikke skille polysemi («bank»). Løst av
              kontekstuelle modeller (BERT, GPT).
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "bayes" }} className="text-brand hover:underline">
                Bayes (klassisk-AI-sporet)
              </Link>{" "}
              for naive Bayes-klassifikatoren i mer detalj.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2501-pca" }} className="text-brand hover:underline">
                PCA
              </Link>{" "}
              som måte å redusere TF-IDF-dimensjonen.
            </li>
            <li>
              Drag-øvelser med topic «NLP».
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
