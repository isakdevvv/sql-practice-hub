import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

/**
 * Innkapsling — meldingen som vokser på vei ned og krymper på vei opp.
 *
 * Det som er vanskelig å se fra en statisk figur er at headerne ligger som skall
 * utenpå hverandre, og at hver boks i nettet bare skreller av så mange skall som
 * jobben krever. Ruteren midt i stegrekka gjør nettopp det: den åpner ramme og
 * datagram, og lar segmentet ligge urørt.
 */

type Lag = {
  navn: string;
  pdu: string;
  header: string | null;
  forklaring: string;
};

const LAG: Lag[] = [
  { navn: "Applikasjon", pdu: "Melding", header: null, forklaring: "Appen lager innholdet — f.eks. en HTTP-forespørsel. Ingen header ennå; dette ER nyttelasten." },
  { navn: "Transport", pdu: "Segment", header: "Ht", forklaring: "Transportlaget legger på portnumre så mottakeren vet hvilken prosess dataene skal til. Er det TCP, ligger også sekvensnummer og ACK-felt her." },
  { navn: "Nettverk", pdu: "Datagram", header: "Hn", forklaring: "Nettverkslaget legger på avsender- og mottaker-IP. Det er denne headeren ruterne i kjernen leser." },
  { navn: "Lenke", pdu: "Ramme", header: "Hl", forklaring: "Lenkelaget legger på MAC-adresser for neste hopp. Denne headeren byttes ut på HVERT hopp — den gjelder bare én lenke om gangen." },
  { navn: "Fysisk", pdu: "Bits", header: null, forklaring: "Rammen blir til signaler på kobber, fiber eller radio. Ingen ny header — bare koding." },
];

/** Stegene: 0-4 ned hos avsender, 5 = ruteren, 6-10 opp hos mottaker. */
const SISTE = 10;

export function InnkapslingViz() {
  const [steg, setSteg] = useState(0);

  const hosRuter = steg === 5;
  const nedover = steg <= 4;
  const lagIdx = nedover ? steg : hosRuter ? 2 : SISTE - steg;
  const lag = LAG[lagIdx];

  // Hvor mange headere ligger på nå?
  const antallHeadere = nedover
    ? LAG.slice(0, steg + 1).filter((l) => l.header).length
    : hosRuter
      ? 2
      : LAG.slice(0, lagIdx + 1).filter((l) => l.header).length;

  const headere = LAG.filter((l) => l.header).slice(0, antallHeadere);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-4 py-2">
        <span className="text-sm font-semibold">Innkapsling — meldingen ned, over og opp igjen</span>
      </div>

      {/* Stakkene */}
      <div className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_1fr]">
        <Stakk tittel="Avsender" aktiv={nedover ? lagIdx : -1} retning="ned" />
        <div className="flex flex-col items-center justify-center gap-1 py-2">
          <div
            className={`rounded-lg border px-2 py-3 text-center text-[10px] leading-tight ${
              hosRuter ? "border-brand bg-brand/10 font-semibold text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            Ruter
            <div className="mt-1 text-[9px]">
              leser
              <br />
              lenke +<br />
              nettverk
            </div>
          </div>
        </div>
        <Stakk tittel="Mottaker" aktiv={!nedover && !hosRuter ? lagIdx : -1} retning="opp" />
      </div>

      {/* Pakken slik den ser ut nå */}
      <div className="border-t border-border px-4 py-3">
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Dataenheten nå: <span className="font-semibold text-foreground">{hosRuter ? "Datagram (inni rammen)" : lag.pdu}</span>
        </div>
        <div className="flex flex-wrap items-stretch gap-0.5">
          {headere.map((h) => (
            <div
              key={h.header}
              className="flex items-center rounded-l border border-brand/50 bg-brand/10 px-2 py-2 font-mono text-[10px] font-semibold text-foreground"
              title={h.navn}
            >
              {h.header}
            </div>
          ))}
          <div className="flex flex-1 items-center justify-center rounded-r border border-success/50 bg-success/10 px-3 py-2 text-[11px] font-medium text-foreground">
            Applikasjonsmelding
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {hosRuter
            ? "Ruteren skreller av lenke-headeren, leser nettverks-headeren for å finne neste hopp, og setter på en NY lenke-header. Segmentet inni er den aldri borti."
            : lag.forklaring}
        </p>
      </div>

      {/* Kontroller */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/20 px-4 py-2">
        <button
          onClick={() => setSteg((s) => Math.max(0, s - 1))}
          disabled={steg === 0}
          className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60 disabled:opacity-40"
        >
          <ChevronLeft className="h-3 w-3" /> Forrige
        </button>
        <button
          onClick={() => setSteg((s) => Math.min(SISTE, s + 1))}
          disabled={steg === SISTE}
          className="inline-flex items-center gap-1 rounded border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium hover:bg-brand/20 disabled:opacity-40"
        >
          Neste <ChevronRight className="h-3 w-3" />
        </button>
        <button
          onClick={() => setSteg(0)}
          className="ml-auto inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-xs hover:border-brand/60"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <div className="flex gap-1">
          {Array.from({ length: SISTE + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setSteg(i)}
              className={`h-1.5 w-3 rounded-full ${i === steg ? "bg-brand" : i < steg ? "bg-brand/40" : "bg-muted-foreground/20"}`}
              aria-label={`Steg ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Legg merke til steg 6:</strong> ruteren åpner bare to skall.
        Den vet ingenting om at dette er HTTP, og trenger ikke vite det. Det er derfor nettet kan bære
        applikasjoner som ikke var oppfunnet da rutene ble lagt.
      </p>
    </div>
  );
}

function Stakk({ tittel, aktiv, retning }: { tittel: string; aktiv: number; retning: "ned" | "opp" }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {tittel} <span className="font-normal normal-case">({retning === "ned" ? "ned gjennom stakken" : "opp gjennom stakken"})</span>
      </div>
      <div className="space-y-0.5">
        {LAG.map((l, i) => (
          <div
            key={l.navn}
            className={`flex items-center justify-between rounded border px-2 py-1 text-[11px] ${
              i === aktiv
                ? "border-brand bg-brand/10 font-semibold text-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            <span>{l.navn}</span>
            <span className="font-mono text-[9px]">{l.pdu}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
