export function MethodComparison() {
  return (
    <div>
      <p className="text-foreground/80 leading-relaxed mb-5">
        Anta at brukeren fyller ut samme login-skjema. Det går an å sende det enten som GET eller
        POST. På trådlinjen ser de helt forskjellige ut:
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-zinc-950 text-zinc-100 p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-semibold tracking-wider">
              GET
            </span>
            <span className="text-zinc-400 text-[11px]">Data i URL-en</span>
          </div>
          <pre className="whitespace-pre-wrap break-all leading-6">
{`GET /login?email=ola%40ex.no&password=hunter2 HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0

`}
            <span className="text-zinc-600 italic">(ingen body)</span>
          </pre>
        </div>

        <div className="rounded-lg border border-border bg-zinc-950 text-zinc-100 p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-semibold tracking-wider">
              POST
            </span>
            <span className="text-zinc-400 text-[11px]">Data i body</span>
          </div>
          <pre className="whitespace-pre-wrap break-all leading-6">
{`POST /login HTTP/1.1
Host: example.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 35

`}
            <span className="text-green-300">email=ola%40ex.no&password=hunter2</span>
          </pre>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
            Hvorfor ikke GET for sensitive ting?
          </h3>
          <ul className="space-y-1.5 text-foreground/80 list-disc pl-5 text-[13px]">
            <li>URL-en logges av servere, proxier, og browser-history.</li>
            <li>URL-en synes i Referer-headeren til neste side.</li>
            <li>Lagres i bookmarks og delt-lenker.</li>
            <li>URL-er har lengdegrenser (~2000 tegn praktisk).</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <h3 className="font-semibold mb-2">Tommelfingerregel</h3>
          <ul className="space-y-1.5 text-foreground/80 list-disc pl-5 text-[13px]">
            <li>
              <strong>GET</strong> — henter data, idempotent, kan caches. Filtrene på en søkeside.
            </li>
            <li>
              <strong>POST</strong> — endrer state, sender skjemadata, login. Kan ikke gjentas
              trygt.
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            I Flask: <code>request.args["q"]</code> for GET, <code>request.form["email"]</code> for
            POST.
          </p>
        </div>
      </div>
    </div>
  );
}
