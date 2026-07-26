import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Blocks, Check } from "lucide-react";
import { prereqStatus } from "@/lib/core/path";
import type { Block } from "@/lib/core/path";

// «Bygger på»-banner øverst på en leksjon. Scaffolding-prinsippet gjort
// synlig: har leksjonen prerequisites studenten ikke har sett, foreslår vi
// å ta dem først — uten å låse noe. Har den prereqs som alle er sett,
// vises en diskré bekreftelse. Ingen prereqs = ingenting rendres.
//
// Sett-status ligger i localStorage, så vi leser først etter mount for å
// unngå SSR-hydration-avvik.

export function PrereqBanner({ slug: slugProp }: { slug?: string }) {
  // Uten eksplisitt slug (StackPageShell kjenner den ikke) avledes den fra
  // URL-en — alle leksjoner ligger på /stack/$slug.
  const pathname = useLocation({ select: (l) => l.pathname });
  const slug =
    slugProp ??
    (pathname.startsWith("/stack/") ? pathname.slice("/stack/".length).replace(/\/$/, "") : null);

  const [prereqs, setPrereqs] = useState<Block[] | null>(null);
  useEffect(() => {
    setPrereqs(slug ? prereqStatus(slug) : []);
  }, [slug]);

  if (!prereqs || prereqs.length === 0) return null;

  const unseen = prereqs.filter((p) => !p.seen);
  if (unseen.length === 0) {
    return (
      <div className="border-b border-border bg-success/5">
        <div className="container mx-auto flex items-center gap-2 px-4 py-1.5 max-w-4xl text-[11px] text-success">
          <Check className="h-3 w-3 shrink-0" />
          Grunnlaget er på plass: {prereqs.map((p) => p.title).join(" · ")}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-warning/30 bg-warning/10">
      <div className="container mx-auto flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 max-w-4xl text-xs">
        <Blocks className="h-3.5 w-3.5 shrink-0 text-warning" />
        <span className="font-semibold text-foreground">Denne klossen bygger på:</span>
        {unseen.map((p) => (
          <a
            key={p.slug}
            href={`/stack/${p.slug}`}
            className="rounded-full border border-warning/40 bg-background/60 px-2 py-0.5 font-medium text-foreground hover:border-warning transition-colors"
          >
            {p.title} →
          </a>
        ))}
        <span className="text-muted-foreground">— ta dem først hvis noe kjennes bratt.</span>
      </div>
    </div>
  );
}
