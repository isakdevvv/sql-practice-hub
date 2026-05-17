import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// AuthMatchQuiz — 6 use-cases, match til riktig strategi + begrunnelse.
//
// Bruker drag-not-needed pattern: klikk use-case (venstre), klikk strategi
// (høyre). Feilmatch viser hvorfor det er suboptimalt. Riktig match viser
// begrunnelsen og låses inn.
// ---------------------------------------------------------------------------

type Strategy = "session" | "jwt" | "oauth" | "api-key";

type Case = {
  id: string;
  label: string;
  detail: string;
  correct: Strategy;
  whyCorrect: string;
  /** Forklaringer for hvorfor de gale ikke passer like godt. */
  whyWrong: Record<Strategy, string>;
};

const STRATEGY_META: Record<Strategy, { label: string; sub: string; color: string }> = {
  session: {
    label: "Session-cookie",
    sub: "Server-side state, opaque cookie",
    color: "#0ea5e9",
  },
  jwt: {
    label: "JWT (stateless)",
    sub: "Signert token, ingen DB-lookup",
    color: "#10b981",
  },
  oauth: {
    label: "OAuth 2.0 + OIDC",
    sub: "Delegert auth via tredjepart",
    color: "#a855f7",
  },
  "api-key": {
    label: "Statisk API-nøkkel / mTLS",
    sub: "Lang-levd hemmelighet eller klient-sertifikat",
    color: "#f59e0b",
  },
};

const CASES: Case[] = [
  {
    id: "spa",
    label: "Single-Page App mot egen backend",
    detail:
      "React/Vue-app der både frontend og API ligger på same-site. Trenger trygg login med username+passord, brukerprofiler, logout som faktisk fungerer.",
    correct: "session",
    whyCorrect:
      "Same-site → cookies funker naturlig. HttpOnly+Secure+SameSite=Lax gir XSS+CSRF-forsvar. Logout = slett rad i Redis (umiddelbart revokert). Ingen behov for tokens i JS.",
    whyWrong: {
      session: "",
      jwt:
        "Vanlig feilvalg. JWT i localStorage = XSS leser tokenet. Logout krever blacklist-DB → har du allerede state, hvorfor JWT?",
      oauth:
        "Overkill når du eier både frontend og backend. OAuth er for delegert tilgang, ikke egen brukerautentisering.",
      "api-key":
        "API-nøkler er for maskin-til-maskin, ikke human end-users som logger inn.",
    },
  },
  {
    id: "microservices",
    label: "Microservices — service A kaller service B på vegne av bruker",
    detail:
      "10+ Go-tjenester bak et API-gateway. Service A trenger å videreformidle 'hvem brukeren er' til service B uten å gå tilbake til auth-service for hvert hopp.",
    correct: "jwt",
    whyCorrect:
      "Stateless verifisering = service B trenger bare public key. Kortlevd JWT (5–15 min) bæres mellom tjenestene. Ingen sentral session-store som flaskehals.",
    whyWrong: {
      session:
        "Hver tjeneste måtte slått opp i sentral session-store på hvert kall. Latens + sentralisert risiko.",
      jwt: "",
      oauth:
        "OAuth løser bruker→app, ikke service→service. (Du KAN bruke client-credentials-grant her, men det er en JWT som faller ut.)",
      "api-key":
        "Statisk nøkkel mister bruker-identitet — service B vet bare at A kaller, ikke hvilken bruker.",
    },
  },
  {
    id: "mobile",
    label: "Mobil-app med 'Logg inn med Google'",
    detail:
      "iOS/Android-app der brukere logger inn med Google/Apple/Facebook. Skal også jobbe offline en kort stund.",
    correct: "oauth",
    whyCorrect:
      "Bruker eier kontoen hos Google — app skal aldri se passordet. OAuth 2.0 Authorization Code + PKCE (RFC 8252) er standarden for native apps. Refresh_token lar appen jobbe lenger uten ny login.",
    whyWrong: {
      session:
        "Cookies er klønete på native mobile (ingen nettleser-kontekst). Bruker måtte tastet passordet hos deg — du eier ikke kontoen.",
      jwt:
        "JWT er det DU utsteder, men spørsmålet er hvordan brukeren autentiserer FØR du utsteder. 'Logg inn med Google' = OAuth.",
      oauth: "",
      "api-key": "End-user → krever ekte autentisering, ikke en delt nøkkel.",
    },
  },
  {
    id: "server-to-server",
    label: "Server-til-server: cron-jobb sender data til intern API",
    detail:
      "Et nattlig batch-script på server A skal POST-e til intern API på server B. Begge sider eies av samme org. Ingen sluttbruker involvert.",
    correct: "api-key",
    whyCorrect:
      "Ingen bruker = ingen grunn til session/JWT/OAuth-flows. Lang-levd API-nøkkel (eller bedre: mTLS-sertifikat) i hemmelighet-vault. Roteres regelmessig.",
    whyWrong: {
      session: "Sessions handler om brukere som logger inn. Det er ingen bruker.",
      jwt: "Du kan utstede JWT, men da må noe utstede dem — du har allerede en lang-levd nøkkel som gjør det enklere.",
      oauth:
        "OAuth client-credentials kan brukes, men er overkill når begge sider er din egen infrastruktur uten delegering.",
      "api-key": "",
    },
  },
  {
    id: "banking",
    label: "Banking-app med høye sikkerhetskrav",
    detail:
      "Nettbank med innskudd, overføringer, MFA. Strenge krav til revokering ('logg av alle enheter'), revisjon, kort exp.",
    correct: "session",
    whyCorrect:
      "Banking trenger umiddelbar revokering, MFA-state, device-tracking, anomalideteksjon — alt server-side. Session-cookie + Redis er den enkleste måten å holde nøyaktig kontroll. Stateless JWT er IKKE OK her: kan ikke revokere på sekundet uten å betale med blacklist-DB.",
    whyWrong: {
      session: "",
      jwt:
        "Ikke revokerbar uten blacklist. Hvis en bruker melder fra om mistenkelig aktivitet, må du kunne kaste ut hen nå — ikke om 15 min.",
      oauth:
        "Banken eier brukeren selv — ingen tredjepart. (Men OAuth kan utstede tokens INTERNT mellom bank-tjenester, det er en annen sak.)",
      "api-key": "Ingen langvarig delt hemmelighet for end-users.",
    },
  },
  {
    id: "iot",
    label: "IoT-enheter (smart-sensorer) som rapporterer til skyen",
    detail:
      "1000+ temperaturlogg-enheter ute i felten sender målinger hver 5. minutt. Enhetene har innebygd hemmelighet ved provisionering. Skal ikke logge inn som mennesker.",
    correct: "api-key",
    whyCorrect:
      "Statisk nøkkel eller helst mTLS-sertifikat per enhet. Provisioneres ved fabrikk-flashing. Roteres ved firmware-oppdatering. Ingen interaktiv login mulig — enheten har ikke tastatur eller bruker.",
    whyWrong: {
      session: "Krever interaktiv login. Enheten har ingen bruker.",
      jwt:
        "JWT signert med hva? Hvis enheten har en privat nøkkel, kan den signere — men da gjør du essensielt mTLS uten bibliotek-støtten.",
      oauth:
        "OAuth Device Authorization Grant (RFC 8628) finnes for IoT MED display, men ren sensor-uten-skjerm: API-nøkkel/mTLS.",
      "api-key": "",
    },
  },
];

type MatchState = Record<string, Strategy | null>;

export function AuthMatchQuiz() {
  const [matches, setMatches] = useState<MatchState>(() =>
    Object.fromEntries(CASES.map((c) => [c.id, null])) as MatchState,
  );
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ caseId: string; strategy: Strategy } | null>(null);

  const allCorrect = useMemo(
    () => CASES.every((c) => matches[c.id] === c.correct),
    [matches],
  );
  const correctCount = useMemo(
    () => CASES.filter((c) => matches[c.id] === c.correct).length,
    [matches],
  );

  function chooseStrategy(strategy: Strategy) {
    if (!selectedCase) return;
    const c = CASES.find((x) => x.id === selectedCase)!;
    setFeedback({ caseId: selectedCase, strategy });
    if (strategy === c.correct) {
      setMatches((m) => ({ ...m, [selectedCase]: strategy }));
      setSelectedCase(null);
    }
  }

  function reset() {
    setMatches(Object.fromEntries(CASES.map((c) => [c.id, null])) as MatchState);
    setSelectedCase(null);
    setFeedback(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Match quiz
          </div>
          <div className="text-sm font-semibold">
            Hvilken auth-strategi passer hvilken use-case?
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {correctCount}/{CASES.length} riktig
          </span>
          <button
            type="button"
            onClick={reset}
            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nullstill
          </button>
        </div>
      </div>

      <div className="p-4 grid md:grid-cols-2 gap-3">
        {/* Left: use-cases */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Use-cases
          </div>
          {CASES.map((c) => {
            const matched = matches[c.id];
            const isSelected = selectedCase === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCase(matched ? null : c.id)}
                disabled={matched !== null}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  matched
                    ? "border-emerald-300 bg-emerald-50/50 opacity-80"
                    : isSelected
                      ? "border-brand bg-brand/5 ring-2 ring-brand/30"
                      : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="text-sm font-semibold flex items-center justify-between gap-2">
                  <span>{c.label}</span>
                  {matched && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  {c.detail}
                </div>
                {matched && (
                  <div className="mt-2 text-[11px] inline-flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: STRATEGY_META[matched].color }}
                    />
                    <span className="font-medium">{STRATEGY_META[matched].label}</span>
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground italic">{c.whyCorrect}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: strategies */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            Strategier — klikk for å matche valgt use-case
          </div>
          {(Object.keys(STRATEGY_META) as Strategy[]).map((s) => {
            const meta = STRATEGY_META[s];
            const disabled = !selectedCase;
            return (
              <button
                key={s}
                type="button"
                onClick={() => chooseStrategy(s)}
                disabled={disabled}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  disabled
                    ? "border-border/50 opacity-50 cursor-not-allowed"
                    : "border-border hover:bg-muted/40 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ background: meta.color }}
                  />
                  <span className="text-sm font-semibold">{meta.label}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{meta.sub}</div>
              </button>
            );
          })}

          {feedback && (
            <FeedbackBox
              feedback={feedback}
              onDismiss={() => setFeedback(null)}
            />
          )}
        </div>
      </div>

      {allCorrect && (
        <div className="m-4 mt-0 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Alle riktig!
          </div>
          <p className="mt-1 text-xs leading-snug">
            Nøkkelregel: spør «hvem autentiserer hvem, og hvem eier kontoen?» — det styrer valget
            mer enn token-formatet i seg selv.
          </p>
        </div>
      )}
    </div>
  );
}

function FeedbackBox({
  feedback,
  onDismiss,
}: {
  feedback: { caseId: string; strategy: Strategy };
  onDismiss: () => void;
}) {
  const c = CASES.find((x) => x.id === feedback.caseId)!;
  const correct = feedback.strategy === c.correct;
  return (
    <div
      className={`rounded-lg border p-3 text-xs ${
        correct
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : "border-rose-300 bg-rose-50 text-rose-900"
      }`}
    >
      <div className="font-semibold flex items-center gap-1.5">
        {correct ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" /> Riktig — {STRATEGY_META[feedback.strategy].label}
          </>
        ) : (
          <>
            <XCircle className="h-3.5 w-3.5" /> Ikke optimalt
          </>
        )}
      </div>
      <p className="mt-1 leading-snug">
        {correct ? c.whyCorrect : c.whyWrong[feedback.strategy]}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-[10px] underline"
      >
        Lukk og prøv igjen
      </button>
    </div>
  );
}
