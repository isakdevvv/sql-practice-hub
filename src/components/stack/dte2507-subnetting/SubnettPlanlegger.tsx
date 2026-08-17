import { useMemo, useState } from "react";
import { Scissors, Merge, RotateCcw, CheckCircle2, AlertTriangle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// SUBNETT-PLANLEGGER — adresserommet som noe romlig, ikke som et regnestykke.
//
// Hvorfor denne finnes ved siden av SubnetCalculator og VlsmTrainer:
//   * SubnetCalculator svarer på «hva er broadcast for X/Y» — den regner, men
//     viser aldri hvor et subnett LIGGER i forhold til de andre.
//   * VlsmTrainer stiller åtte tekstspørsmål om enkeltsubnett. Ingen av dem
//     handler faktisk om VLSM (Variable Length Subnet Masking) — altså å dele
//     ett block i subnett av ULIK størrelse.
//
// Det som mangler er nettopp den delen studenter bommer på til eksamen: å se at
// blokker må være 2-potenser, at de må ligge på en adresse som er delelig med
// sin egen størrelse (alignment), og at et krav på 50 verter tvinger deg opp
// til /26 — ikke /27.
//
// INTERAKSJONSVALG (bevisst):
// Å dra i delelinjer ble vurdert og forkastet. En aligned blokk på 2^k adresser
// kan bare deles på midten; enhver annen grense gir biter som ikke er
// 2-potenser, og som derfor ikke er gyldige subnett i det hele tatt. En
// delelinje mellom to søsken har altså nøyaktig én lovlig posisjon — å dra den
// ville vært en løgn om hvordan subnetting virker.
//
// Derfor: klikk for å DELE (den ekte binære operasjonen), og dra der drag hører
// hjemme — å tildele en avdelings vertskrav til en blokk. Det er allokeringen
// som er den egentlige VLSM-oppgaven.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Adresse-hjelpere
// ---------------------------------------------------------------------------

function ipToString(val: number): string {
  return [(val >>> 24) & 0xff, (val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff].join(".");
}

/** Antall adresser totalt i et prefiks. /24 → 256. */
function sizeOf(prefix: number): number {
  return 2 ** (32 - prefix);
}

/**
 * Brukbare vertsadresser. Nett- og broadcast-adressen er opptatt, derfor −2.
 * /31 og /32 er spesialtilfeller (punkt-til-punkt og enkeltvert) uten
 * broadcast, men vi stopper delingen på /30 her for å holde modellen ren.
 */
function usableHosts(prefix: number): number {
  const total = sizeOf(prefix);
  return total > 2 ? total - 2 : 0;
}

/** Minste prefiks (altså største blokk-nummer) som rommer n verter. */
function prefixForHosts(n: number): number {
  for (let p = 30; p >= 0; p--) {
    if (usableHosts(p) >= n) return p;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Modell
// ---------------------------------------------------------------------------

/**
 * En blokk er alltid aligned: `base` er delelig med `sizeOf(prefix)`. Det
 * holdes sant av konstruksjon — vi lager kun nye blokker ved å dele en
 * eksisterende i to like halvdeler, og slår kun sammen ekte søsken.
 */
type Block = {
  id: string;
  base: number;
  prefix: number;
  /** id-en til kravet som er tildelt denne blokka, hvis noe. */
  krav: string | null;
};

type Krav = {
  id: string;
  navn: string;
  verter: number;
  farge: string;
};

const ROT_BASE = (192 << 24) | (168 << 16) | (1 << 8);
const ROT_PREFIX = 24;

const KRAV: Krav[] = [
  { id: "salg", navn: "Salg", verter: 50, farge: "bg-sky-500" },
  { id: "utvikling", navn: "Utvikling", verter: 25, farge: "bg-violet-500" },
  { id: "drift", navn: "Drift", verter: 10, farge: "bg-amber-500" },
  { id: "gjest", navn: "Gjestenett", verter: 100, farge: "bg-emerald-500" },
];

function nyRot(): Block[] {
  return [{ id: "b0", base: ROT_BASE, prefix: ROT_PREFIX, krav: null }];
}

/** To blokker er søsken hvis de kom fra samme deling. */
function erSosken(a: Block, b: Block): boolean {
  if (a.prefix !== b.prefix) return false;
  const storrelse = sizeOf(a.prefix);
  const forelderStorrelse = storrelse * 2;
  // Samme forelder, og a må være den nedre halvdelen.
  return (
    Math.floor(a.base / forelderStorrelse) === Math.floor(b.base / forelderStorrelse) &&
    a.base + storrelse === b.base
  );
}

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------

export function SubnettPlanlegger() {
  const [blocks, setBlocks] = useState<Block[]>(nyRot);
  const [drarKrav, setDrarKrav] = useState<string | null>(null);
  const [overBlokk, setOverBlokk] = useState<string | null>(null);
  const [valgt, setValgt] = useState<string | null>(null);

  const totalStorrelse = sizeOf(ROT_PREFIX);

  function del(id: string) {
    setBlocks((prev) =>
      prev.flatMap((b) => {
        if (b.id !== id) return [b];
        if (b.prefix >= 30) return [b];
        const nyPrefix = b.prefix + 1;
        const halv = sizeOf(nyPrefix);
        return [
          { id: b.id + "a", base: b.base, prefix: nyPrefix, krav: null },
          { id: b.id + "b", base: b.base + halv, prefix: nyPrefix, krav: null },
        ];
      }),
    );
    setValgt(null);
  }

  function slaSammen(id: string) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i === -1) return prev;
      // Finn naboen som er ekte søsken — enten til venstre eller høyre.
      for (const j of [i - 1, i + 1]) {
        if (j < 0 || j >= prev.length) continue;
        const [lav, hoy] = i < j ? [prev[i], prev[j]] : [prev[j], prev[i]];
        if (!erSosken(lav, hoy)) continue;
        const forelder: Block = {
          id: lav.id.slice(0, -1),
          base: lav.base,
          prefix: lav.prefix - 1,
          krav: null,
        };
        const utenBegge = prev.filter((b) => b.id !== lav.id && b.id !== hoy.id);
        return [...utenBegge, forelder].sort((a, b) => a.base - b.base);
      }
      return prev;
    });
    setValgt(null);
  }

  function tildel(blokkId: string, kravId: string) {
    setBlocks((prev) =>
      prev.map((b) => {
        // Et krav kan bare ligge ett sted — fjern det fra en eventuell gammel blokk.
        if (b.krav === kravId) return { ...b, krav: null };
        return b;
      }).map((b) => (b.id === blokkId ? { ...b, krav: kravId } : b)),
    );
  }

  function fjernTildeling(blokkId: string) {
    setBlocks((prev) => prev.map((b) => (b.id === blokkId ? { ...b, krav: null } : b)));
  }

  function nullstill() {
    setBlocks(nyRot());
    setValgt(null);
  }

  const kravPlassert = useMemo(
    () => new Set(blocks.map((b) => b.krav).filter((k): k is string => k !== null)),
    [blocks],
  );

  /** Status per blokk: passer kravet, for lite, eller mye sløsing? */
  function vurder(b: Block): { status: "tom" | "ok" | "for-liten" | "sloseri"; tekst: string } {
    if (!b.krav) return { status: "tom", tekst: "" };
    const krav = KRAV.find((k) => k.id === b.krav)!;
    const plass = usableHosts(b.prefix);
    if (plass < krav.verter) {
      const trengs = prefixForHosts(krav.verter);
      return {
        status: "for-liten",
        tekst: `/${b.prefix} gir ${plass} brukbare adresser — ${krav.navn} trenger ${krav.verter}. Du må opp til /${trengs}.`,
      };
    }
    // Sløsing hvis neste mindre blokk også ville holdt.
    if (b.prefix < 30 && usableHosts(b.prefix + 1) >= krav.verter) {
      return {
        status: "sloseri",
        tekst: `Passer, men /${b.prefix + 1} ville også holdt (${usableHosts(b.prefix + 1)} ≥ ${krav.verter}). Du kaster bort ${plass - usableHosts(b.prefix + 1)} adresser.`,
      };
    }
    return { status: "ok", tekst: `${plass} brukbare adresser til ${krav.verter} verter — tettest mulige passform.` };
  }

  const alleVurderinger = blocks.map(vurder);
  const alleKravPlassert = KRAV.every((k) => kravPlassert.has(k.id));
  const ingenFeil = alleVurderinger.every((v) => v.status !== "for-liten");
  const ingenSloseri = alleVurderinger.every((v) => v.status !== "sloseri");
  const lost = alleKravPlassert && ingenFeil && ingenSloseri;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2.5">
        <div className="text-sm font-semibold text-foreground">
          Subnett-planlegger — del opp {ipToString(ROT_BASE)}/{ROT_PREFIX}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          Klikk en blokk for å dele den i to. Dra en avdeling fra lista ned på en blokk for å
          tildele den. Målet er å få plass til alle fire uten å sløse.
        </div>
      </div>

      {/* Kravene — dra herfra */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Avdelinger som skal ha plass — dra dem ned på en blokk
        </div>
        <div className="flex flex-wrap gap-2">
          {KRAV.map((k) => {
            const plassert = kravPlassert.has(k.id);
            return (
              <div
                key={k.id}
                draggable
                onDragStart={() => setDrarKrav(k.id)}
                onDragEnd={() => {
                  setDrarKrav(null);
                  setOverBlokk(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs cursor-grab active:cursor-grabbing select-none transition-opacity",
                  plassert
                    ? "border-border bg-muted/50 opacity-50"
                    : "border-border bg-background hover:border-brand/50",
                  drarKrav === k.id && "opacity-40",
                )}
              >
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className={cn("h-2.5 w-2.5 rounded-full", k.farge)} />
                <span className="font-medium text-foreground">{k.navn}</span>
                <span className="text-muted-foreground">{k.verter} verter</span>
                <span className="text-[10px] text-muted-foreground">
                  → minst /{prefixForHosts(k.verter)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selve adresserommet */}
      <div className="px-4 py-4">
        <div className="flex text-[10px] text-muted-foreground mb-1 justify-between font-mono">
          <span>{ipToString(ROT_BASE)}</span>
          <span>{ipToString(ROT_BASE + totalStorrelse - 1)}</span>
        </div>

        <div className="flex w-full h-24 rounded-lg overflow-hidden border border-border">
          {blocks.map((b, i) => {
            const bredde = (sizeOf(b.prefix) / totalStorrelse) * 100;
            const krav = b.krav ? KRAV.find((k) => k.id === b.krav)! : null;
            const v = alleVurderinger[i];
            const erOver = overBlokk === b.id;
            return (
              <div
                key={b.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverBlokk(b.id);
                }}
                onDragLeave={() => setOverBlokk((o) => (o === b.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (drarKrav) tildel(b.id, drarKrav);
                  setDrarKrav(null);
                  setOverBlokk(null);
                }}
                onClick={() => setValgt(valgt === b.id ? null : b.id)}
                style={{ width: `${bredde}%` }}
                // Smale blokker (/28 og mindre er under 7 % av stripa) har ikke
                // plass til tekst. Tittelen gjør dem lesbare på hover, slik at
                // man slipper å gjette hva en tynn stripe er.
                title={[
                  `${ipToString(b.base)}/${b.prefix}`,
                  `${sizeOf(b.prefix)} adresser, ${usableHosts(b.prefix)} brukbare`,
                  `${ipToString(b.base)} – ${ipToString(b.base + sizeOf(b.prefix) - 1)}`,
                  krav ? `Tildelt: ${krav.navn} (${krav.verter} verter)` : "Ikke tildelt",
                ].join("\n")}
                className={cn(
                  "relative flex flex-col items-center justify-center border-r border-border last:border-r-0 cursor-pointer transition-colors overflow-hidden",
                  krav ? "" : "bg-muted/20 hover:bg-muted/40",
                  erOver && "ring-2 ring-inset ring-brand",
                  valgt === b.id && "bg-brand/10",
                  v.status === "for-liten" && "bg-rose-500/20",
                  v.status === "sloseri" && "bg-amber-500/15",
                  v.status === "ok" && "bg-emerald-500/15",
                )}
              >
                {krav && (
                  <span className={cn("absolute top-0 left-0 right-0 h-1", krav.farge)} />
                )}
                <span className="font-mono text-[10px] font-semibold text-foreground truncate max-w-full px-1">
                  /{b.prefix}
                </span>
                {bredde > 10 && (
                  <span className="font-mono text-[9px] text-muted-foreground truncate max-w-full px-1">
                    {ipToString(b.base)}
                  </span>
                )}
                {krav && bredde > 11 && (
                  <span className="text-[9px] font-medium text-foreground truncate max-w-full px-1">
                    {krav.navn}
                  </span>
                )}
                {bredde > 8 && (
                  <span className="text-[9px] text-muted-foreground">
                    {usableHosts(b.prefix)} verter
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-muted-foreground mt-1.5">
          Bredden på hver blokk er proporsjonal med hvor mange adresser den faktisk eier. Det er
          derfor en /25 er nøyaktig halve stripa, og en /28 er en sekstendedel.
        </div>
      </div>

      {/* Handlinger for valgt blokk */}
      {valgt && (
        <div className="px-4 pb-3">
          {(() => {
            const b = blocks.find((x) => x.id === valgt);
            if (!b) return null;
            const kanDeles = b.prefix < 30;
            const harSosken = blocks.some(
              (o) => o.id !== b.id && (erSosken(b, o) || erSosken(o, b)),
            );
            return (
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono font-semibold text-foreground">
                    {ipToString(b.base)}/{b.prefix}
                  </span>
                  <span className="text-muted-foreground">
                    {sizeOf(b.prefix)} adresser · {usableHosts(b.prefix)} brukbare · broadcast{" "}
                    {ipToString(b.base + sizeOf(b.prefix) - 1)}
                  </span>
                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        del(b.id);
                      }}
                      disabled={!kanDeles}
                      className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/10 px-2 py-1 text-xs font-medium text-brand hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Scissors className="h-3 w-3" /> Del i to
                    </button>
                    {harSosken && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          slaSammen(b.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:border-brand/50"
                      >
                        <Merge className="h-3 w-3" /> Slå sammen med søsken
                      </button>
                    )}
                    {b.krav && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fjernTildeling(b.id);
                        }}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:border-brand/50"
                      >
                        Fjern tildeling
                      </button>
                    )}
                  </div>
                </div>
                {!kanDeles && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Vi stopper delingen på /30 — det er den minste blokka som fortsatt har to
                    brukbare adresser, altså nok til en lenke mellom to rutere.
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tilbakemelding per tildeling */}
      {blocks.some((b) => b.krav) && (
        <div className="px-4 pb-3 space-y-1.5">
          {blocks.map((b, i) => {
            const v = alleVurderinger[i];
            if (v.status === "tom") return null;
            const krav = KRAV.find((k) => k.id === b.krav)!;
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-md border px-3 py-2 text-[11px] leading-relaxed",
                  v.status === "for-liten" && "border-rose-500/40 bg-rose-500/10",
                  v.status === "sloseri" && "border-amber-500/40 bg-amber-500/10",
                  v.status === "ok" && "border-emerald-500/40 bg-emerald-500/10",
                )}
              >
                <span className="font-mono font-semibold text-foreground">
                  {ipToString(b.base)}/{b.prefix}
                </span>{" "}
                <span className="text-muted-foreground">·</span>{" "}
                <span className="font-medium text-foreground">{krav.navn}</span> — {v.tekst}
              </div>
            );
          })}
        </div>
      )}

      {/* Fasit-stripe */}
      <div className="border-t border-border bg-muted/20 px-4 py-3 flex flex-wrap items-center gap-3">
        {lost ? (
          <div className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Løst.</strong> Alle fire avdelingene har plass, ingen blokk er for liten, og
              ingen er unødig stor. Legg merke til at blokkene ble ulikt store — det er hele poenget
              med VLSM (Variable Length Subnet Masking): før VLSM måtte alle subnett i et nett ha
              samme maske, så gjestenettet på 100 verter ville tvunget drift på 10 verter til å få
              like mye plass.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {!alleKravPlassert
                ? `${KRAV.length - kravPlassert.size} avdeling(er) mangler fortsatt plass.`
                : !ingenFeil
                  ? "Minst én blokk er for liten for avdelingen som ligger der."
                  : "Alle får plass, men minst én blokk er større enn nødvendig."}
            </span>
          </div>
        )}
        <button
          onClick={nullstill}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:border-brand/50"
        >
          <RotateCcw className="h-3 w-3" /> Start på nytt
        </button>
      </div>
    </div>
  );
}
