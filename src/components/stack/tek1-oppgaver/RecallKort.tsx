import { useMemo, useState, type ReactNode } from "react";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Oppgavetype 5 — RECALL-KORT (PLAN-HOST26-MODULER.md §3, rad 5).
//
// Kommer SIST, og bevisst med lite innhold. Per brukerens pedagogikk-preferanse
// («visuelle simulasjoner > flashcards») er kort ikke måten man lærer statistikk
// på — de er sluttsjekken på det lille som faktisk må ligge i hodet på en
// 3-timers skriftlig eksamen: formler man ikke rekker å utlede, og
// når-brukes-hva-avgjørelser.
//
// Alt som kan resonneres fram på eksamen skal IKKE ligge her. Derfor er hvert
// kort merket med en kategori, så det er tydelig hvorfor det er med.
//
// Kortene bor lokalt i modulen, ikke i den globale flashcards.ts. Den fila er
// en append-only liste med reell merge-konflikt-risiko mellom parallelle
// agent-sesjoner (se CLAUDE.md), og kortene her er tett koblet til modulteksten.
// ---------------------------------------------------------------------------

export type RecallKategori = "formel" | "når-brukes-hva" | "definisjon" | "felle";

export type RecallKort = {
  id: string;
  kategori: RecallKategori;
  sporsmal: ReactNode;
  svar: ReactNode;
  /** Én linje om hvorfor dette må sitte utenat i stedet for å utledes. */
  hvorforUtenat?: string;
};

const KATEGORI_STIL: Record<RecallKategori, { label: string; cls: string }> = {
  formel: {
    label: "Formel",
    cls: "border-brand/30 bg-brand/10 text-brand",
  },
  "når-brukes-hva": {
    label: "Når brukes hva",
    cls: "border-success/30 bg-success/10 text-success",
  },
  definisjon: {
    label: "Definisjon",
    cls: "border-border bg-muted text-muted-foreground",
  },
  felle: {
    label: "Eksamensfelle",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

export function RecallKortSeksjon({
  id,
  tittel = "Recall-kort — det som må sitte i hodet",
  intro,
  kort,
}: {
  id?: string;
  tittel?: string;
  intro?: ReactNode;
  kort: RecallKort[];
}) {
  const [rekkefolge, setRekkefolge] = useState<number[]>(() =>
    kort.map((_, i) => i),
  );
  const [pos, setPos] = useState(0);
  const [vis, setVis] = useState(false);

  const aktiv = useMemo(() => kort[rekkefolge[pos]], [kort, rekkefolge, pos]);

  function neste() {
    setVis(false);
    setPos((p) => (p + 1) % kort.length);
  }
  function forrige() {
    setVis(false);
    setPos((p) => (p - 1 + kort.length) % kort.length);
  }
  function stokk() {
    const nye = [...rekkefolge];
    for (let i = nye.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nye[i], nye[j]] = [nye[j], nye[i]];
    }
    setRekkefolge(nye);
    setPos(0);
    setVis(false);
  }
  function nullstill() {
    setRekkefolge(kort.map((_, i) => i));
    setPos(0);
    setVis(false);
  }

  if (!aktiv) return null;
  const stil = KATEGORI_STIL[aktiv.kategori];

  return (
    <section id={id} className="mb-12 scroll-mt-28">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Brain className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">{tittel}</h2>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sluttsjekk
        </span>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {intro ?? (
          <>
            Bevisst kort liste. Statistikk læres av å manipulere fordelingene, ikke av
            å pugge kort — så her ligger bare det du <em>ikke</em> rekker å utlede på en
            3-timers eksamen: formler og når-brukes-hva-valg. Alt annet står i
            seksjonene over.
          </>
        )}
      </p>

      <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              stil.cls,
            )}
          >
            {stil.label}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {pos + 1} / {kort.length}
          </span>
        </div>

        <div className="flex min-h-[170px] flex-col rounded-lg border border-border bg-muted/30 p-4">
          <div className="text-sm font-medium leading-relaxed text-foreground">
            {aktiv.sporsmal}
          </div>
          <div className="mt-auto">
            {vis ? (
              <div className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-foreground">
                {aktiv.svar}
                {aktiv.hvorforUtenat && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <strong>Hvorfor utenat:</strong> {aktiv.hvorforUtenat}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setVis(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Eye className="h-3.5 w-3.5" /> Vis svar
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={forrige}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" /> Forrige
          </button>
          <div className="flex items-center gap-2">
            {vis && (
              <button
                onClick={() => setVis(false)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <EyeOff className="h-3 w-3" /> Skjul
              </button>
            )}
            <button
              onClick={stokk}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              title="Stokk kortene"
            >
              <Shuffle className="h-3 w-3" /> Stokk
            </button>
            <button
              onClick={nullstill}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Nullstill
            </button>
          </div>
          <button
            onClick={neste}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Neste <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
