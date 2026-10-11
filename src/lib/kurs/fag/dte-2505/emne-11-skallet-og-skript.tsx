// Emne 11 — Skallet og skallprogrammering.
// Pensum: Canvas modul 4 (skallet) og modul 5 (skallprogram), pluss drift.
// Bygger direkte på fork/exec (emne 3) og filbeskrivere (emne 7).

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
import { BashSandbox } from "@/components/stack/dte2505-bash-scripts/BashSandbox";
import { ShellDrill } from "@/components/dte2505/ShellDrill";

export const emneSkalletOgSkript: Emne = {
  slug: "skallet-og-skript",
  tittel: "Skallet og skallprogrammering",
  sporsmal: "Hva gjør skallet mellom Enter og at kommandoen kjører, og hvordan automatiserer du det?",
  pensum: "Canvas modul 4 og 5",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "skallet-er-en-prosess",
      tittel: "Skallet er bare et program",
      utbytte:
        "Du kan beskrive skallets løkke i systemkall, og forklare hvorfor cd ikke kan være et eget program.",
      byggerPa: ["fork-exec-wait"],
      skjermer: [
        intro("sp-1-intro", "Ingen magi", {
          ingress: (
            <>
              Skallet er ikke en del av operativsystemet. Det er et vanlig brukerprogram, som kjører
              med dine rettigheter, og som du kan bytte ut når du vil.
            </>
          ),
        }),
        konsept("sp-2-lokke", "Løkken", {
          ingress: <>Fire steg, om og om igjen, til du skriver exit.</>,
          punkter: [
            "Les en linje fra brukeren.",
            "Tolk den: del i ord, utvid variabler og jokertegn, finn ut hva som skal kjøres.",
            "fork, og i barnet: sett opp omdirigering, deretter exec.",
            "I forelderen: wait til barnet er ferdig, og skriv ledeteksten igjen.",
          ],
          merk: (
            <>
              Alt du lærte om fork, exec og wait i emnet om prosesser var egentlig en beskrivelse av
              hvordan skallet virker.
            </>
          ),
        }),
        anslag("sp-3-anslag", "Hvorfor kan ikke cd være et program?", {
          sporsmal: (
            <>
              De fleste kommandoer er egne programmer. Hvorfor kan ikke{" "}
              <Kodelinje>cd</Kodelinje> være det?
            </>
          ),
          valg: [
            { tekst: "Fordi det ville vært for tregt" },
            { tekst: "Fordi arbeidskatalogen tilhører prosessen, og barnet dør etterpå" },
            { tekst: "Fordi cd trenger root-rettigheter" },
          ],
          fasit: (
            <>
              Fordi arbeidskatalogen er en egenskap ved prosessen. Var cd et eget program, ville
              skallet forket, barnet byttet katalog, og så dødd — og skallet selv ville stått
              nøyaktig der det sto. Derfor må cd være innebygd i skallet.
            </>
          ),
        }),
        konsept("sp-4-innebygd", "Innebygde kommandoer", {
          ingress: <>Alt som må endre skallets egen tilstand må være innebygd.</>,
          punkter: [
            <>
              <Kodelinje>cd</Kodelinje>, <Kodelinje>export</Kodelinje>, <Kodelinje>umask</Kodelinje>,{" "}
              <Kodelinje>exit</Kodelinje>, <Kodelinje>source</Kodelinje>.
            </>,
            <>
              <Kodelinje>type kommando</Kodelinje> forteller deg hva noe er.
            </>,
            <>
              Noen finnes begge steder: <Kodelinje>echo</Kodelinje> er både innebygd og en fil i{" "}
              <Kodelinje>/bin</Kodelinje>. Den innebygde vinner.
            </>,
          ],
        }),
        konsept("sp-5-path", "Hvordan skallet finner programmet", {
          ingress: (
            <>
              Skriver du <Kodelinje>ls</Kodelinje>, leter skallet gjennom katalogene i{" "}
              <Term>PATH</Term>, i rekkefølge, og bruker det første treffet.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>echo $PATH</Kodelinje> viser lista, adskilt med kolon.
            </>,
            <>
              Inneholder navnet en skråstrek, brukes stien direkte — ingen søking. Derfor{" "}
              <Kodelinje>./skript.sh</Kodelinje>.
            </>,
            <>
              Arbeidskatalogen er bevisst <em>ikke</em> i PATH: ellers kunne en fil kalt{" "}
              <Kodelinje>ls</Kodelinje> i en nedlastet mappe kjørt i stedet for den ekte.
            </>,
            <>
              <Kodelinje>which ls</Kodelinje> viser hvilket treff som vinner.
            </>,
          ],
        }),
        kode("sp-6-strace", "Se det skje", {
          ingress: <>Systemkallene bak én enkelt kommando.</>,
          kode: `strace -f -e trace=clone,execve,wait4 bash -c 'ls'

# clone(...)         <- fork
# execve("/usr/bin/ls", ...)
# wait4(...)         <- forelderen venter`,
          punkter: [
            <>
              <Kodelinje>-f</Kodelinje> følger med inn i barneprosessene.
            </>,
            <>
              <Kodelinje>clone</Kodelinje> er Linux' generelle variant av fork.
            </>,
          ],
        }),
        sjekk("sp-7-sjekk", "Hvorfor virker ikke skriptet?", {
          sporsmal: (
            <>
              Du skriver <Kodelinje>./oppsett.sh</Kodelinje> og får «Permission denied». Filen finnes
              og du eier den. Hva mangler?
            </>
          ),
          valg: [
            { tekst: "Lesetilgang", hvorfor: "Da hadde du fått en annen feil, og du eier jo filen." },
            { tekst: "Kjørerett — chmod +x", riktig: true, hvorfor: "Nye filer får aldri x automatisk, på grunn av umask-regelen." },
            { tekst: "sudo", hvorfor: "Du eier filen; root-rettigheter trengs ikke." },
          ],
          fasit: (
            <>
              <Kodelinje>chmod +x oppsett.sh</Kodelinje>. Utgangspunktet for nye filer er 666, uten
              kjørerett — nettopp for at kjørerett alltid skal være en bevisst handling. Alternativt
              kan du kjøre <Kodelinje>bash oppsett.sh</Kodelinje>, som ikke krever x i det hele tatt.
            </>
          ),
        }),
        recall("sp-8-recall", [
          {
            forside: "Hvilke fire steg går skallet gjennom per kommando?",
            bakside: "Les linjen, tolk og utvid, fork og exec i barnet, wait i forelderen.",
          },
          {
            forside: "Hvorfor må cd være innebygd i skallet?",
            bakside: "Arbeidskatalogen tilhører prosessen. Et barn som byttet katalog ville dødd uten å påvirke skallet.",
          },
          {
            forside: "Hvorfor må du skrive ./skript.sh og ikke bare skript.sh?",
            bakside: "Fordi arbeidskatalogen ikke er i PATH, av sikkerhetsgrunner. Skråstreken gir en eksplisitt sti.",
          },
        ]),
        oppsummering("sp-9-opp", {
          punkter: [
            "Skallet er et vanlig program med en fork-exec-wait-løkke.",
            "Innebygde kommandoer er de som må endre skallets egen tilstand.",
            "PATH avgjør hvilket program som vinner.",
          ],
          videre: "Neste: å koble programmer sammen.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "omdirigering-og-ror",
      tittel: "Omdirigering og rør i praksis",
      utbytte:
        "Du kan omdirigere hver strøm for seg, og bygge rørkjeder som løser reelle oppgaver.",
      byggerPa: ["skallet-er-en-prosess", "filbeskrivere-og-ror"],
      skjermer: [
        intro("or-1-intro", "Tre strømmer", {
          ingress: (
            <>
              Hvert program starter med tre åpne filbeskrivere. Skallet kan peke hver av dem hvor som
              helst, uten at programmet vet noe om det.
            </>
          ),
        }),
        kode("or-2-grunn", "Lær først: grunnformene", {
          kode: `kommando > fil        # stdout til fil, overskriv
kommando >> fil       # stdout til fil, legg til
kommando < fil        # stdin fra fil
kommando 2> feil.txt  # stderr til fil
kommando > alt 2>&1   # begge til samme fil
kommando 2>/dev/null  # kast feilmeldingene`,
          punkter: [
            "Tallet foran > er filbeskrivernummeret. Uten tall menes 1.",
            <>
              <Kodelinje>2{">"}&1</Kodelinje> betyr «la 2 peke der 1 peker nå».
            </>,
          ],
        }),
        anslag("or-3-anslag", "Rekkefølgen betyr alt", {
          sporsmal: (
            <>
              Hva er forskjellen på <Kodelinje>cmd {">"} fil 2{">"}&1</Kodelinje> og{" "}
              <Kodelinje>cmd 2{">"}&1 {">"} fil</Kodelinje>?
            </>
          ),
          valg: [
            { tekst: "Ingen — de gjør det samme" },
            { tekst: "Den andre sender feilmeldingene til terminalen, ikke til filen" },
          ],
          fasit: (
            <>
              De er forskjellige. Skallet leser fra venstre. I den andre varianten kopieres 1 sin
              nåværende plassering (terminalen) til 2, og <em>deretter</em> flyttes 1 til filen. Da
              havner feilmeldingene fortsatt på skjermen. Dette er den vanligste feilen i hele
              omdirigeringsverdenen.
            </>
          ),
        }),
        konsept("or-4-ror", "Rørkjeder", {
          ingress: (
            <>
              Røret kobler standard ut i det ene programmet til standard inn i det neste. Kjeden kan
              være så lang du vil.
            </>
          ),
          punkter: [
            "Alle leddene starter samtidig og kjører parallelt.",
            "Data flyter etter hvert, ikke i én bolk til slutt.",
            <>
              Vil du både se og lagre, bruk <Kodelinje>tee</Kodelinje>.
            </>,
            <>
              Feilmeldinger går <em>ikke</em> gjennom røret som standard — de går rett til
              terminalen.
            </>,
          ],
        }),
        kode("or-5-eksempel", "En kjede som løser noe ekte", {
          ingress: <>De ti IP-adressene med flest treff i en webtjenerlogg.</>,
          kode: `cat tilgang.log | awk '{print $1}' | sort | uniq -c \\
  | sort -rn | head -10`,
          punkter: [
            <>
              <Kodelinje>awk</Kodelinje> plukker første kolonne, altså IP-adressen.
            </>,
            <>
              <Kodelinje>uniq -c</Kodelinje> krever sortert inndata — derfor{" "}
              <Kodelinje>sort</Kodelinje> først.
            </>,
            <>
              <Kodelinje>sort -rn</Kodelinje> sorterer numerisk og synkende.
            </>,
          ],
          merk: (
            <>
              Ingen av programmene vet om hverandre. Det er hele Unix-filosofien: små verktøy som
              gjør én ting, koblet sammen med en tekststrøm.
            </>
          ),
        }),
        tallanslag("or-6-tall", "Prøv selv", {
          sporsmal: (
            <>
              Hvor mange prosesser starter <Kodelinje>cat a | grep b | wc -l</Kodelinje>, medregnet
              skallet selv?
            </>
          ),
          enhet: "prosesser",
          fasitTall: 4,
          fasit: (
            <>
              Fire: skallet pluss tre barn. Alle tre barna kjører samtidig, koblet sammen av to rør.
              Merk at det er <em>skallet</em> som lager rørene og kobler filbeskriverne — programmene
              selv aner ingenting.
            </>
          ),
        }),
        sjekk("or-7-sjekk", "Hvor ble feilmeldingene av?", {
          sporsmal: (
            <>
              <Kodelinje>find / -name "*.conf" | grep nginx</Kodelinje> fyller skjermen med
              «Permission denied». Hvordan blir du kvitt dem?
            </>
          ),
          valg: [
            { tekst: "find / -name \"*.conf\" 2>/dev/null | grep nginx", riktig: true, hvorfor: "Feilmeldingene kastes før røret." },
            { tekst: "find / -name \"*.conf\" | grep nginx 2>/dev/null", hvorfor: "Det kaster greps feilmeldinger, ikke finds." },
            { tekst: "sudo find / -name \"*.conf\" | grep nginx", hvorfor: "Virker, men gir deg root-rettigheter du ikke trengte." },
          ],
          fasit: (
            <>
              Omdirigeringen må stå på det leddet som produserer feilen. Røret tar bare med standard
              ut — derfor renner feilmeldingene rett forbi røret og ut på skjermen.
            </>
          ),
        }),
        recall("or-8-recall", [
          {
            forside: "Hva betyr 2>&1, og hvorfor er plasseringen viktig?",
            bakside: "La filbeskriver 2 peke dit 1 peker akkurat nå. Skallet leser fra venstre, så rekkefølgen avgjør resultatet.",
          },
          {
            forside: "Går feilmeldinger gjennom et rør?",
            bakside: "Nei. Bare standard ut. Feilmeldinger går direkte til terminalen med mindre du omdirigerer dem.",
          },
          {
            forside: "Kjører leddene i en rørkjede etter hverandre eller samtidig?",
            bakside: "Samtidig. Alle starter med én gang, og data flyter gjennom etter hvert.",
          },
        ]),
        oppsummering("or-9-opp", {
          punkter: [
            "Tre strømmer, som kan pekes hver for seg.",
            "Rekkefølgen på omdirigeringer avgjør resultatet.",
            "Rørkjeder kjører parallelt og kobler små verktøy sammen.",
          ],
          videre: "Neste: å huske ting mellom kommandoene.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "variabler-og-exitkoder",
      tittel: "Variabler, hermetegn og exitkoder",
      utbytte:
        "Du kan bruke variabler uten mellomromsfeller, og reagere riktig på om en kommando lyktes.",
      byggerPa: ["skallet-er-en-prosess"],
      skjermer: [
        intro("ve-1-intro", "Alt er tekst", {
          ingress: (
            <>
              Skallet har i praksis én datatype: tekst. Det gjør det enkelt å komme i gang, og det
              er kilden til nesten alle feller.
            </>
          ),
        }),
        kode("ve-2-variabler", "Variabler", {
          kode: `navn=Isak            # INGEN mellomrom rundt =
echo "$navn"         # bruk alltid hermetegn
tid=$(date +%H:%M)   # fang utdata fra en kommando
export STI=/opt/app  # gjør den synlig for barneprosesser`,
          punkter: [
            <>
              <Kodelinje>navn = Isak</Kodelinje> med mellomrom prøver å kjøre et program som heter
              «navn».
            </>,
            <>
              Uten <Kodelinje>export</Kodelinje> ser barneprosesser ikke variabelen.
            </>,
          ],
        }),
        anslag("ve-3-anslag", "Hvorfor hermetegn?", {
          sporsmal: (
            <>
              <Kodelinje>fil="min rapport.txt"</Kodelinje> og så <Kodelinje>rm $fil</Kodelinje> uten
              hermetegn. Hva skjer?
            </>
          ),
          valg: [
            { tekst: "Filen slettes som forventet" },
            { tekst: "rm prøver å slette to filer: «min» og «rapport.txt»" },
            { tekst: "Feilmelding om ugyldig variabel" },
          ],
          fasit: (
            <>
              To filer. Skallet utvider variabelen først, og deler så resultatet på mellomrom. Med{" "}
              <Kodelinje>rm "$fil"</Kodelinje> blir hele teksten ett argument. Regelen er enkel: sett
              alltid hermetegn rundt variabler, med mindre du har en konkret grunn til å la være.
            </>
          ),
        }),
        konsept("ve-4-hermetegn", "Tre slags hermetegn", {
          ingress: <>De gjør tre helt forskjellige ting.</>,
          punkter: [
            <>
              Doble <Kodelinje>"..."</Kodelinje> — variabler og <Kodelinje>$( )</Kodelinje> utvides,
              men mellomrom bevares.
            </>,
            <>
              Enkle <Kodelinje>'...'</Kodelinje> — ingenting utvides. Teksten er akkurat som skrevet.
            </>,
            <>
              <Kodelinje>$(kommando)</Kodelinje> — kjør kommandoen og sett inn utdataen.
            </>,
          ],
        }),
        konsept("ve-5-exit", "Exitkoden", {
          ingress: (
            <>
              Hver prosess returnerer et tall mellom 0 og 255 når den avslutter. Skallet legger det i{" "}
              <Kodelinje>$?</Kodelinje>.
            </>
          ),
          punkter: [
            "0 betyr suksess. Alt annet betyr en form for feil.",
            "Det er motsatt av sant/usant i de fleste programmeringsspråk — vær obs.",
            <>
              <Kodelinje>&&</Kodelinje> kjører neste kommando bare hvis forrige ga 0.
            </>,
            <>
              <Kodelinje>||</Kodelinje> kjører neste bare hvis forrige feilet.
            </>,
          ],
          merk: (
            <>
              Avbrutt av et signal gir 128 pluss signalnummeret. Ctrl-C gir derfor 130, siden SIGINT
              er 2.
            </>
          ),
        }),
        kode("ve-6-bruk", "Bruk exitkoden", {
          kode: `mkdir -p /opt/app && cd /opt/app && ./oppsett.sh

grep -q "feil" logg.txt && echo "fant feil"

cp viktig.txt kopi.txt || echo "kopiering feilet" >&2

exit 1    # avslutt eget skript med feilkode`,
          punkter: [
            <>
              <Kodelinje>grep -q</Kodelinje> skriver ingenting, men setter exitkoden. Perfekt til
              tester.
            </>,
            <>
              <Kodelinje>{">"}&2</Kodelinje> sender meldingen til standard feil, der den hører hjemme.
            </>,
          ],
        }),
        sjekk("ve-7-sjekk", "Hva blir exitkoden?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>[ -f /etc/passwd ]; echo $?</Kodelinje>. Hva skrives ut?
            </>
          ),
          valg: [
            { tekst: "1, fordi testen er sann", hvorfor: "Sant gir 0 i skallet, ikke 1." },
            { tekst: "0, fordi filen finnes", riktig: true, hvorfor: "Testen lyktes, og suksess er alltid 0." },
            { tekst: "true", hvorfor: "$? er alltid et tall." },
          ],
          fasit: (
            <>
              0. Vennes med den vrangvendte logikken: i skallet er 0 suksess og sant, mens alt annet
              er feil. Det henger sammen med at det bare finnes én måte å lykkes på, men mange måter
              å feile på — og hver av dem kan ha sitt eget tall.
            </>
          ),
        }),
        recall("ve-8-recall", [
          {
            forside: "Hvorfor må du skrive navn=verdi uten mellomrom?",
            bakside: "Med mellomrom tolker skallet «navn» som en kommando og resten som argumenter.",
          },
          {
            forside: "Hva er forskjellen på enkle og doble hermetegn?",
            bakside: "Doble utvider variabler og kommandosubstitusjon. Enkle utvider ingenting.",
          },
          {
            forside: "Hva betyr exitkode 130?",
            bakside: "Avbrutt av SIGINT: 128 pluss signalnummer 2, altså Ctrl-C.",
          },
        ]),
        oppsummering("ve-9-opp", {
          punkter: [
            "Hermetegn rundt variabler, alltid.",
            "0 er suksess; alt annet er feil.",
            "&& og || bygger på exitkoden.",
          ],
          videre: "Neste: å sette det sammen til et skript.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kontrollflyt-og-skript",
      tittel: "Kontrollflyt og skript",
      utbytte:
        "Du kan skrive et skript med tester, løkker og argumenthåndtering, og få det til å feile på en nyttig måte.",
      byggerPa: ["variabler-og-exitkoder"],
      skjermer: [
        intro("kf-1-intro", "Fra kommandolinje til fil", {
          ingress: (
            <>
              Et skript er ikke annet enn kommandoene du allerede kan, lagret i en fil. Alt du
              skriver i terminalen virker i et skript, og motsatt.
            </>
          ),
        }),
        kode("kf-2-skjelett", "Lær først: skjelettet", {
          ingress: <>Fire linjer som bør stå i toppen av alle skript du skriver.</>,
          filnavn: "sikkerhetskopi.sh",
          kode: `#!/usr/bin/env bash
set -euo pipefail

kilde="\${1:?bruk: $0 <kilde> <mal>}"
mal="\${2:?mangler mal}"`,
          punkter: [
            <>
              Første linje er <Term>shebang</Term>: hvilket program skal tolke denne filen.
            </>,
            <>
              <Kodelinje>-e</Kodelinje> avslutt ved første feil, <Kodelinje>-u</Kodelinje> feil ved
              ubrukte variabler, <Kodelinje>-o pipefail</Kodelinje> fang feil midt i en rørkjede.
            </>,
            <>
              <Kodelinje>{"${1:?melding}"}</Kodelinje> gir en forståelig feil hvis argumentet mangler.
            </>,
          ],
        }),
        konsept("kf-3-tester", "Tester", {
          ingress: (
            <>
              <Kodelinje>[ ... ]</Kodelinje> er faktisk en kommando, ikke syntaks. Derfor må det
              være mellomrom rundt alt.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>-f</Kodelinje> filen finnes, <Kodelinje>-d</Kodelinje> katalogen finnes,{" "}
              <Kodelinje>-z</Kodelinje> teksten er tom.
            </>,
            <>
              <Kodelinje>=</Kodelinje> for tekst, <Kodelinje>-eq</Kodelinje> og{" "}
              <Kodelinje>-lt</Kodelinje> for tall.
            </>,
            <>
              I bash er <Kodelinje>[[ ... ]]</Kodelinje> tryggere: den deler ikke tekst på mellomrom.
            </>,
          ],
        }),
        kode("kf-4-flyt", "if, for og while", {
          kode: `if [[ -d "$mal" ]]; then
    echo "finnes"
elif [[ -f "$mal" ]]; then
    echo "det er en fil, ikke en katalog" >&2
    exit 1
else
    mkdir -p "$mal"
fi

for f in "$kilde"/*.txt; do
    cp "$f" "$mal/"
done

while read -r linje; do
    echo "> $linje"
done < liste.txt`,
          punkter: [
            <>
              Løkken over <Kodelinje>*.txt</Kodelinje> håndterer filnavn med mellomrom riktig, fordi
              variabelen er i hermetegn.
            </>,
            <>
              <Kodelinje>read -r</Kodelinje> hindrer at bakoverskråstreker tolkes.
            </>,
          ],
        }),
        anslag("kf-5-anslag", "Hva om katalogen er tom?", {
          sporsmal: (
            <>
              <Kodelinje>for f in *.txt</Kodelinje> i en katalog uten noen .txt-filer. Hva blir{" "}
              <Kodelinje>$f</Kodelinje> i første runde?
            </>
          ),
          valg: [
            { tekst: "Løkken kjøres ikke i det hele tatt" },
            { tekst: "Bokstavelig talt teksten «*.txt»" },
          ],
          fasit: (
            <>
              Teksten <Kodelinje>*.txt</Kodelinje>. Finner ikke skallet noe treff, lar det mønsteret
              stå uendret — og løkken kjører én runde med en fil som ikke finnes. Løsningen er{" "}
              <Kodelinje>shopt -s nullglob</Kodelinje>, eller en test på om filen finnes inni løkken.
              Dette er en fest av en feil å feilsøke.
            </>
          ),
        }),
        visual("kf-6-sandkasse", "Prøv selv i sandkassen", {
          ledetekst: <>Skriv og kjør skript uten å røre din egen maskin.</>,
          Viz: BashSandbox,
          hint: "Skriv et skript som teller filer i en katalog og skriver ut en feilkode hvis den er tom.",
          hoyde: "max-h-[440px]",
        }),
        konsept("kf-7-vaner", "Vaner som sparer deg", {
          ingress: <>Fire regler som fjerner de fleste skriptfeil.</>,
          punkter: [
            "Hermetegn rundt alle variabler.",
            <>
              <Kodelinje>set -euo pipefail</Kodelinje> øverst.
            </>,
            "Test destruktive kommandoer med echo foran først.",
            <>
              Kjør <Kodelinje>shellcheck</Kodelinje> på skriptet — den finner det du overså.
            </>,
          ],
        }),
        sjekk("kf-8-sjekk", "Hvorfor feiler den ikke?", {
          sporsmal: (
            <>
              Et skript kjører <Kodelinje>cat mangler.txt | wc -l</Kodelinje> med{" "}
              <Kodelinje>set -e</Kodelinje> aktivt. Skriptet fortsetter likevel. Hvorfor?
            </>
          ),
          valg: [
            { tekst: "set -e virker ikke i skript", hvorfor: "Den virker — men ikke her." },
            { tekst: "Exitkoden fra en rørkjede er den fra siste ledd, og wc lyktes", riktig: true, hvorfor: "cat feilet, men wc returnerte 0." },
            { tekst: "cat feiler ikke på manglende filer", hvorfor: "cat returnerer 1 og skriver til standard feil." },
          ],
          fasit: (
            <>
              Rørkjedens exitkode er siste ledds. <Kodelinje>wc</Kodelinje> fikk tom inndata, telte
              null linjer, og lyktes. Det er nettopp derfor{" "}
              <Kodelinje>set -o pipefail</Kodelinje> finnes: med den arver kjeden feilkoden fra det
              første leddet som feilet.
            </>
          ),
        }),
        recall("kf-9-recall", [
          {
            forside: "Hva gjør set -euo pipefail?",
            bakside: "Avslutt ved feil, feil ved ubrukte variabler, og la en rørkjede feile hvis et hvilket som helst ledd feiler.",
          },
          {
            forside: "Hva skjer med *.txt når ingen filer matcher?",
            bakside: "Mønsteret står uendret og brukes som filnavn. Fikses med shopt -s nullglob.",
          },
          {
            forside: "Hvorfor må det være mellomrom inni [ ... ]?",
            bakside: "Fordi [ er en kommando og innholdet er argumentene den får.",
          },
        ]),
        oppsummering("kf-10-opp", {
          punkter: [
            "Shebang, set -euo pipefail, og argumentsjekk øverst.",
            "[ er en kommando; mellomrom er obligatoriske.",
            "Tomme jokertegn og rørkjeders exitkode er de to klassiske fellene.",
          ],
          videre: "Neste: å drille kommandoene til de sitter.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "drift-og-drill",
      tittel: "Tjenester, planlagte jobber og drill",
      utbytte:
        "Du kan sette opp en tjeneste og en planlagt jobb, lese loggen, og løse kommandooppgaver uten fasit.",
      byggerPa: ["kontrollflyt-og-skript", "signaler"],
      skjermer: [
        intro("dd-1-intro", "Skript som kjører uten deg", {
          ingress: (
            <>
              Et skript du må starte selv er halvferdig. Det siste steget er å la systemet starte
              det: ved oppstart, på et klokkeslett, eller når noe krasjer.
            </>
          ),
        }),
        konsept("dd-2-systemd", "systemd er prosess 1", {
          ingress: (
            <>
              Den første prosessen kjernen starter er <Term>systemd</Term>. Den starter alt annet, og
              starter det på nytt når det dør.
            </>
          ),
          punkter: [
            <>
              En <Term>unit</Term> er en fil som beskriver hva som skal kjøre og under hvilke
              betingelser.
            </>,
            <>
              <Kodelinje>systemctl status navn</Kodelinje> — kjører den, og hva sa den sist?
            </>,
            <>
              <Kodelinje>systemctl enable --now navn</Kodelinje> — start nå og ved hver oppstart.
            </>,
            <>
              Endrer du en unit-fil, må du kjøre <Kodelinje>systemctl daemon-reload</Kodelinje>.
            </>,
          ],
        }),
        kode("dd-3-unit", "Lær først: en minimal tjeneste", {
          filnavn: "/etc/systemd/system/min-app.service",
          kode: `[Unit]
Description=Min app
After=network.target

[Service]
ExecStart=/opt/app/kjor.sh
Restart=on-failure
User=appbruker

[Install]
WantedBy=multi-user.target`,
          punkter: [
            <>
              <Kodelinje>Restart=on-failure</Kodelinje> starter på nytt ved feilkode, men ikke ved
              ren avslutning.
            </>,
            <>
              <Kodelinje>User=</Kodelinje> gjør at tjenesten ikke kjører som root. Gjør det alltid.
            </>,
            <>
              <Kodelinje>After=</Kodelinje> er rekkefølge, ikke avhengighet.
            </>,
          ],
        }),
        anslag("dd-4-anslag", "Hvor havner utskriften?", {
          sporsmal: (
            <>
              Skriptet ditt gjør <Kodelinje>echo "startet"</Kodelinje>. Kjørt som en systemd-tjeneste
              — hvor havner teksten?
            </>
          ),
          valg: [
            { tekst: "Ingen steder — det finnes ingen terminal" },
            { tekst: "I systemjournalen, lesbar med journalctl" },
            { tekst: "I en fil i /var/log som du må lage selv" },
          ],
          fasit: (
            <>
              I journalen. systemd kobler tjenestens standard ut og standard feil til{" "}
              <Kodelinje>journald</Kodelinje>. Les den med{" "}
              <Kodelinje>journalctl -u min-app -f</Kodelinje>. Dette er direkte anvendelse av
              filbeskrivere: systemd peker fd 1 og 2 til journalen før exec.
            </>
          ),
        }),
        konsept("dd-5-planlagt", "Planlagte jobber", {
          ingress: <>To måter å kjøre noe på et tidspunkt.</>,
          punkter: [
            <>
              <Kodelinje>crontab -e</Kodelinje> — den klassiske. Fem felter: minutt, time, dag,
              måned, ukedag.
            </>,
            <>
              <Kodelinje>0 3 * * *</Kodelinje> betyr klokka 03:00 hver dag.
            </>,
            "systemd-timere er nyere: de logger til journalen og kan ta igjen en jobb maskinen sov gjennom.",
            "Cron kjører med et minimalt miljø — bruk alltid full sti til programmene.",
          ],
          merk: (
            <>
              Den vanligste cron-feilen: skriptet virker i terminalen, men ikke fra cron, fordi PATH
              er nesten tom der.
            </>
          ),
        }),
        kode("dd-6-logg", "Lese logger", {
          kode: `journalctl -u min-app -f         # følg live
journalctl -u min-app --since "1 hour ago"
journalctl -p err -b             # bare feil, denne oppstarten
systemctl status min-app         # sammendrag + siste linjer`,
          punkter: [
            <>
              <Kodelinje>-b</Kodelinje> begrenser til gjeldende oppstart.
            </>,
            <>
              Journalen er binær, så <Kodelinje>grep</Kodelinje> direkte på filene virker ikke.
            </>,
          ],
        }),
        visual("dd-7-drill", "Prøv selv: kommandodrill", {
          ledetekst: <>Nå uten fasit. Du får målet, du finner kommandoen.</>,
          Viz: ShellDrill,
          hint: "Står du fast, tenk på hvilket hjelpesystem som ville svart raskest: --help, man eller apropos.",
          hoyde: "max-h-[440px]",
        }),
        sjekk("dd-8-sjekk", "Hvorfor virker den ikke fra cron?", {
          sporsmal: (
            <>
              Skriptet ditt kjører fint i terminalen, men gjør ingenting fra cron. Hva sjekker du
              først?
            </>
          ),
          valg: [
            { tekst: "Om filen har kjørerett", hvorfor: "Verdt å sjekke, men da ville du sett en feil i loggen." },
            { tekst: "Om skriptet bruker programmer som ikke finnes i crons minimale PATH", riktig: true, hvorfor: "Cron kjører med et nesten tomt miljø." },
            { tekst: "Om maskinen var på", hvorfor: "Mulig, men ikke den vanlige årsaken." },
          ],
          fasit: (
            <>
              Miljøet. Cron gir deg verken din PATH, dine variabler eller din arbeidskatalog. Bruk
              full sti til alt, sett variablene eksplisitt i skriptet, og omdiriger utdata til en fil
              slik at du faktisk får se hva som gikk galt.
            </>
          ),
        }),
        recall("dd-9-recall", [
          {
            forside: "Hva må du gjøre etter å ha endret en systemd unit-fil?",
            bakside: "systemctl daemon-reload, deretter restart av tjenesten.",
          },
          {
            forside: "Hvor havner et skripts utskrift når det kjører som systemd-tjeneste?",
            bakside: "I systemjournalen. Les med journalctl -u navn.",
          },
          {
            forside: "Hvorfor feiler skript ofte fra cron, men ikke i terminalen?",
            bakside: "Cron kjører med et minimalt miljø: nesten tom PATH, ingen av dine variabler, og en annen arbeidskatalog.",
          },
        ]),
        oppsummering("dd-10-opp", {
          punkter: [
            "systemd starter, overvåker og logger tjenestene.",
            "Planlagte jobber trenger full sti og eksplisitt miljø.",
            "journalctl er første stopp når noe ikke virker.",
          ],
          videre: "Siste emne: å kjøre hele operativsystemer inni operativsystemet.",
        }),
      ],
    },
  ],
};
