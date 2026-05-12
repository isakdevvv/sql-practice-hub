import { StackPageShell } from "@/components/stack/StackPageShell";
import { SubnetCalculator } from "./SubnetCalculator";
import { VlsmTrainer } from "./VlsmTrainer";

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
        </header>

        <section className="mb-10">
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Prefix-tabell</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Prefix</th>
                  <th className="text-left font-semibold px-4 py-2">Maske</th>
                  <th className="text-left font-semibold px-4 py-2">Adresser</th>
                  <th className="text-left font-semibold px-4 py-2">Brukbare</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/24</td><td className="px-4 py-3 font-mono">255.255.255.0</td><td className="px-4 py-3 font-mono">256</td><td className="px-4 py-3 font-mono">254</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/25</td><td className="px-4 py-3 font-mono">255.255.255.128</td><td className="px-4 py-3 font-mono">128</td><td className="px-4 py-3 font-mono">126</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/26</td><td className="px-4 py-3 font-mono">255.255.255.192</td><td className="px-4 py-3 font-mono">64</td><td className="px-4 py-3 font-mono">62</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/27</td><td className="px-4 py-3 font-mono">255.255.255.224</td><td className="px-4 py-3 font-mono">32</td><td className="px-4 py-3 font-mono">30</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/28</td><td className="px-4 py-3 font-mono">255.255.255.240</td><td className="px-4 py-3 font-mono">16</td><td className="px-4 py-3 font-mono">14</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/29</td><td className="px-4 py-3 font-mono">255.255.255.248</td><td className="px-4 py-3 font-mono">8</td><td className="px-4 py-3 font-mono">6</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/30</td><td className="px-4 py-3 font-mono">255.255.255.252</td><td className="px-4 py-3 font-mono">4</td><td className="px-4 py-3 font-mono">2</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/31</td><td className="px-4 py-3 font-mono">255.255.255.254</td><td className="px-4 py-3 font-mono">2</td><td className="px-4 py-3 font-mono">2 (point-to-point)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Subnet-kalkulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Skriv en CIDR-adresse. Få nettverk, broadcast, brukbar range og binær representasjon.
          </p>
          <SubnetCalculator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. VLSM — variabel maske-lengde</h2>
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Trener</h2>
          <VlsmTrainer />
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">6. Private vs offentlige adresser</h2>
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
      </article>
    </StackPageShell>
  );
}
