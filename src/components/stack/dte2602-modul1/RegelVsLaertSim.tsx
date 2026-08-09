import { useMemo, useState } from "react";
import { AlertTriangle, Check, RotateCcw, Sparkles, UserCog, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRENING_UKE1,
  MERKET_UKE2,
  TEST_UKE3,
  REGLER_OPPRINNELIG,
  REGLER_UTVIDET,
  regelDom,
  tren,
  modellDom,
} from "@/lib/dte2602/spamSimulering";

/**
 * Type 2 — guidet simulering til atom A01 (hva maskinlæring er).
 *
 * Poenget som skal sitte igjen er IKKE at maskinlæring treffer bedre enn regler.
 * Det gjør den ofte ikke. Poenget er at kunnskapen ligger et annet sted, og
 * derfor oppdateres på en helt annen måte:
 *
 *   regelbasert  — kunnskapen står i regelteksten, og endrer seg bare når et
 *                  menneske skriver om den
 *   maskinlært   — kunnskapen ligger i eksemplene, og endrer seg når du gir
 *                  modellen nye eksempler
 *
 * Derfor er simuleringen bygget slik at BEGGE systemene feiler når spammerne
 * skifter taktikk. Det er ærlig, og det er nettopp der forskjellen blir synlig:
 * det ene systemet kan du fikse med merkede e-poster, det andre må en
 * programmerer sitte og skrive om.
 *
 * Alle tallene under er regnet ut fra korpuset i det øyeblikket du ser dem —
 * ingenting er skrevet inn på forhånd. Modellen er en enkel ordtellingsmodell:
 * hvert ord får en poengsum ut fra hvor mye oftere det dukker opp i spam enn i
 * vanlige e-poster, og e-posten summeres opp. Det er en forenkling av naiv
 * Bayes, som du møter under sitt eget navn i Fase 4.
 */

type Steg = 0 | 1 | 2;

export function RegelVsLaertSim() {
  const [steg, setSteg] = useState<Steg>(0);
  /** Har en programmerer skrevet nye regler? */
  const [nyeRegler, setNyeRegler] = useState(false);
  /** Er modellen trent på nytt med de merkede e-postene fra uke 2? */
  const [trentPaNytt, setTrentPaNytt] = useState(false);

  const regler = nyeRegler ? REGLER_UTVIDET : REGLER_OPPRINNELIG;
  const treningssett = useMemo(
    () => (trentPaNytt ? [...TRENING_UKE1, ...MERKET_UKE2] : TRENING_UKE1),
    [trentPaNytt],
  );
  const vekter = useMemo(() => tren(treningssett), [treningssett]);

  /** Uke 1 måles på e-poster i gammel stil, uke 2 og 3 på den nye taktikken. */
  const testsett = steg === 0 ? TRENING_UKE1 : TEST_UKE3;
  const gammelStil = steg === 0;

  const rader = useMemo(
    () =>
      testsett.map((e) => ({
        epost: e,
        regel: regelDom(e.tekst, regler),
        modell: modellDom(e.tekst, vekter),
      })),
    [testsett, regler, vekter],
  );

  const regelTraff = rader.filter((r) => r.regel === r.epost.spam).length;
  const modellTraff = rader.filter((r) => r.modell === r.epost.spam).length;
  const antall = rader.length;

  function nullstill() {
    setSteg(0);
    setNyeRegler(false);
    setTrentPaNytt(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
          Guidet simulering · ingenting telles
        </div>
        <h3 className="mt-0.5 font-semibold text-foreground">Samme jobb, to måter å vite noe på</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          To spamfiltre skal sortere de samme e-postene. Det ene har 4 håndskrevne regler. Det andre
          har lært av 10 merkede eksempler. Klikk deg gjennom ukene og se hva som skjer når
          spammerne endrer seg.
        </p>
      </div>

      {/* Tidslinje */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(
          [
            { n: 0 as Steg, tekst: "Uke 1 — slik verden så ut da systemene ble laget" },
            { n: 1 as Steg, tekst: "Uke 2 — spammerne endrer taktikk" },
            { n: 2 as Steg, tekst: "Uke 3 — du prøver å fikse det" },
          ] as const
        ).map((s) => (
          <button
            key={s.n}
            onClick={() => setSteg(s.n)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              steg === s.n
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
            )}
          >
            {s.tekst}
          </button>
        ))}
      </div>

      {/* Fortellingen for steget */}
      <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3.5 text-sm leading-relaxed text-muted-foreground">
        {steg === 0 && (
          <>
            Begge systemene er laget for e-postene som fantes denne uka. Reglene er skrevet ut fra
            dem, og modellen er trent på dem. Legg merke til at begge gjør det bra — det er
            utgangspunktet, ikke poenget.
          </>
        )}
        {steg === 1 && (
          <>
            Spammerne skriver nå <span className="font-mono text-foreground">G R A T I S</span> og{" "}
            <span className="font-mono text-foreground">kred1tt</span>. Ingen av systemene har sett
            dette før, og{" "}
            <span className="font-medium text-foreground">begge slipper spammen gjennom</span>.
            Maskinlæring er altså ikke immun. Verdt å merke seg: ingen av dem gir en feilmelding. De
            feiler stille.
          </>
        )}
        {steg === 2 && (
          <>
            Nå er forskjellen den eneste som betyr noe:{" "}
            <span className="font-medium text-foreground">hvordan du fikser det</span>. Reglene må
            en programmerer sitte og skrive om, og må skrives om igjen neste gang spammerne finner
            på noe nytt. Modellen fikses ved å merke de nye e-postene og trene på dem — arbeid som
            ikke krever at noen gjetter hvilket triks som kommer. Prøv begge knappene under.
          </>
        )}
      </div>

      {steg === 2 && (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => setNyeRegler((v) => !v)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-xs transition-colors",
              nyeRegler
                ? "border-amber-500/50 bg-amber-500/10"
                : "border-border bg-background hover:border-amber-500/40",
            )}
          >
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <UserCog className="h-3.5 w-3.5" />
              {nyeRegler
                ? "Programmereren har skrevet 4 nye regler"
                : "Be en programmerer skrive nye regler"}
            </span>
            <span className="mt-1 block text-muted-foreground">
              {nyeRegler
                ? `${REGLER_UTVIDET.length} regler nå. Hver av dem måtte noen finne på, og de dekker bare akkurat disse skrivemåtene.`
                : `${REGLER_OPPRINNELIG.length} regler nå. Noen må lese spammen, gjette mønsteret og skrive det inn for hånd.`}
            </span>
          </button>
          <button
            onClick={() => setTrentPaNytt((v) => !v)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-xs transition-colors",
              trentPaNytt
                ? "border-brand/50 bg-brand/10"
                : "border-border bg-background hover:border-brand/40",
            )}
          >
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {trentPaNytt
                ? "Modellen er trent på nytt med uke 2 lagt til"
                : "Merk uke 2 og tren modellen på nytt"}
            </span>
            <span className="mt-1 block text-muted-foreground">
              {trentPaNytt
                ? `${treningssett.length} eksempler i treningssettet. Ingen skrev en eneste regel — vi la bare ved fasiten på 6 nye e-poster.`
                : `${treningssett.length} eksempler i treningssettet. Å merke 6 e-poster krever ingen kunnskap om hvilket triks spammerne fant på.`}
            </span>
          </button>
        </div>
      )}

      {/* Resultattavle */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <Score
          navn="Regelbasert filter"
          undertekst={`${regler.length} håndskrevne regler`}
          traff={regelTraff}
          av={antall}
          farge="amber"
        />
        <Score
          navn="Maskinlært modell"
          undertekst={`trent på ${treningssett.length} merkede eksempler`}
          traff={modellTraff}
          av={antall}
          farge="brand"
        />
      </div>

      <div className="mb-3 text-xs text-muted-foreground">
        {gammelStil ? (
          <>Målt på de 10 e-postene fra uke 1.</>
        ) : (
          <>
            Målt på {antall} e-poster fra uke 3 som{" "}
            <span className="font-medium text-foreground">ingen av systemene har sett</span>, og som
            modellen aldri trenes på. Det er den eneste ærlige målingen — mer om hvorfor i Fase 3.
          </>
        )}
      </div>

      {/* E-post for e-post */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border bg-muted/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>E-post (fasit i parentes)</span>
          <span className="w-16 text-center">Regler</span>
          <span className="w-16 text-center">Modell</span>
        </div>
        {rader.map((r) => (
          <div
            key={r.epost.id}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-border/60 px-3 py-1.5 last:border-b-0"
          >
            <span className="text-xs leading-snug text-foreground">
              {r.epost.tekst}{" "}
              <span className="text-muted-foreground">({r.epost.spam ? "spam" : "vanlig"})</span>
            </span>
            <Dom riktig={r.regel === r.epost.spam} sier={r.regel} />
            <Dom riktig={r.modell === r.epost.spam} sier={r.modell} />
          </div>
        ))}
      </div>

      {steg === 2 && (nyeRegler || trentPaNytt) && (
        <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-brand">
            <Sparkles className="h-4 w-4" /> Det du nettopp så
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Begge veier kan få tallet opp. Forskjellen er hva slags arbeid som kreves: reglene
            trenger et menneske som gjetter riktig mønster og skriver det inn, og som må gjøre det
            på nytt hver gang. Modellen trenger bare eksempler med fasit — en jobb som kan gjøres av
            folk uten programmeringskunnskap, og som skalerer. Det er dette som menes med at
            maskinlæring{" "}
            <span className="text-foreground">
              lærer fra eksempler i stedet for at reglene skrives
            </span>
            .
          </p>
        </div>
      )}

      <button
        onClick={nullstill}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Start simuleringen på nytt
      </button>
    </div>
  );
}

function Score({
  navn,
  undertekst,
  traff,
  av,
  farge,
}: {
  navn: string;
  undertekst: string;
  traff: number;
  av: number;
  farge: "amber" | "brand";
}) {
  const andel = av === 0 ? 0 : traff / av;
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        farge === "amber" ? "border-amber-500/30 bg-amber-500/5" : "border-brand/30 bg-brand/5",
      )}
    >
      <div className="text-xs font-medium text-foreground">{navn}</div>
      <div className="text-[11px] text-muted-foreground">{undertekst}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {Math.round(andel * 100)} %
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {traff} av {av} riktig
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", farge === "amber" ? "bg-amber-500" : "bg-brand")}
          style={{ width: `${andel * 100}%` }}
        />
      </div>
    </div>
  );
}

function Dom({ riktig, sier }: { riktig: boolean; sier: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-16 items-center justify-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        riktig
          ? "border-success/40 bg-success/10 text-success"
          : "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
      )}
      title={riktig ? "Riktig dom" : "Feil dom"}
    >
      {riktig ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {sier ? "spam" : "vanlig"}
    </span>
  );
}

/** Liten advarsel som modulsiden bruker rett under simuleringen. */
export function StilleFeilNote() {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        Legg merke til at ingen av systemene sa fra da de begynte å ta feil. Det er normaltilstanden
        i maskinlæring: du får alltid et svar, og det ser alltid ut som et svar. Å oppdage at det er
        galt er en jobb du må gjøre selv — og det er derfor feilsøkingsoppgavene lenger nede er
        tyngdepunktet i dette faget.
      </span>
    </div>
  );
}
