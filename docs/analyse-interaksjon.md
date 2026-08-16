# Analyse: neste steg for interaksjon og visuell pedagogikk

Analyse per 2026-08-16, mot `main` @ `bb1c21d`. Ingen kodeendringer — dette er et
beslutningsgrunnlag.

Alle påstander under er verifisert ved å åpne komponentene, ikke ved å lese
filnavn. Der jeg motsier premisset i bestillingen, sier jeg det eksplisitt.

---

## 1. Kartlegging

### 1.1 Tallene stemmer

| Størrelse | Oppgitt | Faktisk |
|---|---|---|
| Mapper under `src/components/stack/` | 281 | **281** |
| Oppføringer i `src/lib/library/index.ts` | 66 | **66** |
| Oppgaver i `src/lib/problems/data.ts` | 320 | **320** |
| Filer som importerer `@xyflow/react` | ~16 | **15** (+ `styles.css`) |
| `*Live*.tsx`-komponenter | ~47 | **47** |
| Filer med håndrullet drag | ~17 | **17** (4 av dem er ikke pedagogisk drag) |

### 1.2 `@xyflow/react`: brukt som layoutmotor, ikke som byggeverktøy

15 komponenter bruker xyflow. De deler seg rent i to leirer:

**Leir A — «klikk på en node for å lese om den»** (6 filer):
`MlPipelineFlow`, `NetworkTopology`, `OsiStackFlow`, `MdpGraphFlow`,
`DeadlockGraph`, `RoutingGraphSim`. Disse setter `nodesDraggable` (eller lar
default stå), men dragging flytter bare boksen på skjermen — det er ren kosmetikk.
Interaksjonen som *betyr* noe er `onNodeClick` → vis infopanel.
`RoutingGraphSim` setter til og med `nodesDraggable={false}`.

**Leir B — Kurose `Section*Live`** (8 filer: 1.2, 4.1, 5.1–5.5, + `kap7/`):
alle bruker `useNodesState` + `onNodesChange`, som gir dragbare noder gratis,
men **samtlige åtte setter `nodesConnectable={false}`**.

Det er hovedfunnet om xyflow: *ingen steder i appen kan brukeren koble en kant*.
Biblioteket er valgt for en grafmodell, men den ene tingen xyflow gir som er
vanskelig å bygge selv — å dra en forbindelse fra en node til en annen og få den
validert — er slått av overalt. Å dra en ruter 40 piksler mot høyre lærer deg
ingenting; å dra en kabel fra feil port og få den avvist lærer deg noe.

`feat/xyflow-poc` (`3523cc0`, 419 linjer `Section12LiveFlow.tsx` + egen
`/xyflow-poc`-rute) er en **parallell reimplementasjon av 1.2 som allerede
finnes i main** — `Section12Live.tsx` bruker xyflow i dag. POC-en har gjort
jobben sin og er utdatert. Anbefaling: slett branchen, ikke merge den.

### 1.3 `learn/Drag*`: 1449 øvelser bak én rute nesten ingen går til

`src/lib/learn/dragExercises.ts` er 28 100 linjer med 1449 øvelser
(557 quiz, 355 match, 338 fill, 166 order, 22 crowsfoot). Det er appens
desidert største enkeltinvestering i interaktivt innhold.

Hvem bruker komponentene?

- `DragOrder`, `DragMatch`, `DragFill`: **kun `src/routes/drag.tsx`.** Null bruk
  på noen av de 281 stack-sidene.
- `DragQuiz`: 3 stack-sider (`dte2505-io-management`, `dte2505-kontekstbytte`,
  `dte2501-ai-paradigmer-kart`) — og alle tre wrapper den i sin egen lokale
  komponent med egne data, altså ikke via `DRAG_EXERCISES`.

Så mønsteret er ikke «drag-komponentene passer ikke». Det er at all drag-øvingen
er samlet på én selvstendig `/drag`-rute, mens læringen skjer på stack-sidene.
`/drag` lenkes fra ~10 sider, alltid som en fotnote i brødtekst («se også
[/drag]»), aldri som en integrert del av en leksjon.

Dette bryter direkte mot prinsipp 3 (*lær først, prøv selv etterpå*): øvingen
ligger fysisk et annet sted enn undervisningen, så «prøv selv» krever at
brukeren navigerer bort, finner riktig topic i en filtermeny og finner tilbake.

Emnedekningen i dataene er dessuten skjev mot **ikke-eksamensfag**: de største
topic-ene er «Cross-phase drill» (40), «OS-grunnlag» (35), «ER-modell» (35).
De fire eksamensfagene har `DTE-2602` 30, `DTE-2507` 25, `DTE-2505` 25 som
eksplisitte topics — resten av eksamensstoffet ligger spredt under generiske
topics som «Sannsynlighet», «Sortering», «Hashing».

### 1.4 De 47 `*Live*`-komponentene: knapper og slidere, null direkte manipulasjon

45 av 47 ligger i `kurose-kurs/`. Verifisert interaksjonsinventar:

- **Drag: 0 av 47.** Ikke én `*Live*`-komponent lar brukeren flytte et objekt.
- **Slider: 13 av 47** har minst én `type="range"`.
- **Resten er knapper**: stegvis avspilling (`go(-1)` / `go(+1)` / play / reset)
  eller fanevalg.

Kvaliteten er jevnt over høy — dette er ikke tomme sider. Konkret motbevis mot
premisset i bestillingen: **`Section64Live.tsx` (Kurose 6.4) er ikke «bare
tekst».** Den er 577 linjer med en fullverdig switch-simulator: fire hosts, fire
porter, en fireefasers sekvens (ingress → learn → lookup → egress), en MAC-tabell
som faktisk fylles opp, flood-vs-unicast-logikk og VLAN-isolering med drop. Den
foreslåtte «dra kabler og se ARP-tabellen fylle seg» finnes i praksis allerede,
minus kabeldragingen.

Det reelle hullet i 6.4 er et annet, og det går igjen i hele Kurose-kurset:
simulatoren **kjører seg selv på `setTimeout`**. Brukeren velger avsender og
mottaker, trykker Send, og ser på i ~4,4 sekunder. Det finnes ingen
neste/forrige-stegning, og ingen gjett-før-avsløring. Kontrasten mellom «hva jeg
trodde skjedde» og «hva som skjedde» — den som faktisk skaper læring — er ikke
høstet noe sted.

(Sidefunn i samme fil: `phaseTimer.current` blir aldri tilordnet, så
`resetAll()` avbryter ingenting. Trykker du «Nullstill» midt i en sending,
kjører de fire `setTimeout`-ene videre og fyller tabell og logg på nytt. Liten
bug, ikke del av denne analysen.)

### 1.5 Håndrullet drag: 7 kopier av samme 40 linjer

13 stack-komponenter har ekte pedagogisk drag (de 4 øvrige treffene —
`SiteHeader`, `SqlEditor`, m.fl. — er UI-mekanikk, ikke læring). Alle 13 er i
**DTE-2602 (ML) eller TEK-1501 (statistikk)**.

Sju av dem gjør nøyaktig det samme: dra et punkt i et SVG-koordinatsystem.
`DraggableScatterFit`, `RegressionPlayground`, `SvmMarginDemo`, `PcaProjector`,
`OneWayAnovaSandbox`, `KvartilProkkrekke`, `DecisionBoundaryViz`. Hver har sin
egen `dragIdx`-state, sin egen `getBoundingClientRect()`-til-datakoordinat-
konvertering, sitt eget `setPointerCapture`-oppsett. Ingen delt hook.

Verre: **11 av 13 har ingen visuell affordans.** Ingen `cursor-grab`,
`cursor-move` eller `cursor-pointer` på det dragbare elementet. Kun
`KvartilProkkrekke` og `kap7/CellulaViz` har det. Punktene *er* dragbare, men
ingenting på skjermen sier det. Dette er nøyaktig samme feil som
eksempelkortene på forsiden hadde (så ut som knapper, var `<article>`) — bare
speilvendt: de *oppfører* seg som kontroller, men *ser ut* som pynt.

### 1.6 Gjett-før-avsløring finnes allerede — og er låst til ett fag

`src/components/stack/tek1-oppgaver/AnslaSaSjekk.tsx` er en ferdig, generisk,
fagnøytral predict-before-reveal-komponent. Den tar en liste `Anslag`
(tema, spørsmål, alternativer, riktig svar, fasit, «hvorfor bommer intuisjonen»),
låser valget til brukeren trykker Sjekk, og viser bevisst ikke rødt/grønt
straffsignal.

Den brukes i **fire filer, alle TEK-1501**: modul 1, 2, 3 og 4. Null bruk i
DTE-2507, DTE-2505 eller DTE-2602.

Den er ikke bundet til statistikk på noen måte — `sporsmal` og `fasit` er
`ReactNode`. Den kan tas i bruk på en Kurose-side i dag uten én linje endring i
komponenten.

### 1.7 Dekning per eksamensfag

| Fag | Sider | Ekte drag | Gjett-før-avsløring | Vurdering |
|---|---|---|---|---|
| **DTE-2507** nettverk | 40 + 45 Kurose-seksjoner | **0** | 2 sider (8.3, 8.8) | Rikest på simulatorer, fattigst på manipulasjon |
| **DTE-2505** OS | 28 | **0** | 2 sider | God simulatordekning, null drag, null anslå |
| **DTE-2602** ML | 20 | 8 | 6 sider | Best på drag; naturlig, siden data er punkter |
| **TEK-1501** statistikk | 22 | 5 | 8 sider (inkl. alle 4 moduler) | Best på gjett-før-avsløring |

Mønsteret er tydelig: **de to fagene med tidligst eksamen (DTE-2507 30.11 og
DTE-2505 02.12) er de to som har null direkte manipulasjon.**

---

## 2. Forslag

Ti forslag. Innsats: **S** ≈ 2–4 t, **M** ≈ 4–8 t, **L** ≈ 8–16 t.

---

### F1 — Gjett-før-avsløring på Kurose-simulatorene (gjenbruk `AnslaSaSjekk`)

**Konsept:** Hele DTE-2507. Ikke ett konsept — et lag på toppen av 45 eksisterende
simulatorer.

**Hvorfor vanskelig i dag:** Simulatorene *viser* riktig svar før brukeren har
forpliktet seg til et gjett. Ser du switchen floode i 6.4 uten å ha tenkt «vil den
floode eller unicaste her?», lærer du at det skjedde, ikke hvorfor. Kontrasten
mellom forventning og utfall høstes aldri.

**Hva brukeren gjør:** Før «Send ramme» i 6.4: tre alternativer — *flood til alle
porter* / *unicast til P2* / *droppes*. Velg, trykk Sjekk, så kjører animasjonen.
Etter avsløringen står fasiten og «hvorfor intuisjonen bommer» igjen.

**Filer:** `Section64Live.tsx` og 7–9 søsken (foreslår 6.4, 3.4, 4.1, 5.3, 8.6).
Gjenbruker `AnslaSaSjekk` uendret. Ingen ny mekanikk, ingen nye avhengigheter.

**Innsats:** S per seksjon, M for fem. **Fag: DTE-2507 (eksamen først, 30.11).**

---

### F2 — Del `AnslaSaSjekk` ut av `tek1-oppgaver/`

**Konsept:** Infrastruktur, ikke innhold.

**Hvorfor:** Komponenten er fagnøytral, men ligger i en TEK-1501-mappe. Ingen som
jobber med OS eller nettverk vil finne den der. Flytt til
`src/components/learn/AnslaSaSjekk.tsx` og la `tek1-oppgaver/` re-eksportere, så
de fire eksisterende bruksstedene ikke brekker.

**Filer:** ny `learn/AnslaSaSjekk.tsx`, `tek1-oppgaver/AnslaSaSjekk.tsx` blir
re-eksport. **Innsats: S.** Forutsetning for F1. **Fag: alle fire.**

---

### F3 — Koble kabler i et svitsjet LAN (Kurose 6.4)

**Konsept:** At MAC-tabellen er en funksjon av *topologien*, ikke av switchen.

**Hvorfor vanskelig i dag:** I `Section64Live` er `HOSTS` en konstant med
hardkodet `port: 1..4`. Host A *er* på port 1, alltid. Brukeren kan derfor aldri
oppdage at «switchen lærer at AA:01 er på P1» er en konsekvens av hvor kabelen
sitter — det ser ut som en egenskap ved host A.

**Hva brukeren gjør:** Fire hosts og en switch med fire porter, ingen kabler.
Dra fra en host til en port for å koble. Send så en ramme og se tabellen fylle
seg med *dine* portnumre. Flytt kabelen til en annen port, send igjen, og se den
gamle oppføringen bli feil til den overskrives — det er hele poenget med
aldring/relearning.

**Filer:** utvide `Section64Live.tsx`. Dette er stedet å slå på xyflows
`nodesConnectable` + `onConnect` med validering (host↔port, ikke host↔host).
Alternativt SVG med den delte drag-hooken fra F9.

**Innsats: M.** **Fag: DTE-2507.**

---

### F4 — Bygg en subnettplan (DTE-2507, IP-adressering)

**Konsept:** Subnetting og CIDR-prefiks.

**Hvorfor vanskelig i dag:** Subnetting læres i dag som bitregning i tekst.
Feilen studenter gjør på eksamen er ikke aritmetikk — det er å ikke se at to
subnett *overlapper*, eller at et vertsantall ikke får plass i prefikset.
Begge er romlige egenskaper som forsvinner i en tabell.

**Hva brukeren gjør:** Et adresserom tegnet som en vannrett stripe. Dra
delelinjer for å splitte det. Hvert subnett viser prefiks, antall verter og
broadcast-adresse live mens du drar. Overlapp lyser rødt umiddelbart. Oppgave:
«del 192.168.1.0/24 i fire subnett med minst 50 verter hver» — valider og
forklar *hvorfor* et forsøk feiler («/27 gir 30 verter, du trenger 50 → /26»).

**Filer:** ny komponent under `dte2507-praksis/` eller egen mappe. Ren SVG +
delt drag-hook (F9). Ikke xyflow — dette er en 1D-akse, ikke en graf.

**Innsats: M.** **Fag: DTE-2507.**

---

### F5 — Dra jobber i Gantt-diagrammet (DTE-2505, scheduling)

**Konsept:** Hvordan ankomsttid og kjøretid bestemmer turnaround og respons under
FIFO/SJF/STCF/RR.

**Hvorfor vanskelig i dag:** `SchedulingSimulator.tsx` (640 linjer) er allerede
en full byggeoppgave — du kan legge til jobber og redigere `arrival` og `burst`.
Men **via nummer-input-felt**. Å skrive «10» i en boks og se et diagram endre seg
et annet sted i DOM-en kobler ikke tallet til formen. Convoy-effekten *er* et
bilde: én lang blokk som skyver to korte foran seg.

**Hva brukeren gjør:** Dra jobbens venstrekant vannrett = endre ankomsttid. Dra
høyrekanten = endre kjøretid. Gantt-diagrammet og turnaround-tallene rekalkuleres
under fingeren. Dra B til å ankomme før A under FIFO og se snitt-turnaround
kollapse.

**Filer:** `dte2505-scheduling-drill/SchedulingSimulator.tsx`. Beregningslogikken
finnes; dette er kun et nytt inndatalag. Delt drag-hook (F9), 1D-akse.

**Innsats: M.** **Fag: DTE-2505.**

---

### F6 — Gjett-før-avsløring på sideerstatning (DTE-2505)

**Konsept:** FIFO vs. LRU vs. optimal, og Béládys anomali.

**Hvorfor vanskelig i dag:** `PageReplacementSim.tsx` (739 linjer) simulerer
korrekt og viser hit/miss. Men Béládys anomali — at *flere* rammer kan gi *flere*
feil under FIFO — er kontraintuitiv nettopp fordi den bryter en forventning
brukeren aldri blir bedt om å uttrykke.

**Hva brukeren gjør:** Før kjøring: «Denne referansestrengen med 3 rammer gir 9
feil. Med 4 rammer blir det: *færre* / *like mange* / *flere*?» Velg, så kjører
simulatoren begge og viser dem side om side.

**Filer:** `dte2505-virtuelt-minne/PageReplacementSim.tsx` + `AnslaSaSjekk`.
Ingen ny mekanikk. **Innsats: S.** **Fag: DTE-2505.**

---

### F7 — Synlig affordans på alle 13 dragbare visualiseringene

**Konsept:** Ikke et fagkonsept — en ren oppdagbarhetsfeil.

**Hvorfor:** 11 av 13 dragbare komponenter har verken `cursor-grab`, hover-state
eller synlig håndtak. `DecisionBoundaryWithLogReg`, `MulticlassSoftmaxViz` og
`GmmVisualizer` har heller ikke instruksjonstekst. En bruker som ikke tilfeldigvis
drar i et punkt, ser en statisk figur og går videre — hele
interaksjonsinvesteringen er usynlig.

**Hva brukeren gjør:** Ser `cursor-grab` over punkter, `cursor-grabbing` under
drag, en subtil ring på hover, og én linje hjelpetekst («dra punktene for å se
regresjonslinja følge etter»).

**Filer:** de 13 filene i §1.5. Rent kosmetisk, null logikkendring.
**Innsats: S.** **Fag: DTE-2602 + TEK-1501.** Beste forhold gevinst/innsats i
hele dokumentet.

---

### F8 — Flytt drag-øvingene inn i leksjonene

**Konsept:** Infrastruktur + prinsipp 3.

**Hvorfor:** 1449 ferdige øvelser ligger bak `/drag`, en rute som lenkes som
fotnote. `DragOrder`/`DragMatch`/`DragFill` brukes null steder utenfor den ruta.
Investeringen er gjort; distribusjonen mangler.

**Hva brukeren gjør:** Nederst på en stack-side står de 5–8 øvelsene som matcher
sidens topic, inline, som «prøv selv»-seksjonen etter at siden har lært bort
stoffet. Ingen navigasjon bort.

**Filer:** en ny `<DragOvelserForTema topic="..." />` som slår opp i
`DRAG_EXERCISES` og rendrer riktig `Drag*`-komponent per `kind`. Så påkobling
side for side. Merk: `topic`-strengene må mappes til stack-slugs — det finnes
ingen slik kobling i dag, og det er den egentlige jobben her.

**Innsats: M** for mekanikken, deretter S per side. **Fag: alle fire.**

---

### F9 — Delt `useSvgPointDrag`-hook

**Konsept:** Infrastruktur. Se §3.

**Innsats: S** for hooken, S per migrert komponent. **Fag: alle.**

---

### F10 — Steg-for-steg-kontroll i de auto-avspilte simulatorene

**Konsept:** Alle firefase-sekvensene i Kurose.

**Hvorfor vanskelig i dag:** 6.4 og søsken kjører fire faser på faste
`setTimeout` à 1100 ms. Rekker du ikke lese «LÆRER: AA:01 sitter på port 1» før
neste fase overskriver statuslinja, må du kjøre hele sekvensen på nytt.
Seksjonene 3.4 og 8.6 har allerede `go(-1)`/`go(+1)` og viser at mønsteret
finnes i huset — det er bare ikke brukt konsekvent.

**Hva brukeren gjør:** Neste/forrige-knapper som steg-låser fasen, med play som
opsjon i stedet for eneste modus.

**Filer:** `Section64Live.tsx` + de seksjonene som fortsatt bruker
`setTimeout`-kjeder. Bør gjøres samtidig med F1 — gjett-før-avsløring er
meningsløst hvis avsløringen suser forbi. Fikser også `phaseTimer`-bugen fra
§1.4 på veien.

**Innsats: M.** **Fag: DTE-2507.**

---

## 3. Felles infrastruktur

Tre delte biter dekker seks av forslagene. Bygg dem først.

**(a) `useSvgPointDrag` — F3, F4, F5 + 7 eksisterende komponenter.**

Sju komponenter duplikerer allerede den samme konverteringen fra klient-piksler
til datakoordinater. Tre nye forslag trenger den. Signaturen som dekker alle ti:

```ts
useSvgPointDrag<T>({
  svgRef,
  points: T[],
  toData: (px: {x: number; y: number}) => {x: number; y: number},
  onDrag: (index: number, data: {x: number; y: number}) => void,
  axis?: "x" | "y" | "both",   // F4 og F5 er 1D
  clamp?: (d) => d,
})
// → { onPointerDown(i), svgHandlers, draggingIndex }
```

`axis` er det som gjør at F4 (delelinjer på en akse) og F5 (Gantt-kanter) kan
bruke samme hook som scatterplottene. Hooken må returnere `draggingIndex`, slik
at F7s affordans-styling faller ut gratis i stedet for å måtte gjentas 13 ganger.

Migrer de sju eksisterende samtidig — ellers står det åtte implementasjoner i
stedet for sju.

**(b) `AnslaSaSjekk` som delt primitiv — F1, F2, F6.**

Komponenten er ferdig og fagnøytral. Den mangler bare å bo et sted andre fag
finner den (F2). Ikke bygg noe nytt her.

**(c) Fasestyring: én `useStepSequence` — F1, F10.**

`setTimeout`-kjeden i `Section64Live` og `go(±1)`-mønsteret i 3.4/8.6 er to
løsninger på samme problem. Én liten hook — `{ step, next, prev, playing,
toggle, reset }` med opprydding i `useEffect`-cleanup — dekker begge, og fjerner
`phaseTimer`-klassen av bugs strukturelt.

**Rekkefølge:** (b) er én filflytting. Deretter (a) og (c) parallelt. Så innhold.

---

## 4. Rangering

**Pedagogisk løft mot innsats:**

| | Løft | Innsats | |
|---|---|---|---|
| **F7** affordans | Middels | S | Gevinsten er at eksisterende arbeid blir *funnet* |
| **F2** flytt `AnslaSaSjekk` | (muliggjør) | S | Én fil |
| **F6** Béládys anslag | Høyt | S | Kontraintuitivt konsept, komponent finnes |
| **F1** anslag i Kurose | Høyt | S–M | Treffer faget med tidligst eksamen |
| **F10** stegkontroll | Middels-høyt | M | Forutsetning for at F1 virker |
| **F9** delt hook | (muliggjør) | S+ | Betaler seg fra tredje bruk |
| **F5** Gantt-drag | Høyt | M | Convoy-effekten er et bilde |
| **F4** subnettbygger | Høyt | M | Dekker et reelt eksamenshull |
| **F3** koble kabler | Middels | M | 6.4 er allerede sterk; marginalt påbygg |
| **F8** øvinger inline | Middels | M+ | Stor gevinst, men topic→slug-mappingen er ukjent terreng |

### Hvis jeg hadde én dag

**F2 → F7 → F6 → F1 på to Kurose-seksjoner.**

Begrunnelse: alle fire er S, ingen krever ny mekanikk, og til sammen treffer de
begge fagene med eksamen i november/desember. F7 alene gjør 13 eksisterende
visualiseringer oppdagbare — det er den billigste måten å øke den *faktiske*
interaktiviteten i appen uten å skrive én ny simulator. F6 er dagens enkeltvis
sterkeste pedagogiske treff: Béládys anomali er akkurat den typen påstand som
ikke fester seg før du har gjettet feil på den.

Rekkefølgen er ikke tilfeldig — F2 låser opp F1 og F6.

### Hva jeg ville droppet

**F3 (koble kabler i 6.4).** Det var det opprinnelige forslaget i bestillingen,
og det er det jeg vil argumentere mot. `Section64Live` gjør allerede jobben:
MAC-tabellen fylles, flood og unicast skilles, VLAN dropper. Å legge til
kabeldraging flytter «hvilken port sitter A på» fra en konstant til et brukervalg
— pent, men det er ikke der forståelsen brekker. Samme timer gir mer i F4, der
det ikke finnes noe fra før.

**F8 hvis tiden er knapp.** Riktig på lang sikt, men topic→slug-mappingen er
uspesifisert arbeid av ukjent størrelse rett før fire eksamener. Utsett til etter
14.12.

---

## 5. Hva jeg bevisst ikke foreslår

**Dragbare noder i Kurose-topologiene som mål i seg selv.** Åtte
`Section*Live`-filer har allerede dragbare noder via `useNodesState`. Ingen har
lært noe av det. Å flytte en ruter endrer ikke rutingtabellen. Drag uten
konsekvens i modellen er animasjon, ikke pedagogikk — og det *koster*, fordi det
lærer brukeren at det å dra ting her ikke betyr noe.

**Å merge `feat/xyflow-poc`.** `Section12LiveFlow.tsx` reimplementerer en seksjon
som allerede bruker xyflow i main. To varianter av 1.2 er verre enn én. Slett
branchen.

**Dra-og-slipp SQL-spørringsbygger.** Demoveenlig, pedagogisk tynn. Eksamen og
yrkeslivet krever at man skriver SQL. Å dra `WHERE`-klausuler på plass trener en
ferdighet som ikke overføres, og appen har allerede 320 oppgaver med ekte editor.

**Fysikk- eller kraftbasert grafanimasjon.** Noder som spretter på plass ser bra
ut og formidler ingenting om protokoller.

**Flere flashcards for de fire eksamensfagene.** Det finnes 557 quiz-oppføringer
allerede, og de brukes knapt (§1.3). Distribusjonsproblemet (F8) er reelt;
volumproblemet er det ikke.

**Dra-for-å-sortere på algoritmesider (sortering, big-O).** Å manuelt dra
elementer gjennom en bubble sort føles interaktivt, men brukeren utfører
algoritmen i stedet for å observere dens *kostnad* — som er det big-O handler om.
Eksisterende `BigOVisualizer` med telleverk er riktigere. Dessuten er ingen av
disse eksamensfag i høst.

**Generell «gjør X mer interaktiv».** Alle ti forslagene over navngir en fil, et
konsept og hva musa gjør. Forslag som ikke kan formuleres slik, hører hjemme her.
