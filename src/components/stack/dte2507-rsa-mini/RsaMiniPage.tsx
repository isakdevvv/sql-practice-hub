import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RsaBuilder } from "./RsaBuilder";
import { RsaPlayground } from "./RsaPlayground";

const STEPS = [
  { title: "Hvorfor asymmetrisk?", anchor: "hvorfor" },
  { title: "Matematikken (KeyGen)", anchor: "keygen" },
  { title: "Tall-eksempel — krypter «HI»", anchor: "tall" },
  { title: "Interaktiv bygger", anchor: "bygger" },
  { title: "Ekte RSA-2048", anchor: "ekte-rsa" },
  { title: "RSA vs AES vs hash", anchor: "sammenligning" },
  { title: "Signering vs kryptering", anchor: "signering" },
  { title: "Kjente angrep", anchor: "angrep" },
];

export function RsaMiniPage() {
  return (
    <StackPageShell title="RSA — mini-versjon" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Asymmetrisk kryptografi
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            RSA — bygg en mini-versjon
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            RSA er det klassiske asymmetriske kryptosystemet. Hver bruker har et NØKKELPAR: en
            <strong> public key</strong> som alle ser, og en <strong>private key</strong> som
            bare eieren har. Ting kryptert med public-en kan BARE dekrypteres med private. Ting
            signert med private kan VERIFISERES av alle med public. Her bygger vi RSA fra null
            med tall som er små nok til å regne ut for hånd.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span> bruk{" "}
              <a href="#bygger" className="text-brand hover:underline">RSA-byggeren under</a>{" "}
              til å velge primtall og se ekte tall flyte gjennom enc/dec. Tren på{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgaver under
              «Kryptografi»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-rsa-mini" steps={STEPS} />

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor finnes asymmetrisk krypto?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Symmetrisk kryptografi (AES) er rask, men har et problem: du må allerede dele en
            nøkkel for å bruke det. RSA løser nøkkel-distribusjon: legg ut public-en din i åpent
            terreng — alle kan kryptere TIL deg uten å avtale noe på forhånd.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Symmetrisk — én delt nøkkel
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`Alice ──[K]── Bob

K må deles på forhånd
gjennom en sikker kanal
(eller du har ingen).`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Asymmetrisk — par per bruker
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`Alice (Pa, Sa)
Bob   (Pb, Sb)

Alice → Bob: krypter m. Pb
Bob ← Sb: dekrypterer.
Ingen forhåndsavtale.`}</pre>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Tips:</strong> public-nøkkelen er trygg å publisere
            fordi den bare lar deg LÅSE — ikke åpne. Tenk på det som et hengelås noen sender deg:
            du kan klikke det igjen rundt en pakke, men bare eieren har nøkkelen som åpner det.
          </div>
        </section>

        <section id="keygen" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Matematikken på én side</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`KEY GENERATION
1. Velg to store primtall p, q.
2. n = p · q                        (moduluset; del av public key)
3. φ(n) = (p−1)·(q−1)              (Eulers totient; HEMMELIG)
4. Velg e med 1 < e < φ(n)
   og gcd(e, φ(n)) = 1              (vanligvis e = 65537)
5. d = e^(-1) mod φ(n)              (utvidet Euklid)

PUBLIC KEY:  (n, e)
PRIVATE KEY: (n, d)

KRYPTERING:  c = m^e mod n           (m < n)
DEKRYPTERING: m = c^d mod n
SIGNERING:    s = m^d mod n
VERIFIKASJON: m == s^e mod n`}</pre>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Symbol</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Hva er det?</th>
                  <th className="text-left font-semibold px-4 py-2">Public eller hemmelig?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">p, q</td><td className="px-4 py-3">To store primtall</td><td className="px-4 py-3 text-muted-foreground">HEMMELIG. Hvis noen finner dem, faller hele sikkerheten.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">n</td><td className="px-4 py-3">p · q (moduluset)</td><td className="px-4 py-3 text-muted-foreground">PUBLIC — alle ser det, men ingen kan faktorisere det.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">φ(n)</td><td className="px-4 py-3">(p−1)(q−1)</td><td className="px-4 py-3 text-muted-foreground">HEMMELIG. Brukes bare i nøkkelgenerering.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">e</td><td className="px-4 py-3">Public exponent (ofte 65537)</td><td className="px-4 py-3 text-muted-foreground">PUBLIC — del av public key (n, e).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">d</td><td className="px-4 py-3">Private exponent (e⁻¹ mod φ)</td><td className="px-4 py-3 text-muted-foreground">HEMMELIG — del av private key (n, d).</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="tall" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Konkret tall-eksempel side om side</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Vi velger leketøy-primtall <code className="font-mono">p=11, q=13</code>. Det gir
            <code className="font-mono"> n=143, φ=120</code>. Velg <code className="font-mono">e=7</code>,
            da blir <code className="font-mono">d=103</code> (utvidet Euklid). Klartekst er
            tegnet «H» = ASCII 72. La oss krypter og dekryptere.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Kryptering m → c
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`m = 72            (klartekst)
e = 7   n = 143

c = m^e mod n
  = 72^7 mod 143
  = 10030613004288 mod 143
  = 19              ← cipher`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Dekryptering c → m
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`c = 19
d = 103   n = 143

m = c^d mod n
  = 19^103 mod 143
  = 72              ← tilbake til H

(Square-and-multiply gjør
 dette mulig uten 19^103
 som tall.)`}</pre>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Advarsel:</strong> i ekte RSA
            må <code className="font-mono">m &lt; n</code>. Med n=143 kan vi kryptere ett byte
            (max 127), ikke en hel melding. Derfor splittes lange meldinger i blokker — og i
            praksis brukes RSA bare til å bytte en symmetrisk AES-nøkkel.
          </div>
        </section>

        <section id="bygger" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Trinnvis bygger</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg små primtall, og se hele oppsettet med ekte tall. Krypter «HI» tegn for tegn.
          </p>
          <RsaBuilder />
          <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Samme regneoperasjon i Python
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Pythons innebygde pow tar (base, exp, mod) — kjernen i RSA:
p, q = 11, 13
n = p * q                # 143
phi = (p - 1) * (q - 1)  # 120
e = 7
d = pow(e, -1, phi)      # 103 (Python 3.8+ støtter modulær invers)

m = 72                   # 'H'
c = pow(m, e, n)         # 19
m_back = pow(c, d, n)    # 72
assert m == m_back`}</pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Kjør dette i{" "}
              <Link to="/python" className="text-brand hover:underline">Python-konsollen</Link>{" "}
              og bytt ut p og q med større primtall for å se hvor fort tallene vokser.
            </p>
          </div>
        </section>

        <section id="ekte-rsa" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Ekte RSA-2048 (produksjons-krypto)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Mini-versjonen over bruker p=11, q=13 — knust på en mikrosekund. Her gjør vi det
            samme, men med <strong>node-forge</strong> og 2048-bit nøkler: samme oppskrift
            som OpenSSL, bare i nettleseren din. Generer et nøkkelpar, krypter med OAEP-padding,
            signer en melding og verifiser signaturen.
          </p>
          <RsaPlayground />
        </section>

        <section id="sammenligning" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. RSA vs AES vs hash</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">RSA</th>
                  <th className="text-left font-semibold px-4 py-2">AES</th>
                  <th className="text-left font-semibold px-4 py-2">SHA-256 (hash)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Type</td><td className="px-4 py-3 text-muted-foreground">Asymmetrisk</td><td className="px-4 py-3 text-muted-foreground">Symmetrisk</td><td className="px-4 py-3 text-muted-foreground">Enveis</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Nøkler</td><td className="px-4 py-3 text-muted-foreground">Par (public + private)</td><td className="px-4 py-3 text-muted-foreground">Én delt</td><td className="px-4 py-3 text-muted-foreground">Ingen</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Hastighet</td><td className="px-4 py-3 text-muted-foreground">~0.1 ms enc / 3 ms dec</td><td className="px-4 py-3 text-muted-foreground">GB/s med HW</td><td className="px-4 py-3 text-muted-foreground">GB/s</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Nøkkellengde</td><td className="px-4 py-3 text-muted-foreground">2048–4096 bit</td><td className="px-4 py-3 text-muted-foreground">128 / 256 bit</td><td className="px-4 py-3 text-muted-foreground">256 bit output</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Reversibel?</td><td className="px-4 py-3 text-muted-foreground">Ja, med private</td><td className="px-4 py-3 text-muted-foreground">Ja, med nøkkel</td><td className="px-4 py-3 text-muted-foreground">NEI — enveis</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Brukes til</td><td className="px-4 py-3 text-muted-foreground">Nøkkelutveksling, signaturer</td><td className="px-4 py-3 text-muted-foreground">Selve dataen (TLS body, disk)</td><td className="px-4 py-3 text-muted-foreground">Integritet, passord-hash, HMAC</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="signering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Signering vs kryptering</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Operasjon</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Brukes til</th>
                  <th className="text-left font-semibold px-4 py-2">Hva skjer?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Kryptering</td><td className="px-4 py-3">Konfidensialitet</td><td className="px-4 py-3 text-muted-foreground">Avsender krypterer med mottakers PUBLIC. Bare mottaker (med sin private) kan dekryptere.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Signering</td><td className="px-4 py-3">Autentisering + integritet</td><td className="px-4 py-3 text-muted-foreground">Avsender signerer med SIN private. Hvem som helst kan verifisere med avsenders public. Beviser identitet + at innholdet ikke er endret.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>I praksis:</strong> man signerer ikke meldingen direkte — først hash, så
            signer hashen. Raskere og standardisert (RSA-PSS, ECDSA).
          </p>
        </section>

        <section id="angrep" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Kjente angrep på RSA</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Angrep</th>
                  <th className="text-left font-semibold px-4 py-2">Hva utnytter det?</th>
                  <th className="text-left font-semibold px-4 py-2">Forsvar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Faktorisering</td><td className="px-4 py-3 text-muted-foreground">For lite n (under 2048 bit), eller dårlige primtall (p og q nær hverandre).</td><td className="px-4 py-3 text-muted-foreground">Bruk &ge;2048 bit. Tilfeldige primtall, ikke nære.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Low-exponent</td><td className="px-4 py-3 text-muted-foreground">e=3 og kort melding m → m³ &lt; n, så c = m³ direkte. Kubrot gir m.</td><td className="px-4 py-3 text-muted-foreground">Bruk e=65537 + OAEP-padding (legger random til m).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Padding oracle (Bleichenbacher)</td><td className="px-4 py-3 text-muted-foreground">Server lekker «padding ok / padding feil». Angriper sender millioner av ciphers og lærer.</td><td className="px-4 py-3 text-muted-foreground">Konstant-tids respons. Bruk OAEP, ikke PKCS#1 v1.5.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Timing-angrep</td><td className="px-4 py-3 text-muted-foreground">Måler hvor lang tid en dekryptering tar — kan avsløre bits av d.</td><td className="px-4 py-3 text-muted-foreground">Blinding: krypter et tilfeldig r først, dekrypter (r·c), del på r.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Shors algoritme (kvante)</td><td className="px-4 py-3 text-muted-foreground">Kvantedatamaskin kan faktorisere i polynomisk tid.</td><td className="px-4 py-3 text-muted-foreground">Post-kvante: Kyber, Dilithium (NIST 2024).</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Eksamen-felle:</strong>{" "}
            blank RSA («textbook RSA») er aldri sikker. Sann RSA inkluderer ALLTID padding
            (OAEP for enc, PSS for sign). Hvis et oppgave-svar krypterer rett uten padding,
            er det per definisjon en sårbarhet.
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2507" }} className="text-brand hover:underline">
                DTE-2507-hub
              </Link>
              {" "}— alle nettverks- og sikkerhets-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-tls-handshake" }} className="text-brand hover:underline">
                TLS-handshake
              </Link>
              {" "}— se hvor RSA brukes i ekte protokoller.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Kryptografi» — pugg matte og angrep.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>sikkerhet</em>.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
