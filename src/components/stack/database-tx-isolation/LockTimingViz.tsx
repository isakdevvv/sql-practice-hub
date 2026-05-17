import { useMemo, useState } from "react";
import { Lock, Unlock, AlertTriangle, RotateCcw } from "lucide-react";
import { prettyIso, type IsolationLevel } from "./txEngine";

// ---------------------------------------------------------------------------
// LockTimingViz
//
// SVG-timeline som viser når shared / exclusive / range-låser tas og slippes
// for ulike isolasjonsnivåer. To "spor" (A og B), tid horisontalt, lås-bars
// vertikalt. Tre forhåndsdefinerte scenarier:
//
//   1. "to-leser-samme-rad"  — viser hvordan SELECT-låser skiller seg
//   2. "leser-så-skriver"    — RC slipper tidlig; RR/SERIALIZABLE holder
//   3. "deadlock-syklus"     — to UPDATE i motsatt rekkefølge
//
// Hver event har { tx, t, kind, label, mode? } og vi visualiserer som
// horisontale bars over tid.
// ---------------------------------------------------------------------------

type EventKind = "begin" | "select" | "update" | "commit" | "wait" | "killed";
type Tx = "A" | "B";

type TimelineEvent = {
  tx: Tx;
  t: number; // tick start
  durationT: number; // tick duration
  kind: EventKind;
  label: string;
  /** Hvilken lås tas av denne handlingen. */
  lock?: {
    name: string;
    mode: "S" | "X" | "R"; // shared, exclusive, range
    /** når slippes (relativt til t=0)? */
    releasedAt: number;
  };
};

type Scenario = {
  id: string;
  title: string;
  blurb: string;
  /** Builder gir tilbake events for et gitt isolation level. */
  build: (iso: IsolationLevel) => {
    events: TimelineEvent[];
    explanation: string;
    deadlock?: boolean;
    /** Hvis tx aborteres pga deadlock/serialization, hvilken? */
    victim?: Tx;
  };
};

const SCENARIOS: Scenario[] = [
  {
    id: "two-readers",
    title: "Begge bare leser",
    blurb:
      "A og B kjører samme SELECT mot rad 1. Hva slags lås tar de, og når slippes den?",
    build: (iso) => {
      const events: TimelineEvent[] = [];
      events.push({ tx: "A", t: 0, durationT: 1, kind: "begin", label: "BEGIN" });
      events.push({ tx: "B", t: 1, durationT: 1, kind: "begin", label: "BEGIN" });
      // A reads
      events.push({
        tx: "A",
        t: 2,
        durationT: 1,
        kind: "select",
        label: "SELECT id=1",
        lock:
          iso === "READ_UNCOMMITTED"
            ? undefined
            : {
                name: "S(rad 1)",
                mode: "S",
                releasedAt: iso === "READ_COMMITTED" ? 3 : 8,
              },
      });
      // B reads
      events.push({
        tx: "B",
        t: 3,
        durationT: 1,
        kind: "select",
        label: "SELECT id=1",
        lock:
          iso === "READ_UNCOMMITTED"
            ? undefined
            : {
                name: "S(rad 1)",
                mode: "S",
                releasedAt: iso === "READ_COMMITTED" ? 4 : 8,
              },
      });
      events.push({ tx: "A", t: 7, durationT: 1, kind: "commit", label: "COMMIT" });
      events.push({ tx: "B", t: 8, durationT: 1, kind: "commit", label: "COMMIT" });
      const expl =
        iso === "READ_UNCOMMITTED"
          ? "Ingen lese-låser i det hele tatt. Alt går unna."
          : "Shared-låser er kompatible — begge får S(rad 1) samtidig. " +
            (iso === "READ_COMMITTED"
              ? "Under RC slippes hver S-lås rett etter at SELECT er ferdig."
              : "Under RR/SERIALIZABLE holdes leselåsen til COMMIT — eller, mer praktisk i moderne DB-er: en snapshot fryses ved første read.");
      return { events, explanation: expl };
    },
  },
  {
    id: "read-then-write",
    title: "A leser, B vil oppdatere samme rad",
    blurb:
      "A SELECTer rad 1, deretter forsøker B UPDATE på samme rad. Hvor lenge må B vente?",
    build: (iso) => {
      const events: TimelineEvent[] = [];
      events.push({ tx: "A", t: 0, durationT: 1, kind: "begin", label: "BEGIN" });
      events.push({ tx: "B", t: 1, durationT: 1, kind: "begin", label: "BEGIN" });
      const aReleasesS =
        iso === "READ_UNCOMMITTED"
          ? 0
          : iso === "READ_COMMITTED"
            ? 3
            : 8;
      events.push({
        tx: "A",
        t: 2,
        durationT: 1,
        kind: "select",
        label: "SELECT id=1",
        lock:
          iso === "READ_UNCOMMITTED"
            ? undefined
            : { name: "S(rad 1)", mode: "S", releasedAt: aReleasesS },
      });

      // B vil ta X(rad 1). Hvis A holder S → B må vente til A slipper.
      const bStartsWait = 3;
      const xAcquired =
        iso === "READ_UNCOMMITTED"
          ? 4
          : iso === "READ_COMMITTED"
            ? 4 // A slapp S ved t=3
            : aReleasesS; // A holder S til COMMIT under RR/SERIAL

      if (iso !== "READ_UNCOMMITTED" && xAcquired > 4) {
        events.push({
          tx: "B",
          t: bStartsWait,
          durationT: xAcquired - bStartsWait,
          kind: "wait",
          label: "venter på A's S-lås",
        });
      }

      events.push({
        tx: "B",
        t: xAcquired,
        durationT: 1,
        kind: "update",
        label: "UPDATE id=1",
        lock: { name: "X(rad 1)", mode: "X", releasedAt: xAcquired + 4 },
      });

      events.push({
        tx: "A",
        t: aReleasesS === 0 ? 6 : aReleasesS,
        durationT: 1,
        kind: "commit",
        label: "COMMIT",
      });
      events.push({
        tx: "B",
        t: xAcquired + 4,
        durationT: 1,
        kind: "commit",
        label: "COMMIT",
      });
      const expl =
        iso === "READ_UNCOMMITTED"
          ? "Ingen S-låser → B kan oppdatere når som helst, men sliter med dirty/lost-update."
          : iso === "READ_COMMITTED"
            ? "A slipper S-låsen rett etter SELECT, så B's UPDATE må bare vente kort."
            : "Under RR/SERIALIZABLE holdes A's S-lås (eller snapshot) til COMMIT — B må vente lenger.";
      return { events, explanation: expl };
    },
  },
  {
    id: "deadlock",
    title: "Deadlock — to UPDATEs i motsatt rekkefølge",
    blurb:
      "A låser rad 1 og vil ha rad 2; B låser rad 2 og vil ha rad 1. Klassisk syklus.",
    build: (iso) => {
      void iso;
      const events: TimelineEvent[] = [];
      events.push({ tx: "A", t: 0, durationT: 1, kind: "begin", label: "BEGIN" });
      events.push({ tx: "B", t: 0, durationT: 1, kind: "begin", label: "BEGIN" });
      events.push({
        tx: "A",
        t: 1,
        durationT: 1,
        kind: "update",
        label: "UPDATE id=1",
        lock: { name: "X(rad 1)", mode: "X", releasedAt: 9 },
      });
      events.push({
        tx: "B",
        t: 1,
        durationT: 1,
        kind: "update",
        label: "UPDATE id=2",
        lock: { name: "X(rad 2)", mode: "X", releasedAt: 9 },
      });
      // A vil ha rad 2 → blokkert av B
      events.push({
        tx: "A",
        t: 2,
        durationT: 5,
        kind: "wait",
        label: "venter på X(rad 2) holdt av B",
      });
      // B vil ha rad 1 → blokkert av A
      events.push({
        tx: "B",
        t: 2,
        durationT: 5,
        kind: "wait",
        label: "venter på X(rad 1) holdt av A",
      });
      // DB detekterer → dreper B (yngste/billigste)
      events.push({
        tx: "B",
        t: 7,
        durationT: 1,
        kind: "killed",
        label: "DB: deadlock detected → ROLLBACK B",
      });
      // A fortsetter
      events.push({
        tx: "A",
        t: 8,
        durationT: 1,
        kind: "commit",
        label: "COMMIT",
      });
      return {
        events,
        deadlock: true,
        victim: "B",
        explanation:
          "DB-en kjører jevnlig en deadlock-detektor som bygger wait-for-grafen. Når den finner en syklus, dreper den én tx (offeret) — typisk yngste eller den med færrest ressurser. Klienten må fange feilen og prøve på nytt.",
      };
    },
  },
];

const ISO_LEVELS: IsolationLevel[] = [
  "READ_UNCOMMITTED",
  "READ_COMMITTED",
  "REPEATABLE_READ",
  "SERIALIZABLE",
];

export function LockTimingViz() {
  const [iso, setIso] = useState<IsolationLevel>("READ_COMMITTED");
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );
  const built = useMemo(() => scenario.build(iso), [scenario, iso]);

  // Layout
  const TICK_W = 50;
  const TRACK_H = 64;
  const LABEL_W = 70;
  const PADDING_TOP = 30;
  const PADDING_BOTTOM = 80;
  const maxTick = Math.max(
    10,
    ...built.events.map((e) => e.t + e.durationT),
    ...built.events.flatMap((e) => (e.lock ? [e.lock.releasedAt] : [])),
  );
  const totalW = LABEL_W + (maxTick + 2) * TICK_W;
  const totalH = PADDING_TOP + TRACK_H * 2 + PADDING_BOTTOM;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Scenario
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenarioId(s.id)}
              className={`text-[11px] rounded-md border px-2.5 py-1 transition-colors ${
                s.id === scenarioId
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Isolation
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ISO_LEVELS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIso(i)}
              className={`text-[10px] font-mono rounded border px-2 py-0.5 transition-colors ${
                i === iso
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {prettyIso(i)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setIso("READ_COMMITTED");
            setScenarioId(SCENARIOS[0].id);
          }}
          className="ml-auto text-xs rounded-md border border-border bg-background px-3 py-1 hover:bg-muted flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{scenario.blurb}</p>

      <div className="overflow-x-auto rounded-lg border border-border bg-background p-2">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{ minWidth: totalW, maxWidth: totalW }}
          className="max-w-full"
          role="img"
          aria-label="Lock timing diagram"
        >
          {/* Track labels */}
          <text
            x={8}
            y={PADDING_TOP + TRACK_H / 2 + 4}
            className="fill-emerald-600 text-[12px] font-semibold font-mono"
          >
            Tx A
          </text>
          <text
            x={8}
            y={PADDING_TOP + TRACK_H + TRACK_H / 2 + 4}
            className="fill-sky-600 text-[12px] font-semibold font-mono"
          >
            Tx B
          </text>

          {/* Time axis tick marks */}
          {Array.from({ length: maxTick + 1 }).map((_, t) => {
            const x = LABEL_W + t * TICK_W;
            return (
              <g key={`tick-${t}`}>
                <line
                  x1={x}
                  y1={PADDING_TOP - 8}
                  x2={x}
                  y2={PADDING_TOP + TRACK_H * 2 + 4}
                  className="stroke-border"
                  strokeWidth={0.5}
                  strokeDasharray="2 3"
                />
                <text
                  x={x}
                  y={PADDING_TOP - 12}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  t={t}
                </text>
              </g>
            );
          })}

          {/* Track baselines */}
          <line
            x1={LABEL_W}
            y1={PADDING_TOP + TRACK_H / 2}
            x2={LABEL_W + maxTick * TICK_W + TICK_W}
            y2={PADDING_TOP + TRACK_H / 2}
            className="stroke-emerald-500/30"
            strokeWidth={1}
          />
          <line
            x1={LABEL_W}
            y1={PADDING_TOP + TRACK_H + TRACK_H / 2}
            x2={LABEL_W + maxTick * TICK_W + TICK_W}
            y2={PADDING_TOP + TRACK_H + TRACK_H / 2}
            className="stroke-sky-500/30"
            strokeWidth={1}
          />

          {/* Events */}
          {built.events.map((e, i) => {
            const y =
              e.tx === "A"
                ? PADDING_TOP + TRACK_H / 2
                : PADDING_TOP + TRACK_H + TRACK_H / 2;
            const x = LABEL_W + e.t * TICK_W;
            const w = Math.max(TICK_W * e.durationT, 32);
            const fill =
              e.kind === "wait"
                ? "fill-amber-500/30 stroke-amber-500"
                : e.kind === "killed"
                  ? "fill-rose-500/40 stroke-rose-500"
                  : e.kind === "begin"
                    ? "fill-muted stroke-border"
                    : e.kind === "commit"
                      ? "fill-brand/20 stroke-brand"
                      : e.kind === "update"
                        ? "fill-rose-500/20 stroke-rose-500"
                        : "fill-emerald-500/15 stroke-emerald-500";
            return (
              <g key={`ev-${i}`}>
                <rect
                  x={x + 2}
                  y={y - 14}
                  width={w - 4}
                  height={28}
                  rx={4}
                  className={fill}
                  strokeWidth={1}
                />
                <text
                  x={x + w / 2}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-mono"
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* Locks (rendered below events) */}
          {built.events.map((e, i) => {
            if (!e.lock) return null;
            const y =
              e.tx === "A"
                ? PADDING_TOP + TRACK_H / 2 + 22
                : PADDING_TOP + TRACK_H + TRACK_H / 2 + 22;
            const x = LABEL_W + e.t * TICK_W;
            const xEnd = LABEL_W + e.lock.releasedAt * TICK_W;
            const w = Math.max(xEnd - x, 20);
            const color =
              e.lock.mode === "X"
                ? "fill-rose-500/30 stroke-rose-500"
                : e.lock.mode === "R"
                  ? "fill-violet-500/30 stroke-violet-500"
                  : "fill-emerald-500/30 stroke-emerald-500";
            return (
              <g key={`lk-${i}`}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={10}
                  rx={2}
                  className={color}
                  strokeWidth={1}
                />
                <text
                  x={x + 4}
                  y={y + 22}
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  {e.lock.mode}-lock: {e.lock.name} (t={e.t}..{e.lock.releasedAt})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground items-center">
        <LegendChip color="emerald" label="S-lock (shared / read)" icon="lock" />
        <LegendChip color="rose" label="X-lock (exclusive / write)" icon="lock" />
        <LegendChip color="violet" label="R-lock (range / predicate)" icon="lock" />
        <LegendChip color="amber" label="venter" icon="wait" />
        <LegendChip color="brand" label="commit" icon="unlock" />
      </div>

      {built.deadlock && (
        <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-rose-700 dark:text-rose-200 mb-0.5">
              Deadlock — offer: tx {built.victim}
            </div>
            <p className="text-rose-700/85 dark:text-rose-200/85">
              {built.explanation}
            </p>
          </div>
        </div>
      )}

      {!built.deadlock && (
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs text-foreground/85">
          {built.explanation}
        </div>
      )}
    </div>
  );
}

function LegendChip({
  color,
  label,
  icon,
}: {
  color: "emerald" | "rose" | "violet" | "amber" | "brand";
  label: string;
  icon: "lock" | "unlock" | "wait";
}) {
  const cls = {
    emerald: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/30 text-rose-700 dark:text-rose-300",
    violet: "bg-violet-500/30 text-violet-700 dark:text-violet-300",
    amber: "bg-amber-500/30 text-amber-700 dark:text-amber-300",
    brand: "bg-brand/30 text-brand",
  }[color];
  const Icon = icon === "lock" ? Lock : icon === "unlock" ? Unlock : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
