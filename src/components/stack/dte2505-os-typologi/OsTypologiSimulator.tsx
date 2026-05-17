import { useEffect, useMemo, useRef, useState } from "react";

// ----- Domenetyper -----

export type OsType = "batch" | "interactive" | "network" | "realtime" | "distributed";

export type Workload =
  | "payroll"
  | "editor"
  | "flybywire"
  | "printserver"
  | "googlecompute";

type Verdict = "ok" | "warn" | "fail";

type WorkloadDef = {
  id: Workload;
  label: string;
  // Norsk underbeskrivelse vist i UI
  beskrivelse: string;
  // Hvilken OS-type passer (ideelt)?
  ideal: OsType;
  // Også OK (alternativer som ikke er ideelle, men funker)
  ok?: OsType[];
  // Jobb-mønster: hvor mange "jobber" som ankommer og deres karakter.
  // Batch: én tung jobb. Interaktivt: mange små. Real-time: jobber med deadline.
  jobs: SimJob[];
};

type SimJob = {
  id: string;
  // Når jobben dukker opp (i steg, 0..N)
  ankomst: number;
  // Hvor mange tids-steg jobben trenger på CPU
  arbeid: number;
  // Hard deadline (i steg fra t=0). Hvis satt og missed → fail for real-time.
  deadline?: number;
  // Visuell etikett
  navn: string;
  // Type — påvirker hvordan ulike OS-typer behandler den
  kind: "compute" | "interactive" | "io" | "rt";
};

const WORKLOADS: WorkloadDef[] = [
  {
    id: "payroll",
    label: "Lønnskjøring (payroll)",
    beskrivelse:
      "Én stor jobb: les 50 000 ansatt-rader, beregn skatt, skriv ut lønnsslipper. Trenger ikke menneskelig input. Skal være ferdig før morgenen.",
    ideal: "batch",
    ok: ["interactive"],
    jobs: [
      { id: "p1", navn: "lønn-batch", ankomst: 0, arbeid: 18, kind: "compute" },
    ],
  },
  {
    id: "editor",
    label: "Tekstredigering (editor)",
    beskrivelse:
      "Bruker skriver, sletter, scroller. Hver tastetrykk må vises innen ~100 ms ellers føles det laggy. Lav CPU-bruk, mye respons.",
    ideal: "interactive",
    ok: ["network"],
    jobs: [
      { id: "k1", navn: "tast 'h'", ankomst: 0, arbeid: 1, kind: "interactive" },
      { id: "k2", navn: "tast 'e'", ankomst: 2, arbeid: 1, kind: "interactive" },
      { id: "k3", navn: "tast 'l'", ankomst: 4, arbeid: 1, kind: "interactive" },
      { id: "k4", navn: "scroll", ankomst: 6, arbeid: 1, kind: "interactive" },
      { id: "k5", navn: "tast 'l'", ankomst: 8, arbeid: 1, kind: "interactive" },
      { id: "k6", navn: "tast 'o'", ankomst: 10, arbeid: 1, kind: "interactive" },
    ],
  },
  {
    id: "flybywire",
    label: "Fly-by-wire (kontrollsystem)",
    beskrivelse:
      "Sensor-sløyfe i et fly: hver 20 ms må styreflater-kommandoer regnes ut og sendes. Hvis én iterasjon er for sen → flyet styrter.",
    ideal: "realtime",
    jobs: [
      { id: "r1", navn: "ctrl-loop #1", ankomst: 0, arbeid: 2, deadline: 3, kind: "rt" },
      { id: "r2", navn: "ctrl-loop #2", ankomst: 3, arbeid: 2, deadline: 6, kind: "rt" },
      { id: "r3", navn: "ctrl-loop #3", ankomst: 6, arbeid: 2, deadline: 9, kind: "rt" },
      { id: "r4", navn: "ctrl-loop #4", ankomst: 9, arbeid: 2, deadline: 12, kind: "rt" },
      { id: "r5", navn: "ctrl-loop #5", ankomst: 12, arbeid: 2, deadline: 15, kind: "rt" },
    ],
  },
  {
    id: "printserver",
    label: "Delt printer-server",
    beskrivelse:
      "5 kollegaer på kontor sender utskrifter til samme printer over LAN. OS-et må kø, autentisere brukere, og dele ressursen rettferdig.",
    ideal: "network",
    ok: ["interactive"],
    jobs: [
      { id: "n1", navn: "print fra Anna", ankomst: 0, arbeid: 3, kind: "io" },
      { id: "n2", navn: "print fra Ben", ankomst: 1, arbeid: 2, kind: "io" },
      { id: "n3", navn: "print fra Cara", ankomst: 2, arbeid: 4, kind: "io" },
      { id: "n4", navn: "print fra Dan", ankomst: 5, arbeid: 2, kind: "io" },
      { id: "n5", navn: "print fra Eli", ankomst: 7, arbeid: 3, kind: "io" },
    ],
  },
  {
    id: "googlecompute",
    label: "Google-skala compute",
    beskrivelse:
      "Indekser hele internett. Jobben må splittes over tusenvis av maskiner, og resultatet samles. Krever koordinering på tvers av noder.",
    ideal: "distributed",
    ok: ["batch"],
    jobs: [
      { id: "d1", navn: "index-shard A", ankomst: 0, arbeid: 6, kind: "compute" },
      { id: "d2", navn: "index-shard B", ankomst: 0, arbeid: 6, kind: "compute" },
      { id: "d3", navn: "index-shard C", ankomst: 0, arbeid: 6, kind: "compute" },
      { id: "d4", navn: "index-shard D", ankomst: 0, arbeid: 6, kind: "compute" },
    ],
  },
];

type OsDef = {
  id: OsType;
  label: string;
  kort: string;
  detalj: string;
  ant_cpu: number; // hvor mange parallelle "CPU-er" (distributed > 1)
  // Antall steg jobben må vente før første scheduling (response-overhead)
  responsLag: number;
  // Bruker preemption (typisk tidsskvant)
  preempt: boolean;
  // Tidskvant hvis preemption
  q: number;
  // Hard deadline-håndtering
  deadlineAware: boolean;
};

const OS_TYPES: OsDef[] = [
  {
    id: "batch",
    label: "Batch-OS",
    kort: "Kjører én jobb om gangen til ferdig. Ingen interaktivitet. Optimerer throughput.",
    detalj:
      "Klassisk: IBM OS/360. Jobber sendes inn på kort/tape, kjøres i kø, output skrives. Brukeren ser ikke noe før jobben er ferdig.",
    ant_cpu: 1,
    responsLag: 0,
    preempt: false,
    q: 99,
    deadlineAware: false,
  },
  {
    id: "interactive",
    label: "Interactive OS (timesharing)",
    kort: "Round-robin med korte tidsskvanter. Lav respons-tid. Mange brukere/programmer samtidig.",
    detalj:
      "Unix, Windows, macOS, Linux desktop. Scheduleren preempter jobber så ofte at det føles som om alt skjer samtidig. Optimerer respons-tid.",
    ant_cpu: 1,
    responsLag: 0,
    preempt: true,
    q: 1,
    deadlineAware: false,
  },
  {
    id: "network",
    label: "Network OS",
    kort: "Interactive OS + nettverkstjenester: fildeling, printer-deling, autentisering på tvers.",
    detalj:
      "Novell NetWare, Windows Server. Hver maskin er en uavhengig node, men OS-et eksponerer delte ressurser over LAN. Bruker vet at filen ligger 'på serveren'.",
    ant_cpu: 1,
    responsLag: 1,
    preempt: true,
    q: 2,
    deadlineAware: false,
  },
  {
    id: "realtime",
    label: "Real-time OS (RTOS)",
    kort: "Garanterer at jobber fullføres før deadline. Prioritetsbasert, ofte ikke generelt formål.",
    detalj:
      "VxWorks, QNX, FreeRTOS. Brukt i fly, biler, medisinsk utstyr, industrielle styringssystemer. Hard real-time: bom på deadline = systemfeil.",
    ant_cpu: 1,
    responsLag: 0,
    preempt: true,
    q: 1,
    deadlineAware: true,
  },
  {
    id: "distributed",
    label: "Distributed OS",
    kort: "Mange maskiner som ser ut som ett system. Jobber splittes på tvers av noder, transparent for bruker.",
    detalj:
      "Google Borg, Kubernetes, Amoeba. Hovedutfordring: koordinering, feiltoleranse, klokkesynkronisering. Bruker ser én logisk maskin.",
    ant_cpu: 4,
    responsLag: 1,
    preempt: true,
    q: 99,
    deadlineAware: false,
  },
];

// ----- Simulator-motoren -----

type Tick = {
  t: number;
  // Per "CPU"-spor, hvilken jobb kjører (eller null)
  cpu: (string | null)[];
  // Hvilke jobber står i kø
  kø: string[];
  // Hvilke er ferdige
  ferdig: string[];
  // Hvilke har missed deadline
  missed: string[];
};

function simulate(workload: WorkloadDef, os: OsDef, maxSteg = 40): Tick[] {
  // Lag mutable kopi
  const rem: Record<string, number> = {};
  const arrived: Set<string> = new Set();
  const ferdig: Set<string> = new Set();
  const missed: Set<string> = new Set();
  for (const j of workload.jobs) rem[j.id] = j.arbeid;

  // En kø per CPU? Vi modellerer én felles kø som distrubueres på CPU-ene.
  let kø: string[] = [];
  // Per-CPU aktive jobber + hvor lenge de har kjørt på gjeldende quantum
  let cpuJob: (string | null)[] = Array(os.ant_cpu).fill(null);
  let cpuRunning: number[] = Array(os.ant_cpu).fill(0);

  const ticks: Tick[] = [];

  for (let t = 0; t < maxSteg; t++) {
    // Ankomster
    for (const j of workload.jobs) {
      if (j.ankomst === t && !arrived.has(j.id)) {
        arrived.add(j.id);
        kø.push(j.id);
      }
    }

    // Deadline-check (for jobber med deadline)
    if (os.deadlineAware) {
      // RTOS prioriterer jobben nærmest deadline (EDF)
      kø.sort((a, b) => {
        const ja = workload.jobs.find((x) => x.id === a)!;
        const jb = workload.jobs.find((x) => x.id === b)!;
        const da = ja.deadline ?? 1e9;
        const db = jb.deadline ?? 1e9;
        return da - db;
      });
    }

    // Tildel jobber til ledige CPU-er
    for (let c = 0; c < os.ant_cpu; c++) {
      if (cpuJob[c] === null && kø.length > 0) {
        cpuJob[c] = kø.shift()!;
        cpuRunning[c] = 0;
      }
    }

    // Kjør ett steg
    for (let c = 0; c < os.ant_cpu; c++) {
      const id = cpuJob[c];
      if (id !== null) {
        rem[id]--;
        cpuRunning[c]++;
        if (rem[id] <= 0) {
          ferdig.add(id);
          cpuJob[c] = null;
          cpuRunning[c] = 0;
        } else if (os.preempt && cpuRunning[c] >= os.q) {
          // Preempt → tilbake til kø
          kø.push(id);
          cpuJob[c] = null;
          cpuRunning[c] = 0;
        }
      }
    }

    // Sjekk deadline-tap for RT-jobber som ennå ikke er ferdig
    for (const j of workload.jobs) {
      if (j.deadline !== undefined && !ferdig.has(j.id) && !missed.has(j.id)) {
        if (t + 1 > j.deadline) {
          // RTOS prøver hardt; ikke-RTOS bommer ofte
          if (!os.deadlineAware) {
            missed.add(j.id);
          } else {
            // Selv RTOS kan bomme hvis lasten er for høy — men sjelden i preset.
            // La være å markere her; bom oppdages som "ikke ferdig" på slutten.
          }
        }
      }
    }

    ticks.push({
      t,
      cpu: [...cpuJob],
      kø: [...kø],
      ferdig: [...ferdig],
      missed: [...missed],
    });

    // Hvis alt er ferdig OG kø tom OG ingenting kjører, kort ned
    const ingenAktiv = cpuJob.every((c) => c === null);
    const alleFerdig = workload.jobs.every(
      (j) => ferdig.has(j.id) || missed.has(j.id),
    );
    if (ingenAktiv && kø.length === 0 && alleFerdig) {
      // legg til én ekstra "alt-ferdig" tick for klarhet
      ticks.push({
        t: t + 1,
        cpu: [...cpuJob],
        kø: [],
        ferdig: [...ferdig],
        missed: [...missed],
      });
      break;
    }
  }

  return ticks;
}

function vurder(workload: WorkloadDef, osId: OsType, ticks: Tick[]): {
  verdict: Verdict;
  tittel: string;
  forklaring: string;
} {
  const sluttTick = ticks[ticks.length - 1];
  const antMissed = sluttTick?.missed.length ?? 0;
  const maksKø = Math.max(...ticks.map((t) => t.kø.length));
  const totalTid = sluttTick?.t ?? 0;
  const ideelt = workload.ideal === osId;
  const greit = workload.ok?.includes(osId) ?? false;

  // Spesielle feil-mønstre
  if (antMissed > 0) {
    return {
      verdict: "fail",
      tittel: `${antMissed} jobber bommet deadline`,
      forklaring:
        "Workloaden hadde harde deadlines (typisk real-time-kontroll). En OS uten deadline-bevissthet behandler den som vanlig interactive jobb og kommer for sent. I virkeligheten betyr dette: flyet roterer feil vei, pacemakeren misser et slag.",
    };
  }

  if (workload.id === "editor" && osId === "batch") {
    return {
      verdict: "fail",
      tittel: "Editor på batch-OS = ubrukelig",
      forklaring:
        "Batch-OS-et venter på å fullføre én jobb før det starter neste. Tast 'h' kjøres, og brukeren må vente til hele jobben er sluttført før tast 'e' i det hele tatt registreres. Køen vokser ($k%maxKø%$). Et editor må ha preemption.".replace(
          "%maxKø%",
          String(maksKø),
        ),
    };
  }

  if (workload.id === "payroll" && osId === "interactive") {
    return {
      verdict: "warn",
      tittel: "Funker, men sløsing",
      forklaring: `Interactive OS bytter mellom oppgaver hvert eneste tidsskvant. Lønnskjøringen var EN jobb uten interaktiv komponent — context-switching gir overhead uten gevinst. Total tid ${totalTid} steg, mer enn nødvendig. Batch hadde holdt CPU-en på 100% mot samme jobb.`,
    };
  }

  if (workload.id === "googlecompute" && osId !== "distributed") {
    return {
      verdict: "warn",
      tittel: "Bare én maskin → sekvensiell beregning",
      forklaring: `Workloaden ber om 4 parallelle index-shards. Et ikke-distributed OS har bare én CPU-spor, så jobbene må kjøre etter hverandre. Total tid ${totalTid} steg vs. ~6 steg på 4 noder parallelt. Distributed OS er kritisk her.`,
    };
  }

  if (workload.id === "printserver" && osId === "batch") {
    return {
      verdict: "fail",
      tittel: "Ingen flerbruker-håndtering",
      forklaring:
        "Batch-OS-et behandler de 5 utskriftene som én jobb-strøm uten tilgangskontroll mellom brukere — Anna kan lese Bens dokumenter, ingen autentisering, ingen rettferdig kø-deling. Network OS er bygget for nettopp denne situasjonen.",
    };
  }

  if (ideelt) {
    return {
      verdict: "ok",
      tittel: "Perfekt match",
      forklaring: `Workloaden passer akkurat det OS-typen er optimert for. Total tid ${totalTid} steg, maks kø ${maksKø}. Ingen missed deadlines, ingen unødvendig overhead. Slik bør det se ut.`,
    };
  }

  if (greit) {
    return {
      verdict: "warn",
      tittel: "Funker, men ikke optimalt",
      forklaring: `Du har valgt en OS-type som ikke er feil — men ikke det beste valget. Den anbefalte typen er '${workload.ideal}'. Bytt og se forskjellen i køen, response og total tid.`,
    };
  }

  return {
    verdict: "warn",
    tittel: "Mismatch — vurder en annen type",
    forklaring: `Workloaden er klassifisert som '${workload.ideal}'. OS-typen du valgte er bygget for en annen problemstilling. Se forklaringen i tabellen for å forstå hvorfor.`,
  };
}

// ----- UI-komponenter -----

const JOB_COLORS = [
  "bg-orange-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

function colorFor(jobId: string, workload: WorkloadDef) {
  const i = workload.jobs.findIndex((j) => j.id === jobId);
  return JOB_COLORS[i % JOB_COLORS.length];
}

function jobNavn(jobId: string, workload: WorkloadDef) {
  return workload.jobs.find((j) => j.id === jobId)?.navn ?? jobId;
}

export function OsTypologiSimulator() {
  const [workloadId, setWorkloadId] = useState<Workload>("editor");
  const [osId, setOsId] = useState<OsType>("interactive");
  const [tickIdx, setTickIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(450); // ms per tick
  const timerRef = useRef<number | null>(null);

  const workload = useMemo(
    () => WORKLOADS.find((w) => w.id === workloadId)!,
    [workloadId],
  );
  const os = useMemo(() => OS_TYPES.find((o) => o.id === osId)!, [osId]);
  const ticks = useMemo(() => simulate(workload, os), [workload, os]);

  // Reset playhead når preset endres
  useEffect(() => {
    setTickIdx(0);
    setPlaying(false);
  }, [workloadId, osId]);

  // Animer
  useEffect(() => {
    if (!playing) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTickIdx((i) => {
        if (i >= ticks.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speed);
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, speed, ticks.length]);

  const currentTick = ticks[Math.min(tickIdx, ticks.length - 1)];
  const verdict = useMemo(
    () => vurder(workload, osId, ticks),
    [workload, osId, ticks],
  );

  const ferdig = currentTick?.ferdig.length ?? 0;
  const missed = currentTick?.missed.length ?? 0;
  const tot = workload.jobs.length;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          OS-typologi-simulator
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              if (tickIdx >= ticks.length - 1) setTickIdx(0);
              setPlaying((p) => !p);
            }}
            className="rounded-md border border-border bg-background px-2 py-1 hover:border-brand/40"
          >
            {playing ? "Pause" : "Spill av"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTickIdx(0);
              setPlaying(false);
            }}
            className="rounded-md border border-border bg-background px-2 py-1 hover:border-brand/40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() =>
              setTickIdx((i) => Math.min(ticks.length - 1, i + 1))
            }
            className="rounded-md border border-border bg-background px-2 py-1 hover:border-brand/40"
          >
            Steg
          </button>
          <label className="flex items-center gap-1 text-muted-foreground">
            fart
            <input
              type="range"
              min={120}
              max={900}
              step={60}
              value={1020 - speed}
              onChange={(e) => setSpeed(1020 - parseInt(e.target.value, 10))}
              className="w-20"
            />
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-0">
        {/* Venstre: velgere */}
        <div className="border-b lg:border-b-0 lg:border-r border-border p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              1. Velg arbeidslast
            </div>
            <div className="space-y-1">
              {WORKLOADS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWorkloadId(w.id)}
                  className={`w-full text-left text-xs rounded-md border px-2 py-1.5 transition-colors ${
                    workloadId === w.id
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40 text-foreground"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              2. Velg OS-type
            </div>
            <div className="space-y-1">
              {OS_TYPES.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOsId(o.id)}
                  className={`w-full text-left text-xs rounded-md border px-2 py-1.5 transition-colors ${
                    osId === o.id
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background hover:border-brand/40 text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Høyre: visualisering */}
        <div className="p-4 space-y-3">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Arbeidslast
            </div>
            <div className="text-sm font-medium">{workload.label}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {workload.beskrivelse}
            </p>
          </div>

          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              OS-type
            </div>
            <div className="text-sm font-medium">{os.label}</div>
            <p className="text-xs text-muted-foreground mt-1">{os.kort}</p>
          </div>

          {/* Visualisering: CPU-spor + kø + ferdig */}
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Steg {currentTick?.t ?? 0} / {ticks[ticks.length - 1]?.t ?? 0}
              </div>
              <div className="text-[11px] text-muted-foreground">
                ferdig {ferdig}/{tot}
                {missed > 0 && (
                  <span className="ml-2 text-rose-500 font-semibold">
                    missed {missed}
                  </span>
                )}
              </div>
            </div>

            {/* CPU-spor */}
            <div className="space-y-2 mb-3">
              {Array.from({ length: os.ant_cpu }).map((_, c) => {
                const id = currentTick?.cpu[c] ?? null;
                return (
                  <div key={c} className="flex items-center gap-2">
                    <div className="text-[10px] font-mono text-muted-foreground w-12 shrink-0">
                      CPU {c + 1}
                    </div>
                    <div className="flex-1 h-7 rounded border border-border bg-muted/30 flex items-center px-2">
                      {id ? (
                        <span
                          className={`text-[11px] font-mono text-white rounded px-2 py-0.5 ${colorFor(
                            id,
                            workload,
                          )}`}
                        >
                          {jobNavn(id, workload)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          idle
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kø */}
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Kø ({currentTick?.kø.length ?? 0})
              </div>
              <div className="min-h-[28px] rounded border border-border bg-muted/30 p-1.5 flex flex-wrap gap-1">
                {(currentTick?.kø ?? []).map((id, i) => (
                  <span
                    key={`${id}-${i}`}
                    className={`text-[10px] font-mono text-white rounded px-1.5 py-0.5 ${colorFor(
                      id,
                      workload,
                    )}`}
                  >
                    {jobNavn(id, workload)}
                  </span>
                ))}
                {(currentTick?.kø.length ?? 0) === 0 && (
                  <span className="text-[10px] text-muted-foreground italic px-1">
                    tom
                  </span>
                )}
                {(currentTick?.kø.length ?? 0) > 6 && (
                  <span className="text-[10px] text-rose-500 font-semibold ml-1">
                    ← køen vokser!
                  </span>
                )}
              </div>
            </div>

            {/* Ferdig + missed */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  Ferdig
                </div>
                <div className="min-h-[24px] rounded border border-emerald-500/30 bg-emerald-500/5 p-1 flex flex-wrap gap-1">
                  {(currentTick?.ferdig ?? []).map((id) => (
                    <span
                      key={id}
                      className={`text-[10px] font-mono text-white rounded px-1.5 py-0.5 ${colorFor(
                        id,
                        workload,
                      )}`}
                    >
                      {jobNavn(id, workload)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                  Missed deadline
                </div>
                <div className="min-h-[24px] rounded border border-rose-500/30 bg-rose-500/5 p-1 flex flex-wrap gap-1">
                  {(currentTick?.missed ?? []).map((id) => (
                    <span
                      key={id}
                      className="text-[10px] font-mono text-white rounded px-1.5 py-0.5 bg-rose-500"
                    >
                      {jobNavn(id, workload)} ✕
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Verdict — vises når simulering er ferdig (eller når brukeren har spilt frem alt) */}
          {tickIdx >= ticks.length - 1 && (
            <div
              className={`rounded-md border p-3 ${
                verdict.verdict === "ok"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : verdict.verdict === "warn"
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-rose-500/40 bg-rose-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold ${
                    verdict.verdict === "ok"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : verdict.verdict === "warn"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {verdict.verdict === "ok"
                    ? "Suksess"
                    : verdict.verdict === "warn"
                      ? "Funker, men…"
                      : "Feil OS-type"}
                </span>
                <span className="text-sm font-medium">{verdict.tittel}</span>
              </div>
              <p className="text-xs text-foreground/90">{verdict.forklaring}</p>
              {verdict.verdict !== "ok" && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  Hint: anbefalt OS-type for denne workloaden er{" "}
                  <span className="font-mono text-foreground">
                    {workload.ideal}
                  </span>
                  . Prøv å bytte og kjør på nytt.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Eksporter også data slik at sammenligning og match-spillet kan gjenbruke
export { WORKLOADS, OS_TYPES };
export type { WorkloadDef, OsDef };
