# DTE-2505 Operativsystemer — emnekart

Kartlegging av pensum mot innholdet i repoet, og mot det nye skjerm-baserte faget
i `src/lib/kurs/fag/dte-2505.tsx`.

**Status før dette arbeidet:** `AUDIT-PLATTFORM.md` scoret DTE-2505 til 6/10 og pekte på
tre hull: *filsystem mangler helt*, *virtualisering*, og *IPC i dybden*. Auditet er
delvis utdatert — siden det ble skrevet har det kommet komponenter under
`src/components/stack/dte2505-filsystem/`, `-ipc/` og `-virtualisering/`. Det reelle
hullet var derfor ikke at komponentene manglet, men at de lå som løsrevne stack-sider
uten progresjon, uten anslag-før-fasit, og uten plass i en pensumrekkefølge.

## Kilder

| Kilde | Hva den gir |
|---|---|
| `src/lib/dte2505/canvasModuler.ts` | Kanonisk Canvas-fasit: modul 1a, 1b, 2, 3, 4, 5, 6 og seks obliger |
| `plan-dte-2505.md` | Atom-dekomposisjon i ti lag (A–J) med dekningsstatus per atom |
| `AUDIT-PLATTFORM.md` | Fagaudit, 6/10, tre navngitte hull |
| `src/components/stack/dte2505-*/` | 27 kataloger med eksisterende visualiseringer |

## Canvas-moduler → nye emner

| Canvas-modul | Nytt emne | Merknad |
|---|---|---|
| 1a Linux og operativsystemer | 1 Operativsystemet og maskinen | Utvidet med kjernemodus, systemkall, systemtyper |
| 1b Installasjon, programmer, oppdateringer | 2 Linux i praksis (u. 1–2) | |
| 2 Kommandobasert bruk, hjelpesystemer | 2 Linux i praksis (u. 3–4) | |
| 3 Prosesser | 3 Prosesser, + 4 Scheduling som dybde | |
| 4 Filsystem og skallet | 8 Filsystemet, 11 Skallet og skallprogrammering | |
| 5 Tilgangsrettigheter og skallprogram | 10 Rettigheter, 11 u. 3–4 | |
| 6 Diverse — vi/vim, X, SSH | 2 Linux i praksis (u. 5) | |
| *(ikke i Canvas, OSTEP-dybde)* | 5 Minne, 6 Tråder og konkurrens, 7 IPC, 9 I/O og lagring, 12 Virtualisering | |

## Emnetreet

| # | Emne | Undertemaer | Skjermer |
|---|---|---|---|
| 1 | Operativsystemet og maskinen | 4 | 35 |
| 2 | Linux i praksis | 5 | 48 |
| 3 | Prosesser | 5 | 45 |
| 4 | Scheduling | 5 | 46 |
| 5 | Minnehåndtering | 5 | 48 |
| 6 | Tråder og konkurrens | 6 | 56 |
| 7 | Kommunikasjon mellom prosesser | 4 | 38 |
| 8 | Filsystemet | 5 | 48 |
| 9 | Inn- og utdata og lagring | 4 | 46 |
| 10 | Brukere og rettigheter | 4 | 38 |
| 11 | Skallet og skallprogrammering | 5 | 47 |
| 12 | Virtualisering og containere | 2 | 20 |
| | **Sum** | **54** | **515** |

## Dekning per atom fra `plan-dte-2505.md`

Atomene som planen markerte som **delvis** eller udekket, og hva som er gjort:

| Atom | Før | Nå |
|---|---|---|
| B2 Tråd | delvis — nevnt, ingen dedikert side | Emne 6 u. `trad-vs-prosess` og `tradtilstander` |
| E3 Filbeskriver | delvis — kun i syscall-tabell | Emne 7 u. `filbeskrivere-og-ror`, egen skjerm |
| F5 setuid/setgid/sticky | delvis — kun SGID i drill | Emne 10 u. `spesialbits`, fire skjermer + ACL |
| H1 Bash som program | delvis — antydet | Emne 11 u. `skallet-er-en-prosess`, hele undertemaet |
| Filsystem (audit-hull) | «mangler helt» | Emne 8, 5 undertemaer, 48 skjermer |
| Virtualisering (audit-hull) | tynt | Emne 12, hypervisorer + navnerom/cgroups |
| IPC (audit-hull) | samlet i konkurrens | Emne 7, eget emne med 4 undertemaer |

Nytt stoff som ikke sto i atom-planen i det hele tatt: DMA og ventestrategier
(spørring/avbrudd/DMA), bufferbuffer og `fsync`, journalføringsmodi, bitkart for ledig
plass, skriveforsterkning og TRIM, mottrykk, livlås, cgroups, og `set -euo pipefail`
med rørkjeders exitkode.

## Gjenbrukte komponenter

Alle er props-løse og wrappes i `visual()`-skjermer. Ingen av dem er endret.

| Komponent | Kilde | Brukt i |
|---|---|---|
| `StackDiagram`, `SyscallFlowDiagram` | `stack/dte2505-virtualisering/` | Emne 1 |
| `OsTypologiSimulator`, `OsCompare`, `UseCaseMatch` | `stack/dte2505-os-typologi/` | Emne 1 |
| `FormatSammenligner`, `KildeSimulering`, `PakkeAnsla`, `PakkeMalOppgaver` | `stack/dte2505-modul1b/` | Emne 2 |
| `KommandoAnatomi`, `ManUtforsker`, `VerktoyVelger`, `LessTaster`, `Hjelpekonsoll`, `MalOppgaver` | `stack/dte2505-hjelpesystemer/` | Emne 2 |
| `VimSimulator`, `XKlientTjener`, `SshOppgaver` | `stack/dte2505-modul6/` | Emne 2 |
| `ProcessStateMachine`, `ProcessVisualizer`, `ProsessMonitor` | `stack/dte2505-prosesser-signaler/` | Emne 3 |
| `PsTopParser` | `stack/dte2505-thread-vs-prosess/` | Emne 3 |
| `SchedulingSimulator` | `stack/dte2505-scheduling-drill/` | Emne 4 |
| `ContextSwitchSimulator`, `StepOrderDragQuiz` | `stack/dte2505-kontekstbytte/` | Emne 4 |
| `MemoryLayout`, `AddressTranslator`, `CacheHierarchy`, `PageReplacementSim`, `VirtueltMinneVisualizer` | `stack/dte2505-virtuelt-minne/` | Emne 5 |
| `MemoryModelVisualizer`, `WorkloadComparison`, `RaceConditionDemo` | `stack/dte2505-thread-vs-prosess/` | Emne 6 |
| `ThreadStateSimulator` | `stack/dte2505-thread-state/` | Emne 6 |
| `ConcurrencyTimeline`, `KonkurrensVisualizer`, `ProducerConsumerSim`, `DeadlockGraph` | `stack/dte2505-konkurrens/` | Emne 6 |
| `PipesSimulator`, `SharedMemorySim`, `MessageQueueDemo`, `IpcMatchQuiz` | `stack/dte2505-ipc/` | Emne 7 |
| `InodeDiagram`, `PathResolution`, `LinkTypes`, `FreeBlockBitmap`, `JournalingAnimator` | `stack/dte2505-filsystem/` | Emne 8 |
| `InodeStructure` | `stack/dte2505-virtuelt-minne/` | Emne 8 |
| `DeviceClassifier`, `DriverStackFlow`, `IoStrategySim`, `DiskSchedulingViz`, `BufferCacheSim`, `ScenarioDragQuiz` | `stack/dte2505-io-management/` | Emne 9 |
| `HddPhysicsViz`, `RandomVsSeqBench`, `SsdCellsViz`, `EraseBeforeWriteSim`, `WearLevelingViz`, `TrimDemo`, `StorageCompare` | `stack/dte2505-lagring/` | Emne 9 |
| `RwxKalkulator`, `UmaskCalculator` | `stack/dte2505-rwx-kalkulator/` | Emne 10 |
| `SpesialbitsCalculator` | `stack/dte2505-spesialbits/` | Emne 10 |
| `BashSandbox` | `stack/dte2505-bash-scripts/` | Emne 11 |
| `ShellDrill` | `components/dte2505/` | Emne 11 |
| `HypervisorTypeComparison`, `VmVsContainer` | `stack/dte2505-virtualisering/` | Emne 12 |

**Ikke gjenbrukt, med vilje:** alle `*Page.tsx`-komponentene. De er hele sider med
lang scroll og passer ikke i skjerm-modellen. Innholdet deres er i stedet fordelt på
skjermer. `LagringDrill` og `LagringFlashcards` er heller ikke brukt — recall er lagt
inn per undertema i stedet, som `recall()`-skjermer på slutten.

## Pedagogisk struktur per undertema

Fast mønster, som følger prinsippene i brukerens minnefiler:

1. `intro` — problemet, ikke definisjonen
2. `anslag` — studenten satser på et svar **før** fasit
3. `konsept` — én idé, maks fire punkter
4. `visual` — simulatoren, med et konkret fikle-hint
5. `kode` — «lær først»: ferdig utregning eller ferdig løsning
6. `sjekk` / `visual` — «prøv selv», uten fasit foran seg
7. `recall` — flippkort, **alltid nest sist**, aldri inngangen
8. `oppsummering` — tre punkter + hva som kommer

Fordeling over de 515 skjermene: 127 `konsept`, 69 `visual`, 68 anslag
(52 flervalg + 16 tallanslag), 54 `sjekk`, 54 `recall`, 54 `intro`,
54 `oppsummering` og 35 `kode`. Alle 68 anslagene kommer **før** fasit, og alle
54 recall-skjermene ligger nest sist i sitt undertema — aldri som inngang.
53 av 54 undertemaer har `byggerPa` satt; det ene unntaket er `hva-os-gjor`,
som er inngangen til faget og ikke forutsetter noe.

## Gjenstår

- `useSkjerm()` fra `@/components/skjerm` finnes ennå ikke på `feat/skjerm-shell`.
  `byggere.tsx` importerer den etter kontrakten; det gir én tsc-feil til shell-agenten
  lander hooken.
- Ingen av skjermene er visuelt verifisert på 600 px høyde ennå, siden shellet som
  rendrer dem ikke finnes. `Figur` gir gjenbrukte simulatorer `max-h-[400px]` med
  intern scroll som forsikring.
- `repetisjon`-feltet på `Undertema` er ikke fylt ut — det peker på id-er i den
  eksisterende flashcard-/oppgavekøen, og krever en kobling som ikke er avklart ennå.
- Obligene (Canvas 1.1–5) er ikke bygget inn som eget emne. De dekkes av
  `stack/dte2505-obliger-guide/`, og bør lenkes fra faget når rutene finnes.
