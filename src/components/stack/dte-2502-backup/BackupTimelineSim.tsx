import { useMemo, useState } from "react";

/**
 * BackupTimelineSim — 30-dagers tidslinje hvor brukeren velger backup-strategi
 * og ser hvilke filer som skrives hver dag, hvor mye lagring som forbrukes,
 * og hvor langt backup-vinduet blir hver natt.
 *
 * Strategier:
 *   - "full-daily":        full kopi hver natt
 *   - "weekly-inc":        full ukentlig (søndag) + inkrementell de andre dagene
 *   - "weekly-diff":       full ukentlig (søndag) + differensiell de andre dagene
 *   - "gfs":               GFS — daglig inkrementell, ukentlig full (helg),
 *                          månedlig full (siste søndag = stor "grandfather")
 *
 * Antakelser (rimelige skole-tall):
 *   - Total dataset:                      1000 GB
 *   - Dag-til-dag endring (delta):        ~ 20 GB nye/endrede filer per dag
 *   - Full backup:                        100 % av datasettet = 1000 GB
 *   - Inkrementell:                       bare det som er endret siden FORRIGE backup (= ~20 GB)
 *   - Differensiell:                      alt som er endret siden SISTE FULL (= 20 GB × dager siden full)
 *   - Throughput:                         500 GB/t (≈ 140 MB/s) → bestemmer backup-vindu
 */

type Strategy = "full-daily" | "weekly-inc" | "weekly-diff" | "gfs";
type Kind = "full" | "incremental" | "differential";

type DayEntry = {
  day: number; // 1..30
  weekday: number; // 0=man .. 6=søn
  kind: Kind | null; // null = ingen backup
  sizeGb: number;
  label: string;
};

const TOTAL_DATA_GB = 1000;
const DAILY_DELTA_GB = 20;
const THROUGHPUT_GB_PER_HOUR = 500;

const STRATEGY_META: Record<
  Strategy,
  { label: string; blurb: string; color: string }
> = {
  "full-daily": {
    label: "Full hver dag",
    blurb:
      "Komplett kopi hver natt. Enklest å gjenopprette, men dyrest i lagring og backup-vindu.",
    color: "emerald",
  },
  "weekly-inc": {
    label: "Full (ukentlig) + Inkrementell (daglig)",
    blurb:
      "Full hver søndag. Mandag-lørdag kun det som er endret siden GÅRSDAGENS backup.",
    color: "amber",
  },
  "weekly-diff": {
    label: "Full (ukentlig) + Differensiell (daglig)",
    blurb:
      "Full hver søndag. Mandag-lørdag alt som er endret siden SISTE FULL — vokser gjennom uka.",
    color: "orange",
  },
  gfs: {
    label: "GFS (Grandfather-Father-Son)",
    blurb:
      "Inkrementelle daglig (Son), full ukentlig (Father, søndag), månedlig stor full (Grandfather, siste søndag).",
    color: "sky",
  },
};

function buildSchedule(strategy: Strategy): DayEntry[] {
  const out: DayEntry[] = [];
  // Dag 1 = mandag (uke 1). Søndag = weekday 6, dag 7/14/21/28.
  let daysSinceFull = 0;
  for (let day = 1; day <= 30; day++) {
    const weekday = (day - 1) % 7;
    const isSunday = weekday === 6;
    let kind: Kind | null = null;
    let sizeGb = 0;
    let label = "";

    switch (strategy) {
      case "full-daily":
        kind = "full";
        sizeGb = TOTAL_DATA_GB;
        label = "FULL";
        daysSinceFull = 0;
        break;
      case "weekly-inc":
        if (isSunday || day === 1) {
          kind = "full";
          sizeGb = TOTAL_DATA_GB;
          label = "FULL";
          daysSinceFull = 0;
        } else {
          kind = "incremental";
          sizeGb = DAILY_DELTA_GB;
          label = "INC";
          daysSinceFull += 1;
        }
        break;
      case "weekly-diff":
        if (isSunday || day === 1) {
          kind = "full";
          sizeGb = TOTAL_DATA_GB;
          label = "FULL";
          daysSinceFull = 0;
        } else {
          kind = "differential";
          daysSinceFull += 1;
          sizeGb = DAILY_DELTA_GB * daysSinceFull;
          label = `DIFF +${daysSinceFull}d`;
        }
        break;
      case "gfs": {
        const isMonthlyGrandfather = day === 28; // siste søndag i en 30-dagers periode
        if (isMonthlyGrandfather) {
          kind = "full";
          sizeGb = TOTAL_DATA_GB;
          label = "GRANDFATHER";
          daysSinceFull = 0;
        } else if (isSunday || day === 1) {
          kind = "full";
          sizeGb = TOTAL_DATA_GB;
          label = "FATHER";
          daysSinceFull = 0;
        } else {
          kind = "incremental";
          sizeGb = DAILY_DELTA_GB;
          label = "SON";
          daysSinceFull += 1;
        }
        break;
      }
    }
    out.push({ day, weekday, kind, sizeGb, label });
  }
  return out;
}

function fmtGb(gb: number): string {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
  return `${gb.toFixed(0)} GB`;
}

function fmtHours(gb: number): string {
  const hours = gb / THROUGHPUT_GB_PER_HOUR;
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 10) return `${hours.toFixed(1)} t`;
  return `${Math.round(hours)} t`;
}

function kindColor(kind: Kind | null, opacity: "bg" | "border" | "text"): string {
  if (kind === null) return opacity === "bg" ? "bg-muted/30" : opacity === "border" ? "border-border" : "text-muted-foreground";
  if (kind === "full") {
    return opacity === "bg" ? "bg-emerald-500/80" : opacity === "border" ? "border-emerald-500" : "text-emerald-600 dark:text-emerald-400";
  }
  if (kind === "incremental") {
    return opacity === "bg" ? "bg-amber-400/80" : opacity === "border" ? "border-amber-500" : "text-amber-600 dark:text-amber-400";
  }
  return opacity === "bg" ? "bg-orange-500/80" : opacity === "border" ? "border-orange-500" : "text-orange-600 dark:text-orange-400";
}

const WEEKDAY_NO = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

export function BackupTimelineSim() {
  const [strategy, setStrategy] = useState<Strategy>("weekly-inc");

  const schedule = useMemo(() => buildSchedule(strategy), [strategy]);

  const totals = useMemo(() => {
    const totalGb = schedule.reduce((s, d) => s + d.sizeGb, 0);
    const fullCount = schedule.filter((d) => d.kind === "full").length;
    const incCount = schedule.filter((d) => d.kind === "incremental").length;
    const diffCount = schedule.filter((d) => d.kind === "differential").length;
    // Maks backup-vindu per natt:
    const maxNight = schedule.reduce(
      (m, d) => (d.sizeGb > m ? d.sizeGb : m),
      0,
    );
    const avgNight = totalGb / 30;
    return { totalGb, fullCount, incCount, diffCount, maxNight, avgNight };
  }, [schedule]);

  // Max bar-høyde i tidslinjen — bruk full=100% som anker så søylene er
  // sammenlignbare på tvers av strategier.
  const maxBarValue = TOTAL_DATA_GB;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Strategi-velger */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">Velg strategi</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {(Object.keys(STRATEGY_META) as Strategy[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStrategy(s)}
              className={`text-xs rounded-md border px-2.5 py-2 text-left transition ${
                strategy === s
                  ? "border-brand bg-brand/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <div className="font-semibold leading-tight mb-0.5">
                {STRATEGY_META[s].label}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {STRATEGY_META[strategy].blurb}
        </p>
      </div>

      {/* Tidslinje 30 dager */}
      <div className="rounded-lg border border-border bg-muted/20 p-3 mb-4">
        <div className="flex items-end justify-between mb-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            30-dagers tidslinje (mandag = dag 1)
          </div>
          <div className="text-[10px] text-muted-foreground">
            Søyle-høyde = backup-størrelse den natten
          </div>
        </div>
        <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[2px] h-32 items-end">
          {schedule.map((d) => {
            const heightPct = (d.sizeGb / maxBarValue) * 100;
            const minHeight = d.sizeGb > 0 ? 4 : 1;
            return (
              <div
                key={d.day}
                className="flex flex-col items-stretch justify-end h-full"
                title={`Dag ${d.day} (${WEEKDAY_NO[d.weekday]}) — ${d.label}: ${fmtGb(d.sizeGb)}`}
              >
                <div
                  className={`${kindColor(d.kind, "bg")} rounded-t-sm`}
                  style={{
                    height: `${Math.max(minHeight, heightPct)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* Akse-merker — uke-nummer hver 7. dag */}
        <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[2px] mt-1">
          {schedule.map((d) => (
            <div
              key={d.day}
              className="text-[8px] text-center text-muted-foreground font-mono"
            >
              {d.day % 7 === 1 || d.day === 1 ? `u${Math.ceil(d.day / 7)}` : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Forklaring av søyler + tabell + sidepanel */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Tabell — dag for dag */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-1">
            Dag-for-dag-skjema (de første 14 dagene)
          </div>
          <div className="grid grid-cols-7 text-[10px] gap-px bg-border">
            {WEEKDAY_NO.map((w) => (
              <div
                key={w}
                className="bg-muted/30 px-1 py-0.5 text-center font-mono text-muted-foreground"
              >
                {w}
              </div>
            ))}
            {schedule.slice(0, 14).map((d) => (
              <div
                key={d.day}
                className={`bg-background px-1.5 py-1.5 border-l-2 ${kindColor(
                  d.kind,
                  "border",
                )}`}
              >
                <div className="font-mono text-[9px] text-muted-foreground">
                  d{d.day}
                </div>
                <div
                  className={`font-mono text-[10px] font-semibold ${kindColor(d.kind, "text")}`}
                >
                  {d.label}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {fmtGb(d.sizeGb)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidepanel — totals */}
        <div className="rounded-lg border border-border bg-background p-3 space-y-2.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Sum over 30 dager
          </div>
          <Stat
            label="Total lagring"
            value={fmtGb(totals.totalGb)}
            sub={`${((totals.totalGb / (TOTAL_DATA_GB * 30)) * 100).toFixed(0)} % av "full hver dag"`}
          />
          <Stat
            label="Lengst backup-vindu"
            value={fmtHours(totals.maxNight)}
            sub={`= ${fmtGb(totals.maxNight)} en natt`}
          />
          <Stat
            label="Snitt backup-vindu"
            value={fmtHours(totals.avgNight)}
            sub={`gj.snitt ${fmtGb(totals.avgNight)} / natt`}
          />
          <div className="border-t border-border pt-2 text-[10px] text-muted-foreground space-y-0.5">
            <div className="flex justify-between">
              <span>Antall full backups</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {totals.fullCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Antall inkrementelle</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                {totals.incCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Antall differensielle</span>
              <span className="font-mono text-orange-600 dark:text-orange-400">
                {totals.diffCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legende */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <LegendDot color="bg-emerald-500/80" label="Full backup (100 % av data)" />
        <LegendDot color="bg-amber-400/80" label="Inkrementell (endring siden i går)" />
        <LegendDot color="bg-orange-500/80" label="Differensiell (endring siden siste full)" />
        <span className="ml-auto font-mono">
          Antakelse: 1000 GB datasett · 20 GB delta/dag · 500 GB/t throughput
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums leading-tight">
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}
