import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Layers, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { label: string; to: string; Icon: typeof BookOpen };

// Fire faste tabs. Fire er taket: med fem blir treffflaten på en 360px-skjerm
// under 44px per tab, og etikettene må forkortes til noe uleselig.
const TABS: Tab[] = [
  { label: "Fag", to: "/mine-fag", Icon: GraduationCap },
  { label: "Øv", to: "/repetisjon", Icon: Layers },
  { label: "Bibliotek", to: "/bibliotek", Icon: BookOpen },
  { label: "Du", to: "/dashboard", Icon: User },
];

/** Ruter som spiller av innhold i fullskjerm og derfor ikke skal ha tabbar:
 *  skjerm-spilleren eier hele viewporten, og en tabbar under den ville både
 *  stjele plass og friste til å hoppe ut midt i en økt. */
function erFullskjerm(pathname: string): boolean {
  // /kurs/<fag>/<undertema> — tre segmenter under /kurs.
  return /^\/kurs\/[^/]+\/[^/]+/.test(pathname);
}

/**
 * Bunn-tabbar for telefon og tablet i portrett. Skjules fra `md` og opp,
 * der header-navigasjonen tar over — to samtidige navigasjoner på samme
 * skjerm gir bare tvil om hvilken som gjelder.
 */
export function BottomTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (erFullskjerm(pathname)) return null;

  return (
    <nav
      aria-label="Hovednavigasjon"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
    >
      <ul className="flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ label, to, Icon }) => {
          const aktiv = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <li key={to} className="flex-1">
              <Link
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={to as any}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors",
                  aktiv ? "text-brand" : "text-muted-foreground",
                )}
                aria-current={aktiv ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", aktiv && "stroke-[2.5]")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Høyden tabbaren dekker, som padding på sideinnhold. Brukes av rot-layouten
 *  så ingen side må vite om tabbaren selv. */
export const TABBAR_PADDING = "pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0";
