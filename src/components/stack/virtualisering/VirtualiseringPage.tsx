import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Hva virtualisering er", anchor: "hva" },
  { title: "Type 1 vs Type 2 vs container vs WSL2", anchor: "type" },
  { title: "Hypervisor-produkter", anchor: "produkter" },
  { title: "VM vs container", anchor: "vm-container" },
  { title: "Steg for steg: lag en Ubuntu-VM", anchor: "ubuntu-vm" },
  { title: "Docker-basics (intro)", anchor: "docker" },
  { title: "Snapshots og bruksområder", anchor: "snapshots" },
  { title: "Hvordan velge?", anchor: "velg" },
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

        <section id="type" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Type 1 vs Type 2 vs container vs WSL2</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Fire forskjellige måter å «kjøre annet enn vert-OSet» på, fra tyngst til letteste:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Teknologi</th>
                  <th className="text-left font-semibold px-3 py-2 w-28">Isolasjon</th>
                  <th className="text-left font-semibold px-3 py-2 w-28">Oppstart</th>
                  <th className="text-left font-semibold px-3 py-2 w-28">Ressurser</th>
                  <th className="text-left font-semibold px-3 py-2">Når?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Type 1</td><td className="px-3 py-2 text-muted-foreground">Hardware</td><td className="px-3 py-2 text-muted-foreground">Minutter</td><td className="px-3 py-2 text-muted-foreground">GB</td><td className="px-3 py-2 text-muted-foreground">Produksjon, multi-tenant, datasenter</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Type 2</td><td className="px-3 py-2 text-muted-foreground">Hardware-emulert</td><td className="px-3 py-2 text-muted-foreground">Minutter</td><td className="px-3 py-2 text-muted-foreground">GB</td><td className="px-3 py-2 text-muted-foreground">Dev, testing, undervisning</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">WSL2</td><td className="px-3 py-2 text-muted-foreground">Lett-vekt Hyper-V VM</td><td className="px-3 py-2 text-muted-foreground">Sekunder</td><td className="px-3 py-2 text-muted-foreground">100–500 MB</td><td className="px-3 py-2 text-muted-foreground">Linux-verktøy på Windows-PC</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Container</td><td className="px-3 py-2 text-muted-foreground">Namespaces+cgroups</td><td className="px-3 py-2 text-muted-foreground">&lt; 1 sek</td><td className="px-3 py-2 text-muted-foreground">MB</td><td className="px-3 py-2 text-muted-foreground">Distribuere app, microservices, CI</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Tips:</strong> WSL2 er teknisk en mini-VM, men Microsoft
            har optimert den så hardt at den oppfører seg nesten som en container — sekund-rask
            oppstart, integrasjon med Windows-filsystem. Vet du forskjellen mellom WSL1 (oversetter
            syscalls) og WSL2 (full Linux-kjerne i VM)? Eksamen-favoritt.
          </div>
        </section>

        <section id="produkter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Hypervisor-produkter</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Produkt</th>
                  <th className="text-left font-semibold px-3 py-2 w-20">Type</th>
                  <th className="text-left font-semibold px-3 py-2 w-28">Vert-OS</th>
                  <th className="text-left font-semibold px-3 py-2 w-32">Lisens</th>
                  <th className="text-left font-semibold px-3 py-2">Styrke</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">VirtualBox</td><td className="px-3 py-2 text-muted-foreground">2</td><td className="px-3 py-2 text-muted-foreground">Win/Mac/Linux</td><td className="px-3 py-2 text-muted-foreground">GPL (gratis)</td><td className="px-3 py-2 text-muted-foreground">Enkel GUI, multiplatform, studievennlig</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">VMware Workstation</td><td className="px-3 py-2 text-muted-foreground">2</td><td className="px-3 py-2 text-muted-foreground">Win/Linux</td><td className="px-3 py-2 text-muted-foreground">Pro/Player (gratis)</td><td className="px-3 py-2 text-muted-foreground">Ytelse, snapshots, integrasjoner</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">VMware ESXi</td><td className="px-3 py-2 text-muted-foreground">1</td><td className="px-3 py-2 text-muted-foreground">(ingen)</td><td className="px-3 py-2 text-muted-foreground">Kommersiell</td><td className="px-3 py-2 text-muted-foreground">Industri-standard for datasenter</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Hyper-V</td><td className="px-3 py-2 text-muted-foreground">1</td><td className="px-3 py-2 text-muted-foreground">Windows Server</td><td className="px-3 py-2 text-muted-foreground">Inkludert</td><td className="px-3 py-2 text-muted-foreground">Innebygd i Windows; bærer WSL2</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">KVM</td><td className="px-3 py-2 text-muted-foreground">1</td><td className="px-3 py-2 text-muted-foreground">Linux-kernel</td><td className="px-3 py-2 text-muted-foreground">GPL</td><td className="px-3 py-2 text-muted-foreground">Standard Linux-løsning, brukt i AWS, GCP</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">QEMU</td><td className="px-3 py-2 text-muted-foreground">2 (eller m/KVM)</td><td className="px-3 py-2 text-muted-foreground">Linux/Mac</td><td className="px-3 py-2 text-muted-foreground">GPL</td><td className="px-3 py-2 text-muted-foreground">Full hardware-emulering (ARM på x86 osv.)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Xen</td><td className="px-3 py-2 text-muted-foreground">1</td><td className="px-3 py-2 text-muted-foreground">(ingen)</td><td className="px-3 py-2 text-muted-foreground">GPL</td><td className="px-3 py-2 text-muted-foreground">Brukes av AWS EC2 historisk</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="vm-container" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. VM vs container</h2>
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
          <div className="overflow-hidden rounded-lg border border-border mt-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-32">Egenskap</th>
                  <th className="text-left font-semibold px-3 py-2">VM</th>
                  <th className="text-left font-semibold px-3 py-2">Container</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Kernel</td><td className="px-3 py-2 text-muted-foreground">Egen (kan være Windows på Linux-host)</td><td className="px-3 py-2 text-muted-foreground">Delt med host (må være Linux)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Isolasjon</td><td className="px-3 py-2 text-muted-foreground">Sterk (hardware-grensesnitt)</td><td className="px-3 py-2 text-muted-foreground">Svakere (kernel exploits → host)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Oppstart</td><td className="px-3 py-2 text-muted-foreground">Sekunder–minutter</td><td className="px-3 py-2 text-muted-foreground">Millisekunder</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Image-størrelse</td><td className="px-3 py-2 text-muted-foreground">GB (hele OS)</td><td className="px-3 py-2 text-muted-foreground">MB (bare app + libs)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Overhead</td><td className="px-3 py-2 text-muted-foreground">5–15 %</td><td className="px-3 py-2 text-muted-foreground">~0 %</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Distribusjon</td><td className="px-3 py-2 text-muted-foreground">OVA, VHD, VMDK</td><td className="px-3 py-2 text-muted-foreground">OCI-image (Docker Hub, registry)</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2 font-mono text-brand">Sikkerhetsgrense</td><td className="px-3 py-2 text-muted-foreground">«Trust boundary» for multi-tenant</td><td className="px-3 py-2 text-muted-foreground">Stol kun innen samme team</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ubuntu-vm" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Steg for steg — lag en Ubuntu-VM i VirtualBox</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-12">Steg</th>
                  <th className="text-left font-semibold px-3 py-2 w-44">Handling</th>
                  <th className="text-left font-semibold px-3 py-2">Detalj + valg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">1</span></td><td className="px-3 py-2 font-mono">Last ned ISO</td><td className="px-3 py-2 text-muted-foreground">ubuntu.com/download/server eller /desktop. ~2 GB.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">2</span></td><td className="px-3 py-2 font-mono">Ny VM</td><td className="px-3 py-2 text-muted-foreground">VirtualBox → «New». Velg navn, Type=Linux, Version=Ubuntu 64-bit.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">3</span></td><td className="px-3 py-2 font-mono">Allokér RAM</td><td className="px-3 py-2 text-muted-foreground">2048 MB minimum for desktop, 1024 for server. Ikke gi bort halve verts-RAM-en.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">4</span></td><td className="px-3 py-2 font-mono">Disk</td><td className="px-3 py-2 text-muted-foreground">Create virtual disk → VDI → Dynamically allocated → 25 GB.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">5</span></td><td className="px-3 py-2 font-mono">CPU</td><td className="px-3 py-2 text-muted-foreground">Settings → System → Processor. 2 cores. Skru på PAE/NX.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">6</span></td><td className="px-3 py-2 font-mono">Mount ISO</td><td className="px-3 py-2 text-muted-foreground">Settings → Storage → Empty CD → velg .iso-fila.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">7</span></td><td className="px-3 py-2 font-mono">Nettverk</td><td className="px-3 py-2 text-muted-foreground">Settings → Network. NAT (default, har internett, ikke synlig utenfra) eller Bridged (egen IP i lokalnett).</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">8</span></td><td className="px-3 py-2 font-mono">Port forwarding</td><td className="px-3 py-2 text-muted-foreground">Hvis NAT: forward host 2222 → guest 22 for å SSH inn.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">9</span></td><td className="px-3 py-2 font-mono">Start + installer</td><td className="px-3 py-2 text-muted-foreground">Følg Ubuntu-installereren. ~10 min.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">10</span></td><td className="px-3 py-2 font-mono">Snapshot</td><td className="px-3 py-2 text-muted-foreground">Right-click VM → Take Snapshot &quot;Etter installasjon&quot;. Du kan rulle tilbake hit.</td></tr>
                <tr className="border-t border-border"><td className="px-3 py-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-semibold">11</span></td><td className="px-3 py-2 font-mono">Guest Additions</td><td className="px-3 py-2 text-muted-foreground">Devices → Insert Guest Additions CD. Gir shared clipboard, drag-and-drop, dynamic resolution.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="docker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Docker-basics (kort intro)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Docker pakker en applikasjon med alle avhengigheter i et <strong>image</strong>.
            Du kjører en <strong>container</strong> som er en levende instans av imaget. Her er
            bare det grunnleggende — se{" "}
            <Link to="/stack/$slug" params={{ slug: "docker" }} className="text-brand hover:underline">Docker-leksjonen</Link>{" "}
            for full dybde.
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
          <h2 className="text-xl font-semibold mb-3">7. Snapshots og bruksområder</h2>
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

        <section id="velg" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">8. Hvordan velge?</h2>
          <div className="rounded-lg border border-brand/30 bg-brand/5 p-5 text-sm">
            <p className="text-foreground mb-3">
              <strong>Tommelfingerregel:</strong> hvis det er én app du distribuerer på Linux,
              start med en container. Hvis du trenger en annen kernel (Windows på Linux-host),
              eller multi-tenant-isolasjon mot ukjente parter, bruk VM.
            </p>
            <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
              <li>Hjemme-PC vil teste Linux → <strong>VirtualBox eller WSL2</strong></li>
              <li>Distribuere webapp → <strong>Docker-container</strong></li>
              <li>Kjøre 50 ulike kunders apper på samme server → <strong>Type 1 VMer eller Kubernetes</strong></li>
              <li>Server i datasenter → <strong>ESXi/Hyper-V/KVM</strong></li>
              <li>Forsker som vil eksperimentere med en ARM-binær på x86 → <strong>QEMU</strong></li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Eksamen-felle:</strong>{" "}
            «Docker er virtualisering» — delvis. Docker isolerer på prosessnivå (namespaces +
            cgroups), ikke på maskinvarenivå. På macOS og Windows kjører Docker faktisk en
            skjult Linux-VM først (Docker Desktop bruker Hyper-V eller HyperKit), så der ER
            det dobbel virtualisering. På Linux er det direkte.
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
              <Link to="/stack/$slug" params={{ slug: "docker" }} className="text-brand hover:underline">
                Docker-leksjon
              </Link>
              {" "}— dybde i containere, layers, volumes.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}— pugg detaljene med spaced repetition.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>praktisk</em>.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
