import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

/**
 * CompositeIndexExperiment — vis leftmost-prefix-regelen og covered queries.
 *
 * Datasett: 30 personer med (last_name, first_name, age, city).
 * 3 indekser definert:
 *   idx_ln       (last_name)
 *   idx_ln_fn    (last_name, first_name)
 *   idx_ln_fn_age(last_name, first_name, age)
 *
 * Brukeren velger en WHERE-tilstand fra forhåndsdefinerte preset (eller
 * skriver fritt) og SELECT-kolonner. Vi viser:
 *  - hvilke indekser kan brukes (leftmost-prefix-regelen)
 *  - hvilken er mest effektiv (lengste matchede prefiks vinner)
 *  - om spørringen er "covered" (alle SELECT-kolonner + WHERE-kolonner i
 *    indeksen → ingen heap-fetch)
 */

type ColName = "last_name" | "first_name" | "age" | "city";

const COLS: { id: ColName; label: string }[] = [
  { id: "last_name", label: "last_name" },
  { id: "first_name", label: "first_name" },
  { id: "age", label: "age" },
  { id: "city", label: "city" },
];

const INDEXES: { id: string; cols: ColName[]; label: string }[] = [
  { id: "idx_ln", cols: ["last_name"], label: "idx_ln (last_name)" },
  {
    id: "idx_ln_fn",
    cols: ["last_name", "first_name"],
    label: "idx_ln_fn (last_name, first_name)",
  },
  {
    id: "idx_ln_fn_age",
    cols: ["last_name", "first_name", "age"],
    label: "idx_ln_fn_age (last_name, first_name, age)",
  },
];

type Predicate = { col: ColName; op: "=" | ">" | "<" | "BETWEEN" | "LIKE_PREFIX"; value: string };

const PRESETS: { label: string; where: Predicate[] }[] = [
  {
    label: "WHERE last_name = 'Hansen'",
    where: [{ col: "last_name", op: "=", value: "Hansen" }],
  },
  {
    label: "WHERE last_name = 'Hansen' AND first_name = 'Kari'",
    where: [
      { col: "last_name", op: "=", value: "Hansen" },
      { col: "first_name", op: "=", value: "Kari" },
    ],
  },
  {
    label: "WHERE last_name = 'Hansen' AND first_name = 'Kari' AND age > 30",
    where: [
      { col: "last_name", op: "=", value: "Hansen" },
      { col: "first_name", op: "=", value: "Kari" },
      { col: "age", op: ">", value: "30" },
    ],
  },
  {
    label: "WHERE first_name = 'Kari'  (hopper over last_name!)",
    where: [{ col: "first_name", op: "=", value: "Kari" }],
  },
  {
    label: "WHERE last_name = 'Hansen' AND age > 30  (hopper over first_name!)",
    where: [
      { col: "last_name", op: "=", value: "Hansen" },
      { col: "age", op: ">", value: "30" },
    ],
  },
  {
    label: "WHERE last_name LIKE 'Han%'",
    where: [{ col: "last_name", op: "LIKE_PREFIX", value: "Han" }],
  },
];

type Usage = {
  index: string;
  level: "full" | "prefix" | "leftmost-broken" | "unusable";
  matchedCols: ColName[];
  reason: string;
};

/**
 * Vurder hvor godt en indeks dekker WHERE-prediktatene.
 *
 * Regler:
 *  - Match nøyaktig venstre-prefiks. Første kolonne i indeksen må være med
 *    i WHERE som likhet eller range. Hvis ikke → ubrukelig.
 *  - Etter første range-kolonne stopper indeksen å være effektiv for
 *    påfølgende kolonner. Vi behandler dem som "ikke matchet".
 *  - LIKE 'X%' regnes som likhet+range (kan bruke indeks, men ikke videre).
 */
function evaluateIndex(index: { cols: ColName[]; id: string }, where: Predicate[]): Usage {
  const whereByCol = new Map(where.map((w) => [w.col, w] as const));
  if (where.length === 0) {
    return { index: index.id, level: "unusable", matchedCols: [], reason: "Ingen WHERE." };
  }
  if (!whereByCol.has(index.cols[0])) {
    return {
      index: index.id,
      level: "unusable",
      matchedCols: [],
      reason: `Første kolonne i indeksen (${index.cols[0]}) er ikke i WHERE — leftmost-prefix brytes.`,
    };
  }
  const matched: ColName[] = [];
  let stoppedByRange = false;
  let stopReason = "";
  for (const c of index.cols) {
    const p = whereByCol.get(c);
    if (!p) break;
    matched.push(c);
    if (p.op !== "=") {
      stoppedByRange = true;
      stopReason = `Range/LIKE på ${c} (${p.op}) — påfølgende kolonner i indeksen kan ikke brukes for filtrering.`;
      break;
    }
  }
  const level: Usage["level"] =
    matched.length === index.cols.length ? "full" : stoppedByRange ? "prefix" : "prefix";
  const allWhereMatched = where.every((w) => matched.includes(w.col));
  let reason =
    matched.length === index.cols.length
      ? "Alle indeks-kolonner matcher WHERE — full effektiv bruk."
      : `Matchet venstre-prefiks: ${matched.join(", ")}.`;
  if (stoppedByRange) reason += " " + stopReason;
  if (!allWhereMatched) {
    reason += ` (Restprediktater må filtreres som "Filter" etter index scan.)`;
  }
  return { index: index.id, level, matchedCols: matched, reason };
}

function isCovered(indexCols: ColName[], selectCols: ColName[], whereCols: ColName[]): boolean {
  const set = new Set(indexCols);
  for (const c of selectCols) if (!set.has(c)) return false;
  for (const c of whereCols) if (!set.has(c)) return false;
  return true;
}

export function CompositeIndexExperiment() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [selectCols, setSelectCols] = useState<Set<ColName>>(new Set(["last_name", "first_name"]));

  const where = PRESETS[presetIdx].where;
  const whereCols = where.map((w) => w.col);

  const usages = useMemo(
    () => INDEXES.map((i) => ({ ...evaluateIndex(i, where), cols: i.cols, label: i.label })),
    [where],
  );

  // Velg "best" indeks: høyest matchet kolonne, deretter foretrekk full > prefix > unusable
  const best = useMemo(() => {
    const usable = usages.filter((u) => u.level !== "unusable");
    if (usable.length === 0) return null;
    return [...usable].sort((a, b) => b.matchedCols.length - a.matchedCols.length)[0];
  }, [usages]);

  const sqlSelect = `SELECT ${Array.from(selectCols).join(", ") || "*"}\nFROM person\nWHERE ${where
    .map((w) =>
      w.op === "LIKE_PREFIX"
        ? `${w.col} LIKE '${w.value}%'`
        : w.op === "BETWEEN"
          ? `${w.col} BETWEEN ${w.value}`
          : `${w.col} ${w.op} '${w.value}'`,
    )
    .join(" AND ")};`;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold mb-3">Composite-indeks — leftmost-prefix og covered queries</h3>
      <p className="text-xs text-muted-foreground mb-3">
        3 indekser definert på tabellen <code>person(last_name, first_name, age, city)</code>. Velg
        en WHERE-klausul og hvilke kolonner du SELECTer. Se hvilke indekser kan brukes, og om
        spørringen blir "covered" (svar kun fra indeksen).
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-semibold mb-2">WHERE (velg preset)</div>
          <div className="space-y-1.5">
            {PRESETS.map((p, i) => (
              <label
                key={i}
                className={`flex items-start gap-2 rounded border p-2 cursor-pointer text-xs ${
                  presetIdx === i
                    ? "border-brand bg-brand/5"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  className="mt-0.5"
                  checked={presetIdx === i}
                  onChange={() => setPresetIdx(i)}
                />
                <span className="font-mono">{p.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-2">SELECT-kolonner</div>
          <div className="flex flex-wrap gap-2">
            {COLS.map((c) => {
              const on = selectCols.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectCols((s) => {
                      const ns = new Set(s);
                      if (ns.has(c.id)) ns.delete(c.id);
                      else ns.add(c.id);
                      return ns;
                    });
                  }}
                  className={`text-xs px-2.5 py-1 rounded border font-mono ${
                    on ? "border-brand bg-brand/10 text-brand" : "border-border hover:bg-muted"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded bg-background border border-border p-2">
            <pre className="font-mono text-xs whitespace-pre-wrap">{sqlSelect}</pre>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {usages.map((u) => {
          const ix = INDEXES.find((i) => i.id === u.index)!;
          const covered = isCovered(ix.cols, Array.from(selectCols), whereCols);
          const isBest = best?.index === u.index;
          return (
            <div
              key={u.index}
              className={`rounded-lg border p-3 ${
                u.level === "unusable"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : isBest
                    ? "border-brand/40 bg-brand/5"
                    : "border-border bg-background"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {u.level === "unusable" ? (
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                ) : u.level === "full" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                )}
                <span className="font-mono text-sm">{u.label}</span>
                {isBest && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand text-white">
                    valgt
                  </span>
                )}
                <span className="ml-auto flex items-center gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      covered
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-muted bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {covered ? "covered — index-only scan" : "trenger heap-fetch"}
                  </span>
                </span>
              </div>
              <PrefixMatchBar cols={ix.cols} matched={u.matchedCols} />
              <p className="text-[11px] text-muted-foreground mt-1.5">{u.reason}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
        <strong>Tre regler å huske:</strong>
        <ol className="mt-1 list-decimal pl-5 space-y-0.5">
          <li>
            Indeksen brukes kun hvis WHERE inneholder dens <em>første</em> kolonne
            (leftmost-prefix).
          </li>
          <li>
            Range (<code>&gt;, &lt;, BETWEEN, LIKE 'x%'</code>) på en indeks-kolonne stopper
            effektiv bruk av påfølgende kolonner.
          </li>
          <li>
            "Covered" = alle SELECT- og WHERE-kolonner er i indeksen → DB hopper heap-tabellen helt.
            Stor performance-gevinst.
          </li>
        </ol>
      </div>
    </div>
  );
}

function PrefixMatchBar({ cols, matched }: { cols: ColName[]; matched: ColName[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {cols.map((c, i) => {
        const on = matched.includes(c);
        return (
          <div
            key={c}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              on
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-muted bg-muted/30 text-muted-foreground line-through"
            }`}
          >
            {i + 1}. {c}
          </div>
        );
      })}
    </div>
  );
}
