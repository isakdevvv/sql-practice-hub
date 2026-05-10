import { useEffect, useMemo, useState } from "react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { DrillExercise } from "./DrillExercise";
import { EXERCISES } from "./exercises";
import { Progress } from "@/components/ui/progress";

const STORAGE_KEY = "stack:python-drill:progress:v1";

type Status = "pending" | "pass" | "fail";

function loadStored(): Record<string, Status> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Status>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStored(state: Record<string, Status>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function PythonDrillPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  useEffect(() => {
    setStatuses(loadStored());
  }, []);

  const passedCount = useMemo(
    () => EXERCISES.filter((e) => statuses[e.id] === "pass").length,
    [statuses],
  );
  const total = EXERCISES.length;
  const pct = total === 0 ? 0 : Math.round((passedCount / total) * 100);

  function setStatus(id: string, status: Status) {
    setStatuses((prev) => {
      const next = { ...prev, [id]: status };
      saveStored(next);
      return next;
    });
  }

  return (
    <StackPageShell title="Python eksamens-drill" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-4">
            Eksamensforberedelse · Trinn 6
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Python eksamens-drill
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Oppgaver av samme type som dukker opp på eksamen — alle knyttet til database/web-mønstre:
            filtrere og gruppere records, joine lister på fremmednøkkel, parse query strings og logger,
            indeksere etter ID, paginere, validere request-payloads. Skriv koden, trykk «Kjør &amp; sjekk»,
            så sammenlignes utdata med fasit. Hint og full løsning er tilgjengelig for hver oppgave hvis
            du står fast.
          </p>
          <div className="mt-6 rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Fremgang</span>
              <span className="font-mono">
                {passedCount} / {total} bestått
              </span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Første kjøring laster ned Python-runtime via Pyodide (~10 MB) — det tar noen sekunder.
            Etter det er kjøringene raske.
          </p>
        </header>

        <div className="space-y-3">
          {EXERCISES.map((ex) => (
            <DrillExercise
              key={ex.id}
              exercise={ex}
              status={statuses[ex.id] ?? "pending"}
              onStatusChange={(s) => setStatus(ex.id, s)}
            />
          ))}
        </div>

        <div className="mt-12 rounded-md border border-border bg-card p-5 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Tips for eksamen:</strong> kjenn igjen mønstret i
          oppgaven først. Skal du <em>filtrere</em>, <em>transformere</em>,
          <em> aggregere</em>, eller <em>parse</em>? De fleste eksamensoppgaver er
          variasjoner over disse fire. Velg riktig datastruktur (liste eller dict) for resultatet
          før du begynner å skrive løkken.
        </div>
      </div>
    </StackPageShell>
  );
}
