import { useState } from "react";
import { Brain, RotateCcw, ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";

// ---------------------------------------------------------------------------
// LagringFlashcards — sluttsjekk for storage-kurset. Holdt inline her i stedet
// for å legge på flashcards.ts (som har global merge-konflikt-risiko og er
// orientert mot DAT1000-pensum).
// ---------------------------------------------------------------------------

type Card = { q: string; a: string };

const CARDS: Card[] = [
  {
    q: "Hva er de to hovedkomponentene av aksess-tid på en HDD?",
    a: "Seek-tid (armens bevegelse mellom spor) + rotasjons-latency (vent på riktig sektor under hodet). Snitt-rotasjons-latency = halv rotasjon = 60_000 / RPM / 2 ms.",
  },
  {
    q: "Hvorfor er random write tregere enn sequential på HDD?",
    a: "Sekvensielle writes lar armen stå stille og lar platen rotere én sektor til neste — nesten ingen mekanisk vent. Random writes krever ny seek + ny rotasjonsvent for hver eneste write.",
  },
  {
    q: "Hva betyr 'erase-before-write' i NAND-flash?",
    a: "En NAND-celle kan re-programmeres ned fra 1 til 0 page-vis, men kan bare reset-es tilbake til 1 ved å erase en hel BLOCK (mange pages av gangen). Derfor må controller flytte fortsatt-gyldig data ut før erase.",
  },
  {
    q: "Hva er write amplification og hvordan regnes den ut?",
    a: "WA = fysiske writes / logiske writes. Skyldes garbage collection (flytting av valid pages før erase), metadata-headers og wear leveling. WA > 1 reduserer både effektiv ytelse og levetid.",
  },
  {
    q: "Hva skiller SLC, MLC, TLC og QLC?",
    a: "Antall bit per NAND-celle (1/2/3/4) og dermed antall spennings-nivåer (2/4/8/16). Flere bit = tettere lagring og lavere kost/GB, men færre PE-sykler og lavere ytelse.",
  },
  {
    q: "Hva er wear leveling?",
    a: "Controllerens mapping fra logisk LBA til fysisk block roteres slik at writes fordeles jevnt over alle blocks — uten det ville hot logical blocks brent ut noen få fysiske blocks mens resten av disken var ferskt.",
  },
  {
    q: "Hva er TRIM og hvorfor finnes det?",
    a: "TRIM er en kommando OS sender til SSD: 'disse LBA-ene er ikke i bruk lenger'. Uten TRIM ser SSD-controlleren slettede filer som fortsatt valid og må flytte dem ved GC — TRIM lar GC ignorere dem.",
  },
  {
    q: "Hvorfor er NVMe så mye raskere enn SATA-SSD når NAND-cellene er like?",
    a: "Buss og protokoll. SATA AHCI har én kommando-kø og maks ~600 MB/s. NVMe over PCIe har opptil 65 535 køer × 65 535 dybde, og PCIe 4.0 x4 gir ~8 GB/s. Designet for parallelle I/O fra fleirkjerne-CPUer.",
  },
  {
    q: "Hva er TBW og hvorfor er det viktig for valg av SSD?",
    a: "Total Bytes Written — produsentens garanti for hvor mye totalt logisk data SSD-en tåler å ha blitt skrevet før den telles som utgått. Forventet levetid ≈ TBW / (daglige writes × WA).",
  },
  {
    q: "Hvilken disk velger du for et stort, sjelden-lest videoarkiv?",
    a: "HDD (eller tape ved PB-skala). SSD-ens IOPS er bortkastet på sjelden lesing, mens HDD er 3–5× billigere per GB. Cloud cold-tier (S3 Glacier, Azure Archive) er HDD/tape under panseret.",
  },
  {
    q: "Hvorfor har enterprise-SSD-er ofte PLP (power-loss protection)?",
    a: "Kondensatorer holder strømmen lenge nok til at controlleren får skrevet write-bufferen til flash når strømmen kuttes. Det lar fsync returnere når data er i bufferen (µs) i stedet for når de er i flash-cellene (ms) — kritisk for OLTP-databaser.",
  },
  {
    q: "Hvorfor klustrer mange databaser rader på primær-nøkkel?",
    a: "For å konvertere range-scan over primær-nøkkel til sekvensiell disk-access. På HDD er det forskjellen på 100× og 1000× tregere enn cache. Selv på SSD er sekvensiell adgang 2–5× raskere og mer cache-vennlig.",
  },
];

export function LagringFlashcards() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);

  const card = CARDS[idx];

  function next() {
    setShow(false);
    setIdx((i) => (i + 1) % CARDS.length);
  }
  function prev() {
    setShow(false);
    setIdx((i) => (i - 1 + CARDS.length) % CARDS.length);
  }
  function reset() {
    setIdx(0);
    setShow(false);
  }

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Brain className="h-4 w-4 text-brand" />
          Recall-kort
          <span className="text-xs font-normal text-muted-foreground">
            ({idx + 1} / {CARDS.length})
          </span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" /> Start på nytt
        </button>
      </div>

      <div className="min-h-[180px] rounded-lg border bg-muted/30 p-4 flex flex-col">
        <div className="text-sm font-medium leading-relaxed">{card.q}</div>
        <div className="mt-auto">
          {show ? (
            <div className="mt-4 text-sm text-foreground leading-relaxed border-t pt-3">
              {card.a}
            </div>
          ) : (
            <button
              onClick={() => setShow(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Eye className="h-3.5 w-3.5" /> Vis svar
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={prev}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Forrige
        </button>
        {show && (
          <button
            onClick={() => setShow(false)}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <EyeOff className="h-3 w-3" /> Skjul svar
          </button>
        )}
        <button
          onClick={next}
          className="inline-flex items-center gap-1 rounded-md bg-brand text-brand-foreground px-3 py-1.5 text-sm hover:bg-brand/90"
        >
          Neste <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
