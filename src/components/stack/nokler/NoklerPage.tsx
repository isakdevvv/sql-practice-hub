import { Link } from "@tanstack/react-router";
import { ArrowRight, Key, Link2 } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

// Course page on PK and FK design decisions. Pairs with /drag (topic "Nøkler")
// for hands-on quizzes and drag-fills.

const STEPS = [
  { title: "Tre begreper", anchor: "begreper" },
  { title: "Surrogat vs. naturlig PK", anchor: "surrogat-naturlig" },
  { title: "Beslutningstre — hvilken PK?", anchor: "beslutningstre" },
  { title: "PK/FK per relasjonstype", anchor: "relasjonstyper" },
  { title: "ON DELETE-strategier", anchor: "on-delete" },
];


export function NoklerPage() {
  return (
    <StackPageShell title="Primær- og fremmednøkler — riktige valg" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Databasedesign · Nøkler
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Primærnøkler, fremmednøkler, og hvordan de fungerer i 1:1, 1:N og M:N
          </h1>
          <p className="mt-3 text-muted-foreground">
            Valg av PK påvirker hver eneste fremmednøkkel som peker hit. Velger du feil,
            må du oppdatere mange tabeller når business-data endres. Her ser vi
            beslutningstreet, og hvordan nøkler fungerer i hver relasjonstype.
          </p>
        </div>

        {/* Definisjoner */}
        <CourseOutline courseId="nokler" steps={STEPS} />

        <section id="begreper" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Tre begreper du må kunne</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-sm">Superkey</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enhver kombinasjon som identifiserer hver rad unikt — også de med
                overflødige kolonner.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-success" />
                <h3 className="font-semibold text-sm">Kandidatnøkkel</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Minimal</strong> superkey — fjerner du én kolonne, mister du
                unikheten. En tabell kan ha flere kandidatnøkler.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-warning" />
                <h3 className="font-semibold text-sm">Primærnøkkel (PK)</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Den kandidatnøkkelen vi velger som offisiell. ÉN per tabell. De andre får
                UNIQUE-constraint.
              </p>
            </div>
          </div>
        </section>

        {/* Surrogat vs naturlig */}
        <section id="surrogat-naturlig" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Surrogat vs. naturlig PK</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Surrogat-PK</strong> = kunstig id (AUTO_INCREMENT, SERIAL, UUID).{" "}
            <strong>Naturlig PK</strong> = eksisterende business-felt (epost, ISBN,
            landkode). Beslutningen styrer hvor smertefritt det er å endre data.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-success/40 bg-success/5 p-5">
              <div className="text-xs uppercase tracking-wider text-success font-semibold mb-2">
                Surrogat-PK — default
              </div>
              <ul className="space-y-1.5 text-sm text-foreground">
                <li>+ Stabil (endrer aldri verdi)</li>
                <li>+ Kort (INT/UUID) → raske JOIN-er</li>
                <li>+ Lekker ikke business-info</li>
                <li>+ Fungerer selv om alle business-felter endres</li>
                <li>− Krever ekstra kolonne</li>
                <li>− To rader kan være identiske bortsett fra id (sett UNIQUE!)</li>
              </ul>
              <pre className="mt-3 font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Kunde (
  id    INT PRIMARY KEY AUTO_INCREMENT,
  epost VARCHAR(120) UNIQUE NOT NULL,
  navn  VARCHAR(80) NOT NULL
);`}</pre>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5">
              <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-2">
                Naturlig PK — bevisst unntak
              </div>
              <ul className="space-y-1.5 text-sm text-foreground">
                <li>+ Ingen ekstra kolonne</li>
                <li>+ Menneskelig lesbar i URL/log</li>
                <li>− Hvis verdien endres, må alle FK-er oppdateres</li>
                <li>− Lange strenger gir tregere indekser</li>
                <li>+ OK når verdien er kort, stabil og standardisert</li>
              </ul>
              <pre className="mt-3 font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Land (
  landkode CHAR(2) PRIMARY KEY,   -- ISO 3166-1
  navn     VARCHAR(80) NOT NULL
);
-- også: Valuta(CHAR(3)), Postnummer(CHAR(4))`}</pre>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong>Tommelfingerregel:</strong> bruk surrogat default. Naturlig PK kun
            når verdien er KORT, STABIL og STANDARDISERT (ISO-koder, postnumre, ISBN).
            Aldri epost, brukernavn eller telefon — de endres.
          </div>
        </section>

        {/* Beslutningstre */}
        <section id="beslutningstre" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Beslutningstre — hvilken PK?</h2>
          <ol className="space-y-2">
            {[
              "Finn alle kandidatnøkler — minimale kombinasjoner som er unike",
              "Er det en M:N-koblingstabell? → bruk sammensatt PK = (FK_a, FK_b)",
              "Er det en svak entitet (kan ikke eksistere uten eier)? → PK = (eier-FK, lokal nøkkel)",
              "Finnes en KORT, STABIL, STANDARDISERT naturlig nøkkel? → bruk den",
              "Ellers: surrogat-PK (id INT AUTO_INCREMENT eller UUID)",
              "Sett UNIQUE på naturlige kandidatnøkler som ikke ble PK",
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

        {/* Hver relasjonstype */}
        <section id="relasjonstyper" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            Hvordan PK/FK ser ut i hver relasjonstype
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">1 : 1 — én PERSON har ett PASS</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                FK på én av sidene + UNIQUE for å sikre 1:1. NOT NULL hvis total
                deltakelse.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Person (
  id INT PRIMARY KEY,
  navn VARCHAR(80)
);
CREATE TABLE Pass (
  passNr INT PRIMARY KEY,
  personId INT UNIQUE,                 -- UNIQUE gjør det til 1:1
  FOREIGN KEY (personId) REFERENCES Person(id)
);`}</pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">1 : N — én KUNDE har 0..N ORDRE</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                FK på mange-siden («FK-en bor på mange-siden»). Vanlig kolonne, ikke
                UNIQUE.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Kunde (
  kundeNr INT PRIMARY KEY,
  navn VARCHAR(80)
);
CREATE TABLE Ordre (
  ordreNr INT PRIMARY KEY,
  kundeNr INT NOT NULL,
  FOREIGN KEY (kundeNr) REFERENCES Kunde(kundeNr)
);`}</pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">M : N — STUDENT tar mange FAG</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Koblingstabell med sammensatt PK av FK-ene. Relasjons-attributter
                (semester, karakter) bor her.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Tar (
  sid INT NOT NULL,
  fkode VARCHAR(8) NOT NULL,
  semester VARCHAR(8),
  karakter CHAR(1),
  PRIMARY KEY (sid, fkode),            -- sammensatt PK
  FOREIGN KEY (sid)   REFERENCES Student(sid),
  FOREIGN KEY (fkode) REFERENCES Fag(fkode)
);`}</pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">Svak entitet — ORDRELINJE i ORDRE</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                PK = (eier-FK, lokal partiell nøkkel). ON DELETE CASCADE er typisk —
                slett ordren, og linjene følger.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Ordrelinje (
  ordreNr INT NOT NULL,
  linjeNr INT NOT NULL,
  prodNr  INT NOT NULL,
  antall  INT NOT NULL,
  PRIMARY KEY (ordreNr, linjeNr),      -- eier-FK + lokal nr
  FOREIGN KEY (ordreNr) REFERENCES Ordre(ordreNr) ON DELETE CASCADE,
  FOREIGN KEY (prodNr)  REFERENCES Produkt(prodNr) ON DELETE RESTRICT
);`}</pre>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-brand" />
                <h3 className="font-semibold">Rekursiv 1 : N — ANSATT har leder</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                FK i samme tabell. Nullable for toppsjefen som ikke har leder.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre rounded bg-background border border-border p-3">{`CREATE TABLE Ansatt (
  ansattNr INT PRIMARY KEY,
  navn VARCHAR(80),
  lederNr INT NULL,                    -- toppsjefen har NULL
  FOREIGN KEY (lederNr) REFERENCES Ansatt(ansattNr)
);`}</pre>
            </div>
          </div>
        </section>

        {/* ON DELETE / UPDATE */}
        <section id="on-delete" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">FK-strategier: ON DELETE / ON UPDATE</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Strategi</th>
                  <th className="text-left font-semibold px-4 py-2">Effekt</th>
                  <th className="text-left font-semibold px-4 py-2 hidden sm:table-cell">Når</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">RESTRICT</td>
                  <td className="px-4 py-3 text-muted-foreground">Nekt sletting hvis det finnes barn</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    Default for «viktig» relasjon — historikk skal bevares
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">CASCADE</td>
                  <td className="px-4 py-3 text-muted-foreground">Slett også barna</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    Svake entiteter, junction-rader, cache
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">SET NULL</td>
                  <td className="px-4 py-3 text-muted-foreground">Sett barnets FK til NULL</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    Frivillig relasjon (FK må være nullable)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">SET DEFAULT</td>
                  <td className="px-4 py-3 text-muted-foreground">Sett til kolonnens DEFAULT</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    Sjelden — krever en «fallback»-rad
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : 10 oppgaver under «Nøkler» — velg riktig PK, plasser FK, bestem ON
              DELETE-strategi.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "er-mapping" }}
                className="text-brand hover:underline"
              >
                ER → DDL mapping
              </Link>
              : oversettelse fra kråkefot-diagram til CREATE TABLE-skjelett.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
