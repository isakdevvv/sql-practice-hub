# Atom-dekomposisjon — TEK-1501 Sannsynlighet og statistikk for ingeniører

**5 stp · Eksamen 14.12.2026 (3t skriftlig)**

Lest fra `src/routes/index.tsx` og `src/components/stack/tek-1501/Tek1501Hub.tsx`. 12 stack-leksjoner + interaktive komponenter (`BootstrapResamplingSim`, `PowerCurve`, `Type1Type2ErrorAreas`, `QqPlotInteractive`, `ProporsjonsCalculator`, `AnovaCalculator`). Pedagogisk progresjon: "data → modell → inferens".

## Spor A: Data (Modul 1)

**A1 — Utvalg vs. populasjon**
- Hva: Utvalg = observert endelig data; populasjon = det ukjente sanne universet.
- Forutsetter: ingen
- Demo: dra-bar populasjons-fordeling der studenten trekker n-stk og ser hvordan utvalget aldri er identisk med populasjonen.
- Drill: flashcard — "Er σ et utvalgs- eller populasjonstall?" + 10 ja/nei-symboler.
- Status: **delvis** — vokabular i `tek1-statistisk-analyse`, ikke eget stoppested.

**A2 — Sentralmål: mean, median, modus**
- Hva: Tre svar på "hvor ligger dataene typisk", divergerer ved skjevhet.
- Forutsetter: A1
- Demo: dra-punkter på tallinje, mean/median/modus oppdateres live; én outlier drar mean men ikke median.
- Drill: kort der studenten velger riktig sentralmål for inntekt, skostørrelse, husleier.
- Status: **dekket** — `tek1-deskriptiv/Tek1DeskriptivPage.tsx` §2.

**A3 — Kvartiler og persentiler**
- Hva: Posisjonsmål som deler sortert data i prosentvise bolker.
- Forutsetter: A2
- Demo: sortert prikkrekke med dra-bar Q1/Q2/Q3-skille.
- Drill: 5-tallsoppsummering av en gitt vektor, regnet for hånd.
- Status: **dekket** — `tek1-deskriptiv` §3.

**A4 — Spredning: varians, std, IQR**
- Hva: Tall som måler hvor mye observasjonene spriker rundt sentrum.
- Forutsetter: A2
- Demo: to histogram med samme mean men forskjellig std; slider justerer std.
- Drill: regn s² for hånd for {2, 4, 4, 4, 5, 5, 7, 9} — fasit 4.
- Status: **dekket** — `tek1-deskriptiv` §4.

**A5 — n vs. n−1 (stikkprøve-varians)**
- Hva: Vi deler på n−1 fordi vi "brukte" én frihetsgrad på å estimere x̄.
- Forutsetter: A4, A1
- Demo: 1000 simulerte utvalg fra kjent populasjon — vis at n-versjonen systematisk undervurderer σ².
- Drill: "ddof=?" for `np.var` vs `np.std` i TEK-1501-kontekst (alltid 1).
- Status: **dekket** — `tek1-deskriptiv` linje 193 + 327.

**A6 — Visualisering: histogram, boksplott, scatter**
- Hva: Tre standard-plot for å se form, outliere, og to-variabel-relasjon før formler.
- Forutsetter: A3, A4
- Demo: samme datasett vist i alle tre plot; toggle bin-bredde.
- Drill: match plot → datasett.
- Status: **dekket** — `tek1-deskriptiv` §5.

## Spor B: Sannsynlighet (Modul 2)

**B1 — Utfallsrom og hendelser**
- Hva: Ω er mengden av alle mulige utfall; en hendelse er en delmengde.
- Forutsetter: A1
- Demo: dra-bar Venn-diagram der man markerer A, B, A∩B, A∪B, Aᶜ på interaktivt Ω.
- Drill: gitt Ω = terningkast, skriv hendelsen "partall OG minst 4" som mengde.
- Status: **dekket** — `tek1-sannsynlighet` §2.

**B2 — Kolmogorovs aksiomer**
- Hva: Tre regler (0≤P≤1, P(Ω)=1, disjunkt-addisjon).
- Forutsetter: B1
- Demo: kalkulator som flagger brudd på aksiomer ved vilkårlige P(A), P(B), P(A∩B).
- Drill: 6 påstander — gyldig / ugyldig.
- Status: **dekket** — `tek1-sannsynlighet` §3.

**B3 — Komplement og union (P(A∪B) = P(A)+P(B)−P(A∩B))**
- Hva: Korreksjonsregel for at vi ikke skal telle snittet to ganger.
- Forutsetter: B2
- Demo: Venn-diagram med dra-bare arealer.
- Drill: "P(A)=0.6, P(B)=0.4, P(A∪B)=0.8. Finn P(A∩B)" — fasit 0.2.
- Status: **dekket** — `tek1-sannsynlighet` §3.

**B4 — Betinget sannsynlighet P(A|B)**
- Hva: Sannsynlighet for A når vi vet at B inntraff — vi reduserer utfallsrommet til B.
- Forutsetter: B3
- Demo: 2×2-rutenett (sykdom × test) som skrumper utfallsrommet ved kolonne-klikk.
- Drill: 10 oppgaver der studenten må identifisere hva som er betinget og hva som er marginalt.
- Status: **dekket** — `tek1-sannsynlighet` §4.

**B5 — Uavhengighet**
- Hva: A og B er uavhengige hvis P(A∩B) = P(A)·P(B).
- Forutsetter: B4
- Demo: trekk-med-tilbakelegging vs. uten — 1000 trekninger.
- Drill: kort med ja/nei på uavhengighet uten å regne.
- Status: **dekket** — `tek1-sannsynlighet` §4.

**B6 — Bayes' teorem**
- Hva: P(A|B) = P(B|A)·P(A) / P(B), brukt når årsaks-retningen er omvendt av spørsmålet.
- Forutsetter: B4
- Demo: medisinsk-test-tre med slidere for prevalens, sensitivitet, spesifisitet — vis hvordan PPV kollapser ved lav prevalens.
- Drill: 5 "hva sa du nå?"-spørsmål der studenten skriver opp Bayes for hånd.
- Status: **dekket** — `tek1-sannsynlighet` §5 + drag + python-exercise "Bayes manuelt".

**B7 — Tellingens grunnregel og permutasjoner**
- Hva: Antall måter å arrangere k av n når rekkefølge teller: n!/(n−k)!.
- Forutsetter: B1
- Demo: tre-diagram for små n,k som ekspanderer/krymper interaktivt.
- Drill: "Hvor mange ulike PIN-koder med 4 ulike sifre?".
- Status: **dekket** — `tek1-kombinatorikk/Tek1KombinatorikkPage.tsx`.

**B8 — Kombinasjoner C(n,k)**
- Hva: Antall måter å velge k av n når rekkefølge IKKE teller: n!/(k!·(n−k)!).
- Forutsetter: B7
- Demo: side-om-side teller for permutasjon vs. kombinasjon; slider for k.
- Drill: Lotto 7-av-34 — regn nøyaktig antall mulige rekker.
- Status: **dekket** — `tek1-kombinatorikk` + python-øvelse "Lotto".

**B9 — Trekning med vs. uten tilbakelegging**
- Hva: Med tilbakelegging → binomisk; uten → hypergeometrisk.
- Forutsetter: B5, B8
- Demo: animert urne der man toggler tilbakelegging.
- Drill: scenarie-quiz "hvilken modell?" — 10 beskrivelser.
- Status: **dekket** — `tek1-sannsynlighet` §7 + `tek1-kombinatorikk` trekksim.

## Spor C: Stokastiske variabler og fordelinger (Modul 3)

**C1 — Stokastisk variabel (diskret vs. kontinuerlig)**
- Hva: En funksjon X: Ω → ℝ som tilordner et tall til hvert utfall.
- Forutsetter: B1
- Demo: terning-eksempel der ω = "fire" og X(ω) = 4; toggle diskret vs. kontinuerlig.
- Drill: 12 scenarier, klassifisér som diskret eller kontinuerlig.
- Status: **delvis** — vokabular i `tek1-fordelinger`, ikke som eget atom.

**C2 — PMF og CDF (diskret)**
- Hva: PMF gir P(X=x); CDF kumulerer: F(x)=P(X≤x).
- Forutsetter: C1
- Demo: bar-chart for PMF + trapp-graf for CDF; klikk på bar fremhever bidrag i CDF.
- Drill: gitt PMF-tabell, beregn P(X≥3) og P(2≤X<5).
- Status: **dekket** — `tek1-diskrete-fordelinger`.

**C3 — PDF og CDF (kontinuerlig)**
- Hva: PDF er tetthet (ikke sannsynlighet), CDF er areal under PDF opp til x.
- Forutsetter: C1
- Demo: skravert areal under PDF (interaktiv øvre/nedre grense) med live P(a<X<b).
- Drill: kort som tvinger studenten å si "PDF i et punkt er IKKE en sannsynlighet".
- Status: **dekket** — `tek1-kontinuerlige-fordelinger`.

**C4 — Forventning E[X]**
- Hva: Tyngdepunktet av fordelingen; lang-tids-snittet.
- Forutsetter: C2 eller C3
- Demo: "balanser PMF-en på en finger" — visuell tyngdepunkt-indikator.
- Drill: regn E[X] for fair terning (3.5) og for X=antall kron av 4 myntkast (2).
- Status: **dekket** — `tek1-forventning-clt`.

**C5 — Varians og standardavvik for X**
- Hva: Var(X) = E[(X−μ)²] måler middelkvadrert avvik fra forventningen.
- Forutsetter: C4
- Demo: to fordelinger med samme E[X] men ulik Var.
- Drill: bruk Var(X) = E[X²] − (E[X])² på et lite case.
- Status: **dekket** — `tek1-forventning-clt` + flashcards.

**C6 — Bernoulli og binomisk fordeling**
- Hva: Antall suksesser i n uavhengige forsøk med suksess-sannsynlighet p.
- Forutsetter: B5, C2
- Demo: simulator som kaster n mynter med justerbar p og bygger histogram konvergerende mot binomisk PMF.
- Drill: "n=20, p=0.1, P(X=2)" — flashcard med scipy-svar.
- Status: **dekket** — `tek1-diskrete-fordelinger`.

**C7 — Hypergeometrisk fordeling**
- Hva: Som binomisk, men uten tilbakelegging.
- Forutsetter: B9, C6
- Demo: side-om-side binomisk vs. hypergeometrisk med samme N,K,n.
- Drill: kvalitetskontroll-scenario med eksplisitt populasjons-størrelse.
- Status: **dekket** — `tek1-diskrete-fordelinger`.

**C8 — Poisson-fordeling**
- Hva: Antall hendelser i et fast intervall når hendelser skjer uavhengig med konstant rate λ.
- Forutsetter: C6
- Demo: kø-simulator (kunder pr. time) med justerbar λ.
- Drill: 3 scenarier (samtaler, klikk, defekter) der studenten skal identifisere riktig λ.
- Status: **dekket** — `tek1-diskrete-fordelinger`.

**C9 — Uniform og eksponential**
- Hva: Uniform: alle verdier i [a,b] like sannsynlige. Eksponential: ventetid til neste Poisson-hendelse.
- Forutsetter: C3, C8
- Demo: rektangulær PDF + avtagende PDF med skravert areal-kalkulator.
- Drill: regn P(X>5) for Exp(λ=0.2).
- Status: **dekket** — `tek1-kontinuerlige-fordelinger`.

**C10 — Normalfordelingen N(μ,σ²)**
- Hva: Klokkeformet fordeling som alt konvergerer mot via CLT.
- Forutsetter: C3, C5
- Demo: PDF med slider for μ og σ; klikk for å skravere "halen".
- Drill: standardiser X til Z og slå opp i tabell — 8 kort.
- Status: **dekket** — `tek1-kontinuerlige-fordelinger`.

**C11 — Standardnormal Z og z-tabell**
- Hva: Z = (X−μ)/σ gjør enhver normal om til N(0,1).
- Forutsetter: C10
- Demo: dra-bar X på N(μ,σ) som speiles til Z på N(0,1).
- Drill: 10 oppslag i z-tabell mot tidsur.
- Status: **dekket**.

**C12 — Sentralgrenseteoremet (CLT)**
- Hva: Snittet X̄ av n uavhengige observasjoner er omtrent N(μ, σ²/n) når n er stor.
- Forutsetter: C4, C5, C10
- Demo: trekk fra skjev fordeling, plot snitt for n=5/10/30/100.
- Drill: "Hva er fordelingen til X̄ når n=64, μ=50, σ=8?".
- Status: **dekket** — `tek1-forventning-clt` har levende simulator.

**C13 — Student-t og kji-kvadrat**
- Hva: t har tyngre haler enn z (kompenserer for ukjent σ); χ² beskriver Σ Z².
- Forutsetter: C11, A5
- Demo: overlay z, t(df=5), t(df=30) — slider for df viser konvergens mot z.
- Drill: matche bruksområde (t-test mean, χ² varians, χ² uavhengighet) til riktig fordeling.
- Status: **dekket** — `tek1-kontinuerlige-fordelinger`.

## Spor D: Inferens (Modul 4)

**D1 — Estimator vs. estimat**
- Hva: Estimator er en formel (tilfeldig variabel); estimat er ett konkret tall.
- Forutsetter: A1, C4
- Demo: 100 simulerte utvalg → 100 forskjellige estimater.
- Drill: kort med 6 symboler — "estimator eller estimat?".
- Status: **dekket** — `tek1-estimering-ki`.

**D2 — Standardfeil (SE)**
- Hva: Standardavviket til estimatoren.
- Forutsetter: D1, C12
- Demo: side-om-side fordeling for X vs. X̄ — visuell sammenligning av σ og σ/√n.
- Drill: "n firedobler — hva skjer med SE?" (halveres).
- Status: **delvis** — omtalt i `tek1-statistisk-analyse` §2, ikke eget visuelt atom.

**D3 — Konfidensintervall for μ (z og t)**
- Hva: Et intervall der 95 % av slike intervaller inneholder sanne μ ved gjentatt prøvetrekning.
- Forutsetter: D2, C11, C13
- Demo: 100-utvalg-simulator som tegner 100 CIer og markerer hvor mange som bommer.
- Drill: bygg CI for hånd med (x̄, s, n).
- Status: **dekket** — `tek1-estimering-ki` + `tek1-statistisk-analyse` §2.

**D4 — Tolkningsfellen for CI**
- Hva: CI sier IKKE "95 % sannsynlighet for at μ er i intervallet".
- Forutsetter: D3
- Demo: kontrast frequentist vs. (uakseptabel) bayesisk tolkning side-om-side.
- Drill: 6 tolknings-påstander — ekte / falsk.
- Status: **delvis** — nevnt som eksamen-felle, ingen interaktiv kontrast-komponent.

**D5 — Hypotesestrukturen (H0, H1, α)**
- Hva: Anta H0, regn ut hvor uvanlig data ville være under H0, og forkast hvis under terskel α.
- Forutsetter: D2
- Demo: maler-velger der studenten skriver H0/H1 først naturlig, så symbolsk.
- Drill: 10 scenarier — formulér H0 og H1.
- Status: **dekket** — `tek1-hypotesetest-regresjon`.

**D6 — Testobservator og p-verdi**
- Hva: Testobservator = standardisert avstand fra H0; p-verdi = P(data minst så ekstrem | H0).
- Forutsetter: D5, C11
- Demo: PDF for testobservator med skravert hale-areal; dra-bar x_obs.
- Drill: gitt z=2.3 to-sidig, hva er p-verdi? (0.0214).
- Status: **dekket** — `tek1-hypotesetest-regresjon`.

**D7 — Type-I- og type-II-feil**
- Hva: Type I = forkaste sann H0 (α). Type II = beholde falsk H0 (β). Power = 1−β.
- Forutsetter: D6
- Demo: to overlappende fordelinger med dra-bar kritisk grense c og skraverte α/β-områder.
- Drill: kort som tvinger studenten å forklare hvorfor α↓ ⇒ β↑.
- Status: **dekket** — `Type1Type2ErrorAreas.tsx`.

**D8 — Statistisk styrke (power) og sample-size**
- Hva: Power = sannsynlighet for å oppdage en sann effekt.
- Forutsetter: D7
- Demo: power-kurve som funksjon av n med slidere for effektstørrelse og α.
- Drill: "Hvor stor n for å oppdage Δ=0.5 med power 0.8 og α=0.05?".
- Status: **dekket** — `PowerCurve.tsx`.

**D9 — z-test, ett-utvalgs t-test, to-utvalgs t-test**
- Hva: Tre varianter valgt etter om σ er kjent og om vi sammenligner én eller to grupper.
- Forutsetter: D6, C13
- Demo: flowchart-velger som lander på riktig test.
- Drill: 15 scenarier — velg riktig test.
- Status: **dekket** — `tek1-statistisk-analyse` §5 + drag.

**D10 — Kji-kvadrat-tester (goodness-of-fit + uavhengighet)**
- Hva: Sammenlign observerte mot forventede frekvenser via Σ (O−E)²/E.
- Forutsetter: C13, D5
- Demo: kontingens-tabell der studenten redigerer celler.
- Drill: bygg forventet-tabell for hånd fra rad/kolonne-marginaler.
- Status: **dekket** — `tek1-statistisk-analyse` §5.

**D11 — Inferens for proporsjon p (Wald/Wilson/Agresti-Coull)**
- Hva: CI for andel — Wald svikter ved små n eller ekstreme p.
- Forutsetter: D3, C6
- Demo: side-om-side intervaller for samme (n, p̂).
- Drill: ja/nei "er Wald ok her?" — 8 kort med ulike (n, p̂).
- Status: **dekket** — `tek1-proporsjoner/Tek1ProporsjonerPage.tsx` + `ProporsjonsCalculator.tsx`.

**D12 — To-prop z-test (pooled vs. unpooled)**
- Hva: Sammenlign to andeler; pooler felles p̂ under H0, men ikke i CI.
- Forutsetter: D11
- Demo: kalkulator med toggle pooled/unpooled.
- Drill: "Når bruke pooled?".
- Status: **dekket** — `tek1-proporsjoner`.

**D13 — Ettveis ANOVA og F-test**
- Hva: Sammenlign mean i 3+ grupper via forholdet mellom mellomgruppe- og innengruppe-variasjon.
- Forutsetter: D9, C13
- Demo: AnovaCalculator med tre dra-bare gruppe-bokser.
- Drill: regn F for hånd med oppgitte SS og df.
- Status: **dekket** — `tek1-anova/Tek1AnovaPage.tsx` + `AnovaCalculator.tsx`.

**D14 — Post-hoc (Tukey HSD)**
- Hva: Etter signifikant F: hvilke par av grupper er forskjellige?
- Forutsetter: D13
- Demo: matrise av parvise p-verdier farget etter signifikans.
- Drill: kort om hvorfor man IKKE bare kjører tre t-tester.
- Status: **dekket** — python-øvelse + ANOVA-side.

## Spor E: Regresjon (Modul 4 fortsetter)

**E1 — Korrelasjon (Pearson r)**
- Hva: Tall i [−1,1] som måler lineær sammenheng.
- Forutsetter: C5, A6
- Demo: scatter med dra-bare punkter og live r; vis r=0 for parabel.
- Drill: match 6 scatter-plot til r-verdier.
- Status: **dekket** — `tek1-statistisk-analyse` §6.

**E2 — Minste kvadraters metode**
- Hva: Velg β̂₀, β̂₁ som minimerer Σ(y−ŷ)².
- Forutsetter: E1
- Demo: scatter med dra-bar linje; live SSE-bar; "snap til OLS"-knapp.
- Drill: gitt fire (x,y), regn β̂₁ og β̂₀ for hånd.
- Status: **dekket** — `tek1-hypotesetest-regresjon`.

**E3 — R² og forklart varians**
- Hva: Andel av variansen i y forklart av modellen: R² = 1 − SS_res/SS_tot.
- Forutsetter: E2
- Demo: dra punkter; vis hvordan R² øker når punktene strammer rundt linja.
- Drill: gitt SS_res og SS_tot, beregn R².
- Status: **dekket** — `tek1-regresjon-diagnostikk`.

**E4 — Hypotesetest for stigningstall β₁**
- Hva: Test H0: β₁=0 med t-statistikk β̂₁/SE(β̂₁).
- Forutsetter: E2, D9
- Demo: scatter med liten n; legg til punkter og se p falle.
- Drill: les `linregress`-output og identifiser p-verdien.
- Status: **dekket** — `tek1-hypotesetest-regresjon`.

**E5 — Residualanalyse og Q-Q-plot**
- Hva: Sjekke OLS-antagelser via residualplot.
- Forutsetter: E2, A6
- Demo: drag-bare punkter på scatter speilet i live residualplot og Q-Q-plot.
- Drill: identifiser brudd (4 residualplot — normal, vifteform, kurve, outlier).
- Status: **dekket** — `QqPlotInteractive.tsx` + `RegresjonDiagnostikk.tsx`.

## Spor F: Resampling (valgfri overbygning)

**F1 — Bootstrap-resampling for KI**
- Hva: Trekk B utvalg av samme størrelse MED tilbakelegging fra observert data; persentiler i bootstrap-fordelingen som CI.
- Forutsetter: D3, B9
- Demo: animert resampling med live persentil-CI som bygges opp.
- Drill: forklar i 2 setninger hvorfor bootstrap "fungerer uten formel".
- Status: **delvis** — eksisterer på branch `feat/eksamen-hub-og-bootstrap`, ikke på main.

## Åpne spørsmål

1. **Eksakt pensumforskrift:** UiT-emnebeskrivelsen ikke tilgjengelig i repoet — multippel regresjon / paret t-test / signifikans for korrelasjon kan høre til pensum uten å være eksplisitte sider ennå.
2. **Vurderingsvekt mellom moduler:** Hub-en sier "Modul 4 ~40 %", men eksakt poengfordeling er ikke verifiserbar.
3. **Kalkulator-policy:** Casio fx-9860 nevnes, om dette er pålagt eller valgfritt på 2026-eksamen er uavklart.
4. **Bootstrap som pensum?** Eksisterer som in-progress arbeid, men ingen direkte UiT-pensum-referanse.
5. **Paret t-test:** ikke funnet som eget atom.
6. **Sample-size-formler:** drillet i python-øvelser for proporsjoner; uklart om disse er pensum.
