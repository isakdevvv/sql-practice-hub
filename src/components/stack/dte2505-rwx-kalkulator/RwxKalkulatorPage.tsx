import { StackPageShell } from "@/components/stack/StackPageShell";
import { RwxKalkulator } from "./RwxKalkulator";
import { UmaskCalculator } from "./UmaskCalculator";

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
        </header>

        <section className="mb-10">
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. Lek med bittene</h2>
          <RwxKalkulator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. umask — hva får nye filer?</h2>
          <UmaskCalculator />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Spesialbits — setuid, setgid, sticky</h2>
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
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. chown og chgrp — hvem eier?</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{`chown isak fil.txt           # bytt eier
chown isak:dev fil.txt       # bytt eier og gruppe
chown :dev fil.txt           # bare bytt gruppe (= chgrp dev fil.txt)
chown -R isak:dev mappe/     # rekursivt nedover

# Bare root kan gi bort eierskap. Vanlige brukere kan ikke
# "donere" sin egen fil til en annen bruker.`}</pre>
          </div>
        </section>
      </article>
    </StackPageShell>
  );
}
