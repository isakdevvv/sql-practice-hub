import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, X, Check } from "lucide-react";
import { SkjermCtx, type SkjermApi } from "./SkjermContext";
import { fortsettIndeks, markerFullfort, markerSett } from "@/lib/kurs/fremdrift";
import type { Undertema } from "@/lib/kurs/types";
import { cn } from "@/lib/utils";

/**
 * Spilleren for ett undertema: én skjerm om gangen, aldri lang scroll.
 *
 * Layout er låst til viewport-høyden (`100dvh` — dynamic viewport height, som
 * krymper riktig når mobil-nettleseren viser adresselinja). Toppen og bunnen
 * står stille; kun skjermflaten i midten kan scrolle, og bare når innholdet
 * faktisk er høyere enn flaten.
 *
 * Navigasjon: piltaster på tastatur, sveip på touch, og knapper nederst som
 * er store nok for tommelen (48px høyde, innenfor safe-area).
 */
export function SkjermShell({
  fagSlug,
  emneTittel,
  undertema,
  avsluttTil,
}: {
  fagSlug: string;
  emneTittel: string;
  undertema: Undertema;
  /** Hvor X-knappen og "Ferdig" lander. */
  avsluttTil: string;
}) {
  const navigate = useNavigate();
  const skjermer = undertema.skjermer;
  const antall = skjermer.length;
  const ider = useMemo(() => skjermer.map((s) => s.id), [skjermer]);

  const [indeks, setIndeks] = useState(0);
  const [besvarte, setBesvarte] = useState<Set<string>>(new Set());
  const flate = useRef<HTMLDivElement>(null);

  // Hopp til første usette skjerm ved oppstart. Kjøres kun på klienten, så
  // server-render og første klient-render er identiske (ingen hydrerings-
  // mismatch).
  useEffect(() => {
    setIndeks(fortsettIndeks(fagSlug, undertema.slug, ider));
  }, [fagSlug, undertema.slug, ider]);

  const skjerm = skjermer[indeks];

  // Registrer at skjermen er sett, og rull skjermflaten til topp ved bytte.
  useEffect(() => {
    if (!skjerm) return;
    markerSett(fagSlug, undertema.slug, skjerm.id);
    flate.current?.scrollTo({ top: 0 });
  }, [fagSlug, undertema.slug, skjerm]);

  const erBesvart = skjerm ? besvarte.has(skjerm.id) : false;
  const laast = Boolean(skjerm?.krevesSvar) && !erBesvart;
  const sisteSkjerm = indeks === antall - 1;

  const besvart = useCallback(() => {
    if (!skjerm) return;
    setBesvarte((f) => (f.has(skjerm.id) ? f : new Set(f).add(skjerm.id)));
  }, [skjerm]);

  const avslutt = useCallback(() => {
    markerFullfort(fagSlug, undertema.slug);
    void navigate({ to: avsluttTil });
  }, [avsluttTil, fagSlug, navigate, undertema.slug]);

  const neste = useCallback(() => {
    if (laast) return;
    if (sisteSkjerm) {
      avslutt();
      return;
    }
    setIndeks((i) => Math.min(antall - 1, i + 1));
  }, [antall, avslutt, laast, sisteSkjerm]);

  const forrige = useCallback(() => setIndeks((i) => Math.max(0, i - 1)), []);

  // Piltaster. Ignorerer tastetrykk som skjer i et input-felt, ellers ville
  // en student som skriver et svar hoppe skjerm midt i setningen.
  useEffect(() => {
    const iSkrivefelt = (el: EventTarget | null) => {
      const n = el as HTMLElement | null;
      if (!n) return false;
      return n.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(n.tagName);
    };
    const onKey = (e: KeyboardEvent) => {
      if (iSkrivefelt(e.target)) return;
      if (e.key === "ArrowRight") neste();
      if (e.key === "ArrowLeft") forrige();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [forrige, neste]);

  // Sveip. 60px terskel horisontalt, og kravet om at bevegelsen er mer
  // horisontal enn vertikal, så vanlig scrolling i en simulator ikke bytter
  // skjerm ved et uhell.
  const start = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) neste();
    else forrige();
  };

  const api: SkjermApi = { besvart, erBesvart, neste, forrige, indeks, antall };

  if (!skjerm) return null;
  const Innhold = skjerm.Component;

  return (
    <SkjermCtx.Provider value={api}>
      <div className="flex h-[100dvh] flex-col bg-background">
        {/* Topplinje: kontekst + framdrift. Står stille. */}
        <header className="shrink-0 border-b border-border px-3 pt-[env(safe-area-inset-top)]">
          <div className="flex h-12 items-center gap-2">
            <button
              type="button"
              onClick={() => void navigate({ to: avsluttTil })}
              aria-label="Avslutt økta"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                {emneTittel}
              </p>
              <p className="truncate text-sm font-medium leading-tight">{undertema.tittel}</p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {indeks + 1}/{antall}
            </span>
          </div>
          <Framdrift antall={antall} indeks={indeks} />
        </header>

        {/* Skjermflaten. Eneste elementet som kan scrolle. */}
        <main
          ref={flate}
          className="min-h-0 flex-1"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* key tvinger remount ved skjermbytte: en simulator starter i
              utgangstilstand i stedet for å arve forrige skjerms state. */}
          <Innhold key={skjerm.id} />
        </main>

        {/* Bunnlinje: tilbake + neste. */}
        <footer className="shrink-0 border-t border-border bg-background px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
          <div className="mx-auto flex max-w-[44rem] items-center gap-3">
            <button
              type="button"
              onClick={forrige}
              disabled={indeks === 0}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label="Forrige skjerm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={neste}
              disabled={laast}
              className={cn(
                "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-medium transition-colors",
                laast
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-brand text-brand-foreground hover:bg-brand/90",
              )}
            >
              {laast ? (
                "Svar først"
              ) : sisteSkjerm ? (
                <>
                  Ferdig <Check className="h-5 w-5" />
                </>
              ) : (
                <>
                  Neste <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </SkjermCtx.Provider>
  );
}

/** Segmentert framdriftslinje — ett segment per skjerm. Vi bruker segmenter
 *  framfor en prosentbar fordi de også viser HVOR LANGT det er igjen i antall
 *  steg, ikke bare i andel. Over ~20 skjermer faller vi tilbake til én bar,
 *  siden segmentene da blir tynnere enn en piksel på telefon. */
function Framdrift({ antall, indeks }: { antall: number; indeks: number }) {
  if (antall > 20) {
    return (
      <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${((indeks + 1) / antall) * 100}%` }}
        />
      </div>
    );
  }
  return (
    <div className="mb-2 flex w-full gap-1" aria-hidden>
      {Array.from({ length: antall }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            i <= indeks ? "bg-brand" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
