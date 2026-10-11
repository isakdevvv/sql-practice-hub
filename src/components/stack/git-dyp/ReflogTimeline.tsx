import { useState } from "react";
import { LifeBuoy, RotateCcw } from "lucide-react";

// --------------------------------------------------------------------------
// Reflog-tidslinje.
// Scenario: studenten committer noen ganger, så gjør "git reset --hard HEAD~2"
// og «mister» de to siste. Reflog husker hver gang HEAD flyttet seg, og lar
// dem hente commiten tilbake selv om INGEN branch peker på den lenger.
// --------------------------------------------------------------------------

type Step =
  | "start" // 4 commits, main → C4
  | "reset" // main → C2, C3 og C4 «orphan»
  | "recover"; // ny branch eller reset til reflog-oppføring

type Commit = {
  sha: string;
  label: string;
  msg: string;
};

const COMMITS: Commit[] = [
  { sha: "a1b2c3d", label: "C1", msg: "init" },
  { sha: "b2c3d4e", label: "C2", msg: "feat: parser" },
  { sha: "c3d4e5f", label: "C3", msg: "feat: viktig arbeid" },
  { sha: "d4e5f6a", label: "C4", msg: "feat: enda mer" },
];

type ReflogEntry = { idx: number; action: string; sha: string };

export function ReflogTimeline() {
  const [step, setStep] = useState<Step>("start");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Reflog vokser etter handlinger.
  const reflog: ReflogEntry[] = (() => {
    const base: ReflogEntry[] = [
      { idx: 3, action: "commit: feat: enda mer", sha: COMMITS[3].sha }, // HEAD@{0} ved start
      { idx: 2, action: "commit: feat: viktig arbeid", sha: COMMITS[2].sha },
      { idx: 1, action: "commit: feat: parser", sha: COMMITS[1].sha },
      { idx: 0, action: "commit: init", sha: COMMITS[0].sha },
    ];
    if (step === "reset" || step === "recover") {
      // Reset registreres som ny topp.
      base.unshift({ idx: 1, action: "reset: moving to HEAD~2", sha: COMMITS[1].sha });
    }
    if (step === "recover") {
      base.unshift({ idx: 3, action: "checkout: from HEAD~2 to <sha>", sha: COMMITS[3].sha });
    }
    return base;
  })();

  // Main-peker
  const mainPointsTo =
    step === "start" ? 3 : step === "reset" ? 1 : 1; // ved recover er det «reddet»-branch som peker på C4

  // «Tilgjengelig» fra noen ref?
  const reachable = (idx: number) => {
    if (step === "start") return idx <= mainPointsTo;
    if (step === "reset") return idx <= 1; // C3, C4 er orphan
    if (step === "recover") return idx <= 1 || idx >= 2; // alle er reachable igjen
    return true;
  };

  // SVG
  const stepX = 90;
  const startX = 50;
  const y = 70;
  const svgW = startX + COMMITS.length * stepX;
  const svgH = 170;

  const headIdx = step === "start" ? 3 : step === "reset" ? 1 : step === "recover" ? 3 : 3;
  const hoverSha = hoverIdx !== null ? reflog[hoverIdx]?.sha : null;
  const hoverCommitIdx =
    hoverSha !== null ? COMMITS.findIndex((c) => c.sha === hoverSha) : -1;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
        Reflog-redningsbøyen
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Reflog er en lokal logg over alle ganger HEAD flyttet seg, holdt i ~90 dager. Selv om
        ingen branch peker på en commit, kan du finne den tilbake. Spill scenarioet steg for
        steg.
      </p>

      {/* Stegknapper */}
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <button
          onClick={() => setStep("start")}
          className={
            "rounded-md border px-2.5 py-1 " +
            (step === "start"
              ? "border-brand bg-brand/10 text-brand font-semibold"
              : "border-border hover:bg-muted/40")
          }
        >
          1 · Etter 4 commits
        </button>
        <button
          onClick={() => setStep("reset")}
          disabled={step === "start" ? false : step === "reset" ? true : true}
          className={
            "rounded-md border px-2.5 py-1 " +
            (step === "reset"
              ? "border-warning bg-warning/10 text-warning font-semibold"
              : "border-border hover:bg-muted/40")
          }
        >
          2 · <span className="font-mono">git reset --hard HEAD~2</span>
        </button>
        <button
          onClick={() => setStep("recover")}
          disabled={step !== "reset"}
          className={
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 " +
            (step === "recover"
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
              : step === "reset"
              ? "border-border hover:bg-muted/40"
              : "border-border opacity-40")
          }
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          3 · <span className="font-mono">git branch reddet HEAD@{"{1}"}</span>
        </button>
        <button
          onClick={() => setStep("start")}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card hover:bg-muted/40 px-2 py-1 ml-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset scenariet
        </button>
      </div>

      {/* SVG-tidslinje */}
      <div className="rounded-lg border border-border bg-background/40 overflow-hidden">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto block">
          {/* Edges */}
          {COMMITS.map((c, i) => {
            if (i === 0) return null;
            const x1 = startX + (i - 1) * stepX;
            const x2 = startX + i * stepX;
            const r = reachable(i);
            return (
              <line
                key={`e-${i}`}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="currentColor"
                strokeOpacity={r ? 0.45 : 0.18}
                strokeDasharray={r ? undefined : "3 3"}
                strokeWidth={2}
              />
            );
          })}
          {/* Noder */}
          {COMMITS.map((c, i) => {
            const cx = startX + i * stepX;
            const r = reachable(i);
            const isHead = i === headIdx;
            const isHovered = hoverCommitIdx === i;
            const fill = r ? "rgb(56,189,248)" : "rgb(148,163,184)";
            return (
              <g key={c.sha} opacity={r ? 1 : 0.55}>
                <circle
                  cx={cx}
                  cy={y}
                  r={isHovered ? 14 : isHead ? 13 : 11}
                  fill={isHovered ? "rgb(251,191,36)" : fill}
                  fillOpacity={r ? 0.85 : 0.4}
                  stroke="currentColor"
                  strokeWidth={isHead || isHovered ? 2 : 1}
                  strokeDasharray={r ? undefined : "2 2"}
                />
                <text x={cx} y={y + 4} textAnchor="middle" fontSize={11} className="font-mono fill-foreground">
                  {c.label}
                </text>
                <text x={cx} y={y + 28} textAnchor="middle" fontSize={9} className="fill-muted-foreground font-mono">
                  {c.sha}
                </text>
                <text x={cx} y={y + 41} textAnchor="middle" fontSize={9} className="fill-muted-foreground" fontStyle="italic">
                  {c.msg}
                </text>
                {!r && (
                  <text x={cx} y={y - 24} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                    «orphan»
                  </text>
                )}
              </g>
            );
          })}
          {/* main label */}
          <g>
            <rect
              x={startX + mainPointsTo * stepX - 22}
              y={y - 42}
              width={50}
              height={16}
              rx={3}
              fill={"rgb(56,189,248)"}
              fillOpacity={0.18}
              stroke={"rgb(56,189,248)"}
            />
            <text
              x={startX + mainPointsTo * stepX + 3}
              y={y - 30}
              textAnchor="middle"
              fontSize={10}
              className="font-mono"
              fill={"rgb(56,189,248)"}
            >
              main
            </text>
          </g>
          {/* reddet label */}
          {step === "recover" && (
            <g>
              <rect
                x={startX + 3 * stepX - 30}
                y={y - 42}
                width={66}
                height={16}
                rx={3}
                fill={"rgb(34,197,94)"}
                fillOpacity={0.2}
                stroke={"rgb(34,197,94)"}
              />
              <text
                x={startX + 3 * stepX + 3}
                y={y - 30}
                textAnchor="middle"
                fontSize={10}
                className="font-mono"
                fill={"rgb(34,197,94)"}
              >
                reddet
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Reflog */}
      <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-2 flex items-center justify-between">
            <span>git reflog</span>
            <span className="text-[10px] text-muted-foreground font-normal">hover for å markere</span>
          </div>
          <div className="font-mono text-[11px] leading-relaxed">
            {reflog.map((r, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className={
                  "px-1 -mx-1 rounded cursor-default " +
                  (hoverIdx === i ? "bg-warning/15" : "")
                }
              >
                <span className="text-muted-foreground">{r.sha.slice(0, 7)}</span>{" "}
                <span className="text-foreground">HEAD@{`{${i}}`}</span>:{" "}
                <span className="text-muted-foreground">{r.action}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3">
          <div className="font-semibold mb-1">Hva foregår</div>
          {step === "start" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`HEAD = main = C4 (d4e5f6a)

Alle 4 commits er nådd fra main.
Reflog har 4 oppføringer — én pr
commit du har laget.

Klikk «git reset --hard HEAD~2»
for å simulere katastrofen.`}
            </pre>
          )}
          {step === "reset" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`💥  main → C2.
C3 og C4 er UNREACHABLE fra
noen branch — git log viser
dem ikke. De ser «borte» ut.

MEN: de finnes fortsatt i
.git/objects, og reflog husker
HEAD@{1} = C4.

Hover «commit: feat: enda mer»
i reflog-listen til venstre.`}
            </pre>
          )}
          {step === "recover" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
{`✓  reddet → C4.

git branch reddet HEAD@{1}
opprettet en ny ref som peker
på C4. Dermed er C3 og C4
reachable igjen.

Eneste mulige tap nå er hvis
git gc rydder objekter eldre
enn 90 dager (kan konfigureres).`}
            </pre>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Husk:</strong> reflog er <em>lokalt</em>. Hvis du
        rebasen din force-push-er og en kollega så pull-er deg, kan du fortsatt redde dem fra
        din egen reflog — men ikke kollegaen sin lokale historikk. <code className="font-mono">--force-with-lease</code>{" "}
        gir minst en advarsel.
      </p>
    </div>
  );
}
