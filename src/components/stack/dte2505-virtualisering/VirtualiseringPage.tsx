import { Link } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { StackDiagram } from "./StackDiagram";
import { HypervisorTypeComparison } from "./HypervisorTypeComparison";
import { VmVsContainer } from "./VmVsContainer";
import { SyscallFlowDiagram } from "./SyscallFlowDiagram";

const STEPS = [
  { title: "Hva betyr virtualisering?", anchor: "intro" },
  { title: "Type 1 vs Type 2 hypervisor", anchor: "typer" },
  { title: "Hypervisor-simulator (interaktiv)", anchor: "hyp-sim" },
  { title: "VM-eksempler (KVM, VirtualBox, VMware)", anchor: "vms" },
  { title: "Containere — namespaces + cgroups", anchor: "containere" },
  { title: "Sammenligning: VM vs container", anchor: "sammenligning" },
  { title: "VM vs container — kjør, krasj, escape", anchor: "vm-vs-ct" },
  { title: "Syscall-flyt gjennom alle tre", anchor: "syscall-flow" },
  { title: "Når velge hva?", anchor: "valg" },
  { title: "Eksamen-quick-ref", anchor: "eksamen" },
];

export function VirtualiseringPage() {
  return (
    <StackPageShell title="Virtualisering vs containere" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · OSTEP App-side + moderne praksis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Virtualisering vs containere
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Virtualisering er kunsten å gi ett program inntrykk av at det har
            hele maskinen for seg selv. To radikalt forskjellige tilnærminger
            har vunnet: <strong>virtuelle maskiner</strong> emulerer hardware
            (egen kernel per VM), mens <strong>containere</strong> isolerer på
            kernel-nivå (én delt kernel). Begge løser «kjør N
            applikasjoner uten at de tråkker på hverandre», men kostnaden og
            sikkerhetsegenskapene er ulike.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Layers className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Visuelt:</span>{" "}
              <a href="#sammenligning" className="text-brand hover:underline">
                lag-diagrammet
              </a>{" "}
              viser hva som deles og hva som dupliseres i fire scenarier:
              bare-metal, type-2 VM, type-1 VM og container.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-virtualisering" steps={STEPS} />

        <Section number="1" id="intro" title="Hva betyr virtualisering?">
          <p className="text-sm text-muted-foreground mb-3">
            En hypervisor er programvare som lar flere{" "}
            <em>operativsystemer</em> kjøre på samme fysiske maskin samtidig.
            Hvert OS tror det eier CPU, RAM og disk — i virkeligheten deler
            de en abstraksjon som hypervisoren administrerer. Begrepet
            stammer fra IBMs mainframes på 60-tallet (CP/CMS), men ble
            mainstream først rundt 2005 da Intel VT-x / AMD-V kom til
            x86-CPU-er.
          </p>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Hva som faktisk «virtualiseres»
            </div>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground">CPU:</strong> Hypervisor
                fanger opp privilegerte instruksjoner (ring 0) som gjest-OS
                forsøker, og emulerer dem.
              </li>
              <li>
                <strong className="text-foreground">Minne:</strong> En ekstra
                indirection — gjest-fysisk adresse → vert-fysisk adresse
                (Extended Page Tables / Nested Paging).
              </li>
              <li>
                <strong className="text-foreground">I/O:</strong> Virtuelle
                disker (qcow2/vmdk) og virtuelle NIC-er (virtio) som
                hypervisor oversetter til ekte disk- og nettverkskall.
              </li>
            </ul>
          </div>
        </Section>

        <Section number="2" id="typer" title="Type 1 vs Type 2 hypervisor">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                Type 1 — bare-metal
              </div>
              <p className="text-sm text-foreground mb-2">
                Hypervisoren kjører direkte på hardware, uten et host-OS under.
                Den ER på sett og vis OS-et.
              </p>
              <pre className="font-mono text-xs whitespace-pre">{`+-----------------+
| Gjest1 | Gjest2 |
+--------+--------+
|   Hypervisor    |
+-----------------+
|    Hardware     |
+-----------------+`}</pre>
              <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4 space-y-1">
                <li>Eksempler: <strong>KVM</strong>, Xen, VMware ESXi, Hyper-V.</li>
                <li>Lavere overhead, brukes i servere og skyplattformer.</li>
                <li>KVM-twist: Linux-kjernen blir hypervisor når KVM-modulen lastes — så Linux er både host-OS OG type-1 hypervisor.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold mb-2">
                Type 2 — hosted
              </div>
              <p className="text-sm text-foreground mb-2">
                Hypervisoren er en vanlig applikasjon som kjører på et host-OS
                (Windows, macOS, Linux). Praktisk på desktop.
              </p>
              <pre className="font-mono text-xs whitespace-pre">{`+-----------------+
| Gjest1 | Gjest2 |
+--------+--------+
|   Hypervisor    |  ← vanlig app
+-----------------+
|    Host-OS      |
+-----------------+
|    Hardware     |
+-----------------+`}</pre>
              <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4 space-y-1">
                <li>Eksempler: <strong>VirtualBox</strong>, VMware Workstation/Fusion, Parallels.</li>
                <li>Litt mer overhead — kall må gjennom host-OS.</li>
                <li>Brukes til utvikling, testlabs, kjøre Windows på Mac osv.</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Gråsone:</strong> KVM er teknisk sett «type 1» (kjører i
            kernel-mode) men man pleier å si «KVM = type 1 fordi det IS
            kernelen, ikke en app over kernelen». VirtualBox er «type 2»
            fordi det installeres som et applikasjonspakke på toppen av et
            ferdig host-OS.
          </p>
        </Section>

        <Section
          number="3"
          id="hyp-sim"
          title="Hypervisor-simulator — kjør et syscall i begge"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Det er én ting å lese at type-2 har «litt mer overhead». Det er
            noe annet å se den ene VMEXIT-en bli til tre når host-OS blir et
            ekstra lag. Trykk på <em>Kjør disk-read i begge</em> og tell ring-
            byttene:
          </p>
          <HypervisorTypeComparison />
        </Section>

        <Section number="4" id="vms" title="VM-eksempler i praksis">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                KVM + QEMU
              </div>
              <p className="text-sm text-muted-foreground">
                KVM gir kernel-mode hardware-akselerasjon (VT-x/AMD-V), QEMU
                emulerer enheter rundt det. Standarden på Linux-servere og i
                AWS/GCP under panseret.
              </p>
              <pre className="font-mono text-[10px] mt-2 whitespace-pre">{`qemu-system-x86_64 \\
  -enable-kvm \\
  -m 4G -smp 2 \\
  -drive file=img.qcow2`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                VirtualBox
              </div>
              <p className="text-sm text-muted-foreground">
                Cross-platform type-2 hypervisor fra Oracle. Brukes mye i
                studie- og hjemmemiljø — Windows-VM på Mac, Linux-VM på Windows.
              </p>
              <pre className="font-mono text-[10px] mt-2 whitespace-pre">{`# GUI eller CLI:
VBoxManage createvm \\
  --name ubuntu \\
  --register`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                VMware ESXi / Workstation
              </div>
              <p className="text-sm text-muted-foreground">
                Bedrifts-versjonen. ESXi er type-1 (egen ISO som installeres
                bare-metal), Workstation/Fusion er type-2 for desktop. Drev
                mye av enterprise-konsolidering tidlig på 2000-tallet.
              </p>
            </div>
          </div>
        </Section>

        <Section
          number="5"
          id="containere"
          title="Containere — namespaces + cgroups"
        >
          <p className="text-sm text-muted-foreground mb-3">
            En container er <em>ikke</em> en mini-VM. Den er en vanlig Linux-prosess
            der kjernen har gjemt unna deler av virkeligheten for å skape illusjonen
            av isolasjon. To kernel-mekanismer er kjernen i dette:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Namespaces (hva du SER)
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Hver namespace gjør at et sett av kernel-objekter er
                «private» til prosessgruppen. Det er 7 typer:
              </p>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                <li><code className="font-mono">pid</code> — egen PID-tre (PID 1 inni)</li>
                <li><code className="font-mono">net</code> — eget nettverksstack, eth0</li>
                <li><code className="font-mono">mnt</code> — eget mount-tre (rotfilsystem)</li>
                <li><code className="font-mono">uts</code> — eget hostname</li>
                <li><code className="font-mono">ipc</code> — egen shared memory / msg queues</li>
                <li><code className="font-mono">user</code> — eget uid/gid-tre</li>
                <li><code className="font-mono">cgroup</code> — egen cgroup-rot</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                cgroups (hvor MYE du får)
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Control groups begrenser ressursbruk per prosessgruppe — CPU-tid,
                minne, disk-IO, antall PID-er.
              </p>
              <pre className="font-mono text-[11px] whitespace-pre">{`# Begrens en cgroup til
# 50 % CPU og 200 MB RAM:
echo 50000 > cpu.max
echo 200M  > memory.max

# Alle prosesser i cgroupen
# må holde seg innenfor.`}</pre>
              <p className="text-xs text-muted-foreground mt-2">
                Hvis prosessen sprenger memory-grensen blir den{" "}
                <em>OOM-killed</em> av kjernen.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Docker-stacken — hvem gjør hva
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`docker CLI    ─ brukerens kommandolinje
   |
docker engine ─ daemon (dockerd), bygger images, høyere logikk
   |
containerd    ─ container-livssyklus (start/stop/restart)
   |
runc          ─ den lille C-binæren som faktisk gjør clone()
   |              med namespace-flagg + cgroup-setup
[kernel]      ─ namespaces + cgroups`}</pre>
            <p className="text-xs text-muted-foreground mt-2">
              Image-formatet (OCI / Docker) er bare et lag-system av tar-arkiver
              med metadata. Når en container starter, blir lagene stablet med
              <code className="font-mono"> overlayfs</code> til et rotfilsystem,
              runc setter opp namespaces og cgroups, og kjører entrypoint.
            </p>
          </div>
        </Section>

        <Section
          number="6"
          id="sammenligning"
          title="VM vs container — visuelt og i tabell"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Hovedforskjellen: en VM duplisere hele kjernen, en container deler
            den med verten. Klikk i diagrammet for å fremheve lagene som er
            isolert kontra delt:
          </p>
          <StackDiagram />
          <div className="overflow-x-auto rounded-lg border border-border mt-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-3 py-2 w-40">Aspekt</th>
                  <th className="text-left font-semibold px-3 py-2">Virtuell maskin</th>
                  <th className="text-left font-semibold px-3 py-2">Container</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Kernel</td>
                  <td className="px-3 py-2 text-muted-foreground">Egen per VM</td>
                  <td className="px-3 py-2 text-muted-foreground">Delt med verten</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Boot-tid</td>
                  <td className="px-3 py-2 text-muted-foreground">10–60 s (full OS-boot)</td>
                  <td className="px-3 py-2 text-muted-foreground">~100 ms (bare en prosess)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">RAM-overhead</td>
                  <td className="px-3 py-2 text-muted-foreground">Hundrevis av MB (egen kernel + glibc + initd)</td>
                  <td className="px-3 py-2 text-muted-foreground">Megabytes (bare applikasjonen)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Disk-størrelse</td>
                  <td className="px-3 py-2 text-muted-foreground">GB-er (full disk-image)</td>
                  <td className="px-3 py-2 text-muted-foreground">MB-er (overlay-lag, deles)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Tetthet per vert</td>
                  <td className="px-3 py-2 text-muted-foreground">10–50 VM-er</td>
                  <td className="px-3 py-2 text-muted-foreground">100–1000+ containere</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Isolasjon</td>
                  <td className="px-3 py-2 text-muted-foreground">Sterk (hardware-emulering)</td>
                  <td className="px-3 py-2 text-muted-foreground">Svakere (felles kernel = felles angrepsflate)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">OS-mangfold</td>
                  <td className="px-3 py-2 text-muted-foreground">Linux + Windows + BSD samtidig</td>
                  <td className="px-3 py-2 text-muted-foreground">Bare samme kernel-familie som verten</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono">Snapshots / migrasjon</td>
                  <td className="px-3 py-2 text-muted-foreground">Modent (vMotion, live-migrate)</td>
                  <td className="px-3 py-2 text-muted-foreground">CRIU finnes, men sjeldnere brukt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          number="7"
          id="vm-vs-ct"
          title="VM vs container — kjør, krasj, escape"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Tabellen forteller deg <em>at</em> VM bruker mer RAM og at
            containere har svakere isolasjon. Simulatoren under viser{" "}
            <em>hva som faktisk skjer</em> når du starter mange instanser,
            trigger en kernel-bug eller prøver å bryte ut. Legg merke til at
            «kernel-bug» er asymmetrisk: VM-en taper én instans, containerne
            taper alle.
          </p>
          <VmVsContainer />
        </Section>

        <Section
          number="8"
          id="syscall-flow"
          title="Syscall-flyt: native vs VM vs container"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Når en app kjører <code className="font-mono">write(fd, buf, len)</code>,
            er det enormt ulikt hva som skjer under panseret avhengig av om
            den kjører bare-metal, i en VM eller i en container. Klikk på et
            steg for å zoome inn på hvilken kode/CPU-instruksjon som faktisk
            kjører der.
          </p>
          <SyscallFlowDiagram />
        </Section>

        <Section number="9" id="valg" title="Når velge VM, når container?">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                Velg VM når ...
              </div>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Du må kjøre et annet OS enn verten (Windows på Linux-server).</li>
                <li>Sterk sikkerhetsisolasjon kreves (multi-tenant cloud, jus-/compliance-krav).</li>
                <li>Lasten må kunne livemigrere mellom fysiske noder.</li>
                <li>Du trenger ren kernel-tuning per arbeidslast.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold mb-2">
                Velg container når ...
              </div>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Du pakker en applikasjon med alle avhengighetene (deploy/CI).</li>
                <li>Du vil ha høy tetthet — mange identiske mikroservice-instanser.</li>
                <li>Rask oppstart er kritisk (autoscaling, function-as-a-service).</li>
                <li>Devs vil ha samme miljø lokalt som i produksjon.</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Hybrid i praksis:</strong> AWS/GCP-noder kjører Linux-VM-er
            på KVM, og inni hver VM kjører Kubernetes-pods som er containere.
            Du får hardware-isolasjon mellom kunder + container-tetthet
            innen samme kunde.
          </p>
        </Section>

        <Section number="10" id="eksamen" title="Eksamen-quick-ref">
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Type 1 = bare-metal, Type 2 = hosted.</strong>{" "}
              Type 1 (KVM, ESXi, Xen) kjører direkte over hardware. Type 2
              (VirtualBox, VMware Workstation) er en app over et host-OS.
            </li>
            <li>
              <strong className="text-foreground">VM duplisere kernel, container deler kernel.</strong>{" "}
              Dette er den ENE setningen som forklarer alle ytelses- og
              sikkerhetsforskjellene.
            </li>
            <li>
              <strong className="text-foreground">Container = namespaces + cgroups.</strong>{" "}
              Namespaces gir isolasjon av synsfeltet (PID, nett, mount, ...),
              cgroups setter grenser for ressursbruk. Det er kjernen.
            </li>
            <li>
              <strong className="text-foreground">runc gjør jobben.</strong>{" "}
              Docker → containerd → runc → kernel. Bare runc kaller{" "}
              <code className="font-mono">clone()</code> med
              namespace-flagg. Det andre er orkestrering og pakking.
            </li>
            <li>
              <strong className="text-foreground">Container kan ikke kjøre annet OS.</strong>{" "}
              En Linux-container krever Linux-kernel. «Docker på Mac» bruker
              egentlig en skjult Linux-VM med containere inni.
            </li>
            <li>
              <strong className="text-foreground">Boot-tid er hovedfordelen til containere.</strong>{" "}
              Ingen kernel-boot, ingen systemd-oppstart — bare exec av én
              prosess. Derfor er de bra for autoscaling og CI-jobber.
            </li>
            <li>
              <strong className="text-foreground">VM gir sterkere isolasjon.</strong>{" "}
              En kernel-bug i Linux kan i prinsippet la en container bryte ut
              til verten; en VM-utbrytning krever en bug i selve hypervisoren
              (mye sjeldnere).
            </li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre lesing</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "docker" }}
                className="text-brand hover:underline"
              >
                Docker dypdykk
              </Link>{" "}
              — image-format, Dockerfile, networking, volumes.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "virtualisering" }}
                className="text-brand hover:underline"
              >
                Generell virtualisering
              </Link>{" "}
              — bredere historisk perspektiv.
            </li>
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-virtuelt-minne" }}
                className="text-brand hover:underline"
              >
                Virtuelt minne &amp; paging
              </Link>{" "}
              — beslektet abstraksjon (CPU/MMU bare for én prosess).
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}

function Section({
  number,
  id,
  title,
  children,
}: {
  number: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}
