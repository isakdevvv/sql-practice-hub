import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";

type Route = {
  id: string;
  via: string; // hvilken nabo-AS pakken sendes ut til
  localPref: number;
  asPath: number[]; // sekvens av AS-numre
  igpCost: number; // intra-AS-kost til exit-point
  bgpId: string; // router-ID for tiebreak
};

type Stage = {
  name: string;
  description: string;
  filter: (routes: Route[]) => Route[];
};

const STAGES_BASE: Omit<Stage, "filter">[] = [
  {
    name: "1. LOCAL_PREF",
    description: "Høyest LOCAL_PREF vinner. Dette er AS-administratorens policy — operatøren kan tvinge trafikk gjennom en spesifikk uplink.",
  },
  {
    name: "2. AS_PATH-lengde",
    description: "Færrest AS-er i AS_PATH vinner. Korteste vei i AS-topologien — analog til hop count, men på AS-nivå.",
  },
  {
    name: "3. Hot potato (IGP-kost)",
    description: "Laveste intra-AS-kost til exit-router vinner. «Pakken brenner — kast den ut av AS-et så fort som mulig.»",
  },
  {
    name: "4. BGP router-ID (tiebreak)",
    description: "Hvis fortsatt uavgjort: laveste BGP router-ID vinner. Deterministisk tiebreak.",
  },
];

function makeStages(): Stage[] {
  return [
    {
      ...STAGES_BASE[0],
      filter: (rs) => {
        const max = Math.max(...rs.map((r) => r.localPref));
        return rs.filter((r) => r.localPref === max);
      },
    },
    {
      ...STAGES_BASE[1],
      filter: (rs) => {
        const min = Math.min(...rs.map((r) => r.asPath.length));
        return rs.filter((r) => r.asPath.length === min);
      },
    },
    {
      ...STAGES_BASE[2],
      filter: (rs) => {
        const min = Math.min(...rs.map((r) => r.igpCost));
        return rs.filter((r) => r.igpCost === min);
      },
    },
    {
      ...STAGES_BASE[3],
      filter: (rs) => {
        const min = rs.map((r) => r.bgpId).sort()[0];
        return rs.filter((r) => r.bgpId === min);
      },
    },
  ];
}

const INITIAL_ROUTES: Route[] = [
  {
    id: "R1",
    via: "AS200 (Comcast)",
    localPref: 100,
    asPath: [200, 300, 10],
    igpCost: 5,
    bgpId: "10.0.0.1",
  },
  {
    id: "R2",
    via: "AS400 (Telia)",
    localPref: 100,
    asPath: [400, 10],
    igpCost: 12,
    bgpId: "10.0.0.2",
  },
  {
    id: "R3",
    via: "AS500 (NORDUnet)",
    localPref: 80,
    asPath: [500, 10],
    igpCost: 3,
    bgpId: "10.0.0.3",
  },
  {
    id: "R4",
    via: "AS600 (Cogent)",
    localPref: 100,
    asPath: [600, 700, 10],
    igpCost: 8,
    bgpId: "10.0.0.4",
  },
];

export function BgpLadderSim() {
  const [comcastLocalPref, setComcastLocalPref] = useState(100);
  const [stageIdx, setStageIdx] = useState(0);

  const routes = useMemo<Route[]>(() => {
    return INITIAL_ROUTES.map((r) =>
      r.id === "R1" ? { ...r, localPref: comcastLocalPref } : r,
    );
  }, [comcastLocalPref]);

  const stages = useMemo(() => makeStages(), []);

  // Beregn hvilke ruter som er igjen etter hvert filtersteg.
  const survivors = useMemo<Route[][]>(() => {
    const out: Route[][] = [routes];
    let current = routes;
    for (const stage of stages) {
      current = stage.filter(current);
      out.push(current);
    }
    return out;
  }, [routes, stages]);

  useEffect(() => {
    setStageIdx(0);
  }, [comcastLocalPref]);

  const currentSurvivors = survivors[stageIdx];
  const winner = survivors[survivors.length - 1][0];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">LOCAL_PREF for AS200 (Comcast):</span>
          <input
            type="range"
            min={50}
            max={150}
            step={10}
            value={comcastLocalPref}
            onChange={(e) => setComcastLocalPref(parseInt(e.target.value, 10))}
            className="w-32"
          />
          <span className="font-mono font-semibold w-10 text-right">{comcastLocalPref}</span>
        </label>
        <div className="ml-auto text-[11px] text-muted-foreground">
          Steg {stageIdx} av {stages.length} · Vinner: <span className="font-mono text-brand">{winner?.id}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="p-4 bg-background">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Konkurrerende ruter
          </div>
          <div className="space-y-2">
            {routes.map((r) => {
              const stillAlive = currentSurvivors.some((s) => s.id === r.id);
              const wasEliminatedAt = (() => {
                for (let i = 1; i <= stageIdx; i++) {
                  if (!survivors[i].some((s) => s.id === r.id)) return i;
                }
                return 0;
              })();
              const eliminated = wasEliminatedAt > 0;
              return (
                <div
                  key={r.id}
                  className={`rounded-md border p-3 text-xs transition-colors ${
                    eliminated
                      ? "border-border bg-muted/30 opacity-50"
                      : stillAlive && r.id === winner?.id && stageIdx === stages.length
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-brand/30 bg-brand/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {eliminated ? (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    <span className="font-mono font-semibold">{r.id}</span>
                    <span className="text-muted-foreground">via {r.via}</span>
                    {eliminated && (
                      <span className="ml-auto text-[10px] text-red-500">
                        elim. på steg {wasEliminatedAt}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10.5px]">
                    <div>
                      <div className="text-muted-foreground">LOCAL_PREF</div>
                      <div className={`font-semibold ${stageIdx === 1 ? "text-brand" : ""}`}>
                        {r.localPref}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">AS_PATH</div>
                      <div className={`font-semibold ${stageIdx === 2 ? "text-brand" : ""}`}>
                        [{r.asPath.join(",")}]
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">IGP-kost</div>
                      <div className={`font-semibold ${stageIdx === 3 ? "text-brand" : ""}`}>
                        {r.igpCost}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">BGP-ID</div>
                      <div className={`font-semibold ${stageIdx === 4 ? "text-brand" : ""}`}>
                        {r.bgpId}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Filterstigen
            </div>
            <ol className="space-y-1.5">
              {stages.map((s, i) => {
                const done = stageIdx > i;
                const active = stageIdx === i + 1;
                return (
                  <li
                    key={s.name}
                    className={`flex items-start gap-2 text-[11px] leading-tight ${
                      done ? "text-emerald-600 dark:text-emerald-400" : active ? "text-brand font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-mono">{done ? "✓" : active ? "→" : "○"}</span>
                    <span>{s.name}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {stageIdx > 0 && stageIdx <= stages.length && (
            <div className="rounded-md border border-brand/30 bg-brand/5 p-2 text-[11px] leading-relaxed">
              <div className="font-semibold mb-1">{stages[stageIdx - 1].name}</div>
              <div className="text-muted-foreground">{stages[stageIdx - 1].description}</div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStageIdx((p) => Math.max(p - 1, 0))}
              disabled={stageIdx === 0}
              className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1.5 disabled:opacity-50"
            >
              Tilbake
            </button>
            <button
              type="button"
              onClick={() => setStageIdx((p) => Math.min(p + 1, stages.length))}
              disabled={stageIdx >= stages.length}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-brand text-brand-foreground text-xs font-medium px-2 py-1.5 disabled:opacity-50"
            >
              Neste filter
            </button>
          </div>
          <button
            type="button"
            onClick={() => setStageIdx(0)}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card hover:border-brand/40 text-xs font-medium px-2 py-1.5"
          >
            Start om
          </button>

          {stageIdx === stages.length && winner && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-2 text-[11px] leading-relaxed">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                Vinner: {winner.id}
              </div>
              <span className="text-muted-foreground">
                Trafikken sendes ut via {winner.via}.
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
