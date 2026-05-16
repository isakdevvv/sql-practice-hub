// --------------------------------------------------------------------------
// ModeChips: brand-tonet pille-rad for modus-velger.
// Aktiv modus får full brand-bakgrunn. Eksponert som standalone så
// visualisere som vil ha custom-layout kan plassere chip-raden hvor de vil.
// --------------------------------------------------------------------------

export interface ModeDef<T extends string = string> {
  id: T;
  label: string;
  /** Vises som title-tooltip. Typisk kompleksitet eller kort forklaring. */
  sub?: string;
  /** Liten tilleggstekst som vises ved siden av label (f.eks. "O(n²)"). */
  badge?: string;
}

export interface ModeChipsProps<T extends string> {
  modes: ModeDef<T>[];
  active: T;
  onChange: (mode: T) => void;
  className?: string;
}

export function ModeChips<T extends string>({
  modes,
  active,
  onChange,
  className,
}: ModeChipsProps<T>) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {modes.map((m) => {
        const isActive = m.id === active;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            title={m.sub}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isActive
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {m.label}
            {m.badge && (
              <span
                className={`ml-1 font-mono text-[10px] ${
                  isActive ? "text-brand-foreground/80" : "text-muted-foreground"
                }`}
              >
                {m.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
