/**
 * Læringsspor — sammenkoblet sti gjennom eksisterende stack-sider og Python-oppgaver.
 *
 * Hvert spor er én curert progresjon: stack-sider for teori, oppgaver for hands-on,
 * og et capstone-prosjekt på slutten. Brukeren krysser av når hvert trinn er sett/løst.
 */

export type TrackStepKind = "stack" | "exercise" | "capstone";

export interface TrackStep {
  kind: TrackStepKind;
  /** Slug for stack-content eller id for python-oppgave eller fritekst-anchor for capstone. */
  ref: string;
  /** Kort kontekst som vises ved siden av lenken. */
  note?: string;
}

export interface TrackSection {
  /** Kort tittel for fasen (f.eks. "Grunnlag", "Forms", "Auth"). */
  title: string;
  /** Mini-forklaring av hvorfor fasen kommer her. */
  description: string;
  steps: TrackStep[];
}

export interface Track {
  id: string;
  /** Visningsnavn. */
  label: string;
  /** Hva sporet er for — én setning. */
  blurb: string;
  /** Lengre forklaring (vises på detalj-siden). */
  longDescription: string;
  /** Kort liste over hva man trenger først. */
  prerequisites: string[];
  /** Estimert tidsbruk (f.eks. "12-20 timer"). */
  estimatedHours: string;
  /** Tailwind border/bg-farge for visuell distinksjon. */
  color: "brand" | "success" | "warning" | "destructive" | "purple";
  /** Hvilken stack-side capstone-en peker til (typisk en builder eller stort prosjekt). */
  capstoneStackSlug: string;
  /** En setning om capstone-prosjektet. */
  capstoneNote: string;
  /** Faser i sporet — bygd opp pedagogisk. */
  sections: TrackSection[];
}

export const TRACKS: readonly Track[] = [
  // ============ 1. Flask + Bootstrap full-stack ===========================
  {
    id: "flask-fullstack",
    label: "Flask + Bootstrap full-stack",
    blurb: "Bygg en database-drevet webside fra null — HTML, Bootstrap, Flask, sessions og REST.",
    longDescription:
      "Dette er ryggraden i DAT-1000 og DTE-2509. Du lærer å levere HTML med Jinja-templates, style med Bootstrap-klasser, ta imot skjemaer, autentisere brukere med session, snakke med MySQL, og levere JSON som et API. Capstone er Flask App Builder hvor du kombinerer alt.",
    prerequisites: ["Python-grunnlag (variabler, lister, dicts, funksjoner)"],
    estimatedHours: "20–30 timer",
    color: "brand",
    capstoneStackSlug: "flask-app-builder",
    capstoneNote:
      "Bruk Flask App Builder til å sette sammen din egen Flask-app med valgte features og se ferdig generert kode.",
    sections: [
      {
        title: "1. Forutsetninger — HTTP og HTML",
        description: "Skjønn protokollen før du bygger appen.",
        steps: [
          { kind: "stack", ref: "http-anatomi", note: "request/response, status-koder, headere, cookies" },
          { kind: "stack", ref: "html-jinja", note: "HTML + Jinja-templates: variabler, løkker, if-else" },
          { kind: "stack", ref: "css-moderne", note: "Grunnleggende CSS — selektorer, flexbox, bokssmodell" },
        ],
      },
      {
        title: "2. Første Flask-app",
        description: "App-instans, første route, test_client.",
        steps: [
          { kind: "stack", ref: "flask-livssyklus", note: "Request → route → response — hva skjer mellom" },
          { kind: "exercise", ref: "py-flask-app-init" },
          { kind: "exercise", ref: "py-flask-route-init" },
          { kind: "exercise", ref: "py-flask-test-client-init" },
          { kind: "exercise", ref: "py-flask-hello" },
        ],
      },
      {
        title: "3. URL-parametre og dynamiske routes",
        description: "Fang verdier fra URL-en.",
        steps: [
          { kind: "exercise", ref: "py-flask-url-param" },
          { kind: "exercise", ref: "py-flask-multi-param" },
        ],
      },
      {
        title: "4. Jinja-templates",
        description: "Send data fra route til HTML.",
        steps: [
          { kind: "exercise", ref: "py-flask-jinja" },
        ],
      },
      {
        title: "5. Skjemaer (POST)",
        description: "Ta imot data fra HTML-form.",
        steps: [
          { kind: "exercise", ref: "py-flask-form-post" },
          { kind: "exercise", ref: "py-flask-file-storage", note: "Fattigmanns-DB: lagre tall i fil" },
        ],
      },
      {
        title: "6. Bootstrap-styling",
        description: "Gi appen et profesjonelt utseende.",
        steps: [
          { kind: "exercise", ref: "py-flask-bs-container" },
          { kind: "exercise", ref: "py-flask-bs-button" },
          { kind: "exercise", ref: "py-flask-bs-form" },
          { kind: "exercise", ref: "py-flask-bs-table" },
          { kind: "exercise", ref: "py-flask-bs-alert" },
          { kind: "exercise", ref: "py-flask-bs-grid" },
          { kind: "exercise", ref: "py-flask-bs-card" },
          { kind: "exercise", ref: "py-flask-bs-navbar" },
        ],
      },
      {
        title: "7. Sessions og login",
        description: "Holde styr på hvem som er pålogget.",
        steps: [
          { kind: "exercise", ref: "py-flask-secret-key-init" },
          { kind: "exercise", ref: "py-flask-session-init" },
          { kind: "exercise", ref: "py-flask-login-1-decorator" },
          { kind: "exercise", ref: "py-flask-login-2-post-login" },
          { kind: "exercise", ref: "py-flask-login-3-combine" },
          { kind: "exercise", ref: "py-flask-login-4-full-test" },
        ],
      },
      {
        title: "8. Database — MySQL fra Flask",
        description: "Koble Flask til en relasjonsdatabase.",
        steps: [
          { kind: "stack", ref: "mvc-monster", note: "Model-View-Controller-arkitektur" },
          { kind: "exercise", ref: "py-flask-db" },
        ],
      },
      {
        title: "9. JSON-API",
        description: "Bygg endpoints som andre apps kan kalle.",
        steps: [
          { kind: "exercise", ref: "py-flask-json-api" },
        ],
      },
      {
        title: "10. Capstone — bygg din egen app",
        description: "Sett sammen alt du har lært.",
        steps: [
          { kind: "capstone", ref: "flask-app-builder" },
        ],
      },
    ],
  },

  // ============ 2. Backend & database =====================================
  {
    id: "backend-db",
    label: "Backend & database",
    blurb: "REST-API mot relasjonsdatabase — SQL, ER-modell, normalisering, Flask + MySQL.",
    longDescription:
      "Backend-utviklere må kunne SQL, ER-modellering og hvordan man designer normaliserte skjemaer FØR de skriver kode. Dette sporet bygger fra modellering via spørringer til ferdig Flask + MySQL + JSON-API.",
    prerequisites: ["Grunnleggende SQL (SELECT, INSERT, UPDATE) — eller ta /kurs først"],
    estimatedHours: "15–25 timer",
    color: "purple",
    capstoneStackSlug: "flask-app-builder",
    capstoneNote: "Bygg en CRUD-app via Flask App Builder med database + JSON-API + Bearer-token.",
    sections: [
      {
        title: "1. Datamodellering",
        description: "Tegn entiteter og relasjoner før du skriver SQL.",
        steps: [
          { kind: "stack", ref: "er-mapping", note: "ER-diagram → tabeller — krakefot-notasjon" },
          { kind: "stack", ref: "normalisering", note: "1NF → 3NF — fjern duplikater" },
          { kind: "stack", ref: "nokler", note: "Primær/fremmed/composite-nøkler" },
        ],
      },
      {
        title: "2. SQL-mestring",
        description: "Spørringer som faktisk skalerer.",
        steps: [
          { kind: "stack", ref: "subqueries", note: "Spørringer i spørringer" },
          { kind: "stack", ref: "indekser", note: "Hvorfor noen spørringer er trege" },
          { kind: "stack", ref: "query-optimisering", note: "EXPLAIN og lese plan" },
          { kind: "stack", ref: "transaksjoner", note: "ACID og isolasjonsnivå" },
        ],
      },
      {
        title: "3. Koble Python til databasen",
        description: "mysql.connector og parametriserte spørringer.",
        steps: [
          { kind: "exercise", ref: "py-mysql-connect" },
          { kind: "exercise", ref: "py-mysql-select" },
          { kind: "exercise", ref: "py-mysql-insert" },
          { kind: "exercise", ref: "py-mysql-prepared" },
        ],
      },
      {
        title: "4. Flask + MySQL",
        description: "Levér data fra DB gjennom HTTP.",
        steps: [
          { kind: "stack", ref: "flask-livssyklus" },
          { kind: "exercise", ref: "py-flask-db" },
        ],
      },
      {
        title: "5. JSON-API + sikkerhet",
        description: "Andre apper trenger maskinlesbar tilgang.",
        steps: [
          { kind: "exercise", ref: "py-flask-json-api" },
          { kind: "exercise", ref: "py-bearer-token" },
        ],
      },
      {
        title: "6. Capstone",
        description: "Hele backend-stacken som ett prosjekt.",
        steps: [
          { kind: "capstone", ref: "flask-app-builder" },
        ],
      },
    ],
  },

  // ============ 3. React frontend ==========================================
  {
    id: "react-frontend",
    label: "React frontend",
    blurb: "HTML → CSS → JS → TypeScript → React. Bygg komponenter som snakker med backend.",
    longDescription:
      "Hvis backend-en er gjort, trenger du en frontend som ikke føles fra 2003. Dette sporet starter fra HTML og bygger via vanilje-JS til React med komponent-tilstand, props og effekter. Avsluttes med en React-side som henter data fra et REST-API.",
    prerequisites: ["HTML-grunnlag", "Basal JS-kunnskap er nyttig"],
    estimatedHours: "20–30 timer",
    color: "success",
    capstoneStackSlug: "react-grunnlag",
    capstoneNote:
      "Bygg en liten React-app som henter `/api/kunder` fra Flask App Builder-en og rendrer dem som Bootstrap-cards.",
    sections: [
      {
        title: "1. HTML og CSS-grunnlag",
        description: "Markup og styling — fundamentet.",
        steps: [
          { kind: "stack", ref: "http-anatomi", note: "HTML leveres via HTTP — skjønn protokollen først" },
          { kind: "stack", ref: "html-jinja" },
          { kind: "stack", ref: "css-moderne" },
        ],
      },
      {
        title: "2. JavaScript",
        description: "Språket nettleseren snakker.",
        steps: [
          { kind: "stack", ref: "javascript-grunnlag", note: "var/let/const, funksjoner, array-metoder, fetch" },
        ],
      },
      {
        title: "3. TypeScript",
        description: "Statisk typing for større prosjekter.",
        steps: [
          { kind: "stack", ref: "typescript", note: "interface, type, generics — hvorfor React-appene bruker TS" },
        ],
      },
      {
        title: "4. React",
        description: "Komponent-modellen — JSX, props, state, useEffect.",
        steps: [
          { kind: "stack", ref: "react-grunnlag", note: "useState, useEffect, props, key" },
        ],
      },
      {
        title: "5. Capstone — koble til backend",
        description: "Frontend trenger data. Hent fra Flask-backend-en.",
        steps: [
          { kind: "capstone", ref: "react-grunnlag" },
        ],
      },
    ],
  },

  // ============ 4. Data-ingeniør i Python =================================
  {
    id: "data-engineer",
    label: "Data-ingeniør i Python",
    blurb: "Pandas, EDA, statistikk og ML-modeller — hele DTE-2602-prosjektflyten.",
    longDescription:
      "For en data-ingeniør er Python + Pandas + statistikk + scikit-learn det daglige verktøyet. Dette sporet starter fra deskriptiv statistikk og bygger via EDA og preprocessing til komplette ML-pipelines med kryss-validering og evaluering.",
    prerequisites: ["Python-grunnlag", "Litt sannsynlighet/statistikk er en fordel"],
    estimatedHours: "30–50 timer",
    color: "warning",
    capstoneStackSlug: "dte2602-mappe-mal",
    capstoneNote: "Komplett ML-mappe-prosjekt — fra rådata til evaluert modell med rapport.",
    sections: [
      {
        title: "1. Statistikk-fundament",
        description: "Du må kunne fordelinger før du tolker en modell.",
        steps: [
          { kind: "stack", ref: "tek1-deskriptiv", note: "Gjennomsnitt, varians, kvartiler" },
          { kind: "stack", ref: "tek1-sannsynlighet", note: "Sannsynlighet og betingede hendelser" },
          { kind: "stack", ref: "tek1-fordelinger", note: "Normal, binomial, t-fordeling" },
          { kind: "stack", ref: "tek1-estimering-ki", note: "Konfidensintervaller" },
        ],
      },
      {
        title: "2. Pandas og EDA",
        description: "Last data, beskriv, visualiser.",
        steps: [
          { kind: "stack", ref: "dte2602-eda-pandas", note: "describe(), info(), groupby, plotting" },
          { kind: "exercise", ref: "dte2602-py-iris-describe" },
          { kind: "exercise", ref: "dte2602-py-iris-corr" },
          { kind: "exercise", ref: "dte2602-py-iris-class-balance" },
        ],
      },
      {
        title: "3. Preprocessing-pipeline",
        description: "Skalering, one-hot, missing values — på en reproduserbar måte.",
        steps: [
          { kind: "stack", ref: "dte2602-preprocessing-pipeline", note: "ColumnTransformer, Pipeline" },
          { kind: "exercise", ref: "dte2602-py-coltransformer" },
          { kind: "exercise", ref: "dte2602-py-pipeline-cv" },
        ],
      },
      {
        title: "4. Modeller",
        description: "Lineær, logistisk, trær, naive Bayes.",
        steps: [
          { kind: "stack", ref: "dte2602-trees-rf", note: "Decision trees + random forest" },
          { kind: "exercise", ref: "dte2602-py-lr-iris-binary" },
          { kind: "exercise", ref: "dte2602-py-logreg-coef" },
          { kind: "exercise", ref: "dte2602-py-knn-grid" },
          { kind: "exercise", ref: "dte2602-py-lda-iris" },
        ],
      },
      {
        title: "5. Evaluering",
        description: "Confusion matrix, ROC, kryss-validering.",
        steps: [
          { kind: "stack", ref: "dte2602-evaluering-metoder" },
          { kind: "stack", ref: "dte2602-evaluation-roc" },
          { kind: "exercise", ref: "dte2602-py-confusion-matrix" },
          { kind: "exercise", ref: "dte2602-py-classification-report" },
          { kind: "exercise", ref: "dte2602-py-roc-manual" },
          { kind: "exercise", ref: "dte2602-py-cv-stratified" },
        ],
      },
      {
        title: "6. Bias/Varians og regularisering",
        description: "Hvorfor en modell underyter på testen.",
        steps: [
          { kind: "stack", ref: "dte2602-bias-varians" },
          { kind: "exercise", ref: "dte2602-py-learning-curve" },
          { kind: "exercise", ref: "dte2602-py-ridge-vs-lasso" },
        ],
      },
      {
        title: "7. Capstone — mappe-prosjekt",
        description: "Hele løypen som ferdig leveranse.",
        steps: [
          { kind: "capstone", ref: "dte2602-mappe-mal" },
        ],
      },
    ],
  },
];

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
