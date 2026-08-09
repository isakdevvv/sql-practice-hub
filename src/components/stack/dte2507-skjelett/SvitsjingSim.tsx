import { useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { sammenlignSvitsjing } from "@/lib/dte2507/skjelettEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 2 — GUIDET SIMULERING, del tre.
//
// Dekker atom 2 i planen, som var et rent hull: pakke-svitsjing mot
// krets-svitsjing. Alle tallene kommer fra `sammenlignSvitsjing()`; komponenten
// gjør ingen regning selv.
// ---------------------------------------------------------------------------

export function SvitsjingSim() {
  const [brukere, setBrukere] = useState(3000);
  const [aktivProsent, setAktivProsent] = useState(10);

  const r = useMemo(
    () => sammenlignSvitsjing(1000, brukere, aktivProsent / 100, 1),
    [brukere, aktivProsent],
  );

  const kretsOk = brukere <= r.kretsMaksBrukere;
  const risiko = r.sannsynlighetOverbelastning;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2.5 text-sm font-semibold">
        <Share2 className="h-4 w-4 text-brand" />
        Én lenke på 1 Gb/s — hvor mange får plass?
      </div>

      <div className="grid gap-4 border-b px-4 py-4 sm:grid-cols-2">
        <label className="text-xs">
          <span className="mb-1 block font-medium text-foreground">
            Antall brukere: <span className="tabular-nums">{brukere}</span>
          </span>
          <input
            type="range"
            min={100}
            max={6000}
            step={100}
            value={brukere}
            onChange={(e) => setBrukere(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-medium text-foreground">
            Aktiv andel av tiden: <span className="tabular-nums">{aktivProsent} %</span>
          </span>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={aktivProsent}
            onChange={(e) => setAktivProsent(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </label>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2">
        {/* Krets */}
        <div
          className={`rounded-lg border p-4 ${
            kretsOk ? "border-success/40 bg-success/5" : "border-rose-500/40 bg-rose-500/10"
          }`}
        >
          <h4 className="text-sm font-semibold text-foreground">Krets-svitsjing</h4>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            Hver bruker får 1 Mb/s reservert, permanent, uansett om hen sender eller sitter helt
            stille.
          </p>
          <div className="mt-3 text-2xl font-bold tabular-nums text-foreground">
            {r.kretsMaksBrukere}
          </div>
          <div className="text-[11px] text-muted-foreground">brukere er absolutt taket</div>
          <div
            className={`mt-2 text-[12px] font-medium ${
              kretsOk ? "text-success" : "text-rose-600 dark:text-rose-300"
            }`}
          >
            {kretsOk
              ? `${brukere} brukere får plass — men ${Math.round(
                  brukere * (1 - aktivProsent / 100),
                )} av kretsene står i snitt ubrukt.`
              : `${brukere} brukere er for mange. ${brukere - r.kretsMaksBrukere} av dem får blankt avslag, selv når lenken i praksis er nesten tom.`}
          </div>
        </div>

        {/* Pakke */}
        <div
          className={`rounded-lg border p-4 ${
            risiko < 0.01 ? "border-success/40 bg-success/5" : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          <h4 className="text-sm font-semibold text-foreground">Pakke-svitsjing</h4>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            Ingenting reserveres. Lenken deles etter hvem som faktisk sender akkurat nå.
          </p>
          <div className="mt-3 text-2xl font-bold tabular-nums text-foreground">
            {r.forventetAktive.toFixed(0)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            aktive samtidig i snitt (lenken tåler {r.taalerAktive})
          </div>
          <div
            className={`mt-2 text-[12px] font-medium ${
              risiko < 0.01 ? "text-success" : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {risiko < 1e-6
              ? "Sannsynligheten for at flere enn lenken tåler sender samtidig er under én i en million."
              : `Sannsynlighet for overbelastning: ${(risiko * 100).toFixed(2)} %.`}
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30 px-4 py-4 text-[12px] leading-relaxed">
        <p>
          <span className="font-medium">Prøv dette:</span> sett antall brukere til 3000 og la den
          aktive andelen stå på 10 %. Krets-svitsjing avviser 2000 av dem. Pakke-svitsjing betjener
          alle sammen, med forsvinnende liten risiko — fordi 3000 brukere som er aktive 10 % av
          tiden gir 300 aktive i snitt, ikke 3000.
        </p>
        <p className="mt-2">
          Skru så den aktive andelen opp mot 100 %. Da forsvinner hele fordelen: når alle sender
          hele tiden, finnes det ingen ledig kapasitet å låne bort, og pakke-svitsjing blir bare
          krets-svitsjing med kø på toppen.
        </p>
        <p className="mt-2 font-medium">
          Det er denne satsingen internett er bygget på: at ikke alle møter opp samtidig.
        </p>
      </div>
    </div>
  );
}
