import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Cookie, Key, Globe, ChevronDown, ChevronUp } from "lucide-react";

// ---------------------------------------------------------------------------
// AuthFlowsSideBySide — tre-kolonne flow-animator for de tre store auth-mønstrene.
//
// Hver kolonne har samme 5 «konseptuelle» steg-slots (Login, Server gjør X,
// Returner token, Bruk token, Verifiser). Tidslinjen drives av én felles
// progress 0–1, men hver flow fortolker stegene forskjellig:
//   - Session: serveren lagrer state; klient har bare opaque cookie.
//   - JWT:     serveren signerer; klienten holder hele tokenet.
//   - OAuth:   tre parter (klient, auth-server, ressurs-server) og to runder
//              (code → access_token).
//
// JWT-kolonnen har en mini-dekoder som splitter en eksempel-JWT i tre deler og
// viser at payload er base64url-kodet, IKKE kryptert.
// ---------------------------------------------------------------------------

type Flow = "session" | "jwt" | "oauth";
type Mode = "alle" | Flow;

type Step = {
  /** Når under animasjonen (0–1) skal dette steget vises? */
  at: number;
  /** Hvilken «aktør» som handler — styrer hvor pulsen tegnes. */
  actor: "client" | "server" | "auth" | "store";
  title: string;
  detail: string;
};

const SESSION_STEPS: Step[] = [
  { at: 0.05, actor: "client", title: "POST /login", detail: "Bruker sender brukernavn + passord over HTTPS." },
  { at: 0.25, actor: "server", title: "Sjekk passord-hash", detail: "Server slår opp bruker, verifiserer bcrypt-hash, oppretter session-objekt." },
  { at: 0.45, actor: "store", title: "Lagre i session-store", detail: "Server skriver { sid: \"a9f...\", user_id: 42, role: \"admin\" } til Redis/RAM." },
  { at: 0.65, actor: "server", title: "Set-Cookie: sid=a9f...", detail: "Server svarer 200 + cookie. Cookien er KUN et opakt oppslag — ingen data om brukeren." },
  { at: 0.85, actor: "client", title: "GET /profile (Cookie: sid=a9f...)", detail: "Nettleseren legger ved cookien automatisk. Serveren slår opp sid i store og henter user_id=42." },
];

const JWT_STEPS: Step[] = [
  { at: 0.05, actor: "client", title: "POST /login", detail: "Samme — brukernavn + passord til /login-endpoint." },
  { at: 0.25, actor: "server", title: "Sjekk passord-hash", detail: "Verifiser hash som før." },
  { at: 0.45, actor: "server", title: "Sign JWT med private key", detail: "Bygg { sub: 42, role: \"admin\", exp: 1735689600 }, signer med RS256/HS256. Resultatet er header.payload.signature." },
  { at: 0.65, actor: "client", title: "Lagre token (localStorage / cookie)", detail: "Klient mottar hele JWT-en. Vanlige valg: localStorage (sårbart for XSS), httpOnly cookie (tryggere mot XSS, sårbart for CSRF)." },
  { at: 0.85, actor: "server", title: "Verifiser signatur — ingen lookup!", detail: "GET /profile sender Authorization: Bearer eyJ... Serveren verifiserer signaturen med public key og leser payload. Ingen DB/Redis-oppslag." },
];

const OAUTH_STEPS: Step[] = [
  { at: 0.05, actor: "client", title: "Bruker klikker «Logg inn med Google»", detail: "App redirecter til https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=...&scope=profile&state=xyz" },
  { at: 0.25, actor: "auth", title: "Bruker autentiserer hos auth-server", detail: "Google viser sin egen login-side. Appen ser ALDRI passordet. Bruker samtykker til scope=profile." },
  { at: 0.45, actor: "auth", title: "Redirect tilbake med ?code=abc123", detail: "Auth-server redirecter til app: redirect_uri?code=abc123&state=xyz. Code er kortlevd (≈30 s) og engangsbruk." },
  { at: 0.65, actor: "server", title: "App bytter code → tokens (server-til-server)", detail: "Appens backend kaller POST /token med code + client_secret. Får tilbake { access_token, refresh_token, expires_in: 3600 }." },
  { at: 0.85, actor: "client", title: "Bruk access_token mot resource API", detail: "GET /userinfo med Authorization: Bearer ya29... Når access_token utløper, bruk refresh_token for nytt." },
];

const ALL_STEPS: Record<Flow, Step[]> = {
  session: SESSION_STEPS,
  jwt: JWT_STEPS,
  oauth: OAUTH_STEPS,
};

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNTY4OTYwMH0.kRl3vT2pQ5cZbXNc9HmgB7m9Zx2QkF6vJpYxL8gXxYE";

const FLOW_META: Record<Flow, { label: string; sub: string; Icon: typeof Cookie; color: string }> = {
  session: { label: "Session", sub: "Server-side state + opaque cookie", Icon: Cookie, color: "#0ea5e9" },
  jwt: { label: "JWT", sub: "Signert token, ingen server-state", Icon: Key, color: "#10b981" },
  oauth: { label: "OAuth 2.0", sub: "Auth Code — tredjepart logger inn brukeren", Icon: Globe, color: "#a855f7" },
};

export function AuthFlowsSideBySide() {
  const [mode, setMode] = useState<Mode>("alle");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const initial = progress;
    const tick = (now: number) => {
      const elapsed = (now - start) / 4200; // 4.2s for full sweep
      const next = Math.min(1, initial + elapsed);
      setProgress(next);
      if (next < 1) rafRef.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, progress]);

  function start() {
    if (progress >= 1) setProgress(0);
    setRunning(true);
  }
  function reset() {
    setRunning(false);
    setProgress(0);
  }

  const visibleFlows: Flow[] = mode === "alle" ? ["session", "jwt", "oauth"] : [mode];

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden"
      role="region"
      aria-label="Auth-flows side ved side"
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Tre flows parallelt
            </div>
            <div className="text-sm font-semibold">
              Login → token utstedt → token brukt
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={start}
              disabled={running}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5" />
              {progress > 0 && progress < 1 ? "Spiller…" : progress >= 1 ? "Spill igjen" : "Kjør login"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nullstill
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["alle", "session", "jwt", "oauth"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                mode === m
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border hover:bg-muted"
              }`}
            >
              {m === "alle" ? "Alle 3 parallelt" : FLOW_META[m].label}
            </button>
          ))}
        </div>

        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div
        className={`p-3 grid gap-3 ${
          visibleFlows.length === 1 ? "grid-cols-1" : "md:grid-cols-3 grid-cols-1"
        }`}
      >
        {visibleFlows.map((flow) => (
          <FlowColumn key={flow} flow={flow} progress={progress} />
        ))}
      </div>
    </div>
  );
}

function FlowColumn({ flow, progress }: { flow: Flow; progress: number }) {
  const steps = ALL_STEPS[flow];
  const meta = FLOW_META[flow];
  const Icon = meta.Icon;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden flex flex-col">
      <div
        className="px-3 py-2 border-b border-border flex items-center gap-2"
        style={{ background: `${meta.color}15` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: meta.color }} />
        <div>
          <div className="text-sm font-semibold">{meta.label}</div>
          <div className="text-[10px] text-muted-foreground">{meta.sub}</div>
        </div>
      </div>

      <FlowSvg flow={flow} progress={progress} />

      <div className="p-2 flex-1 space-y-1.5">
        {steps.map((s, i) => {
          const active = progress >= s.at;
          return (
            <div
              key={i}
              className={`text-[11px] rounded-md border p-2 transition-all ${
                active
                  ? "border-brand/40 bg-brand/5 opacity-100"
                  : "border-border/50 opacity-40"
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: active ? meta.color : "#94a3b8" }}
                >
                  {i + 1}
                </span>
                {s.title}
              </div>
              <div className="mt-1 text-muted-foreground leading-snug">{s.detail}</div>
            </div>
          );
        })}
      </div>

      {flow === "jwt" && <JwtDecoder />}
      {flow === "session" && <SessionStoreNote />}
      {flow === "oauth" && <OauthNote />}
    </div>
  );
}

// =============================================================================
//                              SVG-ANIMASJON
// =============================================================================

function FlowSvg({ flow, progress }: { flow: Flow; progress: number }) {
  const W = 360;
  const H = flow === "oauth" ? 200 : 160;
  const meta = FLOW_META[flow];

  // Aktør-rader. OAuth har 3, de andre 2.
  const actors: { id: Step["actor"]; label: string; y: number }[] =
    flow === "oauth"
      ? [
          { id: "client", label: "Klient (app)", y: 30 },
          { id: "auth", label: "Auth-server (Google)", y: 95 },
          { id: "server", label: "App-backend / Resource API", y: 160 },
        ]
      : flow === "session"
        ? [
            { id: "client", label: "Klient (nettleser)", y: 40 },
            { id: "server", label: "Server", y: 110 },
            { id: "store", label: "Session-store (Redis)", y: 160 },
          ]
        : [
            { id: "client", label: "Klient", y: 50 },
            { id: "server", label: "Server", y: 130 },
          ];

  const adjustedH = flow === "session" ? 200 : H;
  const steps = ALL_STEPS[flow];

  return (
    <div className="border-b border-border bg-muted/20">
      <svg
        viewBox={`0 0 ${W} ${adjustedH}`}
        width="100%"
        className="block"
        role="img"
        aria-label={`${meta.label} flow-diagram`}
      >
        {actors.map((a) => (
          <g key={a.id}>
            <line x1={130} x2={W - 20} y1={a.y} y2={a.y} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="2 3" />
            <text x={8} y={a.y + 4} fontSize={10} fontWeight={600} fill="currentColor">
              {a.label}
            </text>
          </g>
        ))}

        {steps.map((s, i) => {
          if (progress < s.at) return null;
          // Position along the time-axis (x).
          const x = 140 + (s.at - 0.05) * (W - 160) * 1.05;
          const actor = actors.find((a) => a.id === s.actor);
          if (!actor) return null;
          // Pulse fades in over a short window
          const age = Math.min(1, (progress - s.at) / 0.08);
          const r = 3 + age * 3;
          return (
            <g key={i} style={{ opacity: age }}>
              <circle cx={x} cy={actor.y} r={r} fill={meta.color} />
              <text
                x={x}
                y={actor.y - 8}
                fontSize={8}
                textAnchor="middle"
                fill={meta.color}
                fontWeight={700}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Forbinde piler mellom etterfølgende steg */}
        {steps.slice(0, -1).map((s, i) => {
          const next = steps[i + 1];
          if (progress < next.at) return null;
          const x1 = 140 + (s.at - 0.05) * (W - 160) * 1.05;
          const x2 = 140 + (next.at - 0.05) * (W - 160) * 1.05;
          const a1 = actors.find((a) => a.id === s.actor)!;
          const a2 = actors.find((a) => a.id === next.actor)!;
          return (
            <line
              key={`arr-${i}`}
              x1={x1}
              y1={a1.y}
              x2={x2}
              y2={a2.y}
              stroke={meta.color}
              strokeWidth={1.5}
              opacity={0.6}
              markerEnd="url(#arr-end)"
            />
          );
        })}

        <defs>
          <marker
            id="arr-end"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 z" fill={meta.color} />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

// =============================================================================
//                              JWT-DEKODER
// =============================================================================

function JwtDecoder() {
  const [open, setOpen] = useState(false);
  const [header, payload, signature] = SAMPLE_JWT.split(".");

  function decode(b64url: string) {
    try {
      const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = b64 + "===".slice((b64.length + 3) % 4);
      const decoded = atob(padded);
      try {
        return JSON.stringify(JSON.parse(decoded), null, 2);
      } catch {
        return decoded;
      }
    } catch {
      return "<decode error>";
    }
  }

  return (
    <div className="border-t border-border bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 text-[11px] font-semibold flex items-center justify-between hover:bg-muted/40"
      >
        <span>Mini-dekoder — klikk for å åpne</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="p-2 space-y-2 text-[10px] font-mono">
          <div>
            <div className="text-emerald-700 font-semibold">HEADER (base64url)</div>
            <div className="break-all bg-background border border-border rounded p-1 text-emerald-800">
              {header}
            </div>
            <pre className="mt-1 bg-background border border-border rounded p-1 whitespace-pre-wrap">
              {decode(header)}
            </pre>
          </div>
          <div>
            <div className="text-sky-700 font-semibold">PAYLOAD (base64url, IKKE kryptert)</div>
            <div className="break-all bg-background border border-border rounded p-1 text-sky-800">
              {payload}
            </div>
            <pre className="mt-1 bg-background border border-border rounded p-1 whitespace-pre-wrap">
              {decode(payload)}
            </pre>
          </div>
          <div>
            <div className="text-fuchsia-700 font-semibold">SIGNATURE</div>
            <div className="break-all bg-background border border-border rounded p-1 text-fuchsia-800">
              {signature}
            </div>
            <p className="mt-1 text-muted-foreground font-sans text-[10px] leading-snug">
              Signaturen er HMAC-SHA256 over header.payload med en delt hemmelighet. Hvis du endrer
              ett tegn i payload uten å beregne ny signatur, vil serverens verifisering feile.
              <strong> Alle kan lese, ingen kan endre uten nøkkelen.</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionStoreNote() {
  return (
    <div className="border-t border-border bg-muted/20 p-2 text-[10px] text-muted-foreground leading-snug">
      <strong className="text-foreground">Hvor lever staten:</strong> Server-siden (Redis/RAM/DB).
      Klient har KUN en opaque <code>sid</code> i cookien — ingen brukerdata. Logout = slett rad i
      session-store. Skalering krever delt store mellom servere.
    </div>
  );
}

function OauthNote() {
  return (
    <div className="border-t border-border bg-muted/20 p-2 text-[10px] text-muted-foreground leading-snug">
      <strong className="text-foreground">Hvorfor code i stedet for token direkte?</strong> Code
      sendes via URL/redirect — synlig i nettleser-historikk og logger. Bytting til token skjer
      server-til-server med <code>client_secret</code>, så en angriper som leser URL-en ikke kan
      bytte koden inn selv. PKCE løser samme problem for SPA/mobil uten secret.
    </div>
  );
}
