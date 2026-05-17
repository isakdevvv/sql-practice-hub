import { useEffect, useMemo, useRef, useState } from "react";

/**
 * JournalingAnimator — write-ahead journaling i ext4-stil.
 *
 * Brukeren velger en operasjon (create / rename). Vi viser 5 stadier:
 *   1. TxB  — begin transaction til journal
 *   2. Data — data-blokk skrives (rekkefølgen avhenger av modus)
 *   3. Meta → journal — metadata-endring skrives til journal
 *   4. TxE  — commit-blokk synces til journal
 *   5. Checkpoint — metadata flyttes til endelig plass; journal frigis
 *
 * Brukeren kan klikke "Krasj!" når som helst og se hva som skjer ved
 * reboot — replay av commit-ede transaksjoner, ellers rollback.
 *
 * Modus-velger viser hvordan data-skrivet plasserer seg:
 *   - writeback: ingen ordering, data kan komme før eller etter meta-commit
 *   - ordered (default): data tvinges FØR meta-commit
 *   - journal: data går også gjennom journalen (dobbeltskrivning)
 */

type Mode = "writeback" | "ordered" | "journal";
type Op = "create" | "rename";

type StageKind =
  | "idle"
  | "txb"
  | "data-write"
  | "meta-journal"
  | "txe"
  | "checkpoint"
  | "done";

type Stage = {
  kind: StageKind;
  label: string;
  detail: string;
  /** Hva som vises som "på disk" etter dette steget. */
  diskMutations: {
    journalTxB?: boolean;
    journalMeta?: boolean;
    journalData?: boolean;
    journalCommit?: boolean;
    mainData?: boolean;
    mainMeta?: boolean;
  };
};

function buildStages(op: Op, mode: Mode): Stage[] {
  const opLabel =
    op === "create" ? "create('newfile.txt')" : "rename('a','b')";

  const dataWriteStage: Stage = {
    kind: "data-write",
    label: "Skriv data-blokk",
    detail:
      mode === "writeback"
        ? "data=writeback: data kan skrives nå, før, eller etter meta-commit. Ingen ordering-garantier."
        : mode === "ordered"
          ? "data=ordered (default): data tvinges til hoveddisk FØR meta-commit. Garanterer at gammel data ikke 'lekker frem' etter crash."
          : "data=journal: dataen kopieres til journalen. Selve hoveddisk-skrivet skjer ved checkpoint.",
    diskMutations:
      mode === "journal"
        ? { journalData: true, journalTxB: true }
        : { mainData: true, journalTxB: true },
  };

  return [
    {
      kind: "idle",
      label: "Init",
      detail: `Bruker kjører ${opLabel}. Kjernen pakker endringene i en transaksjon.`,
      diskMutations: {},
    },
    {
      kind: "txb",
      label: "TxB — begin",
      detail:
        "Journal-blokk skrives: transaction begin (TxB). Sekvensnummer + intent.",
      diskMutations: { journalTxB: true },
    },
    dataWriteStage,
    {
      kind: "meta-journal",
      label: "Meta → journal",
      detail:
        "Metadata-endring (inode + bitmap + dir-entry) skrives til journal-området.",
      diskMutations: {
        journalTxB: true,
        journalMeta: true,
        ...(mode === "journal"
          ? { journalData: true }
          : { mainData: true }),
      },
    },
    {
      kind: "txe",
      label: "TxE — commit (fsync)",
      detail:
        "Commit-blokk skrives med checksum og sync-barrier. ETTER dette er transaksjonen 'durable' — replay vil fullføre den.",
      diskMutations: {
        journalTxB: true,
        journalMeta: true,
        journalCommit: true,
        ...(mode === "journal"
          ? { journalData: true }
          : { mainData: true }),
      },
    },
    {
      kind: "checkpoint",
      label: "Checkpoint",
      detail:
        mode === "journal"
          ? "Data + metadata flyttes fra journal til endelige posisjoner på disken. Journal-blokkene markeres frie."
          : "Metadata kopieres fra journal til endelig posisjon på disken. Journal-blokkene markeres frie.",
      diskMutations: {
        mainData: true,
        mainMeta: true,
      },
    },
    {
      kind: "done",
      label: "Ferdig",
      detail: "Transaksjonen er fullført og journalen er trimmet.",
      diskMutations: {
        mainData: true,
        mainMeta: true,
      },
    },
  ];
}

type CrashOutcome = {
  label: string;
  detail: string;
  finalState: "rolled-back" | "replayed" | "consistent" | "corrupt";
};

function computeCrashOutcome(
  stages: Stage[],
  crashAt: number,
  mode: Mode,
  journaled: boolean,
): CrashOutcome {
  if (!journaled) {
    // Ikke-journalet FS: hvis vi krasjer etter en delvis meta-skriv → korrupt.
    if (crashAt === 0) {
      return {
        label: "Ingen endring",
        detail: "Krasj før noe skjedde — disken er som før.",
        finalState: "consistent",
      };
    }
    const reachedCheckpoint = stages
      .slice(0, crashAt + 1)
      .some((s) => s.kind === "checkpoint" || s.kind === "done");
    const reachedMetaWrite = stages
      .slice(0, crashAt + 1)
      .some(
        (s) =>
          s.kind === "data-write" ||
          s.kind === "meta-journal" ||
          s.kind === "txe",
      );
    if (reachedCheckpoint) {
      return {
        label: "Tilfeldigvis OK",
        detail:
          "Meta-skrivet rakk å fullføre — diskens metadata er konsistent, men dette er ren flaks.",
        finalState: "consistent",
      };
    }
    if (reachedMetaWrite) {
      return {
        label: "KORRUPT",
        detail:
          "Uten journal: krasj midt i meta-skriv = halvferdig inode/bitmap/dir-entry. Trenger fsck (treg, scanner hele disken) og kan tape data.",
        finalState: "corrupt",
      };
    }
    return {
      label: "Ingen skade",
      detail: "Krasj før metadata-skriv. Ingenting endret.",
      finalState: "consistent",
    };
  }

  // Journalet FS: replay hvis commit-blokk er skrevet, ellers rollback.
  const stagesSoFar = stages.slice(0, crashAt + 1);
  const committed = stagesSoFar.some(
    (s) => s.kind === "txe" || s.kind === "checkpoint" || s.kind === "done",
  );
  if (committed) {
    const detail =
      mode === "ordered"
        ? "Journal har TxE → replay. Data var allerede flushet (ordered), så meta-replay kobler den på sin nye plass. Konsistent."
        : mode === "journal"
          ? "Journal har både data og TxE → replay kopierer både data og meta til endelig posisjon. Konsistent."
          : "Journal har TxE → meta-replay fullføres. Data kan være delvis (writeback gir ingen ordering), men metadata peker på data som EKSISTERER eller var der før — ingen kjerne-korrupsjon, men appen kan se gammel/ny data blandet.";
    return {
      label: "REPLAY",
      detail,
      finalState: "replayed",
    };
  }
  // Pre-commit
  const reachedJournalWrite = stagesSoFar.some(
    (s) => s.kind === "txb" || s.kind === "meta-journal" || s.kind === "data-write",
  );
  if (reachedJournalWrite) {
    return {
      label: "ROLLBACK",
      detail:
        "Ingen gyldig TxE-commit-blokk → hele transaksjonen ignoreres. Disken er tilbake til pre-transaksjon-state. Data-skrivet kan ha lekket (i writeback) men metadata referer det aldri.",
      finalState: "rolled-back",
    };
  }
  return {
    label: "Ingen endring",
    detail: "Krasj før noe ble skrevet.",
    finalState: "consistent",
  };
}

const OP_LABEL: Record<Op, string> = {
  create: "create('newfile.txt')",
  rename: "rename('a','b')",
};

export function JournalingAnimator() {
  const [mode, setMode] = useState<Mode>("ordered");
  const [op, setOp] = useState<Op>("create");
  const [journaled, setJournaled] = useState(true);
  const [stageIdx, setStageIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [crash, setCrash] = useState<CrashOutcome | null>(null);
  const playRef = useRef<number | null>(null);

  const stages = useMemo(() => buildStages(op, mode), [op, mode]);

  useEffect(() => {
    // Reset når input endres
    setStageIdx(0);
    setPlaying(false);
    setCrash(null);
  }, [op, mode, journaled]);

  useEffect(() => {
    if (!playing || crash) return;
    if (stageIdx >= stages.length - 1) {
      setPlaying(false);
      return;
    }
    playRef.current = window.setTimeout(() => {
      setStageIdx((i) => i + 1);
    }, 900);
    return () => {
      if (playRef.current !== null) {
        window.clearTimeout(playRef.current);
        playRef.current = null;
      }
    };
  }, [playing, stageIdx, stages.length, crash]);

  function play() {
    if (crash) return;
    if (stageIdx >= stages.length - 1) {
      setStageIdx(0);
    }
    setPlaying(true);
  }
  function pause() {
    setPlaying(false);
  }
  function step() {
    if (crash) return;
    if (stageIdx < stages.length - 1) setStageIdx((i) => i + 1);
  }
  function reset() {
    setStageIdx(0);
    setPlaying(false);
    setCrash(null);
  }
  function doCrash() {
    setPlaying(false);
    setCrash(computeCrashOutcome(stages, stageIdx, mode, journaled));
  }

  const stage = stages[stageIdx];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Mode + op + journaled */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Modus</div>
          <div className="flex flex-wrap gap-1.5">
            {(["writeback", "ordered", "journal"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`text-xs font-mono rounded-md border px-2 py-1 ${
                  mode === m
                    ? "border-brand bg-brand/10"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Operasjon</div>
          <div className="flex flex-wrap gap-1.5">
            {(["create", "rename"] as Op[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOp(o)}
                className={`text-xs font-mono rounded-md border px-2.5 py-1 ${
                  op === o
                    ? "border-brand bg-brand/10"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {OP_LABEL[o]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">FS-type</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setJournaled(true)}
              className={`text-xs rounded-md border px-2.5 py-1 ${
                journaled
                  ? "border-brand bg-brand/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Med journal (ext4)
            </button>
            <button
              type="button"
              onClick={() => setJournaled(false)}
              className={`text-xs rounded-md border px-2.5 py-1 ${
                !journaled
                  ? "border-rose-500 bg-rose-500/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              Uten journal
            </button>
          </div>
        </div>
      </div>

      {/* Stage progress */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Fremdrift (steg {stageIdx + 1} / {stages.length})
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {stages.map((s, i) => (
            <div
              key={i}
              className={`text-[10px] font-mono rounded px-1.5 py-1 text-center border ${
                i < stageIdx
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : i === stageIdx
                    ? "border-brand bg-brand/15 text-foreground"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          type="button"
          onClick={step}
          disabled={stageIdx >= stages.length - 1 || !!crash}
          className="text-xs rounded-md border border-brand bg-brand/10 px-3 py-1.5 hover:bg-brand/20 disabled:opacity-40"
        >
          Steg
        </button>
        {playing ? (
          <button
            type="button"
            onClick={pause}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={play}
            disabled={!!crash}
            className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted disabled:opacity-40"
          >
            Spill
          </button>
        )}
        <button
          type="button"
          onClick={doCrash}
          disabled={!!crash || stageIdx === 0}
          className="text-xs rounded-md border border-rose-500/60 bg-rose-500/10 text-rose-600 px-3 py-1.5 hover:bg-rose-500/20 disabled:opacity-40"
        >
          ⚡ Krasj!
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-xs rounded-md border border-border bg-background px-3 py-1.5 hover:bg-muted"
        >
          Reset
        </button>
      </div>

      {/* Disk visualisering */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <DiskPanel
          title="Journal-område"
          accent="sky"
          rows={[
            { label: "TxB (begin)", active: !!stage.diskMutations.journalTxB, color: "sky" },
            {
              label: "Meta-blokker",
              active: !!stage.diskMutations.journalMeta,
              color: "sky",
            },
            ...(mode === "journal"
              ? [
                  {
                    label: "Data-blokker (kopi)",
                    active: !!stage.diskMutations.journalData,
                    color: "sky" as const,
                  },
                ]
              : []),
            {
              label: "TxE (commit)",
              active: !!stage.diskMutations.journalCommit,
              color: "emerald",
              important: true,
            },
          ]}
          journaled={journaled}
        />
        <DiskPanel
          title="Hoveddisk (endelig plass)"
          accent="amber"
          rows={[
            {
              label: "Data-blokker",
              active: !!stage.diskMutations.mainData,
              color: "amber",
            },
            {
              label: "Meta (inode/bitmap/dir)",
              active: !!stage.diskMutations.mainMeta,
              color: "amber",
            },
          ]}
          journaled={true}
        />
      </div>

      <div className="rounded-md border border-border bg-background p-3 mb-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          {stage.label}
        </div>
        <p className="text-xs text-foreground">{stage.detail}</p>
      </div>

      {crash && (
        <CrashBanner outcome={crash} mode={mode} journaled={journaled} />
      )}

      <div className="mt-4 grid sm:grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-md border border-border p-2">
          <div className="font-semibold text-foreground mb-0.5">writeback</div>
          <div className="text-muted-foreground">
            Bare metadata journales. Data uten ordering — kan vise "gammel"
            data etter crash.
          </div>
        </div>
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
            ordered (default)
          </div>
          <div className="text-muted-foreground">
            Data → hoveddisk FØR meta-commit. Hindrer "lekkasje" av gammel
            data. Best balanse for de fleste.
          </div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="font-semibold text-foreground mb-0.5">journal</div>
          <div className="text-muted-foreground">
            Data + meta gjennom journal. Sterkest garanti, ~halv throughput
            pga. dobbeltskrivning.
          </div>
        </div>
      </div>
    </div>
  );
}

function DiskPanel({
  title,
  accent,
  rows,
  journaled,
}: {
  title: string;
  accent: "sky" | "amber";
  rows: Array<{
    label: string;
    active: boolean;
    color: "sky" | "amber" | "emerald";
    important?: boolean;
  }>;
  journaled: boolean;
}) {
  const borderC =
    accent === "sky" ? "border-sky-500/30" : "border-amber-500/30";
  const bgC = accent === "sky" ? "bg-sky-500/5" : "bg-amber-500/5";
  const textC =
    accent === "sky"
      ? "text-sky-600 dark:text-sky-400"
      : "text-amber-600 dark:text-amber-400";
  return (
    <div className={`rounded-lg border ${borderC} ${bgC} p-3`}>
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${textC} mb-2`}>
        {title}
        {!journaled && (
          <span className="ml-2 text-rose-500">(ikke i bruk — no journal)</span>
        )}
      </div>
      <div className="space-y-1">
        {rows.map((r, i) => {
          const stateClass = !journaled
            ? "border-border bg-muted/30 text-muted-foreground line-through"
            : r.active
              ? r.color === "emerald"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : r.color === "sky"
                  ? "border-sky-500/50 bg-sky-500/15 text-sky-600 dark:text-sky-400"
                  : "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "border-border bg-background text-muted-foreground";
          return (
            <div
              key={i}
              className={`text-xs font-mono rounded border px-2 py-1 flex items-center justify-between ${stateClass} ${r.important ? "font-bold" : ""}`}
            >
              <span>{r.label}</span>
              <span className="text-[10px]">
                {!journaled ? "—" : r.active ? "skrevet" : "tom"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CrashBanner({
  outcome,
  mode,
  journaled,
}: {
  outcome: CrashOutcome;
  mode: Mode;
  journaled: boolean;
}) {
  const colorMap = {
    "rolled-back": "border-amber-500/50 bg-amber-500/10",
    replayed: "border-emerald-500/50 bg-emerald-500/10",
    consistent: "border-sky-500/50 bg-sky-500/10",
    corrupt: "border-rose-500/60 bg-rose-500/15",
  };
  const textMap = {
    "rolled-back": "text-amber-600 dark:text-amber-400",
    replayed: "text-emerald-600 dark:text-emerald-400",
    consistent: "text-sky-600 dark:text-sky-400",
    corrupt: "text-rose-600 dark:text-rose-400",
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[outcome.finalState]}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none">⚡</span>
        <div>
          <div className={`font-semibold text-sm ${textMap[outcome.finalState]}`}>
            Reboot etter krasj — {outcome.label}
          </div>
          <p className="text-xs text-foreground mt-1">{outcome.detail}</p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Konfig: {journaled ? `journal=${mode}` : "ingen journal (FAT-stil)"}
            . Sammenlign: bytt FS-type og kjør samme operasjon på nytt — uten
            journal kan samme krasjpunkt gi korrupt filsystem som krever fsck.
          </p>
        </div>
      </div>
    </div>
  );
}
