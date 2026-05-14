import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { IntegrityForgeryLab } from "./IntegrityForgeryLab";

const STEPS = [
  { title: "Hvorfor checksum ikke holder", anchor: "checksum" },
  { title: "Kryptografisk hash", anchor: "hash" },
  { title: "Naiv H(m) — fortsatt sårbar", anchor: "naive" },
  { title: "MAC: hemmelig nøkkel", anchor: "mac" },
  { title: "HMAC — RFC 2104", anchor: "hmac" },
  { title: "Forfalsknings-laben", anchor: "lab" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function FraChecksumTilHmacPage() {
  return (
    <StackPageShell title="Fra checksum til HMAC" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 8.3 (s. 625-630)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Fra checksum til HMAC — hvordan vi virkelig får integritet
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            «Mottakeren skal vite at meldingen kommer fra avsenderen og ikke har blitt
            endret underveis.» Det høres trivielt ut, men det krever en ganske spesifikk
            byggekloss: en <strong>kryptografisk MAC</strong>. Veien dit går via tre
            stoppesteder som hver løser ett konkret hull. Vi følger Kurose-Ross sin
            bokeksempel: Alice skylder Bob hundre dollar.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#lab" className="text-brand hover:underline">
                forfalsknings-laben
              </a>{" "}
              lar deg spille Trudy mot hver av de fire mekanismene og se hvilke som faller.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-fra-checksum-til-hmac" steps={STEPS} />

        <section id="checksum" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            1. Klassisk checksum gir ikke integritet
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Internet checksum (RFC 1071) ble laget for å oppdage <em>tilfeldige</em>{" "}
            bit-feil — kosmisk stråling, NICs med dårlig støy-margin. Den fungerer
            utmerket mot uhell. Men den var aldri ment som et integritets-mekanisme mot
            en aktiv motstander. Det berømte eksempelet i boka:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm font-mono">
            <div>
              Alice sender: <span className="text-emerald-600 dark:text-emerald-400">IOU100.99BOB</span>
            </div>
            <div>
              Trudy bytter til: <span className="text-rose-600 dark:text-rose-400">IOU900.19BOB</span>
            </div>
            <div className="mt-2 text-foreground">
              Begge har <strong>nøyaktig samme</strong> sum av tegn — checksum verifiserer
              som «OK» selv om semantikken er knust.
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Problemet er at checksum er en <em>lineær</em> funksjon — Trudy kan flytte
            «vekt» mellom posisjoner uten å endre summen. Vi trenger noe som er
            «kollisjons-resistent»: hvor det er praktisk umulig å finne to forskjellige
            meldinger med samme tag.
          </p>
        </section>

        <section id="hash" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Kryptografisk hash — første krav</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En kryptografisk hash-funksjon <Tex>{`H`}</Tex> oppfyller tre krav:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li>
              <strong>One-way:</strong> gitt <Tex>{`y`}</Tex>, vanskelig å finne{" "}
              <Tex>{`m`}</Tex> slik at <Tex>{`H(m) = y`}</Tex>.
            </li>
            <li>
              <strong>Second-preimage:</strong> gitt <Tex>{`m`}</Tex>, vanskelig å finne{" "}
              <Tex>{`m' \\ne m`}</Tex> slik at <Tex>{`H(m') = H(m)`}</Tex>.
            </li>
            <li>
              <strong>Kollisjons-resistent:</strong> vanskelig å finne <em>noen</em>{" "}
              <Tex>{`m \\ne m'`}</Tex> med <Tex>{`H(m) = H(m')`}</Tex>.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Praktiske valg: <strong>SHA-256</strong>, <strong>SHA-3</strong>. MD5 og
            SHA-1 er <em>brutt</em> for kollisjonsmotstand (Wang 2005, SHAttered 2017) og
            skal ikke brukes i nye systemer.
          </p>
        </section>

        <section id="naive" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            3. Naiv <Tex>{`H(m)`}</Tex> — fortsatt åpen for Trudy
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hvorfor ikke bare sende <Tex>{`(m, H(m))`}</Tex>? Fordi <Tex>{`H`}</Tex> er
            offentlig kjent. Bokens egen formulering:
          </p>
          <blockquote className="border-l-4 border-brand/60 pl-4 italic text-sm text-muted-foreground my-4">
            "Trudy can create a bogus message m´ in which she says she is Alice, calculate{" "}
            H(m´), and send Bob (m´, H(m´))." (Kurose-Ross s. 627)
          </blockquote>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bob mottar et par der hash-en er korrekt for den meldingen han ser — men
            meldingen er ikke fra Alice. Kollisjonsmotstand hjelper ikke: Trudy trenger
            ingen kollisjon, hun lager bare en ny gyldig <Tex>{`(m', H(m'))`}</Tex>. Vi
            trenger noe som <em>bare Alice</em> kan regne.
          </p>
        </section>

        <section id="mac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            4. MAC — Message Authentication Code
          </h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Legg til en delt hemmelighet <Tex>{`s`}</Tex> som bare Alice og Bob kjenner
            (de har avtalt den på forhånd — vi løser distribusjons-problemet senere med
            Diffie-Hellman). En enkel MAC:
          </p>
          <TexBlock>{`\\text{MAC}(m, s) = H(m \\,\\|\\, s)`}</TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Trudy ser <Tex>{`m`}</Tex> og <Tex>{`H(m\\|s)`}</Tex>, men ikke{" "}
            <Tex>{`s`}</Tex>. Uten <Tex>{`s`}</Tex> kan hun ikke regne{" "}
            <Tex>{`H(m'\\|s)`}</Tex> for sin forfalskning. Bob, derimot, kjenner{" "}
            <Tex>{`s`}</Tex> og kan regne ut MAC-en på nytt og sammenligne.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Subtilt hull:</strong>{" "}
            ren <Tex>{`H(m\\|s)`}</Tex> er sårbar for <em>length-extension</em>-angrep
            mot Merkle-Damgård-hashes (SHA-256 er Merkle-Damgård). Trudy kan beregne MAC
            for <Tex>{`m \\| \\text{padding} \\| m'`}</Tex> uten å kjenne{" "}
            <Tex>{`s`}</Tex>. Derfor finnes HMAC.
          </div>
        </section>

        <section id="hmac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. HMAC — standard-konstruksjonen</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            HMAC (RFC 2104) wrapper hashen to ganger med to forskjellige padder. La{" "}
            <Tex>{`B`}</Tex> være blokk-størrelsen til hashen (64 bytes for SHA-256),{" "}
            <Tex>{`\\text{ipad} = 0x36`}</Tex> repetert <Tex>{`B`}</Tex> ganger, og{" "}
            <Tex>{`\\text{opad} = 0x5c`}</Tex> repetert <Tex>{`B`}</Tex> ganger.
          </p>
          <TexBlock>
            {`\\text{HMAC}(s, m) = H\\!\\left((s \\oplus \\text{opad}) \\,\\|\\, H\\!\\left((s \\oplus \\text{ipad}) \\,\\|\\, m\\right)\\right)`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Den ytre hashen «forsegler» den indre, så length-extension blir umulig. HMAC
            har formell sikkerhetsbevis — bygger «MAC» ut av enhver god kollisjons-resistent
            hash. Standardisert i TLS-record (`HMAC-SHA256`), JWT-signatur («HS256»), SSH,
            IPsec.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <div className="rounded-lg border border-border bg-card p-3 text-xs">
              <div className="font-mono text-brand mb-1">TLS 1.2 record</div>
              <div className="text-muted-foreground">HMAC-SHA256 over header + payload</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-xs">
              <div className="font-mono text-brand mb-1">JWT HS256</div>
              <div className="text-muted-foreground">HMAC-SHA256 over header.payload</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-xs">
              <div className="font-mono text-brand mb-1">AWS SigV4</div>
              <div className="text-muted-foreground">HMAC-SHA256-kjede over forespørsel</div>
            </div>
          </div>
        </section>

        <section id="lab" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Forfalsknings-laben</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Spill Trudy. For hver mekanisme: endre meldingen og se om Bob aksepterer.
          </p>
          <IntegrityForgeryLab />
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <strong>Tre øvelses-scenarier:</strong>
            <ol className="mt-2 space-y-1 list-decimal pl-5 text-muted-foreground">
              <li>
                <strong>Bekreft bokens kollisjon.</strong> Mode «Klassisk checksum».
                Endre Trudys melding til <code className="font-mono">IOU900.19BOB</code>.
                Bob aksepterer — fordi summen er identisk. Bytt deretter «9» til «8» og
                se at det knekker.
              </li>
              <li>
                <strong>Naiv hash er like dårlig mot aktiv motstander.</strong> Mode
                «Naiv H(m)». Trudy regner ut hash-en selv — Bob har ingen måte å vite
                hvem som regnet den.
              </li>
              <li>
                <strong>Uten s er det stengt.</strong> Mode «MAC» eller «HMAC». Trudy
                kan endre meldingen, men gjette taggen er <Tex>{`2^{-32}`}</Tex>{" "}
                sannsynlig (32-bit-demo — i virkeligheten 256 bit).
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
                  <th className="text-left font-semibold px-4 py-2 w-44">Mekanisme</th>
                  <th className="text-left font-semibold px-4 py-2">Beskytter mot</th>
                  <th className="text-left font-semibold px-4 py-2">Krever</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Checksum</td>
                  <td className="px-4 py-3">Tilfeldige bit-feil</td>
                  <td className="px-4 py-3">Ingenting hemmelig</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">H(m)</td>
                  <td className="px-4 py-3">Kollisjoner — IKKE aktiv motstander</td>
                  <td className="px-4 py-3">Bare hash-funksjonen</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">MAC = H(m‖s)</td>
                  <td className="px-4 py-3">Forfalskning uten s</td>
                  <td className="px-4 py-3">Delt hemmelighet s</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">HMAC</td>
                  <td className="px-4 py-3">+ length-extension</td>
                  <td className="px-4 py-3">Delt s + ipad/opad-wrap</td>
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
              — hvor HMAC dukker opp som record-MAC etter handshake.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "kryptografi" }} className="text-brand hover:underline">
                Kryptografi-grunnlag
              </Link>{" "}
              — symmetrisk vs asymmetrisk, hashfunksjoner i kontekst.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "nettverkssikkerhet" }} className="text-brand hover:underline">
                Nettverkssikkerhet
              </Link>{" "}
              — fra integritet til hele sikkerhetsbildet.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
