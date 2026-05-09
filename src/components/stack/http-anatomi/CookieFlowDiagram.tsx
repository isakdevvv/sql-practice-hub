export function CookieFlowDiagram() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="grid gap-4 md:grid-cols-[120px_1fr_120px] items-stretch">
        {/* Header row */}
        <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Browser
        </div>
        <div />
        <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Server
        </div>

        {/* Step 1 — request 1 (no cookie) */}
        <FlowBox label="Request 1" sub="Ingen cookie ennå" tone="muted" />
        <Arrow direction="right" label="POST /login" />
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs font-mono">
          <div className="text-muted-foreground">POST /login HTTP/1.1</div>
          <div className="text-muted-foreground">Host: example.com</div>
          <div className="text-zinc-500">(ingen Cookie-header)</div>
        </div>

        {/* Step 2 — server response with Set-Cookie */}
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs font-mono">
          <div className="text-emerald-700 dark:text-emerald-300">HTTP/1.1 200 OK</div>
          <div className="text-orange-600 dark:text-orange-300 break-all">
            Set-Cookie: session=abc; HttpOnly
          </div>
        </div>
        <Arrow direction="left" label="200 OK + Set-Cookie" tone="emerald" />
        <FlowBox
          label="Response"
          sub="Server lager session, gir cookie tilbake"
          tone="emerald"
        />

        {/* Step "browser stores" */}
        <div className="md:col-span-3 rounded-md border border-dashed border-border bg-amber-500/5 p-2 text-center text-xs text-amber-700 dark:text-amber-300">
          Browser lagrer cookien <code className="bg-amber-500/10 px-1 rounded">session=abc</code>{" "}
          for example.com
        </div>

        {/* Step 3 — request 2 with Cookie */}
        <FlowBox label="Request 2" sub="Browser legger på cookien automatisk" tone="brand" />
        <Arrow direction="right" label="GET /dashboard + Cookie" tone="brand" />
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs font-mono">
          <div className="text-muted-foreground">GET /dashboard HTTP/1.1</div>
          <div className="text-muted-foreground">Host: example.com</div>
          <div className="text-orange-600 dark:text-orange-300 break-all">Cookie: session=abc</div>
        </div>

        {/* Step 4 — server reads cookie */}
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs font-mono">
          <div className="text-emerald-700 dark:text-emerald-300">HTTP/1.1 200 OK</div>
          <div className="text-zinc-600 dark:text-zinc-400 italic">(personalisert side)</div>
        </div>
        <Arrow direction="left" label="200 OK" tone="emerald" />
        <FlowBox
          label="Response"
          sub="Server slår opp 'abc' i session-store, finner brukeren"
          tone="emerald"
        />
      </div>
    </div>
  );
}

function FlowBox({
  label,
  sub,
  tone,
}: {
  label: string;
  sub: string;
  tone: "muted" | "brand" | "emerald";
}) {
  const cls =
    tone === "brand"
      ? "border-brand/40 bg-brand/5"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-border bg-muted/20";
  return (
    <div className={`rounded-md border ${cls} p-3 text-center`}>
      <div className="text-xs font-semibold text-foreground">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{sub}</div>
    </div>
  );
}

function Arrow({
  direction,
  label,
  tone = "muted",
}: {
  direction: "left" | "right";
  label: string;
  tone?: "muted" | "brand" | "emerald";
}) {
  const color =
    tone === "brand"
      ? "text-brand"
      : tone === "emerald"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground";
  const arrow = direction === "right" ? "→" : "←";
  return (
    <div className={`flex flex-col items-center justify-center text-center px-2 ${color}`}>
      <div className="text-[10px] uppercase tracking-wider font-semibold leading-tight">
        {label}
      </div>
      <div className="text-2xl leading-none mt-1">{arrow}</div>
    </div>
  );
}
