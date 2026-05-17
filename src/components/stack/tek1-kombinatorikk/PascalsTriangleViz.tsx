import { useMemo, useState } from "react";

// PascalsTriangleViz
// 12 rader Pascal-trekant. Klikk en celle → highlightes + viser C(n,k).
// Hver celle = sum av de to over (animer ved "Forklar pluss-regel").
// Path mode: tegn sti fra topp ved å klikke venstre/høyre per nivå — antall
// mulige stier til en celle = C(n,k).
// Symmetry mode: highlight C(n,k) = C(n,n-k).
// Color mode: highlight palindromer, multipla av 2/3/5 — fraktal-mønstre.

const ROWS = 12;

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return fact(n) / (fact(k) * fact(n - k));
}

function buildTriangle(rows: number): number[][] {
  const t: number[][] = [];
  for (let n = 0; n < rows; n++) {
    const row: number[] = [];
    for (let k = 0; k <= n; k++) row.push(choose(n, k));
    t.push(row);
  }
  return t;
}

type Mode = "click" | "path" | "symmetry" | "color";
type ColorScheme = "off" | "mod2" | "mod3" | "mod5" | "palindrome";

export function PascalsTriangleViz() {
  const triangle = useMemo(() => buildTriangle(ROWS), []);
  const [mode, setMode] = useState<Mode>("click");
  const [selected, setSelected] = useState<{ n: number; k: number } | null>({ n: 4, k: 2 });
  const [path, setPath] = useState<("L" | "R")[]>([]); // sti av venstre/høyre valg
  const [colorScheme, setColorScheme] = useState<ColorScheme>("mod2");
  const [showPlus, setShowPlus] = useState(false);

  // path → cell ved n=path.length, k=antall "R" i path
  const pathCell = useMemo(() => {
    const k = path.filter((d) => d === "R").length;
    return { n: path.length, k };
  }, [path]);

  function handleCellClick(n: number, k: number) {
    if (mode === "path") return; // sti styres via L/R-knapper
    setSelected({ n, k });
    setShowPlus(false);
  }

  function pushPath(dir: "L" | "R") {
    if (path.length >= ROWS - 1) return;
    setPath([...path, dir]);
  }
  function popPath() {
    setPath(path.slice(0, -1));
  }
  function resetPath() {
    setPath([]);
  }

  // hvilke celler ligger på den aktive stien?
  const pathCells = useMemo(() => {
    const cells = new Set<string>();
    cells.add(`0-0`);
    let k = 0;
    for (let n = 0; n < path.length; n++) {
      if (path[n] === "R") k++;
      cells.add(`${n + 1}-${k}`);
    }
    return cells;
  }, [path]);

  function cellColor(n: number, k: number): string {
    if (mode === "color") {
      const v = triangle[n][k];
      switch (colorScheme) {
        case "mod2":
          return v % 2 === 1
            ? "bg-brand text-brand-foreground border-brand"
            : "bg-background text-muted-foreground border-border";
        case "mod3":
          return v % 3 === 0
            ? "bg-emerald-500 text-white border-emerald-500"
            : "bg-background text-muted-foreground border-border";
        case "mod5":
          return v % 5 === 0
            ? "bg-amber-500 text-white border-amber-500"
            : "bg-background text-muted-foreground border-border";
        case "palindrome": {
          const s = String(v);
          const isPal = s === s.split("").reverse().join("");
          return isPal && v >= 10
            ? "bg-violet-500 text-white border-violet-500"
            : "bg-background text-muted-foreground border-border";
        }
        case "off":
          return "bg-background text-foreground border-border";
      }
    }
    if (mode === "path") {
      if (pathCells.has(`${n}-${k}`)) {
        return n === pathCell.n && k === pathCell.k
          ? "bg-brand text-brand-foreground border-brand ring-2 ring-brand/40"
          : "bg-brand/30 text-foreground border-brand/40";
      }
      return "bg-background text-muted-foreground border-border";
    }
    if (mode === "symmetry" && selected) {
      if (n === selected.n && (k === selected.k || k === selected.n - selected.k)) {
        return k === selected.k
          ? "bg-brand text-brand-foreground border-brand"
          : "bg-violet-500 text-white border-violet-500";
      }
      return "bg-background text-foreground border-border";
    }
    // click mode default
    if (selected && n === selected.n && k === selected.k) {
      return "bg-brand text-brand-foreground border-brand ring-2 ring-brand/40";
    }
    if (selected && showPlus && n === selected.n - 1 && (k === selected.k - 1 || k === selected.k)) {
      return "bg-amber-500/30 text-foreground border-amber-500";
    }
    return "bg-background text-foreground border-border hover:border-brand/60";
  }

  const sel = mode === "path" ? pathCell : selected;
  const selVal =
    sel && sel.n < ROWS && sel.k >= 0 && sel.k <= sel.n ? triangle[sel.n][sel.k] : null;

  // antall stier til (n,k) = C(n,k) — det er hele poenget
  const pathCount = selVal;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Pascal-trekanten — C(n,k) som geometri
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          {(["click", "path", "symmetry", "color"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === "path") setPath([]);
              }}
              className={`rounded-md px-2.5 py-1 font-medium border ${mode === m ? "bg-brand text-brand-foreground border-brand" : "border-border bg-background hover:border-brand/40"}`}
            >
              {m === "click" && "Klikk-en-celle"}
              {m === "path" && "Sti fra topp"}
              {m === "symmetry" && "Symmetri"}
              {m === "color" && "Farge-mønster"}
            </button>
          ))}
        </div>
      </div>

      {mode === "path" && (
        <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-2">
          <div className="text-muted-foreground">
            Bygg en sti fra toppen. På hvert nivå velger du venstre (←) eller
            høyre (→). Antall ulike stier som ender i celle (n,k) = C(n,k).
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => pushPath("L")}
              className="rounded-md border border-border bg-background px-2.5 py-1 hover:border-brand/40"
            >
              ← venstre
            </button>
            <button
              onClick={() => pushPath("R")}
              className="rounded-md border border-border bg-background px-2.5 py-1 hover:border-brand/40"
            >
              høyre →
            </button>
            <button
              onClick={popPath}
              className="rounded-md border border-border bg-background px-2.5 py-1 hover:border-brand/40"
            >
              angre
            </button>
            <button
              onClick={resetPath}
              className="rounded-md border border-border bg-background px-2.5 py-1 hover:border-brand/40"
            >
              nullstill
            </button>
            <span className="font-mono text-muted-foreground ml-2">
              sti: {path.length === 0 ? "(start)" : path.join("")}
            </span>
          </div>
        </div>
      )}

      {mode === "color" && (
        <div className="rounded-lg border border-border bg-background p-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground">Marker celler hvor:</span>
            {([
              ["mod2", "oddetall (Sierpiński)"],
              ["mod3", "delelig på 3"],
              ["mod5", "delelig på 5"],
              ["palindrome", "tall er palindrom"],
            ] as [ColorScheme, string][]).map(([cs, label]) => (
              <button
                key={cs}
                onClick={() => setColorScheme(cs)}
                className={`rounded-md px-2 py-0.5 border ${colorScheme === cs ? "bg-brand text-brand-foreground border-brand" : "border-border bg-background hover:border-brand/40"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trekanten */}
      <div className="overflow-x-auto py-2">
        <div className="inline-block min-w-full">
          {triangle.map((row, n) => (
            <div
              key={n}
              className="flex items-center justify-center gap-1 my-0.5"
            >
              {row.map((v, k) => {
                const isClickable = mode !== "path";
                const w = "w-9 sm:w-10";
                return (
                  <button
                    key={k}
                    disabled={!isClickable}
                    onClick={() => handleCellClick(n, k)}
                    className={`${w} h-7 sm:h-8 inline-flex items-center justify-center rounded border font-mono text-[10px] sm:text-xs leading-none transition-colors ${cellColor(n, k)} ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                    title={`C(${n},${k}) = ${v}`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Info-panel for selected */}
      {sel && selVal !== null && (
        <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          {mode === "path" ? (
            <div className="space-y-1">
              <div className="font-mono text-brand font-semibold">
                Sti ender i celle (n={sel.n}, k={sel.k})
              </div>
              <div className="text-xs text-muted-foreground">
                Antall mulige stier hit = C({sel.n},{sel.k}) ={" "}
                <span className="font-mono font-semibold text-foreground">{pathCount}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Hver sti er en valg-sekvens av {sel.n} L/R-trekk hvorav {sel.k} er
                R — som er nettopp definisjonen av en kombinasjon.
              </div>
            </div>
          ) : mode === "symmetry" ? (
            <div className="space-y-1">
              <div className="font-mono text-brand font-semibold">
                C({sel.n},{sel.k}) = C({sel.n},{sel.n - sel.k}) = {selVal}
              </div>
              <div className="text-xs text-muted-foreground">
                Å velge {sel.k} stykker av {sel.n} er det samme som å velge
                hvilke {sel.n - sel.k} som ikke blir med — derfor er trekanten
                symmetrisk.
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="font-mono text-brand font-semibold">
                C({sel.n},{sel.k}) = {selVal}
              </div>
              <div className="text-xs text-muted-foreground">
                {sel.n}! / ({sel.k}! · {sel.n - sel.k}!) = {fact(sel.n)} / (
                {fact(sel.k)} · {fact(sel.n - sel.k)}) = {selVal}
              </div>
              {sel.n > 0 && sel.k > 0 && sel.k <= sel.n && (
                <button
                  onClick={() => setShowPlus((v) => !v)}
                  className="mt-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-brand/40"
                >
                  {showPlus ? "Skjul pluss-regel" : "Vis pluss-regel"}
                </button>
              )}
              {showPlus && sel.n > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  C({sel.n},{sel.k}) = C({sel.n - 1},{sel.k - 1}) + C(
                  {sel.n - 1},{sel.k}) ={" "}
                  {sel.k - 1 >= 0 && sel.k - 1 <= sel.n - 1
                    ? triangle[sel.n - 1][sel.k - 1]
                    : 0}{" "}
                  +{" "}
                  {sel.k >= 0 && sel.k <= sel.n - 1
                    ? triangle[sel.n - 1][sel.k]
                    : 0}{" "}
                  = {selVal}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
