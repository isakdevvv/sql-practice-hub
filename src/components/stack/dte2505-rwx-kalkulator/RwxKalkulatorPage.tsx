import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { RwxKalkulator } from "./RwxKalkulator";
import { UmaskCalculator } from "./UmaskCalculator";

const STEPS = [
  { title: "Modellen: ni bits, tre tall", anchor: "modell" },
  { title: "Oktal-tabell 0–7", anchor: "oktal" },
  { title: "Vanlige modusene", anchor: "vanlige" },
  { title: "Interaktiv kalkulator", anchor: "kalkulator" },
  { title: "umask — hva får nye filer?", anchor: "umask" },
  { title: "Spesialbits: setuid, setgid, sticky", anchor: "spesial" },
  { title: "Hvilken modus for hvilken fil?", anchor: "referanse" },
  { title: "chown / chgrp", anchor: "chown" },
];

export function RwxKalkulatorPage() {
  return (
    <StackPageShell title="rwx-kalkulator" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Linux-rettigheter
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            rwx-kalkulator — chmod fra bunnen
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Hver fil i Linux har tre sett med rettigheter — for eieren (u, user), gruppen (g)
            og alle andre (o, others). Hvert sett har tre bits: <strong>r</strong>ead,{" "}
            <strong>w</strong>rite, e<strong>x</strong>ecute. Til sammen ni bits, som vi
            koder enten symbolsk (<code className="font-mono">rwxr-xr-x</code>) eller oktal
            (<code className="font-mono">755</code>).
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Hands-on:</span>{" "}
              <a href="#kalkulator" className="text-brand hover:underline">rwx-kalkulatoren</a>{" "}
              og{" "}
              <a href="#umask" className="text-brand hover:underline">umask-kalkulatoren</a>{" "}
              under. Tren med{" "}
              <Link to="/drag" className="text-brand hover:underline">drag under
              «Linux-rettigheter»</Link>.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-rwx-kalkulator" steps={STEPS} />

        <section id="modell" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Modellen — ni bits, tre tall</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>r</strong> = 4, <strong>w</strong> = 2, <strong>x</strong> = 1. Legg sammen
            innen hvert sett for å få ett oktalt siffer.
          </p>
          <div className="rounded-xl border border-border bg-card p-5">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`Bit:     r w x  r w x  r w x
Plass:   u u u  g g g  o o o
Verdi:   4 2 1  4 2 1  4 2 1

755 = 7 (rwx) | 5 (r-x) | 5 (r-x)  = rwxr-xr-x
644 = 6 (rw-) | 4 (r--) | 4 (r--)  = rw-r--r--
700 = 7 (rwx) | 0 (---) | 0 (---)  = rwx------`}</pre>
          </div>
        </section>

        <section id="oktal" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Alle åtte oktale verdier per sett</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Hvert siffer i en chmod-modus kan være 0–7. Tabellen viser hva hver verdi gir:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Oktal</th>
                  <th className="text-left font-semibold px-4 py-2 w-20">Binær</th>
                  <th className="text-left font-semibold px-4 py-2 w-24">Symbolsk</th>
                  <th className="text-left font-semibold px-4 py-2">Hva kan brukeren?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">0</td><td className="px-4 py-3 font-mono">000</td><td className="px-4 py-3 font-mono">---</td><td className="px-4 py-3 text-muted-foreground">Ingenting. Som om fila ikke fantes for dem.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">1</td><td className="px-4 py-3 font-mono">001</td><td className="px-4 py-3 font-mono">--x</td><td className="px-4 py-3 text-muted-foreground">Bare execute. På katalog: kan «cd» inn, men ikke liste.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">2</td><td className="px-4 py-3 font-mono">010</td><td className="px-4 py-3 font-mono">-w-</td><td className="px-4 py-3 text-muted-foreground">Bare write — uvanlig, sjelden meningsfullt.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">3</td><td className="px-4 py-3 font-mono">011</td><td className="px-4 py-3 font-mono">-wx</td><td className="px-4 py-3 text-muted-foreground">Write + execute (sjelden).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">4</td><td className="px-4 py-3 font-mono">100</td><td className="px-4 py-3 font-mono">r--</td><td className="px-4 py-3 text-muted-foreground">Bare lese. Klassisk for verdens-lesbare configs.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">5</td><td className="px-4 py-3 font-mono">101</td><td className="px-4 py-3 font-mono">r-x</td><td className="px-4 py-3 text-muted-foreground">Lese + execute. Standard for «se men ikke endre»-binærer.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">6</td><td className="px-4 py-3 font-mono">110</td><td className="px-4 py-3 font-mono">rw-</td><td className="px-4 py-3 text-muted-foreground">Lese + skrive (vanligst for data-filer).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">7</td><td className="px-4 py-3 font-mono">111</td><td className="px-4 py-3 font-mono">rwx</td><td className="px-4 py-3 text-muted-foreground">Alt. Bare for eier-rader (eller midlertidig under utvikling).</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="vanlige" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. De fire modusene du må kjenne i søvne</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Modus</th>
                  <th className="text-left font-semibold px-4 py-2 w-32">Symbolsk</th>
                  <th className="text-left font-semibold px-4 py-2">Bruk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">755</td><td className="px-4 py-3 font-mono">rwxr-xr-x</td><td className="px-4 py-3 text-muted-foreground">Executable som alle skal kunne kjøre, bare eier endrer. Klassisk for binær / katalog.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">644</td><td className="px-4 py-3 font-mono">rw-r--r--</td><td className="px-4 py-3 text-muted-foreground">Standard for data-filer. Eier skriver, alle leser. Default for nye filer (umask 022).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">700</td><td className="px-4 py-3 font-mono">rwx------</td><td className="px-4 py-3 text-muted-foreground">Privat katalog. Som ~/.ssh — bare eier rører.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">600</td><td className="px-4 py-3 font-mono">rw-------</td><td className="px-4 py-3 text-muted-foreground">Privat fil. SSH private keys MÅ være 600 — ellers nekter sshd å bruke dem.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">660</td><td className="px-4 py-3 font-mono">rw-rw----</td><td className="px-4 py-3 text-muted-foreground">Delt mellom medlemmer av en gruppe (typisk team-shared mappe + setgid).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono text-brand">777</td><td className="px-4 py-3 font-mono">rwxrwxrwx</td><td className="px-4 py-3 text-destructive">«Alle kan alt» — nesten alltid feil. Brukes som mislykket workaround for permission denied.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Symbolsk chmod
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`chmod u+x  fil    # eier får execute
chmod g-w  fil    # gruppe mister write
chmod o=r  fil    # others = bare read
chmod a+r  fil    # alle (a=ugo) får read`}</pre>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
                Numerisk chmod
              </div>
              <pre className="font-mono text-xs whitespace-pre">{`chmod 755 script.sh
chmod 600 ~/.ssh/id_rsa
chmod -R 750 prosjekt/    # rekursivt
chmod -R u=rwX,g=rX,o= mappe/
# Stor X = bare x på kataloger (ikke filer)`}</pre>
            </div>
          </div>
        </section>

        <section id="kalkulator" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Lek med bittene</h2>
          <RwxKalkulator />
        </section>

        <section id="umask" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. umask — hva får nye filer?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            <code className="font-mono">umask</code> sier hvilke bits som skal{" "}
            <strong>fjernes</strong> fra default-modus når noe nytt opprettes. Default
            for filer er 666 (rw for alle), for kataloger 777. Umask 022 trekker fra wo+wg → ender på 644 / 755.
          </p>
          <UmaskCalculator />
        </section>

        <section id="spesial" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Spesialbits — setuid, setgid, sticky</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-3">
              Tre ekstra bits ligger FORAN de ni vanlige. De vises som et fjerde oktalt siffer
              foran de tre andre (f.eks. <code className="font-mono">chmod 4755</code>).
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left font-semibold px-4 py-2 w-24">Bit</th>
                    <th className="text-left font-semibold px-4 py-2 w-20">Oktal</th>
                    <th className="text-left font-semibold px-4 py-2 w-32">Vises som</th>
                    <th className="text-left font-semibold px-4 py-2">Hva gjør den?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand">setuid</td>
                    <td className="px-4 py-3 font-mono">4</td>
                    <td className="px-4 py-3 font-mono">rws------</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Kjør binær som EIER av fila, ikke som den som starter den. Klassisk eks: <code className="font-mono">/usr/bin/passwd</code>.
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand">setgid</td>
                    <td className="px-4 py-3 font-mono">2</td>
                    <td className="px-4 py-3 font-mono">---r-s---</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      På binær: kjør med fil-gruppens rettigheter. På katalog: nye filer arver KATALOGENS gruppe.
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-brand">sticky</td>
                    <td className="px-4 py-3 font-mono">1</td>
                    <td className="px-4 py-3 font-mono">------rwt</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      På katalog: bare EIEREN av en fil (eller root) kan slette den. Klassisk eks: <code className="font-mono">/tmp</code> har 1777.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              <strong>Stor S/T vs liten s/t:</strong> stor bokstav betyr at spesialbiten er satt men x ikke er satt
              (sjelden meningsfullt). Liten bokstav betyr begge er satt.
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <strong className="text-amber-700 dark:text-amber-400">Sikkerhetsadvarsel:</strong>{" "}
            setuid-root på vilkårlig binær er en privilegie-eskalerings-bombe.{" "}
            <code className="font-mono">find / -perm -4000 2&gt;/dev/null</code> lister alle
            setuid-binærer på et system. Eksamen-spørsmål: «hva er forskjellen mellom 755 og 4755 på
            /usr/bin/passwd?» Svar: 4755 lar vanlige brukere endre sitt passord ved å midlertidig
            «bli» root for å skrive til /etc/shadow.
          </div>
        </section>

        <section id="referanse" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Hvilken modus passer hvilken fil?</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-44">Fil / mappe</th>
                  <th className="text-left font-semibold px-4 py-2 w-24">Modus</th>
                  <th className="text-left font-semibold px-4 py-2">Hvorfor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/etc/passwd</td><td className="px-4 py-3 font-mono text-brand">644</td><td className="px-4 py-3 text-muted-foreground">Alle leser brukernavn/uid, bare root skriver.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/etc/shadow</td><td className="px-4 py-3 font-mono text-brand">000 / 640</td><td className="px-4 py-3 text-muted-foreground">Hashes — INGEN leser uten å være root (eller via setuid-binær).</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">~/.ssh</td><td className="px-4 py-3 font-mono text-brand">700</td><td className="px-4 py-3 text-muted-foreground">Bare eier. sshd nekter å bruke katalogen hvis den er mer åpen.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">~/.ssh/id_rsa</td><td className="px-4 py-3 font-mono text-brand">600</td><td className="px-4 py-3 text-muted-foreground">Privatnøkkel. Mer åpent &rarr; sshd: «UNPROTECTED PRIVATE KEY FILE».</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">~/.ssh/id_rsa.pub</td><td className="px-4 py-3 font-mono text-brand">644</td><td className="px-4 py-3 text-muted-foreground">Public — kan deles.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/usr/bin/passwd</td><td className="px-4 py-3 font-mono text-brand">4755</td><td className="px-4 py-3 text-muted-foreground">setuid — kjør som root for å oppdatere /etc/shadow.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">/tmp</td><td className="px-4 py-3 font-mono text-brand">1777</td><td className="px-4 py-3 text-muted-foreground">Sticky — alle skriver, men ingen sletter andres filer.</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">./script.sh</td><td className="px-4 py-3 font-mono text-brand">755 / 750</td><td className="px-4 py-3 text-muted-foreground">Executable. 750 hvis det skal være «team-only».</td></tr>
                <tr className="border-t border-border"><td className="px-4 py-3 font-mono">./notater.md</td><td className="px-4 py-3 font-mono text-brand">644</td><td className="px-4 py-3 text-muted-foreground">Vanlig data-fil.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
            <strong className="text-brand">Eksamen-mønster:</strong> «hva er minst privilegerte
            modus som gjør X mulig?» Tenk: hvem trenger r, hvem trenger w, hvem trenger x — og
            ikke gi en eneste bit utover det. 777 er nesten alltid feil svar.
          </div>
        </section>

        <section id="chown" className="mb-6">
          <h2 className="text-xl font-semibold mb-3">8. chown og chgrp — hvem eier?</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`chown isak fil.txt           # bytt eier
chown isak:dev fil.txt       # bytt eier og gruppe
chown :dev fil.txt           # bare bytt gruppe (= chgrp dev fil.txt)
chown -R isak:dev mappe/     # rekursivt nedover

# Bare root kan gi bort eierskap. Vanlige brukere kan ikke
# "donere" sin egen fil til en annen bruker.`}</pre>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Tilbake til oversikten</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">DTE-2505-hub</Link>
              {" "}— alle Linux/eksamens-mini-kursene.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "brukerhandtering" }} className="text-brand hover:underline">Bruker-håndtering</Link>
              {" "}— hvem er u/g/o egentlig, og hvordan administrere det.
            </li>
            <li>
              <Link to="/drag" className="text-brand hover:underline">Drag-oppgaver</Link>{" "}
              under «Linux-rettigheter».
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">Repetisjonskort</Link>{" "}
              i kategorien <em>praktisk</em>.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
