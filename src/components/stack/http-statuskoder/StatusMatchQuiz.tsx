import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Status Match Quiz — 10 use-cases, dra til riktig statuskode
// ---------------------------------------------------------------------------
// Pedagogisk poeng: når du har øvd på beslutningstreet og animatoren bør du
// kunne resonnere fra fritekst-scenario til kode uten å gå gjennom treet.
// Hver feil-plassering gir en kort forklaring på hvorfor riktig svar var det
// det var — slik at "hvorfor 422 og ikke 400?" sitter etter quizen.
// ---------------------------------------------------------------------------

type Code = "200" | "201" | "204" | "301" | "304" | "400" | "401" | "403" | "404" | "409" | "429";

type UseCase = {
  id: string;
  text: string;
  answer: Code;
  explanation: string;
};

const USE_CASES: UseCase[] = [
  {
    id: "uc1",
    text: "POST /users med gyldig JSON som lager en helt ny brukerkonto.",
    answer: "201",
    explanation:
      "Ny ressurs opprettet. Server bør også sende Location-header som peker på den nye brukeren.",
  },
  {
    id: "uc2",
    text: "GET /artikkel/42 hvor klientens If-None-Match matcher serverens ETag.",
    answer: "304",
    explanation:
      "Conditional GET: innholdet er uendret, så server dropper body. Klienten bruker cachet versjon.",
  },
  {
    id: "uc3",
    text: "PATCH /todos/3 som lykkes, der klienten ikke trenger noe svar — den vet allerede ny tilstand.",
    answer: "204",
    explanation:
      "Vellykket, men ingen meningsfull body å returnere. 204 forbyr body — klienten skal ikke vente på data.",
  },
  {
    id: "uc4",
    text: "OPTIONS preflight som godtas av server (CORS).",
    answer: "204",
    explanation:
      "Preflight-respons har ingen body, bare CORS-headers. 200 ville fungert, men 204 er den ryddige varianten.",
  },
  {
    id: "uc5",
    text: "GET /gammel-url som har blitt permanent flyttet til /ny-url.",
    answer: "301",
    explanation:
      "Permanent redirect. Send Location-header. Klient/søkemotor skal oppdatere bokmerker.",
  },
  {
    id: "uc6",
    text: "GET /api/data uten Authorization-header, der ruten krever innlogging.",
    answer: "401",
    explanation:
      "Klienten er ikke autentisert. Server sender WWW-Authenticate som forteller hvilken type token den forventer.",
  },
  {
    id: "uc7",
    text: "DELETE /admin/users/42 fra en innlogget bruker som ikke er admin.",
    answer: "403",
    explanation:
      "Vi VET hvem du er (du har gyldig token), men du har ikke rettighet. Det er ikke en login-feil — det er rolle-feil.",
  },
  {
    id: "uc8",
    text: "POST /users med en e-postadresse som allerede finnes i databasen.",
    answer: "409",
    explanation:
      "Konflikt med eksisterende state. JSON er gyldig, validering OK, men forretningsregelen «unik e-post» er brutt.",
  },
  {
    id: "uc9",
    text: "GET /search?q=test som er den 1001. requesten dette minuttet mot et API med 1000/min-kvote.",
    answer: "429",
    explanation:
      "Rate-limiteren slo inn. Server sender Retry-After så klienten vet hvor lenge den må vente.",
  },
  {
    id: "uc10",
    text: "POST /comments med en JSON-body som har en syntaksfeil (manglende komma).",
    answer: "400",
    explanation:
      "Server kan ikke engang parse bodyen. Skiller seg fra 422 ved at vi ikke kom så langt som til feltvalidering.",
  },
];

const CODE_INFO: Record<Code, { name: string; klasse: "2xx" | "3xx" | "4xx" | "5xx" }> = {
  "200": { name: "OK", klasse: "2xx" },
  "201": { name: "Created", klasse: "2xx" },
  "204": { name: "No Content", klasse: "2xx" },
  "301": { name: "Moved Permanently", klasse: "3xx" },
  "304": { name: "Not Modified", klasse: "3xx" },
  "400": { name: "Bad Request", klasse: "4xx" },
  "401": { name: "Unauthorized", klasse: "4xx" },
  "403": { name: "Forbidden", klasse: "4xx" },
  "404": { name: "Not Found", klasse: "4xx" },
  "409": { name: "Conflict", klasse: "4xx" },
  "429": { name: "Too Many Requests", klasse: "4xx" },
};

// Bins shown as drop-targets — every code that appears as an answer + a few decoys.
const BIN_CODES: Code[] = ["200", "201", "204", "301", "304", "400", "401", "403", "404", "409", "429"];

const CLASS_COLOR: Record<"2xx" | "3xx" | "4xx" | "5xx", string> = {
  "2xx": "border-emerald-500/40",
  "3xx": "border-sky-500/40",
  "4xx": "border-amber-500/40",
  "5xx": "border-red-500/40",
};

type Placement = Record<string, Code | null>;

export function StatusMatchQuiz() {
  const [placement, setPlacement] = useState<Placement>(() =>
    Object.fromEntries(USE_CASES.map((u) => [u.id, null])) as Placement
  );
  const [dragged, setDragged] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const palette = useMemo(
    () => USE_CASES.filter((u) => placement[u.id] === null),
    [placement]
  );

  function place(id: string, code: Code) {
    setPlacement((p) => ({ ...p, [id]: code }));
    setDragged(null);
  }
  function unplace(id: string) {
    setPlacement((p) => ({ ...p, [id]: null }));
  }
  function reset() {
    setPlacement(Object.fromEntries(USE_CASES.map((u) => [u.id, null])) as Placement);
    setChecked(false);
  }

  const allPlaced = palette.length === 0;
  const correctCount = useMemo(
    () => USE_CASES.filter((u) => placement[u.id] === u.answer).length,
    [placement]
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Match-quiz — 10 use-cases</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dra hvert scenario til riktig statuskode. Tap på en plassert kort for å frigjøre den.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border text-xs hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
      </div>

      {/* Palette */}
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 min-h-[80px]">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Scenarier å plassere ({palette.length} igjen)
        </div>
        <div className="flex flex-wrap gap-2">
          {palette.length === 0 && (
            <div className="text-xs text-muted-foreground italic">
              Alle plassert. Trykk Sjekk under.
            </div>
          )}
          {palette.map((u) => (
            <button
              key={u.id}
              type="button"
              draggable
              onDragStart={() => setDragged(u.id)}
              onDragEnd={() => setDragged(null)}
              className={`text-left text-xs px-3 py-2 rounded border border-border bg-card hover:bg-muted cursor-move max-w-[380px] ${
                dragged === u.id ? "opacity-50" : ""
              }`}
            >
              {u.text}
            </button>
          ))}
        </div>
      </div>

      {/* Bins */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {BIN_CODES.map((code) => {
          const info = CODE_INFO[code];
          const placed = USE_CASES.filter((u) => placement[u.id] === code);
          return (
            <Bin
              key={code}
              code={code}
              name={info.name}
              klasse={info.klasse}
              placed={placed}
              checked={checked}
              placement={placement}
              onDrop={() => dragged && place(dragged, code)}
              onUnplace={unplace}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {checked ? (
            <span>
              {correctCount} / {USE_CASES.length} riktig.{" "}
              {correctCount === USE_CASES.length && (
                <span className="text-emerald-500 font-semibold">Perfekt!</span>
              )}
            </span>
          ) : allPlaced ? (
            <span>Klar til å sjekke.</span>
          ) : (
            <span>Dra alle ti først.</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!allPlaced}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-3.5 w-3.5" />
          Sjekk
        </button>
      </div>

      {/* Per-card feedback */}
      {checked && (
        <div className="space-y-1.5 pt-1">
          {USE_CASES.map((u) => {
            const placed = placement[u.id];
            const ok = placed === u.answer;
            return (
              <div
                key={u.id}
                className={`rounded border px-3 py-2 text-xs flex items-start gap-2 ${
                  ok
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-red-500/40 bg-red-500/5"
                }`}
              >
                {ok ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-medium text-foreground">{u.text}</div>
                  <div className="text-muted-foreground mt-0.5">
                    Riktig: <span className="font-mono font-semibold">{u.answer}</span>{" "}
                    {CODE_INFO[u.answer].name}
                    {!ok && placed && (
                      <>
                        {" — du dro til "}
                        <span className="font-mono">{placed}</span>{" "}
                        {CODE_INFO[placed].name}
                      </>
                    )}
                    . {u.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Bin({
  code,
  name,
  klasse,
  placed,
  checked,
  placement,
  onDrop,
  onUnplace,
}: {
  code: Code;
  name: string;
  klasse: "2xx" | "3xx" | "4xx" | "5xx";
  placed: UseCase[];
  checked: boolean;
  placement: Placement;
  onDrop: () => void;
  onUnplace: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        onDrop();
      }}
      className={`rounded-md border-2 border-dashed p-2 min-h-[90px] transition-colors ${
        hover ? "border-brand bg-brand/5" : CLASS_COLOR[klasse]
      }`}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-mono font-bold">{code}</span>
        <span className="text-[10px] text-muted-foreground">{name}</span>
      </div>
      <div className="mt-1 space-y-1">
        {placed.map((u) => {
          const ok = placement[u.id] === u.answer;
          const styled = checked
            ? ok
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-red-500/50 bg-red-500/10"
            : "border-border bg-card";
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => !checked && onUnplace(u.id)}
              className={`text-left text-[10px] leading-snug px-1.5 py-1 rounded border w-full ${styled} ${
                checked ? "cursor-default" : "hover:bg-muted cursor-pointer"
              }`}
              title={checked ? undefined : "Klikk for å sende tilbake"}
            >
              {u.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
