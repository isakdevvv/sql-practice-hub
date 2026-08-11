import { useState } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Visuell sammenligning av de tre pakkeformatene. Poenget er ikke en tabell med
// egenskaper, men å SE hvor bibliotekene bor — det er den ene forskjellen alle
// de andre følger av.
// ---------------------------------------------------------------------------

type Format = "deb" | "snap" | "flatpak";

const FORMATER: Record<
  Format,
  {
    navn: string;
    farge: string;
    /** Hvor kommer den fra? */
    kilde: string;
    /** Hva er med i pakken? */
    innhold: string;
    sandkasse: string;
    oppdatering: string;
    konsekvens: string;
    kommando: string;
  }
> = {
  deb: {
    navn: ".deb via apt",
    farge: "sky",
    kilde: "Et pakkearkiv i /etc/apt/sources.list — Ubuntu sitt, et PPA, eller en tredjepart.",
    innhold: "Bare programmet. Bibliotekene deles med alt annet på systemet.",
    sandkasse: "Ingen. Programmet har samme tilgang som deg.",
    oppdatering: "apt upgrade, sammen med alt annet.",
    konsekvens:
      "Liten pakke, rask oppstart, ett felles bibliotek å sikkerhetsoppdatere. Men pakken er bundet til akkurat din distribusjonsversjon, og en biblioteksoppgradering kan brekke den.",
    kommando: "sudo apt install obs-studio",
  },
  snap: {
    navn: "snap",
    farge: "orange",
    kilde: "Snap Store — ett innebygd arkiv, ingen kildeliste å redigere.",
    innhold: "Programmet OG alle bibliotekene det trenger, i én komprimert filsystemfil.",
    sandkasse:
      "Ja, som standard. Programmet ser bare det den har fått lov til. --classic slår den av.",
    oppdatering: "Automatisk i bakgrunnen, uten at du ber om det.",
    konsekvens:
      "Samme pakke virker på alle distribusjoner, og en systemoppdatering kan ikke ødelegge den. Prisen er diskplass, minne og treg første oppstart. Følger med Ubuntu ferdig installert.",
    kommando: "sudo snap install code --classic",
  },
  flatpak: {
    navn: "flatpak",
    farge: "teal",
    kilde: "Et fjernarkiv du selv legger til — nesten alltid flathub.",
    innhold:
      "Programmet, pluss en delt kjøretidsplattform (runtime) som flere flatpak-programmer bruker sammen.",
    sandkasse: "Ja. Tilgang til filer og enheter styres per program med portaler.",
    oppdatering: "flatpak update, som du kjører selv.",
    konsekvens:
      "Som snap, men den delte plattformen sparer plass når du har mange av dem. Må installeres med apt først, og trenger et fjernarkiv før den kan noe som helst.",
    kommando: "flatpak install flathub org.gimp.GIMP",
  },
};

const FARGE: Record<string, { ring: string; fyll: string; tekst: string }> = {
  sky: { ring: "border-sky-500/60", fyll: "bg-sky-500/10", tekst: "text-sky-700 dark:text-sky-300" },
  orange: {
    ring: "border-orange-500/60",
    fyll: "bg-orange-500/10",
    tekst: "text-orange-700 dark:text-orange-300",
  },
  teal: { ring: "border-teal-500/60", fyll: "bg-teal-500/10", tekst: "text-teal-700 dark:text-teal-300" },
};

export function FormatSammenligner() {
  const [valgt, setValgt] = useState<Format>("deb");
  const f = FORMATER[valgt];
  const farge = FARGE[f.farge];

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap gap-1.5 border-b px-4 py-2.5">
        {(Object.keys(FORMATER) as Format[]).map((k) => {
          const c = FARGE[FORMATER[k].farge];
          return (
            <button
              key={k}
              onClick={() => setValgt(k)}
              className={cn(
                "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
                valgt === k ? cn(c.ring, c.fyll, c.tekst) : "hover:bg-accent",
              )}
            >
              {FORMATER[k].navn}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {/* Tegningen: hvor bor bibliotekene */}
        <div className="overflow-x-auto">
          <svg viewBox="0 0 520 150" className="h-auto w-full min-w-[26rem]" role="img" aria-label={`Hvordan ${f.navn} er bygget opp`}>
            <rect x="1" y="1" width="518" height="148" rx="8" className="fill-none stroke-border" />
            {/* systemet */}
            <rect x="14" y="96" width="492" height="40" rx="5" className="fill-muted/60 stroke-border" />
            <text x="24" y="121" className="fill-muted-foreground text-[11px]">
              Systemets delte biblioteker (/usr/lib)
            </text>

            {valgt === "deb" ? (
              <>
                <rect x="180" y="24" width="160" height="44" rx="5" className="fill-sky-500/20 stroke-sky-500/70" />
                <text x="260" y="51" textAnchor="middle" className="fill-current text-[12px] font-medium">
                  programmet
                </text>
                <line x1="230" y1="68" x2="200" y2="96" className="stroke-sky-500/70" strokeWidth="1.5" />
                <line x1="260" y1="68" x2="260" y2="96" className="stroke-sky-500/70" strokeWidth="1.5" />
                <line x1="290" y1="68" x2="320" y2="96" className="stroke-sky-500/70" strokeWidth="1.5" />
                <text x="352" y="86" className="fill-muted-foreground text-[10px]">
                  låner bibliotekene nedenfra
                </text>
              </>
            ) : valgt === "snap" ? (
              <>
                <rect x="150" y="14" width="220" height="70" rx="6" className="fill-orange-500/10 stroke-orange-500/70" strokeDasharray="4 3" />
                <text x="260" y="29" textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  sandkasse
                </text>
                <rect x="166" y="36" width="90" height="36" rx="4" className="fill-orange-500/25 stroke-orange-500/70" />
                <text x="211" y="59" textAnchor="middle" className="fill-current text-[11px] font-medium">
                  programmet
                </text>
                <rect x="264" y="36" width="90" height="36" rx="4" className="fill-orange-500/15 stroke-orange-500/60" />
                <text x="309" y="53" textAnchor="middle" className="fill-current text-[10px]">
                  egne
                </text>
                <text x="309" y="65" textAnchor="middle" className="fill-current text-[10px]">
                  biblioteker
                </text>
                <text x="382" y="86" className="fill-muted-foreground text-[10px]">
                  rører ikke systemet
                </text>
              </>
            ) : (
              <>
                <rect x="150" y="10" width="220" height="74" rx="6" className="fill-teal-500/10 stroke-teal-500/70" strokeDasharray="4 3" />
                <text x="260" y="24" textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  sandkasse
                </text>
                <rect x="166" y="30" width="188" height="24" rx="4" className="fill-teal-500/25 stroke-teal-500/70" />
                <text x="260" y="47" textAnchor="middle" className="fill-current text-[11px] font-medium">
                  programmet
                </text>
                <rect x="166" y="58" width="188" height="20" rx="4" className="fill-teal-500/15 stroke-teal-500/60" />
                <text x="260" y="72" textAnchor="middle" className="fill-current text-[10px]">
                  delt kjøretidsplattform (runtime)
                </text>
                <text x="382" y="86" className="fill-muted-foreground text-[10px]">
                  deles med andre
                </text>
                <text x="382" y="97" className="fill-muted-foreground text-[10px]">
                  flatpak-programmer
                </text>
              </>
            )}
          </svg>
        </div>

        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Felt navn="Hentes fra" verdi={f.kilde} />
          <Felt navn="Hva ligger i pakken" verdi={f.innhold} />
          <Felt navn="Sandkasse" verdi={f.sandkasse} />
          <Felt navn="Oppdateres" verdi={f.oppdatering} />
        </dl>

        <div className={cn("mt-3 rounded-lg border p-3 text-sm leading-relaxed", farge.ring, farge.fyll)}>
          <span className="font-semibold">Konsekvensen:</span> {f.konsekvens}
        </div>

        <code className="mt-2 block break-all rounded-md border bg-muted/50 px-2 py-1.5 font-mono text-xs">
          {f.kommando}
        </code>
      </div>
    </div>
  );
}

function Felt({ navn, verdi }: { navn: string; verdi: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{navn}</dt>
      <dd className="mt-0.5 leading-relaxed">{verdi}</dd>
    </div>
  );
}
