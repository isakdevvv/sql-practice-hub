import { useEffect, useState } from "react";
import { Brain, CheckCircle2, Target } from "lucide-react";
import { AnslagPanel } from "@/components/lab/AnslagPanel";
import { MaalOppgaveKort } from "@/components/lab/MaalOppgaveKort";
import { RecallPanel } from "@/components/stack/dte2505-felles/RecallPanel";
import type { Anslag, AnslagLager } from "@/lib/lab/anslag";
import type { Oppgave } from "@/lib/lab/typer";
import type { FsrsStore } from "@/lib/learn/fsrs";
import { markSectionMastered, masteredSections } from "@/lib/core/mastery";

/**
 * Lab-delen av en leksjonsside: anslag, måloppgaver og recall — ferdig koblet
 * sammen, med framgang som overlever oppdatering.
 *
 * Finnes fordi de to sidene i modul 1 steg 3 og 4 skulle ha nøyaktig samme
 * oppsett, og en tredje kopi av den samme sammenkoblingen ville vært den ene
 * for mye. Sidene beholder sin egen prosa og sine egne simulatorer; dette er
 * bare halen.
 *
 * `anslagIntro` er den eneste teksten som må skrives per side. Resten av
 * rammen er lik overalt, og skal være det — studenten skal kjenne den igjen.
 */
export function LabSeksjoner({
  leksjon,
  anslag,
  anslagLager,
  anslagIntro,
  oppgaver,
  oppgaveIntro,
  feilTekst,
  kort,
  kortTagger,
  kortStore,
  oppsummering,
}: {
  /** Slug-en framgangen lagres under. Må matche stack-ruta. */
  leksjon: string;
  anslag: Anslag[];
  anslagLager: AnslagLager;
  anslagIntro: string;
  oppgaver: Oppgave[];
  oppgaveIntro: string;
  feilTekst: string;
  kort: { id: string; front: string; back: string; tag: string }[];
  kortTagger: { id: string; label: string }[];
  kortStore: FsrsStore;
  /** Vises når alle oppgavene er løst. Skal si hva ferdigheten var verdt. */
  oppsummering: string;
}) {
  const [lost, setLost] = useState<Set<string>>(new Set());

  // localStorage finnes ikke under tjener-rendringen — derfor etter montering.
  useEffect(() => {
    const lagret = masteredSections(leksjon);
    const mine = oppgaver.filter((o) => lagret.has(o.id)).map((o) => o.id);
    if (mine.length > 0) setLost(new Set(mine));
  }, [leksjon, oppgaver]);

  function marker(id: string) {
    markSectionMastered(leksjon, id);
    setLost((s) => new Set(s).add(id));
  }

  return (
    <>
      <AnslagPanel anslag={anslag} lager={anslagLager} lost={lost} intro={anslagIntro} />

      <section className="mb-10">
        <h2 className="mb-2 flex flex-wrap items-center gap-2 text-xl font-semibold">
          <Target className="h-5 w-5 text-brand" />
          Måloppgaver
          <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">
            {lost.size} / {oppgaver.length}
          </span>
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">{oppgaveIntro}</p>

        <div className="space-y-3">
          {oppgaver.map((o, i) => (
            <MaalOppgaveKort
              key={o.id}
              nr={i + 1}
              oppgave={o}
              lost={lost.has(o.id)}
              onLost={() => marker(o.id)}
              feilTekst={feilTekst}
            />
          ))}
        </div>

        {lost.size === oppgaver.length && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p className="leading-relaxed text-foreground">{oppsummering}</p>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <Brain className="h-5 w-5 text-brand" />
          Det som må sitte i hodet
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Kortene ligger i den felles repetisjonskøen sammen med resten av faga, så de kommer
          tilbake av seg selv utover høsten.
        </p>
        <RecallPanel cards={kort} tags={kortTagger} store={kortStore} />
      </section>
    </>
  );
}
