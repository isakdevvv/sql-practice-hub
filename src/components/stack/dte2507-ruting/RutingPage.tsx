import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { Tex } from "@/components/Tex";
import { RoutingGraphSim } from "./RoutingGraphSim";
import { LpmTrainer } from "./LpmTrainer";

const STEPS = [
  { title: "Data plane vs control plane", anchor: "planes" },
  { title: "Forwarding-tabell og LPM", anchor: "lpm" },
  { title: "IPv4-forwarding eksempel", anchor: "forward" },
  { title: "Distance-vector (Bellman-Ford)", anchor: "dv" },
  { title: "Link-state (Dijkstra)", anchor: "ls" },
  { title: "Path-vector (BGP)", anchor: "bgp" },
  { title: "Rute-graf simulator", anchor: "sim" },
  { title: "LPM-trener", anchor: "trener" },
  { title: "Eksamen-quick-ref", anchor: "ref" },
];

export function RutingPage() {
  return (
    <StackPageShell title="IP-forwarding og ruting" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2507 · Kurose &amp; Ross 4–5
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            IP-forwarding og ruting — hvordan pakker finner veien
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            En IP-pakke kjenner bare sin destinasjons-IP. Hvordan vet hver ruter på veien
            hvilken interface den skal sendes ut? Det er to bevegelser i hver ruter:
            <strong> forwarding</strong> (data plane: rask, per pakke) og <strong>routing</strong>
            (control plane: langsom, bygger tabellen). Vi ser på Dijkstra (link-state),
            Bellman-Ford (distance-vector) og hvorfor BGP er noe helt eget.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#sim" className="text-brand hover:underline">rute-graf-simulatoren</a>{" "}
              animerer Dijkstra og Bellman-Ford steg for steg. Endre vekter ved å klikke
              kantene.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2507-ruting" steps={STEPS} />

        <section id="planes" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Data plane vs control plane</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32"></th>
                  <th className="text-left font-semibold px-4 py-2">Data plane (forwarding)</th>
                  <th className="text-left font-semibold px-4 py-2">Control plane (routing)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Hva gjør</td>
                  <td className="px-4 py-3">Slår opp dest-IP i forwarding-tabell, sender ut</td>
                  <td className="px-4 py-3">Snakker med naboer, bygger tabellen</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Hastighet</td>
                  <td className="px-4 py-3">Nanosekunder per pakke (i ASIC)</td>
                  <td className="px-4 py-3">Sekunder til minutter</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Granularitet</td>
                  <td className="px-4 py-3">Per pakke</td>
                  <td className="px-4 py-3">Per nettverks-event (lenke opp/ned, nabo-melding)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Hvor</td>
                  <td className="px-4 py-3">Hardware (line cards)</td>
                  <td className="px-4 py-3">CPU + software (OSPF/BGP-daemon)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">SDN-twist</td>
                  <td className="px-4 py-3" colSpan={2}>
                    Software Defined Networking flytter control plane til en sentral kontroller
                    (OpenFlow). Switchen blir «dum» data plane.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="lpm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Forwarding-tabell og longest-prefix-match</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Tabellen er bare CIDR-prefix → next hop. For en gitt dest-IP slår ruteren opp
            <strong> alle prefix som matcher</strong> og velger det <em>lengste</em> (mest
            spesifikke). Default-ruten <Tex>{`0.0.0.0/0`}</Tex> matcher alt, men er kortest —
            den brukes bare hvis ingen annen rute treffer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Eksempel: dest 10.1.2.200 mot tabell:
            </div>
            <pre className="font-mono text-xs whitespace-pre overflow-x-auto leading-relaxed">{`Prefix             Next hop      Match for 10.1.2.200?
0.0.0.0/0          10.0.0.1      JA  (0 bits)
10.0.0.0/8         (direkte)     JA  (8 bits)
10.1.0.0/16        10.0.1.1      JA  (16 bits)
10.1.2.0/24        10.0.1.2      JA  (24 bits)
10.1.2.128/25      10.0.1.3      JA  (25 bits ← LENGST)
192.168.1.0/24     (direkte)     Nei

Vinner: 10.1.2.128/25 → 10.0.1.3`}</pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            På Linux: <code className="font-mono text-[11px]">ip route get 10.1.2.200</code>.
            Routerne implementerer LPM med trie-strukturer (Patricia, multibit) for å gjøre
            oppslaget i konstant tid uavhengig av tabellens størrelse.
          </p>
        </section>

        <section id="forward" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. IPv4-forwarding — én pakkes reise</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-[11px] whitespace-pre overflow-x-auto leading-relaxed">{`PC A (10.0.0.5)  ─┐
                  │  src=10.0.0.5  dst=8.8.8.8  TTL=64
                  ▼
              [Router R1]
                LPM → 0.0.0.0/0 via R2
                TTL-- → 63
                Re-MAC: dst=R2's MAC
                Send ut WAN-port
                  │
                  ▼
              [Router R2 (ISP)]
                LPM → 8.0.0.0/8 via R3
                TTL-- → 62
                  │
                  ▼
              [Router Rn]
                LPM → 8.8.8.0/24 direkte
                ARP for 8.8.8.8
                Re-MAC: dst=Google's MAC
                  │
                  ▼
              [8.8.8.8]`}</pre>
            <ul className="mt-3 text-xs text-muted-foreground space-y-1 list-disc pl-5">
              <li><strong>IP-adresser endres ikke</strong> underveis (med mindre NAT).</li>
              <li><strong>MAC-adresser endres på hvert hopp</strong> — re-skrives av hver ruter.</li>
              <li><strong>TTL dekrementeres</strong>. Når 0 → ICMP Time Exceeded tilbake (det er sånn traceroute virker).</li>
              <li><strong>Checksum oppdateres</strong> fordi TTL-feltet endret seg.</li>
            </ul>
          </div>
        </section>

        <section id="dv" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Distance-vector — Bellman-Ford</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver ruter kjenner kun sine direkte naboer og deres rapporterte avstander. Den
            kjører <strong>Bellman-Ford</strong>-oppdatering:
          </p>
          <div className="rounded-xl border border-border bg-card p-4 font-mono text-[11px] mb-3">
            <Tex>{`d_x(y) = \\min_{v \\in \\text{naboer}(x)} \\left\\{ c(x,v) + d_v(y) \\right\\}`}</Tex>
          </div>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Hver ruter sender hele sin distance-tabell til naboene jevnlig.</li>
            <li>Naboer oppdaterer egen tabell hvis de finner kortere vei via avsender.</li>
            <li>Konvergerer iterativt — kan ta mange runder.</li>
            <li><strong>Brukes av:</strong> RIP (Routing Information Protocol, hopp-teller, maks 15 hopp).</li>
            <li><strong>Problem:</strong> «Count to infinity» når en lenke faller — løses delvis med split horizon + poison reverse.</li>
          </ul>
        </section>

        <section id="ls" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Link-state — Dijkstra</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Hver ruter <em>kringkaster</em> sine egne lenke-koster til hele nettet (LSA — Link
            State Advertisement). Etter konvergens har <strong>alle</strong> ruterne et
            identisk kart, og kjører Dijkstra lokalt for å beregne korteste vei til alle
            destinasjoner.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Dijkstra-pseudokode
            </div>
            <pre className="font-mono text-[11px] whitespace-pre leading-relaxed">{`init: dist[s]=0, dist[andre]=∞, visited={}
mens visited ≠ alle noder:
  u = node med minst dist som ikke er visited
  legg u til visited
  for hver nabo v av u:
    alt = dist[u] + cost(u,v)
    hvis alt < dist[v]:
      dist[v] = alt
      pred[v] = u`}</pre>
          </div>
          <ul className="text-sm space-y-1 list-disc pl-5 mt-3">
            <li><strong>Brukes av:</strong> OSPF (Open Shortest Path First — intra-AS de-facto standard).</li>
            <li>Konvergerer raskere enn distance-vector fordi alle har samme kart.</li>
            <li>Mer minne og CPU — hver ruter må kjenne hele topologien.</li>
            <li>Skalerer via <strong>areas</strong> (OSPF) — topologien deles i regioner.</li>
          </ul>
        </section>

        <section id="bgp" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. BGP — path-vector for inter-AS</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            Internett består av tusenvis av <strong>autonome systemer</strong> (AS-er) — store
            nettverk under én organisasjon. <strong>BGP</strong> (Border Gateway Protocol)
            ruter mellom dem. Den er fundamentalt forskjellig fra OSPF/RIP:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Aspekt</th>
                  <th className="text-left font-semibold px-4 py-2">OSPF / RIP (IGP)</th>
                  <th className="text-left font-semibold px-4 py-2">BGP (EGP)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Mål</td>
                  <td className="px-4 py-3">Korteste vei</td>
                  <td className="px-4 py-3">Politikk og forretning</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Metric</td>
                  <td className="px-4 py-3">Kost, hopp</td>
                  <td className="px-4 py-3">AS-path lengde, local pref, MED, …</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Tillit</td>
                  <td className="px-4 py-3">Intern — alle samarbeider</td>
                  <td className="px-4 py-3">Mistenkelig — hvert AS har egne motiver</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Hva annonseres</td>
                  <td className="px-4 py-3">Lenke-koster eller distance-vektorer</td>
                  <td className="px-4 py-3">Hele AS-stien til prefixet (path vector)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">Transport</td>
                  <td className="px-4 py-3">Direkte over IP / UDP</td>
                  <td className="px-4 py-3">TCP port 179 — pålitelig sesjon</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            BGP-meldinger inneholder hele <strong>AS-path</strong> (eks. <code>AS1 AS2 AS3</code>)
            — hvert AS legger til seg selv. Det forhindrer loops og lar mottakeren se «hvem
            jeg ville gått gjennom». Politikk: et AS kan velge å rute via en partner selv om
            en annen sti er kortere.
          </p>
        </section>

        <section id="sim" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Rute-graf simulator</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Sammenlign Dijkstra og Bellman-Ford steg for steg på samme graf. Klikk en kant for
            å endre vekt eller fjerne kanten.
          </p>
          <RoutingGraphSim />
        </section>

        <section id="trener" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. LPM-trener</h2>
          <LpmTrainer />
        </section>

        <section id="ref" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">9. Eksamen-quick-ref</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Protokoll</th>
                  <th className="text-left font-semibold px-4 py-2">Algoritme</th>
                  <th className="text-left font-semibold px-4 py-2">Domene</th>
                  <th className="text-left font-semibold px-4 py-2">Bruksområde</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">RIP</td>
                  <td className="px-4 py-3">Distance-vector</td>
                  <td className="px-4 py-3">Intra-AS (IGP)</td>
                  <td className="px-4 py-3 text-muted-foreground">Smått, gammelt. Maks 15 hopp.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">OSPF</td>
                  <td className="px-4 py-3">Link-state (Dijkstra)</td>
                  <td className="px-4 py-3">Intra-AS (IGP)</td>
                  <td className="px-4 py-3 text-muted-foreground">De-facto standard i bedrift</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">IS-IS</td>
                  <td className="px-4 py-3">Link-state (Dijkstra)</td>
                  <td className="px-4 py-3">Intra-AS (IGP)</td>
                  <td className="px-4 py-3 text-muted-foreground">Vanlig hos ISPer</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">BGP</td>
                  <td className="px-4 py-3">Path-vector</td>
                  <td className="px-4 py-3">Inter-AS (EGP)</td>
                  <td className="px-4 py-3 text-muted-foreground">Limet på internett</td>
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
              <Link to="/stack/$slug" params={{ slug: "dte2507-subnetting" }} className="text-brand hover:underline">Subnetting &amp; CIDR</Link>
              {" "}— pre-rekvisitt for å forstå LPM.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              under emnet «DTE-2507».
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
