import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { CacheCalculator } from "./CacheCalculator";
import { CacheVisualizer } from "./CacheVisualizer";
import { RelatedVisualizers } from "@/components/stack/RelatedVisualizers";

const STEPS = [
  { title: "Cache-visualisering", anchor: "vis" },
  { title: "Hvorfor cache?", anchor: "hvorfor" },
  { title: "Trafikkintensitet ρ", anchor: "rho" },
  { title: "Bokens eksempel", anchor: "bokens-eks" },
  { title: "Cache løser problemet", anchor: "cache-loser" },
  { title: "Interaktiv kalkulator", anchor: "sim" },
  { title: "Conditional GET / 304", anchor: "conditional" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function WebCachingMattePage() {
  return (
    <StackPageShell title="Web-caching matematikk" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 2.2.5
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Web-caching matematikk — fra ∞ delay til 1.2 s
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Kurose &amp; Ross sitt klassiske eksempel: en institusjon med 15 forespørsler/s,
            1 Mbit per forespørsel og bare en 15 Mbps access-link til Internett.
            Trafikkintensiteten <Tex>{`\\rho`}</Tex> blir nøyaktig 1.0 — kø-teorien
            sier delay går mot uendelig. En proxy-cache med 40 % hit-rate kutter
            <em> snittforsinkelse</em> fra «utålelig» til ca. 1.2 sekunder. Vi
            reproduserer regnestykket, så lar vi deg leke med tallene.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">cache-kalkulatoren</a>{" "}
              under har slidere for hit-rate, req/s og access-link-rate — se hvordan
              snittforsinkelse hopper når <Tex>{`\\rho \\to 1`}</Tex>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-web-caching-matte" steps={STEPS} />

        <section id="vis" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">0. Cache-visualisering — pakker, LRU, TTL og 304</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Før vi går inn i matematikken: en interaktiv visualisering av hvordan en
            web-cache faktisk fungerer. Bytt mellom modusene for å se første-miss → fyll
            → hit, LRU-eviction, TTL-utløp, betinget GET med 304 Not Modified, og en
            kalkulator for snitt-responstid <Tex>{`\\;p \\cdot T_{\\text{cache}} + (1-p)\\cdot T_{\\text{origin}}`}</Tex>.
          </p>
          <CacheVisualizer />
        </section>

        <section id="hvorfor" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hvorfor web-caching?</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En web-cache (proxy) sitter mellom klientene og Internett. Ved hit serveres
            objektet lokalt; ved miss går forespørselen videre. Tre fordeler:
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li>
              <strong>Lavere responstid</strong> — LAN-tilgang er typisk &lt;10 ms vs
              flere hundre ms over Internett.
            </li>
            <li>
              <strong>Mindre access-link-trafikk</strong> — institusjonen sparer
              båndbredde, slipper å oppgradere.
            </li>
            <li>
              <strong>Mindre last på origin</strong> — populært innhold serveres
              «gratis» fra kanten.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            CDN-er (Content Delivery Networks) er den samme idéen i industriell skala:
            tusenvis av cache-noder geografisk fordelt.
          </p>
        </section>

        <section id="rho" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Trafikkintensitet ρ — den gylne grensen</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            For en lenke med kapasitet <Tex>{`R`}</Tex> bits/s og ankommende rate
            <Tex>{` La`}</Tex> bits/s defineres trafikkintensiteten:
          </p>
          <TexBlock>{`\\rho = \\frac{La}{R}`}</TexBlock>
          <ul className="text-sm space-y-1 list-disc pl-5 mt-3">
            <li>
              <Tex>{`\\rho \\ll 1`}</Tex>: kø-forsinkelse er neglisjerbar.
            </li>
            <li>
              <Tex>{`\\rho \\to 1`}</Tex>: kø-forsinkelse vokser eksplosivt (M/M/1
              gir <Tex>{`d_{\\text{kø}} = \\frac{1}{\\mu - \\lambda}`}</Tex>).
            </li>
            <li>
              <Tex>{`\\rho > 1`}</Tex>: kø-en vokser ubegrenset, pakker droppes.
            </li>
          </ul>
          <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm italic">
            «Design your system so that the traffic intensity is no greater than 1.»
            — Kurose &amp; Ross, s. 39.
          </div>
        </section>

        <section id="bokens-eks" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Bokens eksempel uten cache</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-2">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
              Oppsett (Kurose &amp; Ross s. 110-112)
            </div>
            <ul className="space-y-1 list-disc pl-5">
              <li>Institusjonelt LAN: <strong>100 Mbps</strong></li>
              <li>Access-link til Internett: <strong>15 Mbps</strong></li>
              <li>Forespørselsrate: <strong>15 req/s</strong></li>
              <li>Snittstørrelse per objekt: <strong>1 Mbit</strong></li>
              <li>Internett-delay (origin → access-router): <strong>2 s</strong> i snitt</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Beregn last på de to lenkene:
          </p>
          <TexBlock>
            {`\\text{LAN-trafikk} = 15 \\cdot 1 \\text{ Mbit/s} = 15\\text{ Mbps}, \\quad \\rho_{\\text{LAN}} = \\frac{15}{100} = 0.15`}
          </TexBlock>
          <TexBlock>
            {`\\text{Access-link-trafikk} = 15\\text{ Mbps}, \\quad \\rho_{\\text{access}} = \\frac{15}{15} = 1.0`}
          </TexBlock>
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
            <strong className="text-rose-700 dark:text-rose-400">ρ = 1.0 betyr at access-link er flaskehalsen.</strong>{" "}
            Kø-forsinkelsen på access-routeren blir så stor at total responstid for en
            forespørsel mot Internett er <em>flere minutter</em> til <em>uendelig</em>.
            Institusjonen har to valg: oppgradere access-link (dyrt), eller installere
            en cache.
          </div>
        </section>

        <section id="cache-loser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Cache reduserer ρ — og snittforsinkelsen</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Anta cache-hit-rate <Tex>{`h = 0.4`}</Tex>. Da går 40 % av forespørslene aldri
            ut på access-link:
          </p>
          <TexBlock>
            {`\\text{Access-rate}_{\\text{ny}} = (1 - h) \\cdot 15 = 0.6 \\cdot 15 = 9\\text{ Mbps}`}
          </TexBlock>
          <TexBlock>
            {`\\rho_{\\text{access}}^{\\text{ny}} = \\frac{9}{15} = 0.6`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Med <Tex>{`\\rho = 0.6`}</Tex> er kø-en moderat. Boka antar
            <Tex>{` \\sim 0.01\\,\\text{s}`}</Tex> ekstra kø-forsinkelse pluss
            <Tex>{` 2\\,\\text{s}`}</Tex> Internett-tur. Sammen med
            <Tex>{` \\sim 0.01\\,\\text{s}`}</Tex> LAN-forsinkelse for hits:
          </p>
          <TexBlock>
            {`\\overline{d} = h \\cdot d_{\\text{LAN}} + (1-h) \\cdot (d_{\\text{LAN}} + d_{\\text{queue}} + d_{\\text{internet}})`}
          </TexBlock>
          <TexBlock>
            {`\\overline{d} = 0.4 \\cdot 0.01 + 0.6 \\cdot (0.01 + 0.01 + 2.0) \\approx 1.22\\text{ s}`}
          </TexBlock>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Resultatet: fra ∞ (uten cache) til <strong>~1.2 s snittforsinkelse</strong>
            med 40 % hit-rate. Cache koster en brøkdel av båndbredde-oppgraderingen.
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Interaktiv kalkulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Dra på sliderene og se hvordan trafikkintensitet og snittforsinkelse endrer
            seg. Pass på terskelen ved <Tex>{`\\rho = 1`}</Tex>.
          </p>
          <CacheCalculator />
        </section>

        <section id="conditional" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Conditional GET / 304 Not Modified</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            En cache er bare nyttig hvis den serverer <em>oppdaterte</em> versjoner.
            HTTP løser dette med en mini-protokoll mellom cache og origin:
          </p>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <ol className="space-y-2 list-decimal pl-5">
              <li>
                Origin svarer første gang med{" "}
                <code className="font-mono text-[11px]">Last-Modified: Mon, 14 May 2026 09:00:00 GMT</code>.
                Cache lagrer objektet + datoen.
              </li>
              <li>
                Klient ber om samme URL senere. Cache sender
                <code className="font-mono text-[11px]"> GET / HTTP/1.1</code> med
                <code className="font-mono text-[11px]"> If-Modified-Since: Mon, 14 May 2026 09:00:00 GMT</code>.
              </li>
              <li>
                Hvis objektet er <em>uendret</em>: origin svarer{" "}
                <code className="font-mono text-[11px]">HTTP/1.1 304 Not Modified</code>{" "}
                med <strong>tom body</strong>. Cache reuser sin lokale kopi.
              </li>
              <li>
                Hvis endret: vanlig <code className="font-mono text-[11px]">200 OK</code>{" "}
                med ny body + ny <code className="font-mono text-[11px]">Last-Modified</code>.
              </li>
            </ol>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            En 304-respons er typisk &lt;200 bytes vs flere KB/MB for en full body —
            cache-validering er nesten gratis. Moderne HTTP supplerer med
            <code className="font-mono text-[11px]"> ETag</code> /
            <code className="font-mono text-[11px]"> If-None-Match</code> for objekter
            der modifikasjonstid ikke holder.
          </p>
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs leading-relaxed">
            <strong className="text-emerald-700 dark:text-emerald-400">Kombinasjon:</strong>{" "}
            Cache-Control: max-age=N bestemmer hvor lenge objektet er <em>fresh</em> (ingen
            validering). Etter det blir det <em>stale</em>, og cache MÅ validere via 304
            før det serveres.
          </div>
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">7. Eksamen-quick-ref</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Størrelse</th>
                  <th className="text-left font-semibold px-4 py-2">Formel</th>
                  <th className="text-left font-semibold px-4 py-2">Tolking</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">ρ</td>
                  <td className="px-4 py-3 font-mono">La / R</td>
                  <td className="px-4 py-3">Trafikkintensitet — hold &lt; 1</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Access-rate m/cache</td>
                  <td className="px-4 py-3 font-mono">(1 - h) · La</td>
                  <td className="px-4 py-3">h = cache-hit-rate</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Snitt-delay</td>
                  <td className="px-4 py-3 font-mono">
                    h·d<sub>LAN</sub> + (1-h)·d<sub>full</sub>
                  </td>
                  <td className="px-4 py-3">Vektet snitt over hit/miss</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">304 Not Modified</td>
                  <td className="px-4 py-3">If-Modified-Since</td>
                  <td className="px-4 py-3">Validering, tom body</td>
                </tr>
              </tbody>
            </table>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-http2-hol" }} className="text-brand hover:underline">HTTP/1.1 vs HTTP/2 — HOL-blokkering</Link>
              {" "}— samme kapittel, ulike vinkler.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte2507-bottleneck-throughput" }} className="text-brand hover:underline">Bottleneck-throughput</Link>
              {" "}— mer Ch 1-matematikk om <Tex>{`\\min\\{R_i\\}`}</Tex>.
            </li>
          </ul>
        </div>
        <RelatedVisualizers slug="web-caching" />
      </article>
    </StackPageShell>
  );
}
