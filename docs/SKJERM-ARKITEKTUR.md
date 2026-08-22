# Skjerm-arkitektur og designvalg

Mål: plattformen skal føles som en app på telefon — én skjerm om gangen, ikke
en lang side man blar i — og samtidig kunne vokse med nye fag, emner og
undertemaer uten at noen ruter eller navigasjon må skrives om.

Dette dokumentet er både arkitekturbeskrivelse og designbeslutninger. Hver
beslutning står med begrunnelse, fordi det er begrunnelsen som gjør at neste
person kan avvike bevisst i stedet for tilfeldig.

---

## 1. Innholdstaksonomi

```
Fag          DTE-2505 Operativsystemer
 └ Emne        «Minnehåndtering»            ← det du planlegger etter
    └ Undertema  «Sidetabeller og TLB»        ← én sitting, 10-20 min
       └ Skjerm    én idé / én simulator      ← det du ser akkurat nå
```

Fire nivåer, ikke tre og ikke fem. Begrunnelsen for hvert nivå:

| Nivå | Hva det svarer på | Hvorfor eget nivå |
|------|-------------------|-------------------|
| **Fag** | «Hvilket emne skal jeg opp i?» | Følger studieplanen og eksamensdatoene. |
| **Emne** | «Hva jobber jeg med denne uka?» | Det studenten planlegger etter. Har et *spørsmål* knyttet til seg, ikke bare en tittel. |
| **Undertema** | «Hva rekker jeg nå?» | Enheten som faktisk fullføres i én sitting. Mestring måles her. |
| **Skjerm** | «Hva ser jeg nå?» | Enheten fremdrift måles i, og enheten som må passe på en telefon. |

Uten Undertema-nivået blir emnene enten uoverkommelige (45 min uten naturlig
stopp) eller så finkornede at emnelisten blir 60 rader lang.

Typene ligger i `src/lib/kurs/types.ts`. Et nytt fag er én fil under
`src/lib/kurs/fag/` som eksporteres fra `fag/index.ts` — ingen ruter, ingen
navigasjon og ingen fremdriftskode trenger å endres.

### Skjermtyper

| Type | Rolle | Regel |
|------|-------|-------|
| `intro` | Setter spørsmålet emnet svarer på | Aldri fakta før motivasjon |
| `konsept` | Én idé forklart | Må få plass uten scroll — ellers er det to skjermer |
| `visual` | Interaktiv simulator/modell | Hovedformen. Studenten fikler, plattformen forklarer |
| `anslag` | Gjett før fasit | Låser «Neste» til et anslag er gitt |
| `sjekk` | Sjekkspørsmål | Låser «Neste» til et forsøk er gjort |
| `kode` | Kjør/les kode | Editor og utdata på samme skjerm |
| `oppsummering` | Hva du sitter igjen med | Først her legges recall-kort i køen |

Rekkefølgen `anslag → visual → forklaring → sjekk` er standardmønsteret. Recall
(flashcards) er alltid utgangen av et undertema, aldri inngangen.

---

## 2. Navigasjonsmodell

### Bunn-tabbar med drill-down (mobil)

Fire faste destinasjoner nederst: **Fag · Øv · Bibliotek · Du**. Innhold åpnes
som en stack man går inn i og tilbake fra.

- **Hvorfor fire?** På 360px bredde gir fem tabs under 44px treffflate per tab
  og etiketter som må forkortes til noe uleselig. Fire er taket.
- **Hvorfor bunn og ikke topp?** Tommelen når bunnen av en 6"-skjerm; toppen
  krever at man flytter grepet.
- **Hvorfor ikke hamburger?** Hamburgeren hadde nøyaktig de samme fire lenkene.
  To navigasjoner med samme innhold tvinger brukeren til å velge hvilken som
  gjelder. Hamburgeren er derfor fjernet, ikke forbedret.
- Fra `md` og opp forsvinner tabbaren og header-navigasjonen tar over. Aldri
  begge samtidig.

### Fullskjerm-spilleren

`/kurs/<fag>/<undertema>` eier hele viewporten: ingen tabbar, ingen header.
Begrunnelse: en tabbar under en pågående økt stjeler både plass og
oppmerksomhet, og frister til å hoppe ut midt i noe.

Utgang skjer via ett tydelig kryss øverst til venstre — samme sted som i alle
andre apper som spiller av en økt.

### Sidemenyer

Sidemeny brukes **kun** til emne-treet inne i et fag, og kun fra `md` og opp.
På mobil er emne-treet selve siden (`/kurs/<fag>`), ikke en skuff. En skuff som
inneholder det man allerede står på, er bare et ekstra klikk.

---

## 3. Designbeslutninger

### Treffflater

Alt som kan trykkes er minst **44×44px**, og primærknapper i spilleren er
**48px høye**. Ikonknapper i header er 44px selv om ikonet er 20px — flaten er
usynlig, men fingeren merker den.

Hele rader er trykkbare der de representerer ett valg (undertema-rader), i
stedet for en liten «start»-lenke til høyre.

### Knapper — hierarki

| Nivå | Utseende | Brukes til |
|------|----------|------------|
| Primær | Fylt `bg-brand`, 48px, full bredde i spilleren | Det åpenbare neste steget. Én per skjerm. |
| Sekundær | Kantlinje, kvadratisk 48px | Tilbake, avbryt |
| Låst | `bg-muted`, teksten sier hvorfor («Svar først») | Aldri en grå knapp uten forklaring |
| Tekstlenke | Understreket i brødtekst | Referanser, aldri hovedhandlingen |

En låst knapp forteller alltid hva som mangler. En deaktivert knapp uten
forklaring er den vanligste kilden til at folk tror appen henger.

### Framdrift

Segmentert linje (ett segment per skjerm) framfor prosentbar: den viser *hvor
mange steg* som gjenstår, ikke bare en andel. Over 20 skjermer faller vi
tilbake til én bar, siden segmentene da blir tynnere enn en piksel.

Fremdrift lagres som **settet av sette skjermer**, ikke som en prosent. Da blir
ikke gammel fremdrift feil når et undertema utvides med nye skjermer.

### Layout og lesbarhet

- Spilleren er låst til `100dvh` (dynamic viewport height) — krymper riktig når
  mobilnettleseren viser adresselinja.
- Kun skjermflaten i midten kan scrolle. Ytre layout scroller aldri.
- Tekstbredde kappet på `44rem`. På tablet i landskap blir en full-bredde
  tekstlinje over 90 tegn og dermed uleselig.
- `env(safe-area-inset-*)` respekteres i topp og bunn, så knapper ikke havner
  under hjemme-indikatoren på iPhone.

### Farge

Kun eksisterende semantiske tokens (`brand`, `success`, `muted`, `border` …)
fra `src/styles.css`. Ingen skjerm definerer egne hex-verdier — det er det som
gjør at mørk modus fortsetter å virke uten at hver skjerm testes.

---

## 4. Slik legger du til et nytt fag

1. Lag `src/lib/kurs/fag/<slug>.tsx` med et `Fag`-objekt.
2. Eksportér det fra `src/lib/kurs/fag/index.ts`.
3. Ferdig — `/kurs/<slug>` finnes, fremdrift virker, søk og navigasjon plukker
   det opp.

`/kurs/demo` er en kjørende referanse-implementasjon av kontrakten
(`src/lib/kurs/demoFag.tsx`) — les den før du skriver ditt første fag.

---

## 5. Migrering av de 191 eksisterende sidene

Sidene rives ikke. Rekkefølgen er:

1. **Nytt innhold skrives i skjerm-format fra dag én.**
2. **Flaggskipsfaget (DTE-2505)** bygges helt i formatet og blir malen andre
   fag kopierer.
3. **Eksisterende sider migreres per emne**, ikke per side: en `<Section>` blir
   som regel én skjerm, og en eksisterende visualisering kan wrappes direkte
   som en `visual`-skjerm.
4. Sider som ennå ikke er migrert, fungerer som før — de er bare lange sider,
   og bunn-tabbaren gjelder også for dem.
