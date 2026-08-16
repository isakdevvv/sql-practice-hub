/**
 * Semesterplanen på tvers av alle fire fag, uke for uke.
 *
 * De fire faga har hver sin kilde til sannhet, og de er ulikt formet:
 *
 * | Fag      | Kilde                                  | Hva vi vet                       |
 * |----------|----------------------------------------|----------------------------------|
 * | DTE-2505 | `lib/dte2505/canvasModuler.ts`         | Moduler, åpningsdatoer, frister  |
 * | TEK-1501 | `lib/tek1501/framdriftsplan.ts`        | Kapittel per uke                 |
 * | DTE-2602 | `lib/dte2602/vurdering.ts`             | Vurderingsform — ingen ukeplan   |
 * | DTE-2507 | ingen                                  | Ingenting. Canvas er ikke lest.  |
 *
 * Denne fila fletter dem sammen uten å jevne ut forskjellen. Der vi ikke vet
 * noe, sier planen «ikke lest fra Canvas» i stedet for å la uka stå tom — en
 * tom uke ser ut som fri, og det er den ikke.
 */

import { CANVAS_MODULER, formatFrist } from "@/lib/dte2505/canvasModuler";
import { alleLabber } from "@/lib/dte2507/canvasLab";
import { FRAMDRIFTSPLAN } from "@/lib/tek1501/framdriftsplan";
import { EXAM_META, EXAM_SEASON_SLUGS } from "@/lib/subjects/catalog";
import { SEMESTERUKER, ukeFor, type Uke } from "./uker";

/** Fagene med eksamen denne sesongen. Samme fire som `EXAM_SEASON_SLUGS`. */
export type FagSlug = "dte-2507" | "dte-2505" | "dte-2602" | "tek-1501";

/** Hva slags hendelse dette er — styrer farge og hastegrad i visningen. */
export type Slag =
  /** Stoffet som undervises denne uka. */
  | "pensum"
  /** En innleveringsfrist. Hard. */
  | "frist"
  /** En modul låses opp i Canvas. */
  | "apner"
  /** Eksamen eller mappeinnlevering. */
  | "eksamen";

export interface Hendelse {
  fag: FagSlug;
  slag: Slag;
  /** Kort tittel, f.eks. «Oblig 2 — Kommandobasert». */
  tittel: string;
  /** Én linje utdypning, der det finnes noe å utdype. */
  detalj?: string;
  /** ISO-dato når hendelsen har en eksakt dag. Pensum-uker har ingen. */
  dato?: string;
  /**
   * Slug under `/stack/` som forbereder deg på hendelsen. Lagres som slug og
   * ikke som ferdig sti fordi ruteren er typet på `/stack/$slug`.
   */
  tilSlug?: string;
}

export interface UkePlan {
  uke: Uke;
  hendelser: Hendelse[];
}

const FAGKODE: Record<FagSlug, string> = {
  "dte-2507": "DTE-2507",
  "dte-2505": "DTE-2505",
  "dte-2602": "DTE-2602",
  "tek-1501": "TEK-1501",
};

/** Fagkoden til visning, f.eks. «DTE-2505». */
export function fagkode(fag: FagSlug): string {
  return FAGKODE[fag] ?? fag;
}

function dte2505Hendelser(): Hendelse[] {
  const ut: Hendelse[] = [];
  for (const modul of CANVAS_MODULER) {
    if (modul.apnes) {
      ut.push({
        fag: "dte-2505",
        slag: "apner",
        tittel: `Modul ${modul.id} åpner — ${modul.tittel}`,
        detalj: modul.kortOm,
        dato: modul.apnes.slice(0, 10),
        tilSlug: "dte2505-moduler",
      });
    }
    for (const oblig of modul.obliger) {
      ut.push({
        fag: "dte-2505",
        slag: "frist",
        tittel: `Oblig ${oblig.nummer} — ${oblig.tittel}`,
        detalj: `${oblig.poeng} poeng. Frist ${formatFrist(oblig.frist)} kl. 23:59.`,
        dato: oblig.frist,
        tilSlug: oblig.ovingId ? "dte2505-obliger" : "dte2505-moduler",
      });
    }
  }
  return ut;
}

function dte2507Hendelser(): Hendelse[] {
  return alleLabber().map((lab) => ({
    fag: "dte-2507" as const,
    slag: "frist" as const,
    tittel: `Lab ${lab.nummer} — ${lab.tittel}`,
    detalj: `${lab.modul}. ${lab.hva} Verktøy: ${lab.verktoy.join(", ")}.${
      lab.ubegrensedeForsok ? " Ubegrensede forsøk." : ""
    }`,
    dato: lab.frist,
    tilSlug: "dte2507-lag",
  }));
}

/** Modulnummeret i appen → slug for modulsiden som dekker kapittelet. */
const MODUL_SLUG_TEK1501: Record<string, string> = {
  "1": "tek1-modul1-data",
  "2": "tek1-modul2-sannsynlighet",
  "3": "tek1-modul3-fordelinger",
  "4": "tek1-modul4-inferens",
};

/**
 * TEK-1501 er det eneste faget med en ukeplan, så hendelsene herfra er
 * knyttet til uke og ikke til en dato — kapittel 2 undervises «i uke 34», ikke
 * «den 19. august».
 */
function tek1501Hendelser(): { uke: number; hendelse: Hendelse }[] {
  return FRAMDRIFTSPLAN.map((u) => ({
    uke: u.uke,
    hendelse: {
      fag: "tek-1501" as const,
      slag: "pensum" as const,
      tittel: u.kapittel ? `Kapittel ${u.kapittel} — ${u.tema}` : u.tema,
      detalj: u.punkter.length > 0 ? u.punkter.join(" · ") : undefined,
      tilSlug: u.modul ? MODUL_SLUG_TEK1501[u.modul] : undefined,
    },
  }));
}

function eksamensHendelser(): Hendelse[] {
  const ut: Hendelse[] = [];
  for (const fag of EXAM_SEASON_SLUGS as FagSlug[]) {
    const meta = EXAM_META[fag];
    for (const e of meta?.events ?? []) {
      const tid =
        e.kind === "skoleeksamen"
          ? [e.start && `kl. ${e.start}`, e.hours && `${e.hours} t`, e.campus]
              .filter(Boolean)
              .join(", ")
          : [e.start && `utlevering ${e.start}`, e.deadline && `innlevering ${e.deadline}`]
              .filter(Boolean)
              .join(", ");
      ut.push({
        fag,
        slag: "eksamen",
        tittel: `${fagkode(fag)} — ${e.label}`,
        detalj: tid || undefined,
        dato: e.date,
        tilSlug: fag,
      });
    }
  }
  return ut;
}

/**
 * Faga vi ikke har ukeplan for, med grunnen. Vises som en egen note i
 * visningen, ikke som tomme uker.
 */
export const UTEN_UKEPLAN: { fag: FagSlug; hvorfor: string }[] = [
  {
    fag: "dte-2507",
    hvorfor:
      "Bare modul 1 er lest fra Canvas, og bare labben i den — Lab 1 med frist 23.08. Resten av modulrekkefølgen er ukjent: lag-inndelingen i appen følger Kurose top-down, ikke emnets egen rekkefølge, og ingen frister etter Lab 1 er oppgitt.",
  },
  {
    fag: "dte-2602",
    hvorfor:
      "Emnet bruker omvendt undervisning: forelesningsvideoene legges ut fortløpende, uten fast ukeplan. Fristene på de seks programmeringsøvingene kommer i Canvas underveis. Se vurderingsformen for det som er sikkert.",
  },
];

/**
 * Hele semesteret, uke for uke. Innenfor uka sorteres hendelsene kronologisk —
 * en uke leses som en uke, ikke som en prioritert liste. Pensum har ingen dato
 * og legges sist, siden det gjelder hele uka og ikke én dag i den. Krasjer to
 * hendelser på samme dag, avgjør `RANG`: eksamen er viktigere enn en frist,
 * som er viktigere enn at en modul åpner.
 */
export function semesterPlan(): UkePlan[] {
  const tek = tek1501Hendelser();
  const datert = [...dte2505Hendelser(), ...dte2507Hendelser(), ...eksamensHendelser()];

  const RANG: Record<Slag, number> = { eksamen: 0, frist: 1, apner: 2, pensum: 3 };

  return SEMESTERUKER.map((uke): UkePlan => {
    const hendelser: Hendelse[] = [
      ...datert.filter((h) => h.dato && ukeFor(h.dato) === uke.nr),
      ...tek.filter((t) => t.uke === uke.nr).map((t) => t.hendelse),
    ].sort((a, b) => {
      // Udaterte (pensum) sist.
      if (Boolean(a.dato) !== Boolean(b.dato)) return a.dato ? -1 : 1;
      const d = (a.dato ?? "").localeCompare(b.dato ?? "");
      if (d !== 0) return d;
      return RANG[a.slag] - RANG[b.slag];
    });
    return { uke, hendelser };
  });
}

/** Planen for én uke. `undefined` utenfor uke 34–51. */
export function planForUke(nr: number): UkePlan | undefined {
  return semesterPlan().find((p) => p.uke.nr === nr);
}

/**
 * De neste hendelsene med en dato, fra og med i dag. Brukes til «det neste
 * som skjer»-lista, som er den eneste delen av planen man ser på hver dag.
 */
export function kommendeHendelser(naa: Date = new Date(), antall = 5): Hendelse[] {
  const idag = `${naa.getFullYear()}-${String(naa.getMonth() + 1).padStart(2, "0")}-${String(naa.getDate()).padStart(2, "0")}`;
  return semesterPlan()
    .flatMap((p) => p.hendelser)
    .filter((h): h is Hendelse & { dato: string } => Boolean(h.dato) && h.dato! >= idag)
    .sort((a, b) => a.dato.localeCompare(b.dato))
    .slice(0, antall);
}
