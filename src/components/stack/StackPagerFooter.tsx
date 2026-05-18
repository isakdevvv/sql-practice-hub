import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { CURRICULUM_ORDER } from "@/lib/stack/curriculum";
import { getTrinnBySlug } from "@/lib/stack/content";

// Footer-pager helt nederst på hver /stack/$slug-side. Bruker den
// kanoniske rekkefølgen i CURRICULUM_ORDER for å finne forrige/neste
// kurs. Hopper over slugs som ikke har en registrert TrinnContent
// (curriculum kan ramse opp slugs som ikke er bygget ennå).
function neighborSlugs(slug: string): { prev: string | null; next: string | null } {
  const idx = CURRICULUM_ORDER.indexOf(slug);
  if (idx === -1) return { prev: null, next: null };

  let prev: string | null = null;
  for (let i = idx - 1; i >= 0; i--) {
    if (getTrinnBySlug(CURRICULUM_ORDER[i])) {
      prev = CURRICULUM_ORDER[i];
      break;
    }
  }
  let next: string | null = null;
  for (let i = idx + 1; i < CURRICULUM_ORDER.length; i++) {
    if (getTrinnBySlug(CURRICULUM_ORDER[i])) {
      next = CURRICULUM_ORDER[i];
      break;
    }
  }
  return { prev, next };
}

export function StackPagerFooter({ slug }: { slug: string }) {
  const { prev, next } = neighborSlugs(slug);
  const prevTrinn = prev ? getTrinnBySlug(prev) : null;
  const nextTrinn = next ? getTrinnBySlug(next) : null;

  if (!prevTrinn && !nextTrinn) return null;

  return (
    <footer className="border-t border-border bg-card/30 mt-12">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {prevTrinn ? (
            <a
              href={`/stack/${prevTrinn.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/60 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-brand transition-colors" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Forrige
                </div>
                <div className="truncate text-sm font-semibold">
                  {prevTrinn.title}
                </div>
              </div>
            </a>
          ) : (
            <div aria-hidden className="hidden sm:block" />
          )}

          {nextTrinn ? (
            <a
              href={`/stack/${nextTrinn.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/5 p-4 transition-all hover:border-brand hover:bg-brand/10 hover:shadow-md sm:flex-row-reverse sm:text-right"
            >
              <ArrowRight className="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-brand/80">
                  Neste
                </div>
                <div className="truncate text-sm font-semibold">
                  {nextTrinn.title}
                </div>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/5 p-4 sm:flex-row-reverse sm:text-right">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-success/80">
                  Ferdig
                </div>
                <div className="text-sm font-semibold">
                  Du har nådd slutten av løypa.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <a href="/laer" className="hover:text-foreground">
            ← Tilbake til biblioteket
          </a>
          <a href="/stack" className="hover:text-foreground">
            Se hele rekkefølgen →
          </a>
        </div>
      </div>
    </footer>
  );
}
