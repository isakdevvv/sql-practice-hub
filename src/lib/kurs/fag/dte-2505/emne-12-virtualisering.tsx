// Emne 12 — Virtualisering og containere.
// Dette var et av de tre kjente hullene i fagdekningen. Bygger på kjernemodus
// (emne 1), prosesser (emne 3), minne (emne 5) og filsystem (emne 8).

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
import { HypervisorTypeComparison } from "@/components/stack/dte2505-virtualisering/HypervisorTypeComparison";
import { VmVsContainer } from "@/components/stack/dte2505-virtualisering/VmVsContainer";

export const emneVirtualisering: Emne = {
  slug: "virtualisering",
  tittel: "Virtualisering og containere",
  sporsmal: "Hvordan kan én maskin late som den er mange, og hva er egentlig en container?",
  pensum: "Canvas modul 1b (VM til obligene) + fagdybde",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "hypervisorer",
      tittel: "Hypervisoren",
      utbytte:
        "Du kan skille type 1 fra type 2, og forklare hva maskinvarestøtte for virtualisering løste.",
      byggerPa: ["kjerne-og-brukermodus"],
      skjermer: [
        intro("hv-1-intro", "Et lag til under kjernen", {
          ingress: (
            <>
              Hele faget har handlet om at kjernen deler maskinen mellom prosesser. Nå gjør vi det
              samme et nivå ned: vi deler maskinen mellom hele operativsystemer.
            </>
          ),
        }),
        konsept("hv-2-hva", "Hva en hypervisor gjør", {
          ingress: (
            <>
              En <Term>hypervisor</Term> gir hvert gjeste-operativsystem inntrykk av å ha en hel
              maskin for seg selv.
            </>
          ),
          punkter: [
            "Deler ut prosessortid — nøyaktig samme problem som scheduling, ett nivå ned.",
            "Deler ut minne, med en ekstra runde adresseoversetting.",
            "Etterligner maskinvare: disk, nettverkskort, skjerm.",
            "Isolerer gjestene fra hverandre, slik kjernen isolerer prosesser.",
          ],
          merk: (
            <>
              Legg merke til at alle fire punktene er de samme jobbene et operativsystem gjør. En
              hypervisor <em>er</em> et operativsystem, der «prosessene» er hele maskiner.
            </>
          ),
        }),
        anslag("hv-3-anslag", "Hvor kjører gjestens kjerne?", {
          sporsmal: (
            <>
              Gjeste-kjernen tror den er i kjernemodus og kjører privilegerte instruksjoner. Hva skjer
              egentlig?
            </>
          ),
          valg: [
            { tekst: "Den kjører faktisk i ekte kjernemodus" },
            { tekst: "Den kjører i et eget, lavere nivå, og de farlige instruksjonene fanges" },
          ],
          fasit: (
            <>
              Den kjører på et lavere nivå. Moderne prosessorer har egne
              virtualiseringsinstruksjoner som gir gjesten sin egen «kjernemodus» under
              hypervisorens nivå. Prøver gjesten noe som må kontrolleres, fanges det opp og
              hypervisoren svarer. Uten denne maskinvarestøtten måtte hypervisoren skrive om
              gjestens instruksjoner mens den kjørte — som fungerte, men var både komplisert og
              tregt.
            </>
          ),
        }),
        konsept("hv-4-typer", "To typer", {
          ingress: <>Forskjellen er hva som ligger under hypervisoren.</>,
          punkter: [
            <>
              <Term>Type 1</Term> — kjører rett på maskinvaren. Ingen vertsoperativsystem.
              Datasentre.
            </>,
            <>
              <Term>Type 2</Term> — kjører som et program oppå et vanlig operativsystem. Din
              bærbare.
            </>,
            "Type 1 har mindre overhead og et mindre angrepsflate.",
            "Type 2 er mye enklere: du installerer den som et hvilket som helst program.",
          ],
          bihjelp: (
            <>
              Linux med KVM (kernel-based virtual machine) er et grensetilfelle: kjernen blir selv
              hypervisoren, så det er i praksis type 1 med et fullt operativsystem ved siden av.
            </>
          ),
        }),
        visual("hv-5-compare", "Se lagene", {
          ledetekst: <>Type 1 og type 2 side ved side.</>,
          Viz: HypervisorTypeComparison,
          hint: "Tell lagene mellom gjestens program og den fysiske prosessoren i hvert tilfelle.",
        }),
        konsept("hv-6-oyeblikksbilde", "Øyeblikksbilder", {
          ingress: (
            <>
              Et <Term>øyeblikksbilde</Term> (snapshot) fryser hele tilstanden til den virtuelle
              maskinen: disk, minne og registre.
            </>
          ),
          punkter: [
            "Du kan rulle tilbake til nøyaktig det øyeblikket, når som helst.",
            "Ta ett før hvert risikofylt steg i en oblig. Det tar sekunder.",
            "Med minne inkludert kan du gjenoppta midt i en kjørende økt.",
            "Mange øyeblikksbilder i kjede gjør disken tregere — rydd opp.",
          ],
          merk: (
            <>
              Et øyeblikksbilde er ikke en sikkerhetskopi. Ligger det på samme disk som VM-en,
              forsvinner begge samtidig.
            </>
          ),
        }),
        sjekk("hv-7-sjekk", "Hvilken type?", {
          sporsmal: (
            <>
              Du kjører VirtualBox på din egen Windows-maskin for å gjøre obligene i Ubuntu. Hvilken
              type hypervisor er det?
            </>
          ),
          valg: [
            { tekst: "Type 1", hvorfor: "Type 1 kjører rett på maskinvaren, uten vertsoperativsystem." },
            { tekst: "Type 2", riktig: true, hvorfor: "VirtualBox er et vanlig program oppå Windows." },
            { tekst: "Ingen av delene — det er en container", hvorfor: "Ubuntu-gjesten har sin egen kjerne, så det er en ekte virtuell maskin." },
          ],
          fasit: (
            <>
              Type 2. Windows-kjernen ligger under, og VirtualBox er en prosess der. Derfor må du
              også slå på virtualiseringsstøtte i BIOS — VirtualBox trenger tilgang til de
              maskinvareinstruksjonene gjennom Windows.
            </>
          ),
        }),
        recall("hv-8-recall", [
          {
            forside: "Hva er forskjellen på type 1 og type 2 hypervisor?",
            bakside: "Type 1 kjører rett på maskinvaren. Type 2 kjører som et program oppå et vertsoperativsystem.",
          },
          {
            forside: "Hva løste maskinvarestøtten for virtualisering?",
            bakside: "Gjestens kjerne kan kjøre nesten direkte, med et eget privilegienivå. Før måtte hypervisoren skrive om instruksjoner mens de kjørte.",
          },
          {
            forside: "Hvorfor er ikke et øyeblikksbilde en sikkerhetskopi?",
            bakside: "Fordi det ligger på samme lagring som den virtuelle maskinen og forsvinner sammen med den.",
          },
        ]),
        oppsummering("hv-9-opp", {
          punkter: [
            "Hypervisoren gjør for maskiner det kjernen gjør for prosesser.",
            "Type 1 rett på jernet, type 2 oppå et vertssystem.",
            "Øyeblikksbilder er obligens beste venn — men ikke en sikkerhetskopi.",
          ],
          videre: "Neste: isolasjon uten en egen kjerne.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "containere",
      tittel: "Containere: isolasjon uten egen kjerne",
      utbytte:
        "Du kan forklare at en container bare er en prosess med begrenset utsyn, og navngi de to kjernemekanismene som gjør det.",
      byggerPa: ["hypervisorer", "prosess-abstraksjonen"],
      skjermer: [
        intro("co-1-intro", "Trenger du virkelig en kjerne til?", {
          ingress: (
            <>
              En virtuell maskin gir hver gjest et helt operativsystem. Men hvis du bare skal kjøre
              én applikasjon isolert, betaler du for en hel kjerne du ikke bruker.
            </>
          ),
        }),
        anslag("co-2-anslag", "Hva sier uname?", {
          sporsmal: (
            <>
              Du kjører <Kodelinje>uname -r</Kodelinje> inne i en container. Hvilken kjerneversjon
              får du?
            </>
          ),
          valg: [
            { tekst: "Containerens egen" },
            { tekst: "Vertsmaskinens" },
          ],
          fasit: (
            <>
              Vertsmaskinens. Containeren har ingen egen kjerne. Den er en helt vanlig prosess på
              verten — den ser bare mye mindre av systemet enn andre prosesser gjør. Dette ene
              eksperimentet er det klareste beviset på forskjellen mellom container og virtuell
              maskin.
            </>
          ),
        }),
        konsept("co-3-navnerom", "Navnerom: begrenset utsyn", {
          ingress: (
            <>
              <Term>Navnerom</Term> (namespaces) er kjernemekanismen som gir en prosess sitt eget
              utsnitt av systemet.
            </>
          ),
          punkter: [
            "PID-navnerom: prosessen ser bare seg selv og sine barn, og tror den er PID 1.",
            "Monteringsnavnerom: eget filsystemtre. Containerens «rot» er en katalog på verten.",
            "Nettverksnavnerom: egne nettverkskort, egne IP-adresser, eget rutingbord.",
            "Bruker-navnerom: kan være root inni uten å være root utenfor.",
          ],
          merk: (
            <>
              Ingen av disse er nye eller Docker-spesifikke. Det er vanlige kjernefunksjoner, som du
              kan bruke direkte med <Kodelinje>unshare</Kodelinje>.
            </>
          ),
        }),
        konsept("co-4-cgroups", "Kontrollgrupper: begrensede ressurser", {
          ingress: (
            <>
              Navnerom styrer hva du <em>ser</em>. <Term>Kontrollgrupper</Term> (cgroups) styrer hvor
              mye du <em>får</em>.
            </>
          ),
          punkter: [
            "Sett tak på minne: over grensen blir prosessen drept.",
            "Sett andel av prosessortid — direkte kobling til scheduleren fra emne 4.",
            "Begrens disk- og nettverksbåndbredde.",
            "Uten kontrollgrupper kunne én container spist hele maskinen.",
          ],
        }),
        visual("co-5-vm-container", "Side ved side", {
          ledetekst: <>Virtuell maskin mot container, lag for lag.</>,
          Viz: VmVsContainer,
          hint: "Tell hvor mange kjerner som kjører i hvert av de to bildene. Det er hele forskjellen.",
        }),
        tallanslag("co-6-tall", "Hvor mye raskere starter den?", {
          sporsmal: (
            <>
              En virtuell maskin bruker rundt 30 sekunder på å starte. Hvor mange millisekunder
              bruker en container?
            </>
          ),
          enhet: "ms",
          fasitTall: 100,
          fasit: (
            <>
              Størrelsesorden 50–200 millisekunder. Containeren gjør ingen maskinvareoppstart, laster
              ingen kjerne og starter ingen systemtjenester. Den gjør i praksis fork, setter opp
              navnerom og kontrollgrupper, og kaller exec. Det er derfor containere kan startes og
              stoppes per forespørsel.
            </>
          ),
        }),
        konsept("co-7-avveining", "Hva du gir opp", {
          ingress: <>Containere er ikke bare bedre. De bytter isolasjon mot effektivitet.</>,
          punkter: [
            "Alle containere deler én kjerne. En kjernesårbarhet rammer alle.",
            "Du kan ikke kjøre et annet operativsystem — bare noe som passer til vertens kjerne.",
            "En virtuell maskin har en mye smalere kontaktflate mot verten.",
            "Derfor kjører skytjenester ofte containere inni virtuelle maskiner.",
          ],
        }),
        kode("co-8-bevis", "Se det selv", {
          ingress: <>Tre kommandoer som demonstrerer at containeren bare er en prosess.</>,
          kode: `docker run --rm alpine uname -r    # vertens kjerneversjon
docker run --rm alpine ps aux      # bare containerens egne prosesser
ps aux | grep <prosessnavn>        # på VERTEN: der er den, som vanlig prosess`,
          punkter: [
            "Fra innsiden er containeren PID 1 i et lite univers.",
            "Fra utsiden er den en vanlig prosess med en helt vanlig PID.",
          ],
        }),
        sjekk("co-9-sjekk", "Hva velger du?", {
          sporsmal: (
            <>
              Du skal kjøre en Windows-applikasjon på en Linux-tjener, fullstendig isolert. Hva må du
              bruke?
            </>
          ),
          valg: [
            { tekst: "En container", hvorfor: "Containere deler vertens kjerne, og Windows-programmer trenger Windows-kjernen." },
            { tekst: "En virtuell maskin", riktig: true, hvorfor: "Bare en VM kan kjøre et annet operativsystem med egen kjerne." },
            { tekst: "Begge fungerer like godt", hvorfor: "Kjernedelingen gjør container umulig her." },
          ],
          fasit: (
            <>
              Virtuell maskin. Regelen er kort: skal gjesten ha en annen kjerne, må det være en VM.
              Skal den bare være isolert fra andre programmer på samme kjerne, holder en container —
              og da får du oppstart på millisekunder i stedet for titalls sekunder.
            </>
          ),
        }),
        recall("co-10-recall", [
          {
            forside: "Hvilke to kjernemekanismer utgjør en container?",
            bakside: "Navnerom, som begrenser hva prosessen ser, og kontrollgrupper, som begrenser hvor mye den får.",
          },
          {
            forside: "Hvorfor starter en container på millisekunder?",
            bakside: "Den laster ingen kjerne og gjør ingen maskinvareoppstart. Den er fork, navnerom, kontrollgruppe og exec.",
          },
          {
            forside: "Når må du bruke virtuell maskin i stedet for container?",
            bakside: "Når gjesten trenger en annen kjerne, eller når du trenger sterkere isolasjon enn kjernedeling gir.",
          },
        ]),
        oppsummering("co-11-opp", {
          punkter: [
            "En container er en prosess med begrenset utsyn og begrensede ressurser.",
            "Navnerom styrer sikt, kontrollgrupper styrer forbruk.",
            "Delt kjerne gir fart, men svakere isolasjon enn en virtuell maskin.",
          ],
          videre: "Du har nå vært gjennom hele faget: fra én instruksjon i kjernemodus til hele operativsystemer inni hverandre.",
        }),
      ],
    },
  ],
};
