import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, KeyRound, Cookie, Globe, ShieldAlert } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { AuthFlowsSideBySide } from "./AuthFlowsSideBySide";
import { TokenLifetimeViz } from "./TokenLifetimeViz";
import { AttackSandbox } from "./AttackSandbox";
import { AuthMatchQuiz } from "./AuthMatchQuiz";

const STEPS = [
  { title: "Tre flows samtidig", anchor: "side-by-side" },
  { title: "Token-levetid: hvor og hvor lenge", anchor: "lifetime" },
  { title: "Cookie-attributter — HttpOnly, Secure, SameSite", anchor: "cookies" },
  { title: "Når velge hva", anchor: "velge" },
  { title: "Angrep-sandkasse: slå på forsvar", anchor: "angrep" },
  { title: "Match: use-case → strategi", anchor: "quiz" },
];

export function AuthFlowsPage() {
  return (
    <StackPageShell title="Auth flows — Session vs JWT vs OAuth" group="eksamen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            Web-sikkerhet · Auth-mønstre
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Auth flows side ved side — Session, JWT og OAuth
          </h1>
          <p className="mt-3 text-muted-foreground">
            «Session vs JWT» og «når trenger jeg OAuth?» er det vanligste valget noen tar feil.
            De tre mønstrene løser overlappende problemer på fundamentalt forskjellige måter:
            hvor lever staten, hvem utsteder tokenet, kan det revokeres. Her ser du alle tre
            kjøre parallelt, kan justere parametre, og prøve angrep mot hver av dem.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Slik bruker du siden:</span> trykk «Kjør login» under,
              se de tre flows animere parallelt, prøv å justere token-levetid, og kjør deretter
              angrepene mot ulike kombinasjoner av forsvar.
            </div>
          </div>
        </div>

        <CourseOutline courseId="auth-flows" steps={STEPS} />

        <section id="side-by-side" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">1. Tre flows samtidig</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver kolonne viser samme intent — «logg inn → få et token → bruk det» — men løsningene
            divergerer radikalt. Følg pulsene over tidslinjen og les stegene under.
          </p>
          <AuthFlowsSideBySide />

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Pillar
              Icon={Cookie}
              color="#0ea5e9"
              title="Session"
              points={[
                "Cookien er opaque — ingen brukerdata.",
                "Hele staten på serveren (Redis/DB).",
                "Revokering = slett rad. Umiddelbart.",
                "Skalering: del session-store mellom servere.",
              ]}
            />
            <Pillar
              Icon={KeyRound}
              color="#10b981"
              title="JWT"
              points={[
                "Tokenet ER staten — signert, lesbar, ikke endrebar.",
                "Ingen server-side store nødvendig.",
                "Kan IKKE revokeres uten ekstra DB.",
                "Stort + skalerbart, men dårlig logout-historie.",
              ]}
            />
            <Pillar
              Icon={Globe}
              color="#a855f7"
              title="OAuth 2.0"
              points={[
                "Tredjepart logger inn brukeren (Google/Apple/...).",
                "Din app ser aldri passordet.",
                "Code → access_token (kortlevd) + refresh_token (langlevd).",
                "Sjekkliste: bruk Auth Code + PKCE for SPA/mobil.",
              ]}
            />
          </div>
        </section>

        <section id="lifetime" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">2. Token-levetid: hvor og hvor lenge</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Det viktigste spørsmålet etter «hvilket format» er «hvor lever det, hvor lenge,
            og kan jeg revokere det?» Disse tre styrer både UX (må brukeren logge inn ofte?) og
            sikkerhet (hvor lenge er en stjålet token en risiko?).
          </p>
          <TokenLifetimeViz />
        </section>

        <section id="cookies" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">3. Cookie-attributter — HttpOnly, Secure, SameSite</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Når du bruker cookies (session eller token-i-cookie), styrer tre attributter mesteparten
            av forsvarsverket mot de vanligste web-angrepene:
          </p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2">Attributt</th>
                  <th className="text-left font-semibold px-4 py-2">Hva det gjør</th>
                  <th className="text-left font-semibold px-4 py-2">Beskytter mot</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">HttpOnly</td>
                  <td className="px-4 py-3">JS kan ikke lese cookien via <code>document.cookie</code>.</td>
                  <td className="px-4 py-3">XSS-tyveri av cookie.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">Secure</td>
                  <td className="px-4 py-3">Cookien sendes kun over HTTPS.</td>
                  <td className="px-4 py-3">Passiv sniffing, SSL-stripping.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">SameSite=Lax</td>
                  <td className="px-4 py-3">Cookien sendes på top-level GET, ikke på cross-site POST.</td>
                  <td className="px-4 py-3">~95 % av CSRF-angrep.</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">SameSite=Strict</td>
                  <td className="px-4 py-3">Cookien sendes ALDRI ved cross-site requests.</td>
                  <td className="px-4 py-3">All CSRF. UX-kostnad: dypt-link inn på en logged-in side virker som «logget ut».</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono">__Host- prefix</td>
                  <td className="px-4 py-3">Tvinger Secure, ingen domain-attribute, path=/.</td>
                  <td className="px-4 py-3">Subdomain-overtakelse som setter cookies for parent-domenet.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Anbefalt default for en bruker-cookie i 2026:{" "}
            <code className="font-mono">Set-Cookie: __Host-sid=...; HttpOnly; Secure; SameSite=Lax; Path=/</code>.
            Strict-versjonen kun hvis du tåler dypt-link-UX-kostnaden.
          </p>
        </section>

        <section id="velge" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">4. Når velge hva — beslutningstre</h2>
          <ol className="space-y-2 text-sm">
            {[
              "Logger en sluttbruker inn? — Nei → API-nøkkel eller mTLS.",
              "Eier du brukerens konto selv? — Nei (de bruker Google etc.) → OAuth 2.0 + OIDC.",
              "Trenger du å revokere på sekundet (banking, etc.)? — Ja → Session-cookie.",
              "Stateless skalering / mikrotjenester / kort exp er OK? — Ja → JWT.",
              "Bygger du SPA + egen backend? — Default til session-cookie, ikke JWT i localStorage.",
              "Native mobile/desktop? — OAuth Authorization Code + PKCE (RFC 8252).",
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="angrep" className="mb-12">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            5. Angrep-sandkasse: slå på forsvar
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hver setting i auth-stacken løser et spesifikt angrep — og bare det. Her er fem klassiske
            scenarioer. Toggle på forsvar og se nøyaktig hva som faktisk stopper angrepet.
          </p>
          <AttackSandbox />
        </section>

        <section id="quiz" className="mb-12">
          <h2 className="text-xl font-semibold mb-3">6. Match: use-case → strategi</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Seks reelle scenarier. Klikk en use-case til venstre, deretter strategien til høyre du
            mener passer. Feilmatch viser hvorfor det er suboptimalt; riktig viser begrunnelsen og
            låses inn.
          </p>
          <AuthMatchQuiz />
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Relatert lesning</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link to="/stack/$slug" params={{ slug: "tls" }} className="text-brand hover:underline">
                TLS-håndtrykk
              </Link>{" "}
              — alle auth-tokens forutsetter at transport-laget er trygt.
              <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "sikkerhet" }} className="text-brand hover:underline">
                Web-sikkerhet
              </Link>{" "}
              — bredere OWASP-perspektiv: XSS, CSRF, SQLi, alt sammen.
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "kryptografi" }} className="text-brand hover:underline">
                Kryptografi
              </Link>{" "}
              — hash, HMAC og signering som ligger under JWT og passord-lagring.
            </li>
          </ul>
        </div>
      </div>
    </StackPageShell>
  );
}

function Pillar({
  Icon,
  color,
  title,
  points,
}: {
  Icon: typeof Cookie;
  color: string;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground leading-snug list-disc pl-4">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
