import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { AlohaSimulator } from "./AlohaSimulator";

const STEPS = [
  { title: "Hvorfor MAC?", anchor: "hvorfor" },
  { title: "Cocktail-party-metaforen", anchor: "metafor" },
  { title: "Pure ALOHA → slotted ALOHA", anchor: "pure-vs-slotted" },
  { title: "Effektivitetsformelen", anchor: "formel" },
  { title: "Simulator", anchor: "sim" },
  { title: "1/e-grensen", anchor: "1e" },
  { title: "Veien til CSMA og Ethernet", anchor: "videre" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function AlohaKasinoPage() {
  return (
    <StackPageShell title="ALOHA-kasinoet" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 6.3.2 (s. 465–470)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ALOHA-kasinoet — random access og 1/e-grensen
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Slotted ALOHA er det enkleste random-access-protokollet som finnes:{" "}
            <em>«har du noe å sende, kast en mynt med sannsynlighet p i hver slot.»</em>{" "}
            Det virker latterlig enkelt, og effektiviteten topper seg ved beskjedne 37%.
            Men det er <strong>matematisk fundament</strong> for alt fra Wi-Fi til mobil-
            cellular — alle MAC-protokoller er optimeringer over ALOHA.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">
                ALOHA-simulatoren
              </a>{" "}
              lar deg vri på N og p og se effektivitet teoretisk vs. observert — pluss
              slot-by-slot S/E/C-visualisering som fig. 6.10.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-aloha-kasino" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor multiple access control (MAC)?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Linklaget har to typer linker: <strong>punkt-til-punkt</strong> (én sender, én
            mottaker — f.eks. en moderne switch-port) og <strong>broadcast</strong> (alle
            deler ett medium — gammel hub-Ethernet, Wi-Fi, satellitt). For broadcast må vi
            løse <em>multiple access</em>-problemet: hvem får sende når?
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Channel partitioning</strong>: TDMA/FDMA — del kanalen i faste
              tidsluker eller frekvensbånd. Garantert kollisjonsfritt, men sløsende på
              tomme slots.
            </li>
            <li>
              <strong>Random access</strong>: ALOHA, CSMA, CSMA/CD — alle sender når de
              vil, håndterer kollisjoner i ettertid. Effektiv ved lav last, dårlig ved
              høy.
            </li>
            <li>
              <strong>Taking turns</strong>: token ring, polling — robust og rettferdig,
              men trenger sentral koordinering.
            </li>
          </ul>
        </section>

        <section id="metafor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Cocktail-party-metaforen</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <p className="leading-relaxed">
              Forestill deg et rom med N personer. Når flere snakker samtidig forstår
              ingen noe — det er en <em>kollisjon</em>.
            </p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>
                <strong>ALOHA-personen</strong> er en uhøflig fyr som bare braser ut med
                en setning når han har lyst. Hvis han er den eneste som snakker → suksess.
                Hvis flere snakker → alle skvises ut, alle prøver igjen senere (med en
                mynt).
              </li>
              <li>
                <strong>CSMA-personen</strong> lytter først — <em>«carrier sense»</em>.
                Snakker bare når det er stille. Reduserer (men eliminerer ikke) kollisjoner.
              </li>
              <li>
                <strong>CSMA/CD-personen</strong> (Ethernet) lytter <em>mens</em> han
                snakker — hører han noen andre starte samtidig, slutter han umiddelbart{" "}
                <em>(«collision detection»)</em>.
              </li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            ALOHA er altså det <em>uhøflige</em> ekstreme. Det virker fortsatt — bare
            ikke veldig effektivt.
          </p>
        </section>

        <section id="pure-vs-slotted" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Pure ALOHA → slotted ALOHA</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Norman Abramson, Hawaii, 1970: «vi har radiostasjoner på flere øyer; hvordan
            deler vi én radiokanal?» Hans første svar — <strong>pure ALOHA</strong> —
            tillot å sende når som helst. To rammer som overlapper i bare ett bit
            kolliderer. Maks teoretisk effektivitet: 1/(2e) ≈ 18%.
          </p>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            <strong>Slotted ALOHA</strong> er forbedringen: alle noder synkroniserer
            klokka, og sender bare fra starten av en slot. Sårbarhetsvinduet er nå én
            slot (ikke to). Effektiviteten dobles — opptil 1/e ≈ 37%.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Variant</th>
                  <th className="text-left font-semibold px-4 py-2">Maks effektivitet</th>
                  <th className="text-left font-semibold px-4 py-2">Krever</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Pure ALOHA</td>
                  <td className="px-4 py-2"><Tex>{`\\tfrac{1}{2e} \\approx 0.18`}</Tex></td>
                  <td className="px-4 py-2">Ingenting — send når du vil.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Slotted ALOHA</td>
                  <td className="px-4 py-2"><Tex>{`\\tfrac{1}{e} \\approx 0.37`}</Tex></td>
                  <td className="px-4 py-2">Synkronisert klokke; alle starter ved slot-grense.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="formel" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Effektivitetsformelen</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Anta N noder, hver med en ferdig ramme klar, og at hver node transmitterer
            uavhengig i hver slot med sannsynlighet p. En slot er en{" "}
            <em>suksess</em> hvis nøyaktig én node sender. Sannsynligheten:
          </p>
          <TexBlock>
            {`P[\\text{suksess}] = \\binom{N}{1} p (1-p)^{N-1} = N \\cdot p \\cdot (1-p)^{N-1}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Dette er gjennomstrømningen per slot — eller, om du vil, brøkdelen suksess-
            slots på lang sikt. For å maksimere, derivér mhp. p og sett til null:
          </p>
          <TexBlock>
            {`\\frac{d}{dp}\\left[ N p (1-p)^{N-1} \\right] = 0 \\;\\Longrightarrow\\; p^* = \\frac{1}{N}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Sett <Tex>{`p = 1/N`}</Tex> inn:
          </p>
          <TexBlock>
            {`P_{\\max} = N \\cdot \\frac{1}{N} \\cdot \\left(1 - \\frac{1}{N}\\right)^{N-1} = \\left(1 - \\frac{1}{N}\\right)^{N-1} \\xrightarrow[N\\to\\infty]{} \\frac{1}{e}`}
          </TexBlock>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Simulator: prøv selv</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Slidere for N og p. Effektivitetskurven viser den teoretiske funksjonen{" "}
            <Tex>{`N p (1-p)^{N-1}`}</Tex>, med dine valg markert. Slot-by-slot-visningen
            tegner én slot i taket som <strong>S</strong> (suksess),{" "}
            <strong>E</strong> (tom — ingen sendte) eller <strong>C</strong> (kollisjon —
            ≥2 sendte). Sammenlign med Kurose fig. 6.10.
          </p>
          <AlohaSimulator />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>3 øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>p for stort.</strong> Sett N=5, p=0.9. Hva dominerer slottypene?
                (Kollisjoner — alle krasjer hverandre.)
              </li>
              <li>
                <strong>p for lite.</strong> Sett N=5, p=0.01. Hva dominerer? (Tomme slots
                — kanalen står stille.)
              </li>
              <li>
                <strong>Trykk «p = 1/N»</strong> for ulike N. Hvor mye varierer
                effektiviteten? (Den nærmer seg 1/e ≈ 0.368 for store N — uoppnåelig å
                gjøre bedre uten å lytte først.)
              </li>
            </ol>
          </div>
        </section>

        <section id="1e" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Hvorfor akkurat 1/e?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Den klassiske grenseverdien
          </p>
          <TexBlock>{`\\lim_{N \\to \\infty} \\left(1 - \\frac{1}{N}\\right)^{N-1} = \\frac{1}{e}`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            er den samme som dukker opp i kompound rente, Poisson-tilnærming og halvering
            i partikelfysikk. Intuisjon: med p=1/N sender hver node «en av N» ganger; for
            store N nærmer det seg en Poisson-prosess med rate 1 — og sannsynligheten for
            «nøyaktig én ankomst» er <Tex>{`e^{-1}`}</Tex>.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Skarpt poeng:</strong>{" "}
            ALOHA klarer altså i beste fall å bruke 37% av kanalen. Det er grunnen til at
            tidlig Ethernet (CSMA/CD) gjorde det så mye bedre — ved å lytte først og
            avbryte ved kollisjon, ender du opp med 80–95% kanalutnyttelse i praksis.
          </div>
        </section>

        <section id="videre" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Veien videre: ALOHA → CSMA → Ethernet → Wi-Fi</h2>
          <ol className="text-sm space-y-1.5 list-decimal pl-5">
            <li>
              <strong>Pure ALOHA</strong> — uhøflig fyr, 1/(2e).
            </li>
            <li>
              <strong>Slotted ALOHA</strong> — uhøflig fyr med klokke, 1/e.
            </li>
            <li>
              <strong>CSMA</strong> — lytt før du snakker. Reduserer kollisjoner; gjenstår
              kun de som starter «samtidig» (innenfor propagasjonsforsinkelsen).
            </li>
            <li>
              <strong>CSMA/CD</strong> (Ethernet 1980-tallet) — lytt mens du snakker; avbryt
              ved kollisjon, vent eksponentiell backoff. 80–95% utnyttelse.
            </li>
            <li>
              <strong>CSMA/CA</strong> (Wi-Fi) — kan ikke høre sin egen kollisjon (radio er
              halv-dupleks), så <em>collision avoidance</em>: backoff-tellere før hver
              sending, RTS/CTS, ACK.
            </li>
          </ol>
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
                  <td className="px-4 py-2 font-mono text-brand">P[suksess i slot]</td>
                  <td className="px-4 py-2"><Tex>{`N p (1-p)^{N-1}`}</Tex></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Optimal p</td>
                  <td className="px-4 py-2"><Tex>{`p^* = 1/N`}</Tex></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Maks effektivitet (slotted)</td>
                  <td className="px-4 py-2"><Tex>{`1/e \\approx 0.368`}</Tex></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Maks effektivitet (pure)</td>
                  <td className="px-4 py-2"><Tex>{`1/(2e) \\approx 0.184`}</Tex></td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Kollisjon i slotted ALOHA</td>
                  <td className="px-4 py-2">≥ 2 noder sender i samme slot.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-brand">Backoff ved kollisjon</td>
                  <td className="px-4 py-2">Hver node retransmitterer i neste slot med sannsynlighet p; ingen sentral koordinering.</td>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-arp-detektiv" }} className="text-brand hover:underline">ARP-detektiv</Link>
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
