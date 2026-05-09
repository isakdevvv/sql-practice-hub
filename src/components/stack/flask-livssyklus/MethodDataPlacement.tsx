type Variant = {
  id: string;
  title: string;
  where: string;
  raw: string;
  flask: string;
  note: string;
  accent: string;
};

const VARIANTS: Variant[] = [
  {
    id: "get",
    title: "GET — data i query-string",
    where: "URL etter ?",
    raw: `GET /sok?q=norges+lover&side=2 HTTP/1.1
Host: example.no

(ingen body)`,
    flask: `request.args["q"]      # "norges lover"
request.args.get("side", type=int)   # 2`,
    note:
      "Synlig i URL og logger. Begrenset lengde (~2 KB i praksis). Brukes for søk, paginering, filtre.",
    accent: "border-blue-500/40 bg-blue-500/5",
  },
  {
    id: "post-form",
    title: "POST form — data i body",
    where: "Body, x-www-form-urlencoded",
    raw: `POST /login HTTP/1.1
Host: example.no
Content-Type: application/x-www-form-urlencoded
Content-Length: 34

email=ola%40ex.no&password=hunter2`,
    flask: `request.form["email"]      # "ola@ex.no"
request.form["password"]   # "hunter2"`,
    note:
      "Standard for HTML-skjemaer. Body URL-encodes på samme måte som query-string. Skjult fra URL og browser-historikk.",
    accent: "border-emerald-500/40 bg-emerald-500/5",
  },
  {
    id: "post-json",
    title: "POST JSON — strukturert body",
    where: "Body, application/json",
    raw: `POST /api/notater HTTP/1.1
Host: example.no
Content-Type: application/json
Content-Length: 38

{"tittel":"Husk","tags":["sql","flask"]}`,
    flask: `request.json["tittel"]    # "Husk"
request.json["tags"]      # ["sql", "flask"]
request.data              # b'{"tittel":...}'  (rå bytes)`,
    note:
      "Brukes for fetch(), API-kall fra JS, mobil-apper. request.data gir deg rå bytes hvis du trenger det.",
    accent: "border-pink-500/40 bg-pink-500/5",
  },
];

export function MethodDataPlacement() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {VARIANTS.map((v) => (
        <div key={v.id} className={`rounded-xl border p-4 ${v.accent}`}>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            {v.where}
          </div>
          <h3 className="mt-1 font-semibold text-foreground">{v.title}</h3>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
              Rå HTTP
            </div>
            <pre className="rounded-md bg-background border border-border p-2 text-[11px] font-mono overflow-x-auto leading-relaxed">
              <code>{v.raw}</code>
            </pre>
          </div>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
              I Flask
            </div>
            <pre className="rounded-md bg-background border border-border p-2 text-[11px] font-mono overflow-x-auto leading-relaxed">
              <code>{v.flask}</code>
            </pre>
          </div>

          <p className="mt-3 text-xs text-foreground/80 leading-relaxed">{v.note}</p>
        </div>
      ))}
    </div>
  );
}
