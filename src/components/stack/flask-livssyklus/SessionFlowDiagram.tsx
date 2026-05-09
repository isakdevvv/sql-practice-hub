type Step = {
  side: "browser" | "server";
  label: string;
  detail: string;
  color: string;
};

const STEPS: Step[] = [
  {
    side: "browser",
    label: "1. POST /login med email + passord",
    detail: "Browseren har ingen session-cookie ennå. Bare form-data.",
    color: "border-blue-500/50 bg-blue-500/5",
  },
  {
    side: "server",
    label: "2. login_user(user) → session['user_id'] = 5",
    detail:
      "Flask serialiserer session-dict til JSON, signerer med SECRET_KEY (HMAC), base64-koder. Setter Set-Cookie: session=eyJ1c2VyX2lkIjo1fQ.signature i responsen.",
    color: "border-emerald-500/50 bg-emerald-500/5",
  },
  {
    side: "browser",
    label: "3. Browser lagrer cookie automatisk",
    detail: "document.cookie = 'session=...'. Browseren sender den med på alle videre requests til samme domene.",
    color: "border-blue-500/50 bg-blue-500/5",
  },
  {
    side: "browser",
    label: "4. GET /konto med Cookie-header",
    detail: "Cookie: session=eyJ1c2VyX2lkIjo1fQ.signature blir sendt automatisk.",
    color: "border-blue-500/50 bg-blue-500/5",
  },
  {
    side: "server",
    label: "5. Flask verifiserer signaturen",
    detail:
      "Sjekker at HMAC stemmer med SECRET_KEY. Hvis ja → decoder JSON, fyller session['user_id'] = 5. Hvis nei (tukla med) → kaster cookien.",
    color: "border-emerald-500/50 bg-emerald-500/5",
  },
  {
    side: "server",
    label: "6. View kjører med session intakt",
    detail: "current_user.id == 5. Sender HTML tilbake. Ingen ny Set-Cookie hvis session er uendret.",
    color: "border-emerald-500/50 bg-emerald-500/5",
  },
];

export function SessionFlowDiagram() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        <div className="text-right">Browser</div>
        <div className="w-3" />
        <div>Server (Flask)</div>
      </div>

      <ol className="space-y-2">
        {STEPS.map((s, i) => {
          const isBrowser = s.side === "browser";
          return (
            <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-3">
              {isBrowser ? (
                <>
                  <div className={`rounded-lg border p-3 ${s.color}`}>
                    <div className="text-sm font-semibold text-foreground">{s.label}</div>
                    <div className="mt-1 text-xs text-foreground/80 leading-relaxed">
                      {s.detail}
                    </div>
                  </div>
                  <Arrow direction="right" />
                  <div />
                </>
              ) : (
                <>
                  <div />
                  <Arrow direction="left" />
                  <div className={`rounded-lg border p-3 ${s.color}`}>
                    <div className="text-sm font-semibold text-foreground">{s.label}</div>
                    <div className="mt-1 text-xs text-foreground/80 leading-relaxed">
                      {s.detail}
                    </div>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-lg border border-border bg-background p-3 text-xs text-foreground/80 leading-relaxed">
        <span className="font-semibold">Viktig:</span> session er <em>klient-side state</em> i en
        signert cookie. Serveren lagrer ingenting — den verifiserer bare signaturen ved hver
        request. Det er derfor du må sette <code className="font-mono">app.secret_key</code>: uten
        nøkkel, ingen signering, ingen session.
      </div>
    </div>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <div className="flex items-center justify-center">
      <svg width="20" height="14" viewBox="0 0 20 14" className="text-muted-foreground/60">
        {direction === "right" ? (
          <path d="M 0 7 L 16 7 M 12 3 L 16 7 L 12 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        ) : (
          <path d="M 20 7 L 4 7 M 8 3 L 4 7 L 8 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        )}
      </svg>
    </div>
  );
}
