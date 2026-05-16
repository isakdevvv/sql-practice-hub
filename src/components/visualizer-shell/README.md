# visualizer-shell

Delte primitiver for de 40+ interaktive visualiseringene i `src/components/stack/*`.
Trukket ut for at hver visualizer skal slippe å reimplementere modus-velger,
op-logg, step/play-kontroller, fade-in-animasjon og hele topp-bar-layouten.

## Primitivene

| Modul | Hva den gjør |
| --- | --- |
| `VisualizerShell` | Topp-nivå-wrapper med kicker + tittel + modus-chip-rad + Reset-knapp. Body som `children`. |
| `ModeChips` | Brand-tonet pille-rad for modus-velgeren. Aktiv modus får brand-bakgrunn. |
| `OpButton` | Liten primary/danger-knapp for operasjons-paneler (push, pop, add_first…). |
| `StepControls` | Standard Forrige / Play-Pause / Neste / Reset-rad. Valgfri tempo- og scrub-slider. |
| `OpLog` | Monospace-liste med siste operasjoner, nyeste først. Maks 6 entries by default. |
| `NodeBox` | Verdi-boks (linked-list / queue / heap) med fade-in / fade-out via `phase`. |
| `useStepRunner` | Hook for "pre-compute alle frames, kjør gjennom dem"-mønsteret. Returnerer index / playing / step / playPause / setIndex … |
| `useFadeCells` | Hook for "add med fade-in, remove med fade-out etter delay". Brukes av linked-strukturer. |

Importér alt via barrelen:

```ts
import {
  VisualizerShell,
  StepControls,
  OpLog,
  useStepRunner,
} from "@/components/visualizer-shell";
```

## Minimal "hello world"

`useStepRunner` + `VisualizerShell` + `StepControls` — bygg en visualizer som
kjører gjennom et felt med pre-genererte frames.

```tsx
import { useMemo, useState } from "react";
import {
  VisualizerShell,
  StepControls,
  useStepRunner,
  type ModeDef,
} from "@/components/visualizer-shell";

type Mode = "a" | "b";
const MODES: ModeDef<Mode>[] = [
  { id: "a", label: "Variant A" },
  { id: "b", label: "Variant B" },
];

type Frame = { value: number; note: string };

export function MinVisualizer() {
  const [mode, setMode] = useState<Mode>("a");

  // Beregn frames opp-front.
  const frames = useMemo<Frame[]>(() => {
    const n = mode === "a" ? 5 : 8;
    return Array.from({ length: n }, (_, i) => ({
      value: i * 2,
      note: `steg ${i + 1}: verdi = ${i * 2}`,
    }));
  }, [mode]);

  const runner = useStepRunner(frames, { initialSpeed: 400 });
  const f = runner.frame;

  return (
    <VisualizerShell<Mode>
      title="Eksempel-visualisering"
      modes={MODES}
      activeMode={mode}
      onModeChange={setMode}
      onReset={runner.reset}
    >
      <div className="p-6 min-h-[200px] flex items-center justify-center bg-background">
        <div className="text-3xl font-mono">{f?.value ?? "—"}</div>
      </div>
      <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
        {f?.note}
      </div>
      <StepControls
        step={runner.index}
        total={runner.total}
        playing={runner.playing}
        onStep={runner.step}
        onStepBack={runner.stepBack}
        onPlayPause={runner.playPause}
        onReset={runner.reset}
        speed={runner.speed}
        onSpeedChange={runner.setSpeed}
      />
    </VisualizerShell>
  );
}
```

## "Add/remove med fade" — bruk `useFadeCells`

Gjør samme jobb som det manuelle `setTimeout`-mønsteret i
`LinkedStructuresVisualizer`:

```tsx
import { OpButton, NodeBox, useFadeCells } from "@/components/visualizer-shell";

const { cells, addCell, removeCell } = useFadeCells<number>([1, 2, 3]);

return (
  <>
    <div className="flex gap-2">
      {cells.map((c) => (
        <NodeBox key={c.id} value={c.value} phase={c.phase} />
      ))}
    </div>
    <OpButton onClick={() => addCell(42, "end")}>add</OpButton>
    <OpButton variant="danger" onClick={() => cells[0] && removeCell(cells[0].id)}>
      pop
    </OpButton>
  </>
);
```

## Migrasjons-sjekkliste for de resterende ~37 visualiseringene

Følg denne sjekklisten når du flytter en `*Visualizer.tsx` til shell-en:

- [ ] Erstatt rotnoden `<div className="rounded-2xl border border-border ...">`
      og hele topp-baren med `<VisualizerShell title=… modes=… activeMode=… onModeChange=… onReset=…>`.
- [ ] Erstatt inline `MODES.map(...)` chip-renderen — `VisualizerShell` gjør det selv via `modes`/`activeMode`.
- [ ] Erstatt lokal `OpBtn` med `OpButton` fra shell-en. Slett den gamle definisjonen.
- [ ] Hvis filen har Play/Pause/Step/Reset-knapper hardkodet: erstatt hele blokken med `<StepControls …>`.
      Bruk `rightSlot` for steg-tellere (sammenligninger, swaps, etc).
- [ ] Hvis filen har et "pre-compute frames"-mønster (`steps`/`frames` + `stepIdx` + `playing` + `useEffect(setTimeout)`):
      erstatt alt med `const runner = useStepRunner(frames)`. Bruk `runner.frame`, `runner.index`, `runner.playing`,
      `runner.step`, `runner.playPause`, `runner.reset`, `runner.setIndex` (for scrub).
- [ ] Hvis filen har en "fade-in / fade-out" Cell-liste med `idRef`/`setTimeout`-dans:
      bytt til `useFadeCells<T>(initial)`. `addCell(v, "start" | "end")` og `removeCell(id)` gjør alt.
- [ ] Hvis filen renderer en op-logg-liste: erstatt med `<OpLog entries={log} />`. Eksisterende `LogEntry`-typer
      kan ofte caste rett til `OpLogEntry` (samme tre felter).
- [ ] Hvis filen har en verdi-boks med head/tail/top-label og fade-stiler: bytt til `<NodeBox value=… highlight=… phase=… />`.
- [ ] Sjekk at TS-en er ren: `bunx tsc --noEmit -p tsconfig.json | grep <filnavn>`.
- [ ] Sammenlign LOC før/etter. Mål er 25–40 % reduksjon.

Pek nye visualisere på shell-en fra dag én — copy-paste `MinVisualizer`-eksempelet
over og bytt ut frames/render-logikken.
