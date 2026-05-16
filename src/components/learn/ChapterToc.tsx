import { useEffect, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocEntry {
  id: string;
  text: string;
}

interface ChapterTocProps {
  /**
   * CSS selector for the article whose H2s should be indexed.
   * Default: 'article h2[id]' — picks up the auto-id'd headings rendered
   * by the chapter `H2` building block in `pythonChapters.tsx`.
   */
  selector?: string;
  /**
   * Re-derive the heading list whenever this key changes (e.g. chapter number).
   * Without this the observer would stay attached to a previous chapter's nodes.
   */
  resetKey?: string | number;
}

/**
 * Floating table of contents that introspects the rendered DOM to find
 * H2 anchors and highlights the section currently in view. It does not
 * depend on the chapter authoring API — chapters only need to render
 * H2s with `id` attributes (the existing `H2` helper handles that).
 *
 * Desktop (>= lg): fixed sidebar on the right.
 * Mobile / tablet (< lg): collapsed sticky bar under the SiteHeader
 *   showing the current section name; tap to expand the full list.
 */
export function ChapterToc({
  selector = "article h2[id]",
  resetKey,
}: ChapterTocProps) {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Observer refs so we can detach cleanly when the chapter swaps.
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Re-scan the DOM after mount / when chapter changes.
  useEffect(() => {
    // Defer one tick so the article body has rendered.
    const raf = requestAnimationFrame(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLHeadingElement>(selector)
      );
      const list: TocEntry[] = nodes
        .filter((n) => n.id)
        .map((n) => ({ id: n.id, text: n.textContent?.trim() ?? "" }))
        .filter((e) => e.text.length > 0);
      setEntries(list);
      setActiveId(list[0]?.id ?? null);

      // Detach previous observer and rebuild for the new nodes.
      observerRef.current?.disconnect();
      if (list.length === 0) return;

      // Track which headings are currently intersecting; pick the topmost
      // visible one as "active". Falls back to the last one above the
      // viewport top, which keeps the highlight stable when no heading is
      // on-screen (e.g. scrolled deep into a long section).
      const visible = new Set<string>();
      const observer = new IntersectionObserver(
        (entriesList) => {
          for (const entry of entriesList) {
            const id = (entry.target as HTMLElement).id;
            if (entry.isIntersecting) visible.add(id);
            else visible.delete(id);
          }
          if (visible.size > 0) {
            // Pick the one closest to the top of the viewport.
            const ordered = list
              .filter((e) => visible.has(e.id))
              .map((e) => {
                const el = document.getElementById(e.id);
                const top = el?.getBoundingClientRect().top ?? Infinity;
                return { id: e.id, top };
              })
              .sort((a, b) => a.top - b.top);
            if (ordered[0]) setActiveId(ordered[0].id);
          } else {
            // Nothing intersecting — fall back to the last heading whose
            // top is above the viewport top (i.e. we've scrolled past it).
            let lastPassed: string | null = null;
            for (const e of list) {
              const el = document.getElementById(e.id);
              if (!el) continue;
              if (el.getBoundingClientRect().top < 120) lastPassed = e.id;
            }
            if (lastPassed) setActiveId(lastPassed);
          }
        },
        {
          // Top margin accounts for the sticky SiteHeader so a heading
          // counts as "active" once it crosses just below the header.
          rootMargin: "-96px 0px -60% 0px",
          threshold: [0, 1],
        }
      );

      for (const node of nodes) observer.observe(node);
      observerRef.current = observer;
    });

    return () => {
      cancelAnimationFrame(raf);
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [selector, resetKey]);

  // Close the mobile drawer when the chapter changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [resetKey]);

  if (entries.length < 2) {
    // Don't bother showing a ToC for a single-section page.
    return null;
  }

  const activeEntry =
    entries.find((e) => e.id === activeId) ?? entries[0] ?? null;

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Push the hash to the URL so it deep-links / supports browser back.
    history.replaceState(null, "", `#${id}`);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar (>= lg). Fixed to the viewport so it stays in
          view as the user scrolls the article. */}
      <aside
        aria-label="Innholdsfortegnelse"
        className="hidden lg:block fixed top-24 right-6 xl:right-10 w-56 z-30"
      >
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          På denne siden
        </div>
        <ul className="space-y-1 border-l border-border pl-3 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {entries.map((e) => {
            const active = e.id === activeId;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => handleJump(e.id)}
                  className={cn(
                    "text-left text-xs w-full leading-snug py-1 transition-colors",
                    active
                      ? "text-brand font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {e.text}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile / tablet bar (< lg). Sticks under the SiteHeader
          (which is sticky at top-0 z-40). Collapsed by default. */}
      <div className="lg:hidden sticky top-14 z-30 -mx-4 px-4 mb-4 bg-background/90 backdrop-blur-md border-b border-border">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center gap-2 py-2 text-xs text-muted-foreground"
        >
          <List className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left truncate">
            <span className="text-foreground font-medium">
              {activeEntry?.text ?? "Innhold"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform",
              mobileOpen && "rotate-180"
            )}
          />
        </button>
        {mobileOpen && (
          <ul className="pb-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
            {entries.map((e) => {
              const active = e.id === activeId;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => handleJump(e.id)}
                    className={cn(
                      "text-left text-xs w-full leading-snug py-1.5 px-2 rounded transition-colors",
                      active
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {e.text}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
