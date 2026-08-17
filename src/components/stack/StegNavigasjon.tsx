import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, LayoutList } from "lucide-react";
import { stegNav } from "@/lib/core/loype";
import { isTrinnSeen } from "@/lib/stack/moduleProgress";

/**
 * Foten på en side som hører til en modul-løype: hvor du er, hva som var før,
 * og hva som kommer nå.
 *
 * Den viktigste knappen er «neste». Fram til nå sluttet hver side i ingenting,
 * og veien videre gikk om /stack og en viss porsjon leting. En sekvens man må
 * gjette seg gjennom, er i praksis ingen sekvens.
 *
 * Sider som ikke er med i noen løype rendrer ingenting — komponenten er derfor
 * trygg å ha stående i skallet for ALLE sider, og et fag får navigasjon i det
 * øyeblikket det legger inn `steg` på modulene sine.
 */
export function StegNavigasjon() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const slug = pathname.startsWith("/stack/")
    ? pathname.slice("/stack/".length).replace(/\/$/, "")
    : null;
  const nav = slug ? stegNav(slug) : null;

  // Sett-status bor i localStorage og finnes ikke under tjener-rendringen.
  // Leses den i første rendring, spriker markupen og React forkaster treet.
  const [montert, setMontert] = useState(false);
  useEffect(() => setMontert(true), []);

  if (!nav) return null;
  const { loype, nr, antall, forrige, neste } = nav;

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-12">
      <nav className="rounded-xl border border-border bg-card/50 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/stack/$slug"
            params={{ slug: loype.href.replace("/stack/", "") }}
            className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
          >
            <LayoutList className="h-4 w-4" />
            {loype.tittel}
          </Link>
          <span className="text-muted-foreground">
            · steg {nr} av {antall}
          </span>
        </div>

        {/* Prikkene gjør lengden på løypa synlig uten å måtte telle lenker. */}
        <ol className="mb-4 flex flex-wrap gap-1.5">
          {loype.steg.map((s, i) => {
            const sett = montert && isTrinnSeen(s.slug);
            const her = i === nr - 1;
            return (
              <li key={s.slug} className="flex-1 basis-8">
                <Link
                  to="/stack/$slug"
                  params={{ slug: s.slug }}
                  title={`${i + 1}. ${s.tittel}`}
                  className={`block h-1.5 rounded-full transition-colors ${
                    her
                      ? "bg-brand"
                      : sett
                        ? "bg-success/60 hover:bg-success"
                        : "bg-border hover:bg-muted-foreground/40"
                  }`}
                />
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-3">
          {forrige ? (
            <Link
              to="/stack/$slug"
              params={{ slug: forrige.slug }}
              className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{forrige.tittel}</span>
            </Link>
          ) : (
            <span />
          )}

          {neste ? (
            <Link
              to="/stack/$slug"
              params={{ slug: neste.slug }}
              className="ml-auto inline-flex max-w-full items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              <span className="truncate">Neste: {neste.tittel}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          ) : (
            <Link
              to="/stack/$slug"
              params={{ slug: loype.href.replace("/stack/", "") }}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-success/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
              Siste steg — tilbake til modulen
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
