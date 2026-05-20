import * as React from "react";

/**
 * Visuelle definisjons-kort: hver term får et gjenkjennelig ikon + navn,
 * og definisjons-teksten gjemmes bak en toggle ("Vis definisjon").
 *
 * Bygges som erstatning for `Defs` (ren tekst-liste) i Kurose-kapitlene.
 * Termer som ofte møtes som visuelle symboler i UI (WiFi-vifte, ruter,
 * antenne, fiber osv.) skal se ut som man kjenner igjen.
 */
export type VisualDefItem = {
  term: string;
  icon: React.ReactNode;
  body: React.ReactNode;
};

export function VisualDefs({
  items,
  title = "Definisjoner",
}: {
  items: VisualDefItem[];
  title?: string;
}) {
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>({});
  const allOpen = items.every((_, i) => openMap[i]);

  const toggle = (i: number) =>
    setOpenMap((prev) => ({ ...prev, [i]: !prev[i] }));

  const toggleAll = () => {
    if (allOpen) {
      setOpenMap({});
    } else {
      const next: Record<number, boolean> = {};
      items.forEach((_, i) => (next[i] = true));
      setOpenMap(next);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <button
          type="button"
          onClick={toggleAll}
          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {allOpen ? "Skjul alle" : "Vis alle"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {items.map((it, i) => {
          const open = !!openMap[i];
          return (
            <div
              key={it.term}
              className="rounded-lg border border-border/60 bg-background/40 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={open}
                className="w-full flex flex-col items-center gap-1.5 px-2 py-3 hover:bg-muted/40 transition-colors text-center"
              >
                <span
                  className={
                    "flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary " +
                    (open ? "ring-2 ring-primary/40" : "")
                  }
                >
                  <span className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full">
                    {it.icon}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                  {it.term}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {open ? "Skjul" : "Vis def."}
                </span>
              </button>

              {open && (
                <div className="border-t border-border/60 px-2.5 py-2 text-[11.5px] text-muted-foreground leading-snug">
                  {it.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
