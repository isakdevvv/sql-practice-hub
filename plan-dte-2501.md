# Atom-dekomposisjon — DTE-2501 AI Methods and Applications

**10 stp · Hjemmeeksamen + portefølje (3t × 2 + mappe)**

Plan-agent leste kurset slik: `Dte2501Hub` (på `feat/dte-2501-ml-tracks`) definerer to spor — ML-spor (eksamenspensum) og klassisk AI-spor (bakgrunn). Alle `dte2501-*.tsx` content-filer pluss matte-fundamentet (`linaer-algebra`, `optimering`, `sannsynlighet`, `diskret-matte`) lever på `feat/strengthen-dte2501-ml`. Bandits/MDP/minimax finnes på `main`. Atomene under er ordnet matte → supervised → unsupervised → ensemble → NLP → metaheuristikker → DP → RL → klassisk AI.

## Del 0 — Rammeverk

**A0.1 — ML vs klassisk AI**
- Hva: ML lærer statistiske mønstre fra data; klassisk AI manipulerer symboler etter regler.
- Forutsetter: ingen.
- Demo: to-kort-sammenligning: "predikér spam" (ML) vs "løs sudoku" (CSP/søk).
- Drill: 8 problem-beskrivelser → ML eller klassisk.
- Status: **delvis** — `Dte2501Hub` har pensum-tabell, ikke eget atom.

**A0.2 — Supervised vs unsupervised vs RL**
- Hva: Supervised har (X, y), unsupervised har X, RL har (state, action, reward).
- Forutsetter: A0.1.
- Demo: drag-tre-spann; 12 problemstillinger.
- Drill: kategoriser 6 problembeskrivelser.
- Status: **dekket** — `supervised-learning.tsx` + `unsupervised-learning.tsx`.

**A0.3 — Klassifikasjon vs regresjon**
- Hva: Diskrete labels vs kontinuerlig tall.
- Forutsetter: A0.2.
- Demo: scatter med fargede klasser vs y-akse som tall.
- Drill: 6 prediksjons-problemer.
- Status: **dekket** — `RegresjonPage.tsx`.

## Del 1 — Matte-fundament

**A1.1 — Vektor som punkt i rom**
- Hva: Liste av tall som angir posisjon eller retning i n-dim rom.
- Forutsetter: ingen.
- Demo: 2D-canvas, dra vektor.
- Drill: flashcard "[3,4] i R²".
- Status: **dekket** — `linaer-algebra`.

**A1.2 — Euklidsk avstand**
- Hva: √Σ(xi−yi)².
- Forutsetter: A1.1.
- Demo: to dra-bare punkter; avstands-tall live; toggle 3D.
- Drill: d([1,2],[4,6]) → 5.
- Status: **delvis** — nevnt i `KnnPage`, ikke eget drill.

**A1.3 — Manhattan-avstand og andre normer**
- Hva: L1, L2, L∞ gir ulike "sirkler".
- Forutsetter: A1.2.
- Demo: L1/L2/L∞-enhetssirkler side om side.
- Drill: Hvilken er rotasjons-invariant? Når L1?
- Status: **delvis** — `KnnPage` nevner.

**A1.4 — Indreprodukt og vinkler**
- Hva: Skalar som måler hvor "samme retning"; null = ortogonal.
- Forutsetter: A1.1.
- Demo: to vektorer, dra; indreprodukt og cos-θ live.
- Drill: finn vektor ortogonal på to gitte.
- Status: **dekket** — `linaer-algebra` "produkt".

**A1.5 — Matrise og matrise-vektor-produkt**
- Hva: Lineær funksjon R^n → R^m.
- Forutsetter: A1.1, A1.4.
- Demo: 2x2-matrise, dra søyle, se enhetskvadratet transformeres.
- Drill: Av for liten A og v.
- Status: **dekket**.

**A1.6 — Egenvektor / egenverdi**
- Hva: Vektorer som ikke endrer retning under transformasjon.
- Forutsetter: A1.5.
- Demo: dra 2x2-matrise, se hvilke retninger forblir på linje.
- Drill: egenvektorer for diag(2,3)?
- Status: **dekket**.

**A1.7 — Sannsynlighet-aksiomene**
- Hva: P er ikke-negativ funksjon, summerer til 1.
- Forutsetter: ingen.
- Demo: sektordiagram med dra-justerbare skiver.
- Drill: kan P(A)=1.2?
- Status: **dekket** — `SannsynlighetPage`.

**A1.8 — Betinget sannsynlighet og Bayes**
- Hva: P(A|B) = P(A og B)/P(B); Bayes inverterer.
- Forutsetter: A1.7.
- Demo: 2x2-cellet diagram {sykdom, test}.
- Drill: medisin-testen — P(syk|positiv).
- Status: **dekket** — `BayesPage`.

**A1.9 — Forventning og varians**
- Hva: Forventning = vektet snitt; varians = forventet kvadrert avvik.
- Forutsetter: A1.7.
- Demo: histogram-builder, μ og σ² live.
- Drill: E[X] og Var[X] for vektet mynt.
- Status: **dekket**.

**A1.10 — Normalfordelingen**
- Hva: Klokkeformet, parametrisert ved μ og σ.
- Forutsetter: A1.9.
- Demo: to-slidere (μ, σ); markér 68/95/99.
- Drill: hvor mange σ for 95%?
- Status: **dekket**.

**A1.11 — Multivariat normal og kovariansmatrise**
- Hva: Generalisering til flere dim; kovariansen koder dimensjons-sammenheng.
- Forutsetter: A1.10, A1.5.
- Demo: 2D-elipse, dra off-diagonal i cov-matrisen.
- Drill: diagonal cov-matrise geometrisk?
- Status: **delvis** — implisitt i `GmmPage`/`PcaPage`.

**A1.12 — Gradient**
- Hva: Vektor av partielle deriverte; peker mot raskest vekst.
- Forutsetter: A1.1, kalkulus.
- Demo: 2D-loss-landskap (konturplot), klikk punkt, vis gradient-pil.
- Drill: ∇f for f(x,y)=x²+2y² i (1,1).
- Status: **dekket** — `OptimeringPage`.

**A1.13 — Gradient descent**
- Hva: Iterativ optimering: små steg motsatt gradient.
- Forutsetter: A1.12.
- Demo: klikk start-punkt, slide learning rate, se ball rulle (eller divergere).
- Drill: for hvilken lr divergerer GD på x²?
- Status: **dekket**.

**A1.14 — Konveksitet og lokale minima**
- Hva: Konvekse loss-flater har bare ett globalt minimum.
- Forutsetter: A1.13.
- Demo: dropdown mellom paraboloid og Rastrigin.
- Drill: er MSE for lineær regresjon konveks?
- Status: **delvis**.

## Del 2 — Supervised: ikke-parametrisk

**A2.1 — Train/test/validation-split**
- Hva: Reserver ikke-sett data for ærlig generaliseringsmål.
- Forutsetter: A0.2.
- Demo: 100 punkter splittes 70/15/15.
- Drill: hvorfor må vi ikke fitte hyperparametre på testsettet?
- Status: **delvis** — antatt fra DTE-2602.

**A2.2 — Feature-skalering**
- Hva: (x−μ)/σ; alle features sammenlignbare i avstand.
- Forutsetter: A1.2, A1.9.
- Demo: scatter med to features i ulik skala; toggle standardisering.
- Drill: k-NN på (alder, inntekt) uten skalering — hvilken feature dominerer?
- Status: **delvis** — nevnt i `KnnPage` "fails".

**A2.3 — k-NN: majoritetsstemme**
- Hva: Klassifisering via majoritetsstemme blant k nærmeste etiketterte naboer.
- Forutsetter: A1.2, A2.2.
- Demo: klikk for "mystisk punkt", slide k, se prediksjonen flipp.
- Drill: med k=3 og [A,A,B] → ?
- Status: **dekket** — `dte2501-knn` med `KnnExplorer`.

**A2.4 — k-NN-regresjon**
- Hva: Predikér gjennomsnittet av y-verdiene til k nærmeste.
- Forutsetter: A2.3, A0.3.
- Demo: 1D-data, slide k, se prediksjonskurven smoothes.
- Drill: k=1 — hva skjer på treningspunktene?
- Status: **dekket**.

**A2.5 — Bias-variance i k-valg**
- Hva: Lite k = lav bias, høy varians; stort k = motsatt.
- Forutsetter: A2.3.
- Demo: train- og test-feil som funksjon av k.
- Drill: k=1 — alltid null treningsfeil?
- Status: **dekket** — `KnnPage` "k-choice".

**A2.6 — Lazy vs eager learning**
- Hva: Lazy lagrer dataen, eager komprimerer til parametre.
- Forutsetter: A2.3.
- Demo: side-by-side: fit cost vs predict cost.
- Drill: hvorfor er k-NN dårlig for sanntidsprediksjon på store datasett?
- Status: **dekket**.

**A2.7 — Curse of dimensionality**
- Hva: I høye dim blir alle punkter omtrent like langt unna.
- Forutsetter: A2.3, A1.2.
- Demo: plot avstand-til-nærmeste-nabo som funksjon av d.
- Drill: hvorfor hjelper PCA før k-NN?
- Status: **delvis**.

## Del 3 — Supervised: parametrisk

**A3.1 — Lineær regresjon**
- Hva: ŷ = w·x + b, finn w, b som best treffer.
- Forutsetter: A1.5, A0.3.
- Demo: dra-bar linje, vis SSE live.
- Drill: én feature og to punkter — finn w og b eksakt.
- Status: **dekket** — `RegresjonPage`.

**A3.2 — MSE og MAE som loss**
- Hva: MSE straffer store feil kvadratisk; MAE lineært.
- Forutsetter: A3.1.
- Demo: legg til outlier, toggle MSE/MAE.
- Drill: hvilken er mer robust mot outliers?
- Status: **dekket**.

**A3.3 — Polynom-regresjon**
- Hva: Bruk x, x², x³ som features i ellers-lineær regresjon.
- Forutsetter: A3.1.
- Demo: slide polynom-grad 1-15.
- Drill: for hvilke grader får vi overfitting på 10 datapunkter?
- Status: **dekket**.

**A3.4 — Overfitting og underfitting (visuelt)**
- Hva: Overfit = lær støy; underfit = for enkel.
- Forutsetter: A3.3, A2.1.
- Demo: train og test-feil over modellkompleksitet — U-formet test-feil.
- Drill: lav train + høy test = ?
- Status: **dekket**.

**A3.5 — Ridge (L2) og Lasso (L1)**
- Hva: Straff på vekt-størrelse; L2 krymper, L1 nuller ut.
- Forutsetter: A3.4, A1.3.
- Demo: dra λ-slider.
- Drill: hvilken for feature-utvelgelse?
- Status: **dekket**.

**A3.6 — R², RMSE**
- Hva: Andel forklart varians; typisk feil i samme enhet som y.
- Forutsetter: A3.1, A1.9.
- Demo: scatter med best-fit, R² live.
- Drill: R²=0.85 vs 0.99 — alltid bedre?
- Status: **dekket**.

**A3.7 — Logistisk regresjon (intro)**
- Hva: Lineær modell + sigmoid → sannsynlighet for klasse 1.
- Forutsetter: A3.1.
- Demo: 1D-data med to klasser, slide w og b.
- Drill: ved hvilken sannsynlighet "vipper" prediksjonen?
- Status: **delvis** — finnes på main, ikke i DTE-2501-hub.

## Del 4 — Klassifikasjon-metrikker

**A4.1 — Forvirringsmatrise**
- Hva: 2x2-tabell over TP/FP/TN/FN.
- Forutsetter: A0.3.
- Demo: dra terskelen på sigmoid-kurve.
- Drill: hva er FN i medisinsk screening?
- Status: **delvis** — antatt fra DTE-2602.

**A4.2 — Presisjon, recall, F1**
- Hva: P = "av sagt ja, hvor mange var rette"; R = "av faktisk ja, hvor mange fant jeg".
- Forutsetter: A4.1.
- Demo: terskel-slider; P-R trade-off live.
- Drill: spam-filter — P eller R?
- Status: **delvis**.

## Del 5 — Unsupervised

**A5.1 — k-Means: assign-update-iterer**
- Hva: Init k sentre, tilordne hvert punkt, flytt senter til snitt, gjenta.
- Forutsetter: A1.2, A0.2.
- Demo: klikk for å sette init-sentre, "én iterasjon"-knapp viser fasene separat.
- Drill: én iterasjon — beregn nye sentre fra 6 punkter.
- Status: **dekket** — `KMeansPage` + `KMeansAnimator`.

**A5.2 — k-Means konvergens og init-sensitivitet**
- Hva: Konvergerer alltid, men til lokalt minimum.
- Forutsetter: A5.1.
- Demo: kjør samme datasett 5 ganger med ulik init.
- Drill: hvorfor k-means++ som default?
- Status: **delvis**.

**A5.3 — Velge k: elbow og silhouette**
- Hva: Plot inertia eller silhouette over k.
- Forutsetter: A5.1.
- Demo: slide k 2-10, se elbow og silhouette samtidig.
- Drill: for tre tydelige klustre — hvor er elbow?
- Status: **dekket**.

**A5.4 — Når k-Means feiler**
- Hva: Antar konvekse, like-store, sfæriske klustre.
- Forutsetter: A5.1.
- Demo: dropdown mellom blobs, half-moons, anisotropic.
- Drill: for halvmåne — hvilken algoritme passer bedre?
- Status: **dekket**.

**A5.5 — Generative vs diskriminative**
- Hva: Generativ modellerer P(X|y) og P(y); diskriminativ P(y|X) direkte.
- Forutsetter: A1.8.
- Demo: tabell — hva GMM/NB kan (sample nye data) vs hva log.reg ikke kan.
- Drill: kan du sample fra k-Means? Fra GMM?
- Status: **dekket** — `GmmPage`.

**A5.6 — GMM-formel: blanding av gaussiske**
- Hva: p(x) = Σ_k π_k · N(x | μ_k, Σ_k).
- Forutsetter: A1.11, A5.5.
- Demo: 1D, dra tre normal-kurver og deres vekt.
- Drill: hva må Σπ_k være?
- Status: **dekket**.

**A5.7 — EM-algoritmen**
- Hva: Alternér E-step (soft-assignments) og M-step (oppdater parametre).
- Forutsetter: A5.6.
- Demo: trinn-vis "E"- og "M"-knapper.
- Drill: forskjell fra k-Means hard-assignment?
- Status: **dekket** — `GmmVisualizer`.

**A5.8 — Soft vs hard assignment**
- Hva: Hard = punkt tilhører én kluster; soft = sannsynlighetsvektor.
- Forutsetter: A5.7, A5.1.
- Demo: samme punkt — k-Means-farge vs GMM-responsibility-vektor.
- Drill: punkt midt mellom to klustre — hard vs soft?
- Status: **dekket**.

**A5.9 — BIC/AIC for GMM**
- Hva: Likelihood + straff for antall parametre.
- Forutsetter: A5.6.
- Demo: slide k, se BIC-kurve.
- Drill: hvorfor straffer BIC sterkere enn AIC?
- Status: **delvis**.

**A5.10 — PCA-intuisjon**
- Hva: Roter koordinatsystemet så første aksen fanger mest varians.
- Forutsetter: A1.5, A1.9.
- Demo: 2D-scatter, klikk "kjør PCA".
- Drill: for sirkulært-spredt data — nyttig?
- Status: **dekket** — `PcaPage` + `PcaProjector`.

**A5.11 — Cov → egenvektorer → komponenter**
- Hva: Cov-matrisens egenvektorer er PCA-aksene.
- Forutsetter: A1.6, A1.11.
- Demo: trinn-vis: cov-matrise, egenvektor-piler, projeksjon.
- Drill: cov=[[1,0.9],[0.9,1]] — PC1?
- Status: **dekket**.

**A5.12 — Forklart varians og scree-plot**
- Hva: Eigenverdi = varians langs aksen.
- Forutsetter: A5.11.
- Demo: søyle-diagram + kumulativ kurve.
- Drill: beholder 95% — minste antall PC?
- Status: **dekket**.

**A5.13 — PCA-anvendelser**
- Hva: Komprimering, visualisering, støy-fjerning, prepro før k-NN.
- Forutsetter: A5.10, A2.7.
- Demo: MNIST → PC1/PC2-scatter.
- Drill: når er PCA dårlig — ikke-lineære manifolder?
- Status: **dekket**.

## Del 6 — Ensemble

**A6.1 — Bias-variance dekomponering**
- Hva: Forventet test-feil = bias² + variance + støy.
- Forutsetter: A3.4.
- Demo: 30 modeller på bootstrap-samples, plot prediksjoner.
- Drill: dypt tre — høy bias eller variance?
- Status: **dekket** — `EnsemblePage`.

**A6.2 — Bootstrap-sampling**
- Hva: Trekk n samples med tilbakelegging fra n; ~63% unike.
- Forutsetter: A1.9.
- Demo: "trekk på nytt"-knapp.
- Drill: P(punkt aldri trekkes) for n=∞?
- Status: **dekket**.

**A6.3 — Bagging**
- Hva: Tren m kopier på bootstrap-samples, snitt prediksjoner.
- Forutsetter: A6.1, A6.2.
- Demo: enkeltre vs 100-bagged-trær.
- Drill: hvorfor hjelper ikke bagging for lineær regresjon?
- Status: **dekket**.

**A6.4 — Random Forest**
- Hva: Bagging av trær + tilfeldig feature-subset per split.
- Forutsetter: A6.3 + tre (DTE-2602).
- Demo: slide max_features.
- Drill: grunne eller dype trær i RF?
- Status: **dekket**.

**A6.5 — Boosting (sekvensiell)**
- Hva: Tren modeller etter hverandre; hver fokuserer på forrige bom.
- Forutsetter: A6.1.
- Demo: tre runder AdaBoost.
- Drill: reduserer bias eller variance primært?
- Status: **dekket**.

**A6.6 — AdaBoost-vektoppdatering**
- Hva: Feil-klassifiserte får økt vekt; ny modell trenes vektet; α basert på error.
- Forutsetter: A6.5.
- Demo: trinn-knapper for runde 1, 2, 3.
- Drill: beregn α for runde med vektet feil 0.2.
- Status: **dekket**.

**A6.7 — Gradient Boosting**
- Hva: Hver ny modell fitter residual fra forrige — gradient descent i funksjons-rom.
- Forutsetter: A6.5, A1.13.
- Demo: trinn-vis fitting på 1D-data.
- Drill: hvorfor "gradient"?
- Status: **dekket**.

**A6.8 — Bagging vs boosting — valg-tabell**
- Hva: Bagging = parallell, redusér variance. Boosting = sekvensiell, redusér bias.
- Forutsetter: A6.3, A6.5.
- Demo: drag-til-riktig-side-spørsmål.
- Drill: høy variance, ren data → ?
- Status: **dekket**.

## Del 7 — NLP

**A7.1 — Tokenisering**
- Hva: Del tekst i meningsfulle enheter (ord, sub-words).
- Forutsetter: ingen.
- Demo: lim inn setning, se ulike strategier.
- Drill: hvor mange tokens i "AI-metoder"?
- Status: **dekket** — `NlpPage`.

**A7.2 — Stemming og lemmatisering**
- Hva: Reduser ord til rot-form; stemmer er regelbasert, lemmatizer er ordbok-basert.
- Forutsetter: A7.1.
- Demo: input-felt med toggle.
- Drill: "better" — stemmer/lemmatizer?
- Status: **dekket**.

**A7.3 — Bag-of-words**
- Hva: Vektor av ord-frekvenser; kast rekkefølge.
- Forutsetter: A7.1, A1.1.
- Demo: to korte dokumenter, bygg vokabular og BoW-vektorer.
- Drill: dimensjonen til BoW-vektor med vokabular V?
- Status: **dekket**.

**A7.4 — TF-IDF**
- Hva: TF × IDF; straffer "the".
- Forutsetter: A7.3.
- Demo: lite korpus, klikk ord, se TF/IDF/TF-IDF.
- Drill: "the" — lav eller høy IDF?
- Status: **dekket**.

**A7.5 — Cosine similarity**
- Hva: Vinkel mellom vektorer — robust mot lengde.
- Forutsetter: A1.4, A7.4.
- Demo: query-felt + 5 dokumenter, sorter etter cosine.
- Drill: samme retning ulik lengde — cos = ?
- Status: **dekket**.

**A7.6 — Word embeddings**
- Hva: Hvert ord = tett vektor i ~300D der semantisk like ord ligger nær.
- Forutsetter: A1.1, A7.3.
- Demo: 2D-projeksjon; "konge - mann + kvinne" → "dronning".
- Drill: hvorfor kan BoW ikke fange synonymer?
- Status: **dekket**.

**A7.7 — Tekst-klassifikasjon-pipeline**
- Hva: Tekst → tokenisér → vektorisér → klassifikator.
- Forutsetter: A7.4, A1.8.
- Demo: spam-mail med pipeline-steg.
- Drill: hvilken klassifikator passer med BoW?
- Status: **dekket**.

## Del 8 — Metaheuristikker

**A8.1 — Metaheuristikk vs eksakt**
- Hva: Når søkerommet er for stort og gradient mangler, bruk natur-inspirert tilfeldig søk.
- Forutsetter: A1.13.
- Demo: 2D-Rastrigin; sammenlign GD og GA.
- Drill: TSP med 30 byer — eksakt eller meta?
- Status: **dekket** — `GeneticPage`.

**A8.2 — GA: representasjon, fitness, populasjon**
- Hva: Individ = kandidatløsning; fitness måler kvalitet; populasjon = mange parallelt.
- Forutsetter: A8.1.
- Demo: OneMax — vis populasjon som tabell av bit-strenger med fitness.
- Drill: hvordan koder du TSP-tur som individ?
- Status: **dekket**.

**A8.3 — Seleksjon: roulette og tournament**
- Hva: Velg foreldre proporsjonalt med fitness eller via mini-konkurranser.
- Forutsetter: A8.2.
- Demo: sirkel-diagram for roulette; toggle tournament-størrelse.
- Drill: med fitness [10,1,1,1] — P(velge nr. 1)?
- Status: **dekket**.

**A8.4 — Crossover og mutasjon**
- Hva: Crossover blander to foreldre; mutasjon flipper tilfeldige bits.
- Forutsetter: A8.2.
- Demo: to bit-strenger, klikk "1-punkts crossover"; slide mutasjonsrate.
- Drill: høy mutasjonsrate → ?
- Status: **dekket**.

**A8.5 — PSO**
- Hva: Sverm av partikler påvirket av eget beste og globalt beste.
- Forutsetter: A8.1.
- Demo: animér sverm på Rastrigin med slidere.
- Drill: forskjell fra GA i informasjonsdeling?
- Status: **dekket**.

**A8.6 — ACO**
- Hva: Maur legger feromon på korte stier; fordamping straffer dårlige.
- Forutsetter: A8.1.
- Demo: lite TSP-grid med feromon-spor.
- Drill: hvorfor må feromon fordampe?
- Status: **dekket**.

## Del 9 — Dynamic Programming

**A9.1 — Optimal substruktur og overlappende del-problem**
- Hva: Problem løses ved kombinasjon av del-løsninger; samme del-problem flere ganger.
- Forutsetter: rekursjon.
- Demo: rekursjon-tre for fib(5), highlight gjentatte noder.
- Drill: har TSP optimal substruktur?
- Status: **dekket** — `DpPage`.

**A9.2 — Memoization vs tabulation**
- Hva: Top-down (cache) vs bottom-up (fyll tabell).
- Forutsetter: A9.1.
- Demo: Fibonacci med begge stilene side om side.
- Drill: hvilken er enklere for plassanalyse?
- Status: **dekket**.

**A9.3 — 0/1 Knapsack**
- Hva: dp[i][w] = beste verdi med vare-prefiks i og kapasitet w.
- Forutsetter: A9.2.
- Demo: dra varer inn i sekken; DP-tabellen fylles.
- Drill: O(n·W) — hvorfor pseudopolynomisk?
- Status: **dekket**.

**A9.4 — TSP brute force vs Held-Karp**
- Hva: (n-1)!/2 vs 2^n · n² via DP på "siste by + besøkt-sett".
- Forutsetter: A9.2.
- Demo: slide n=4..12.
- Drill: for n=20 — er Held-Karp praktisk?
- Status: **dekket**.

## Del 10 — Reinforcement Learning

**A10.1 — Agent-miljø-loop**
- Hva: Agent observerer state, velger action, miljø gir ny state + reward.
- Forutsetter: A0.2.
- Demo: gridworld-agent, klikk piltaster.
- Drill: kontrast mot supervised — hvor kommer "etiketten" fra?
- Status: **dekket** — `ReinforcementPage`.

**A10.2 — MDP: (S, A, T, R, γ)**
- Hva: Stater, handlinger, overgangs-sannsynligheter, belønning, discount.
- Forutsetter: A10.1, A1.7.
- Demo: 3-stats MDP med piler.
- Drill: hva er Markov-egenskapen?
- Status: **dekket** — `MdpBellmanPage`.

**A10.3 — Policy og value-funksjon**
- Hva: π(a|s) sier hva agenten gjør; V^π(s) er forventet discounted reward.
- Forutsetter: A10.2.
- Demo: gridworld, dra policy-piler.
- Drill: to policies — alltid samme V?
- Status: **dekket**.

**A10.4 — Bellman-likningen**
- Hva: V(s) = R(s) + γ Σ T(s,a,s') V(s').
- Forutsetter: A10.3, A1.9.
- Demo: liten 2-stats MDP, løs eksakt.
- Drill: beregn V(s) for ett trinn av VI.
- Status: **dekket** — `MdpBellmanPage`.

**A10.5 — Value Iteration**
- Hva: Iterér Bellman-optimality-oppdateringen til konvergens.
- Forutsetter: A10.4.
- Demo: gridworld med "ett VI-steg"-knapp.
- Drill: for konvergert V — finn π*.
- Status: **dekket**.

**A10.6 — Policy Iteration**
- Hva: Alternér policy-evaluering og policy-forbedring.
- Forutsetter: A10.5.
- Demo: trinn-knapper.
- Drill: hvorfor PI ofte raskere enn VI?
- Status: **dekket**.

**A10.7 — Known vs unknown world**
- Hva: VI/PI antar T og R kjent; Q-learning lærer fra erfaring.
- Forutsetter: A10.5.
- Demo: toggle "vis T/R".
- Drill: hvilken setting for Q-learning?
- Status: **dekket**.

**A10.8 — Q-learning-oppdateringen**
- Hva: Q(s,a) ← Q(s,a) + α[r + γ max_a' Q(s',a') − Q(s,a)].
- Forutsetter: A10.7.
- Demo: ε-greedy agent; vis Q-tabell oppdatere.
- Drill: rollene til α og γ?
- Status: **dekket**.

**A10.9 — Exploration vs exploitation**
- Hva: Prøve nye actions vs ta beste kjente — fundamental trade-off.
- Forutsetter: A10.1.
- Demo: multi-armed-bandit `BanditsSim`, 1000 trekk med ulik ε.
- Drill: ε=0 — hva hvis første arm tilfeldigvis ga 0?
- Status: **dekket** — `dte2501-bandits`.

**A10.10 — ε-greedy, UCB, optimistic initial**
- Hva: Tre strategier for å balansere utforskning.
- Forutsetter: A10.9.
- Demo: kumulativ reward for de tre strategiene.
- Drill: hvilken er nullregret-asymptotisk?
- Status: **dekket**.

## Del 11 — Klassisk AI (bakgrunns-spor)

**A11.1 — State-space-søk: rammeverket**
- Hva: (initial state, actions, transition, goal-test, step-cost).
- Forutsetter: ingen.
- Demo: 8-puzzle eller mini-grid.
- Drill: koder du Rubiks kube som søk — |S|?
- Status: **dekket** — `SokAlgoritmerPage`.

**A11.2 — BFS, DFS, UCS**
- Hva: FIFO (kortest steg) vs LIFO (dyp) vs prioritet på path-cost.
- Forutsetter: A11.1.
- Demo: liten graf, animér utforskning.
- Drill: når er BFS = UCS?
- Status: **dekket**.

**A11.3 — Heuristikk og A***
- Hva: A* = UCS med f(n) = g(n) + h(n).
- Forutsetter: A11.2.
- Demo: grid; slide h-vekt fra 0 (= UCS) til ∞ (= greedy).
- Drill: h(n) for 8-puzzle med Manhattan?
- Status: **dekket**.

**A11.4 — Admissible og konsistent heuristikk**
- Hva: Admissible = aldri overestimerer; konsistent = trekantulikheten.
- Forutsetter: A11.3.
- Demo: A* med heuristikk som overestimerer — ikke optimal.
- Drill: Manhattan admissible for 8-puzzle? Euklid?
- Status: **dekket**.

**A11.5 — CSP-formulering**
- Hva: (Variabler, domener, begrensninger); løsning = full assignment.
- Forutsetter: ingen.
- Demo: Australia-kartfarging.
- Drill: uttrykk sudoku som CSP.
- Status: **dekket** — `CspPage`.

**A11.6 — Backtracking med forward checking**
- Hva: Tildel én og én; ved konflikt — gå tilbake; FC pruner naboer.
- Forutsetter: A11.5.
- Demo: N-queens med trinn-knapper.
- Drill: hvorfor er FC strengere enn rent backtracking?
- Status: **dekket**.

**A11.7 — Arc consistency (AC-3)**
- Hva: Iterér over kanter og prun verdier uten støttende partner.
- Forutsetter: A11.5.
- Demo: kartfarging der AC-3-runden blusser opp.
- Drill: når terminerer AC-3?
- Status: **dekket**.

**A11.8 — MRV, degree, LCV-heuristikker**
- Hva: MRV = velg variabel med færrest verdier; LCV = velg verdi som blokkerer minst.
- Forutsetter: A11.6.
- Demo: kartfarging med heuristikk-toggle.
- Drill: MRV minimerer hvilken faktor?
- Status: **dekket**.

**A11.9 — Propositional logic og sannhetstabeller**
- Hva: Symboler kombinert med ∧, ∨, ¬, →, ↔.
- Forutsetter: ingen.
- Demo: byggekloss-editor, generér sannhetstabell.
- Drill: er p → q ekvivalent med ¬p ∨ q?
- Status: **dekket** — `LogiskResonneringPage`.

**A11.10 — Modus ponens og resolusjon**
- Hva: Fra p og p→q utled q; resolusjon over klausuler.
- Forutsetter: A11.9.
- Demo: klikk klausuler, se resolutionsspor.
- Drill: vis at KB ⊨ α via resolusjons-refutasjon.
- Status: **dekket**.

**A11.11 — STRIPS og planlegging**
- Hva: Tilstand = predikat-sett; handling = (precond, add, delete); plan = sekvens.
- Forutsetter: A11.1.
- Demo: blokker-verden.
- Drill: definér "stable A on B" som STRIPS.
- Status: **dekket** — `PlanleggingPage`.

**A11.12 — Forward vs backward planning**
- Hva: Søk fra init mot goal eller motsatt.
- Forutsetter: A11.11.
- Demo: samme problem, toggle retning.
- Drill: når er backward bedre?
- Status: **dekket**.

**A11.13 — Naive Bayes-klassifikator**
- Hva: Bayes' regel + uavhengighets-antagelse + likelihood-produkt.
- Forutsetter: A1.8.
- Demo: spam med ord-likelihoods.
- Drill: hva er "naive"? Når OK?
- Status: **dekket** — `BayesPage`.

**A11.14 — Minimax**
- Hva: MAX maksimerer, MIN minimerer; rekursér til terminale states.
- Forutsetter: A11.1.
- Demo: tic-tac-toe-tre.
- Drill: dybde-3 minimax — rotens verdi?
- Status: **dekket** — `MinimaxPage`.

**A11.15 — Alpha-beta pruning**
- Hva: Cut grener som ikke kan påvirke roten.
- Forutsetter: A11.14.
- Demo: AB på samme tre — grener gråes ut.
- Drill: beste-case branching i AB?
- Status: **dekket**.

## Åpne spørsmål

1. **k-NN ↔ logistisk regresjon-bro:** A3.7 ligger på `main` men ikke i `Dte2501Hub`. Pekes ut som "forutsetter A3.7 fra DTE-2602"?
2. **Beslutningstre-atomer:** Random Forest forutsetter tre, men tre-atomet bor i DTE-2602. La `EnsemblePage` linke ut, ikke duplisere?
3. **Hierarkisk klustring:** Nevnt i `KMeansPage`, ikke utskilt. Verdt å splitte hvis pensum?
4. **Backprop/dyp læring:** `BackpropDypPage` finnes, men ikke i `Dte2501Hub`. Hører kanskje til DTE-2602-rest, ikke DTE-2501.
5. **Bandits som eget atom-spor:** A10.9-A10.10 dekker dem; bør de "eier" 2-3 egne atomer?
6. **Modell-utvelgelse generelt:** Bare implisitt — ingen "k-fold CV"-atom.
7. **Diskret matte/sannsynlighet:** Lever i repoet, men uklart forhold til DTE-2501. Trolig TEK-støtte.
