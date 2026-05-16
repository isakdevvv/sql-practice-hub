import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex, TexBlock } from "@/components/Tex";
import { AddressTranslator } from "./AddressTranslator";
import { CacheHierarchy } from "./CacheHierarchy";
import { MemoryLayout } from "./MemoryLayout";
import { PageReplacementSim } from "./PageReplacementSim";
import { InodeStructure } from "./InodeStructure";

const STEPS = [
  { title: "Hvorfor virtuelt minne", anchor: "hvorfor" },
  { title: "Pages, frames, page table", anchor: "pages" },
  { title: "Adresseoversettelse", anchor: "oversett" },
  { title: "Page-table-strukturer", anchor: "strukturer" },
  { title: "TLB — cachen for oversettelser", anchor: "tlb" },
  { title: "Cache-hierarkiet (interaktiv)", anchor: "cache" },
  { title: "Adresserommet — stack/heap/.data/.text", anchor: "layout" },
  { title: "Page faults og demand paging", anchor: "faults" },
  { title: "Replacement-algoritmer", anchor: "replace" },
  { title: "Page-replacement-simulator", anchor: "pagesim" },
  { title: "Working set + thrashing", anchor: "ws" },
  { title: "Inode-struktur (filsystem)", anchor: "inode" },
  { title: "Interaktiv oversetter", anchor: "drill" },
  { title: "Eksamen-feller", anchor: "feller" },
];

export function VirtueltMinnePage() {
  return (
    <StackPageShell title="Virtuelt minne &amp; paging" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OSTEP kap. 15–22
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Virtuelt minne — paging, TLB og page faults
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Hver prosess tror den har sitt eget enorme adresserom som starter på 0. I virkeligheten
            deler den fysisk RAM med dusinvis av andre prosesser, og adressene oversettes via en
            page-tabell. Dette er det viktigste konseptet i hele kurset — uten det dør isolasjon,
            multitasking og swap.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#drill" className="text-brand hover:underline">
                Adresseoversetteren
              </a>{" "}
              lengre ned — skriv en virtuell adresse, se VPN/offset/TLB/page table steg for steg.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-virtuelt-minne" steps={STEPS} />

        <Section number="1" id="hvorfor" title="Hvorfor virtuelt minne">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Isolasjon.</strong> Prosess A kan ikke lese eller
              skrive i prosess B sitt minne — adressene deres mapper til forskjellige fysiske
              frames.
            </li>
            <li>
              <strong className="text-foreground">Mer adresserom enn fysisk RAM.</strong> En 64-bit
              prosess har 2⁴⁸ byte teoretisk adresserom (256 TB). Maskinen har ofte 16 GB. Resten
              ligger på disk (swap) — eller er aldri allokert.
            </li>
            <li>
              <strong className="text-foreground">Enkel allokering.</strong> Kernelen kan gi en
              prosess et sammenhengende virtuelt område selv om frames i RAM er fragmentert.
            </li>
            <li>
              <strong className="text-foreground">Beskyttelse.</strong> Hver PTE har bits for r/w/x.
              Kjør-bare sider er ikke skrivbare; data-sider er ikke kjør-bare (W^X mot exploit).
            </li>
          </ul>
        </Section>

        <Section number="2" id="pages" title="Pages, frames og page table">
          <p className="text-sm text-muted-foreground mb-3">
            Minne deles inn i <strong>pages</strong> (virtuelle) og <strong>frames</strong>{" "}
            (fysiske). Vanlig page-størrelse: 4 KB (12 bits offset). Page table mapper hver page
            (VPN) til en frame (PFN).
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Term</th>
                  <th className="text-left font-semibold px-3 py-2">Betydning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Page</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Blokk i virtuelt minne (typisk 4 KB).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Frame</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Blokk i fysisk RAM, samme størrelse som en page.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">VPN</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Virtual Page Number — den øvre delen av virtuell adresse.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">PFN</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Physical Frame Number — adressen i RAM.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">PTE</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Page Table Entry — én rad: PFN + valid + r/w/x + accessed + dirty + present.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Offset</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Posisjon innenfor pagen — nedre n bits, der <Tex>{`2^n`}</Tex> = page-størrelse.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="3" id="oversett" title="Adresseoversettelse — formelen">
          <p className="text-sm text-muted-foreground mb-3">
            Gitt en virtuell adresse, splittet i VPN og offset:
          </p>
          <TexBlock>{`\\text{VPN} = \\text{VA} \\gg n, \\qquad \\text{offset} = \\text{VA} \\bmod 2^n`}</TexBlock>
          <p className="text-sm text-muted-foreground mb-3">
            Slå opp VPN i page-tabellen for å få PFN. Bygg deretter fysisk adresse:
          </p>
          <TexBlock>{`\\text{PA} = \\text{PFN} \\cdot 2^n + \\text{offset}`}</TexBlock>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel — 16-bit VA, 4 KB pages (n=12)
            </div>
            <pre className="text-xs font-mono">{`VA = 0x2123 = 0010 0001 0010 0011
       VPN=2 (4 bits)   offset=0x123 (12 bits)

Page table[2] = PFN 7, valid=1

PA = 7 * 4096 + 0x123
   = 0x7000 + 0x123
   = 0x7123`}</pre>
          </div>
        </Section>

        <Section number="4" id="strukturer" title="Page-table-strukturer">
          <p className="text-sm text-muted-foreground mb-3">
            En lineær tabell over alle mulige VPN-er blir gigantisk i 64-bit. Tre strategier:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-36">Struktur</th>
                  <th className="text-left font-semibold px-3 py-2">Hvordan</th>
                  <th className="text-left font-semibold px-3 py-2">Pris</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Lineær</td>
                  <td className="px-3 py-2 text-muted-foreground">Én rad per VPN.</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Sløser plass på ubrukte sider — uakseptabelt i 64-bit.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Multi-level</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tre eller fire nivåer (x86-64: 4 nivåer). VPN-bitsene deles i indekser inn i
                    hvert nivå.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Sparer minne (ubrukte grener allokeres ikke), men 4 minneaksesser per
                    oversettelse.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Invertert</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Én rad per FYSISK frame i stedet for per VPN. Hash-oppslag.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Lite minne (begrenset av RAM-størrelse), men oppslag kan kollidere.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Linux på x86-64 bruker fire-nivå multi-level (siden 4.12 også fem-nivå for &gt;48-bit
            adressering). Hver prosess har sin egen rot-tabell, pekt av{" "}
            <code className="font-mono">CR3</code>-registeret.
          </p>
        </Section>

        <Section number="5" id="tlb" title="TLB — cachen for oversettelser">
          <p className="text-sm text-muted-foreground mb-3">
            Hvis hver minneaksess krevde 4 page-table-oppslag, ville alt vært tregt. TLB-en
            (Translation Lookaside Buffer) er en liten, superrask cache i MMU-en som husker nylige
            (VPN → PFN)-par.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <pre className="text-xs font-mono">{`Virtuell adresse
        │
        ▼
   ┌────────┐    hit
   │  TLB   │──────────► PFN (1 cycle)
   └────────┘
        │ miss
        ▼
   ┌────────────────┐
   │  Page-tabell   │   4 minneaksesser (x86-64)
   └────────────────┘
        │
        ▼
   PFN cachet i TLB`}</pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Typisk TLB-størrelse: 64–1024 entries. Hit-rate &gt; 99 % i godt skrevne programmer
            (sekvensiell tilgang). <strong>Context-switch:</strong> TLB-en må flushes (eller bruke
            ASID-tagging), ellers ville prosess B lese prosess A sine adresser.
          </p>
        </Section>

        <Section number="6" id="cache" title="Cache-hierarkiet — fysisk intuisjon">
          <p className="text-sm text-muted-foreground mb-3">
            TLB-en er en cache for adresseoversettelser, men hele maskinen er bygd opp av
            cache-nivåer. Hvert nivå er <em>en størrelsesorden</em> tregere enn forrige, men også
            betydelig større. Brukeren <strong>må</strong> ha intuitivt grep om disse forskjellene
            for å forstå hvorfor det å treffe L1 i 99 % av tilfellene er forskjellen på rask og treg
            kode.
          </p>
          <CacheHierarchy />
        </Section>

        <Section number="7" id="layout" title="Adresserommet — hva ligger hvor i prosessen">
          <p className="text-sm text-muted-foreground mb-3">
            Når kernelen mapper page-tabellen din til fysisk RAM, deler kompilator og kernel det
            virtuelle adresserommet inn i faste segmenter. Du må kjenne dem: stack (vokser ned,
            function frames), heap (vokser opp, <code className="font-mono">malloc()</code>),
            <code className="font-mono">.bss</code>/<code className="font-mono">.data</code>{" "}
            (globale variabler), og <code className="font-mono">.text</code> (kode, read-only).
            Klikk knappene under for å kalle funksjoner, alloker på heap, og se hvordan en
            buffer-overflow overskriver en naboers return-adresse.
          </p>
          <MemoryLayout />
        </Section>

        <Section number="8" id="faults" title="Page faults og demand paging">
          <p className="text-sm text-muted-foreground mb-3">
            En PTE har et <code className="font-mono">present</code>-bit. Hvis det er 0 ved en
            aksess — <strong>page fault</strong>. Kernelen tar over via trap-handler.
          </p>
          <div className="rounded-xl border border-border bg-card p-4 mb-3">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Tre typer page fault
            </div>
            <ul className="text-xs text-foreground space-y-2">
              <li>
                <strong>Minor (soft) fault:</strong> siden er i RAM, men ikke i prosessens
                page-tabell ennå (f.eks. delt bibliotek). Bare oppdater PTE.
              </li>
              <li>
                <strong>Major (hard) fault:</strong> siden er på disk (swap eller mmap-fil). Les inn
                fra disk → finn en frame → oppdater PTE → restart instruksjonen. Tar millisekunder
                (10⁶× tregere enn RAM).
              </li>
              <li>
                <strong>Invalid fault:</strong> adressen er ikke gyldig i det hele tatt (typisk
                null-pointer-dereferensiering eller stack-overflow). Kernelen sender SIGSEGV →
                segfault.
              </li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Demand paging:</strong> sider lastes IKKE fra disk før prosessen faktisk treffer
            dem. Det er derfor <code className="font-mono">malloc(1 GB)</code> er momentant — du
            betaler først når du skriver til minnet.
          </p>
        </Section>

        <Section number="9" id="replace" title="Replacement — hvilken side kastes ut?">
          <p className="text-sm text-muted-foreground mb-3">
            Når RAM er full og vi trenger en frame for en innkommende side, må noe kastes ut.
            Algoritmen som velger ofrer:
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Algoritme</th>
                  <th className="text-left font-semibold px-3 py-2">Hvordan</th>
                  <th className="text-left font-semibold px-3 py-2">Egenskap</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Optimal (Belady)</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Kast siden som blir brukt lengst inn i fremtiden.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Teoretisk minimum. Ikke implementérbar (krever spådom).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">FIFO</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Kast den som har vært lengst i RAM.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Enkel. Kan oppvise <em>Beladys anomali</em>: flere frames → flere faults.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">LRU</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Kast den som er minst nylig brukt.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    God tilnærming til optimal, men dyr å implementere eksakt (krever timestamping
                    ved hver aksess).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-brand">Clock</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Sirkulær liste + reference-bit. Sjekk bit, sett til 0 hvis 1, gå videre; kast
                    hvis 0.
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Tilnærmer LRU billig. Brukes (med varianter) i Linux.
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Random</td>
                  <td className="px-3 py-2 text-muted-foreground">Velg tilfeldig frame.</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    Overraskende OK i workloads uten sterk lokalitet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          number="10"
          id="pagesim"
          title="Page-replacement-simulator — kjør algoritmene side om side"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Skriv en reference string, velg antall frames, og bytt mellom FIFO,
            LRU, Clock og Optimal. Tabellen viser frame-innholdet ved hvert
            steg, og søylediagrammet sammenligner total faults. Belady-insetten
            nederst varierer frame-tallet 3-5 og avslører om reference-strengen
            din viser <em>Beladys anomali</em> for FIFO.
          </p>
          <PageReplacementSim />
        </Section>

        <Section number="11" id="ws" title="Working set + thrashing">
          <p className="text-sm text-muted-foreground mb-3">
            <strong>Working set W(t, Δ):</strong> sett av sider prosessen har rørt i de siste Δ
            tidsenhetene. Hvis summen av alle prosessers working sets &gt; RAM:
          </p>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 mb-3">
            <div className="text-sm">
              <strong className="text-rose-600 dark:text-rose-400">Thrashing.</strong> Systemet
              bruker mer tid på å lese og skrive sider mellom RAM og disk enn på å regne.
              CPU-utnyttelse går mot 0, men disken er konstant 100 %. Eneste utvei: drep en prosess
              (OOM-killer) eller swap inn mer RAM.
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Linux-OOM:</strong> kernelen sender SIGKILL til prosessen med høyest{" "}
            <code className="font-mono">oom_score</code> når den ikke kan finne mer minne. Se{" "}
            <code className="font-mono">dmesg</code> etter «Killed process».
          </p>
        </Section>

        <Section
          number="12"
          id="inode"
          title="Inode-struktur — direkte, indirect, double, triple"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Page-tabellen mapper virtuelle adresser til frames. Filsystemet har
            sin egen indirection-struktur: <strong>inoden</strong>. Hver fil har
            en inode med 12 direkte blokk-pekere + én indirect + én
            double-indirect + én triple-indirect. Dra sliderne for å se hvilke
            pekere som faktisk tas i bruk for en gitt filstørrelse, og les av
            maks-størrelsen for 4 KB-blokker og 32-bit-pekere.
          </p>
          <InodeStructure />
        </Section>

        <Section number="13" id="drill" title="Interaktiv: skriv en virtuell adresse">
          <p className="text-sm text-muted-foreground mb-3">
            Skriv en virtuell adresse i hex (0x...) eller desimal. Se VPN/offset-split, TLB-oppslag
            (grønn = hit), page-tabell-oppslag, og ferdig fysisk adresse. Tre presets demonstrerer
            TLB-hit, TLB-miss og page fault.
          </p>
          <AddressTranslator />
        </Section>

        <Section number="14" id="feller" title="Eksamen-feller">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Glemte at offset ikke endrer seg.</strong> Bare
              VPN oversettes; offset er det samme i VA og PA.
            </li>
            <li>
              <strong className="text-foreground">
                Forveksler page-størrelse-bits og total VA-bits.
              </strong>{" "}
              4 KB pages = 12 offset-bits. 32-bit VA = 32 − 12 = 20 VPN-bits.
            </li>
            <li>
              <strong className="text-foreground">«TLB-miss = page fault».</strong> Nei. TLB-miss
              betyr bare «slå opp i page-tabellen». Page fault skjer kun hvis PTE har valid=0 eller
              present=0.
            </li>
            <li>
              <strong className="text-foreground">
                Trodde at virtuelt minne automatisk gir mer RAM.
              </strong>{" "}
              Nei — det gir mer adresserom, men hvis du faktisk bruker det, må sider swappes. Hvis
              swap er av, OOM-killer kicker inn.
            </li>
            <li>
              <strong className="text-foreground">
                Beladys anomali — visste ikke at den finnes.
              </strong>{" "}
              FIFO kan ha FLERE faults med flere frames. LRU og optimal kan ikke.
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              OSTEP kap. 15 (Address Spaces), 18 (Paging), 19 (TLB), 21–22 (Beyond Physical, Policy)
              —{" "}
              <a
                href="https://pages.cs.wisc.edu/~remzi/OSTEP/"
                className="text-brand hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                pages.cs.wisc.edu/~remzi/OSTEP
              </a>
              .
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-scheduling-drill" }}
                className="text-brand hover:underline"
              >
                CPU-scheduling
              </Link>{" "}
              — den andre store OS-mekanismen.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-konkurrens" }}
                className="text-brand hover:underline"
              >
                Concurrency &amp; deadlock
              </Link>{" "}
              — låser og synkronisering.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
