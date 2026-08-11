import { useState } from "react";
import { cn } from "@/lib/utils";
import { Monitor, Server, ArrowRight, Info } from "lucide-react";

// ---------------------------------------------------------------------------
// X Window System — klient og tjener, tegnet.
//
// Retningen er det eneste virkelig kontraintuitive i X, og en tegning gjør den
// åpenbar på en måte ingen tekst klarer: X-TJENEREN står der SKJERMEN er.
// Tre scenarier, samme modell, slik at studenten ser at det er én mekanisme og
// ikke tre spesialtilfeller.
// ---------------------------------------------------------------------------

type Scenario = "lokal" | "ssh-uten" | "ssh-med";

const SCENARIER: Record<
  Scenario,
  {
    navn: string;
    display: string;
    /** Kjører programmet lokalt eller på fjernmaskinen? */
    klientPaaFjern: boolean;
    /** Kommer vinduet fram? */
    virker: boolean;
    kommando: string;
    forklaring: string;
  }
> = {
  lokal: {
    navn: "Alt på egen maskin",
    display: ":0",
    klientPaaFjern: false,
    virker: true,
    kommando: "xeyes",
    forklaring:
      "Programmet og X-tjeneren er på samme maskin. De snakker likevel sammen over X-protokollen — bare gjennom en lokal kanal i stedet for over nettet. Det er nettopp fordi det ALLTID er en protokoll at de to kan skilles senere.",
  },
  "ssh-uten": {
    navn: "ssh uten -X",
    display: "(tom)",
    klientPaaFjern: true,
    virker: false,
    kommando: "ssh student@login.uit.no  →  xeyes",
    forklaring:
      "Programmet kjører på fjernmaskinen, men DISPLAY er tom: det finnes ingen adresse til noen X-tjener. Programmet nekter å starte med «Can't open display». Fjernmaskinen kan ikke bare nå skjermen din — det ville vært et sikkerhetshull uten sidestykke.",
  },
  "ssh-med": {
    navn: "ssh -X (X-videresending)",
    display: "localhost:10.0",
    klientPaaFjern: true,
    virker: true,
    kommando: "ssh -X student@login.uit.no  →  xeyes",
    forklaring:
      "SSH lager en tunnel og setter DISPLAY til localhost:10.0 på fjernmaskinen. Programmet tror det snakker med en lokal X-tjener; i virkeligheten går trafikken kryptert gjennom SSH-forbindelsen og kommer ut hos deg. Beregningen skjer på tjeneren, tegningen på skjermen din.",
  },
};

export function XKlientTjener() {
  const [valgt, setValgt] = useState<Scenario>("lokal");
  const sc = SCENARIER[valgt];

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap gap-1.5 border-b px-4 py-2.5">
        {(Object.keys(SCENARIER) as Scenario[]).map((k) => (
          <button
            key={k}
            onClick={() => setValgt(k)}
            className={cn(
              "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
              valgt === k ? "border-brand bg-brand/10 text-brand" : "hover:bg-accent",
            )}
          >
            {SCENARIER[k].navn}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <svg viewBox="0 0 560 220" className="h-auto w-full min-w-[30rem]" role="img" aria-label={`X-modellen: ${sc.navn}`}>
            {/* --- din maskin --- */}
            <rect x="8" y="24" width="230" height="180" rx="10" className="fill-sky-500/5 stroke-sky-500/50" />
            <text x="20" y="44" className="fill-current text-[12px] font-semibold">
              Din laptop
            </text>
            <text x="20" y="58" className="fill-muted-foreground text-[10px]">
              skjerm · tastatur · mus
            </text>

            {/* X-tjeneren bor alltid her */}
            <rect x="24" y="70" width="128" height="52" rx="6" className="fill-sky-500/25 stroke-sky-500" strokeWidth="2" />
            <text x="88" y="90" textAnchor="middle" className="fill-current text-[11px] font-semibold">
              X-TJENEREN
            </text>
            <text x="88" y="103" textAnchor="middle" className="fill-muted-foreground text-[9px]">
              eier skjermen
            </text>
            <text x="88" y="114" textAnchor="middle" className="fill-muted-foreground text-[9px]">
              DISPLAY = :0
            </text>

            {/* vinduet som tegnes */}
            <rect
              x="24"
              y="134"
              width="128"
              height="52"
              rx="6"
              className={cn(
                sc.virker ? "fill-emerald-500/20 stroke-emerald-500/70" : "fill-muted/40 stroke-border",
              )}
              strokeDasharray={sc.virker ? undefined : "4 3"}
            />
            <text x="88" y="158" textAnchor="middle" className="fill-current text-[10px]">
              {sc.virker ? "vinduet vises" : "ingen vindu"}
            </text>
            <text x="88" y="172" textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {sc.virker ? "her ser du det" : "Can't open display"}
            </text>

            {/* klienten lokalt (bare i lokal-scenariet) */}
            {!sc.klientPaaFjern && (
              <>
                <rect x="164" y="70" width="62" height="52" rx="6" className="fill-violet-500/20 stroke-violet-500/70" />
                <text x="195" y="92" textAnchor="middle" className="fill-current text-[10px] font-medium">
                  klient
                </text>
                <text x="195" y="105" textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  xeyes
                </text>
                <line x1="164" y1="96" x2="154" y2="96" className="stroke-violet-500" strokeWidth="1.5" markerEnd="url(#pil)" />
              </>
            )}

            {/* --- fjernmaskinen --- */}
            <rect x="322" y="24" width="230" height="180" rx="10" className="fill-amber-500/5 stroke-amber-500/50" />
            <text x="334" y="44" className="fill-current text-[12px] font-semibold">
              login.uit.no
            </text>
            <text x="334" y="58" className="fill-muted-foreground text-[10px]">
              ingen skjerm i det hele tatt
            </text>

            {sc.klientPaaFjern && (
              <>
                <rect x="338" y="70" width="130" height="52" rx="6" className="fill-violet-500/20 stroke-violet-500/70" strokeWidth="2" />
                <text x="403" y="90" textAnchor="middle" className="fill-current text-[11px] font-semibold">
                  KLIENTEN
                </text>
                <text x="403" y="103" textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  xeyes kjører her
                </text>
                <text x="403" y="114" textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  DISPLAY = {sc.display}
                </text>
              </>
            )}

            {/* --- forbindelsen mellom maskinene --- */}
            {sc.klientPaaFjern && (
              <>
                <path
                  d="M338 96 C 300 96, 290 96, 246 96"
                  className={cn("fill-none", sc.virker ? "stroke-emerald-500" : "stroke-rose-500/60")}
                  strokeWidth="2"
                  strokeDasharray={sc.virker ? undefined : "5 4"}
                  markerEnd={sc.virker ? "url(#pilgronn)" : undefined}
                />
                <text
                  x="292"
                  y="86"
                  textAnchor="middle"
                  className={cn("text-[9px]", sc.virker ? "fill-emerald-600 dark:fill-emerald-400" : "fill-rose-500")}
                >
                  {sc.virker ? "SSH-tunnel" : "ingen vei"}
                </text>
                <text x="292" y="112" textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  {sc.virker ? "kryptert" : "DISPLAY er tom"}
                </text>
              </>
            )}

            <defs>
              <marker id="pil" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="fill-violet-500" />
              </marker>
              <marker id="pilgronn" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="fill-emerald-500" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-2.5 text-sm">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Monitor className="h-3 w-3" /> X-tjeneren
            </div>
            <div className="mt-0.5 leading-relaxed">
              Alltid der skjermen er. Den «tjener» maskinvaren: alle som vil tegne noe, må spørre den.
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-2.5 text-sm">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <Server className="h-3 w-3" /> Klienten
            </div>
            <div className="mt-0.5 leading-relaxed">
              Selve programmet. Kan kjøre hvor som helst — også på en maskin uten skjerm.
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-2 font-mono text-xs">
          <span className="text-brand">$</span>
          <span className="break-all">{sc.kommando}</span>
          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className={cn(sc.virker ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
            DISPLAY={sc.display}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-2 rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm leading-relaxed">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          <span>{sc.forklaring}</span>
        </div>
      </div>
    </div>
  );
}
