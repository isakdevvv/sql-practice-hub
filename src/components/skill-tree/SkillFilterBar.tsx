/**
 * Filterbar — øverst på /skill-tre. Lar bruker velge fag-område,
 * "kun neste ulåst" eller "kun rusty" (= modent for repetisjon).
 */
import type { FagOmrade } from "@/lib/skill-tree/skills";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OMRADE_FARGE, OMRADE_LABEL } from "./SkillGraph";
import type { OmradeProgress } from "@/lib/skill-tree/courseProgress";

export interface SkillFilterBarProps {
  omrader: FagOmrade[];
  filterOmrade: FagOmrade | null;
  setFilterOmrade: (v: FagOmrade | null) => void;
  onlyUnlocked: boolean;
  setOnlyUnlocked: (v: boolean) => void;
  onlyRusty: boolean;
  setOnlyRusty: (v: boolean) => void;
  totalSynlige: number;
  progressByOmrade?: Map<FagOmrade, OmradeProgress>;
}

export function SkillFilterBar(props: SkillFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2">
      <span className="text-xs font-medium text-muted-foreground">Fag-område:</span>
      <Button
        size="sm"
        variant={props.filterOmrade === null ? "default" : "outline"}
        onClick={() => props.setFilterOmrade(null)}
      >
        Alle
      </Button>
      {props.omrader.map((o) => {
        const pct = props.progressByOmrade?.get(o)?.percent;
        return (
          <Button
            key={o}
            size="sm"
            variant={props.filterOmrade === o ? "default" : "outline"}
            onClick={() => props.setFilterOmrade(o)}
            className="gap-1.5"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: OMRADE_FARGE[o] }}
              aria-hidden
            />
            {OMRADE_LABEL[o]}
            {pct !== undefined && (
              <span className="ml-0.5 rounded-sm bg-foreground/10 px-1 text-[10px] font-medium tabular-nums">
                {pct} %
              </span>
            )}
          </Button>
        );
      })}
      <span className="mx-2 h-5 w-px bg-border" />
      <Button
        size="sm"
        variant={props.onlyUnlocked ? "default" : "outline"}
        onClick={() => {
          props.setOnlyUnlocked(!props.onlyUnlocked);
          if (!props.onlyUnlocked) props.setOnlyRusty(false);
        }}
      >
        Kun neste ulåst
      </Button>
      <Button
        size="sm"
        variant={props.onlyRusty ? "default" : "outline"}
        onClick={() => {
          props.setOnlyRusty(!props.onlyRusty);
          if (!props.onlyRusty) props.setOnlyUnlocked(false);
        }}
      >
        Kun rusty
      </Button>
      <span className="ml-auto">
        <Badge variant="secondary">{props.totalSynlige} skills</Badge>
      </span>
    </div>
  );
}
