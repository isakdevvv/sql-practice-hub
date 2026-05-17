/**
 * /skill-tre — full-screen visualisering av brukerens ferdighets-tre.
 *
 * Mål:
 *  - "Hva er jeg god på?" — svar innen 5 sek (store/glødende noder = mester).
 *  - "Hva er neste å lære?" — gule ring-noder = neste ulåst.
 *
 * På mobil (under sm) viser vi en flat, gruppert liste istedenfor cytoscape-grafen.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SKILLS, type FagOmrade, type SkillId } from "@/lib/skill-tree/skills";
import { estimateAllSkills, getNextUnlocked } from "@/lib/skill-tree/engine";
import { computeOmradeProgress } from "@/lib/skill-tree/courseProgress";
import { SkillGraph } from "@/components/skill-tree/SkillGraph";
import { SkillSidePanel } from "@/components/skill-tree/SkillSidePanel";
import { SkillLegend } from "@/components/skill-tree/SkillLegend";
import { SkillFilterBar } from "@/components/skill-tree/SkillFilterBar";
import { SkillListMobile } from "@/components/skill-tree/SkillListMobile";

interface SkillTreSearch {
  omrade?: FagOmrade;
}

export const Route = createFileRoute("/skill-tre")({
  validateSearch: (search: Record<string, unknown>): SkillTreSearch => ({
    omrade:
      typeof search.omrade === "string"
        ? (search.omrade as FagOmrade)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Skill-tre — SQL Sandbox" },
      {
        name: "description",
        content:
          "Interaktiv graf over hva du kan, hva du holder på å lære, og hva som er neste å mestre.",
      },
    ],
  }),
  component: SkillTrePage,
});

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return isMobile;
}

function SkillTrePage() {
  const isMobile = useIsMobile();
  const search = Route.useSearch();

  const [filterOmrade, setFilterOmrade] = useState<FagOmrade | null>(
    search.omrade ?? null,
  );
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [onlyRusty, setOnlyRusty] = useState(false);
  const [selectedId, setSelectedId] = useState<SkillId | null>(null);

  // Hold filteret synkront når brukeren navigerer hit fra et "Mine spor"-kort
  useEffect(() => {
    if (search.omrade) setFilterOmrade(search.omrade);
  }, [search.omrade]);

  const estimates = useMemo(() => estimateAllSkills(SKILLS), []);
  const nextUnlocked = useMemo(
    () => new Set(getNextUnlocked(SKILLS, estimates)),
    [estimates],
  );
  const progressByOmrade = useMemo(() => computeOmradeProgress(), []);

  // Hvilke fag-områder finnes faktisk i datasettet — slik at filterbar/legend
  // bare viser relevante chips
  const omrader = useMemo<FagOmrade[]>(() => {
    const set = new Set<FagOmrade>();
    for (const s of SKILLS) set.add(s.omrade as FagOmrade);
    return [...set];
  }, []);

  const visibleSkills = useMemo(() => {
    let out = SKILLS;
    if (filterOmrade) out = out.filter((s) => s.omrade === filterOmrade);
    if (onlyUnlocked) {
      const include = new Set<SkillId>(nextUnlocked);
      for (const id of nextUnlocked) {
        const s = SKILLS.find((x) => x.id === id);
        if (s) for (const p of s.prereqs) include.add(p);
      }
      out = out.filter((s) => include.has(s.id));
    }
    if (onlyRusty) {
      out = out.filter((s) => {
        const est = estimates.get(s.id);
        if (!est || est.sistTrent == null) return false;
        if (est.mastery !== "kan" && est.mastery !== "mester") return false;
        const days = (Date.now() - est.sistTrent) / 86_400_000;
        return days > 14;
      });
    }
    return out;
  }, [filterOmrade, onlyUnlocked, onlyRusty, nextUnlocked, estimates]);

  const selectedSkill = selectedId
    ? SKILLS.find((s) => s.id === selectedId) ?? null
    : null;

  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <SkillFilterBar
        omrader={omrader}
        filterOmrade={filterOmrade}
        setFilterOmrade={setFilterOmrade}
        onlyUnlocked={onlyUnlocked}
        setOnlyUnlocked={setOnlyUnlocked}
        onlyRusty={onlyRusty}
        setOnlyRusty={setOnlyRusty}
        totalSynlige={visibleSkills.length}
        progressByOmrade={progressByOmrade}
      />

      <div className="flex min-h-0 flex-1">
        <main className="relative min-h-0 flex-1 overflow-hidden">
          {isMobile ? (
            <div className="h-full overflow-y-auto">
              <SkillListMobile
                skills={visibleSkills}
                estimates={estimates}
                nextUnlocked={nextUnlocked}
                onSelect={(id) => setSelectedId(id)}
              />
            </div>
          ) : (
            <SkillGraph
              skills={SKILLS}
              estimates={estimates}
              nextUnlocked={nextUnlocked}
              filterOmrade={filterOmrade}
              onlyUnlocked={onlyUnlocked}
              onlyRusty={onlyRusty}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
        </main>

        {selectedSkill && !isMobile && (
          <div className="w-[300px] shrink-0">
            <SkillSidePanel
              skill={selectedSkill}
              estimate={estimates.get(selectedSkill.id)}
              allSkills={SKILLS}
              onPickSkill={(id) => setSelectedId(id)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>

      <SkillLegend omrader={omrader} />

      {selectedSkill && isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto border-t bg-card shadow-xl">
          <SkillSidePanel
            skill={selectedSkill}
            estimate={estimates.get(selectedSkill.id)}
            allSkills={SKILLS}
            onPickSkill={(id) => setSelectedId(id)}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
}
