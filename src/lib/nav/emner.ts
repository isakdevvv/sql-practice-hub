// ---------------------------------------------------------------------------
// nav/emner.ts — emneinndeling for fag som ikke er skjerm-kurs ennå.
//
// Skjerm-kursene (lib/kurs) har emner innebygd. De andre eksamensfagene har
// bare en flat leksjonsrekkefølge i curriculum-fasen, så her grupperes de
// samme leksjonene i emner. Hvert emne svarer på ett spørsmål, og stegene
// står i den rekkefølgen de bygger på hverandre.
//
// Fila eier bare grupperingen. Titlene hentes fra leksjonene selv, og en
// leksjon som ligger i fagets fase uten å være plassert her havner i emnet
// «Ikke plassert ennå» nederst — den forsvinner aldri stille.
// ---------------------------------------------------------------------------

export interface EmneDef {
  id: string;
  tittel: string;
  /** Spørsmålet emnet svarer på. */
  sporsmal: string;
  /** Stack-slugs i studierekkefølge. */
  slugs: readonly string[];
}

export interface FagEmner {
  emner: readonly EmneDef[];
  /** Rene oversiktssider (hub-er) som ikke er steg i seg selv. */
  utelat?: readonly string[];
}

export const EMNER: Record<string, FagEmner> = {
  // Emne 1–6 følger Canvas-modulene 1–6 i navn og rekkefølge.
  "dte-2507": {
    utelat: ["kurose-kurs", "dte2507-modul1"],
    emner: [
      {
        id: "introduksjon",
        tittel: "Introduksjon",
        sporsmal: "Hva er Internett, og hvorfor er det bygd i lag?",
        slugs: [
          "kurose-kap-1",
          "osi-tcpip",
          "dte2507-skjelett",
          "dte2507-nettverksverktoy",
          "dte2507-delay-modell",
          "dte2507-bottleneck-throughput",
        ],
      },
      {
        id: "applikasjonslaget",
        tittel: "Applikasjonslaget",
        sporsmal: "Hvordan snakker programmer sammen over nettet?",
        slugs: [
          "kurose-kap-2",
          "http-statuskoder",
          "dte2507-http2-hol",
          "dte2507-web-caching-matte",
          "dte2507-dns-dyp",
          "tcp-sockets",
          "dte2507-socket-programmering",
          "dte2507-wireshark-analyse",
        ],
      },
      {
        id: "transportlaget",
        tittel: "Transportlaget",
        sporsmal: "Hvordan blir en upålitelig kanal til en pålitelig forbindelse?",
        slugs: [
          "kurose-kap-3",
          "transportlag",
          "dte2507-rdt-progresjon",
          "dte2507-congestion-control",
        ],
      },
      {
        id: "nettverkslaget",
        tittel: "Nettverkslaget",
        sporsmal: "Hvordan finner en pakke veien fra én maskin til en annen?",
        slugs: [
          "kurose-kap-4",
          "dte2507-subnetting",
          "dte2507-ruting",
          "dte2507-inni-ruter",
          "dte2507-packet-scheduling",
          "dte2507-dhcp",
          "dte2507-nat",
          "kurose-kap-5",
          "dte2507-ospf-dijkstra",
          "dte2507-count-to-infinity",
          "dte2507-bgp-stige",
        ],
      },
      {
        id: "datalinklaget",
        tittel: "Datalinklaget",
        sporsmal: "Hva skjer på den ene kabelen mellom to naboer?",
        slugs: [
          "kurose-kap-6",
          "dte2507-arp-detektiv",
          "dte2507-switch-self-learning",
          "dte2507-crc-kalkulator",
          "dte2507-aloha-kasino",
          "dte2507-paket-dekoding",
          "dte2507-praksis",
          "dte2507-day-in-the-life",
        ],
      },
      {
        id: "tradlost",
        tittel: "Trådløse nettverk og WiFi",
        sporsmal: "Hva endrer seg når kabelen blir borte?",
        slugs: ["kurose-kap-7", "dte2507-wifi-csma-ca"],
      },
      {
        id: "kryptografi-tls",
        tittel: "Kryptografi og TLS",
        sporsmal: "Hvordan holder du noe hemmelig og ekte over et åpent nett?",
        slugs: [
          "kurose-kap-8",
          "kryptografi",
          "dte2507-rsa-mini",
          "dte2507-fra-checksum-til-hmac",
          "dte2507-cbc-iv",
          "dte2507-ap-progresjon",
          "tls",
          "dte2507-tls-handshake",
          "dte2507-tls-handshake-lab",
        ],
      },
      {
        id: "brannmur-ids",
        tittel: "Brannmur og inntrengingsdeteksjon",
        sporsmal: "Hvordan stopper og oppdager du trafikk som ikke skal inn?",
        slugs: [
          "nettverkssikkerhet",
          "dte2507-brannmur-vlan",
          "dte2507-stateful-firewall",
          "dte2507-brannmur-pakkeflyt",
          "dte2507-ids-snort",
        ],
      },
      {
        id: "multimedia",
        tittel: "Multimedia i nettverk",
        sporsmal: "Hvorfor er lyd og video vanskeligere enn filer?",
        slugs: ["kurose-kap-9", "dte2507-voip-rtp"],
      },
    ],
  },

  "dte-2602": {
    emner: [
      {
        id: "grunnlaget",
        tittel: "Grunnlaget",
        sporsmal: "Hva er maskinlæring, og hvordan ser et helt prosjekt ut?",
        slugs: [
          "ml-grunnlag",
          "supervised-learning",
          "unsupervised-learning",
          "dte2602-prosjektflyt",
        ],
      },
      {
        id: "data",
        tittel: "Data før modell",
        sporsmal: "Hva må du vite om og gjøre med dataene før du trener noe?",
        slugs: ["dte2602-eda-pandas", "dte2602-preprocessing-pipeline", "ml-pipeline-builder"],
      },
      {
        id: "regresjon",
        tittel: "Regresjon",
        sporsmal: "Hvordan forutsier du et tall, og hvordan vet du at modellen holder?",
        slugs: [
          "dte2602-lineaer-regresjon",
          "gradient-descent",
          "dte2602-regresjon-diagnostikk",
          "dte2602-bias-varians",
          "ridge-lasso-regularizer",
        ],
      },
      {
        id: "klassifikasjon",
        tittel: "Klassifikasjon",
        sporsmal: "Hvordan forutsier du en kategori, og hvilke modeller trekker grensa ulikt?",
        slugs: [
          "sigmoid-viz",
          "dte2602-logistisk-regresjon",
          "dte2602-lda-qda-nb",
          "dte2602-svm",
          "dte2602-trees-rf",
        ],
      },
      {
        id: "evaluering",
        tittel: "Evaluering",
        sporsmal: "Hvordan måler du ærlig hvor god modellen er?",
        slugs: [
          "dte2602-evaluering-metoder",
          "dte2602-cv-varianter",
          "dte2602-evaluation-roc",
          "dte2602-roc-curve-plotter",
        ],
      },
      {
        id: "ikke-veiledet",
        tittel: "Ikke-veiledet læring",
        sporsmal: "Hva kan du finne i data som ikke har fasit?",
        slugs: ["dte2501-kmeans-visualizer", "gmm-visualizer", "dte2501-pca-visualizer"],
      },
      {
        id: "nevrale-nett",
        tittel: "Nevrale nett og optimering",
        sporsmal: "Hvordan lærer et nett, og hvordan leter du uten gradient?",
        slugs: ["nn-intro", "dte2501-pso-visualizer"],
      },
      {
        id: "etikk-mappe",
        tittel: "Etikk og mappeoppgaven",
        sporsmal: "Hva skylder du dem modellen treffer, og hvordan leverer du mappa?",
        slugs: ["dte2602-etikk-filosofi", "dte2602-mappe-mal"],
      },
    ],
  },

  "tek-1501": {
    emner: [
      {
        id: "beskrivende",
        tittel: "Beskrivende statistikk",
        sporsmal: "Hvordan oppsummerer du et datasett med noen få tall?",
        slugs: ["tek1-modul1-data", "tek1-deskriptiv"],
      },
      {
        id: "sannsynlighet",
        tittel: "Sannsynlighet",
        sporsmal: "Hvordan regner du på noe som ikke har skjedd ennå?",
        slugs: ["tek1-modul2-sannsynlighet", "tek1-sannsynlighet", "tek1-kombinatorikk"],
      },
      {
        id: "fordelinger",
        tittel: "Fordelinger",
        sporsmal: "Hvilke mønstre følger tilfeldige størrelser?",
        slugs: [
          "tek1-modul3-fordelinger",
          "tek1-fordelinger",
          "tek1-diskrete-fordelinger",
          "tek1-kontinuerlige-fordelinger",
          "tek1-distribusjons-plotter",
          "tek1-forventning-clt",
        ],
      },
      {
        id: "estimering",
        tittel: "Estimering og konfidensintervall",
        sporsmal: "Hva kan et utvalg si om hele populasjonen, og hvor sikkert?",
        slugs: [
          "tek1-modul4-inferens",
          "tek1-statistisk-analyse",
          "tek1-inferens-sampling",
          "tek1-estimering-ki",
        ],
      },
      {
        id: "hypotesetest",
        tittel: "Hypotesetesting, ANOVA og regresjon",
        sporsmal: "Når er en forskjell eller sammenheng mer enn tilfeldigheter?",
        slugs: [
          "tek1-hypotesetest-regresjon",
          "tek1-p-verdi-kalkulator",
          "tek1-proporsjoner",
          "tek1-anova",
          "tek1-regresjon-diagnostikk",
        ],
      },
    ],
  },
};
