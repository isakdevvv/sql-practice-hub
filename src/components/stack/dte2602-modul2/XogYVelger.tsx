import { useState } from "react";
import { AlertTriangle, Check, Columns3, RotateCcw, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Type 2 — guidet simulering til atom A04 (features og target).
 *
 * Definisjonen «X forklarer, y forutsies» er lett å pugge og lett å bruke feil.
 * Det som faktisk skiller en feature fra en target er ikke hva kolonnen heter,
 * men to spørsmål om tid og tilgjengelighet:
 *
 *   target  — det du IKKE vet ennå, men vil vite
 *   feature — noe du vet i det øyeblikket du trenger svaret
 *
 * Derfor er denne simuleringen bygget rundt et datasett med tre kolonner som
 * ser helt legitime ut, men som hver har sin egen grunn til ikke å bli med:
 * en identifikator uten informasjon, en kolonne fra framtiden, og selve
 * targeten forkledd som en feature.
 */

type Kolonne = {
  id: string;
  navn: string;
  type: "tall" | "kategori" | "dato" | "id";
  eksempel: string;
  /** Kan denne kolonnen være target? */
  targetDom: { ok: boolean; tekst: string };
  /** Kan denne kolonnen brukes som feature når targeten er `sa_opp`? */
  featureDom: {
    niva: "bruk" | "forsvarlig" | "aldri";
    tekst: string;
  };
};

const KOLONNER: Kolonne[] = [
  {
    id: "kunde_id",
    navn: "kunde_id",
    type: "id",
    eksempel: "K-10482",
    targetDom: {
      ok: false,
      tekst:
        "Kundenummeret er allerede kjent, og det er forskjellig for hver eneste rad. Det finnes ingenting å forutsi og ingenting å lære.",
    },
    featureDom: {
      niva: "aldri",
      tekst:
        "En identifikator er unik per rad. En modell kan bare lære å slå opp den enkelte kunden — altså pugge treningsdataene. Verre: hvis kundenumrene ble tildelt i rekkefølge, kan tallet skjule når kunden ble kunde, og modellen lærer noe helt annet enn du tror. Identifikatorer skal ut.",
    },
  },
  {
    id: "alder",
    navn: "alder",
    type: "tall",
    eksempel: "34",
    targetDom: {
      ok: false,
      tekst:
        "Alderen står i kunderegisteret. Du kjenner den allerede, så det er ingen grunn til å forutsi den.",
    },
    featureDom: {
      niva: "bruk",
      tekst:
        "Kjent ved inngangen til måneden, og plausibelt knyttet til om kunden sier opp. En helt vanlig feature.",
    },
  },
  {
    id: "abonnement",
    navn: "abonnement_type",
    type: "kategori",
    eksempel: "«familie»",
    targetDom: {
      ok: false,
      tekst:
        "Abonnementstypen er registrert. Det er en kolonne som beskriver kunden, ikke et framtidig utfall.",
    },
    featureDom: {
      niva: "bruk",
      tekst:
        "Kjent og relevant. Men merk deg at dette er tekst, ikke tall — den må kodes om før en algoritme kan bruke den. Det er one-hot encoding, som du ser i forbehandlingslabben.",
    },
  },
  {
    id: "manedspris",
    navn: "manedspris_kr",
    type: "tall",
    eksempel: "399",
    targetDom: {
      ok: false,
      tekst: "Prisen er kjent på forhånd — den står i avtalen.",
    },
    featureDom: {
      niva: "bruk",
      tekst:
        "Kjent ved inngangen til måneden. Legg merke til at den er i kroner mens alderen er i år: to helt ulike tallområder i samme datasett. Det får konsekvenser i neste simulering.",
    },
  },
  {
    id: "support",
    navn: "antall_supporthenvendelser_siste_ar",
    type: "tall",
    eksempel: "3",
    targetDom: {
      ok: false,
      tekst: "Antallet er talt opp fra loggen og er allerede kjent.",
    },
    featureDom: {
      niva: "bruk",
      tekst:
        "Kjent, og trolig en av de sterkeste. Vær presis på vinduet: «siste år» må bety året FØR tidspunktet du forutsier fra, ikke året rundt oppsigelsen.",
    },
  },
  {
    id: "oppsigelsesdato",
    navn: "oppsigelsesdato",
    type: "dato",
    eksempel: "2026-03-14 / tom",
    targetDom: {
      ok: false,
      tekst:
        "Fristende, men nei. Datoen finnes bare for de kundene som faktisk sa opp — for alle andre er feltet tomt. En target som mangler for flertallet av radene er ikke en target du kan trene på.",
    },
    featureDom: {
      niva: "aldri",
      tekst:
        "Dette er den dyreste feilen i hele datasettet. Kolonnen er utfylt hvis og bare hvis kunden sa opp, så den røper fasiten direkte. Modellen vil få nær 100 % i testen og være fullstendig ubrukelig i drift, der feltet alltid er tomt på forhånd. Dette har et navn — datalekkasje — og det er tema for feilsøkingsoppgavene lenger ned.",
    },
  },
  {
    id: "sa_opp",
    navn: "sa_opp_denne_maneden",
    type: "kategori",
    eksempel: "ja / nei",
    targetDom: {
      ok: true,
      tekst:
        "Riktig. Dette er akkurat det du vil vite på forhånd, det er ukjent på prediksjonstidspunktet, og det er utfylt for hver eneste historiske rad. De tre kravene til en target.",
    },
    featureDom: {
      niva: "aldri",
      tekst:
        "Dette er targeten. Blir den liggende blant featurene, lærer modellen å lese fasiten og får 100 %. Det høres opplagt ut, men skjer stadig når man velger kolonner med kode i stedet for for hånd.",
    },
  },
];

const RADER = [
  ["K-10482", "34", "familie", "399", "3", "", "nei"],
  ["K-10483", "61", "basis", "199", "0", "", "nei"],
  ["K-10484", "27", "familie", "399", "7", "2026-03-14", "ja"],
  ["K-10485", "45", "premium", "649", "1", "", "nei"],
  ["K-10486", "52", "basis", "199", "5", "2026-03-02", "ja"],
];

export function XogYVelger() {
  const [target, setTarget] = useState<string | null>(null);
  const [valgteFeatures, setValgteFeatures] = useState<Set<string>>(new Set());
  const [sjekket, setSjekket] = useState(false);

  const targetKol = KOLONNER.find((k) => k.id === target) ?? null;
  const targetOk = targetKol?.targetDom.ok ?? false;

  const kandidater = KOLONNER.filter((k) => k.id !== target);

  function toggleFeature(id: string) {
    setValgteFeatures((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setSjekket(false);
  }

  function nullstill() {
    setTarget(null);
    setValgteFeatures(new Set());
    setSjekket(false);
  }

  // Vurdering av feature-utvalget, når targeten er riktig valgt.
  const lekkasjer = kandidater.filter(
    (k) => valgteFeatures.has(k.id) && k.featureDom.niva === "aldri",
  );
  const gode = kandidater.filter((k) => k.featureDom.niva === "bruk");
  const valgteGode = gode.filter((k) => valgteFeatures.has(k.id));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
          Guidet simulering · ingenting telles
        </div>
        <h3 className="mt-0.5 font-semibold text-foreground">Velg X og y selv</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          En teleoperatør vil vite hvilke kunder som kommer til å si opp neste måned. Under ligger
          datasettet slik det faktisk kom ut av databasen. Klikk på en kolonne for å gjøre den til{" "}
          <span className="font-medium text-foreground">target (y)</span> — altså det modellen skal
          forutsi.
        </p>
      </div>

      {/* Tabellen */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {KOLONNER.map((k) => {
                const erTarget = target === k.id;
                const erFeature = valgteFeatures.has(k.id) && !erTarget;
                return (
                  <th key={k.id} className="border-b border-border p-0 align-bottom">
                    <button
                      onClick={() => {
                        setTarget(k.id);
                        setValgteFeatures(new Set());
                        setSjekket(false);
                      }}
                      className={cn(
                        "h-full w-full px-2.5 py-2 text-left font-mono text-[11px] font-medium transition-colors",
                        erTarget && "bg-brand/15 text-brand",
                        erFeature && "bg-success/10 text-foreground",
                        !erTarget &&
                          !erFeature &&
                          "bg-muted/50 text-muted-foreground hover:bg-brand/5",
                      )}
                      title="Klikk for å gjøre denne kolonnen til target"
                    >
                      {erTarget && (
                        <span className="mb-0.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider">
                          <Target className="h-2.5 w-2.5" /> y
                        </span>
                      )}
                      {erFeature && (
                        <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wider text-success">
                          X
                        </span>
                      )}
                      <span className="block break-words">{k.navn}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {RADER.map((rad, ri) => (
              <tr key={ri} className="border-b border-border/50 last:border-b-0">
                {rad.map((celle, ci) => {
                  const kol = KOLONNER[ci];
                  const erTarget = target === kol.id;
                  const erFeature = valgteFeatures.has(kol.id) && !erTarget;
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-2.5 py-1.5 font-mono text-[11px] tabular-nums",
                        erTarget && "bg-brand/5 text-brand",
                        erFeature && "bg-success/5 text-foreground",
                        !erTarget && !erFeature && "text-muted-foreground",
                      )}
                    >
                      {celle === "" ? <span className="opacity-40">tom</span> : celle}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dom over target-valget */}
      {targetKol && (
        <div
          className={cn(
            "mt-4 rounded-lg border p-3.5",
            targetOk ? "border-success/40 bg-success/5" : "border-amber-500/40 bg-amber-500/5",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              targetOk ? "text-success" : "text-amber-600 dark:text-amber-400",
            )}
          >
            {targetOk ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span className="font-mono">{targetKol.navn}</span> som target
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {targetKol.targetDom.tekst}
          </p>
        </div>
      )}

      {/* Steg 2 — featurevalg */}
      {targetOk && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Columns3 className="h-3.5 w-3.5 text-brand" />
            Hvilke av de gjenværende kolonnene tar du med som features (X)?
          </div>
          <p className="mb-2.5 text-xs leading-relaxed text-muted-foreground">
            Still ett spørsmål til hver kolonne:{" "}
            <span className="text-foreground">
              kjenner jeg denne verdien i det øyeblikket jeg trenger svaret?
            </span>{" "}
            Prediksjonen skjer ved inngangen til måneden, før noen har sagt opp.
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {kandidater.map((k) => {
              const valgt = valgteFeatures.has(k.id);
              return (
                <button
                  key={k.id}
                  onClick={() => toggleFeature(k.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                    valgt
                      ? "border-success/50 bg-success/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-3 w-3 shrink-0 rounded-sm border",
                        valgt ? "border-success bg-success" : "border-muted-foreground/40",
                      )}
                    />
                    <span className="font-mono">{k.navn}</span>
                  </span>
                  <span className="mt-0.5 block pl-[18px] text-[10px] text-muted-foreground">
                    {k.type} · f.eks. {k.eksempel}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSjekket(true)}
            disabled={valgteFeatures.size === 0}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              valgteFeatures.size > 0
                ? "bg-brand text-white hover:bg-brand/90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            <Check className="h-3.5 w-3.5" /> Se gjennom utvalget
          </button>
        </div>
      )}

      {/* Gjennomgang kolonne for kolonne */}
      {sjekket && targetOk && (
        <div className="mt-4 space-y-2">
          {lekkasjer.length > 0 ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3.5">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                <X className="h-4 w-4" />
                {lekkasjer.length === 1 ? "Én kolonne må ut" : `${lekkasjer.length} kolonner må ut`}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Modellen vil se strålende ut i testen og feile i drift. Det er verre enn en modell
                som er tydelig dårlig, fordi ingen oppdager det før den er tatt i bruk.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-success/40 bg-success/5 p-3.5">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <Check className="h-4 w-4" /> Ingen lekkasjer i utvalget
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Du tok med {valgteGode.length} av {gode.length} brukbare kolonner, og holdt både
                identifikatoren, kolonnen fra framtiden og targeten selv utenfor. Det er nøyaktig
                den gjennomgangen sensor forventer å se beskrevet i mappa.
              </p>
            </div>
          )}

          {kandidater
            .filter((k) => valgteFeatures.has(k.id))
            .map((k) => (
              <div
                key={k.id}
                className={cn(
                  "rounded-lg border p-3",
                  k.featureDom.niva === "bruk" && "border-success/30 bg-success/5",
                  k.featureDom.niva === "forsvarlig" && "border-amber-500/30 bg-amber-500/5",
                  k.featureDom.niva === "aldri" && "border-red-500/40 bg-red-500/5",
                )}
              >
                <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
                  {k.featureDom.niva === "aldri" ? (
                    <X className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-success" />
                  )}
                  {k.navn}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {k.featureDom.tekst}
                </p>
              </div>
            ))}

          {gode
            .filter((k) => !valgteFeatures.has(k.id))
            .map((k) => (
              <div key={k.id} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="font-mono text-xs font-medium text-muted-foreground">
                  {k.navn} — utelatt
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Denne kunne vært med: {k.featureDom.tekst.toLowerCase()}
                </p>
              </div>
            ))}
        </div>
      )}

      <button
        onClick={nullstill}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Nullstill
      </button>
    </div>
  );
}
