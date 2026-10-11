// Visualiser reconciliation: vis "før" og "etter" virtual DOM-tre side om side,
// fremhev hvilke noder React patcher / lager / fjerner. Demonstrer hvorfor `key`
// betyr noe — uten key blir samme operasjon dyrere fordi React må anta at noder
// flyttet i steden for å beholde dem.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; label: string };

type Op = "keep" | "patch" | "create" | "remove" | "move";

const OP_COLOR: Record<Op, string> = {
  keep: "border-border bg-background",
  patch: "border-sky-500 bg-sky-500/10",
  create: "border-emerald-500 bg-emerald-500/10",
  remove: "border-rose-500 bg-rose-500/10 line-through opacity-70",
  move: "border-amber-500 bg-amber-500/10",
};

const OP_LABEL: Record<Op, string> = {
  keep: "behold",
  patch: "patch",
  create: "skap",
  remove: "fjern",
  move: "flytt",
};

const SCENARIOS = {
  append: {
    label: "Legg til på slutten",
    before: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
    ],
    after: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
      { id: "c", label: "Kiwi" },
    ],
  },
  prepend: {
    label: "Legg til på starten",
    before: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
    ],
    after: [
      { id: "c", label: "Kiwi" },
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
    ],
  },
  remove: {
    label: "Fjern midt-element",
    before: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
      { id: "c", label: "Kiwi" },
    ],
    after: [
      { id: "a", label: "Eple" },
      { id: "c", label: "Kiwi" },
    ],
  },
  edit: {
    label: "Endre label",
    before: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
    ],
    after: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan (moden)" },
    ],
  },
  reorder: {
    label: "Snu rekkefølge",
    before: [
      { id: "a", label: "Eple" },
      { id: "b", label: "Banan" },
      { id: "c", label: "Kiwi" },
    ],
    after: [
      { id: "c", label: "Kiwi" },
      { id: "b", label: "Banan" },
      { id: "a", label: "Eple" },
    ],
  },
} as const;

type Scenario = keyof typeof SCENARIOS;

export function VirtualDomDiff() {
  const [scenario, setScenario] = useState<Scenario>("prepend");
  const [useKeys, setUseKeys] = useState(true);

  const { before, after } = SCENARIOS[scenario];

  const { beforeOps, afterOps, stats } = useMemo(
    () => diff(before, after, useKeys),
    [before, after, useKeys],
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-3 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Virtual DOM diff (reconciliation)
        </span>
      </div>

      <div className="px-4 py-3 border-b border-border bg-muted/10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Scenario
          </span>
          {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScenario(s)}
              className={cn(
                "rounded-md border px-2 py-0.5 text-xs transition-colors",
                scenario === s
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:border-brand/40",
              )}
            >
              {SCENARIOS[s].label}
            </button>
          ))}
        </div>
        <label className="ml-auto inline-flex items-center gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useKeys}
            onChange={(e) => setUseKeys(e.target.checked)}
            className="rounded border-border"
          />
          <span>
            Bruk stabile <code className="font-mono">key={"{id}"}</code>
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <TreePane title="Før render" items={before} ops={beforeOps} side="before" useKeys={useKeys} />
        <TreePane title="Etter render" items={after} ops={afterOps} side="after" useKeys={useKeys} />
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-3 text-[11px]">
        <div className="flex flex-wrap gap-3 mb-2">
          {(["keep", "patch", "create", "remove", "move"] as Op[]).map((op) => (
            <span key={op} className="inline-flex items-center gap-1.5">
              <span className={cn("inline-block w-3 h-3 rounded-sm border", OP_COLOR[op])} />
              <span className="text-muted-foreground">{OP_LABEL[op]}</span>
            </span>
          ))}
        </div>
        <div className="text-muted-foreground">
          React-jobb:{" "}
          <span className="font-mono text-foreground">
            {stats.patch} patch · {stats.create} create · {stats.remove} remove
          </span>
          {!useKeys && (stats.patch > 0 || stats.create > 0) && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              ← uten key må React anta posisjon = identitet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TreePane({
  title,
  items,
  ops,
  side,
  useKeys,
}: {
  title: string;
  items: readonly Item[];
  ops: Map<string, Op>;
  side: "before" | "after";
  useKeys: boolean;
}) {
  return (
    <div className={cn("p-4", side === "before" && "border-b md:border-b-0 md:border-r border-border")}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        {title}
      </div>
      <pre className="font-mono text-[11px] text-muted-foreground mb-2">
        {"<ul>"}
      </pre>
      <div className="space-y-1.5 pl-4">
        {items.map((item, idx) => {
          const key = `${side}:${idx}:${item.id}`;
          const op = ops.get(key) ?? "keep";
          return (
            <div
              key={key}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-mono flex items-center gap-2 transition-colors",
                OP_COLOR[op],
              )}
            >
              <span className="text-muted-foreground">
                {useKeys ? `<li key="${item.id}">` : `<li>`}
              </span>
              <span>{item.label}</span>
              <span className="text-muted-foreground">{"</li>"}</span>
              {op !== "keep" && (
                <span className="ml-auto text-[10px] uppercase tracking-wider opacity-75">
                  {OP_LABEL[op]}
                </span>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-xs text-muted-foreground italic">(tom)</div>
        )}
      </div>
      <pre className="font-mono text-[11px] text-muted-foreground mt-2">
        {"</ul>"}
      </pre>
    </div>
  );
}

function diff(
  before: readonly Item[],
  after: readonly Item[],
  useKeys: boolean,
): {
  beforeOps: Map<string, Op>;
  afterOps: Map<string, Op>;
  stats: { patch: number; create: number; remove: number; move: number };
} {
  const beforeOps = new Map<string, Op>();
  const afterOps = new Map<string, Op>();
  let patch = 0;
  let create = 0;
  let remove = 0;
  let move = 0;

  if (useKeys) {
    // Med key kan React matche på identitet uavhengig av posisjon.
    const beforeById = new Map(before.map((b, i) => [b.id, { item: b, idx: i }]));
    const afterById = new Map(after.map((a, i) => [a.id, { item: a, idx: i }]));

    before.forEach((b, i) => {
      const key = `before:${i}:${b.id}`;
      if (!afterById.has(b.id)) {
        beforeOps.set(key, "remove");
        remove += 1;
      } else {
        beforeOps.set(key, "keep");
      }
    });

    after.forEach((a, i) => {
      const key = `after:${i}:${a.id}`;
      const prev = beforeById.get(a.id);
      if (!prev) {
        afterOps.set(key, "create");
        create += 1;
      } else if (prev.item.label !== a.label) {
        afterOps.set(key, "patch");
        patch += 1;
      } else if (prev.idx !== i) {
        afterOps.set(key, "move");
        move += 1;
      } else {
        afterOps.set(key, "keep");
      }
    });
  } else {
    // Uten key sammenligner React posisjon-for-posisjon. Det betyr at
    // f.eks. å sette inn et nytt element først tolkes som "patch alle
    // eksisterende noder + lag én ny på slutten".
    const n = Math.max(before.length, after.length);
    for (let i = 0; i < n; i++) {
      const b = before[i];
      const a = after[i];
      const beforeKey = b ? `before:${i}:${b.id}` : null;
      const afterKey = a ? `after:${i}:${a.id}` : null;

      if (b && a) {
        if (b.label === a.label) {
          if (beforeKey) beforeOps.set(beforeKey, "keep");
          if (afterKey) afterOps.set(afterKey, "keep");
        } else {
          if (beforeKey) beforeOps.set(beforeKey, "patch");
          if (afterKey) afterOps.set(afterKey, "patch");
          patch += 1;
        }
      } else if (b && !a) {
        if (beforeKey) beforeOps.set(beforeKey, "remove");
        remove += 1;
      } else if (!b && a) {
        if (afterKey) afterOps.set(afterKey, "create");
        create += 1;
      }
    }
  }

  return { beforeOps, afterOps, stats: { patch, create, remove, move } };
}
