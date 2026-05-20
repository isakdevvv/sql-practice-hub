import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Layers, Cpu, Server, Lightbulb, BookOpen } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { FORKURS_FASER, FORKURS_BITS, getBitsInPhase, type ForkursBit, type Fag } from "./bits";

export function ForkursHub() {
  return (
    <StackPageShell title="Forkurs" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Header />
        <DualSubjectIntro />
        {FORKURS_FASER.map((f) => (
          <Fase key={f.id} fase={f} bits={getBitsInPhase(f.id)} />
        ))}
        <KoblingsKart />
      </article>
    </StackPageShell>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · juni–august
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Bro fra ingenting til DTE-2505 og DTE-2507
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Dette forkurset er broen til <strong>begge fagene</strong> — DTE-2505 Operativsystemer og DTE-2507 Datakommunikasjon &amp; sikkerhet. 11 små biter fordelt på fire faser. Hver bit har eksplisitte forutsetninger og peker fram til hvilke biter i hovedfagene den åpner opp for. Ingen bit krever mer enn 20 minutter.
      </p>
      <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
        <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <span className="font-medium">Start her hvis</span> du ikke har installert Linux før, ikke har skrevet Python på lenge, eller ikke har sett Wireshark. Sluttmål: VM klar, terminal trygg, Python varm, nettverk demystifisert.
        </div>
      </div>
    </header>
  );
}

function DualSubjectIntro() {
  return (
    <div className="mb-10 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hva forkurset gir DTE-2505 (OS)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VM og snapshot-arbeid (F1) gir trygt eksperimentmiljø for alle OS-lab. Terminal-introen (F-04) er smør for hånda før OS-fase 2 (filsystemet) og OS-fase 5 (skallet) starter.
        </p>
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Hva forkurset gir DTE-2507 (Datakomm)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Python (F2) er forutsetning for socket-programmering (DK-10). Nettverksintuisjon (F3) gir mentale modeller før Kurose-pensumet, og binær/hex (F-10) trengs for IP-adresser og pakke-headere.
        </p>
      </div>
    </div>
  );
}

function Fase({ fase, bits }: { fase: (typeof FORKURS_FASER)[number]; bits: ForkursBit[] }) {
  return (
    <section className="mt-12">
      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-mono uppercase tracking-wider text-brand">{fase.id}</span>
          <h2 className="text-xl font-semibold">{fase.tittel}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{fase.blurb}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {bits.map((b) => (
          <BitKort key={b.slug} bit={b} />
        ))}
      </div>
    </section>
  );
}

function BitKort({ bit }: { bit: ForkursBit }) {
  const tilgjengelig = bit.implementert;
  const innhold = (
    <>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-xs font-mono text-brand">{bit.bitId}</div>
        <FagBadge fag={bit.fag} />
      </div>
      <div className="font-semibold text-sm mb-1 flex items-center gap-2">
        {bit.tittel}
        {tilgjengelig ? (
          <ArrowRight className="h-3 w-3 text-brand group-hover:translate-x-0.5 transition" />
        ) : (
          <Lock className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{bit.blurb}</p>
      <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
        <span className="rounded bg-muted/40 px-1.5 py-0.5">{bit.estimertTid}</span>
        {bit.forutsetninger.length > 0 && (
          <span className="rounded bg-muted/40 px-1.5 py-0.5">
            krever {bit.forutsetninger.join(", ")}
          </span>
        )}
        {!tilgjengelig && (
          <span className="rounded bg-orange-500/15 text-orange-300 px-1.5 py-0.5">
            kommer
          </span>
        )}
      </div>
    </>
  );

  if (!tilgjengelig) {
    return (
      <div className="group rounded-lg border p-4 border-border/50 bg-card/20 opacity-60">
        {innhold}
      </div>
    );
  }
  return (
    <Link
      to="/forkurs/$slug"
      params={{ slug: bit.slug }}
      className="group rounded-lg border p-4 transition border-border bg-card/40 hover:bg-card/70 hover:border-brand/50"
    >
      {innhold}
    </Link>
  );
}

function FagBadge({ fag }: { fag: Fag }) {
  const kart = {
    "DTE-2505": { tekst: "DTE-2505", klasse: "bg-brand/15 text-brand" },
    "DTE-2507": { tekst: "DTE-2507", klasse: "bg-purple-500/15 text-purple-300" },
    begge: { tekst: "begge fag", klasse: "bg-green-500/15 text-green-300" },
  } as const;
  const cfg = kart[fag];
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${cfg.klasse}`}>
      {cfg.tekst}
    </span>
  );
}

function KoblingsKart() {
  return (
    <section className="mt-16 rounded-xl border border-border bg-card/30 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Layers className="h-4 w-4 text-brand" />
        Hva forkurset åpner opp etter semesterstart
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Hvert F-bit har eksplisitte forutsetninger og bygger fundament for spesifikke biter i hovedfagene. Her er de viktigste koblingene:
      </p>
      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <Kobling fra="F-01 + F-02 + F-03" til="alle OS- og SEC-lab" why="trygt eksperimentmiljø" />
        <Kobling fra="F-04 Terminal" til="OS-05 / OS-06 (filsystem-nav)" why="hånda må kunne shell" />
        <Kobling fra="F-05 + F-06 Python" til="DK-10 sockets" why="socket-API krever Python" />
        <Kobling fra="F-08 IP/port" til="DK-19 / DK-20 (IP-adressering)" why="mental modell" />
        <Kobling fra="F-09 Wireshark" til="DK-23 ICMP, SEC-10 sniffing" why="pakkesynlighet" />
        <Kobling fra="F-10 Binær/hex" til="DK-20 subnett, DK-21 IP-header" why="leser bit-felt" />
        <Kobling fra="F-11 Krypto-overflate" til="SEC-01 → SEC-03" why="intuisjon før matte" />
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs">
        <BookOpen className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          Full atomliste i{" "}
          <code className="text-brand">plan-laereplan-os-datakomm.md</code>
        </span>
      </div>
    </section>
  );
}

function Kobling({ fra, til, why }: { fra: string; til: string; why: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="font-mono text-[10px] text-brand">{fra}</div>
      <div className="my-1 text-muted-foreground/60">↓</div>
      <div className="font-mono text-[10px] text-purple-300">{til}</div>
      <div className="text-[10px] text-muted-foreground mt-1">{why}</div>
    </div>
  );
}
