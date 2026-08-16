import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Compass,
  Construction,
  Hammer,
  Info,
  Layers,
  Target,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { getTrinnBySlug } from "@/lib/stack/content";
import { alleLabber } from "@/lib/dte2507/canvasLab";
import {
  LAG,
  EKSAMEN_ISO,
  EKSAMEN_STED,
  atomTelling,
  dagerTil,
  formatDato,
  stackSlugsFor,
  totalAtomTelling,
  type Atom,
  type Dekning,
  type Lag,
  type LagLenke,
} from "@/lib/dte2507/lagPlan";

// ---------------------------------------------------------------------------
// DTE-2507 — lag for lag.
//
// Søsteren til `dte2505-moduler/Dte2505ModulerPage.tsx`, med én helt avgjørende
// forskjell: DEN siden er verifisert mot Canvas og viser ekte obliger med ekte
// frister. Denne har ingen av delene, fordi Canvas for DTE-2507 ikke er lest.
// Rammen under følger derfor pensumlogikken, og sier det høyt i toppen.
// ---------------------------------------------------------------------------

type Filter = "alle" | "hull" | "klar";

export function Dte2507LagPage() {
  const [filter, setFilter] = useState<Filter>("alle");
  const naa = useMemo(() => new Date(), []);
  const telling = useMemo(() => totalAtomTelling(), []);
  const dagerIgjen = dagerTil(EKSAMEN_ISO, naa);

  const synlige = LAG.filter((l) => {
    if (filter === "hull") return l.dekning !== "dekket";
    if (filter === "klar") return l.dekning === "dekket";
    return true;
  });

  const totaltAtomer = telling.dekket + telling.delvis + telling.hull;

  return (
    <StackPageShell title="DTE-2507 — lag for lag" group="eksamen">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            DTE-2507 Datakommunikasjon og sikkerhet · lag for lag
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Faget i ni lag, nedenfra og opp</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Nettet er bygget i lag, og det er også den eneste rekkefølgen stoffet gir mening i:
            du kan ikke forstå hva TLS beskytter før du vet hva en TCP-forbindelse er, og du kan
            ikke forstå TCP før du vet hva en pakke er. Siden her følger den rekkefølgen. Hvert
            lag viser hva det handler om, hva du skal klare uten hjelp når du er ferdig, hvilket
            innhold i appen som dekker det — og hvor det fortsatt er hull.
          </p>
        </header>

        {/* Den viktigste boksen på hele siden. Skal leses før alt annet. */}
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-sky-500/40 bg-sky-500/5 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div className="text-sm leading-relaxed">
            <span className="font-medium">Om denne inndelingen.</span> Lagene under følger
            pensumlogikken i Kurose &amp; Ross, ikke emnets egen modulrekkefølge — Canvas-sidene
            for DTE-2507 er bare delvis gjennomgått. Derfor har lagene temanavn og ikke numre, og
            derfor finner du ingen fullstendig fristrekke her: vi kjenner foreløpig bare Lab 1,
            og oppdiktede frister er verre enn ingen.
          </div>
        </div>

        {/* Labbene vi faktisk har lest fra Canvas. */}
        {alleLabber().map((lab) => {
          const dager = dagerTil(lab.frist, naa);
          if (dager < 0) return null;
          return (
            <div
              key={lab.nummer}
              className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="shrink-0 rounded-lg bg-amber-500/20 p-2">
                  <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div className="flex-1 min-w-[16rem]">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Neste frist · {lab.modul}
                  </div>
                  <h2 className="font-semibold leading-tight text-foreground">
                    Lab {lab.nummer} — {lab.tittel}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDato(lab.frist)} kl. 23:59. {lab.hva}
                    {lab.ubegrensedeForsok && " Ubegrensede forsøk."}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {lab.verktoy.map((v) => (
                      <code
                        key={v}
                        className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px]"
                      >
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-300">
                    {dager}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    dager igjen
                  </div>
                </div>
              </div>
              {lab.ovingSlug && (
                <Link
                  to="/stack/$slug"
                  params={{ slug: lab.ovingSlug }}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/5 px-3 py-2 text-sm font-medium text-brand transition-colors hover:border-brand"
                >
                  Øv på verktøyene i en terminal
                  <ArrowRight className="ml-auto h-3.5 w-3.5" />
                </Link>
              )}
              {/*
                Ærlighet om hvor øvingen slutter. Simulatoren dekker verktøyene,
                men ikke studentens egen maskin — og laben spør om begge deler.
              */}
              {lab.hull && (
                <p className="mt-2 rounded-lg border border-border bg-background p-3 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Grensa for hva appen kan gjøre:</strong>{" "}
                  {lab.hull}
                </p>
              )}
            </div>
          );
        })}

        {/* Eksamen — det ene harde faktumet. */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
          <div className="shrink-0 rounded-lg bg-amber-500/20 p-2">
            <CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Bekreftet
            </div>
            <h2 className="font-semibold leading-tight text-foreground">
              Skriftlig eksamen {formatDato(EKSAMEN_ISO)}, i {EKSAMEN_STED}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Alt annet om emnets struktur er foreløpig avledet fra pensum, ikke fra Canvas.
            </p>
          </div>
          {dagerIgjen >= 0 && (
            <div className="shrink-0 text-right">
              <div className="text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-300">
                {dagerIgjen}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                dager igjen
              </div>
            </div>
          )}
        </div>

        {/* Dekning på atomnivå */}
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Compass className="h-4 w-4 text-brand" />
            Hvor godt dekker appen pensum?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <TelleKort
              antall={telling.dekket}
              etikett="emner dekket"
              beskrivelse="Har fullverdig interaktivt innhold"
              dekning="dekket"
            />
            <TelleKort
              antall={telling.delvis}
              etikett="delvis dekket"
              beskrivelse="Finnes, men et navngitt punkt mangler"
              dekning="delvis"
            />
            <TelleKort
              antall={telling.hull}
              etikett="hull"
              beskrivelse="Ingenting bygget ennå"
              dekning="hull"
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Tellingen går på de {totaltAtomer} enkeltemnene i atom-planen, ikke på lagene. Et lag
            regnes som «delvis» så snart ett emne i det mangler — også når resten er ferdig.
          </p>
        </section>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["alle", `Alle ${LAG.length} lag`],
              ["hull", "Bare lag med hull"],
              ["klar", "Bare ferdige lag"],
            ] as [Filter, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                filter === v
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {synlige.map((l) => (
            <LagKort key={l.id} lag={l} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2507" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            Tilbake til DTE-2507-huben
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/stack/$slug"
            params={{ slug: "kurose-kurs" }}
            className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            Følg lærebokas kapitler i stedet
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </StackPageShell>
  );
}

/* ---------------------------------------------------------------- delkomponenter */

function TelleKort({
  antall,
  etikett,
  beskrivelse,
  dekning,
}: {
  antall: number;
  etikett: string;
  beskrivelse: string;
  dekning: Dekning;
}) {
  const stil = dekningStil(dekning);
  return (
    <div className={`rounded-xl border p-4 ${stil.boks}`}>
      <div className={`text-2xl font-bold tabular-nums ${stil.tekst}`}>{antall}</div>
      <div className="mt-0.5 text-xs font-medium text-foreground">{etikett}</div>
      <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{beskrivelse}</div>
    </div>
  );
}

function LagKort({ lag }: { lag: Lag }) {
  const slugs = useMemo(() => stackSlugsFor(lag), [lag]);
  const [apen, setApen] = useState(lag.nr === 0);
  const stil = dekningStil(lag.dekning);
  const telling = useMemo(() => atomTelling(lag), [lag]);

  return (
    <section
      id={`lag-${lag.nr}`}
      className={`scroll-mt-24 overflow-hidden rounded-xl border bg-card ${stil.kant}`}
    >
      <button
        onClick={() => setApen((v) => !v)}
        aria-expanded={apen}
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/30"
      >
        <div className={`shrink-0 rounded-lg px-3 py-2 text-lg font-bold tabular-nums ${stil.merke}`}>
          {lag.nr}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold leading-tight text-foreground">{lag.tittel}</h2>
            <DekningMerke dekning={lag.dekning} />
            {slugs.length > 0 && <ModulStatusBadge trinnSlugs={slugs} />}
          </div>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">{lag.kortOm}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-border bg-muted px-2.5 py-1">
              {lag.atomer.length} emner · {telling.dekket} dekket
              {telling.delvis > 0 && ` · ${telling.delvis} delvis`}
              {telling.hull > 0 && ` · ${telling.hull} hull`}
            </span>
          </div>
          {slugs.length > 0 && (
            <div className="max-w-xs">
              <ModulProgressBar trinnSlugs={slugs} />
            </div>
          )}
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            apen ? "rotate-180" : ""
          }`}
        />
      </button>

      {apen && (
        <div className="space-y-5 border-t border-border px-5 pb-5 pt-5">
          {/* §2: sjekkpunktet laget bygges bakover fra */}
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
              <Target className="h-3.5 w-3.5" />
              Dette skal du kunne uten hjelp
            </h3>
            <ul className="space-y-1.5">
              {lag.sjekkpunkt.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-brand/20 pt-2 text-[11px] leading-snug text-muted-foreground">
              Laget er ikke ferdig når temaet er lest. Det er ferdig når du klarer punktene over
              uten å slå opp.
            </p>
          </div>

          {lag.hull && (
            <div
              className={`rounded-lg border p-4 ${
                lag.dekning === "hull"
                  ? "border-rose-500/40 bg-rose-500/10"
                  : "border-amber-500/40 bg-amber-500/10"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                {lag.dekning === "hull" ? (
                  <Construction className="h-4 w-4 text-rose-600 dark:text-rose-300" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                )}
                <h3 className="text-sm font-semibold text-foreground">
                  {lag.dekning === "hull" ? "Hull i appen" : "Det som mangler"}
                </h3>
              </div>
              <p className="text-sm leading-snug text-muted-foreground">{lag.hull}</p>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Innhold som dekker laget
            </h3>
            {lag.lenker.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">Ingen innhold ennå.</p>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {lag.lenker.map((l) => (
                  <LenkeKort key={`${l.type}-${l.slug}`} lenke={l} />
                ))}
              </div>
            )}
          </div>

          <AtomListe lag={lag} />
        </div>
      )}
    </section>
  );
}

/**
 * Emnelista. Holdes lukket som standard fordi den er en revisjonsliste, ikke
 * en læringssti — men den er det eneste stedet man kan se nøyaktig HVA som
 * mangler, og derfor skal den ikke fjernes.
 */
function AtomListe({ lag }: { lag: Lag }) {
  const [apen, setApen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        onClick={() => setApen((v) => !v)}
        aria-expanded={apen}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium text-foreground">
          Alle {lag.atomer.length} emnene i laget
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${apen ? "rotate-180" : ""}`}
        />
      </button>
      {apen && (
        <ul className="space-y-2 px-4 pb-4">
          {lag.atomer.map((a) => (
            <AtomRad key={a.nr} atom={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AtomRad({ atom }: { atom: Atom }) {
  const stil = dekningStil(atom.status);
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${stil.merke}`}
      >
        {atom.nr}
      </span>
      <div className="min-w-0">
        <span className="text-foreground">{atom.navn}</span>
        {atom.status !== "dekket" && (
          <span className={`ml-2 text-[10px] uppercase tracking-wider ${stil.tekst}`}>
            {atom.status === "delvis" ? "delvis" : "hull"}
          </span>
        )}
        {atom.mangler && (
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{atom.mangler}</p>
        )}
      </div>
    </li>
  );
}

function LenkeKort({ lenke }: { lenke: LagLenke }) {
  // `kommer` betyr «under bygging». Vi sjekker registeret i tillegg, slik at
  // kortet blir en ekte lenke av seg selv den dagen innholdet landes.
  const finnesIRegister = lenke.type !== "stack" || Boolean(getTrinnBySlug(lenke.slug));
  const kommer = Boolean(lenke.kommer) && !finnesIRegister;

  const innhold = (
    <>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-medium leading-tight text-foreground">{lenke.label}</h4>
        {kommer && (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-300">
            <Hammer className="h-2.5 w-2.5" />
            Kommer
          </span>
        )}
      </div>
      <p className="text-[12px] leading-snug text-muted-foreground">{lenke.dekker}</p>
    </>
  );

  if (kommer) {
    return (
      <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/5 p-3">
        {innhold}
        <p className="mt-1.5 text-[11px] italic text-muted-foreground">
          Ikke publisert ennå — kortet blir en lenke automatisk når siden landes.
        </p>
      </div>
    );
  }

  const klasser =
    "group block rounded-lg border border-border bg-background p-3 transition-colors hover:border-brand/50";

  if (lenke.type === "rute") {
    // Fri rute-sti fra datafila — ruteren kan ikke typesjekke en streng som
    // ikke er kjent på kompileringstidspunktet, derfor castet.
    return (
      <Link to={lenke.slug as never} className={klasser}>
        {innhold}
        <AapneLinje />
      </Link>
    );
  }
  return (
    <Link to="/stack/$slug" params={{ slug: lenke.slug }} className={klasser}>
      {innhold}
      <AapneLinje />
    </Link>
  );
}

function AapneLinje() {
  return (
    <div className="mt-2 inline-flex items-center text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
      Åpne
      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}

function DekningMerke({ dekning }: { dekning: Dekning }) {
  const tekst = dekning === "dekket" ? "Dekket" : dekning === "delvis" ? "Delvis dekket" : "Hull";
  const stil = dekningStil(dekning);
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stil.merke}`}>
      {tekst}
    </span>
  );
}

function dekningStil(dekning: Dekning): {
  boks: string;
  kant: string;
  merke: string;
  tekst: string;
} {
  switch (dekning) {
    case "dekket":
      return {
        boks: "border-success/30 bg-success/5",
        kant: "border-border",
        merke: "border-success/30 bg-success/15 text-success",
        tekst: "text-success",
      };
    case "delvis":
      return {
        boks: "border-amber-500/30 bg-amber-500/5",
        kant: "border-amber-500/40",
        merke: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300",
        tekst: "text-amber-600 dark:text-amber-300",
      };
    default:
      return {
        boks: "border-rose-500/30 bg-rose-500/5",
        kant: "border-rose-500/40",
        merke: "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-300",
        tekst: "text-rose-600 dark:text-rose-300",
      };
  }
}
