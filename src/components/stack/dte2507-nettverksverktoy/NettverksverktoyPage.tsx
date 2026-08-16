import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Info,
  Lightbulb,
  Target,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { OPPGAVER, type Oppgave, type Vurdering } from "@/lib/dte2507/nettverkOppgaver";
import { MODULER_2507 } from "@/lib/dte2507/canvasModuler";
import { dagerTil, formatDato } from "@/lib/dte2507/lagPlan";
import { Terminal } from "./Terminal";

// ---------------------------------------------------------------------------
// Verktøysiden til DTE-2507 Lab 1.
//
// Hullet denne fyller: appen forklarte DNS-hierarkiet og hva traceroute måler,
// men hadde ingenting om å *kjøre* kommandoene og lese utdataen. Laben tester
// nettopp det. nslookup fantes ikke i repoet i det hele tatt før denne siden.
//
// Formen følger §3 i PLAN-HOST26-MODULER.md: terminalen er den guidede
// simuleringen (type 2, null prestasjonskrav — utforsk fritt), og oppgavene
// under er måloppgaver med tilstandssjekk (type 3). Det finnes med vilje ingen
// «riktig kommando» — flere veier gir samme svar, og det er svaret som sjekkes.
// ---------------------------------------------------------------------------

export function NettverksverktoyPage() {
  // Lab 1 er den eneste quizen i modul 1, og den denne siden forbereder.
  const lab = MODULER_2507.find((m) => m.nr === "1")?.quizer[0];
  const dager = lab ? dagerTil(lab.frist) : -1;
  const [lost, setLost] = useState<Set<string>>(new Set());

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
              <OppgaveKort
                key={o.id}
                nr={i + 1}
                oppgave={o}
                lost={lost.has(o.id)}
                onLost={() => setLost((s) => new Set(s).add(o.id))}
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
                «er nede». Alle tre kommer igjen på eksamen.
              </div>
            </div>
          )}
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

/* ------------------------------------------------------------ delkomponent */

function OppgaveKort({
  nr,
  oppgave,
  lost,
  onLost,
}: {
  nr: number;
  oppgave: Oppgave;
  lost: boolean;
  onLost: () => void;
}) {
  const [svar, setSvar] = useState("");
  const [vurdering, setVurdering] = useState<Vurdering | null>(null);
  const [visHint, setVisHint] = useState(false);

  function prov() {
    if (!svar.trim()) return;
    const v = oppgave.sjekk(svar);
    setVurdering(v);
    if (v.riktig) onLost();
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        lost ? "border-success/40 bg-success/5" : "border-border bg-card"
      }`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            lost ? "bg-success/20 text-success" : "bg-brand/15 text-brand"
          }`}
        >
          {lost ? <CheckCircle2 className="h-3.5 w-3.5" /> : nr}
        </span>
        <h3 className="font-medium text-foreground">{oppgave.tittel}</h3>
        <code className="ml-auto rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
          {oppgave.verktoy}
        </code>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{oppgave.oppdrag}</p>

      {!lost && (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              value={svar}
              onChange={(e) => {
                setSvar(e.target.value);
                setVurdering(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && prov()}
              spellCheck={false}
              autoCapitalize="off"
              aria-label={`Svar på oppgave ${nr}`}
              placeholder="skriv svaret du fant"
              className="min-w-[12rem] flex-1 rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={prov}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              Sjekk
            </button>
            <button
              type="button"
              onClick={() => setVisHint((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Hint
              <ChevronDown
                className={`h-3 w-3 transition-transform ${visHint ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {visHint && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-relaxed text-muted-foreground">
              {oppgave.hint}
            </p>
          )}

          {vurdering && !vurdering.riktig && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm leading-relaxed text-rose-700 dark:text-rose-300">
              {vurdering.tilbakemelding ??
                "Ikke riktig ennå. Kjør kommandoen i terminalen over og les svaret linje for linje."}
            </p>
          )}
        </>
      )}

      {lost && (
        <p className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm leading-relaxed text-foreground">
          {oppgave.forklaring}
        </p>
      )}
    </div>
  );
}
