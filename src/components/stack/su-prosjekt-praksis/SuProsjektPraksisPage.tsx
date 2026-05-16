import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Versjonskontroll — grunnvokabular", anchor: "git" },
  { title: "Feature-branch + Pull Request-flow", anchor: "pr" },
  { title: "Konflikter — hvorfor og hvordan", anchor: "konflikt" },
  { title: "Code review — hva ser man etter?", anchor: "review" },
  { title: "Estimering, tidsbruk, oppfølging", anchor: "estimering" },
  { title: "Retrospektiv-format", anchor: "retro" },
  { title: "Vanlige team-feller", anchor: "feller" },
];

export function SuProsjektPraksisPage() {
  return (
    <StackPageShell title="Prosjekt-praksis i gruppe" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2604 · Del 4 av 4
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Prosjekt-praksis i gruppe
          </h1>
          <p className="mt-3 text-muted-foreground">
            Smidig på papiret ≠ smidig i et 4-personers gruppeprosjekt. Her er
            de praktiske vanene: git-flow, PR-review, retrospektiv-format og
            de fellene team faktisk faller i.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Systemutvikling» — PR-flow rekkefølge, conflict-quiz, review-sjekkliste.
            </div>
          </div>
        </div>

        <CourseOutline courseId="su-prosjekt-praksis" steps={STEPS} />

        <section id="git" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Versjonskontroll — grunnvokabular</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du skal kunne forklare disse begrepene på muntlig eksamen og bruke
            dem riktig i gruppeprosjektet.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Begrep</th>
                  <th className="text-left font-semibold px-4 py-2">Betyr</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">commit</td><td className="px-4 py-3 text-muted-foreground">En navngitt snapshot av endringene dine, med melding</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">branch</td><td className="px-4 py-3 text-muted-foreground">En navngitt linje med commits — typisk én per feature</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">merge</td><td className="px-4 py-3 text-muted-foreground">Sammenstilling av to brancher til én, med ny merge-commit</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">rebase</td><td className="px-4 py-3 text-muted-foreground">Flytter dine commits oppå den nye versjonen av base-branchen (lineær historikk)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">push / pull</td><td className="px-4 py-3 text-muted-foreground">Synk lokalt repo med remote (GitHub) opp / ned</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">PR / MR</td><td className="px-4 py-3 text-muted-foreground">Pull request / Merge request — forespørsel om å merge en feature-branch</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">main / master</td><td className="px-4 py-3 text-muted-foreground">«Hellige» branchen som alltid skal være deployerbar</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="pr" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Feature-branch + Pull Request-flow</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Standard arbeidsflyt for hver brukerhistorie du tar på deg. Følg
            denne rekkefølgen.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# 1. Sørg for at main er oppdatert
git checkout main
git pull origin main

# 2. Lag en feature-branch
git checkout -b feat/passord-reset

# 3. Jobb, commit ofte. Push branchen
git add .
git commit -m "Add reset token model"
git push -u origin feat/passord-reset

# 4. Åpne PR mot main i GitHub/GitLab
#    - Beskriv hva og hvorfor
#    - Link til brukerhistorien
#    - Be om review fra en gruppemedlem

# 5. Adressér review-kommentarer (nye commits)
git add .
git commit -m "Fix: hash token before storing"
git push

# 6. Når PR er godkjent og CI er grønn:
#    - Squash & merge (eller merge med merge-commit)
#    - Slett feature-branchen`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hvorfor ikke pushe direkte til main?
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              <li>Code review fanger bugs FØR de når production</li>
              <li>CI-pipeline kan blokkere merge ved feilende tester</li>
              <li>Git-historikken viser hvorfor hver endring kom inn (PR-beskrivelsen)</li>
              <li>Reverting en feature er trivielt: én merge-commit å revertere</li>
            </ul>
          </div>
        </section>

        <section id="konflikt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Konflikter — hvorfor og hvordan</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En merge-konflikt oppstår når to brancher har endret SAMME LINJER i
            samme fil ulikt. Git kan ikke gjette hva som er riktig — du må velge.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Slik ser en konflikt ut i fila
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`def beregn_pris(antall, enhetspris):
<<<<<<< HEAD                           ← din endring
    return antall * enhetspris * 1.25  ← du la til mva
=======
    return antall * enhetspris - rabatt ← kollegaen la til rabatt
>>>>>>> feat/rabatt                    ← navn på den andre branchen
`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Du sletter konfliktmarkørene og skriver linjen som er korrekt
              (kanskje en kombinasjon av begge — her trolig{" "}
              <code>(antall * enhetspris - rabatt) * 1.25</code>).
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Konflikter unngås best ved
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              <li>Korte feature-brancher (1-3 dager max før merge)</li>
              <li>Hyppig <code>git pull origin main</code> + rebase eller merge fra main inn i din branch</li>
              <li>Avtaler i teamet om hvem som rører hvilke filer</li>
              <li>Små, fokuserte commits — én logisk endring per commit</li>
            </ul>
          </div>
        </section>

        <section id="review" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Code review — hva ser man etter?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En PR-review er en samtale, ikke en eksamen. Vær respektfull, vær
            konkret, og fokusér på koden — ikke personen.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Sjekkliste — som reviewer
              </div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                <li>Løser koden den brukerhistorien sier?</li>
                <li>Har funksjonene tester?</li>
                <li>Er navngivningen tydelig?</li>
                <li>Er det dupliseringer som burde refaktoreres?</li>
                <li>Hvilke edge cases er ikke håndtert?</li>
                <li>Logging / feilhåndtering rimelig?</li>
                <li>Sikkerhet: SQL-injection, XSS, secrets i kode?</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Tone — hvordan skrive
              </div>
              <ul className="space-y-1.5 text-sm list-disc pl-5">
                <li>«Hva tenker du om...?» framfor «Dette er feil»</li>
                <li>Forklar hvorfor, ikke bare hva</li>
                <li>Merk «nice-to-have» tydelig med «nit:» eller «small:»</li>
                <li>Ros det som er bra — ikke bare det som må fikses</li>
                <li>Hvis lengre diskusjon trengs, ta en samtale i stedet for en PR-tråd</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="estimering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Estimering, tidsbruk, oppfølging</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Estimering er en ferdighet som forbedres med kalibrering — sammenlign
            estimat med faktisk og juster.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="space-y-2 text-sm">
              <li><strong>Story points</strong> brukes for backloggen (relativ kompleksitet).</li>
              <li><strong>Timer</strong> brukes i Sprint Planning når teamet bryter historier til tasks.</li>
              <li><strong>Logg faktisk tid</strong> (eks: i Toggl, Jira, eller en delt regneark) — så ser du etter et par sprinter hvor du systematisk underestimerer.</li>
              <li><strong>Burn-down chart</strong> viser gjenstående arbeid mot tid — flat linje midt i sprinten = problemer.</li>
              <li><strong>Buffer 20%</strong> for review, bug-fix, uventede ting.</li>
            </ul>
          </div>
        </section>

        <section id="retro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Retrospektiv-format</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Retrospektiv er Scrum-eventet hvor TEAMET, ikke prosessen, vurderes.
            Klassisk format med tre kolonner.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+──────────────+──────────────+──────────────+
│ Start doing  │ Stop doing   │ Continue     │
│ (start med)  │ (slutt med)  │ (fortsett)   │
+──────────────+──────────────+──────────────+
│ • PR-review  │ • Push direkt│ • Daily kl 9 │
│   innen 24t  │   til main   │ • Pair-prog  │
│ • Bedre AC   │ • 8t sprint  │   på tøffe   │
│   før plan   │   planning   │   tasks      │
│ • Skrive     │ • Vente med  │ • Test-først │
│   ADR        │   testing    │   for API    │
+──────────────+──────────────+──────────────+`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Retro-fasilitet
            </div>
            <ol className="space-y-1.5 text-sm list-decimal pl-5">
              <li>Sett scene: «Trygt rom, ingen skyld på person»</li>
              <li>Innsamling: alle skriver post-its i 5 min</li>
              <li>Cluster: gruppér like temaer</li>
              <li>Diskuter de største clusterene</li>
              <li>Velg 1-3 KONKRETE handlinger til neste sprint (med eier)</li>
              <li>Sjekk forrige retros handlinger — skjedde de?</li>
            </ol>
          </div>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Vanlige team-feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Vi rekker det neste sprint»</strong> — historier som
              ruller fra sprint til sprint. Splitt eller revurdér prioritering.
              Lyver til seg selv om fremdrift.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Stille møter med én som snakker</strong> — daglig blir til
              status til SM. Bruk runde, eller la teamet kjøre uten leder.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Det funker på maskinen min»</strong> — manglende CI eller
              docker-oppsett. Sett opp en pipeline tidlig, selv om den bare
              kjører unit tests.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Code-review-staller</strong> — PR-er ligger 5 dager. Sett
              SLA: «alle PR-er reviewes innen neste arbeidsdag».
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Bare jeg vet hvordan modul X virker»</strong> — bus
              factor 1. Roter, par-programmer, dokumentér.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Retro uten handlinger</strong> — hyggelig prat, men
              ingenting endrer seg. Tving 1-3 konkrete handlinger med eier hver gang.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Vi gjør smidig — sjekk Jira»</strong> — ritualer uten
              substans. Det er ikke verktøyet som gjør deg smidig.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Beslektet</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : PR-flow rekkefølge, conflict-quiz, review-sjekkliste.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "api-prosjekt" }} className="text-brand hover:underline">
                API-prosjekt fra A til Å
              </Link>
              : praksisen omsatt til et konkret API-leveranse — fra MVP til deploy.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
