/**
 * Sidepanel som vises når en skill er valgt i grafen.
 * Viser navn, blurb, prereqs, evidens-lenker, Bloom-nivå, estimat og bruker-state.
 */

import type {
  Skill,
  SkillId,
  FagOmrade,
  BloomNivaa,
} from "@/lib/skill-tree/skills";
import type { SkillEstimate } from "@/lib/skill-tree/engine";
import { getDependents } from "@/lib/skill-tree/graph";
import { OMRADE_FARGE, OMRADE_LABEL } from "./SkillGraph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Clock, Sparkles, Target, Play } from "lucide-react";

const BLOOM_LABEL: Record<BloomNivaa, string> = {
  remember: "Huske",
  understand: "Forstå",
  apply: "Anvende",
  analyze: "Analysere",
  evaluate: "Vurdere",
  create: "Skape",
};

const MASTERY_LABEL = {
  ukjent: "Ukjent",
  lærer: "Lærer",
  kan: "Kan",
  mester: "Mester",
} as const;

interface PrimaryTarget {
  href: string;
  label: string;
}

function getPrimaryTarget(skill: Skill): PrimaryTarget | null {
  const ev = skill.evidens;
  const stack = ev.stackSlugs?.[0];
  if (stack) return { href: `/stack/${encodeURIComponent(stack)}`, label: "Start modul" };
  const drag = ev.dragExerciseIds?.[0];
  if (drag) return { href: `/drag?id=${encodeURIComponent(drag)}`, label: "Start drag-oppgave" };
  const py = ev.pyExerciseIds?.[0];
  if (py) return { href: `/python_/ide/${encodeURIComponent(py)}`, label: "Start Python-oppgave" };
  const sql = ev.sqlProblemIds?.[0];
  if (sql) return { href: `/practice?id=${encodeURIComponent(sql)}`, label: "Start SQL-oppgave" };
  const card = ev.flashcardIds?.[0];
  if (card) return { href: `/cards?id=${encodeURIComponent(card)}`, label: "Start flashcards" };
  return null;
}

export interface SkillSidePanelProps {
  skill: Skill;
  estimate: SkillEstimate | undefined;
  allSkills: Skill[];
  onPickSkill: (id: SkillId) => void;
  onClose: () => void;
}

export function SkillSidePanel(props: SkillSidePanelProps) {
  const { skill, estimate, allSkills, onPickSkill, onClose } = props;
  const prereqs = skill.prereqs
    .map((id) => allSkills.find((s) => s.id === id))
    .filter((s): s is Skill => Boolean(s));
  const dependents = getDependents(skill.id, allSkills)
    .map((id) => allSkills.find((s) => s.id === id))
    .filter((s): s is Skill => Boolean(s));

  const omradeColor = OMRADE_FARGE[skill.omrade as FagOmrade];

  return (
    <aside className="h-full w-full overflow-y-auto border-l bg-card p-4 text-card-foreground">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: omradeColor }}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground">
              {OMRADE_LABEL[skill.omrade as FagOmrade]}
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-tight">{skill.navn}</h2>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Lukk panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{skill.blurb}</p>

      {(() => {
        const target = getPrimaryTarget(skill);
        if (!target) return null;
        return (
          <a
            href={target.href}
            className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Play className="h-4 w-4" />
            {target.label}
          </a>
        );
      })()}

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1">
          <Target className="h-3 w-3" /> Bloom: {BLOOM_LABEL[skill.bloom]}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" /> {skill.estimertTid}
        </Badge>
      </div>

      <section className="mb-4 rounded-md border p-3">
        <h3 className="mb-2 text-sm font-medium">Din status</h3>
        {estimate ? (
          <dl className="grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Mastery</dt>
            <dd>{MASTERY_LABEL[estimate.mastery]}</dd>
            <dt className="text-muted-foreground">Rating</dt>
            <dd>{estimate.rating.toFixed(2)}</dd>
            <dt className="text-muted-foreground">Sikkerhet</dt>
            <dd>{(estimate.confidence * 100).toFixed(0)} %</dd>
            <dt className="text-muted-foreground">Forsøk</dt>
            <dd>{estimate.n}</dd>
            <dt className="text-muted-foreground">Sist trent</dt>
            <dd>
              {estimate.sistTrent
                ? new Date(estimate.sistTrent).toLocaleDateString("no-NO")
                : "Aldri"}
            </dd>
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Ingen data ennå.</p>
        )}
      </section>

      {prereqs.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Forutsetninger</h3>
          <ul className="flex flex-wrap gap-1.5">
            {prereqs.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-accent"
                  onClick={() => onPickSkill(p.id)}
                >
                  {p.navn}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dependents.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Låser opp</h3>
          <ul className="flex flex-wrap gap-1.5">
            {dependents.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-accent"
                  onClick={() => onPickSkill(d.id)}
                >
                  {d.navn}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-4">
        <h3 className="mb-2 text-sm font-medium">
          <Sparkles className="mr-1 inline h-4 w-4" /> Treningsoppgaver
        </h3>
        <EvidensLenker skill={skill} />
      </section>
    </aside>
  );
}

function EvidensLenker({ skill }: { skill: Skill }) {
  const sections: Array<{ label: string; ids: string[]; hrefFor: (id: string) => string }> = [
    {
      label: "SQL-oppgaver",
      ids: skill.evidens.sqlProblemIds ?? [],
      hrefFor: (id) => `/practice?id=${encodeURIComponent(id)}`,
    },
    {
      label: "Python-oppgaver",
      ids: skill.evidens.pyExerciseIds ?? [],
      hrefFor: (id) => `/python_/ide/${encodeURIComponent(id)}`,
    },
    {
      label: "Drag-oppgaver",
      ids: skill.evidens.dragExerciseIds ?? [],
      hrefFor: (id) => `/drag?id=${encodeURIComponent(id)}`,
    },
    {
      label: "Flashcards",
      ids: skill.evidens.flashcardIds ?? [],
      hrefFor: (id) => `/cards?id=${encodeURIComponent(id)}`,
    },
    {
      label: "Stack-artikler",
      ids: skill.evidens.stackSlugs ?? [],
      hrefFor: (slug) => `/stack/${encodeURIComponent(slug)}`,
    },
  ].filter((s) => s.ids.length > 0);

  if (sections.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Ingen koblet evidens ennå. Mer kommer når data-agenten er ferdig.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {sections.map((sec) => (
        <div key={sec.label}>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {sec.label}
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {sec.ids.map((id) => (
              <li key={id}>
                <a
                  href={sec.hrefFor(id)}
                  className="rounded-md border bg-background px-2 py-0.5 text-xs hover:bg-accent"
                >
                  {id}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
