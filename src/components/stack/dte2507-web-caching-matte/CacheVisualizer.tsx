import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Send,
  Database,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv cache-visualisering (DTE-2507 web-caching).
//
// Topologi (venstre → høyre):
//   CLIENT  ────  CACHE (proxy/CDN)  ────  ORIGIN
//
// Modus:
//   1) first-miss-then-hit  — viser miss-fill, deretter hit
//   2) lru                  — fast cache-størrelse, LRU-evict
//   3) ttl                  — TTL=10s, stale-entries får rød ramme, refetch
//   4) conditional          — If-Modified-Since / 304 sparer båndbredde
//   5) math                 — slidere for hit-rate p, λ, T_cache, T_origin
//
// Animasjon: vi spiller en sekvens av "Frames". Hver frame har en pakke som
// flyr fra én node til en annen, evt. en cache-mutasjon og en log-entry.
// --------------------------------------------------------------------------

type Mode = "miss-hit" | "lru" | "ttl" | "conditional" | "math";

type NodeKey = "CLIENT" | "CACHE" | "ORIGIN";

type CacheEntry = {
  key: string;
  /** Når entryen ble plassert/oppdatert (sekund) */
  storedAt: number;
  /** Tid siden sist brukt — for LRU. Lavere = nyere */
  lastUsed: number;
  /** TTL i sekunder (Infinity for "ingen TTL") */
  ttl: number;
  /** Body-størrelse i KB — bruk til bandbredde-stats */
  sizeKB: number;
  /** ETag/Last-Modified-pekepinn */
  etag: string;
};

type Frame = {
  from: NodeKey;
  to: NodeKey;
  label: string;
  /** Tailwind fill-klasse */
  color: string;
  /** Beskrivelse vises under SVG */
  description: string;
  /** Mutasjon på cache (kjøres når frame starter) */
  cacheMutation?: (
    cache: CacheEntry[],
    ctx: { now: number; capacity: number }
  ) => CacheEntry[];
  /** Stats-mutasjon (hits / misses / saved bytes / total bytes) */
  statsMutation?: (s: Stats) => Stats;
  /** Log entry */
  logEntry?: Omit<LogEntry, "step">;
  /** Liten badge på pakken (f.eks. "304", "200 OK", "HIT") */
  badge?: string;
};

type Stats = {
  hits: number;
  misses: number;
  /** Bytes overført over WAN (origin↔cache) */
  bytesWan: number;
  /** Bytes spart (det vi IKKE måtte hente fra origin) */
  bytesSaved: number;
};

type LogEntry = {
  step: number;
  label: string;
  note?: string;
  variant?: "hit" | "miss" | "evict" | "stale" | "ok" | "info";
};

const COORDS: Record<NodeKey, { x: number; y: number }> = {
  CLIENT: { x: 90, y: 160 },
  CACHE: { x: 380, y: 160 },
  ORIGIN: { x: 670, y: 160 },
};

const PRESET_OBJECTS = ["/a.jpg", "/b.css", "/c.js", "/d.png", "/e.html"] as const;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function findEntry(cache: CacheEntry[], key: string): CacheEntry | undefined {
  return cache.find((e) => e.key === key);
}

function evictLRUIfFull(cache: CacheEntry[], capacity: number): { cache: CacheEntry[]; evicted?: CacheEntry } {
  if (cache.length < capacity) return { cache };
  // Velg den med høyest lastUsed (eldst brukt)
  let evictIdx = 0;
  for (let i = 1; i < cache.length; i++) {
    if (cache[i].lastUsed > cache[evictIdx].lastUsed) evictIdx = i;
  }
  const evicted = cache[evictIdx];
  return { cache: cache.filter((_, i) => i !== evictIdx), evicted };
}

function touch(cache: CacheEntry[], key: string): CacheEntry[] {
  // Sett lastUsed=0 for nylig brukt, øk lastUsed for alle andre
  return cache.map((e) =>
    e.key === key ? { ...e, lastUsed: 0 } : { ...e, lastUsed: e.lastUsed + 1 }
  );
}

function isStale(entry: CacheEntry, now: number): boolean {
  if (entry.ttl === Infinity) return false;
  return now - entry.storedAt >= entry.ttl;
}

const PACKET_COLOR = {
  request: "fill-sky-500",
  miss: "fill-amber-500",
  fetch: "fill-violet-500",
  body: "fill-emerald-500",
  hit: "fill-emerald-500",
  validate: "fill-indigo-500",
  notmod: "fill-emerald-600",
  stale: "fill-rose-500",
} as const;

// --------------------------------------------------------------------------
// Frame-builders per scenario
// --------------------------------------------------------------------------

function buildMissHitFrames(): Frame[] {
  const key = "/a.jpg";
  const sizeKB = 120;
  return [
    {
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${key}`,
      color: PACKET_COLOR.request,
      description: "Klient sender GET /a.jpg til proxy/cache",
      logEntry: { label: `Klient → Cache: GET ${key}`, variant: "info" },
    },
    {
      from: "CACHE",
      to: "CACHE",
      label: "MISS",
      color: PACKET_COLOR.miss,
      description: "Cache slår opp — ingen kopi lokalt. MISS.",
      statsMutation: (s) => ({ ...s, misses: s.misses + 1 }),
      logEntry: {
        label: `Cache MISS for ${key}`,
        note: "Ingen lokal kopi. Cache videresender mot origin.",
        variant: "miss",
      },
    },
    {
      from: "CACHE",
      to: "ORIGIN",
      label: `GET ${key}`,
      color: PACKET_COLOR.fetch,
      description: "Cache henter objektet fra origin",
      logEntry: { label: `Cache → Origin: GET ${key}`, variant: "info" },
    },
    {
      from: "ORIGIN",
      to: "CACHE",
      label: `200 OK · ${sizeKB} KB`,
      color: PACKET_COLOR.body,
      description: `Origin svarer 200 OK med ${sizeKB} KB body`,
      cacheMutation: (cache, ctx) => {
        const { cache: c2 } = evictLRUIfFull(cache, ctx.capacity);
        return [
          ...c2,
          {
            key,
            storedAt: ctx.now,
            lastUsed: 0,
            ttl: 10,
            sizeKB,
            etag: 'W/"v1"',
          },
        ];
      },
      statsMutation: (s) => ({ ...s, bytesWan: s.bytesWan + sizeKB }),
      logEntry: {
        label: `Origin → Cache: 200 OK (${sizeKB} KB)`,
        note: "Cache lagrer kopi med TTL=10s.",
        variant: "ok",
      },
      badge: "200",
    },
    {
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sizeKB} KB`,
      color: PACKET_COLOR.body,
      description: "Cache leverer body til klient",
      logEntry: { label: `Cache → Klient: 200 OK (${sizeKB} KB)`, variant: "ok" },
      badge: "200",
    },
    // Andre forespørsel — HIT
    {
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${key} (igjen)`,
      color: PACKET_COLOR.request,
      description: "Klient ber om samme objekt på nytt",
      logEntry: { label: `Klient → Cache: GET ${key}`, variant: "info" },
    },
    {
      from: "CACHE",
      to: "CACHE",
      label: "HIT",
      color: PACKET_COLOR.hit,
      description: "Cache finner objektet lokalt — HIT!",
      cacheMutation: (cache) => touch(cache, key),
      statsMutation: (s) => ({
        ...s,
        hits: s.hits + 1,
        bytesSaved: s.bytesSaved + sizeKB,
      }),
      logEntry: {
        label: `Cache HIT for ${key}`,
        note: `Sparer ${sizeKB} KB over WAN.`,
        variant: "hit",
      },
      badge: "HIT",
    },
    {
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sizeKB} KB (fra cache)`,
      color: PACKET_COLOR.hit,
      description: "Cache leverer body direkte uten å gå til origin",
      logEntry: { label: `Cache → Klient: 200 OK (cache)`, variant: "hit" },
      badge: "200",
    },
  ];
}

function buildLruFrames(): Frame[] {
  // Capacity=3. Send /a, /b, /c, /d (evict eldst), så /a (cache miss igjen)
  const seq = [
    { k: "/a.jpg", sz: 100 },
    { k: "/b.css", sz: 30 },
    { k: "/c.js", sz: 60 },
    { k: "/d.png", sz: 200 },
    { k: "/a.jpg", sz: 100 },
  ];
  const frames: Frame[] = [];
  for (const { k, sz } of seq) {
    frames.push({
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${k}`,
      color: PACKET_COLOR.request,
      description: `Klient ber om ${k}`,
      logEntry: { label: `Klient → Cache: GET ${k}`, variant: "info" },
    });
    // Vi vet ikke om det er hit/miss på build-time, men det vi vil er deterministisk
    // basert på sekvensen. Vi modellerer "lookup"-frame som dynamisk effekt på cache.
    frames.push({
      from: "CACHE",
      to: "CACHE",
      label: "LOOKUP",
      color: PACKET_COLOR.miss,
      description: `Cache slår opp ${k}`,
      cacheMutation: (cache, ctx) => {
        const hit = findEntry(cache, k);
        if (hit && !isStale(hit, ctx.now)) {
          return touch(cache, k);
        }
        const { cache: c2 } = evictLRUIfFull(cache, ctx.capacity);
        return [
          ...c2.map((e) => ({ ...e, lastUsed: e.lastUsed + 1 })),
          {
            key: k,
            storedAt: ctx.now,
            lastUsed: 0,
            ttl: Infinity,
            sizeKB: sz,
            etag: 'W/"v1"',
          },
        ];
      },
      statsMutation: (s) => s, // settes av neste frame
      logEntry: { label: `Cache lookup ${k}`, variant: "info" },
    });
    // Fetch-frame: hvis det var miss vil cache-en allerede være oppdatert
    // (vi viser fetch generisk). For statistikk antar vi miss her, men når
    // det faktisk er hit vil vi i runtime skippe origin-trafikken via badge.
    // For enkelhetens skyld lar vi modus håndtere det:
    frames.push({
      from: "CACHE",
      to: "ORIGIN",
      label: `GET ${k}`,
      color: PACKET_COLOR.fetch,
      description: `Hvis MISS: cache henter ${k} fra origin (ellers hopper vi over)`,
      // Vi skipper utdrag fra origin hvis allerede i cache før lookup. Det
      // hadde krevd dynamisk pruning av frames. I praksis er denne sekvensen
      // konstruert slik at alle steg gir MISS frem til siste /a.jpg.
      logEntry: { label: `Cache → Origin: GET ${k}`, variant: "info" },
    });
    frames.push({
      from: "ORIGIN",
      to: "CACHE",
      label: `200 OK · ${sz} KB`,
      color: PACKET_COLOR.body,
      description: `Origin returnerer ${k}`,
      statsMutation: (s) => ({
        ...s,
        misses: s.misses + 1,
        bytesWan: s.bytesWan + sz,
      }),
      logEntry: {
        label: `Origin → Cache: 200 OK (${sz} KB)`,
        note: `Lagrer ${k}. Evt. evict av LRU-entry.`,
        variant: "miss",
      },
      badge: "200",
    });
    frames.push({
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sz} KB`,
      color: PACKET_COLOR.body,
      description: `Klient mottar ${k}`,
      logEntry: { label: `Cache → Klient: 200 OK`, variant: "ok" },
      badge: "200",
    });
  }
  return frames;
}

function buildTtlFrames(): Frame[] {
  // /a.jpg lagres med TTL=5. Vi simulerer at klokken tikker fram til staleness.
  const key = "/a.jpg";
  const sizeKB = 80;
  return [
    {
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${key}`,
      color: PACKET_COLOR.request,
      description: "Klient ber om /a.jpg",
      logEntry: { label: `Klient → Cache: GET ${key}`, variant: "info" },
    },
    {
      from: "CACHE",
      to: "ORIGIN",
      label: `GET ${key}`,
      color: PACKET_COLOR.fetch,
      description: "MISS — cache henter fra origin",
      statsMutation: (s) => ({ ...s, misses: s.misses + 1 }),
      logEntry: { label: `Cache MISS — henter ${key}`, variant: "miss" },
    },
    {
      from: "ORIGIN",
      to: "CACHE",
      label: `200 OK · ${sizeKB} KB · TTL=5s`,
      color: PACKET_COLOR.body,
      description: `Origin returnerer body + Cache-Control: max-age=5`,
      cacheMutation: (cache, ctx) => [
        ...cache,
        {
          key,
          storedAt: ctx.now,
          lastUsed: 0,
          ttl: 5,
          sizeKB,
          etag: 'W/"v1"',
        },
      ],
      statsMutation: (s) => ({ ...s, bytesWan: s.bytesWan + sizeKB }),
      logEntry: {
        label: `Origin → Cache: 200 OK + TTL=5s`,
        note: "Entry er fresh til klokken passerer 5s.",
        variant: "ok",
      },
      badge: "200",
    },
    {
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sizeKB} KB`,
      color: PACKET_COLOR.body,
      description: "Klient får body første gang",
      logEntry: { label: `Cache → Klient: 200 OK`, variant: "ok" },
      badge: "200",
    },
    // Klokken tikker 6s — entry blir stale
    {
      from: "CACHE",
      to: "CACHE",
      label: "klokken tikker +6s",
      color: PACKET_COLOR.stale,
      description: "Klokken tikker — TTL utløper, entry blir STALE",
      cacheMutation: (cache) => cache, // bare for å vise klokken — staleness leses av now
      statsMutation: (s) => s,
      logEntry: {
        label: "TTL utløp — entry stale",
        note: "Neste request må valideres mot origin.",
        variant: "stale",
      },
      badge: "STALE",
    },
    {
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${key}`,
      color: PACKET_COLOR.request,
      description: "Klient ber om /a.jpg igjen",
      logEntry: { label: `Klient → Cache: GET ${key}`, variant: "info" },
    },
    {
      from: "CACHE",
      to: "ORIGIN",
      label: `GET ${key} (refetch)`,
      color: PACKET_COLOR.fetch,
      description: "Stale entry — full refetch fra origin",
      statsMutation: (s) => ({ ...s, misses: s.misses + 1 }),
      logEntry: {
        label: "Stale → refetch",
        note: "Uten betinget GET må vi laste hele body på nytt.",
        variant: "miss",
      },
    },
    {
      from: "ORIGIN",
      to: "CACHE",
      label: `200 OK · ${sizeKB} KB`,
      color: PACKET_COLOR.body,
      description: "Origin svarer med ny body",
      cacheMutation: (cache, ctx) =>
        cache.map((e) =>
          e.key === key ? { ...e, storedAt: ctx.now, etag: 'W/"v2"' } : e
        ),
      statsMutation: (s) => ({ ...s, bytesWan: s.bytesWan + sizeKB }),
      logEntry: { label: `Origin → Cache: 200 OK (oppfrisket)`, variant: "ok" },
      badge: "200",
    },
    {
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sizeKB} KB`,
      color: PACKET_COLOR.body,
      description: "Klient får oppdatert kopi",
      logEntry: { label: `Cache → Klient: 200 OK`, variant: "ok" },
      badge: "200",
    },
  ];
}

function buildConditionalFrames(): Frame[] {
  // Samme som TTL, men cache sender If-Modified-Since og origin svarer 304.
  const key = "/a.jpg";
  const sizeKB = 80;
  const headerKB = 0.2;
  return [
    {
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${key}`,
      color: PACKET_COLOR.request,
      description: "Første request",
      logEntry: { label: `Klient → Cache: GET ${key}`, variant: "info" },
    },
    {
      from: "CACHE",
      to: "ORIGIN",
      label: `GET ${key}`,
      color: PACKET_COLOR.fetch,
      description: "MISS — full henting",
      statsMutation: (s) => ({ ...s, misses: s.misses + 1 }),
      logEntry: { label: `Cache MISS — full fetch`, variant: "miss" },
    },
    {
      from: "ORIGIN",
      to: "CACHE",
      label: `200 OK · ${sizeKB} KB · ETag W/"v1"`,
      color: PACKET_COLOR.body,
      description: "Origin returnerer body + ETag",
      cacheMutation: (cache, ctx) => [
        ...cache,
        {
          key,
          storedAt: ctx.now,
          lastUsed: 0,
          ttl: 5,
          sizeKB,
          etag: 'W/"v1"',
        },
      ],
      statsMutation: (s) => ({ ...s, bytesWan: s.bytesWan + sizeKB }),
      logEntry: { label: `Origin → Cache: 200 OK + ETag`, variant: "ok" },
      badge: "200",
    },
    {
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sizeKB} KB`,
      color: PACKET_COLOR.body,
      description: "Body til klient",
      logEntry: { label: `Cache → Klient: 200 OK`, variant: "ok" },
      badge: "200",
    },
    {
      from: "CACHE",
      to: "CACHE",
      label: "klokken tikker +6s",
      color: PACKET_COLOR.stale,
      description: "TTL går ut — stale",
      logEntry: { label: `TTL utløp — entry stale`, variant: "stale" },
      badge: "STALE",
    },
    {
      from: "CLIENT",
      to: "CACHE",
      label: `GET ${key}`,
      color: PACKET_COLOR.request,
      description: "Klient ber om samme objekt på nytt",
      logEntry: { label: `Klient → Cache: GET ${key}`, variant: "info" },
    },
    {
      from: "CACHE",
      to: "ORIGIN",
      label: `GET ${key} · If-None-Match: W/"v1"`,
      color: PACKET_COLOR.validate,
      description: "Cache sender betinget GET med ETag",
      statsMutation: (s) => ({ ...s, bytesWan: s.bytesWan + headerKB }),
      logEntry: {
        label: `Cache → Origin: betinget GET`,
        note: "If-None-Match: W/\"v1\"",
        variant: "info",
      },
      badge: "IfNoneMatch",
    },
    {
      from: "ORIGIN",
      to: "CACHE",
      label: `304 Not Modified · ${headerKB} KB`,
      color: PACKET_COLOR.notmod,
      description: "Objektet er uendret — 304 m/ tom body",
      cacheMutation: (cache, ctx) =>
        cache.map((e) =>
          e.key === key ? { ...e, storedAt: ctx.now } : e
        ),
      statsMutation: (s) => ({
        ...s,
        hits: s.hits + 1,
        bytesWan: s.bytesWan + headerKB,
        bytesSaved: s.bytesSaved + (sizeKB - headerKB),
      }),
      logEntry: {
        label: `Origin → Cache: 304 Not Modified`,
        note: `Sparer ${(sizeKB - headerKB).toFixed(1)} KB vs full refetch.`,
        variant: "hit",
      },
      badge: "304",
    },
    {
      from: "CACHE",
      to: "CLIENT",
      label: `200 OK · ${sizeKB} KB (fra cache)`,
      color: PACKET_COLOR.hit,
      description: "Cache reuser sin lokale kopi",
      logEntry: { label: `Cache → Klient: 200 OK (revalidert)`, variant: "hit" },
      badge: "200",
    },
  ];
}

// --------------------------------------------------------------------------
// Mode-meta
// --------------------------------------------------------------------------

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "miss-hit", label: "1) MISS → fyll → HIT", sub: "Andre request blir hit" },
  { id: "lru", label: "2) LRU-evict", sub: "Capacity=3, sekvens evicts oldest" },
  { id: "ttl", label: "3) TTL-utløp", sub: "TTL=5s, stale → refetch" },
  { id: "conditional", label: "4) Betinget GET / 304", sub: "If-None-Match sparer body" },
  { id: "math", label: "5) Hit-rate-matte", sub: "Slidere — beregn avg responstid" },
];

const MODE_NOTE: Record<Mode, string> = {
  "miss-hit":
    "Første request går hele veien til origin. Andre treffer cachen — null trafikk over WAN.",
  lru: "Cachen har plass til 3. Eldst-brukte entry kastes når en ny må inn.",
  ttl: "Stale entry får rød ramme. Uten betinget GET må hele body lastes på nytt.",
  conditional:
    "If-None-Match/304 lar cache validere uten å laste body. Sparer flere KB per request.",
  math: "Avg responstid = p·T_cache + (1-p)·T_origin. Lek med p, λ og servertider.",
};

function getFrames(mode: Mode): Frame[] {
  switch (mode) {
    case "miss-hit":
      return buildMissHitFrames();
    case "lru":
      return buildLruFrames();
    case "ttl":
      return buildTtlFrames();
    case "conditional":
      return buildConditionalFrames();
    case "math":
      return [];
  }
}

function getInitialCache(_mode: Mode): CacheEntry[] {
  return [];
}

// Cache-kapasitet pr modus
function getCapacity(mode: Mode, slider: number): number {
  if (mode === "lru") return slider;
  return 8;
}

// Simulert klokke som tikker forover for hvert "klokken tikker"-steg
function clockJumpForFrame(f: Frame): number {
  if (f.label.startsWith("klokken tikker")) {
    const m = f.label.match(/\+(\d+)s/);
    if (m) return Number(m[1]);
  }
  return 0;
}

// --------------------------------------------------------------------------
// Hovedkomponent
// --------------------------------------------------------------------------
export function CacheVisualizer() {
  const [mode, setMode] = useState<Mode>("miss-hit");
  const [capacitySlider, setCapacitySlider] = useState(3);
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    hits: 0,
    misses: 0,
    bytesWan: 0,
    bytesSaved: 0,
  });
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [packetAtEnd, setPacketAtEnd] = useState(true);
  const [now, setNow] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const timerRef = useRef<number | null>(null);

  // Math-mode state
  const [pHit, setPHit] = useState(0.4);
  const [lambda, setLambda] = useState(15);
  const [tCacheMs, setTCacheMs] = useState(10);
  const [tOriginMs, setTOriginMs] = useState(2000);
  const [avgSizeKB, setAvgSizeKB] = useState(120);

  const frames = useMemo(() => getFrames(mode), [mode]);
  const totalSteps = frames.length;
  const currentFrame: Frame | null = step > 0 ? frames[step - 1] : null;
  const capacity = getCapacity(mode, capacitySlider);

  // Reset hver gang vi bytter modus
  const reset = (m: Mode = mode) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setStep(0);
    setCache(getInitialCache(m));
    setStats({ hits: 0, misses: 0, bytesWan: 0, bytesSaved: 0 });
    setLog([]);
    setNow(0);
    setPacketAtEnd(true);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setStep(0);
    setCache(getInitialCache(m));
    setStats({ hits: 0, misses: 0, bytesWan: 0, bytesSaved: 0 });
    setLog([]);
    setNow(0);
    setPacketAtEnd(true);
  };

  const advance = () => {
    if (step >= totalSteps) return false;
    const next = frames[step];
    const jump = clockJumpForFrame(next);
    const nextNow = now + jump;

    if (next.cacheMutation) {
      setCache((c) => next.cacheMutation!(c, { now: nextNow, capacity }));
    }
    if (next.statsMutation) {
      setStats((s) => next.statsMutation!(s));
    }
    if (next.logEntry) {
      setLog((l) =>
        [{ step: step + 1, ...next.logEntry! }, ...l].slice(0, 25)
      );
    }
    if (jump > 0) setNow(nextNow);

    setPacketAtEnd(false);
    setStep(step + 1);
    window.setTimeout(() => setPacketAtEnd(true), 30);
    return true;
  };

  // Play-loop
  useEffect(() => {
    if (!playing) return;
    if (step >= totalSteps) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      if (step >= totalSteps) {
        setPlaying(false);
        return;
      }
      advance();
    }, 1100);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, totalSteps]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Hit rate
  const hitRate = useMemo(() => {
    const total = stats.hits + stats.misses;
    if (total === 0) return 0;
    return stats.hits / total;
  }, [stats]);

  // Pakkeposisjon
  const packetPos = (() => {
    if (!currentFrame) return null;
    if (currentFrame.from === currentFrame.to) {
      // Selv-loop (lookup, klokke-tick) — sentrert på from
      const from = COORDS[currentFrame.from];
      return {
        x: from.x,
        y: from.y - 50,
        label: currentFrame.label,
        color: currentFrame.color,
        badge: currentFrame.badge,
      };
    }
    const from = COORDS[currentFrame.from];
    const to = COORDS[currentFrame.to];
    const pos = packetAtEnd ? to : from;
    return {
      x: pos.x,
      y: pos.y - 50,
      label: currentFrame.label,
      color: currentFrame.color,
      badge: currentFrame.badge,
    };
  })();

  // --------------------------------------------------------------------
  // Math-mode rendering
  // --------------------------------------------------------------------
  if (mode === "math") {
    const tCache = tCacheMs / 1000;
    const tOrigin = tOriginMs / 1000;
    const avgResp = pHit * tCache + (1 - pHit) * tOrigin;
    const savedRate = pHit * lambda * avgSizeKB; // KB/s spart over WAN
    const wanRate = (1 - pHit) * lambda * avgSizeKB; // KB/s mot origin

    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <ModeBar mode={mode} switchMode={switchMode} />
        <div className="p-5 space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lek med parameterne under for å se hvordan hit-rate <em>p</em> påvirker
            snittforsinkelse og spart WAN-trafikk:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <MathSlider
              label="Hit-sannsynlighet p"
              value={pHit}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${(v * 100).toFixed(0)} %`}
              onChange={setPHit}
            />
            <MathSlider
              label="Forespørselsrate λ (req/s)"
              value={lambda}
              min={1}
              max={200}
              step={1}
              format={(v) => `${v} req/s`}
              onChange={setLambda}
            />
            <MathSlider
              label="T_cache (ms — LAN-svar)"
              value={tCacheMs}
              min={1}
              max={200}
              step={1}
              format={(v) => `${v} ms`}
              onChange={setTCacheMs}
            />
            <MathSlider
              label="T_origin (ms — full WAN-tur)"
              value={tOriginMs}
              min={50}
              max={5000}
              step={10}
              format={(v) => `${v} ms`}
              onChange={setTOriginMs}
            />
            <MathSlider
              label="Snittstørrelse per objekt"
              value={avgSizeKB}
              min={1}
              max={2000}
              step={1}
              format={(v) => `${v} KB`}
              onChange={setAvgSizeKB}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={<Clock className="h-4 w-4 text-brand" />}
              label="Snitt-responstid"
              value={`${(avgResp * 1000).toFixed(1)} ms`}
              hint={`p·T_cache + (1-p)·T_origin = ${(pHit * tCache * 1000).toFixed(1)} + ${((1 - pHit) * tOrigin * 1000).toFixed(1)}`}
            />
            <StatTile
              icon={<Zap className="h-4 w-4 text-emerald-500" />}
              label="Spart WAN-rate"
              value={`${(savedRate / 1024).toFixed(2)} MB/s`}
              hint={`p · λ · S = ${pHit.toFixed(2)} · ${lambda} · ${avgSizeKB} KB`}
            />
            <StatTile
              icon={<Database className="h-4 w-4 text-violet-500" />}
              label="Faktisk WAN-rate"
              value={`${(wanRate / 1024).toFixed(2)} MB/s`}
              hint={`(1-p) · λ · S`}
            />
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs leading-relaxed">
            <div className="font-semibold mb-1">Tolking</div>
            <p>
              Når <em>p</em> nærmer seg 1, dominerer T_cache og snittresponstiden går
              mot LAN-nivå. Selv ved beskjeden hit-rate (40 %) er besparelsen
              betydelig — hele <em>p · λ · S</em> bytes/s slipper å gå over WAN.
              Husk: høyere p krever mer minne i cachen, og du må håndtere TTL/304
              for å unngå å servere foreldet innhold.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------
  // Animasjons-modusene
  // --------------------------------------------------------------------
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <ModeBar
        mode={mode}
        switchMode={switchMode}
        playing={playing}
        step={step}
        totalSteps={totalSteps}
        advance={advance}
        reset={reset}
        setPlaying={setPlaying}
      />

      {/* Preset-knapper */}
      {mode === "miss-hit" && (
        <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              switchMode("miss-hit");
              setTimeout(() => setPlaying(true), 80);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <Send className="h-3 w-3" />
            Spill av MISS → HIT
          </button>
          <span className="text-muted-foreground self-center ml-auto tabular-nums">
            Steg {Math.min(step, totalSteps)} / {totalSteps}
          </span>
        </div>
      )}

      {mode === "lru" && (
        <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap items-center gap-3 text-xs">
          <label className="inline-flex items-center gap-2">
            <span className="text-muted-foreground">Capacity:</span>
            <input
              type="range"
              min={2}
              max={5}
              value={capacitySlider}
              onChange={(e) => {
                setCapacitySlider(Number(e.target.value));
                reset();
              }}
              className="w-24"
            />
            <span className="tabular-nums font-mono">{capacitySlider}</span>
          </label>
          <button
            type="button"
            onClick={() => {
              switchMode("lru");
              setTimeout(() => setPlaying(true), 80);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <Send className="h-3 w-3" />
            Spill av sekvens /a /b /c /d /a
          </button>
          <span className="text-muted-foreground ml-auto tabular-nums">
            Steg {Math.min(step, totalSteps)} / {totalSteps}
          </span>
        </div>
      )}

      {(mode === "ttl" || mode === "conditional") && (
        <div className="px-4 py-2 border-b border-border bg-muted/10 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Simulert klokke: <span className="font-mono">{now}s</span>
          </span>
          <button
            type="button"
            onClick={() => {
              switchMode(mode);
              setTimeout(() => setPlaying(true), 80);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <Send className="h-3 w-3" />
            Spill av scenariet
          </button>
          <span className="text-muted-foreground ml-auto tabular-nums">
            Steg {Math.min(step, totalSteps)} / {totalSteps}
          </span>
        </div>
      )}

      <div className="px-4 py-3 border-b border-border bg-muted/10 text-xs italic text-muted-foreground">
        {MODE_NOTE[mode]}
      </div>

      {/* SVG */}
      <div className="p-4 bg-background">
        <svg viewBox="0 0 760 320" className="w-full h-auto" style={{ maxHeight: 360 }}>
          {/* Zoner */}
          <rect
            x="20"
            y="30"
            width="200"
            height="270"
            fill="currentColor"
            className="text-sky-500/5"
            rx="12"
          />
          <rect
            x="260"
            y="30"
            width="240"
            height="270"
            fill="currentColor"
            className="text-violet-500/5"
            rx="12"
          />
          <rect
            x="540"
            y="30"
            width="200"
            height="270"
            fill="currentColor"
            className="text-rose-500/5"
            rx="12"
          />
          <text
            x="120"
            y="22"
            className="fill-sky-700 dark:fill-sky-300"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            Klient
          </text>
          <text
            x="380"
            y="22"
            className="fill-violet-700 dark:fill-violet-300"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            Cache / Proxy
          </text>
          <text
            x="640"
            y="22"
            className="fill-rose-700 dark:fill-rose-300"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            Origin-server
          </text>

          {/* Linjer */}
          <line
            x1="150"
            y1="160"
            x2="320"
            y2="160"
            stroke="currentColor"
            className="text-border"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <line
            x1="440"
            y1="160"
            x2="610"
            y2="160"
            stroke="currentColor"
            className="text-border"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Noder */}
          <Node x={90} y={160} label="CLIENT" sub="bruker" tone="sky" />
          <Node x={380} y={160} label="CACHE" sub="proxy / CDN" tone="violet" />
          <Node x={670} y={160} label="ORIGIN" sub="opphavsserver" tone="rose" />

          {/* Pakke */}
          {packetPos && currentFrame && currentFrame.from !== currentFrame.to && (
            <g
              style={{
                transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translate(${packetPos.x - 380}px, 0)`,
              }}
            >
              <PacketBox
                x={380}
                y={110}
                label={packetPos.label}
                colorClass={packetPos.color}
                badge={packetPos.badge}
              />
            </g>
          )}
          {packetPos && currentFrame && currentFrame.from === currentFrame.to && (
            <g>
              <PacketBox
                x={packetPos.x}
                y={110}
                label={packetPos.label}
                colorClass={packetPos.color}
                badge={packetPos.badge}
              />
            </g>
          )}
        </svg>

        <div className="mt-2 min-h-[1.5rem] text-center text-xs text-muted-foreground">
          {currentFrame
            ? currentFrame.description
            : step === 0
              ? "Trykk Steg eller Spill for å starte scenariet."
              : "Ferdig — trykk Reset for å starte på nytt."}
        </div>
      </div>

      {/* Cache-state */}
      <div className="px-4 py-3 border-t border-border bg-muted/20">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Database className="h-3 w-3" />
          Cache-innhold ({cache.length} / {capacity})
        </div>
        {cache.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Tom — ingen cachede objekter.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {cache.map((entry) => {
              const stale = isStale(entry, now);
              const remainingTtl =
                entry.ttl === Infinity ? Infinity : entry.ttl - (now - entry.storedAt);
              return (
                <div
                  key={entry.key}
                  className={`rounded-md border px-2.5 py-2 text-xs ${
                    stale
                      ? "border-rose-500 bg-rose-500/10"
                      : "border-emerald-500/40 bg-emerald-500/5"
                  }`}
                >
                  <div className="font-mono font-semibold truncate">{entry.key}</div>
                  <div className="text-muted-foreground tabular-nums text-[10px] mt-0.5">
                    {entry.sizeKB} KB · {entry.etag}
                  </div>
                  <div className="text-muted-foreground tabular-nums text-[10px]">
                    LRU-rank: {entry.lastUsed}
                    {entry.ttl !== Infinity && (
                      <>
                        {" · TTL: "}
                        <span className={stale ? "text-rose-600 font-semibold" : ""}>
                          {stale ? "STALE" : `${Math.max(0, remainingTtl)}s`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-border bg-card grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="HITs" value={stats.hits} tone="emerald" />
        <Stat label="MISSes" value={stats.misses} tone="amber" />
        <Stat
          label="Hit-rate"
          value={`${(hitRate * 100).toFixed(0)} %`}
          tone="brand"
        />
        <Stat
          label="Spart WAN"
          value={`${stats.bytesSaved.toFixed(1)} KB`}
          tone="violet"
        />
      </div>

      {/* Log */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Hendelses-log (nyeste først)
        </div>
        {log.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            Ingen hendelser enda — start scenariet.
          </div>
        ) : (
          <ol className="space-y-1.5">
            {log.map((entry, i) => (
              <li
                key={`${entry.step}-${i}`}
                className={`rounded-md border px-3 py-2 text-xs ${
                  entry.variant === "hit"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : entry.variant === "miss"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : entry.variant === "stale"
                        ? "border-rose-500/30 bg-rose-500/5"
                        : entry.variant === "evict"
                          ? "border-violet-500/30 bg-violet-500/5"
                          : entry.variant === "ok"
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground tabular-nums w-6 text-right">
                    {entry.step}.
                  </span>
                  <span className="font-semibold">{entry.label}</span>
                  {entry.variant === "stale" && (
                    <AlertTriangle className="h-3 w-3 text-rose-500 inline-block" />
                  )}
                </div>
                {entry.note && (
                  <div className="pl-8 mt-1 text-muted-foreground italic">
                    {entry.note}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Underkomponenter
// --------------------------------------------------------------------------

function ModeBar({
  mode,
  switchMode,
  playing,
  step,
  totalSteps,
  advance,
  reset,
  setPlaying,
}: {
  mode: Mode;
  switchMode: (m: Mode) => void;
  playing?: boolean;
  step?: number;
  totalSteps?: number;
  advance?: () => void;
  reset?: () => void;
  setPlaying?: (fn: (p: boolean) => boolean) => void;
}) {
  const hasControls =
    playing !== undefined && step !== undefined && totalSteps !== undefined;
  return (
    <div className="px-4 py-3 border-b border-border bg-muted/30">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Interaktiv visualisering
          </div>
          <div className="text-sm font-semibold">
            Web-cache i praksis — MISS/HIT, LRU, TTL og 304
          </div>
        </div>
        {hasControls && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (step! >= totalSteps!) reset!();
                else advance!();
              }}
              disabled={playing}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40"
            >
              <StepForward className="h-3 w-3" />
              Steg
            </button>
            <button
              type="button"
              onClick={() => {
                if (step! >= totalSteps!) {
                  reset!();
                  setTimeout(() => setPlaying!(() => true), 50);
                  return;
                }
                setPlaying!((p) => !p);
              }}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Spill"}
            </button>
            <button
              type="button"
              onClick={() => reset!()}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => switchMode(m.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              mode === m.id
                ? "bg-brand text-brand-foreground border-brand"
                : "border-border hover:bg-muted"
            }`}
            title={m.sub}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Node({
  x,
  y,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
  tone: "sky" | "violet" | "rose";
}) {
  const fillTone = {
    sky: "text-sky-500/20 dark:text-sky-400/25",
    violet: "text-violet-500/20 dark:text-violet-400/25",
    rose: "text-rose-500/20 dark:text-rose-400/25",
  }[tone];
  const strokeTone = {
    sky: "text-sky-500",
    violet: "text-violet-500",
    rose: "text-rose-500",
  }[tone];
  return (
    <g>
      <rect
        x={x - 60}
        y={y - 32}
        width="120"
        height="64"
        rx="10"
        fill="currentColor"
        className={fillTone}
      />
      <rect
        x={x - 60}
        y={y - 32}
        width="120"
        height="64"
        rx="10"
        fill="none"
        stroke="currentColor"
        className={strokeTone}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <text
        x={x}
        y={y - 6}
        className="fill-foreground"
        fontSize="13"
        fontWeight="700"
        textAnchor="middle"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 12}
        className="fill-muted-foreground"
        fontSize="10"
        textAnchor="middle"
      >
        {sub}
      </text>
    </g>
  );
}

function PacketBox({
  x,
  y,
  label,
  colorClass,
  badge,
}: {
  x: number;
  y: number;
  label: string;
  colorClass: string;
  badge?: string;
}) {
  const width = Math.max(160, Math.min(260, label.length * 6 + 20));
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - 14}
        width={width}
        height="28"
        rx="6"
        className={colorClass}
        opacity="0.92"
      />
      <text
        x={x}
        y={y + 4}
        className="fill-white"
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
      >
        {label}
      </text>
      {badge && (
        <g>
          <rect
            x={x + width / 2 - 30}
            y={y - 32}
            width="34"
            height="16"
            rx="4"
            className="fill-foreground"
            opacity="0.85"
          />
          <text
            x={x + width / 2 - 13}
            y={y - 21}
            className="fill-background"
            fontSize="9"
            fontWeight="700"
            textAnchor="middle"
          >
            {badge}
          </text>
        </g>
      )}
    </g>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "amber" | "brand" | "violet";
}) {
  const toneClass = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    brand: "text-brand",
    violet: "text-violet-600 dark:text-violet-400",
  }[tone];
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`text-lg font-bold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
      {hint && (
        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
          {hint}
        </div>
      )}
    </div>
  );
}

function MathSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs tabular-nums font-mono text-brand">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand"
      />
    </label>
  );
}

// PRESET_OBJECTS reserved for future preset-buttons; kept to avoid future churn.
void PRESET_OBJECTS;
