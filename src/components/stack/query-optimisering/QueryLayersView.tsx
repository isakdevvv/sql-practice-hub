import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  TreePine,
  Sigma,
  Cpu,
  Network,
  HardDrive,
  Clock,
  Braces,
  Info,
} from "lucide-react";

// --------------------------------------------------------------------------
// QueryLayersView — "Samme spørring fra flere vinkler"
//
// Viser ÉN SQL-spørring på åtte abstraksjonslag samtidig (SQL-tekst, AST,
// logisk plan, fysisk plan, B-tree-tilgang, diskpages, I/O-timeline, bytes).
// Studenten kan:
//   - klikke på et "kapasitetsord" (f.eks. `age`) i ett lag og se det
//     fremhevet i ALLE lagene der det dukker opp.
//   - kollapse/utvide hvert lag enkeltvis.
//   - hovre over info-ikonet for et lag for å lese "hva er dette laget?".
//
// Pedagogikken: én og samme ting ser annerledes ut på hvert abstraksjonsnivå.
// Som ei mappe på datamaskinen — vinduet viser ikoner, OS-en ser inoder,
// disken ser sektorer. Alt er samme ting, sett gjennom forskjellige briller.
// --------------------------------------------------------------------------

// Felles "konsept-nøkler" som binder lagene sammen. Hover/click på et ord
// i ett lag fremhever alt med samme nøkkel på tvers av lagene.
type ConceptKey =
  | "age"
  | "name"
  | "created_at"
  | "users"
  | "idx_age"
  | "limit"
  | "sort"
  | "where"
  | "select";

type LayerId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const LAYER_META: { id: LayerId; title: string; sub: string; Icon: typeof FileText; tooltip: string }[] = [
  {
    id: 1,
    title: "SQL-tekst",
    sub: "Det du faktisk skriver",
    Icon: FileText,
    tooltip:
      "Lag 1: Deklarativ tekst. Her sier du HVA du vil ha — ikke hvordan. Resten av stacken oversetter dette ned til faktiske diskleseoperasjoner.",
  },
  {
    id: 2,
    title: "AST — parse tree",
    sub: "Parseren gjør tekst til tre",
    Icon: TreePine,
    tooltip:
      "Lag 2: Parseren leser SQL-grammatikken og bygger et syntaks-tre. Hver klausul blir en node. Her dør spørringen hvis du har syntaksfeil.",
  },
  {
    id: 3,
    title: "Logisk plan",
    sub: "Relasjonsalgebra",
    Icon: Sigma,
    tooltip:
      "Lag 3: Optimisten oversetter til mengdelære: π (projeksjon), σ (selection), τ (sort). Algebra-uttrykket er uavhengig av indekser og fysisk lagring.",
  },
  {
    id: 4,
    title: "Fysisk plan",
    sub: "Postgres-stil EXPLAIN",
    Icon: Cpu,
    tooltip:
      "Lag 4: Optimisten velger konkrete operatorer: Index Scan, Sort, Limit, Hash. Hver operator har et kost-estimat. Dette ser du i EXPLAIN.",
  },
  {
    id: 5,
    title: "B-tree access",
    sub: "Hvilke indeksnoder leses",
    Icon: Network,
    tooltip:
      "Lag 5: For å finne age > 30 traverserer motoren B-treet idx_users_age fra rot til løvnivå. Hvert nivå er ett blokk-oppslag.",
  },
  {
    id: 6,
    title: "Diskpages",
    sub: "Hvilke 8 KB-blokker leses",
    Icon: HardDrive,
    tooltip:
      "Lag 6: Postgres leser data i 8 KB-pages. Indeksen ligger i ett sett pages, heap-tabellen i et annet. Random IO mot heap er det dyre.",
  },
  {
    id: 7,
    title: "Disk-I/O-timeline",
    sub: "Hvor sekundene faktisk forsvinner",
    Icon: Clock,
    tooltip:
      "Lag 7: Faktiske diskleseoperasjoner. Sekvensielle reads ≈ 100 µs, random reads ≈ 5 ms. Det er HER ytelsen avgjøres.",
  },
  {
    id: 8,
    title: "Bytes — JSON-respons",
    sub: "Det som faktisk går til klienten",
    Icon: Braces,
    tooltip:
      "Lag 8: Etter all denne maskineriet ender det opp som noen hundre bytes JSON over wire. Klienten ser aldri lagene under.",
  },
];

const CONCEPT_LABEL: Record<ConceptKey, string> = {
  age: "age (alder)",
  name: "name (navn)",
  created_at: "created_at",
  users: "users (tabell)",
  idx_age: "idx_users_age",
  limit: "LIMIT 10",
  sort: "ORDER BY (sort)",
  where: "WHERE-predikat",
  select: "SELECT-projeksjon",
};

// Et lite "klikkbart token" som binder seg til en konsept-nøkkel.
function Tok({
  k,
  children,
  active,
  onHover,
  onLeave,
  className = "",
}: {
  k: ConceptKey;
  children: React.ReactNode;
  active: ConceptKey | null;
  onHover: (k: ConceptKey) => void;
  onLeave: () => void;
  className?: string;
}) {
  const isHit = active === k;
  const isDimmed = active !== null && !isHit;
  return (
    <span
      role="button"
      tabIndex={0}
      onMouseEnter={() => onHover(k)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(k)}
      onBlur={onLeave}
      className={[
        "cursor-pointer rounded px-1 -mx-0.5 transition-all duration-150",
        isHit
          ? "bg-amber-300/60 dark:bg-amber-400/40 text-foreground ring-1 ring-amber-500/70 font-semibold"
          : isDimmed
          ? "opacity-30"
          : "hover:bg-muted",
        className,
      ].join(" ")}
      aria-label={CONCEPT_LABEL[k]}
      title={CONCEPT_LABEL[k]}
    >
      {children}
    </span>
  );
}

// Generisk dim/highlight-wrapper for elementer uten klikk-handler
function Glow({
  k,
  active,
  children,
  className = "",
}: {
  k: ConceptKey;
  active: ConceptKey | null;
  children: React.ReactNode;
  className?: string;
}) {
  const isHit = active === k;
  const isDimmed = active !== null && !isHit;
  return (
    <span
      className={[
        "rounded transition-all duration-150",
        isHit ? "ring-2 ring-amber-500/70 bg-amber-300/30 dark:bg-amber-400/20" : "",
        isDimmed ? "opacity-30" : "",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function QueryLayersView() {
  // Hvilket konsept blir fremhevet på tvers av lagene
  const [active, setActive] = useState<ConceptKey | null>(null);
  // Hvilke lag som er kollapsede
  const [collapsed, setCollapsed] = useState<Record<LayerId, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
  });

  const onHover = (k: ConceptKey) => setActive(k);
  const onLeave = () => setActive(null);

  const toggle = (id: LayerId) =>
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const conceptList: ConceptKey[] = useMemo(
    () => ["age", "name", "created_at", "users", "idx_age", "where", "sort", "limit", "select"],
    [],
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold tracking-tight">
          Samme spørring fra åtte vinkler
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Hover eller fokuser et fargelagt ord nedenfor — så fremheves det
          samme konseptet i hvert lag det dukker opp i.
        </p>
      </div>

      {/* Felles ord-legende */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {conceptList.map((k) => (
          <button
            key={k}
            type="button"
            onMouseEnter={() => onHover(k)}
            onMouseLeave={onLeave}
            onFocus={() => onHover(k)}
            onBlur={onLeave}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all",
              active === k
                ? "bg-amber-300/70 dark:bg-amber-400/40 border-amber-500 text-foreground"
                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted",
            ].join(" ")}
          >
            {CONCEPT_LABEL[k]}
          </button>
        ))}
      </div>

      {/* Stack med åtte lag */}
      <div className="space-y-3">
        {LAYER_META.map((m) => {
          const isOpen = !collapsed[m.id];
          const Icon = m.Icon;
          return (
            <div
              key={m.id}
              className="rounded-xl border border-border bg-background"
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => toggle(m.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 rounded-xl"
                aria-expanded={isOpen}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                  {m.id}
                </span>
                <Icon className="h-4 w-4 text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">
                    {m.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {m.sub}
                  </div>
                </div>
                <span
                  className="group relative shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute right-0 top-full z-10 mt-1 w-64 rounded-md border border-border bg-popover p-2 text-[11px] text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {m.tooltip}
                  </span>
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1">
                  {m.id === 1 && <Layer1 active={active} onHover={onHover} onLeave={onLeave} />}
                  {m.id === 2 && <Layer2 active={active} onHover={onHover} onLeave={onLeave} />}
                  {m.id === 3 && <Layer3 active={active} onHover={onHover} onLeave={onLeave} />}
                  {m.id === 4 && <Layer4 active={active} onHover={onHover} onLeave={onLeave} />}
                  {m.id === 5 && <Layer5 active={active} />}
                  {m.id === 6 && <Layer6 active={active} />}
                  {m.id === 7 && <Layer7 active={active} />}
                  {m.id === 8 && <Layer8 active={active} onHover={onHover} onLeave={onLeave} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pedagogisk avslutning */}
      <div className="mt-5 rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs text-foreground/80">
        Det samme spørringa ser annerledes ut avhengig av abstraksjonsnivå.
        Som ei mappe på datamaskinen — vinduet ditt viser ikoner, OS-et ser
        inoder, og disken ser sektorer. Lag 1–4 er logikk og planlegging;
        lag 5–7 er der ytelsen faktisk avgjøres; lag 8 er det eneste klienten
        ser av all denne maskineriet.
      </div>
    </div>
  );
}

// ===========================================================================
// Lag 1 — SQL-tekst med manuell syntaks-fargelegging
// ===========================================================================
function Layer1({
  active,
  onHover,
  onLeave,
}: {
  active: ConceptKey | null;
  onHover: (k: ConceptKey) => void;
  onLeave: () => void;
}) {
  return (
    <pre className="font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre rounded bg-muted/40 border border-border p-3 leading-7">
      <span className="text-violet-600 dark:text-violet-400 font-semibold">
        <Tok k="select" active={active} onHover={onHover} onLeave={onLeave}>
          SELECT
        </Tok>
      </span>{" "}
      <Tok k="name" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="text-sky-700 dark:text-sky-300">name</span>
      </Tok>
      {"\n"}
      <span className="text-violet-600 dark:text-violet-400 font-semibold">FROM</span>{" "}
      <Tok k="users" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="text-emerald-700 dark:text-emerald-300">users</span>
      </Tok>
      {"\n"}
      <span className="text-violet-600 dark:text-violet-400 font-semibold">
        <Tok k="where" active={active} onHover={onHover} onLeave={onLeave}>
          WHERE
        </Tok>
      </span>{" "}
      <Tok k="age" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="text-sky-700 dark:text-sky-300">age</span>
      </Tok>{" "}
      <span className="text-rose-600 dark:text-rose-400">&gt;</span>{" "}
      <span className="text-amber-700 dark:text-amber-300">30</span>
      {"\n"}
      <span className="text-violet-600 dark:text-violet-400 font-semibold">
        <Tok k="sort" active={active} onHover={onHover} onLeave={onLeave}>
          ORDER BY
        </Tok>
      </span>{" "}
      <Tok k="created_at" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="text-sky-700 dark:text-sky-300">created_at</span>
      </Tok>{" "}
      <span className="text-violet-600 dark:text-violet-400 font-semibold">DESC</span>
      {"\n"}
      <span className="text-violet-600 dark:text-violet-400 font-semibold">
        <Tok k="limit" active={active} onHover={onHover} onLeave={onLeave}>
          LIMIT 10
        </Tok>
      </span>
      ;
    </pre>
  );
}

// ===========================================================================
// Lag 2 — AST / parse tree (inline ascii-tre, men hyggelig stylet)
// ===========================================================================
function Layer2({
  active,
  onHover,
  onLeave,
}: {
  active: ConceptKey | null;
  onHover: (k: ConceptKey) => void;
  onLeave: () => void;
}) {
  const Box = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span
      className={[
        "inline-block rounded border border-border bg-card px-2 py-0.5 text-[11px] font-mono",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
  return (
    <div className="font-mono text-[11px] sm:text-xs leading-7 overflow-x-auto">
      <div>
        <Box className="bg-violet-100 dark:bg-violet-950/40 border-violet-500/40">SelectStmt</Box>
      </div>
      <div className="ml-4">
        ├── <Tok k="select" active={active} onHover={onHover} onLeave={onLeave}><Box>Projection</Box></Tok> →{" "}
        <Tok k="name" active={active} onHover={onHover} onLeave={onLeave}><Box>Ident(name)</Box></Tok>
      </div>
      <div className="ml-4">
        ├── <Box>From</Box> →{" "}
        <Tok k="users" active={active} onHover={onHover} onLeave={onLeave}><Box>Table(users)</Box></Tok>
      </div>
      <div className="ml-4">
        ├── <Tok k="where" active={active} onHover={onHover} onLeave={onLeave}><Box>Where</Box></Tok> →{" "}
        <Box>BinOp(&gt;)</Box>
      </div>
      <div className="ml-8">
        │   ├── <Tok k="age" active={active} onHover={onHover} onLeave={onLeave}><Box>Ident(age)</Box></Tok>
      </div>
      <div className="ml-8">
        │   └── <Box>Lit(30)</Box>
      </div>
      <div className="ml-4">
        ├── <Tok k="sort" active={active} onHover={onHover} onLeave={onLeave}><Box>OrderBy</Box></Tok> →{" "}
        <Tok k="created_at" active={active} onHover={onHover} onLeave={onLeave}><Box>Ident(created_at)</Box></Tok>{" "}
        <Box>DESC</Box>
      </div>
      <div className="ml-4">
        └── <Tok k="limit" active={active} onHover={onHover} onLeave={onLeave}><Box>Limit(10)</Box></Tok>
      </div>
    </div>
  );
}

// ===========================================================================
// Lag 3 — Logisk plan: relasjonsalgebra
// ===========================================================================
function Layer3({
  active,
  onHover,
  onLeave,
}: {
  active: ConceptKey | null;
  onHover: (k: ConceptKey) => void;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-sm sm:text-base leading-relaxed rounded bg-muted/40 border border-border p-3 overflow-x-auto">
        <Tok k="limit" active={active} onHover={onHover} onLeave={onLeave}>
          <span className="text-foreground">limit</span>
          <sub className="text-[10px]">10</sub>
        </Tok>
        {"  ( "}
        <Tok k="select" active={active} onHover={onHover} onLeave={onLeave}>
          <span className="text-violet-700 dark:text-violet-300">π</span>
          <sub className="text-[10px]">
            <Tok k="name" active={active} onHover={onHover} onLeave={onLeave}>name</Tok>
          </sub>
        </Tok>
        {" ( "}
        <Tok k="where" active={active} onHover={onHover} onLeave={onLeave}>
          <span className="text-rose-700 dark:text-rose-300">σ</span>
          <sub className="text-[10px]">
            <Tok k="age" active={active} onHover={onHover} onLeave={onLeave}>age</Tok>
            &nbsp;&gt;&nbsp;30
          </sub>
        </Tok>
        {" ( "}
        <Tok k="sort" active={active} onHover={onHover} onLeave={onLeave}>
          <span className="text-emerald-700 dark:text-emerald-300">τ</span>
          <sub className="text-[10px]">
            <Tok k="created_at" active={active} onHover={onHover} onLeave={onLeave}>created_at↓</Tok>
          </sub>
        </Tok>
        {" ( "}
        <Tok k="users" active={active} onHover={onHover} onLeave={onLeave}>
          <span className="text-sky-700 dark:text-sky-300">users</span>
        </Tok>
        {" ) ) ) )"}
      </div>
      <ul className="list-disc pl-5 text-[11px] text-muted-foreground space-y-0.5">
        <li>
          <span className="font-mono text-violet-700 dark:text-violet-300">π</span> — projeksjon (velg kolonner)
        </li>
        <li>
          <span className="font-mono text-rose-700 dark:text-rose-300">σ</span> — selection (filtrér rader)
        </li>
        <li>
          <span className="font-mono text-emerald-700 dark:text-emerald-300">τ</span> — sort
        </li>
      </ul>
    </div>
  );
}

// ===========================================================================
// Lag 4 — Fysisk plan (Postgres-stil EXPLAIN)
// ===========================================================================
function Layer4({
  active,
  onHover,
  onLeave,
}: {
  active: ConceptKey | null;
  onHover: (k: ConceptKey) => void;
  onLeave: () => void;
}) {
  return (
    <pre className="font-mono text-[11px] sm:text-xs overflow-x-auto whitespace-pre rounded bg-muted/40 border border-border p-3 leading-6">
      <Tok k="limit" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="font-semibold">Limit</span>
      </Tok>{" "}
      (cost=0.42..3.18 rows=10){"\n"}
      {"  ->  "}
      <Tok k="sort" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="font-semibold">Sort</span>
      </Tok>{" "}
      (cost=0.42..7.50 rows=120){"\n"}
      {"        Sort Key: "}
      <Tok k="created_at" active={active} onHover={onHover} onLeave={onLeave}>created_at</Tok>
      {" DESC\n"}
      {"        ->  "}
      <Tok k="where" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="font-semibold">Index Scan</span>
      </Tok>
      {" using "}
      <Tok k="idx_age" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="text-emerald-700 dark:text-emerald-300">idx_users_age</span>
      </Tok>
      {" on "}
      <Tok k="users" active={active} onHover={onHover} onLeave={onLeave}>
        <span className="text-sky-700 dark:text-sky-300">users</span>
      </Tok>
      {"\n"}
      {"              (cost=0.42..6.20 rows=120 width=18)\n"}
      {"              Index Cond: ("}
      <Tok k="age" active={active} onHover={onHover} onLeave={onLeave}>age</Tok>
      {" > 30)\n"}
      {"Planning Time: 0.12 ms\n"}
      {"Execution Time: 0.84 ms"}
    </pre>
  );
}

// ===========================================================================
// Lag 5 — B-tree access (SVG-tegning av idx_users_age)
// ===========================================================================
function Layer5({ active }: { active: ConceptKey | null }) {
  // Vi tegner et lite B-tre (order 3) med 3 nivåer. Sti markeres som "visited"
  // når age > 30 — vi starter ved roten, ned til høyre subtre (>30), så
  // sekvensielt langs løvene oppover i alder.
  const visitedNodes = new Set(["root", "i2", "l3", "l4", "l5"]);
  const Node = ({
    id,
    x,
    y,
    label,
    highlightKey,
  }: {
    id: string;
    x: number;
    y: number;
    label: string;
    highlightKey?: boolean;
  }) => {
    const visited = visitedNodes.has(id);
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={70}
          height={26}
          rx={4}
          className={[
            "transition-all",
            visited
              ? "fill-amber-200 dark:fill-amber-900/60 stroke-amber-600"
              : "fill-card stroke-border",
            highlightKey && active === "age"
              ? "stroke-amber-500"
              : "",
          ].join(" ")}
          strokeWidth={1.5}
        />
        <text
          x={x + 35}
          y={y + 17}
          textAnchor="middle"
          className="text-[10px] font-mono fill-foreground"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground">
        Indeks{" "}
        <span
          className={[
            "font-mono",
            active === "idx_age"
              ? "bg-amber-300/60 dark:bg-amber-400/40 px-1 rounded"
              : active !== null
              ? "opacity-30"
              : "",
          ].join(" ")}
        >
          idx_users_age
        </span>{" "}
        — start i rot, gå høyre fordi 30 &lt; 50 og vi vil ha alle &gt; 30. Les
        løvnoder l3, l4, l5 i rekkefølge.
      </div>
      <svg viewBox="0 0 480 170" className="w-full h-auto rounded bg-muted/30 border border-border">
        {/* Kanter */}
        <g stroke="currentColor" className="text-muted-foreground" strokeWidth={1} fill="none">
          {/* rot → i1 / i2 */}
          <line x1={245} y1={26} x2={90} y2={70} />
          <line x1={245} y1={26} x2={395} y2={70} />
          {/* i1 → l1, l2 */}
          <line x1={90} y1={96} x2={40} y2={140} />
          <line x1={90} y1={96} x2={140} y2={140} />
          {/* i2 → l3, l4, l5 */}
          <line x1={395} y1={96} x2={245} y2={140} />
          <line x1={395} y1={96} x2={340} y2={140} />
          <line x1={395} y1={96} x2={440} y2={140} />
        </g>
        {/* Rot */}
        <Node id="root" x={210} y={0} label="[50]" highlightKey />
        {/* Interne */}
        <Node id="i1" x={55} y={70} label="[20]" highlightKey />
        <Node id="i2" x={360} y={70} label="[70]" highlightKey />
        {/* Løv */}
        <Node id="l1" x={5} y={140} label="18,19" />
        <Node id="l2" x={105} y={140} label="22,27" />
        <Node id="l3" x={210} y={140} label="31,42" highlightKey />
        <Node id="l4" x={305} y={140} label="55,63" highlightKey />
        <Node id="l5" x={405} y={140} label="78,84" highlightKey />
      </svg>
      <div className="text-[11px] text-muted-foreground">
        Gule noder = leste. Vi traverserer 3 nivåer ned + 3 løvnoder langs
        bunnen. 6 indeks-page-reads.
      </div>
    </div>
  );
}

// ===========================================================================
// Lag 6 — Diskpages (8 stk, vi viser hvilke leses)
// ===========================================================================
function Layer6({ active }: { active: ConceptKey | null }) {
  // 8 pages: P0..P7. P0..P1 = indeks-løvpages, P2..P7 = heap (users-tabell).
  // Vi leser P0, P1 sekvensielt (indeks), så hopper til P3, P5, P7 (random
  // heap fetch for radene som matchet).
  type PageState = { id: string; kind: "idx" | "heap"; status: "seq" | "rand" | "skip"; label: string };
  const pages: PageState[] = [
    { id: "P0", kind: "idx", status: "seq", label: "idx løv" },
    { id: "P1", kind: "idx", status: "seq", label: "idx løv" },
    { id: "P2", kind: "heap", status: "skip", label: "users" },
    { id: "P3", kind: "heap", status: "rand", label: "users" },
    { id: "P4", kind: "heap", status: "skip", label: "users" },
    { id: "P5", kind: "heap", status: "rand", label: "users" },
    { id: "P6", kind: "heap", status: "skip", label: "users" },
    { id: "P7", kind: "heap", status: "rand", label: "users" },
  ];
  const isIndexFocus = active === "idx_age";
  const isUsersFocus = active === "users";
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground">
        Postgres leser i 8 KB-pages. To av indeks-løvene leses sekvensielt
        (billig). Tre heap-pages leses random (dyrt).
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {pages.map((p) => {
          const dim =
            (isIndexFocus && p.kind !== "idx") ||
            (isUsersFocus && p.kind !== "heap");
          const ring =
            (isIndexFocus && p.kind === "idx") ||
            (isUsersFocus && p.kind === "heap");
          const colorClass =
            p.status === "seq"
              ? "bg-emerald-200 dark:bg-emerald-900/60 border-emerald-500"
              : p.status === "rand"
              ? "bg-rose-200 dark:bg-rose-900/60 border-rose-500"
              : "bg-card border-border";
          return (
            <div
              key={p.id}
              className={[
                "rounded border p-1.5 text-center transition-all",
                colorClass,
                dim ? "opacity-30" : "",
                ring ? "ring-2 ring-amber-500/70" : "",
              ].join(" ")}
            >
              <div className="text-[10px] font-mono font-semibold">{p.id}</div>
              <div className="text-[9px] text-muted-foreground">{p.label}</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-700" />
          sekvensiell
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-rose-300 dark:bg-rose-700" />
          random
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-card border border-border" />
          ikke lest
        </span>
      </div>
    </div>
  );
}

// ===========================================================================
// Lag 7 — Disk-I/O-timeline
// ===========================================================================
function Layer7({ active: _active }: { active: ConceptKey | null }) {
  // Vi viser et lite tids-spann: 5 ops. To sekv (smale), 3 random (brede).
  // Skala: 1 µs = 0.5 px (sekv) men random på 5000 µs = 100 px hver.
  type Op = { label: string; us: number; kind: "seq" | "rand" };
  const ops: Op[] = [
    { label: "P0", us: 100, kind: "seq" },
    { label: "P1", us: 100, kind: "seq" },
    { label: "P3", us: 5000, kind: "rand" },
    { label: "P5", us: 5000, kind: "rand" },
    { label: "P7", us: 5000, kind: "rand" },
  ];
  const totalUs = ops.reduce((a, o) => a + o.us, 0);
  return (
    <div className="space-y-2">
      <div className="flex h-8 w-full overflow-hidden rounded border border-border bg-muted/30">
        {ops.map((o, i) => {
          const pct = (o.us / totalUs) * 100;
          return (
            <div
              key={i}
              style={{ width: `${pct}%` }}
              className={[
                "flex items-center justify-center text-[10px] font-mono border-r border-background last:border-r-0",
                o.kind === "seq"
                  ? "bg-emerald-300 dark:bg-emerald-800/70 text-emerald-950 dark:text-emerald-100"
                  : "bg-rose-300 dark:bg-rose-800/70 text-rose-950 dark:text-rose-100",
              ].join(" ")}
              title={`${o.label}: ${o.us} µs ${o.kind === "seq" ? "(sekv)" : "(random)"}`}
            >
              {o.label}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="rounded border border-emerald-500/40 bg-emerald-500/5 p-2">
          <div className="font-semibold">2 × sekvensielle</div>
          <div className="font-mono text-muted-foreground">2 × 100 µs = 200 µs</div>
        </div>
        <div className="rounded border border-rose-500/40 bg-rose-500/5 p-2">
          <div className="font-semibold">3 × random</div>
          <div className="font-mono text-muted-foreground">3 × 5 ms = 15 000 µs</div>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground">
        Totalt ≈ <span className="font-mono">15,2 ms</span>. 99 % av tida går til 3 random reads —
        derfor er covering indexes så verdifulle: de eliminerer heap-fetchen
        helt.
      </div>
    </div>
  );
}

// ===========================================================================
// Lag 8 — Bytes / JSON-respons
// ===========================================================================
function Layer8({
  active,
  onHover,
  onLeave,
}: {
  active: ConceptKey | null;
  onHover: (k: ConceptKey) => void;
  onLeave: () => void;
}) {
  // Resultatet 10 rader, kun navn-feltet
  const names = ["Eva", "Per", "Lars", "Kari", "Ola", "Siri", "Bjørn", "Ina", "Geir", "Maja"];
  const jsonStr = JSON.stringify(names.map((n) => ({ name: n })));
  const bytes = new TextEncoder().encode(jsonStr).length;
  return (
    <div className="space-y-2">
      <pre className="font-mono text-[11px] overflow-x-auto whitespace-pre rounded bg-muted/40 border border-border p-3 leading-6">
        {"["}
        {names.map((n, i) => (
          <span key={n}>
            {"{"}&quot;
            <Tok k="name" active={active} onHover={onHover} onLeave={onLeave}>name</Tok>
            &quot;: &quot;{n}&quot;{"}"}
            {i < names.length - 1 ? ", " : ""}
          </span>
        ))}
        {"]"}
      </pre>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span>
          Rader: <span className="font-mono text-foreground">10</span>
        </span>
        <span>
          Bytes på wire: <span className="font-mono text-foreground">{bytes}</span>
        </span>
        <Glow k="name" active={active}>
          <span>Kolonner: <span className="font-mono text-foreground">name</span></span>
        </Glow>
      </div>
    </div>
  );
}
