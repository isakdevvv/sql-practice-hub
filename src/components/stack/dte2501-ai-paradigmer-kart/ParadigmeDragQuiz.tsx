import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import type { ParadigmeId } from "./ParadigmeGraph";
import { PARADIGMER } from "./ParadigmeGraph";

type DragItem = {
  id: string;
  tekst: string;
  fasit: ParadigmeId;
  forklaring: string;
};

const ITEMS: DragItem[] = [
  {
    id: "d1",
    tekst: "Finne korteste vei i en uvektet graf",
    fasit: "search-fundamentals",
    forklaring: "BFS — utforsker laget for laget. Uvektet betyr ingen heuristikk trengs.",
  },
  {
    id: "d2",
    tekst: "Beregne GPS-rute i Tromsø med trafikkdata",
    fasit: "advanced-search",
    forklaring: "A* med luftlinje som heuristikk + faktiske kjøretider som kost.",
  },
  {
    id: "d3",
    tekst: "Velge neste trekk i en tic-tac-toe-AI",
    fasit: "adversarial",
    forklaring: "Minimax på spilltreet — alpha-beta pruning gir gratis speedup.",
  },
  {
    id: "d4",
    tekst: "Tune 12 hyperparametre i en ML-modell uten gradient",
    fasit: "evolutionary",
    forklaring: "Genetic algorithm — populasjon av kandidat-konfigurasjoner, kryss og muter.",
  },
  {
    id: "d5",
    tekst: "Optimere ruta for pakkebud med 30 stopp",
    fasit: "swarm-ants",
    forklaring: "Ant Colony Optimization — feromon-spor på korte stier vinner frem.",
  },
  {
    id: "d6",
    tekst: "Finne globalt minimum av en kontinuerlig 5D-funksjon",
    fasit: "swarm-particles",
    forklaring: "Particle Swarm — partikler trekker mot personlig og global beste posisjon.",
  },
  {
    id: "d7",
    tekst: "Predikere boligpriser fra 8 features (areal, alder, beliggenhet…)",
    fasit: "ml",
    forklaring: "Klassisk supervised ML — lineær eller polynom regresjon, evt. random forest.",
  },
  {
    id: "d8",
    tekst: "Kjenne igjen håndskrevne sifre fra 28×28 piksel-bilder",
    fasit: "neural-nets",
    forklaring: "Konvolusjonelt nevralt nett (CNN) — feature-læring fra rå piksler.",
  },
  {
    id: "d9",
    tekst: "Lære en spill-AI å mestre Atari Breakout fra skjermbildet",
    fasit: "reinforcement",
    forklaring: "Deep Q-Network — RL kombinert med CNN for å lære policy fra piksler.",
  },
  {
    id: "d10",
    tekst: "Gruppere kunder i 4 segmenter basert på kjøpsmønster",
    fasit: "ml",
    forklaring: "Unsupervised ML — k-Means clustering eller GMM, fortsatt klassisk ML.",
  },
];

type Plassering = Record<string, ParadigmeId | null>;

export function ParadigmeDragQuiz() {
  const [plassering, setPlassering] = useState<Plassering>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.id, null])),
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [vurder, setVurder] = useState(false);

  const allePlassert = useMemo(
    () => ITEMS.every((i) => plassering[i.id] !== null),
    [plassering],
  );

  const antallRiktig = useMemo(
    () =>
      ITEMS.filter((i) => plassering[i.id] === i.fasit).length,
    [plassering],
  );

  const handleDrop = (e: React.DragEvent, familie: ParadigmeId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (!id) return;
    setPlassering((prev) => ({ ...prev, [id]: familie }));
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleReturn = (itemId: string) => {
    setPlassering((prev) => ({ ...prev, [itemId]: null }));
    setVurder(false);
  };

  const reset = () => {
    setPlassering(Object.fromEntries(ITEMS.map((i) => [i.id, null])));
    setVurder(false);
  };

  // Items som ennå ikke er plassert
  const ubrukte = ITEMS.filter((i) => plassering[i.id] === null);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-medium">Drag-quiz — match problem til familie</div>
        <div className="flex items-center gap-2">
          {vurder && (
            <span className="text-xs font-semibold">
              {antallRiktig} / {ITEMS.length} riktig
            </span>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted/40"
          >
            <RotateCcw className="h-3 w-3" /> Nullstill
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pool av problemer som skal dras */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Problemer å plassere ({ubrukte.length} igjen)
          </div>
          <div className="flex flex-wrap gap-2 min-h-[3.5rem] p-2 rounded-lg border border-dashed border-border bg-muted/10">
            {ubrukte.length === 0 ? (
              <div className="text-xs text-muted-foreground italic self-center mx-auto">
                Alle problemer plassert. Klikk "Sjekk svar" nedenfor.
              </div>
            ) : (
              ubrukte.map((i) => (
                <div
                  key={i.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", i.id);
                    setDraggedId(i.id);
                  }}
                  onDragEnd={() => setDraggedId(null)}
                  className="cursor-grab active:cursor-grabbing text-xs px-3 py-1.5 rounded-md border border-border bg-card hover:border-brand/40"
                >
                  {i.tekst}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drop-zoner per familie */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Familier (drop-zoner)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {PARADIGMER.map((par) => {
              const plassert = ITEMS.filter(
                (i) => plassering[i.id] === par.id,
              );
              return (
                <div
                  key={par.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, par.id)}
                  className="rounded-lg border border-border bg-muted/20 p-2 min-h-[5rem]"
                >
                  <div className="text-xs font-semibold mb-1.5 text-brand">
                    {par.kortNavn}
                  </div>
                  <div className="space-y-1">
                    {plassert.length === 0 && (
                      <div className="text-[10px] text-muted-foreground italic">
                        Slipp her
                      </div>
                    )}
                    {plassert.map((i) => {
                      const riktig = i.fasit === par.id;
                      const visStatus = vurder;
                      return (
                        <div
                          key={i.id}
                          className={`text-[11px] px-2 py-1 rounded border ${
                            visStatus
                              ? riktig
                                ? "bg-green-500/15 border-green-500/40 text-foreground"
                                : "bg-red-500/15 border-red-500/40 text-foreground"
                              : "bg-card border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="flex-1">{i.tekst}</span>
                            {visStatus ? (
                              riktig ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                              )
                            ) : (
                              <button
                                onClick={() => handleReturn(i.id)}
                                className="text-[10px] text-muted-foreground hover:text-foreground"
                                title="Ta tilbake"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          {visStatus && !riktig && (
                            <div className="text-[10px] text-muted-foreground mt-1">
                              Riktig: {PARADIGMER.find((p) => p.id === i.fasit)?.kortNavn}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setVurder(true)}
            disabled={!allePlassert}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand text-brand-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            Sjekk svar
          </button>
          {vurder && (
            <div
              className={`inline-flex items-center gap-2 text-sm font-medium ${
                antallRiktig === ITEMS.length ? "text-green-500" : "text-foreground"
              }`}
            >
              {antallRiktig === ITEMS.length ? (
                <>
                  <Trophy className="h-4 w-4" /> Perfekt! Du har grepet på AI-paradigmene.
                </>
              ) : (
                <>
                  {antallRiktig} av {ITEMS.length} riktig — les forklaringene nedenfor.
                </>
              )}
            </div>
          )}
        </div>

        {vurder && antallRiktig < ITEMS.length && (
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Forklaringer for feil
            </div>
            <ul className="space-y-1.5 text-xs">
              {ITEMS.filter((i) => plassering[i.id] !== i.fasit).map((i) => (
                <li key={i.id} className="flex items-start gap-2">
                  <XCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>{i.tekst}</strong> → {PARADIGMER.find((p) => p.id === i.fasit)?.kortNavn}.{" "}
                    <span className="text-muted-foreground">{i.forklaring}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
