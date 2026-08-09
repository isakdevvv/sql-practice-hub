import { useState } from "react";
import { ArrowRight, Check, Compass, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Type 2 — guidet simulering til atomene A02 (de tre læringstypene) og A03
 * (regresjon mot klassifikasjon).
 *
 * Dette er ikke en quiz. Det er en beslutningsregel som skal automatiseres, og
 * derfor står regelen synlig hele veien mens du bruker den. Ingenting telles,
 * og du kan alltid gå videre. Tilbakemeldingen forklarer hvilket ledd i regelen
 * som avgjorde saken, ikke bare om du traff.
 *
 * Rekkefølgen på casene er valgt: de tre første er rene, de fire siste er
 * nettopp de som pleier å bli sortert feil.
 */

type Laeringstype = "supervised" | "unsupervised" | "reinforcement";
type Oppgavetype = "regresjon" | "klassifikasjon";

type Case = {
  id: string;
  tittel: string;
  beskrivelse: string;
  /** Hva som faktisk ligger i datasettet. Dette er leddet som avgjør. */
  data: string;
  fasit: Laeringstype;
  /** Bare for supervised — er svaret et tall eller en kategori? */
  oppgave?: Oppgavetype;
  /** Hvorfor det ble denne læringstypen. */
  begrunnelse: string;
  /** Hvorfor regresjon eller klassifikasjon, når det er aktuelt. */
  oppgaveBegrunnelse?: string;
  /** Den vanligste feilsorteringen, og hva som forleder. */
  felle?: string;
};

const CASER: Case[] = [
  {
    id: "c1",
    tittel: "Boligpris",
    beskrivelse:
      "Et meglerhus vil anslå hva en bolig kommer til å bli solgt for, ut fra areal, byggeår, etasje og bydel.",
    data: "40 000 tidligere salg, med den faktiske salgssummen i kroner for hver av dem.",
    fasit: "supervised",
    oppgave: "regresjon",
    begrunnelse:
      "Salgssummen står oppført for hvert historiske salg. Det er en fasit, og da er det supervised learning.",
    oppgaveBegrunnelse:
      "Svaret er et beløp i kroner, og avstand betyr noe: å bomme med 50 000 er mye bedre enn å bomme med 2 millioner. Det er regresjon.",
  },
  {
    id: "c2",
    tittel: "Frafall i et studieprogram",
    beskrivelse:
      "En høgskole vil vite hvilke studenter som står i fare for å slutte, slik at de kan tilbys oppfølging.",
    data: "Seks år med studenthistorikk, der det for hver student står om vedkommende fullførte eller sluttet.",
    fasit: "supervised",
    oppgave: "klassifikasjon",
    begrunnelse:
      "«Fullførte eller sluttet» er registrert for hver historiske student. Fasiten finnes.",
    oppgaveBegrunnelse:
      "Svaret er en av to kategorier. Det finnes ingen mellomting og ingen avstand — enten sluttet studenten, eller så gjorde hen ikke det. Det er klassifikasjon.",
  },
  {
    id: "c3",
    tittel: "Robot som lærer å gripe",
    beskrivelse: "En robotarm skal lære å plukke opp gjenstander i ulike former uten å knuse dem.",
    data: "Ingen tabell over riktige bevegelser. Etter hvert forsøk får roboten et tall: høyt hvis gjenstanden ble løftet uskadd, lavt ellers.",
    fasit: "reinforcement",
    begrunnelse:
      "Det finnes ingen fasit som sier hva roboten skulle gjort — bare en tilbakemelding på hvor bra det den gjorde fungerte. Det er reinforcement learning (forsterkende læring).",
  },
  {
    id: "c4",
    tittel: "Nyhetsartikler uten kategorier",
    beskrivelse:
      "En avis har 200 000 arkiverte artikler og vil finne ut hvilke temaer arkivet naturlig deler seg i.",
    data: "Bare artikkelteksten. Ingen har merket artiklene med tema eller sjanger.",
    fasit: "unsupervised",
    begrunnelse:
      "Det finnes ingen kolonne med riktig tema, og vi leter etter struktur i dataene selv. Det er unsupervised learning.",
    felle:
      "Mange svarer supervised her, fordi teksten «ser ut som» data det er mye informasjon i. Men mengde data er ikke det samme som fasit. Spørsmålet er alltid: finnes det en kolonne med det riktige svaret?",
  },
  {
    id: "c5",
    tittel: "Anbefalinger i en strømmetjeneste",
    beskrivelse:
      "Tjenesten vil gruppere brukere med lik smak, slik at den kan si «brukere som deg så også …».",
    data: "Seerhistorikk for 2 millioner brukere. Ingen har merket brukerne med en smakskategori.",
    fasit: "unsupervised",
    begrunnelse:
      "Seerhistorikk er data, ikke fasit. Ingen har skrevet ned hvilken gruppe hver bruker hører til — det er nettopp det vi leter etter.",
    felle:
      "Fella her er at det finnes veldig mye data. Supervised krever ikke mye data; det krever en kolonne med riktig svar. Den mangler.",
  },
  {
    id: "c6",
    tittel: "Diagnose fra røntgenbilder",
    beskrivelse: "Et sykehus vil ha hjelp til å oppdage brudd i håndleddet på røntgenbilder.",
    data: "18 000 bilder, hvert vurdert av to radiologer som har notert «brudd» eller «ikke brudd».",
    fasit: "supervised",
    oppgave: "klassifikasjon",
    begrunnelse:
      "Radiologene har laget fasiten. At bildene er kompliserte endrer ingenting — kompleksitet er et argument for en kraftigere modell, ikke for å kaste merkelappene.",
    oppgaveBegrunnelse: "To kategorier: brudd eller ikke. Klassifikasjon.",
    felle:
      "Den vanligste feilen er å velge unsupervised fordi bilder føles vanskelige. Læringstypen bestemmes av om fasit finnes, aldri av hvor krevende dataene er.",
  },
  {
    id: "c7",
    tittel: "Strømpris neste døgn",
    beskrivelse:
      "En kraftleverandør vil anslå gjennomsnittsprisen i sitt prisområde time for time i morgen.",
    data: "Ti år med timespriser, værdata og forbruk. Prisen for hver historiske time er kjent.",
    fasit: "supervised",
    oppgave: "regresjon",
    begrunnelse: "Prisen er kjent for hver historiske time — fasiten finnes.",
    oppgaveBegrunnelse:
      "Svaret er et tall i øre per kilowattime, der det å bomme litt er mye bedre enn å bomme mye. Regresjon.",
    felle:
      "Noen sorterer tidsserier i en egen bås. Det er ikke en egen læringstype — det er supervised learning der radene har en rekkefølge som du må ta hensyn til når du deler i trening og test (Fase 3).",
  },
  {
    id: "c8",
    tittel: "Spillmotstander som blir bedre",
    beskrivelse:
      "En datamotstander i et brettspill skal bli bedre ved å spille millioner av partier mot seg selv.",
    data: "Ingen database over gode trekk. Etter hvert parti vet motstanderen bare om partiet ble vunnet eller tapt.",
    fasit: "reinforcement",
    begrunnelse:
      "Ingen forteller hvilket trekk som var riktig — signalet er utfallet av hele partiet, og det kommer først til slutt. Det er reinforcement learning, og at belønningen kommer sent er nettopp det som gjør den vanskelig.",
    felle:
      "Det er fristende å si supervised fordi «vunnet eller tapt» ser ut som en merkelapp. Men den merkelappen henger på hele partiet, ikke på hvert trekk — og det er trekkene som skal læres.",
  },
];

const TYPE_NAVN: Record<Laeringstype, string> = {
  supervised: "Supervised — fasit finnes",
  unsupervised: "Unsupervised — ingen fasit",
  reinforcement: "Reinforcement — belønning etterpå",
};

export function LaeringstypeSorterer() {
  const [i, setI] = useState(0);
  const [typeSvar, setTypeSvar] = useState<Laeringstype | null>(null);
  const [oppgaveSvar, setOppgaveSvar] = useState<Oppgavetype | null>(null);

  const c = CASER[i];
  const typeRiktig = typeSvar === c.fasit;
  const trengerOppgave = c.oppgave !== undefined && typeSvar !== null && typeRiktig;
  const ferdig =
    typeSvar !== null && (c.oppgave === undefined || !typeRiktig || oppgaveSvar !== null);

  function neste() {
    setI((n) => (n + 1) % CASER.length);
    setTypeSvar(null);
    setOppgaveSvar(null);
  }

  function nullstill() {
    setI(0);
    setTypeSvar(null);
    setOppgaveSvar(null);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
          Guidet simulering · ingenting telles
        </div>
        <h3 className="mt-0.5 font-semibold text-foreground">
          Beslutningsregelen, brukt åtte ganger
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Målet er ikke å svare riktig — det er at regelen under skal gå av seg selv neste gang du
          leser en oppgavetekst. Derfor står den framme hele tiden.
        </p>
      </div>

      {/* Beslutningsregelen, alltid synlig — progressiv scaffolding. */}
      <div className="mb-4 rounded-lg border border-brand/30 bg-brand/5 p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
          <Compass className="h-3.5 w-3.5" /> Regelen
        </div>
        <ol className="space-y-1 text-sm leading-relaxed text-foreground">
          <li>
            <span className="font-medium">1.</span> Finnes det en kolonne med det riktige svaret for
            hvert eksempel? Ja → <span className="font-medium">supervised</span>.
          </li>
          <li>
            <span className="font-medium">2.</span> Nei, men vi leter etter struktur i dataene? →{" "}
            <span className="font-medium">unsupervised</span>.
          </li>
          <li>
            <span className="font-medium">3.</span> Nei, men vi får vite i etterkant hvor bra en
            handling var? → <span className="font-medium">reinforcement</span>.
          </li>
          <li className="pt-1 text-muted-foreground">
            <span className="font-medium">Ble det supervised:</span> er svaret et tall der avstand
            betyr noe (regresjon), eller en kategori der «litt feil» ikke finnes (klassifikasjon)?
          </li>
        </ol>
      </div>

      {/* Caset */}
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {i + 1} av {CASER.length}
          </span>
          <h4 className="font-medium text-foreground">{c.tittel}</h4>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{c.beskrivelse}</p>
        <div className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hva ligger i datasettet
          </div>
          <p className="mt-0.5 text-sm leading-snug text-foreground">{c.data}</p>
        </div>

        {/* Steg 1 — læringstype */}
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-medium text-foreground">Læringstype?</div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {(Object.keys(TYPE_NAVN) as Laeringstype[]).map((t) => {
              const valgt = typeSvar === t;
              const erFasit = t === c.fasit;
              const svart = typeSvar !== null;
              return (
                <button
                  key={t}
                  onClick={() => setTypeSvar((s) => s ?? t)}
                  disabled={svart}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                    !svart &&
                      "border-border bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground",
                    svart && erFasit && "border-success/50 bg-success/10 text-foreground",
                    svart && valgt && !erFasit && "border-red-500/50 bg-red-500/10 text-foreground",
                    svart && !valgt && !erFasit && "border-border bg-background opacity-50",
                  )}
                >
                  <span className="flex items-start gap-1.5">
                    {svart && erFasit && <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />}
                    {svart && valgt && !erFasit && (
                      <X className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                    )}
                    {TYPE_NAVN[t]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {typeSvar !== null && (
          <div
            className={cn(
              "mt-3 rounded-lg border p-3.5",
              typeRiktig ? "border-success/40 bg-success/5" : "border-amber-500/40 bg-amber-500/5",
            )}
          >
            <div
              className={cn(
                "text-sm font-medium",
                typeRiktig ? "text-success" : "text-amber-600 dark:text-amber-400",
              )}
            >
              {typeRiktig ? "Sortert riktig" : `Fasiten er ${TYPE_NAVN[c.fasit].split(" — ")[0]}`}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.begrunnelse}</p>
            {!typeRiktig && c.felle && (
              <p className="mt-2 border-l-2 border-amber-500/40 pl-3 text-sm leading-relaxed text-muted-foreground">
                {c.felle}
              </p>
            )}
          </div>
        )}

        {/* Steg 2 — regresjon eller klassifikasjon */}
        {trengerOppgave && (
          <div className="mt-4">
            <div className="mb-1.5 text-xs font-medium text-foreground">
              Supervised — men er svaret et tall eller en kategori?
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {(["regresjon", "klassifikasjon"] as Oppgavetype[]).map((o) => {
                const valgt = oppgaveSvar === o;
                const erFasit = o === c.oppgave;
                const svart = oppgaveSvar !== null;
                return (
                  <button
                    key={o}
                    onClick={() => setOppgaveSvar((s) => s ?? o)}
                    disabled={svart}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-xs capitalize transition-colors",
                      !svart &&
                        "border-border bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground",
                      svart && erFasit && "border-success/50 bg-success/10 text-foreground",
                      svart &&
                        valgt &&
                        !erFasit &&
                        "border-red-500/50 bg-red-500/10 text-foreground",
                      svart && !valgt && !erFasit && "border-border bg-background opacity-50",
                    )}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {oppgaveSvar !== null && (
              <p className="mt-2.5 rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
                {c.oppgaveBegrunnelse}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={neste}
            disabled={!ferdig}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              ferdig
                ? "bg-brand text-white hover:bg-brand/90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            Neste case <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={nullstill}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Begynn forfra
          </button>
        </div>
      </div>
    </div>
  );
}
