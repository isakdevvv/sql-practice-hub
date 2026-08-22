// Emne 8 — Filsystemet.
// Pensum: Canvas modul 4 «Filsystem og skallet». Dette var et av de tre kjente
// hullene i fagdekningen. Bygger på filbeskrivere (emne 7).

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
import { InodeDiagram } from "@/components/stack/dte2505-filsystem/InodeDiagram";
import { PathResolution } from "@/components/stack/dte2505-filsystem/PathResolution";
import { LinkTypes } from "@/components/stack/dte2505-filsystem/LinkTypes";
import { FreeBlockBitmap } from "@/components/stack/dte2505-filsystem/FreeBlockBitmap";
import { JournalingAnimator } from "@/components/stack/dte2505-filsystem/JournalingAnimator";
import { InodeStructure } from "@/components/stack/dte2505-virtuelt-minne/InodeStructure";

export const emneFilsystem: Emne = {
  slug: "filsystem",
  tittel: "Filsystemet",
  sporsmal: "Hva skjer egentlig når du lagrer en fil, og hvor blir navnet av?",
  pensum: "Canvas modul 4 — Filsystem og skallet",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "filer-og-inoder",
      tittel: "Inoden: filen uten navn",
      utbytte:
        "Du kan forklare hva en inode inneholder, og hvorfor filnavnet ikke er en del av filen.",
      byggerPa: ["filbeskrivere-og-ror"],
      skjermer: [
        intro("fi-1-intro", "Navnet ligger ikke i filen", {
          ingress: (
            <>
              Dette er den ene innsikten som gjør resten av emnet enkelt: en fil i Linux har ikke
              noe navn. Navnet finnes bare i katalogen som peker på den.
            </>
          ),
        }),
        anslag("fi-2-anslag", "Hvor er navnet?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>mv gammel.txt ny.txt</Kodelinje> på en fil på 4 GiB. Hvor lang
              tid tar det?
            </>
          ),
          valg: [
            { tekst: "Flere sekunder — 4 GiB må skrives på nytt" },
            { tekst: "Umerkelig kort tid" },
            { tekst: "Avhenger av om disken er SSD eller HDD" },
          ],
          fasit: (
            <>
              Umerkelig. Ingen data flyttes. Kommandoen endrer bare én oppføring i én katalog:
              teksten «gammel.txt» byttes med «ny.txt», og den peker fortsatt på samme
              inode-nummer. Det er derfor <Kodelinje>mv</Kodelinje> innen samme filsystem er
              øyeblikkelig, mens mellom to filsystemer må alt kopieres.
            </>
          ),
        }),
        konsept("fi-3-inode", "Hva inoden inneholder", {
          ingress: (
            <>
              <Term>Inoden</Term> er filens datablad. Alt om filen — bortsett fra navnet og
              innholdet.
            </>
          ),
          punkter: [
            "Type (vanlig fil, katalog, symbolsk lenke, enhet) og rettighetsbitene.",
            "Eier-UID og gruppe-GID.",
            "Størrelse og tre tidsstempler.",
            "Lenketeller, og pekere til datablokkene.",
          ],
          merk: (
            <>
              Ingen av feltene er filnavnet. Slå det opp med <Kodelinje>stat fil.txt</Kodelinje> og
              se selv.
            </>
          ),
        }),
        konsept("fi-4-pekere", "Problemet med pekerne", {
          ingress: (
            <>
              Inoden har fast størrelse — typisk 256 byte. Da er det bare plass til en håndfull
              blokkpekere. Hvordan blir en fil på 4 GiB mulig?
            </>
          ),
          punkter: [
            "De første pekerne peker direkte på datablokker. Raskt for små filer.",
            "Den neste peker på en blokk som bare inneholder flere pekere.",
            "Den neste igjen har to nivåer med pekerblokker, og så tre.",
            "Store filer koster noen ekstra oppslag; små filer koster ingen.",
          ],
        }),
        visual("fi-5-diagram", "Fikle med pekernivåene", {
          ledetekst: <>Klikk deg gjennom direkte, indirekte, dobbelt og trippelt.</>,
          Viz: InodeDiagram,
          hint: "Se hvor raskt kapasiteten vokser per nivå — og hvor mange ekstra diskoppslag hvert nivå koster.",
        }),
        visual("fi-6-struktur", "Inoden i sin helhet", {
          ledetekst: <>Alle feltene, med forklaring på hva hvert av dem brukes til.</>,
          Viz: InodeStructure,
          hint: "Finn lenketelleren. Den er nøkkelen til hvordan sletting fungerer.",
        }),
        tallanslag("fi-7-tall", "Hvor stor fil uten indirekte?", {
          sporsmal: (
            <>
              Tolv direkte pekere og blokker på 4 KiB. Hvor stor kan en fil være før den trenger den
              første indirekte pekerblokken? Svar i kibibyte.
            </>
          ),
          enhet: "KiB",
          fasitTall: 48,
          fasit: (
            <>
              48 KiB, altså 12 × 4 KiB. Og det dekker det store flertallet av filer på et vanlig
              system: konfigurasjonsfiler, kildekode, skript. Designet er optimert for det vanlige
              tilfellet, og tåler unntakene med noen ekstra oppslag.
            </>
          ),
        }),
        sjekk("fi-8-sjekk", "Samme inode?", {
          sporsmal: (
            <>
              <Kodelinje>ls -i a.txt b.txt</Kodelinje> viser samme tall for begge. Hva betyr det?
            </>
          ),
          valg: [
            { tekst: "De har identisk innhold", hvorfor: "To ulike filer kan godt ha likt innhold og ulike inoder." },
            { tekst: "Det er én fil med to navn", riktig: true, hvorfor: "Samme inode betyr nøyaktig samme fil." },
            { tekst: "Den ene er en kopi av den andre", hvorfor: "En kopi får sin egen inode." },
          ],
          fasit: (
            <>
              Én fil, to navn. Endrer du innholdet gjennom det ene navnet, ser du det gjennom det
              andre — det er ikke to kopier, det er samme datablokker. Dette er en hard lenke, og
              det er neste tema.
            </>
          ),
        }),
        recall("fi-9-recall", [
          {
            forside: "Hva inneholder en inode, og hva inneholder den ikke?",
            bakside: "Type, rettigheter, eier, størrelse, tidsstempler, lenketeller og blokkpekere. Ikke filnavnet.",
          },
          {
            forside: "Hvorfor er mv innen samme filsystem øyeblikkelig?",
            bakside: "Fordi bare katalogoppføringen endres. Inoden og datablokkene røres ikke.",
          },
          {
            forside: "Hvorfor har inoden flere nivåer med pekere?",
            bakside: "Inoden har fast størrelse. Direkte pekere dekker små filer gratis; indirekte nivåer utvider til store filer mot noen ekstra oppslag.",
          },
        ]),
        oppsummering("fi-10-opp", {
          punkter: [
            "Inoden er filen; navnet er en oppføring i en katalog.",
            "Direkte pekere for små filer, indirekte nivåer for store.",
            "stat og ls -i viser deg alt dette.",
          ],
          videre: "Neste: hvordan en sti faktisk slås opp, katalog for katalog.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "kataloger-og-stier",
      tittel: "Kataloger og stioppslag",
      utbytte:
        "Du kan følge oppslaget av en absolutt sti steg for steg, og forklare hvorfor x-bitten på en katalog betyr noe annet enn på en fil.",
      byggerPa: ["filer-og-inoder"],
      skjermer: [
        intro("ks-1-intro", "Katalogen er også en fil", {
          ingress: (
            <>
              En katalog er ikke en spesiell konstruksjon. Det er en helt vanlig fil med en helt
              vanlig inode — den inneholder bare en bestemt slags innhold: par av navn og
              inode-nummer.
            </>
          ),
        }),
        konsept("ks-2-innhold", "Hva som står i en katalog", {
          ingress: <>To kolonner, ikke mer.</>,
          punkter: [
            "Et navn, og inode-nummeret navnet peker på.",
            <>
              Hver katalog har alltid <Kodelinje>.</Kodelinje> (seg selv) og{" "}
              <Kodelinje>..</Kodelinje> (forelderen).
            </>,
            <>
              I rotkatalogen peker <Kodelinje>..</Kodelinje> på seg selv. Der stopper turen oppover.
            </>,
          ],
          merk: (
            <>
              Ingen filstørrelser, ingen rettigheter, ingen datoer i katalogen. Alt det ligger i
              inodene. Derfor må <Kodelinje>ls -l</Kodelinje> lese én inode per fil — og derfor er
              den mye tregere enn <Kodelinje>ls</Kodelinje>.
            </>
          ),
        }),
        anslag("ks-3-anslag", "Hvor mange oppslag?", {
          sporsmal: (
            <>
              Kjernen skal åpne <Kodelinje>/home/isak/notat.txt</Kodelinje>. Hvor mange inoder må
              leses før den finner filens egen inode?
            </>
          ),
          valg: [{ tekst: "1" }, { tekst: "2" }, { tekst: "3" }, { tekst: "4" }],
          fasit: (
            <>
              Tre før den fjerde: rot, så <Kodelinje>home</Kodelinje>, så{" "}
              <Kodelinje>isak</Kodelinje>, og til slutt filens egen. Hvert steg er «les katalogen,
              finn navnet, hent inode-nummeret». Det er derfor kjernen har en egen hurtigbuffer for
              stioppslag — uten den ville dype stier vært svært dyre.
            </>
          ),
        }),
        visual("ks-4-oppslag", "Følg oppslaget", {
          ledetekst: <>Steg deg gjennom en stioppløsning, katalog for katalog.</>,
          Viz: PathResolution,
          hint: "Legg merke til at rettighetene sjekkes på HVERT nivå, ikke bare på filen til slutt.",
        }),
        konsept("ks-5-x-bit", "x på en katalog", {
          ingress: (
            <>
              Kjørerettigheten betyr noe helt annet på en katalog enn på en fil, og forvirringen
              koster mange studenter en oblig.
            </>
          ),
          punkter: [
            <>
              På en fil: <Kodelinje>x</Kodelinje> betyr «lov å kjøre som program».
            </>,
            <>
              På en katalog: <Kodelinje>x</Kodelinje> betyr «lov å slå opp navn her», altså lov å gå
              gjennom.
            </>,
            <>
              <Kodelinje>r</Kodelinje> på en katalog betyr «lov å liste innholdet».
            </>,
            "Du kan ha x uten r: du kan nå filer du vet navnet på, men ikke se hva som finnes.",
          ],
        }),
        kode("ks-6-absolutt", "Absolutt og relativ", {
          ingress: <>Forskjellen er bare hvor oppslaget starter.</>,
          kode: `/home/isak/notat.txt    # absolutt: starter i rot
notat.txt               # relativ: starter i arbeidskatalogen
../felles/liste.txt     # relativ, opp ett nivå først
~/notat.txt             # skallet bytter ~ mot hjemmekatalogen`,
          punkter: [
            <>
              <Kodelinje>~</Kodelinje> er skallets utvidelse, ikke kjernens. Kjernen ser aldri en
              tilde.
            </>,
            "Arbeidskatalogen er en egenskap ved prosessen, ikke ved terminalen.",
          ],
        }),
        sjekk("ks-7-sjekk", "Hvorfor nektes du?", {
          sporsmal: (
            <>
              Filen <Kodelinje>/data/rapport.txt</Kodelinje> er lesbar for alle, men du får
              «Permission denied». Hva er sannsynligvis galt?
            </>
          ),
          valg: [
            { tekst: "Filen er likevel ikke lesbar", hvorfor: "Vi vet at den er det." },
            { tekst: "Katalogen /data mangler x for deg", riktig: true, hvorfor: "Uten kjørerett på katalogen kan navnet ikke slås opp i det hele tatt." },
            { tekst: "Disken er full", hvorfor: "Full disk gir en annen feilmelding, og gjelder skriving." },
          ],
          fasit: (
            <>
              Katalogen mangler <Kodelinje>x</Kodelinje>. Rettighetene sjekkes på hvert steg i stien.
              Kan du ikke gå gjennom <Kodelinje>/data</Kodelinje>, spiller det ingen rolle hvor
              åpen filen inni er — du kommer aldri fram til inoden.
            </>
          ),
        }),
        recall("ks-8-recall", [
          {
            forside: "Hva inneholder en katalog?",
            bakside: "Par av navn og inode-nummer. Ingenting annet — størrelse og rettigheter ligger i inodene.",
          },
          {
            forside: "Hva betyr x-bitten på en katalog?",
            bakside: "Lov til å slå opp navn og gå gjennom katalogen. Ikke det samme som r, som er lov til å liste innholdet.",
          },
          {
            forside: "Hvor mange inoder leses for å åpne /a/b/c.txt?",
            bakside: "Fire: rot, a, b, og c.txt sin egen.",
          },
        ]),
        oppsummering("ks-9-opp", {
          punkter: [
            "Katalogen er en fil med navn-til-inode-par.",
            "Stioppslag går steg for steg, med rettighetssjekk på hvert nivå.",
            "x på katalog = gå gjennom, r på katalog = liste.",
          ],
          videre: "Neste: to navn på samme fil, og navn som bare peker videre.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "lenker",
      tittel: "Harde og symbolske lenker",
      utbytte:
        "Du kan velge riktig lenketype, og forklare hvorfor sletting av en fil egentlig er å telle ned.",
      byggerPa: ["kataloger-og-stier"],
      skjermer: [
        intro("le-1-intro", "To slags snarveier", {
          ingress: (
            <>
              Nå som du vet at navnet ikke er en del av filen, er lenker helt uproblematiske: den
              ene lager et navn til, den andre lager en fil som inneholder en sti.
            </>
          ),
        }),
        konsept("le-2-hard", "Hard lenke", {
          ingress: (
            <>
              En <Term>hard lenke</Term> er en ny oppføring i en katalog som peker på en inode som
              allerede finnes.
            </>
          ),
          punkter: [
            <>
              Lages med <Kodelinje>ln original nytt-navn</Kodelinje>.
            </>,
            "Begge navnene er like ekte. Det finnes ikke noe «opprinnelig» navn.",
            "Inodens lenketeller øker med én.",
            "Kan ikke krysse filsystemgrenser, og kan ikke peke på en katalog.",
          ],
        }),
        konsept("le-3-sletting", "Hva sletting egentlig er", {
          ingress: (
            <>
              <Kodelinje>rm</Kodelinje> heter i systemkall-verdenen <Kodelinje>unlink</Kodelinje>,
              og det navnet er mye ærligere.
            </>
          ),
          punkter: [
            "Katalogoppføringen fjernes, og lenketelleren minker med én.",
            "Er telleren fortsatt over null, finnes filen fremdeles under et annet navn.",
            "Blir telleren null, frigis datablokkene.",
            "Men: har en prosess filen åpen, venter frigivelsen til den lukker.",
          ],
          merk: (
            <>
              Derfor får du ikke plass tilbake ved å slette en stor loggfil mens tjenesten fortsatt
              skriver til den. Du må starte tjenesten på nytt, eller tømme filen i stedet.
            </>
          ),
        }),
        anslag("le-4-anslag", "Hvor mye plass?", {
          sporsmal: (
            <>
              Du lager fem harde lenker til en fil på 1 GiB. Hvor mye diskplass bruker de seks
              navnene til sammen?
            </>
          ),
          valg: [
            { tekst: "6 GiB" },
            { tekst: "1 GiB pluss noen få byte" },
            { tekst: "1 GiB, helt nøyaktig" },
          ],
          fasit: (
            <>
              1 GiB pluss noen byte per katalogoppføring. Det finnes bare ett sett datablokker og én
              inode. De ekstra navnene koster omtrent tjue byte hver. Dette er hvordan
              sikkerhetskopiprogrammer lager «fullstendige» kopier hver natt uten å bruke ny plass
              på filer som ikke er endret.
            </>
          ),
        }),
        konsept("le-5-myk", "Symbolsk lenke", {
          ingress: (
            <>
              En <Term>symbolsk lenke</Term> (myk lenke) er en egen fil med egen inode, og innholdet
              er rett og slett en sti som tekst.
            </>
          ),
          punkter: [
            <>
              Lages med <Kodelinje>ln -s mål navn</Kodelinje>.
            </>,
            "Kan peke på kataloger, og kan krysse filsystemer.",
            "Kan peke på noe som ikke finnes. Da er den «brutt».",
            "Slettes målet, blir lenken hengende igjen og peker i tomme luften.",
          ],
        }),
        visual("le-6-typer", "Se forskjellen", {
          ledetekst: <>Lag lenker, slett mål, og se hva som overlever.</>,
          Viz: LinkTypes,
          hint: "Slett originalfilen i begge tilfellene. Bare den ene lenken slutter å virke.",
        }),
        sjekk("le-7-sjekk", "Hvilken velger du?", {
          sporsmal: (
            <>
              Du vil at <Kodelinje>/opt/app/gjeldende</Kodelinje> alltid skal peke på nyeste versjon
              i <Kodelinje>/opt/app/v3</Kodelinje>, og kunne endres til v4 senere. Hva bruker du?
            </>
          ),
          valg: [
            { tekst: "Hard lenke", hvorfor: "Harde lenker kan ikke peke på kataloger." },
            { tekst: "Symbolsk lenke", riktig: true, hvorfor: "Den kan peke på en katalog og kan endres når som helst." },
            { tekst: "Kopi av katalogen", hvorfor: "Da må alt kopieres på nytt ved hver ny versjon." },
          ],
          fasit: (
            <>
              Symbolsk lenke. Dette mønsteret — en lenke som peker på gjeldende versjon — er hvordan
              programvare oppdateres uten nedetid: du peker lenken på den nye katalogen, og bytte
              skjer i samme øyeblikk.
            </>
          ),
        }),
        recall("le-8-recall", [
          {
            forside: "Hva er forskjellen på en hard og en symbolsk lenke?",
            bakside: "Hard: et nytt navn på samme inode. Symbolsk: en egen fil som inneholder en sti som tekst.",
          },
          {
            forside: "Hva gjør rm egentlig?",
            bakside: "Fjerner katalogoppføringen og teller ned inodens lenketeller. Datablokkene frigis først når telleren er null og ingen har filen åpen.",
          },
          {
            forside: "Hvorfor kan ikke en hard lenke krysse filsystemer?",
            bakside: "Fordi inode-numre bare er unike innenfor ett filsystem.",
          },
        ]),
        oppsummering("le-9-opp", {
          punkter: [
            "Hard lenke er et navn til på samme inode.",
            "Symbolsk lenke er en fil som inneholder en sti.",
            "Sletting er nedtelling, ikke destruksjon.",
          ],
          videre: "Neste: hvordan filsystemet holder styr på hva som er ledig, og overlever strømbrudd.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "ledig-plass-og-journal",
      tittel: "Ledig plass og journalføring",
      utbytte:
        "Du kan forklare hvordan filsystemet finner ledige blokker, og hvorfor en journal gjør strømbrudd ufarlige.",
      byggerPa: ["filer-og-inoder"],
      skjermer: [
        intro("lj-1-intro", "To spørsmål ved hver skriving", {
          ingress: (
            <>
              Når du lagrer en ny fil må filsystemet svare på to ting: hvilke blokker er ledige, og
              hva skjer hvis strømmen går midt i?
            </>
          ),
        }),
        konsept("lj-2-bitkart", "Bitkartet", {
          ingress: (
            <>
              Et <Term>bitkart</Term> er én bit per blokk på disken: 0 for ledig, 1 for opptatt.
            </>
          ),
          punkter: [
            "Å finne ledig plass er å lete etter en nullbit — svært raskt.",
            "Det finnes ett bitkart for datablokker og ett for inoder.",
            "Filsystemet deler disken i grupper, hver med sitt eget bitkart.",
            "Gruppene gjør at en fil og inoden dens havner fysisk nær hverandre.",
          ],
        }),
        tallanslag("lj-3-tall", "Hvor stort blir bitkartet?", {
          sporsmal: (
            <>
              En disk på 1 TiB med blokker på 4 KiB. Hvor stort blir bitkartet over datablokker, i
              mebibyte?
            </>
          ),
          enhet: "MiB",
          fasitTall: 32,
          fasit: (
            <>
              32 MiB. 1 TiB delt på 4 KiB gir omtrent 268 millioner blokker, én bit hver, altså
              omtrent 33,5 millioner byte. Det er 0,003 % av disken — en ubetydelig pris for å
              kunne svare på «er denne ledig?» umiddelbart.
            </>
          ),
        }),
        visual("lj-4-bitkart", "Fikle med bitkartet", {
          ledetekst: <>Lag og slett filer, og se bitkartet endre seg.</>,
          Viz: FreeBlockBitmap,
          hint: "Lag mange små filer og slett annenhver. Se hva som skjer med sammenhengende ledig plass.",
        }),
        anslag("lj-5-anslag", "Strømbrudd midt i", {
          sporsmal: (
            <>
              Å legge til en blokk i en fil krever tre skrivinger: bitkartet, inoden og selve
              dataene. Strømmen går etter den første. Hva er tilstanden?
            </>
          ),
          valg: [
            { tekst: "Alt er som før — ingenting rakk å skje" },
            { tekst: "Blokken er merket opptatt, men ingen fil bruker den" },
            { tekst: "Filen er ødelagt og kan ikke leses" },
          ],
          fasit: (
            <>
              Blokken er opptatt uten eier. Det er en lekkasje, ikke en katastrofe — men den motsatte
              rekkefølgen er mye verre: hadde inoden pekt på en blokk som ikke var merket opptatt,
              kunne blokken blitt delt ut til en annen fil, og da ville to filer skrevet over
              hverandre.
            </>
          ),
        }),
        konsept("lj-6-journal", "Journalen", {
          ingress: (
            <>
              En <Term>journal</Term> er et lite område på disken der filsystemet skriver hva det
              skal gjøre, før det gjør det.
            </>
          ),
          punkter: [
            "Skriv planen til journalen, og vent til den ligger trygt.",
            "Utfør endringene på de virkelige plassene.",
            "Merk journaloppføringen som ferdig.",
            "Ved oppstart etter krasj: kjør ferdig alt som er skrevet, men ikke merket ferdig.",
          ],
          merk: (
            <>
              Resultatet er at hver operasjon enten har skjedd helt eller ikke i det hele tatt. Delvis
              utførte endringer finnes ikke.
            </>
          ),
        }),
        visual("lj-7-journal", "Se journalen redde deg", {
          ledetekst: <>Kjør en skriving, og trekk ut strømmen på ulike tidspunkt.</>,
          Viz: JournalingAnimator,
          hint: "Krasj både før og etter at journalen er skrevet ferdig. Utfallene er helt forskjellige.",
        }),
        konsept("lj-8-modus", "Hva som journalføres", {
          ingress: (
            <>
              Å journalføre alt to ganger halverer skrivehastigheten. Derfor finnes flere
              innstillinger.
            </>
          ),
          punkter: [
            "Kun metadata: inoder og bitkart journalføres, data skrives direkte. Standard i ext4.",
            "Ordnet: data skrives ferdig før metadata journalføres. Litt tregere, tryggere.",
            "Alt: også dataene går gjennom journalen. Tregest, sikrest.",
            "Med kun metadata kan en fil etter et krasj ha riktig størrelse, men gammelt innhold.",
          ],
          bihjelp: (
            <>
              Alternativet til journalføring er kopi-ved-skriving, som brukes av nyere filsystemer:
              i stedet for å endre på plass, skriver de en ny versjon og bytter pekeren til slutt.
            </>
          ),
        }),
        sjekk("lj-9-sjekk", "Hvorfor er journalen rask?", {
          sporsmal: (
            <>
              Journalen skriver jo alt to ganger. Hvorfor er den likevel mye raskere enn å sjekke
              hele disken etter et krasj?
            </>
          ),
          valg: [
            { tekst: "Fordi journalen er komprimert", hvorfor: "Komprimering er ikke poenget." },
            { tekst: "Fordi journalen er liten og skrives sammenhengende", riktig: true, hvorfor: "Sekvensiell skriving til ett lite område er billig; full disksjekk må lese alt." },
            { tekst: "Fordi journalen ligger i RAM", hvorfor: "Da hadde den ikke overlevd strømbrudd." },
          ],
          fasit: (
            <>
              Den er liten og skrives sekvensielt. Sammenlign med en full sjekk av filsystemet, som
              må lese hver eneste inode på disken og kan ta timer på en stor disk. Journalen gjør
              gjenopprettingen til sekunder.
            </>
          ),
        }),
        recall("lj-10-recall", [
          {
            forside: "Hva er et bitkart i et filsystem?",
            bakside: "Én bit per blokk eller inode: 0 for ledig, 1 for opptatt. Gjør søk etter ledig plass raskt.",
          },
          {
            forside: "Hva er rekkefølgen i en journalført operasjon?",
            bakside: "Skriv planen til journalen, utfør endringene, merk journaloppføringen ferdig.",
          },
          {
            forside: "Hva kan gå galt med journalføring av kun metadata?",
            bakside: "Filen kan etter et krasj ha riktig størrelse i inoden, men gammelt eller tilfeldig innhold i blokkene.",
          },
        ]),
        oppsummering("lj-11-opp", {
          punkter: [
            "Bitkartet gjør ledig-plass-søk billig.",
            "Journalen gjør hver operasjon enten hel eller ikke skjedd.",
            "Valg av journalmodus er en avveining mellom fart og sikkerhet.",
          ],
          videre: "Neste: å bruke alt dette fra kommandolinja.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "filsystem-i-skallet",
      tittel: "Filsystemet fra kommandolinja",
      utbytte:
        "Du kan navigere hierarkiet, finne filer på egenskaper, og forklare hva montering betyr.",
      byggerPa: ["kataloger-og-stier"],
      skjermer: [
        intro("fk-1-intro", "Ett tre, uansett antall disker", {
          ingress: (
            <>
              Windows gir hver disk sin egen bokstav. Linux har ett eneste tre fra{" "}
              <Kodelinje>/</Kodelinje>, og disker settes inn i treet der du vil.
            </>
          ),
        }),
        konsept("fk-2-hierarki", "Hvor ting hører hjemme", {
          ingress: <>Plasseringene er standardisert, ikke tilfeldige.</>,
          punkter: [
            <>
              <Kodelinje>/etc</Kodelinje> — konfigurasjon, som tekstfiler. <Kodelinje>/home</Kodelinje>{" "}
              — brukernes filer.
            </>,
            <>
              <Kodelinje>/var</Kodelinje> — data som vokser: logger, køer, databaser.
            </>,
            <>
              <Kodelinje>/usr</Kodelinje> — installerte programmer og biblioteker.{" "}
              <Kodelinje>/tmp</Kodelinje> — midlertidig, tømmes.
            </>,
            <>
              <Kodelinje>/proc</Kodelinje> og <Kodelinje>/sys</Kodelinje> — ikke på disk i det hele
              tatt. Kjernen finner opp innholdet mens du leser.
            </>,
          ],
          merk: (
            <>
              <Kodelinje>cat /proc/cpuinfo</Kodelinje> leser ingen fil. Kjernen genererer teksten i
              det øyeblikket du spør.
            </>
          ),
        }),
        konsept("fk-3-montering", "Montering", {
          ingress: (
            <>
              Å <Term>montere</Term> er å si: fra nå av betyr denne katalogen innholdet på denne
              enheten.
            </>
          ),
          punkter: [
            <>
              <Kodelinje>mount /dev/sdb1 /mnt/data</Kodelinje> — enheten dukker opp under stien.
            </>,
            "Det som lå i katalogen fra før blir skjult, ikke slettet, til du demonterer.",
            <>
              <Kodelinje>df -h</Kodelinje> viser hva som er montert hvor, og hvor mye plass som er
              igjen.
            </>,
            <>
              <Kodelinje>/etc/fstab</Kodelinje> beskriver hva som skal monteres ved oppstart.
            </>,
          ],
        }),
        kode("fk-4-find", "Lær først: finn filer på egenskaper", {
          ingress: (
            <>
              <Kodelinje>find</Kodelinje> går gjennom treet og tester hver fil mot vilkårene dine.
            </>
          ),
          kode: `find /var/log -name "*.log"        # på navn
find . -type d -name "test*"       # bare kataloger
find /home -size +100M             # større enn 100 MiB
find /tmp -mtime +7 -delete        # endret for over 7 dager siden`,
          punkter: [
            "Stien først, deretter vilkårene. Uten sti brukes arbeidskatalogen.",
            <>
              Vilkårene og-es sammen. <Kodelinje>-type d</Kodelinje> og{" "}
              <Kodelinje>-name</Kodelinje> må begge stemme.
            </>,
            <>
              Test alltid uten <Kodelinje>-delete</Kodelinje> først. Alltid.
            </>,
          ],
        }),
        anslag("fk-5-anslag", "Hvorfor er du fortsatt tom for plass?", {
          sporsmal: (
            <>
              <Kodelinje>df</Kodelinje> sier disken er 100 % full, men <Kodelinje>du -sh /</Kodelinje>{" "}
              finner bare halvparten så mye. Hva er forklaringen?
            </>
          ),
          valg: [
            { tekst: "du teller feil" },
            { tekst: "En slettet fil holdes åpen av en prosess" },
            { tekst: "Disken er ødelagt" },
          ],
          fasit: (
            <>
              En slettet fil som fortsatt er åpen. Navnet er borte, så <Kodelinje>du</Kodelinje>{" "}
              finner den ikke — men lenketelleren er ikke null før prosessen lukker, så plassen er
              ikke frigitt. Finn synderen med <Kodelinje>lsof | grep deleted</Kodelinje> og start
              tjenesten på nytt. Dette er direkte anvendelse av sletting-som-nedtelling.
            </>
          ),
        }),
        kode("fk-6-plass", "Verktøyene for diskplass", {
          kode: `df -h              # ledig plass per montert filsystem
df -i              # ledige INODER — kan ta slutt før plassen!
du -sh *           # størrelse per katalog her
du -h --max-depth=1 /var | sort -h`,
          punkter: [
            <>
              <Kodelinje>df</Kodelinje> spør filsystemet, <Kodelinje>du</Kodelinje> summerer filer.
              Derfor kan de være uenige.
            </>,
            "Millioner av bittesmå filer kan tømme inode-tabellen med masse plass til overs.",
          ],
        }),
        sjekk("fk-7-sjekk", "Prøv selv", {
          sporsmal: (
            <>
              Du vil finne alle filer under <Kodelinje>/var/log</Kodelinje> som er større enn 50 MiB.
              Hvilken kommando?
            </>
          ),
          valg: [
            { tekst: "find /var/log -size +50M", riktig: true, hvorfor: "Sti først, deretter vilkåret. + betyr «større enn»." },
            { tekst: "du -sh /var/log +50M", hvorfor: "du tar ikke størrelsesvilkår." },
            { tekst: "ls -l /var/log | grep 50M", hvorfor: "ls skriver ikke størrelser i den formen, og grep matcher tekst." },
          ],
          fasit: (
            <>
              <Kodelinje>find /var/log -size +50M</Kodelinje>. Merk plusstegnet: uten det betyr{" "}
              <Kodelinje>-size 50M</Kodelinje> «nøyaktig 50», som nesten aldri treffer.
            </>
          ),
        }),
        recall("fk-8-recall", [
          {
            forside: "Hva betyr det å montere et filsystem?",
            bakside: "Å koble en enhets innhold inn i en katalog i det eneste treet. Det som lå der fra før skjules til du demonterer.",
          },
          {
            forside: "Hvorfor kan df og du være uenige om diskplassen?",
            bakside: "Fordi df spør filsystemet, mens du summerer filer med navn. Slettede men åpne filer teller hos df, ikke hos du.",
          },
          {
            forside: "Hva er /proc?",
            bakside: "Et filsystem uten disk. Kjernen genererer innholdet i det øyeblikket du leser.",
          },
        ]),
        oppsummering("fk-9-opp", {
          punkter: [
            "Ett tre, med enheter montert inn der du vil.",
            "find tester filer på egenskaper, ikke bare navn.",
            "df mot du avslører slettede filer som fortsatt er åpne.",
          ],
          videre: "Neste emne: hvordan dataene faktisk kommer seg til og fra disken.",
        }),
      ],
    },
  ],
};
