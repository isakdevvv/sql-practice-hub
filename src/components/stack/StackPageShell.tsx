import { Link, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PrereqBanner } from "@/components/stack/PrereqBanner";
import { KonseptSjekker } from "@/components/stack/KonseptSjekk";
import { CHECKS_BY_LESSON } from "@/lib/core/checks";
import type { TrinnGroup } from "@/lib/stack/types";

export function StackPageShell({
  title,
  group,
  children,
}: {
  title: string;
  group: TrinnGroup;
  children: React.ReactNode;
}) {
  const groupLabel = group === "eksamen" ? "Eksamensforberedelse" : "Hele stacken";
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/stack" className="hover:text-foreground">
            Stack
          </Link>
          <span>/</span>
          <span>{groupLabel}</span>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </div>
      </div>
      <PrereqBanner />
      <main>{children}</main>
      <LessonChecks />
    </div>
  );
}

/**
 * Konsept-sjekkene for leksjonen man står på, hentet fra registeret på slug.
 * Ligger her framfor i hver enkelt side, slik at det å ta i bruk sjekker for
 * en ny leksjon bare krever en oppføring i `core/checks.ts`.
 */
function LessonChecks() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const slug = pathname.startsWith("/stack/")
    ? pathname.slice("/stack/".length).replace(/\/$/, "")
    : null;
  const sjekker = slug ? (CHECKS_BY_LESSON[slug] ?? []) : [];
  if (sjekker.length === 0) return null;
  return (
    <div className="container mx-auto px-4 pb-4 max-w-3xl">
      <KonseptSjekker lessonSlug={slug!} sjekker={sjekker} />
    </div>
  );
}
