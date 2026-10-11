// Emne 10 — Brukere og tilgangsrettigheter.
// Pensum: Canvas modul 5 «Tilgangsrettigheter og skallprogram» (første halvdel).
// Bygger på inoden (emne 8): rettighetene ER felt i inoden.

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
import { RwxKalkulator } from "@/components/stack/dte2505-rwx-kalkulator/RwxKalkulator";
import { UmaskCalculator } from "@/components/stack/dte2505-rwx-kalkulator/UmaskCalculator";
import { SpesialbitsCalculator } from "@/components/stack/dte2505-spesialbits/SpesialbitsCalculator";

export const emneRettigheter: Emne = {
  slug: "rettigheter",
  tittel: "Brukere og rettigheter",
  sporsmal: "Hvem får lov til hva, og hvor er den avgjørelsen lagret?",
  pensum: "Canvas modul 5 — Tilgangsrettigheter",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "brukere-og-grupper",
      tittel: "Brukere, grupper og identitet",
      utbytte:
        "Du kan forklare hva en bruker er for kjernen, og forskjellen på su og sudo.",
      byggerPa: ["prosess-abstraksjonen"],
      skjermer: [
        intro("bg-1-intro", "Brukeren er et tall", {
          ingress: (
            <>
              Kjernen kjenner ingen brukernavn. Den kjenner tall. Navnet «isak» finnes bare i en
              tekstfil som programmer i brukermodus slår opp i for å gjøre utskrifter lesbare.
            </>
          ),
        }),
        konsept("bg-2-uid", "UID og GID", {
          ingress: (
            <>
              Hver prosess bærer med seg en <Term>UID</Term> (bruker-ID) og en{" "}
              <Term>GID</Term> (gruppe-ID). Det er disse kjernen sammenligner ved hver
              tilgangssjekk.
            </>
          ),
          punkter: [
            "UID 0 er root. Ikke fordi navnet er magisk, men fordi kjernen sjekker tallet 0.",
            "Vanlige brukere får typisk UID fra 1000 og oppover.",
            "Under 1000 er systemkontoer for tjenester — de skal ikke kunne logge inn.",
            "En bruker har én primærgruppe og kan være med i mange tilleggsgrupper.",
          ],
        }),
        kode("bg-3-filer", "De tre filene", {
          ingress: <>Alt om brukere ligger i tre tekstfiler.</>,
          kode: `/etc/passwd   isak:x:1000:1000:Isak:/home/isak:/bin/bash
/etc/shadow   isak:$6$saltet$hashen...:19700:0:99999:7:::
/etc/group    utviklere:x:1001:isak,kari`,
          punkter: [
            <>
              <Kodelinje>/etc/passwd</Kodelinje> er lesbar for alle — derfor kan{" "}
              <Kodelinje>ls -l</Kodelinje> vise navn i stedet for tall.
            </>,
            <>
              <Kodelinje>x</Kodelinje> i passordfeltet betyr «passordet ligger i shadow».
            </>,
            <>
              <Kodelinje>/etc/shadow</Kodelinje> er bare lesbar for root, og inneholder hasher, ikke
              passord.
            </>,
          ],
        }),
        anslag("bg-4-anslag", "Hvorfor to filer?", {
          sporsmal: (
            <>
              Hvorfor ble passordhashene flyttet ut av <Kodelinje>/etc/passwd</Kodelinje> og over i
              en egen fil?
            </>
          ),
          valg: [
            { tekst: "Fordi passwd ble for stor" },
            { tekst: "Fordi passwd må være lesbar for alle, og hasher kan angripes offline" },
            { tekst: "For å støtte lengre passord" },
          ],
          fasit: (
            <>
              Fordi <Kodelinje>/etc/passwd</Kodelinje> må være lesbar for alle programmer som skal
              oversette UID til navn. Lå hashene der, kunne enhver bruker kopiert dem og prøvd
              milliarder av passord på egen maskin uten at noen merket det. Skillet er en direkte
              anvendelse av «gi bare den tilgangen som trengs».
            </>
          ),
        }),
        konsept("bg-5-su-sudo", "su mot sudo", {
          ingress: <>Begge gir deg mer makt, men på helt ulike premisser.</>,
          punkter: [
            <>
              <Kodelinje>su - kari</Kodelinje> — bli kari. Krever <em>karis</em> passord. Du blir
              værende til du logger ut.
            </>,
            <>
              <Kodelinje>sudo kommando</Kodelinje> — kjør én kommando som root. Krever{" "}
              <em>ditt eget</em> passord.
            </>,
            <>
              Hvem som får lov til hva står i <Kodelinje>/etc/sudoers</Kodelinje>, som redigeres
              med <Kodelinje>visudo</Kodelinje>.
            </>,
            "Sudo logger hver kommando. Su gir ingen sporbarhet etter innlogging.",
          ],
          merk: (
            <>
              Derfor er root-kontoen låst på Ubuntu: uten et root-passord finnes det ingen{" "}
              <Kodelinje>su</Kodelinje> til root, og all opphøyd bruk går gjennom sudo og blir
              logget.
            </>
          ),
        }),
        kode("bg-6-kommandoer", "Administrere brukere", {
          kode: `id kari                  # UID, GID og gruppemedlemskap
useradd -m -s /bin/bash ny   # -m lager hjemmekatalog
passwd ny                # sett passord
usermod -aG utviklere ny # LEGG TIL i gruppe
groups ny                # hvilke grupper er ny med i`,
          punkter: [
            <>
              <Kodelinje>-a</Kodelinje> i usermod betyr «legg til». Uten den erstattes alle
              tilleggsgrupper.
            </>,
            "Nytt gruppemedlemskap gjelder først ved neste innlogging.",
          ],
          merk: (
            <>
              Å glemme <Kodelinje>-a</Kodelinje> er en klassisk måte å låse seg selv ute av sudo på.
            </>
          ),
        }),
        sjekk("bg-7-sjekk", "Hvem er du?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>sudo whoami</Kodelinje>. Hva skrives ut?
            </>
          ),
          valg: [
            { tekst: "Ditt eget brukernavn", hvorfor: "sudo bytter effektiv UID før kommandoen kjøres." },
            { tekst: "root", riktig: true, hvorfor: "Kommandoen kjører med UID 0." },
            { tekst: "En feilmelding", hvorfor: "Kommandoen er helt gyldig." },
          ],
          fasit: (
            <>
              root. Sammenlign med <Kodelinje>sudo echo $USER</Kodelinje>, som skriver{" "}
              <em>ditt</em> navn — fordi skallet ditt utvider variabelen før sudo i det hele tatt
              starter. Den forskjellen er verdt å huske.
            </>
          ),
        }),
        recall("bg-8-recall", [
          {
            forside: "Hva kjenner kjernen en bruker som?",
            bakside: "Et tall — UID. Navnet finnes bare i /etc/passwd og slås opp av programmer i brukermodus.",
          },
          {
            forside: "Hvorfor ligger passordhashene i /etc/shadow og ikke i /etc/passwd?",
            bakside: "Fordi passwd må være lesbar for alle. Hasher i en åpen fil kunne knekkes offline uten at noen merket det.",
          },
          {
            forside: "Hvilket passord krever su, og hvilket krever sudo?",
            bakside: "su krever målbrukerens passord. sudo krever ditt eget.",
          },
        ]),
        oppsummering("bg-9-opp", {
          punkter: [
            "Identitet er tall: UID og GID.",
            "passwd er offentlig, shadow er ikke.",
            "sudo gir sporbar, midlertidig makt; su gir en hel økt.",
          ],
          videre: "Neste: de ni bitene som avgjør alt.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "rwx-og-chmod",
      tittel: "De ni bitene",
      utbytte:
        "Du kan oversette mellom symbolsk og oktal skrivemåte i begge retninger, og forutsi utfallet av en tilgangssjekk.",
      byggerPa: ["brukere-og-grupper", "filer-og-inoder"],
      skjermer: [
        intro("rw-1-intro", "Ni bit i inoden", {
          ingress: (
            <>
              Hele den klassiske rettighetsmodellen i Unix er ni bit. Ikke ni per bruker — ni til
              sammen, lagret i inoden til filen.
            </>
          ),
        }),
        konsept("rw-2-tre-tre", "Tre grupper à tre bit", {
          ingress: <>Les alltid utskriften i tre og tre.</>,
          punkter: [
            <>
              Første trio: <Term>eier</Term>. Andre: <Term>gruppen</Term>. Tredje:{" "}
              <Term>alle andre</Term>.
            </>,
            <>
              I hver trio: <Kodelinje>r</Kodelinje> lese, <Kodelinje>w</Kodelinje> skrive,{" "}
              <Kodelinje>x</Kodelinje> kjøre.
            </>,
            <>
              <Kodelinje>rw-r--r--</Kodelinje> betyr: eier kan lese og skrive, alle andre kan bare
              lese.
            </>,
            "Bokstaven aller først i ls -l er ikke en rettighet — den er filtypen.",
          ],
        }),
        konsept("rw-3-forste-treff", "Første treff vinner", {
          ingress: (
            <>
              Dette er den regelen som overrasker flest, og den er nesten alltid årsaken når noen
              ikke forstår hvorfor de ble nektet.
            </>
          ),
          punkter: [
            "Er du eier? Da brukes eiertrioen, og bare den.",
            "Ellers: er du med i gruppen? Da brukes gruppetrioen.",
            "Ellers: andre-trioen.",
            "Rettighetene legges aldri sammen. Første treff avgjør, punktum.",
          ],
          merk: (
            <>
              Derfor kan eieren av en fil med <Kodelinje>---rwxrwx</Kodelinje> ikke lese sin egen
              fil — mens alle andre kan.
            </>
          ),
        }),
        anslag("rw-4-anslag", "Kan eieren lese?", {
          sporsmal: (
            <>
              Filen har <Kodelinje>----rw-rw-</Kodelinje> og eies av deg. Kan du lese den?
            </>
          ),
          valg: [
            { tekst: "Ja — eieren kan alltid lese sin egen fil" },
            { tekst: "Nei — eiertrioen er tom, og den er den eneste som gjelder for deg" },
          ],
          fasit: (
            <>
              Nei. Du treffer eiertrioen, den er tom, og du blir nektet — selv om gruppen og alle
              andre har full tilgang. Men: som eier kan du når som helst kjøre{" "}
              <Kodelinje>chmod</Kodelinje> og gi deg selv tilgangen tilbake. Retten til å endre
              rettighetene ligger i eierskapet, ikke i bitene.
            </>
          ),
        }),
        konsept("rw-5-oktal", "Oktal skrivemåte", {
          ingress: <>Tre bit passer nøyaktig i ett siffer fra 0 til 7.</>,
          punkter: [
            <>
              <Kodelinje>r</Kodelinje> = 4, <Kodelinje>w</Kodelinje> = 2,{" "}
              <Kodelinje>x</Kodelinje> = 1. Legg sammen per trio.
            </>,
            <>
              <Kodelinje>rwx</Kodelinje> = 7, <Kodelinje>rw-</Kodelinje> = 6,{" "}
              <Kodelinje>r-x</Kodelinje> = 5, <Kodelinje>r--</Kodelinje> = 4.
            </>,
            <>
              <Kodelinje>644</Kodelinje> er standard for filer, <Kodelinje>755</Kodelinje> for
              kataloger og skript.
            </>,
            <>
              <Kodelinje>600</Kodelinje> er «bare jeg» — det SSH krever av private nøkler.
            </>,
          ],
        }),
        visual("rw-6-kalk", "Fikle med bitene", {
          ledetekst: <>Klikk bitene av og på, og se begge skrivemåtene endre seg.</>,
          Viz: RwxKalkulator,
          hint: "Sett 640 og les det symbolsk. Gjør så det motsatte: skriv rwxr-x--- og finn tallet.",
        }),
        kode("rw-7-chmod", "Lær først: to måter å sette dem", {
          ingress: <>Samme resultat, ulik stil.</>,
          kode: `chmod 755 skript.sh          # sett alt absolutt
chmod u+x skript.sh          # legg til x for eier
chmod go-w fil.txt           # fjern skriverett for gruppe og andre
chmod -R u+rwX katalog/      # stor X: x bare på kataloger`,
          punkter: [
            "Tallform setter alle ni bitene på én gang. Symbolsk endrer bare det du nevner.",
            <>
              Stor <Kodelinje>X</Kodelinje> er triksete og nyttig: den gir kjørerett til kataloger og
              til filer som allerede har den, men ikke til vanlige datafiler.
            </>,
          ],
        }),
        tallanslag("rw-8-prov", "Prøv selv", {
          sporsmal: (
            <>
              Skriv oktal-verdien for <Kodelinje>rwxr-x---</Kodelinje>. Bare de tre sifrene, som ett
              tall.
            </>
          ),
          enhet: "",
          fasitTall: 750,
          fasit: (
            <>
              750. Eier: 4+2+1 = 7. Gruppe: 4+0+1 = 5. Andre: 0. Dette er standard for kataloger som
              skal deles innad i et prosjekt, men ikke være synlige utenfor.
            </>
          ),
        }),
        sjekk("rw-9-sjekk", "Hvem kan slette?", {
          sporsmal: (
            <>
              En fil er <Kodelinje>r--r--r--</Kodelinje> og eies av root. Katalogen den ligger i er{" "}
              <Kodelinje>rwxrwxrwx</Kodelinje>. Kan du slette filen?
            </>
          ),
          valg: [
            { tekst: "Nei, filen er skrivebeskyttet", hvorfor: "Sletting endrer ikke filen — den endrer katalogen." },
            { tekst: "Ja, fordi du har skriverett i katalogen", riktig: true, hvorfor: "Å slette er å fjerne en oppføring i katalogen." },
            { tekst: "Bare root kan", hvorfor: "Eierskapet til filen er ikke det som avgjør." },
          ],
          fasit: (
            <>
              Ja. Sletting fjerner et navn fra katalogen, og det krever skriverett på{" "}
              <em>katalogen</em>, ikke på filen. Dette er nøyaktig hvorfor{" "}
              <Kodelinje>/tmp</Kodelinje> trenger sticky-bitten, som er neste undertema.
            </>
          ),
        }),
        recall("rw-10-recall", [
          {
            forside: "Hvordan avgjøres hvilken rettighetstrio som gjelder for deg?",
            bakside: "Første treff vinner: er du eier brukes eiertrioen, ellers gruppen hvis du er medlem, ellers andre. Aldri sammenlagt.",
          },
          {
            forside: "Hva er tallverdien til rwxr-x---?",
            bakside: "750. Eier 4+2+1, gruppe 4+1, andre 0.",
          },
          {
            forside: "Hvilken rettighet trengs for å slette en fil?",
            bakside: "Skriverett på katalogen filen ligger i, ikke på filen selv.",
          },
        ]),
        oppsummering("rw-11-opp", {
          punkter: [
            "Ni bit, tre trioer, første treff vinner.",
            "Oktal: r=4, w=2, x=1.",
            "Sletting styres av katalogen, ikke av filen.",
          ],
          videre: "Neste: hvilke rettigheter nye filer får uten at du sier noe.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "umask-og-standard",
      tittel: "umask og standardrettigheter",
      utbytte:
        "Du kan regne ut hvilke rettigheter en ny fil får, og velge en umask for et gitt behov.",
      byggerPa: ["rwx-og-chmod"],
      skjermer: [
        intro("um-1-intro", "Hvem bestemte 644?", {
          ingress: (
            <>
              Du kjører <Kodelinje>touch ny.txt</Kodelinje> og filen får{" "}
              <Kodelinje>rw-r--r--</Kodelinje>. Du sa ingenting om rettigheter. Hvem gjorde?
            </>
          ),
        }),
        konsept("um-2-regel", "Trekk fra, ikke legg til", {
          ingress: (
            <>
              <Term>umask</Term> er en maske av biter som <em>fjernes</em> fra utgangspunktet.
            </>
          ),
          punkter: [
            "Utgangspunkt for filer: 666. Aldri kjørerett automatisk.",
            "Utgangspunkt for kataloger: 777, fordi de trenger x for å kunne gås gjennom.",
            "Resultatet er utgangspunktet med maskens biter slått av.",
            "Standard umask er 022 på de fleste systemer.",
          ],
          merk: (
            <>
              666 minus 022 gir 644. 777 minus 022 gir 755. Det forklarer akkurat de to tallene du
              ser overalt.
            </>
          ),
        }),
        anslag("um-3-anslag", "Hvorfor ikke 777 for filer?", {
          sporsmal: <>Hvorfor er utgangspunktet for filer 666 og ikke 777?</>,
          valg: [
            { tekst: "Fordi 777 ville vært usikkert" },
            { tekst: "Fordi kjørerett aldri skal gis ved et uhell" },
            { tekst: "Fordi filsystemet ikke støtter det" },
          ],
          fasit: (
            <>
              Kjørerett skal alltid være en bevisst handling. En tekstfil som ved et uhell blir
              kjørbar er en unødvendig risiko, og det er derfor du må skrive{" "}
              <Kodelinje>chmod +x</Kodelinje> hver gang du lager et nytt skript. Kataloger må derimot
              ha x for i det hele tatt å kunne brukes, så der er utgangspunktet 777.
            </>
          ),
        }),
        visual("um-4-kalk", "Regn ut selv", {
          ledetekst: <>Sett en umask og se hvilke rettigheter nye filer og kataloger får.</>,
          Viz: UmaskCalculator,
          hint: "Prøv 077. Hvem kan lese filene dine da? Prøv så 002, som brukes i delte prosjektkataloger.",
        }),
        kode("um-5-praksis", "Bruke den", {
          kode: `umask              # vis gjeldende, f.eks. 0022
umask 077          # bare jeg får tilgang til nye filer
umask 002          # gruppen kan skrive i nye filer`,
          punkter: [
            "Endringen gjelder bare i det skallet, og bare for filer laget etterpå.",
            <>
              Vil du ha den permanent, sett den i <Kodelinje>~/.bashrc</Kodelinje>.
            </>,
            "Eksisterende filer berøres aldri av en endret umask.",
          ],
        }),
        sjekk("um-6-sjekk", "Prøv selv", {
          sporsmal: (
            <>
              Med <Kodelinje>umask 027</Kodelinje> — hvilke rettigheter får en ny katalog?
            </>
          ),
          valg: [
            { tekst: "750", riktig: true, hvorfor: "777 minus 027: eier 7, gruppe 7−2=5, andre 7−7=0." },
            { tekst: "640", hvorfor: "Det ville vært 666 minus 026, og gjelder uansett filer, ikke kataloger." },
            { tekst: "755", hvorfor: "Det tilsvarer umask 022." },
          ],
          fasit: (
            <>
              750. Regn siffer for siffer med utgangspunkt 777: 7−0 = 7, 7−2 = 5, 7−7 = 0. Denne
              umasken er vanlig på tjenere der hjemmekatalogene ikke skal være synlige på tvers av
              brukere.
            </>
          ),
        }),
        recall("um-7-recall", [
          {
            forside: "Hva er utgangspunktet for filer og for kataloger før umask?",
            bakside: "666 for filer, 777 for kataloger. Kjørerett gis aldri automatisk til filer.",
          },
          {
            forside: "Hvilke rettigheter gir umask 022 til en ny fil?",
            bakside: "644 — rw-r--r--.",
          },
          {
            forside: "Påvirker en endret umask filer som allerede finnes?",
            bakside: "Nei. Den gjelder bare filer som lages etterpå, og bare i det skallet.",
          },
        ]),
        oppsummering("um-8-opp", {
          punkter: [
            "umask trekker fra; den legger aldri til.",
            "666 og 777 er utgangspunktene.",
            "022 gir 644 og 755 — tallene du ser overalt.",
          ],
          videre: "Neste: de tre bitene som ligger over de ni.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "spesialbits",
      tittel: "setuid, setgid og sticky",
      utbytte:
        "Du kan forklare hvorfor passwd må være setuid, og hva sticky-bitten beskytter mot i /tmp.",
      byggerPa: ["rwx-og-chmod"],
      skjermer: [
        intro("sb-1-intro", "Ni bit er ikke nok", {
          ingress: (
            <>
              Over de ni bitene ligger tre til. De brukes sjelden, men når de brukes er det for å
              løse et problem de ni ikke kan løse.
            </>
          ),
        }),
        anslag("sb-2-anslag", "Passordparadokset", {
          sporsmal: (
            <>
              <Kodelinje>/etc/shadow</Kodelinje> kan bare leses og skrives av root. Likevel kan du
              bytte ditt eget passord med <Kodelinje>passwd</Kodelinje>. Hvordan?
            </>
          ),
          valg: [
            { tekst: "passwd ber om root-passordet" },
            { tekst: "shadow er egentlig skrivbar for alle" },
            { tekst: "passwd-programmet kjører som root, ikke som deg" },
          ],
          fasit: (
            <>
              Programmet kjører som root. Filen <Kodelinje>/usr/bin/passwd</Kodelinje> har{" "}
              <Term>setuid</Term>-bitten satt, og eies av root. Når du starter den, får prosessen
              rootens UID i stedet for din. Programmet passer så nøye på å bare la deg endre din
              egen linje.
            </>
          ),
        }),
        konsept("sb-3-setuid", "setuid", {
          ingress: (
            <>
              Setuid-bitten betyr: kjør denne filen med filens eiers rettigheter, ikke med
              starterens.
            </>
          ),
          punkter: [
            <>
              Vises som <Kodelinje>s</Kodelinje> i stedet for <Kodelinje>x</Kodelinje> i
              eiertrioen: <Kodelinje>rwsr-xr-x</Kodelinje>.
            </>,
            <>
              Settes med <Kodelinje>chmod u+s</Kodelinje> eller ved å skrive et fjerde siffer:{" "}
              <Kodelinje>chmod 4755</Kodelinje>.
            </>,
            "Farlig: enhver feil i programmet blir en feil med root-rettigheter.",
            "Ignoreres helt på skript i Linux — bare kompilerte programmer.",
          ],
          merk: (
            <>
              Finn dem selv:{" "}
              <Kodelinje>find /usr/bin -perm -4000</Kodelinje>. Lista er kort med vilje.
            </>
          ),
        }),
        konsept("sb-4-setgid", "setgid", {
          ingress: <>Samme idé for gruppe — men på kataloger gjør den noe helt annet og nyttigere.</>,
          punkter: [
            "På en fil: kjør med filens gruppe.",
            "På en katalog: nye filer arver katalogens gruppe i stedet for skaperens primærgruppe.",
            "Det er nettopp det du vil ha i en delt prosjektkatalog.",
            <>
              Settes med <Kodelinje>chmod g+s katalog</Kodelinje> eller{" "}
              <Kodelinje>chmod 2775</Kodelinje>.
            </>,
          ],
        }),
        konsept("sb-5-sticky", "Sticky", {
          ingress: (
            <>
              Fra forrige undertema: skriverett på en katalog gir deg rett til å slette hva som
              helst der. I <Kodelinje>/tmp</Kodelinje> har alle skriverett. Det er et problem.
            </>
          ),
          punkter: [
            "Sticky-bitten begrenser sletting til den som eier filen, eller katalogen, eller root.",
            <>
              Vises som <Kodelinje>t</Kodelinje> til slutt: <Kodelinje>drwxrwxrwt</Kodelinje>.
            </>,
            <>
              Settes med <Kodelinje>chmod +t</Kodelinje> eller <Kodelinje>chmod 1777</Kodelinje>.
            </>,
            <>
              Sjekk selv: <Kodelinje>ls -ld /tmp</Kodelinje>.
            </>,
          ],
        }),
        visual("sb-6-kalk", "Fikle med alle tolv bitene", {
          ledetekst: <>Nå med det fjerde sifferet i tallformen.</>,
          Viz: SpesialbitsCalculator,
          hint: "Sett setuid uten kjørerett for eier. Se hva bokstaven blir da — stor S betyr «satt, men uten virkning».",
        }),
        konsept("sb-7-acl", "Når ni bit ikke strekker til", {
          ingress: (
            <>
              Modellen kan bare uttrykke én eier og én gruppe. Trenger du å gi akkurat én ekstra
              bruker lesetilgang, må du enten lage en ny gruppe — eller bruke{" "}
              <Term>ACL</Term> (access control list — tilgangsliste).
            </>
          ),
          punkter: [
            <>
              <Kodelinje>setfacl -m u:kari:r fil.txt</Kodelinje> gir kari lesetilgang.
            </>,
            <>
              <Kodelinje>getfacl fil.txt</Kodelinje> viser hele lista.
            </>,
            <>
              Filer med ACL vises med et pluss i <Kodelinje>ls -l</Kodelinje>:{" "}
              <Kodelinje>rw-r--r--+</Kodelinje>.
            </>,
            "Kraftig, men vanskeligere å revidere. De ni bitene er lettere å forstå ved et blikk.",
          ],
        }),
        sjekk("sb-8-sjekk", "Hvilken bit?", {
          sporsmal: (
            <>
              I en delt prosjektkatalog skal alle nye filer automatisk tilhøre gruppen{" "}
              <Kodelinje>prosjekt</Kodelinje>, uansett hvem som lager dem. Hva setter du?
            </>
          ),
          valg: [
            { tekst: "setuid på katalogen", hvorfor: "setuid har ingen effekt på kataloger i Linux." },
            { tekst: "setgid på katalogen", riktig: true, hvorfor: "Nye filer arver da katalogens gruppe." },
            { tekst: "sticky på katalogen", hvorfor: "Sticky begrenser sletting, den styrer ikke gruppeeierskap." },
          ],
          fasit: (
            <>
              setgid. Fullt oppsett:{" "}
              <Kodelinje>chgrp prosjekt katalog && chmod 2775 katalog</Kodelinje>. Ofte kombineres
              det med <Kodelinje>umask 002</Kodelinje> så gruppen også får skriverett i de nye
              filene.
            </>
          ),
        }),
        recall("sb-9-recall", [
          {
            forside: "Hvorfor må /usr/bin/passwd være setuid root?",
            bakside: "Fordi den må skrive i /etc/shadow, som bare root har tilgang til.",
          },
          {
            forside: "Hva gjør setgid på en katalog?",
            bakside: "Nye filer arver katalogens gruppe i stedet for skaperens primærgruppe.",
          },
          {
            forside: "Hva beskytter sticky-bitten mot i /tmp?",
            bakside: "At en bruker med skriverett i katalogen sletter andres filer. Bare eieren, katalogeieren eller root kan slette.",
          },
        ]),
        oppsummering("sb-10-opp", {
          punkter: [
            "setuid gir filens eiers rettigheter til den som kjører.",
            "setgid på katalog gir arvet gruppe — grunnlaget for delte prosjektkataloger.",
            "sticky begrenser sletting til eieren.",
          ],
          videre: "Neste emne: å sette alt sammen i et skript.",
        }),
      ],
    },
  ],
};
