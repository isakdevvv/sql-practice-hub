# Atom-dekomposisjon — DTE-2602 Introduksjon maskinlæring og AI

**10 stp · Eksamen 09.12.2026 (3t hjemme) + mappe 16.12**

Eksisterende DTE-2602-hub er svært bred: 16 mini-kurs, 2 ML-prosjekter (Iris 8 trinn + Klustering 6 trinn), 2 portefølje-spor (Spor A Dataset-analyse, Spor B ML-pipeline) à 5 trinn, ~31 sklearn-Pyodide-øvelser og ~60+ DTE-2602-flashcards. Atomene under er rekkefølge av irreduserbare konsepter, slik at studenten kan sjekke "har jeg internalisert dette?" mot eksisterende leksjoner. Alt på *intro-nivå* — ikke matematisk dybde (det er DTE-2501).

## Fase 1 — Hva er ML?

**A01. Hva er maskinlæring**
- Hva: Algoritmer som lærer mønster *fra eksempler* i stedet for at programmerer skriver reglene.
- Forutsetter: ingen
- Demo: to-paneler side-om-side: regelbasert vs ML på samme spam-data.
- Drill: flashcard "Forskjellen regelbasert vs ML-modell?"
- Status: **dekket** — `MlGrunnlagPage.tsx` §1.
- Mappe-egnet: N

**A02. Supervised vs. unsupervised vs. reinforcement**
- Hva: Tre måter å lære: med fasit, uten fasit, eller via belønning.
- Forutsetter: A01
- Demo: sorterings-spill — slipp 12 problembeskrivelser i tre bokser.
- Drill: drag-oppgave med 8 problemer.
- Status: **dekket** — `MlGrunnlagPage.tsx` §2.
- Mappe-egnet: N

**A03. Regresjon vs. klassifikasjon**
- Hva: Output er tall (regresjon) eller kategori (klassifikasjon).
- Forutsetter: A02
- Demo: scatter-plot med togglebar y-akse: kontinuerlig vs. diskret.
- Drill: "Regresjon eller klassifikasjon?" × 10.
- Status: **dekket** — `SupervisedPage.tsx` §1.
- Mappe-egnet: N

## Fase 2 — Data og features

**A04. Features og target**
- Hva: Features (X) forklarer; target (y) forutsies.
- Forutsetter: A03
- Demo: klikkbar tabell — velg én kolonne som y, resten blir X.
- Drill: "Definer X og y for å forutsi om en e-post er spam."
- Status: **delvis** — implisitt i `MlGrunnlagPage.tsx` §3.
- Mappe-egnet: N

**A05. Numeriske vs. kategoriske features**
- Hva: Tall vs. labels. Forskjellig forbehandling.
- Forutsetter: A04
- Demo: dra kolonne-headere til "numerisk"/"kategorisk".
- Drill: "Hva er kardinaliteten på 'postnummer' og hvorfor er det et problem?"
- Status: **dekket** — `Dte2602PreprocessingPipelinePage.tsx`.
- Mappe-egnet: N

**A06. Manglende verdier**
- Hva: NaN må fylles eller fjernes — vanligst: imputer med median/mean/most_frequent.
- Forutsetter: A05
- Demo: liten tabell med synlige NaN — knapp som veksler "drop"/"fill median"/"fill mean".
- Drill: sklearn-øvelse `dte2602-py-wine-missing`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A07. Feature scaling**
- Hva: Bring features til samme skala (StandardScaler / MinMaxScaler).
- Forutsetter: A05
- Demo: scatter med to features (én 0-1, én 0-1000). Knapp "skaler" viser kNN-grensa flytte.
- Drill: øvelse `dte2602p-py-knn-scale-demo`.
- Status: **dekket** — `Dte2602PreprocessingPipelinePage.tsx`.
- Mappe-egnet: **J**

**A08. One-hot encoding**
- Hva: Gjør én kategorisk kolonne til flere 0/1-kolonner.
- Forutsetter: A05
- Demo: liten tabell med "by"-kolonne. Klikk "encode" → by_oslo, by_bergen, by_tromsø.
- Drill: flashcard `c-dte2602-onehot`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A09. EDA (utforskende analyse)**
- Hva: Før modellering: `describe()`, histogrammer, korrelasjonsmatrise, klassebalanse.
- Forutsetter: A05
- Demo: CSV-drop som auto-genererer 4 ruter.
- Drill: øvelse `dte2602p-py-pandas-eda` + portfolio spor A trinn 1.
- Status: **dekket** — `Dte2602EdaPandasPage.tsx`.
- Mappe-egnet: **J** (Spor A).

## Fase 3 — Evaluering og oppdeling

**A10. Train/test-split**
- Hva: Hold tilbake en del modellen aldri har sett.
- Forutsetter: A04
- Demo: 100 punkter i scatter, slider "test_size" — punkter farges live.
- Drill: drag-øvelse 8625.
- Status: **dekket**.
- Mappe-egnet: **J**

**A11. Stratifisert split**
- Hva: Bevarer klassefordelingen i begge sett — kritisk ved ubalansert data.
- Forutsetter: A10
- Demo: 90/10-klassefordeling. Toggle stratify.
- Drill: øvelse `dte2602-py-stratify`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A12. Train / val / test (tre sett)**
- Hva: Val for hyperparameter-tuning; test rører du *aldri* før slutten.
- Forutsetter: A10
- Demo: tre stablede bokser; knapp "tune på test" blinker rødt.
- Drill: flashcard `c-dte2602-train-val-test`.
- Status: **dekket**.
- Mappe-egnet: N

**A13. k-fold cross-validation**
- Hva: Del data i k bunter; tren k ganger der hver får være test én gang.
- Forutsetter: A11
- Demo: 5 horisontale striper, sliderbar k.
- Drill: flashcard `c-dte2602-cv-kfold`.
- Status: **dekket** — `CvVarianterPage.tsx`.
- Mappe-egnet: **J**

**A14. Datalekkasje**
- Hva: Når test-info siver inn i trening (typisk: scaler fit før split).
- Forutsetter: A10, A07
- Demo: to identiske pipelines; rød knapp "fit scaler før split" — test-score blir urealistisk høy.
- Drill: øvelse `dte2602p-py-leakage-demo`.
- Status: **dekket**.
- Mappe-egnet: **J** (sensor-felle).

**A15. Overfitting vs. underfitting**
- Hva: Overfit: lært treningsdata utenat. Underfit: for enkel.
- Forutsetter: A10
- Demo: scatter med polynom-fit, slider grad 1-15; train-feil synker, val-feil U-form.
- Drill: flashcards `c-dte2602-overfit-symptom`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A16. Bias-varians-tradeoff**
- Hva: Forventet feil = bias² + varians + støy.
- Forutsetter: A15
- Demo: 4-rute "skyteskive"-figur.
- Drill: flashcard `c-dte2602-bias-varians-def`.
- Status: **dekket** — `Dte2602BiasVariansPage.tsx`.
- Mappe-egnet: N

**A17. Klassifikasjons-metrikker: accuracy, precision, recall, F1**
- Hva: Accuracy lyver på ubalansert data; precision = "av sagt positiv, hvor mange riktig?"; recall = "av alle positive, hvor mange fanget?".
- Forutsetter: A03
- Demo: klikkbar 2×2 confusion matrix — flytt punkter, se alle fire metrikker live.
- Drill: flashcards + øvelse `dte2602p-py-cm-precision-recall`.
- Status: **dekket** — `Dte2602EvaluationRocPage.tsx`.
- Mappe-egnet: **J**

**A18. Confusion matrix**
- Hva: TP/FP/FN/TN — fundamentet for alle klassifikasjons-metrikker.
- Forutsetter: A17
- Demo: drag-grensje på 1D-scatter med to klasser.
- Drill: øvelse `dte2602-py-confusion-matrix`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A19. ROC og AUC**
- Hva: Plott TPR mot FPR for alle terskler; AUC = areal.
- Forutsetter: A18
- Demo: terskel-slider; live ROC-kurve.
- Drill: øvelse `dte2602-py-roc-manual`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A20. Regresjons-metrikker: MAE, RMSE, R²**
- Hva: MAE (samme enhet), RMSE (straffer store feil), R² (forklart variasjon).
- Forutsetter: A03
- Demo: scatter med fit-linje; dra ett punkt langt unna.
- Drill: flashcards `c-dte2602-rmse-vs-mae`, `c-dte2602-r2`.
- Status: **dekket**.
- Mappe-egnet: **J** (regresjons-mappe).

## Fase 4 — Supervised algoritmer

**A21. Lineær regresjon**
- Hva: Finn ŷ = wx + b som minimerer MSE.
- Forutsetter: A04, A20
- Demo: 2D-scatter; dra vektene w og b, se MSE.
- Drill: øvelse `dte2602-py-gd-linear`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A22. Logistisk regresjon**
- Hva: Lineær modell på log-odds; sigmoid mapper til (0,1).
- Forutsetter: A21, A03
- Demo: sigmoid-slider z; 2D-scatter med live decision boundary.
- Drill: øvelse `dte2602-py-lr-iris-binary`.
- Status: **dekket** — `LogistiskRegresjonPage.tsx`.
- Mappe-egnet: **J**

**A23. k-Nærmeste-Nabo (kNN)**
- Hva: Predikér ved å stemme blant k nærmeste.
- Forutsetter: A03, A07
- Demo: nytt punkt på 2D-scatter; sirkel rundt k nærmeste; majoritetsklasse blinker.
- Drill: drag-oppgave 8688 + flashcard.
- Status: **dekket**.
- Mappe-egnet: **J**

**A24. Beslutningstre**
- Hva: Splitter rekursivt på feature/terskel som maksimerer renhet (Gini/entropi).
- Forutsetter: A03
- Demo: bygg tre interaktivt — klikk på split, se 2D-rommet deles.
- Drill: drag 8718 + `c-dte2602-gini`.
- Status: **dekket** — `Dte2602TreesRfPage.tsx`.
- Mappe-egnet: **J**

**A25. Random forest**
- Hva: Mange trær på bootstrap-utvalg med tilfeldige feature-subsets; majoritetsavstemming.
- Forutsetter: A24
- Demo: én tre-grense rufsete vs gjennomsnitt av 50 trær glatt.
- Drill: øvelse `dte2602-py-tree-vs-rf`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A26. SVM (overflate-intro)**
- Hva: Finner hyperplanet med maksimal margin.
- Forutsetter: A03
- Demo: 2D scatter, knapper "lineær"/"rbf".
- Drill: flashcard "Når er SVM bedre enn logreg?"
- Status: **delvis** — nevnt i `SupervisedPage.tsx`, ingen dedikert leksjon.
- Mappe-egnet: N

**A27. Naive Bayes**
- Hva: Bayes med uavhengighets-antakelse — fungerer godt på tekst.
- Forutsetter: A03
- Demo: spam/ham mini-corpus med 6 ord.
- Drill: øvelse `dte2602-py-nb-text`.
- Status: **dekket** — `LdaQdaNbPage.tsx`.
- Mappe-egnet: **J**

**A28. LDA og QDA (overflate-intro)**
- Hva: Generative klassifikatorer; LDA lik kovarians, QDA ulik.
- Forutsetter: A27
- Demo: side-om-side decision boundaries.
- Drill: øvelse `dte2602-py-lda-iris`.
- Status: **dekket**.
- Mappe-egnet: N

**A29. Regularisering: Ridge og Lasso**
- Hva: Ridge (L2) krymper jevnt, Lasso (L1) setter noen til null.
- Forutsetter: A21, A16
- Demo: slider λ; Lasso-path-plot.
- Drill: øvelse + flashcards.
- Status: **dekket** — `Dte2602BiasVariansPage.tsx`.
- Mappe-egnet: **J**

**A30. Hyperparameter vs. parameter**
- Hva: Parametre lærer modellen selv; hyperparametre setter du før trening.
- Forutsetter: A23, A24
- Demo: todelt tabell — drag-elementer.
- Drill: flashcard `c-dte2602-hyperparam-vs-param`.
- Status: **dekket**.
- Mappe-egnet: N

**A31. GridSearchCV**
- Hva: Prøv alle kombinasjoner på CV; velg beste snittscore.
- Forutsetter: A13, A30
- Demo: 2D-grid (C × gamma) fargelegges under animasjon.
- Drill: øvelser + flashcard.
- Status: **dekket** — iris-prosjekt steg 6.
- Mappe-egnet: **J** (Spor B trinn 5).

**A32. sklearn Pipeline**
- Hva: Lenker preprocessing + model; sikrer scaler kun fit-tes på train inne i CV.
- Forutsetter: A14, A07, A22
- Demo: drag-bokser ("imputer", "scaler", "encoder", "model") inn i pipeline-pipe.
- Drill: øvelse `dte2602-py-pipeline-cv` + flashcard.
- Status: **dekket** — portfolio Spor B.
- Mappe-egnet: **J** (kjernen i Spor B).

## Fase 5 — Unsupervised

**A33. k-means klustering**
- Hva: Iterativt tilordne hvert punkt til nærmeste sentroid, så flytt sentroidene til klustrets snitt.
- Forutsetter: A07, A02
- Demo: 2D scatter, slider k, "step through".
- Drill: øvelse `dte2602-py-kmeans-from-scratch`.
- Status: **dekket** — `UnsupervisedPage.tsx`.
- Mappe-egnet: **J**

**A34. Elbow-metoden for k**
- Hva: Plott inertia mot k — knekken markerer fornuftig k.
- Forutsetter: A33
- Demo: elbow-plot som tegnes mens k økes.
- Drill: klustering-prosjekt trinn 4.
- Status: **dekket**.
- Mappe-egnet: **J**

**A35. Hierarkisk klustering**
- Hva: Bygg dendrogram ved å gradvis slå sammen nærmeste.
- Forutsetter: A33
- Demo: 6 punkter, animert dendrogram-bygging.
- Drill: flashcard "linkage-metode?"
- Status: **dekket**.
- Mappe-egnet: N

**A36. DBSCAN**
- Hva: Tetthetsbasert; trenger ikke k.
- Forutsetter: A33
- Demo: to halvmåne-formede klustre der k-means feiler.
- Drill: klustering-prosjekt trinn 5.
- Status: **dekket**.
- Mappe-egnet: N

**A37. PCA (dimensjonsreduksjon)**
- Hva: Roterer datarommet så første aksene fanger mest varians.
- Forutsetter: A07, A02
- Demo: 2D-scatter med originale akser; klikk "PCA" — aksene roterer.
- Drill: øvelse `dte2602p-py-pca-2d`.
- Status: **dekket**.
- Mappe-egnet: **J**

## Fase 6 — Nevrale nett (intro)

**A38. Perceptron**
- Hva: Ett kunstig nevron: ŷ = aktivering(Σ wᵢxᵢ + b).
- Forutsetter: A21
- Demo: tre input-knapper, vekt-slidere, aktiveringsdropdown.
- Drill: flashcard "Hva er en perceptron i én setning?"
- Status: **dekket** — `NnIntroPage.tsx`.
- Mappe-egnet: N

**A39. Aktiveringsfunksjoner**
- Hva: Ikke-lineær funksjon mellom lag.
- Forutsetter: A38
- Demo: ReLU, sigmoid, tanh, softmax side-om-side.
- Drill: flashcard "softmax vs sigmoid?"
- Status: **dekket**.
- Mappe-egnet: N

**A40. Gradient descent (intuisjon)**
- Hva: Gå nedoverbakke på loss-flata mot motsatt gradient.
- Forutsetter: A21
- Demo: 1D-loss-kurve med animert kule.
- Drill: øvelse `dte2602-py-gd-linear`.
- Status: **dekket**.
- Mappe-egnet: N

**A41. Backpropagation (overflate)**
- Hva: Kjerne-regel brukt baklengs for å beregne ∂loss/∂w effektivt.
- Forutsetter: A40, A39
- Demo: 2-lags nett der piler animeres bakover med ∂L/∂w-tall.
- Drill: flashcard "Tre stegene: forward, backward, update?"
- Status: **dekket**.
- Mappe-egnet: N

**A42. MLP (multi-layer perceptron)**
- Hva: Flere lag av perceptroner stablet.
- Forutsetter: A41
- Demo: sklearn MLPClassifier på iris.
- Drill: øvelse `dte2602-py-mlp-iris`.
- Status: **dekket**.
- Mappe-egnet: **J**

## Fase 7 — Prosjektflyt og etikk

**A43. CRISP-DM-aktig 7-stegs flyt**
- Hva: Problem → data → EDA → features → tren → evaluér → deploy.
- Forutsetter: A09, A10, A17, A31
- Demo: Mermaid-flowchart med klikkbare bokser.
- Drill: drag-oppgave 8481 "ML-pipeline — sortér stegene".
- Status: **dekket** — `Dte2602ProsjektflytPage.tsx`.
- Mappe-egnet: **J** (det er hele mappen).

**A44. Baseline-modell**
- Hva: Trivielt referansepunkt — modellen må slå dette.
- Forutsetter: A17, A20
- Demo: bar-chart "baseline F1" vs "din modell F1".
- Drill: øvelse `dte2602p-py-baseline-vs-modell`.
- Status: **dekket**.
- Mappe-egnet: **J** (sensorpoeng).

**A45. Klasseubalanse**
- Hva: Når én klasse dominerer: bruk class_weight='balanced' eller resampling.
- Forutsetter: A11, A17
- Demo: dataset 95/5; toggle "balanced".
- Drill: øvelse + flashcard.
- Status: **dekket**.
- Mappe-egnet: **J**

**A46. Reproduserbarhet (random_state)**
- Hva: Sett seed for split, modell og shuffling.
- Forutsetter: A10
- Demo: 3 kjøringer uten seed → ulike F1; med seed → identiske.
- Drill: flashcard `c-dte2602p-mappe-reproduserbarhet`.
- Status: **dekket** — `Dte2602MappeMalPage.tsx`.
- Mappe-egnet: **J** (sensor-felle).

**A47. AI-historie i raske grep**
- Hva: Dartmouth 1956 → AI-vintre → ekspertsystem → deep learning 2012.
- Forutsetter: A01
- Demo: tidslinje med klikkbare hendelser.
- Drill: flashcards `c-dte2602p-ai-fodsel`.
- Status: **dekket** — `Dte2602EtikkPage.tsx` §1.
- Mappe-egnet: N

**A48. Bias-taksonomi i ML**
- Hva: Historisk, sampling, måling, algoritmisk.
- Forutsetter: A09, A45
- Demo: klikkbart sankey-diagram fra biaskilde til konsekvens.
- Drill: flashcards `c-dte2602p-bias-historisk`, `-sampling`, `-compas`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A49. GDPR i ML**
- Hva: Art. 22, dataminimering, samtykke.
- Forutsetter: A47
- Demo: case-flowchart "skal jeg trene på datasettet?".
- Drill: flashcards `c-dte2602p-gdpr-art22`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A50. Forklarbar AI (XAI)**
- Hva: Trade-off tolkbar (logreg, tre) vs nøyaktig (RF, NN); SHAP/feature importance.
- Forutsetter: A22, A24, A25
- Demo: RF feature importance vs logreg-koeffisienter.
- Drill: øvelse `dte2602p-py-feature-importance`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A51. Kinarommet og svak vs sterk AI**
- Hva: Filosofisk: kan symbol-manipulasjon utgjøre forståelse?
- Forutsetter: A47
- Demo: interaktiv dialog som speiler Kinarommet.
- Drill: flashcards `c-dte2602p-kinarom`.
- Status: **dekket**.
- Mappe-egnet: N (essay-emne på eksamen).

**A52. EU AI Act risikopyramide**
- Hva: 4 nivåer: forbudt / høyrisiko / begrenset / minimal.
- Forutsetter: A49
- Demo: klikkbar pyramide med 8 use case-eksempler.
- Drill: flashcards `c-dte2602p-eu-ai-act-pyramide`.
- Status: **dekket**.
- Mappe-egnet: **J**

**A53. Mappe-rapport-struktur**
- Hva: Sammendrag → problem → data → metode → resultater → diskusjon → etikk → konklusjon.
- Forutsetter: A43, A46, A48
- Demo: klikkbar disposisjon med eksempel-headere.
- Drill: øvelse `dte2602p-py-mini-rapport`.
- Status: **dekket** — `Dte2602MappeMalPage.tsx`.
- Mappe-egnet: **J** (meta-atom).

## Case-studier (anvendt kombinasjon)

- **Iris (8 trinn):** A09 → A11 → A23 → A22 → A31 → A18 → A17.
- **Klustering (6 trinn):** A33 → A34 → A36.
- **Spor A — Dataset-analyse (mappe-speil):** A09 → A06 → A48.
- **Spor B — ML-pipeline (mappe-speil):** A32 → A11 → A17 → A18 → A31.

## Åpne spørsmål

1. **Atom-spor som UI-konstrukt:** Skal atom-listen materialiseres som parallell avhengighetsgraf, eller skal eksisterende kurs få atom-tagger?
2. **Granularitet på SVM (A26):** Eneste atom uten dedikert leksjon. Er SVM eksamens-relevant i DTE-2602, eller parkere til 2501/2502?
3. **Mappe- vs. eksamen-egnethet:** Bør jeg lage separat eksamen-flagg? Hjemme-eksamen vekter teori/drøfting tyngre enn implementasjon.
4. **Atom A28 (LDA/QDA):** Matematikken er DTE-2501-tung. Hva er minimums-formulering for 09.12?
5. **Feature engineering:** Dekkes i `Dte2602ProsjektflytPage.tsx` §4, men ikke eget atom — løfte til A05.5?
6. **Rekkefølge A40 vs A21:** I dag underviser lineær regresjon før gradient descent. Pedagogisk kan gradient descent være motoren under lineær regresjon. Hvilken rekkefølge skal atom-graf-en hevde?
