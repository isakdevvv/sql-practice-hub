import { ArrowUpRight, Dumbbell, FileQuestion, Zap } from "lucide-react";
import { relatedTestsFor, type RelatedTestKind } from "@/lib/related";

// «Test deg på dette»-blokk nederst på stack-leksjoner. Lukker løkka
// lær → test: leksjonen slutter med konkrete øvinger i stedet for bare
// forrige/neste-navigasjon. Skjules helt når mappingen er tom.

const KIND_META: Record<RelatedTestKind, { label: string; Icon: typeof Dumbbell; cls: string }> = {
  oppgaver: {
    label: "Oppgaver",
    Icon: FileQuestion,
    cls: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  drill: {
    label: "Drill",
    Icon: Dumbbell,
    cls: "border-success/40 bg-success/10 text-success",
  },
  kort: {
    label: "Kort",
    Icon: Zap,
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

export function RelatedTestLinks({ slug }: { slug: string }) {
  const links = relatedTestsFor(slug);
  if (links.length === 0) return null;

  return (
    <div className="mb-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Test deg på dette
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => {
          const meta = KIND_META[link.kind];
          return (
            <a
              key={link.href}
              href={link.href}
              className="group flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 transition-all hover:border-brand/60 hover:bg-brand/5"
            >
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${meta.cls}`}
              >
                <meta.Icon className="h-3 w-3" />
                {meta.label}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{link.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">{link.description}</div>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
