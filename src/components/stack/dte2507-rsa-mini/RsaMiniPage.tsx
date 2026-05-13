import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { RsaBuilder } from "./RsaBuilder";

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
            RSA er den klassiske asymmetriske kryptosystemet. Hver bruker har et NØKKELPAR: en
            public key som alle ser, og en private key som bare eieren har. Ting kryptert med
            public-en kan BARE dekrypteres med private. Ting signert med private kan VERIFISERES av
            alle med public.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Matematikken på én side</h2>
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
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Hvorfor er RSA sikkert?</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Sikkerheten hviler på faktorising-problemet: gitt et stort tall n = p·q, er det
              ekstremt kostbart å finne p og q. Uten p og q kan man ikke regne ut φ(n), og uten
              φ(n) kan man ikke finne d fra e.
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
              <li>For ekte sikkerhet bruker man n med 2048–4096 bits (614+ desimaltall).</li>
              <li>Beste kjente faktorisering: GNFS — sub-eksponentiell tid.</li>
              <li>Shors algoritme (kvante-datamaskin) løser dette i polynomisk tid. Derfor jakter
                  vi nå på post-kvante alternativer (Kyber, Dilithium).</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Trinnvis bygger</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Velg små primtall, og se hele oppsettet med ekte tall. Krypter «HI» tegn for tegn.
          </p>
          <RsaBuilder />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Signering vs kryptering</h2>
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
            signer hashen. Raskere og standardisert.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. Hvorfor er RSA tregt?</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <p className="text-muted-foreground">
              RSA-operasjoner er ~1000× tregere enn symmetriske som AES. Derfor brukes RSA bare
              til å etablere en symmetrisk nøkkel (hybrid kryptografi) — så kjører selve kommunikasjonen
              med AES. Det er nøyaktig hva TLS-handshake gjør.
            </p>
            <ul className="mt-3 space-y-1 list-disc pl-5 text-muted-foreground">
              <li>RSA-2048 enc: ~0.1 ms. RSA-2048 dec: ~3 ms.</li>
              <li>AES-256 enc/dec: ~3 GB/s med HW-instruksjoner.</li>
              <li>Konklusjon: aldri krypter store data direkte med RSA. Bruk hybrid.</li>
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
