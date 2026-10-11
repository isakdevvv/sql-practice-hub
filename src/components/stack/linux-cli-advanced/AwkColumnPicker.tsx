import { useMemo, useState } from "react";

// AwkColumnPicker — visualiser hvordan awk deler hver linje i felt
// ($1, $2, ..., $NF), og bygg en awk-kommando ved å klikke på
// felter eller velge mellom et lite knippe vanlige mønstre:
//   { print $X, $Y }            — plukk kolonner
//   $X > N { print $0 }         — filter på numerisk felt
//   /REGEX/ { count++ } END {…} — tell linjer som matcher
//   { sum += $X } END { …sum }  — summér en kolonne
//
// Studenten ser parsing-tabellen (felter med farger) OG output samtidig.

interface ParsedRow {
  fields: string[];
  raw: string;
}

function parseRows(input: string, sep: string): ParsedRow[] {
  return input
    .split("\n")
    .filter((l) => l.length > 0)
    .map((raw) => {
      let fields: string[];
      if (sep === " ") {
        fields = raw.trim().split(/\s+/);
      } else {
        fields = raw.split(sep);
      }
      return { raw, fields };
    });
}

type Mode = "print" | "filter" | "count" | "sum";

interface BuildOpts {
  mode: Mode;
  pickFields: number[]; // 1-indexed; $0 = whole line is 0
  filterField: number;
  filterOp: ">" | "<" | "==" | ">=" | "<=";
  filterValue: string;
  matchRegex: string;
  sumField: number;
}

function fieldExpr(n: number): string {
  return n === 0 ? "$0" : `$${n}`;
}

function buildAwk(opts: BuildOpts, sep: string): string {
  const F = sep === " " ? "" : ` -F'${sep}'`;
  switch (opts.mode) {
    case "print": {
      const fields = opts.pickFields.length > 0 ? opts.pickFields.map(fieldExpr).join(", ") : "$0";
      return `awk${F} '{ print ${fields} }'`;
    }
    case "filter": {
      const fields = opts.pickFields.length > 0 ? opts.pickFields.map(fieldExpr).join(", ") : "$0";
      return `awk${F} '${fieldExpr(opts.filterField)} ${opts.filterOp} ${opts.filterValue} { print ${fields} }'`;
    }
    case "count": {
      return `awk${F} '/${opts.matchRegex}/ { count++ } END { print count }'`;
    }
    case "sum": {
      return `awk${F} '{ sum += ${fieldExpr(opts.sumField)} } END { print "total:", sum }'`;
    }
  }
}

function runAwk(rows: ParsedRow[], opts: BuildOpts): string[] {
  switch (opts.mode) {
    case "print": {
      return rows.map((r) => {
        if (opts.pickFields.length === 0) return r.raw;
        return opts.pickFields.map((n) => (n === 0 ? r.raw : r.fields[n - 1] ?? "")).join(" ");
      });
    }
    case "filter": {
      const val = Number(opts.filterValue);
      return rows
        .filter((r) => {
          const f = Number(r.fields[opts.filterField - 1]);
          if (Number.isNaN(f) || Number.isNaN(val)) return false;
          switch (opts.filterOp) {
            case ">": return f > val;
            case "<": return f < val;
            case "==": return f === val;
            case ">=": return f >= val;
            case "<=": return f <= val;
          }
        })
        .map((r) => {
          if (opts.pickFields.length === 0) return r.raw;
          return opts.pickFields.map((n) => (n === 0 ? r.raw : r.fields[n - 1] ?? "")).join(" ");
        });
    }
    case "count": {
      let re: RegExp;
      try {
        re = new RegExp(opts.matchRegex);
      } catch {
        return ["(ugyldig regex)"];
      }
      const c = rows.filter((r) => re.test(r.raw)).length;
      return [String(c)];
    }
    case "sum": {
      let s = 0;
      for (const r of rows) {
        const v = Number(r.fields[opts.sumField - 1]);
        if (!Number.isNaN(v)) s += v;
      }
      return [`total: ${s}`];
    }
  }
}

const SAMPLES: Array<{ label: string; sep: string; text: string }> = [
  {
    label: "ps aux (whitespace)",
    sep: " ",
    text: `root      1  0.0  0.1 168312 11420 ?    Ss  09:01  0:02 /sbin/init
isak    412  1.2  0.4 982344 73128 ?    Sl  09:14  0:54 node server.js
isak   1083  4.5  1.8 1.2e9 312045 ?    Rl  09:32  3:11 chrome --renderer
www      87  0.1  0.2 312000 20100 ?    Ss  09:01  0:01 nginx: master
www      88  0.3  0.3 318044 24400 ?    S   09:01  0:09 nginx: worker
www      89  0.3  0.3 318044 24400 ?    S   09:01  0:08 nginx: worker`,
  },
  {
    label: "data.csv (komma)",
    sep: ",",
    text: `id,navn,alder,by,inntekt
1,Ane,29,Tromsø,520000
2,Bjørn,41,Bergen,780000
3,Cato,33,Oslo,640000
4,Dina,52,Stavanger,920000
5,Eli,24,Trondheim,420000`,
  },
  {
    label: "access.log (whitespace)",
    sep: " ",
    text: `1.2.3.4 - - [10/Oct:13:55] "GET /api/users" 200 1024
5.6.7.8 - - [10/Oct:13:56] "GET /api/items" 500 89
1.2.3.4 - - [10/Oct:13:57] "POST /api/login" 401 256
9.10.11.12 - - [10/Oct:13:58] "GET /" 200 4096
1.2.3.4 - - [10/Oct:13:59] "GET /api/users" 200 1024
5.6.7.8 - - [10/Oct:14:00] "GET /api/items" 503 89`,
  },
];

const FIELD_COLORS = [
  "bg-amber-500/20 text-amber-800 dark:text-amber-200",
  "bg-sky-500/20 text-sky-800 dark:text-sky-200",
  "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
  "bg-fuchsia-500/20 text-fuchsia-800 dark:text-fuchsia-200",
  "bg-rose-500/20 text-rose-800 dark:text-rose-200",
  "bg-indigo-500/20 text-indigo-800 dark:text-indigo-200",
  "bg-orange-500/20 text-orange-800 dark:text-orange-200",
  "bg-cyan-500/20 text-cyan-800 dark:text-cyan-200",
];

function colorFor(idx: number): string {
  return FIELD_COLORS[(idx - 1) % FIELD_COLORS.length];
}

export function AwkColumnPicker() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const sample = SAMPLES[sampleIdx];
  const [input, setInput] = useState(sample.text);
  const [sep, setSep] = useState(sample.sep);
  const [mode, setMode] = useState<Mode>("print");
  const [pickFields, setPickFields] = useState<number[]>([1, 11]);
  const [filterField, setFilterField] = useState(3);
  const [filterOp, setFilterOp] = useState<BuildOpts["filterOp"]>(">");
  const [filterValue, setFilterValue] = useState("100");
  const [matchRegex, setMatchRegex] = useState("ERROR|5[0-9][0-9]");
  const [sumField, setSumField] = useState(5);

  const rows = useMemo(() => parseRows(input, sep), [input, sep]);
  const maxFields = rows.reduce((m, r) => Math.max(m, r.fields.length), 0);

  const opts: BuildOpts = { mode, pickFields, filterField, filterOp, filterValue, matchRegex, sumField };
  const awkCmd = buildAwk(opts, sep);
  const output = useMemo(() => runAwk(rows, opts), [rows, mode, pickFields, filterField, filterOp, filterValue, matchRegex, sumField]);

  const togglePick = (n: number) => {
    setPickFields((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-base">AwkColumnPicker</h3>
          <p className="text-xs text-muted-foreground">
            Klikk på et felt for å plukke det. <code>$1</code> = første felt,{" "}
            <code>$NF</code> = siste, <code>$0</code> = hele linja.
          </p>
        </div>
        <div className="flex gap-1">
          {SAMPLES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setSampleIdx(i);
                setInput(s.text);
                setSep(s.sep);
                setPickFields(i === 1 ? [2, 4] : [1, 11]);
                setFilterField(i === 1 ? 3 : 3);
              }}
              className={`text-[11px] px-2 py-1 rounded border ${
                sampleIdx === i ? "border-brand bg-brand/10 text-brand" : "border-border bg-muted/30 hover:bg-muted/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-start">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-background resize-y"
          spellCheck={false}
        />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Separator</span>
          <select
            value={sep}
            onChange={(e) => setSep(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-background font-mono"
          >
            <option value=" ">whitespace</option>
            <option value=",">,</option>
            <option value="\t">\t (tab)</option>
            <option value=";">;</option>
            <option value="|">|</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="text-[10px] uppercase tracking-wider px-3 py-1.5 bg-muted/30 text-muted-foreground font-semibold">
          Parsed rader (klikk felt for å plukke)
        </div>
        <div className="overflow-x-auto">
          <table className="text-xs font-mono w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-2 py-1 text-left text-muted-foreground font-medium w-12">NR</th>
                {Array.from({ length: maxFields }, (_, i) => i + 1).map((n) => (
                  <th
                    key={n}
                    className="px-2 py-1 text-left text-muted-foreground font-medium cursor-pointer hover:text-foreground"
                    onClick={() => togglePick(n)}
                    title={`Klikk for å plukke $${n}`}
                  >
                    <span className={`px-1.5 py-0.5 rounded ${pickFields.includes(n) ? colorFor(n) + " ring-1 ring-foreground/30" : ""}`}>
                      ${n}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0">
                  <td className="px-2 py-1 text-muted-foreground select-none">{i + 1}</td>
                  {Array.from({ length: maxFields }, (_, j) => {
                    const fieldNum = j + 1;
                    const val = r.fields[j] ?? "";
                    const picked = pickFields.includes(fieldNum);
                    return (
                      <td
                        key={j}
                        onClick={() => togglePick(fieldNum)}
                        className={`px-2 py-1 cursor-pointer ${picked ? colorFor(fieldNum) : "hover:bg-muted/30"}`}
                      >
                        {val || <span className="text-muted-foreground/40">·</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Modus</div>
          <div className="flex flex-wrap gap-1.5">
            {(["print", "filter", "count", "sum"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`text-[11px] px-2 py-1 rounded border ${
                  mode === m ? "border-brand bg-brand/10 text-brand" : "border-border bg-muted/30 hover:bg-muted/60"
                }`}
              >
                {m === "print" ? "{ print … }" : m === "filter" ? "$X op N { print … }" : m === "count" ? "/REGEX/ count" : "{ sum += $X }"}
              </button>
            ))}
          </div>

          {(mode === "print" || mode === "filter") && (
            <div className="text-[11px] text-muted-foreground">
              Plukkede felt:{" "}
              {pickFields.length === 0 ? (
                <span className="italic">ingen (vil printe $0)</span>
              ) : (
                pickFields.map((n) => (
                  <span key={n} className={`inline-block mr-1 px-1.5 py-0.5 rounded font-mono ${colorFor(n)}`}>
                    ${n}
                  </span>
                ))
              )}
            </div>
          )}

          {mode === "filter" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Filter:</span>
              <input
                type="number"
                value={filterField}
                onChange={(e) => setFilterField(Math.max(1, Number(e.target.value)))}
                className="w-14 px-2 py-1 rounded border border-border bg-background font-mono"
              />
              <select
                value={filterOp}
                onChange={(e) => setFilterOp(e.target.value as BuildOpts["filterOp"])}
                className="px-2 py-1 rounded border border-border bg-background font-mono"
              >
                <option value=">">{">"}</option>
                <option value="<">{"<"}</option>
                <option value=">=">{">="}</option>
                <option value="<=">{"<="}</option>
                <option value="==">{"=="}</option>
              </select>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-20 px-2 py-1 rounded border border-border bg-background font-mono"
              />
            </div>
          )}

          {mode === "count" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">/regex/</span>
              <input
                type="text"
                value={matchRegex}
                onChange={(e) => setMatchRegex(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-border bg-background font-mono"
                spellCheck={false}
              />
            </div>
          )}

          {mode === "sum" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Summér felt:</span>
              <input
                type="number"
                value={sumField}
                onChange={(e) => setSumField(Math.max(1, Number(e.target.value)))}
                className="w-14 px-2 py-1 rounded border border-border bg-background font-mono"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Generert kommando</div>
          <pre className="font-mono text-xs p-3 rounded-lg border border-brand/30 bg-brand/5 whitespace-pre-wrap break-all">
            {awkCmd}
          </pre>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Output</div>
          <pre className="font-mono text-xs p-3 rounded-lg border border-border bg-muted/20 max-h-40 overflow-auto whitespace-pre-wrap">
            {output.join("\n") || <span className="text-muted-foreground">(tomt)</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
