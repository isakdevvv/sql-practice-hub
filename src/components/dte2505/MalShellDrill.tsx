import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Eye,
  Lightbulb,
  RotateCcw,
  Target,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MAL_OPPGAVER,
  MAL_TEMAER,
  beskrivStart,
  prøv,
  type Forsok,
  type MalOppgave,
} from "@/lib/dte2505/mockShellOppgaver";
import { terminallinjer } from "@/lib/dte2505/mockShellKommandoer";

// ---------------------------------------------------------------------------
// Måloppgave-drill — den tilstandsbaserte etterfølgeren til shell-drillet.
//
// Forskjellen fra ShellDrill: der sjekkes svaret mot et regex, altså mot
// kommandostrengen. Her kjøres kommandoen din mot et ekte mock-filsystem, og
// vi sammenligner tilstanden etterpå med måltilstanden. Det gir tre svar i
// stedet for to — riktig, nesten (med nøyaktig hva som skiller) og feil — og
// gjør at alle veier til målet godtas.
//
// All logikken bor i src/lib/dte2505/mockShell*.ts og kan kjøres uten React:
//   bun run src/lib/dte2505/mockShellSelvsjekk.ts
// ---------------------------------------------------------------------------

type Modus = "laer" | "prov";

export function MalShellDrill() {
  const [modus, setModus] = useState<Modus>("laer");
  const [tema, setTema] = useState<MalOppgave["tema"] | "alle">("alle");
  const [indeks, setIndeks] = useState(0);
  const [svar, setSvar] = useState("");
  const [forsok, setForsok] = useState<Forsok | null>(null);
  const [visFasit, setVisFasit] = useState(false);
  const [visHint, setVisHint] = useState(false);

  const utvalg = useMemo(
    () => (tema === "alle" ? MAL_OPPGAVER : MAL_OPPGAVER.filter((o) => o.tema === tema)),
    [tema],
  );
  const oppgave = utvalg[indeks % Math.max(utvalg.length, 1)];
  const startlisting = useMemo(() => (oppgave ? beskrivStart(oppgave) : []), [oppgave]);

  function nullstill() {
    setSvar("");
    setForsok(null);
    setVisFasit(false);
    setVisHint(false);
  }

  function gaTil(steg: number) {
    if (utvalg.length === 0) return;
    setIndeks((i) => (i + steg + utvalg.length) % utvalg.length);
    nullstill();
  }

  function sjekk() {
    if (!oppgave) return;
    setForsok(prøv(oppgave, svar));
  }

  if (!oppgave) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Ingen oppgaver i denne kategorien.
      </div>
    );
  }

  const utfall = forsok?.resultat.utfall;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-6 w-6 text-brand" />
          Måloppgaver med tilstandssjekk
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Her får du oppgitt en <span className="text-foreground">tilstand du skal oppnå</span>, ikke
          en kommando du skal huske. Kommandoen din kjøres mot et mock-filsystem med ekte eiere,
          grupper og rettighetsbits, og vi sammenligner resultatet med målet. Derfor godtas alle
          veier dit — <code className="font-mono">chmod 750 logg</code> og{" "}
          <code className="font-mono">chmod u=rwx,g=rx,o= logg</code> er like riktige — og derfor kan
          tilbakemeldingen si nøyaktig hva som skilte når du er nesten framme.
        </p>
      </div>

      {/* Modus: lær først, prøv etterpå. */}
      <div
        role="tablist"
        aria-label="Modus"
        className="mb-5 inline-flex rounded-lg border border-border bg-muted/30 p-1"
      >
        <button
          role="tab"
          aria-selected={modus === "laer"}
          onClick={() => {
            setModus("laer");
            nullstill();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            modus === "laer"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <BookOpen className="h-3.5 w-3.5" /> Læringsmodus
        </button>
        <button
          role="tab"
          aria-selected={modus === "prov"}
          onClick={() => {
            setModus("prov");
            nullstill();
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            modus === "prov"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Dumbbell className="h-3.5 w-3.5" /> Prøv selv
        </button>
      </div>

      {/* Temafilter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setTema("alle");
            setIndeks(0);
            nullstill();
          }}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors",
            tema === "alle" ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          Alle ({MAL_OPPGAVER.length})
        </button>
        {MAL_TEMAER.map((t) => {
          const antall = MAL_OPPGAVER.filter((o) => o.tema === t.id).length;
          if (antall === 0) return null;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTema(t.id);
                setIndeks(0);
                nullstill();
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                tema === t.id ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {t.navn} ({antall})
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {MAL_TEMAER.find((t) => t.id === oppgave.tema)?.navn ?? oppgave.tema}
            </Badge>
            {oppgave.flersteg && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                Flere steg
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {(indeks % utvalg.length) + 1} av {utvalg.length}
          </span>
        </div>

        <h2 className="text-lg font-semibold leading-tight">{oppgave.tittel}</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{oppgave.oppdrag}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Slik ser det ut nå
            </div>
            <pre className="font-mono text-[11px] whitespace-pre overflow-x-auto">
              {startlisting.join("\n")}
            </pre>
          </div>
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-brand mb-1">Måltilstand</div>
            <p className="text-xs leading-relaxed">{oppgave.maal}</p>
          </div>
        </div>

        {modus === "laer" ? (
          <>
            <div className="mt-5 rounded-lg border border-brand/40 bg-brand/5 p-4">
              <div className="flex items-center gap-2 text-brand font-medium text-sm">
                <BookOpen className="h-4 w-4" /> Løsninger som alle gir «riktig»
              </div>
              <ul className="mt-2 space-y-1">
                {oppgave.aksepterte.map((a) => (
                  <li key={a} className="font-mono text-xs whitespace-pre-wrap text-foreground">
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                Listen er eksempler, ikke en fasit: sjekken ser på tilstanden etterpå, så enhver
                annen kommando som gir samme resultat godtas også.
              </p>
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <span className="font-medium text-foreground">Hint:</span> {oppgave.hint}
                </span>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Lærdom:</span> {oppgave.laerdom}
            </div>
            <div className="mt-4">
              <Button size="sm" onClick={() => { setModus("prov"); nullstill(); }}>
                <Dumbbell className="h-3.5 w-3.5 mr-1" /> Prøv selv
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5">
              <label
                htmlFor="mal-input"
                className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Kommandoene dine {oppgave.flersteg && "(én per linje, eller skilt med semikolon)"}
              </label>
              <textarea
                id="mal-input"
                value={svar}
                onChange={(e) => setSvar(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sjekk();
                }}
                rows={oppgave.flersteg ? 4 : 2}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="$ ..."
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none transition-colors resize-y",
                  utfall === "riktig" && "border-success text-success",
                  utfall === "nesten" && "border-amber-500/60",
                  utfall === "feil" && "border-red-500/60",
                  !utfall && "border-border focus:border-brand",
                )}
              />
            </div>

            {forsok && (
              <>
                <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Terminalen
                  </div>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap">
                    {terminallinjer(forsok.kjøringer).join("\n") || "(ingen utskrift)"}
                  </pre>
                </div>

                <div
                  className={cn(
                    "mt-3 rounded-lg border p-4",
                    utfall === "riktig" && "border-success/40 bg-success/5",
                    utfall === "nesten" && "border-amber-500/40 bg-amber-500/5",
                    utfall === "feil" && "border-red-500/40 bg-red-500/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 font-medium text-sm",
                      utfall === "riktig" && "text-success",
                      utfall === "nesten" && "text-amber-600 dark:text-amber-400",
                      utfall === "feil" && "text-red-500",
                    )}
                  >
                    {utfall === "riktig" && (
                      <>
                        <Check className="h-4 w-4" /> Riktig
                      </>
                    )}
                    {utfall === "nesten" && (
                      <>
                        <TriangleAlert className="h-4 w-4" /> Nesten — du er på rett spor
                      </>
                    )}
                    {utfall === "feil" && (
                      <>
                        <X className="h-4 w-4" /> Ikke i mål
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-foreground">
                    {forsok.resultat.melding}
                  </p>
                  {utfall === "riktig" && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Lærdom:</span> {oppgave.laerdom}
                    </p>
                  )}
                </div>
              </>
            )}

            {visHint && utfall !== "riktig" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <span className="font-medium text-foreground">Hint:</span> {oppgave.hint}
                </span>
              </div>
            )}

            {visFasit && (
              <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                  <Eye className="h-4 w-4" /> Eksempler på løsninger
                </div>
                <ul className="mt-2 space-y-1">
                  {oppgave.aksepterte.map((a) => (
                    <li key={a} className="font-mono text-xs whitespace-pre-wrap">
                      {a}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">{oppgave.laerdom}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={sjekk} disabled={utfall === "riktig"}>
                Sjekk tilstanden
              </Button>
              <Button size="sm" variant="ghost" onClick={nullstill}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Nullstill
              </Button>
              {utfall !== "riktig" && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setVisHint(true)}>
                    <Lightbulb className="h-3.5 w-3.5 mr-1" /> Hint
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setVisFasit(true)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Vis svar
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => {
                  setModus("laer");
                  nullstill();
                }}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1" /> Tilbake til læring
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <Button size="sm" variant="ghost" onClick={() => gaTil(-1)}>
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
        </Button>
        <span>
          {(indeks % utvalg.length) + 1} av {utvalg.length}
        </span>
        <Button size="sm" variant="ghost" onClick={() => gaTil(1)}>
          Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </main>
  );
}
