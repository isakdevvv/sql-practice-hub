import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Server, Cpu, HardDrive, Shield, Zap, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";

type GuestState = "fungerer" | "kraesjet" | "infisert";

/**
 * F-01 Virtualisering — hva og hvorfor.
 * Pilot for forkurs-sporet. Visuell først: en interaktiv host/guest-modell der
 * studenten kan ødelegge guest med vilje og se at host står upåvirket.
 */
export function F01Virtualisering() {
  return (
    <StackPageShell title="Forkurs · F-01" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <DualSubjectWhy />
        <SectionTitle id="metafor" nr="1" tittel="Metaforen: datamaskin inni en datamaskin" />
        <Metafor />
        <SectionTitle id="lag" nr="2" tittel="De fire lagene — host, hypervisor, guest, app" />
        <LagDiagram />
        <SectionTitle id="isolasjon" nr="3" tittel="Isolasjon — prøv å ødelegge guest" />
        <IsolasjonSim />
        <SectionTitle id="type" nr="4" tittel="To typer hypervisor — bare-metal vs på toppen av OS-et" />
        <HypervisorTyper />
        <SectionTitle id="drill" nr="5" tittel="Sjekk forståelsen" />
        <Drill />
        <SectionTitle id="neste" nr="6" tittel="Neste steg" />
        <NesteSteg />
      </article>
    </StackPageShell>
  );
}

function Crumbs() {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
      <Link to="/forkurs" className="hover:text-foreground">Forkurs</Link>
      <span>/</span>
      <span>F1 · Verktøykassa</span>
      <span>/</span>
      <span className="text-foreground">F-01 Virtualisering</span>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        Forkurs · Fase F1 · Verktøykassa
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Virtualisering: hva og hvorfor
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        Hele forkurset og store deler av begge fag forutsetter at du har et trygt sted å eksperimentere — et sted hvor du kan installere rare pakker, kjøre kommandoer som root, snuse på nettverkstrafikk og kræsje systemet, uten å påvirke maskinen du faktisk jobber på. Dette stedet er en{" "}
        <strong>virtuell maskin</strong>. Her bygger vi opp hva det egentlig er.
      </p>
    </header>
  );
}

function DualSubjectWhy() {
  return (
    <div className="mb-10 grid sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hvorfor for DTE-2505 (OS)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hele kurset handler om hva et operativsystem gjør. Skal du forstå det, må du kunne <em>installere</em> et OS, <em>ødelegge</em> det og <em>kjøre det på nytt</em>. På din egen maskin er det dramatisk. I en VM er det 15 sekunder.
        </p>
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Hvorfor for DTE-2507 (Datakomm)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pakke-sniffing med Wireshark, brannmur-eksperimenter og angreps-simuleringer går mye lettere når du har en isolert maskin å gjøre det fra. Du vil ikke fange din ekte banktrafikk når du øver.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ id, nr, tittel }: { id: string; nr: string; tittel: string }) {
  return (
    <h2 id={id} className="mt-12 mb-4 text-xl font-semibold scroll-mt-20 flex items-baseline gap-3">
      <span className="text-brand text-base font-mono">{nr}.</span>
      {tittel}
    </h2>
  );
}

function Metafor() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Tenk på datamaskinen din som en leilighet. Du bor der, eier den, har nøklene. En <strong>virtuell maskin</strong> er som å sette opp et dukkehus inne i leiligheten din — en mindre, komplett bolig med eget kjøkken, soverom og dør, plassert inne i ditt eget hjem.
      </p>
      <p>
        Dukkehuset (VM-en) ser ut som en helt vanlig datamaskin innenfra. Den har sin egen prosessor (virtuell), sin eget minne (virtuelt), sin egen harddisk (en fil på din ekte disk). Et operativsystem som kjører inne i dukkehuset, vet ikke at det er et dukkehus — det tror det er en ekte maskin.
      </p>
      <p>
        Magien skjer i et lag mellom de to: <strong>hypervisoren</strong>. Hypervisoren er "byggherre" og "vakt" i ett — den setter opp dukkehuset, oversetter alt dukkehuset prøver å gjøre til ekte operasjoner på den ekte maskinen, og passer på at dukkehuset ikke kommer seg ut.
      </p>
      <div className="rounded-md border border-border bg-card/40 p-4 text-xs text-muted-foreground">
        Ordliste så langt: <strong>host</strong> = den ekte maskinen (leiligheten). <strong>guest</strong> = den virtuelle maskinen (dukkehuset). <strong>hypervisor</strong> = laget som lar dem leve sammen.
      </div>
    </div>
  );
}

function LagDiagram() {
  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Slik ser de fire lagene ut når en VM kjører. Les nedenfra og opp:
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="space-y-2 max-w-md mx-auto">
          {/* App lag - guest */}
          <LagBoks
            farge="purple"
            tittel="Gjeste-app"
            sub="Et program inne i VM-en — f.eks. Firefox eller en terminal"
            icon={<Zap className="h-4 w-4" />}
          />
          <Pil />
          <LagBoks
            farge="purple"
            tittel="Gjeste-OS (Ubuntu i VM)"
            sub="Tror det kjører på ekte maskinvare. Det gjør det ikke."
            icon={<Cpu className="h-4 w-4" />}
          />
          <Pil />
          <LagBoks
            farge="brand"
            tittel="Hypervisor"
            sub="Oversetter gjeste-OS-ets forespørsler til ekte handlinger på host"
            icon={<Shield className="h-4 w-4" />}
            highlight
          />
          <Pil />
          <LagBoks
            farge="muted"
            tittel="Vert-OS (Windows/macOS/Linux)"
            sub="Din ekte daglige maskin"
            icon={<Cpu className="h-4 w-4" />}
          />
          <Pil />
          <LagBoks
            farge="muted"
            tittel="Vert-maskinvare"
            sub="Ekte CPU, RAM, disk, nettverkskort"
            icon={<HardDrive className="h-4 w-4" />}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Den interessante grensen er linja midt på: alt over hypervisoren er <em>gjest</em>, alt under er <em>vert</em>. Hypervisoren er den eneste broa.
      </p>
    </div>
  );
}

function LagBoks({
  farge,
  tittel,
  sub,
  icon,
  highlight,
}: {
  farge: "brand" | "purple" | "muted";
  tittel: string;
  sub: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  const fargeKlass =
    farge === "brand"
      ? "border-brand/50 bg-brand/10 text-brand"
      : farge === "purple"
        ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
        : "border-border bg-card/60 text-foreground";
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${fargeKlass} ${highlight ? "ring-2 ring-brand/40" : ""}`}
    >
      <div className="flex items-center gap-2 font-semibold text-sm">
        {icon}
        {tittel}
      </div>
      <div className="text-xs opacity-80 mt-1">{sub}</div>
    </div>
  );
}

function Pil() {
  return (
    <div className="flex justify-center text-muted-foreground/50 text-xs select-none">↑</div>
  );
}

function IsolasjonSim() {
  const [guest, setGuest] = useState<GuestState>("fungerer");

  const reset = () => setGuest("fungerer");
  const kraesj = () => setGuest("kraesjet");
  const infiser = () => setGuest("infisert");

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Det viktigste poenget: <strong>guest kan ikke skade host</strong>. Hypervisoren holder dem adskilt. Prøv selv — klikk på knappene under og se hva som skjer med både gjest og vert.
      </p>
      <div className="rounded-xl border border-border bg-card/30 p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Maskin
            label="Vert (din ekte maskin)"
            tilstand="fungerer"
            farge="green"
            besked={
              guest === "fungerer"
                ? "Alt i orden. Skriver e-post, bryggekaffe."
                : guest === "kraesjet"
                  ? "Helt uberørt. Du merker ingenting."
                  : "Helt uberørt — du har til og med antivirus, men skadevaren er låst inne i VM-en."
            }
          />
          <Maskin
            label="Gjest (VM-en din)"
            tilstand={guest}
            farge={guest === "fungerer" ? "green" : "red"}
            besked={
              guest === "fungerer"
                ? "Ubuntu kjører. Du er logget inn som student."
                : guest === "kraesjet"
                  ? "BSOD-equivalent. Filsystemet er forhåpentligvis korrupt."
                  : "Skadevaren har spredt seg inne i VM-en. Filer kryptert. Host vet ikke at noe er feil."
            }
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={kraesj}
            disabled={guest === "kraesjet"}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            Kjør &quot;rm -rf /&quot; i gjest
          </button>
          <button
            onClick={infiser}
            disabled={guest === "infisert"}
            className="rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-300 hover:bg-orange-500/20 disabled:opacity-50"
          >
            Last ned skadevare i gjest
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted/40"
          >
            Rull tilbake snapshot
          </button>
        </div>
        <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          <strong className="text-brand">Hva poenget er:</strong> det du gjør i VM-en, blir i VM-en. Selv om du gjør de mest destruktive tingene mulig, er host trygg. Du kan rulle gjest tilbake til en tidligere snapshot på sekunder. Det er <em>derfor</em> vi setter opp denne strukturen før vi gjør noe annet.
        </div>
      </div>
    </div>
  );
}

function Maskin({
  label,
  tilstand,
  farge,
  besked,
}: {
  label: string;
  tilstand: GuestState;
  farge: "green" | "red";
  besked: string;
}) {
  const ramme =
    farge === "green"
      ? "border-green-500/40 bg-green-500/5"
      : "border-red-500/40 bg-red-500/10 animate-pulse";
  const ikon =
    tilstand === "fungerer" ? (
      <CheckCircle2 className="h-5 w-5 text-green-400" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-400" />
    );
  return (
    <div className={`rounded-lg border p-4 ${ramme}`}>
      <div className="flex items-center gap-2 font-semibold text-sm">
        {ikon}
        {label}
      </div>
      <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{besked}</div>
    </div>
  );
}

function HypervisorTyper() {
  return (
    <div className="my-6 grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
          Type 1 — bare-metal
        </div>
        <div className="font-semibold mb-2">Hypervisor rett på maskinvaren</div>
        <p className="text-muted-foreground text-xs leading-relaxed mb-3">
          Ingen vert-OS. Hypervisoren ER det første som kjører. Brukes i datasentre fordi den er rask og direkte. Eksempler: <em>VMware ESXi, KVM, Xen, Hyper-V</em>.
        </p>
        <div className="rounded border border-border bg-background p-2 font-mono text-[10px] leading-tight">
          <div>VM-1   VM-2   VM-3</div>
          <div>━━━━━━━━━━━━━━━━━</div>
          <div>Hypervisor</div>
          <div>━━━━━━━━━━━━━━━━━</div>
          <div>Maskinvare</div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="text-xs uppercase tracking-wider text-purple-300 font-semibold mb-2">
          Type 2 — på toppen av OS
        </div>
        <div className="font-semibold mb-2">Hypervisor som en app på vert-OS-et</div>
        <p className="text-muted-foreground text-xs leading-relaxed mb-3">
          Du har Windows/macOS/Linux som vanlig, og installerer hypervisoren som et program. Litt tregere, men praktisk for læring. Eksempler: <em>VirtualBox, VMware Workstation, Parallels</em>. Dette er det du skal bruke i forkurset.
        </p>
        <div className="rounded border border-border bg-background p-2 font-mono text-[10px] leading-tight">
          <div>VM-1   VM-2</div>
          <div>━━━━━━━━━━━━━</div>
          <div>Hypervisor (app)</div>
          <div>━━━━━━━━━━━━━</div>
          <div>Vert-OS</div>
          <div>━━━━━━━━━━━━━</div>
          <div>Maskinvare</div>
        </div>
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Du installerer Ubuntu i en VM på Windows-laptopen din. Hva er host og hva er guest?",
      valg: [
        "Host = Ubuntu, guest = Windows",
        "Host = Windows, guest = Ubuntu",
        "Begge er guest, hypervisoren er host",
      ],
      riktig: 1,
      forklaring: "Vert (host) er din fysiske maskin med Windows. Gjest (guest) er Ubuntu inne i VM-en. Hypervisoren (VirtualBox) er broa mellom dem, ikke en egen 'maskin'.",
    },
    {
      q: "Du kjører en skadelig fil ved et uhell inne i guest. Hva skjer med host?",
      valg: [
        "Skadevaren sprer seg automatisk til host",
        "Ingenting — guest er isolert. Du kan rulle tilbake til snapshot.",
        "Host slås av av sikkerhetsgrunner",
      ],
      riktig: 1,
      forklaring: "Det er nettopp DERFOR vi bruker VM. Hypervisoren holder guest fanget. Du kan til og med eksperimentere med ekte malware i VM så lenge nettverket er av — uten å påvirke host.",
    },
    {
      q: "Type 1 vs type 2 — hvilken bruker du i forkurset?",
      valg: [
        "Type 1 (bare-metal, som ESXi)",
        "Type 2 (oppå Windows/macOS — VirtualBox)",
        "Begge samtidig",
      ],
      riktig: 1,
      forklaring: "VirtualBox er Type 2: den kjører som en app på det operativsystemet du allerede har. Type 1 brukes i datasentre, ikke på laptoper.",
    },
  ];
  return (
    <div className="my-6 space-y-4">
      {sporsmal.map((s, i) => (
        <Quiz key={i} {...s} nr={i + 1} />
      ))}
    </div>
  );
}

function Quiz({
  nr,
  q,
  valg,
  riktig,
  forklaring,
}: {
  nr: number;
  q: string;
  valg: string[];
  riktig: number;
  forklaring: string;
}) {
  const [valgt, setValgt] = useState<number | null>(null);
  return (
    <div className="rounded-lg border border-border bg-card/30 p-4">
      <div className="text-sm font-medium mb-3">
        <span className="text-brand mr-2">Sjekk {nr}.</span>
        {q}
      </div>
      <div className="space-y-1.5">
        {valg.map((v, i) => {
          const erValgt = valgt === i;
          const erRiktig = i === riktig;
          const visStatus = valgt !== null && erValgt;
          const klass = visStatus
            ? erRiktig
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
            : "border-border bg-background hover:bg-muted/40";
          return (
            <button
              key={i}
              onClick={() => setValgt(i)}
              disabled={valgt !== null}
              className={`block w-full text-left rounded-md border px-3 py-2 text-xs ${klass} disabled:cursor-default`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {valgt !== null && (
        <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
          {valgt === riktig ? (
            <span className="text-green-300 font-semibold">Riktig. </span>
          ) : (
            <span className="text-red-300 font-semibold">Ikke helt. </span>
          )}
          {forklaring}
        </div>
      )}
    </div>
  );
}

function NesteSteg() {
  return (
    <div className="my-6 rounded-lg border border-border bg-card/30 p-5">
      <p className="text-sm leading-relaxed mb-4">
        Nå vet du <em>hva</em> en VM er og <em>hvorfor</em> du trenger den. Neste steg: faktisk sett opp en.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs/$slug"
          params={{ slug: "f02-installer-vm" }}
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            F-02 · neste
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Installer VirtualBox + Ubuntu
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
        <Link
          to="/forkurs"
          className="group rounded-md border border-border bg-background p-4 hover:bg-muted/40 transition"
        >
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            <BookOpen className="h-3 w-3 inline mr-1" /> Oversikt
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Tilbake til forkurs-løypen
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        Denne biten åpner opp for: <code className="text-brand">F-02</code>,{" "}
        <code className="text-brand">OS-01</code> (hva er et OS),{" "}
        <code className="text-brand">F-09</code> (Wireshark trenger trygt miljø).
      </div>
    </div>
  );
}
