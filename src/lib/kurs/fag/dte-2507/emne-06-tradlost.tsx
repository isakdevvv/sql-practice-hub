// Emne 6 — Trådløse nettverk og WiFi.
// Pensum: Canvas modul 6 «Trådløse nettverk og WiFi», Kurose & Ross kap. 7.
// Bygger på emne 5: kollisjon, CSMA, MAC-adresse, ramme, svitsj.
// Rekkefølge: hva som er annerledes i lufta → WiFi og CSMA/CA → mobilnett og
// det å flytte seg.

import type { Emne } from "@/lib/kurs/types";
import { anslag, intro, konsept, oppsummering, recall, sjekk } from "../dte-2505/byggere";
import { Term } from "@/components/kurs-dte2505/blokker";

export const emneTradlost: Emne = {
  slug: "tradlost",
  tittel: "Trådløse nettverk og WiFi",
  sporsmal: "Hva endrer seg når kabelen blir borte?",
  pensum: "Canvas modul 6 — Trådløse nettverk og WiFi · Kurose & Ross kap. 7",
  undertemaer: [
    /* ------------------------------------------------------------------ */
    {
      slug: "tradlose-lenker",
      tittel: "Den trådløse lenken",
      utbytte:
        "Du kan nevne tre ting som gjør en radiolenke vanskeligere enn en kabel, og forklare problemet med den skjulte terminalen.",
      byggerPa: ["flertilgang"],
      skjermer: [
        intro("tl-1-intro", "Samme lag, vanskeligere lenke", {
          ingress: (
            <>
              Over nettverkslaget er trådløst og kablet helt likt. Forskjellen ligger i linklaget og
              under. En radiolenke er en dårligere lenke enn en kabel, på tre måter.
            </>
          ),
        }),
        konsept("tl-2-tre", "Tre problemer med radio", {
          ingress: <>En kabel holder signalet inne og støyen ute. Lufta gjør ingen av delene.</>,
          punkter: [
            <>
              <Term>Svekkelse</Term> — signalet blir svakere med avstanden, og mye svakere gjennom
              vegger.
            </>,
            <>
              <Term>Forstyrrelser</Term> — andre nett, mikrobølgeovner og blåtann sender på de samme
              frekvensene.
            </>,
            <>
              <Term>Flerveisutbredelse</Term> — signalet spretter i vegger og kommer fram i flere
              forsinkede kopier som blander seg.
            </>,
          ],
        }),
        konsept("tl-3-snr", "Signal mot støy", {
          ingress: (
            <>
              Det som avgjør om en bit tolkes riktig, er hvor sterkt signalet er i forhold til
              støyen. Forholdet heter <Term>signal-støy-forhold</Term>, forkortet SNR.
            </>
          ),
          punkter: [
            "Høyere forhold gir færre bitfeil.",
            "Raskere sending pakker bitene tettere og tåler mindre støy.",
            "Derfor senker utstyret hastigheten selv når du går langt fra basestasjonen.",
          ],
        }),
        konsept("tl-4-skjult", "Den skjulte terminalen", {
          ingress: (
            <>
              A og C står på hver sin side av B, med en vegg mellom seg. Begge når B. De hører ikke
              hverandre.
            </>
          ),
          punkter: [
            "A lytter, hører stillhet og sender til B.",
            "C lytter, hører også stillhet og sender til B.",
            "Signalene kolliderer hos B, og verken A eller C merker det.",
          ],
          merk: (
            <>
              Dette kalles <Term>skjult terminal</Term>. Å lytte før man sender er altså ikke nok i
              et trådløst nett.
            </>
          ),
        }),
        konsept("tl-5-oppbygging", "Byggeklossene", {
          ingress: <>De fleste trådløse nett er bygd rundt et fast punkt.</>,
          punkter: [
            <>
              <Term>Basestasjonen</Term> er koblet til det kablede nettet og videresender for de
              trådløse enhetene. I WiFi heter den aksesspunkt, i mobilnett mobilmast.
            </>,
            <>
              Når all trafikk går via en basestasjon, er nettet i <Term>infrastrukturmodus</Term>.
            </>,
            <>
              Snakker enhetene rett med hverandre uten basestasjon, er det et{" "}
              <Term>ad hoc-nett</Term>.
            </>,
          ],
        }),
        sjekk("tl-6-sjekk", "Hvorfor oppdaget de det ikke?", {
          sporsmal: (
            <>Hvorfor oppdager ikke A kollisjonen hos B i eksempelet med skjult terminal?</>
          ),
          valg: [
            {
              tekst: "A er utenfor rekkevidde av C og hører aldri signalet fra C",
              riktig: true,
              hvorfor: "Kollisjonen skjer hos mottakeren, ikke hos avsenderen.",
            },
            {
              tekst: "A sender for fort",
              hvorfor: "Hastigheten har ingenting med rekkevidden å gjøre.",
            },
            {
              tekst: "B glemmer å si fra",
              hvorfor: "B fikk bare støy og vet ikke hvem som sendte.",
            },
          ],
          fasit: (
            <>
              I lufta kan avsender og mottaker oppleve helt ulike forhold. Det er grunnen til at
              WiFi trenger kvitteringer.
            </>
          ),
        }),
        recall("tl-7-recall", [
          {
            forside: "Nevn tre ting som gjør en trådløs lenke dårligere enn en kabel.",
            bakside:
              "Svekkelse med avstand, forstyrrelser fra andre sendere, og flerveisutbredelse.",
          },
          {
            forside: "Hva er problemet med den skjulte terminalen?",
            bakside: "To sendere som ikke hører hverandre, kolliderer hos en mottaker begge når.",
          },
          {
            forside: "Hva er infrastrukturmodus?",
            bakside: "At all trafikk går via en basestasjon som er koblet til det kablede nettet.",
          },
        ]),
        oppsummering("tl-8-opp", {
          punkter: [
            "Radio gir svakere signal, mer støy og flere kopier av samme signal.",
            "Avsenderen kan ikke vite hva mottakeren hører.",
          ],
          videre: "Neste undertema: hvordan WiFi løser det.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "wifi",
      tittel: "WiFi og CSMA/CA",
      utbytte:
        "Du kan forklare hvordan en enhet kobler seg til et aksesspunkt, og hvorfor WiFi unngår kollisjoner i stedet for å oppdage dem.",
      byggerPa: ["tradlose-lenker", "mac-og-arp"],
      skjermer: [
        intro("wf-1-intro", "802.11", {
          ingress: (
            <>
              WiFi er handelsnavnet på en familie standarder som heter IEEE 802.11. Versjonene
              skiller seg i hastighet og frekvens, men bruker den samme protokollen for å dele
              kanalen.
            </>
          ),
        }),
        konsept("wf-2-ap", "Aksesspunkt og nettnavn", {
          ingress: <>Et aksesspunkt og enhetene som er koblet til det, utgjør én celle.</>,
          punkter: [
            <>
              Hvert aksesspunkt har et nettnavn, forkortet <Term>SSID</Term> (service set
              identifier), og sender på én kanal.
            </>,
            <>
              Det sender jevnlig ut <Term>ledefyrrammer</Term> (beacon frames) med navnet og
              MAC-adressen sin.
            </>,
            "Enheten lytter på kanalene, velger et aksesspunkt og ber om å bli tilknyttet.",
            "Deretter ber den vanligvis om en IP-adresse med DHCP.",
          ],
        }),
        anslag("wf-3-anslag", "Hvorfor ikke bare oppdage kollisjoner?", {
          sporsmal: (
            <>
              Kablet Ethernet oppdaget kollisjoner mens det sendte. Hvorfor gjør ikke WiFi det
              samme?
            </>
          ),
          valg: [
            { tekst: "Det ville brukt for mye strøm" },
            {
              tekst:
                "Senderens eget signal overdøver alt den kunne ha hørt, og kollisjonen kan skje utenfor rekkevidde",
            },
            { tekst: "Standarden er for gammel" },
          ],
          fasit: (
            <>
              Signalet du sender er enormt mye sterkere enn det du mottar, så du hører bare deg
              selv. I tillegg kommer skjulte terminaler. WiFi må derfor unngå kollisjoner i stedet.
            </>
          ),
        }),
        konsept("wf-4-ca", "CSMA/CA", {
          ingress: (
            <>
              Protokollen heter <Term>CSMA/CA</Term>, der CA står for collision avoidance, å unngå
              kollisjon.
            </>
          ),
          punkter: [
            "Er kanalen ledig en kort stund, send hele rammen.",
            "Er den opptatt, velg en tilfeldig ventetid og tell ned bare mens kanalen er ledig.",
            "Send når nedtellingen når null.",
            "Kommer det ingen kvittering, dobles intervallet og du prøver igjen.",
          ],
          merk: (
            <>
              Den korte stunden avsenderen venter først, heter DIFS. Mottakeren venter en enda
              kortere stund, SIFS, før kvitteringen.
            </>
          ),
        }),
        konsept("wf-5-ack", "Kvittering i linklaget", {
          ingress: <>Fordi avsenderen ikke kan høre om det gikk bra, må mottakeren si fra.</>,
          punkter: [
            "Mottakeren sjekker CRC og sender en kvittering med en gang.",
            "Uteblir kvitteringen, antar avsenderen at rammen kolliderte.",
            "Dette er noe kablet Ethernet ikke har.",
          ],
        }),
        konsept("wf-6-rts", "Reserver kanalen", {
          ingress: (
            <>For å dempe problemet med skjulte terminaler kan avsenderen be om lov først.</>
          ),
          punkter: [
            <>
              Avsenderen sender en kort <Term>RTS</Term> (request to send) til aksesspunktet.
            </>,
            <>
              Aksesspunktet svarer med <Term>CTS</Term> (clear to send), som alle i cellen hører.
            </>,
            "De andre holder seg unna så lenge sendingen varer.",
          ],
          merk: (
            <>
              RTS kan selv kollidere, men de er korte, så tapet er lite. Ordningen brukes helst for
              lange rammer.
            </>
          ),
        }),
        konsept("wf-7-adresser", "Tre adresser i rammen", {
          ingress: <>En WiFi-ramme har flere adressefelt enn en Ethernet-ramme.</>,
          punkter: [
            "MAC-adressen til den trådløse mottakeren.",
            "MAC-adressen til den trådløse avsenderen.",
            "MAC-adressen til ruteren på den kablede siden av aksesspunktet.",
          ],
          merk: (
            <>
              Aksesspunktet er en linklagsboks. Den tredje adressen lar det bygge en vanlig
              Ethernet-ramme videre til ruteren.
            </>
          ),
        }),
        sjekk("wf-8-sjekk", "Hva løser RTS og CTS?", {
          sporsmal: <>Hvilket problem er RTS og CTS først og fremst laget for?</>,
          valg: [
            { tekst: "Svakt signal", hvorfor: "Svakt signal møtes med lavere hastighet." },
            {
              tekst: "Skjulte terminaler",
              riktig: true,
              hvorfor: "CTS fra aksesspunktet når også dem som ikke hørte avsenderen.",
            },
            { tekst: "For få IP-adresser", hvorfor: "Det er et problem i nettverkslaget." },
          ],
          fasit: <>Alle i cellen hører aksesspunktet, selv om de ikke hører hverandre.</>,
        }),
        recall("wf-9-recall", [
          {
            forside: "Hvordan finner en enhet et aksesspunkt?",
            bakside:
              "Den lytter etter ledefyrrammer med nettnavn og MAC-adresse, og ber om tilknytning.",
          },
          {
            forside: "Hvorfor bruker WiFi CSMA/CA og ikke CSMA/CD?",
            bakside:
              "En sender kan ikke høre kollisjoner mens den sender, og kollisjoner kan skje utenfor rekkevidde.",
          },
          {
            forside: "Hva er RTS og CTS?",
            bakside:
              "En kort forespørsel om å sende og et svar fra aksesspunktet som reserverer kanalen.",
          },
        ]),
        oppsummering("wf-10-opp", {
          punkter: [
            "Enheten knytter seg til et aksesspunkt ut fra ledefyrrammer.",
            "CSMA/CA venter tilfeldig og bruker kvitteringer.",
            "RTS og CTS reserverer kanalen når terminaler er skjult for hverandre.",
          ],
          videre: "Neste undertema: mobilnett og det å være i bevegelse.",
        }),
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      slug: "mobilnett-og-mobilitet",
      tittel: "Mobilnett og mobilitet",
      utbytte:
        "Du kan beskrive delene i et mobilnett og forklare hvordan en forbindelse overlever at du flytter deg.",
      byggerPa: ["wifi", "ipv6"],
      skjermer: [
        intro("mm-1-intro", "Dekning overalt", {
          ingress: (
            <>
              WiFi dekker et hus. Mobilnettet dekker et land. Ideen er den samme, med basestasjoner
              og celler, men avstandene er større og brukerne flytter seg mellom cellene.
            </>
          ),
        }),
        konsept("mm-2-deler", "Delene i 4G og 5G", {
          ingress: <>Mobilnettet har to hoveddeler.</>,
          punkter: [
            <>
              <Term>Radionettet</Term> — mobilmastene og radiolenken til telefonen.
            </>,
            <>
              <Term>Kjernenettet</Term> — operatørens eget IP-nett bak mastene, som kjenner
              abonnentene og kobler videre til Internett.
            </>,
            "SIM-kortet identifiserer abonnenten overfor kjernenettet.",
          ],
          merk: <>I 4G og 5G er alt IP, også talen.</>,
        }),
        konsept("mm-3-bytte", "Å bytte mast", {
          ingress: (
            <>Når du beveger deg, blir signalet fra én mast svakere og fra en annen sterkere.</>
          ),
          punkter: [
            "Telefonen måler signalet fra mastene rundt og rapporterer til nettet.",
            "Nettet bestemmer når du skal flyttes.",
            <>
              Selve flyttingen heter <Term>overlevering</Term>, på engelsk handover.
            </>,
          ],
          merk: (
            <>
              Forbindelsene dine skal overleve. IP-adressen kan derfor ikke endres ved hvert bytte.
            </>
          ),
        }),
        konsept("mm-4-hjem", "Hjemmenett og besøksnett", {
          ingress: <>Reiser du til et annet land, er du i en annen operatørs nett.</>,
          punkter: [
            <>
              <Term>Hjemmenettet</Term> er operatøren du har abonnement hos. Det vet alltid hvor du
              er.
            </>,
            <>
              <Term>Besøksnettet</Term> er nettet du faktisk er koblet til.
            </>,
            "Trafikk til deg sendes først til hjemmenettet, som sender den videre gjennom en tunnel til besøksnettet.",
          ],
          merk: <>Det er samme tunnelidé som med IPv6: et datagram pakket inn i et annet.</>,
        }),
        sjekk("mm-5-sjekk", "Hvem vet hvor du er?", {
          sporsmal: <>En venn ringer deg mens du er i utlandet. Hvor sendes samtalen først?</>,
          valg: [
            {
              tekst: "Til hjemmenettet ditt",
              riktig: true,
              hvorfor: "Nummeret ditt peker dit, og hjemmenettet vet hvilket nett du besøker.",
            },
            {
              tekst: "Rett til masten du er koblet til",
              hvorfor: "Den som ringer vet ikke hvor du er.",
            },
            { tekst: "Til alle mobilnett i verden", hvorfor: "Det ville ikke skalert." },
          ],
          fasit: (
            <>Hjemmenettet er det faste punktet. Derfra går trafikken i tunnel til der du er.</>
          ),
        }),
        recall("mm-6-recall", [
          {
            forside: "Hva er de to hoveddelene i et mobilnett?",
            bakside: "Radionettet med mastene, og kjernenettet bak.",
          },
          {
            forside: "Hva er overlevering?",
            bakside:
              "At en enhet flyttes fra én basestasjon til en annen uten at forbindelsene brytes.",
          },
          {
            forside: "Hvordan når trafikk fram til en enhet i et besøksnett?",
            bakside: "Den sendes til hjemmenettet, som tunnelerer den videre til besøksnettet.",
          },
        ]),
        oppsummering("mm-7-opp", {
          punkter: [
            "Mobilnett er radionett pluss kjernenett.",
            "Overlevering flytter deg mellom master.",
            "Hjemmenettet holder rede på hvor du er og tunnelerer trafikken dit.",
          ],
          videre: "Neste emne: hvordan holde noe hemmelig og ekte over et åpent nett.",
        }),
      ],
    },
  ],
};
