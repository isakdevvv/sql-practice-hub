import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Lock,
  ArrowRight,
  Globe,
  Cookie as CookieIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// CsrfSandbox — interaktiv CSRF-angreps-simulator.
//
// Setup: brukeren har én tab åpen mot bank.com med en gyldig session-cookie.
// I en annen tab åpner brukeren evil.com som inneholder en skjult auto-submit
// form mot bank.com/transfer. Cookien følger med automatisk.
//
// Defense-modi:
//   none            → ingen forsvar; angrep lykkes
//   samesite-lax    → cookie blokkeres på cross-site POST (men ikke GET top-level)
//   samesite-strict → cookie blokkeres på alle cross-site requests
//   csrf-token      → server krever hemmelig token; evil.com kan ikke lese det
//   referer-check   → server validerer Referer/Origin header (svakheter finnes)
// ---------------------------------------------------------------------------

type Defense = "none" | "samesite-lax" | "samesite-strict" | "csrf-token" | "referer-check";

type Step = {
  who: "user" | "evil" | "browser" | "bank";
  text: string;
  tone: "info" | "bad" | "good";
};

const DEFENSE_INFO: Record<
  Defense,
  {
    label: string;
    icon: typeof Shield;
    color: string;
    desc: string;
    weakness?: string;
  }
> = {
  none: {
    label: "Ingen beskyttelse",
    icon: ShieldAlert,
    color: "text-destructive",
    desc: "Session-cookien sendes automatisk på enhver request mot bank.com — uansett hvilken side som initierte den.",
  },
  "samesite-lax": {
    label: "Cookie SameSite=Lax",
    icon: Shield,
    color: "text-amber-600 dark:text-amber-400",
    desc: "Browseren sender cookien KUN på same-site requests OG på top-level GET-navigasjon. Cross-site POST blokkeres.",
    weakness: "GET-baserte endringer er fortsatt sårbare (men slike bør ikke finnes).",
  },
  "samesite-strict": {
    label: "Cookie SameSite=Strict",
    icon: ShieldCheck,
    color: "text-success",
    desc: "Cookien sendes ALDRI på cross-site requests. Også eksterne lenker mister sesjonen — strengeste valg.",
    weakness: "Dårlig UX: lenker fra epost / andre sites logger brukeren ut.",
  },
  "csrf-token": {
    label: "CSRF-token (synchronizer)",
    icon: ShieldCheck,
    color: "text-success",
    desc: "Server genererer hemmelig token per session og legger det som hidden input i bankens egne forms. POST må inneholde tokenet. Evil.com kan ikke lese det (Same-Origin Policy).",
  },
  "referer-check": {
    label: "Referer/Origin-header-sjekk",
    icon: Shield,
    color: "text-amber-600 dark:text-amber-400",
    desc: "Server sjekker at Origin- eller Referer-header peker mot bank.com.",
    weakness: "Referer kan mangle (privacy-modus, meta refresh). Stol aldri på den alene — bruk som tilleggssjekk.",
  },
};

const EVIL_HTML = `<!-- evil.com/funny-cats.html -->
<!DOCTYPE html>
<body onload="document.forms[0].submit()">
  <h1>Look at these cats!</h1>
  <form method="POST" action="https://bank.com/transfer">
    <input type="hidden" name="to"     value="attacker">
    <input type="hidden" name="amount" value="5000">
  </form>
</body>`;

const BANK_FORM_NO_TOKEN = `<!-- bank.com/transfer (server-rendered) -->
<form method="POST" action="/transfer">
  <input name="to">
  <input name="amount">
  <button>Overfør</button>
</form>
<!-- Ingen CSRF-token — eneste sikkerhet er sesjon-cookien -->`;

const BANK_FORM_WITH_TOKEN = `<!-- bank.com/transfer (med CSRF-beskyttelse) -->
<form method="POST" action="/transfer">
  <input type="hidden" name="csrf_token"
         value="a7d3...random...e91f">
  <input name="to">
  <input name="amount">
  <button>Overfør</button>
</form>`;

function buildScenario(defense: Defense): {
  steps: Step[];
  cookieSent: boolean;
  refererBlocked: boolean;
  tokenPresent: boolean;
  finalOutcome: "success" | "blocked";
  blockedReason: string;
} {
  const steps: Step[] = [];
  steps.push({
    who: "user",
    text: "Bruker logger inn på bank.com — får cookie sid=abc123",
    tone: "info",
  });
  steps.push({
    who: "user",
    text: "Bruker åpner ny tab og besøker evil.com (uten å logge ut av banken)",
    tone: "info",
  });
  steps.push({
    who: "evil",
    text: "evil.com sender HTML som inneholder skjult <form action=bank.com/transfer>",
    tone: "bad",
  });
  steps.push({
    who: "browser",
    text: "onload-handler kjører document.forms[0].submit() — POST mot bank.com",
    tone: "bad",
  });

  // Cookie-policy
  let cookieSent = true;
  if (defense === "samesite-strict" || defense === "samesite-lax") {
    cookieSent = false;
    steps.push({
      who: "browser",
      text:
        defense === "samesite-strict"
          ? "Cookie sid=abc123 har SameSite=Strict — browseren utelater den fra cross-site POST"
          : "Cookie sid=abc123 har SameSite=Lax — utelates fra cross-site POST (Lax tillater bare top-level GET)",
      tone: "good",
    });
  } else {
    steps.push({
      who: "browser",
      text: "Cookie sid=abc123 sendes automatisk med requesten (default: SameSite=None / ingen flag)",
      tone: "bad",
    });
  }

  // Referer-sjekk
  let refererBlocked = false;
  if (defense === "referer-check") {
    refererBlocked = true;
    steps.push({
      who: "bank",
      text: "Server sjekker Origin: evil.com !== bank.com — avviser",
      tone: "good",
    });
  }

  // CSRF-token
  let tokenPresent = true;
  if (defense === "csrf-token") {
    tokenPresent = false;
    steps.push({
      who: "bank",
      text: "Server krever csrf_token i body — request mangler det (evil.com kunne ikke lese bankens session)",
      tone: "good",
    });
  }

  // Outcome
  let finalOutcome: "success" | "blocked" = "success";
  let blockedReason = "";

  if (!cookieSent) {
    finalOutcome = "blocked";
    blockedReason = "Cookie ble ikke sendt — server ser brukeren som uautentisert (401)";
  } else if (refererBlocked) {
    finalOutcome = "blocked";
    blockedReason = "Origin-header avslørte at requesten kom fra annen site";
  } else if (!tokenPresent) {
    finalOutcome = "blocked";
    blockedReason = "CSRF-token validering feilet (HTTP 403)";
  }

  if (finalOutcome === "success") {
    steps.push({
      who: "bank",
      text: "Server: sesjon gyldig, ingen ekstra sjekk → 5000 kr overført til 'attacker' ✗",
      tone: "bad",
    });
  } else {
    steps.push({
      who: "bank",
      text: `Server avviser requesten — ${blockedReason}`,
      tone: "good",
    });
  }

  return { steps, cookieSent, refererBlocked, tokenPresent, finalOutcome, blockedReason };
}

export function CsrfSandbox() {
  const [defense, setDefense] = useState<Defense>("none");
  const [showAttack, setShowAttack] = useState(false);

  const scenario = buildScenario(defense);
  const info = DEFENSE_INFO[defense];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-3 border-b border-border ${info.color.includes("destructive") ? "bg-destructive/10" : info.color.includes("success") ? "bg-success/10" : "bg-amber-500/10"}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <info.icon className={`h-5 w-5 ${info.color}`} />
            <h3 className={`font-semibold ${info.color}`}>
              CSRF-sandbox — forsvar: {info.label}
            </h3>
          </div>
          <button
            onClick={() => setShowAttack((v) => !v)}
            className="px-3 py-1 rounded text-xs font-medium bg-foreground text-background hover:bg-foreground/90"
          >
            {showAttack ? "Skjul flyt" : "Kjør angrep"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{info.desc}</p>
        {info.weakness && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            <strong>Svakhet:</strong> {info.weakness}
          </p>
        )}
      </div>

      {/* Defense-toggle */}
      <div className="px-5 py-3 border-b border-border bg-muted/20">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Velg forsvar
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(DEFENSE_INFO) as Defense[]).map((d) => (
            <button
              key={d}
              onClick={() => setDefense(d)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                defense === d
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {DEFENSE_INFO[d].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-0 divide-x divide-border">
        {/* Tab 1: bank */}
        <div className="p-4 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Tab 1: bank.com
            </span>
          </div>
          <div className="rounded border border-border bg-background p-3 mb-3">
            <div className="text-xs text-muted-foreground mb-1">Innlogget som:</div>
            <div className="text-sm font-mono">user@example.com</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <CookieIcon className="h-3.5 w-3.5 text-amber-600" />
              <code className="text-[10px]">
                sid=abc123
                {defense === "samesite-lax" && "; SameSite=Lax"}
                {defense === "samesite-strict" && "; SameSite=Strict"}
              </code>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Bankens transfer-form
          </div>
          <pre className="rounded bg-background border border-border p-2 font-mono text-[10px] overflow-x-auto whitespace-pre">
            {defense === "csrf-token" ? BANK_FORM_WITH_TOKEN : BANK_FORM_NO_TOKEN}
          </pre>
        </div>

        {/* Tab 2: evil */}
        <div className="p-4 bg-destructive/5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">
              Tab 2: evil.com
            </span>
          </div>
          <div className="rounded border border-destructive/30 bg-background p-3 mb-3">
            <div className="text-xs text-foreground italic">"Look at these cats!"</div>
            <div className="text-[10px] text-destructive mt-1">
              (men &lt;form&gt; auto-submitter i bakgrunnen)
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
            Skjult angreps-form
          </div>
          <pre className="rounded bg-background border border-destructive/30 p-2 font-mono text-[10px] overflow-x-auto whitespace-pre">
            {EVIL_HTML}
          </pre>
        </div>

        {/* Flyt */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold">Angreps-flyt</span>
          </div>
          {!showAttack ? (
            <div className="text-xs text-muted-foreground italic rounded border border-dashed border-border p-3">
              Klikk "Kjør angrep" for å se hvert steg.
            </div>
          ) : (
            <div className="space-y-1.5">
              {scenario.steps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-[11px] rounded p-2 ${
                    s.tone === "bad"
                      ? "bg-destructive/5 border border-destructive/20"
                      : s.tone === "good"
                      ? "bg-success/5 border border-success/20"
                      : "bg-muted/30 border border-border"
                  }`}
                >
                  <ArrowRight
                    className={`h-3 w-3 mt-0.5 shrink-0 ${
                      s.tone === "bad"
                        ? "text-destructive"
                        : s.tone === "good"
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <span className="font-mono text-[9px] uppercase text-muted-foreground mr-1">
                      [{s.who}]
                    </span>
                    <span
                      className={
                        s.tone === "bad"
                          ? "text-destructive"
                          : s.tone === "good"
                          ? "text-success"
                          : "text-foreground"
                      }
                    >
                      {s.text}
                    </span>
                  </div>
                </div>
              ))}

              <div
                className={`mt-3 rounded-lg border-2 p-3 text-center text-xs font-semibold ${
                  scenario.finalOutcome === "success"
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-success bg-success/10 text-success"
                }`}
              >
                {scenario.finalOutcome === "success"
                  ? "Angrep LYKTES — penger overført til angriper"
                  : "Angrep BLOKKERT"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer-forklaring */}
      <div className="px-5 py-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <strong className="text-foreground">Hvorfor virker CSRF i utgangspunktet?</strong>{" "}
        Browseren skiller ikke på hvem som <em>initierte</em> requesten — bare hvilken{" "}
        <em>destinasjon</em> den går mot. Når destinasjonen er bank.com, sender browseren
        bank.com sine cookies automatisk, uansett hvilken side som lagde requesten.
        Forsvarene over bryter dette på ulike måter: SameSite endrer cookie-policyen,
        token-sjekk krever en hemmelighet som angriperen ikke kan lese, Referer/Origin
        identifiserer opphavet eksplisitt.
      </div>
    </div>
  );
}
