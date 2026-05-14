import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { CrcDivider } from "./CrcDivider";

const STEPS = [
  { title: "Hvorfor CRC?", anchor: "hvorfor" },
  { title: "Modulo-2-aritmetikk", anchor: "modulo2" },
  { title: "Algoritmen i fire steg", anchor: "algo" },
  { title: "Bokens eksempel", anchor: "eksempel" },
  { title: "Kalkulator — trinn for trinn", anchor: "kalkulator" },
  { title: "Mottakerens sjekk", anchor: "mottaker" },
  { title: "Hvilke feil fanges?", anchor: "feil" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function CrcKalkulatorPage() {
  return (
    <StackPageShell title="CRC modulo-2-divisjon" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 6.2.3 (s. 459–461)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            CRC — Cyclic Redundancy Check med modulo-2-divisjon
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            CRC er feilkoden alle linklags-protokoller (Ethernet, Wi-Fi, HDLC, USB) bruker
            for å oppdage bit-feil. Den er sterkere enn enkelt paritetssjekk og kjapp å
            implementere i hardware — bare en serie XOR-er. Matematisk er det
            polynomdivisjon i <Tex>{`\\mathrm{GF}(2)`}</Tex>; praktisk er det vanlig lang
            divisjon der subtraksjon er erstattet med XOR.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#kalkulator" className="text-brand hover:underline">
                CRC-kalkulatoren
              </a>{" "}
              under viser hvert XOR-trinn for D og G du selv velger — inkludert mottaker-
              verifiseringen.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-crc-kalkulator" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor CRC?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver gang en ramme krysser et fysisk medium kan bit flippes — kosmisk stråling,
            elektromagnetisk støy, en dårlig kabel. Mottakeren må kunne oppdage dette og
            kaste rammen. Tre vanlige alternativer:
          </p>
          <ul className="text-sm space-y-1.5 list-disc pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Paritet</strong> — én ekstra bit. Fanger
              odde antall feil. Svak.
            </li>
            <li>
              <strong className="text-foreground">Internet-checksum</strong> — 16-bits sum,
              brukes i IP/TCP/UDP. Programvare-vennlig, men svakere enn CRC.
            </li>
            <li>
              <strong className="text-foreground">CRC</strong> — r bits, valgt G-polynom.
              Veldig sterk: fanger alle burst-feil opp til r bits, alle odde feil, og
              99.997% av lengre bursts (avhengig av G).
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Merk:</strong> CRC{" "}
            <em>oppdager</em> feil; den retter ikke. Linklaget kaster rammer med feil
            CRC og overlater retransmisjon til ARQ (Wi-Fi) eller transportlaget (TCP).
          </div>
        </section>

        <section id="modulo2" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Modulo-2-aritmetikk = XOR</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            I CRC er all addisjon og subtraksjon det samme: bitvis XOR uten mente. Tabell:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm font-mono">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">a</th>
                  <th className="text-left font-semibold px-4 py-2">b</th>
                  <th className="text-left font-semibold px-4 py-2">a + b mod 2</th>
                  <th className="text-left font-semibold px-4 py-2">a − b mod 2</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-2">0</td><td className="px-4 py-2">0</td><td className="px-4 py-2">0</td><td className="px-4 py-2">0</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-2">0</td><td className="px-4 py-2">1</td><td className="px-4 py-2">1</td><td className="px-4 py-2">1</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-2">1</td><td className="px-4 py-2">0</td><td className="px-4 py-2">1</td><td className="px-4 py-2">1</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-2">1</td><td className="px-4 py-2">1</td><td className="px-4 py-2">0</td><td className="px-4 py-2">0</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Pluss og minus er identiske — ingen lån, ingen mente. Det betyr at lang
            divisjon med modulo-2 er strukturelt enklere enn vanlig divisjon: ingen
            negative mellomresultat.
          </p>
        </section>

        <section id="algo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Algoritmen i fire steg</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Sender og mottaker er enige om et generatorpolynom <Tex>{`G`}</Tex> av lengde{" "}
            <Tex>{`r+1`}</Tex> bits. Resten <Tex>{`R`}</Tex> blir r bits — CRC-en som
            henges på rammen.
          </p>
          <ol className="text-sm space-y-1.5 list-decimal pl-5">
            <li>
              Senderen tar D (databits) og <strong>appenderer r nuller</strong>:{" "}
              <Tex>{`D \\cdot 2^r`}</Tex>.
            </li>
            <li>
              Dele <Tex>{`D \\cdot 2^r`}</Tex> på <Tex>{`G`}</Tex> med modulo-2-divisjon.
            </li>
            <li>
              Resten <Tex>{`R`}</Tex> (r bits) henges på D → ramme ={" "}
              <Tex>{`\\langle D, R \\rangle`}</Tex>.
            </li>
            <li>
              Mottakeren tar imot rammen og deler hele på <Tex>{`G`}</Tex>. Rest = 0 →
              feilfri. Rest ≠ 0 → bit-feil oppdaget; kast rammen.
            </li>
          </ol>
          <TexBlock>
            {`D \\cdot 2^r \\;=\\; q \\cdot G \\;\\oplus\\; R \\quad\\Longrightarrow\\quad \\underbrace{D \\cdot 2^r \\oplus R}_{\\text{rammen}} \\;=\\; q \\cdot G`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Høyre side er per definisjon delelig med G uten rest. Det er hele knepet.
          </p>
        </section>

        <section id="eksempel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Bokens eksempel: D=101110, G=1001</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Kurose 6.2.3 viser dette nøyaktige eksempelet: <Tex>{`D = 101110`}</Tex>,{" "}
            <Tex>{`G = 1001`}</Tex>, så r = 3.
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <Tex>{`D \\cdot 2^3 = 101110000`}</Tex> (appendere 3 nuller).
            </li>
            <li>
              Del <span className="font-mono">101110000</span> på <span className="font-mono">1001</span>.
            </li>
            <li>
              Resten blir <Tex>{`R = 011`}</Tex>.
            </li>
            <li>
              Rammen som sendes: <span className="font-mono">101110</span>
              <span className="font-mono text-brand">011</span>.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Kalkulatoren under er forhåndsutfylt med dette eksempelet — start der og
            sammenlign med fig. 6.7 i boken.
          </p>
        </section>

        <section id="kalkulator" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Kalkulator — trinn for trinn</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Skriv inn D og G (binært), så vises hver XOR i divisjonen. Trykk{" "}
            <em>vis mottakerverifikasjon</em> for å se at hele rammen, delt på G, gir rest
            null.
          </p>
          <CrcDivider />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Bokens eksempel.</strong> D=101110, G=1001. Verifiser at R=011 og at
                rammen 101110011 har rest 0.
              </li>
              <li>
                <strong>CRC-4.</strong> D=11010011, G=10011 (et reelt CRC-4-polynom). Sjekk
                R og verifiser.
              </li>
              <li>
                <strong>Flipp en bit.</strong> Send rammen, men bytt manuelt ut en bit i D
                (skriv et endret D). Resten blir ikke null — feil oppdaget.
              </li>
            </ol>
          </div>
        </section>

        <section id="mottaker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Mottakerens sjekk i én linje</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Mottakeren bryr seg ikke om D, G og R hver for seg — den tar imot rammen{" "}
            <Tex>{`F = \\langle D, R \\rangle`}</Tex> som ett bit-streng og kjører ÉN
            divisjon:
          </p>
          <TexBlock>{`F \\bmod G \\stackrel{?}{=} 0`}</TexBlock>
          <ul className="text-sm space-y-1 list-disc pl-5 mt-2">
            <li>
              <strong>Rest = 0</strong> ⇒ rammen aksepteres (sannsynligvis feilfri).
            </li>
            <li>
              <strong>Rest ≠ 0</strong> ⇒ minst én bit er flippet ⇒ kast rammen.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Senderen og mottakeren bruker <em>nøyaktig samme</em> divisjonskode — kun
            inputen er ulik.
          </p>
        </section>

        <section id="feil" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hvilke feil fanger CRC?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En bit-feil E gir mottatt ramme <Tex>{`F' = F \\oplus E`}</Tex>. Resten blir 0
            hvis og bare hvis E selv er delelig med G — så valg av G er hele kunsten.
            Standard analyse (Peterson &amp; Brown):
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Alle 1-bit-feil</strong> oppdages hvis G har ≥ 2 termer som ikke er 0.
            </li>
            <li>
              <strong>Alle 2-bit-feil</strong> oppdages hvis G har en primitiv faktor.
            </li>
            <li>
              <strong>Alle odde feil</strong> oppdages hvis G er delelig med <span className="font-mono">x+1</span>.
            </li>
            <li>
              <strong>Alle burst-feil ≤ r bits</strong> oppdages — uansett G (så lenge
              graden er r).
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Standard CRC-polynom (eksamenskandidater bør gjenkjenne)
            </div>
            <ul className="space-y-1 text-sm font-mono">
              <li>CRC-8 (ATM, Bluetooth): <span className="text-brand">x⁸ + x² + x + 1</span></li>
              <li>CRC-16 (HDLC, USB): <span className="text-brand">x¹⁶ + x¹² + x⁵ + 1</span></li>
              <li>CRC-32 (Ethernet, ZIP): <span className="text-brand">x³² + x²⁶ + … + 1</span></li>
            </ul>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Spørsmål</th>
                  <th className="text-left font-semibold px-4 py-2">Svar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hvor mange bits er R?</td>
                  <td className="px-4 py-2">r = lengden av G minus 1.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hva appenderes til D?</td>
                  <td className="px-4 py-2">r nuller, før divisjon. Senere byttes de ut med R.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hva er en «vellykket» mottak?</td>
                  <td className="px-4 py-2">Rest = 0 etter divisjon av hele rammen på G.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Hvilke feil fanges alltid?</td>
                  <td className="px-4 py-2">Alle burst-feil ≤ r bits, samt enkelte 1-/odde-feil.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Korrekturkode eller bare detektor?</td>
                  <td className="px-4 py-2">Bare detektor — rammen kastes ved feil, retransmisjon overlates til høyere lag.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">DTE-2507-hub</Link>
              {" "}— alle nettverks-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-aloha-kasino" }} className="text-brand hover:underline">ALOHA-kasinoet</Link>
              {" "}— neste tema fra linklaget.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              under emnet «DTE-2507».
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
