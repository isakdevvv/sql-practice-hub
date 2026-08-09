import { Link } from "@tanstack/react-router";
import {
  Package,
  KeyRound,
  Target,
  Bug,
  Brain,
  HelpCircle,
  Telescope,
  ShieldAlert,
  Boxes,
  Info,
} from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { CourseOutline } from "@/components/stack/CourseOutline";
import { PakkeAnsla } from "./PakkeAnsla";
import { KildeSimulering } from "./KildeSimulering";
import { FormatSammenligner } from "./FormatSammenligner";
import { PakkeMalOppgaver } from "./PakkeMalOppgaver";
import { FeilsokingPanel } from "@/components/stack/dte2505-felles/FeilsokingPanel";
import { RecallPanel } from "@/components/stack/dte2505-felles/RecallPanel";
import { PAKKE_TROUBLE_TASKS } from "@/lib/dte2505/pakkekilderEngine";
import { PAKKE_RECALL_CARDS, PAKKE_CARD_TAGS, pakkekilderFsrs } from "@/lib/dte2505/pakkekilderKort";

// ---------------------------------------------------------------------------
// DTE-2505 Modul 1b, Canvas-punkt 1.3 — programvare fra andre kilder.
//
// Seksjonsrekkefølgen ER oppgave-arkitekturen i PLAN-HOST26-MODULER.md §3:
//   1. Anslå-så-sjekk    — før forklaringen
//   2. Guidet simulering — under forklaringen, null prestasjonskrav
//   3. Måloppgave        — etter forklaringen, med tilstandssjekk (§3.1)
//   4. Feilsøking        — sist
//   5. Recall-kort       — kun det som må sitte i hodet
//
// Scaffolding: modulen forutsetter at apt update / install / remove allerede er
// kjent fra forkurs F01–F03 og «Linux-bruk». Alt nytt introduseres i rekkefølge
// — først hva et arkiv ER, så hvordan man legger til et, så hvorfor signaturen
// avgjør om det virker, og først til slutt de alternative formatene.
// ---------------------------------------------------------------------------

const STEPS = [
  { title: "Hvorfor denne biten", anchor: "hvorfor" },
  { title: "1 · Anslå først", anchor: "ansla" },
  { title: "Hva et pakkearkiv er", anchor: "arkiv" },
  { title: "PPA — personlige arkiver", anchor: "ppa" },
  { title: "Signeringsnøkler", anchor: "nokler" },
  { title: "2 · Kildene, live", anchor: "simulering" },
  { title: "Løse .deb-filer", anchor: "deb" },
  { title: "Snap og flatpak", anchor: "formater" },
  { title: "Risikoen ved tredjepart", anchor: "risiko" },
  { title: "3 · Måloppgaver", anchor: "mal" },
  { title: "4 · Feilsøking", anchor: "feilsok" },
  { title: "5 · Recall-kort", anchor: "recall" },
  { title: "Dypere enn pensum", anchor: "dypere" },
];

export function Modul1bPage() {
  return (
    <StackPageShell title="Programvare fra andre kilder" group="eksamen">
      <article className="container mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            DTE-2505 · Modul 1b · Canvas-punkt 1.3
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Installere programmer fra andre kilder
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Du kan allerede installere det Ubuntu tilbyr. Men før eller siden trenger du noe som ikke
            er der: en nyere versjon enn distribusjonen har, et program leverandøren bare gir ut som
            løs fil, eller noe som bare finnes i et helt annet pakkeformat. Da må du vite hvor apt
            henter fra, hvordan du legger til et sted til, og hvorfor systemet noen ganger nekter
            blankt.
          </p>
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-sky-500/40 bg-sky-500/5 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <div className="text-sm leading-relaxed">
              <span className="font-medium">Ingen innlevering på denne biten.</span> Canvas sier
              eksplisitt at <em>oblig 1.3 gis ikke i år</em>. Punktet er fortsatt pensum og kan komme
              på eksamen — det er bare ingen frist å rekke. Obligene i modul 1b er 1.1 og 1.2, begge
              med frist 28. august 2026, og de dekkes av forkurset og Linux-bruk.
            </div>
          </div>
        </header>

        <CourseOutline courseId="dte2505-modul1b" steps={STEPS} />

        {/* ================================================================= */}
        <section id="hvorfor" className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Telescope className="h-5 w-5 text-brand" /> Hvorfor denne biten
          </h2>
          <p className="leading-relaxed">
            Fra forkurset kan du <code className="font-mono">apt update</code>,{" "}
            <code className="font-mono">apt install</code> og{" "}
            <code className="font-mono">apt remove</code>. Det holder helt til dagen du trenger noe
            Ubuntu ikke har. Da står du overfor fire valg, og de har ulik pris:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Kilde</th>
                  <th className="py-2 pr-3 font-medium">Når</th>
                  <th className="py-2 font-medium">Prisen du betaler</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-b [&>tr]:border-border/60">
                {[
                  [
                    "PPA (Personal Package Archive)",
                    "Du vil ha en nyere versjon enn distribusjonen tilbyr",
                    "Eieren av arkivet får installere hva som helst på maskinen din, med rot-rettigheter",
                  ],
                  [
                    "Tredjepartsarkiv (leverandørens eget)",
                    "Store prosjekter som Docker vedlikeholder egne arkiver",
                    "Du må selv legge inn signeringsnøkkelen, og selv vurdere om du stoler på dem",
                  ],
                  [
                    "Løs .deb-fil",
                    "Leverandøren har ingen arkiv, bare en nedlastingsknapp",
                    "Pakken oppdateres aldri automatisk — heller ikke ved sikkerhetshull",
                  ],
                  [
                    "Snap eller flatpak",
                    "Programmet finnes ikke som .deb, eller du vil ha sandkasse",
                    "Mer diskplass og minne, tregere oppstart, enda et system å holde orden på",
                  ],
                ].map(([a, b, c]) => (
                  <tr key={a}>
                    <td className="py-2 pr-3 font-medium">{a}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{b}</td>
                    <td className="py-2">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 leading-relaxed">
            Det er ingen av dem som er «riktig». Poenget med modulen er at du skal kunne velge med
            åpne øyne, og fikse det når valget slår tilbake.
          </p>
        </section>

        {/* ============ 1. ANSLÅ-SÅ-SJEKK ================================== */}
        <section id="ansla" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 1
            </span>
            <span className="text-xs text-muted-foreground">før forklaringen</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <HelpCircle className="h-5 w-5 text-brand" /> Anslå først, sjekk etterpå
          </h2>
          <p className="mb-4 leading-relaxed">
            Ta disse <em>før</em> du leser videre. Du skal ikke kunne svarene ennå. En gjetning du har
            brukt ti sekunder på lager et hull som forklaringen etterpå fester seg i; en forklaring på
            et spørsmål du aldri stilte glir rett gjennom.
          </p>
          <PakkeAnsla />
        </section>

        {/* ============ ARKIV ============================================== */}
        <section id="arkiv" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Package className="h-5 w-5 text-brand" /> Hva et pakkearkiv egentlig er
          </h2>
          <p className="leading-relaxed">
            Et <strong>pakkearkiv</strong> (engelsk: <em>repository</em>, ofte forkortet til «repo»)
            er ikke noe mystisk. Det er en tjener på nettet med to ting: ferdigbygde pakkefiler, og en
            indeksfil som lister opp hva som finnes der, i hvilke versjoner, og hva hver pakke er
            avhengig av.
          </p>
          <p className="mt-2 leading-relaxed">
            Hvilke arkiver <em>din</em> maskin bruker, står i vanlige tekstfiler du kan lese med{" "}
            <code className="font-mono">cat</code>:
          </p>
          <ul className="mt-2 space-y-1.5 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <code className="font-mono">/etc/apt/sources.list</code> — hovedfila, der
              distribusjonens egne linjer står.
            </li>
            <li>
              <code className="font-mono">/etc/apt/sources.list.d/</code> — en katalog med én fil per
              ekstra kilde. Det er hit alt annet skal, slik at et program som legger til en kilde
              slipper å redigere hovedfila di.
            </li>
          </ul>
          <p className="mt-2 leading-relaxed">
            En linje ser slik ut, og har fire deler:{" "}
            <code className="font-mono">deb</code> (pakketypen — ferdigbygd, mot{" "}
            <code className="font-mono">deb-src</code> for kildekode), adressen, utgivelsesnavnet
            (<code className="font-mono">noble</code> for Ubuntu 24.04), og komponentene:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs">
            deb http://archive.ubuntu.com/ubuntu noble main restricted
          </pre>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Det viktigste å ta med seg videre:</span> apt går aldri ut
            på nettet for å lete etter en pakke. Den slår opp i en <strong>lokal indeks</strong> som
            bygges av <code className="font-mono">apt update</code>. Legger du til en kilde uten å
            kjøre update, er indeksen fortsatt den gamle — og den nye pakken finnes rett og slett ikke
            for apt. Nesten alle forvirrende feilmeldinger i denne modulen kommer fra dette ene
            forholdet.
          </div>
        </section>

        {/* ============ PPA ================================================ */}
        <section id="ppa" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">PPA — når distribusjonen er for treg</h2>
          <p className="leading-relaxed">
            <strong>PPA</strong> står for <strong>Personal Package Archive</strong>, altså personlig
            pakkearkiv. Det er en tjeneste hos Launchpad (Canonicals utviklerplattform) der hvem som
            helst kan laste opp kildekode, få den bygget automatisk for hver Ubuntu-versjon, og legge
            resultatet ut som et fullverdig pakkearkiv.
          </p>
          <p className="mt-2 leading-relaxed">
            Grunnen til at de finnes: Ubuntu fryser pakkeversjoner når en utgivelse slippes, og retter
            deretter bare feil. Det er bra for stabilitet og elendig hvis du trenger en funksjon som
            kom i fjor. Mange prosjekter driver derfor sitt eget PPA med ferske versjoner.
          </p>
          <p className="mt-2 leading-relaxed">Legges til med én kommando:</p>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs">
            sudo add-apt-repository ppa:obsproject/obs-studio
          </pre>
          <p className="mt-2 leading-relaxed">
            Den kommandoen gjør <strong>to</strong> ting, og det er verdt å legge merke til akkurat
            hvilke: den skriver kildelinja i{" "}
            <code className="font-mono">/etc/apt/sources.list.d/</code>, <em>og</em> den henter
            arkivets signeringsnøkkel. Når du senere legger til et arkiv for hånd, må du gjøre begge
            delene selv — og glemmer du den andre, får du feilen i neste avsnitt.
          </p>
          <p className="mt-2 leading-relaxed">
            <code className="font-mono">sudo add-apt-repository --remove ppa:eier/navn</code> fjerner
            kilden igjen. Merk at det <em>ikke</em> avinstallerer pakkene du fikk derfra — de blir
            stående som foreldreløse, uten noe arkiv som tilbyr oppdateringer.
          </p>
        </section>

        {/* ============ NØKLER ============================================= */}
        <section id="nokler" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <KeyRound className="h-5 w-5 text-brand" /> Signeringsnøkler: hvorfor et arkiv kan bli
            avvist
          </h2>
          <p className="leading-relaxed">
            Pakkelista fra et arkiv lastes ned over nettet, og apt kjører innholdet som rot-bruker
            etterpå. Det er nøyaktig den situasjonen der du vil vite at ingen har tuklet med filene
            underveis. Løsningen er en digital signatur, laget med{" "}
            <strong>GPG</strong> — <strong>GNU Privacy Guard</strong>.
          </p>
          <p className="mt-2 leading-relaxed">
            Mekanikken er et nøkkelpar: arkivet har en <em>privat</em> nøkkel bare det eier, og
            signerer pakkelista med den. Du har den tilhørende <em>offentlige</em> nøkkelen, og apt
            bruker den til å regne ut om signaturen stemmer med innholdet. Gjør den ikke det, er noe
            endret siden arkivet lagde lista.
          </p>
          <p className="mt-2 leading-relaxed">
            Mangler nøkkelen helt, kan apt ikke sjekke noe som helst. Da nekter den heller enn å
            gjette, og du får:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-rose-500/40 bg-rose-500/5 px-3 py-2 font-mono text-xs">
            {`Err:2 https://download.docker.com/linux/ubuntu noble InRelease
  The following signatures couldn't be verified because
  the public key is not available: NO_PUBKEY ...`}
          </pre>
          <p className="mt-2 leading-relaxed">
            Hele arkivet hoppes over. Det lumske er at feilen ikke stopper deg der og da — den dukker
            opp senere som <code className="font-mono">Unable to locate package</code> på en pakke du
            vet finnes, langt fra der årsaken var.
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Hva signaturen faktisk beviser.</span> Den beviser{" "}
            <em>opphav</em>: at pakkelista er uendret siden den som eier nøkkelen lagde den. Den
            beviser ingenting om at innholdet er trygt, velment eller feilfritt. En signert pakke fra
            en useriøs kilde er fortsatt en pakke fra en useriøs kilde — bare garantert uforfalsket.
          </div>
          <p className="mt-3 leading-relaxed">
            Nøkler legges i dag i <code className="font-mono">/etc/apt/keyrings/</code>, og bindes til
            ett bestemt arkiv med <code className="font-mono">signed-by=</code> i kildelinja. Den gamle
            kommandoen <code className="font-mono">apt-key</code> er avviklet nettopp fordi den la
            nøkkelen i én felles ring som gjaldt <em>alle</em> arkiver: da kunne et tredjepartsarkiv
            signere pakker som utga seg for å komme fra Ubuntu.
          </p>
        </section>

        {/* ============ 2. GUIDET SIMULERING =============================== */}
        <section id="simulering" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 2
            </span>
            <span className="text-xs text-muted-foreground">guidet simulering · lær-modus</span>
          </div>
          <h2 className="mb-3 text-2xl font-semibold">Se kildene endre seg</h2>
          <p className="mb-4 leading-relaxed">
            Her kan ingenting gå galt. Trykk deg gjennom kjeden og se de fire rutene under —{" "}
            <strong>kilder</strong>, <strong>nøkler</strong>, <strong>indeks</strong> og{" "}
            <strong>installert</strong> — endre seg for hver kommando. Hvert steg sier hva du skal se
            etter. Det er nettopp rekkefølgen på hvilke ruter som endrer seg som er hele modellen.
          </p>
          <KildeSimulering />
        </section>

        {/* ============ LØSE .DEB-FILER ==================================== */}
        <section id="deb" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Boxes className="h-5 w-5 text-brand" /> Løse .deb-filer: dpkg mot apt
          </h2>
          <p className="leading-relaxed">
            Noen leverandører har ingen arkiv, bare en nedlastingsknapp som gir deg en{" "}
            <code className="font-mono">.deb</code>-fil. Da har du to verktøy, og forskjellen mellom
            dem er hele poenget:
          </p>
          <ul className="mt-2 space-y-2 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <code className="font-mono">dpkg</code> (<strong>Debian Package</strong>) er
              lavnivåverktøyet som håndterer <em>én</em> pakkefil. Den pakker ut filene og setter opp
              pakken. Den kjenner ingen arkiver, så mangler en avhengighet, kan den ikke hente den —
              den stopper, og pakken blir liggende halvferdig i tilstanden{" "}
              <code className="font-mono">iU</code> (unpacked, ikke konfigurert).
            </li>
            <li>
              <code className="font-mono">apt</code> (<strong>Advanced Package Tool</strong>) er bygget{" "}
              <em>oppå</em> dpkg og kjenner arkivene. Gi den den samme filen, og den henter
              avhengighetene fra arkivene på veien.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Derfor er dette nesten alltid riktig kommando — merk skråstreken:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/40 px-3 py-2 font-mono text-xs">
            sudo apt install ./slack-desktop.deb
          </pre>
          <p className="mt-2 leading-relaxed">
            Uten <code className="font-mono">./</code> tolker apt navnet som et <em>pakkenavn</em> og
            slår det opp i indeksen, der det selvsagt ikke finnes. Skråstreken er det eneste som
            skiller «en fil» fra «et navn» for apt. Og har du allerede rotet det til med{" "}
            <code className="font-mono">dpkg -i</code>, rydder{" "}
            <code className="font-mono">sudo apt install -f</code> opp (<code className="font-mono">-f</code>{" "}
            for <em>fix-broken</em>).
          </p>
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <span className="font-medium">Den varige kostnaden ved en løs fil:</span> pakken tilhører
            ikke noe arkiv. Ingen kommer til å tilby deg en oppdatering — heller ikke når det dukker
            opp et sikkerhetshull. Du må huske det selv, for alltid. Det er derfor et arkiv nesten
            alltid er å foretrekke, selv når det koster litt mer å sette opp.
          </div>
        </section>

        {/* ============ FORMATER =========================================== */}
        <section id="formater" className="mt-12">
          <h2 className="mb-3 text-2xl font-semibold">Snap og flatpak: helt andre pakkesystemer</h2>
          <p className="leading-relaxed">
            Alt til nå har handlet om <code className="font-mono">.deb</code> og apt. Men på en moderne
            Ubuntu-maskin kjører det gjerne tre pakkesystemer samtidig, og de vet ikke om hverandre.
          </p>
          <p className="mt-2 leading-relaxed">
            Den ene forskjellen alt annet følger av, er <em>hvor bibliotekene bor</em>. En{" "}
            <code className="font-mono">.deb</code> deler systemets biblioteker med alle andre
            programmer. En snap eller flatpak tar dem med seg inne i pakken. Klikk gjennom de tre og
            se hva det gjør med resten:
          </p>
          <div className="mt-4">
            <FormatSammenligner />
          </div>
          <p className="mt-3 leading-relaxed">
            <strong>Sandkassen</strong> er den andre store forskjellen. Et program installert med apt
            har nøyaktig de samme rettighetene som deg: det kan lese alle filene dine. En snap eller
            flatpak kjører som standard innelåst og ser bare det den har fått lov til. Derfor krever
            enkelte programmer at du slår sandkassa av:{" "}
            <code className="font-mono">sudo snap install code --classic</code>. En kodeeditor må
            kunne åpne hvilken som helst fil og kjøre andre programmer. Flagget er en reell avveining,
            ikke en formalitet.
          </p>
        </section>

        {/* ============ RISIKO ============================================= */}
        <section id="risiko" className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <ShieldAlert className="h-5 w-5 text-amber-500" /> Hva du faktisk sier ja til
          </h2>
          <p className="leading-relaxed">
            Å legge til en tredjepartskilde er ikke det samme som å laste ned et program. Det er å gi
            noen en stående invitasjon.
          </p>
          <ul className="mt-2 space-y-2 pl-5 leading-relaxed [&>li]:list-disc">
            <li>
              <strong>Arkivet kan levere hva som helst, ikke bare pakken du ville ha.</strong> Uten
              pinning vinner høyeste versjonsnummer, uansett hvilket arkiv det kommer fra. Legger
              arkivet ut en «nyere» versjon av et systembibliotek, blir det ditt ved neste
              oppgradering.
            </li>
            <li>
              <strong>Pakker installeres med rot-rettigheter.</strong> En pakke kan kjøre skript før og
              etter installasjon. Det finnes ingen sandkasse rundt en .deb.
            </li>
            <li>
              <strong>Ingen kvalitetskontrollerer innholdet.</strong> Launchpad bygger det eieren laster
              opp. Signaturen beviser hvem som bygde pakken, ikke at den er trygg.
            </li>
            <li>
              <strong>Et forlatt arkiv er verre enn ingen.</strong> Slutter eieren å vedlikeholde det,
              blir du sittende med pakker som aldri sikkerhetsoppdateres — og{" "}
              <code className="font-mono">apt policy</code> vil vise{" "}
              <em>Installed</em> nyere enn <em>Candidate</em>, som er varselet om nettopp dette.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Praktisk kjøreregel: bruk distribusjonens arkiv når du kan. Bruk et prosjekts eget arkiv
            når du faktisk trenger versjonen. Bruk snap eller flatpak når du vil ha sandkassa. Og legg
            aldri til en kilde du ikke kan si høyt hvem eier.
          </p>
        </section>

        {/* ============ 3. MÅLOPPGAVER ==================================== */}
        <section id="mal" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 3
            </span>
            <span className="text-xs text-muted-foreground">måloppgave med tilstandssjekk</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Target className="h-5 w-5 text-brand" /> Oppnå måltilstanden
          </h2>
          <p className="mb-4 leading-relaxed">
            Disse sjekker ikke om du skrev en bestemt tekststreng. Kommandoene dine endrer systemet i
            panelet, og sjekken spør om <em>systemet</em> havnet der oppgaven ba om. Derfor er
            oppgavene flerstegs — slik ekte pakkearbeid er — og derfor kan tilbakemeldingen si
            nøyaktig hvilket steg som mangler når du er nesten framme.
          </p>
          <PakkeMalOppgaver />
        </section>

        {/* ============ 4. FEILSØKING ===================================== */}
        <section id="feilsok" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-500">
              Oppgavetype 4
            </span>
            <span className="text-xs text-muted-foreground">sist i modulen</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Bug className="h-5 w-5 text-rose-500" /> Noe gikk galt — hvor?
          </h2>
          <p className="mb-4 leading-relaxed">
            Nå kan feilen bo hvor som helst: i en manglende nøkkel, i en indeks som ikke er hentet, i
            at dpkg ikke kjenner arkiver, i en kilde som er fjernet, eller i at programmet er
            installert tre ganger i tre formater. Du får se hva som faktisk skjedde, og skal stille
            diagnosen før du får rettelsen.
          </p>
          <FeilsokingPanel tasks={PAKKE_TROUBLE_TASKS} />
        </section>

        {/* ============ 5. RECALL ========================================= */}
        <section id="recall" className="mt-12">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand">
              Oppgavetype 5
            </span>
            <span className="text-xs text-muted-foreground">løpende, på tvers</span>
          </div>
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold">
            <Brain className="h-5 w-5 text-brand" /> Det som må sitte i hodet
          </h2>
          <p className="mb-4 leading-relaxed">
            Kommandoene kan du slå opp med <code className="font-mono">man apt</code>. Det du ikke kan
            slå opp, er <em>modellen</em>: hva en kilde er, hva indeksen er, hva signaturen beviser, og
            hvilket verktøy som kjenner arkivene. Det er dét kortene dekker.
          </p>
          <RecallPanel cards={PAKKE_RECALL_CARDS} tags={PAKKE_CARD_TAGS} store={pakkekilderFsrs} />
        </section>

        {/* ============ GO DEEP =========================================== */}
        <section id="dypere" className="mt-12">
          <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <Telescope className="h-3.5 w-3.5" /> Dypere enn pensum
            </div>
            <p className="text-sm leading-relaxed">
              Ingenting under trengs til eksamen. Det står her fordi det gjør resten mindre magisk.
            </p>
            <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed [&>li]:list-disc">
              <li>
                <strong>apt-pinning.</strong> I{" "}
                <code className="font-mono">/etc/apt/preferences.d/</code> kan du gi arkiver ulik
                prioritet, slik at du henter <em>ett</em> program fra et PPA uten at resten av systemet
                kan bli overtatt av det. Det er den ordentlige måten å bruke et tredjepartsarkiv på.
              </li>
              <li>
                <strong>Det nye .sources-formatet.</strong> Kildelinjer skrives nå gjerne i
                flerlinjeformatet <em>deb822</em> (filer som slutter på{" "}
                <code className="font-mono">.sources</code>), med ett felt per linje:{" "}
                <code className="font-mono">Types:</code>, <code className="font-mono">URIs:</code>,{" "}
                <code className="font-mono">Signed-By:</code>. Lettere å lese, samme betydning.
              </li>
              <li>
                <strong>Hva ligger i en .deb?</strong> Et ar-arkiv med tre deler: metadata,
                kontrollfiler (avhengigheter og installasjonsskript) og selve filtreet.{" "}
                <code className="font-mono">dpkg-deb -c fil.deb</code> viser innholdet uten å
                installere noe — verdt å gjøre én gang på en fil du har lastet ned fra en fremmed.
              </li>
              <li>
                <strong>Reproduserbare bygg.</strong> Debian jobber med at samme kildekode alltid skal
                gi bit-identisk pakke, slik at flere uavhengige parter kan bygge den og sammenligne.
                Da beviser signaturen mer enn bare opphav.
              </li>
            </ul>
          </div>
        </section>

        {/* ============ NESTE ============================================= */}
        <div className="mt-10 rounded-xl border border-brand/30 bg-brand/5 p-5">
          <h3 className="mb-2 text-lg font-semibold">Anbefalt neste</h3>
          <p className="mb-3 text-sm leading-relaxed">
            Modul 1b er dermed komplett. Neste modul handler om å finne svar selv — manualsidene og
            hjelpesystemene, som er det obligen i modul 2 ber om.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-hjelpesystemer" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Modul 2 — Hjelpesystemer →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "linux-bruk" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Linux-bruk (apt-grunnlaget) →
            </Link>
            <Link
              to="/stack/$slug"
              params={{ slug: "dte2505-moduler" }}
              className="rounded-md border bg-card px-3 py-1.5 hover:bg-accent"
            >
              Alle modulene i DTE-2505 →
            </Link>
          </div>
        </div>
      </article>
    </StackPageShell>
  );
}
