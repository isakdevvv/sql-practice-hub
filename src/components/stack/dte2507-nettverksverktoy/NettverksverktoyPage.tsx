import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Info,
  Lightbulb,
  Target,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
// RecallPanel bor i dte2505-mappa fordi den ble skrevet der først, men den er
// skrevet generisk (den kjenner bare kort + en FSRS-butikk) og brukes derfor
// som den er her. Flyttes den til en felles mappe senere, er det ett import-bytte.
import { RecallPanel } from "@/components/stack/dte2505-felles/RecallPanel";
import { OPPGAVER } from "@/lib/dte2507/nettverkOppgaver";
import { ANSLAG, nettverkAnslagLager } from "@/lib/dte2507/nettverkAnslag";
import { NETTVERK_KORT, nettverkFsrs } from "@/lib/dte2507/nettverkKort";
import { MODULER_2507 } from "@/lib/dte2507/canvasModuler";
import { dagerTil, formatDato } from "@/lib/dte2507/lagPlan";
import { masteredSections, markSectionMastered } from "@/lib/core/mastery";
import { AnslagPanel } from "@/components/lab/AnslagPanel";
import { MaalOppgaveKort } from "@/components/lab/MaalOppgaveKort";
import { Terminal } from "./Terminal";

// ---------------------------------------------------------------------------
// Verktøysiden til DTE-2507 Lab 1.
//
// Hullet denne fyller: appen forklarte DNS-hierarkiet og hva traceroute måler,
// men hadde ingenting om å *kjøre* kommandoene og lese utdataen. Laben tester
// nettopp det. nslookup fantes ikke i repoet i det hele tatt før denne siden.
//
// Formen følger §3 i PLAN-HOST26-MODULER.md, og siden kjører nå alle fire
// oppgavetypene den kan kjøre, i rekkefølge:
//
//   type 1  anslagene øverst — gjett før du har sett noe (AnslagPanel)
//   type 2  terminalen — fri utforsking, null prestasjonskrav
//   type 3  måloppgavene — verdien du fant sjekkes, ikke kommandoen du skrev
//   type 5  recall-kortene nederst, meldt inn i den FELLES FSRS-køen
//
// Det finnes med vilje ingen «riktig kommando» — flere veier gir samme svar, og
// det er svaret som sjekkes. Type 4 (feilsøking) mangler fortsatt; den hører
// hjemme etter TLS-modulen, se PLAN-LABOPPGAVER.md §4.1.
// ---------------------------------------------------------------------------

/** Leksjonsnøkkelen framgangen lagres under. Må matche slugen i stack-ruta. */
const LEKSJON = "dte2507-nettverksverktoy";

export function NettverksverktoyPage() {
  // Lab 1 er den eneste quizen i modul 1, og den denne siden forbereder.
  const lab = MODULER_2507.find((m) => m.nr === "1")?.quizer[0];
  const dager = lab ? dagerTil(lab.frist) : -1;
  const [lost, setLost] = useState<Set<string>>(new Set());

  // Framgangen lever i localStorage, som ikke finnes under tjener-rendringen —
  // derfor leses den etter montering, ikke i initialverdien over. Uten dette
  // forsvant elleve løste oppgaver ved første F5, og den som kom tilbake dagen
  // etter måtte gjøre alt om igjen.
  useEffect(() => {
    const lagret = masteredSections(LEKSJON);
    const mine = OPPGAVER.filter((o) => lagret.has(o.id)).map((o) => o.id);
    if (mine.length > 0) setLost(new Set(mine));
  }, []);

  function marker(id: string) {
    markSectionMastered(LEKSJON, id);
    setLost((s) => new Set(s).add(id));
  }

  return (
    <StackPageShell title="Nettverksverktøy i terminalen" group="eksamen">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            DTE-2507 · Lab 1 — IP-nettverk
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            De fem kommandoene, og hva utdataen faktisk sier
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Laben spør ikke om du kan navnene på verktøyene. Den spør hva som står i svaret når du
            har kjørt dem — hvilken av to adresser som er din egen, om en maskin er nede eller bare
            taus, og hvilket navn som egentlig ligger bak et alias. Terminalen under er ekte nok
            til å øve på det: kommandoene leser fra samme etterlignede nett, så de er enige med
            hverandre.
          </p>
        </header>

        {lab && dager >= 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <CalendarClock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
            <div className="flex-1 text-sm">
              <span className="font-medium text-foreground">
                {lab.navn}
              </span>{" "}
              <span className="text-muted-foreground">
                har frist {formatDato(lab.frist)} kl. 23:59, og krever {lab.krav} av{" "}
                {lab.poeng} poeng — altså full pott. Til gjengjeld er det ubegrensede forsøk med
                hint etter innlevering, så du taper ingenting på å levere før du er sikker.
              </span>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-300">
                {dager}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                dager igjen
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-start gap-3 rounded-xl border border-sky-500/40 bg-sky-500/5 p-4 text-sm leading-relaxed">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div>
            <span className="font-medium">Nettet her er oppdiktet, mønstrene er ekte.</span>{" "}
            Adressene, MAC-adressene og DNS-oppføringene er laget for denne øvingen — men de følger
            reglene: privat adresseområde innenfor lokalnettet, gatewayen som første hopp, et alias
            som peker på et canonical name, og en vert som ikke svarer på ping uten å være nede.
            Kjør gjerne de samme kommandoene i din egen terminal ved siden av og sammenlign.
          </div>
        </div>

        {/* Anslagene — type 1. Skal stå FØR terminalen; hele poenget er at de
            besvares uten data. */}
        <AnslagPanel
          anslag={ANSLAG}
          lager={nettverkAnslagLager}
          lost={lost}
          intro="Fire påstander om nettet under."
        />

        {/* Terminalen — fri utforsking, ingen fasit. */}
        <section className="mb-10">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            Prøv deg fram
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              ingen fasit
            </span>
          </h2>
          <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
            Start med <code className="rounded bg-muted px-1">help</code>. Ingenting du skriver her
            teller — hele poenget er å se hva de ulike kommandoene svarer før du får spørsmål om
            det.
          </p>
          <Terminal />
        </section>

        {/* Måloppgavene. */}
        <section className="mb-10">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Target className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">Finn svaret</h2>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {lost.size} / {OPPGAVER.length}
            </span>
          </div>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Elleve oppgaver, i samme rekkefølge som laben går fram. Det spiller ingen rolle hvilken
            kommando du bruker — det er verdien du finner som sjekkes. Bruk terminalen over;
            oppgavene blir stående mens du ruller.
          </p>

          <div className="space-y-3">
            {OPPGAVER.map((o, i) => (
              <MaalOppgaveKort
                key={o.id}
                nr={i + 1}
                oppgave={o}
                lost={lost.has(o.id)}
                onLost={() => marker(o.id)}
                feilTekst="Ikke riktig ennå. Kjør kommandoen i terminalen over og les svaret linje for linje."
              />
            ))}
          </div>

          {lost.size === OPPGAVER.length && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <div className="leading-relaxed">
                <strong className="text-foreground">Alle elleve.</strong> Det som er verdt å ta med
                seg videre i faget er ikke kommandoene, men de tre skillene du nettopp brukte: MAC
                mot IP (lokalt mot hele veien), alias mot canonical name, og «svarer ikke» mot
                «er nede». Alle tre kommer igjen på eksamen — og ligger som kort under.
              </div>
            </div>
          )}
        </section>

        {/* Recall — type 5. Kortene er meldt inn i den felles køen, så de dukker
            opp igjen i november uten at noen må huske å åpne denne siden. */}
        <section className="mb-10">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-5 w-5 text-brand" />
            Det som må sitte i hodet
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
            Alt du kan slå opp i en terminal står ikke her — du har jo terminalen. Det som står her
            er skillene, og de to feltnavnene som stopper deg helt hvis du glemmer dem. Kortene
            ligger i den felles repetisjonskøen, så de kommer tilbake av seg selv utover høsten.
          </p>
          <RecallPanel
            cards={NETTVERK_KORT}
            tags={[
              { id: "skiller", label: "Skiller" },
              { id: "verktøyvalg", label: "Verktøy og felt" },
            ]}
            store={nettverkFsrs}
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte2507-lag" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            Tilbake til DTE-2507 lag for lag
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/stack/$slug"
            params={{ slug: "dte2507-dns-dyp" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            DNS i dybden — hvorfor oppslaget virker
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}

