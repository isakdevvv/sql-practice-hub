import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle, PlayCircle, ListChecks } from "lucide-react";
import { useModulProgress, type ModulStatus } from "@/lib/stack/moduleProgress";

/**
 * Felles topp-CTA-blokk for fag-hub-sider.
 *
 * To tydelige veier inn til faget:
 *   1. "Start hele kurset" → går til første trinn i første modul (props.startSlug)
 *   2. "Hopp inn i en del"  → scroller til moduler-seksjonen (anker #moduler)
 *
 * Vises rett under tittel/intro og før moduler-listen.
 */
export function HubStartCta({
  startSlug,
  startLabel = "Start hele kurset",
  startSubtitle,
  jumpHref = "#moduler",
  jumpLabel = "Hopp inn i en del",
  jumpSubtitle = "Velg en modul som passer deg",
}: {
  startSlug: string;
  startLabel?: string;
  startSubtitle?: string;
  jumpHref?: string;
  jumpLabel?: string;
  jumpSubtitle?: string;
}) {
  return (
    <div className="mb-10 grid sm:grid-cols-2 gap-3">
      <Link
        to="/stack/$slug"
        params={{ slug: startSlug }}
        className="group rounded-xl border border-brand/40 bg-gradient-to-br from-brand/10 to-success/5 p-5 transition-colors hover:border-brand"
      >
        <div className="flex items-center gap-2 mb-1">
          <PlayCircle className="h-5 w-5 text-brand" />
          <h3 className="font-semibold text-foreground leading-tight">{startLabel}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-snug">
          {startSubtitle ?? "Begynn på modul 1 og jobb deg gjennom hele faget i rekkefølge."}
        </p>
        <div className="mt-3 flex items-center text-xs font-medium text-brand">
          Start nå
          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
      <a
        href={jumpHref}
        className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
      >
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="h-5 w-5 text-brand" />
          <h3 className="font-semibold text-foreground leading-tight">{jumpLabel}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-snug">{jumpSubtitle}</p>
        <div className="mt-3 flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
          Se moduler
          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>
    </div>
  );
}

/**
 * Lite badge som viser modulens status: ikke startet / pågående / fullført.
 * Plasseres på modul-kortet i moduler-listen.
 */
export function ModulStatusBadge({ trinnSlugs }: { trinnSlugs: string[] }) {
  const { seen, total, status } = useModulProgress(trinnSlugs);
  if (total === 0) return null;
  const label = badgeLabel(status);
  const cls = badgeClasses(status);
  const Icon = badgeIcon(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}
      title={`${seen} / ${total} leksjoner sett`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

/**
 * Tekstlig "X / Y leksjoner sett"-counter med tynn fremdriftsbar.
 */
export function ModulProgressBar({ trinnSlugs }: { trinnSlugs: string[] }) {
  const { seen, total } = useModulProgress(trinnSlugs);
  if (total === 0) return null;
  const pct = Math.min(100, Math.round((seen / total) * 100));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
        <span>
          {seen} / {total} leksjoner sett
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand to-success transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function badgeLabel(status: ModulStatus): string {
  switch (status) {
    case "done":
      return "Fullført";
    case "in-progress":
      return "Pågående";
    default:
      return "Ikke startet";
  }
}

function badgeClasses(status: ModulStatus): string {
  switch (status) {
    case "done":
      return "bg-success/15 text-success border border-success/30";
    case "in-progress":
      return "bg-brand/10 text-brand border border-brand/30";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

function badgeIcon(status: ModulStatus) {
  switch (status) {
    case "done":
      return CheckCircle2;
    case "in-progress":
      return PlayCircle;
    default:
      return Circle;
  }
}
