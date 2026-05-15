/**
 * Mini-kurs — guidet sandkasse-system. Hver kurs har en filstruktur som
 * brukeren kan utforske og redigere. "Kjør" eksekverer prosjektet i Pyodide
 * og viser output. Hver leksjon har et verifikasjons-script som sjekker om
 * resultatet er som forventet.
 */

export type RunMode =
  /** Kjør entry-filen som vanlig Python-script. Capture stdout. */
  | { kind: "python-script"; entry: string }
  /** Mount Flask-app fra entry-fil og send testede HTTP-requests. */
  | {
      kind: "flask-test-client";
      entry: string;
      requests: { method: "GET" | "POST"; path: string; body?: string }[];
    }
  /** Render HTML-fil i iframe (med inline CSS/JS via srcdoc). */
  | { kind: "html-preview"; entry: string };

export interface Lesson {
  id: string;
  title: string;
  /** Markdown-tekst som forklarer hva leksjonen handler om. */
  narrative: string;
  /** Filer i prosjektet for denne leksjonen — sti → innhold.
   *  Stier kan inneholde mapper (f.eks. "templates/index.html"). */
  files: Record<string, string>;
  /** Hvilken fil som er åpen i editoren ved start. */
  defaultFile: string;
  /** Filer som brukeren KAN endre. Andre er read-only. */
  editable: string[];
  /** Hvordan leksjonen kjøres. */
  run: RunMode;
  /** Hva brukeren skal oppnå — vises som kriterier. */
  verifications: { label: string; check: VerifyCheck }[];
  /** Optional ekstra hint hvis bruker står fast. */
  hint?: string;
}

export type VerifyCheck =
  /** stdout/output må inneholde denne strengen. */
  | { kind: "output-contains"; needle: string }
  /** Flask response body må inneholde denne strengen. */
  | { kind: "response-contains"; requestIdx: number; needle: string }
  /** Flask response status må være lik. */
  | { kind: "response-status"; requestIdx: number; status: number };

export interface MiniCourse {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  /** Estimert tidsbruk for hele kurset. */
  estimertTid: string;
  /** Hvilke fag dette kurset støtter. */
  fag: string[];
  /** Tier-fargekode for kort på listen. */
  color: "brand" | "success" | "warning" | "purple";
  lessons: Lesson[];
}
