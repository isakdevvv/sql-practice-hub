import { useMemo, useState } from "react";
import type { OsType } from "./OsTypologiSimulator";

// 6 use-cases som dekker hele O'Gorman kap. 1.6 typologien
type UseCase = {
  id: string;
  tekst: string;
  riktig: OsType;
  forklaring: string;
};

const USE_CASES: UseCase[] = [
  {
    id: "u1",
    tekst: "Banken kjører nattlig rente-oppdatering på 2 millioner kontoer.",
    riktig: "batch",
    forklaring:
      "Én tung jobb, ingen interaktivitet, kjøres på faste tider. Klassisk batch-workload.",
  },
  {
    id: "u2",
    tekst: "Du redigerer kode i VS Code med flere terminaler åpne.",
    riktig: "interactive",
    forklaring:
      "Mange korte oppgaver må respondere innen ~100 ms. Timesharing/interactive OS er bygget for nettopp dette.",
  },
  {
    id: "u3",
    tekst:
      "Pacemaker som må sende elektrisk puls innen 1 ms etter sensor-signal.",
    riktig: "realtime",
    forklaring:
      "Hard deadline. Bom på deadline = pasienten dør. Krever et RTOS med garantert respons.",
  },
  {
    id: "u4",
    tekst:
      "Kontornettverk med felles filserver, autentisering og delt printer.",
    riktig: "network",
    forklaring:
      "Hver maskin har egen OS-instans, men deler ressurser over LAN med autentisering. Network OS (NetWare, Windows Server).",
  },
  {
    id: "u5",
    tekst:
      "Hadoop-cluster som beregner ord-frekvens i 10 PB tekst fordelt på 1000 maskiner.",
    riktig: "distributed",
    forklaring:
      "Jobben må splittes på tvers av noder og resultater samles. Krever distributed OS / cluster scheduler (YARN, Kubernetes).",
  },
  {
    id: "u6",
    tekst: "ABS-system i bil — må reagere på hjulhastighet hvert 5. ms.",
    riktig: "realtime",
    forklaring:
      "Hard real-time. Hvis OS-et bommer en deadline, kan bilen miste veigrep. RTOS med prioritetsbasert scheduling.",
  },
];

const OS_OPTIONS: { id: OsType; label: string }[] = [
  { id: "batch", label: "Batch" },
  { id: "interactive", label: "Interactive" },
  { id: "network", label: "Network" },
  { id: "realtime", label: "Real-time" },
  { id: "distributed", label: "Distributed" },
];

export function UseCaseMatch() {
  // Vi bruker click-to-assign i stedet for ren HTML5-DnD — det er mer
  // robust på mobil og touch og krever ingen ekstra avhengighet. Mønsteret
  // er identisk: velg en use-case, klikk en OS-bøtte = "drop".
  const [assignments, setAssignments] = useState<Record<string, OsType | null>>(
    () => Object.fromEntries(USE_CASES.map((u) => [u.id, null])),
  );
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [vis, setVis] = useState(false);

  function tildel(useCaseId: string, os: OsType) {
    setAssignments((a) => ({ ...a, [useCaseId]: os }));
    setAktiv(null);
  }

  function reset() {
    setAssignments(Object.fromEntries(USE_CASES.map((u) => [u.id, null])));
    setAktiv(null);
    setVis(false);
  }

  const ferdig = useMemo(
    () => USE_CASES.every((u) => assignments[u.id] !== null),
    [assignments],
  );
  const antRiktig = USE_CASES.filter(
    (u) => assignments[u.id] === u.riktig,
  ).length;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Match use-case → OS-type
        </div>
        <div className="flex items-center gap-2">
          {vis && (
            <span className="text-xs font-mono">
              {antRiktig} / {USE_CASES.length} riktig
            </span>
          )}
          <button
            type="button"
            onClick={() => setVis((v) => !v)}
            disabled={!ferdig && !vis}
            className="text-xs rounded-md border border-border bg-background px-2 py-1 hover:border-brand/40 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {vis ? "Skjul fasit" : "Sjekk svar"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs rounded-md border border-border bg-background px-2 py-1 hover:border-brand/40"
          >
            Nullstill
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Klikk en use-case for å aktivere den, klikk så en OS-bøtte under for å
          plassere. Du kan endre svaret når som helst.
        </p>

        {/* Use-cases */}
        <div className="grid sm:grid-cols-2 gap-2">
          {USE_CASES.map((u) => {
            const valgt = assignments[u.id];
            const erRiktig = vis && valgt === u.riktig;
            const erFeil = vis && valgt !== null && valgt !== u.riktig;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setAktiv(aktiv === u.id ? null : u.id)}
                className={`text-left rounded-md border p-2.5 transition-colors ${
                  aktiv === u.id
                    ? "border-brand bg-brand/10"
                    : erRiktig
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : erFeil
                        ? "border-rose-500/50 bg-rose-500/10"
                        : "border-border bg-background hover:border-brand/40"
                }`}
              >
                <div className="text-xs mb-1">{u.tekst}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {valgt ? (
                    <span className="font-mono">
                      → {OS_OPTIONS.find((o) => o.id === valgt)?.label}
                    </span>
                  ) : (
                    "(ingen valgt)"
                  )}
                  {vis && valgt !== u.riktig && (
                    <span className="ml-2 text-rose-500">
                      riktig: {OS_OPTIONS.find((o) => o.id === u.riktig)?.label}
                    </span>
                  )}
                </div>
                {vis && (
                  <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    {u.forklaring}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* OS-bøtter */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            Plasser i bøtte
          </div>
          <div className="flex flex-wrap gap-2">
            {OS_OPTIONS.map((o) => {
              const ant = Object.values(assignments).filter(
                (a) => a === o.id,
              ).length;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => aktiv && tildel(aktiv, o.id)}
                  disabled={!aktiv}
                  className={`rounded-md border-2 border-dashed px-3 py-2 text-xs transition-colors ${
                    aktiv
                      ? "border-brand/60 bg-brand/5 hover:bg-brand/15 text-foreground"
                      : "border-border text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <div className="font-semibold">{o.label}</div>
                  <div className="text-[10px] mt-0.5">{ant} tildelt</div>
                </button>
              );
            })}
          </div>
        </div>

        {vis && (
          <div
            className={`rounded-md border p-3 text-xs ${
              antRiktig === USE_CASES.length
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-amber-500/40 bg-amber-500/10 text-foreground"
            }`}
          >
            {antRiktig === USE_CASES.length ? (
              <>
                <span className="font-semibold">Alle riktig.</span> Du har
                kontroll på O'Gormans typologi — batch / interactive / network
                / real-time / distributed.
              </>
            ) : (
              <>
                <span className="font-semibold">
                  {antRiktig} av {USE_CASES.length} riktig.
                </span>{" "}
                Les forklaringen under hver use-case og prøv på nytt. Felle:
                "real-time" handler om <em>deadlines</em>, ikke om "raskt".
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
