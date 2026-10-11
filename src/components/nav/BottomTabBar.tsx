import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { label: string; to: string; Icon: typeof BookOpen };

// To tabs, de samme to inngangene som i headeren. Profil og dashboard ligger
// bak profilknappen øverst og trenger ingen egen tab.
const TABS: Tab[] = [
  { label: "Lær", to: "/laer", Icon: BookOpen },
  { label: "Øv", to: "/ov", Icon: Target },
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
