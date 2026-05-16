import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Database,
  GitMerge,
  Search,
  Filter,
  Layers,
  BarChart3,
  Lightbulb,
} from "lucide-react";

// --------------------------------------------------------------------------
// Interaktiv visualisering for query-optimisering.
// Fem moduser:
//   1) Join-algoritmer — nested loop vs hash vs merge join, plan-tre + animasjon
//   2) Index scan vs seq scan — kostnads-sammenligning + radbesøk
//   3) Cardinality estimation — histogram, selektivitet, estimat vs faktisk
//   4) Predikat-pushdown vs naiv — selection før/etter JOIN
//   5) EXPLAIN-tre — bibliotek av forhåndsbygde plan-trær med forklaringer
//
// Layout-prinsipp: alle plan-trær rendres top-down (rot = aluminium-output
// øverst, scans = løvnoder nederst). Hver operator-boks viser navn,
// estimert kost, estimat-rows og faktiske rows. Når brukeren spiller av
// "execution" populeres faktiske rader trinn-vis fra løv mot rot.
// --------------------------------------------------------------------------

type Mode = "joins" | "scans" | "card" | "pushdown" | "explain";

const MODES: { id: Mode; label: string; sub: string; icon: typeof GitMerge }[] = [
  { id: "joins", label: "Join-algoritmer", sub: "nested / hash / merge", icon: GitMerge },
  { id: "scans", label: "Index vs Seq", sub: "WHERE id = 42", icon: Search },
  { id: "card", label: "Selektivitet", sub: "histogram + estimat", icon: BarChart3 },
  { id: "pushdown", label: "Predikat-pushdown", sub: "filter før JOIN", icon: Filter },
  { id: "explain", label: "EXPLAIN-tre", sub: "preset-bibliotek", icon: Layers },
];

// ============================================================
//                         Plan-tre type
// ============================================================

type PlanOp =
  | "SeqScan"
  | "IndexScan"
  | "IndexOnlyScan"
  | "BitmapIndexScan"
  | "BitmapHeapScan"
  | "NestedLoop"
  | "HashJoin"
  | "MergeJoin"
  | "Hash"
  | "Sort"
  | "Filter"
  | "HashAggregate"
  | "Limit";

type PlanNode = {
  id: string;
  op: PlanOp;
  /** Kort detalj-tekst: "on Ordre o", "Hash Cond: ..." */
  detail?: string;
  /** Estimert kost (forenklet). */
  cost: number;
  /** Estimerte rader. */
  estRows: number;
  /** Faktiske rader (settes av executor-animasjon). */
  actualRows?: number;
  children?: PlanNode[];
};

const OP_COLORS: Record<PlanOp, string> = {
  SeqScan: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  IndexScan: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  IndexOnlyScan: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  BitmapIndexScan: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  BitmapHeapScan: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  NestedLoop: "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  HashJoin: "border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  MergeJoin: "border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  Hash: "border-violet-500/40 bg-violet-500/5 text-violet-700 dark:text-violet-300",
  Sort: "border-fuchsia-500/40 bg-fuchsia-500/5 text-fuchsia-700 dark:text-fuchsia-300",
  Filter: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300",
  HashAggregate: "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Limit: "border-zinc-500/40 bg-zinc-500/5 text-zinc-700 dark:text-zinc-300",
};

const OP_LABEL: Record<PlanOp, string> = {
  SeqScan: "Seq Scan",
  IndexScan: "Index Scan",
  IndexOnlyScan: "Index Only Scan",
  BitmapIndexScan: "Bitmap Index Scan",
  BitmapHeapScan: "Bitmap Heap Scan",
  NestedLoop: "Nested Loop",
  HashJoin: "Hash Join",
  MergeJoin: "Merge Join",
  Hash: "Hash",
  Sort: "Sort",
  Filter: "Filter",
  HashAggregate: "HashAggregate",
  Limit: "Limit",
};

// ============================================================
//                    Hjelpere: tre-traversering
// ============================================================

/** Post-order rekkefølge (løv først, rot sist) — den faktiske eksekverings-orden. */
function postOrder(root: PlanNode): PlanNode[] {
  const out: PlanNode[] = [];
  const walk = (n: PlanNode) => {
    (n.children ?? []).forEach(walk);
    out.push(n);
  };
  walk(root);
  return out;
}

/** Setter actualRows på en node (immutabelt) gitt id. */
function withActual(root: PlanNode, id: string, actual: number): PlanNode {
  if (root.id === id) return { ...root, actualRows: actual };
  if (!root.children) return root;
  return { ...root, children: root.children.map((c) => withActual(c, id, actual)) };
}

/** Nuller alle actualRows (for reset). */
function clearActual(root: PlanNode): PlanNode {
  const copy: PlanNode = { ...root, actualRows: undefined };
  if (root.children) copy.children = root.children.map(clearActual);
  return copy;
}

// ============================================================
//                  Plan-bibliotek (forhåndsbygd)
// ============================================================

// Et "scenario" pakker SQL, plan-tre, fortelling og en metafor.
type Scenario = {
  id: string;
  title: string;
  sql: string;
  plan: PlanNode;
  /** Per-steg forklaring i postorder rekkefølge. */
  stepNotes: string[];
  /** Total estimert kost (vises i header). */
  totalCost?: number;
  metafor: string;
  intuisjon: string;
};

// ----- Join-modus (3 varianter av samme SQL) -----

const JOIN_SQL = `SELECT k.navn, o.total
FROM Kunde k
JOIN Ordre o ON o.kundenr = k.kundenr
WHERE k.by = 'Tromsø';`;

const SCEN_NESTED: Scenario = {
  id: "nested",
  title: "Nested Loop Join",
  sql: JOIN_SQL,
  plan: {
    id: "n-root",
    op: "NestedLoop",
    detail: "outer = Kunde, inner = Ordre (indeks-oppslag per rad)",
    cost: 156,
    estRows: 987,
    children: [
      {
        id: "n-outer",
        op: "IndexScan",
        detail: "idx_kunde_by  ·  Index Cond: by = 'Tromsø'",
        cost: 9,
        estRows: 120,
      },
      {
        id: "n-inner",
        op: "IndexScan",
        detail: "idx_ordre_kundenr  ·  Index Cond: o.kundenr = k.kundenr (loop = 120)",
        cost: 1.2,
        estRows: 8,
      },
    ],
  },
  stepNotes: [
    "Ytre side: Index Scan på idx_kunde_by henter 120 kunder i Tromsø.",
    "For hver av de 120 kundene: nytt indeks-oppslag i Ordre. 120 × ~8 rader ≈ 987.",
    "Nested Loop bobler ut 987 sammensatte rader til klient.",
  ],
  totalCost: 156,
  metafor:
    "Som å lete etter ett kort i to stokker: ta ett kort fra venstre stokk, bla gjennom hele høyre stokk, gjenta. Bare ok hvis venstre stokk er liten.",
  intuisjon:
    "Optimal når ytre side er liten OG indre side har indeks på join-kolonnen. Faller helt sammen hvis ytre side har 1M rader og hver indre lookup koster noe.",
};

const SCEN_HASH: Scenario = {
  id: "hash",
  title: "Hash Join",
  sql: JOIN_SQL,
  plan: {
    id: "h-root",
    op: "HashJoin",
    detail: "Hash Cond: o.kundenr = k.kundenr",
    cost: 130,
    estRows: 987,
    children: [
      {
        id: "h-probe",
        op: "SeqScan",
        detail: "on Ordre o  (probe-siden, full skan)",
        cost: 80,
        estRows: 4000,
      },
      {
        id: "h-hash",
        op: "Hash",
        detail: "bygger hash-tabell i RAM på Kunde-siden",
        cost: 9,
        estRows: 120,
        children: [
          {
            id: "h-build",
            op: "IndexScan",
            detail: "idx_kunde_by  ·  by = 'Tromsø'",
            cost: 9,
            estRows: 120,
          },
        ],
      },
    ],
  },
  stepNotes: [
    "Build: Index Scan på Kunde der by = 'Tromsø' → 120 rader.",
    "Hash: bygg hash-tabell H[kundenr] = kunde-rad. Blokkerende — alt må inn først.",
    "Probe: Seq Scan på Ordre. For hver av 4000 rader: slå opp H[o.kundenr]. 987 treff.",
  ],
  totalCost: 130,
  metafor:
    "Som å sortere ett kort-sett i et alfabetisk hyllesystem først, så bla raskt opp hver gang du leter. Engangs-arbeid foran, super-rask oppslag etterpå.",
  intuisjon:
    "Best når begge sider er middels-store og join er på likhet (=). Bygg den minste siden som hash; probe den større. RAM-hungrig.",
};

const SCEN_MERGE: Scenario = {
  id: "merge",
  title: "Merge Join",
  sql: JOIN_SQL,
  plan: {
    id: "m-root",
    op: "MergeJoin",
    detail: "Merge Cond: k.kundenr = o.kundenr",
    cost: 145,
    estRows: 987,
    children: [
      {
        id: "m-left",
        op: "Sort",
        detail: "Sort Key: k.kundenr",
        cost: 12,
        estRows: 120,
        children: [
          {
            id: "m-left-scan",
            op: "IndexScan",
            detail: "idx_kunde_by  ·  by = 'Tromsø'",
            cost: 9,
            estRows: 120,
          },
        ],
      },
      {
        id: "m-right",
        op: "IndexScan",
        detail: "idx_ordre_kundenr  (allerede sortert på kundenr)",
        cost: 110,
        estRows: 4000,
      },
    ],
  },
  stepNotes: [
    "Begge sider må være sortert på join-kolonnen. Venstre sorteres; høyre er allerede sortert via indeks.",
    "To pekere går parallelt nedover de sorterte listene — merge.",
    "Når begge har samme kundenr: emit kombinasjon. Ellers: avanser den minste.",
  ],
  totalCost: 145,
  metafor:
    "Som å lese to alfabetisk sorterte navnelister side om side og kun stoppe på navn som matcher. Ingen ekstra struktur — bare to fingre.",
  intuisjon:
    "Skinner når begge sider allerede er sortert (via indeks). Hvis du må sortere en stor side: hash-join vinner som regel.",
};

// ----- Scan-modus -----

const SCAN_SQL_BIG = `SELECT * FROM Logg
WHERE id = 42;
-- Tabell: 1 000 000 rader`;

const SCEN_SCAN_SEQ: Scenario = {
  id: "scan-seq",
  title: "Seq Scan (ingen indeks)",
  sql: SCAN_SQL_BIG,
  plan: {
    id: "ss-root",
    op: "Filter",
    detail: "Filter: id = 42",
    cost: 18334,
    estRows: 1,
    children: [
      {
        id: "ss-scan",
        op: "SeqScan",
        detail: "on Logg  (leser ALLE 1 000 000 rader)",
        cost: 18334,
        estRows: 1000000,
      },
    ],
  },
  stepNotes: [
    "Seq Scan starter på blokk 0 og leser hele Logg-tabellen.",
    "Filter slipper kun gjennom rader der id = 42.",
    "Resultat: 1 rad, men måtte rør 1 000 000 for å finne den.",
  ],
  totalCost: 18334,
  metafor:
    "Som å lete etter én side med et stikkord ved å bla gjennom hele boka fra perm til perm.",
  intuisjon:
    "Seq Scan skalerer lineært med tabell-størrelse. Greit hvis du faktisk skal ha de fleste radene; katastrofalt for punkt-oppslag.",
};

const SCEN_SCAN_IDX: Scenario = {
  id: "scan-idx",
  title: "Index Scan (B-tree på id)",
  sql: SCAN_SQL_BIG,
  plan: {
    id: "si-root",
    op: "IndexScan",
    detail: "Logg_pkey  ·  Index Cond: id = 42",
    cost: 4.3,
    estRows: 1,
    children: [],
  },
  stepNotes: [
    "Index Scan navigerer B-treet: 3 nivåer dyp på 1M rader → ~3 nodebesøk.",
    "Lov-i-løvet peker på heap-blokken med rad 42.",
    "Ett ekstra blokk-les → returner raden. Ferdig.",
  ],
  totalCost: 4,
  metafor:
    "Som å bruke stikkord-registeret bak i boka: hopp rett til riktig side i stedet for å lese hele boka.",
  intuisjon:
    "B-tree er O(log n). 1M rader = ~20 sammenligninger maks. Punkt-oppslag og range-queries elsker det.",
};

// ----- Pushdown-modus -----

const PUSHDOWN_SQL = `SELECT k.navn, o.total
FROM Kunde k
JOIN Ordre o USING (kundenr)
WHERE k.by = 'Tromsø'
  AND o.dato >= '2026-01-01';
-- Kunde: 10 000 rader  ·  Ordre: 500 000 rader`;

const SCEN_NAIVE: Scenario = {
  id: "naiv",
  title: "Naiv plan — filter ETTER join",
  sql: PUSHDOWN_SQL,
  plan: {
    id: "nv-root",
    op: "Filter",
    detail: "Filter: k.by = 'Tromsø' AND o.dato >= '2026-01-01'",
    cost: 12500,
    estRows: 987,
    children: [
      {
        id: "nv-join",
        op: "HashJoin",
        detail: "Hash Cond: o.kundenr = k.kundenr",
        cost: 12000,
        estRows: 500000,
        children: [
          {
            id: "nv-scan-o",
            op: "SeqScan",
            detail: "on Ordre o  (alle 500 000 rader)",
            cost: 8000,
            estRows: 500000,
          },
          {
            id: "nv-hash",
            op: "Hash",
            detail: "alle kunder",
            cost: 200,
            estRows: 10000,
            children: [
              {
                id: "nv-scan-k",
                op: "SeqScan",
                detail: "on Kunde k  (alle 10 000 rader)",
                cost: 200,
                estRows: 10000,
              },
            ],
          },
        ],
      },
    ],
  },
  stepNotes: [
    "Steg 1: skann ALLE 10 000 kunder og 500 000 ordrer.",
    "Steg 2: hash join → 500 000 sammensatte rader passerer gjennom.",
    "Steg 3: Filter kaster bort 99.8% av radene helt på toppen.",
  ],
  totalCost: 12500,
  metafor:
    "Som å invitere hele byen til middag og så spørre ved døra hvem som faktisk var sulten.",
  intuisjon:
    "Filter på toppen tvinger join til å holde alle radene i live. Hvert mellomledd bærer for mye.",
};

const SCEN_PUSH: Scenario = {
  id: "push",
  title: "Pushdown — filter FØR join",
  sql: PUSHDOWN_SQL,
  plan: {
    id: "pd-root",
    op: "HashJoin",
    detail: "Hash Cond: o.kundenr = k.kundenr",
    cost: 850,
    estRows: 987,
    children: [
      {
        id: "pd-scan-o",
        op: "IndexScan",
        detail: "idx_ordre_dato  ·  o.dato >= '2026-01-01'  (gir 12 000 rader)",
        cost: 600,
        estRows: 12000,
      },
      {
        id: "pd-hash",
        op: "Hash",
        detail: "120 Tromsø-kunder",
        cost: 9,
        estRows: 120,
        children: [
          {
            id: "pd-scan-k",
            op: "IndexScan",
            detail: "idx_kunde_by  ·  by = 'Tromsø'",
            cost: 9,
            estRows: 120,
          },
        ],
      },
    ],
  },
  stepNotes: [
    "Filtrene er dyttet ned til scan-nivå — bruker indeks på by og dato.",
    "Bare 120 kunder og 12 000 ordrer kommer i det hele tatt inn i join-en.",
    "Hash join produserer ferdig-filtrerte 987 rader. ~14× billigere.",
  ],
  totalCost: 850,
  metafor:
    "Som å ringe rundt på forhånd og bare invitere de sultne. Færre stoler å sette frem.",
  intuisjon:
    "Predikat-pushdown er den enkleste store gevinsten. Optimisten gjør det automatisk — men hvis du har funksjon på kolonne eller komplekse VIEWS, blokkeres pushdown og du må omskrive.",
};

// ----- EXPLAIN-modus (preset-bibliotek) -----

const SCEN_EXPL_AGG: Scenario = {
  id: "expl-agg",
  title: "Aggregering med GROUP BY",
  sql: `SELECT k.navn, SUM(o.total) AS sum_total
FROM Kunde k JOIN Ordre o USING (kundenr)
WHERE k.by = 'Tromsø'
GROUP BY k.navn;`,
  plan: {
    id: "ea-root",
    op: "HashAggregate",
    detail: "Group Key: k.navn",
    cost: 130,
    estRows: 47,
    children: [
      {
        id: "ea-join",
        op: "HashJoin",
        detail: "Hash Cond: o.kundenr = k.kundenr",
        cost: 120,
        estRows: 987,
        children: [
          {
            id: "ea-scan-o",
            op: "SeqScan",
            detail: "on Ordre o",
            cost: 80,
            estRows: 4000,
          },
          {
            id: "ea-hash",
            op: "Hash",
            detail: "120 kunder",
            cost: 9,
            estRows: 120,
            children: [
              {
                id: "ea-scan-k",
                op: "IndexScan",
                detail: "idx_kunde_by  ·  by = 'Tromsø'",
                cost: 9,
                estRows: 120,
              },
            ],
          },
        ],
      },
    ],
  },
  stepNotes: [
    "Index Scan finner Tromsø-kunder via indeks.",
    "Hash bygger H[kundenr] for de 120 kundene.",
    "Seq Scan på Ordre prober hash-tabellen — 987 sammensatte rader.",
    "HashAggregate grupperer på navn og summerer total → 47 rader.",
  ],
  totalCost: 130,
  metafor:
    "GROUP BY = sortér posten i bunker etter navn, så tell hver bunke.",
  intuisjon:
    "HashAggregate trenger ikke sorterte input. GroupAggregate krever sortert input men er minne-vennlig.",
};

const SCEN_EXPL_LIMIT: Scenario = {
  id: "expl-limit",
  title: "LIMIT + ORDER BY på indeks",
  sql: `SELECT * FROM Ordre
ORDER BY dato DESC
LIMIT 10;`,
  plan: {
    id: "el-root",
    op: "Limit",
    detail: "rows=10",
    cost: 0.5,
    estRows: 10,
    children: [
      {
        id: "el-scan",
        op: "IndexScan",
        detail: "idx_ordre_dato (Backward)  ·  første 10 fra siste",
        cost: 0.5,
        estRows: 10,
      },
    ],
  },
  stepNotes: [
    "Index Scan baklengs på dato-indeksen — start på største dato.",
    "Limit stopper executor etter 10 rader. Indeksen leses ikke videre.",
    "Totalt: ~10 indeksbesøk uansett tabell-størrelse.",
  ],
  totalCost: 0.5,
  metafor:
    "Som å si «de 10 nyeste i avisen»: bla bakfra og stopp etter 10.",
  intuisjon:
    "LIMIT på en indeks-sortert kolonne er ekstremt billig. Uten indeksen ville Sort + LIMIT kreve full skan først.",
};

const SCEN_EXPL_BITMAP: Scenario = {
  id: "expl-bitmap",
  title: "Bitmap kombinerer to indekser",
  sql: `SELECT * FROM Ordre
WHERE status = 'aktiv'
  AND betalt = false;`,
  plan: {
    id: "eb-root",
    op: "BitmapHeapScan",
    detail: "Recheck Cond: status = 'aktiv' AND betalt = false",
    cost: 230,
    estRows: 8400,
    children: [
      {
        id: "eb-and",
        op: "BitmapIndexScan",
        detail: "AND-merge av to bitmaps",
        cost: 30,
        estRows: 8400,
        children: [
          {
            id: "eb-idx-1",
            op: "BitmapIndexScan",
            detail: "idx_ordre_status  ·  status = 'aktiv'",
            cost: 15,
            estRows: 60000,
          },
          {
            id: "eb-idx-2",
            op: "BitmapIndexScan",
            detail: "idx_ordre_betalt  ·  betalt = false",
            cost: 15,
            estRows: 80000,
          },
        ],
      },
    ],
  },
  stepNotes: [
    "Hver indeks scanner og bygger en bitmap over kandidat-blokker.",
    "Bitmaps AND-es sammen — bare blokker som matcher BÅDE predikatene gjenstår.",
    "Heap-blokkene leses i rekkefølge (færre random IO) og rechecker predikatene.",
  ],
  totalCost: 230,
  metafor:
    "To stempler på samme arkiv-kort: bare kort som har begge stemplene plukkes ut.",
  intuisjon:
    "Bitmap fanger 'middels selektivitet' (10-30%). Verken én indeks alene eller seq scan vinner — kombiner.",
};

// ============================================================
//                    Plan-tre-render (SVG)
// ============================================================

type Pos = { x: number; y: number; node: PlanNode };

/** Tildel hver node en (x, y) i tre-layout. Bredden er antall løv. */
function layoutPlan(root: PlanNode): { positions: Pos[]; edges: { from: PlanNode; to: PlanNode }[]; width: number; depth: number } {
  const positions: Pos[] = [];
  const edges: { from: PlanNode; to: PlanNode }[] = [];
  let leafIdx = 0;
  let maxDepth = 0;

  function walk(n: PlanNode, depth: number): number {
    if (depth > maxDepth) maxDepth = depth;
    if (!n.children || n.children.length === 0) {
      const x = leafIdx++;
      positions.push({ x, y: depth, node: n });
      return x;
    }
    const childXs = n.children.map((c) => {
      edges.push({ from: n, to: c });
      return walk(c, depth + 1);
    });
    const x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    positions.push({ x, y: depth, node: n });
    return x;
  }
  walk(root, 0);
  return { positions, edges, width: Math.max(1, leafIdx), depth: maxDepth };
}

function PlanTree({
  root,
  activeId,
  completedIds,
}: {
  root: PlanNode;
  activeId: string | null;
  completedIds: Set<string>;
}) {
  const { positions, edges, width, depth } = useMemo(() => layoutPlan(root), [root]);

  const COL_W = 230;
  const ROW_H = 110;
  const PAD_X = 30;
  const PAD_Y = 30;
  const totalW = Math.max(COL_W, width * COL_W) + PAD_X * 2;
  const totalH = (depth + 1) * ROW_H + PAD_Y * 2;

  const posById = new Map<string, Pos>();
  positions.forEach((p) => posById.set(p.node.id, p));

  const nodeXY = (n: PlanNode) => {
    const p = posById.get(n.id)!;
    return {
      cx: PAD_X + p.x * COL_W + COL_W / 2,
      cy: PAD_Y + p.y * ROW_H + 35,
    };
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="block"
      >
        {/* Edges */}
        {edges.map((e, i) => {
          const a = nodeXY(e.from);
          const b = nodeXY(e.to);
          const flowing = completedIds.has(e.to.id);
          return (
            <line
              key={i}
              x1={a.cx}
              y1={a.cy + 28}
              x2={b.cx}
              y2={b.cy - 28}
              className={
                flowing
                  ? "stroke-brand"
                  : "stroke-border"
              }
              strokeWidth={flowing ? 2.5 : 1.5}
              strokeDasharray={flowing ? "0" : "4 3"}
            />
          );
        })}
        {/* Noder */}
        {positions.map((p) => {
          const { cx, cy } = nodeXY(p.node);
          const isActive = activeId === p.node.id;
          const isDone = completedIds.has(p.node.id);
          return (
            <foreignObject
              key={p.node.id}
              x={cx - 105}
              y={cy - 32}
              width={210}
              height={86}
            >
              <div
                className={`h-full rounded-lg border-2 px-2.5 py-1.5 text-[11px] font-mono leading-tight transition-all duration-300 ${
                  OP_COLORS[p.node.op]
                } ${
                  isActive
                    ? "ring-2 ring-brand ring-offset-2 ring-offset-background scale-[1.04]"
                    : isDone
                    ? "opacity-90"
                    : "opacity-60"
                }`}
                style={{ boxSizing: "border-box" }}
              >
                <div className="font-semibold text-[12px]">
                  {OP_LABEL[p.node.op]}
                </div>
                {p.node.detail && (
                  <div className="text-[10px] opacity-80 truncate" title={p.node.detail}>
                    {p.node.detail}
                  </div>
                )}
                <div className="mt-1 flex justify-between gap-2 text-[10px]">
                  <span>cost={p.node.cost}</span>
                  <span>
                    est={p.node.estRows.toLocaleString("no-NO")}
                  </span>
                  <span
                    className={`font-semibold ${
                      p.node.actualRows !== undefined ? "text-foreground" : "opacity-50"
                    }`}
                  >
                    rows=
                    {p.node.actualRows !== undefined
                      ? p.node.actualRows.toLocaleString("no-NO")
                      : "·"}
                  </span>
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================
//                    Executor-animasjon
// ============================================================

function useExecutor(scenario: Scenario) {
  const [plan, setPlan] = useState<PlanNode>(scenario.plan);
  const [stepIdx, setStepIdx] = useState(0); // 0 = ikke startet
  const [playing, setPlaying] = useState(false);
  const order = useMemo(() => postOrder(scenario.plan), [scenario]);
  const timerRef = useRef<number | null>(null);

  // Når scenarioet endrer seg: full reset.
  useEffect(() => {
    setPlan(clearActual(scenario.plan));
    setStepIdx(0);
    setPlaying(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [scenario]);

  const reset = () => {
    setPlan(clearActual(scenario.plan));
    setStepIdx(0);
    setPlaying(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const step = () => {
    if (stepIdx >= order.length) return;
    const next = order[stepIdx];
    // Bruk estRows som en proxy for actual — men varier den litt så
    // det ser ekte ut. (For pedagogikkens skyld: små avvik = "stale stats".)
    const wiggle =
      next.estRows > 1000
        ? Math.round(next.estRows * (0.95 + Math.random() * 0.1))
        : next.estRows;
    setPlan((p) => withActual(p, next.id, wiggle));
    setStepIdx((i) => i + 1);
  };

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= order.length) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      step();
    }, 700);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, stepIdx, order.length]);

  const activeId = stepIdx > 0 ? order[stepIdx - 1].id : null;
  const completedIds = useMemo(
    () => new Set(order.slice(0, stepIdx).map((n) => n.id)),
    [order, stepIdx]
  );

  return {
    plan,
    stepIdx,
    totalSteps: order.length,
    playing,
    setPlaying,
    step,
    reset,
    activeId,
    completedIds,
    currentNote:
      stepIdx > 0 && stepIdx <= scenario.stepNotes.length
        ? scenario.stepNotes[stepIdx - 1]
        : null,
  };
}

// ============================================================
//                Scenario-bryter (knapper)
// ============================================================

function ScenarioPicker({
  scenarios,
  activeId,
  onPick,
}: {
  scenarios: Scenario[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {scenarios.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onPick(s.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            activeId === s.id
              ? "bg-brand text-brand-foreground border-brand"
              : "border-border hover:bg-muted"
          }`}
        >
          {s.title}
        </button>
      ))}
    </div>
  );
}

// ============================================================
//                    Selektivitet-modus
// ============================================================

const HIST_BUCKETS = [
  { range: "10–30k", lo: 10000, hi: 30000, count: 180 },
  { range: "30–50k", lo: 30000, hi: 50000, count: 420 },
  { range: "50–70k", lo: 50000, hi: 70000, count: 260 },
  { range: "70–90k", lo: 70000, hi: 90000, count: 110 },
  { range: "90k–120k", lo: 90000, hi: 120000, count: 30 },
];

function CardinalityView() {
  const [threshold, setThreshold] = useState(50000);
  const totalRows = HIST_BUCKETS.reduce((s, b) => s + b.count, 0);

  // Estimat: andel av histogrammet over threshold.
  // For bucket som krysser thresholdet: anta uniform fordeling innenfor bucket.
  const estCount = HIST_BUCKETS.reduce((s, b) => {
    if (b.lo >= threshold) return s + b.count;
    if (b.hi <= threshold) return s;
    const frac = (b.hi - threshold) / (b.hi - b.lo);
    return s + Math.round(b.count * frac);
  }, 0);
  const selectivity = estCount / totalRows;

  // "Reelt" tall: avvik fra estimat for å vise stale-stats-poenget.
  // Vi varierer dette deterministisk basert på threshold.
  const realCount = Math.round(estCount * (0.85 + ((threshold % 7000) / 7000) * 0.35));
  const cost = Math.round(estCount * 1.2 + 40);

  const maxBucket = Math.max(...HIST_BUCKETS.map((b) => b.count));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>Histogram: <code className="font-mono">salary</code></span>
          <span>Σ rader: {totalRows.toLocaleString("no-NO")}</span>
        </div>
        <div className="grid grid-cols-5 gap-2 items-end h-32">
          {HIST_BUCKETS.map((b) => {
            const above = b.lo >= threshold;
            const partial = b.lo < threshold && b.hi > threshold;
            const fillRatio = b.count / maxBucket;
            return (
              <div key={b.range} className="flex flex-col items-center gap-1">
                <div className="text-[10px] text-muted-foreground font-mono">{b.count}</div>
                <div className="w-full h-full flex items-end">
                  <div
                    className={`w-full rounded-t transition-colors ${
                      above
                        ? "bg-emerald-500/70"
                        : partial
                        ? "bg-gradient-to-t from-amber-500/30 to-emerald-500/70"
                        : "bg-muted-foreground/30"
                    }`}
                    style={{ height: `${fillRatio * 100}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono">{b.range}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <label className="text-xs text-muted-foreground" htmlFor="thr">
            <code>WHERE salary &gt; {threshold.toLocaleString("no-NO")}</code>
          </label>
          <input
            id="thr"
            type="range"
            min={10000}
            max={120000}
            step={1000}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard
          label="Selektivitet (estimat)"
          value={`${(selectivity * 100).toFixed(1)}%`}
          sub="andel av histogrammet over grenseverdien"
        />
        <StatCard
          label="Estimerte rader"
          value={estCount.toLocaleString("no-NO")}
          sub={`av ${totalRows.toLocaleString("no-NO")} totalt`}
        />
        <StatCard
          label="Faktiske rader (ANALYZE)"
          value={realCount.toLocaleString("no-NO")}
          sub={
            Math.abs(realCount - estCount) / Math.max(1, estCount) > 0.2
              ? "⚠ stort avvik fra estimat"
              : "innenfor 20% av estimat"
          }
          tone={
            Math.abs(realCount - estCount) / Math.max(1, estCount) > 0.2
              ? "warn"
              : "ok"
          }
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2">
        <div className="font-semibold text-sm">Hva optimisten gjør:</div>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>
            Slår opp histogrammet for <code>salary</code> (samlet av <code>ANALYZE</code>).
          </li>
          <li>
            Regner selektivitet: andel bucket-areal over grenseverdien ={" "}
            <span className="font-mono text-foreground">
              {(selectivity * 100).toFixed(1)}%
            </span>
            .
          </li>
          <li>
            Estimat × kost-per-rad ={" "}
            <span className="font-mono text-foreground">cost ≈ {cost}</span>.
          </li>
          <li>
            Velger plan: hvis selektivitet er lav (&lt; 5–10%) → index scan. Hvis høy → seq scan.
            Her: <strong>{selectivity < 0.1 ? "index scan" : "seq scan"}</strong>.
          </li>
        </ol>
        <div className="mt-2 pt-2 border-t border-border text-muted-foreground">
          <strong className="text-foreground">Stale stats-felle:</strong> hvis ingen har
          kjørt <code>ANALYZE</code> etter at salary-fordelingen endret seg, gir
          histogrammet feil estimat — optimisten kan velge feil plan.
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-xs ${
        tone === "warn"
          ? "border-amber-500/50 bg-amber-500/5"
          : tone === "ok"
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-mono font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ============================================================
//                    Hoved-komponent
// ============================================================

export function QueryPlanVisualizer() {
  const [mode, setMode] = useState<Mode>("joins");

  // Per-modus aktivt scenario (en id-string).
  const [joinSel, setJoinSel] = useState<string>(SCEN_NESTED.id);
  const [scanSel, setScanSel] = useState<string>(SCEN_SCAN_SEQ.id);
  const [pushSel, setPushSel] = useState<string>(SCEN_NAIVE.id);
  const [explSel, setExplSel] = useState<string>(SCEN_EXPL_AGG.id);

  const joinScenarios = [SCEN_NESTED, SCEN_HASH, SCEN_MERGE];
  const scanScenarios = [SCEN_SCAN_SEQ, SCEN_SCAN_IDX];
  const pushScenarios = [SCEN_NAIVE, SCEN_PUSH];
  const explScenarios = [SCEN_EXPL_AGG, SCEN_EXPL_LIMIT, SCEN_EXPL_BITMAP];

  const activeScenario: Scenario | null = useMemo(() => {
    if (mode === "joins") return joinScenarios.find((s) => s.id === joinSel) ?? null;
    if (mode === "scans") return scanScenarios.find((s) => s.id === scanSel) ?? null;
    if (mode === "pushdown") return pushScenarios.find((s) => s.id === pushSel) ?? null;
    if (mode === "explain") return explScenarios.find((s) => s.id === explSel) ?? null;
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, joinSel, scanSel, pushSel, explSel]);

  return (
    <div className="not-prose rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-10" role="region" aria-label="Interaktiv visualisering: Spørreplan-optimisering">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Interaktiv visualisering
            </div>
            <div className="text-sm font-semibold">
              Query-plan-visualisator — se hvordan SQL blir til en plan
            </div>
          </div>
          <Database className="h-5 w-5 text-brand shrink-0" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                title={m.sub}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                  mode === m.id
                    ? "bg-brand text-brand-foreground border-brand"
                    : "border-border hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      {mode === "card" ? (
        <div className="p-5 bg-background">
          <CardinalityView />
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            <MetaforPanel
              metafor="Histogrammet er et grovt kart over hvor verdiene faktisk ligger — 5 stolper, ikke ett tall per rad."
              intuisjon="Optimisten bruker selektivitet × tabell-størrelse for å gjette rad-tall. Når gjettet bommer mye → velger feil plan."
            />
            <CostModelPanel />
          </div>
        </div>
      ) : (
        activeScenario && (
          <ScenarioBody
            scenario={activeScenario}
            scenarios={
              mode === "joins"
                ? joinScenarios
                : mode === "scans"
                ? scanScenarios
                : mode === "pushdown"
                ? pushScenarios
                : explScenarios
            }
            activeId={
              mode === "joins"
                ? joinSel
                : mode === "scans"
                ? scanSel
                : mode === "pushdown"
                ? pushSel
                : explSel
            }
            onPick={(id) => {
              if (mode === "joins") setJoinSel(id);
              else if (mode === "scans") setScanSel(id);
              else if (mode === "pushdown") setPushSel(id);
              else setExplSel(id);
            }}
            showCostPanel={mode !== "explain"}
          />
        )
      )}
    </div>
  );
}

function ScenarioBody({
  scenario,
  scenarios,
  activeId,
  onPick,
  showCostPanel,
}: {
  scenario: Scenario;
  scenarios: Scenario[];
  activeId: string;
  onPick: (id: string) => void;
  showCostPanel: boolean;
}) {
  const exec = useExecutor(scenario);

  return (
    <div className="bg-background">
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <ScenarioPicker scenarios={scenarios} activeId={activeId} onPick={onPick} />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-mono">
            Steg {exec.stepIdx}/{exec.totalSteps}
          </span>
          <button
            type="button"
            onClick={() => exec.setPlaying((p) => !p)}
            disabled={exec.stepIdx >= exec.totalSteps && !exec.playing}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-brand/40 text-brand hover:bg-brand/10 disabled:opacity-50"
          >
            {exec.playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {exec.playing ? "Pause" : "Spill av"}
          </button>
          <button
            type="button"
            onClick={exec.step}
            disabled={exec.stepIdx >= exec.totalSteps}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-border hover:bg-muted disabled:opacity-50"
          >
            <StepForward className="h-3 w-3" />
            Neste steg
          </button>
          <button
            type="button"
            onClick={exec.reset}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 p-4">
        {/* Venstre: SQL + tre */}
        <div className="space-y-3">
          <pre className="font-mono text-[11px] whitespace-pre rounded bg-muted/30 border border-border p-3 overflow-x-auto">
            {scenario.sql}
          </pre>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2 text-[11px] text-muted-foreground">
              <span>Plan-tre (les nedenfra og opp)</span>
              {scenario.totalCost !== undefined && (
                <span className="font-mono">
                  Total cost ≈ {scenario.totalCost.toLocaleString("no-NO")}
                </span>
              )}
            </div>
            <PlanTree
              root={exec.plan}
              activeId={exec.activeId}
              completedIds={exec.completedIds}
            />
          </div>
          {exec.currentNote && (
            <div className="rounded-lg border border-brand/40 bg-brand/5 p-3 text-xs flex items-start gap-2">
              <Lightbulb className="h-3.5 w-3.5 text-brand mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold">Steg {exec.stepIdx}:</span>{" "}
                {exec.currentNote}
              </span>
            </div>
          )}
        </div>

        {/* Høyre: metafor + (eventuelt) kost-modell */}
        <div className="space-y-3">
          <MetaforPanel metafor={scenario.metafor} intuisjon={scenario.intuisjon} />
          {showCostPanel && <CostModelPanel />}
          <LegendPanel />
        </div>
      </div>
    </div>
  );
}

function MetaforPanel({ metafor, intuisjon }: { metafor: string; intuisjon: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
      <div className="font-semibold text-sm">Metafor + intuisjon</div>
      <div className="text-muted-foreground">
        <span className="font-semibold text-foreground">Bilde:</span> {metafor}
      </div>
      <div className="text-muted-foreground">
        <span className="font-semibold text-foreground">Når valgt:</span> {intuisjon}
      </div>
    </div>
  );
}

function CostModelPanel() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
      <div className="font-semibold text-sm">Kostnads-modell forklart</div>
      <pre className="font-mono text-[10.5px] whitespace-pre bg-muted/40 rounded p-2 overflow-x-auto">{`cost  =  rader_lest       * IO_cost
       +  rader_bearbeidet * CPU_cost
       +  ekstra (sort, hash-bygging, ...)`}</pre>
      <ul className="list-disc pl-4 text-muted-foreground space-y-1">
        <li>
          <span className="font-mono text-foreground">IO_cost</span> ≈ kost per blokk-les
          (random ofte 4× sekvensiell).
        </li>
        <li>
          <span className="font-mono text-foreground">CPU_cost</span> ≈ kost per rad å
          evaluere predikat eller hashe.
        </li>
        <li>
          Tallene er <em>relative</em>, ikke millisekunder. Sammenlign planer, ikke
          sekunder.
        </li>
      </ul>
    </div>
  );
}

function LegendPanel() {
  const items: { op: PlanOp; tekst: string }[] = [
    { op: "SeqScan", tekst: "Seq Scan — full tabell-skan" },
    { op: "IndexScan", tekst: "Index Scan — B-tree-navigasjon" },
    { op: "NestedLoop", tekst: "Nested Loop — for hver ytre rad, sjekk indre" },
    { op: "HashJoin", tekst: "Hash Join — bygg hash + probe" },
    { op: "MergeJoin", tekst: "Merge Join — to sorterte pekere" },
    { op: "HashAggregate", tekst: "Aggregat — GROUP BY-bunker" },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs">
      <div className="font-semibold text-sm mb-2">Operator-fargene</div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.op} className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-sm border ${OP_COLORS[it.op]}`}
              aria-hidden
            />
            <span className="text-muted-foreground">{it.tekst}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
