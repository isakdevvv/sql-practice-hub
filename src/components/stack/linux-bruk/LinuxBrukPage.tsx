import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";

const STEPS = [
  { title: "Shell-grunnlag — bash", anchor: "shell" },
  { title: "Filer og kataloger", anchor: "filer" },
  { title: "Rettigheter — rwx, chmod, chown", anchor: "rettigheter" },
  { title: "Prosess-håndtering — ps, top, kill", anchor: "prosesser" },
  { title: "Pakkehåndtering — apt, dnf", anchor: "pakker" },
  { title: "Vanlige drift-kommandoer", anchor: "drift" },
];

export function LinuxBrukPage() {
  return (
    <StackPageShell title="Linux-bruk" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Linux i praksis
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Linux-bruk — shell, filer, rettigheter, prosesser
          </h1>
          <p className="mt-3 text-muted-foreground">
            Kommandolinjen er måten du administrerer en Linux-tjener på. Her er
            verktøyene du trenger for å navigere, sette rettigheter, drepe prosesser og
            installere programvare.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <Link to="/drag" className="text-brand hover:underline">drag-oppgaver</Link>{" "}
              under «Linux» — chmod-octal-fyll, ps/top/kill-match, pakkehåndtering.
            </div>
          </div>
        </div>

        <CourseOutline courseId="linux-bruk" steps={STEPS} />

        <section id="shell" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Shell-grunnlag — bash</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bash er den vanligste shellet på Linux. Den leser kommandoer, starter
            prosesser, ekspanderer variabler og glob-mønstre.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`pwd                  # print working directory
cd ~/prosjekter      # change directory (~ = home)
ls -la               # list (long, all incl. dotfiles)
echo "hei $USER"     # variabel-ekspansjon
ls *.txt             # glob — alle .txt-filer
ls **/*.py           # recursive glob (med globstar)
history              # tidligere kommandoer
!!                   # gjenta forrige kommando
Ctrl+R               # søk i historikken`}</pre>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Pipe og redirect
            </div>
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`cmd > fil            # stdout til fil (overskriv)
cmd >> fil           # stdout til fil (append)
cmd 2> fil           # stderr til fil
cmd &> fil           # både stdout og stderr til fil
cmd < fil            # stdin fra fil
cmd1 | cmd2          # pipe — stdout fra cmd1 inn i cmd2

ps aux | grep nginx  # finn nginx-prosesser
cat /etc/passwd | wc -l   # tell brukere`}</pre>
          </div>
        </section>

        <section id="filer" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Filer og kataloger</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`cp src dst           # kopier fil
cp -r dir1 dir2      # kopier katalog rekursivt
mv old new           # flytt eller renamn
rm fil               # slett fil
rm -rf katalog       # slett katalog rekursivt (FARLIG)
mkdir -p a/b/c       # lag katalog-hierarki
ln -s mål lenke      # symbolsk lenke

cat fil              # skriv ut hele filen
less fil             # bla gjennom
head -n 20 fil       # første 20 linjer
tail -f log          # følg log-fil i sanntid
grep mønster fil     # søk i fil
find . -name "*.log" -mtime -7   # filer endret siste 7 dager
du -sh katalog       # disk-bruk
df -h                # diskplass per filsystem`}</pre>
          </div>
        </section>

        <section id="rettigheter" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. Rettigheter — rwx, chmod, chown</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver fil har tre sett rettigheter: <strong>owner</strong>, <strong>group</strong>,
            og <strong>other</strong>. Hvert sett har read (r), write (w), execute (x).
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ls -l fil.txt
-rw-r--r--  1  isak  staff  1024  fil.txt
│└┬┘└┬┘└┬┘
│ │  │  └── other:  r-- (read)
│ │  └───── group:  r-- (read)
│ └──────── owner:  rw- (read, write)
└────────── type:   - (vanlig fil), d (dir), l (lenke)`}</pre>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Symbolsk</th>
                  <th className="text-left font-semibold px-4 py-2 w-24">Binær</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">Octal</th>
                  <th className="text-left font-semibold px-4 py-2">Betyr</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">rwx</td><td className="px-4 py-3 font-mono">111</td><td className="px-4 py-3 font-mono">7</td><td className="px-4 py-3 text-muted-foreground">read + write + execute</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">rw-</td><td className="px-4 py-3 font-mono">110</td><td className="px-4 py-3 font-mono">6</td><td className="px-4 py-3 text-muted-foreground">read + write</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">r-x</td><td className="px-4 py-3 font-mono">101</td><td className="px-4 py-3 font-mono">5</td><td className="px-4 py-3 text-muted-foreground">read + execute</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">r--</td><td className="px-4 py-3 font-mono">100</td><td className="px-4 py-3 font-mono">4</td><td className="px-4 py-3 text-muted-foreground">bare read</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">---</td><td className="px-4 py-3 font-mono">000</td><td className="px-4 py-3 font-mono">0</td><td className="px-4 py-3 text-muted-foreground">ingen tilgang</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`chmod 755 script.sh        # rwxr-xr-x — vanlig for skript
chmod 644 fil.txt          # rw-r--r-- — vanlig for tekstfiler
chmod 700 ~/.ssh           # rwx------ — privat katalog
chmod 600 ~/.ssh/id_rsa    # rw------- — privat nøkkel

chmod u+x script.sh        # legg til execute for owner
chmod g-w fil              # fjern write for group
chmod o= fil               # fjern alt for other

chown user:group fil       # bytt eier og gruppe
chown -R isak /var/app     # rekursivt`}</pre>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Huskeregel for octal:</strong> r=4, w=2, x=1. Summer for hver gruppe.
            755 = 7(rwx) for owner, 5(r-x) for group, 5(r-x) for other.
          </p>
        </section>

        <section id="prosesser" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Prosess-håndtering</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`ps                   # mine prosesser i denne shell-økten
ps aux               # alle prosesser (BSD-stil)
ps -ef               # alle prosesser (System V-stil)
ps aux | grep nginx  # finn navngitt prosess

top                  # interaktiv prosess-monitor
htop                 # penere versjon av top

kill 1234            # send SIGTERM (15) — be pent om å avslutte
kill -9 1234         # send SIGKILL (9) — drep umiddelbart
killall nginx        # drep alle med dette navnet
pkill -f mønster     # drep basert på kommandolinje

jobs                 # bakgrunnsjobber i shellet
cmd &                # start i bakgrunn
fg                   # bring siste jobb til forgrunn
bg                   # fortsett stoppet jobb i bakgrunn
nohup cmd &          # kjør selv etter logout`}</pre>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-24">Signal</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">Nr.</th>
                  <th className="text-left font-semibold px-4 py-2">Betyr</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SIGHUP</td><td className="px-4 py-3 font-mono">1</td><td className="px-4 py-3 text-muted-foreground">Hang up — terminal lukket, ofte brukt til reload config</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SIGINT</td><td className="px-4 py-3 font-mono">2</td><td className="px-4 py-3 text-muted-foreground">Ctrl+C — avbryt</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SIGTERM</td><td className="px-4 py-3 font-mono">15</td><td className="px-4 py-3 text-muted-foreground">Standard «avslutt pent» (kan fanges)</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SIGKILL</td><td className="px-4 py-3 font-mono">9</td><td className="px-4 py-3 text-muted-foreground">Drep — kan IKKE fanges eller ignoreres</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">SIGSTOP</td><td className="px-4 py-3 font-mono">19</td><td className="px-4 py-3 text-muted-foreground">Suspendér prosessen</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="pakker" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. Pakkehåndtering</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver distribusjon har sin pakkehåndterer. Lær én godt — kommandoene har
            nesten samme semantikk.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Debian / Ubuntu — apt
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`sudo apt update
sudo apt upgrade
sudo apt install nginx
sudo apt remove nginx
apt search mønster
apt show pakke
dpkg -l              # liste alle
dpkg -L pakke        # filer i pakken`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Fedora / RHEL — dnf
              </div>
              <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`sudo dnf check-update
sudo dnf upgrade
sudo dnf install nginx
sudo dnf remove nginx
dnf search mønster
dnf info pakke
rpm -qa              # liste alle
rpm -ql pakke        # filer i pakken`}</pre>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Andre: <code>pacman</code> (Arch), <code>zypper</code> (openSUSE),{" "}
            <code>apk</code> (Alpine), <code>brew</code> (macOS). Snap og Flatpak er
            distribusjons-uavhengige.
          </p>
        </section>

        <section id="drift" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Vanlige drift-kommandoer</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`systemctl status nginx           # tjeneste-status
systemctl start nginx            # start
systemctl enable nginx           # autostart ved boot
systemctl restart nginx          # restart

journalctl -u nginx -f           # følg log for tjeneste
journalctl --since "1 hour ago"

uname -a                         # kernel + arkitektur
uptime                           # hvor lenge oppe + load
free -h                          # minne-bruk
ip addr                          # nettverk-grensesnitt
ss -tulpn                        # åpne porter
who                              # innloggede brukere
last                             # innloggings-historikk`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Neste steg</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "shell-scripting" }} className="text-brand hover:underline">
                Shell scripting
              </Link>
              {" "}— automatiser drift-oppgaver.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "brukere-rettigheter" }} className="text-brand hover:underline">
                Brukere og rettigheter
              </Link>
              {" "}— dypere på sudo, useradd, ACL.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
