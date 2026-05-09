import { StackPageShell } from "@/components/stack/StackPageShell";
import { Prerequisites } from "@/components/stack/Prerequisites";
import { HttpMessageBreakdown } from "./HttpMessageBreakdown";
import { MethodComparison } from "./MethodComparison";
import { StatusCodeExplorer } from "./StatusCodeExplorer";
import { CommonHeadersTable } from "./CommonHeadersTable";
import { CookieFlowDiagram } from "./CookieFlowDiagram";
import { RequestThreeWays } from "./RequestThreeWays";

export function HttpAnatomiPage() {
  return (
    <StackPageShell title="HTTP-anatomi" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Prerequisites
          items={[{ slug: "bytes-encoding", title: "Bytes & encoding" }]}
        />

        <header className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">
            Trinn 7 · Eksamensforberedelse
          </div>
          <h1 className="text-4xl font-bold tracking-tight">HTTP-anatomi</h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Du har skrevet <code className="text-sm">request.headers["Host"]</code> i Flask.
            Men hva <em>er</em> egentlig en HTTP-melding? Spoiler: det er bare bytes med tekst,
            satt sammen i et veldig strengt format.
          </p>
        </header>

        {/* 1. Intro: HTTP er tekst over TCP */}
        <Section
          number={1}
          title="HTTP er bare tekst over TCP"
          subtitle="Ingen magi. Bare bytes som flyter gjennom en TCP-socket."
        >
          <p className="text-foreground/80 leading-relaxed">
            Når nettleseren snakker med en server, åpner den en{" "}
            <strong>TCP-forbindelse</strong> (vanligvis port 80 for HTTP, 443 for HTTPS) og sender
            tekst gjennom den. Den teksten følger HTTP-formatet — et veldig strengt format.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li>
              <strong>Linjeskift er <code>\r\n</code></strong> (carriage return + line feed) — ikke
              bare <code>\n</code>. Dette stammer fra teleprinter-tider og er hardkodet i
              spesifikasjonen.
            </li>
            <li>
              <strong>Headers er adskilt fra body med en blank linje</strong> (altså to <code>\r\n</code>{" "}
              etter hverandre).
            </li>
            <li>
              <strong>Versjon</strong>: vi fokuserer på <code>HTTP/1.1</code> — det du møter i
              eksamen og de fleste Flask-apper. <code>HTTP/2</code> og <code>HTTP/3</code> bruker
              binær framing, men semantikken er den samme.
            </li>
          </ul>
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Husk:</strong> Hele HTTP-meldingen er én lang
            byte-sekvens. <code>\r\n</code> er bare to bytes: <code>0x0D 0x0A</code>. Se{" "}
            <em>Bytes &amp; encoding</em>-trinnet hvis du er usikker på hva en byte er.
          </div>
        </Section>

        {/* 2. Anatomi av request */}
        <Section
          number={2}
          title="Anatomi av en request"
          subtitle="Klikk på delene for å forstå hva de gjør."
        >
          <HttpMessageBreakdown kind="request" />
        </Section>

        {/* 3. Anatomi av response */}
        <Section
          number={3}
          title="Anatomi av en response"
          subtitle="Samme struktur — bare en status-line i stedet for en request-line."
        >
          <HttpMessageBreakdown kind="response" />
        </Section>

        {/* 4. GET vs POST */}
        <Section
          number={4}
          title="GET vs POST — hvor data ligger"
          subtitle="Samme skjema, helt forskjellig request på trådlinjen."
        >
          <MethodComparison />
        </Section>

        {/* 5. Statuskoder */}
        <Section
          number={5}
          title="Statuskoder"
          subtitle="Tre sifre som forteller hva som skjedde. Klikk for forklaring."
        >
          <StatusCodeExplorer />
        </Section>

        {/* 6. Headers */}
        <Section
          number={6}
          title="Headers du møter"
          subtitle="Ikke uttømmende — bare det viktigste."
        >
          <CommonHeadersTable />
        </Section>

        {/* 7. Cookies & sesjoner */}
        <Section
          number={7}
          title="Cookies &amp; sesjoner — flyten"
          subtitle="Hvordan en server husker deg på tvers av to requests."
        >
          <CookieFlowDiagram />
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground/80 leading-relaxed">
            <strong className="text-foreground">Cookie-flagg du bør kjenne til:</strong>
            <ul className="mt-2 space-y-1 list-disc pl-5 text-muted-foreground">
              <li>
                <code>HttpOnly</code> — JavaScript kan ikke lese cookien (hindrer XSS-tyveri).
              </li>
              <li>
                <code>Secure</code> — sendes bare over HTTPS.
              </li>
              <li>
                <code>SameSite=Lax/Strict</code> — sendes ikke fra andre domener (CSRF-vern).
              </li>
            </ul>
          </div>
        </Section>

        {/* 8. Tre måter — anchor */}
        <Section
          number={8}
          title="Tre måter å se samme request"
          subtitle="Den samme POST /login — på tre abstraksjonsnivåer. Dette er punchline-en."
          highlight
        >
          <RequestThreeWays />
        </Section>

        {/* 9. URL-encoding */}
        <Section
          number={9}
          title="URL-encoding kort"
          subtitle="Hvorfor er @ skrevet som %40?"
        >
          <p className="text-foreground/80 leading-relaxed">
            Visse tegn har spesiell betydning i URL og form-bodies (<code>@</code>, <code>&amp;</code>
            , <code>=</code>, mellomrom, <code>?</code>, <code>/</code>). For å sende dem som data
            må de <strong>%-encodes</strong>: tegnet erstattes av <code>%</code> + hex-koden for
            byten.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Vanlige encodings
              </div>
              <ul className="space-y-1.5">
                <li><span className="text-orange-400">@</span> → <span className="text-green-400">%40</span></li>
                <li><span className="text-orange-400">&amp;</span> → <span className="text-green-400">%26</span></li>
                <li><span className="text-orange-400">=</span> → <span className="text-green-400">%3D</span></li>
                <li><span className="text-orange-400">?</span> → <span className="text-green-400">%3F</span></li>
                <li><span className="text-orange-400">/</span> → <span className="text-green-400">%2F</span></li>
                <li><span className="text-orange-400">mellomrom</span> → <span className="text-green-400">%20</span> (URL) eller <span className="text-green-400">+</span> (form-body)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                Hvorfor hex?
              </div>
              <p className="text-foreground/80 leading-relaxed">
                <code>%40</code> betyr "byten med verdi <code>0x40</code>" — som er 64 i desimal,
                som er ASCII-koden for <code>@</code>. Hver byte i en UTF-8-streng kan kodes på
                samme måte. Norske <code>æ</code> er to bytes i UTF-8 (<code>0xC3 0xA6</code>) og
                blir derfor <code>%C3%A6</code>.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Se <em>Bytes &amp; encoding</em>-trinnet for hvorfor <code>æ</code> blir to bytes.
              </p>
            </div>
          </div>
        </Section>

        {/* Avslutning */}
        <div className="mt-16 rounded-xl border border-brand/30 bg-brand/5 p-6">
          <h2 className="font-semibold text-foreground">Hva sitter du igjen med?</h2>
          <ul className="mt-3 space-y-2 text-sm text-foreground/80 list-disc pl-5">
            <li>
              En HTTP-melding er bare bytes — tekst med <code>\r\n</code> mellom linjer og en blank
              linje før body.
            </li>
            <li>
              Request-line / status-line + headers + body. Punktum.
            </li>
            <li>
              GET-data ligger i URL-en, POST-data i body. Det er den eneste reelle forskjellen på
              trådlinjen.
            </li>
            <li>
              Statuskoder grupperer seg i 1xx/2xx/3xx/4xx/5xx — du gjenkjenner dem på første siffer.
            </li>
            <li>
              Cookies er bare en header som serveren setter (<code>Set-Cookie</code>) og nettleseren
              sender tilbake (<code>Cookie</code>) på neste request.
            </li>
            <li>
              <code>request.headers["Host"]</code> i Flask er bare en oppslagsbok over de samme
              bytene du nå har sett.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}

function Section({
  number,
  title,
  subtitle,
  highlight = false,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`mt-12 ${
        highlight
          ? "rounded-2xl border-2 border-brand/40 bg-brand/5 p-6 -mx-2"
          : ""
      }`}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
            highlight
              ? "bg-brand text-brand-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {number}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-5 ml-10">{subtitle}</p>
      )}
      <div className="ml-0 sm:ml-10">{children}</div>
    </section>
  );
}
