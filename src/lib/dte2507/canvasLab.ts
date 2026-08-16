/**
 * DTE-2507 — labbene i Canvas, med frister.
 *
 * Fram til 2026-08-16 hadde vi ingen Canvas-data for dette faget i det hele
 * tatt: lag-inndelingen i `lagPlan.ts` er bygget på Kurose top-down, ikke på
 * emnets egen modulrekkefølge, og ingen frister var kjent. Denne fila er
 * begynnelsen på den manglende halvdelen — den skal vokse etter hvert som
 * flere moduler leses fra Canvas, ikke gjettes.
 *
 * Regelen som gjelder her: **kun labber vi har sett i Canvas.** En tom liste
 * er et ærligere svar enn en oppdiktet rekke.
 */

/** Hvilket lag i `lagPlan.ts` som forbereder deg på laben. */
export type LagId =
  | "skjelett"
  | "lenkelag"
  | "nettverkslag"
  | "transport"
  | "applikasjon"
  | "krypto"
  | "tls"
  | "angrep"
  | "verktoy";

export interface CanvasLab {
  /** Canvas-nummeret, f.eks. "1". */
  nummer: string;
  tittel: string;
  /** Modulen i Canvas laben hører til. */
  modul: string;
  /** ISO-dato. Fristen er kl. 23:59 samme dag. */
  frist: string;
  /** Én setning om hva laben faktisk ber deg gjøre. */
  hva: string;
  /** Verktøyene laben tester, med navnet slik det skrives i terminalen. */
  verktoy: string[];
  /** Canvas-quiz med ubegrensede forsøk, eller en vanlig innlevering? */
  ubegrensedeForsok: boolean;
  /** Lagene i appen som er relevant forberedelse. */
  lag: LagId[];
  /**
   * Hva appen *ikke* dekker av laben. Skrives ut i visningen — poenget er at
   * du skal vite hva du må finne andre steder, ikke tro at appen holder.
   */
  hull?: string;
  /** Slug til øvingssiden som forbereder deg på laben, når vi har bygget en. */
  ovingSlug?: string;
}

export const CANVAS_LABBER: CanvasLab[] = [
  {
    nummer: "1",
    tittel: "IP-nettverk",
    modul: "Modul 1",
    frist: "2026-08-23",
    hva: "Orientere seg i et IP-nettverk fra terminalen: finne egen IP- og MAC-adresse, se hvilken vei pakkene tar, og slå opp navn i DNS.",
    verktoy: ["ipconfig / ifconfig", "netstat", "traceroute / tracert", "ping", "nslookup"],
    ubegrensedeForsok: true,
    lag: ["skjelett", "nettverkslag", "applikasjon"],
    ovingSlug: "dte2507-nettverksverktoy",
    hull:
      "Alle fem verktøyene er nå dekket av en terminal-simulator med elleve måloppgaver. Det som ikke kan dekkes her, er din egen maskin: tallene i simulatoren er oppdiktede, så adressene laben ber om fra ditt eget nett må du hente i din egen terminal. Simulatoren lærer deg hvor i utdataen du skal se etter dem.",
  },
];

/** Labbene sortert på frist. */
export function alleLabber(): CanvasLab[] {
  return [...CANVAS_LABBER].sort((a, b) => a.frist.localeCompare(b.frist));
}
