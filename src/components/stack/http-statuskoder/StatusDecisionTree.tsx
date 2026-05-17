import { useState, useMemo } from "react";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// HTTP Status Decision Tree — interaktivt beslutningstre
// ---------------------------------------------------------------------------
// Pedagogisk poeng: hver statuskode er svaret på en kjede av ja/nei-spørsmål
// om requesten og serverens tilstand. Tre fanger denne logikken eksplisitt og
// lar brukeren bygge intuisjon for hvorfor f.eks. 401 ≠ 403, 404 ≠ 410, osv.
// ---------------------------------------------------------------------------

type StatusCode =
  | "200" | "201" | "204"
  | "301" | "304"
  | "400" | "401" | "403" | "404" | "409" | "410" | "418" | "422" | "429"
  | "500" | "502" | "503" | "504";

type StatusClass = "2xx" | "3xx" | "4xx" | "5xx";

type Branch = { label: string; next: string };

type QuestionNode = {
  kind: "question";
  id: string;
  question: string;
  hint?: string;
  yes: Branch;
  no: Branch;
};

type AnswerNode = {
  kind: "answer";
  id: string;
  code: StatusCode;
  name: string;
  why: string;
};

type Node = QuestionNode | AnswerNode;

const CLASS_OF: Record<StatusCode, StatusClass> = {
  "200": "2xx", "201": "2xx", "204": "2xx",
  "301": "3xx", "304": "3xx",
  "400": "4xx", "401": "4xx", "403": "4xx", "404": "4xx",
  "409": "4xx", "410": "4xx", "418": "4xx", "422": "4xx", "429": "4xx",
  "500": "5xx", "502": "5xx", "503": "5xx", "504": "5xx",
};

const CLASS_LABEL: Record<StatusClass, string> = {
  "2xx": "Suksess",
  "3xx": "Redirect / cache",
  "4xx": "Klientfeil",
  "5xx": "Serverfeil",
};

const CLASS_COLOR: Record<StatusClass, string> = {
  "2xx": "text-emerald-500 border-emerald-500/40 bg-emerald-500/10",
  "3xx": "text-sky-500 border-sky-500/40 bg-sky-500/10",
  "4xx": "text-amber-500 border-amber-500/40 bg-amber-500/10",
  "5xx": "text-red-500 border-red-500/40 bg-red-500/10",
};

const TREE: Record<string, Node> = {
  start: {
    kind: "question",
    id: "start",
    question: "Kunne serveren i det hele tatt forstå og svare på requesten?",
    hint:
      "Inkluderer alt fra om upstream-gateway responderte til om serveren har kapasitet.",
    yes: { label: "Ja — vi har en respons", next: "valid_syntax" },
    no: { label: "Nei — noe gikk galt server-side", next: "server_layer" },
  },
  server_layer: {
    kind: "question",
    id: "server_layer",
    question: "Var det denne serveren som feilet, eller en upstream-gateway?",
    hint:
      "502/504 trigges når reverse proxy (nginx, ELB) ikke får respons fra origin.",
    yes: { label: "Upstream-gateway / nedstrøms-tjeneste feilet", next: "gateway" },
    no: { label: "Denne serveren selv knakk", next: "self_fail" },
  },
  gateway: {
    kind: "question",
    id: "gateway",
    question: "Fikk gatewayen et ugyldig svar, eller tida bare rant ut?",
    yes: { label: "Tidsavbrudd — upstream svarte aldri", next: "504" },
    no: { label: "Upstream svarte, men svaret var ugyldig", next: "502" },
  },
  self_fail: {
    kind: "question",
    id: "self_fail",
    question: "Er serveren midlertidig nede (vedlikehold, overbelastet), eller har koden krasjet?",
    yes: { label: "Midlertidig — vil komme tilbake", next: "503" },
    no: { label: "Stack trace / uncaught exception", next: "500" },
  },
  valid_syntax: {
    kind: "question",
    id: "valid_syntax",
    question: "Var request-syntaksen i det hele tatt parsebar?",
    hint:
      "Ugyldig JSON, malformet header, manglende obligatorisk felt → 400.",
    yes: { label: "Ja — vi kunne parse den", next: "auth" },
    no: { label: "Nei — søppel-input", next: "400" },
  },
  auth: {
    kind: "question",
    id: "auth",
    question: "Krever ruten autentisering, og er klienten autentisert?",
    yes: { label: "Autentisering OK (eller ikke nødvendig)", next: "authz" },
    no: { label: "Bruker er ikke logget inn / mangler token", next: "401" },
  },
  authz: {
    kind: "question",
    id: "authz",
    question: "Har den autentiserte brukeren lov til å gjøre nettopp dette?",
    hint:
      "401 = «hvem er du?», 403 = «jeg vet hvem du er, men du får ikke».",
    yes: { label: "Ja — autorisasjon OK", next: "rate" },
    no: { label: "Nei — innlogget, men forbudt", next: "403" },
  },
  rate: {
    kind: "question",
    id: "rate",
    question: "Har klienten sendt for mange requests i kort tid?",
    yes: { label: "Ja — rate-limit oversteget", next: "429" },
    no: { label: "Nei — innenfor kvoten", next: "exists" },
  },
  exists: {
    kind: "question",
    id: "exists",
    question: "Finnes ressursen som klienten ber om?",
    yes: { label: "Ja — ressursen er der", next: "method" },
    no: { label: "Nei — ukjent ressurs", next: "gone" },
  },
  gone: {
    kind: "question",
    id: "gone",
    question: "Har ressursen eksistert tidligere men blitt permanent fjernet?",
    hint:
      "410 Gone = «den var her, vi har slettet den med vilje, ikke prøv igjen».",
    yes: { label: "Ja — den er borte for godt", next: "410" },
    no: { label: "Nei — den finnes ingen steder vi kjenner til", next: "404" },
  },
  method: {
    kind: "question",
    id: "method",
    question: "Har ressursen flyttet permanent til en ny URL?",
    yes: { label: "Ja — fortell klienten den nye adressen", next: "301" },
    no: { label: "Nei — ressursen er på riktig sted", next: "verb" },
  },
  verb: {
    kind: "question",
    id: "verb",
    question: "Hva slags operasjon er det — lesing, oppretting eller endring?",
    yes: { label: "Lesing (GET / HEAD)", next: "cache" },
    no: { label: "Skriving (POST / PUT / PATCH / DELETE)", next: "validate" },
  },
  cache: {
    kind: "question",
    id: "cache",
    question: "Sendte klienten en gyldig If-None-Match / ETag som matcher det vi har?",
    hint:
      "304 Not Modified sparer båndbredde — body droppes, klienten bruker cachet versjon.",
    yes: { label: "Ja — ETag matcher", next: "304" },
    no: { label: "Nei — send ferskt innhold", next: "200" },
  },
  validate: {
    kind: "question",
    id: "validate",
    question: "Var input-dataene semantisk gyldige (passord lange nok, e-post unik, …)?",
    hint:
      "Syntaks-OK men forretningsregler brudd → 422. Det er forskjellen fra 400.",
    yes: { label: "Ja — alt validerer", next: "conflict" },
    no: { label: "Nei — regelbrudd", next: "422" },
  },
  conflict: {
    kind: "question",
    id: "conflict",
    question: "Kolliderer endringen med eksisterende tilstand (duplikat-nøkkel, samtidig redigering)?",
    yes: { label: "Ja — konflikt", next: "409" },
    no: { label: "Nei — alt ledig", next: "created" },
  },
  created: {
    kind: "question",
    id: "created",
    question: "Opprettet du en helt ny ressurs, eller bare oppdaterte en eksisterende?",
    yes: { label: "Ny ressurs opprettet (POST som lager noe)", next: "201" },
    no: { label: "Bare oppdatert — ingen body å returnere", next: "204" },
  },
  // ====== Endeløsninger ======
  "200": { kind: "answer", id: "200", code: "200", name: "OK",
    why: "Den vanligste suksess-koden. Body inneholder forventet data. Brukes for GET/PUT/PATCH som lykkes og leverer et svar." },
  "201": { kind: "answer", id: "201", code: "201", name: "Created",
    why: "En ny ressurs er opprettet. Server bør sette Location-header til den nye ressursens URL. Typisk etter POST." },
  "204": { kind: "answer", id: "204", code: "204", name: "No Content",
    why: "Vellykket — men ingenting å returnere. Body MÅ være tom. Typisk DELETE eller PATCH der klienten allerede vet ny tilstand." },
  "301": { kind: "answer", id: "301", code: "301", name: "Moved Permanently",
    why: "Permanent redirect. Send Location-header. Klienten bør oppdatere bokmerker / cachene sine. Brukes ved domene-flytting, http→https." },
  "304": { kind: "answer", id: "304", code: "304", name: "Not Modified",
    why: "Conditional GET: klientens If-None-Match matchet vår ETag, så vi sender ingen body. Klient bruker cachet versjon. ETag-header MÅ være med." },
  "400": { kind: "answer", id: "400", code: "400", name: "Bad Request",
    why: "Request-syntaksen er ødelagt: malformet JSON, ugyldig header, parameter som ikke parser. Det er klientens skyld, men på input-laget — ikke på forretningslogikk." },
  "401": { kind: "answer", id: "401", code: "401", name: "Unauthorized",
    why: "Misvisende navn — det betyr «ikke autentisert». Klienten må logge inn / sende et gyldig token. WWW-Authenticate-header forteller hvordan." },
  "403": { kind: "answer", id: "403", code: "403", name: "Forbidden",
    why: "Vi VET hvem du er (du er autentisert), men du har ikke tilgang til dette. Det er ikke en login-feil — det er en rettighet-feil. Ingen hint hjelper." },
  "404": { kind: "answer", id: "404", code: "404", name: "Not Found",
    why: "Ressursen finnes ikke, og vi vet ikke om den noen gang har eksistert. Mer informasjonsfattig enn 410. Brukes også som «vi vil ikke fortelle deg»." },
  "409": { kind: "answer", id: "409", code: "409", name: "Conflict",
    why: "Forespørselen kolliderer med nåværende serverstate: brukernavn finnes allerede, optimistisk concurrency-token er utdatert, branch er allerede merget." },
  "410": { kind: "answer", id: "410", code: "410", name: "Gone",
    why: "Ressursen FANTES, men er fjernet permanent og kommer ikke tilbake. Sterkere signal enn 404 — søkemotorer fjerner URLen fra indeksen." },
  "418": { kind: "answer", id: "418", code: "418", name: "I'm a teapot",
    why: "RFC 2324 påskespøk. Brukes IKKE i ekte API-er, men er kanon i HTTP-folklore. Pop quiz: server som nekter å brygge kaffe fordi den er en tekanne." },
  "422": { kind: "answer", id: "422", code: "422", name: "Unprocessable Entity",
    why: "Syntaks-OK (vi kunne parse JSON-en), men semantikk-feil: passord var for kort, e-post ikke unik, alder negativ. Validering-feil etter parsing." },
  "429": { kind: "answer", id: "429", code: "429", name: "Too Many Requests",
    why: "Rate-limit oversteget. Send Retry-After-header med antall sekunder. Klienten bør respektere og bremse, evt. backe av eksponentielt." },
  "500": { kind: "answer", id: "500", code: "500", name: "Internal Server Error",
    why: "Stack trace fra serverkoden. Bug. Logg aggressivt, alert pagerduty. Klienten kan ikke gjøre noe — de kan bare prøve igjen senere." },
  "502": { kind: "answer", id: "502", code: "502", name: "Bad Gateway",
    why: "Vi (reverse proxy / load balancer) fikk et UGYLDIG svar fra upstream. Origin er kanskje krasjet eller svarer med søppel. Sjekk origin." },
  "503": { kind: "answer", id: "503", code: "503", name: "Service Unavailable",
    why: "Vi er midlertidig ute av spill (vedlikehold, overbelastet, deploy pågår). Send Retry-After. Forskjellen fra 500 er at vi vet vi kommer tilbake." },
  "504": { kind: "answer", id: "504", code: "504", name: "Gateway Timeout",
    why: "Vi (reverse proxy) ventet på upstream, men tida rant ut. Upstream lever kanskje, men er for treg. Sjekk timeouts og origin-latency." },
};

export function StatusDecisionTree() {
  const [path, setPath] = useState<string[]>(["start"]);
  const current = TREE[path[path.length - 1]!]!;

  function choose(branch: Branch) {
    setPath((p) => [...p, branch.next]);
  }
  function back() {
    setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }
  function reset() {
    setPath(["start"]);
  }

  const breadcrumbs = useMemo(() => {
    const out: { label: string; idx: number }[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const node = TREE[path[i]!]!;
      if (node.kind !== "question") continue;
      const next = path[i + 1]!;
      const which = node.yes.next === next ? node.yes : node.no;
      out.push({ label: which.label, idx: i + 1 });
    }
    return out;
  }, [path]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Beslutningstre — fra symptom til statuskode</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Svar deg gjennom kjeden av ja/nei-spørsmål for å lande på riktig kode.
            Du kan gå tilbake når som helst.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={back}
            disabled={path.length === 1}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-3 w-3" /> Tilbake
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-xs hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Start på nytt
          </button>
        </div>
      </div>

      {breadcrumbs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {breadcrumbs.map((b, i) => (
            <span
              key={i}
              className="rounded bg-muted/50 border border-border px-2 py-0.5 text-muted-foreground"
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {current.kind === "question" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
            <div className="text-base font-semibold">{current.question}</div>
            {current.hint && (
              <div className="text-xs text-muted-foreground mt-2 italic">{current.hint}</div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => choose(current.yes)}
              className="text-left rounded-lg border border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">Ja</div>
              <div className="text-sm mt-1">{current.yes.label}</div>
            </button>
            <button
              type="button"
              onClick={() => choose(current.no)}
              className="text-left rounded-lg border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-colors p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold">Nei</div>
              <div className="text-sm mt-1">{current.no.label}</div>
            </button>
          </div>
        </div>
      ) : (
        <AnswerCard node={current} />
      )}
    </div>
  );
}

function AnswerCard({ node }: { node: AnswerNode }) {
  const cls = CLASS_OF[node.code];
  return (
    <div className="rounded-lg border-2 border-brand/40 bg-brand/5 p-5">
      <div className="flex items-center gap-3 mb-3">
        <CheckCircle2 className="h-5 w-5 text-brand" />
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Endepunkt — statuskode
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-3">
        <div className="text-5xl font-bold font-mono">{node.code}</div>
        <div className="text-2xl font-semibold">{node.name}</div>
        <span
          className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 border ${CLASS_COLOR[cls]}`}
        >
          {cls} · {CLASS_LABEL[cls]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{node.why}</p>
    </div>
  );
}
