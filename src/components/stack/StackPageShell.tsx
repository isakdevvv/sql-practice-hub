import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { PrereqBanner } from "@/components/stack/PrereqBanner";
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
    </div>
  );
}
