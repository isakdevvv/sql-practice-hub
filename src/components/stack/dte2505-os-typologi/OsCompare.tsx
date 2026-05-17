import { useMemo, useState } from "react";
import {
  OS_TYPES,
  WORKLOADS,
  type OsType,
  type Workload,
  type WorkloadDef,
  type OsDef,
} from "./OsTypologiSimulator";

// Vi importerer ikke simulate() ut igjen — gjør en mini-versjon her som bare
// returnerer nøkkel-tall (total tid, maks kø, missed deadlines) for to
// OS-typer side om side på samme workload.

type Mini = {
  totalTid: number;
  maksKø: number;
  missed: number;
  cpuBruk: number; // 0..1
};

function miniSim(workload: WorkloadDef, os: OsDef, maxSteg = 60): Mini {
  const rem: Record<string, number> = {};
  const arrived: Set<string> = new Set();
  const ferdig: Set<string> = new Set();
  const missed: Set<string> = new Set();
  for (const j of workload.jobs) rem[j.id] = j.arbeid;

  let kø: string[] = [];
  let cpuJob: (string | null)[] = Array(os.ant_cpu).fill(null);
  let cpuRunning: number[] = Array(os.ant_cpu).fill(0);
  let maksKø = 0;
  let cpuTicksAktive = 0;
  let cpuTicksTotalt = 0;
  let sluttSteg = 0;

  for (let t = 0; t < maxSteg; t++) {
    for (const j of workload.jobs) {
      if (j.ankomst === t && !arrived.has(j.id)) {
        arrived.add(j.id);
        kø.push(j.id);
      }
    }
    if (os.deadlineAware) {
      kø.sort((a, b) => {
        const ja = workload.jobs.find((x) => x.id === a)!;
        const jb = workload.jobs.find((x) => x.id === b)!;
        return (ja.deadline ?? 1e9) - (jb.deadline ?? 1e9);
      });
    }

    for (let c = 0; c < os.ant_cpu; c++) {
      if (cpuJob[c] === null && kø.length > 0) {
        cpuJob[c] = kø.shift()!;
        cpuRunning[c] = 0;
      }
    }

    for (let c = 0; c < os.ant_cpu; c++) {
      const id = cpuJob[c];
      cpuTicksTotalt++;
      if (id !== null) {
        cpuTicksAktive++;
        rem[id]--;
        cpuRunning[c]++;
        if (rem[id] <= 0) {
          ferdig.add(id);
          cpuJob[c] = null;
          cpuRunning[c] = 0;
        } else if (os.preempt && cpuRunning[c] >= os.q) {
          kø.push(id);
          cpuJob[c] = null;
          cpuRunning[c] = 0;
        }
      }
    }

    for (const j of workload.jobs) {
      if (
        j.deadline !== undefined &&
        !ferdig.has(j.id) &&
        !missed.has(j.id) &&
        !os.deadlineAware &&
        t + 1 > j.deadline
      ) {
        missed.add(j.id);
      }
    }

    maksKø = Math.max(maksKø, kø.length);
    sluttSteg = t + 1;

    const ingenAktiv = cpuJob.every((c) => c === null);
    const alleFerdig = workload.jobs.every(
      (j) => ferdig.has(j.id) || missed.has(j.id),
    );
    if (ingenAktiv && kø.length === 0 && alleFerdig) {
      break;
    }
  }

  return {
    totalTid: sluttSteg,
    maksKø,
    missed: missed.size,
    cpuBruk: cpuTicksTotalt > 0 ? cpuTicksAktive / cpuTicksTotalt : 0,
  };
}

function Bar({
  label,
  value,
  max,
  bad,
  good,
}: {
  label: string;
  value: number | string;
  max?: number;
  bad?: boolean;
  good?: boolean;
}) {
  const pct =
    typeof value === "number" && max && max > 0
      ? Math.min(100, (value / max) * 100)
      : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[10px] mb-0.5">
        <span className="uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className={`font-mono text-xs ${
            bad
              ? "text-rose-500 font-semibold"
              : good
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
          }`}
        >
          {value}
        </span>
      </div>
      {max !== undefined && (
        <div className="h-1.5 rounded bg-muted overflow-hidden">
          <div
            className={`h-full ${
              bad
                ? "bg-rose-500"
                : good
                  ? "bg-emerald-500"
                  : "bg-brand"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function OsCompare() {
  const [workloadId, setWorkloadId] = useState<Workload>("editor");
  const [leftOs, setLeftOs] = useState<OsType>("interactive");
  const [rightOs, setRightOs] = useState<OsType>("batch");

  const workload = useMemo(
    () => WORKLOADS.find((w) => w.id === workloadId)!,
    [workloadId],
  );
  const left = useMemo(
    () => miniSim(workload, OS_TYPES.find((o) => o.id === leftOs)!),
    [workload, leftOs],
  );
  const right = useMemo(
    () => miniSim(workload, OS_TYPES.find((o) => o.id === rightOs)!),
    [workload, rightOs],
  );

  const maxTid = Math.max(left.totalTid, right.totalTid, 1);
  const maxKø = Math.max(left.maksKø, right.maksKø, 1);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Side om side — to OS-er på samme workload
        </div>
        <div className="text-xs">
          <label className="text-muted-foreground mr-2">workload:</label>
          <select
            value={workloadId}
            onChange={(e) => setWorkloadId(e.target.value as Workload)}
            className="rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {WORKLOADS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-0">
        {[
          { side: "venstre", osId: leftOs, set: setLeftOs, data: left },
          { side: "høyre", osId: rightOs, set: setRightOs, data: right },
        ].map((c, i) => (
          <div
            key={c.side}
            className={`p-4 space-y-2 ${
              i === 0 ? "border-b md:border-b-0 md:border-r border-border" : ""
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {c.side === "venstre" ? "A" : "B"}
            </div>
            <select
              value={c.osId}
              onChange={(e) => c.set(e.target.value as OsType)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            >
              {OS_TYPES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="space-y-2 pt-1">
              <Bar
                label="total tid (steg)"
                value={c.data.totalTid}
                max={maxTid}
                bad={c.data.totalTid === maxTid && left.totalTid !== right.totalTid}
                good={
                  c.data.totalTid < maxTid && left.totalTid !== right.totalTid
                }
              />
              <Bar
                label="maks kø-lengde"
                value={c.data.maksKø}
                max={maxKø}
                bad={c.data.maksKø > 5}
                good={c.data.maksKø <= 2}
              />
              <Bar
                label="cpu-bruk"
                value={`${Math.round(c.data.cpuBruk * 100)}%`}
              />
              <Bar
                label="missed deadlines"
                value={c.data.missed}
                bad={c.data.missed > 0}
                good={c.data.missed === 0}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Sammenlign:</span>{" "}
        velg samme workload på to ulike OS-typer. Tall i rødt er det dårligste,
        grønt er det beste. Prøv f.eks. "fly-by-wire" med RTOS vs. interactive
        — se hvordan missed-deadlines går fra 0 til mange.
      </div>
    </div>
  );
}
