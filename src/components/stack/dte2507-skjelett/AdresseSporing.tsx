import { useMemo, useState } from "react";
import { ArrowRight, MapPin, Router, Laptop, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { hentSideSti } from "@/lib/dte2507/skjelettEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 2 — GUIDET SIMULERING, del to.
//
// Det ene poenget: IP-adressene står stille hele veien, MAC-adressene byttes
// ut i hvert hopp. Studenten klikker seg gjennom hoppene og ser nøyaktig
// hvilke felter som endret seg — feltene som endret seg blinker.
// ---------------------------------------------------------------------------

const NODER = [
  { navn: "Laptop", Ikon: Laptop },
  { navn: "Hjemmeruter", Ikon: Router },
  { navn: "Leverandørruter", Ikon: Router },
  { navn: "Webtjener", Ikon: Server },
];

export function AdresseSporing() {
  const sti = useMemo(() => hentSideSti(), []);
  const [i, setI] = useState(0);

  const hopp = sti.hopp[i];
  const forrige = i > 0 ? sti.hopp[i - 1] : null;

  const endret = (felt: "kildeMac" | "maalMac" | "kildeIp" | "maalIp") =>
    forrige !== null && forrige[felt] !== hopp[felt];

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2.5 text-sm font-semibold">
        <MapPin className="h-4 w-4 text-brand" />
        Samme pakke, tre hopp
        <span className="text-xs font-normal text-muted-foreground">
          hopp {i + 1} av {sti.hopp.length}
        </span>
      </div>

      {/* Topologien */}
      <div className="flex flex-wrap items-center justify-center gap-1 border-b px-4 py-4">
        {NODER.map((n, idx) => {
          const Ikon = n.Ikon;
          const aktivLenke = idx === i || idx === i + 1;
          return (
            <div key={n.navn} className="flex items-center gap-1">
              <div
                className={cn(
                  "flex min-w-[5.5rem] flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-colors",
                  aktivLenke ? "border-brand bg-brand/10" : "border-border bg-background",
                )}
              >
                <Ikon
                  className={cn("h-4 w-4", aktivLenke ? "text-brand" : "text-muted-foreground")}
                />
                <span className="text-center text-[10px] leading-tight text-foreground">
                  {n.navn}
                </span>
              </div>
              {idx < NODER.length - 1 && (
                <ArrowRight
                  className={cn(
                    "h-4 w-4 shrink-0",
                    idx === i ? "text-brand" : "text-muted-foreground/40",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4">
        <p className="mb-3 text-sm font-medium">{hopp.beskrivelse}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Felt
            lag="Lenkelaget"
            etikett="Kilde-MAC → mål-MAC"
            verdi={`${hopp.kildeMac} → ${hopp.maalMac}`}
            endret={endret("kildeMac") || endret("maalMac")}
          />
          <Felt
            lag="Nettverkslaget"
            etikett="Kilde-IP → mål-IP"
            verdi={`${hopp.kildeIp} → ${hopp.maalIp}`}
            endret={endret("kildeIp") || endret("maalIp")}
          />
          <Felt
            lag="Transportlaget"
            etikett="Kildeport → målport"
            verdi={`${hopp.kildePort} → ${hopp.maalPort}`}
            endret={false}
          />
          <Felt
            lag="Applikasjonslaget"
            etikett="Innholdet"
            verdi="Uendret hele veien"
            endret={false}
          />
        </div>

        {forrige && (
          <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-[12px] leading-snug">
            <span className="font-medium">Hva ruteren nettopp gjorde:</span> den skrellet av hele
            Ethernet-rammen, kikket på mål-IP for å velge vei, og pakket det samme IP-innholdet inn
            i en helt ny ramme med to nye MAC-adresser. IP-pakken inni er bit for bit den samme —
            bortsett fra TTL, som gikk ned med én.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40"
        >
          Forrige hopp
        </button>
        <button
          onClick={() => setI((v) => Math.min(sti.hopp.length - 1, v + 1))}
          disabled={i === sti.hopp.length - 1}
          className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90 disabled:opacity-40"
        >
          Neste hopp
        </button>
      </div>

      {i === sti.hopp.length - 1 && (
        <div className="grid gap-3 border-t px-4 py-4 sm:grid-cols-2">
          <div className="rounded-lg border border-success/30 bg-success/5 p-3">
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-success">
              Uendret hele veien
            </h4>
            <ul className="space-y-1 text-[12px] leading-snug text-muted-foreground">
              {sti.uendret.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Byttet ut i hvert hopp
            </h4>
            <ul className="space-y-1 text-[12px] leading-snug text-muted-foreground">
              {sti.endret.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Felt({
  lag,
  etikett,
  verdi,
  endret,
}: {
  lag: string;
  etikett: string;
  verdi: string;
  endret: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        endret ? "border-amber-500/60 bg-amber-500/10" : "border-border bg-background",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{lag}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{etikett}</div>
      <div className="mt-1 break-all font-mono text-[12px] text-foreground">{verdi}</div>
      {endret && (
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          endret i dette hoppet
        </div>
      )}
    </div>
  );
}
