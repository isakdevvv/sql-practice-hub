// ---------------------------------------------------------------------------
// nav/laer.ts — fag → emne → steg, én form for alle fag.
//
// Lær-inngangen viser det samme treet uansett hvordan faget er bygd under
// panseret. Tre kilder oversettes hit, i prioritert rekkefølge:
//
//  1. Skjerm-kurs (`lib/kurs`): faget har ekte emner og undertemaer.
//  2. Emneinndelingen i `nav/emner.ts`: fagets leksjoner gruppert for hånd.
//  3. Løyper (`core/loype`): modulene i faget er emner, stegene er stack-sider.
//  4. Curriculum-fasen (`core/path`): fagets leksjoner i studierekkefølge,
//     gruppert på «Modul N» der titlene sier det, ellers som én liste.
//
// Ingenting her leser localStorage — strukturen er lik på server og klient.
// Sett-status hentes av siden etter mount.
// ---------------------------------------------------------------------------

import { LOYPER } from "@/lib/core/loype";
import { lessonSlugsForSubject } from "@/lib/core/path";
import { fagBySlug } from "@/lib/kurs/registry";
import { minutter } from "@/lib/kurs/types";
import { getTrinnBySlug } from "@/lib/stack/content";
import { SUBJECT_BY_SLUG } from "@/lib/subjects/catalog";
import { EMNER } from "./emner";

export type LaerSteg =
  | { kind: "skjerm"; id: string; tittel: string; fag: string; undertema: string; minutter: number }
  | { kind: "stack"; id: string; tittel: string; slug: string };

export interface LaerEmne {
  id: string;
  tittel: string;
  /** Spørsmålet emnet svarer på, der kilden har et. */
  undertittel?: string;
  steg: LaerSteg[];
}

const MODUL_RE = /^Modul (\d+)\w?\s*[—–-]\s*(.+)$/;

/** «DTE-2602 — Lineær regresjon» → «Lineær regresjon». Fagkoden står allerede
 *  på fag-knappen, så den er støy i hver eneste rad. */
function utenFagkode(tittel: string): string {
  return tittel.replace(/^[A-Z]{3}-\d{4}\s*(?:[—–-]\s*)?/, "");
}

function stackSteg(slug: string, tittel: string): LaerSteg {
  return { kind: "stack", id: slug, tittel, slug };
}

export function emnerForFag(fagSlug: string): LaerEmne[] {
  const kurs = fagBySlug(fagSlug);
  if (kurs) {
    return kurs.emner.map((e) => ({
      id: e.slug,
      tittel: e.tittel,
      undertittel: e.sporsmal,
      steg: e.undertemaer.map((u) => ({
        kind: "skjerm",
        id: u.slug,
        tittel: u.tittel,
        fag: fagSlug,
        undertema: u.slug,
        minutter: minutter(u),
      })),
    }));
  }

  const emner: LaerEmne[] = [];
  const brukt = new Set<string>();

  const inndeling = EMNER[fagSlug];
  if (inndeling) {
    for (const e of inndeling.emner) {
      const steg: LaerSteg[] = [];
      for (const slug of e.slugs) {
        const trinn = getTrinnBySlug(slug);
        brukt.add(slug);
        if (trinn) steg.push(stackSteg(slug, utenFagkode(trinn.title)));
      }
      if (steg.length > 0)
        emner.push({ id: e.id, tittel: e.tittel, undertittel: e.sporsmal, steg });
    }
    for (const slug of inndeling.utelat ?? []) brukt.add(slug);
    // Leksjoner som er lagt til i fasen etter at inndelingen ble skrevet.
    const uplassert: LaerSteg[] = [];
    for (const slug of lessonSlugsForSubject(fagSlug)) {
      if (slug === fagSlug || brukt.has(slug)) continue;
      const trinn = getTrinnBySlug(slug);
      if (trinn) uplassert.push(stackSteg(slug, utenFagkode(trinn.title)));
    }
    if (uplassert.length > 0) {
      emner.push({ id: "uplassert", tittel: "Ikke plassert ennå", steg: uplassert });
    }
    return emner;
  }

  const kode = SUBJECT_BY_SLUG[fagSlug]?.code;
  for (const l of LOYPER) {
    if (l.fagKode !== kode) continue;
    emner.push({
      id: l.id,
      tittel: l.tittel,
      steg: l.steg.map((s) => stackSteg(s.slug, s.tittel)),
    });
    for (const s of l.steg) brukt.add(s.slug);
  }

  // Resten av fagets leksjoner. Titler med «Modul N —» blir egne emner;
  // alt annet samles i ett emne til slutt.
  const moduler = new Map<string, LaerEmne>();
  const rest: LaerSteg[] = [];
  for (const slug of lessonSlugsForSubject(fagSlug)) {
    if (slug === fagSlug || brukt.has(slug)) continue;
    const trinn = getTrinnBySlug(slug);
    if (!trinn) continue;
    const tittel = utenFagkode(trinn.title);
    const m = emner.length === 0 ? MODUL_RE.exec(tittel) : null;
    if (!m) {
      rest.push(stackSteg(slug, tittel));
      continue;
    }
    const id = `modul-${m[1]}`;
    let emne = moduler.get(id);
    if (!emne) {
      emne = { id, tittel: `Modul ${m[1]}`, steg: [] };
      moduler.set(id, emne);
    }
    emne.steg.push(stackSteg(slug, m[2]));
  }

  emner.push(
    ...[...moduler.values()].sort((a, b) => a.id.localeCompare(b.id, "nb", { numeric: true })),
  );
  if (rest.length > 0) {
    emner.push({
      id: "rest",
      tittel: emner.length > 0 ? "Mer i faget" : "Alle steg i rekkefølge",
      steg: rest,
    });
  }
  return emner;
}
