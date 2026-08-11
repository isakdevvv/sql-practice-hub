import { useMemo, useState } from "react";
import { ChevronDown, Package, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ETHERNET_MTU,
  HEADER_BYTES,
  innkapsle,
  lag as slaaOppLag,
  type Nettverk,
  type Transport,
} from "@/lib/dte2507/skjelettEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 2 — GUIDET SIMULERING (lær-modus).
//
// Null prestasjonskrav. Studenten trykker «legg på neste lag» og ser pakken
// vokse, med forklaringen av akkurat det laget ved siden av. Alle tallene
// kommer fra `innkapsle()` i skjelettEngine.ts — ingenting er hardkodet her,
// så det som vises kan etterprøves uten å rendre komponenten.
// ---------------------------------------------------------------------------

const LAG_FORKLARING: Record<string, string> = {
  applikasjon:
    "Programmet ditt lager en melding. Her finnes ingen header ennå — dette er bare innholdet du faktisk vil sende.",
  transport:
    "Transportlaget legger på kildeport og målport, så mottakerens operativsystem vet hvilket program dataene skal til. TCP legger i tillegg på sekvensnummer, bekreftelsesnummer og flagg, og bruker derfor 20 byte mot UDPs 8.",
  nettverk:
    "Nettverkslaget legger på kilde-IP og mål-IP — adressene som gjelder hele veien fram. Her ligger også TTL (Time To Live), som trekkes ned i hver ruter og hindrer at pakker sirkler i det uendelige.",
  lenke:
    "Lenkelaget legger på mål-MAC og kilde-MAC for NESTE hopp, pluss en EtherType som sier hva som ligger inni. Det er det eneste laget som også legger på noe bak: 4 byte kontrollsum (FCS — Frame Check Sequence), så mottakeren kan kaste rammen hvis den ble skadet på veien.",
  fysisk:
    "Fysisk lag legger ikke på noen header. Det gjør bytene om til noe som kan reise: spenningsnivåer i kobber, lyspulser i fiber eller radiobølger i lufta.",
};

const LAG_FARGE: Record<string, { blokk: string; kant: string; tekst: string }> = {
  applikasjon: {
    blokk: "bg-emerald-500/25",
    kant: "border-emerald-500/60",
    tekst: "text-emerald-700 dark:text-emerald-300",
  },
  transport: {
    blokk: "bg-sky-500/25",
    kant: "border-sky-500/60",
    tekst: "text-sky-700 dark:text-sky-300",
  },
  nettverk: {
    blokk: "bg-violet-500/25",
    kant: "border-violet-500/60",
    tekst: "text-violet-700 dark:text-violet-300",
  },
  lenke: {
    blokk: "bg-amber-500/25",
    kant: "border-amber-500/60",
    tekst: "text-amber-700 dark:text-amber-300",
  },
  fysisk: {
    blokk: "bg-muted",
    kant: "border-border",
    tekst: "text-muted-foreground",
  },
};

export function Innkapslingssim() {
  const [nyttelast, setNyttelast] = useState(100);
  const [transport, setTransport] = useState<Transport>("tcp");
  const [nettverk, setNettverk] = useState<Nettverk>("ipv4");
  const [steg, setSteg] = useState(0); // hvor mange lag som er lagt på

  const res = useMemo(
    () => innkapsle(nyttelast, { transport, nettverk, mtu: ETHERNET_MTU }),
    [nyttelast, transport, nettverk],
  );

  const synlige = res.steg.slice(0, steg + 1);
  const naavaerende = res.steg[Math.min(steg, res.steg.length - 1)];
  const ferdig = steg >= res.steg.length - 1;

  // Bredden på visualiseringen skaleres mot den ferdige rammen, så blokkene
  // vokser inn i det samme området i stedet for å hoppe.
  const maksBredde = res.rammeBytes || 1;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4 text-brand" />
          Innkapslingssimulator
          <span className="text-xs font-normal text-muted-foreground">
            lag {steg + 1} av {res.steg.length}
          </span>
        </div>
        <button
          onClick={() => setSteg(0)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" /> Start på nytt
        </button>
      </div>

      {/* Kontroller */}
      <div className="grid gap-4 border-b px-4 py-4 sm:grid-cols-3">
        <label className="text-xs">
          <span className="mb-1 block font-medium text-foreground">
            Applikasjonsdata: <span className="tabular-nums">{nyttelast}</span> byte
          </span>
          <input
            type="range"
            min={1}
            max={1600}
            step={1}
            value={nyttelast}
            onChange={(e) => setNyttelast(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
        <div className="text-xs">
          <span className="mb-1 block font-medium text-foreground">Transportprotokoll</span>
          <div className="flex gap-1.5">
            {(["tcp", "udp"] as Transport[]).map((t) => (
              <button
                key={t}
                onClick={() => setTransport(t)}
                className={cn(
                  "rounded-md border px-2.5 py-1 transition-colors hover:bg-accent",
                  transport === t && "border-brand bg-brand/10 font-medium",
                )}
              >
                {t.toUpperCase()} · {HEADER_BYTES[t]} B
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs">
          <span className="mb-1 block font-medium text-foreground">Nettverksprotokoll</span>
          <div className="flex gap-1.5">
            {(["ipv4", "ipv6"] as Nettverk[]).map((n) => (
              <button
                key={n}
                onClick={() => setNettverk(n)}
                className={cn(
                  "rounded-md border px-2.5 py-1 transition-colors hover:bg-accent",
                  nettverk === n && "border-brand bg-brand/10 font-medium",
                )}
              >
                {n === "ipv4" ? "IPv4" : "IPv6"} · {HEADER_BYTES[n]} B
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualiseringen — pakken vokser nedover */}
      <div className="space-y-2 px-4 py-4">
        {synlige.map((s) => {
          const meta = slaaOppLag(s.lagId);
          const farge = LAG_FARGE[s.lagId];
          const nyttelastAndel = (res.nyttelastBytes / maksBredde) * 100;
          const foranAndel = ((s.totalBytes - res.nyttelastBytes - s.haleBytes) / maksBredde) * 100;
          const bakAndel = (s.haleBytes / maksBredde) * 100;

          return (
            <div key={s.lagId}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-[11px]">
                <span className={cn("font-semibold", farge.tekst)}>
                  {meta.nivaa}. {meta.navn}
                  <span className="ml-2 font-normal text-muted-foreground">
                    enhet: {s.enhet}
                  </span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {s.headerBytes > 0 && `+${s.headerBytes} B header `}
                  {s.haleBytes > 0 && `+${s.haleBytes} B hale `}
                  <span className="font-medium text-foreground">= {s.totalBytes} B</span>
                </span>
              </div>
              <div className="flex h-7 w-full overflow-hidden rounded border border-border">
                {foranAndel > 0 && (
                  <div
                    className={cn(
                      "flex items-center justify-center border-r text-[9px] font-medium",
                      farge.blokk,
                      farge.kant,
                      farge.tekst,
                    )}
                    style={{ width: `${foranAndel}%` }}
                    title={`Headere: ${Math.round(
                      s.totalBytes - res.nyttelastBytes - s.haleBytes,
                    )} byte`}
                  >
                    {foranAndel > 8 ? "headere" : ""}
                  </div>
                )}
                <div
                  className="flex items-center justify-center bg-foreground/10 text-[9px] font-medium text-foreground"
                  style={{ width: `${nyttelastAndel}%` }}
                  title={`Dine data: ${res.nyttelastBytes} byte`}
                >
                  {nyttelastAndel > 12 ? "dine data" : ""}
                </div>
                {bakAndel > 0 && (
                  <div
                    className={cn("border-l", farge.blokk, farge.kant)}
                    style={{ width: `${bakAndel}%` }}
                    title={`Kontrollsum bak: ${s.haleBytes} byte`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Forklaringen for laget vi nettopp la på */}
      <div className="border-t bg-muted/30 px-4 py-4">
        <div className="flex items-start gap-2">
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div className="text-sm leading-relaxed">
            <span className="font-medium">{slaaOppLag(naavaerende.lagId).navn}.</span>{" "}
            {LAG_FORKLARING[naavaerende.lagId]}
          </div>
        </div>
        {naavaerende.protokoll && (
          <p className="mt-2 pl-6 text-[11px] text-muted-foreground">
            Protokoll i dette eksempelet: {naavaerende.protokoll}
          </p>
        )}
      </div>

      {/* Fasit-linja når alle lagene er på */}
      {ferdig && (
        <div className="border-t px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Tall etikett="Ferdig ramme" verdi={`${res.rammeBytes} B`} />
            <Tall etikett="Av det er overhead" verdi={`${res.overheadBytes} B`} />
            <Tall
              etikett="Andel som er dine data"
              verdi={`${(res.effektivitet * 100).toFixed(1)} %`}
            />
          </div>
          {res.overMtu && (
            <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-[12px] leading-snug text-amber-700 dark:text-amber-300">
              Merk: pakken er nå større enn MTU på {ETHERNET_MTU} byte. I virkeligheten ville
              transportlaget delt dataene i flere segmenter FØR de kom hit — det er nettopp den
              regningen neste seksjon handler om.
            </p>
          )}
          <p className="mt-3 text-[12px] leading-snug text-muted-foreground">
            Dra skyveknappen ned mot 1 byte og se hva som skjer med den siste prosenten. Overhead
            er en fast kostnad per ramme, ikke en andel — det er hele grunnen til at nettet
            foretrekker få store pakker framfor mange små.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between border-t px-4 py-3">
        <button
          onClick={() => setSteg((s) => Math.max(0, s - 1))}
          disabled={steg === 0}
          className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40"
        >
          Ett lag opp
        </button>
        <button
          onClick={() => setSteg((s) => Math.min(res.steg.length - 1, s + 1))}
          disabled={ferdig}
          className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90 disabled:opacity-40"
        >
          {ferdig ? "Nederst i stakken" : "Legg på neste lag"}
        </button>
      </div>
    </div>
  );
}

function Tall({ etikett, verdi }: { etikett: string; verdi: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="text-lg font-bold tabular-nums text-foreground">{verdi}</div>
      <div className="text-[11px] text-muted-foreground">{etikett}</div>
    </div>
  );
}
