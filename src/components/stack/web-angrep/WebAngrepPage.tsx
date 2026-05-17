import { Link } from "@tanstack/react-router";
import { ShieldAlert, Bug, Zap, GitBranch } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { XssSandbox } from "./XssSandbox";
import { CsrfSandbox } from "./CsrfSandbox";
import { SqlInjectionSandbox } from "./SqlInjectionSandbox";
import { AttackVsDefenseTimeline } from "./AttackVsDefenseTimeline";

export function WebAngrepPage() {
  return (
    <StackPageShell title="Web-angrep — XSS, CSRF, SQL Injection sandbox" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Sikkerhet · Interaktiv sandbox
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Web-angrep — XSS, CSRF, SQL Injection
          </h1>
          <p className="mt-3 text-muted-foreground">
            De tre klassikerne fra OWASP Top 10. Hver av dem er en sandbox du kan{" "}
            <em>kjøre</em>: skriv inn angreps-payload, bytt mellom sårbar og sikker modus,
            se hvordan forsvaret bryter angrepet konkret. Til slutt drar du forsvar inn på
            en angreps-tidslinje for å forstå hvor hvert tiltak treffer.
          </p>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Trygg pedagogikk:</span> sandboxene simulerer
              effekten av payloadene — de kjører ingen ekte script eller cross-origin requests
              i din browser. Du kan teste destruktive presets uten konsekvenser.
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Beslektet: <Link to="/" className="text-brand hover:underline">forsiden</Link> ·
            kode-side-om-side i den klassiske{" "}
            <em>Web-sikkerhet — OWASP-essensen</em>-lesjonen.
          </div>
        </div>

        <CourseOutline
          courseId="web-angrep"
          steps={[
            { title: "XSS — script i andres browser", anchor: "xss" },
            { title: "CSRF — request fra ondsinnet side", anchor: "csrf" },
            { title: "SQL Injection — bryt ut av strengen", anchor: "sqli" },
            { title: "Angrep vs forsvar — tidslinje", anchor: "timeline" },
            { title: "Når bruker du hvilket forsvar?", anchor: "matrise" },
          ]}
        />

        {/* XSS */}
        <section id="xss" className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-bold">
              1
            </span>
            <h2 className="text-xl font-semibold">XSS — Cross-Site Scripting</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Angriperen får sitt eget JavaScript til å kjøre i offerets browser, med offerets
            sesjon og rettigheter. Vanligste vektor: en kommentar-tråd eller profil-tekst som
            server skriver tilbake til andre brukere uten å escape HTML. Sandboxen viser
            tre modi side om side: ren konkatenering, output-escaping, og defense-in-depth med CSP.
          </p>
          <XssSandbox />
        </section>

        {/* CSRF */}
        <section id="csrf" className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-bold">
              2
            </span>
            <h2 className="text-xl font-semibold">CSRF — Cross-Site Request Forgery</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Brukeren er innlogget på bank.com. En ondsinnet side i en annen tab sender en
            POST mot banken — og browseren legger bankens cookie automatisk med, fordi den
            ikke vet at requesten ikke ble initiert fra bankens egen side. Bytt mellom fem
            forsvars-strategier (SameSite-Lax, SameSite-Strict, CSRF-token, Origin-sjekk,
            ingen) og se hvor angrepet stoppes.
          </p>
          <CsrfSandbox />
        </section>

        {/* SQLi */}
        <section id="sqli" className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-bold">
              3
            </span>
            <h2 className="text-xl font-semibold">SQL Injection — bryt ut av streng-konkatenering</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Server lager SQL ved å lime sammen <code>"WHERE username = '" + u + "'"</code>.
            Angriper skriver <code>admin' --</code> og kommentaren slukker resten av WHERE.
            Fire angreps-presets (auth-bypass, UNION-dump, boolean-blind, time-based) viser
            spennvidden av hva man kan gjøre. Sikker modus bruker prepared statement — sett
            samme input inn og se at den behandles som streng-data.
          </p>
          <SqlInjectionSandbox />
        </section>

        {/* Timeline */}
        <section id="timeline" className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-bold">
              4
            </span>
            <h2 className="text-xl font-semibold">Angrep vs forsvar — tidslinje</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Hvert angrep har fire faser: recon, bygg payload, leveranse, eksekvering. Hvert
            forsvar stopper angrepet på en bestemt fase. Dra forsvar inn på riktig fase og
            se hvor i kjeden hvert tiltak slår inn. Noen forsvar er skjøre (mønster-basert
            filtrering); andre er robuste (parameterized queries, output-encoding) fordi de
            virker AT eksekvering, ikke FØR.
          </p>
          <AttackVsDefenseTimeline />
        </section>

        {/* Forsvars-matrise */}
        <section id="matrise" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">Når bruker du hvilket forsvar?</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Forsvar</th>
                  <th className="text-left font-semibold px-4 py-2">XSS</th>
                  <th className="text-left font-semibold px-4 py-2">CSRF</th>
                  <th className="text-left font-semibold px-4 py-2">SQLi</th>
                  <th className="text-left font-semibold px-4 py-2">Hvor?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">Output-escaping</td>
                  <td className="px-4 py-2 text-success">✓ primær</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">Template-renderer (Jinja, React)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">CSP-header</td>
                  <td className="px-4 py-2 text-success">✓ backup</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">Response-header fra server</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">HttpOnly cookie</td>
                  <td className="px-4 py-2 text-success">✓ skadebegr.</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">Set-Cookie attribute</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">SameSite cookie</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-success">✓ primær</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">Set-Cookie attribute</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">CSRF-token</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-success">✓ primær</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">Form-felt + session-state på server</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">Parameterized query</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-success">✓ primær</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">DB-driver (cursor.execute med tuple)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">Least-privilege DB</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-success">✓ skadebegr.</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">GRANT SELECT/INSERT — ikke DROP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-xs">Input-validering</td>
                  <td className="px-4 py-2 text-amber-600 dark:text-amber-400">~ skjør</td>
                  <td className="px-4 py-2 text-muted-foreground">—</td>
                  <td className="px-4 py-2 text-amber-600 dark:text-amber-400">~ skjør</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">Form-validering, men aldri som eneste forsvar</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ✓ = robust, virker AT eksekvering. ~ = skjør, baserer seg på mønstergjenkjenning som kan bypasses.
          </p>
        </section>

        {/* Sammendrag */}
        <section className="mb-10">
          <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
            <div className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-3 flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Det røde tråden
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span>
                  <strong>Alle tre angrep har samme rot:</strong> server tolker
                  brukerinput som <em>kode</em> (HTML, SQL) eller stoler på opphavet til
                  en request (cookie). Forsvaret er å skille data fra kode konsekvent.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <GitBranch className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                <span>
                  <strong>Defense in depth:</strong> ett forsvar er aldri nok. Selv om
                  parameterized queries blokkerer SQLi i din kode, kan en ny endpoint
                  glemme det — derfor også least-privilege DB-bruker, derfor også WAF.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span>
                  <strong>Aldri "filtrer farlige tegn":</strong> blokklister kan alltid
                  bypasses. Bruk rammeverkets egne mekanismer (Jinja auto-escape, SQLAlchemy
                  text(...).bindparams, Flask-WTF CSRFProtect) — de er testet av mange.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Beslektede lesjoner</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/sikkerhet" className="text-brand hover:underline">
                Web-sikkerhet — OWASP-essensen
              </Link>
              : kode-side-om-side med sårbar/trygg pattern for fem klassiske angrep.
            </li>
            <li>
              <Link to="/cards" className="text-brand hover:underline">
                Repetisjonskort
              </Link>
              : flashcards for XSS, CSRF, SQL injection, OWASP og web-angrep generelt.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}
