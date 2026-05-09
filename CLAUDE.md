# Working in this repo with Claude Code

This repo has hit serious problems with multiple Claude Code sessions writing to the same files in `main` at the same time. The DDL/CREATE TABLE work, the flyplass/bilsalg expansion, and the kap. 6/9/10 flashcards have all been silently overwritten by parallel sessions because they shared the working tree. Read this before you make any edits.

## The hard rule: never edit `main` directly

The working tree at `/Users/isak/sql-practice-hub` is the shared `main` branch. **Do not edit files there.** Every Claude Code session must do its work inside a git worktree on its own branch, then merge back to `main` once and only once when the feature is complete.

If you are about to call `Edit` or `Write` and the file is under `/Users/isak/sql-practice-hub/src/...` (i.e. the main worktree), stop. Move into a worktree first.

## Standard workflow

```bash
# 1. Pick a name for the feature.
FEATURE=add-foo-problems

# 2. Make a worktree on a new branch off latest main.
cd /Users/isak/sql-practice-hub
git fetch origin
git worktree add ../sql-practice-hub-$FEATURE -b feat/$FEATURE origin/main
cd ../sql-practice-hub-$FEATURE

# 3. Do all editing here. Run dev server, tests, etc. against this worktree.
bun install   # only if node_modules isn't shared
bun run dev   # if you need the preview

# 4. Commit early, commit often.
git add -A
git commit -m "feat: <what you did>"

# 5. When the feature is done AND verified, merge to main:
cd /Users/isak/sql-practice-hub
git fetch origin
git checkout main
git pull --ff-only origin main          # make sure main is current
git merge --no-ff feat/$FEATURE         # merge commit so the history is clear
git push origin main

# 6. Clean up.
git worktree remove ../sql-practice-hub-$FEATURE
git branch -d feat/$FEATURE
```

The merge step is the only moment a session touches `main`'s working tree. Everything before that happens in isolation.

## Rules for the merge step

- **Always rebase or pull main first.** `git pull --ff-only origin main` before merging your branch. If that fails, your local main is divergent — investigate, don't force.
- **Conflicts in `data.ts` / `datasets.ts` / `flashcards.ts` / `dragExercises.ts` are likely.** These files are append-only lists of objects. Resolve by keeping BOTH lists of new entries (concatenate) — never pick one side wholesale. Re-run `bun -e "import('./src/lib/problems/data.ts').then(m => console.log(m.PROBLEMS.length))"` after the resolve to make sure the file still parses and counts went up, not down.
- **One feature = one merge.** Don't pile multiple half-done features into a single merge commit. If a feature is split across several commits, that's fine — just keep them on the same branch.
- **Push immediately after merging.** That makes the change visible to other sessions on their next `fetch`, so they can rebase before they merge.

## Coordination between concurrent sessions

If you start a session and `git worktree list` shows other active worktrees besides the main one and your own, assume those are other Claude Code sessions in flight. To stay out of their way:

1. Pick a feature scope that doesn't touch the same large files they're touching. The append-only lists (`data.ts`, `flashcards.ts`, `dragExercises.ts`) tolerate concurrent appends well *if* both sides handle the merge carefully — but if you can pick a different file, do.
2. Before you start editing, `git fetch origin` and check `git log origin/main..HEAD` and `git log HEAD..origin/main` — make sure your branch is based on a recent main.
3. Rebase before you merge: `git fetch origin && git rebase origin/main` from inside your worktree, resolve conflicts there, then merge.

If you discover that someone has been editing the main worktree directly (i.e. uncommitted changes in `/Users/isak/sql-practice-hub` that don't match HEAD), do not blow them away. They may be the user's in-progress work or another session's lost output — leave them and ask.

## Why this matters

We've already lost work twice in this repo because of concurrent edits to `main`:
- `datasets.ts` got reverted from 15 datasets to 4. Recovered from a dangling git blob (`4823a87a`).
- `data.ts` lost ~40 newly-added problems (k3-ct-*, fly-7..fly-16, bil-q-1..bil-q-10) because another session overwrote it while a different session was still editing.

Both losses happened because the sessions were writing to the same path in the same working tree at the same time. There is no warning when this happens — `Edit` succeeds silently, then the next session's `Write` clobbers the result.

The worktree workflow above prevents this entirely. Use it.

## Recovery: if work has been overwritten

`git fsck --lost-found` will list dangling blobs. The full versions of files often survive there because Claude Code's tool calls touch git internals enough to leave the old content as orphaned blobs.

```bash
# List dangling blobs and find ones that look like the file you lost:
for blob in $(git fsck --lost-found 2>/dev/null | awk '{print $3}'); do
  size=$(git cat-file -s $blob 2>/dev/null)
  head=$(git cat-file -p $blob 2>/dev/null | head -1)
  echo "$blob $size $head"
done | grep -i "import.*problem"   # or whatever string is unique to your file

# Restore once you've identified the right blob:
git cat-file -p <blob-sha> > path/to/file.ts
```

Verify content makes sense before you commit.
