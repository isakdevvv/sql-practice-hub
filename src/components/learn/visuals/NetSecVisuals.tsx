// Reusable visual diagrams for HTTP / network / security flashcards.
// Same conventions as Visuals.tsx: theme-aware SVG i <figure>,
// currentColor strokes, color-mix for accent fills, og <figcaption>
// med kort norsk beskrivelse. Hver komponent eksporteres for direkte
// bruk, og nederst eksponeres NET_SEC_VISUALS som splices inn i
// hoved-VISUALS-mappen i Visuals.tsx.

import type { FC } from "react";

const STROKE = "currentColor";

// ============= TLS 1.3 HANDSHAKE =============
// Sekvensdiagram med klient + server, ClientHello -> ServerHello + cert ->
// Finished -> Application Data. 1-RTT. Pilene viser hva som er kryptert.
export const TlsHandshake: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 280" className="w-full max-w-md mx-auto text-foreground">
      {/* Klient */}
      <rect x="10" y="14" width="90" height="34" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="55" y="35" textAnchor="middle" className="text-[10px] fill-current font-semibold">Klient</text>
      <line x1="55" y1="48" x2="55" y2="260" stroke={STROKE} strokeDasharray="3 3" />

      {/* Server */}
      <rect x="320" y="14" width="90" height="34" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="365" y="35" textAnchor="middle" className="text-[10px] fill-current font-semibold">Server</text>
      <line x1="365" y1="48" x2="365" y2="260" stroke={STROKE} strokeDasharray="3 3" />

      {/* 1: ClientHello */}
      <line x1="57" y1="70" x2="363" y2="70" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrTls)" />
      <text x="210" y="64" textAnchor="middle" className="text-[10px] fill-current font-mono">ClientHello (SNI, ciphers, key share)</text>

      {/* 2: ServerHello + Cert + Finished (kryptert etter ServerHello) */}
      <line x1="363" y1="100" x2="57" y2="100" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrTls)" />
      <text x="210" y="94" textAnchor="middle" className="text-[10px] fill-current font-mono">ServerHello + key share</text>
      <line x1="363" y1="125" x2="57" y2="125" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrTls)" />
      <text x="210" y="119" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">{"{Certificate, Finished}  ← kryptert"}</text>

      {/* 3: Client Finished */}
      <line x1="57" y1="160" x2="363" y2="160" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrTls)" />
      <text x="210" y="154" textAnchor="middle" className="text-[10px] fill-current font-mono opacity-80">{"{Finished}"}</text>

      {/* 4: Application Data */}
      <line x1="57" y1="195" x2="363" y2="195" stroke={STROKE} strokeWidth="2" strokeDasharray="2 2" markerEnd="url(#arrTls)" />
      <line x1="363" y1="215" x2="57" y2="215" stroke={STROKE} strokeWidth="2" strokeDasharray="2 2" markerEnd="url(#arrTls)" />
      <text x="210" y="189" textAnchor="middle" className="text-[10px] fill-current font-mono">{"{Application Data}  (AEAD-kryptert)"}</text>

      {/* RTT-marker */}
      <text x="210" y="245" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Total: 1 RTT — TLS 1.2 brukte 2 RTT.
      </text>
      <text x="210" y="262" textAnchor="middle" className="text-[9px] fill-current opacity-60">
        stiplet pil = kryptert. Sertifikatet er klartekst i 1.2, kryptert i 1.3.
      </text>

      <defs>
        <marker id="arrTls" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      TLS 1.3-handshake — ett tur-retur, deretter symmetrisk AEAD-trafikk.
    </figcaption>
  </figure>
);

// ============= HTTP-STATUS-KLASSER (1xx..5xx) =============
// Regnbue-strimmel: hver klasse får sin egen farge med eksempler under.
export const HttpStatusClasses: FC = () => {
  const classes = [
    { code: "1xx", label: "Informational", examples: "100 Continue, 101 Switching Protocols", color: "var(--muted)" },
    { code: "2xx", label: "Success", examples: "200 OK, 201 Created, 204 No Content", color: "var(--success)" },
    { code: "3xx", label: "Redirection", examples: "301 Moved, 302 Found, 304 Not Modified", color: "var(--brand)" },
    { code: "4xx", label: "Client error", examples: "400 Bad Request, 401, 403, 404, 405", color: "color-mix(in oklch, var(--brand) 60%, var(--destructive))" },
    { code: "5xx", label: "Server error", examples: "500 Internal, 502 Bad Gateway, 503", color: "var(--destructive)" },
  ];
  return (
    <figure className="my-4">
      <div className="flex flex-col gap-1.5 max-w-xl mx-auto">
        {classes.map((c) => (
          <div
            key={c.code}
            className="grid grid-cols-[60px_120px_1fr] items-center gap-2 rounded border border-border px-2 py-1.5"
            style={{ background: `color-mix(in oklch, ${c.color} 14%, transparent)` }}
          >
            <span className="font-mono text-[12px] font-semibold text-center">{c.code}</span>
            <span className="text-[11px] font-semibold">{c.label}</span>
            <span className="text-[10px] font-mono opacity-80">{c.examples}</span>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Fem statuskode-klasser — første siffer forteller hvem som har skylden / hva som skjedde.
      </figcaption>
    </figure>
  );
};

// ============= REQUEST/RESPONSE ANATOMI =============
// To kort side-om-side: request (start-line + headers + body) og response
// (status-line + headers + body). Brukes til "hva er en HTTP-request".
export const HttpAnatomy: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      <div className="rounded border border-border overflow-hidden">
        <div className="bg-brand/15 text-[10px] uppercase tracking-wider font-semibold px-2 py-1">
          Request
        </div>
        <pre className="text-[10px] font-mono leading-relaxed px-2 py-2 whitespace-pre">
{`POST /api/login HTTP/1.1     ← start-line
Host: app.no                 ╮
Content-Type: application/json│ headers
Cookie: theme=dark           ╯
                             ← tom linje
{"user":"ola","pw":"hemmelig"}  ← body`}
        </pre>
      </div>
      <div className="rounded border border-border overflow-hidden">
        <div className="bg-success/20 text-[10px] uppercase tracking-wider font-semibold px-2 py-1">
          Response
        </div>
        <pre className="text-[10px] font-mono leading-relaxed px-2 py-2 whitespace-pre">
{`HTTP/1.1 200 OK              ← status-line
Content-Type: application/json╮
Set-Cookie: sid=abc; HttpOnly │ headers
Cache-Control: no-store       ╯
                             ← tom linje
{"ok":true,"name":"Ola"}     ← body`}
        </pre>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Begge har samme struktur: én linje, headers, tom linje, body.
    </figcaption>
  </figure>
);

// ============= DNS-OPPSLAG (rekursiv resolver) =============
// Klient -> resolver -> root -> TLD -> autoritativ. Klassisk pyramide.
export const DnsLookup: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 440 220" className="w-full max-w-lg mx-auto text-foreground">
      {/* Klient */}
      <rect x="10" y="90" width="70" height="36" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="45" y="113" textAnchor="middle" className="text-[10px] fill-current font-semibold">Klient</text>

      {/* Resolver */}
      <rect x="120" y="90" width="80" height="36" rx="3" fill="color-mix(in oklch, var(--brand) 28%, transparent)" stroke={STROKE} />
      <text x="160" y="108" textAnchor="middle" className="text-[10px] fill-current font-semibold">Rekursiv</text>
      <text x="160" y="120" textAnchor="middle" className="text-[10px] fill-current font-semibold">resolver</text>

      {/* Root */}
      <rect x="250" y="10" width="80" height="30" rx="3" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} />
      <text x="290" y="29" textAnchor="middle" className="text-[10px] fill-current font-mono">. (root)</text>

      {/* TLD */}
      <rect x="250" y="90" width="80" height="36" rx="3" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} />
      <text x="290" y="108" textAnchor="middle" className="text-[10px] fill-current font-mono">.no</text>
      <text x="290" y="120" textAnchor="middle" className="text-[9px] fill-current opacity-70">(TLD)</text>

      {/* Authoritative */}
      <rect x="250" y="170" width="160" height="34" rx="3" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
      <text x="330" y="190" textAnchor="middle" className="text-[10px] fill-current font-mono">ns1.example.no</text>
      <text x="330" y="200" textAnchor="middle" className="text-[9px] fill-current opacity-70">(autoritativ)</text>

      {/* Piler */}
      <line x1="82" y1="108" x2="118" y2="108" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrDns)" />
      <text x="100" y="103" textAnchor="middle" className="text-[8px] fill-current font-mono">app.no?</text>

      <line x1="200" y1="100" x2="250" y2="30" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrDns)" />
      <text x="210" y="60" className="text-[8px] fill-current font-mono">1</text>
      <line x1="200" y1="105" x2="250" y2="105" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrDns)" />
      <text x="220" y="100" className="text-[8px] fill-current font-mono">2</text>
      <line x1="200" y1="115" x2="250" y2="180" stroke={STROKE} strokeWidth="1" markerEnd="url(#arrDns)" />
      <text x="210" y="160" className="text-[8px] fill-current font-mono">3</text>

      {/* Svar tilbake */}
      <line x1="118" y1="120" x2="82" y2="120" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" markerEnd="url(#arrDns)" />
      <text x="100" y="135" textAnchor="middle" className="text-[8px] fill-current font-mono">93.184.x.x</text>

      <defs>
        <marker id="arrDns" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Resolveren spør seg nedover hierarkiet — root viser .no, .no viser autoritativ, autoritativ gir IP.
    </figcaption>
  </figure>
);

// ============= TCP 3-WAY HANDSHAKE =============
// SYN -> SYN/ACK -> ACK. Klassisk sekvensdiagram.
export const TcpHandshake: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Klient</text>
      <line x1="50" y1="46" x2="50" y2="210" stroke={STROKE} strokeDasharray="3 3" />

      <rect x="290" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="330" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Server</text>
      <line x1="330" y1="46" x2="330" y2="210" stroke={STROKE} strokeDasharray="3 3" />

      {/* SYN */}
      <line x1="52" y1="70" x2="328" y2="70" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrTcp)" />
      <text x="190" y="64" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">SYN (seq=x)</text>

      {/* SYN+ACK */}
      <line x1="328" y1="115" x2="52" y2="115" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrTcp)" />
      <text x="190" y="109" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">SYN+ACK (seq=y, ack=x+1)</text>

      {/* ACK */}
      <line x1="52" y1="160" x2="328" y2="160" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrTcp)" />
      <text x="190" y="154" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">ACK (ack=y+1)</text>

      <text x="190" y="195" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Etter ACK er forbindelsen ESTABLISHED — data kan flyte begge veier.
      </text>

      <defs>
        <marker id="arrTcp" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      TCP three-way handshake — to parter blir enige om start-sekvensnumre.
    </figcaption>
  </figure>
);

// ============= COOKIE-FLOW (Set-Cookie + Cookie) =============
// Litt enklere enn SessionFlow: fokus på Set-Cookie -> Cookie-attributter.
export const CookieFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 400 240" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Nettleser</text>
      <line x1="50" y1="46" x2="50" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      <rect x="310" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="350" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Server</text>
      <line x1="350" y1="46" x2="350" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      {/* request 1 */}
      <line x1="52" y1="70" x2="348" y2="70" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCk)" />
      <text x="200" y="64" textAnchor="middle" className="text-[10px] fill-current font-mono">GET /login</text>

      {/* response */}
      <line x1="348" y1="105" x2="52" y2="105" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCk)" />
      <text x="200" y="99" textAnchor="middle" className="text-[10px] fill-current font-mono">200 + Set-Cookie: ...</text>

      {/* cookie-boks i nettleseren */}
      <rect x="20" y="118" width="170" height="56" rx="2" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="105" y="132" textAnchor="middle" className="text-[9px] fill-current font-mono font-semibold">cookie jar</text>
      <text x="28" y="146" className="text-[9px] fill-current font-mono">sid=abc123;</text>
      <text x="28" y="158" className="text-[9px] fill-current font-mono">HttpOnly; Secure;</text>
      <text x="28" y="170" className="text-[9px] fill-current font-mono">SameSite=Lax</text>

      {/* request 2 */}
      <line x1="52" y1="200" x2="348" y2="200" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCk)" />
      <text x="200" y="194" textAnchor="middle" className="text-[10px] fill-current font-mono">GET /me · Cookie: sid=abc123</text>

      <text x="200" y="225" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Nettleseren legger ved cookien automatisk på alle senere requests til samme origin.
      </text>

      <defs>
        <marker id="arrCk" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Set-Cookie sender cookien til klienten; klienten ekko-er den med hver request.
    </figcaption>
  </figure>
);

// ============= SESSION VS JWT =============
// To kolonner: server-state-modell vs stateless. Stack ikoner.
export const SessionVsJwt: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      <div className="rounded border border-border p-3 bg-brand/5">
        <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-center">
          Session (server-state)
        </div>
        <div className="font-mono text-[10px] space-y-1">
          <div>Cookie: <span className="text-brand">sid=abc123</span></div>
          <div className="opacity-60">↓ server slår opp</div>
          <div className="rounded border border-border p-2 bg-background">
            sessions[abc123] = {"{ user_id: 42, role: 'admin' }"}
          </div>
        </div>
        <ul className="text-[10px] mt-2 list-disc list-inside opacity-80 space-y-0.5">
          <li>State på server (RAM eller DB)</li>
          <li>Skaler ut: trenger delt store (Redis)</li>
          <li>Revoke: slett raden, ferdig</li>
        </ul>
      </div>

      <div className="rounded border border-border p-3 bg-success/5">
        <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-center">
          JWT (stateless)
        </div>
        <div className="font-mono text-[10px] space-y-1">
          <div>Authorization: <span className="text-success">Bearer eyJh…</span></div>
          <div className="opacity-60">↓ server verifiserer signatur</div>
          <div className="rounded border border-border p-2 bg-background">
            payload = {"{ sub: 42, role: 'admin', exp: 1700… }"}
          </div>
        </div>
        <ul className="text-[10px] mt-2 list-disc list-inside opacity-80 space-y-0.5">
          <li>All info i tokenet selv</li>
          <li>Skalerer enkelt: ingen delt store</li>
          <li>Revoke: vanskelig — må vente exp eller bygge blacklist</li>
        </ul>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Session = server husker, JWT = klienten bærer alt med seg (signert).
    </figcaption>
  </figure>
);

// ============= JWT TRE DELER =============
// header.payload.signature — base64-dekodet under hver del.
export const JwtThreeParts: FC = () => (
  <figure className="my-4">
    <div className="max-w-2xl mx-auto">
      <div className="font-mono text-[11px] break-all rounded border border-border p-2 bg-muted/30 text-center">
        <span className="text-brand">eyJhbGciOiJIUzI1NiJ9</span>
        <span className="opacity-50">.</span>
        <span className="text-success">eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiJ9</span>
        <span className="opacity-50">.</span>
        <span className="text-foreground/70">qwOZxFvP4n7nKf...</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
        <div className="rounded border border-brand/30 bg-brand/5 p-2">
          <div className="font-semibold mb-1 text-center text-brand">header</div>
          <pre className="font-mono whitespace-pre-wrap leading-tight">{`{
  "alg": "HS256",
  "typ": "JWT"
}`}</pre>
        </div>
        <div className="rounded border border-success/40 bg-success/5 p-2">
          <div className="font-semibold mb-1 text-center text-success">payload</div>
          <pre className="font-mono whitespace-pre-wrap leading-tight">{`{
  "sub": "42",
  "role": "admin",
  "exp": 1700000000
}`}</pre>
        </div>
        <div className="rounded border border-border p-2">
          <div className="font-semibold mb-1 text-center">signature</div>
          <pre className="font-mono whitespace-pre-wrap leading-tight">{`HMAC_SHA256(
  base64(header)
   + "."
   + base64(payload),
  SECRET
)`}</pre>
        </div>
      </div>
      <div className="text-[10px] opacity-70 mt-2 text-center">
        header og payload er base64url-kodet, IKKE kryptert — alle kan lese. Signaturen sikrer at de ikke er endret.
      </div>
    </div>
  </figure>
);

// ============= OAUTH 2.0 AUTHORIZATION CODE FLOW =============
export const OAuthCodeFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 480 280" className="w-full max-w-2xl mx-auto text-foreground">
      <rect x="10" y="14" width="80" height="30" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="33" textAnchor="middle" className="text-[10px] fill-current font-semibold">Bruker</text>
      <line x1="50" y1="44" x2="50" y2="265" stroke={STROKE} strokeDasharray="3 3" />

      <rect x="170" y="14" width="80" height="30" rx="3" fill="color-mix(in oklch, var(--brand) 28%, transparent)" stroke={STROKE} />
      <text x="210" y="33" textAnchor="middle" className="text-[10px] fill-current font-semibold">App (RP)</text>
      <line x1="210" y1="44" x2="210" y2="265" stroke={STROKE} strokeDasharray="3 3" />

      <rect x="330" y="14" width="120" height="30" rx="3" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
      <text x="390" y="33" textAnchor="middle" className="text-[10px] fill-current font-semibold">Auth Server (Google)</text>
      <line x1="390" y1="44" x2="390" y2="265" stroke={STROKE} strokeDasharray="3 3" />

      {/* 1: bruker -> app: "logg meg inn" */}
      <line x1="52" y1="64" x2="208" y2="64" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrOA)" />
      <text x="130" y="59" textAnchor="middle" className="text-[10px] fill-current font-mono">1. klikk «logg inn med Google»</text>

      {/* 2: app -> bruker: redirect */}
      <line x1="208" y1="92" x2="52" y2="92" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" markerEnd="url(#arrOA)" />
      <text x="130" y="87" textAnchor="middle" className="text-[10px] fill-current font-mono">2. 302 → auth-server</text>

      {/* 3: bruker -> auth: login + consent */}
      <line x1="52" y1="120" x2="388" y2="120" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrOA)" />
      <text x="220" y="115" textAnchor="middle" className="text-[10px] fill-current font-mono">3. login + consent</text>

      {/* 4: auth -> bruker: redirect tilbake med code */}
      <line x1="388" y1="148" x2="52" y2="148" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" markerEnd="url(#arrOA)" />
      <text x="220" y="143" textAnchor="middle" className="text-[10px] fill-current font-mono">4. 302 → app/callback?code=…</text>

      {/* 5: bruker -> app: code */}
      <line x1="52" y1="176" x2="208" y2="176" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrOA)" />
      <text x="130" y="171" textAnchor="middle" className="text-[10px] fill-current font-mono">5. /callback?code=…</text>

      {/* 6: app -> auth: code + secret -> token */}
      <line x1="212" y1="204" x2="388" y2="204" stroke={STROKE} strokeWidth="1.4" markerEnd="url(#arrOA)" />
      <text x="300" y="199" textAnchor="middle" className="text-[10px] fill-current font-mono">6. POST /token (code + secret)</text>

      <line x1="388" y1="232" x2="212" y2="232" stroke={STROKE} strokeWidth="1.4" strokeDasharray="2 2" markerEnd="url(#arrOA)" />
      <text x="300" y="227" textAnchor="middle" className="text-[10px] fill-current font-mono">7. {"{ access_token, id_token }"}</text>

      <text x="240" y="260" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Klient-secret forlater aldri serveren — derfor er code-flowen tryggere enn implicit-flow.
      </text>

      <defs>
        <marker id="arrOA" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      OAuth 2.0 authorization code flow — koden bytter mot token via server-til-server-kall.
    </figcaption>
  </figure>
);

// ============= CSRF-ANGREP =============
// evil.com har <form> som POSTer til bank.no, nettleseren legger ved cookien.
export const CsrfFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 460 240" className="w-full max-w-2xl mx-auto text-foreground">
      {/* Bruker */}
      <rect x="10" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Bruker</text>
      <line x1="50" y1="46" x2="50" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      {/* evil.com */}
      <rect x="170" y="14" width="100" height="32" rx="3" fill="color-mix(in oklch, var(--destructive) 25%, transparent)" stroke={STROKE} />
      <text x="220" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">evil.com</text>
      <line x1="220" y1="46" x2="220" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      {/* bank.no */}
      <rect x="350" y="14" width="100" height="32" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="400" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">bank.no</text>
      <line x1="400" y1="46" x2="400" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      {/* 1: bruker er allerede logget inn på bank.no (cookie ligger i jar) */}
      <text x="220" y="70" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        🍪 Brukeren er allerede logget inn på bank.no
      </text>

      {/* 2: bruker besøker evil.com */}
      <line x1="52" y1="98" x2="218" y2="98" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrCsrf)" />
      <text x="135" y="93" textAnchor="middle" className="text-[10px] fill-current font-mono">GET evil.com</text>

      {/* 3: evil.com leverer en form med auto-submit */}
      <line x1="218" y1="126" x2="52" y2="126" stroke={STROKE} strokeWidth="1.2" strokeDasharray="2 2" markerEnd="url(#arrCsrf)" />
      <text x="135" y="121" textAnchor="middle" className="text-[10px] fill-current font-mono">{"<form action=bank.no/transfer ...>"}</text>

      {/* 4: nettleseren submitter til bank.no, legger ved cookien */}
      <line x1="52" y1="160" x2="398" y2="160" stroke={STROKE} strokeWidth="1.6" markerEnd="url(#arrCsrf)" />
      <text x="220" y="155" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold text-destructive">
        POST bank.no/transfer  +  Cookie: sid=...
      </text>

      {/* 5: bank: ser gyldig session -> overfor pengene */}
      <line x1="398" y1="190" x2="52" y2="190" stroke={STROKE} strokeWidth="1.6" strokeDasharray="2 2" markerEnd="url(#arrCsrf)" />
      <text x="220" y="185" textAnchor="middle" className="text-[10px] fill-current font-mono">200 OK — overført!</text>

      <text x="230" y="215" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Forsvar: CSRF-token i form + sjekkes serverside; SameSite=Strict/Lax på cookien.
      </text>

      <defs>
        <marker id="arrCsrf" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      CSRF: angriperens side får nettleseren til å sende en autentisert request — fordi cookien følger med.
    </figcaption>
  </figure>
);

// ============= XSS: STORED VS REFLECTED VS DOM =============
export const XssTypes: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-3 gap-3 max-w-3xl mx-auto text-[10px]">
      <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
        <div className="font-semibold text-center text-destructive mb-1">Reflected</div>
        <pre className="font-mono whitespace-pre-wrap leading-tight">{`evil link:
?q=<script>steal()</script>

→ server ekko-er ut q
→ scriptet kjører i offerets
  nettleser

Krever klikk på lenke.`}</pre>
      </div>
      <div className="rounded border border-destructive/60 bg-destructive/10 p-2">
        <div className="font-semibold text-center text-destructive mb-1">Stored</div>
        <pre className="font-mono whitespace-pre-wrap leading-tight">{`angriper poster:
<script>steal()</script>

→ lagret i DB
→ kjører hos ALLE som
  ser kommentaren

Mest alvorlig.`}</pre>
      </div>
      <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
        <div className="font-semibold text-center text-destructive mb-1">DOM-based</div>
        <pre className="font-mono whitespace-pre-wrap leading-tight">{`klientside-JS:
el.innerHTML =
  location.hash.slice(1);

#<img onerror=steal()>

→ server ser aldri payloaden;
  alt skjer i nettleseren.`}</pre>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Tre XSS-varianter. Forsvar: escape ved output, CSP, ikke bruk innerHTML på utrygg data.
    </figcaption>
  </figure>
);

// ============= PASSWORD HASH PIPELINE =============
// passord + salt -> bcrypt -> lagret hash. Viser at samme passord gir ulike hashes.
export const PasswordHashPipeline: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 460 200" className="w-full max-w-2xl mx-auto text-foreground">
      {/* Passord */}
      <rect x="10" y="40" width="100" height="40" rx="4" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="60" y="58" textAnchor="middle" className="text-[10px] fill-current font-semibold">Passord</text>
      <text x="60" y="73" textAnchor="middle" className="text-[10px] fill-current font-mono">"hemmelig123"</text>

      {/* Plus salt */}
      <rect x="10" y="110" width="100" height="40" rx="4" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} strokeDasharray="3 3" />
      <text x="60" y="128" textAnchor="middle" className="text-[10px] fill-current font-semibold">+ Salt (random)</text>
      <text x="60" y="143" textAnchor="middle" className="text-[10px] fill-current font-mono">"x9f2…"</text>

      {/* KDF box */}
      <rect x="160" y="65" width="120" height="60" rx="4" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
      <text x="220" y="88" textAnchor="middle" className="text-[11px] fill-current font-semibold">bcrypt</text>
      <text x="220" y="102" textAnchor="middle" className="text-[9px] fill-current opacity-70">cost=12 → ~250 ms</text>
      <text x="220" y="116" textAnchor="middle" className="text-[9px] fill-current opacity-70">(argon2, scrypt)</text>

      {/* Output */}
      <rect x="320" y="55" width="130" height="80" rx="4" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="385" y="74" textAnchor="middle" className="text-[10px] fill-current font-semibold">Lagret hash</text>
      <text x="385" y="92" textAnchor="middle" className="text-[8.5px] fill-current font-mono">$2b$12$x9f2…</text>
      <text x="385" y="106" textAnchor="middle" className="text-[8.5px] fill-current font-mono opacity-80">N7Hb3pqRfn7…</text>
      <text x="385" y="124" textAnchor="middle" className="text-[9px] fill-current opacity-70">(salt + hash i ett)</text>

      {/* Pilene */}
      <line x1="110" y1="60" x2="160" y2="80" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrPw)" />
      <line x1="110" y1="130" x2="160" y2="110" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrPw)" />
      <line x1="280" y1="95" x2="320" y2="95" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrPw)" />

      <text x="225" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Salt sikrer at to like passord gir ulike hashes — rainbow tables dør.
      </text>
      <text x="225" y="187" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Treg KDF → brute-force på GPU er upraktisk dyrt.
      </text>

      <defs>
        <marker id="arrPw" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Passord lagres aldri klartekst — bare salt + treg KDF-hash.
    </figcaption>
  </figure>
);

// ============= SYMMETRIC VS ASYMMETRIC CRYPTO =============
export const SymVsAsymCrypto: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      <div className="rounded border border-border p-3">
        <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-center">
          Symmetrisk
        </div>
        <svg viewBox="0 0 220 110" className="w-full text-foreground">
          <rect x="10" y="40" width="50" height="30" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x="35" y="59" textAnchor="middle" className="text-[10px] fill-current">Alice</text>
          <rect x="160" y="40" width="50" height="30" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x="185" y="59" textAnchor="middle" className="text-[10px] fill-current">Bob</text>
          {/* delt nøkkel */}
          <text x="110" y="30" textAnchor="middle" className="text-[14px]">🔑</text>
          <text x="110" y="45" textAnchor="middle" className="text-[8px] fill-current opacity-70">samme nøkkel</text>
          <line x1="60" y1="55" x2="160" y2="55" stroke={STROKE} strokeDasharray="2 2" strokeWidth="1" />
          <text x="110" y="85" textAnchor="middle" className="text-[9px] fill-current font-mono">AES-256</text>
        </svg>
        <ul className="text-[10px] mt-1 list-disc list-inside opacity-80 space-y-0.5">
          <li>Rask (GB/s)</li>
          <li>Hvordan dele nøkkelen sikkert?</li>
          <li>Eksempler: AES, ChaCha20</li>
        </ul>
      </div>
      <div className="rounded border border-border p-3">
        <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-center">
          Asymmetrisk
        </div>
        <svg viewBox="0 0 220 110" className="w-full text-foreground">
          <rect x="10" y="40" width="50" height="30" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x="35" y="59" textAnchor="middle" className="text-[10px] fill-current">Alice</text>
          <rect x="160" y="40" width="50" height="30" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
          <text x="185" y="59" textAnchor="middle" className="text-[10px] fill-current">Bob</text>
          {/* Bob har par */}
          <text x="185" y="25" textAnchor="middle" className="text-[12px]">🔓</text>
          <text x="185" y="92" textAnchor="middle" className="text-[12px]">🔒</text>
          <text x="185" y="105" textAnchor="middle" className="text-[8px] fill-current opacity-70">privat</text>
          <text x="185" y="15" textAnchor="middle" className="text-[8px] fill-current opacity-70">offentlig</text>
          {/* Alice krypterer med Bobs offentlige */}
          <line x1="60" y1="55" x2="158" y2="55" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#arrAsym)" />
          <text x="110" y="50" textAnchor="middle" className="text-[8px] fill-current font-mono">krypter med 🔓</text>
        </svg>
        <ul className="text-[10px] mt-1 list-disc list-inside opacity-80 space-y-0.5">
          <li>Tregt — bare små data</li>
          <li>Løser nøkkel-deling og signering</li>
          <li>Eksempler: RSA, ECC</li>
        </ul>
        <svg width="0" height="0">
          <defs>
            <marker id="arrAsym" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      TLS bruker asymmetrisk for å bli enige om en symmetrisk øktnøkkel — beste fra begge.
    </figcaption>
  </figure>
);

// ============= HTTPS CERT CHAIN =============
export const CertChain: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 240" className="w-full max-w-md mx-auto text-foreground">
      {/* Root CA */}
      <rect x="100" y="14" width="160" height="40" rx="4" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="180" y="32" textAnchor="middle" className="text-[10px] fill-current font-semibold">Root CA</text>
      <text x="180" y="46" textAnchor="middle" className="text-[9px] fill-current font-mono opacity-80">DigiCert Root</text>

      {/* Intermediate */}
      <rect x="100" y="100" width="160" height="40" rx="4" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="118" textAnchor="middle" className="text-[10px] fill-current font-semibold">Intermediate CA</text>
      <text x="180" y="132" textAnchor="middle" className="text-[9px] fill-current font-mono opacity-80">DigiCert SHA2</text>

      {/* Leaf */}
      <rect x="100" y="186" width="160" height="40" rx="4" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} />
      <text x="180" y="204" textAnchor="middle" className="text-[10px] fill-current font-semibold">Leaf-sertifikat</text>
      <text x="180" y="218" textAnchor="middle" className="text-[9px] fill-current font-mono opacity-80">CN=app.no</text>

      {/* Piler med "signerer" */}
      <line x1="180" y1="54" x2="180" y2="98" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCC)" />
      <text x="225" y="80" className="text-[9px] fill-current opacity-70">signerer</text>

      <line x1="180" y1="140" x2="180" y2="184" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrCC)" />
      <text x="225" y="166" className="text-[9px] fill-current opacity-70">signerer</text>

      {/* Trust store badge */}
      <text x="80" y="35" textAnchor="middle" className="text-[10px] fill-current opacity-80">🛡️</text>
      <text x="50" y="50" className="text-[8px] fill-current opacity-70">i klientens</text>
      <text x="50" y="60" className="text-[8px] fill-current opacity-70">trust store</text>

      <defs>
        <marker id="arrCC" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Sertifikat-kjede: nettleseren stoler på leaf fordi den kan følge signaturene opp til en root i trust store.
    </figcaption>
  </figure>
);

// ============= BRANNMUR / FIREWALL FILTER =============
// Pakker går inn fra venstre, regler matcher, ALLOW/DROP til høyre.
export const FirewallFilter: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 460 240" className="w-full max-w-2xl mx-auto text-foreground">
      {/* Internett-side */}
      <text x="40" y="20" textAnchor="middle" className="text-[10px] fill-current opacity-70">Internett</text>
      {/* Tre pakker inn */}
      {[
        { y: 50, label: "TCP :443", verdict: "ALLOW", ok: true },
        { y: 100, label: "TCP :22 fra utlandet", verdict: "DROP", ok: false },
        { y: 150, label: "UDP :53 svar", verdict: "ALLOW (state)", ok: true },
        { y: 200, label: "TCP :3306 fra LAN", verdict: "ALLOW", ok: true },
      ].map((p) => (
        <g key={p.label}>
          <rect x="10" y={p.y - 12} width="80" height="24" rx="3" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} strokeWidth="0.5" />
          <text x="50" y={p.y + 3} textAnchor="middle" className="text-[8.5px] fill-current font-mono">{p.label}</text>
          <line x1="90" y1={p.y} x2="170" y2={p.y} stroke={STROKE} strokeWidth="1" markerEnd="url(#arrFw)" />
        </g>
      ))}

      {/* Brannmur-boks med regler */}
      <rect x="170" y="30" width="160" height="190" rx="4" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="250" y="48" textAnchor="middle" className="text-[11px] fill-current font-semibold">Brannmur</text>
      <line x1="178" y1="56" x2="322" y2="56" stroke={STROKE} strokeWidth="0.4" />
      <text x="180" y="72" className="text-[9px] fill-current font-mono">ALLOW tcp 443 in</text>
      <text x="180" y="86" className="text-[9px] fill-current font-mono">ALLOW tcp 80 in</text>
      <text x="180" y="100" className="text-[9px] fill-current font-mono">ALLOW related,</text>
      <text x="180" y="112" className="text-[9px] fill-current font-mono">     established</text>
      <text x="180" y="126" className="text-[9px] fill-current font-mono">ALLOW from LAN</text>
      <text x="180" y="140" className="text-[9px] fill-current font-mono opacity-50">     ...</text>
      <text x="180" y="170" className="text-[9px] fill-current font-mono text-destructive" fill="var(--destructive)">DROP all (default)</text>

      {/* Resultat-side */}
      {[
        { y: 50, ok: true, txt: "→ LAN" },
        { y: 100, ok: false, txt: "✕" },
        { y: 150, ok: true, txt: "→ klient" },
        { y: 200, ok: true, txt: "→ DB" },
      ].map((r) => (
        <g key={r.y}>
          <line x1="330" y1={r.y} x2="395" y2={r.y} stroke={STROKE} strokeWidth="1" markerEnd="url(#arrFw)" strokeDasharray={r.ok ? undefined : "3 2"} />
          <text x="425" y={r.y + 3} textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: r.ok ? undefined : "var(--destructive)" }}>{r.txt}</text>
        </g>
      ))}

      <defs>
        <marker id="arrFw" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Pakkene matches mot regellisten ovenfra og ned — første treff vinner; ellers default DROP.
    </figcaption>
  </figure>
);

// ============= SAME-ORIGIN POLICY =============
// Tre URLer ved siden av en referanse, highlightet om de matcher.
export const SameOriginPolicy: FC = () => {
  const base = { proto: "https", host: "app.no", port: "443" };
  const cases: { url: { proto: string; host: string; port: string }; ok: boolean; why: string }[] = [
    { url: { proto: "https", host: "app.no", port: "443" }, ok: true, why: "samme origin" },
    { url: { proto: "http", host: "app.no", port: "80" }, ok: false, why: "ulik protokoll" },
    { url: { proto: "https", host: "api.app.no", port: "443" }, ok: false, why: "ulik host (subdomene teller)" },
    { url: { proto: "https", host: "app.no", port: "8443" }, ok: false, why: "ulik port" },
  ];
  return (
    <figure className="my-4">
      <div className="max-w-xl mx-auto">
        <div className="rounded border border-brand/40 bg-brand/10 px-3 py-2 mb-2 font-mono text-[11px] text-center">
          <span className="opacity-60">referanse:</span>{" "}
          <span className="font-semibold">{base.proto}</span>
          <span className="opacity-50">://</span>
          <span className="font-semibold">{base.host}</span>
          <span className="opacity-50">:</span>
          <span className="font-semibold">{base.port}</span>
        </div>
        <div className="space-y-1">
          {cases.map((c, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded border px-2 py-1.5 font-mono text-[11px] ${
                c.ok ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
              }`}
            >
              <span className={`text-[12px] ${c.ok ? "text-success" : "text-destructive"}`}>
                {c.ok ? "✓" : "✕"}
              </span>
              <span className={c.url.proto === base.proto ? "" : "text-destructive font-semibold"}>{c.url.proto}</span>
              <span className="opacity-50">://</span>
              <span className={c.url.host === base.host ? "" : "text-destructive font-semibold"}>{c.url.host}</span>
              <span className="opacity-50">:</span>
              <span className={c.url.port === base.port ? "" : "text-destructive font-semibold"}>{c.url.port}</span>
              <span className="ml-auto text-[10px] font-sans opacity-70">{c.why}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Origin = (protokoll, host, port). Alle tre må matche — CORS-headere kan åpne for unntak.
      </figcaption>
    </figure>
  );
};

// ============= CACHE-CONTROL / ETAG FLOW =============
export const CacheEtagFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 240" className="w-full max-w-md mx-auto text-foreground">
      <rect x="10" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Klient</text>
      <line x1="50" y1="46" x2="50" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      <rect x="320" y="14" width="80" height="32" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="360" y="34" textAnchor="middle" className="text-[10px] fill-current font-semibold">Server</text>
      <line x1="360" y1="46" x2="360" y2="225" stroke={STROKE} strokeDasharray="3 3" />

      {/* 1: first GET */}
      <line x1="52" y1="70" x2="358" y2="70" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrEtag)" />
      <text x="205" y="64" textAnchor="middle" className="text-[10px] fill-current font-mono">GET /style.css</text>

      {/* 2: 200 + ETag */}
      <line x1="358" y1="105" x2="52" y2="105" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrEtag)" />
      <text x="205" y="93" textAnchor="middle" className="text-[10px] fill-current font-mono">200 OK</text>
      <text x="205" y="105" textAnchor="middle" className="text-[10px] fill-current font-mono">ETag: "v3-abc"</text>
      <text x="205" y="117" textAnchor="middle" className="text-[10px] fill-current font-mono">Cache-Control: max-age=3600</text>

      {/* 3: revalidate */}
      <line x1="52" y1="160" x2="358" y2="160" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrEtag)" />
      <text x="205" y="148" textAnchor="middle" className="text-[10px] fill-current font-mono">GET /style.css</text>
      <text x="205" y="160" textAnchor="middle" className="text-[10px] fill-current font-mono">If-None-Match: "v3-abc"</text>

      {/* 4: 304 */}
      <line x1="358" y1="195" x2="52" y2="195" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrEtag)" />
      <text x="205" y="189" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">304 Not Modified  (0 bytes body)</text>

      <text x="210" y="220" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Klienten ber server bekrefte — sparer båndbredde når innholdet ikke har endret seg.
      </text>

      <defs>
        <marker id="arrEtag" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Cache-Control + ETag = klienten cacher, men revaliderer billig.
    </figcaption>
  </figure>
);

// ============= OWASP TOP 10 GRID =============
export const OwaspTop10Grid: FC = () => {
  const items = [
    { n: "A01", t: "Broken Access Control", c: "var(--destructive)" },
    { n: "A02", t: "Cryptographic Failures", c: "var(--destructive)" },
    { n: "A03", t: "Injection", c: "var(--destructive)" },
    { n: "A04", t: "Insecure Design", c: "var(--brand)" },
    { n: "A05", t: "Security Misconfiguration", c: "var(--brand)" },
    { n: "A06", t: "Vulnerable Components", c: "var(--brand)" },
    { n: "A07", t: "ID & Auth Failures", c: "var(--brand)" },
    { n: "A08", t: "Software/Data Integrity", c: "var(--success)" },
    { n: "A09", t: "Logging & Monitoring Failures", c: "var(--success)" },
    { n: "A10", t: "SSRF", c: "var(--success)" },
  ];
  return (
    <figure className="my-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto">
        {items.map((it) => (
          <div
            key={it.n}
            className="rounded border border-border p-2 text-center"
            style={{ background: `color-mix(in oklch, ${it.c} 12%, transparent)` }}
          >
            <div className="text-[10px] font-mono font-semibold opacity-80">{it.n}</div>
            <div className="text-[10px] mt-1 leading-tight">{it.t}</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        OWASP Top 10 (2021) — de ti vanligste alvorlige web-svakhetene.
      </figcaption>
    </figure>
  );
};

// ============= SQL INJECTION (variant: attack-string -> resulterende SQL) =============
// Kompletterer eksisterende sql-injection-compare ved a vise HVA som faktisk skjer
// inni databasen, steg for steg.
export const SqlInjectionAttackTrace: FC = () => (
  <figure className="my-4">
    <div className="max-w-xl mx-auto space-y-2">
      <div className="rounded border border-border p-2">
        <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">1. Brukerinput</div>
        <code className="text-[11px] font-mono">name = <span className="text-destructive">' OR 1=1 --</span></code>
      </div>
      <div className="text-center text-[12px] opacity-60">↓ konkatenert inn i SQL</div>
      <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
        <div className="text-[10px] uppercase tracking-wider text-destructive mb-1">2. Hva databasen ser</div>
        <pre className="text-[11px] font-mono whitespace-pre-wrap">
{`SELECT * FROM users WHERE name = '`}<span className="text-destructive font-semibold">{`' OR 1=1 --`}</span>{`'`}
        </pre>
        <div className="text-[10px] opacity-70 mt-1">
          → <code>1=1</code> er alltid sant, <code>--</code> kommenterer ut resten.
        </div>
      </div>
      <div className="text-center text-[12px] opacity-60">↓ resultat</div>
      <div className="rounded border border-destructive/60 bg-destructive/10 p-2 font-mono text-[11px] text-center">
        ALLE rader returneres — innlogging omgått.
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Strenkonkatenering lar brukerdata endre selve SQL-spørringen.
    </figcaption>
  </figure>
);

// ============= AUTHN VS AUTHZ =============
export const AuthnVsAuthz: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
      <div className="rounded border border-border p-3 bg-brand/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[18px]">🪪</span>
          <span className="font-semibold text-[12px]">Authentication</span>
        </div>
        <div className="text-[11px] opacity-80">HVEM er du?</div>
        <ul className="text-[10px] mt-2 list-disc list-inside space-y-0.5">
          <li>Passord + 2FA</li>
          <li>SSO (OAuth/OIDC)</li>
          <li>API-nøkkel / mTLS-cert</li>
        </ul>
        <div className="mt-2 text-[10px] font-mono opacity-70">→ 401 hvis ukjent</div>
      </div>
      <div className="rounded border border-border p-3 bg-success/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[18px]">🔐</span>
          <span className="font-semibold text-[12px]">Authorization</span>
        </div>
        <div className="text-[11px] opacity-80">HVA har du lov til?</div>
        <ul className="text-[10px] mt-2 list-disc list-inside space-y-0.5">
          <li>Roller (admin/editor/viewer)</li>
          <li>Per-rad-policy (eier den?)</li>
          <li>RBAC / ABAC</li>
        </ul>
        <div className="mt-2 text-[10px] font-mono opacity-70">→ 403 hvis ikke tillatt</div>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Innlogget men ikke tillatt = 403. Ikke innlogget i det hele tatt = 401.
    </figcaption>
  </figure>
);

// ============= HTTP-METODER OG IDEMPOTENS =============
export const HttpMethodsMatrix: FC = () => {
  const rows: { m: string; safe: boolean; idem: boolean; use: string }[] = [
    { m: "GET", safe: true, idem: true, use: "Hent ressurs" },
    { m: "HEAD", safe: true, idem: true, use: "Bare headers" },
    { m: "OPTIONS", safe: true, idem: true, use: "Tillatte metoder / CORS" },
    { m: "PUT", safe: false, idem: true, use: "Erstatt hele ressursen" },
    { m: "DELETE", safe: false, idem: true, use: "Slett" },
    { m: "POST", safe: false, idem: false, use: "Opprett / generelt" },
    { m: "PATCH", safe: false, idem: false, use: "Delvis oppdatering" },
  ];
  return (
    <figure className="my-4">
      <div className="overflow-x-auto max-w-xl mx-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1 px-2 font-semibold">Metode</th>
              <th className="text-center py-1 px-2 font-semibold">Safe?</th>
              <th className="text-center py-1 px-2 font-semibold">Idempotent?</th>
              <th className="text-left py-1 px-2 font-semibold">Bruk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.m} className="border-b border-border/50">
                <td className="py-1 px-2 font-mono font-semibold">{r.m}</td>
                <td className="py-1 px-2 text-center">{r.safe ? <span className="text-success">✓</span> : <span className="text-destructive">✕</span>}</td>
                <td className="py-1 px-2 text-center">{r.idem ? <span className="text-success">✓</span> : <span className="text-destructive">✕</span>}</td>
                <td className="py-1 px-2 opacity-80">{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Safe = endrer ikke serverstate. Idempotent = N like kall = 1 kall (effekt-messig).
      </figcaption>
    </figure>
  );
};

// ============= COOKIE-SIKKERHETSATTRIBUTTER =============
export const CookieAttributes: FC = () => {
  const attrs = [
    { name: "HttpOnly", what: "JS kan ikke lese cookien", why: "Stopper XSS-tyveri" },
    { name: "Secure", what: "Sendes kun over HTTPS", why: "Hindrer avlytting" },
    { name: "SameSite=Strict", what: "Følger ikke med på cross-site requests", why: "Stopper CSRF" },
    { name: "SameSite=Lax", what: "Følger med på top-level navigation, ikke andre", why: "CSRF-balanse" },
    { name: "Domain / Path", what: "Avgrenser hvilke URLer cookien sendes til", why: "Minst-privilegium" },
    { name: "Max-Age / Expires", what: "Levetid", why: "Reduserer angreps-vindu" },
  ];
  return (
    <figure className="my-4">
      <div className="max-w-2xl mx-auto rounded border border-border overflow-hidden">
        <div className="bg-brand/15 px-3 py-1.5 font-mono text-[11px]">
          Set-Cookie: sid=abc; <span className="font-semibold">HttpOnly; Secure; SameSite=Lax</span>; Path=/; Max-Age=3600
        </div>
        <div className="divide-y divide-border">
          {attrs.map((a) => (
            <div key={a.name} className="grid grid-cols-[140px_1fr_1fr] gap-2 px-3 py-1.5 text-[10.5px]">
              <span className="font-mono font-semibold">{a.name}</span>
              <span className="opacity-80">{a.what}</span>
              <span className="opacity-70 italic">{a.why}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Session-cookies bør alltid ha HttpOnly + Secure + SameSite.
      </figcaption>
    </figure>
  );
};

// ============= OSI 7 LAG =============
export const OsiLayers: FC = () => {
  const layers = [
    { n: 7, name: "Application", proto: "HTTP, DNS, SMTP", c: "var(--brand)" },
    { n: 6, name: "Presentation", proto: "TLS, JPEG, ASCII", c: "var(--brand)" },
    { n: 5, name: "Session", proto: "RPC, NetBIOS", c: "var(--brand)" },
    { n: 4, name: "Transport", proto: "TCP, UDP", c: "var(--success)" },
    { n: 3, name: "Network", proto: "IP, ICMP, OSPF", c: "var(--success)" },
    { n: 2, name: "Data Link", proto: "Ethernet, ARP, 802.1Q", c: "var(--muted)" },
    { n: 1, name: "Physical", proto: "Kabel, fiber, radio", c: "var(--muted)" },
  ];
  return (
    <figure className="my-4">
      <div className="max-w-xl mx-auto space-y-0.5">
        {layers.map((l) => (
          <div
            key={l.n}
            className="grid grid-cols-[28px_120px_1fr] items-center gap-3 rounded border border-border px-2 py-1.5 text-[11px]"
            style={{ background: `color-mix(in oklch, ${l.c} 14%, transparent)` }}
          >
            <span className="font-mono font-semibold text-center">{l.n}</span>
            <span className="font-semibold">{l.name}</span>
            <span className="font-mono text-[10px] opacity-80">{l.proto}</span>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        OSI 7 lag. TCP/IP-modellen slår sammen 5+6+7 til ett "Application"-lag.
      </figcaption>
    </figure>
  );
};

// ============= REGISTRY =============
export const NET_SEC_VISUALS: Record<string, FC> = {
  "net-tls-handshake": TlsHandshake,
  "net-status-classes": HttpStatusClasses,
  "net-http-anatomy": HttpAnatomy,
  "net-dns-lookup": DnsLookup,
  "net-tcp-handshake": TcpHandshake,
  "net-cookie-flow": CookieFlow,
  "net-cache-etag": CacheEtagFlow,
  "net-http-methods": HttpMethodsMatrix,
  "net-osi-layers": OsiLayers,
  "net-same-origin": SameOriginPolicy,
  "sec-session-vs-jwt": SessionVsJwt,
  "sec-jwt-three-parts": JwtThreeParts,
  "sec-oauth-code-flow": OAuthCodeFlow,
  "sec-csrf-flow": CsrfFlow,
  "sec-xss-types": XssTypes,
  "sec-password-hash": PasswordHashPipeline,
  "sec-sym-vs-asym": SymVsAsymCrypto,
  "sec-cert-chain": CertChain,
  "sec-firewall": FirewallFilter,
  "sec-owasp-top10": OwaspTop10Grid,
  "sec-sqli-trace": SqlInjectionAttackTrace,
  "sec-authn-vs-authz": AuthnVsAuthz,
  "sec-cookie-attributes": CookieAttributes,
};
