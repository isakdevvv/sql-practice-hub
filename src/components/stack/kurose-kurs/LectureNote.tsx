import * as React from "react";
import { GraduationCap, ChevronDown, ChevronRight } from "lucide-react";

/**
 * «Fra forelesningen» — foreleserens muntlige forklaring av et tema, skrevet
 * ut som egen blokk ved siden av lærebok-teksten.
 *
 * Poenget er at den muntlige forklaringen ofte har en annen inngang enn boka:
 * en analogi, et regne-eksempel, eller en grunn til at ting er som de er.
 * Blokka er kollapsbar slik at den ikke drukner hovedteksten.
 */
export function LectureNote({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-amber-500/10"
        aria-expanded={open}
      >
        <GraduationCap className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Fra forelesningen
        </span>
        <span className="text-sm font-medium text-foreground">— {title}</span>
        {open ? (
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-amber-500/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

/** Liten under-overskrift inne i en LectureNote. */
export function LectureBeat({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
      {children}
    </div>
  );
}
