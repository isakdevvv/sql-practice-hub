import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva virtualisering er", anchor: "hva" },
  { title: "VM vs container", anchor: "vm-container" },
  { title: "Docker-basics", anchor: "docker" },
  { title: "Snapshots og bruksområder", anchor: "snapshots" },
];

export function VirtualiseringPage() {
  return (
    <StackPageShell title="Virtualisering" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Virtualisering
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Virtualisering — VM og container
          </h1>
          <p className="mt-3 text-muted-foreground">
            Hvordan kan én fysisk server kjøre mange isolerte system? Hypervisor for hele
            OS, container for prosess-isolasjon. Lær forskjellen og når du bruker hva.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgaver</Link>{" "}
              under «Virtualisering» — VM vs container, hypervisor-typer.
            </div>
          </div>
        </div>

        <CourseOutline courseId="virtualisering" steps={STEPS} />

        <section id="hva" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Hva virtualisering er</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Virtualisering lager <strong>virtuelle datamaskiner</strong> som kjører oppå
            ekte maskinvare. Et abstraksjonslag (hypervisor) skjuler den fysiske
            maskinvaren bak en virtuell — og du kan kjøre mange uavhengige system på
            samme boks.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Hypervisor</th>
                  <th className="text-left font-semibold px-4 py-2">Beskrivelse</th>
                  <th className="text-left font-semibold px-4 py-2 w-44">Eksempler</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Type 1 (bare-metal)</td><td className="px-4 py-3 text-muted-foreground">Kjører direkte på maskinvaren. Ingen vert-OS. Brukt i datasentre.</td><td className="px-4 py-3 text-muted-foreground">ESXi, Hyper-V, KVM, Xen</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Type 2 (hosted)</td><td className="px-4 py-3 text-muted-foreground">Kjører som program oppå vanlig OS. Enkelt for dev/testing.</td><td className="px-4 py-3 text-muted-foreground">VirtualBox, VMware Workstation, Parallels</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Type 1 (bare-metal)              Type 2 (hosted)
+──────+ +──────+ +──────+        +──────+ +──────+
│ VM 1 │ │ VM 2 │ │ VM 3 │        │ VM 1 │ │ VM 2 │
+──────+ +──────+ +──────+        +──────+ +──────+
+──────────────────────────+      +───────────────+
│       Hypervisor         │      │  Hypervisor   │
+──────────────────────────+      +───────────────+
│       Maskinvare         │      │   Vert-OS     │
+──────────────────────────+      +───────────────+
                                  │  Maskinvare   │
                                  +───────────────+`}</pre>
          </div>
        </section>

        <section id="vm-container" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. VM vs container</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Virtuell maskin (VM)
              </div>
              <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
                <li>Full OS-kjerne per VM</li>
                <li>Sterk isolasjon (egen kernel)</li>
                <li>GB med RAM og disk per stk</li>
                <li>Boot tar minutter</li>
                <li>Kan kjøre Windows på Linux-host (annen kernel)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Container
              </div>
              <ul className="space-y-1.5 text-sm text-foreground list-disc pl-5">
                <li>Deler vert-OS sin kernel</li>
                <li>Isolasjon via namespaces + cgroups</li>
                <li>MB med RAM, sekunder å starte</li>
                <li>Bare Linux-prosesser på Linux-kernel</li>
                <li>Brukes til app-distribusjon og microservices</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`+──── VM ────+ +──── VM ────+      +─Container─+ +─Container─+
│   App      │ │   App      │      │   App     │ │   App     │
│   Libs     │ │   Libs     │      │   Libs    │ │   Libs    │
│   Guest OS │ │   Guest OS │      +───────────+ +───────────+
+────────────+ +────────────+      +─────────────────────────+
+───────────────────────────+      │   Container runtime     │
│       Hypervisor          │      │   (Docker / containerd) │
+───────────────────────────+      +─────────────────────────+
│        Maskinvare         │      │       Host OS-kernel    │
+───────────────────────────+      +─────────────────────────+
                                   │        Maskinvare       │
                                   +─────────────────────────+`}</pre>
          </div>
        </section>

        <section id="docker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Docker-basics</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Docker pakker en applikasjon med alle avhengigheter i et <strong>image</strong>.
            Du kjører en <strong>container</strong> som er en levende instans av imaget.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`docker pull nginx               # last ned image
docker images                   # liste imager
docker run -d -p 80:80 nginx    # kjør detached, port-mapp 80
docker ps                       # kjørende containere
docker ps -a                    # alle (også stoppede)
docker logs <id>                # se output
docker exec -it <id> bash       # interaktiv shell inn i container
docker stop <id>
docker rm <id>                  # slett container
docker rmi nginx                # slett image`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Dockerfile — oppskrift for et image
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Bygg med <code>docker build -t myapp .</code>, kjør med{" "}
            <code>docker run myapp</code>.
          </p>
        </section>

        <section id="snapshots" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Snapshots og bruksområder</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Snapshot = «frys» av en VM eller filsystem på et tidspunkt. Du kan rulle
            tilbake hvis en oppgradering går galt.
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-40">Bruksområde</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor virtualisering?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Serverkonsolidering</td><td className="px-4 py-3 text-muted-foreground">Mange små tjenester på én fysisk maskin — bedre HW-utnyttelse</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Test &amp; dev</td><td className="px-4 py-3 text-muted-foreground">Snapshot før risikabel endring, rull tilbake hvis det feiler</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Isolering</td><td className="px-4 py-3 text-muted-foreground">Kjøre uvedlikeholdt legacy-app uten å smitte resten</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Migrering</td><td className="px-4 py-3 text-muted-foreground">Flytt en VM mellom fysiske hoster uten å stoppe tjenesten (live migration)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Skytjenester</td><td className="px-4 py-3 text-muted-foreground">AWS EC2, Azure VM — alt er virtuelt under panseret</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Reproduserbar dev</td><td className="px-4 py-3 text-muted-foreground">Container med samme miljø lokalt og i prod</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">
                DTE-2505-hub
              </Link>
              {" "}— alle mini-kursene.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}— pugg detaljene med spaced repetition.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
