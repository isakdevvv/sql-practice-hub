/**
 * xpClient — robust adapter mot `@/lib/progress/xp`.
 *
 * Hvorfor: Agent C bygger den ekte XP-storen (`xp.ts`) parallelt med oss.
 * Hvis branchen vår mergeres FØR Agent C, finnes ikke fila ennå. Vi vil
 * ikke at appen krasjer i mellomtiden — XP-bar/toast skal bare være tom.
 *
 * Strategi:
 *  - Vi bruker `import.meta.glob` (Vite) til å oppdage `xp.ts` *uten* å
 *    referere til den med en static import (som ville feilet ved bygg
 *    hvis fila mangler).
 *  - Hvis fila finnes lastes den via dynamic import. Mens vi venter på
 *    den (eller hvis den ikke finnes), returnerer vi no-op-stubs.
 *  - subscribeXP buffer'er callbacks slik at hvis du subscribe'r før
 *    storen er lastet, blir du re-subscribed når den dukker opp.
 *  - Alle eksporter har samme signatur som den ekte API-en i xp.ts.
 */

export type XpSource =
  | "sql"
  | "drag"
  | "card"
  | "drill"
  | "join"
  | "mini-kurs"
  | "prosjekt"
  | "eksamen-trinn";

export interface XpEvent {
  source: XpSource;
  amount: number;
  at: string;
  key: string;
}

interface XpModule {
  awardXP: (source: XpSource, key: string, amount: number) => { awarded: boolean; total: number };
  getTotalXP: () => number;
  getXPBySource: () => Record<XpSource, number>;
  subscribeXP: (cb: (total: number, lastEvent?: XpEvent) => void) => () => void;
  levelFromXP: (xp: number) => number;
  xpToNextLevel: (xp: number) => { current: number; needed: number; level: number };
}

// `import.meta.glob` returnerer en map av matchende filer. Hvis xp.ts
// ikke finnes ved bygg, blir maps'en tom og vi faller tilbake til stubs.
// `eager: false` (default) gjør at fila kun lastes når vi faktisk kaller
// loader'en under.
const candidates = import.meta.glob<XpModule>("./xp.ts");

let real: XpModule | null = null;
const pendingSubs: Array<(total: number, lastEvent?: XpEvent) => void> = [];
const pendingUnsubs = new Map<(total: number, lastEvent?: XpEvent) => void, () => void>();

// Init: forsøk å laste den ekte storen. Skjer asynkront, men no-op-stubs
// dekker tiden inntil dette resolves (eller for alltid hvis fila mangler).
const loader = candidates["./xp.ts"];
if (loader) {
  void loader()
    .then((mod) => {
      real = mod;
      // Re-subscribe alle som ble subscribe'd før storen var klar.
      for (const cb of pendingSubs) {
        const unsub = real.subscribeXP(cb);
        pendingUnsubs.set(cb, unsub);
        // Send initial total slik at de oppdaterer fra 0 → ekte verdi.
        try {
          cb(real.getTotalXP());
        } catch {
          /* ignore consumer errors */
        }
      }
      pendingSubs.length = 0;
    })
    .catch(() => {
      // Lasting feilet — fortsetter med no-op-stubs.
      real = null;
    });
}

const ZERO_BY_SOURCE: Record<XpSource, number> = {
  sql: 0,
  drag: 0,
  card: 0,
  drill: 0,
  join: 0,
  "mini-kurs": 0,
  prosjekt: 0,
  "eksamen-trinn": 0,
};

export function awardXP(
  source: XpSource,
  key: string,
  amount: number,
): { awarded: boolean; total: number } {
  if (real) return real.awardXP(source, key, amount);
  return { awarded: false, total: 0 };
}

export function getTotalXP(): number {
  if (real) return real.getTotalXP();
  return 0;
}

export function getXPBySource(): Record<XpSource, number> {
  if (real) return real.getXPBySource();
  return { ...ZERO_BY_SOURCE };
}

export function subscribeXP(cb: (total: number, lastEvent?: XpEvent) => void): () => void {
  if (real) {
    return real.subscribeXP(cb);
  }
  // Ikke klar enda — buffrer callback'en. Når storen lastes blir alle
  // pending subs koblet på og får initial total. Unsubscribe-funksjonen
  // håndterer begge tilfeller.
  pendingSubs.push(cb);
  return () => {
    const i = pendingSubs.indexOf(cb);
    if (i >= 0) pendingSubs.splice(i, 1);
    const realUnsub = pendingUnsubs.get(cb);
    if (realUnsub) {
      realUnsub();
      pendingUnsubs.delete(cb);
    }
  };
}

export function levelFromXP(xp: number): number {
  if (real) return real.levelFromXP(xp);
  // Fallback: enkel level-formel slik at UI-et viser noe meningsfylt
  // hvis storen er borte. Match Agent C sin formel ved første merge.
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function xpToNextLevel(xp: number): { current: number; needed: number; level: number } {
  if (real) return real.xpToNextLevel(xp);
  const level = levelFromXP(xp);
  const xpForLevel = (l: number) => 50 * (l - 1) * (l - 1);
  const current = xp - xpForLevel(level);
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  return { current: Math.max(0, current), needed: Math.max(1, needed), level };
}
