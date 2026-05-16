import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lightbulb, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { SpesialbitsCalculator } from "./SpesialbitsCalculator";

const STEPS = [
  { title: "Paradokset: alice + /etc/shadow", anchor: "problem" },
  { title: "setuid på fil", anchor: "setuid" },
  { title: "setgid på katalog", anchor: "setgid" },
  { title: "sticky bit på katalog", anchor: "sticky" },
  { title: "Trio-tabell", anchor: "trio" },
  { title: "Interaktiv bit-builder", anchor: "kalkulator" },
  { title: "Drill — 4 spørsmål", anchor: "drill" },
];

type DrillQ = {
  id: string;
  question: React.ReactNode;
  options: { label: string; correct: boolean; explain: string }[];
};

const DRILL: DrillQ[] = [
  {
    id: "d1-passwd",
    question: (
      <>
        Hvorfor må <code className="font-mono">/usr/bin/passwd</code> være setuid-root for at
        en vanlig bruker skal kunne endre sitt eget passord?
      </>
    ),
    options: [
      {
        label:
          "Fordi /etc/shadow har modus 000 / 640 og bare root kan skrive der. Setuid lar passwd kjøre med eierens (root) UID, så den får skrive-tilgang midlertidig.",
        correct: true,
        explain:
          "Riktig. Filen /etc/shadow lagrer passord-hasher og er root-only. Setuid-biten gjør at prosessen som starter passwd får effektiv UID = 0 så lenge prosessen lever — akkurat nok privilegier til å oppdatere én linje i shadow.",
      },
      {
        label: "Fordi root har satt sudoers-regelen NOPASSWD: /usr/bin/passwd for alle brukere.",
        correct: false,
        explain:
          "Nei — passwd har INGEN sudoers-regel. Den fungerer for alle vanlige brukere uten sudo, nettopp fordi setuid-biten gjør jobben automatisk.",
      },
      {
        label:
          "Fordi passwd skriver til ~/.passwd-cache i hjemmemappen, ikke til en systemfil.",
        correct: false,
        explain:
          "Nei. Det er ingen ~/.passwd-cache. Hashen lagres i /etc/shadow som er en eneste systemfil delt mellom alle brukere.",
      },
      {
        label: "Setuid har ingenting med passwd å gjøre — bash kaller chmod-syscallen.",
        correct: false,
        explain:
          "Nei. Setuid er hele poenget her: det er mekanismen som lar et userspace-program midlertidig låne UID-en til fil-eieren.",
      },
    ],
  },
  {
    id: "d2-tmp-delete",
    question: (
      <>
        I <code className="font-mono">/tmp</code> (modus 1777) har bob skrive-rettighet på
        selve katalogen. Hvorfor kan ikke bob slette alice sin fil{" "}
        <code className="font-mono">/tmp/notater.txt</code>?
      </>
    ),
    options: [
      {
        label:
          "Sticky-biten gjør at bare fil-eieren (alice) eller root kan slette/rename filer i katalogen — selv om alle har w på selve dir.",
        correct: true,
        explain:
          "Riktig. Sticky-biten (oktal 1, vises som t i andre-x: rwt) overstyrer den vanlige regelen om at w på en katalog betyr 'kan endre innholdet inkludert slette filer'.",
      },
      {
        label:
          "Fordi /tmp er montert med noexec — sletting krever execute-permission på filen.",
        correct: false,
        explain:
          "Nei. Mount-flagget noexec hindrer eksekvering av binærer, ikke sletting. Sletting i en katalog krever w på katalogen, ikke noe på filen.",
      },
      {
        label:
          "Fordi filer i /tmp eies av root automatisk, og bob ikke har sudo.",
        correct: false,
        explain:
          "Nei. Filer i /tmp eies av den som lager dem (alice her), ikke automatisk av root.",
      },
      {
        label: "Fordi notater.txt har modus 600 og bob ikke har read-tilgang.",
        correct: false,
        explain:
          "Nei. Sletting i UNIX avhenger av w på KATALOGEN, ikke på filen. Bob kunne hatt read selv om filen var 644 — sticky-biten på dir-en er det som stopper ham.",
      },
    ],
  },
  {
    id: "d3-s-vs-S",
    question: (
      <>
        Hva er forskjellen mellom <code className="font-mono">rws</code> og{" "}
        <code className="font-mono">rwS</code> (stor vs liten s) i eier-feltet?
      </>
    ),
    options: [
      {
        label:
          "Liten s: både setuid og x er satt (fungerende). Stor S: setuid er satt, men x er ikke — bit er der, men filen er ikke kjørbar, så setuid har ingen praktisk effekt.",
        correct: true,
        explain:
          "Riktig. Stor bokstav signaliserer at bare den underliggende biten er satt (setuid eller sticky), men x-biten den 'overstyrer' er av. Det er ofte et tegn på en feilkonfigurert fil.",
      },
      {
        label: "Stor S betyr setgid, liten s betyr setuid. To helt forskjellige bits.",
        correct: false,
        explain:
          "Nei. Plassen i strengen viser hvilken bit: posisjon 3 (eier-x) = setuid, posisjon 6 (gruppe-x) = setgid, posisjon 9 (andre-x) = sticky. Liten/stor handler om x-biten under er på eller av.",
      },
      {
        label: "Liten s er Linux, stor S er BSD. Samme effekt på begge.",
        correct: false,
        explain:
          "Nei. Liten/stor betyr alltid det samme på alle UNIX-er: liten = bit+x; stor = bit uten x.",
      },
      {
        label: "Liten s = root-eid; stor S = vanlig bruker-eid.",
        correct: false,
        explain:
          "Nei. Eier-felt vises ikke i rwx-strengen. ls -l viser eier i en egen kolonne (`ls -l` rad).",
      },
    ],
  },
  {
    id: "d4-setgid-dir",
    question: (
      <>
        Et team har en delt mappe <code className="font-mono">/srv/teamdata</code> med
        gruppe <code className="font-mono">developers</code>. Når alice (primær-gruppe:{" "}
        <code className="font-mono">alice</code>, sekundær: <code className="font-mono">developers</code>)
        lager en fil i mappen, hva er gruppen til den nye filen — og hva må modusen på
        katalogen være for å oppnå dette?
      </>
    ),
    options: [
      {
        label:
          "Gruppe = developers, hvis katalogen har setgid (chmod 2775). Setgid på dir gjør at nye filer arver katalogens gruppe, ikke alice sin primær-gruppe.",
        correct: true,
        explain:
          "Riktig. Uten setgid ville filen fått alice sin primær-gruppe (alice), og bob i developers ville ikke ha gruppe-tilgang. Med setgid på dir = chmod 2775 (oktalt 2 foran) blir fil-gruppen alltid developers.",
      },
      {
        label:
          "Gruppe = alice. Setgid på katalog påvirker bare hvilke prosesser som kan kjøres, ikke nye filer.",
        correct: false,
        explain:
          "Nei. Setgid på BINÆR = kjør med fil-gruppens rettigheter. Setgid på KATALOG = nye filer arver katalogens gruppe. Det er to forskjellige effekter av samme bit.",
      },
      {
        label:
          "Gruppe = root. Setgid setter alltid gruppen til root for sikkerhets skyld.",
        correct: false,
        explain: "Nei. Setgid har ingenting med root å gjøre — det er bare en arve-regel.",
      },
      {
        label:
          "Gruppe = developers automatisk, fordi alice er medlem av developers. Setgid trengs ikke.",
        correct: false,
        explain:
          "Nei. Uten setgid bruker Linux brukerens AKTIVE primær-gruppe (alice), ikke en av sekundær-gruppene. Setgid er løsningen.",
      },
    ],
  },
];

function DrillCard({ q, idx }: { q: DrillQ; idx: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-2 mb-3">
        <HelpCircle className="h-4 w-4 text-brand mt-1 shrink-0" />
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Spørsmål {idx + 1}
          </div>
          <div className="text-sm leading-relaxed">{q.question}</div>
        </div>
      </div>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = revealed && opt.correct;
          const showWrong = revealed && isSelected && !opt.correct;
          return (
            <button
              key={i}
              onClick={() => {
                setSelected(i);
                setRevealed(true);
              }}
              disabled={revealed}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                showCorrect
                  ? "border-emerald-500 bg-emerald-500/10"
                  : showWrong
                    ? "border-destructive bg-destructive/10"
                    : isSelected
                      ? "border-brand bg-brand/10"
                      : "border-border bg-card hover:border-brand/40"
              } ${revealed ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-start gap-2">
                {revealed && opt.correct && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                {revealed && isSelected && !opt.correct && (
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                )}
                <span className="leading-snug">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      {revealed && selected !== null && (
        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <strong className="text-brand">Forklaring: </strong>
          <span className="text-muted-foreground">{q.options[selected].explain}</span>
        </div>
      )}
      {revealed && (
        <button
          onClick={() => {
            setSelected(null);
            setRevealed(false);
          }}
          className="mt-3 text-xs text-brand hover:underline"
        >
          Prøv igjen
        </button>
      )}
    </div>
  );
}

export function Dte2505SpesialbitsPage() {
  return (
    <StackPageShell title="Spesialbits — setuid, setgid, sticky" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
            DTE-2505 · Linux-rettigheter (atom F5)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Spesialbits — setuid, setgid og sticky
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Tre ekstra bits ligger FORAN de ni vanlige rwx-bittene. De er små i koden, men
            løser tre store problemer i UNIX-modellen: hvordan en vanlig bruker kan endre
            sitt eget passord, hvordan en delt team-mappe holder gruppe-eierskap konsistent,
            og hvordan <code className="font-mono">/tmp</code> klarer å være verdens-skrivbart
            uten at folk sletter hverandres filer.
          </p>
          <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-4 flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Forutsetter:</span>{" "}
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-rwx-kalkulator" }}
                className="text-brand hover:underline"
              >
                rwx-kalkulatoren (F2)
              </Link>{" "}
              — du må kjenne r/w/x for u/g/o og oktal-koding 0–7 først.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-spesialbits" steps={STEPS} />

        <section id="problem" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">1. Paradokset — alice + /etc/shadow</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tenk over dette scenariet før du leser videre:
          </p>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
            <p className="mb-2">
              <strong>Alice</strong> er en vanlig bruker (UID 1001). Hun vil endre passordet sitt
              med <code className="font-mono">passwd</code>.
            </p>
            <p className="mb-2">
              Passordet hennes (hashen) ligger lagret i{" "}
              <code className="font-mono">/etc/shadow</code>, som har modus{" "}
              <code className="font-mono">640</code> — eier <strong>root</strong>, gruppe{" "}
              <strong>shadow</strong>, andre har INGEN tilgang.
            </p>
            <p className="mb-2">
              Alice har ikke skrive-tilgang til /etc/shadow. Hun har ikke en sudoers-regel for
              passwd. Hun kjenner ikke root-passordet.
            </p>
            <p className="font-semibold">Hvordan kan kommandoen passwd da endre filen?</p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm">
            <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
              Svaret — i to steg
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>
                Binæren <code className="font-mono">/usr/bin/passwd</code> eies av{" "}
                <strong>root</strong> og har modus <code className="font-mono">4755</code>{" "}
                (setuid-biten satt).
              </li>
              <li>
                Når alice kjører <code className="font-mono">passwd</code>, ser kernelen setuid-biten
                og setter prosessens <em>effektive</em> UID (euid) til 0 — alice sin prosess «blir»
                root så lenge passwd-programmet kjører. Det er nok privilegier til å oppdatere
                shadow-fila. Når passwd avslutter, forsvinner privilegiet.
              </li>
            </ol>
            <p className="mt-3 text-xs">
              Sjekk selv: <code className="font-mono">ls -l /usr/bin/passwd</code> viser{" "}
              <code className="font-mono">-rwsr-xr-x ... root root ...</code> — legg merke til{" "}
              <strong>s</strong>-en der vanlig eier-x ville stått.
            </p>
          </div>
        </section>

        <section id="setuid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">2. setuid på fil — «kjør som eier»</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3">
            <p>
              <strong>Regel:</strong> Hvis setuid-biten er satt på en kjørbar fil, får prosessen
              som starter den <em>effektiv UID</em> lik fil-EIERENS UID — ikke til den som starter
              programmet.
            </p>
            <p>
              <strong>Hvor:</strong> Vises som <code className="font-mono">s</code> (eller{" "}
              <code className="font-mono">S</code> hvis x ikke er satt) i eier-feltet:{" "}
              <code className="font-mono">rws------</code>.
            </p>
            <p>
              <strong>Oktalt:</strong> 4 foran de tre vanlige siffrene. F.eks.{" "}
              <code className="font-mono">chmod 4755 /usr/bin/passwd</code>.
            </p>
            <div className="rounded-lg border border-dashed border-border p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Symbolsk syntaks</div>
              <pre className="font-mono text-xs">{`chmod u+s /sti/til/fil    # sett setuid
chmod u-s /sti/til/fil    # fjern setuid`}</pre>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <strong className="text-amber-700 dark:text-amber-400">
                Sikkerhetsfare:
              </strong>{" "}
              Setuid-root på vilkårlig binær er privilegie-eskalerings-katastrofe. Hvis programmet
              har en bug som lar deg kjøre vilkårlig kode (f.eks. format-string-bug), får angriperen
              root. Sjekk hvilke setuid-binærer som finnes på systemet:{" "}
              <code className="font-mono">find / -perm -4000 2&gt;/dev/null</code>.
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Subtilitet:</strong> setuid på shell-scripts ignoreres av kernelen på Linux
              (av sikkerhetsgrunner — race conditions mellom kernel som setter euid og shell som
              leser scriptet). Bare ekte kompilerte binærer respekterer setuid.
            </p>
          </div>
        </section>

        <section id="setgid" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">3. setgid på katalog — «arve gruppe»</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3">
            <p>
              <strong>Regel:</strong> Setgid har to forskjellige betydninger avhengig av hva
              den ligger på:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong>På fil (binær):</strong> kjør med fil-GRUPPENS rettigheter. Brukes f.eks.
                av <code className="font-mono">/usr/bin/wall</code> (gruppe tty).
              </li>
              <li>
                <strong>På katalog (vanligst):</strong> nye filer som lages i katalogen får
                katalogens gruppe — IKKE skaperens primær-gruppe.
              </li>
            </ul>
            <p>
              <strong>Hvor:</strong> <code className="font-mono">s</code> i gruppe-feltet:{" "}
              <code className="font-mono">drwxrws---</code>.
            </p>
            <p>
              <strong>Oktalt:</strong> 2 foran. <code className="font-mono">chmod 2775 /srv/teamdata</code>.
            </p>
            <p className="text-xs text-muted-foreground">
              Setgid-på-katalog er allerede dekket grundig i shell-drill (scenariet{" "}
              <em>sh-chmod-sgid-dir</em>). Bruk{" "}
              <Link to="/dte2505/shell-drill" className="text-brand hover:underline">
                shell-drillen
              </Link>{" "}
              for å øve på selve kommandoen — vi nevner setgid her primært for å fullføre trioen.
            </p>
          </div>
        </section>

        <section id="sticky" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">4. Sticky bit på katalog — /tmp-paradokset</h2>
          <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3">
            <p>
              <strong>Problem:</strong> <code className="font-mono">/tmp</code> må være skrivbar
              for ALLE brukere (alle programmer trenger et sted å lagre midlertidige filer). Men
              hvis bob har w på /tmp, kan han da slette alice sin{" "}
              <code className="font-mono">/tmp/notater.txt</code>? I vanlig UNIX-logikk: ja, fordi
              «slette en fil i en katalog» krever w på katalogen, ikke på filen.
            </p>
            <p>
              <strong>Løsning:</strong> sticky-biten. Når den er satt på en katalog, kan bare
              FIL-EIEREN (eller root) slette/rename filer i katalogen — selv om w på katalogen
              er åpent for alle.
            </p>
            <p>
              <strong>Hvor:</strong> <code className="font-mono">t</code> i andre-feltet:{" "}
              <code className="font-mono">drwxrwxrwt</code>.
            </p>
            <p>
              <strong>Oktalt:</strong> 1 foran. <code className="font-mono">chmod 1777 /tmp</code>{" "}
              (eller <code className="font-mono">chmod +t /tmp</code>).
            </p>
            <div className="rounded-lg border border-dashed border-border p-3 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Sjekk det selv</div>
              <pre className="font-mono text-xs">{`$ ls -ld /tmp
drwxrwxrwt 18 root root 4096 mai 15 09:42 /tmp
#         ^                          legg merke til t-en`}</pre>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Historisk:</strong> sticky-biten betydde opprinnelig (1970-tallet) at
              binærens tekst-segment skulle holdes i swap for raskere oppstart neste gang.
              Den semantikken er borte; kun katalog-betydningen er igjen.
            </p>
          </div>
        </section>

        <section id="trio" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">5. De tre bittene på én side</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left font-semibold px-4 py-2 w-20">Bit</th>
                  <th className="text-left font-semibold px-4 py-2 w-16">Oktal</th>
                  <th className="text-left font-semibold px-4 py-2 w-28">På fil</th>
                  <th className="text-left font-semibold px-4 py-2 w-28">På katalog</th>
                  <th className="text-left font-semibold px-4 py-2 w-28">Vises som</th>
                  <th className="text-left font-semibold px-4 py-2">Klassisk eksempel</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">setuid</td>
                  <td className="px-4 py-3 font-mono">4</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Kjør med eierens UID
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">(ingen std. effekt)</td>
                  <td className="px-4 py-3 font-mono">rw<span className="text-brand">s</span>------</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">/usr/bin/passwd (4755)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">setgid</td>
                  <td className="px-4 py-3 font-mono">2</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Kjør med fil-gruppens GID
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Nye filer arver dir-gruppe
                  </td>
                  <td className="px-4 py-3 font-mono">---rw<span className="text-brand">s</span>---</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">/srv/teamdata (2775)</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-brand">sticky</td>
                  <td className="px-4 py-3 font-mono">1</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    (ingen std. effekt)
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Bare eier sletter filer
                  </td>
                  <td className="px-4 py-3 font-mono">------rw<span className="text-brand">t</span></td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">/tmp (1777)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Liten vs stor bokstav:</strong> liten <code className="font-mono">s</code> /{" "}
            <code className="font-mono">t</code> betyr at både spesial-biten OG den underliggende
            x-biten er satt. Stor <code className="font-mono">S</code> /{" "}
            <code className="font-mono">T</code> betyr at spesial-biten er satt, men x ikke er det —
            som regel et tegn på feilkonfigurasjon (bit-en gjør ikke jobben fordi filen ikke er
            kjørbar / katalogen ikke er traverserbar).
          </p>
        </section>

        <section id="kalkulator" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">6. Bygg modus — alle 12 bits</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Toggle hver bit og se hvordan oktal-koden og <code className="font-mono">ls -l</code>-strengen endrer seg.
            Hopp til en preset hvis du vil se de klassiske eksemplene direkte.
          </p>
          <SpesialbitsCalculator />
        </section>

        <section id="drill" className="mb-10">
          <h2 className="text-xl font-semibold mb-3">7. Drill — fire eksamen-typiske spørsmål</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Klikk det svaret du tror er rett. Du får forklaring både ved rett og feil. Trykk
            «prøv igjen» for å nullstille spørsmålet.
          </p>
          <div className="space-y-4">
            {DRILL.map((q, i) => (
              <DrillCard key={q.id} q={q} idx={i} />
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-semibold mb-2">Videre</h2>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>
              <Link
                to="/stack/$slug"
                params={{ slug: "dte2505-rwx-kalkulator" }}
                className="text-brand hover:underline"
              >
                rwx-kalkulator
              </Link>{" "}
              — repeter de ni grunn-bittene før du blander inn spesial-trioen.
            </li>
            <li>
              <Link to="/dte2505/shell-drill" className="text-brand hover:underline">
                Shell-drill
              </Link>{" "}
              — tren på selve chmod-kommandoene (særlig{" "}
              <em>sh-chmod-sgid-dir</em>).
            </li>
            <li>
              <Link to="/stack/$slug" params={{ slug: "dte-2505" }} className="text-brand hover:underline">
                DTE-2505-hub
              </Link>{" "}
              — alle Linux/eksamens-mini-kursene.
            </li>
          </ul>
        </div>
      </article>
    </StackPageShell>
  );
}
