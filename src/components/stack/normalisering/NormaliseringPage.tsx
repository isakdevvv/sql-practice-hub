import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, AlertTriangle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { NormaliseringSteps } from "./NormaliseringSteps";

const STEPS = [
  { title: "Hvorfor normalisere?", anchor: "hvorfor" },
  { title: "Tre begreper du må kunne", anchor: "begreper" },
  { title: "Utgangspunktet — én rotete tabell", anchor: "utgangspunkt" },
  { title: "1NF — atomiske verdier", anchor: "del-1nf" },
  { title: "2NF — partielle avhengigheter", anchor: "del-2nf" },
  { title: "3NF — transitive avhengigheter", anchor: "del-3nf" },
  { title: "Visuelt — hver overgang stegvis", anchor: "visuelt" },
  { title: "Sluttskjema — alle tabellene", anchor: "sluttskjema" },
  { title: "BCNF — når 3NF ikke holder", anchor: "bcnf" },
  { title: "Sjekkliste — normaliser stegvis", anchor: "sjekkliste" },
  { title: "Vanlige feller", anchor: "feller" },
];

// Course page covering 1NF → 2NF → 3NF (+ BCNF) with worked examples.
// Pair with /drag for the hands-on exercises (id-prefix d-fill-norm-*,
// d-order-norm-*, d-match-norm-*).

type Anomaly = { title: string; body: string };
const ANOMALIES: Anomaly[] = [
  {
    title: "Innsettings-anomali",
    body: "Du kan ikke registrere ny info uten å samtidig oppfinne en annen rad. Eks: kan ikke opprette kurset MAT100 før noen melder seg på, fordi tabellen lagrer (kurs, student) sammen.",
  },
  {
    title: "Oppdaterings-anomali",
    body: "Samme verdi gjentas på mange rader. Endrer du den ett sted, må du endre alle — glemmer du én, blir databasen inkonsistent. Eks: kursnavnet endres → må oppdateres på hver påmelding.",
  },
  {
    title: "Slettings-anomali",
    body: "Sletter du én rad, mister du utilsiktet info om noe annet. Eks: siste student melder seg av MAT100 → MAT100 forsvinner helt fra databasen.",
  },
];

export function NormaliseringPage() {
  return (
    <StackPageShell title="Normalisering — 1NF, 2NF, 3NF" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Topp */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Databasedesign · Normalformer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Normalisering — fra rotete tabell til 3NF
          </h1>
          <p className="mt-3 text-muted-foreground">
            Normalisering er regler for å splitte tabeller slik at hver opplysning lagres
            ÉN gang. Det fjerner tre konkrete problemer: <em>innsettings-</em>,
            <em> oppdaterings-</em> og <em>slettings-anomalier</em>. Her tar vi reglene
            i rekkefølge med ett gjennomgående eksempel.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Vil du øve underveis?</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>{" "}
              har skikkelige normaliseringsoppgaver — identifisere brudd, dekomponere,
              skrive CREATE TABLE.
            </div>
          </div>
        </div>

        <CourseOutline courseId="normalisering" steps={STEPS} />

        {/* 0. Hvorfor */}
        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Hvorfor normalisere?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Den korte versjonen: redundans (dobbeltlagring) gir tre konkrete feiltyper.
            Normalisering fjerner redundansen og dermed feilene.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {ANOMALIES.map((a) => (
              <div
                key={a.title}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="font-semibold text-sm">{a.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Begreper */}
        <section id="begreper" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre begreper du må kunne</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-sm">
            <div>
              <strong>Funksjonell avhengighet (FD):</strong>{" "}
              <code>X → Y</code> betyr «verdien til X bestemmer verdien til Y entydig».
              Eks: <code>kundeNr → navn</code> — gitt et kundenummer, finnes det bare ett
              riktig navn.
            </div>
            <div>
              <strong>Determinant:</strong> venstresiden i en FD (X i{" "}
              <code>X → Y</code>). Det er feltet (eller kombinasjonen) som «bestemmer» et
              annet felt.
            </div>
            <div>
              <strong>Kandidatnøkkel:</strong> MINIMAL kombinasjon av felter som
              identifiserer hver rad unikt. PK er én av kandidatnøklene — de andre får
              UNIQUE.
            </div>
          </div>
        </section>

        {/* Utgangspunkt */}
        <section id="utgangspunkt" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Utgangspunktet — én rotete tabell</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vi følger denne tabellen gjennom 1NF → 2NF → 3NF. Den bryter alle tre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`OrdreLinje(
  ordreNr, prodNr, antall,
  kundeNr, kundeNavn,
  postNr, poststed,
  prodNavn, prodPris,
  telefonNumre        -- '22 11 33, 99 88 77' (liste i én kolonne!)
)
PK = (ordreNr, prodNr)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Identifiser FD-ene først — de styrer hele normaliseringen:
          </p>
          <ul className="mt-2 space-y-1 text-sm list-disc pl-5">
            <li><code>(ordreNr, prodNr) → antall</code> — full PK bestemmer antall</li>
            <li><code>prodNr → prodNavn, prodPris</code> — partiell avhengighet</li>
            <li><code>ordreNr → kundeNr, kundeNavn, postNr, poststed, telefonNumre</code></li>
            <li><code>kundeNr → kundeNavn, postNr, telefonNumre</code> — kundeNr bestemmer kundeinfo</li>
            <li><code>postNr → poststed</code> — transitiv avhengighet</li>
          </ul>
        </section>

        {/* 1NF */}
        <section id="del-1nf" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              1. Normalform (1NF)
            </div>
            <h3 className="text-lg font-semibold mb-2">Atomiske verdier</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Hvert felt skal inneholde nøyaktig én verdi. Ingen lister, ingen
              kommaseparerte strenger, ingen JSON-arrays, ingen «gjentatte grupper».
            </p>
            <div className="text-sm font-semibold text-foreground mb-1">
              Bruddet hos oss:
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              <code>telefonNumre = '22 11 33, 99 88 77'</code> er en liste. Bryter 1NF.
            </p>
            <div className="text-sm font-semibold text-foreground mb-1">Fiks:</div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`Telefon(personId, nummer)   -- ny tabell
PRIMARY KEY (personId, nummer)
FOREIGN KEY (personId) → Kunde(kundeNr)

-- og fjern telefonNumre-kolonnen fra OrdreLinje`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Hvorfor egen tabell, ikke bare splitte på komma i SQL?</strong>{" "}
              Fordi du da må splitte ved HVER spørring, du kan ikke sette UNIQUE på et
              enkelt nummer, og du kan ikke joine mot telefonen. 1NF gjør telefonen til
              en førsteklasses verdi.
            </p>
          </div>
        </section>

        {/* 2NF */}
        <section id="del-2nf" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              2. Normalform (2NF)
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Ingen partielle avhengigheter
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Tabellen er i 1NF, og hvert ikke-nøkkelfelt avhenger av{" "}
              <strong>hele</strong> primærnøkkelen — ikke bare en del. Gjelder bare når
              PK er sammensatt (flere kolonner).
            </p>
            <div className="text-sm font-semibold text-foreground mb-1">
              Bruddet hos oss:
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              PK = (ordreNr, prodNr). Men <code>prodNavn</code> og <code>prodPris</code>{" "}
              avhenger bare av <code>prodNr</code> — halve nøkkelen. Det er en partiell
              avhengighet.
            </p>
            <div className="text-sm font-semibold text-foreground mb-1">Fiks:</div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`Produkt(prodNr, prodNavn, prodPris)
   PK = prodNr

OrdreLinje(ordreNr, prodNr, antall)
   PK = (ordreNr, prodNr)
   FK prodNr → Produkt(prodNr)`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Huskeregel:</strong> hvis PK består av én kolonne, kan tabellen
              ikke bryte 2NF — du hopper rett til 3NF-sjekken.
            </p>
          </div>
        </section>

        {/* 3NF */}
        <section id="del-3nf" className="mb-10">
          <div className="rounded-xl border-2 border-brand/40 bg-brand/5 p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              3. Normalform (3NF)
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Ingen transitive avhengigheter
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Tabellen er i 2NF, og intet ikke-nøkkelfelt avhenger av et annet
              ikke-nøkkelfelt. Med andre ord: bare PK skal bestemme noe.
            </p>
            <div className="text-sm font-semibold text-foreground mb-1">
              Bruddet hos oss:
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              I tabellen vår: <code>ordreNr → kundeNr → poststed</code>. Poststed
              avhenger «via» kundeNr/postNr — det er transitivt. Endrer Posten et
              stedsnavn, må vi oppdatere alle ordrer.
            </p>
            <div className="text-sm font-semibold text-foreground mb-1">Fiks:</div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`Poststed(postNr, poststed)
   PK = postNr

Kunde(kundeNr, kundeNavn, postNr)
   PK = kundeNr
   FK postNr → Poststed(postNr)

Ordre(ordreNr, kundeNr)
   PK = ordreNr
   FK kundeNr → Kunde(kundeNr)

OrdreLinje(ordreNr, prodNr, antall)
   PK = (ordreNr, prodNr)
   FK ordreNr → Ordre(ordreNr)
   FK prodNr  → Produkt(prodNr)`}</pre>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Resultatet:</strong> hvert poststed lagres én gang per postnummer.
              Hvert kundenavn lagres én gang per kunde. Endring ett sted påvirker resten
              via JOIN.
            </p>
          </div>
        </section>

        {/* Visuelt — stegvis tabelltransformasjon */}
        <NormaliseringSteps />

        {/* Sluttskjema */}
        <section id="sluttskjema" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Sluttskjema — alle tabellene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Etter 1NF + 2NF + 3NF har vi seks tabeller der hver opplysning lagres
            nøyaktig én gang.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`CREATE TABLE Poststed (
  postNr   CHAR(4)     PRIMARY KEY,
  poststed VARCHAR(40) NOT NULL
);

CREATE TABLE Kunde (
  kundeNr   INT         PRIMARY KEY,
  kundeNavn VARCHAR(80) NOT NULL,
  postNr    CHAR(4),
  FOREIGN KEY (postNr) REFERENCES Poststed(postNr)
);

CREATE TABLE Telefon (
  kundeNr INT,
  nummer  VARCHAR(20),
  PRIMARY KEY (kundeNr, nummer),
  FOREIGN KEY (kundeNr) REFERENCES Kunde(kundeNr) ON DELETE CASCADE
);

CREATE TABLE Produkt (
  prodNr   INT         PRIMARY KEY,
  prodNavn VARCHAR(80) NOT NULL,
  prodPris DECIMAL(8,2)
);

CREATE TABLE Ordre (
  ordreNr INT PRIMARY KEY,
  kundeNr INT NOT NULL,
  FOREIGN KEY (kundeNr) REFERENCES Kunde(kundeNr)
);

CREATE TABLE OrdreLinje (
  ordreNr INT,
  prodNr  INT,
  antall  INT NOT NULL,
  PRIMARY KEY (ordreNr, prodNr),
  FOREIGN KEY (ordreNr) REFERENCES Ordre(ordreNr),
  FOREIGN KEY (prodNr)  REFERENCES Produkt(prodNr)
);`}</pre>
          </div>
        </section>

        {/* BCNF */}
        <section id="bcnf" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">BCNF — når 3NF ikke holder</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Boyce-Codd Normalform er en strengere versjon av 3NF: <strong>alle</strong>{" "}
            determinanter må være kandidatnøkler. 3NF tillater et lite smutthull der
            BCNF ikke gjør det.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <p className="mb-2 font-semibold">Klassisk eksempel:</p>
            <p className="text-muted-foreground mb-3">
              <code>Bestilling(kunde, vare, selger)</code> der hver selger selger BARE
              ett vare-merke. PK = (kunde, vare). FD-ene er{" "}
              <code>(kunde, vare) → selger</code> og <code>selger → vare</code>. Den
              andre har selger som determinant — men selger er ikke kandidatnøkkel.
              Bryter BCNF, men oppfyller 3NF teknisk.
            </p>
            <p className="text-muted-foreground">
              Fiks: splitt ut <code>SelgerVare(selger, vare)</code> med PK = selger, og
              la <code>Bestilling(kunde, selger)</code> peke til den.
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            På eksamen i grunnkurs er 3NF nesten alltid målet — men du bør gjenkjenne
            mønsteret over.
          </p>
        </section>

        {/* Sjekkliste */}
        <section id="sjekkliste" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Sjekkliste — normaliser stegvis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bruk rekkefølgen. Hopp aldri over et trinn — du oppdager ikke 3NF-brudd hvis
            tabellen ikke er i 2NF først.
          </p>
          <ol className="space-y-2">
            {[
              "Skriv ned alle attributter og 2–3 eksempelrader. Gjør avhengighetene synlige.",
              "Marker primærnøkkelen — kandidatnøkkelen du har valgt.",
              "List ut FD-ene: hvilke felter bestemmer hvilke?",
              "1NF: er det lister/kommaseparerte verdier? Splitt ut til egen tabell.",
              "2NF: er PK sammensatt? Sjekk hvert ikke-nøkkelfelt — avhenger det av HELE PK eller bare en del?",
              "3NF: går noen FD via et ikke-nøkkelfelt (transitivt)? Flytt ut.",
              "Tegn det endelige skjemaet med PK og FK-er. Kjør 3NF-sjekken på hver nye tabell.",
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Vanlige feller */}
        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Bare splitt på komma i SQL» er IKKE 1NF.</strong> Du må flytte
              listen ut i egen tabell. Alt annet skaper problemer.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Husk: 2NF er bare relevant ved sammensatte PK.</strong> Én-kolonne
              PK kan ikke ha partielle avhengigheter — det finnes ingen «halv nøkkel».
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Ikke svar «3NF» for en tabell som bryter 1NF.</strong>{" "}
              Normalformene er kumulative: hopper du over en, er du heller ikke i de
              høyere.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Denormalisering er bevisst.</strong> Du bryter normalformer for
              ytelse i analyse-databaser (data warehouses) — aldri tilfeldig, og aldri
              i et OLTP-system der data oppdateres.
            </div>
          </div>
        </section>

        {/* Bunn-CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : skikkelige 1NF/2NF/3NF-oppgaver — finn FD-er, identifiser brudd,
              dekomponer.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "er-mapping" }}
                className="text-brand hover:underline"
              >
                ER → DDL mapping
              </Link>
              : når du har normaliserte tabeller, lær å lese kråkefot og oversette til
              DDL.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">
                Repetisjonskort
              </Link>
              : begreper (FD, determinant, kandidatnøkkel, BCNF) før eksamen.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
