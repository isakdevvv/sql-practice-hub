// ---------------------------------------------------------------------------
// xp.ts — Unified XP-konto på tvers av alle aktivitetstyper.
//
// Bakgrunn: XP var fragmentert i siloer — SQL-oppgaver hadde sin egen teller
// i `Progress.xp` (storage.ts), drag-oppgaver i `DragProgress.xp`
// (dragProgress.ts), og kort/drill/join hadde ingen XP i det hele tatt. Det
// fantes ingen global "total XP" noe sted, så header-XP-bar og lignende UI
// hadde ingenting å lytte på.
//
// Denne modulen er en _parallell_ XP-bok, ikke en erstatning. De gamle
// siloene fortsetter å oppdatere sine egne XP-tellere som før (slik at
// eksisterende kode forblir bakoverkompatibel). I tillegg kaller hver
// progress-skriver `awardXP(...)` her med en stabil dedupe-key, slik at
// samme handling kun gir XP én gang i den unifiserte boken — selv om kallet
// skulle bli kjørt to ganger.
//
// Lagring: én localStorage-key `progress.xp.total.v1`, plus en flag
// `progress.xp.bootstrapped.v1` for engangs-backfill fra de gamle silotellerne.
//
// Cross-tab: en `BroadcastChannel` ("progress.xp") sender events til andre
// faner. Ved mottak oppdateres in-memory cachen og subscribers kalles. Hvis
// BroadcastChannel ikke er tilgjengelig (eldre Safari) brukes window
// `storage`-event som fallback.
// ---------------------------------------------------------------------------

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
  /** ISO-tidspunkt for når XP-en ble gitt. */
  at: string;
  /** Stabil dedupe-key, f.eks. `problem-123` eller `drag-fy-1`. */
  key: string;
}

interface XpStore {
  total: number;
  bySource: Record<XpSource, number>;
  /** Map av allerede-utdelte dedupe-keys. Verdien er alltid `true`. */
  dedupKeys: Record<string, true>;
}

const STORAGE_KEY = "progress.xp.total.v1";
const BOOTSTRAP_KEY = "progress.xp.bootstrapped.v1";
const CHANNEL_NAME = "progress.xp";

const EMPTY_BY_SOURCE: Record<XpSource, number> = {
  sql: 0,
  drag: 0,
  card: 0,
  drill: 0,
  join: 0,
  "mini-kurs": 0,
  prosjekt: 0,
  "eksamen-trinn": 0,
};

function emptyStore(): XpStore {
  return {
    total: 0,
    bySource: { ...EMPTY_BY_SOURCE },
    dedupKeys: {},
  };
}

// ---------------------------------------------------------------------------
// Subscribers + cross-tab broadcast
// ---------------------------------------------------------------------------

type Listener = (total: number, lastEvent?: XpEvent) => void;
const listeners = new Set<Listener>();

let broadcastChannel: BroadcastChannel | null = null;
let storageListenerAttached = false;

function ensureChannel(): void {
  if (typeof window === "undefined") return;
  if (broadcastChannel || storageListenerAttached) return;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannel.onmessage = (msg) => {
        // Other tab awarded XP. Refresh in-memory cache and notify local subs.
        const evt = msg.data as XpEvent | undefined;
        notifyLocal(loadStore().total, evt);
      };
      return;
    }
  } catch {
    /* ignore — fall through to storage event */
  }
  // Fallback: listen for storage events from other tabs.
  if (!storageListenerAttached) {
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      notifyLocal(loadStore().total);
    });
    storageListenerAttached = true;
  }
}

function notifyLocal(total: number, lastEvent?: XpEvent): void {
  for (const cb of listeners) {
    try {
      cb(total, lastEvent);
    } catch {
      /* swallow — one bad subscriber must not break the rest */
    }
  }
}

function broadcast(evt: XpEvent): void {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(evt);
    } catch {
      /* ignore */
    }
  }
}

// ---------------------------------------------------------------------------
// Storage IO
// ---------------------------------------------------------------------------

function loadStore(): XpStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<XpStore>;
    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      bySource: { ...EMPTY_BY_SOURCE, ...(parsed.bySource ?? {}) },
      dedupKeys: parsed.dedupKeys ?? {},
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: XpStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* swallow — quota/private mode */
  }
}

// ---------------------------------------------------------------------------
// Backfill from legacy silo XP. Runs exactly once per device, gated by a flag.
// We lazy-import the legacy modules to avoid a circular reference: storage.ts
// imports xp.ts to call awardXP, so we must NOT import storage.ts at the
// module top level here.
// ---------------------------------------------------------------------------

let bootstrapped = false;

function runBootstrap(): void {
  if (bootstrapped) return;
  bootstrapped = true;
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(BOOTSTRAP_KEY) === "true") return;
  } catch {
    return;
  }

  // Read legacy SQL XP — pulled directly from localStorage to avoid the
  // circular import with storage.ts.
  try {
    const raw = window.localStorage.getItem("sql-practice-progress-v1");
    if (raw) {
      const parsed = JSON.parse(raw) as { xp?: number };
      const sqlXp = typeof parsed.xp === "number" ? parsed.xp : 0;
      if (sqlXp > 0) {
        awardXPInternal("sql", "legacy-sql-total", sqlXp);
      }
    }
  } catch {
    /* ignore — corrupt legacy progress shouldn't block bootstrap */
  }

  try {
    const raw = window.localStorage.getItem("sql-practice-drag-v1");
    if (raw) {
      const parsed = JSON.parse(raw) as { xp?: number };
      const dragXp = typeof parsed.xp === "number" ? parsed.xp : 0;
      if (dragXp > 0) {
        awardXPInternal("drag", "legacy-drag-total", dragXp);
      }
    }
  } catch {
    /* ignore */
  }

  try {
    window.localStorage.setItem(BOOTSTRAP_KEY, "true");
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Internal version of awardXP that does the actual write. Public `awardXP`
 * wraps this with bootstrap-on-first-call so callers don't need to know
 * about the legacy backfill.
 */
function awardXPInternal(
  source: XpSource,
  key: string,
  amount: number,
): { awarded: boolean; total: number } {
  if (typeof window === "undefined") {
    return { awarded: false, total: 0 };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    const store = loadStore();
    return { awarded: false, total: store.total };
  }

  const store = loadStore();
  if (store.dedupKeys[key]) {
    return { awarded: false, total: store.total };
  }

  store.dedupKeys[key] = true;
  store.total += amount;
  store.bySource[source] = (store.bySource[source] ?? 0) + amount;
  saveStore(store);

  ensureChannel();
  const evt: XpEvent = {
    source,
    amount,
    at: new Date().toISOString(),
    key,
  };
  notifyLocal(store.total, evt);
  broadcast(evt);

  return { awarded: true, total: store.total };
}

/**
 * Award XP for et item. Dedupes på `key` — samme key gir XP kun én gang
 * (selv på tvers av sider, sesjoner og faner). Returnerer `{ awarded: false }`
 * hvis nøkkelen allerede er brukt, ellers `{ awarded: true }`.
 */
export function awardXP(
  source: XpSource,
  key: string,
  amount: number,
): { awarded: boolean; total: number } {
  runBootstrap();
  return awardXPInternal(source, key, amount);
}

/** Total XP på tvers av alle kilder. */
export function getTotalXP(): number {
  runBootstrap();
  return loadStore().total;
}

/** XP per kilde. */
export function getXPBySource(): Record<XpSource, number> {
  runBootstrap();
  return { ...EMPTY_BY_SOURCE, ...loadStore().bySource };
}

/**
 * Lytter — kalles hver gang totalXP endrer seg. Returnerer unsubscribe.
 * Subscriber er garantert å bli kalt fra både samme fane (etter awardXP)
 * og fra andre faner (via BroadcastChannel eller storage event).
 */
export function subscribeXP(cb: Listener): () => void {
  ensureChannel();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Level fra XP. Bruker samme formel som storage.ts: 100 XP per level,
 * starter på level 1. Holdes synkronisert med `levelFromXP` der.
 */
export function levelFromXP(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

/**
 * Progress mot neste level. Returnerer { current, needed, level }:
 * `current` = XP i nåværende level, `needed` = totalt antall XP per level (100),
 * `level` = nåværende level-nummer.
 */
export function xpToNextLevel(
  xp: number,
): { current: number; needed: number; level: number } {
  const level = levelFromXP(xp);
  const base = (level - 1) * 100;
  return { current: xp - base, needed: 100, level };
}

// ---------------------------------------------------------------------------
// Test/maintenance utility — NOT part of the documented API but useful for
// resetting state in unit tests or recovery. Not exported from any index file.
// ---------------------------------------------------------------------------

/** @internal Reset all unified XP state. Used by tests. */
export function __resetUnifiedXP(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(BOOTSTRAP_KEY);
  } catch {
    /* ignore */
  }
  bootstrapped = false;
}
