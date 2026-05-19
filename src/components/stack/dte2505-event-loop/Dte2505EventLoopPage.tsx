import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Activity, Play, Pause, RotateCcw } from "lucide-react";

type Tab = "intro" | "live";

export function Dte2505EventLoopPage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Event-basert konkurrens — epoll vs threads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Hvordan en enkelt thread kan håndtere 10 000 samtidige klienter via «event loop». OSTEP
            kap. 33. Bygger på dte2505-thread-state og dte2505-konkurrens.
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
            icon={<Activity className="h-3.5 w-3.5" />}
          >
            1. Sammenlignings-simulator
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <LiveModule />}

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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Bygger på</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>
            <strong className="text-foreground">Threads og prosesser</strong> (
            <code>dte2505-thread-vs-prosess</code>, <code>dte2505-thread-state</code>): for
            parallellitet kan vi spinne opp en thread per klient. Men hver thread koster ~8 MB stack
            + scheduler-overhead.
          </li>
          <li>
            <strong className="text-foreground">Blocking I/O</strong> (
            <code>dte2507-socket-programmering</code>): et tradisjonelt <code>read(fd)</code>-kall
            blokkerer thread-en til data faktisk kommer. Hvis en server håndterer 10 000 klienter
            med blocking I/O må vi enten ha 10 000 threads (dyrt) eller forking (enda dyrere).
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Problemet vi løser</h2>
        <p className="text-muted-foreground">
          C10k-problemet (Dan Kegel, 1999): hvordan håndtere 10 000 samtidige klienter på én maskin?
          Svaret er ikke «mer threads» — det er å la ÉN thread håndtere alle, men aldri blokkere på
          en spesifikk klient. I stedet sier vi til OS-et: «vekk meg når NOEN av disse N socket-ene
          har data klar».
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="File descriptor (fd)">
            Et heltall OS-et bruker for å peke på en åpen ressurs — fil, socket, pipe. Du sender det
            til <code>read</code>, <code>write</code>, osv. En server med 10 000 klienter har 10 000
            fd-er åpne.
          </Def>
          <Def term="Blocking I/O">
            <code>read(fd, buf, n)</code> stopper thread-en til det faktisk finnes data å lese. Hvis
            ingen data kommer på 10 sekunder, sover thread-en i 10 sekunder. Brukbart for én klient,
            fælt for 10 000.
          </Def>
          <Def term="Non-blocking I/O">
            Vi setter fd-en i non-blocking modus. Da returnerer <code>read</code> umiddelbart —
            enten med data, eller med en feil (EWOULDBLOCK / EAGAIN) som betyr «ingenting akkurat
            nå, prøv senere». Bygger fundamentet for event loop.
          </Def>
          <Def term="select / poll / epoll">
            Syscall-er som spør OS-et: «her er N fd-er. Vekk meg når MINST ÉN har data klar.»
            Forskjell:
            <ul className="list-disc pl-5 mt-1">
              <li>
                <code>select</code> (1983): begrenset til 1024 fd-er, må sende hele lista hver gang.
                Tregt for store N.
              </li>
              <li>
                <code>poll</code> (1986): ingen 1024-grense, men fortsatt O(N) per kall.
              </li>
              <li>
                <code>epoll</code> (Linux, 2002): O(1) per «ready event». OS-et holder lista internt
                og leverer bare endringer.
              </li>
            </ul>
          </Def>
          <Def term="Event loop">
            <code>
              while (true) {`{`} events = epoll_wait(); for (event in events) handle(event); {`}`}
            </code>
            . En enkelt thread som bare prosesserer ferdige hendelser. Brukt av nginx, Node.js,
            Redis, asyncio i Python.
          </Def>
          <Def term="Reactor pattern">
            Designmønsteret bak event loop-er. «Reactor» (event-løkken) demultiplexer innkommende
            events og kaller registrerte handlers («handlers»). Hver handler må RETURNERE raskt —
            ellers blokkeres alle de andre klientene.
          </Def>
          <Def term="CPU-bound vs I/O-bound">
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>I/O-bound</strong>: jobben venter mest på disk eller nett. Event loop er
                ideelt — bytte mellom mange klienter mens hver venter.
              </li>
              <li>
                <strong>CPU-bound</strong>: jobben jobber konstant med tunge utregninger. Event loop
                hjelper IKKE — du vil ha threads / prosesser for å bruke flere CPU-kjerner.
              </li>
            </ul>
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

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

// ============================================================
// MODUL 1 — Simulator: thread-per-klient vs event-loop
// ============================================================

type ClientState = "venter" | "klar" | "behandles" | "ferdig";
type Client = {
  id: number;
  state: ClientState;
  arrivedAt: number;
  readyAt: number;
  doneAt?: number;
};

function LiveModule() {
  const [model, setModel] = useState<"threads" | "eventloop">("eventloop");
  const [nClients, setNClients] = useState(20);
  const [nThreads, setNThreads] = useState(4);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({ throughput: 0, avgLatency: 0 });
  const runRef = useRef(false);

  function reset(newClients = nClients) {
    const cs: Client[] = [];
    for (let i = 0; i < newClients; i++) {
      const arrive = Math.floor(Math.random() * 5);
      cs.push({
        id: i,
        state: "venter",
        arrivedAt: arrive,
        readyAt: arrive + 2 + Math.floor(Math.random() * 5), // tid før data klar
      });
    }
    setClients(cs);
    setTick(0);
    setRunning(false);
    setStats({ throughput: 0, avgLatency: 0 });
  }

  useEffect(() => {
    reset(nClients);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nClients, model]);

  useEffect(() => {
    runRef.current = running;
    if (!running) return;
    let cancelled = false;
    const loop = () => {
      if (cancelled || !runRef.current) return;
      step();
      setTimeout(loop, 200);
    };
    loop();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [running, model, nThreads]);

  function step() {
    setTick((t) => t + 1);
    setClients((prev) => {
      const t = tick + 1;
      const next = prev.map((c) => ({ ...c }));

      // Marker som klar når readyAt nås
      next.forEach((c) => {
        if (c.state === "venter" && t >= c.readyAt) c.state = "klar";
      });

      if (model === "threads") {
        // nThreads kan jobbe samtidig. Tar 1 tick per klient.
        const behandles = next.filter((c) => c.state === "behandles");
        const ledigeSlots = nThreads - behandles.length;
        // Ferdiggjør de som var behandles
        behandles.forEach((c) => {
          c.state = "ferdig";
          c.doneAt = t;
        });
        // Plukk nye klare
        let plukkett = 0;
        for (const c of next) {
          if (plukkett >= ledigeSlots + behandles.length) break; // Hmm
          if (c.state === "klar") {
            c.state = "behandles";
            plukkett++;
            if (plukkett >= nThreads - 0) break;
          }
        }
      } else {
        // Event loop: én thread, men prosesserer alle "klar" på ett tick (rask handler)
        next.forEach((c) => {
          if (c.state === "klar") {
            c.state = "ferdig";
            c.doneAt = t;
          }
        });
      }

      // Stop hvis alle ferdig
      const allDone = next.every((c) => c.state === "ferdig");
      if (allDone) {
        const lats = next.map((c) => (c.doneAt ?? t) - c.arrivedAt);
        setStats({
          throughput: next.length / t,
          avgLatency: lats.reduce((a, b) => a + b, 0) / lats.length,
        });
        setRunning(false);
      }
      return next;
    });
  }

  const klarCount = clients.filter((c) => c.state === "klar").length;
  const behandlesCount = clients.filter((c) => c.state === "behandles").length;
  const ferdigCount = clients.filter((c) => c.state === "ferdig").length;
  const venterCount = clients.filter((c) => c.state === "venter").length;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Simulator:</strong> N klienter ankommer. Hver må vente
        noen ticks før dataene er klare (simulerer nett-latency). I <em>thread-modell</em> kan vi
        behandle kun {nThreads} klienter samtidig (én per thread). I <em>event-loop-modell</em>{" "}
        ploppes alle «klar»-klienter til ferdig hvert tick — fordi hver handler er rask
        (ikke-blokkerende).
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div>
            <label className="text-muted-foreground">Modell</label>
            <div className="flex gap-1 mt-1">
              <Button
                size="sm"
                variant={model === "threads" ? "default" : "outline"}
                onClick={() => setModel("threads")}
              >
                Threads
              </Button>
              <Button
                size="sm"
                variant={model === "eventloop" ? "default" : "outline"}
                onClick={() => setModel("eventloop")}
              >
                Event-loop
              </Button>
            </div>
          </div>
          <div>
            <label className="text-muted-foreground">
              Klienter: <span className="font-mono">{nClients}</span>
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={nClients}
              onChange={(e) => setNClients(Number(e.target.value))}
              className="w-full"
            />
          </div>
          {model === "threads" && (
            <div>
              <label className="text-muted-foreground">
                Threads: <span className="font-mono">{nThreads}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={nThreads}
                onChange={(e) => setNThreads(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2 items-center">
          <Button size="sm" onClick={() => setRunning((v) => !v)}>
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{" "}
            {running ? "Pause" : "Kjør"}
          </Button>
          <Button size="sm" variant="outline" onClick={step} disabled={running}>
            Steg
          </Button>
          <Button size="sm" variant="outline" onClick={() => reset()}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <span className="text-xs text-muted-foreground ml-2">tick = {tick}</span>
        </div>

        <div
          className="mt-4 grid gap-1"
          style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
        >
          {clients.map((c) => {
            const cls =
              c.state === "venter"
                ? "bg-muted text-muted-foreground"
                : c.state === "klar"
                  ? "bg-amber-500/30 border border-amber-500 text-foreground"
                  : c.state === "behandles"
                    ? "bg-brand/40 border border-brand text-white"
                    : "bg-success/40 border border-success text-foreground opacity-70";
            return (
              <div
                key={c.id}
                className={`aspect-square rounded flex items-center justify-center font-mono text-[10px] ${cls}`}
                title={`klient ${c.id}: ${c.state}`}
              >
                {c.id}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex gap-3 text-[11px]">
          <span>
            <span className="inline-block w-2 h-2 bg-muted-foreground/40 mr-1 rounded" /> venter (
            {venterCount})
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-amber-500 mr-1 rounded" /> klar ({klarCount})
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-brand mr-1 rounded" /> behandles (
            {behandlesCount})
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-success mr-1 rounded" /> ferdig ({ferdigCount})
          </span>
        </div>

        {stats.throughput > 0 && (
          <div className="mt-3 rounded border border-border bg-background p-2 text-xs">
            Ferdig på <span className="font-mono font-semibold">{tick} ticks</span>.{" "}
            Gjennomsnitts-latency: <span className="font-mono">{stats.avgLatency.toFixed(1)}</span>{" "}
            ticks. Throughput: <span className="font-mono">{stats.throughput.toFixed(2)}</span>{" "}
            klienter/tick.
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Eksperiment-forslag:</strong>
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          <li>Kjør med 30 klienter og 4 threads — se hvor mye lengre det tar enn event-loop.</li>
          <li>
            Skru threads opp til 20. Da blir thread-modellen omtrent like rask som event-loop … men
            i virkeligheten koster hver thread minne.
          </li>
          <li>
            Event-loop er rask her BARE fordi vi antok hver handler er instant. Hvis én handler gjør
            tung CPU-jobb, fryser hele eventloop-en — derfor heter det «cooperative» concurrency.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Oppsummering</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Event-loop = ÉN thread, mange klienter.</strong> Vi
          bruker non-blocking I/O + epoll/select for å bare jobbe med klienter som har noe å gjøre.
        </li>
        <li>
          <strong className="text-foreground">Hver handler MÅ være rask.</strong> Hvis en handler
          bruker 200ms på en tung utregning, blokkerer den ALLE de andre. I praksis offloader vi
          CPU-tunge jobber til en worker-pool (threads eller prosesser).
        </li>
        <li>
          <strong className="text-foreground">Hybrid er det vanlige.</strong> Nginx, Node.js
          Cluster, Python asyncio: én event-loop per CPU-kjerne, og worker-threads for CPU-jobber.
          Du får både skalering (på antall klienter) og parallellitet (på antall kjerner).
        </li>
        <li>
          Den klassiske referansen til «hvorfor event-loop?» er <em>«The C10k problem»</em> av Dan
          Kegel (1999) — verdt å google for historisk kontekst.
        </li>
      </ul>
    </section>
  );
}
