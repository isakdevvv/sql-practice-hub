import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Radio, Play, Pause, RotateCcw } from "lucide-react";

type Tab = "intro" | "live";

export function Dte2501HmmParticlePage() {
  const [tab, setTab] = useState<Tab>("intro");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            HMM & particle filter — robot-lokalisering
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            AIMA kap. 14. Hvordan estimere skjulte tilstander fra støyete observasjoner. Robot
            beveger seg på en 1D-linje med dører — du ser ikke hvor robot er, kun «dør/ingen
            dør»-sensor. Bygger på bayes.
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
            icon={<Radio className="h-3.5 w-3.5" />}
          >
            1. Robot lokaliserer seg
          </TabBtn>
        </div>
        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "live" && <ParticleModule />}
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
            <strong className="text-foreground">Bayes-regel</strong> (<code>bayes</code>): P(A|B) ∝
            P(B|A) · P(A). Posterior ∝ likelihood · prior.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Problemet</h2>
        <p className="text-muted-foreground">
          En robot beveger seg gjennom et hus. Den vet HVOR den startet, men gulvet er glatt —
          bevegelser er upresise. Robot har EN sensor som bare sier «dør» eller «ingen dør».
          Spørsmål: hvor i huset er roboten nå?
        </p>
        <p className="text-muted-foreground mt-2">
          Dette er klassisk skjult-tilstand-estimasjon (kjernen i en HMM). Vi kan ikke se den ekte
          posisjonen direkte. Vi har en støyete sensor og en støyete bevegelses-modell.
          Bayes-resonnering kombinerer dem.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Skjult tilstand (hidden state) x_t">
            Den «sanne» variabelen vi vil estimere — her: robotens posisjon på tidssteg t.
          </Def>
          <Def term="Observasjon y_t">
            Hva sensoren faktisk rapporterer. «dør» eller «ingen dør». Støyete — kan være feil.
          </Def>
          <Def term="Bevegelses-modell P(x_t | x_{t-1}, action_t)">
            Hvordan tilstanden endrer seg over tid, gitt en handling (her: «gå én tile høyre»). Også
            støyete — kanskje robot står stille eller hopper to.
          </Def>
          <Def term="Sensor-modell P(y_t | x_t)">
            Hvor sannsynlig er det å observere y_t, gitt at sann tilstand er x_t. F.eks. P(«dør» |
            står på dør-tile) = 0.9 (10% feil), P(«dør» | står ikke på dør-tile) = 0.1.
          </Def>
          <Def term="Belief b_t(x)">
            Vår nåværende sannsynlighets-fordeling over tilstander. Et tall per mulig tilstand.
            Summer til 1.
          </Def>
          <Def term="Forutsigelse + oppdatering">
            To trinn per tidssteg:
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>Forutsi:</strong> b_t(x) = Σ P(x | x', action) · b_{`{t-1}`}(x') — diffunder
                belief gjennom bevegelses-modellen.
              </li>
              <li>
                <strong>Oppdater:</strong> b_t(x) ∝ P(y_t | x) · b_t(x) — multiplisér med
                sensor-likelihoodet, normaliser.
              </li>
            </ul>
          </Def>
          <Def term="Particle filter">
            I stedet for å lagre belief som ett tall per tilstand, representer den som N «partikler»
            (samples). Hver partikkel = en hypotese om sann tilstand. Tetthet av partikler i et
            område = sannsynligheten av at tilstanden er der.
          </Def>
          <Def term="Resampling">
            Etter sensor-oppdatering: kopier partikler proporsjonalt med likelihood. Partikler i
            lite sannsynlige posisjoner forsvinner; partikler i sannsynlige posisjoner får mange
            kopier.
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

// 1D world med dører
const N_TILES = 12;
const DOORS = new Set([2, 5, 9]); // posisjoner der det er dør
const N_PARTICLES = 100;

function ParticleModule() {
  const [robot, setRobot] = useState(0);
  const [particles, setParticles] = useState<number[]>(() =>
    Array.from({ length: N_PARTICLES }, () => Math.floor(Math.random() * N_TILES)),
  );
  const [obs, setObs] = useState<string>("");
  const [running, setRunning] = useState(false);

  function step() {
    // Robot beveger seg én til høyre (med litt usikkerhet)
    setRobot((r) => Math.min(N_TILES - 1, r + 1));
    // Sensor: 90% sjanse for riktig observasjon
    const trueDoor = DOORS.has(robot);
    const observed = Math.random() < 0.9 ? trueDoor : !trueDoor;
    const yObs = observed ? "dør" : "ingen dør";
    setObs(yObs);
    // 1. Bevegelses-modell: hver partikkel flytter seg én til høyre (med litt støy)
    const newParts = particles.map((p) => {
      const r = Math.random();
      if (r < 0.8) return Math.min(N_TILES - 1, p + 1);
      if (r < 0.95) return p;
      return Math.min(N_TILES - 1, p + 2);
    });
    // 2. Sensor-oppdatering: vekt hver partikkel
    const weights = newParts.map((p) => {
      const isDoor = DOORS.has(p);
      return observed === isDoor ? 0.9 : 0.1;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    const norm = weights.map((w) => w / total);
    // 3. Resampling
    const cum: number[] = [];
    let acc = 0;
    for (const w of norm) {
      acc += w;
      cum.push(acc);
    }
    const resampled: number[] = [];
    for (let i = 0; i < N_PARTICLES; i++) {
      const r = Math.random();
      let idx = cum.findIndex((v) => v >= r);
      if (idx < 0) idx = N_PARTICLES - 1;
      resampled.push(newParts[idx]);
    }
    setParticles(resampled);
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(step, 600);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [running, robot, particles]);

  function reset() {
    setRobot(0);
    setParticles(Array.from({ length: N_PARTICLES }, () => Math.floor(Math.random() * N_TILES)));
    setObs("");
    setRunning(false);
  }

  // Tetthet av partikler per tile
  const density = Array(N_TILES).fill(0);
  for (const p of particles) density[p]++;
  const maxD = Math.max(...density);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">
          Korridoren har 12 ruter; 3 av dem har dører (markert med 🚪).
        </strong>{" "}
        Robot starter et ukjent sted og går til høyre hvert tidssteg. Sensoren rapporterer
        «dør»/«ingen dør» med 90% nøyaktighet. 100 partikler representerer mulige robot-posisjoner —
        observér hvordan de konvergerer rundt sann posisjon etter noen iterasjoner.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Korridoren (Sann posisjon i blå, partikkel-tetthet under)
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${N_TILES}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: N_TILES }, (_, i) => (
            <div key={i} className="space-y-1">
              <div
                className={`h-12 rounded flex items-center justify-center text-xs border-2 ${i === robot ? "bg-brand text-white border-brand" : DOORS.has(i) ? "bg-card border-amber-500" : "bg-card border-border"}`}
              >
                {DOORS.has(i) ? "🚪" : ""}
                {i === robot ? "🤖" : ""}
              </div>
              <div className="h-16 bg-muted rounded relative flex items-end">
                <div
                  className="w-full bg-success rounded-b"
                  style={{ height: `${maxD > 0 ? (density[i] / maxD) * 100 : 0}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-muted-foreground">
                  {density[i]}
                </div>
              </div>
              <div className="text-center text-[9px] text-muted-foreground">{i}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-1.5">
          <Button size="sm" onClick={step}>
            Neste steg
          </Button>
          <Button
            size="sm"
            variant={running ? "default" : "outline"}
            onClick={() => setRunning((v) => !v)}
          >
            {running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{" "}
            {running ? "Pause" : "Auto"}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {obs && (
          <div className="mt-3 rounded border border-amber-500/40 bg-amber-500/10 p-2 text-xs">
            <strong>Siste observasjon:</strong> sensor sa «{obs}». Sann tilstand: robot står på rute{" "}
            {robot} ({DOORS.has(robot) ? "har dør" : "har ikke dør"}). Sensoren var{" "}
            {(obs === "dør") === DOORS.has(robot) ? "✓ korrekt" : "✗ FEIL"}.
          </div>
        )}

        <div className="mt-2 text-[11px] text-muted-foreground">
          <strong>Konsentrer deg om søylene:</strong> partikler samles der det er kompatibelt med
          observasjons-historikken. Etter 2-3 dør-observasjoner peker tettheten skarpt mot riktig
          posisjon.
        </div>
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
          <strong className="text-foreground">HMM-en</strong> er rammeverket: skjult tilstand,
          observasjon, bevegelses-modell, sensor-modell. Particle filter er en av flere måter å
          estimere den skjulte tilstanden på.
        </li>
        <li>
          <strong className="text-foreground">Alternativ:</strong> Kalman filter (lukket form,
          krever Gauss-fordelte støy + lineær dynamikk). Particle filter er mer fleksibelt —
          håndterer hva som helst, inkludert multi-modale distribusjoner.
        </li>
        <li>
          <strong className="text-foreground">Brukt overalt:</strong> robotnavigering (SLAM),
          GPS-fusion i biler, hodet-tracking i AR/VR, finansiell tilstands-estimering,
          geolocation-prediksjon.
        </li>
        <li>
          <strong className="text-foreground">Skalering:</strong> particle filter trenger O(N) per
          tidssteg der N er antall partikler. For 6D-tilstand kan du trenge tusenvis av partikler —
          tradisjonell HMM-tilnærming blir uhåndterlig.
        </li>
      </ul>
    </section>
  );
}
