/**
 * Mine spor — progress per fag-område for home.
 *
 * Viser én rad per spor med navn, progress-bar, x/y mestret, og lenke videre
 * til skill-tre filtrert på det området. Hvis brukeren har lagret et eget
 * kurs (subset av fag-områder), vises bare de valgte. Ellers vises alle 11.
 */

import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { computeOmradeProgress, type OmradeProgress } from "@/lib/skill-tree/courseProgress";
import { useMineKurs } from "@/lib/skill-tree/mineKursStorage";
import { OMRADE_FARGE, OMRADE_LABEL } from "@/components/skill-tree/SkillGraph";
import type { FagOmrade } from "@/lib/skill-tree/skills";
import { ArrowRight, ListPlus } from "lucide-react";

export function MineSporPanel() {
  const { selected } = useMineKurs();
  const rows = useMemo(() => {
    const all = [...computeOmradeProgress().values()];
    const filtered =
      selected && selected.length > 0
        ? all.filter((r) => selected.includes(r.omrade))
        : all;
    return filtered.sort((a, b) => b.percent - a.percent);
  }, [selected]);

  return (
    <section className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold leading-tight">Mine spor</h2>
          <p className="text-xs text-muted-foreground">
            {selected && selected.length > 0
              ? `Ditt eget kurs · ${rows.length} spor`
              : `Alle 11 spor · trykk "Lag ditt eget kurs" for å snevre inn`}
          </p>
        </div>
        <Link
          to="/lag-kurs"
          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
        >
          <ListPlus className="h-3.5 w-3.5" />
          Lag ditt eget kurs
        </Link>
      </div>

      <ul className="space-y-1.5">
        {rows.map((r) => (
          <SporRad key={r.omrade} row={r} />
        ))}
      </ul>
    </section>
  );
}

function SporRad({ row }: { row: OmradeProgress }) {
  const farge = OMRADE_FARGE[row.omrade as FagOmrade];
  const label = OMRADE_LABEL[row.omrade as FagOmrade];
  return (
    <li>
      <Link
        to="/skill-tre"
        search={{ omrade: row.omrade }}
        className="group flex items-center gap-3 rounded-md border bg-background px-3 py-2 hover:bg-accent"
      >
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: farge }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate font-medium">{label}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {row.mestret}/{row.total} · {row.percent} %
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${row.percent}%`, backgroundColor: farge }}
            />
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
