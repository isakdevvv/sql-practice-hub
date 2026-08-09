import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Compass, Layers, Sparkles } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { FASE1_OPPGAVER } from "@/lib/dte2602/oppgaverFase1";
import { EKSAMEN_DTE2602 } from "@/lib/dte2602/faser";
import {
  ModusVelger,
  OppgaveModusProvider,
  useOppgaveModusState,
} from "@/components/stack/dte2602-oppgaver/OppgaveModus";
import { AnslagListe } from "@/components/stack/dte2602-oppgaver/AnslagListe";
import { MaloppgaveListe } from "@/components/stack/dte2602-oppgaver/MaloppgaveListe";
import { FeilsokingListe } from "@/components/stack/dte2602-oppgaver/FeilsokingListe";
import { RecallListe } from "@/components/stack/dte2602-oppgaver/RecallListe";
import { RegelVsLaertSim, StilleFeilNote } from "./RegelVsLaertSim";
import { LaeringstypeSorterer } from "./LaeringstypeSorterer";

// ---------------------------------------------------------------------------
// DTE-2602 Modul 1 — Fase 1: Hva er maskinlæring?
//
// Bygget etter oppgave-arkitekturen i PLAN-HOST26-MODULER.md §3, i rekkefølge:
//   type 1 anslå-så-sjekk  → FØR forklaringen
//   type 2 guidet simulering → UNDER forklaringen
//   type 3 måloppgave       → ETTER forklaringen
//   type 4 feilsøking       → SIST
//   type 5 recall-kort      → sluttsjekk, med vilje få
//
// Atomene fasen dekker (plan-dte-2602.md): A01, A02, A03.
//
// Ordforråd innføres i denne rekkefølgen, og ingen term brukes før den er
// forklart: maskinlæring → eksempel → fasit → supervised / unsupervised /
// reinforcement → target → feature → regresjon → klassifikasjon → baseline.
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Anslå — før du leser", anchor: "anslag" },
  { title: "Hva maskinlæring er", anchor: "hva" },
  { title: "Regler mot lært (interaktiv)", anchor: "sim-regler" },
  { title: "De tre læringstypene", anchor: "typer" },
  { title: "Sorteringsregelen (interaktiv)", anchor: "sim-typer" },
  { title: "Tall eller kategori", anchor: "regr-klass" },
  { title: "Baseline", anchor: "baseline" },
  { title: "Måloppgaver", anchor: "maloppgaver" },
  { title: "Feilsøking", anchor: "feilsoking" },
  { title: "Recall-kort", anchor: "recall" },
];

export function Modul1Page() {
  const [modus, setModus] = useOppgaveModusState();
  const o = FASE1_OPPGAVER;

  return (
    <StackPageShell title="DTE-2602 Modul 1 — Hva er maskinlæring?" group="eksamen">
      <OppgaveModusProvider modus={modus}>
        <article className="container mx-auto max-w-3xl px-4 py-10">
          <header className="mb-8">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
              DTE-2602 · Fase 1 av 7
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hva er maskinlæring?</h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Denne modulen handler om de tre valgene som tas før noen skriver en eneste linje kode,
              og som bestemmer alt som kommer etterpå: er dette i det hele tatt et
              maskinlæringsproblem, hva slags læring er det, og skal svaret være et tall eller en
              kategori. Feil valg her kan ikke repareres med en bedre algoritme senere.
            </p>

            <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
              <strong className="text-foreground">Slik er modulen bygget:</strong> du{" "}
              <em>anslår</em> først, uten hjelp — det er meningen at noen av dem skal bomme. Så{" "}
              <em>ser</em> du mekanismen i to simuleringer. Så <em>setter du opp</em> problemer
              selv, med sjekk på den samlede tilstanden av valgene. Til slutt <em>feilsøker</em> du
              fire prosjekter som ser riktige ut og ikke er det. Kortene nederst er sluttsjekken,
              ikke der du lærer stoffet.
            </div>

            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Hvorfor det er så få kort og så mange feilsøkingsoppgaver:
              </span>{" "}
              {EKSAMEN_DTE2602.konsekvens}
            </div>
          </header>

          <CourseOutline courseId="dte2602-modul1" steps={STEPS} />

          <div className="mt-8">
            <ModusVelger modus={modus} setModus={setModus} />
          </div>

          {/* --- Type 1: anslå-så-sjekk, FØR forklaringen ------------------ */}
          <section id="anslag" className="mb-12 mt-10 scroll-mt-28">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              <Compass className="h-5 w-5 text-brand" /> Anslå først — før du leser
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Seks situasjoner. Du har ikke fått forklaringen ennå, og det er med vilje: et anslag
              du har turt å avgi gjør forklaringen langt lettere å huske, også når anslaget bommer.
              Svar på magefølelsen.
            </p>
            <AnslagListe oppgaver={o.anslag} />
          </section>

          {/* --- Forklaring + type 2: guidede simuleringer ----------------- */}
          <section id="hva" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Brain className="h-5 w-5 text-brand" /> Maskinlæring, i én setning
            </h2>
            <p className="leading-relaxed">
              <strong>
                Maskinlæring er algoritmer som finner mønsteret ut fra eksempler, i stedet for at en
                programmerer skriver regelen.
              </strong>{" "}
              Det er hele definisjonen, og den er verdt å lese én gang til, fordi den sier noe om{" "}
              <em>hvor kunnskapen bor</em> — ikke om hvor smart systemet er.
            </p>
            <p className="mt-3 leading-relaxed">
              Et <strong>eksempel</strong> er én rad: en e-post, en pasient, et bilde. En{" "}
              <strong>fasit</strong> (også kalt merkelapp) er det kjente riktige svaret for den
              raden — «dette var spam». Et regelbasert system har ingen eksempler; det har regler,
              og reglene endrer seg bare når et menneske redigerer dem. En maskinlært modell har
              ingen regler noen har skrevet; den har vekter som er utledet av eksemplene, og de
              endrer seg når du gir den nye eksempler.
            </p>
            <p className="mt-3 leading-relaxed">
              Det er lett å tro at fordelen med maskinlæring er at den treffer bedre. Det stemmer
              ofte ikke. Fordelen er at kunnskapen kan oppdateres uten at noen må gjette seg til
              hvilken ny regel som trengs. Simuleringen under er bygget for å vise nettopp det —
              merk at <em>begge systemene feiler</em> når verden endrer seg.
            </p>
          </section>

          <section id="sim-regler" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-brand" /> Simulering: regler mot lært
            </h2>
            <RegelVsLaertSim />
            <StilleFeilNote />
          </section>

          <section id="typer" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Layers className="h-5 w-5 text-brand" /> De tre læringstypene
            </h2>
            <p className="leading-relaxed">
              Det som skiller de tre er ikke hvilken algoritme du bruker, men{" "}
              <strong>hva slags tilbakemelding som finnes i dataene</strong>.
            </p>
            <ul className="mt-3 space-y-2.5 pl-5 text-sm leading-relaxed">
              <li className="list-disc">
                <strong>Supervised learning</strong> (læring med fasit): hvert eksempel har et kjent
                riktig svar. Modellen lærer sammenhengen mellom det som er kjent på forhånd og
                svaret. Det aller meste du gjør i dette faget er supervised.
              </li>
              <li className="list-disc">
                <strong>Unsupervised learning</strong> (læring uten fasit): ingen har skrevet ned
                noe riktig svar. Algoritmen leter etter struktur i dataene selv — typisk grupper som
                ligner hverandre. Det vanskelige er ikke å finne grupper; det er å avgjøre om
                gruppene betyr noe.
              </li>
              <li className="list-disc">
                <strong>Reinforcement learning</strong> (forsterkende læring): ingen fasit, men en
                belønning som sier hvor bra en handling var — ofte først lenge etterpå. Roboter og
                spill.
              </li>
            </ul>
            <p className="mt-3 leading-relaxed">
              Testen tar to sekunder når den sitter:{" "}
              <strong>finnes det en kolonne med det riktige svaret for hvert eksempel?</strong> Ikke
              «har vi mye data» — mengde er ikke fasit.
            </p>
          </section>

          <section id="sim-typer" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-brand" /> Simulering: regelen, brukt åtte ganger
            </h2>
            <LaeringstypeSorterer />
          </section>

          <section id="regr-klass" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 text-xl font-semibold">Ble det supervised: tall eller kategori?</h2>
            <p className="leading-relaxed">
              To ord til før vi går videre. Det du vil forutsi kalles <strong>target</strong> (y).
              Kolonnene du bruker for å forutsi det kalles <strong>features</strong> (X) —
              egenskaper. Fase 2 handler om nettopp disse; her holder det å vite at targeten er det
              ukjente og featurene det kjente.
            </p>
            <p className="mt-3 leading-relaxed">
              <strong>Regresjon</strong> er når targeten er et tall der avstand betyr noe: kroner,
              minutter, kilowattimer. Å bomme med 2 er mye bedre enn å bomme med 200.{" "}
              <strong>Klassifikasjon</strong> er når targeten er en kategori der «litt feil» ikke
              finnes: du traff eller bommet.
            </p>
            <p className="mt-3 leading-relaxed">
              Legg merke til retningen: fra et tall kan du alltid lage en kategori ved å sette en
              grense, men aldri motsatt vei. Har du tallet, er hovedregelen å beholde tallet — du
              kan kategorisere svaret i etterkant, når du vet hvilken grense beslutningen faktisk
              krever.
            </p>
          </section>

          <section id="baseline" className="mb-12 scroll-mt-28">
            <h2 className="mb-3 text-xl font-semibold">Baseline — tallet alt måles mot</h2>
            <p className="leading-relaxed">
              Ett begrep til, fordi det går igjen i halvparten av oppgavene under. En{" "}
              <strong>baseline</strong> er den trivielle løsningen: hva får du uten å lære noe som
              helst? For klassifikasjon er den vanligste «svar alltid det som er vanligst».
            </p>
            <p className="mt-3 leading-relaxed">
              Poenget er at <strong>et resultat uten baseline ikke er et resultat</strong>. «99 %
              riktig» er strålende hvis baselinen er 50 %, og pinlig hvis den er 99,8 %. Å oppgi
              begge tall side om side koster to linjer og er et av de sikreste poengene i
              mappeinnleveringen.
            </p>
          </section>

          {/* --- Type 3: måloppgaver -------------------------------------- */}
          <section id="maloppgaver" className="mb-12 scroll-mt-28">
            <h2 className="mb-2 text-xl font-semibold">Måloppgaver — sett opp problemet selv</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Nå snur vi det: du får situasjonen, og skal ta valgene. Det som sjekkes er ikke ett
              valg av gangen, men om <em>kombinasjonen</em> av valgene henger sammen. Derfor finnes
              det tre utfall og ikke to — et forsvarlig, men ikke optimalt oppsett får vite nøyaktig
              hvilken avveining du gjorde, i stedet for å bli stemplet som feil.
            </p>
            <MaloppgaveListe oppgaver={o.maal} />
          </section>

          {/* --- Type 4: feilsøking --------------------------------------- */}
          <section id="feilsoking" className="mb-12 scroll-mt-28">
            <h2 className="mb-2 text-xl font-semibold">Feilsøking — finn feilen i prosjektet</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Tyngdepunktet i denne modulen. Alle fire prosjektene under kjører uten feilmelding og
              leverer et pent tall. Feilen bor i oppsettet, og den kan ligge hvor som helst i kjeden
              — det er derfor denne oppgavetypen kommer sist. Klikk deg gjennom linjene; også de
              riktige forklarer hvorfor de er i orden.
            </p>
            <FeilsokingListe oppgaver={o.feilsoking} />
          </section>

          {/* --- Type 5: recall ------------------------------------------- */}
          <section id="recall" className="mb-12 scroll-mt-28">
            <h2 className="mb-4 text-xl font-semibold">Recall-kort — sluttsjekken</h2>
            <RecallListe kort={o.recall} />
          </section>

          {/* --- Videre --------------------------------------------------- */}
          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">Videre</h2>
            <div className="grid gap-2">
              <Videre
                slug="dte2602-modul2"
                tittel="Modul 2 — Data og features"
                tekst="Neste fase: hvordan rådata blir til X og y, og hvorfor rekkefølgen på forbehandlingen avgjør om resultatet er ekte."
                primaer
              />
              <Videre
                slug="ml-grunnlag"
                tittel="ML-grunnlag"
                tekst="Samme stoff i leksjonsform, med flere eksempler og litt bredere ordforråd."
              />
              <Videre
                slug="supervised-learning"
                tittel="Supervised learning — oversikt"
                tekst="Kartet over algoritmene som kommer i Fase 4, og hvilken antakelse hver av dem hviler på."
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
