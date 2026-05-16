// --------------------------------------------------------------------------
// NodeBox: generisk verdi-boks for linked-list / queue / heap / etc.
// - phase: "new" → fade-in. "leaving" → fade-out (parent fjerner etter delay).
// - highlight: tekst over boksen (head / tail / top / front / back / ...).
// Stil og dimensjoner matcher LinkedStructuresVisualizer for konsistens.
// --------------------------------------------------------------------------

export type NodePhase = "new" | "leaving" | undefined;

export interface NodeBoxProps {
  value: string | number;
  highlight?: string | null;
  phase?: NodePhase;
  /** Overstyr standard 14x14 (size i Tailwind w/h enheter). */
  size?: "sm" | "md";
  /** Hvis du vil ha annerledes farge enn brand for highlight. */
  highlightTone?: "brand" | "success" | "destructive";
}

export function NodeBox({
  value,
  highlight,
  phase,
  size = "md",
  highlightTone = "brand",
}: NodeBoxProps) {
  const dims = size === "sm" ? "w-10 h-10 text-xs" : "w-14 h-14 text-sm";

  const tones: Record<string, string> = {
    brand:
      "border-brand text-brand shadow-[0_0_0_3px_var(--brand-tint,rgba(99,102,241,0.15))]",
    success:
      "border-success text-success shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
    destructive:
      "border-destructive text-destructive shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
  };

  const labelTones: Record<string, string> = {
    brand: "text-brand",
    success: "text-success",
    destructive: "text-destructive",
  };

  return (
    <div
      className={`relative shrink-0 transition-all duration-300 ease-out ${
        phase === "new"
          ? "animate-in fade-in slide-in-from-top-2 duration-300"
          : phase === "leaving"
          ? "opacity-0 translate-y-2 scale-90"
          : "opacity-100"
      }`}
    >
      <div
        className={`${dims} rounded-lg border-2 flex items-center justify-center font-mono font-semibold bg-card ${
          highlight
            ? tones[highlightTone]
            : "border-border text-foreground"
        }`}
      >
        {value}
      </div>
      {highlight && (
        <div
          className={`absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-semibold ${labelTones[highlightTone]}`}
        >
          {highlight}
        </div>
      )}
    </div>
  );
}
