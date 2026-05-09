interface HeaderRow {
  name: string;
  side: "request" | "response" | "begge";
  meaning: string;
  example: string;
}

const HEADERS: HeaderRow[] = [
  {
    name: "Host",
    side: "request",
    meaning: "Hvilket domene requesten er for. Obligatorisk i HTTP/1.1 — flere domener kan dele samme IP.",
    example: "Host: example.com",
  },
  {
    name: "Content-Type",
    side: "begge",
    meaning: "Hva slags data ligger i body-en. MIME-type, evt. med charset.",
    example: "Content-Type: application/json; charset=utf-8",
  },
  {
    name: "Content-Length",
    side: "begge",
    meaning: "Antall bytes i body-en. Lar mottakeren vite hvor mye den skal lese.",
    example: "Content-Length: 137",
  },
  {
    name: "Authorization",
    side: "request",
    meaning: "Autentiseringsdata — typisk en Bearer-token eller Basic-auth.",
    example: "Authorization: Bearer eyJhbGciOiJIUzI1...",
  },
  {
    name: "Cookie",
    side: "request",
    meaning: "Cookies klienten sender tilbake. Browser legger på automatisk.",
    example: "Cookie: session=abc123; theme=dark",
  },
  {
    name: "Set-Cookie",
    side: "response",
    meaning: "Server ber klienten lagre denne cookien og sende den tilbake neste gang.",
    example: "Set-Cookie: session=abc123; HttpOnly; Secure",
  },
  {
    name: "Location",
    side: "response",
    meaning: "Hvor klienten skal gå videre — brukes med 3xx-redirects og 201 Created.",
    example: "Location: /dashboard",
  },
  {
    name: "User-Agent",
    side: "request",
    meaning: "Hvilken klient som sender requesten — nettleser, curl, bot.",
    example: "User-Agent: Mozilla/5.0 (Macintosh; ...)",
  },
  {
    name: "Accept",
    side: "request",
    meaning: "Hvilke responsformater klienten kan håndtere. Server velger ett.",
    example: "Accept: text/html, application/json",
  },
];

const SIDE_BADGE: Record<HeaderRow["side"], string> = {
  request: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
  response: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  begge: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/40",
};

export function CommonHeadersTable() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-[180px_70px_1fr] gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
        <div>Header</div>
        <div>Side</div>
        <div>Hva den gjør / eksempel</div>
      </div>
      <div className="divide-y divide-border">
        {HEADERS.map((h) => (
          <div key={h.name} className="grid grid-cols-[180px_70px_1fr] gap-3 px-4 py-3 text-sm items-start">
            <div className="font-mono text-orange-600 dark:text-orange-300 font-semibold">
              {h.name}
            </div>
            <div>
              <span
                className={`inline-block px-1.5 py-0.5 rounded border text-[10px] font-mono ${SIDE_BADGE[h.side]}`}
              >
                {h.side}
              </span>
            </div>
            <div>
              <p className="text-foreground/80 leading-relaxed">{h.meaning}</p>
              <code className="mt-1.5 inline-block text-[11px] bg-muted/40 px-2 py-0.5 rounded text-foreground/70 break-all">
                {h.example}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
