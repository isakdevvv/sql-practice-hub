/**
 * Legendlinje nederst på /skill-tre. Forklarer farger per fag-område og
 * mastery-nivåene (tom → glød).
 */
import type { FagOmrade } from "@/lib/skill-tree/skills";
import { OMRADE_FARGE, OMRADE_LABEL } from "./SkillGraph";

export function SkillLegend({
  omrader,
}: {
  omrader: FagOmrade[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t bg-muted/30 px-4 py-2 text-xs">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {omrader.map((o) => (
          <span key={o} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: OMRADE_FARGE[o] }}
              aria-hidden
            />
            {OMRADE_LABEL[o]}
          </span>
        ))}
      </div>
      <span className="mx-2 hidden h-4 w-px bg-border md:inline-block" />
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground">Mastery:</span>
        <MasteryDot opacity={0.15} label="Ukjent" />
        <MasteryDot opacity={0.55} label="Lærer" />
        <MasteryDot opacity={0.95} label="Kan" />
        <MasteryDot opacity={1} label="Mester" glow />
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full ring-2 ring-yellow-400"
            style={{ backgroundColor: "#e5e7eb" }}
            aria-hidden
          />
          Neste å lære
        </span>
      </div>
    </div>
  );
}

function MasteryDot({
  opacity,
  label,
  glow,
}: {
  opacity: number;
  label: string;
  glow?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{
          backgroundColor: "#3b82f6",
          opacity,
          boxShadow: glow ? "0 0 6px 1px #3b82f6" : undefined,
        }}
        aria-hidden
      />
      {label}
    </span>
  );
}
