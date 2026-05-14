// Sanity-test: for hvert scenario kjør setup, deretter `solution`-linjene.
// Forvent at `check(repo).ok === true` etter at solution er kjørt.
// Brukes som rask regresjons-sjekk for engine + scenario-author bugs.

import { runScript, freshRepo } from "../src/lib/git/commands";
import { GIT_SCENARIOS } from "../src/lib/git/scenarios";

let pass = 0;
let fail = 0;

for (const s of GIT_SCENARIOS) {
  // 1) Kjør setup
  const setupRes = runScript(freshRepo(), s.setup);
  // 2) Kjør solution
  // Hopp over linjer som har <placeholder> — de er ment for studenten.
  const solutionLines = s.solution.filter((l) => !l.includes("<"));
  const finalRes = runScript(setupRes.repo, solutionLines);
  const check = s.check(finalRes.repo);

  // Spesialhåndtering: "a-revert-via-checkout" har en placeholder hash, så vi
  // simulerer en alternativ løsning som kjører `git log --oneline` for å finne
  // hashen og sjekke ut den.
  if (s.id === "a-revert-via-checkout") {
    // Finn første commit (root)
    const repo = setupRes.repo;
    const rootHash = Object.keys(repo.objects).find(
      (h) => repo.objects[h].parents.length === 0,
    );
    if (rootHash) {
      const res = runScript(setupRes.repo, [`git checkout ${rootHash}`]);
      const ok = s.check(res.repo).ok;
      if (ok) {
        pass++;
        console.log(`✓ ${s.id}  (via checkout ${rootHash})`);
      } else {
        fail++;
        console.error(`✗ ${s.id}  (via checkout ${rootHash}) — ${s.check(res.repo).missing}`);
      }
      continue;
    }
  }

  if (check.ok) {
    pass++;
    console.log(`✓ ${s.id}`);
  } else {
    fail++;
    console.error(`✗ ${s.id}  — ${check.missing}`);
    // Debug: print state
    console.error(`   repo.initialized=${finalRes.repo.initialized}`);
    console.error(`   branches=${Object.keys(finalRes.repo.refs).join(",")}`);
    console.error(`   workdir=${JSON.stringify(finalRes.repo.workdir)}`);
    console.error(`   index=${JSON.stringify(finalRes.repo.index)}`);
  }
}

console.log(`\n${pass}/${GIT_SCENARIOS.length} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
