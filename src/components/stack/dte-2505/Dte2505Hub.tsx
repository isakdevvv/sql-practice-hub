import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Terminal,
  FileCode,
  Users,
  Server,
  Cpu,
  ClipboardCheck,
  Keyboard,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { LearningPath } from "@/components/stack/LearningPath";

type Course = {
  slug: string;
  title: string;
  shortDescription: string;
  Icon: typeof Terminal;
  status: "ready" | "coming-soon";
};

const COURSES: Course[] = [
  {
    slug: "os-grunnlag",
    title: "OS-grunnlag",
    shortDescription:
      "Kernel vs userspace, prosesser og threads, scheduling, filsystem-konsept, syscalls.",
    Icon: Cpu,
    status: "ready",
  },
  {
    slug: "linux-bruk",
    title: "Linux-bruk",
    shortDescription:
      "Bash-shell, filer og rettigheter (chmod, chown, rwx), prosess-håndtering, pakkehåndtering.",
    Icon: Terminal,
    status: "ready",
  },
  {
    slug: "shell-scripting",
    title: "Shell scripting",
    shortDescription:
      "Variabler, if/while/for, pipe/redirect, exit-koder og vanlige drift-skript.",
    Icon: FileCode,
    status: "ready",
  },
  {
    slug: "brukere-rettigheter",
    title: "Brukere og rettigheter",
    shortDescription:
      "useradd, /etc/passwd, sudo vs su, ACL, SELinux/AppArmor, fil-rettigheter i praksis.",
    Icon: Users,
    status: "ready",
  },
  {
    slug: "virtualisering",
    title: "Virtualisering",
    shortDescription:
      "VM vs container, hypervisor type 1/2, Docker-basics, snapshots og bruksområder.",
    Icon: Server,
    status: "ready",
  },
  {
    slug: "dte2505-obliger-guide",
    title: "Oblig-guide (8 obliger)",
    shortDescription:
      "Tekst-guide gjennom de åtte typiske obligene: VM, Linux-grunnlag, brukere, rettigheter, prosesser, scripting, pakker, tjenester. Med sjekklister og feller.",
    Icon: ClipboardCheck,
    status: "ready",
  },
];

export function Dte2505Hub() {
  return (
    <StackPageShell title="DTE-2505 Operativsystemer" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · 5 stp · Linux-fokusert
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Operativsystemer
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Mini-kurs som dekker UiT-pensum: hvordan et operativsystem er bygd opp,
            Linux i bruk og drift, shell-scripting, brukere og rettigheter, og
            virtualisering. Fokus på praktiske kommandoer og konsepter du må kunne på
            eksamen.
          </p>
        </div>

        <div className="mb-10">
          <LearningPath
            fag="DTE-2505"
            forbinder={["DTE-2507 (TCP/IP og lab-oppsett bruker Linux)", "DTE-2509 (server-driften til Flask-appen)", "Git og CLI generelt"]}
            layers={[
              {
                navn: "Basis — operativsystemet under føttene",
                intro:
                  "Forstå hva et OS er, hvordan Linux er organisert, og hvor ting bor i filsystemet. Bygg trygg navigering før vi går dypere.",
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
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">OS-oversikt — komponentene</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Et moderne operativsystem består av disse hovedfunksjonene. Lær lagdelingen,
            så blir resten av kurset enklere å plassere.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
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
            <strong>Mental modell:</strong> userspace-programmer kan ALDRI snakke direkte
            med maskinvaren. Hver gang du skriver til en fil, åpner en socket eller
            allokerer minne, går du via en syscall til kernelen.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Mini-kurs</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COURSES.map((c) => {
              const isReady = c.status === "ready";
              const Icon = c.Icon;
              if (!isReady) {
                return (
                  <div key={c.slug} className="rounded-xl border border-border bg-card/30 p-5 opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  </div>
                );
              }
              return (
                <Link
                  key={c.slug}
                  to="/stack/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-xl border border-border bg-card hover:border-brand/40 p-5 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-foreground leading-tight">{c.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.shortDescription}</p>
                  <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Åpne
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Interaktive verktøy</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              to="/dte2505/shell-drill"
              className="group rounded-xl border border-brand/40 bg-brand/5 hover:border-brand p-5 transition-colors block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Keyboard className="h-4 w-4 text-brand" />
                <h3 className="font-semibold text-foreground leading-tight">Shell-drill — 30+ scenarier</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Skriv kommandoen som løser scenariet. find / chmod / ps / kill / systemctl /
                tar / bash-snutter. Toleranse for flagg-rekkefølge.
              </p>
              <div className="mt-3 flex items-center text-xs text-brand">
                Åpne
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Hvor passer dette inn?</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <strong className="text-foreground">Drag-oppgaver:</strong> filter på «OS &amp; Linux» i{" "}
              <Link to="/drag" className="text-brand hover:underline">/drag</Link>{" "}
              — chmod-octal, prosess-states, shell-scripting, sudo vs su.
            </li>
            <li>
              <strong className="text-foreground">Pensum-fokus:</strong> Linux generelt, installering, drift, vedlikehold,
              skript, sikkerhet og virtualisering.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
