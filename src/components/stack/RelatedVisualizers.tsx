import { ArrowUpRight, Sparkles } from "lucide-react";
import {
  buildPageHref,
  getRelatedVisualizers,
  type VisualizerEntry,
} from "@/lib/visualizers/registry";

type Props = {
  /** Slug fra `src/lib/visualizers/registry.ts` for visualizeren denne blokken star under. */
  slug: string;
  /** Overstyrer overskriften — default er "Se ogsa fra et annet vinkel". */
  title?: string;
};

/**
 * Liten kort-blokk som vises under et visualizer-snitt og linker til 2-4
 * relaterte visualiseringer i andre kurs. Henter data fra `registry.ts`.
 */
export function RelatedVisualizers({ slug, title }: Props) {
  const related = getRelatedVisualizers(slug);
  if (related.length === 0) return null;

  return (
    <aside className="mt-10 rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1 text-brand">
        <Sparkles className="size-4" aria-hidden />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          {title ?? "Se ogsa fra et annet vinkel"}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Samme idé, andre abstraksjonsnivaaer — folg trad gjennom stakken.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.slice(0, 4).map((v) => (
          <li key={v.slug}>
            <RelatedLink entry={v} />
          </li>
        ))}
      </ul>
    </aside>
  );
}

function RelatedLink({ entry }: { entry: VisualizerEntry }) {
  return (
    <a
      href={buildPageHref(entry)}
      className="group flex items-start gap-3 rounded-xl border border-border bg-background hover:bg-accent/40 hover:border-brand/60 transition-colors p-3"
    >
      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 mt-0.5">
        {entry.domain}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-tight">
          {entry.title}
        </span>
        <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">
          {entry.description}
        </span>
      </span>
      <ArrowUpRight
        className="size-4 text-muted-foreground group-hover:text-brand shrink-0 mt-0.5"
        aria-hidden
      />
    </a>
  );
}
