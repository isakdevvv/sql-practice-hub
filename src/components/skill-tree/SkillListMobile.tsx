/**
 * Mobil-fallback: flat liste over skills (gruppert per fag-område).
 * Cytoscape suger på små skjermer, så under sm-bredde viser vi denne.
 */
import type {
  Skill,
  SkillId,
  FagOmrade,
} from "@/lib/skill-tree/skills";
import type { SkillEstimate } from "@/lib/skill-tree/engine";
import { OMRADE_FARGE, OMRADE_LABEL } from "./SkillGraph";

const MASTERY_BG: Record<string, string> = {
  ukjent: "bg-muted",
  lærer: "bg-blue-50 dark:bg-blue-950/40",
  kan: "bg-emerald-50 dark:bg-emerald-950/40",
  mester: "bg-amber-50 dark:bg-amber-950/40",
};

const MASTERY_LABEL: Record<string, string> = {
  ukjent: "Ukjent",
  lærer: "Lærer",
  kan: "Kan",
  mester: "Mester",
};

export interface SkillListMobileProps {
  skills: Skill[];
  estimates: Map<SkillId, SkillEstimate>;
  nextUnlocked: Set<SkillId>;
  onSelect: (id: SkillId) => void;
}

export function SkillListMobile(props: SkillListMobileProps) {
  const byOmrade = new Map<FagOmrade, Skill[]>();
  for (const s of props.skills) {
    const arr = byOmrade.get(s.omrade as FagOmrade) ?? [];
    arr.push(s);
    byOmrade.set(s.omrade as FagOmrade, arr);
  }

  return (
    <div className="space-y-4 p-4">
      {[...byOmrade.entries()].map(([omrade, skills]) => (
        <section key={omrade}>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: OMRADE_FARGE[omrade] }}
              aria-hidden
            />
            {OMRADE_LABEL[omrade]}
          </h2>
          <ul className="space-y-1.5">
            {skills.map((s) => {
              const est = props.estimates.get(s.id);
              const mastery = est?.mastery ?? "ukjent";
              const isNext = props.nextUnlocked.has(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => props.onSelect(s.id)}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${MASTERY_BG[mastery] ?? ""} ${
                      isNext ? "ring-2 ring-yellow-400" : ""
                    }`}
                  >
                    <span className="flex-1 truncate font-medium">{s.navn}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {MASTERY_LABEL[mastery]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
