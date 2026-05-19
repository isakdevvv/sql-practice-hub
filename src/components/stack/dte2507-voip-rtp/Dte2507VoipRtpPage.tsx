import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Phone } from "lucide-react";

type Tab = "intro" | "live";

export function Dte2507VoipRtpPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">VoIP & RTP — jitter, loss og MOS</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Kurose kap. 9. Hvorfor TCP ikke duger for sann-tid lyd, og hvordan
            RTP + playout-buffer kompenserer for nettverks-jitter.
          </p>
        </header>
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn active={tab === "intro"} onClick={() => setTab("intro")} icon={<BookOpen className="h-3.5 w-3.5" />}>0. Start her</TabBtn>
          <TabBtn active={tab === "live"} onClick={() => setTab("live")} icon={<Phone className="h-3.5 w-3.5" />}>1. Pakke-trace + MOS</TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <VoipModule />}
        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({ children, active, onClick, icon }: any) { return (<button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${active ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{icon}{children}</button>); }
function Def({ term, children }: { term: string; children: React.ReactNode }) { return (<div><dt className="font-semibold text-foreground">{term}</dt><dd className="text-muted-foreground mt-0.5">{children}</dd></div>); }

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li><strong className="text-foreground">UDP vs TCP</strong> (<code>transportlag</code>): TCP = pålitelig, reordering, retransmit. UDP = ingen garantier, men ingen ventetid.</li>
          <li><strong className="text-foreground">Delay-modellen</strong> (<code>dte2507-delay-modell</code>): nettverks-forsinkelse er sum av propagation, transmission, queuing, processing.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor TCP er feil for stemme</h2>
        <p className="text-muted-foreground">
          Lyd er fundamentalt tids-bundet. 20 ms lyd skal spilles 20 ms etter forrige. Hvis en pakke kommer 200 ms for sent fordi TCP retransmitterer, er den ubrukelig — du kan ikke «kjøre samtalen videre 200 ms etter at den skulle starte».
        </p>
        <p className="text-muted-foreground mt-2">
          Bedre å miste pakken og fylle med stillhet (eller forrige sample) enn å vente. Det er derfor VoIP bruker UDP + RTP — vi velger tids-konsistens over kompletthet.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Loss (pakketap)">Andel pakker som aldri kommer fram. Ved 0% = perfekt. Ved 5% begynner stemme å høres «kuttet». Tale tåler typisk opp til ~5% før det blir uutholdelig.</Def>
          <Def term="Delay (end-to-end)">Tiden fra en pakke sendes til den når mottakeren. Under 150 ms er nesten umerkelig. 150–400 ms er irriterende. Over 400 ms gjør samtalen umulig.</Def>
          <Def term="Jitter">Variasjon i delay. Hvis 5 pakker ankommer med interval 20, 22, 18, 30, 15 ms, er jitter høy. Konstant 150 ms delay er ok; jitter på 50 ms er katastrofalt.</Def>
          <Def term="Playout-buffer">Mottakeren venter litt ekstra (typisk 50-200 ms) før den begynner å spille. Det skaper en buffer som dekker pakker som kommer litt sent. Tradeoff: lengre buffer = mer jitter-toleranse, men mer total delay.</Def>
          <Def term="RTP">Real-time Transport Protocol. Liten UDP-header med:
            <ul className="list-disc pl-5 mt-1">
              <li>Sequence number (sjekk for reorder/loss).</li>
              <li>Timestamp (når i mediestrømmen denne pakken hører).</li>
              <li>SSRC (kilde-ID).</li>
              <li>Payload type (codec som G.711, Opus).</li>
            </ul>
          </Def>
          <Def term="MOS (Mean Opinion Score)">En 1-5 score for opplevd lyd-kvalitet. Tradisjonelt målt subjektivt; nå estimert med E-modellen (ITU-T G.107). Tommelfingerregler:
            <ul className="list-disc pl-5 mt-1">
              <li>5 = perfekt (umulig over nettverk).</li>
              <li>4 = utmerket (god mobilkvalitet).</li>
              <li>3 = ok (gammel POTS-linje).</li>
              <li>2 = dårlig (kuttet, hakkete).</li>
              <li>1 = ubrukelig.</li>
            </ul>
          </Def>
        </dl>
      </div>
      <div className="flex gap-2"><Button size="sm" onClick={() => onPick("live")}>Start på modul 1 →</Button></div>
    </div>
  );
}

function estimateMos(delay: number, loss: number, jitter: number): number {
  // Enkel E-model-inspirert estimering. Reell formel er mer kompleks.
  let r = 93.2;
  const delayPenalty = delay < 150 ? 0 : delay < 400 ? (delay - 150) * 0.05 : 12.5 + (delay - 400) * 0.1;
  const lossPenalty = loss * 2.5;
  const jitterPenalty = jitter * 0.3;
  r -= delayPenalty + lossPenalty + jitterPenalty;
  if (r > 100) r = 100;
  if (r < 0) r = 0;
  // Konverter R-faktor til MOS
  if (r < 6.5) return 1;
  if (r > 100) return 4.5;
  const mos = 1 + 0.035 * r + 7e-6 * r * (r - 60) * (100 - r);
  return Math.max(1, Math.min(5, mos));
}

function VoipModule() {
  const [delay, setDelay] = useState(80);
  const [jitter, setJitter] = useState(15);
  const [loss, setLoss] = useState(2);
  const [bufferMs, setBufferMs] = useState(100);

  // Generer 30 pakker, hver representerer 20 ms lyd. Tilfeldig delay (innenfor jitter) og loss.
  const packets = useMemo(() => {
    const pkts: { seq: number; sentAt: number; arrivedAt: number | null; played: boolean }[] = [];
    let seed = 13;
    function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (let i = 0; i < 30; i++) {
      const sentAt = i * 20;
      const isLost = rand() < loss / 100;
      if (isLost) { pkts.push({ seq: i, sentAt, arrivedAt: null, played: false }); continue; }
      const j = (rand() - 0.5) * 2 * jitter;
      const arrivedAt = sentAt + delay + j;
      pkts.push({ seq: i, sentAt, arrivedAt, played: false });
    }
    // Play-out: pakker som ankom før (sentAt + delay + bufferMs) er i tide
    const playoutDeadline = (sentAt: number) => sentAt + delay + bufferMs;
    for (const p of pkts) {
      if (p.arrivedAt === null) continue;
      if (p.arrivedAt <= playoutDeadline(p.sentAt)) p.played = true;
    }
    return pkts;
  }, [delay, jitter, loss, bufferMs]);

  const playedCount = packets.filter((p) => p.played).length;
  const totalCount = packets.length;
  const effectiveLoss = ((totalCount - playedCount) / totalCount) * 100;
  const totalDelay = delay + bufferMs;
  const mos = estimateMos(totalDelay, effectiveLoss, jitter);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Eksperiment:</strong> 30 RTP-pakker (hver er 20 ms lyd) sendes. Hver pakke har tilfeldig forsinkelse (mean = delay, ±jitter). Noen pakker går tapt. Mottakeren har en playout-buffer som venter «bufferMs» ekstra før den begynner å spille — pakker som kommer etter sin egen «playout-deadline» regnes som tapt.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div>
            <label className="text-muted-foreground">Network delay: <span className="font-mono font-semibold">{delay} ms</span></label>
            <input type="range" min={10} max={300} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-muted-foreground">Jitter: <span className="font-mono font-semibold">±{jitter} ms</span></label>
            <input type="range" min={0} max={80} value={jitter} onChange={(e) => setJitter(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-muted-foreground">Loss (rådata): <span className="font-mono font-semibold">{loss}%</span></label>
            <input type="range" min={0} max={15} value={loss} onChange={(e) => setLoss(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-muted-foreground">Playout-buffer: <span className="font-mono font-semibold">{bufferMs} ms</span></label>
            <input type="range" min={0} max={200} step={10} value={bufferMs} onChange={(e) => setBufferMs(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">RTP-pakker (grønn = spilt, gul = sent men kom for sent, rød = tapt)</div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
            {packets.map((p, i) => {
              const lost = p.arrivedAt === null;
              const tooLate = !lost && !p.played;
              const cls = lost ? "bg-destructive" : tooLate ? "bg-amber-500" : "bg-success";
              return <div key={i} className={`h-6 rounded-sm ${cls}`} title={`#${p.seq}: ${lost ? "tapt" : tooLate ? `kom kl ${p.arrivedAt?.toFixed(0)}ms, etter deadline` : `spilt`}`} />;
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4 text-xs">
          <Stat label="Effektiv loss" value={`${effectiveLoss.toFixed(1)}%`} note={`${totalCount - playedCount}/${totalCount} pakker`} />
          <Stat label="Total delay" value={`${totalDelay} ms`} note="Network + buffer" />
          <Stat label="Jitter" value={`±${jitter} ms`} note={jitter < 20 ? "lav" : jitter < 50 ? "moderat" : "høy"} />
          <Stat label="MOS-estimat" value={mos.toFixed(2)} note={mos > 4 ? "🟢 utmerket" : mos > 3 ? "🟡 ok" : mos > 2 ? "🟠 dårlig" : "🔴 ubrukelig"} />
        </div>

        <div className="mt-3 rounded border border-border bg-background p-2 text-[11px] text-muted-foreground space-y-1">
          <div><strong className="text-foreground">Prøv:</strong></div>
          <div>• Skru opp jitter til 50. Se hvor mange pakker som kommer for sent (gult).</div>
          <div>• Skru opp playout-buffer til 200. Gule blir til grønne, men total delay øker.</div>
          <div>• Skru loss til 10%. MOS faller dramatisk — selv 100ms ekstra buffer hjelper ikke mot ekte tap.</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (<div className="rounded border border-border bg-background p-2"><div className="text-[10px] text-muted-foreground">{label}</div><div className="font-mono font-semibold text-sm">{value}</div><div className="text-[10px] text-muted-foreground">{note}</div></div>);
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li><strong className="text-foreground">UDP + RTP er det vanlige.</strong> RTP gir tid og rekkefølge, UDP gir lav latency. Loss håndteres med codec-løsninger (PLC = Packet Loss Concealment) — ikke retransmit.</li>
        <li><strong className="text-foreground">Adaptive playout-buffer:</strong> moderne VoIP-apper (WhatsApp, Discord) måler jitter live og justerer buffer-en automatisk. Stille perioder bruker de til å «innhente» tapt buffer.</li>
        <li><strong className="text-foreground">Codec-valg påvirker resiliens:</strong> Opus har innebygd FEC (Forward Error Correction) som gjør den robust mot 10%+ loss. Eldre G.711 er sårbar.</li>
        <li><strong className="text-foreground">QoS:</strong> i bedriftsnett kan rutere prioritere RTP-pakker (DSCP-tagging) for å garantere lav latency. På åpent internet får du «best effort».</li>
      </ul>
    </section>
  );
}
