# Laboppgaver — sandkasse + måloppgaver som gjennomgående format

Utgangspunktet er `/stack/dte2507-nettverksverktoy`: en etterlignet terminal uten
fasit, og under den elleve oppgaver som spør etter **verdien du fant**, ikke
kommandoen du skrev. Det formatet traff. Dette dokumentet svarer på to ting:

1. *Hvorfor* traff det — hvilke mekanismer som faktisk gjør jobben, slik at vi
   kopierer mekanismen og ikke bare utseendet.
2. *Hvor ellers* det hører hjemme — i Python først, så DTE-2505, DTE-2507,
   DTE-2602 og TEK-1501 — i en rekkefølge som bygger sten på sten.

Formatet er allerede navngitt i [PLAN-HOST26-MODULER.md](PLAN-HOST26-MODULER.md)
§3 som type 2 (guidet simulering) + type 3 (måloppgave med tilstandssjekk).
Nettverkssiden er den første som kjører de to sammen på én side. Det er
kombinasjonen som er oppskriften.

---

## 1. Hva som faktisk gjør jobben

Fem mekanismer, hver med en pedagogisk begrunnelse. Alle fem må være til stede —
fjerner du én, faller formatet ned til «quiz med kodeboks over».

### 1.1 Sandkassen har null prestasjonskrav

Overskriften sier «Prøv deg fram — **ingen fasit**», og teksten sier eksplisitt at
ingenting du skriver der teller. Det er ikke pynt. Utforsking uten poengtelling
senker den delen av arbeidsminnet som ellers går til «hva blir jeg målt på», og
frigjør den til å bygge modellen av systemet. Sandkassen er stedet der du får lov
til å gjøre feil gratis; oppgavene under er stedet der du viser hva du fant.

### 1.2 Oppgaven sjekker en verdi, ikke en streng

`nettverkOppgaver.ts` er nøye på dette: MAC-adresse godtas med kolon eller
bindestrek, store eller små bokstaver, fordi Windows og Unix skriver den ulikt og
begge er riktige — men antall hopp er antall hopp. Effekten er at oppgaven måler
*om du kom fram til svaret*, ikke om du husket syntaksen til ett bestemt verktøy.
Flere veier gir uttelling. Det er også det den ekte laben gjør.

### 1.3 Feilmeldingen sier hva som gikk galt

`Vurdering.tilbakemelding` lar oss svare «nesten — det er gatewayen, ikke maskinen
din» i stedet for «feil». En tilbakemelding som navngir forvekslingen retter
begrepet; en som bare sier feil, får deg til å gjette videre.

### 1.4 Forklaringen kommer *etter* riktig svar

`oppgave.forklaring` vises først når kortet er løst. Da er hullet allerede laget
og fylt, og forklaringen fester seg til noe. Kommer den før, leses den som prosa
og glemmes.

### 1.5 Sandkassen og oppgavene deler tilstand

Alle fem kommandoene leser fra det samme etterlignede nettet, så `ifconfig`,
`traceroute` og `nslookup` er enige med hverandre. Det er dette som gjør at du kan
*trianguere*: se samme adresse fra to kanter og forstå hvorfor den er den samme.
Fem uavhengige mock-utdata ville ikke gitt det.

**Konsekvens for gjenbruk:** det som skal gjenbrukes er ikke terminalen. Det er
paret «delt tilstandsmodell + måloppgaver som leser av tilstanden». Terminalen er
bare ett grensesnitt inn i modellen. Et plott, en debugger-visning, en tabell
eller en Pyodide-REPL er like gyldige grensesnitt.

### 1.6 To ting som mangler på nettverkssiden

Verdt å ta med når formatet skal kopieres:

- **Ingen anslå-før-du-kjører-fase.** Type 1 i §3-tabellen er hoppet over. Ett
  felt («hva tror du gateway-adressen ender på?») før terminalen åpnes ville
  kostet lite og er den billigste enkeltforbedringen som finnes — se §4.1.
- **Ingen kobling til FSRS-køen.** De tre skillene som oppsummeres nederst (MAC
  mot IP, alias mot canonical name, «svarer ikke» mot «er nede») er akkurat det
  som burde ligge som recall-kort i den felles køen. Nå står de bare som en
  avsluttende avsnitt.

---

## 2. Den generiske formen

Før noe bygges: dette er formen alle labene deler.

```
Modell        en ren tilstand + en funksjon som svarer på spørringer mot den
Grensesnitt   terminal | REPL | plott | tabell | steg-for-steg-visning
Anslag        1–3 spørsmål før grensesnittet åpnes (type 1)
Sandkasse     fri bruk av grensesnittet, ingen telling (type 2)
Måloppgaver   N kort: oppdrag → svar → verdisjekk → hint → forklaring (type 3)
Feilsøking    1 avsluttende kort der noe er galt og laget må finnes (type 4)
Recall        2–4 kort til den felles FSRS-køen (type 5)
```

`OppgaveKort` i `NettverksverktoyPage.tsx` er allerede nesten generisk — den
kjenner bare `Oppgave`-grensesnittet og en `sjekk`-funksjon. Når lab nummer to
skal bygges, løftes den til `src/components/lab/MaalOppgaveKort.tsx` sammen med
`Oppgave`/`Vurdering`-typene og normaliseringshjelperne (`rens`, `macRens`,
`somTall`, `eksakt`, `innenfor`). Ikke før — én bruker er ikke et mønster.

---

## 3. Python — hvor formatet hører hjemme

Python er det beste stedet å gå videre, av en grunn de andre faga ikke har:
**Pyodide kjører ekte kode i nettleseren**. Vi trenger ikke etterligne noe. Den
delte tilstanden *er* interpreteren, og det finnes ingen risiko for at
sandkassen og oppgavene er uenige.

Det gjør at Python-labene kan bruke den sterkeste varianten av formatet:
studenten kjører kode, **måler** noe, og oppgaven sjekker målingen.

Kapitlene under er de som finnes i `PYTHON_CHAPTERS`. Rekkefølgen er ikke
tilfeldig — hver lab forutsetter forrige.

### 3.1 Kap. 5 (løkker) — «Tell iterasjonene»

Første lab, og med vilje den enkleste. Sandkassen er en REPL med en teller som
øker for hver gjennomkjøring av løkkekroppen.

| Oppdrag | Svaret er en |
|---|---|
| Hvor mange ganger kjører kroppen i `for i in range(2, 20, 3)`? | teller |
| Hva er `i` etter at løkka er ferdig? | verdi |
| Hvor mange sammenligninger gjør `while` før den stopper? | teller |
| Endre `range` slik at kroppen kjører nøyaktig 7 ganger — hva ble `steg`? | verdi du fant ved å prøve |

Dette er nøyaktig samme grep som nettverkslaben: verktøyet (`range`) er ikke
poenget, tallet du leser av er. Off-by-one blir målbart i stedet for
formaninger.

### 3.2 Kap. 6 (funksjoner) — «Hvem eier variabelen»

Sandkassen er `StepVisualizer` — den finnes allerede (`src/components/python/`).
Den delte tilstanden er kallstakken.

- Hvor mange rammer ligger på stakken når `f` kaller `g` som kaller `h`?
- Hvilken verdi har `x` i den ytterste rammen når den innerste endrer sin egen `x`?
- Hva returnerer funksjonen hvis `return` mangler? (svar: `None` — skriv det du så)
- Hvor mange ganger evalueres default-argumentet `def f(a, liste=[])`? (én gang —
  og det er hele grunnen til fella)

Den siste er en klassisk misoppfatning, og formatet er skreddersydd for den: du
*ser* lista vokse mellom kall.

### 3.3 Kap. 10 + 11 (lister, multidim.) — «Referanse eller kopi»

Sandkassen viser `id()` og en peker-tegning ved siden av verdiene.

- Hva er `id(a)` og `id(b)` etter `b = a`? Like eller ulike?
- Etter `b = a[:]`?
- Hvor mange lister finnes i minnet etter `rad = [0]*3; rutenett = [rad]*3`?
  (svar: 2, ikke 4 — og du kan telle dem i visningen)
- Endre `rutenett[0][0]`. Hvor mange celler endret seg?

Dette er kapittelets vanskeligste idé, og prosa har aldri fungert på den.

### 3.4 Kap. 13 (filer og unntak) — «Hvor lander kontrollen»

Sandkassen er et mock-filsystem (`BashSandbox.tsx` har allerede et — samme
motor kan gjenbrukes) pluss en kjøring som viser hvilken linje som utføres.

- Kjører `finally` når `try` returnerer? (ja — se rekkefølgen)
- Hvilken exception-type kommer når fila mangler? Skriv navnet du fikk.
- Hvor mange linjer leser `readlines()` fra fila med to tomme linjer på slutten?
- Fila er åpnet uten `with` og programmet krasjer. Hva står i fila etterpå?

### 3.5 Kap. 21 (sortering) — «Tell operasjonene»

Sandkassen er en sorteringsvisualisering med tellere for sammenligninger og
bytter. Måloppgavene er rene måletall, og de er den mest overbevisende
introduksjonen til O-notasjon som finnes:

- Hvor mange sammenligninger bruker boblesortering på 8 elementer i verste fall?
- På allerede sortert liste?
- Hvor mange på 16? (og se at det firedobles, ikke dobles)
- Hvor mange bytter gjør utvalgssortering på 10 elementer, uansett rekkefølge?

Her er koblingen til `big-o`-modulen åpenbar, og den går riktig vei: tallet
først, formelen etterpå.

### 3.6 Kap. 24 (hashing) — «Kollisjonene»

- Hvor mange kollisjoner med 10 nøkler i en tabell med 8 plasser?
- Hvor lang blir den lengste kjeden?
- Endre tabellstørrelsen til 11 (primtall) — hva ble lengste kjede nå?
- Ved hvilken belastningsfaktor doblet oppslagstiden seg?

### 3.7 Kap. 25/26 (grafer) — «Rekkefølgen besøkene skjer i»

- I hvilken rekkefølge besøker DFS nodene fra A?
- Hvor mange noder ligger i køen på det meste under BFS?
- Hvilken kant velger Dijkstra i steg 3?
- Hva blir korteste avstand til G — og hvilken kant var det som avgjorde?

Sandkassen finnes delvis i `dijkstra-viz`. Det som mangler er måloppgavene ved
siden av.

**Python-rekkefølge:** 5 → 6 → 10/11 → 13 → 21 → 24 → 25/26. De tre første er
språkets kjerne og bør bygges først; de fire siste er algoritmedelen og kan
vente til programmeringsfaget krever dem.

---

## 4. De andre faga

### 4.1 DTE-2507 — utvid den laben som allerede finnes

Billigst mulig gevinst, samme side:

- **Anslagsfelt før terminalen.** Tre spørsmål: «Vil din egen adresse og
  gatewayens ligge i samme adresseområde?», «Vil `traceroute` til en maskin på
  eget nett gi flere enn ett hopp?», «Vil en maskin som ikke svarer på ping
  nødvendigvis være nede?». Ingen fasit-sjekk før du har kjørt — bare et lagret
  anslag som vises igjen ved siden av svaret. Kontrasten er hele poenget.
- **Ett feilsøkingskort til slutt** (type 4): «Siden laster i nettleseren, men
  `curl` feiler.» Nevnt i §3.2 i modulplanen, ikke bygget.
- **Recall-kort til FSRS-køen** for de tre skillene i oppsummeringen.

Videre labber i samme fag, med samme motor:

| Lab | Delt tilstand | Måloppgavene spør etter |
|---|---|---|
| Subnetting | et adresseområde + maske | nettadresse, kringkastingsadresse, antall verter, om to adresser er på samme nett |
| Pakkeleser (`/dte2507/pcap` finnes) | en fanget strøm | portnummer, flagg i håndtrykket, sekvensnummer, hvilket lag et felt hører til |
| TLS-kjeden | en sertifikatkjede | utsteder, hvem som signerte hva, hvilket ledd som er brutt |

### 4.2 DTE-2505 — den delte tilstandsmaskinen er allerede planlagt

§3.1 i modulplanen sier det rett ut: `BashSandbox.tsx` sitt mock-filsystem skal
utvides til en delt tilstandsmaskin (filer, eiere, rettighetsbits, prosesser) som
alle Linux-moduler bruker. Det er nøyaktig samme arkitektur som `nettverkKommandoer.ts`,
bare med en større tilstand. Når den finnes, faller labene ut av den:

| Modul | Måloppgavene spør etter |
|---|---|
| 2 (hjelpesystemer) — **hull, frist 11.09** | hvilken seksjon `man` fant sida i, hvilket flagg som gjør X, hva `apropos` svarer på et stikkord |
| 4 (filsystem, omdirigering) | hvor mange linjer som havnet i fila, hva som skjedde med `stderr`, hvilken fil som ble overskrevet |
| 5 (rettigheter) | de oktale bitene etter en operasjon, hvem som kan lese fila, hvorfor `chmod` ikke hjalp (eieren er feil) |
| 3 (prosesser) | PID-en til forelderen, hvilket signal som drepte den, hvor mange prosesser som overlevde utlogging |

Modul 2 er både et rent hull og har nærmeste frist — den er den naturlige
piloten.

### 4.3 DTE-2602 — måloppgaven er en målt metrikk

Her er den delte tilstanden en liten datasett + en modell, og «verdien du fant»
er en metrikk. Det treffer mappeleveransen direkte:

- Hva ble nøyaktigheten på testsettet? Og på treningssettet? (og hvorfor er de ulike)
- Ved hvilken `k` slutter valideringsfeilen å synke?
- Hvor mange trær før forbedringen er under ett prosentpoeng?
- Modellen har 99 % treningsnøyaktighet og 61 % testnøyaktighet. Hva er navnet på
  det, og hvilken knapp fikser det?

Toleranse i stedet for eksakt likhet, slik §3.1 krever. Det siste kortet er
allerede en type 4-oppgave.

### 4.4 TEK-1501 — verdien er et tall med toleranse

Sandkassen er en fordelings-/simuleringsvisning, måloppgavene er utregninger:

- Hvor mange av 1000 simulerte utvalg havnet utenfor konfidensintervallet?
  (og forstå at ~50 er poenget, ikke en feil)
- Hva ble p-verdien? Hvilken testtype valgte du?
- Hvor stort må utvalget være før intervallet er smalere enn 2?
- Du fikk p = 0,04. Hva er sannsynligheten for at nullhypotesen er sann?
  (fellespørsmål med vilje — tilbakemeldingen retter misoppfatningen)

§3.1 sier at sjekken her er **numerisk svar innenfor toleranse + valgt metode**.
Det betyr to felter på kortet, ikke ett: metode og tall. Riktig metode med feil
tredje desimal skal få vite akkurat det.

---

## 5. Sten på sten — hva som må komme før hva

Progresjonsregelen i repoet er at ingen modul bruker et begrep den ikke har
introdusert. For labene betyr det tre kjeder som ikke må brytes:

**Python:** iterasjonstelling (kap. 5) → kallstakk (kap. 6) → referanse mot kopi
(kap. 10/11) → unntaksflyt (kap. 13) → operasjonstelling (kap. 21) → belastning
og kollisjon (kap. 24) → besøksrekkefølge (kap. 25/26). Å telle operasjoner i
sortering forutsetter at du allerede har telt iterasjoner i en løkke.

**Linux:** filsystemtilstand → omdirigering → rettighetsbits → prosesser. Du kan
ikke spørre «hvem kan lese fila» før fila og eieren finnes i modellen.

**Nettverk:** adresser på hvert lag (finnes: `dte2507-lag`) → verktøyene som leser
dem av (finnes: denne laben) → subnetting → pakkeleser → TLS. Hver av dem leser
av et lag som allerede er innført.

Og på tvers: **anslag før forklaring, forklaring etter riktig svar, recall-kort
til én felles kø.** Den siste er den som avgjør om noe av dette står igjen i
desember.

---

## 6. Hva forskningen sier — og hvor det treffer koden

Formatet er ikke oppfunnet her. Det er en sammensetning av effekter som er godt
dokumentert hver for seg. De under er sortert etter hvor mye de er verdt i dette
repoet, ikke alfabetisk.

### 6.1 Anslå–observer–forklar (POE)

Studenten skriver ned et anslag *før* systemet kjøres, ser hva som skjedde, og
forklarer avviket. Mekanismen er at et anslag skaper en forventning som enten
bekreftes eller brytes — og et brudd er det som gjør at en misoppfatning
faktisk lar seg rette. Uten anslag går observasjonen inn som «jaha», og den gamle
modellen står urørt.

*I koden:* et `anslag`-felt på lab-siden, lagret lokalt, vist ved siden av det
faktiske svaret når oppgaven løses. Dette er den manglende type 1 fra §1.6, og
det er den enkleste tingen på hele lista å bygge.

### 6.2 PRIMM — Predict, Run, Investigate, Modify, Make

Utviklet for programmeringsundervisning, og strukturen er nesten identisk med
lab-formatet vårt: du **forutsier** hva koden gjør, **kjører** den, **undersøker**
hvorfor, **endrer** den for å teste en hypotese, og **lager** til slutt noe eget.
Poenget er at man leser og forutsier før man skriver — nybegynnere som skriver
først, bygger modellen sin på egne feil.

*I koden:* Python-labene i §3 dekker P–R–I. **M-ene mangler.** Hvert Python-kapittel
bør avslutte med ett *modifiser*-kort («endre `range` så kroppen kjører 7 ganger»)
og ett *lag*-kort som går til IDE-visningen. Modifiser-kortene er lette: de er
måloppgaver der svaret er verdien du måtte finne for å nå målet.

### 6.3 Produktiv fiasko

Å bryne seg på et problem *før* undervisningen — og mislykkes — gir bedre
overføring enn å få forklaringen først, forutsatt at forklaringen faktisk kommer
etterpå og bygger på forsøkene. Sandkassen uten fasit er nettopp en beskyttet
arena for å mislykkes.

*I koden:* rekkefølgen sandkasse → oppgave → forklaring er allerede riktig. Det
som kan styrkes er at forklaringen **navngir det studenten sannsynligvis prøvde
først**: «Kjørte du `ping` og fikk ingenting? Det er nettopp det som ikke betyr
nede.»

### 6.4 Testeffekten og spredt repetisjon

Å hente fram noe fra hukommelsen styrker det mer enn å lese det på nytt, og
effekten øker når gjenhentingene er spredt i tid. Dette er allerede erkjent i
`fsrs.ts` og i §3.4 («ikke la modul 1 råtne»).

*I koden:* hver lab må avslutte med å legge 2–4 kort i **den felles køen**. Ingen
lab er ferdig før den gjør det. Nettverkslaben gjør det ikke i dag.

### 6.5 Utdypende spørsmål og selvforklaring

Å svare på «hvorfor er dette slik?» underveis gir dypere forståelse enn å lese
den samme forklaringen ferdigskrevet. Forklaringen som vises etter riktig svar er
halvveis der — den er ferdigskrevet.

*I koden:* et valgfritt «hvorfor tror du det ble slik?»-felt før forklaringen
vises, uten sjekk. Fri tekst, ikke vurdert, bare tvinger frem formuleringen.
Billig, og den delen av effekten som ikke krever retting.

### 6.6 Delmålsmerking (subgoal labeling)

Å dele en prosedyre i navngitte delmål — i stedet for én lang oppskrift — gir
målbart bedre overføring til nye oppgaver i programmering. Grunnen er at navnet
gir studenten en krok å henge det generelle prinsippet på, i stedet for de
konkrete stegene.

*I koden:* måloppgavene har allerede korte titler («Kortet som ikke er i bruk»,
«Veien ut»), og det er nettopp delmålsmerker. Det bør bli et bevisst krav i
oppgavemalen: **tittelen navngir delmålet, ikke verktøyet.** Verktøyet står i
merkelappen til høyre.

### 6.7 Ferdig eksempel → utfasing → egen løsning

Nybegynnere lærer mer av å studere ferdige eksempler enn av å løse tilsvarende
oppgaver fra bunnen — men effekten snur når kunnskapen vokser. Løsningen er å fase
ut støtten gradvis: helt løst eksempel → eksempel med ett hull → oppgave.

*I koden:* dette er allerede rett i «drill: lær først, prøv selv»-mønsteret. For
labene betyr det at **første** måloppgave i hver lab bør være halvt utfylt: svaret
står, og oppdraget er å finne det i utdataen og bekrefte det. Så trekkes stigen.

### 6.8 Vekslende oppgavetyper (interleaving)

Blokkstruktur («ti subnetting-oppgaver etter hverandre») føles lettere og gir
dårligere overføring enn blandet rekkefølge, fordi blokken lar deg gjenbruke
metoden uten å velge den. Det å *velge metode* er halve ferdigheten på eksamen.

*I koden:* konsekvensen er ikke å blande labene — hver lab er ett tema med vilje —
men å ha **integrasjonsoppgaver** som ikke røper hvilken modul de hører til. Det
er §3.2, og det er fortsatt ubygget i alle fire fag.

### 6.9 Program-forståelse før program-skriving

Studenter som ikke klarer å forklare hva en kort kodesnutt gjør i vanlig språk,
klarer heller ikke å skrive tilsvarende kode. Sporingsferdighet og forklarings-
ferdighet kommer før skriveferdighet.

*I koden:* Python-labene i §3 er nettopp sporingsoppgaver, og de bør derfor ligge
**før** kapittelets skriveoppgaver i rekkefølgen, ikke etter dem som ekstra.

### 6.10 Mestringsbasert progresjon

Å kreve et faktisk kriterium før neste steg — i stedet for å gå videre etter tid —
løfter resultatene betydelig, forutsatt at forsøkene er ubegrensede og
tilbakemeldingen kommer med én gang.

*I koden:* laben har allerede telleren `x / 11` og krever alle før
oppsummeringen vises. Det som mangler er at **tellingen overlever
sideoppdatering** — nå er `lost` ren `useState`. Framgang per lab bør inn i
`progress`-laget, som resten av appen bruker.

---

## 7. Byggerekkefølge

Sortert etter verdi delt på arbeid.

1. **Anslagsfelt + lagret framgang + FSRS-kort på nettverkslaben.** Samme fil,
   ingen ny arkitektur, fullfører formatet der det allerede står. (§4.1, §6.1,
   §6.4, §6.10)
2. **Python kap. 5 — «Tell iterasjonene».** Første lab utenfor nettverk, og den
   enkleste å bygge fordi Pyodide allerede kjører. Beviser at formatet bærer i et
   annet fag. (§3.1)
3. **Løft `OppgaveKort` til `src/components/lab/`** når lab to er ferdig — da
   finnes to brukere og formen er kjent. Ta med `Oppgave`, `Vurdering` og
   normaliseringshjelperne.
4. **DTE-2505 modul 2 (hjelpesystemer).** Rent hull, nærmeste frist, og den som
   tvinger fram den delte Linux-tilstandsmaskinen §3.1 uansett krever. (§4.2)
5. **Python kap. 6 og 10/11.** De to vanskeligste ideene i språket, og de som har
   dårligst uttelling i prosaform. (§3.2, §3.3)
6. **TEK-1501 og DTE-2602** — begge trenger to-felts-kortet (metode + tall med
   toleranse), så de bør bygges etter hverandre, ikke spredt. (§4.3, §4.4)
7. **Integrasjonsoppgavene** (§3.2 i modulplanen) — sist, fordi de forutsetter at
   modulene de kobler sammen finnes.

Krav som gjelder alle nye labber, uten unntak: anslag før sandkassen, verdisjekk
med toleranse, tilbakemelding som navngir feilen, forklaring etter riktig svar,
tittel som navngir delmålet, framgang som overlever oppdatering, og kort i den
felles FSRS-køen før laben regnes som ferdig.
