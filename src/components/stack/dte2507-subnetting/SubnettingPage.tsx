import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SubnetCalculator } from "./SubnetCalculator";
import { VlsmTrainer } from "./VlsmTrainer";

const STEPS = [
  { title: "Anatomien", anchor: "anatomi" },
  { title: "Binær mate (steg for steg)", anchor: "binaer" },
  { title: "Prefix-tabell /16 → /31", anchor: "prefix" },
  { title: "Del 10.0.0.0/16 i fire /18-er", anchor: "del" },
  { title: "Subnet-kalkulator", anchor: "kalk" },
  { title: "VLSM med tre subnett", anchor: "vlsm" },
  { title: "«Hvilket subnett tilhører IP?»", anchor: "tilhoerer" },
  { title: "Trener", anchor: "trener" },
  { title: "Private vs offentlige", anchor: "private" },
];

export function SubnettingPage() {
  return (
    <StackPageShell title="Subnetting" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · IPv4 og CIDR
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Subnetting — del opp nettverket
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En IPv4-adresse er 32 bits delt i fire bytes. Subnet-masken sier hvor mange av
            bittene som er <strong>nettverks-del</strong> og hvor mange som er
            <strong> host-del</strong>. /24 betyr 24 nettverks-bits, 8 host-bits — altså
            opptil 254 brukbare maskiner.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#kalk" className="text-brand hover:underline">subnet-kalkulatoren</a>{" "}
              og{" "}
              <a href="#trener" className="text-brand hover:underline">VLSM-treneren</a>{" "}
              under. Pugg med{" "}
              <Link to="/drag" className="text-brand hover:underline">drag under «Routing / IP»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-subnetting" steps={STEPS} />

        <section id="anatomi" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Anatomien</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`IP-adresse:    192.168.1.130    →  11000000.10101000.00000001.10000010
Maske /26:                       →  11111111.11111111.11111111.11000000

Network:       192.168.1.128    →  11000000.10101000.00000001.10000000
Broadcast:     192.168.1.191    →  11000000.10101000.00000001.10111111
Første host:   192.168.1.129
Siste host:    192.168.1.190
Brukbare:      62 stykker (2^6 − 2)`}</pre>
            <p className="text-xs text-muted-foreground mt-3">
              Regelen: network = IP AND maske. Broadcast = network OR (NOT maske). Brukbare =
              total − 2 (network + broadcast). For /31 og /32 er regelen annerledes (point-to-point).
            </p>
          </div>
        </section>

        <section id="binaer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Binær mate — slik regner du for hånd</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hver byte i en IP er 8 bits, hver bit har en verdi (128, 64, 32, 16, 8, 4, 2, 1).
            Lær denne tabellen utenat — så går resten av seg selv.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-16">Bit nr.</th>
                  <th className="text-left font-semibold px-3 py-2">7</th>
                  <th className="text-left font-semibold px-3 py-2">6</th>
                  <th className="text-left font-semibold px-3 py-2">5</th>
                  <th className="text-left font-semibold px-3 py-2">4</th>
                  <th className="text-left font-semibold px-3 py-2">3</th>
                  <th className="text-left font-semibold px-3 py-2">2</th>
                  <th className="text-left font-semibold px-3 py-2">1</th>
                  <th className="text-left font-semibold px-3 py-2">0</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Verdi</td><td className="px-3 py-2 font-mono">128</td><td className="px-3 py-2 font-mono">64</td><td className="px-3 py-2 font-mono">32</td><td className="px-3 py-2 font-mono">16</td><td className="px-3 py-2 font-mono">8</td><td className="px-3 py-2 font-mono">4</td><td className="px-3 py-2 font-mono">2</td><td className="px-3 py-2 font-mono">1</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">192</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">168</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">130</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">0</td><td className="px-3 py-2 font-mono">1</td><td className="px-3 py-2 font-mono">0</td></tr>
              </tbody>
            </table>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Steg 1 — IP og maske binært
              </div>
              <pre className="font-mono text-[10px] whitespace-pre leading-tight">{`IP    192.168.1.130
      11000000 10101000 00000001 10000010

/26   11111111 11111111 11111111 11000000
      └── 24 ettere ──┘ └─ 2 til = 26
                          host-bits = 6`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Steg 2 — AND for network
              </div>
              <pre className="font-mono text-[10px] whitespace-pre leading-tight">{`IP    11000000 10101000 00000001 10000010
maske 11111111 11111111 11111111 11000000
AND   ─────────────────────────────────────
net   11000000 10101000 00000001 10000000
      192      168      1        128

→ Network = 192.168.1.128`}</pre>
            </div>
          </div>
        </section>

        <section id="prefix" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Prefix-tabell</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Prefix</th>
                  <th className="text-left font-semibold px-4 py-2">Maske</th>
                  <th className="text-left font-semibold px-4 py-2">Adresser</th>
                  <th className="text-left font-semibold px-4 py-2">Brukbare</th>
                  <th className="text-left font-semibold px-4 py-2">Typisk bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/16</td><td className="px-4 py-3 font-mono">255.255.0.0</td><td className="px-4 py-3 font-mono">65536</td><td className="px-4 py-3 font-mono">65534</td><td className="px-4 py-3 text-muted-foreground">Stort campus</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/22</td><td className="px-4 py-3 font-mono">255.255.252.0</td><td className="px-4 py-3 font-mono">1024</td><td className="px-4 py-3 font-mono">1022</td><td className="px-4 py-3 text-muted-foreground">Stor avdeling</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/23</td><td className="px-4 py-3 font-mono">255.255.254.0</td><td className="px-4 py-3 font-mono">512</td><td className="px-4 py-3 font-mono">510</td><td className="px-4 py-3 text-muted-foreground">Mellomstor</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/24</td><td className="px-4 py-3 font-mono">255.255.255.0</td><td className="px-4 py-3 font-mono">256</td><td className="px-4 py-3 font-mono">254</td><td className="px-4 py-3 text-muted-foreground">Hjemmenett, SMB</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/25</td><td className="px-4 py-3 font-mono">255.255.255.128</td><td className="px-4 py-3 font-mono">128</td><td className="px-4 py-3 font-mono">126</td><td className="px-4 py-3 text-muted-foreground">Etasje</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/26</td><td className="px-4 py-3 font-mono">255.255.255.192</td><td className="px-4 py-3 font-mono">64</td><td className="px-4 py-3 font-mono">62</td><td className="px-4 py-3 text-muted-foreground">Avdeling</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/27</td><td className="px-4 py-3 font-mono">255.255.255.224</td><td className="px-4 py-3 font-mono">32</td><td className="px-4 py-3 font-mono">30</td><td className="px-4 py-3 text-muted-foreground">Lite team</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/28</td><td className="px-4 py-3 font-mono">255.255.255.240</td><td className="px-4 py-3 font-mono">16</td><td className="px-4 py-3 font-mono">14</td><td className="px-4 py-3 text-muted-foreground">Server-rack</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/29</td><td className="px-4 py-3 font-mono">255.255.255.248</td><td className="px-4 py-3 font-mono">8</td><td className="px-4 py-3 font-mono">6</td><td className="px-4 py-3 text-muted-foreground">Liten DMZ</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/30</td><td className="px-4 py-3 font-mono">255.255.255.252</td><td className="px-4 py-3 font-mono">4</td><td className="px-4 py-3 font-mono">2</td><td className="px-4 py-3 text-muted-foreground">P2P-link</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/31</td><td className="px-4 py-3 font-mono">255.255.255.254</td><td className="px-4 py-3 font-mono">2</td><td className="px-4 py-3 font-mono">2 (P2P)</td><td className="px-4 py-3 text-muted-foreground">P2P uten waste</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="del" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Del 10.0.0.0/16 i fire /18-er</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Når du legger til 2 bits til prefixet (16 → 18) får du 2² = 4 like store delsubnett.
            Hver /18 har 2¹⁴ = 16384 adresser. Skritt-størrelsen er 64 i andre oktett.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-12">#</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Network</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Broadcast</th>
                  <th className="text-left font-semibold px-4 py-2">Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">1</td><td className="px-4 py-3 font-mono">10.0.0.0/18</td><td className="px-4 py-3 font-mono">10.0.63.255</td><td className="px-4 py-3 text-muted-foreground">10.0.0.1 – 10.0.63.254</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">2</td><td className="px-4 py-3 font-mono">10.0.64.0/18</td><td className="px-4 py-3 font-mono">10.0.127.255</td><td className="px-4 py-3 text-muted-foreground">10.0.64.1 – 10.0.127.254</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">3</td><td className="px-4 py-3 font-mono">10.0.128.0/18</td><td className="px-4 py-3 font-mono">10.0.191.255</td><td className="px-4 py-3 text-muted-foreground">10.0.128.1 – 10.0.191.254</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">4</td><td className="px-4 py-3 font-mono">10.0.192.0/18</td><td className="px-4 py-3 font-mono">10.0.255.255</td><td className="px-4 py-3 text-muted-foreground">10.0.192.1 – 10.0.255.254</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Tips:</strong> «hvilken skritt-størrelse?» = 256 / 2^(prefixbits
            innen oktetten). Her er 18 = 16 (full oktett) + 2 bits → 256/4 = 64. Skritt 64 i 2.
            oktett gir 0, 64, 128, 192.
          </div>
        </section>

        <section id="kalk" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Subnet-kalkulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Skriv en CIDR-adresse. Få nettverk, broadcast, brukbar range og binær representasjon.
          </p>
          <SubnetCalculator />
        </section>

        <section id="vlsm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. VLSM — variabel maske-lengde</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Vi får 192.168.1.0/24 (256 adresser) og skal lage tre subnet:
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Salg: 100 maskiner → /25 (128 adresser, 126 brukbare) → 192.168.1.0–127</li>
              <li>IT: 50 maskiner → /26 (64 adresser, 62 brukbare) → 192.168.1.128–191</li>
              <li>Server-rom: 10 maskiner → /28 (16 adresser, 14 brukbare) → 192.168.1.192–207</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Trick:</strong> sortér behov fra stort til lite. Plasser største først.
              Hver subnet starter på en grense som er DELELIG MED størrelsen sin.
            </p>
          </div>
        </section>

        <section id="tilhoerer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. «Hvilket subnett tilhører IP X?»</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Klassisk eksamen-mønster. Vi har VLSM-en fra forrige seksjon og spør: hvor hører
            192.168.1.135 hjemme?
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-12">#</th>
                  <th className="text-left font-semibold px-4 py-2">Sjekk</th>
                  <th className="text-left font-semibold px-4 py-2">Resultat</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">1</td><td className="px-4 py-3 text-muted-foreground">Finn fjerde oktett av IP: 135</td><td className="px-4 py-3 font-mono">135</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">2</td><td className="px-4 py-3 text-muted-foreground">Subnet Salg /25: 0–127. Inkluderer 135?</td><td className="px-4 py-3 text-destructive">Nei (135 &gt; 127)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">3</td><td className="px-4 py-3 text-muted-foreground">Subnet IT /26: 128–191. Inkluderer 135?</td><td className="px-4 py-3 text-success">JA</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">4</td><td className="px-4 py-3 text-muted-foreground">Konklusjon</td><td className="px-4 py-3 font-mono">→ IT-subnettet (192.168.1.128/26)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Eksamen-felle:</strong>{" "}
            ikke glem at network-adressen (.128) og broadcast (.191) ikke kan brukes som host —
            men de tilhører subnettet. Hvis spørsmålet er «kan denne IP-en tildeles en datamaskin?»
            må du sjekke om det er .0/.128/.192/etc. eller broadcast.
          </div>
        </section>

        <section id="trener" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Trener</h2>
          <VlsmTrainer />
        </section>

        <section id="private" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Private vs offentlige adresser</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Private (RFC 1918):
  10.0.0.0/8         — store nettverk
  172.16.0.0/12      — mellomstore
  192.168.0.0/16     — hjem / SMB

Spesielle:
  127.0.0.0/8        — loopback (localhost)
  169.254.0.0/16     — link-local (DHCP failed)
  224.0.0.0/4        — multicast
  255.255.255.255    — limited broadcast`}</pre>
            <p className="text-xs text-muted-foreground mt-2">
              Private adresser kan ikke rutes på Internett — derfor trenger du NAT for å nå ut.
            </p>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-brannmur-vlan" }} className="text-brand hover:underline">Brannmur og VLAN</Link>
              {" "}— neste lag: hvordan rute mellom subnett trygt.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Routing / IP».
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>praktisk</em>.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
