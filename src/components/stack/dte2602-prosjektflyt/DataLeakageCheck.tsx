import { useMemo, useState } from "react";
import { Check, X, RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";

// --------------------------------------------------------------------------
// DataLeakageCheck — interaktiv scenario-quiz. Studenten leser et lite
// case fra et tenkt ML-prosjekt og må klassifisere det som:
//   - lekkasje  (test-info, framtidig-info, eller target lekker inn)
//   - ok        (legitim feature/operasjon)
//
// Hvert scenario har en forklaring som låses opp etter svar. Quizen
// holder oversikt over score og lar studenten resette.
// --------------------------------------------------------------------------

type Verdict = "leakage" | "ok";

type Scenario = {
  id: string;
  text: string;
  answer: Verdict;
  why: string;
  fix?: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "scaler-on-all",
    text: "Du kjører `StandardScaler().fit_transform(X)` på HELE X, og deretter splitter du til train/test.",
    answer: "leakage",
    why: "Scaler-en så middelverdi og standardavvik fra TEST-radene da den ble fittet. Test-statistikken lakk inn i preprosessering, og test-accuracy blir optimistisk.",
    fix: "Split først. Deretter `scaler.fit(X_train)` + `scaler.transform(X_train)` og `scaler.transform(X_test)`. Aller best: legg scaleren inn i en Pipeline.",
  },
  {
    id: "target-encoding-leak",
    text: "Du bruker `target_mean_encoding` på en kategorisk feature ved å regne ut gjennomsnittlig y per kategori på HELE datasettet, og bruker det som ny tall-feature.",
    answer: "leakage",
    why: "Encodingen av hver test-rad er basert på en target-statistikk som inkluderer den raden selv (og andre test-rader). y har lakket inn i X.",
    fix: "Bruk out-of-fold target encoding, eller fit encoderen kun på train og transform på test.",
  },
  {
    id: "future-feature",
    text: "Du predikerer om en kunde vil churne neste måned. En av dine features er `antall_supporthenvendelser_siste_30_dager`, samlet inn ved samme tidspunkt som labelen.",
    answer: "leakage",
    why: "Hvis labelen ble registrert SAMTIDIG med featuren, måler du noe som skjedde etter du «ville ha predikert». I produksjon har du ikke fremtidige supporthenvendelser tilgjengelig på prediksjonstidspunktet.",
    fix: "Definer en klar prediksjonstid t₀, og bruk kun features kjent FØR t₀. For churn: bruk supporthenvendelser fra 30 dager FØR t₀, label fra perioden ETTER t₀.",
  },
  {
    id: "tuning-on-test",
    text: "Du tuner hyperparametre med GridSearchCV på X_train, finner beste params, tester på X_test, ser at det ble dårligere enn ventet, og kjører grid på nytt med andre params for å forbedre test-score.",
    answer: "leakage",
    why: "Andre runde med tuning er informert av test-resultatet. Test-settet er nå et val-sett i forkledning, og final-tallet er ikke lenger en upartisk estimater for generalisering.",
    fix: "Hold test-settet helt urørt. Lag heller en eksplisitt train/val/test-splitt, og bruk val-settet til all itterering.",
  },
  {
    id: "smote-before-split",
    text: "Du har et ubalansert datasett. Du kjører SMOTE-oversampling på HELE X før du splitter til train/test.",
    answer: "leakage",
    why: "SMOTE genererer syntetiske eksempler ved å interpolere mellom nærmeste naboer. Hvis det skjer før split, kan en syntetisk test-rad være laget med en train-rad som nabo — modellen har sett en nær-versjon av test-eksempelet.",
    fix: "Split først, deretter SMOTE KUN på X_train.",
  },
  {
    id: "id-column",
    text: "Du dropper kolonnen `kunde_id` før trening fordi en ID ikke kan ha prediktiv kraft.",
    answer: "ok",
    why: "Helt riktig håndtering. En tilfeldig ID skal ikke være feature. (Vær obs: hvis ID-en har skjult struktur — f.eks. tildelt i tidsrekkefølge — kan en modell pluke opp tidsmønster. Sjekk det da.)",
  },
  {
    id: "log-transform-train",
    text: "Du log-transformerer `pris` ved å bruke `np.log1p(X_train['pris'])` og `np.log1p(X_test['pris'])` — samme funksjon brukt uavhengig på begge.",
    answer: "ok",
    why: "log1p er en ren elementvis funksjon uten parametre som læres fra data. Ingen statistikk overføres fra test til train, så ingen lekkasje.",
  },
  {
    id: "imputer-before-split",
    text: "Du fyller manglende verdier med median av kolonnen — beregnet på HELE X før split.",
    answer: "leakage",
    why: "Median er en lært statistikk. Når den beregnes på hele X, ser train-imputeringen verdier fra test-radene. Mindre alvorlig enn skalering-lekkasje, men teknisk fortsatt lekkasje.",
    fix: "`SimpleImputer().fit(X_train)`, så `transform(X_test)`. Eller legg imputeren i en Pipeline så det skjer automatisk per fold under cross-validation.",
  },
  {
    id: "time-shuffle",
    text: "Du har en tidsserie med daglige målinger fra 2023-2025 og kjører `train_test_split(X, y, shuffle=True)`.",
    answer: "leakage",
    why: "Med shuffle-split får train-settet rader fra ALLE datoer, inkludert dager mellom test-datoene. Modellen interpolerer i tid og «ser» fremtiden. Generalisering til nye perioder blir grovt overestimert.",
    fix: "Bruk `TimeSeriesSplit` eller manuell split etter dato (f.eks. train ≤ 2024-06, test > 2024-06).",
  },
  {
    id: "remove-duplicates",
    text: "Du fjerner duplikate rader fra hele datasettet før du splitter til train/test.",
    answer: "ok",
    why: "Å fjerne duplikater er en data-cleaning-operasjon som ikke lærer noen modell-parameter. Hvis du IKKE fjernet dem, kunne identiske rader havne i både train og test og gi falskt høy score — så dette er en bug-fiks, ikke lekkasje.",
  },
];

function shuffleDeterministic<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let a = seed >>> 0;
  const rng = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function DataLeakageCheck() {
  const [seed, setSeed] = useState(1);
  const order = useMemo(() => shuffleDeterministic(SCENARIOS, seed), [seed]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Verdict>>({});

  const current = order[idx];
  const answered = answers[current.id];
  const correct = answered === current.answer;
  const done = Object.keys(answers).length;
  const right = order.filter((s) => answers[s.id] === s.answer).length;

  const choose = (v: Verdict) => {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [current.id]: v }));
  };

  const next = () => {
    if (idx < order.length - 1) setIdx(idx + 1);
  };

  const reset = () => {
    setAnswers({});
    setIdx(0);
    setSeed((s) => s + 1);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold">Data-lekkasje: leakage eller ok?</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Les scenarioet og avgjør om det er en lekkasje. Forklaringen vises etter svar.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs tabular-nums text-muted-foreground">
            {right}/{done} riktige · {idx + 1}/{order.length}
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted/50"
          >
            <RotateCcw className="h-3 w-3" /> reset
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
          scenario {idx + 1}
        </div>
        {current.text}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={() => choose("leakage")}
          disabled={!!answered}
          className={`rounded-lg border p-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
            answered
              ? answered === "leakage"
                ? current.answer === "leakage"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                : current.answer === "leakage"
                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                : "border-border opacity-50"
              : "border-border hover:bg-rose-500/5 hover:border-rose-500/40"
          }`}
        >
          <AlertTriangle className="h-4 w-4" /> Lekkasje
        </button>
        <button
          type="button"
          onClick={() => choose("ok")}
          disabled={!!answered}
          className={`rounded-lg border p-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
            answered
              ? answered === "ok"
                ? current.answer === "ok"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                : current.answer === "ok"
                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                : "border-border opacity-50"
              : "border-border hover:bg-emerald-500/5 hover:border-emerald-500/40"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Ok
        </button>
      </div>

      {answered && (
        <div
          className={`mt-3 rounded-lg border p-3 text-sm ${
            correct
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-red-500/40 bg-red-500/5"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
            {correct ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">riktig</span>
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-400">
                  fasit: {current.answer === "leakage" ? "lekkasje" : "ok"}
                </span>
              </>
            )}
          </div>
          <div className="mt-1.5">{current.why}</div>
          {current.fix && (
            <div className="mt-2 text-xs">
              <span className="font-semibold">Fiks:</span> {current.fix}
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={next}
              disabled={idx >= order.length - 1}
              className="text-xs px-3 py-1.5 rounded border border-border hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {idx >= order.length - 1 ? "Ferdig" : "Neste →"}
            </button>
          </div>
        </div>
      )}

      {done === order.length && (
        <div className="mt-3 rounded-lg border-2 border-brand/40 bg-brand/5 p-3 text-sm text-center">
          <span className="font-semibold">Ferdig:</span> {right}/{order.length} riktige.
          {right === order.length
            ? " Lekkasje-radaren er kalibrert. ✨"
            : " Trykk reset for ny runde med stokket rekkefølge."}
        </div>
      )}
    </div>
  );
}
