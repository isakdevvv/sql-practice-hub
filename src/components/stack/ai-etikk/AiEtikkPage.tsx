import { Link } from "@tanstack/react-router";
import {
  Scale,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { BiasInDataSandbox } from "./BiasInDataSandbox";
import { FairnessMetricsCalc } from "./FairnessMetricsCalc";
import { EthicalDilemmaScenarios } from "./EthicalDilemmaScenarios";
import { GdprConsentSimulator } from "./GdprConsentSimulator";
import { EthicsQuiz } from "./EthicsQuiz";

export function AiEtikkPage() {
  return (
    <StackPageShell
      title="AI-etikk — bias, fairness-metrikker, scenario-sandbox"
      group="eksamen"
    >
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2501 · Interaktiv etikk-lesjon
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI-etikk i praksis — bias, fairness og scenarios
          </h1>
          <p className="mt-3 text-muted-foreground">
            Ingen forelesning. Du{" "}
            <em>genererer</em> selv treningsdata for en lønnsprediktor og ser
            biasen lekke inn. Du regner ut fire fairness-metrikker live mens du
            drar terskelen og oppdager{" "}
            <strong>impossibility-theoremet</strong> — du kan ikke ha alle
            samtidig. Du diskuterer seks ekte case-studies (COMPAS, Amazon
            hiring, Obermeyer-helsestudien, Gender Shades, kredittscoring,
            predictive policing). Du konfigurerer et GDPR-skjema og ser hvilke
            prinsipper du bryter når du klikker dark-pattern-knappene. Til
            slutt: 10 dilemmaer med begrunnelse.
          </p>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Etikk-eksamen-stil:</span> sensorer
              vil høre konkrete eksempler, ikke generelle fraser. Lær 3 case-r
              i detalj og navngi dem i drøftinger.
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Beslektet:{" "}
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2602-etikk-filosofi" }}
              className="text-brand hover:underline"
            >
              DTE-2602 etikk & filosofi
            </Link>{" "}
            (AI-historie, EU AI Act, Kinarommet) ·{" "}
            <Link to="/cards" className="text-brand hover:underline">
              Flashcards: AI-etikk-topic
            </Link>
          </div>
        </div>

        <CourseOutline
          courseId="ai-etikk"
          steps={[
            { title: "Bias-i-data sandbox", anchor: "bias" },
            { title: "Fairness-metrikker live", anchor: "fairness" },
            { title: "Case-studies — 6 ekte saker", anchor: "cases" },
            { title: "GDPR-skjema & dark patterns", anchor: "gdpr" },
            { title: "Etikk-quiz — 10 dilemmaer", anchor: "quiz" },
            { title: "Pensum-anker — hva eksamenen spør om", anchor: "pensum" },
          ]}
        />

        {/* === 1 BIAS === */}
        <section id="bias" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold">
              1
            </span>
            <Scale className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Bias-i-data sandbox</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Bygg treningsdata for en lønnsprediktor selv. Velg gruppe A eller B
            (f.eks. to kjønn), klikk for å plassere ansatte i (kvalifikasjoner ×
            lønn)-rommet. En lineær regresjon trenes live per gruppe — og en{" "}
            <em>global modell</em> ignorerer attributtet. Klikk «Injiser bias»
            for å skifte alle B-punkter ned i lønn, og se gapet vokse. Prøv så{" "}
            <strong>Fjern attributt</strong>-mitigasjonen og merk at den
            globale modellen fortsatt lærer skjevheten — fordi dataen koder den
            via fordelingen. Det er proxy-problemet.
          </p>
          <BiasInDataSandbox />
        </section>

        {/* === 2 FAIRNESS === */}
        <section id="fairness" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold">
              2
            </span>
            <Sparkles className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Fairness-metrikker live</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            En klassifikator scorer 200 søkere — 100 per gruppe. Drag terskelen
            opp og ned og se{" "}
            <strong>demographic parity</strong>,{" "}
            <strong>equal opportunity</strong>,{" "}
            <strong>equalized odds</strong> og{" "}
            <strong>kalibrering (PPV)</strong> oppdateres i sanntid. Bytt
            scenario til «COMPAS-lignende» (ulik base-rate) og prøv å finne en
            terskel som tilfredsstiller alle fire — du vil ikke klare det. Det
            er impossibility-theoremet, demonstrert empirisk.
          </p>
          <FairnessMetricsCalc />
        </section>

        {/* === 3 CASES === */}
        <section id="cases" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold">
              3
            </span>
            <BookOpen className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Case-studies — 6 ekte saker</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            For hver: kontekst, hva som faktisk gikk galt, hva som kunne
            forhindret det, og «hva ville du gjort?»-spørsmål med flere
            alternativer + diskusjon. Disse er navnene eksamenssensor venter at
            du kjenner: <em>COMPAS, Amazon hiring, Obermeyer 2019, Gender
            Shades (Buolamwini & Gebru 2018), credit redlining, PredPol</em>.
          </p>
          <EthicalDilemmaScenarios />
        </section>

        {/* === 4 GDPR === */}
        <section id="gdpr" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold">
              4
            </span>
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">
              GDPR-skjema & dark patterns
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Konfigurer en simulert webform: formål, lovlig grunnlag, datatyper,
            lagringstid, samtykkeform. Live-sjekken evaluerer alle 9
            GDPR-prinsipper. Trykk dark-pattern-knappene («forhakede bokser»,
            «alt-eller-intet», «evig lagring») og se hvilke prinsipper du
            bryter — kjenn igjen mønstrene før du ser dem i ekte cookie-banner.
            Til slutt: en interaktiv demo av{" "}
            <em>right to explanation</em> (art. 22) som viser hvorfor
            black-box-svar ikke er nok.
          </p>
          <GdprConsentSimulator />
        </section>

        {/* === 5 QUIZ === */}
        <section id="quiz" className="mb-12 scroll-mt-24">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold">
              5
            </span>
            <HelpCircle className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Etikk-quiz — 10 dilemmaer</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Dekker dual use, malicious use, transparency, accountability,
            fairness, privacy og safety. Hver oppgave har ett beste svar med
            begrunnelse + svake alternativer med forklaring på hvorfor de
            svikter. Bra eksamensprep.
          </p>
          <EthicsQuiz />
        </section>

        {/* === 6 Pensum-anker === */}
        <section id="pensum" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-semibold mb-3">
            Pensum-anker — hva eksamenen spør om
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">
                    Tema
                  </th>
                  <th className="text-left font-semibold px-4 py-2">
                    Hva du må kunne
                  </th>
                  <th className="text-left font-semibold px-4 py-2 w-40">
                    Konkrete navn
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Bias-typer</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Historisk, representasjons-, måle-, aggregerings-,
                    deployment-, label- og proxy-bias
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    COMPAS, Amazon
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">
                    Fairness-defn.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Demographic parity, equal opportunity, equalized odds,
                    kalibrering + impossibility theorem
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Kleinberg / Chouldechova 2017
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Mitigasjon</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Pre-, in-, post-processing. Reweighting / resampling /
                    adversarial debiasing. Hvorfor "fjern attributt" ikke
                    holder.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Fairness through unawareness
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">GDPR</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    9 prinsipper, art. 6 (lovlige grunnlag), art. 9
                    (sensitive kategorier), art. 22 (forklaring)
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    EDPB Guidelines 05/2020
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">XAI</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Tolkbar vs forklart, SHAP/LIME, model cards, kontrastive
                    forklaringer. Rudin 2019.
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Mitchell et al. 2019
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Regulering</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    EU AI Act risk-kategorier, krav for high-risk-systemer,
                    forbudt praksis (social scoring, manipulasjon)
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    AI Act 2024/1689
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">
                    Filosofiske
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Dual use, distributed responsibility, ethics washing,
                    Kinarommet, Turing-test
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Searle, Bryson, Floridi
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Eksamenstips:</strong> hvis du blir bedt om å «drøfte
            etiske implikasjoner av modellen din» — strukturer som (1) hvilken
            bias-type kan oppstå her, (2) hvilken fairness-definisjon er
            relevant, (3) hva har du gjort for å mitigere, (4) hva er
            begrensningene (siter impossibility theorem hvis relevant), (5)
            hvilken GDPR/AI-Act-kategori er dette.
          </p>
        </section>
      </div>
    </StackPageShell>
  );
}
