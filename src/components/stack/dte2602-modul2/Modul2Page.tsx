import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Database, Scaling, Sparkles, Workflow } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { FASE2_OPPGAVER } from "@/lib/dte2602/oppgaverFase2";
import {
  ModusVelger,
  OppgaveModusProvider,
  useOppgaveModusState,
} from "@/components/stack/dte2602-oppgaver/OppgaveModus";
import { AnslagListe } from "@/components/stack/dte2602-oppgaver/AnslagListe";
import { MaloppgaveListe } from "@/components/stack/dte2602-oppgaver/MaloppgaveListe";
import { FeilsokingListe } from "@/components/stack/dte2602-oppgaver/FeilsokingListe";
import { RecallListe } from "@/components/stack/dte2602-oppgaver/RecallListe";
import { XogYVelger } from "./XogYVelger";
import { SkaleringNaboSim } from "./SkaleringNaboSim";

// ---------------------------------------------------------------------------
// DTE-2602 Modul 2 — Fase 2: Data og features.
//
// Atomene fasen dekker (plan-dte-2602.md): A04 features og target, A05 numerisk
// mot kategorisk, A06 manglende verdier, A07 skalering, A08 one-hot encoding,
// A09 utforskende dataanalyse.
//
// Fasen forutsetter Fase 1 og bygger direkte videre på ordforrådet derfra:
// eksempel, fasit, supervised, target, feature, baseline. Nye termer innføres
// i rekkefølgen kolonne → kardinalitet → manglende verdi → imputering →
// skalering → one-hot encoding → datalekkasje → pipeline, og ingen brukes før
// den er forklart.
//
// Datalekkasje er tyngdepunktet: fem feilsøkingsoppgaver, alle med en reell
// lekkasje, fordi det er den feilen sensor leter etter i mappeinnleveringen.
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Anslå — før du leser", anchor: "anslag" },
  { title: "X og y (interaktiv)", anchor: "sim-xy" },
  { title: "Tall eller kategori", anchor: "kolonnetyper" },
  { title: "Hull i dataene", anchor: "manglende" },
  { title: "Skalering (interaktiv)", anchor: "sim-skalering" },
  { title: "One-hot encoding", anchor: "onehot" },
  { title: "Rekkefølgen og lekkasje", anchor: "lekkasje" },
  { title: "Måloppgaver", anchor: "maloppgaver" },
  { title: "Feilsøking", anchor: "feilsoking" },
  { title: "Recall-kort", anchor: "recall" },
];

export function Modul2Page() {
  const [modus, setModus] = useOppgaveModusState();
  const o = FASE2_OPPGAVER;

  return (
    <StackPageShell title="DTE-2602 Modul 2 — Data og features" group="eksamen">
      <OppgaveModusProvider modus={modus}>
        <article className="container mx-auto max-w-3xl px-4 py-10">
          <header className="mb-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
              DTE-2602 · Fase 2 av 7
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Data og features</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Rådata er nesten aldri klart til bruk. Denne modulen handler om veien fra en tabell
              som kom ut av en database til noe en algoritme kan lære av — og om hvorfor{" "}
              <em>rekkefølgen</em> på den jobben avgjør om resultatet ditt er ekte eller innbilt.
            </p>

            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Bygger på Modul 1.</span> Vi bruker uten
              videre forklaring: eksempel, fasit, supervised, target (y), feature (X), regresjon,
              klassifikasjon og baseline. Er noen av dem uklare, ta{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-modul1" }}
                className="text-brand underline underline-offset-2"
              >
                Modul 1
              </Link>{" "}
              først — resten av faget hviler på dem.
            </div>

            <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
              <strong className="text-foreground">Modulens ene store idé:</strong> alt du gjør med
              dataene før modellen ser dem, skal læres av treningsdataene alene. Bryter du den
              regelen, får du bedre tall og en dårligere modell. Det heter <em>datalekkasje</em>, og
              de fem feilsøkingsoppgavene nederst er fem forskjellige måter å gjøre nettopp den
              feilen på.
            </div>
          </header>

          <CourseOutline courseId="dte2602-modul2" steps={STEPS} />

          <div className="mt-8">
            <ModusVelger modus={modus} setModus={setModus} />
          </div>

          {/* --- Type 1: anslå-så-sjekk ----------------------------------- */}
          <section id="anslag" className="mb-12 mt-10 scroll-mt-28">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              <Compass className="h-5 w-5 text-brand" /> Anslå først — før du leser
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Seks spørsmål om forbehandling. Flere av dem har svar som strider mot magefølelsen, og
              det er nettopp derfor de står her og ikke etter forklaringen.
            </p>
            <AnslagListe oppgaver={o.anslag} />
          </section>

          {/* --- Forklaring + simuleringer -------------------------------- */}
          <section id="sim-xy" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Database className="h-5 w-5 text-brand" /> Fra tabell til X og y
            </h2>
            <p className="mb-3 leading-relaxed">
              I Modul 1 ble <strong>target</strong> (y) og <strong>feature</strong> (X) innført som
              «det du vil forutsi» og «det du forutsier med». Den definisjonen er riktig, men for
              løs til å bruke på en ekte tabell. Den presise versjonen har med tid:
            </p>
            <ul className="mb-4 space-y-2 pl-5 text-sm leading-relaxed">
              <li className="list-disc">
                En <strong>target</strong> er ukjent på prediksjonstidspunktet, kjent i de
                historiske dataene, og utfylt for de aller fleste radene.
              </li>
              <li className="list-disc">
                En <strong>feature</strong> er kjent i det øyeblikket du trenger svaret. Ikke
                «finnes i databasen» — kjent <em>da</em>.
              </li>
            </ul>
            <p className="mb-4 leading-relaxed">
              Prøv det på et datasett som er laget for å friste. Tre av kolonnene skal ikke være
              med, av tre helt forskjellige grunner.
            </p>
            <XogYVelger />
          </section>

          <section id="kolonnetyper" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 text-xl font-semibold">Tall, kategori — og kardinalitet</h2>
            <p className="leading-relaxed">
              Kolonner deles i to slag, og de behandles ulikt hele veien. <strong>Numeriske</strong>{" "}
              kolonner inneholder tall der størrelsen betyr noe: alder, pris, antall.{" "}
              <strong>Kategoriske</strong> kolonner inneholder merkelapper: by, abonnementstype,
              farge.
            </p>
            <p className="mt-3 leading-relaxed">
              Fella er kolonner som <em>ser ut</em> som tall uten å være det. Postnummer 0150 og
              9008 er merkelapper — det er ingen mening i at 9008 er «større enn» 0150, og slett
              ingen i at gjennomsnittet av dem er 4579. Behandler du dem som tall, lærer modellen en
              rangering som ikke finnes.
            </p>
            <p className="mt-3 leading-relaxed">
              Det avgjørende tallet for en kategorisk kolonne er <strong>kardinaliteten</strong>:
              hvor mange <em>ulike</em> verdier den har. «By» med 8 verdier og «postnummer» med
              rundt 5 000 er samme type kolonne, men helt forskjellige problemer — og det er
              kardinaliteten som avgjør hvilken forbehandling som er mulig.
            </p>
          </section>

          <section id="manglende" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 text-xl font-semibold">Hull i dataene</h2>
            <p className="leading-relaxed">
              En manglende verdi vises som <strong>NaN</strong> (Not a Number — markøren for at det
              ikke står noe her). De fleste algoritmer nekter å kjøre med NaN i dataene, så du må ta
              et valg. Det finnes tre, og de er ikke likeverdige:
            </p>
            <ul className="mt-3 space-y-2.5 pl-5 text-sm leading-relaxed">
              <li className="list-disc">
                <strong>Slette radene</strong> med hull. Trygt hvis hullene er få og tilfeldig
                fordelt. Farlig ellers: mangler alderen oftere hos de yngste, sletter du systematisk
                bort en gruppe, og datasettet ditt beskriver ikke lenger virkeligheten.
              </li>
              <li className="list-disc">
                <strong>Fylle ut</strong> (imputere) med et representativt tall. Median er
                standardvalget framfor gjennomsnitt, fordi medianen ikke lar seg dra av noen få
                ekstreme verdier. For kategoriske kolonner brukes den hyppigste verdien.
              </li>
              <li className="list-disc">
                <strong>Fylle ut med 0.</strong> Nesten alltid galt: 0 er en påstand om verdien,
                ikke en markering av at den mangler. En inntekt på 0 kroner betyr noe helt annet enn
                «ukjent inntekt».
              </li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Ett grep som er verdt poeng i mappa: legg til en ekstra 0/1-kolonne som sier{" "}
              <em>at</em> verdien manglet, i tillegg til å fylle ut. At noe mangler er ofte i seg
              selv et signal — den som ikke oppga inntekt gjorde kanskje det av en grunn. Da får
              modellen begge deler, i stedet for at informasjonen om hullet forsvinner i
              utfyllingen.
            </p>
          </section>

          <section id="sim-skalering" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Scaling className="h-5 w-5 text-brand" /> Skalering — og hvorfor den flytter svaret
            </h2>
            <p className="mb-4 leading-relaxed">
              <strong>Skalering</strong> betyr å bringe kolonnene til sammenlignbare tallområder.
              Den vanligste varianten heter standardisering: trekk fra kolonnens gjennomsnitt og del
              på standardavviket, slik at kolonnen får gjennomsnitt 0 og typisk spredning 1. Grunnen
              til at det trengs er ikke estetisk — den er at mange algoritmer regner{" "}
              <em>avstand mellom rader</em>, og en kolonne med sekssifrede tall overdøver da
              fullstendig en kolonne med tosifrede.
            </p>
            <SkaleringNaboSim />
          </section>

          <section id="onehot" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 text-xl font-semibold">One-hot encoding</h2>
            <p className="leading-relaxed">
              Algoritmer regner på tall, ikke på ordet «Bergen». Standardløsningen er{" "}
              <strong>one-hot encoding</strong>: én kolonne per unike verdi, med 1 i den som gjelder
              og 0 i resten. «by» med verdiene Oslo, Bergen og Tromsø blir til tre kolonner{" "}
              <code className="font-mono text-xs">by_oslo</code>,{" "}
              <code className="font-mono text-xs">by_bergen</code>,{" "}
              <code className="font-mono text-xs">by_tromso</code>. Ingen rangering blir antydet, og
              det er hele poenget.
            </p>
            <p className="mt-3 leading-relaxed">
              Prisen er bredde. Her kommer kardinaliteten tilbake: 8 byer gir 8 nye kolonner, som er
              helt greit. 5 000 postnumre gir 5 000 kolonner, der hver enkelt er 1 i noen få
              promille av radene. Det er for mye tomrom til at en modell finner noe. Løsningen er å
              redusere kardinaliteten først — slå postnumre sammen til kommune eller landsdel — og
              deretter kode om.
            </p>
            <p className="mt-3 leading-relaxed">
              Det finnes en fristende snarvei som heter <strong>target encoding</strong>: bytt ut
              hver kategori med gjennomsnittet av targeten for den kategorien. Den gir få kolonner
              og skyhøye testresultater. Grunnen til at testresultatene er skyhøye er at fasiten er
              blandet direkte inn i featurene — og det leder rett over i neste avsnitt.
            </p>
          </section>

          <section id="lekkasje" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Workflow className="h-5 w-5 text-brand" /> Rekkefølgen: der modulen avgjøres
            </h2>
            <p className="leading-relaxed">
              For å måle ærlig deler vi dataene i <strong>treningsdata</strong> (modellen får se
              dem) og <strong>testdata</strong> (modellen får aldri se dem). Detaljene tas i Fase 3;
              her trenger vi bare selve skillet.
            </p>
            <p className="mt-3 leading-relaxed">
              <strong>Datalekkasje</strong> er når informasjon fra testdataene sniker seg inn i
              treningen. Det gir bedre tall og dårligere modell — den verste kombinasjonen som
              finnes, fordi ingenting varsler deg.
            </p>
            <p className="mt-3 leading-relaxed">
              Den vanligste kilden er ikke dramatisk. Den er denne rekkefølgen:
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3.5">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Lekker
                </div>
                <ol className="space-y-1 text-sm leading-snug text-foreground">
                  <li>1. Fyll ut hull og skalér hele datasettet</li>
                  <li>2. Del i trening og test</li>
                  <li>3. Tren og mål</li>
                </ol>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Gjennomsnittet og standardavviket i steg 1 er regnet ut av <em>alle</em> radene,
                  også testradene. Testsettet har dermed påvirket treningen før den begynte.
                </p>
              </div>
              <div className="rounded-lg border border-success/40 bg-success/5 p-3.5">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                  Holder
                </div>
                <ol className="space-y-1 text-sm leading-snug text-foreground">
                  <li>1. Del i trening og test</li>
                  <li>2. Lær utfylling og skalering av treningsdelen alene</li>
                  <li>3. Bruk de samme tallene på testdelen, uten å lære på nytt</li>
                </ol>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Testsettet blir behandlet slik en helt ny rad ville blitt i drift. Det er den
                  eneste målingen som forteller deg noe om framtiden.
                </p>
              </div>
            </div>
            <p className="mt-3 leading-relaxed">
              Å holde rekkefølgen for hånd går bra én gang og galt den femte. Derfor finnes{" "}
              <strong>pipeline</strong>: et objekt som lenker sammen stegene og sørger for at alt
              som «lærer» noe av dataene bare lærer det av treningsdelen — også inne i
              kryssvalidering, der du ellers garantert ville rotet det til. Alt som beregner et tall
              fra dataene skal ligge inne i pipelinen. Alt som er en fast regel uten parametere kan
              ligge utenfor.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Vil du se lekkasjen skje i kode, med tallene som endrer seg, er{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2602-preprocessing-pipeline" }}
                className="text-brand underline underline-offset-2"
              >
                forbehandlingslabben
              </Link>{" "}
              stedet — den har en knapp som gjør nettopp den feilen med vilje.
            </p>
          </section>

          {/* --- Type 3: måloppgaver -------------------------------------- */}
          <section id="maloppgaver" className="mb-12 scroll-mt-28">
            <h2 className="mb-2 text-xl font-semibold">Måloppgaver — velg forbehandling</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Fire kolonner med hvert sitt problem. Du velger behandling <em>og</em> rekkefølge, og
              det er kombinasjonen som sjekkes. Flere av valgene er forsvarlige uten å være det
              beste — da får du vite hvilken avveining du nettopp gjorde, i stedet for bare «feil».
            </p>
            <MaloppgaveListe oppgaver={o.maal} />
          </section>

          {/* --- Type 4: feilsøking --------------------------------------- */}
          <section id="feilsoking" className="mb-12 scroll-mt-28">
            <h2 className="mb-2 text-xl font-semibold">
              Feilsøking — fem pipelines med hver sin lekkasje
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Dette er modulens tyngdepunkt, og den ferdigheten mappeinnleveringen faktisk måler.
              Alle fem kjører uten en eneste feilmelding og leverer resultater som ser gode ut.
              Feilen er én linje i hver, og den handler alltid om hva som skjedde <em>før</em>{" "}
              oppdelingen.
            </p>
            <FeilsokingListe oppgaver={o.feilsoking} />
          </section>

          {/* --- Type 5: recall ------------------------------------------- */}
          <section id="recall" className="mb-12 scroll-mt-28">
            <h2 className="mb-4 text-xl font-semibold">Recall-kort — sluttsjekken</h2>
            <RecallListe kort={o.recall} />
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">Videre</h2>
            <div className="grid gap-2">
              <Videre
                slug="dte2602-preprocessing-pipeline"
                tittel="Forbehandling og pipeline"
                tekst="Labben: skalering, one-hot og ColumnTransformer i kode, med lekkasje-knappen."
                primaer
              />
              <Videre
                slug="dte2602-eda-pandas"
                tittel="Utforskende dataanalyse i pandas"
                tekst="Steget før alt dette: se på dataene før du bestemmer hva som skal gjøres med dem."
              />
              <Videre
                slug="dte2602-evaluering-metoder"
                tittel="Fase 3 — Evaluering og oppdeling"
                tekst="Neste fase: hva train/test-oppdelingen egentlig er, og hvilken metrikk som passer til hvilket problem."
              />
            </div>
          </section>
        </article>
      </OppgaveModusProvider>
    </StackPageShell>
  );
}

function Videre({
  slug,
  tittel,
  tekst,
  primaer,
}: {
  slug: string;
  tittel: string;
  tekst: string;
  primaer?: boolean;
}) {
  return (
    <Link
      to="/stack/$slug"
      params={{ slug }}
      className={`group flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
        primaer
          ? "border-brand/40 bg-brand/5 hover:border-brand"
          : "border-border bg-background hover:border-brand/40"
      }`}
    >
      <span className={primaer ? "font-medium text-brand" : "font-medium text-foreground"}>
        {tittel}
      </span>
      <span className="text-xs text-muted-foreground">{tekst}</span>
      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
