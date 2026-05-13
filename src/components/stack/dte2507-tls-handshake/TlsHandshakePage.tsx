import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { HandshakeDiagram } from "./HandshakeDiagram";

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
        </header>

        <section className="mb-10">
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Cipher suites</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              En cipher suite definerer pakka av algoritmer som brukes. Eksempel TLS 1.2:
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    │     │     │       │       │       │
    │     │     │       │       │       └── MAC / handshake-hash
    │     │     │       │       └────────── AEAD-modus
    │     │     │       └────────────────── symmetrisk kryptering (256-bit AES)
    │     │     └────────────────────────── separator
    │     └──────────────────────────────── autentisering (RSA-signatur fra sertifikat)
    └────────────────────────────────────── nøkkelutveksling (Elliptic Curve DH Ephemeral)`}</pre>
            <p className="text-xs text-muted-foreground mt-3">
              I TLS 1.3 ble dette forenklet: bare AEAD-cipher og hash igjen (DH/signatur valgt
              separat). Eksempel: <code className="font-mono">TLS_AES_256_GCM_SHA384</code>.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Klikk-gjennom handshake</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg TLS 1.2 eller 1.3, klikk en melding for å se hva som skjer og hvilken nøkkel som er i bruk.
          </p>
          <HandshakeDiagram />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Sertifikat-validering</h2>
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Hvor brukes symmetrisk vs asymmetrisk?</h2>
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

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. TLS 1.3 vs 1.2 — forskjellene</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <ul className="text-sm space-y-1.5 list-disc pl-5">
              <li><strong>1-RTT handshake</strong> i 1.3 (vs 2-RTT i 1.2). 0-RTT med PSK.</li>
              <li>Bare AEAD-cipher (GCM, ChaCha20-Poly1305). Ingen CBC/RC4.</li>
              <li>Forward secrecy obligatorisk — RSA-key-transport fjernet.</li>
              <li>Sertifikat sendes KRYPTERT (privacy).</li>
              <li>Renforhandling og kompresjon fjernet (lukker bl.a. CRIME/BREACH-angrep).</li>
            </ul>
                  <div className="mt-6">
          <Link
            to="/stack/$slug"
            params={{ slug: "dte-2507" }}
            className="text-brand hover:underline inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tilbake til DTE-2507-hub
          </Link>
        </div>
</div>
        </section>
      </article>
    </StackPageShell>
  );
}
