import { Link } from "@tanstack/react-router";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Git internals — objects og refs", anchor: "internals" },
  { title: "add vs commit vs push", anchor: "stages" },
  { title: "rebase vs merge — når hva", anchor: "rebase-merge" },
  { title: "Interactive rebase — squash, edit, drop", anchor: "interactive" },
  { title: "cherry-pick — plukk én commit", anchor: "cherry-pick" },
  { title: "bisect — binærsøk etter bug", anchor: "bisect" },
  { title: "reflog — rednings­bøyen", anchor: "reflog" },
  { title: "stash, submodules, aliases, feller", anchor: "diverse" },
];

export function GitDypPage() {
  return (
    <StackPageShell title="Git-dyp — internals og avansert bruk" group="stack">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DevOps · Phase 11.5
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Git-dyp — internals, rebase, bisect og reflog
          </h1>
          <p className="mt-3 text-muted-foreground">
            Du kan allerede <code>add/commit/push</code>. Her ser vi hva Git
            egentlig lagrer (objects, refs), hvordan rebase og cherry-pick
            virker, og hvordan reflog redder deg når du «har mistet» commits.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Drill:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «Git-dyp» — objects match, rebase vs merge, interactive-rebase-kommandoer, bisect-rekkefølge.
            </div>
          </div>
        </div>

        <CourseOutline courseId="git-dyp" steps={STEPS} />

        <section id="internals" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Git internals — objects og refs</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et Git-repo er ikke noe magisk. Det er et nøkkel-verdi-lager
            (<code>.git/objects/</code>) av fire typer objekter, og noen
            «refs» som peker inn i det lageret.
          </p>

          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Object</th>
                  <th className="text-left font-semibold px-4 py-2">Inneholder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">blob</td><td className="px-4 py-3 text-muted-foreground">Innholdet i én fil (rå bytes, ingen navn).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">tree</td><td className="px-4 py-3 text-muted-foreground">En katalog — liste av (navn, modus, blob/tree-sha).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">commit</td><td className="px-4 py-3 text-muted-foreground">Et snapshot: peker til tree, forelder(e), forfatter, melding.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">tag</td><td className="px-4 py-3 text-muted-foreground">Annotert tag — peker til et objekt med ekstra metadata (annet enn lettvektige tags som er ren ref).</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Se objektene selv
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Hva er forskjellen på en commit-sha og en tree-sha?
git cat-file -t 9a7f3c1     # type: commit / tree / blob / tag
git cat-file -p 9a7f3c1     # printer innholdet

# Eksempel — en commit:
# tree    4b8d2e...           ← snapshot av filtreet
# parent  ab12cd...           ← forrige commit
# author  Isak <...> 17...
# committer Isak <...> 17...
#
# feat: la til X

# Innholdet i treet:
git cat-file -p 4b8d2e
# 100644 blob a1b2c3...    README.md
# 040000 tree d4e5f6...    src

# Hver fil-versjon er en blob:
git cat-file -p a1b2c3 | head`}</pre>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            <strong>Refs</strong> er bare filer som inneholder en sha. Det er det
            som gjør at <code>HEAD</code>, branches og tags er «billige».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`cat .git/HEAD
# ref: refs/heads/main          ← HEAD peker (vanligvis) på en branch

cat .git/refs/heads/main
# 9a7f3c1abcd...                ← branchen er bare en sha

# Detached HEAD = HEAD peker direkte på en sha:
git checkout 9a7f3c1
cat .git/HEAD
# 9a7f3c1abcd...                ← ikke "ref:" lenger`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Hvorfor det er nyttig å vite: rebase, cherry-pick og reflog gir
            mer mening når du tenker «pek HEAD på en annen commit» heller
            enn «flytt filer».
          </p>
        </section>

        <section id="stages" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. add vs commit vs push — de tre stedene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En endring kan være på tre steder samtidig: working tree (filene
            dine), staging area (det som blir med i neste commit), og repo
            (commits du har laget). Push sender repo-en din til en remote.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`[working tree]  ── git add ──>  [staging area]  ── git commit ──>  [local repo]
                                                                        │
                                                              git push  ▼
                                                                  [remote repo]

git status                  # hva er hvor?
git diff                    # working tree vs staging
git diff --staged           # staging vs siste commit
git diff HEAD               # working tree + staging vs siste commit`}</pre>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Vanlige operasjoner mellom stadiene
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`git add fil.txt           # working → staging
git add -p                # interaktivt — velg hunks
git restore --staged fil  # un-add: staging → working tree (innhold beholdt)
git restore fil           # FARE: kast endring i working tree

git commit -m "feat: X"   # staging → repo
git commit --amend        # endre forrige commit (bare før push)
git reset --soft HEAD~1   # angre commit, behold staging
git reset --mixed HEAD~1  # angre commit + un-add (default)
git reset --hard HEAD~1   # FARE: kast commit + alle endringer`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Huskeregel:</strong> <code>--soft</code> rører bare HEAD,
            <code> --mixed</code> rører HEAD + staging, <code>--hard</code>{" "}
            rører alt (inkl. working tree). Bruk <code>--hard</code> bare når
            du er sikker.
          </p>
        </section>

        <section id="rebase-merge" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Rebase vs merge — når hva</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Begge integrerer endringer fra en branch i en annen. Forskjellen
            er hvordan historikken ser ut etterpå.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Før — feature er bak main:
  main:    A ── B ── C
                  \\
  feature:         D ── E

git checkout feature && git merge main
  main:    A ── B ── C
                  \\        \\
  feature:         D ── E ── M     ← merge-commit M med to foreldre

git checkout feature && git rebase main
  main:    A ── B ── C
                       \\
  feature:              D' ── E'   ← D og E er REPLAYED på toppen av C`}</pre>
          </div>

          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Bruk</th>
                  <th className="text-left font-semibold px-4 py-2">Når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">merge</td><td className="px-4 py-3 text-muted-foreground">Integrasjon mellom langlivede branches (main, develop). Bevarer at to spor møttes. <code>--no-ff</code> for å beholde merge-commit-en.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">rebase</td><td className="px-4 py-3 text-muted-foreground">Holde din feature-branch oppdatert med main, lineær historie. Ryddet før PR.</td></tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Den gylne regel:</span> ikke rebase
              en branch andre allerede har basert seg på. Rebase skriver om
              historikken (D blir D', ny sha), og når du så push-er, må alle
              andre tilbake-rebase.
            </div>
          </div>
        </section>

        <section id="interactive" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Interactive rebase — squash, edit, drop, reorder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <code>git rebase -i</code> åpner et redigerbart skript over
            commits. Du endrer hva som skjer med hver linje før du lagrer.
          </p>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`git rebase -i HEAD~5

# Editor åpner med:
pick   1a2b3c4  feat: skisse av modul X
pick   2b3c4d5  WIP fiks typo
pick   3c4d5e6  WIP enda en typo
pick   4d5e6f7  feat: ferdig modul X
pick   5e6f7g8  feat: la til tester

# Endre til:
pick    1a2b3c4  feat: skisse av modul X
squash  2b3c4d5  WIP fiks typo            ← slå sammen i forrige
squash  3c4d5e6  WIP enda en typo         ← slå sammen i forrige
reword  4d5e6f7  feat: ferdig modul X     ← bytte commit-melding
pick    5e6f7g8  feat: la til tester`}</pre>
          </div>

          <div className="overflow-hidden rounded-lg border border-border mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-28">Kommando</th>
                  <th className="text-left font-semibold px-4 py-2">Gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">pick</td><td className="px-4 py-3 text-muted-foreground">Behold commit-en som den er. Default.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">reword</td><td className="px-4 py-3 text-muted-foreground">Behold endringene, men la meg skrive ny commit-melding.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">edit</td><td className="px-4 py-3 text-muted-foreground">Stopp rebasen her — la meg fikse filer, så <code>git commit --amend</code>, så <code>git rebase --continue</code>.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">squash</td><td className="px-4 py-3 text-muted-foreground">Slå sammen med forrige commit. La meg redigere kombinert melding.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">fixup</td><td className="px-4 py-3 text-muted-foreground">Som squash, men kast denne commit-en sin melding (behold forriges).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">drop</td><td className="px-4 py-3 text-muted-foreground">Slett commit-en helt. (Eller slett bare linja — samme effekt.)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">reorder</td><td className="px-4 py-3 text-muted-foreground">Flytt linjer opp/ned — du endrer rekkefølgen commits playes i.</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Når du sitter fast:</strong>{" "}
            <code>git rebase --abort</code> ruller alt tilbake.{" "}
            <code>git rebase --continue</code> går videre etter at du har
            løst en konflikt eller fullført en <code>edit</code>.
          </p>
        </section>

        <section id="cherry-pick" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. cherry-pick — plukk én commit</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tar én commit (eller en rekke) fra en branch og kopierer den til
            din nåværende branch. Den får ny sha — det er en ny commit med
            samme diff.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Use-case: hotfix på release/1.2 — du vil ha den også på main:
git checkout main
git cherry-pick 9a7f3c1            # tar én commit
git cherry-pick 9a7f3c1..b2c3d4e   # tar et område (eks. b2c3d4e)
git cherry-pick --no-commit 9a7f3c1   # bare apply, ikke commit ennå

# Konflikt:
git cherry-pick --abort
git cherry-pick --continue   # etter at du har fikset filene + git add`}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Situasjon</th>
                  <th className="text-left font-semibold px-4 py-2">Hva du gjør</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Hotfix på release-gren skal også til main</td><td className="px-4 py-3 text-muted-foreground"><code>cherry-pick</code> commit-en til main.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Vil ha én commit fra en kollega sin WIP-branch</td><td className="px-4 py-3 text-muted-foreground"><code>cherry-pick</code> bare den ene.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Trenger hele branchen integrert</td><td className="px-4 py-3 text-muted-foreground"><code>merge</code> eller <code>rebase</code>, ikke cherry-pick.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="bisect" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. bisect — binærsøk etter bug</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Du vet «det funket forrige uke, nå er det knust» — men det er
            300 commits imellom. <code>git bisect</code> er binærsøk over
            historikken: du markerer good og bad, Git velger en commit
            midt i, du tester, gjentar.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Start
git bisect start
git bisect bad                  # HEAD er knust
git bisect good v1.2.0          # v1.2.0 funket

# Git plukker en commit i midten og checker den ut.
# Test appen din...

git bisect good                 # hvis denne funker
git bisect bad                  # hvis den er knust

# Gjenta. Etter log2(N) steg har Git pekt på den første bad-commiten:
# "abc123 is the first bad commit"

git bisect reset                # gå tilbake til HEAD når du er ferdig

# Med en testscript som returnerer 0 (good) / 1 (bad):
git bisect start HEAD v1.2.0
git bisect run ./test.sh`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Hvorfor binærsøk:</strong> 1024 commits trenger bare 10
            tester (log₂ 1024 = 10). Du sparer enormt med tid.
          </p>
        </section>

        <section id="reflog" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. reflog — rednings­bøyen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Git holder en lokal logg over alle ganger HEAD eller en branch
            har flyttet seg, i ca. 90 dager. Selv om en commit ikke er
            referert av noen branch, er den ikke borte før garbage
            collection kjører — du kan finne den i reflog.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# "Jeg gjorde git reset --hard og mistet alt!"
git reflog
# 1a2b3c4 HEAD@{0}: reset: moving to HEAD~3
# 9a7f3c1 HEAD@{1}: commit: feat: viktig arbeid jeg trodde var borte
# 8b6e2d0 HEAD@{2}: commit: forrige
# ...

# Hent tilbake:
git reset --hard HEAD@{1}
# eller, hvis du vil ha det som en branch:
git branch reddet HEAD@{1}

# "Jeg slettet en branch jeg ikke skulle slettet!"
git reflog --all | grep slettet-branch
git branch slettet-branch <sha>`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Reflog er lokalt. Det hjelper deg ikke hvis du har force-pushet
            ødeleggende — da må noen andre med en kopi av historikken hjelpe.
          </p>
        </section>

        <section id="diverse" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. stash, submodules, aliases, vanlige feller</h2>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              git stash — legg vekk midlertidig
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`git stash                 # pakker vekk working tree + staging
git stash -u              # inkludér untracked filer
git stash list
git stash pop             # legg tilbake siste + slett fra stash-stakken
git stash apply stash@{1} # apply en spesifikk uten å slette den`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              git submodule — repo i et repo (kort)
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`git submodule add https://github.com/foo/bar libs/bar
git submodule update --init --recursive   # etter clone

# Hver submodule peker på en EKSAKT commit i sitt eget repo.
# Når du oppdaterer submodulen, må parent-repoet committe det:
cd libs/bar && git pull origin main && cd ../..
git add libs/bar
git commit -m "chore: bump bar to <sha>"`}</pre>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Nyttige aliases
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`git config --global alias.st status
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.last "log -1 HEAD"
git config --global alias.unstage "restore --staged"

# Bruk:
git lg
git unstage fil.txt`}</pre>
          </div>

          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Force-push og main:</span>{" "}
              <code>git push --force</code> overskriver remoten med din lokale
              versjon. Hvis andre har basert seg på remoten, mister de commits.
              Bruk <code>--force-with-lease</code> i stedet — den nekter å
              pushe hvis remoten har endret seg siden du sist hentet.
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Felle</th>
                  <th className="text-left font-semibold px-4 py-2">Fiks</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Pushet en hemmelighet til offentlig repo</td><td className="px-4 py-3 text-muted-foreground">Roter hemmeligheten umiddelbart. Rewriting med <code>git filter-repo</code> fjerner ikke kopier andre allerede har sett.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Merge-konflikt med <code>{`<<<<<<<`}</code>-markører i koden</td><td className="px-4 py-3 text-muted-foreground">Velg riktig versjon, fjern markørene, <code>git add</code>, <code>git commit</code> (eller <code>git rebase --continue</code>).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">«Det er ingen endringer å committe» — men du ser dem i editoren</td><td className="px-4 py-3 text-muted-foreground">Du står sannsynligvis i feil katalog, eller filene matcher <code>.gitignore</code>.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 text-muted-foreground">Du committet på feil branch</td><td className="px-4 py-3 text-muted-foreground"><code>git log -1 --format=%H</code>, så <code>git checkout riktig-branch</code>, <code>git cherry-pick &lt;sha&gt;</code>, så <code>git reset --hard HEAD~1</code> på feil branch.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "docker" }} className="text-brand hover:underline">
                Docker
              </Link>
              {" "}— pakke kode som et image.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "linux-cli-advanced" }} className="text-brand hover:underline">
                Linux-CLI advanced
              </Link>
              {" "}— sed, awk, jq, prosess-debugging.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
