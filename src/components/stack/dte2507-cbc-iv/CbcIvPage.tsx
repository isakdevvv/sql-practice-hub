import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { BlockCipherCanvas } from "./BlockCipherCanvas";

const STEPS = [
  { title: "Block cipher i ett trinn", anchor: "block" },
  { title: "ECB — den naive løsningen", anchor: "ecb" },
  { title: "Pingvinen som lekker", anchor: "penguin" },
  { title: "CBC: kjeding med IV", anchor: "cbc" },
  { title: "Hvorfor IV må være tilfeldig", anchor: "iv" },
  { title: "Visualisering", anchor: "viz" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function CbcIvPage() {
  return (
    <StackPageShell title="CBC og hvorfor like blokker er farlige" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 8.2.2 (s. 615-618)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            CBC og hvorfor like blokker er farlige
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Et block cipher (DES, AES) krypterer en fast-størrelse blokk om gangen — 16
            bytes for AES. Men meldinger er sjelden 16 bytes. Hvordan kjeder vi blokker?
            Den naive måten — Electronic CodeBook — lekker akkurat de mønstrene du
            <em> ikke</em> vil at en angriper skal se. CBC (Cipher Block Chaining) løser
            det med to ideer: XOR med forrige cipher-blokk, og en tilfeldig initialiserings-vektor.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#viz" className="text-brand hover:underline">
                blokk-chiffer-canvasen
              </a>{" "}
              viser hvordan en setning som «ATTACK ATTACK ATTACK» får like farger i ECB
              og helt forskjellige i CBC.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-cbc-iv" steps={STEPS} />

        <section id="block" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Block cipher i ett trinn</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Et block cipher er en deterministisk funksjon{" "}
            <Tex>{`E_k: \\{0,1\\}^n \\to \\{0,1\\}^n`}</Tex> som permuterer en blokk på
            <Tex>{` n`}</Tex> bits ved hjelp av en nøkkel <Tex>{`k`}</Tex>. AES har{" "}
            <Tex>{`n = 128`}</Tex> (16 bytes per blokk) og nøkkelstørrelse 128, 192 eller
            256 bit. Egenskaper:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Deterministisk:</strong> samme klartekst-blokk med samme nøkkel gir
              alltid samme cipher-blokk.
            </li>
            <li>
              <strong>Pseudo-tilfeldig permutasjon:</strong> ett bit-skifte i input gir
              ~50% av bitene flippet i output («avalanche»).
            </li>
            <li>
              <strong>Reversibel kun med nøkkelen:</strong>{" "}
              <Tex>{`D_k(E_k(m)) = m`}</Tex>.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Den <em>deterministiske</em> egenskapen er det som forårsaker problemet vi
            skal se. Den er nødvendig for å kunne dekryptere, men farlig hvis vi krypterer
            mange blokker direkte med samme nøkkel.
          </p>
        </section>

        <section id="ecb" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. ECB — Electronic CodeBook</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Den enkleste måten å kryptere lange meldinger: del opp i blokker, kryptér
            hver for seg med <Tex>{`E_k`}</Tex>.
          </p>
          <TexBlock>{`C_i = E_k(P_i)`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Parallelliserbar, enkel å implementere, men: hvis <Tex>{`P_i = P_j`}</Tex>{" "}
            (to like klartekst-blokker), så er <Tex>{`C_i = C_j`}</Tex>. Repetisjon i
            klartekst lekker direkte gjennom.
          </p>
        </section>

        <section id="penguin" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Pingvinen som lekker</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Bokens og kryptografi-litteraturens beste illustrasjon er Tux-pingvinen kryptert
            i ECB-modus. Bakgrunnen er ensfarget — alle bakgrunnsblokker er like — så de
            blir alle like også i cipheren. Resultat: omrisset av pingvinen er fortsatt
            tydelig synlig i cipher-bildet.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Praktiske angreps-scenarier
            </div>
            <ul className="space-y-1.5 list-disc pl-5 text-muted-foreground">
              <li>
                <strong>VPN-trafikk:</strong> hvis HTTP-headere er identiske mellom
                forespørsler, ser angriperen samme cipher-prefiks og kan klassifisere
                trafikk-mønstre.
              </li>
              <li>
                <strong>Disk-kryptering:</strong> like sektor-innhold (f.eks. tomme blokker
                fylt med null) krypteres til samme cipher. Tradisjonell ECB er aldri brukt
                for disker — XTS-AES er standarden.
              </li>
              <li>
                <strong>Adobe-passordlekkasjen (2013):</strong> 130 mill. brukere — passord
                lagret ECB-kryptert. Forskere kunne grupere passord etter cipher-mønster
                og gjette dem fra hint.
              </li>
            </ul>
          </div>
        </section>

        <section id="cbc" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. CBC — Cipher Block Chaining</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            CBC løser ECB-lekkasjen ved å lenke blokkene: før hver kryptering XOR-er vi
            klartekst-blokken med <em>forrige</em> cipher-blokk. Den første blokken
            mangler en forgjenger — der bruker vi en{" "}
            <strong>initialiserings-vektor (IV)</strong>.
          </p>
          <TexBlock>{`C_1 = E_k(P_1 \\oplus IV), \\qquad C_i = E_k(P_i \\oplus C_{i-1})`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            For dekryptering: <Tex>{`P_i = D_k(C_i) \\oplus C_{i-1}`}</Tex>. IV-en sendes
            i klartekst sammen med chiffertekstet — den trenger ikke være hemmelig, bare
            uforutsigbar.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Konsekvens for like blokker:</strong>{" "}
            siden <Tex>{`C_{i-1}`}</Tex> er pseudo-tilfeldig, blir{" "}
            <Tex>{`P_i \\oplus C_{i-1}`}</Tex> pseudo-tilfeldig — selv om{" "}
            <Tex>{`P_i = P_j`}</Tex>, er <Tex>{`C_i \\ne C_j`}</Tex>.
          </div>
        </section>

        <section id="iv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Hvorfor IV må være tilfeldig</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvis IV er konstant (eller forutsigbar) mellom sesjoner, gir like meldinger
            med samme prefiks <em>identiske</em> cipher-prefikser — vi har egentlig en
            slags «sesjons-ECB». Krav:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>
              <strong>Unik per kryptering</strong> med samme nøkkel — ellers gjenoppstår
              ECB-lekkasje.
            </li>
            <li>
              <strong>Uforutsigbar</strong> hvis angriperen kan velge klartekst (BEAST-angrepet
              mot TLS 1.0 utnyttet forutsigbar IV).
            </li>
            <li>
              <strong>Ikke hemmelig</strong> — sendes i klartekst med ciphertext.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            I TLS 1.2 brukes <em>explicit IV</em> per record (fixes BEAST). TLS 1.3 har
            gått over til AEAD (AES-GCM, ChaCha20-Poly1305) som bruker en nonce-basert
            konstruksjon — CBC er ute, men forblir pensumeksempel for å forstå hvorfor.
          </p>
        </section>

        <section id="viz" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Visualisering: ECB vs CBC</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hver klartekst-blokk blir kryptert; like cipher-blokker får samme farge.
          </p>
          <BlockCipherCanvas />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Tre øvelser:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Tell unike blokker.</strong> I ECB med «ATTACK ATTACK ATTACK
                ATTACK» får du svært få unike farger. Bytt til CBC — alle blir unike.
              </li>
              <li>
                <strong>Endre IV uten å endre meldingen.</strong> I CBC-mode, klikk «Ny IV».
                Hele cipheren skifter — meldingen er den samme.
              </li>
              <li>
                <strong>Skift én bokstav.</strong> Endre «ATTACK» til «ATTACL» i første
                blokk og se hvor langt fram endringen forplanter seg. ECB: bare den blokken.
                CBC: alle blokker etter (avalanche gjennom kjeden).
              </li>
            </ol>
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-4 py-2">ECB</th>
                  <th className="text-left font-semibold px-4 py-2">CBC</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Like blokker</td>
                  <td className="px-4 py-3">Lekker — gir samme cipher</td>
                  <td className="px-4 py-3">Skjules av kjede + IV</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Parallell</td>
                  <td className="px-4 py-3">Ja, alle blokker uavhengig</td>
                  <td className="px-4 py-3">Nei ved kryptering (kjede)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">IV</td>
                  <td className="px-4 py-3">Ingen</td>
                  <td className="px-4 py-3">Tilfeldig per melding</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Bit-feil</td>
                  <td className="px-4 py-3">Påvirker kun den blokken</td>
                  <td className="px-4 py-3">Påvirker den + neste blokk</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Brukes i dag</td>
                  <td className="px-4 py-3">Aldri (pedagogisk eksempel)</td>
                  <td className="px-4 py-3">Disk (med twist), legacy TLS</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesning</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-tls-handshake" }} className="text-brand hover:underline">
                TLS-handshake
              </Link>{" "}
              — hvor AEAD (AES-GCM) har erstattet CBC i TLS 1.3.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "kryptografi" }} className="text-brand hover:underline">
                Kryptografi-grunnlag
              </Link>{" "}
              — symmetrisk vs asymmetrisk, hvor block ciphers sitter.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-fra-checksum-til-hmac" }} className="text-brand hover:underline">
                Fra checksum til HMAC
              </Link>{" "}
              — integritet, som man typisk kombinerer med CBC.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
