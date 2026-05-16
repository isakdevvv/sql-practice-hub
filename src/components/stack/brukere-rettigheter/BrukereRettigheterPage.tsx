import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Brukere og grupper — /etc/passwd, /etc/group", anchor: "passwd" },
  { title: "useradd, usermod, groupadd", anchor: "useradd" },
  { title: "sudo vs su — privilegert kjøring", anchor: "sudo" },
  { title: "Fil-rettigheter i praksis", anchor: "rettigheter" },
  { title: "ACL og MAC — SELinux/AppArmor", anchor: "acl-mac" },
];

export function BrukereRettigheterPage() {
  return (
    <StackPageShell title="Brukere og rettigheter" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Sikker drift
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Brukere og rettigheter
          </h1>
          <p className="mt-3 text-muted-foreground">
            Linux er et flerbrukersystem. Hver fil har en eier og en gruppe, hver bruker
            har en uid, og hver prosess kjører som en bruker. Det er grunnpilaren i
            sikkerhet og isolasjon.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgaver</Link>{" "}
              under «Brukere &amp; rettigheter» — /etc/passwd-felter, sudo vs su, useradd-fyll.
            </div>
          </div>
        </div>

        <CourseOutline courseId="brukere-rettigheter" steps={STEPS} />

        <section id="passwd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. /etc/passwd og /etc/group</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Brukerdata lagres i tekstfiler — lett å lese, lett å backupe. Passordene
            ligger i <code>/etc/shadow</code> (bare lesbar for root).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              /etc/passwd — én linje per bruker
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`isak:x:1000:1000:Isak Olsen,,,:/home/isak:/bin/bash
│    │ │    │    │              │          │
│    │ │    │    │              │          └── login-shell
│    │ │    │    │              └── hjemmekatalog
│    │ │    │    └── GECOS-felt (fullt navn, mm.)
│    │ │    └── primær GID
│    │ └── UID
│    └── passord (x = ligger i /etc/shadow)
└── brukernavn`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              /etc/group — gruppedefinisjoner
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`sudo:x:27:isak,alice
│    │ │  │
│    │ │  └── medlemmer
│    │ └── GID
│    └── (vanligvis tom)
└── gruppenavn`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>UID-konvensjoner:</strong> 0 = root, 1-999 = systembrukere (tjenester,
            f.eks. www-data, postgres), 1000+ = vanlige brukere.
          </p>
        </section>

        <section id="useradd" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. useradd, usermod, groupadd</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Lag ny bruker med hjemmekatalog og bash som shell
sudo useradd -m -s /bin/bash alice

# Sett passord
sudo passwd alice

# Legg bruker til ekstra gruppe (uten å miste eksisterende)
sudo usermod -aG sudo alice
sudo usermod -aG docker alice

# Bytt primær gruppe
sudo usermod -g utviklere alice

# Lås konto
sudo usermod -L alice
sudo passwd -l alice

# Slett bruker (-r tar med hjemmekatalogen)
sudo userdel -r alice

# Grupper
sudo groupadd utviklere
sudo gpasswd -a alice utviklere   # legg til
sudo gpasswd -d alice utviklere   # fjern
getent group utviklere            # se medlemmer
groups alice                      # alle grupper alice er i
id alice                          # uid, gid, grupper`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Viktig:</strong> bruk <code>-aG</code> (append), ikke <code>-G</code>
            alene — uten -a overskrives gruppemedlemskapene og du kan låse brukeren ute.
          </p>
        </section>

        <section id="sudo" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. sudo vs su</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                sudo
              </div>
              <p className="text-sm text-foreground mb-2">
                Kjør én kommando som en annen bruker (vanligvis root). Brukeren skriver
                <strong> sitt eget passord</strong>, ikke root sitt.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`sudo apt update
sudo -u postgres psql
sudo -i              # interaktiv root-shell
sudo -l              # hvilke kommandoer kan jeg?`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                su
              </div>
              <p className="text-sm text-foreground mb-2">
                Bytt til en annen brukers shell. Krever <strong>målbrukerens passord</strong>.
                Røttenes shell er ofte deaktivert på moderne distroer.
              </p>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`su - alice           # logg inn som alice
su -                 # logg inn som root
exit                 # tilbake til opprinnelig`}</pre>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              /etc/sudoers — hvem får gjøre hva
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Rediger ALDRI direkte — bruk visudo (validerer syntax)
sudo visudo

# Eksempel-linjer:
root        ALL=(ALL:ALL) ALL
%sudo       ALL=(ALL:ALL) ALL                 # alle i sudo-gruppen
alice       ALL=(ALL) NOPASSWD: /usr/bin/apt  # alice får apt uten passord
deploy      ALL=(www-data) /usr/bin/systemctl restart nginx`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Best practice:</strong> bruk sudo, ikke su. Hver sudo-bruk logges (med
            brukernavn) i <code>/var/log/auth.log</code> — sporbart.
          </p>
        </section>

        <section id="rettigheter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Fil-rettigheter i praksis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver fil har tre rettighets-sett (owner, group, other) med rwx, og en eier +
            gruppe. Se{" "}
            <Link to="/stack/$slug" params={{ slug: "linux-bruk" }} className="text-brand hover:underline">
              Linux-bruk
            </Link>{" "}
            for chmod-detaljer. Her: spesielle bits og typiske oppsett.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-32">Spesial-bit</th>
                  <th className="text-left font-semibold px-4 py-2">Effekt</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SUID (4xxx)</td><td className="px-4 py-3 text-muted-foreground">Kjør som filens eier (ikke brukeren). F.eks. /usr/bin/passwd kjører som root.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SGID (2xxx)</td><td className="px-4 py-3 text-muted-foreground">På fil: kjør som gruppe. På katalog: nye filer arver katalogens gruppe.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">Sticky (1xxx)</td><td className="px-4 py-3 text-muted-foreground">På katalog: bare eieren kan slette sine filer. Brukes på /tmp.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# Typiske oppsett
chmod 755 /usr/local/bin/skript     # alle kan kjøre, bare eier endrer
chmod 644 /etc/hosts                # alle leser, bare root endrer
chmod 600 /etc/shadow               # bare root leser
chmod 700 ~/.ssh                    # privat katalog
chmod 1777 /tmp                     # alle skriver, sticky bit

# umask — default-rettigheter ved opprettelse
umask           # vis (vanligvis 022)
umask 077       # mer privat (bare eier)
# 666 - umask = standard for nye filer (644 ved umask 022)`}</pre>
          </div>
        </section>

        <section id="acl-mac" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. ACL og MAC — SELinux/AppArmor</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Standard rwx er <strong>DAC</strong> (Discretionary Access Control) —
            eieren bestemmer. To utvidelser går lenger.
          </p>
          <div className="rounded-xl border border-border bg-card p-5 mb-4">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              ACL — fingerkornet tilgang utover owner/group/other
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`getfacl fil
setfacl -m u:alice:rw fil       # gi alice rw, uten å endre eier
setfacl -m g:utvik:r fil         # gi utvik-gruppen read
setfacl -x u:alice fil           # fjern alice
setfacl -b fil                   # fjern alle ACL-er`}</pre>
            <p className="mt-2 text-xs text-muted-foreground">
              <code>ls -l</code> viser <code>+</code> på slutten av rettighets-strengen
              hvis filen har ACL: <code>-rw-r--r--+</code>.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              MAC — SELinux (RHEL) og AppArmor (Ubuntu)
            </div>
            <p className="text-sm text-foreground mb-2">
              Mandatory Access Control: kernelen håndhever policy, og selv root kan
              blokkeres. Hver prosess får en label/profil som begrenser hva den får gjøre.
            </p>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`# SELinux
getenforce              # Enforcing, Permissive eller Disabled
setenforce 0            # midlertidig Permissive
ls -Z fil               # se SELinux-label
chcon -t httpd_sys_content_t fil

# AppArmor
aa-status               # status og lastede profiler
sudo aa-enforce /etc/apparmor.d/usr.bin.foo
sudo aa-complain /etc/apparmor.d/usr.bin.foo`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Når MAC slår inn:</strong> selv om rwx tillater en handling, kan
            SELinux/AppArmor blokkere den. Et nginx som blir hacket kan ikke lese
            /etc/shadow fordi profilen tillater bare /var/www og /var/log/nginx.
          </p>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "virtualisering" }} className="text-brand hover:underline">
                Virtualisering
              </Link>
              {" "}— VM vs container, hypervisors, Docker-basics.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>
              {" "}under «Brukere &amp; rettigheter».
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
