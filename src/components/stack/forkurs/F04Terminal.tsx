import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Terminal as TerminalIcon,
  Bot,
  User,
  ShieldAlert,
  CornerDownLeft,
  BookOpen,
  Cpu,
  Server,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { VisualDefs } from "@/components/stack/kurose-kurs/VisualDefs";
import {
  PromptIcon,
  ShellIcon,
  KommandoIcon,
} from "./forkursIcons";

type Linje = { kommando: string; svar: string };

/**
 * F-04 Åpne terminalen.
 * Metafor: en veldig konkret robot. Mock-terminal med hardkodet output for
 * et lite sett kommandoer. Visualisert prompt-anatomi.
 */
export function F04Terminal() {
  return (
    <StackPageShell title="Forkurs · F-04" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <Crumbs />
        <Header />
        <PrimarySubjectWhy />
        <SectionTitle id="robot" nr="1" tittel="Metaforen: en veldig konkret robot" />
        <RobotMetafor />
        <SectionTitle id="prompt" nr="2" tittel="Hva en prompt egentlig viser deg" />
        <PromptAnatomi />
        <SectionTitle id="dollar-vs-hash" nr="3" tittel="$ vs # — vanlig bruker vs root" />
        <DollarVsHash />
        <SectionTitle id="lek" nr="4" tittel="Prøv selv — en mock-terminal" />
        <MockTerminal />
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
      <span className="text-foreground">F-04 Åpne terminalen</span>
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
        Åpne terminalen
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        I VM-en din finnes det et lite svart vindu som heter <em>terminal</em>. Det er stedet de fleste OS-eksperimenter, nettverks-tester og fil-operasjoner skjer. Mange synes terminalen er skummel første gang — det skal vi rette på her. Ved slutten av denne biten har du skrevet dine første kommandoer, sett hva en prompt faktisk består av, og forstår forskjellen mellom <code className="text-brand">$</code> og <code className="text-brand">#</code>.
      </p>
    </header>
  );
}

function PrimarySubjectWhy() {
  return (
    <div className="mb-10 grid sm:grid-cols-3 gap-3">
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 sm:col-span-2">
        <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
          <Cpu className="h-4 w-4" /> Hvorfor for DTE-2505 (OS) — primært
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          OS-faget bygger nesten alt på terminal-kommandoer: prosesser, filer, signaler, schedulering. Du må kunne bevege deg i et filsystem med <code className="text-brand">cd</code>, se prosesser med <code className="text-brand">ps</code>, og forstå hva en kommando faktisk gjorde basert på utskriften. Uten terminal-flyt blir resten unødvendig tungt.
        </p>
      </div>
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
        <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm mb-2">
          <Server className="h-4 w-4" /> Også nyttig for DTE-2507
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <code className="text-purple-300">ping</code>, <code className="text-purple-300">nmap</code>, <code className="text-purple-300">curl</code> — datakomm-eksperimentene starter ofte i samme svarte vindu.
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

function RobotMetafor() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Tenk på terminalen som en veldig konkret robot. Ingen menyer, ingen knapper, ingen tankelesing. Du skriver én linje med tekst, trykker Enter, og roboten gjør nøyaktig det som står der. Hverken mer eller mindre. Hvis du staver feil, sier den "kjenner ikke kommandoen". Hvis du sier "slett alt", sletter den alt — uten å spørre.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-2">
            <User className="h-4 w-4 text-brand" /> Du
          </div>
          <div className="rounded bg-background border border-border p-3 font-mono text-xs">
            <span className="text-brand">$</span> hvor er jeg?
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-2">
            <Bot className="h-4 w-4 text-purple-300" /> Roboten
          </div>
          <div className="rounded bg-background border border-border p-3 font-mono text-xs text-red-300">
            bash: hvor: command not found
          </div>
        </div>
      </div>
      <p>
        Den forstår ikke norsk og ikke spørsmål. Den forstår <strong>kommando-navn</strong> som <code className="text-brand">pwd</code> (print working directory — "skriv nåværende mappe") og <code className="text-brand">ls</code> (list — "vis innholdet"). Heldigvis er det rundt 20 kommandoer som dekker 95 % av det du trenger.
      </p>
      <VisualDefs
        title="Tre ord du vil møte"
        items={[
          {
            term: "ledetekst (prompt)",
            icon: <PromptIcon />,
            body: "Teksten foran skrivemerket som forteller hvor du er — typisk noe som $ eller bruker@maskin:~$. Også kalt prompt på engelsk.",
          },
          {
            term: "shell",
            icon: <ShellIcon />,
            body: "Selve roboten — programmet som tolker kommandoene dine. På Ubuntu heter den ofte bash eller zsh.",
          },
          {
            term: "kommando",
            icon: <KommandoIcon />,
            body: "Den ene linja du skriver før du trykker Enter — f.eks. ls -la eller pwd.",
          },
        ]}
      />
    </div>
  );
}

function PromptAnatomi() {
  return (
    <div className="my-6 space-y-4 text-sm leading-relaxed">
      <p>
        Når du åpner terminalen ser du noe sånt som dette:
      </p>
      <div className="rounded-lg border border-border bg-background p-5 font-mono text-base text-center">
        <span className="text-green-300">student</span>
        <span className="text-muted-foreground">@</span>
        <span className="text-blue-300">ubuntu</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-purple-300">~</span>
        <span className="text-brand">$</span>
        <span className="inline-block w-2.5 h-4 bg-foreground/70 ml-1 align-middle animate-pulse" />
      </div>
      <p>
        Hver lille bit har en betydning. Vi bryter den ned:
      </p>
      <div className="grid gap-2">
        <PromptDel
          farge="green"
          tekst="student"
          tittel="brukernavn"
          forklaring="Hvem som er logget inn. Du satte dette under Ubuntu-installasjonen i F-02."
        />
        <PromptDel
          farge="muted"
          tekst="@"
          tittel="ved (separator)"
          forklaring="Skiller bruker fra maskinnavn. Som i en e-postadresse."
        />
        <PromptDel
          farge="blue"
          tekst="ubuntu"
          tittel="maskinnavn"
          forklaring="Navnet på VM-en. Du kan endre det senere — det er bare for å gjøre det lett å se hvilken maskin du er på."
        />
        <PromptDel
          farge="muted"
          tekst=":"
          tittel="separator"
          forklaring="Skiller maskin-info fra mappe-info."
        />
        <PromptDel
          farge="purple"
          tekst="~"
          tittel="nåværende mappe"
          forklaring="Tildesymbolet betyr 'hjemmemappa di' (/home/student). Hadde du stått i /var/log ville det stått 'log' her, eller hele stien hvis du har konfigurert det sånn."
        />
        <PromptDel
          farge="brand"
          tekst="$"
          tittel="klar for kommando"
          forklaring="Vises som $ når du er vanlig bruker. Etter dette tegnet skriver du kommandoen din."
        />
      </div>
    </div>
  );
}

function PromptDel({
  farge,
  tekst,
  tittel,
  forklaring,
}: {
  farge: "green" | "blue" | "purple" | "brand" | "muted";
  tekst: string;
  tittel: string;
  forklaring: string;
}) {
  const farger: Record<typeof farge, string> = {
    green: "text-green-300 border-green-500/30 bg-green-500/5",
    blue: "text-blue-300 border-blue-500/30 bg-blue-500/5",
    purple: "text-purple-300 border-purple-500/30 bg-purple-500/5",
    brand: "text-brand border-brand/30 bg-brand/5",
    muted: "text-muted-foreground border-border bg-card/40",
  };
  return (
    <div className={`rounded-lg border p-3 flex items-start gap-4 ${farger[farge]}`}>
      <div className="font-mono text-lg flex-shrink-0 w-12 text-center">{tekst}</div>
      <div className="flex-1">
        <div className="font-semibold text-xs uppercase tracking-wider mb-1">{tittel}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{forklaring}</p>
      </div>
    </div>
  );
}

function DollarVsHash() {
  return (
    <div className="my-6 grid md:grid-cols-2 gap-4 text-sm">
      <div className="rounded-lg border border-border bg-card/40 p-5">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2 flex items-center gap-2">
          <User className="h-4 w-4" /> $ — vanlig bruker
        </div>
        <div className="rounded bg-background border border-border p-3 font-mono text-xs mb-3">
          <span className="text-green-300">student</span>
          <span className="text-muted-foreground">@ubuntu:~</span>
          <span className="text-brand">$ </span>
          ls
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Du har lov til å gjøre ting i din egen mappe. Du kan ikke endre system-filer, installere pakker, eller drepe andres prosesser. Hvis du prøver, får du <em>Permission denied</em>.
        </p>
      </div>
      <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-5">
        <div className="text-xs uppercase tracking-wider text-red-300 font-semibold mb-2 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> # — root (admin)
        </div>
        <div className="rounded bg-background border border-border p-3 font-mono text-xs mb-3">
          <span className="text-red-300">root</span>
          <span className="text-muted-foreground">@ubuntu:~</span>
          <span className="text-red-300"># </span>
          apt install nginx
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Tegnet endrer seg til <code className="text-red-300">#</code> når du har full adgang. Du kan endre alt — også slette ting som ødelegger hele systemet. Bruk <code className="text-brand">sudo &lt;kommando&gt;</code> for å låne root-rettigheter for én enkelt kommando.
        </p>
      </div>
      <div className="md:col-span-2 rounded-md border border-orange-500/30 bg-orange-500/5 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-orange-300 font-semibold mb-1">
          <ShieldAlert className="h-4 w-4" /> Tommelfingerregel
        </div>
        Ser du <code className="text-red-300">#</code> — vær våken. Hver kommando kan endre systemet permanent. Det er nettopp her snapshots fra F-03 redder deg når du vil eksperimentere som root.
      </div>
    </div>
  );
}

function MockTerminal() {
  const tilgjengelige: Record<string, string> = {
    pwd: "/home/student",
    whoami: "student",
    date: "Tue May 20 14:32:11 CEST 2026",
    "echo hei": "hei",
    "echo hello": "hello",
    ls: "Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos",
    clear: "__CLEAR__",
    help: "Tilgjengelige kommandoer i denne sandkassa: pwd, whoami, date, ls, echo <noe>, clear, help",
  };

  const [historikk, setHistorikk] = useState<Linje[]>([
    {
      kommando: "",
      svar: "Velkommen til mock-terminalen. Skriv 'help' for å se hva som finnes.",
    },
  ]);
  const [input, setInput] = useState("");

  const kjor = (raa: string) => {
    const kmd = raa.trim();
    if (!kmd) return;

    let svar: string;
    if (kmd === "clear") {
      setHistorikk([]);
      setInput("");
      return;
    }
    if (kmd.startsWith("echo ")) {
      svar = kmd.slice(5);
    } else if (tilgjengelige[kmd] !== undefined) {
      svar = tilgjengelige[kmd];
    } else {
      svar = `bash: ${kmd.split(" ")[0]}: command not found`;
    }

    setHistorikk((h) => [...h, { kommando: kmd, svar }]);
    setInput("");
  };

  const forslag = ["pwd", "whoami", "date", "ls", "echo hei"];

  return (
    <div className="my-6">
      <p className="text-sm leading-relaxed mb-4">
        Dette er en miniatyrversjon — bare et håndfull kommandoer fungerer. Men det er nok til å føle hvordan rytmen er: skrive, trykke Enter, lese svar.
      </p>
      <div className="rounded-xl border border-border bg-background overflow-hidden shadow-lg">
        {/* Tittelbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <TerminalIcon className="h-3 w-3" />
            student@ubuntu: ~
          </span>
        </div>

        {/* Innhold */}
        <div className="p-4 font-mono text-xs space-y-1 min-h-[16rem] max-h-[24rem] overflow-y-auto">
          {historikk.map((l, i) => (
            <div key={i}>
              {l.kommando !== "" && (
                <div>
                  <span className="text-green-300">student</span>
                  <span className="text-muted-foreground">@ubuntu</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-purple-300">~</span>
                  <span className="text-brand">$ </span>
                  {l.kommando}
                </div>
              )}
              {l.svar && <div className="text-foreground/90 whitespace-pre-wrap">{l.svar}</div>}
            </div>
          ))}

          {/* Aktiv prompt */}
          <div className="flex items-center gap-1">
            <span className="text-green-300">student</span>
            <span className="text-muted-foreground">@ubuntu</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-purple-300">~</span>
            <span className="text-brand">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") kjor(input);
              }}
              autoFocus
              spellCheck={false}
              className="flex-1 bg-transparent outline-none border-none text-foreground caret-foreground ml-1"
              placeholder="skriv en kommando, trykk Enter…"
            />
          </div>
        </div>
      </div>

      {/* Snarvei-knapper */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">Forslag:</span>
        {forslag.map((k) => (
          <button
            key={k}
            onClick={() => kjor(k)}
            className="rounded-md border border-border bg-card/40 px-2.5 py-1 text-xs font-mono hover:bg-muted/40"
          >
            {k} <CornerDownLeft className="inline h-3 w-3 ml-0.5 opacity-60" />
          </button>
        ))}
        <button
          onClick={() => kjor("clear")}
          className="rounded-md border border-border bg-card/40 px-2.5 py-1 text-xs font-mono hover:bg-muted/40 ml-auto"
        >
          clear
        </button>
      </div>

      <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-muted-foreground">
        <strong className="text-brand">Merk:</strong> Dette er kun en simulering. I den ekte terminalen i Ubuntu-VM-en din har du tusenvis av kommandoer tilgjengelig, og kan navigere mellom mapper med <code className="text-brand">cd</code>. Vi tar det dypere i neste bit.
      </div>
    </div>
  );
}

function Drill() {
  const sporsmal: { q: string; valg: string[]; riktig: number; forklaring: string }[] = [
    {
      q: "Du ser dette i prompten: 'student@ubuntu:~$'. Hva betyr ~?",
      valg: [
        "Et navn på en undermappe",
        "Hjemmemappa di — /home/student",
        "Et tegn som bare brukes til pynt",
      ],
      riktig: 1,
      forklaring:
        "Tildesymbolet er en snarvei for hjemmemappa di. Står det 'student@ubuntu:~$' er du i /home/student. Skriver du `cd /var` endrer det seg til '/var'. Skriver du `cd` (uten argument) går du tilbake til ~.",
    },
    {
      q: "Forskjellen på $ og # i slutten av prompten?",
      valg: [
        "$ er for shell-kommandoer, # er for kommentarer",
        "$ betyr vanlig bruker; # betyr root (full admin-tilgang)",
        "# vises bare på mandager",
      ],
      riktig: 1,
      forklaring:
        "Tegnet er en advarsel om privilegienivå. $ = du har begrensa rettigheter, kan ikke ødelegge systemet ved et uhell. # = du er root, hver kommando kan endre systemet permanent. Bruk `sudo` for å hoppe til # for én enkelt kommando.",
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
        Du har skrevet dine første kommandoer og forstår hva prompten faktisk forteller deg. Resten av F-sporet bygger på det — navigere filsystem, kjøre programmer, koble til nett.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/forkurs"
          className="group rounded-md border border-brand/30 bg-brand/5 p-4 hover:bg-brand/10 transition"
        >
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            Fortsett
          </div>
          <div className="font-medium text-sm flex items-center gap-2">
            Videre i forkurset (F-05 +)
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
        Denne biten åpner opp for: <code className="text-brand">F-05</code> (filsystem-navigasjon),{" "}
        <code className="text-brand">OS-03</code> (prosesser med ps/top),{" "}
        <code className="text-brand">OS-06</code> (signaler, kill),{" "}
        <code className="text-brand">DK-02</code> (ping/curl/nmap).
      </div>
    </div>
  );
}
