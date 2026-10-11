// Emne 2 — Linux i praksis.
// Pensum: Canvas modul 1b (installasjon, pakker), modul 2 (kommandolinje,
// hjelpesystemer) og modul 6 (vi/vim, X, SSH).

import type { Emne } from "@/lib/kurs/types";
import {
  anslag,
  intro,
  konsept,
  kode,
  oppsummering,
  recall,
  sjekk,
  tallanslag,
  visual,
} from "./byggere";
import { Kodelinje, Term } from "@/components/kurs-dte2505/blokker";
import { FormatSammenligner } from "@/components/stack/dte2505-modul1b/FormatSammenligner";
import { KildeSimulering } from "@/components/stack/dte2505-modul1b/KildeSimulering";
import { PakkeAnsla } from "@/components/stack/dte2505-modul1b/PakkeAnsla";
import { PakkeMalOppgaver } from "@/components/stack/dte2505-modul1b/PakkeMalOppgaver";
import { KommandoAnatomi } from "@/components/stack/dte2505-hjelpesystemer/KommandoAnatomi";
import { ManUtforsker } from "@/components/stack/dte2505-hjelpesystemer/ManUtforsker";
import { VerktoyVelger, LessTaster } from "@/components/stack/dte2505-hjelpesystemer/VerktoyVelger";
import { Hjelpekonsoll } from "@/components/stack/dte2505-hjelpesystemer/Hjelpekonsoll";
import { MalOppgaver } from "@/components/stack/dte2505-hjelpesystemer/MalOppgaver";
import { VimSimulator } from "@/components/stack/dte2505-modul6/VimSimulator";
import { XKlientTjener } from "@/components/stack/dte2505-modul6/XKlientTjener";
import { SshOppgaver } from "@/components/stack/dte2505-modul6/SshOppgaver";

export const emneLinuxIPraksis: Emne = {
  slug: "linux-i-praksis",
  tittel: "Linux i praksis",
  sporsmal: "Hvordan får du en Linux-maskin, og hvordan snakker du med den?",
  pensum: "Canvas modul 1b, modul 2 og modul 6",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "linux-og-distroer",
      tittel: "Kjerne, distribusjon og hvor du kjører den",
      utbytte:
        "Du kan skille kjernen fra distribusjonen, og velge mellom virtuell maskin, WSL og dobbeltoppstart med begrunnelse.",
      byggerPa: ["kjerne-og-brukermodus"],
      skjermer: [
        intro("ld-1-intro", "«Linux» er to ting", {
          ingress: (
            <>
              Når noen sier «jeg kjører Linux», mener de nesten aldri bare kjernen. De mener
              kjernen pluss flere tusen programmer noen har pakket sammen for dem.
            </>
          ),
        }),
        konsept("ld-2-kjerne-distro", "Kjerne mot distribusjon", {
          ingress: <>Skillet er lettere å huske enn det høres ut.</>,
          punkter: [
            <>
              <Term>Kjernen</Term> — én kodebase, startet i 1991. Prosesser, minne, filsystemer,
              drivere. Ingen brukergrensesnitt i det hele tatt.
            </>,
            <>
              <Term>Distribusjonen</Term> — kjernen pakket sammen med skall, kommandoer,
              pakkesystem, installasjonsprogram og skrivebord.
            </>,
            "Ubuntu, Debian, Fedora og Arch bruker den samme kjernen. Forskjellen er alt rundt.",
          ],
          bihjelp: (
            <>
              Verktøyene rundt kjernen kommer i stor grad fra <Term>GNU</Term>-prosjektet. Derfor
              insisterer noen på navnet «GNU/Linux». Det er ikke pedanteri — det er nettopp dette
              skillet.
            </>
          ),
        }),
        anslag("ld-3-anslag", "Hva skiller Ubuntu fra Fedora?", {
          sporsmal: <>Hva er den mest praktiske forskjellen for deg som student?</>,
          valg: [
            { tekst: "Ulik kjerne, så programmer må kompileres på nytt" },
            { tekst: "Ulikt pakkesystem og ulike pakkenavn" },
            { tekst: "Ulikt filsystem-oppsett i bunn" },
          ],
          fasit: (
            <>
              Pakkesystemet. Ubuntu og Debian bruker <Kodelinje>apt</Kodelinje> med{" "}
              <Kodelinje>.deb</Kodelinje>-pakker, Fedora og Red Hat bruker{" "}
              <Kodelinje>dnf</Kodelinje> med <Kodelinje>.rpm</Kodelinje>. Kjernen er den samme,
              og filhierarkiet følger samme standard. Pakkenavnene er derimot ofte forskjellige —
              det er der du blir lurt.
            </>
          ),
        }),
        konsept("ld-4-hvor", "Tre måter å kjøre Linux på", {
          ingress: <>Til obligene i dette faget må du velge én. Alle tre fungerer.</>,
          punkter: [
            <>
              <Term>Virtuell maskin</Term> — Linux kjører som et program på maskinen du har. Kan
              snapshottes og rulles tilbake. Trygt for eksperimenter.
            </>,
            <>
              <Term>WSL</Term> (Windows Subsystem for Linux) — en ekte Linux-kjerne i en lettvekts
              VM, tett integrert med Windows. Rask, men ikke identisk med en vanlig installasjon.
            </>,
            <>
              <Term>Dobbeltoppstart</Term> — Linux på egen diskpartisjon. Full ytelse, men du må
              starte maskinen på nytt for å bytte.
            </>,
          ],
          merk: (
            <>
              Til obligene anbefales virtuell maskin: du kan ta et øyeblikksbilde før du prøver
              noe risikabelt, og rulle tilbake når det går galt. Det gjør det igjen.
            </>
          ),
        }),
        kode("ld-5-hvem-er-jeg", "Fire kommandoer som sier hvor du er", {
          ingress: <>Første ting du gjør på en ukjent Linux-maskin.</>,
          kode: `uname -r        # kjerneversjon, f.eks. 6.8.0-45-generic
cat /etc/os-release   # hvilken distribusjon og versjon
whoami          # hvilken bruker er jeg
pwd             # hvilken katalog står jeg i`,
          punkter: [
            <>
              <Kodelinje>uname -r</Kodelinje> spør kjernen. Den vet ingenting om distribusjonen.
            </>,
            <>
              <Kodelinje>/etc/os-release</Kodelinje> er en vanlig tekstfil distribusjonen selv
              legger igjen.
            </>,
          ],
        }),
        sjekk("ld-6-sjekk", "Hva forteller uname?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>uname -r</Kodelinje> inne i en Docker-container basert på
              Alpine, på en Ubuntu-maskin. Hvilken versjon får du?
            </>
          ),
          valg: [
            { tekst: "Alpines kjerneversjon", hvorfor: "Alpine-imaget inneholder ingen kjerne — bare brukerprogrammer." },
            { tekst: "Ubuntu-vertens kjerneversjon", riktig: true, hvorfor: "Containere deler vertens kjerne. Det er hele forskjellen fra en VM." },
            { tekst: "En feilmelding", hvorfor: "Kommandoen fungerer helt fint." },
          ],
          fasit: (
            <>
              Vertens. En container har sitt eget filsystem og sine egne prosesser, men deler
              kjernen med verten. Vi tar det grundig i emnet om virtualisering.
            </>
          ),
        }),
        recall("ld-7-recall", [
          {
            forside: "Hva er forskjellen på kjernen og en distribusjon?",
            bakside: "Kjernen er koden som kjører i kjernemodus. Distribusjonen er kjernen pakket sammen med skall, kommandoer, pakkesystem og installasjonsprogram.",
          },
          {
            forside: "Hvilket pakkesystem hører til Ubuntu, og hvilket til Fedora?",
            bakside: "Ubuntu/Debian: apt med .deb. Fedora/Red Hat: dnf med .rpm.",
          },
          {
            forside: "Hvorfor anbefales virtuell maskin til obligene?",
            bakside: "Fordi du kan ta øyeblikksbilde før et risikabelt steg og rulle tilbake når noe går galt.",
          },
        ]),
        oppsummering("ld-8-opp", {
          punkter: [
            "Kjernen er én ting, distribusjonen er alt rundt.",
            "Distribusjoner skilles først og fremst av pakkesystem.",
            "VM, WSL og dobbeltoppstart er tre gyldige veier inn.",
          ],
          videre: "Neste: hva en pakke faktisk er, og hvorfor avhengigheter er det vanskelige.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "pakker-og-oppdatering",
      tittel: "Pakker, kilder og avhengigheter",
      utbytte:
        "Du kan forklare hva en pakke inneholder, hvorfor avhengigheter må løses, og hva som skjer ved apt update mot apt upgrade.",
      byggerPa: ["linux-og-distroer"],
      skjermer: [
        intro("pk-1-intro", "Ikke bare en zip-fil", {
          ingress: (
            <>
              En pakke er ikke bare filer. Den er filer <em>pluss</em> et løfte: «jeg trenger disse
              andre pakkene for å virke, og jeg legger filene mine akkurat her».
            </>
          ),
        }),
        anslag("pk-2-anslag", "Hvor mange avhengigheter?", {
          sporsmal: (
            <>
              Du installerer en enkel tekstredigerer med <Kodelinje>apt install</Kodelinje>. Hvor
              mange andre pakker tror du apt drar inn i tillegg, på en fersk minimal-installasjon?
            </>
          ),
          valg: [{ tekst: "0" }, { tekst: "1–3" }, { tekst: "5–20" }, { tekst: "Over 50" }],
          fasit: (
            <>
              Typisk 5–20, og noen ganger langt flere. Hver avhengighet har egne avhengigheter.
              Jobben til pakkebehandleren er å løse hele grafen og finne én kombinasjon av
              versjoner som alle er fornøyd med.
            </>
          ),
        }),
        konsept("pk-3-innhold", "Hva en pakke inneholder", {
          ingress: <>Fire deler, uansett om det er .deb eller .rpm.</>,
          punkter: [
            "Selve filene, med den stien de skal ha på systemet.",
            "Metadata: navn, versjon, beskrivelse, vedlikeholder.",
            "Avhengigheter: hvilke andre pakker som må være der.",
            "Skript som kjører før og etter installasjon (lage brukere, starte tjenester).",
          ],
          merk: (
            <>
              <Kodelinje>dpkg -L pakkenavn</Kodelinje> lister nøyaktig hvilke filer en pakke la
              igjen. Det er den raskeste måten å finne ut hvor et program gjemte konfigurasjonen
              sin.
            </>
          ),
        }),
        visual("pk-4-format", "Formatene side ved side", {
          ledetekst: <>Sammenlign .deb, .rpm og de nyere universalformatene.</>,
          Viz: FormatSammenligner,
          hint: "Se etter hvem som drar med seg sine egne biblioteker, og hvem som stoler på systemets.",
        }),
        konsept("pk-5-update-upgrade", "update mot upgrade", {
          ingress: (
            <>
              Den vanligste misforståelsen i modul 1b. De to kommandoene gjør helt forskjellige
              ting, og rekkefølgen er ikke valgfri.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>apt update</Kodelinje> — hent ny <em>katalog</em> fra kildene. Ingen
              programmer endres.
            </>,
            <>
              <Kodelinje>apt upgrade</Kodelinje> — installer nyere versjoner av det du allerede
              har, basert på katalogen du sist hentet.
            </>,
            "Kjører du bare upgrade, oppgraderer du mot en gammel katalog og får ingenting nytt.",
          ],
        }),
        visual("pk-6-kilder", "Fikle med pakkekildene", {
          ledetekst: <>Legg til og fjern kilder, og se hva som blir tilgjengelig.</>,
          Viz: KildeSimulering,
          hint: "Prøv å installere noe før du har lagt til kilden det ligger i. Feilmeldingen er verdt å kjenne igjen.",
        }),
        visual("pk-7-ansla", "Anslå før du kjører", {
          ledetekst: <>Gjett hva kommandoen gjør før du ser resultatet.</>,
          Viz: PakkeAnsla,
          hint: "Vær presis: endrer denne kommandoen katalogen, eller programmene?",
        }),
        visual("pk-8-oppgaver", "Prøv selv", {
          ledetekst: <>Nå uten fasit foran deg — løs måloppgavene.</>,
          Viz: PakkeMalOppgaver,
          hint: "Har du glemt en kommando, gå tilbake to skjermer. Det er ikke juks.",
        }),
        sjekk("pk-9-sjekk", "Hvilken feil?", {
          sporsmal: (
            <>
              Du får <Kodelinje>E: Unable to locate package htop</Kodelinje>. Hva er mest sannsynlig
              galt?
            </>
          ),
          valg: [
            { tekst: "Pakken finnes ikke for Linux", hvorfor: "htop finnes i praktisk talt alle distribusjoner." },
            { tekst: "Du har ikke kjørt apt update, eller mangler kilden", riktig: true, hvorfor: "apt kjenner bare pakker som står i katalogen den har hentet." },
            { tekst: "Du mangler sudo", hvorfor: "Manglende sudo gir en tilgangsfeil, ikke «unable to locate»." },
          ],
          fasit: (
            <>
              apt slår opp i en lokal katalog. Er katalogen tom eller gammel, finnes pakken ikke
              for apt — uansett hvor godt kjent den er. Løsning:{" "}
              <Kodelinje>sudo apt update</Kodelinje>, og sjekk at riktig kilde er aktivert.
            </>
          ),
        }),
        recall("pk-10-recall", [
          {
            forside: "Hva er forskjellen på apt update og apt upgrade?",
            bakside: "update henter ny pakkekatalog fra kildene. upgrade installerer nyere versjoner basert på den katalogen.",
          },
          {
            forside: "Hvilke fire deler har en pakke?",
            bakside: "Filer med stier, metadata, avhengigheter, og skript som kjører før/etter installasjon.",
          },
          {
            forside: "Hvordan finner du ut hvilke filer en installert pakke la igjen?",
            bakside: "dpkg -L pakkenavn på Debian/Ubuntu; rpm -ql pakkenavn på Fedora/Red Hat.",
          },
        ]),
        oppsummering("pk-11-opp", {
          punkter: [
            "En pakke er filer, metadata, avhengigheter og skript.",
            "update henter katalog, upgrade installerer. Alltid i den rekkefølgen.",
            "«Unable to locate package» betyr nesten alltid gammel eller manglende kilde.",
          ],
          videre: "Neste: å lese en kommando du aldri har sett før.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kommandolinja",
      tittel: "Å lese en kommando",
      utbytte:
        "Du kan plukke fra hverandre en ukjent kommando i kommandonavn, opsjoner og argumenter, og forutsi hva den gjør.",
      byggerPa: ["linux-og-distroer"],
      skjermer: [
        intro("kl-1-intro", "Alt følger samme mønster", {
          ingress: (
            <>
              Kommandolinja ser ut som et vilkårlig rot av bokstaver og bindestreker. Den er det
              ikke. Nesten alle kommandoer følger den samme grammatikken, og når du ser den, kan du
              lese kommandoer du aldri har møtt.
            </>
          ),
        }),
        visual("kl-2-anatomi", "Kommandoens anatomi", {
          ledetekst: <>Klikk på delene av kommandoen og se hva hver del gjør.</>,
          Viz: KommandoAnatomi,
          hint: "Legg spesielt merke til forskjellen på en opsjon som tar en verdi og en som ikke gjør det.",
        }),
        konsept("kl-3-opsjoner", "Korte og lange opsjoner", {
          ingress: <>Samme opsjon har ofte to skrivemåter. Begge er like riktige.</>,
          punkter: [
            <>
              Kort: én bindestrek og én bokstav — <Kodelinje>ls -l</Kodelinje>.
            </>,
            <>
              Lang: to bindestreker og et ord — <Kodelinje>ls --format=long</Kodelinje>.
            </>,
            <>
              Korte kan slås sammen: <Kodelinje>ls -l -a -h</Kodelinje> er{" "}
              <Kodelinje>ls -lah</Kodelinje>.
            </>,
            <>
              <Kodelinje>--</Kodelinje> alene betyr «slutt på opsjoner» — nyttig for filer som
              begynner med bindestrek.
            </>,
          ],
        }),
        anslag("kl-4-anslag", "Hva gjør denne?", {
          sporsmal: (
            <>
              Du har aldri sett <Kodelinje>du -sh /var/log</Kodelinje>. Hva gjetter du at den
              gjør?
            </>
          ),
          valg: [
            { tekst: "Sletter loggfiler" },
            { tekst: "Viser samlet størrelse på katalogen i lesbar form" },
            { tekst: "Laster ned noe til /var/log" },
          ],
          fasit: (
            <>
              Viser størrelsen. <Kodelinje>du</Kodelinje> er «disk usage»,{" "}
              <Kodelinje>-s</Kodelinje> er «summary» (én linje i stedet for én per underkatalog),
              og <Kodelinje>-h</Kodelinje> er «human readable» (3,2G i stedet for 3355443200).
              Både <Kodelinje>-h</Kodelinje> og <Kodelinje>-s</Kodelinje> går igjen i mange
              kommandoer.
            </>
          ),
        }),
        konsept("kl-5-tilbakemelding", "Stillhet er godt nytt", {
          ingress: (
            <>
              Unix-tradisjonen er å ikke si noe når alt gikk bra. Det virker uvennlig, men det er
              en fordel: da betyr enhver utskrift at noe er verdt å se på.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>cp a.txt b.txt</Kodelinje> som lykkes skriver ingenting.
            </>,
            <>
              Vil du ha bekreftelse, be om den: <Kodelinje>cp -v a.txt b.txt</Kodelinje>.
            </>,
            <>
              Vil du vite om det gikk bra i et skript, sjekk exitkoden. Den tar vi i emnet om
              skallprogrammering.
            </>,
          ],
        }),
        sjekk("kl-6-sjekk", "Hvor mange argumenter?", {
          sporsmal: (
            <>
              I <Kodelinje>grep -n --color=auto feil /var/log/syslog</Kodelinje> — hva er
              argumentene, altså det kommandoen jobber <em>på</em>?
            </>
          ),
          valg: [
            { tekst: "-n og --color=auto", hvorfor: "Det er opsjoner: de justerer oppførsel, de er ikke det den jobber på." },
            { tekst: "feil og /var/log/syslog", riktig: true, hvorfor: "Mønsteret det skal lete etter, og filen det skal lete i." },
            { tekst: "Bare /var/log/syslog", hvorfor: "Søkemønsteret er også et argument — det første." },
          ],
          fasit: (
            <>
              To argumenter: mønsteret <Kodelinje>feil</Kodelinje> og filen{" "}
              <Kodelinje>/var/log/syslog</Kodelinje>. Opsjonene <Kodelinje>-n</Kodelinje> (vis
              linjenummer) og <Kodelinje>--color=auto</Kodelinje> endrer bare presentasjonen.
            </>
          ),
        }),
        recall("kl-7-recall", [
          {
            forside: "Hva er forskjellen på en opsjon og et argument?",
            bakside: "Opsjonen justerer hvordan kommandoen oppfører seg. Argumentet er det den jobber på.",
          },
          {
            forside: "Hva betyr -- alene i en kommando?",
            bakside: "Slutt på opsjoner. Alt etter det tolkes som argumenter, selv om det begynner med bindestrek.",
          },
          {
            forside: "Hvorfor skriver en vellykket cp ingenting?",
            bakside: "Unix-tradisjonen er stillhet ved suksess, slik at all utskrift er verdt å lese.",
          },
        ]),
        oppsummering("kl-8-opp", {
          punkter: [
            "Kommando, opsjoner, argumenter — nesten alt følger dette.",
            "Korte opsjoner kan slås sammen; lange er lettere å lese i skript.",
            "Ingen utskrift betyr som regel at alt gikk bra.",
          ],
          videre: "Neste: hva du gjør når du ikke vet hva opsjonen betyr.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "hjelpesystemer",
      tittel: "Å finne svaret på maskinen",
      utbytte:
        "Du kan velge riktig hjelpeverktøy for situasjonen, og navigere en man-side uten å lese den fra topp til bunn.",
      byggerPa: ["kommandolinja"],
      skjermer: [
        intro("hj-1-intro", "Svaret er allerede installert", {
          ingress: (
            <>
              Alt du trenger å vite om kommandoene på maskinen ligger på maskinen. Poenget med
              dette undertemaet er ikke å pugge opsjoner, men å slutte å måtte pugge dem.
            </>
          ),
        }),
        visual("hj-2-velger", "Hvilket verktøy når?", {
          ledetekst: <>Fem hjelpekilder, fem ulike situasjoner.</>,
          Viz: VerktoyVelger,
          hint: "Merk deg hvilken du bruker når du ikke engang vet hva kommandoen heter.",
        }),
        konsept("hj-3-seksjoner", "Man-sidenes seksjoner", {
          ingress: (
            <>
              <Kodelinje>man</Kodelinje> er delt i nummererte seksjoner. Det er derfor{" "}
              <Kodelinje>man printf</Kodelinje> gir noe helt annet enn{" "}
              <Kodelinje>man 3 printf</Kodelinje>.
            </>
          ),
          punkter: [
            "1 — kommandoer du kjører i skallet.",
            "2 — systemkall (kjernen).",
            "3 — bibliotekfunksjoner i C.",
            "5 — filformater, f.eks. man 5 passwd.",
          ],
          merk: (
            <>
              <Kodelinje>man -a printf</Kodelinje> viser alle seksjonene etter hverandre, hvis du
              er usikker på hvilken du vil ha.
            </>
          ),
        }),
        visual("hj-4-man", "Utforsk en man-side", {
          ledetekst: <>Man-sider har alltid de samme overskriftene. Bli kjent med rekkefølgen.</>,
          Viz: ManUtforsker,
          hint: "Hopp rett til EXAMPLES nederst. Det er ofte det eneste avsnittet du trenger.",
        }),
        visual("hj-5-less", "Tastene i less", {
          ledetekst: (
            <>
              Man-sider vises i <Kodelinje>less</Kodelinje>. Disse tastene sparer deg for mye
              scrolling.
            </>
          ),
          Viz: LessTaster,
          hint: "Lær /-søk og n. De to alene gjør man-sider brukbare.",
        }),
        anslag("hj-6-anslag", "Hvor slår du opp?", {
          sporsmal: (
            <>
              Du vet at det finnes en kommando for å finne filer etter navn, men du husker ikke
              hva den heter. Hvor leter du?
            </>
          ),
          valg: [
            { tekst: "man find — hvis jeg gjetter riktig navn" },
            { tekst: "apropos fil, som søker i alle man-sidenes beskrivelser" },
            { tekst: "På nett" },
          ],
          fasit: (
            <>
              <Kodelinje>apropos</Kodelinje> (samme som <Kodelinje>man -k</Kodelinje>) søker i
              korttekstene til alle installerte man-sider. Det er verktøyet for «jeg vet hva jeg
              vil, ikke hva den heter». På nett fungerer også — men på en eksamen uten nett gjør
              det ikke det.
            </>
          ),
        }),
        visual("hj-7-konsoll", "Prøv hjelpekonsollen", {
          ledetekst: <>Skriv kommandoer og se hva hjelpesystemene svarer.</>,
          Viz: Hjelpekonsoll,
          hint: "Prøv --help først. Det er raskere enn man for et enkelt oppslag.",
        }),
        visual("hj-8-oppgaver", "Prøv selv", {
          ledetekst: <>Nå får du målet, ikke kommandoen.</>,
          Viz: MalOppgaver,
          hint: "Bruk hjelpesystemene underveis — det er nettopp det som øves.",
        }),
        recall("hj-9-recall", [
          {
            forside: "Hva ligger i man-seksjon 1, 2 og 5?",
            bakside: "1: kommandoer i skallet. 2: systemkall. 5: filformater.",
          },
          {
            forside: "Hvilket verktøy bruker du når du ikke vet hva kommandoen heter?",
            bakside: "apropos (eller man -k), som søker i beskrivelsene til alle man-sider.",
          },
          {
            forside: "Hvordan søker du inni en man-side?",
            bakside: "Skråstrek og søkeordet, deretter n for neste treff. less brukes som viser.",
          },
        ]),
        oppsummering("hj-10-opp", {
          punkter: [
            "--help for kjapt oppslag, man for detaljer, apropos når du mangler navnet.",
            "Man-sider har seksjoner; samme navn kan finnes i flere.",
            "EXAMPLES nederst er ofte det raskeste svaret.",
          ],
          videre: "Neste: å jobbe på en maskin som står et annet sted.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "fjernbruk-og-editor",
      tittel: "SSH, X og vi",
      utbytte:
        "Du kan logge inn på en fjern maskin, forklare hvorfor X-modellen står på hodet, og komme deg inn og ut av vi uten å miste arbeid.",
      byggerPa: ["kommandolinja"],
      skjermer: [
        intro("fj-1-intro", "Maskinen står et annet sted", {
          ingress: (
            <>
              De fleste Linux-maskiner i verden har verken skjerm eller tastatur. Du når dem over
              nettet, og da må du kunne redigere filer uten mus.
            </>
          ),
        }),
        konsept("fj-2-ssh", "SSH: kryptert skall over nettet", {
          ingress: (
            <>
              <Term>SSH</Term> (secure shell) gir deg et skall på en annen maskin, med all trafikk
              kryptert.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>ssh bruker@maskin</Kodelinje> — logg inn.
            </>,
            <>
              <Kodelinje>scp fil bruker@maskin:~/</Kodelinje> — kopier en fil dit.
            </>,
            <>
              Nøkler er bedre enn passord: <Kodelinje>ssh-keygen</Kodelinje> lager et par,{" "}
              <Kodelinje>ssh-copy-id</Kodelinje> legger den offentlige delen på tjeneren.
            </>,
          ],
          merk: (
            <>
              Den private nøkkelen må ha rettighetene 600. Er den lesbar for andre, nekter SSH å
              bruke den. Hvorfor 600 er akkurat riktig, tar vi i emnet om rettigheter.
            </>
          ),
        }),
        visual("fj-3-ssh-ov", "Prøv SSH-oppgavene", {
          ledetekst: <>Simulert innlogging og filkopiering.</>,
          Viz: SshOppgaver,
          hint: "Legg merke til hvor stien peker: lokalt eller på den andre maskinen.",
        }),
        anslag("fj-4-anslag", "Hvem er tjeneren i X?", {
          sporsmal: (
            <>
              Du kjører et grafisk program på en fjern maskin og ser vinduet på din egen skjerm.
              Hvilken maskin kjører X-tjeneren?
            </>
          ),
          valg: [
            { tekst: "Den fjerne maskinen, som kjører programmet" },
            { tekst: "Min egen maskin, der skjermen står" },
          ],
          fasit: (
            <>
              Din egen. I <Term>X</Term> er tjeneren den som eier skjerm, tastatur og mus —
              altså maskinen foran deg. Programmet er klienten, og det kan stå hvor som helst.
              Terminologien virker bakvendt til du tenker på hvem som «leverer en tjeneste»:
              skjermen din.
            </>
          ),
        }),
        visual("fj-5-x", "Klient og tjener i X", {
          ledetekst: <>Se hvor programmet kjører og hvor vinduet tegnes.</>,
          Viz: XKlientTjener,
          hint: "Flytt programmet mellom maskinene og se at tjeneren blir stående.",
        }),
        konsept("fj-6-vi-modi", "vi har modi — det er hele hemmeligheten", {
          ingress: (
            <>
              De fleste redigeringsprogrammer skriver det du taster.{" "}
              <Kodelinje>vi</Kodelinje> gjør det bare i én av modiene sine. Forvirringen kommer
              alltid av at du er i feil modus.
            </>
          ),
          punkter: [
            <>
              <Term>Normalmodus</Term> — start her. Taster er kommandoer, ikke tekst.
            </>,
            <>
              <Term>Innsettingsmodus</Term> — <Kodelinje>i</Kodelinje> tar deg hit. Nå skriver du
              tekst.
            </>,
            <>
              <Term>Kommandolinjemodus</Term> — <Kodelinje>:</Kodelinje> fra normalmodus. Her
              lagrer og avslutter du.
            </>,
            <>
              <Kodelinje>Esc</Kodelinje> tar deg alltid tilbake til normalmodus. Alltid.
            </>,
          ],
          merk: (
            <>
              Fast rekkefølge når du står fast: <Kodelinje>Esc</Kodelinje>, så{" "}
              <Kodelinje>:wq</Kodelinje> for lagre og avslutt, eller <Kodelinje>:q!</Kodelinje> for
              avslutt uten å lagre.
            </>
          ),
        }),
        visual("fj-7-vim", "Fikle med vi", {
          ledetekst: <>Bytt modus, skriv litt, og øv på å komme deg ut igjen.</>,
          Viz: VimSimulator,
          hint: "Prøv å skrive «wq» uten å trykke Esc først. Feilen du får er den vanligste i faget.",
        }),
        tallanslag("fj-8-tall", "Hvor mange taster?", {
          sporsmal: (
            <>
              Hvor mange tastetrykk trenger du minimum for å åpne en fil, legge til ett tegn på
              slutten av første linje, og lagre — regnet fra du har filen åpen i normalmodus?
            </>
          ),
          enhet: "tastetrykk",
          fasitTall: 7,
          fasit: (
            <>
              Syv: <Kodelinje>A</Kodelinje> (gå til slutten av linja og sett inn), tegnet,{" "}
              <Kodelinje>Esc</Kodelinje>, <Kodelinje>:</Kodelinje>, <Kodelinje>w</Kodelinje>,{" "}
              <Kodelinje>q</Kodelinje>, Enter. Poenget er ikke tallet, men at{" "}
              <Kodelinje>A</Kodelinje> gjør to ting på én tast. Det er derfor vi lever videre.
            </>
          ),
        }),
        sjekk("fj-9-sjekk", "Filen er låst", {
          sporsmal: (
            <>
              Du åpner en fil i vi og får beskjed om at en <Kodelinje>.swp</Kodelinje>-fil finnes.
              Hva betyr det?
            </>
          ),
          valg: [
            { tekst: "Filen er skrivebeskyttet", hvorfor: "Skrivebeskyttelse er rettigheter, ikke swap-fil." },
            { tekst: "En tidligere økt ble avbrutt, eller filen er åpen et annet sted", riktig: true, hvorfor: "vi lagrer ulagrede endringer i en swap-fil underveis." },
            { tekst: "Filen er ødelagt", hvorfor: "Selve filen er urørt." },
          ],
          fasit: (
            <>
              vi skriver endringene dine løpende til en swap-fil, slik at arbeid kan hentes tilbake
              hvis økten dør. Ligger den igjen, ble forrige økt avbrutt — eller noen har filen åpen
              nå. Du kan gjenopprette med <Kodelinje>vi -r filnavn</Kodelinje>.
            </>
          ),
        }),
        recall("fj-10-recall", [
          {
            forside: "Hvem er tjeneren i X-modellen?",
            bakside: "Maskinen med skjerm, tastatur og mus — altså den du sitter foran. Programmet er klienten.",
          },
          {
            forside: "Hvilke tre modi har vi, og hvordan kommer du alltid tilbake til utgangspunktet?",
            bakside: "Normal-, innsettings- og kommandolinjemodus. Esc tar deg alltid til normalmodus.",
          },
          {
            forside: "Hva gjør ssh-copy-id?",
            bakside: "Legger din offentlige nøkkel på den fjerne maskinen, slik at du kan logge inn uten passord.",
          },
        ]),
        oppsummering("fj-11-opp", {
          punkter: [
            "SSH gir kryptert skall og filkopiering; nøkler slår passord.",
            "I X er tjeneren der skjermen er, ikke der programmet kjører.",
            "vi er modusbasert; Esc er alltid veien tilbake.",
          ],
          videre: "Neste emne: prosessen — den viktigste abstraksjonen i hele faget.",
        }),
      ],
    },
  ],
};
