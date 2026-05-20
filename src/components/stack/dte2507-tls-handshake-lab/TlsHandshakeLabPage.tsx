import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  AsymmetricKeyIcon,
  KdfIcon,
  TranscriptHashIcon,
} from "@/components/stack/sikkerhet/securityIcons";
import { TlsHandshakeAnimator } from "./TlsHandshakeAnimator";
import { CertChainValidator } from "./CertChainValidator";
import { MitmAttackSimulator } from "./MitmAttackSimulator";
import { CipherSuiteCompare } from "./CipherSuiteCompare";

const STEPS = [
  { title: "TLS 1.3 handshake — steg for steg", anchor: "handshake" },
  { title: "Sertifikatkjede-validering", anchor: "cert-chain" },
  { title: "MITM-angreps-simulator", anchor: "mitm" },
  { title: "Cipher suites — anbefalt vs knust", anchor: "ciphers" },
  { title: "Hva du bør huske", anchor: "oppsummering" },
];

export function TlsHandshakeLabPage() {
  return (
    <StackPageShell title="TLS-handshake-lab" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · TLS-handshake-lab
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            TLS handshake — steg-for-steg animator med MITM-modus
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Interaktiv lab for TLS 1.3 (det moderne — 1-RTT, AEAD-only, ECDHE-only). Spill av
            handshaken byte for byte, valider sertifikatkjeden, spill MITM mellom klient og
            server, og sammenlign cipher suites. Ingen flashcards — bare fire sandkasser hvor du
            ser hva som skjer når du skrur på knappene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Tilknyttet:</span>{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-tls-handshake" }}
                className="text-brand hover:underline"
              >
                TLS 1.2 vs 1.3-oversikten
              </Link>{" "}
              forklarer det historiske teppet. Denne siden fokuserer på det interaktive på TLS 1.3
              alene.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-tls-handshake-lab" steps={STEPS} />

        <section id="handshake" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. TLS 1.3 handshake — steg for steg</h2>
          <p className="text-sm text-muted-foreground mb-3">
            TLS 1.3 oppnår en kryptert kanal i én RTT. Klienten sender allerede sitt
            ECDHE-key-share i ClientHello — server kan svare med sitt key-share, sertifikat,
            CertificateVerify og Finished i én tur. Etter ServerHello er all videre kommunikasjon
            kryptert.
          </p>
          <TlsHandshakeAnimator />
          <div className="mt-4">
            <VisualDefs
              title="Tre nøkkelbegreper å feste seg ved"
              items={[
                {
                  term: "ECDHE",
                  icon: <AsymmetricKeyIcon />,
                  body: (
                    <>
                      Elliptic Curve Diffie-Hellman Ephemeral. Klient (c) og server (s) genererer nye nøkler for hver sesjon. shared_secret = ECDH(c, g^s) = ECDH(s, g^c), men sendes <em>aldri</em>.
                    </>
                  ),
                },
                {
                  term: "HKDF",
                  icon: <KdfIcon />,
                  body: (
                    <>
                      HMAC-based KDF. Fra ett shared_secret avledes flere spesialnøkler: handshake-trafikk, finished, applikasjons-trafikk, resumption.
                    </>
                  ),
                },
                {
                  term: "Transcript hash",
                  icon: <TranscriptHashIcon />,
                  body: (
                    <>
                      Løpende SHA-hash av alle handshake-meldinger. Brukes i CertificateVerify (signaturen binder hele dialogen) og i Finished (begge sider beviser at de så samme handshake).
                    </>
                  ),
                },
              ]}
            />
          </div>
        </section>

        <section id="cert-chain" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Sertifikatkjede-validering</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvordan vet klienten at den public-key som signerte CertificateVerify faktisk tilhører
            shop.example.no? Svaret er en kjede av X.509-sertifikater som ender i en trusted
            root i klientens trust store. Hver lenke i kjeden valideres for seg.
          </p>
          <CertChainValidator />
        </section>

        <section id="mitm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. MITM-angreps-simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Du er angriperen. Velg passive sniffing, aktiv MITM med eget cert, eller
            downgrade-angrep. Skru på/av forsvarsmekanismer og se hvilke angrep som lykkes.
            Hovedinnsikten: TLS 1.3 selv er ikke knust — angrepsoverflaten er trust-modellen
            (CA-er, pinning, CT).
          </p>
          <MitmAttackSimulator />
        </section>

        <section id="ciphers" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Cipher suites — anbefalt, svak, knust</h2>
          <p className="text-sm text-muted-foreground mb-3">
            TLS 1.3 har bare fem cipher suites totalt. Alle er AEAD (kryptering + integritet i
            ett primitiv). De gamle RSA-key-transport-suitene fra TLS 1.2 ble fjernet fordi de
            ikke ga forward secrecy.
          </p>
          <CipherSuiteCompare />
        </section>

        <section id="oppsummering" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Hva du bør huske</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>
                <strong>TLS 1.3 = 1-RTT.</strong> Klient sender ECDHE-key-share i ClientHello.
                Server svarer med cert + Finished i én tur. Klient kan sende app-data sammen med
                sin Finished.
              </li>
              <li>
                <strong>Forward secrecy er obligatorisk.</strong> Bare ECDHE-cipher-suites. Hvis
                server-private-key lekker senere, er gamle opptak fortsatt verdiløse.
              </li>
              <li>
                <strong>AEAD-only.</strong> AES-GCM eller ChaCha20-Poly1305. Ingen separat MAC.
                Ingen CBC-mode-padding-orakler.
              </li>
              <li>
                <strong>Identitet via CA-kjeden.</strong> 6 sjekkpunkter: kjede komplett, root i
                trust-store, signaturer verifisert, gyldighetstid, SAN matcher, ikke revokert.
              </li>
              <li>
                <strong>Forsvar i dybden mot MITM:</strong> ECDHE stopper passiv, cert-validering
                stopper enkel aktiv, pinning + CT stopper rogue-CA-aktiv, FALLBACK_SCSV stopper
                downgrade.
              </li>
              <li>
                <strong>Standardisering = sikkerhet.</strong> TLS 1.3 fjernet 90 % av knappene
                i 1.2. Alle valg som finnes igjen er anti-skuddsikre defaults.
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesning</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-tls-handshake" }}
                className="text-brand hover:underline"
              >
                TLS 1.2 vs 1.3-oversikt
              </Link>{" "}
              — historisk kontekst og kjente angrep.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-rsa-mini" }}
                className="text-brand hover:underline"
              >
                RSA-mini
              </Link>{" "}
              — selve asymmetri-primitvet bak signaturer.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "kryptografi" }}
                className="text-brand hover:underline"
              >
                Kryptografi-progresjonen
              </Link>{" "}
              — Caesar → DH → AES → RSA → SHA.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2507-cbc-iv" }}
                className="text-brand hover:underline"
              >
                CBC og IV-trøbbel
              </Link>{" "}
              — hvorfor TLS 1.3 droppet CBC-mode helt.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
