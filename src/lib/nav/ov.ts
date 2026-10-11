// ---------------------------------------------------------------------------
// nav/ov.ts — alle øvinger som én flat liste.
//
// Øv-inngangen er én liste med to filtre: fag og type. Hver rad er et
// øvingssett (ikke en enkeltoppgave) og lenker rett inn i den eksisterende
// øvingssiden, ferdig filtrert der siden støtter det. Radene utledes av
// registrene som allerede finnes — nye drills, drag-temaer og
// Python-kategorier dukker opp her uten at denne fila endres.
// ---------------------------------------------------------------------------

import { DRILLS, type DrillEntry } from "@/lib/learn/drills";
import { DRAG_EXERCISES } from "@/lib/learn/dragExercises";
import { FLASHCARDS } from "@/lib/learn/flashcards";
import { JOIN_EXERCISES } from "@/lib/learn/joinExercises";
import { SUBJECTS, countBySubject, type SubjectId } from "@/lib/learn/subjects";
import { PROBLEMS } from "@/lib/problems/data";
import { PY_EXERCISES } from "@/lib/python/exercises";
import { PY_CATEGORIES, categoryOf, type PyCategoryId } from "@/lib/python/types";
import { EXAM_SEASON_SLUGS } from "@/lib/subjects/catalog";

export const OV_TYPER = [
  { id: "oppgaver", label: "Oppgaver" },
  { id: "drill", label: "Drill" },
  { id: "puslespill", label: "Puslespill" },
  { id: "kort", label: "Kort" },
  { id: "eksamen", label: "Eksamenstrening" },
] as const;

export type OvType = (typeof OV_TYPER)[number]["id"];

export interface OvRad {
  id: string;
  tittel: string;
  beskrivelse: string;
  type: OvType;
  /** Fag-slug fra subjects/catalog. Uten fag = tverrgående (Python, verktøy). */
  fag?: string;
  href: string;
  antall?: number;
  enhet?: string;
}

function fagForDrill(d: DrillEntry): string | undefined {
  const m = /^dte(\d{4})-/.exec(d.id);
  if (m) return `dte-${m[1]}`;
  if (d.subject === "Nettverk") return "dte-2507";
  if (d.subject === "OS") return "dte-2505";
  if (d.subject === "SQL" || d.subject === "Databaser") return "dte-2509";
  return undefined;
}

const DRAG_FAG: Partial<Record<SubjectId, string>> = {
  datakomm: "dte-2507",
  os: "dte-2505",
  "ml-ai": "dte-2602",
  database: "dte-2509",
  web: "dte-2509",
  webapps2: "dte-2802",
  systemutvikling: "dte-2604",
  mobil: "dte-2603",
};

const PY_FAG: Partial<Record<PyCategoryId, string>> = {
  dte2507: "dte-2507",
  kurose: "dte-2507",
  dte2602: "dte-2602",
  "dte2501-ml": "dte-2501",
  "dte2505-os": "dte-2505",
  web: "dte-2509",
  "db-data": "dte-2509",
  "api-sec": "dte-2509",
};

function byggRader(): OvRad[] {
  const rader: OvRad[] = [];

  // --- Faste øvingssider ---------------------------------------------------
  rader.push(
    {
      id: "sql-oppgaver",
      tittel: "SQL-oppgaver",
      beskrivelse:
        "Skriv ekte spørringer mot et realistisk skjema. Resultatet sjekkes, ikke teksten.",
      type: "oppgaver",
      fag: "dte-2509",
      href: "/practice",
      antall: PROBLEMS.length,
      enhet: "oppgaver",
    },
    {
      id: "joins",
      tittel: "JOIN-trening",
      beskrivelse: "To tabeller side om side. Bytt mellom INNER, LEFT, RIGHT og FULL og se radene.",
      type: "oppgaver",
      fag: "dte-2509",
      href: "/joins",
      antall: JOIN_EXERCISES.length,
      enhet: "scenarier",
    },
    {
      id: "er-tegner",
      tittel: "ER-tegner",
      beskrivelse: "Tegn kråkefot-diagram fra bunnen og få CREATE TABLE generert.",
      type: "oppgaver",
      fag: "dte-2509",
      href: "/er-tegner",
    },
    {
      id: "mal-shell",
      tittel: "Måloppgaver i skallet",
      beskrivelse:
        "Skriv kommandoer som oppnår en tilstand: rettigheter, eierskap, umask. Alle veier godtas.",
      type: "oppgaver",
      fag: "dte-2505",
      href: "/dte2505/mal-shell",
    },
    {
      id: "linux-drill",
      tittel: "Linux-drill",
      beskrivelse:
        "Kommandolinjen i ti temaer, fra navigasjon til bash-skript. Lær først, test etterpå.",
      type: "drill",
      fag: "dte-2505",
      href: "/linux-drill",
    },
    {
      id: "pcap",
      tittel: "Pcap-quiz",
      beskrivelse: "Les Wireshark-utdrag: HTTP, TLS, DNS, ARP-spoofing og port-skanning.",
      type: "drill",
      fag: "dte-2507",
      href: "/dte2507/pcap",
    },
    {
      id: "predict",
      tittel: "Predict & Trace",
      beskrivelse: "Forutsi hva koden skriver ut før du kjører den.",
      type: "drill",
      href: "/predict",
    },
    {
      id: "eksamen-sql",
      tittel: "Tidsbasert SQL-prøve",
      beskrivelse: "10 blandede oppgaver på 20 minutter.",
      type: "eksamen",
      fag: "dte-2509",
      href: "/eksamen/trening",
    },
  );

  // --- Drills --------------------------------------------------------------
  for (const d of DRILLS) {
    // JOIN-trening har egen rad over.
    if (d.id === "joins") continue;
    rader.push({
      id: `drill-${d.id}`,
      tittel: d.title,
      beskrivelse: d.description,
      type: "drill",
      fag: fagForDrill(d),
      href: d.route,
    });
  }

  // --- Drag-puslespill, ett sett per tema ----------------------------------
  const dragAntall = countBySubject(DRAG_EXERCISES);
  for (const s of SUBJECTS) {
    const antall = dragAntall[s.id] ?? 0;
    if (antall === 0) continue;
    rader.push({
      id: `drag-${s.id}`,
      // Etikettene har fase-/fagkode i parentes («(Phase 0)», «(DTE-2507)»);
      // fagkoden står allerede i radens høyre kolonne.
      tittel: `Puslespill: ${s.label.replace(/\s*\([^)]*\)$/, "")}`,
      beskrivelse: "Koble par, sortér i riktig rekkefølge og fyll inn det som mangler.",
      type: "puslespill",
      fag: DRAG_FAG[s.id],
      href: `/drag?fag=${s.id}`,
      antall,
      enhet: "oppgaver",
    });
  }

  // --- Python, ett sett per kategori ---------------------------------------
  const pyAntall = new Map<PyCategoryId, number>();
  for (const e of PY_EXERCISES) {
    const k = categoryOf(e);
    pyAntall.set(k, (pyAntall.get(k) ?? 0) + 1);
  }
  for (const c of PY_CATEGORIES) {
    const antall = pyAntall.get(c.id) ?? 0;
    if (antall === 0) continue;
    rader.push({
      id: `python-${c.id}`,
      tittel: `Python: ${c.label}`,
      beskrivelse: c.description,
      type: "oppgaver",
      fag: PY_FAG[c.id],
      href: `/python?kategori=${c.id}`,
      antall,
      enhet: "oppgaver",
    });
  }

  // --- Flashcards ----------------------------------------------------------
  const statKort = FLASHCARDS.filter((c) => c.category === "statistikk").length;
  rader.push(
    {
      id: "kort-statistikk",
      tittel: "Kort: statistikk",
      beskrivelse:
        "Begreper og formler i sannsynlighet og statistikk. Quiz, bla eller spaced repetition.",
      type: "kort",
      fag: "tek-1501",
      href: "/cards?category=statistikk",
      antall: statKort,
      enhet: "kort",
    },
    {
      id: "kort-db-web",
      tittel: "Kort: databaser og web",
      beskrivelse: "Begreper, design, SQL, Flask, HTTP og sikkerhet.",
      type: "kort",
      fag: "dte-2509",
      href: "/cards",
      antall: FLASHCARDS.length - statKort,
      enhet: "kort",
    },
  );

  // Eksamensfagene først (i eksamensrekkefølge), så andre fag, så tverrgående.
  // Sorteringen er stabil, så rekkefølgen innen hvert fag er som bygd over.
  const rang = (r: OvRad) => {
    if (!r.fag) return EXAM_SEASON_SLUGS.length + 1;
    const i = EXAM_SEASON_SLUGS.indexOf(r.fag);
    return i >= 0 ? i : EXAM_SEASON_SLUGS.length;
  };
  return rader.sort((a, b) => rang(a) - rang(b));
}

export const OV_RADER: OvRad[] = byggRader();
