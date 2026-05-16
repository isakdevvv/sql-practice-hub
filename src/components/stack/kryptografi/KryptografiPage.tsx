import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { AesGcmDemo } from "./AesGcmDemo";
import { AesBlockModes } from "./AesBlockModes";
import { HashAndHmac } from "./HashAndHmac";
import { DiffieHellmanColors } from "./DiffieHellmanColors";
import { CryptoVisualizer } from "./CryptoVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Hva krypto faktisk beskytter mot", anchor: "trusler" },
  { title: "Krypto-visualisering (Caesar, XOR, hash, RSA, DH)", anchor: "krypto-visualizer" },
  { title: "Symmetrisk kryptering", anchor: "symmetrisk" },
  { title: "Blokkmoduser — ECB-pingvinen", anchor: "blokk-moduser" },
  { title: "AES-GCM i praksis", anchor: "aes-gcm" },
  { title: "Asymmetrisk kryptering", anchor: "asymmetrisk" },
  { title: "Diffie-Hellman — nøkkelutveksling", anchor: "diffie-hellman" },
  { title: "Hash-funksjoner", anchor: "hash" },
  { title: "Hash & HMAC (live)", anchor: "hash-hmac" },
  { title: "MAC og HMAC — integritet med nøkkel", anchor: "mac" },
  { title: "Digital signatur", anchor: "signatur" },
  { title: "PKI og sertifikater", anchor: "pki" },
  { title: "Vanlige feller", anchor: "feller" },
];

export function KryptografiPage() {
  return (
    <StackPageShell title="Kryptografi-grunnlag" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Sikkerhet
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kryptografi — hva som beskytter mot hva
          </h1>
          <p className="mt-3 text-muted-foreground">
            Krypto handler om tre garantier: <strong>konfidensialitet</strong> (ingen andre kan
            lese), <strong>integritet</strong> (ingen har endret), og <strong>autentisitet</strong>{" "}
            (jeg vet hvem som sendte). Ulike algoritmer dekker ulike garantier. Lær deg hvilke som
            dekker hva.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">
                drag-oppgavene
              </Link>{" "}
              under «Kryptografi» — match algoritme til garanti, quiz om hash vs encrypt, sortér
              digital-signatur-flyt.
            </div>
          </div>
        </div>

        <CourseOutline courseId="kryptografi" steps={STEPS} />

        <section id="trusler" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva krypto faktisk beskytter mot</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Krypto-løsning skal alltid være en respons til en konkret trussel. Først: forstå
            CIA-trekanten.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Konfidensialitet
              </div>
              <p className="text-sm text-foreground">Ingen uautoriserte kan LESE.</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Trussel: avlytting (eavesdropping). Verktøy: kryptering.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Integritet
              </div>
              <p className="text-sm text-foreground">
                Ingen uautoriserte kan ENDRE — eller du oppdager det.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Trussel: tampering. Verktøy: hash + MAC.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Autentisitet
              </div>
              <p className="text-sm text-foreground">
                Du VET hvem som sendte (eller hvem du snakker med).
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Trussel: impersonation. Verktøy: signatur, sertifikat.
              </p>
            </div>
          </div>
        </section>

        <section id="krypto-visualizer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1b. Krypto-visualisering — bygg intuisjon før algoritmene
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fem moduser i ett verktøy:{" "}
            <strong>Caesar</strong> (alfabet-rotasjon),{" "}
            <strong>XOR</strong> (byte-for-byte symmetrisk operasjon),{" "}
            <strong>SHA-256</strong> (avalanche-effekt side-ved-side),{" "}
            <strong>RSA-mini</strong> (håndregning med små primtall) og{" "}
            <strong>Diffie-Hellman</strong> (delt nøkkel uten å lekke). Lek deg gjennom alle
            før du leser teorien nedenfor — du kommer til å gjenkjenne mønstrene mye lettere.
          </p>
          <CryptoVisualizer />
        </section>

        <section id="symmetrisk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Symmetrisk kryptering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En enkelt nøkkel som BÅDE krypterer og dekrypterer. Avsender og mottaker må ha samme
            nøkkel.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`klartekst ──[ ENC(nøkkel) ]──► chiffertekst ──[ DEC(nøkkel) ]──► klartekst

  AES-256:  256-bit nøkkel, brukes overalt i 2026
  ChaCha20: alternativ, raskere uten hardware-AES
  3DES, DES: utdaterte, ikke bruk`}</pre>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
              <strong className="text-success">Fordeler:</strong> Raskt. AES kan gjøre flere GB/s
              med hardware-støtte. Liten cipher-tekst (samme størrelse som klartekst + IV).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
              <strong className="text-amber-600 dark:text-amber-400">Problemet:</strong> Hvordan
              deler dere nøkkelen? Hvis du sender den ukryptert er det jo poenget med å kryptere som
              forsvinner. Løses med asymmetrisk krypto.
            </div>
          </div>
        </section>

        <section id="blokk-moduser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Blokkmoduser — ECB-pingvinen</h2>
          <p className="text-sm text-muted-foreground mb-3">
            AES krypterer 16 byte om gangen. For å håndtere meldinger lengre enn 16 byte trenger man
            en <strong>blokkmodus</strong>. Det berømte «pingvin-eksempelet» viser hvorfor ECB-modus
            er katastrofalt: identiske klartekst-blokker gir identiske ciphertext-blokker, så
            mønstre i bildet overlever krypteringen.
          </p>
          <AesBlockModes />
          <p className="mt-3 text-xs text-muted-foreground">
            Praksis: alle moderne protokoller (TLS 1.3, IPsec, WireGuard, SSH) bruker AEAD-moduser
            som AES-GCM eller ChaCha20-Poly1305. ECB dukker stort sett bare opp i CTF-utfordringer
            og gamle kryptolib-defaulter.
          </p>
        </section>

        <section id="aes-gcm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. AES-GCM i praksis</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Symmetrisk i teorien — over. Nå konkret: <strong>node-forge</strong> kjører AES-256 i
            GCM-modus i nettleseren din. GCM gir både konfidensialitet OG integritet i én operasjon
            (kalles AEAD). Generer nøkkel og IV, krypter en melding, og se hvordan en bit-flip i
            ciphertext gjør at dekryptering avbrytes.
          </p>
          <AesGcmDemo />
        </section>

        <section id="asymmetrisk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Asymmetrisk kryptering (public key)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>To nøkler:</strong> én offentlig, én privat. Det som krypteres med den ene kan
            KUN dekrypteres med den andre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Alice vil sende hemmelig melding til Bob:

  1. Alice får Bobs PUBLIC key (kan deles fritt)
  2. Alice krypterer: chiffer = ENC(public_bob, melding)
  3. Bob dekrypterer: melding = DEC(private_bob, chiffer)

Hvem som helst kan kryptere TIL Bob. Bare Bob kan lese.

  RSA-2048/4096:  klassiker, fremdeles i bruk
  ECC (Curve25519): mindre nøkler, samme styrke som RSA-3072`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Hastighet:</strong> asymmetrisk krypto er 1000x tregere enn AES. I praksis
            brukes det BARE til å utveksle en symmetrisk nøkkel — så fortsetter man med AES. Det er
            det TLS gjør.
          </p>
        </section>

        <section id="diffie-hellman" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            5b. Diffie-Hellman — nøkkelutveksling uten å lekke nøkkelen
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Asymmetrisk krypto er tregt. I praksis brukes den til å «enes om» en
            symmetrisk nøkkel som AES kan kjøre raskt på etterpå.{" "}
            <strong>Diffie-Hellman</strong> løser nettopp dét: Alice og Bob
            kommer fram til samme nøkkel over en kanal Eve avlytter, uten at Eve
            kan utlede den.
          </p>
          <DiffieHellmanColors />
        </section>

        <section id="hash" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Hash-funksjoner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En ENVEIS funksjon: <code>hash(input) → fixed-size output</code>. Ikke mulig å
            reversere. Liten endring i input gir helt annerledes output (avalanche).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`sha256("hei")        → 3edfb8085...0e7f8d (256 bit)
sha256("hei.")       → 8d9c5c7a4...9b3a1d (helt annerledes — én bokstav)

Kravene til en kryptografisk hash:
  - Determinitisk: samme input → samme output, alltid
  - Pre-image resistance: gitt hash, ikke mulig å finne input
  - Collision resistance: ikke mulig å finne to inputs med samme hash`}</pre>
          </div>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2 w-24">Output</th>
                  <th className="text-left font-semibold px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">MD5</td>
                  <td className="px-4 py-3 font-mono">128 bit</td>
                  <td className="px-4 py-3 text-destructive">Knust — ikke bruk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">SHA-1</td>
                  <td className="px-4 py-3 font-mono">160 bit</td>
                  <td className="px-4 py-3 text-destructive">Knust — ikke bruk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">SHA-256</td>
                  <td className="px-4 py-3 font-mono">256 bit</td>
                  <td className="px-4 py-3 text-success">Anbefalt</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">SHA-3</td>
                  <td className="px-4 py-3 font-mono">variabel</td>
                  <td className="px-4 py-3 text-success">Anbefalt, ny generasjon</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">bcrypt/Argon2</td>
                  <td className="px-4 py-3 font-mono">variabel</td>
                  <td className="px-4 py-3 text-success">For PASSORD — slow hash</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Viktig:</strong> SHA-256 er RASK. Det er bra for fingeravtrykk og blockchain,
            men <strong>katastrofalt for passord</strong> — angriperen tester milliarder per sekund
            med GPU. Bruk bcrypt eller Argon2 for passord-lagring.
          </p>
        </section>

        <section id="hash-hmac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hash &amp; HMAC (live demo)</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Skriv en streng og se hvordan fire hash-familier (MD5, SHA-1, SHA-256, SHA-512) beregnes
            samtidig — alle via <code className="font-mono">node-forge</code>. Endre ÉN bokstav og
            se avalanche-effekten i praksis. Under: HMAC-SHA-256 med valgbar nøkkel — kjernen i
            JWT-tokens og API-signering.
          </p>
          <HashAndHmac />
        </section>

        <section id="mac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. MAC og HMAC — integritet med nøkkel</h2>
          <p className="text-sm text-muted-foreground mb-4">
            En hash alene viser bare integritet hvis du STOLER på hashen som ble sendt. Hvis
            angriperen endrer både meldingen og hashen, merker du ingenting.{" "}
            <strong>MAC (Message Authentication Code)</strong> løser det: hash av (melding + delt
            hemmelig nøkkel).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Alice → Bob (med delt nøkkel K):

  tag  = HMAC-SHA256(K, melding)
  send (melding, tag)

Bob mottar:
  forventet_tag = HMAC-SHA256(K, mottatt_melding)
  hvis forventet_tag == tag → integritet OK

Angriper uten K kan ikke beregne riktig tag.`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            HMAC er en standardisert måte å bygge MAC fra en hvilken som helst hash: HMAC-SHA256,
            HMAC-SHA3, osv. Brukes i JWT-tokens, API-signering, TLS.
          </p>
        </section>

        <section id="signatur" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">9. Digital signatur</h2>
          <p className="text-sm text-muted-foreground mb-4">
            MAC krever DELT nøkkel — begge sider må ha den. Hva om du vil at HVEM SOM HELST skal
            kunne verifisere at det er DU som signerte? Da trenger du asymmetrisk: signér med PRIVAT
            nøkkel, verifiser med PUBLIC.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Alice signerer:
  1. hash = SHA-256(dokument)
  2. signatur = ENC(private_alice, hash)
  3. publiser (dokument, signatur)

Hvem som helst verifiserer:
  1. hash_mottatt = SHA-256(dokument)
  2. hash_dekryptert = DEC(public_alice, signatur)
  3. hvis hash_mottatt == hash_dekryptert → ekte signatur

Garantier:
  - Integritet:    dokumentet er ikke endret
  - Autentisitet:  Alice (eller noen med private key hennes) signerte
  - Non-repudiation: Alice kan ikke nekte for å ha signert`}</pre>
          </div>
        </section>

        <section id="pki" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">10. PKI og sertifikater</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Problem: hvordan vet du at en gitt public key faktisk tilhører «nettbank.no» og ikke en
            angriper? Løsning: <strong>Public Key Infrastructure</strong> — sertifikater signert av
            Certificate Authorities (CA-er) som nettleseren stoler på.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Et X.509-sertifikat inneholder:
  - Subject:          CN=nettbank.no
  - Public key:       <RSA-nøkkel for nettbank.no>
  - Issuer:           DigiCert, Let's Encrypt, ...
  - Valid from/to:    2026-01-01 til 2027-01-01
  - Signature:        signert med CA-ens private key

Verifisering:
  1. Hent sertifikat fra serveren
  2. Sjekk at signaturen verifiserer med CA-ens public key
  3. CA-ens public key kommer pre-installert i operativsystem/browser
  4. Hvis kjeden er gyldig og navnet matcher → trygg`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Sertifikatkjede:</strong> ofte signerer en root-CA en mellom-CA som igjen
            signerer serveren. Browseren følger kjeden helt opp til en root den stoler på.
          </p>
        </section>

        <section id="feller" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">11. Vanlige feller</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>«Vi krypterer passordet i databasen»</strong> — feil terminologi. Krypterer er
              reversibelt. Passord skal HASHES (med bcrypt/Argon2) — enveis. Hvis du faktisk
              krypterer, kan en lekkasje av nøkkelen gi alle passord i klartekst.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>SHA-256 av passord</strong> er nesten like dårlig som klartekst. GPU-er tester
              milliarder per sekund. Bruk slow hashes (bcrypt, Argon2).
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Egen krypto-implementasjon</strong> — ikke gjør det. Bruk bibliotek
              (libsodium, OpenSSL, cryptography i Python). 99% av sikkerhetshull i krypto kommer fra
              feilbruk eller egne implementasjoner, ikke knust algoritme.
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <strong>Statisk IV/nonce</strong> — å bruke samme initialiseringsvektor for flere
              meldinger med samme nøkkel kan lekke informasjon. Generér ny IV per melding.
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/drag" className="text-brand hover:underline">
                Drag-oppgaver
              </Link>
              : match algoritme til garanti, quiz om hash vs encrypt.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "tls" }}
                className="text-brand hover:underline"
              >
                TLS-håndtrykk
              </Link>
              : alle disse byggesteinene satt sammen i ekte protokoll.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="kryptografi" />
      </div>
    </StackPageShell>
  );
}
