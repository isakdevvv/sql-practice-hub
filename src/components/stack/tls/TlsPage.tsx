import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { CertificateInspector } from "./CertificateInspector";

const STEPS = [
  { title: "Hva TLS faktisk gir deg", anchor: "hva" },
  { title: "ClientHello", anchor: "client-hello" },
  { title: "ServerHello + sertifikat", anchor: "server-hello" },
  { title: "Nøkkel-utveksling", anchor: "key-exchange" },
  { title: "Finished + symmetrisk fase", anchor: "finished" },
  { title: "TLS 1.2 vs 1.3", anchor: "versjoner" },
  { title: "Sertifikatvalidering", anchor: "validering" },
  { title: "Inspiser et ekte sertifikat", anchor: "sertifikat-inspeksjon" },
];

export function TlsPage() {
  return (
    <StackPageShell title="TLS-håndtrykk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Sikker transport
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            TLS-håndtrykk — fra klikk til kryptert kanal
          </h1>
          <p className="mt-3 text-muted-foreground">
            Når du klikker på <code>https://nettbank.no</code> bygger nettleseren en
            sikker kanal i flere steg. Hvert steg bruker en av krypto-byggesteinene fra
            forrige kurs. Lær hva som faktisk skjer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgavene</Link>{" "}
              under «TLS» — sortér håndtrykk-stegene, quiz om TLS 1.2 vs 1.3,
              sertifikatvalidering.
            </div>
          </div>
        </div>

        <CourseOutline courseId="tls" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva TLS faktisk gir deg</h2>
          <p className="text-sm text-muted-foreground mb-4">
            TLS (Transport Layer Security, etterfølgeren til SSL) gir tre garantier
            mellom klient og server:
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Konfidensialitet
              </div>
              <p className="text-sm text-foreground">
                Bytene mellom dere er kryptert. Avlyttere ser bare ubrukelig støy.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Integritet
              </div>
              <p className="text-sm text-foreground">
                Ingen kan endre bytene underveis uten at det oppdages.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Autentisitet (server)
              </div>
              <p className="text-sm text-foreground">
                Du vet at du faktisk snakker med <code>nettbank.no</code>, ikke en angriper.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hva TLS IKKE gjør:</strong> beviser hvem KLIENTEN er (med mindre du
            bruker client certificates — sjeldent), beskytter mot serveren selv, eller
            skjuler at du snakker med nettbank.no (TLS Server Name Indication lekker).
          </p>
        </section>

        <section id="client-hello" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. ClientHello</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Etter TCP er etablert sender klienten ClientHello — første TLS-melding.
            Innholdet sier «her er hva jeg støtter, velg du».
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ClientHello inneholder:
  - TLS-versjoner som støttes (1.2, 1.3)
  - Cipher suites i prioritert rekkefølge:
      TLS_AES_256_GCM_SHA384
      TLS_CHACHA20_POLY1305_SHA256
      ...
  - Random tall (32 byte) — brukes til nøkkel-utledning
  - Server Name Indication (SNI): "nettbank.no"
      └─ Trengs fordi én IP kan hoste mange domener
  - Supported extensions: ALPN (HTTP/2 vs HTTP/1.1), ECPoint formats, ...`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>SNI lekker</strong> i klartekst i TLS 1.2/1.3 — en avlytter ser
            hvilket domene du besøker. ECH (Encrypted ClientHello) løser dette, ikke i
            full bruk ennå.
          </p>
        </section>

        <section id="server-hello" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. ServerHello + sertifikat</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Serveren svarer med sitt valg av versjon og cipher, sitt eget random-tall,
            og sertifikatet sitt.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ServerHello inneholder:
  - Valgt versjon:       TLS 1.3
  - Valgt cipher suite:  TLS_AES_256_GCM_SHA384
  - Server random:       <32 byte>
  - Server certificate:  X.509-sertifikat med public key
      └─ Signert av en CA klienten stoler på
  - Server signature:    bevis på at serveren har private key
      (i TLS 1.3 signerer den hele håndtrykket så langt)`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Klienten verifiserer nå sertifikatkjeden: er signaturen gyldig? Stoler vi på
            CA-en? Matcher CN/SAN med domenet? Er sertifikatet utløpt eller tilbakekalt?
          </p>
        </section>

        <section id="key-exchange" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Nøkkel-utveksling</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Begge sider må ende opp med samme symmetriske nøkkel uten å sende den i
            klartekst. Moderne TLS (1.3) bruker <strong>Diffie-Hellman over elliptiske
            kurver (ECDHE)</strong>.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Forenklet ECDHE:

  Klient                                Server
    │                                     │
    │ ── velger privat a, sender g^a ──►  │
    │                                     │
    │ ◄── velger privat b, sender g^b ─── │
    │                                     │
    │  Begge regner ut (g^a)^b = (g^b)^a  │
    │  → samme shared secret              │
    │                                     │
    │  HKDF(shared secret, randoms) →     │
    │  symmetriske session keys           │`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Perfect Forward Secrecy:</strong> selv hvis serverens private nøkkel
            lekker SENERE, kan ikke gamle session-er dekrypteres — fordi g^a og g^b ble
            kastet etter session-en.
          </p>
        </section>

        <section id="finished" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Finished + symmetrisk fase</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Begge sider sender en «Finished»-melding kryptert med de nye session-nøklene.
            Dette beviser at begge sider kom frem til samme nøkkel og at hele
            håndtrykket var integritets-beskyttet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Klient                              Server
  │                                    │
  │ ── Finished (kryptert) ──────────► │
  │                                    │
  │ ◄── Finished (kryptert) ────────── │
  │                                    │
  │     Tunnel opp og kjører!          │
  │                                    │
  │ ── HTTP GET (kryptert) ─────────► │
  │ ◄── HTTP 200 + HTML (kryptert) ─── │`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Fra dette punktet er ALL trafikk kryptert med symmetrisk algoritme (AES eller
            ChaCha20) — raskt og effektivt. Asymmetrisk krypto er KUN brukt til oppsett.
          </p>
        </section>

        <section id="versjoner" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. TLS 1.2 vs 1.3</h2>
          <p className="text-sm text-muted-foreground mb-4">
            TLS 1.3 (2018) er en MAJOR redesign — enklere, raskere, sikrere.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">TLS 1.2</th>
                  <th className="text-left font-semibold px-4 py-2">TLS 1.3</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Round trips før data</td><td className="px-4 py-3">2 RTT</td><td className="px-4 py-3 text-success">1 RTT (eller 0 RTT med session resumption)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Cipher suites</td><td className="px-4 py-3">37+ til valg</td><td className="px-4 py-3 text-success">5 — alle moderne</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">PFS (forward secrecy)</td><td className="px-4 py-3">Valgfritt</td><td className="px-4 py-3 text-success">Påkrevd</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Statiske RSA-nøkkel-utveksling</td><td className="px-4 py-3">Støttet</td><td className="px-4 py-3 text-success">Fjernet (utrygt)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">Krypterer sertifikatet</td><td className="px-4 py-3">Nei</td><td className="px-4 py-3 text-success">Ja</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-medium">SHA-1, RC4, MD5</td><td className="px-4 py-3">Lov</td><td className="px-4 py-3 text-success">Fjernet</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="validering" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Sertifikatvalidering — hva nettleseren faktisk sjekker</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et sertifikat kan være «teknisk gyldig» (signatur stemmer) og likevel ikke
            akseptert. Nettleseren sjekker:
          </p>
          <ol className="space-y-2">
            {[
              "Signaturen er gyldig — verifiseres med CA-ens public key.",
              "Sertifikatkjeden går opp til en root-CA i nettleserens trust store.",
              "Dato er gyldig — ikke utløpt, ikke gyldig fra fremtiden.",
              "Domenet matcher — CN eller SAN inneholder www.nettbank.no.",
              "Sertifikatet er ikke tilbakekalt (CRL eller OCSP).",
              "Nøkkel-bruk-extension stemmer (digitalSignature, keyEncipherment).",
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">
            Hvis en av sjekkene feiler får du «Your connection is not private»-skjermen
            i Chrome. ALDRI klikk «Proceed anyway» på en bank-side.
          </p>
        </section>

        <section id="sertifikat-inspeksjon" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Inspiser et ekte sertifikat</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Et X.509-sertifikat er bare en ASN.1-struktur kodet i DER, ofte base64-pakket
            i PEM. Vi parser det med <code className="font-mono">node-forge</code> og viser
            innholdet — samme felt som <code className="font-mono">openssl x509 -text</code>{" "}
            i terminalen gir.
          </p>
          <CertificateInspector />
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              : sortér håndtrykk-stegene, quiz om versjon-forskjeller.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "nettverkssikkerhet" }} className="text-brand hover:underline">
                Nettverkssikkerhet
              </Link>
              : brannmur, IDS, og angrep mot infrastruktur.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
