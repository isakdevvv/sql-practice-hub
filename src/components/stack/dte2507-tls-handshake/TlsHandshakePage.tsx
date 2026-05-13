import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { HandshakeDiagram } from "./HandshakeDiagram";
import { Mermaid } from "@/components/Mermaid";

const TLS12_SEQUENCE = `sequenceDiagram
  autonumber
  participant K as Klient
  participant S as Server
  K->>S: ClientHello (ciphersuites, random)
  S->>K: ServerHello + Certificate + ServerKeyExchange
  S->>K: ServerHelloDone
  K->>S: ClientKeyExchange (krypter premaster med pub-key)
  K->>S: ChangeCipherSpec + Finished (kryptert)
  S->>K: ChangeCipherSpec + Finished (kryptert)
  Note over K,S: Application Data (kryptert med session keys)`;

const STEPS = [
  { title: "Hva må handshake-en oppnå?", anchor: "mal" },
  { title: "Steg-for-steg TLS 1.2", anchor: "steg" },
  { title: "TLS 1.2 vs TLS 1.3", anchor: "12-vs-13" },
  { title: "Cipher suite-anatomi", anchor: "cipher" },
  { title: "Klikk-gjennom handshake", anchor: "diagram" },
  { title: "Sertifikat-validering", anchor: "cert" },
  { title: "Sym vs asym i TLS", anchor: "sym-asym" },
  { title: "Kjente angrep", anchor: "angrep" },
];

export function TlsHandshakePage() {
  return (
    <StackPageShell title="TLS-handshake" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · TLS i dybden
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            TLS-handshake — fra https:// til kryptert kanal
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Når du skriver <code className="font-mono">https://</code> i nettleseren skjer det en
            handshake mellom klient og server. Målet: etablere felles symmetrisk nøkkel + bekrefte
            at serveren er den den utgir seg for. Asymmetrisk krypto for oppsettet, symmetrisk
            for selve dataen.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#diagram" className="text-brand hover:underline">klikk-gjennom-diagrammet</a>{" "}
              + drag under{" "}
              <Link to="/drag" className="text-brand hover:underline">«TLS-handshake»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-tls-handshake" steps={STEPS} />

        <section id="mal" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva må handshake-en oppnå?</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>
                <strong>Konfidensialitet</strong> — ingen kan lese trafikken (symmetrisk kryptering, f.eks. AES-GCM).
              </li>
              <li>
                <strong>Integritet</strong> — ingen kan endre trafikken uoppdaget (MAC eller AEAD).
              </li>
              <li>
                <strong>Autentisering</strong> — serveren er virkelig den den utgir seg for å være (X.509-sertifikat signert av CA).
              </li>
              <li>
                <strong>Forward secrecy</strong> — at en lekkasje av server-nøkkelen IKKE skal gjøre at man kan dekryptere gammel trafikk. Krever ephemerale DH-nøkler.
              </li>
            </ul>
          </div>
        </section>

        <section id="steg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. TLS 1.2 handshake steg for steg</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klassisk full handshake. Hver melding bærer et formål — og en serie state-skifter
            som ender med en kryptert kanal.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-12">#</th>
                  <th className="text-left font-semibold px-3 py-2 w-40">Melding</th>
                  <th className="text-left font-semibold px-3 py-2 w-20">Retning</th>
                  <th className="text-left font-semibold px-3 py-2">Innhold + formål</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">1</td><td className="px-3 py-2 font-mono">ClientHello</td><td className="px-3 py-2 font-mono">C → S</td><td className="px-3 py-2 text-muted-foreground">Klientens TLS-versjon, random (32 byte), liste over støttede cipher suites, SNI (hvilket domene).</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">2</td><td className="px-3 py-2 font-mono">ServerHello</td><td className="px-3 py-2 font-mono">S → C</td><td className="px-3 py-2 text-muted-foreground">Server velger versjon + cipher suite + sender sin random.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">3</td><td className="px-3 py-2 font-mono">Certificate</td><td className="px-3 py-2 font-mono">S → C</td><td className="px-3 py-2 text-muted-foreground">X.509-kjede. Klient verifiserer at root-CA er i trust store, kjeden er gyldig, SAN matcher domene.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">4</td><td className="px-3 py-2 font-mono">ServerKeyExchange</td><td className="px-3 py-2 font-mono">S → C</td><td className="px-3 py-2 text-muted-foreground">Server sender sin DH/ECDHE-public + signatur (med private RSA/ECDSA fra cert). Beviser identitet.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">5</td><td className="px-3 py-2 font-mono">ServerHelloDone</td><td className="px-3 py-2 font-mono">S → C</td><td className="px-3 py-2 text-muted-foreground">«Jeg er ferdig — over til deg.»</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">6</td><td className="px-3 py-2 font-mono">ClientKeyExchange</td><td className="px-3 py-2 font-mono">C → S</td><td className="px-3 py-2 text-muted-foreground">Klient sender sin DH-public. Begge regner nå ut shared secret. HKDF → master secret → session keys.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">7</td><td className="px-3 py-2 font-mono">ChangeCipherSpec</td><td className="px-3 py-2 font-mono">C → S</td><td className="px-3 py-2 text-muted-foreground">«Fra nå av krypterer jeg med session key.» Egen liten melding i klartekst.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">8</td><td className="px-3 py-2 font-mono">Finished</td><td className="px-3 py-2 font-mono">C → S</td><td className="px-3 py-2 text-muted-foreground">Hash av hele handshaken hittil, kryptert. Hindrer at noen tukler med tidligere meldinger.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">9</td><td className="px-3 py-2 font-mono">ChangeCipherSpec</td><td className="px-3 py-2 font-mono">S → C</td><td className="px-3 py-2 text-muted-foreground">Server gjør samme bryter.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">10</td><td className="px-3 py-2 font-mono">Finished</td><td className="px-3 py-2 font-mono">S → C</td><td className="px-3 py-2 text-muted-foreground">Server hashes hele handshaken, sender kryptert. Begge enige om at ingenting er endret.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">11</td><td className="px-3 py-2 font-mono">Application data</td><td className="px-3 py-2 font-mono">↔</td><td className="px-3 py-2 text-muted-foreground">Vanlig HTTPS — alt kryptert med AES-GCM (eller annen AEAD).</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Totalt 2 RTTs i 1.2 (2 fram-og-tilbake-runder) før første HTTP-byte kan sendes.
          </p>
          <div className="mt-5 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
              Sekvensdiagram — TLS 1.2
            </div>
            <Mermaid
              chart={TLS12_SEQUENCE}
              ariaLabel="Sekvensdiagram: TLS 1.2 handshake mellom klient og server"
            />
          </div>
        </section>

        <section id="12-vs-13" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. TLS 1.2 vs TLS 1.3 side om side</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                TLS 1.2 — 2 RTTs, 10+ meldinger
              </div>
              <pre className="font-mono text-[11px] whitespace-pre leading-tight">{`C  ClientHello          ──→
                       ←──  ServerHello
                       ←──  Certificate
                       ←──  ServerKeyExchange
                       ←──  ServerHelloDone
C  ClientKeyExchange   ──→
C  ChangeCipherSpec    ──→
C  Finished            ──→
                       ←──  ChangeCipherSpec
                       ←──  Finished
C  HTTP request        ──→`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                TLS 1.3 — 1 RTT, 4 meldinger
              </div>
              <pre className="font-mono text-[11px] whitespace-pre leading-tight">{`C  ClientHello          ──→
   + key_share
                       ←──  ServerHello
                       ←──  {Certificate}     ←kryptert
                       ←──  {Finished}        ←kryptert
C  {Finished}          ──→  ←kryptert
C  HTTP request        ──→  ←kryptert

(0-RTT mulig med PSK)`}</pre>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border mt-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Hva skjedde i 1.3?</th>
                  <th className="text-left font-semibold px-4 py-2">Forskjell</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">1-RTT default</td><td className="px-4 py-3 text-muted-foreground">Klient gjetter cipher og sender key_share allerede i ClientHello.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">0-RTT (PSK)</td><td className="px-4 py-3 text-muted-foreground">Returbesøk kan sende data sammen med ClientHello — null nye runder. Sårbar for replay.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Bare AEAD-cipher</td><td className="px-4 py-3 text-muted-foreground">GCM eller ChaCha20-Poly1305. CBC/RC4/MD5 fjernet helt.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Forward secrecy obligatorisk</td><td className="px-4 py-3 text-muted-foreground">RSA-key-transport fjernet. Bare (EC)DHE.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Sertifikat kryptert</td><td className="px-4 py-3 text-muted-foreground">Server-cert sendes etter ServerHello — inni krypteringen. Mer privacy.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Ingen kompresjon</td><td className="px-4 py-3 text-muted-foreground">Stenger CRIME-angrepet permanent.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="cipher" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Cipher suite — del for del</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Eksempel TLS 1.2: <code className="font-mono">TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384</code>
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    │     │     │       │       │       │
    │     │     │       │       │       └── MAC / handshake-hash
    │     │     │       │       └────────── AEAD-modus
    │     │     │       └────────────────── symmetrisk kryptering (256-bit AES)
    │     │     └────────────────────────── separator
    │     └──────────────────────────────── autentisering (RSA-signatur fra sertifikat)
    └────────────────────────────────────── nøkkelutveksling (Elliptic Curve DH Ephemeral)`}</pre>
            <div className="overflow-hidden rounded-lg border border-border mt-4">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left font-semibold px-3 py-2 w-32">Del</th>
                    <th className="text-left font-semibold px-3 py-2 w-32">Verdi</th>
                    <th className="text-left font-semibold px-3 py-2">Rolle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Key exchange</td><td className="px-3 py-2 font-mono">ECDHE</td><td className="px-3 py-2 text-muted-foreground">Ephemerisk Diffie-Hellman over elliptiske kurver. Forward secrecy.</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Authentication</td><td className="px-3 py-2 font-mono">RSA</td><td className="px-3 py-2 text-muted-foreground">Server signerer DH-public med RSA-nøkkelen fra sertifikatet.</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Symmetric cipher</td><td className="px-3 py-2 font-mono">AES-256</td><td className="px-3 py-2 text-muted-foreground">Krypterer selve dataen. 256-bit nøkkel.</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Mode</td><td className="px-3 py-2 font-mono">GCM</td><td className="px-3 py-2 text-muted-foreground">Galois/Counter Mode — gir både konfidensialitet OG integritet (AEAD).</td></tr>
                  <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Hash</td><td className="px-3 py-2 font-mono">SHA384</td><td className="px-3 py-2 text-muted-foreground">Brukes i HKDF (avled nøkler) og handshake-transcript.</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              I TLS 1.3 ble dette forenklet: bare AEAD-cipher og hash igjen (DH/signatur valgt
              separat). Eksempel: <code className="font-mono">TLS_AES_256_GCM_SHA384</code>.
            </p>
          </div>
        </section>

        <section id="diagram" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Klikk-gjennom handshake</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg TLS 1.2 eller 1.3, klikk en melding for å se hva som skjer og hvilken nøkkel som er i bruk.
          </p>
          <HandshakeDiagram />
        </section>

        <section id="cert" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Sertifikat-validering</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Klienten må svare på: «kan jeg stole på denne pubkey som tilhører
              <code className="font-mono"> shop.example.no</code>?» Stegene:
            </p>
            <ol className="text-sm space-y-1.5 list-decimal pl-5">
              <li>Bygg signaturkjeden: server-cert er signert av en intermediate, som er signert av en root.</li>
              <li>Verifiser at root-CA finnes i klientens trust store (Mozilla/system).</li>
              <li>Sjekk hver signatur i kjeden (asymmetrisk verifikasjon).</li>
              <li>Sjekk at sertifikatet ikke har utløpt (<code className="font-mono">notAfter</code>).</li>
              <li>Sjekk at common-name eller SAN (Subject Alt Name) matcher domenet.</li>
              <li>Sjekk OCSP eller CRL — er sertifikatet trukket tilbake?</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-3">
              Hvis ett av stegene feiler, viser nettleseren stort rødt skjerm (NET::ERR_CERT_*).
            </p>
          </div>
        </section>

        <section id="sym-asym" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hvor brukes symmetrisk vs asymmetrisk?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Operasjon</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Krypto</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Etablere shared secret</td><td className="px-4 py-3 font-mono">(EC)DHE</td><td className="px-4 py-3 text-muted-foreground">Asymmetrisk — to parter som ikke har møttes må klare å bli enige uten å avsløre noe.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Autentisere serveren</td><td className="px-4 py-3 font-mono">RSA/ECDSA-signatur</td><td className="px-4 py-3 text-muted-foreground">Asymmetrisk — serveren beviser at den eier private-nøkkelen som matcher cert.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Kryptere data</td><td className="px-4 py-3 font-mono">AES-GCM</td><td className="px-4 py-3 text-muted-foreground">Symmetrisk — RSA ville vært 1000× tregere. Nøkkel allerede etablert i handshake.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Integritet av pakker</td><td className="px-4 py-3 font-mono">HMAC eller AEAD</td><td className="px-4 py-3 text-muted-foreground">Symmetrisk — samme nøkkel kan generere og verifisere MAC.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Avlede nøkler</td><td className="px-4 py-3 font-mono">HKDF (basert på SHA)</td><td className="px-4 py-3 text-muted-foreground">KDF — fra ett shared secret avledes 4-6 forskjellige nøkler (enc, mac, IV) for hver retning.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="angrep" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. Kjente angrep på TLS</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Angrep</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Versjon</th>
                  <th className="text-left font-semibold px-4 py-2">Idé + forsvar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Downgrade</td><td className="px-4 py-3 text-muted-foreground">SSL3 / TLS 1.0</td><td className="px-4 py-3 text-muted-foreground">MITM tvinger ned til svak versjon. Forsvar: skru av gamle versjoner på serveren.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">POODLE</td><td className="px-4 py-3 text-muted-foreground">SSL3 CBC</td><td className="px-4 py-3 text-muted-foreground">Padding-oracle i SSL3-CBC. Forsvar: SSL3 forbudt.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">BEAST</td><td className="px-4 py-3 text-muted-foreground">TLS 1.0 CBC</td><td className="px-4 py-3 text-muted-foreground">CBC IV-prediksjon. Forsvar: TLS 1.1+ med per-record IV.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">CRIME</td><td className="px-4 py-3 text-muted-foreground">TLS 1.0–1.2</td><td className="px-4 py-3 text-muted-foreground">Kompresjon lekker hemmeligheter via lengde. Forsvar: skru av TLS-kompresjon. TLS 1.3 fjernet det helt.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Heartbleed</td><td className="px-4 py-3 text-muted-foreground">OpenSSL 1.0.1</td><td className="px-4 py-3 text-muted-foreground">Buffer over-read i heartbeat — lekket private nøkler. Forsvar: patch.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Logjam / Weak DH</td><td className="px-4 py-3 text-muted-foreground">TLS 1.0–1.2</td><td className="px-4 py-3 text-muted-foreground">512-bit DH primer kunne pre-beregnes. Forsvar: ≥2048-bit DH eller ECDHE.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Padding oracle (Bleichenbacher)</td><td className="px-4 py-3 text-muted-foreground">TLS 1.0–1.2 m. RSA-key-transport</td><td className="px-4 py-3 text-muted-foreground">Server lekker «padding ok». Forsvar: bruk (EC)DHE — TLS 1.3 fjernet RSA-transport.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Eksamen-felle:</strong>{" "}
            navnene høres dramatiske ut, men mønsteret er det samme: TLS 1.0–1.2 hadde valgfri
            crypto + valgfri kompresjon + valgfri RSA-transport = mange knapper å skru på feil.
            TLS 1.3 fjernet knappene. Standardisering = sikkerhet.
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-rsa-mini" }} className="text-brand hover:underline">RSA-mini</Link>
              {" "}— hvordan asymmetrisk-delen i handshaken faktisk fungerer.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «TLS-handshake».
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
