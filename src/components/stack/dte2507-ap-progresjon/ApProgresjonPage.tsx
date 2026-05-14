import { Link } from "@tanstack/react-router";
import { Lightbulb, ShieldAlert } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex } from "@/components/Tex";
import { SequenceDiagram } from "./SequenceDiagram";

const STEPS = [
  { title: "Bakteppe — Alice, Bob og Trudy", anchor: "intro" },
  { title: "ap1.0 — «I am Alice»", anchor: "ap10" },
  { title: "ap2.0 — IP-adressen min er X", anchor: "ap20" },
  { title: "ap3.0 — passord", anchor: "ap30" },
  { title: "ap3.1 — kryptert passord", anchor: "ap31" },
  { title: "ap4.0 — nonce!", anchor: "ap40" },
  { title: "Hva er en nonce?", anchor: "nonce" },
  { title: "Oppsummering", anchor: "ref" },
];

export function ApProgresjonPage() {
  return (
    <StackPageShell title="ap 1.0 → 4.0" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 8.4
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ap 1.0 → 4.0 — autentisering, slik den ble oppfunnet
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            <em>Authentication protocol</em> (ap) er Kuroses sikkerhets-flaggskip — parallellen
            til rdt-progresjonen, men i kapittel 8. Vi følger Alice som prøver å overbevise
            Bob om at hun er hun. Hver versjon ser snill ut på papiret, helt til <em>Trudy</em>
            (intruder) får komme inn og bryte den. For hvert brudd legger vi til ett verktøy
            — og når vi til slutt har <strong>nonce</strong>, er protokollen sikker mot
            avlytting.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Den røde tråden.</span> Hvis du noensinne har
              lurt på <em>hvorfor</em> CHAP, TLS, OAuth-state-parameter, JWT-nonce og
              WebAuthn-challenges finnes — så er det dette eksempelet. De er alle ap4.0 i
              forskjellige drakter.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-ap-progresjon" steps={STEPS} />

        <section id="intro" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Bakteppe — Alice, Bob og Trudy</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tre faste figurer i kryptolitteraturen:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Alice</strong> ønsker å autentisere seg overfor Bob — bevise <em>«jeg er Alice»</em>.
            </li>
            <li>
              <strong>Bob</strong> krever et bevis. Han skal etter sesjonen være sikker.
            </li>
            <li>
              <strong>Trudy</strong> (intruder/Mallory) sitter mellom dem og kan{" "}
              <em>lese</em>, <em>endre</em>, <em>droppe</em> og <em>sende</em> pakker.
              Klassisk «man-in-the-middle».
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Antagelsen er aggressiv: Trudy ser <em>alt</em> på lenken. Det er det realistiske
            tilfellet på Internett. Hver autentiseringsversjon må overleve det.
          </p>
        </section>

        <section id="ap10" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. ap1.0 — «I am Alice»</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Naiv start: Alice sender bare <code>"I am Alice"</code>. Bob tror henne. Ferdig.
          </p>
          <SequenceDiagram
            title="ap1.0 — uten Trudy"
            messages={[
              { from: "alice", to: "bob", label: '"I am Alice"' },
            ]}
          />
          <SequenceDiagram
            title="ap1.0 — Trudy bryter den trivielt"
            withTrudy
            messages={[
              { from: "trudy", to: "bob", label: '"I am Alice"', attack: true, note: "Bob har ingen måte å oppdage det" },
            ]}
            conclusion="Trudy trenger ikke engang Alice. Hun bare påstår å være Alice. Bob tror henne. Bygd om noen sekunder."
          />
        </section>

        <section id="ap20" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. ap2.0 — «IP-adressen min er X»</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            «Greit,» sier Bob, «da må du i tillegg sende fra Alice sin IP-adresse.» Det
            virker mer kresent.
          </p>
          <SequenceDiagram
            title="ap2.0 — Alice"
            messages={[
              { from: "alice", to: "bob", label: '"I am Alice", src=IP_A' },
            ]}
          />
          <SequenceDiagram
            title="ap2.0 — Trudy spoofer IP"
            withTrudy
            messages={[
              {
                from: "trudy",
                to: "bob",
                label: '"I am Alice", src=IP_A',
                attack: true,
                note: "IP-spoofing — Trudy setter Alice sin IP i src-feltet",
              },
            ]}
            conclusion="IP-source-adresser settes av senderen og verifiseres ikke kryptografisk på IP-laget. Trudy kan trivielt spoofe. Mange OS gjør dette enklere enn man tror — Linux raw sockets eller scapy holder."
          />
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <strong>IP-spoofing</strong> er kjernen i mange angrep — SYN flood, reflection
              DDoS, ARP-spoofing på LAN. Det er <em>aldri</em> nok til autentisering alene.
            </div>
          </div>
        </section>

        <section id="ap30" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. ap3.0 — passord i klartekst</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Greit, prøv et delt hemmelig passord. Alice og Bob har avtalt det på forhånd.
            Alice sender det med navnet.
          </p>
          <SequenceDiagram
            title="ap3.0 — Alice"
            messages={[
              { from: "alice", to: "bob", label: '"I am Alice", passord=p' },
              { from: "bob", to: "alice", label: "OK" },
            ]}
          />
          <SequenceDiagram
            title="ap3.0 — Trudy sniffer"
            withTrudy
            messages={[
              { from: "alice", to: "trudy", label: '"I am Alice", p', note: "Trudy ser passordet i fartsfeltet" },
              { from: "trudy", to: "bob", label: '"I am Alice", p', attack: true, note: "Senere: gjenbruker p" },
            ]}
            conclusion="Klartekst-passord på en delt link er like utsatt som å rope kortkoden i kafé. Telnet, FTP og gammel POP3 hadde dette problemet."
          />
        </section>

        <section id="ap31" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. ap3.1 — kryptert passord (replay-attack)</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            «Ok da, vi krypterer passordet med en delt symmetrisk nøkkel{" "}
            <Tex>{`K_{A-B}`}</Tex>.»
          </p>
          <SequenceDiagram
            title="ap3.1 — Alice"
            messages={[
              {
                from: "alice",
                to: "bob",
                label: '"I am Alice", E_K(p)',
                note: "Trudy ser bare chifferen — hun kan ikke regne ut p",
              },
              { from: "bob", to: "alice", label: "OK" },
            ]}
          />
          <p className="text-sm text-muted-foreground mt-3 mb-2 leading-relaxed">
            Trudy klarer ikke å dekryptere uten nøkkelen. Men hun trenger heller ikke!
          </p>
          <SequenceDiagram
            title="ap3.1 — Trudy spiller av (replay/playback attack)"
            withTrudy
            messages={[
              {
                from: "alice",
                to: "bob",
                label: '"I am Alice", E_K(p)',
                note: "Trudy lagrer pakken",
              },
              {
                from: "trudy",
                to: "bob",
                label: '"I am Alice", E_K(p)',
                attack: true,
                note: "Senere: identisk pakke — Bob kan ikke skille",
              },
              { from: "bob", to: "trudy", label: "OK", note: "Bob tror han snakker med Alice" },
            ]}
            conclusion="Dette er en playback attack (også kalt replay). Bob ser den SAMME chifferen — uten en måte å si «når» Alice sendte den, ser det helt likt ut. Trudy har autentisert seg uten å ha hverken nøkkelen eller passordet."
          />
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <div>
              <strong>Lærdom:</strong> kryptering alene gir <em>konfidensialitet</em>, ikke{" "}
              <em>liveness</em>. Bob har ikke noe bevis for at meldingen er <em>fersk</em>.
              Vi trenger en mekanisme som tvinger Alice til å «svare på noe nytt».
            </div>
          </div>
        </section>

        <section id="ap40" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. ap4.0 — challenge med nonce</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Bob velger et tilfeldig tall <Tex>{`R`}</Tex> for hver sesjon — en{" "}
            <strong>nonce</strong>. Alice må kryptere akkurat <Tex>{`R`}</Tex> med den delte
            nøkkelen. Hun beviser dermed både at hun har nøkkelen <em>og</em> at hun er online{" "}
            <em>nå</em>.
          </p>
          <SequenceDiagram
            title="ap4.0 — Alice"
            messages={[
              { from: "alice", to: "bob", label: '"I am Alice"' },
              {
                from: "bob",
                to: "alice",
                label: "R (nonce, fersk)",
                note: "Bob trekker R fra et stort tallrom (typisk 128 bit)",
              },
              {
                from: "alice",
                to: "bob",
                label: "E_K(R)",
                note: "Alice krypterer eksakt R og sender tilbake",
              },
              { from: "bob", to: "alice", label: "OK", note: "Bob dekrypterer, sjekker = R" },
            ]}
          />
          <SequenceDiagram
            title="ap4.0 — Trudy kan ikke replaye"
            withTrudy
            messages={[
              {
                from: "trudy",
                to: "bob",
                label: '"I am Alice"',
                attack: true,
                note: "Trudy prøver",
              },
              {
                from: "bob",
                to: "trudy",
                label: "R'  (NY nonce, aldri sett før)",
                note: "Bob trekker en helt ny R for denne sesjonen",
              },
              {
                from: "trudy",
                to: "bob",
                label: "??? E_K(R')",
                attack: true,
                note: "Trudy kjenner ikke nøkkel K — kan ikke beregne E_K(R')",
              },
            ]}
            conclusion="Replay-pakken fra forrige sesjon hadde E_K(R_gammel) — den passer ikke til Bobs nye R'. Trudy må enten knekke krypteringen eller stjele nøkkelen. Det er den minimum-jobben vi kan kreve."
          />
        </section>

        <section id="nonce" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hva er egentlig en nonce?</h2>
          <div className="my-3 rounded-lg border-l-4 border-brand bg-brand/5 p-4 text-sm italic">
            «A nonce is a number that a protocol will use only once in a lifetime.»
            <span className="block not-italic text-xs text-muted-foreground mt-1">
              — Kurose &amp; Ross, s. 638
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            «Once» er det engelske ordet for én gang. En nonce er et <em>aldri-gjenbruk</em>
            -tall. Den behøver ikke være hemmelig — den må bare være <strong>uforutsigbar</strong>
            (typisk: trekt fra et stort, kryptografisk sikkert RNG) og <strong>fersk</strong>.
            Etter at protokollen har sett en nonce, kastes den.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Nonce dukker opp overalt
            </div>
            <ul className="text-sm space-y-1.5 list-disc pl-5">
              <li>
                <strong>TLS handshake:</strong> både klient og server bidrar med 32 bytes{" "}
                <code>Random</code> — direkte ap4.0-mønster.
              </li>
              <li>
                <strong>OAuth 2.0 state-parameter:</strong> motvirker CSRF; samme idé.
              </li>
              <li>
                <strong>JWT:</strong> <code>jti</code> (JWT ID) + sjekk «sett før?».
              </li>
              <li>
                <strong>WebAuthn / FIDO2:</strong> serveren utsteder en challenge; authenticator
                signerer.
              </li>
              <li>
                <strong>Kerberos:</strong> timestamps + nonces motvirker replay.
              </li>
              <li>
                <strong>HTTP Digest auth:</strong> serverens <code>nonce</code> + klientens{" "}
                <code>cnonce</code>.
              </li>
            </ul>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Oppsummering</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Versjon</th>
                  <th className="text-left font-semibold px-4 py-2">Beviset</th>
                  <th className="text-left font-semibold px-4 py-2">Trudys angrep</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ap1.0</td>
                  <td className="px-4 py-3">«Jeg sier det»</td>
                  <td className="px-4 py-3">Påstår å være Alice</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ap2.0</td>
                  <td className="px-4 py-3">IP-adresse</td>
                  <td className="px-4 py-3">IP-spoofing</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ap3.0</td>
                  <td className="px-4 py-3">Klartekst-passord</td>
                  <td className="px-4 py-3">Sniffer + gjenbruker</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ap3.1</td>
                  <td className="px-4 py-3">Kryptert passord</td>
                  <td className="px-4 py-3"><strong className="text-rose-600 dark:text-rose-400">Playback/replay</strong></td>
                </tr>
                <tr className="border-t border-border bg-brand/5">
                  <td className="px-4 py-3 font-mono text-brand">ap4.0</td>
                  <td className="px-4 py-3">E_K(nonce R)</td>
                  <td className="px-4 py-3">— (må knekke K)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            ap4.0 er fortsatt ikke perfekt — den løser ikke <em>nøkkeldistribusjon</em> (hvordan
            fikk Alice og Bob <Tex>{`K_{A-B}`}</Tex>?) eller man-in-the-middle på selve
            challenge-exchange. Det krever asymmetrisk krypto, sertifikater og Diffie-Hellman
            — TLS-handshake. Men ap4.0 er det fundamentale byggeblokken.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">DTE-2507-hub</Link>
              {" "}— alle nettverks-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "kryptografi" }} className="text-brand hover:underline">Kryptografi</Link>
              {" "}— symmetrisk vs asymmetrisk, nøkler.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-tls-handshake" }} className="text-brand hover:underline">TLS-handshake</Link>
              {" "}— ap4.0 i moderne drakt.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
