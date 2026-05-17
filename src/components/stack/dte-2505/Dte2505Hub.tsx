import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  Terminal,
  FileCode,
  Users,
  Server,
  Cpu,
  ClipboardCheck,
  Keyboard,
  GitBranch,
  Lightbulb,
  Activity,
  MemoryStick,
  Lock,
  Layers,
  Calendar,
  Sparkles,
  PlayCircle,
  BookOpen,
  Eye,
  Wrench,
  Brain,
  ScrollText,
  Network,
  HardDrive,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";
import { ModulStatusBadge, ModulProgressBar } from "@/components/stack/HubShared";
import { EXAM_META } from "@/lib/subjects/catalog";
import { useModulProgress } from "@/lib/stack/moduleProgress";

type Lab = {
  slug: string;
  title: string;
  blurb: string;
  Icon: typeof Terminal;
  taggar: string[];
};

// Interaktive visualiseringer/labs — pedagogikken er "se og prøv", ikke "les".
// Disse hadde tidligere kun vært nåbare via fag-huben (foreldreløse fra topp-menyen).
const LABS: Lab[] = [
  {
    slug: "dte2505-scheduling-drill",
    title: "CPU-scheduling — Gantt-drill",
    blurb:
      "FIFO, SJF, STCF, Round-Robin, MLFQ. Interaktiv Gantt-simulator med 5 ferdige øvelser.",
    Icon: Activity,
    taggar: ["scheduling", "OSTEP 7–10"],
  },
  {
    slug: "dte2505-virtuelt-minne",
    title: "Virtuelt minne & paging",
    blurb:
      "VPN/PFN/offset, page-tabell, TLB, page faults. FIFO/LRU/Clock-replacement. Interaktiv adresseoversetter.",
    Icon: MemoryStick,
    taggar: ["minne", "OSTEP 15–22"],
  },
  {
    slug: "dte2505-konkurrens",
    title: "Concurrency & deadlock",
    blurb:
      "Race conditions, mutex, semaforer, Coffmans fire betingelser, dining philosophers, RAG-detektor.",
    Icon: Lock,
    taggar: ["konkurrens", "OSTEP 28–33"],
  },
  {
    slug: "dte2505-thread-state",
    title: "Thread state-maskin",
    blurb:
      "NEW/RUN/WAIT/TERMINATED. Klikk gjennom overganger, se run/wait-queues fylles. O'Gorman 2.7+2.9.",
    Icon: Layers,
    taggar: ["tråder", "scheduling"],
  },
  {
    slug: "dte2505-thread-vs-prosess",
    title: "Thread vs prosess — minne-modell",
    blurb:
      "Animert minne-layout for fork() vs pthread_create(), COW, race-condition-demo. O'Gorman 2.3+2.6.",
    Icon: Layers,
    taggar: ["tråder", "minne"],
  },
  {
    slug: "dte2505-kontekstbytte",
    title: "Kontekstbytte — register-for-register",
    blurb:
      "Save/restore av PCB-felter steg for steg. O'Gorman kap. 2.8.",
    Icon: Cpu,
    taggar: ["scheduling", "PCB"],
  },
  {
    slug: "dte2505-prosesser-signaler",
    title: "Prosesser og signaler",
    blurb: "Mock-prosess-monitor: send SIGTERM vs SIGKILL, se forskjellen live.",
    Icon: Activity,
    taggar: ["prosesser"],
  },
  {
    slug: "dte2505-rwx-kalkulator",
    title: "rwx-kalkulator",
    blurb: "9-bits-grid ↔ oktal og ls-streng live. Konverter begge veier.",
    Icon: Lock,
    taggar: ["rettigheter"],
  },
  {
    slug: "dte2505-bash-scripts",
    title: "Bash-pad med mock-FS",
    blurb: "Skriv skript, kjør mot fake filsystem, sammenlign stdout mot fasit.",
    Icon: FileCode,
    taggar: ["shell"],
  },
  {
    slug: "dte2505-ipc",
    title: "IPC — pipes & shared memory",
    blurb: "Visualiser dataflyt mellom prosesser via pipe, shared memory og message queue.",
    Icon: Network,
    taggar: ["IPC", "prosesser"],
  },
  {
    slug: "dte2505-io-management",
    title: "I/O management — drivere & DMA",
    blurb: "Enhetsklasser, driver-stack, polling vs interrupt vs DMA, buffer cache, disk-scheduling. 5 visualizers.",
    Icon: HardDrive,
    taggar: ["I/O", "OSTEP 36"],
  },
  {
    slug: "dte2505-virtualisering",
    title: "Virtualisering vs containere (dyp)",
    blurb: "Hypervisor type-1 vs type-2 (KVM/VMware), containere via namespaces+cgroups, isolasjon-overhead-sammenligning.",
    Icon: Server,
    taggar: ["virtualisering", "containere"],
  },
];

type ConceptCourse = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Terminal;
};

// Konsept-leksjoner (les og forstå). Brukes til "Anbefalt neste"-utregning og
// vises i Les-seksjonen. Rekkefølgen her bestemmer "neste anbefalte trinn".
const CONCEPT_COURSES: ConceptCourse[] = [
  {
    slug: "os-grunnlag",
    title: "OS-grunnlag",
    shortDescription:
      "Kernel vs userspace, prosesser og threads, scheduling, filsystem-konsept, syscalls.",
    Icon: Cpu,
  },
  {
    slug: "dte2505-os-typologi",
    title: "OS-typologi",
    shortDescription:
      "Hva slags OS finnes — sanntid, embedded, multi-bruker, distribuert.",
    Icon: Layers,
  },
  {
    slug: "linux-bruk",
    title: "Linux-bruk",
    shortDescription:
      "Bash-shell, FHS, navigasjon (ls/cd/find), filer (cat/less/grep), pakkehåndtering.",
    Icon: Terminal,
  },
  {
    slug: "shell-scripting",
    title: "Shell scripting",
    shortDescription:
      "Variabler, if/while/for, pipes, redirigering, exit-koder og vanlige drift-skript.",
    Icon: FileCode,
  },
  {
    slug: "brukere-rettigheter",
    title: "Brukere og rettigheter",
    shortDescription:
      "useradd, /etc/passwd, sudo vs su, rwx, chmod (oktal+symbolsk), chown, umask.",
    Icon: Users,
  },
  {
    slug: "dte2505-spesialbits",
    title: "Spesialbits — setuid, setgid, sticky",
    shortDescription:
      "Hva 4755 og 1777 egentlig betyr, hvorfor /tmp har sticky-bit, sikkerhets-fellene.",
    Icon: Lock,
  },
  {
    slug: "dte2505-filsystem",
    title: "Filsystem — inode & block",
    shortDescription:
      "Hva en inode er, hvordan navn vs data er adskilt, hardlinks vs symlinks, ext4-grunnlag.",
    Icon: HardDrive,
  },
  {
    slug: "virtualisering",
    title: "Virtualisering",
    shortDescription:
      "VM vs container, hypervisor type 1/2, Docker-basics, snapshots og bruksområder.",
    Icon: Server,
  },
];

// Eksamen-temaer — typisk DTE-2505 skriftlig eksamen. Hver tema peker til
// relevant content (konsept eller lab) som dekker pensumet.
type ExamTopic = {
  topic: string;
  Icon: typeof Terminal;
  slugs: { slug: string; label: string }[];
};

const EXAM_TOPICS: ExamTopic[] = [
  {
    topic: "Prosesser & tråder",
    Icon: Layers,
    slugs: [
      { slug: "os-grunnlag", label: "Konsept" },
      { slug: "dte2505-thread-vs-prosess", label: "Minne-modell" },
      { slug: "dte2505-thread-state", label: "State-maskin" },
      { slug: "dte2505-prosesser-signaler", label: "Signaler" },
    ],
  },
  {
    topic: "CPU-scheduling",
    Icon: Activity,
    slugs: [
      { slug: "dte2505-scheduling-drill", label: "Gantt-drill" },
      { slug: "dte2505-kontekstbytte", label: "Kontekstbytte" },
    ],
  },
  {
    topic: "Minne & paging",
    Icon: MemoryStick,
    slugs: [{ slug: "dte2505-virtuelt-minne", label: "Adresseoversetter" }],
  },
  {
    topic: "Konkurrens & deadlock",
    Icon: Lock,
    slugs: [{ slug: "dte2505-konkurrens", label: "Mutex/semafor/RAG" }],
  },
  {
    topic: "IPC",
    Icon: Network,
    slugs: [{ slug: "dte2505-ipc", label: "Pipes & shared memory" }],
  },
  {
    topic: "Filsystem & rettigheter",
    Icon: HardDrive,
    slugs: [
      { slug: "dte2505-filsystem", label: "Inode & block" },
      { slug: "brukere-rettigheter", label: "rwx" },
      { slug: "dte2505-spesialbits", label: "setuid/setgid/sticky" },
      { slug: "dte2505-rwx-kalkulator", label: "rwx-kalkulator" },
    ],
  },
  {
    topic: "Shell & scripting",
    Icon: FileCode,
    slugs: [
      { slug: "linux-bruk", label: "Linux-grunnlag" },
      { slug: "shell-scripting", label: "Shell-konsept" },
      { slug: "dte2505-bash-scripts", label: "Bash-pad" },
    ],
  },
  {
    topic: "Virtualisering",
    Icon: Server,
    slugs: [
      { slug: "virtualisering", label: "Konsept" },
      { slug: "dte2505-virtualisering", label: "Hypervisor & containere (dyp)" },
    ],
  },
  {
    topic: "I/O & disk",
    Icon: HardDrive,
    slugs: [{ slug: "dte2505-io-management", label: "Drivere, DMA & scheduling" }],
  },
];

const MODE_ANCHORS: { id: string; label: string; Icon: typeof Terminal }[] = [
  { id: "les", label: "Les", Icon: BookOpen },
  { id: "visualiser", label: "Visualiser", Icon: Eye },
  { id: "ov", label: "Øv", Icon: Wrench },
  { id: "eksamen", label: "Eksamen", Icon: ScrollText },
  { id: "tutor", label: "AI-tutor", Icon: Brain },
];

export function Dte2505Hub() {
  const meta = EXAM_META["dte-2505"];

  const allConceptSlugs = useMemo(() => CONCEPT_COURSES.map((c) => c.slug), []);
  const { seen, total } = useModulProgress(allConceptSlugs);
  const nextSlug = useNextUnseenSlug(allConceptSlugs);
  const nextCourse = useMemo(
    () => CONCEPT_COURSES.find((c) => c.slug === nextSlug) ?? CONCEPT_COURSES[0],
    [nextSlug],
  );
  const allDone = total > 0 && seen === total;

  return (
    <StackPageShell title="DTE-2505 Operativsystemer" group="eksamen">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Hero med eksamen-meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-1 font-semibold">
              DTE-2505
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              {meta?.stp ?? 5} stp
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2.5 py-1">
              <Calendar className="h-3 w-3" />
              Eksamen {meta?.eksamen ?? "02.12.2026"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-1">
              Linux-fokusert
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Operativsystemer</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Hvordan operativsystemet er bygd opp, Linux i bruk, shell-scripting,
            brukere og rettigheter, virtualisering. Velg modus under — alle ligger
            på denne siden.
          </p>
        </div>

        {/* Modus-rad — anker-knapper til seksjonene under. Sticky så de følger med når du scroller. */}
        <nav
          aria-label="Velg modus"
          className="mb-6 sticky top-14 z-20 -mx-4 px-4 py-2 bg-background/85 backdrop-blur border-b border-border"
        >
          <div className="flex flex-wrap gap-1.5 text-xs">
            {MODE_ANCHORS.map((m) => {
              const Icon = m.Icon;
              return (
                <a
                  key={m.id}
                  href={`#${m.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card hover:border-brand/50 hover:bg-brand/5 px-2.5 py-1.5 text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" />
                  {m.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Anbefalt neste + total framdrift */}
        <div className="mb-10 grid sm:grid-cols-[2fr_1fr] gap-3">
          <Link
            to="/stack/$slug"
            params={{ slug: nextCourse.slug }}
            className="group rounded-xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 to-success/5 hover:border-brand transition-colors p-5 block"
          >
            <div className="flex items-center gap-2 mb-1">
              <PlayCircle className="h-5 w-5 text-brand" />
              <div className="text-[10px] uppercase tracking-wider font-semibold text-brand">
                {allDone ? "Repeter" : seen === 0 ? "Start her" : "Anbefalt neste"}
              </div>
            </div>
            <h3 className="font-semibold text-foreground leading-tight text-lg mt-1">
              {nextCourse.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-snug mt-1">
              {nextCourse.shortDescription}
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-brand">
              {seen === 0 ? "Start" : "Fortsett"}
              <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              Din framdrift
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {seen}{" "}
              <span className="text-muted-foreground text-base font-normal">
                / {total}
              </span>
            </div>
            <ModulProgressBar trinnSlugs={allConceptSlugs} />
            <div className="mt-3 text-[11px] text-muted-foreground">
              Konsept-leksjoner sett. Labs og eksamens-temaer telles ikke her.
            </div>
          </div>
        </div>

        {/* Læringssti — beholdt fra forrige versjon */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Læringssti — anbefalt rekkefølge</h2>
          <LearningPath
            fag="DTE-2505"
            forbinder={[
              "DTE-2507 (TCP/IP og lab-oppsett bruker Linux)",
              "DTE-2509 (server-driften til Flask-appen)",
              "Git og CLI generelt",
            ]}
            layers={[
              {
                navn: "Basis — operativsystemet under føttene",
                intro:
                  "Forstå hva et OS er, hvordan Linux er organisert, og hvor ting bor i filsystemet.",
                steps: [
                  { slug: "os-grunnlag", title: "OS-grunnlag", blurb: "Kernel, brukerrom, prosesser, syscalls — den mentale modellen." },
                  { slug: "linux-bruk", title: "Linux i bruk", blurb: "FHS, navigasjon (ls/cd/find), filer (cat/less/grep) — den daglige verktøykassen." },
                  { slug: "virtualisering", title: "Virtualisering", blurb: "VMer vs containere — hvorfor du kjører Ubuntu i en boks på Mac/Win." },
                ],
              },
              {
                navn: "Dypere — kontroll og automatisering",
                intro:
                  "Når navigering sitter, lærer vi å eie systemet: brukere, rettigheter og automatisering via shell-skript.",
                steps: [
                  { slug: "brukere-rettigheter", title: "Brukere og rettigheter", blurb: "rwx, chmod (oktal+symbolsk), chown, umask, setuid/setgid." },
                  { slug: "dte2505-rwx-kalkulator", title: "rwx-kalkulator (interaktiv)", blurb: "9-bits-grid → oktal og ls-streng live. Konverter begge veier." },
                  { slug: "shell-scripting", title: "Shell-scripting", blurb: "Variabler, if/for/while, pipes, omdirigering, exit codes." },
                  { slug: "dte2505-bash-scripts", title: "Bash-pad med mock-FS", blurb: "Skriv skript, kjør mot et fake filsystem, sammenlign stdout mot fasit." },
                ],
              },
              {
                navn: "Eksamen — anvende på obliger",
                intro:
                  "Eksamen krever 8 obliger godkjent. Disse leksjonene speiler oblig-temaene og lar deg drille mot dem.",
                steps: [
                  { slug: "dte2505-prosesser-signaler", title: "Prosesser og signaler", blurb: "Mock-prosess-monitor: send SIGTERM vs SIGKILL, se forskjellen." },
                  { slug: "dte2505-obliger-guide", title: "Oblig-guide", blurb: "Gjennomgang av typiske oppgavetyper med løsningsstrategi." },
                ],
              },
            ]}
          />
        </section>

        {/* === LES === */}
        <section id="les" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Les — konsept-leksjoner</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Forklart-først-format. Hver leksjon kan stå alene; rekkefølgen er
            anbefalt for første gjennomgang.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CONCEPT_COURSES.map((c) => {
              const Icon = c.Icon;
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {c.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[c.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === VISUALISER === */}
        <section id="visualiser" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Visualiser & labs</h2>
            <span className="rounded-full bg-success/10 text-success border border-success/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {LABS.length} interaktive
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Klikk-gjennom-simulatorer, ikke tekstvegg. Disse er det raskeste sporet
            til å forstå scheduling, minne, konkurrens og rettigheter.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {LABS.map((lab) => {
              const Icon = lab.Icon;
              return (
                <Link
                  key={lab.slug}
                  to="/stack/$slug"
                  params={{ slug: lab.slug }}
                  className="group rounded-xl border border-success/30 bg-success/5 hover:border-success p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Icon className="h-4 w-4 text-success" />
                    <h3 className="font-semibold text-foreground leading-tight">
                      {lab.title}
                    </h3>
                    <ModulStatusBadge trinnSlugs={[lab.slug]} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lab.blurb}
                  </p>
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1">
                      {lab.taggar.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] rounded bg-muted text-muted-foreground px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center text-xs text-success font-medium">
                      Åpne lab
                      <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === ØV === */}
        <section id="ov" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Øv — gjør, ikke bare les</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Stack-leksjonene forklarer teorien. Her øver du selv på kommandoer,
            konsept-matching og repetisjon.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/dte2505/shell-drill"
              className="group rounded-xl border border-brand/40 bg-brand/5 hover:border-brand p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Keyboard className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Shell-drill — 30+ scenarier
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Skriv kommandoen som løser scenariet. find / chmod / ps / kill /
                systemctl / tar / bash-snutter. Toleranse for flagg-rekkefølge.
              </p>
              <div className="mt-3 flex items-center text-xs text-brand font-medium">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/drag"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Drag-oppgaver
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter på «OS &amp; Linux» — chmod-octal, prosess-states,
                shell-scripting, sudo vs su, deadlock-grafer.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/cards"
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Flashcards
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Repetisjon før eksamen — kommandoer, rettigheter, prosesser,
                scheduling-algoritmer.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-obliger-guide" }}
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Oblig-guide (8 obliger)
                </h3>
                <ModulStatusBadge trinnSlugs={["dte2505-obliger-guide"]} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tekst-guide gjennom de 8 typiske obligene med sjekklister og feller.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-obliger" }}
              className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">
                  Speil-obliger (5 stk)
                </h3>
                <ModulStatusBadge trinnSlugs={["dte2505-obliger"]} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Faktiske drill-obliger: installasjon, navigasjon, pakker, rettigheter, bash — steg-svar med auto-sjekk.
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* === EKSAMEN === */}
        <section id="eksamen" className="mb-12 scroll-mt-28">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Eksamen-temaer</h2>
            <span className="text-[11px] text-muted-foreground">
              {meta?.eksamen ?? "02.12.2026"} · {meta?.stp ?? 5} stp
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Pensumet gruppert som det dukker opp på skriftlig eksamen. Hver kategori
            har lenker til konsept-leksjonene og labs som dekker temaet.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXAM_TOPICS.map((t) => {
              const Icon = t.Icon;
              return (
                <div
                  key={t.topic}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground text-sm">
                      {t.topic}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.slugs.map((s) => (
                      <Link
                        key={s.slug}
                        to="/stack/$slug"
                        params={{ slug: s.slug }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background hover:border-brand/50 hover:bg-brand/5 px-2 py-1 text-[11px] text-foreground transition-colors"
                      >
                        {s.label}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* === AI-TUTOR === */}
        <section id="tutor" className="mb-12 scroll-mt-28">
          <a
            href="/tutor"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 to-violet-500/5 hover:border-brand p-5 transition-colors flex items-start gap-4"
          >
            <div className="shrink-0 rounded-lg bg-brand/15 p-2.5">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">Spør AI om DTE-2505</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  Sjekk forståelse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                Få forklart hvorfor SJF gir kortere turnaround enn FIFO, eller
                hvordan en page fault havner i kernel. Tutoren ser hva du har
                gjort på faget.
              </p>
              <div className="mt-2 flex items-center text-xs font-medium text-brand">
                Åpne tutor
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </a>
        </section>

        {/* OS-oversikt — referansetabell, beholdt fra forrige versjon */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">OS-oversikt — komponentene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et moderne operativsystem består av disse hovedfunksjonene. Lær
            lagdelingen, så blir resten av kurset enklere å plassere.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Komponent</th>
                  <th className="text-left font-semibold px-4 py-2">Ansvar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Kernel</td><td className="px-4 py-3 text-muted-foreground">Kjerne — kjører i privilegert modus, eier maskinvaren</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Scheduler</td><td className="px-4 py-3 text-muted-foreground">Fordeler CPU-tid mellom prosesser</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Minnehåndt.</td><td className="px-4 py-3 text-muted-foreground">Virtuelt minne, paging, isolasjon mellom prosesser</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Filsystem</td><td className="px-4 py-3 text-muted-foreground">Organiserer data på disk (ext4, NTFS, APFS, ZFS)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Drivere</td><td className="px-4 py-3 text-muted-foreground">Snakker med maskinvare (disk, nettkort, GPU)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Syscalls</td><td className="px-4 py-3 text-muted-foreground">API mellom userspace-programmer og kernel</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Shell</td><td className="px-4 py-3 text-muted-foreground">Brukergrensesnitt — bash, zsh, PowerShell</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">Brukere</td><td className="px-4 py-3 text-muted-foreground">Identitet, rettigheter, isolasjon mellom brukere</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Mental modell:</strong> userspace-programmer kan ALDRI snakke
            direkte med maskinvaren. Hver gang du skriver til en fil, åpner en
            socket eller allokerer minne, går du via en syscall til kernelen.
          </p>
        </section>
      </div>
    </StackPageShell>
  );
}

// "Anbefalt neste" = første slug i listen som ikke er sett. Faller tilbake til
// første slug hvis alle er sett (eller ingenting er sett ennå).
function useNextUnseenSlug(slugs: string[]): string {
  const { seen, total } = useModulProgress(slugs);
  if (typeof window === "undefined" || seen === 0 || seen >= total) {
    return slugs[0];
  }
  try {
    const raw = window.localStorage.getItem("stack.visited.v1");
    if (!raw) return slugs[0];
    const visited = JSON.parse(raw) as Record<string, true>;
    const next = slugs.find((s) => !visited[s]);
    return next ?? slugs[0];
  } catch {
    return slugs[0];
  }
}
