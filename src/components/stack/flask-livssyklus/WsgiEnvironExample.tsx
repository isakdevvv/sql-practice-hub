type Row = { key: string; value: string; explain: string };

const ENVIRON_ROWS: Row[] = [
  {
    key: "REQUEST_METHOD",
    value: "'POST'",
    explain: "GET, POST, PUT, DELETE … fra første ord i HTTP-forespørselen.",
  },
  {
    key: "PATH_INFO",
    value: "'/login'",
    explain: "Stien etter domenet, uten query-string. Brukes til routing.",
  },
  {
    key: "QUERY_STRING",
    value: "'next=%2Fkonto'",
    explain: "Alt etter ?. URL-encodet. Flask gir deg dette via request.args.",
  },
  {
    key: "SERVER_NAME",
    value: "'127.0.0.1'",
    explain: "IP-en serveren binder seg til.",
  },
  {
    key: "SERVER_PORT",
    value: "'5000'",
    explain: "Porten Werkzeug lytter på (default for app.run).",
  },
  {
    key: "HTTP_HOST",
    value: "'localhost:5000'",
    explain: "Host-headeren browseren sendte. Alle HTTP_* er headere.",
  },
  {
    key: "HTTP_USER_AGENT",
    value: "'Mozilla/5.0 …'",
    explain: "User-Agent-headeren. Underscore i nøkkel, bindestrek i headeren.",
  },
  {
    key: "HTTP_COOKIE",
    value: "'session=eyJ1c2Vy…'",
    explain: "Alle cookies som én streng. Flask parser den til request.cookies.",
  },
  {
    key: "CONTENT_TYPE",
    value: "'application/x-www-form-urlencoded'",
    explain: "Spesialcase: ikke HTTP_ prefix. Sier hvordan body skal tolkes.",
  },
  {
    key: "CONTENT_LENGTH",
    value: "'34'",
    explain: "Antall bytes i body.",
  },
  {
    key: "wsgi.input",
    value: "<file-like>",
    explain: "Strøm du leser request-body fra. Flask leser ferdig for deg.",
  },
  {
    key: "wsgi.url_scheme",
    value: "'http'",
    explain: "http eller https. Flask bruker dette i url_for(... _external=True).",
  },
];

export function WsgiEnvironExample() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        environ — slik ser den dict-en Werkzeug gir Flask ut
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left font-semibold px-4 py-2">Nøkkel</th>
              <th className="text-left font-semibold px-4 py-2">Verdi</th>
              <th className="text-left font-semibold px-4 py-2">Hva er dette?</th>
            </tr>
          </thead>
          <tbody>
            {ENVIRON_ROWS.map((r) => (
              <tr key={r.key} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2 align-top font-mono text-[12px] text-foreground whitespace-nowrap">
                  {r.key}
                </td>
                <td className="px-4 py-2 align-top font-mono text-[12px] text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                  {r.value}
                </td>
                <td className="px-4 py-2 align-top text-foreground/80">{r.explain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        Flask kaller egentlig <code className="font-mono">app(environ, start_response)</code>.
        Hele rammeverket bygger på å lese ut av denne dict-en og kalle{" "}
        <code className="font-mono">start_response("200 OK", [...])</code> tilbake.
      </div>
    </div>
  );
}
