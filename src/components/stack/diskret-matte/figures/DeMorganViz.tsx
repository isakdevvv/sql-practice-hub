import { useMemo, useState } from "react";

type Law = "and" | "or";

const LAWS: Record<Law, { lhs: string; rhs: string; desc: string }> = {
  and: {
    lhs: "¬(p ∧ q)",
    rhs: "¬p ∨ ¬q",
    desc: "Negér en konjunksjon → blir disjunksjon av negasjoner.",
  },
  or: {
    lhs: "¬(p ∨ q)",
    rhs: "¬p ∧ ¬q",
    desc: "Negér en disjunksjon → blir konjunksjon av negasjoner.",
  },
};

function evalLhs(law: Law, p: boolean, q: boolean): boolean {
  return law === "and" ? !(p && q) : !(p || q);
}
function evalRhs(law: Law, p: boolean, q: boolean): boolean {
  return law === "and" ? !p || !q : !p && !q;
}

const ROWS: Array<[boolean, boolean]> = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];

export function DeMorganViz() {
  const [law, setLaw] = useState<Law>("and");
  const [hoverRow, setHoverRow] = useState<number | null>(null);

  const data = LAWS[law];
  const rows = useMemo(
    () =>
      ROWS.map(([p, q]) => ({
        p,
        q,
        lhs: evalLhs(law, p, q),
        rhs: evalRhs(law, p, q),
      })),
    [law],
  );
  const allMatch = rows.every((r) => r.lhs === r.rhs);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 not-prose">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          De Morgan — visuelt bevis
        </div>
        <div className="flex gap-1">
          {(["and", "or"] as Law[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setLaw(k)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                law === k
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {k === "and" ? "¬(p ∧ q)" : "¬(p ∨ q)"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{data.desc}</p>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Venn-style picture */}
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
            Venn-bilde (skraver = sant)
          </div>
          <svg viewBox="0 0 220 140" className="w-full h-32">
            <defs>
              <clipPath id="dm-clip-a">
                <circle cx="85" cy="70" r="48" />
              </clipPath>
              <clipPath id="dm-clip-b">
                <circle cx="135" cy="70" r="48" />
              </clipPath>
            </defs>
            {/* Universe rect */}
            <rect
              x="6"
              y="6"
              width="208"
              height="128"
              rx="6"
              fill={law === "and" ? "rgb(34 197 94 / 0.18)" : "rgb(34 197 94 / 0.18)"}
              stroke="rgb(34 197 94)"
              strokeDasharray="3 3"
            />
            {/* For AND: shade everywhere except intersection.
                For OR: shade only outside both circles. */}
            {law === "and" ? (
              <>
                {/* shade A-only and B-only and outside as green; intersection is white */}
                <circle cx="85" cy="70" r="48" fill="rgb(34 197 94 / 0.35)" />
                <circle cx="135" cy="70" r="48" fill="rgb(34 197 94 / 0.35)" />
                {/* erase intersection by overlaying base */}
                <g clipPath="url(#dm-clip-a)">
                  <circle cx="135" cy="70" r="48" fill="white" />
                </g>
              </>
            ) : null}
            <circle
              cx="85"
              cy="70"
              r="48"
              fill="none"
              stroke="rgb(99 102 241)"
              strokeWidth="1.5"
            />
            <circle
              cx="135"
              cy="70"
              r="48"
              fill="none"
              stroke="rgb(244 114 182)"
              strokeWidth="1.5"
            />
            <text x="50" y="40" fontSize="11" fill="currentColor" className="font-semibold">
              p
            </text>
            <text x="165" y="40" fontSize="11" fill="currentColor" className="font-semibold">
              q
            </text>
            <text
              x="110"
              y="130"
              fontSize="9"
              textAnchor="middle"
              fill="currentColor"
              className="opacity-60"
            >
              U (universet)
            </text>
          </svg>
          <div className="text-[10px] text-muted-foreground mt-1">
            {law === "and"
              ? "¬(p ∧ q) er sant ALT som ikke er i snittet — A-bare, B-bare, og utenfor."
              : "¬(p ∨ q) er sant KUN utenfor begge sirkler."}
          </div>
        </div>

        {/* Truth table side-by-side */}
        <div className="rounded-xl border border-border bg-background p-3 overflow-x-auto">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
            Sannhetstabell — LHS vs RHS
          </div>
          <table className="text-xs font-mono w-full">
            <thead>
              <tr className="text-muted-foreground">
                <th className="px-1 py-0.5 text-left">p</th>
                <th className="px-1 py-0.5 text-left">q</th>
                <th className="px-1 py-0.5 text-left">{data.lhs}</th>
                <th className="px-1 py-0.5 text-left">{data.rhs}</th>
                <th className="px-1 py-0.5 text-left">=</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const eq = r.lhs === r.rhs;
                return (
                  <tr
                    key={i}
                    onMouseEnter={() => setHoverRow(i)}
                    onMouseLeave={() => setHoverRow(null)}
                    className={`${
                      hoverRow === i ? "bg-brand/10" : ""
                    } border-t border-border/50`}
                  >
                    <td className="px-1 py-0.5">{r.p ? "T" : "F"}</td>
                    <td className="px-1 py-0.5">{r.q ? "T" : "F"}</td>
                    <td
                      className={`px-1 py-0.5 ${
                        r.lhs ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {r.lhs ? "T" : "F"}
                    </td>
                    <td
                      className={`px-1 py-0.5 ${
                        r.rhs ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {r.rhs ? "T" : "F"}
                    </td>
                    <td className="px-1 py-0.5">{eq ? "✓" : "✗"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div
            className={`mt-2 text-[11px] rounded px-2 py-1 ${
              allMatch
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
            }`}
          >
            {allMatch
              ? `Alle 4 rader matcher → ${data.lhs} ≡ ${data.rhs}`
              : "Mismatch — sjekk evaluering"}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Lese-trikset:</strong> «¬ distribuerer
        innover, men flipper operatoren». ∧ blir ∨, ∨ blir ∧.
      </div>
    </div>
  );
}
