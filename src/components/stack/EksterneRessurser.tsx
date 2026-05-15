import { type FC } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Youtube, GraduationCap, ExternalLink } from "lucide-react";

interface Resource {
  type: "bok" | "youtube" | "mooc";
  /** Tittel som vises. */
  tittel: string;
  /** Forfatter eller foreleser. */
  forfatter?: string;
  /** Internt /stack/<slug>#<anchor> ELLER ekstern URL. */
  href: string;
  /** Kort 'hvorfor relevant' for denne stack-sida. */
  why: string;
}

interface Props {
  resources: Resource[];
  /** Optional overskrift, default "Lære mer". */
  title?: string;
}

const ICONS = {
  bok: BookOpen,
  youtube: Youtube,
  mooc: GraduationCap,
};

const TYPE_LABELS = {
  bok: "Bok",
  youtube: "Video",
  mooc: "Kurs",
};

const TYPE_COLORS = {
  bok: "text-brand",
  youtube: "text-destructive",
  mooc: "text-success",
};

/**
 * Gjenbrukbar boks for å lenke en stack-side til relevante eksterne
 * ressurser fra bok-, YouTube- og MOOC-bibliotekene.
 *
 * Bruk:
 * ```tsx
 * <EksterneRessurser resources={[
 *   { type: "bok", tittel: "OSTEP", forfatter: "Arpaci-Dusseau",
 *     href: "/stack/programmeringsboker#ostep",
 *     why: "Kapittel 13-15 dekker virtuelt minne grundig" },
 *   ...
 * ]} />
 * ```
 */
export const EksterneRessurser: FC<Props> = ({ resources, title = "Lære mer" }) => {
  if (resources.length === 0) return null;

  return (
    <section className="my-8 rounded-xl border border-brand/30 bg-brand/5 p-5">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        {title}
      </div>
      <div className="space-y-2">
        {resources.map((r, i) => {
          const Icon = ICONS[r.type];
          const isExternal = r.href.startsWith("http");
          const Tag = isExternal ? "a" : Link;
          const props = isExternal
            ? { href: r.href, target: "_blank", rel: "noreferrer" }
            : { to: r.href };
          return (
            <Tag
              key={i}
              {...(props as any)}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${TYPE_COLORS[r.type]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {TYPE_LABELS[r.type]}
                  </span>
                  <span className="text-sm font-medium">{r.tittel}</span>
                  {r.forfatter && (
                    <span className="text-xs text-muted-foreground">— {r.forfatter}</span>
                  )}
                  {isExternal && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.why}</p>
              </div>
            </Tag>
          );
        })}
      </div>
    </section>
  );
};
