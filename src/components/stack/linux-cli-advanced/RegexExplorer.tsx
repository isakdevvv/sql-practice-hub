import { useMemo, useState } from "react";

// RegexExplorer — skriv et regex, se matches uthevet live i input,
// med grupperinger og en kort forklaring av dialekten (BRE/ERE/PCRE).
//
// Pure JS — bruker JavaScripts innebygde RegExp, som ligger nær PCRE.
// For å vise hvordan grep -E ville sett uttrykket har vi en kolonne
// «som grep -E» som strips ut PCRE-aktige features (\d, lookahead, …)
// og forklarer hva som ikke ville fungert.

interface Match {
  start: number;
  end: number;
  text: string;
  groups: string[];
}

interface Segment {
  kind: "text" | "match";
  text: string;
  match?: Match;
  matchIdx?: number;
}

function buildSegments(input: string, matches: Match[]): Segment[] {
  if (matches.length === 0) return [{ kind: "text", text: input }];
  const segs: Segment[] = [];
  let last = 0;
  matches.forEach((m, i) => {
    if (m.start > last) segs.push({ kind: "text", text: input.slice(last, m.start) });
    segs.push({ kind: "match", text: m.text, match: m, matchIdx: i });
    last = m.end;
  });
  if (last < input.length) segs.push({ kind: "text", text: input.slice(last) });
  return segs;
}

function findMatches(input: string, pattern: string, flags: string): { matches: Match[]; error: string | null } {
  if (!pattern) return { matches: [], error: null };
  try {
    // Force global so we can scan all matches
    const f = flags.includes("g") ? flags : flags + "g";
    const re = new RegExp(pattern, f);
    const matches: Match[] = [];
    let m: RegExpExecArray | null;
    let safety = 0;
    while ((m = re.exec(input)) !== null) {
      if (safety++ > 5000) break;
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
        groups: m.slice(1),
      });
      if (m[0].length === 0) re.lastIndex++;
    }
    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
}

interface DialectWarn {
  severity: "ok" | "warn" | "bad";
  msg: string;
}

function explainDialect(pattern: string, dialect: "BRE" | "ERE" | "PCRE"): DialectWarn[] {
  const warnings: DialectWarn[] = [];
  if (!pattern) return warnings;

  const hasPCREClass = /\\(?:d|D|w|W|s|S|b|B)/.test(pattern);
  const hasLookaround = /\(\?[=!]/.test(pattern);
  const hasLookbehind = /\(\?<[=!]/.test(pattern);
  const hasNonGreedy = /[*+?]\?/.test(pattern);
  const hasNamedGroup = /\(\?<[A-Za-z_]/.test(pattern);
  const hasERELiterals = /[^\\]?[+(){|}]/.test(pattern) || /^[+(){|}]/.test(pattern);

  if (dialect === "BRE") {
    if (hasPCREClass) warnings.push({ severity: "bad", msg: "\\d, \\w, \\s er PCRE — i BRE må du bruke [0-9], [a-zA-Z_0-9], [[:space:]]" });
    if (hasLookaround || hasLookbehind) warnings.push({ severity: "bad", msg: "Lookahead/lookbehind finnes ikke i BRE" });
    if (hasNonGreedy) warnings.push({ severity: "bad", msg: "Non-greedy *? finnes ikke i BRE" });
    if (hasERELiterals) warnings.push({ severity: "warn", msg: "I BRE må +, ?, (, ), {, |, } escapes med \\ for å være metategn — ellers tas de bokstavelig" });
  } else if (dialect === "ERE") {
    if (hasPCREClass) warnings.push({ severity: "bad", msg: "\\d, \\w, \\s er PCRE — i ERE må du bruke [0-9], [a-zA-Z_0-9], [[:space:]]" });
    if (hasLookaround || hasLookbehind) warnings.push({ severity: "bad", msg: "Lookahead/lookbehind finnes ikke i ERE — krever -P" });
    if (hasNonGreedy) warnings.push({ severity: "bad", msg: "Non-greedy *? krever PCRE (grep -P, ikke -E)" });
    if (hasNamedGroup) warnings.push({ severity: "warn", msg: "Navngitte grupper (?<name>...) krever PCRE" });
    if (warnings.length === 0) warnings.push({ severity: "ok", msg: "Funker i grep -E" });
  } else {
    // PCRE
    if (warnings.length === 0) warnings.push({ severity: "ok", msg: "Funker i grep -P" });
  }
  return warnings;
}

const SAMPLES: Array<{ label: string; pattern: string; text: string; flags: string }> = [
  {
    label: "IP-adresser",
    pattern: "\\b\\d{1,3}(?:\\.\\d{1,3}){3}\\b",
    flags: "g",
    text: `Klient 1.2.3.4 connect 10.0.0.1
404 fra 192.168.1.255 (intern)
ugyldig: 999.999.999.999
ekstern 8.8.8.8 OK`,
  },
  {
    label: "epost",
    pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
    flags: "g",
    text: `Kontakt: ane@uit.no, support@x.no
Ugyldig: ikke-en-epost, @missing.no
bjorn.olsen+spam@gmail.com fra Bergen`,
  },
  {
    label: "log-nivå + tidsstempel",
    pattern: "^\\[(\\d{2}:\\d{2}:\\d{2})\\]\\s+(ERROR|WARN|INFO)",
    flags: "gm",
    text: `[13:01:22] INFO  bootstrap done
[13:02:01] WARN  cache miss for user:42
[13:02:09] ERROR db timeout after 5s
[13:02:10] INFO  retry succeeded
   unmatched: missing brackets`,
  },
  {
    label: "HTTP-status >= 400",
    pattern: "\"\\s(4\\d{2}|5\\d{2})\\s",
    flags: "g",
    text: `1.2.3.4 "GET /" 200 1024
1.2.3.4 "POST /login" 401 256
5.6.7.8 "GET /api" 500 89
9.9.9.9 "GET /ok" 200 4096
1.2.3.4 "GET /api" 503 89`,
  },
  {
    label: "norske postnumre",
    pattern: "\\b\\d{4}\\b",
    flags: "g",
    text: `Tromsø 9009
Oslo 0150 og 0162
Postboks 1234, 5020 Bergen
Ikke postnummer: 12 eller 99999`,
  },
];

export function RegexExplorer() {
  const [pattern, setPattern] = useState(SAMPLES[0].pattern);
  const [text, setText] = useState(SAMPLES[0].text);
  const [flags, setFlags] = useState(SAMPLES[0].flags);
  const [dialect, setDialect] = useState<"BRE" | "ERE" | "PCRE">("PCRE");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { matches, error } = useMemo(() => findMatches(text, pattern, flags), [text, pattern, flags]);
  const segments = useMemo(() => buildSegments(text, matches), [text, matches]);
  const warnings = useMemo(() => explainDialect(pattern, dialect), [pattern, dialect]);

  const groupCount = matches[0]?.groups.length ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold text-base">RegexExplorer</h3>
          <p className="text-xs text-muted-foreground">
            JavaScripts <code>RegExp</code> brukes som motor (≈ PCRE).
            «Dialect»-knappene forklarer hva som ikke funker i grep / grep -E.
          </p>
        </div>
        <div className="flex gap-1">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setPattern(s.pattern);
                setText(s.text);
                setFlags(s.flags);
              }}
              className="text-[11px] px-2 py-1 rounded border border-border bg-muted/30 hover:bg-muted/60"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-muted-foreground select-none">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 px-2 py-1.5 rounded border border-border bg-background"
            spellCheck={false}
          />
          <span className="text-muted-foreground select-none">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value.replace(/[^gimsu]/g, ""))}
            className="w-16 px-2 py-1.5 rounded border border-border bg-background"
            placeholder="gim"
            spellCheck={false}
          />
        </div>
        {error ? (
          <div className="text-xs text-rose-600 dark:text-rose-400 font-mono">Regex-feil: {error}</div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {matches.length} treff{groupCount > 0 ? ` · ${groupCount} grupperingsfangst per treff` : ""}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-3">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Input (treff uthevet)
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-background resize-y"
            spellCheck={false}
          />
          <div className="rounded-lg border border-border bg-muted/10 p-3 font-mono text-xs whitespace-pre-wrap break-words max-h-60 overflow-auto">
            {segments.map((s, i) =>
              s.kind === "match" ? (
                <span
                  key={i}
                  className={`px-0.5 rounded ring-1 ${
                    hoverIdx === s.matchIdx
                      ? "bg-amber-500/40 ring-amber-500 text-amber-900 dark:text-amber-100"
                      : "bg-emerald-500/25 ring-emerald-500/50 text-emerald-800 dark:text-emerald-200"
                  }`}
                  onMouseEnter={() => setHoverIdx(s.matchIdx ?? null)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  {s.text || "·"}
                </span>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dialekt</div>
            <div className="flex gap-1">
              {(["BRE", "ERE", "PCRE"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDialect(d)}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    dialect === d ? "border-brand bg-brand/10 text-brand" : "border-border bg-muted/30 hover:bg-muted/60"
                  }`}
                  title={d === "BRE" ? "grep (basic)" : d === "ERE" ? "grep -E (extended)" : "grep -P (Perl)"}
                >
                  {d === "BRE" ? "grep" : d === "ERE" ? "grep -E" : "grep -P"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 max-h-28 overflow-auto">
            {warnings.length === 0 ? (
              <div className="text-[11px] text-muted-foreground">Skriv et regex for å sjekke dialekten.</div>
            ) : (
              warnings.map((w, i) => (
                <div
                  key={i}
                  className={`text-[11px] px-2 py-1 rounded border ${
                    w.severity === "ok"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                      : w.severity === "warn"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                  }`}
                >
                  {w.msg}
                </div>
              ))
            )}
          </div>

          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Treff-tabell
          </div>
          <div className="rounded-lg border border-border bg-background max-h-44 overflow-auto">
            {matches.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground italic">Ingen treff.</div>
            ) : (
              <table className="text-xs font-mono w-full">
                <thead className="sticky top-0 bg-muted/40">
                  <tr>
                    <th className="px-2 py-1 text-left text-muted-foreground font-medium">#</th>
                    <th className="px-2 py-1 text-left text-muted-foreground font-medium">posisjon</th>
                    <th className="px-2 py-1 text-left text-muted-foreground font-medium">treff</th>
                    {Array.from({ length: groupCount }, (_, i) => (
                      <th key={i} className="px-2 py-1 text-left text-muted-foreground font-medium">
                        \{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, i) => (
                    <tr
                      key={i}
                      className={`border-t border-border/40 cursor-pointer ${hoverIdx === i ? "bg-amber-500/15" : "hover:bg-muted/30"}`}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    >
                      <td className="px-2 py-1 text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-1 text-muted-foreground">{m.start}–{m.end}</td>
                      <td className="px-2 py-1 text-emerald-700 dark:text-emerald-300">{m.text}</td>
                      {m.groups.map((g, j) => (
                        <td key={j} className="px-2 py-1 text-sky-700 dark:text-sky-300">{g ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
