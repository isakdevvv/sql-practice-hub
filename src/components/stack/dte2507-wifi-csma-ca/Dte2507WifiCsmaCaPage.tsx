import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Wifi } from "lucide-react";

type Tab = "intro" | "live";

export function Dte2507WifiCsmaCaPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">WiFi — CSMA/CA og RTS/CTS</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Kurose kap. 7.2. Hvorfor WiFi <em>ikke</em> kan kollisjons-detektere som kablet Ethernet
            — og hvordan CSMA/CA + RTS/CTS løser «hidden terminal»-problemet. Bygger på
            dte2507-aloha-kasino.
          </p>
        </header>
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "live"}
            onClick={() => setTab("live")}
            icon={<Wifi className="h-3.5 w-3.5" />}
          >
            1. CSMA/CD vs CSMA/CA
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <CsmaModule />}
        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
  );
}
function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">ALOHA & CSMA/CD</strong> (
            <code>dte2507-aloha-kasino</code>): «slot ALOHA», «sense before sending»,
            kollisjons-deteksjon med backoff.
          </li>
          <li>
            <strong className="text-foreground">MAC-laget</strong>: rammer på linklaget,
            MAC-adresser, broadcast-domener.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">
          Hvorfor WiFi ikke kan «collision detection»
        </h2>
        <p className="text-muted-foreground">
          I kablet Ethernet kan en sender LYTTE på kabelen mens den sender. Hvis to noder sender
          samtidig, ser de begge en forvrengt signal og <em>vet</em> at det er kollisjon. Det heter
          CSMA/CD (Collision Detection).
        </p>
        <p className="text-muted-foreground mt-2">
          WiFi kan ikke det. Radio er halv-duplex: en sender kan ikke lytte på sitt EGET sterke
          signal samtidig som den sender. I tillegg er det <em>hidden terminal</em>-problemet: A kan
          høre AP-en, og C kan høre AP-en, men A og C kan IKKE høre hverandre. De vet ikke om den
          andre sender.
        </p>
        <p className="text-muted-foreground mt-2">
          <strong className="text-foreground">Løsningen: CSMA/CA</strong> (Collision Avoidance). I
          stedet for å detektere kollisjoner prøver vi å unngå dem. Pluss RTS/CTS som
          «reservasjon-protokoll» for store rammer.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="CSMA">
            Carrier Sense Multiple Access. «Lytt før du sender». Alle WiFi-noder venter til luften
            er ledig før de prøver å sende.
          </Def>
          <Def term="CSMA/CD vs CSMA/CA">
            CD = Collision Detection (kablet Ethernet). CA = Collision Avoidance (WiFi).
            Forskjellen: CD reagerer på kollisjoner mens de skjer; CA forsøker å forhindre dem.
          </Def>
          <Def term="DIFS / SIFS">
            Distributed/Short Inter-Frame Space. Stille-perioder med faste lengder:
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>SIFS</strong> (~10 µs): kort, brukt mellom RTS/CTS/DATA/ACK i samme
                utveksling.
              </li>
              <li>
                <strong>DIFS</strong> (~50 µs): lengre, krevd FØR en helt ny ramme kan sendes.
              </li>
            </ul>
          </Def>
          <Def term="Backoff (random)">
            Etter DIFS venter senderen ekstra tilfeldig tid (et tall av slots). To noder som vil
            sende samtidig får dermed ulik ventetid og kolliderer ikke. Kollisjon → backoff dobles
            (exponential backoff).
          </Def>
          <Def term="RTS / CTS">
            Request to Send / Clear to Send. Små kontroll-rammer:
            <ul className="list-disc pl-5 mt-1">
              <li>Sender → AP: «Jeg vil sende N bytes» (RTS).</li>
              <li>AP → alle: «Klar, hold luften stille i N µs» (CTS).</li>
              <li>Alle andre hører CTS-en og holder seg unna.</li>
            </ul>
          </Def>
          <Def term="Hidden terminal">
            A og C er begge innenfor AP-ens rekkevidde, men ikke innenfor hverandres. Uten RTS/CTS
            kan de begge tenke «luften er ledig» samtidig og kollidere på AP-en. RTS/CTS fikser
            dette fordi AP-ens CTS når begge.
          </Def>
          <Def term="ACK">
            Etter at en ramme er mottatt riktig sender mottakeren en ACK-ramme. Hvis senderen ikke
            ser ACK innen et timeout, antar den kollisjon og prøver på nytt med dobbel backoff.
          </Def>
        </dl>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("live")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

type Event = {
  t: number;
  node: string;
  type: "DIFS" | "BACKOFF" | "RTS" | "CTS" | "DATA" | "ACK" | "SIFS" | "JAM";
  len: number;
  color: string;
};

function CsmaModule() {
  const [mode, setMode] = useState<"cd" | "ca" | "ca-rtscts">("cd");
  const [scenario, setScenario] = useState<"none" | "hidden">("hidden");

  const events: Event[] = useMemo(() => buildScenario(mode, scenario), [mode, scenario]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hva skjer:</strong> to noder A og C vil sende til AP-en
        samtidig. I scenario «hidden» kan A og C ikke høre hverandre direkte. Se hvordan hver modell
        håndterer situasjonen — særlig hvor RTS/CTS endrer alt.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="text-xs text-muted-foreground self-center">Modell:</div>
          <Button
            size="sm"
            variant={mode === "cd" ? "default" : "outline"}
            onClick={() => setMode("cd")}
          >
            CSMA/CD (Ethernet)
          </Button>
          <Button
            size="sm"
            variant={mode === "ca" ? "default" : "outline"}
            onClick={() => setMode("ca")}
          >
            CSMA/CA (WiFi, uten RTS)
          </Button>
          <Button
            size="sm"
            variant={mode === "ca-rtscts" ? "default" : "outline"}
            onClick={() => setMode("ca-rtscts")}
          >
            CSMA/CA + RTS/CTS
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="text-xs text-muted-foreground self-center">Scenario:</div>
          <Button
            size="sm"
            variant={scenario === "none" ? "default" : "outline"}
            onClick={() => setScenario("none")}
          >
            A og C ser hverandre
          </Button>
          <Button
            size="sm"
            variant={scenario === "hidden" ? "default" : "outline"}
            onClick={() => setScenario("hidden")}
          >
            Hidden terminal (A og C ser IKKE hverandre)
          </Button>
        </div>

        <div className="space-y-2">
          {["A", "C", "AP"].map((node) => (
            <div key={node} className="flex items-center gap-2">
              <span className="font-mono text-xs w-8 text-muted-foreground">{node}</span>
              <div className="flex-1 h-7 rounded bg-muted relative overflow-hidden">
                {events
                  .filter((e) => e.node === node)
                  .map((e, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 bottom-0 ${e.color} flex items-center justify-center text-[9px] font-mono text-white border-r border-background`}
                      style={{ left: `${e.t}%`, width: `${e.len}%` }}
                      title={`${e.type} på t=${e.t}-${e.t + e.len}`}
                    >
                      {e.type}
                    </div>
                  ))}
              </div>
            </div>
          ))}
          <div className="text-[10px] text-muted-foreground pl-10">tid →</div>
        </div>

        <div className="mt-4 rounded border border-border bg-background p-2 text-[11px] space-y-1">
          {describeScenario(mode, scenario).map((line, i) => (
            <div key={i} className="text-muted-foreground">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildScenario(mode: "cd" | "ca" | "ca-rtscts", scenario: "none" | "hidden"): Event[] {
  const ev: Event[] = [];
  const cAmber = "bg-amber-500",
    cBrand = "bg-brand",
    cSuccess = "bg-success",
    cDestructive = "bg-destructive";

  if (mode === "cd") {
    if (scenario === "hidden") {
      // Hidden i kablet-modus: ikke et reelt scenario, men hvis det var ville det skjedd kollisjon de begge oppdager
      ev.push({ t: 5, node: "A", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "A", type: "DATA", len: 25, color: cBrand });
      ev.push({ t: 5, node: "C", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "C", type: "DATA", len: 25, color: cBrand });
      ev.push({ t: 9, node: "AP", type: "JAM", len: 25, color: cDestructive });
      ev.push({ t: 40, node: "A", type: "DATA", len: 25, color: cBrand });
      ev.push({ t: 65, node: "AP", type: "ACK", len: 4, color: cSuccess });
    } else {
      // Vanlig kollisjon detekteres av A og C
      ev.push({ t: 5, node: "A", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "A", type: "DATA", len: 8, color: cDestructive });
      ev.push({ t: 5, node: "C", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "C", type: "DATA", len: 8, color: cDestructive });
      ev.push({ t: 17, node: "A", type: "BACKOFF", len: 6, color: cAmber });
      ev.push({ t: 23, node: "A", type: "DATA", len: 25, color: cBrand });
      ev.push({ t: 48, node: "AP", type: "ACK", len: 4, color: cSuccess });
    }
  } else if (mode === "ca") {
    if (scenario === "hidden") {
      // Hidden terminal — begge sender, kolliderer hos AP, men hverken A eller C MERKET det før timeout
      ev.push({ t: 5, node: "A", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "A", type: "BACKOFF", len: 3, color: cAmber });
      ev.push({ t: 12, node: "A", type: "DATA", len: 25, color: cDestructive });
      ev.push({ t: 6, node: "C", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 10, node: "C", type: "BACKOFF", len: 3, color: cAmber });
      ev.push({ t: 13, node: "C", type: "DATA", len: 25, color: cDestructive });
      ev.push({ t: 12, node: "AP", type: "JAM", len: 26, color: cDestructive });
      ev.push({ t: 50, node: "A", type: "BACKOFF", len: 8, color: cAmber });
      ev.push({ t: 58, node: "A", type: "DATA", len: 25, color: cBrand });
      ev.push({ t: 84, node: "AP", type: "SIFS", len: 2, color: cAmber });
      ev.push({ t: 86, node: "AP", type: "ACK", len: 4, color: cSuccess });
    } else {
      // Normal CA: backoff redder dem
      ev.push({ t: 5, node: "A", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "A", type: "BACKOFF", len: 3, color: cAmber });
      ev.push({ t: 12, node: "A", type: "DATA", len: 25, color: cBrand });
      ev.push({ t: 5, node: "C", type: "DIFS", len: 4, color: cAmber });
      ev.push({ t: 9, node: "C", type: "BACKOFF", len: 8, color: cAmber });
      ev.push({ t: 37, node: "AP", type: "SIFS", len: 2, color: cAmber });
      ev.push({ t: 39, node: "AP", type: "ACK", len: 4, color: cSuccess });
      ev.push({ t: 17, node: "C", type: "BACKOFF", len: 25, color: cAmber });
      ev.push({ t: 43, node: "C", type: "DATA", len: 25, color: cBrand });
    }
  } else {
    // RTS/CTS
    ev.push({ t: 5, node: "A", type: "DIFS", len: 4, color: cAmber });
    ev.push({ t: 9, node: "A", type: "BACKOFF", len: 3, color: cAmber });
    ev.push({ t: 12, node: "A", type: "RTS", len: 6, color: cBrand });
    ev.push({ t: 18, node: "AP", type: "SIFS", len: 2, color: cAmber });
    ev.push({ t: 20, node: "AP", type: "CTS", len: 6, color: cBrand });
    ev.push({ t: 26, node: "A", type: "SIFS", len: 2, color: cAmber });
    ev.push({ t: 28, node: "A", type: "DATA", len: 25, color: cBrand });
    ev.push({ t: 53, node: "AP", type: "SIFS", len: 2, color: cAmber });
    ev.push({ t: 55, node: "AP", type: "ACK", len: 4, color: cSuccess });
    // C ser CTS-en (selv om den ikke ser A) og holder seg unna
    ev.push({ t: 5, node: "C", type: "DIFS", len: 4, color: cAmber });
    ev.push({ t: 20, node: "C", type: "BACKOFF", len: 39, color: cAmber });
  }
  return ev;
}

function describeScenario(mode: "cd" | "ca" | "ca-rtscts", scenario: "none" | "hidden"): string[] {
  if (mode === "cd" && scenario === "hidden") {
    return [
      "🟥 Begge sender samtidig. AP ser kollisjon (JAM-signal).",
      "I kablet Ethernet ville A og C også sett kollisjonen og avbrutt.",
      "I virkeligheten har kablet Ethernet IKKE hidden terminal — alle ser hverandre.",
    ];
  }
  if (mode === "cd") {
    return [
      "🟥 Kollisjon på t=9 — begge oppdager den fordi de lytter på kabelen mens de sender.",
      "🟧 Begge avbryter umiddelbart, går i exponential backoff med ulik random.",
      "🟩 A vinner backoff-løpet og sender; AP ACK-er.",
    ];
  }
  if (mode === "ca" && scenario === "hidden") {
    return [
      "🟧 Begge venter DIFS + tilfeldig backoff. Backoff er nesten lik fordi A og C ikke ser hverandre.",
      "🟥 Begge sender SAMTIDIG — kollisjon på AP, men A og C VET det IKKE umiddelbart.",
      "🟧 De venter på ACK som aldri kommer. Etter timeout: backoff fordobles og prøv på nytt.",
      "🟩 Til slutt klarer A å sende alene.",
    ];
  }
  if (mode === "ca") {
    return [
      "🟧 Begge venter DIFS, så random backoff. C får 8 slots, A får 3.",
      "🟩 A starter først; C lytter, hører luften opptatt, suspenderer sin backoff-timer.",
      "🟩 Når A er ferdig + ACK kommer, fortsetter C der den slapp.",
      "Backoff = essensen av CA: sannsynlighetsbasert unngåelse av kollisjon.",
    ];
  }
  // ca-rtscts
  return [
    "🟦 A sender en KORT RTS-ramme til AP. Hvis kollisjon her — bare RTS er liten, koster lite.",
    "🟦 AP svarer med CTS som ALLE hører (også C, selv om C ikke ser A).",
    "🟧 C ser CTS og setter sin NAV-timer (Network Allocation Vector) for å holde seg unna.",
    "🟩 A sender hovedrammen uten frykt for at C ødelegger den.",
    "Trade-off: 4 ekstra rammer (RTS + CTS + DATA + ACK), men ingen risiko for å kaste bort en stor DATA-ramme.",
  ];
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">CSMA/CD ble dropt for WiFi</strong> fordi radio-noder
          ikke kan lytte mens de sender, og fordi hidden terminals gjør detection upålitelig.
        </li>
        <li>
          <strong className="text-foreground">CSMA/CA er fundamentet:</strong> lytt, vent DIFS,
          tilfeldig backoff, send, vent ACK. Exponential backoff ved feil.
        </li>
        <li>
          <strong className="text-foreground">RTS/CTS</strong> er valgfri optimalisering for store
          rammer i miljøer med hidden terminals. Slått av som default i moderne WiFi (802.11ac+)
          fordi små noder gjør den unødvendig.
        </li>
        <li>
          <strong className="text-foreground">Effektivitet:</strong> WiFi tåler mye lavere
          utnyttelse enn Ethernet. 54 Mbps 802.11g gir ofte 20-25 Mbps reell throughput pga.
          backoff, SIFS, ACK.
        </li>
      </ul>
    </section>
  );
}
