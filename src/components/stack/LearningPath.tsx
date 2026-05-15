import { Link } from "@tanstack/react-router";
import { ArrowRight, Sprout, GitBranch, Trophy } from "lucide-react";

/**
 * En læringssti er en pedagogisk progresjon: BASIS → DYPERE → EKSAMEN.
 * Brukes på hub-sidene for å vise hvordan mini-kursene henger sammen
 * og hvilken rekkefølge studenten bør ta dem i.
 *
 * Hvert lag introduserer konseptet på et nytt nivå:
 *  - basis: første møte, intuisjon, hvorfor det betyr noe
 *  - dypere: matematikk/algoritme/implementasjon
 *  - eksamen: anvendelse, eksamens-typer-oppgaver, koblinger til andre temaer
 */

export type LearningStep = {
  slug: string;
  title: string;
  /** En setning som forklarer hva studenten lærer her, i kontekst av nivået. */
  blurb: string;
};

export type LearningLayer = {
  navn: string;
  /** Kort tekst som forklarer hvorfor dette nivået kommer her. */
  intro: string;
  steps: LearningStep[];
};

export interface LearningPathProps {
  /** Navn på faget — vises i overskriften. */
  fag: string;
  /** Hva studenten kobler dette faget til (andre fag, ferdigheter). */
  forbinder?: string[];
  layers: [LearningLayer, LearningLayer, LearningLayer];
}

const LAYER_ICONS = [Sprout, GitBranch, Trophy];
const LAYER_ACCENTS = [
  "border-emerald-500/30 bg-emerald-500/5",
  "border-sky-500/30 bg-sky-500/5",
  "border-amber-500/30 bg-amber-500/5",
];
const LAYER_TEXT = [
  "text-emerald-500",
  "text-sky-500",
  "text-amber-500",
];

export function LearningPath({ fag, forbinder, layers }: LearningPathProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-5 md:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
            Læringssti
          </span>
          <h3 className="text-lg font-semibold text-foreground">Slik bygger {fag} seg opp</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hvert konsept introduseres først på basisnivå, så dykker du dypere, og til slutt
          bruker du det i eksamenslignende oppgaver. Ta mini-kursene i rekkefølge for å la
          forståelsen bygge seg opp lag for lag.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {layers.map((layer, i) => {
          const Icon = LAYER_ICONS[i];
          return (
            <div key={layer.navn} className="relative">
              {i > 0 && (
                <ArrowRight className="hidden md:block absolute -left-3 top-6 h-4 w-4 text-muted-foreground" />
              )}
              <div className={`rounded-xl border ${LAYER_ACCENTS[i]} p-4 h-full`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${LAYER_TEXT[i]}`} />
                  <h4 className="font-semibold text-foreground text-sm">{layer.navn}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{layer.intro}</p>
                <ul className="space-y-1.5">
                  {layer.steps.map((s, idx) => (
                    <li key={s.slug}>
                      <Link
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="group flex items-start gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 hover:border-brand/40 transition-colors"
                      >
                        <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold ${LAYER_TEXT[i]} bg-current/10 border border-current/30`}>
                          {idx + 1}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-medium text-foreground group-hover:text-brand transition-colors leading-tight">
                            {s.title}
                          </span>
                          <span className="block text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {s.blurb}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {forbinder && forbinder.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Kobles til:</span>
          {forbinder.map((f) => (
            <span
              key={f}
              className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/80"
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
