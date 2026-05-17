import { Link } from "@tanstack/react-router";
import { Lightbulb, ArrowLeft, Compass } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { StatusDecisionTree } from "./StatusDecisionTree";
import { ResponseBuilder } from "./ResponseBuilder";
import { RequestFlowAnimator } from "./RequestFlowAnimator";
import { StatusMatchQuiz } from "./StatusMatchQuiz";

const STEPS = [
  { title: "Hvorfor statuskoder", anchor: "intro" },
  { title: "Beslutningstre", anchor: "tree" },
  { title: "Response-builder", anchor: "builder" },
  { title: "Request-flyt-animator", anchor: "flow" },
  { title: "Match-quiz", anchor: "quiz" },
  { title: "Eksamen-typiske spørsmål", anchor: "exam" },
];

export function HttpStatuskoderPage() {
  return (
    <StackPageShell title="HTTP statuskoder — beslutningstre og response-builder" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 / web-laget · RFC 7231 + 7235 + 6585
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            HTTP statuskoder — beslutningstre og response-builder
          </h1>
          <p className="mt-3 text-muted-foreground">
            Statuskoden er det første serveren forteller klienten. Den oppsummerer
            hva som faktisk hendte i én tre-sifret pakke — om requesten var
            gyldig, om brukeren fikk lov, om ressursen finnes, om vi bare ble
            for travle. Lesjonen lar deg <em>bygge intuisjonen</em> ved å gå
            gjennom beslutningskjeden og se den i live wire-format.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Sentralt:</span> ALLE statuskoder hører
              til én av fire klasser. <strong>1xx</strong> info,{" "}
              <strong>2xx</strong> suksess, <strong>3xx</strong> redirect/cache,{" "}
              <strong>4xx</strong> klientfeil, <strong>5xx</strong> serverfeil.
              Klassen plukker du i fingeren — selve koden plukker du av
              <em> hvilken</em> spesifikke beslutning i flyten som svaret er.
            </div>
          </div>
        </div>

        <CourseOutline courseId="http-statuskoder" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor statuskoder</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <p>
              En HTTP-respons har <strong>tre</strong> deler: en status-linje, et
              sett med headers, og en valgfri body. Status-linja er den
              som forteller klienten <em>hvordan</em> den skal tolke resten.
              200 OK betyr «bruk bodyen», 304 betyr «ikke se på body, bruk din
              egen cache», 301 betyr «glem URLen, prøv denne i stedet», 401
              betyr «logg inn først», 503 betyr «kom tilbake senere».
            </p>
            <p>
              Statuskoder er <em>maskinlesbare</em>. En klient (nettleser,
              app, annet API) tar valg basert på dem uten å lese
              feilmeldingen. Et reverse proxy retrier 5xx men ikke 4xx. En
              cache lagrer 200 men ikke 500. En søkemotor de-indekserer 410.
              Velger du feil kode, oppfører hele økosystemet seg feil.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
              <ClassCard klasse="2xx" label="Suksess" examples="200 · 201 · 204" />
              <ClassCard klasse="3xx" label="Redirect / cache" examples="301 · 302 · 304" />
              <ClassCard klasse="4xx" label="Klientfeil" examples="400 · 401 · 403 · 404 · 409 · 422 · 429" />
              <ClassCard klasse="5xx" label="Serverfeil" examples="500 · 502 · 503 · 504" />
            </div>
          </div>
        </section>

        <section id="tree" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Beslutningstre — fra symptom til kode</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klikk deg gjennom spørsmålene. Hver vei ender i en spesifikk
            statuskode, og du ser samtidig hvilken klasse den hører til. Bruk
            <em> Tilbake</em> for å utforske alternative grener.
          </p>
          <StatusDecisionTree />
        </section>

        <section id="builder" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Response-builder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Velg en kode og bygg responsen stein for stein. Lint-modusen markerer
            feil kombinasjoner — 204 med body, 304 uten ETag, 401 uten{" "}
            <code className="text-xs">WWW-Authenticate</code>, 201 uten Location.
            Wire-formatet nederst er det som faktisk går over TCP.
          </p>
          <ResponseBuilder />
        </section>

        <section id="flow" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Request-flyt-animator</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Seks forhåndsdefinerte scenarier viser hele kjeden fra klient-klikk
            til server-respons. Toggle parametre (auth-header til/fra, gyldig
            body, server-helse) og se hvordan statuskoden endrer seg som en
            funksjon av tilstand.
          </p>
          <RequestFlowAnimator />
        </section>

        <section id="quiz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Match-quiz</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ti use-cases — dra hvert til den koden du mener er riktig. Per-feil
            forklaring under når du sjekker.
          </p>
          <StatusMatchQuiz />
        </section>

        <section id="exam" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Eksamen-typiske spørsmål</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">«Forskjellen på 401 og 403?»</strong>{" "}
              401 = «hvem er du?» (mangler eller ugyldig autentisering, sender
              <code className="text-xs"> WWW-Authenticate</code>). 403 = «jeg vet
              hvem du er, men du har ikke lov» (autentisert, men mangler
              rettighet).
            </li>
            <li>
              <strong className="text-foreground">«Forskjellen på 400 og 422?»</strong>{" "}
              400 betyr at requesten ikke kunne parses (malformet JSON, ugyldig
              syntaks). 422 betyr at parsing gikk bra, men feltene brøt
              forretningsregler (for kort passord, e-post finnes).
            </li>
            <li>
              <strong className="text-foreground">«Forskjellen på 404 og 410?»</strong>{" "}
              404 betyr «jeg finner den ikke, kanskje den eksisterer et sted».
              410 Gone betyr «den fantes her, vi har slettet den med vilje, ikke
              prøv igjen». Søkemotorer tar 410 på alvor og fjerner URL-en fra
              indeksen.
            </li>
            <li>
              <strong className="text-foreground">«Når sender man 304?»</strong>{" "}
              Når klientens <code className="text-xs">If-None-Match</code>{" "}
              matcher serverens ETag. Server dropper body og klienten bruker
              cachet versjon. Sparer båndbredde uten å gå glipp av endringer.
            </li>
            <li>
              <strong className="text-foreground">«Hva er forskjellen på 500, 502, 503, 504?»</strong>{" "}
              500 = uventet feil i din egen kode. 502 = upstream-server svarte
              ugyldig (proxy så søppel). 503 = du er midlertidig nede (vedlikehold,
              overbelastet) — sender Retry-After. 504 = upstream-server svarte ikke
              i tide (timeout fra proxy).
            </li>
            <li>
              <strong className="text-foreground">«Hvilken kode etter en vellykket DELETE?»</strong>{" "}
              204 No Content er typisk — DELETE har sjelden meningsfull body å
              returnere. 200 er også OK hvis du faktisk vil sende en
              bekreftelse i body.
            </li>
            <li>
              <strong className="text-foreground">«Hvorfor sender 429 en Retry-After-header?»</strong>{" "}
              For at klienten skal kunne bremse seg selv eksplisitt i stedet for
              å hamre på serveren med eksponentiell backoff. Verdien er sekunder
              eller en HTTP-dato. Samme mekanisme i 503.
            </li>
            <li>
              <strong className="text-foreground">«Hva er 418 I'm a teapot?»</strong>{" "}
              RFC 2324 påskespøk fra 1998. Brukes ikke seriøst, men er kanon i
              HTTP-folklore. Server som nekter å brygge kaffe fordi den er en
              tekanne. Noen API-er bruker den for «vis ikke til endebrukere».
            </li>
          </ul>
        </section>

        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Compass className="h-4 w-4 text-brand" />
            Neste steg
          </h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "http-anatomi" }} className="text-brand hover:underline">
                HTTP-anatomi
              </Link>{" "}
              — request-respons-formatet i detalj.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "sikkerhet" }} className="text-brand hover:underline">
                Sikkerhet
              </Link>{" "}
              — hva 401, 403 og 429 betyr i et angreps-scenario.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "rest-api-builder" }} className="text-brand hover:underline">
                REST API Builder
              </Link>{" "}
              — kobler statuskodene til hvordan du faktisk skriver
              endepunktene i Flask / FastAPI / Express / ASP.NET.
            </li>
          </ul>
        </div>
        <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "http-anatomi" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til HTTP-anatomi
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}

function ClassCard({
  klasse,
  label,
  examples,
}: {
  klasse: "2xx" | "3xx" | "4xx" | "5xx";
  label: string;
  examples: string;
}) {
  const color =
    klasse === "2xx"
      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500"
      : klasse === "3xx"
      ? "border-sky-500/40 bg-sky-500/5 text-sky-500"
      : klasse === "4xx"
      ? "border-amber-500/40 bg-amber-500/5 text-amber-500"
      : "border-red-500/40 bg-red-500/5 text-red-500";
  return (
    <div className={`rounded-md border p-2.5 text-xs ${color}`}>
      <div className="font-mono font-bold text-sm">{klasse}</div>
      <div className="font-semibold text-foreground">{label}</div>
      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{examples}</div>
    </div>
  );
}
