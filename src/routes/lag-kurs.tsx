/**
 * /lag-kurs — bygg ditt eget kurs ved å velge fag-områder du vil fokusere på.
 * Lagrer valget i localStorage så home og skill-tre kan filtrere på det.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { OMRADE_FARGE, OMRADE_LABEL } from "@/components/skill-tree/SkillGraph";
import { computeOmradeProgress } from "@/lib/skill-tree/courseProgress";
import { loadMineKurs, saveMineKurs } from "@/lib/skill-tree/mineKursStorage";
import type { FagOmrade } from "@/lib/skill-tree/skills";
import { Check } from "lucide-react";

export const Route = createFileRoute("/lag-kurs")({
  head: () => ({
    meta: [
      { title: "Lag ditt eget kurs — SQL Sandbox" },
      {
        name: "description",
        content:
          "Velg fag-områdene du vil fokusere på. Du trenger ikke ta alle — sett din egen plan og se progresjonen.",
      },
    ],
  }),
  component: LagKursPage,
});

function LagKursPage() {
  const navigate = useNavigate();
  const progress = useMemo(() => computeOmradeProgress(), []);
  const allOmrader = useMemo(() => [...progress.keys()], [progress]);

  const [selected, setSelected] = useState<Set<FagOmrade>>(() => {
    const stored = loadMineKurs();
    return new Set(stored ?? allOmrader);
  });

  const toggle = (o: FagOmrade) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(o)) next.delete(o);
      else next.add(o);
      return next;
    });
  };

  const save = (resetToAll: boolean) => {
    if (resetToAll) {
      saveMineKurs(null);
    } else {
      saveMineKurs([...selected]);
    }
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Lag ditt eget kurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Velg fag-områdene du vil fokusere på. Du kan ombestemme deg når som
            helst — valgene lagres lokalt på maskinen din.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelected(new Set(allOmrader))}
            className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Velg alle
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Fjern alle
          </button>
          <span className="ml-auto self-center text-xs text-muted-foreground">
            {selected.size} av {allOmrader.length} valgt
          </span>
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {allOmrader.map((o) => {
            const row = progress.get(o)!;
            const isOn = selected.has(o);
            return (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => toggle(o)}
                  aria-pressed={isOn}
                  className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors ${
                    isOn
                      ? "border-primary bg-primary/5"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isOn
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background"
                    }`}
                    aria-hidden
                  >
                    {isOn && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: OMRADE_FARGE[o] }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{OMRADE_LABEL[o]}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.total} skills · {row.percent} % mestret
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => save(false)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Lagre kurs
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Tilbakestill (vis alle)
          </button>
          <Link
            to="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Avbryt
          </Link>
        </div>
      </main>
    </div>
  );
}
