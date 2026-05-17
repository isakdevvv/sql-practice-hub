// Reusable visual diagrams for flashcards. Each export is a small,
// theme-aware SVG/JSX component representing a *recognized* way of
// visualizing the concept (CSS box model, JOIN Venn, B-tree index,
// memory hierarchy, sequence diagram, etc.) — the kind of figure a
// data engineer would expect to see in a textbook or whiteboard.

import type { FC } from "react";
import { DB_MODELL_VISUALS } from "./DbModellVisuals";

const STROKE = "currentColor";

// ============= MEMORY HIERARCHY (HDD/SSD/RAM) =============
// Classic CS pyramid: faster + more expensive at top, slower + cheaper at bottom.
export const MemoryHierarchy: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 220" className="w-full max-w-md mx-auto text-foreground">
      {/* CPU/registers tip */}
      <polygon
        points="160,10 200,10 210,40 150,40"
        fill="color-mix(in oklch, var(--brand) 15%, transparent)"
        stroke={STROKE}
        strokeWidth="1"
      />
      <text x="180" y="28" textAnchor="middle" className="text-[10px] fill-current font-mono">CPU cache</text>
      {/* RAM */}
      <polygon
        points="150,40 210,40 230,80 130,80"
        fill="color-mix(in oklch, var(--success) 15%, transparent)"
        stroke={STROKE}
        strokeWidth="1"
      />
      <text x="180" y="64" textAnchor="middle" className="text-[11px] fill-current font-semibold">RAM</text>
      {/* SSD */}
      <polygon
        points="130,80 230,80 255,130 105,130"
        fill="color-mix(in oklch, var(--brand) 8%, transparent)"
        stroke={STROKE}
        strokeWidth="1"
      />
      <text x="180" y="110" textAnchor="middle" className="text-[12px] fill-current font-semibold">SSD</text>
      {/* HDD */}
      <polygon
        points="105,130 255,130 290,200 70,200"
        fill="color-mix(in oklch, var(--muted) 50%, transparent)"
        stroke={STROKE}
        strokeWidth="1"
      />
      <text x="180" y="170" textAnchor="middle" className="text-[12px] fill-current font-semibold">HDD</text>

      {/* Annotations on the right */}
      <g className="text-[9px] fill-current opacity-80">
        <text x="300" y="28">~1 ns</text>
        <text x="300" y="62">~100 ns</text>
        <text x="300" y="110">~100 µs</text>
        <text x="300" y="170">~10 ms</text>
      </g>
      {/* Annotations on the left */}
      <g className="text-[9px] fill-current opacity-60">
        <text x="10" y="28">raskest</text>
        <text x="10" y="62">flyktig</text>
        <text x="10" y="170">tregest</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Minne-hierarkiet — raskere og dyrere oppover, tregere og billigere nedover.
    </figcaption>
  </figure>
);

// ============= JOIN VENN DIAGRAMS =============
// Universally recognized way to teach JOINs: which parts of two overlapping
// circles are returned. CROSS er IKKE inkludert — kartesisk produkt er ikke
// en mengdeoperasjon og passer ikke i Venn-modellen.
export const JoinVenn: FC<{ kind: "INNER" | "LEFT" | "RIGHT" | "FULL" }> = ({ kind }) => {
  // Each diagram highlights a different part. Use opacity to mark filled.
  const filledLeft = kind === "LEFT" || kind === "FULL";
  const filledRight = kind === "RIGHT" || kind === "FULL";
  const filledIntersect = true;
  return (
    <figure className="my-3">
      <svg viewBox="0 0 220 120" className="w-full max-w-xs mx-auto text-foreground">
        <defs>
          <clipPath id={`vlA-${kind}`}>
            <circle cx="80" cy="60" r="44" />
          </clipPath>
          <clipPath id={`vlB-${kind}`}>
            <circle cx="140" cy="60" r="44" />
          </clipPath>
        </defs>
        {/* Left-only region */}
        {filledLeft && (
          <circle cx="80" cy="60" r="44" fill="color-mix(in oklch, var(--brand) 35%, transparent)" />
        )}
        {/* Right-only region */}
        {filledRight && (
          <circle cx="140" cy="60" r="44" fill="color-mix(in oklch, var(--brand) 35%, transparent)" />
        )}
        {/* Intersection (drawn over) */}
        {filledIntersect && (
          <g clipPath={`url(#vlA-${kind})`}>
            <circle cx="140" cy="60" r="44" fill="color-mix(in oklch, var(--success) 55%, transparent)" />
          </g>
        )}
        {/* Outlines */}
        <circle cx="80" cy="60" r="44" fill="none" stroke={STROKE} strokeWidth="1.5" />
        <circle cx="140" cy="60" r="44" fill="none" stroke={STROKE} strokeWidth="1.5" />
        <text x="55" y="65" textAnchor="middle" className="text-[12px] fill-current font-semibold">A</text>
        <text x="165" y="65" textAnchor="middle" className="text-[12px] fill-current font-semibold">B</text>
        <text x="110" y="115" textAnchor="middle" className="text-[10px] fill-current opacity-70 font-mono">{kind} JOIN</text>
      </svg>
    </figure>
  );
};

export const JoinVennAll: FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
    <JoinVenn kind="INNER" />
    <JoinVenn kind="LEFT" />
    <JoinVenn kind="RIGHT" />
    <JoinVenn kind="FULL" />
  </div>
);

// ============= CSS BOX MODEL =============
// THE iconic CSS diagram — nested boxes for margin / border / padding / content.
export const CssBoxModel: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 220" className="w-full max-w-md mx-auto text-foreground">
      {/* margin */}
      <rect x="6" y="6" width="308" height="208" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} strokeDasharray="4 3" strokeWidth="1" />
      <text x="14" y="20" className="text-[10px] fill-current font-mono">margin</text>
      {/* border */}
      <rect x="34" y="34" width="252" height="152" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="42" y="48" className="text-[10px] fill-current font-mono">border</text>
      {/* padding */}
      <rect x="62" y="62" width="196" height="96" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} strokeWidth="1" strokeDasharray="2 2" />
      <text x="70" y="76" className="text-[10px] fill-current font-mono">padding</text>
      {/* content */}
      <rect x="92" y="92" width="136" height="36" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} strokeWidth="1" />
      <text x="160" y="115" textAnchor="middle" className="text-[11px] fill-current font-semibold font-mono">content</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      CSS box model — content innerst, padding rundt, border utenpå, margin ytterst.
    </figcaption>
  </figure>
);

// ============= B-TREE INDEX =============
// Recognized index visualization — root with key ranges pointing to leaves.
export const BTreeIndex: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Root node — 2 separator-nøkler (30, 60) gir 3 barn:
          <30, 30..59, ≥60. Det er den kanoniske B-tre-fanouten:
          N nøkler = N+1 barn-pekere. */}
      <rect x="140" y="10" width="100" height="32" rx="3" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <line x1="180" y1="10" x2="180" y2="42" stroke={STROKE} strokeWidth="1" />
      <line x1="210" y1="10" x2="210" y2="42" stroke={STROKE} strokeWidth="1" />
      <text x="160" y="30" textAnchor="middle" className="text-[10px] fill-current font-mono">30</text>
      <text x="195" y="30" textAnchor="middle" className="text-[10px] fill-current font-mono">60</text>

      {/* Tre kanter ned til 3 blader */}
      <line x1="160" y1="42" x2="60" y2="80" stroke={STROKE} strokeWidth="1" />
      <line x1="195" y1="42" x2="190" y2="80" stroke={STROKE} strokeWidth="1" />
      <line x1="230" y1="42" x2="320" y2="80" stroke={STROKE} strokeWidth="1" />

      {/* Leaf 1: nøkler < 30 */}
      <rect x="10" y="80" width="100" height="32" rx="3" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="60" y="100" textAnchor="middle" className="text-[10px] fill-current font-mono">5 · 18 · 27</text>
      {/* Leaf 2: 30 ≤ nøkler < 60 */}
      <rect x="140" y="80" width="100" height="32" rx="3" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="190" y="100" textAnchor="middle" className="text-[10px] fill-current font-mono">35 · 47 · 58</text>
      {/* Leaf 3: nøkler ≥ 60 */}
      <rect x="270" y="80" width="100" height="32" rx="3" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="320" y="100" textAnchor="middle" className="text-[10px] fill-current font-mono">62 · 75 · 88</text>

      {/* Leaf links (B+ tree) */}
      <path d="M110 96 L 140 96" stroke={STROKE} strokeWidth="1" markerEnd="url(#arr)" />
      <path d="M240 96 L 270 96" stroke={STROKE} strokeWidth="1" markerEnd="url(#arr)" />

      {/* Search trace: looking up 47 */}
      <text x="190" y="155" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        SELECT … WHERE id = 47
      </text>
      <text x="190" y="172" textAnchor="middle" className="text-[10px] fill-current opacity-60 font-mono">
        rot → 30..60 → blad 2 → treff
      </text>
      <text x="190" y="190" textAnchor="middle" className="text-[10px] fill-current opacity-60">
        O(log n) hopp i stedet for O(n) skann
      </text>

      <defs>
        <marker id="arr" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      B-tre / B+-tre — sorterte nøkler i interne noder peker til blader.
    </figcaption>
  </figure>
);

// ============= DATABASE PAGE / BLOCK =============
// Shows that one disk read returns many rows packed in a page.
export const DatabasePage: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      {/* Disk icon */}
      <ellipse cx="40" cy="50" rx="22" ry="6" fill="var(--muted)" stroke={STROKE} />
      <line x1="18" y1="50" x2="18" y2="100" stroke={STROKE} />
      <line x1="62" y1="50" x2="62" y2="100" stroke={STROKE} />
      <ellipse cx="40" cy="100" rx="22" ry="6" fill="var(--muted)" stroke={STROKE} />
      <text x="40" y="130" textAnchor="middle" className="text-[10px] fill-current">Disk</text>

      {/* Arrow: one I/O reads a whole page */}
      <path d="M70 75 L 130 75" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arr2)" />
      <text x="100" y="68" textAnchor="middle" className="text-[9px] fill-current opacity-70">1 I/O</text>

      {/* Page (8 KB block) with rows inside */}
      <rect x="135" y="20" width="230" height="135" rx="4" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="250" y="38" textAnchor="middle" className="text-[10px] fill-current font-semibold font-mono">page (8 KB)</text>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x="145"
          y={48 + i * 16}
          width="210"
          height="12"
          rx="1"
          fill="color-mix(in oklch, var(--success) 18%, transparent)"
          stroke={STROKE}
          strokeWidth="0.5"
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <text
          key={i}
          x="155"
          y={58 + i * 16}
          className="text-[8px] fill-current font-mono"
        >
          rad {i + 1}: …
        </text>
      ))}
      <text x="250" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        én lesing → mange rader
      </text>

      <defs>
        <marker id="arr2" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Databasen leser sider/blokker, ikke enkeltrader — derfor er sekvensiell I/O så viktig.
    </figcaption>
  </figure>
);

// ============= HTTP SEQUENCE DIAGRAM =============
// Classic UML-style sequence diagram for client/server.
export const HttpSequence: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-md mx-auto text-foreground">
      {/* Lifelines */}
      <rect x="40" y="10" width="80" height="24" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="80" y="27" textAnchor="middle" className="text-[10px] fill-current font-semibold">Klient</text>
      <line x1="80" y1="34" x2="80" y2="190" stroke={STROKE} strokeDasharray="3 3" />

      <rect x="240" y="10" width="80" height="24" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="280" y="27" textAnchor="middle" className="text-[10px] fill-current font-semibold">Server (Flask)</text>
      <line x1="280" y1="34" x2="280" y2="190" stroke={STROKE} strokeDasharray="3 3" />

      {/* Request arrow */}
      <line x1="82" y1="60" x2="278" y2="60" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrSeq)" />
      <text x="180" y="55" textAnchor="middle" className="text-[10px] fill-current font-mono">GET /kunder</text>

      {/* Server activity bar */}
      <rect x="276" y="68" width="8" height="50" fill="color-mix(in oklch, var(--success) 40%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="294" y="95" className="text-[9px] fill-current opacity-70">render_template()</text>

      {/* Response arrow */}
      <line x1="278" y1="128" x2="82" y2="128" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrSeq)" strokeDasharray="2 2" />
      <text x="180" y="123" textAnchor="middle" className="text-[10px] fill-current font-mono">200 OK + HTML</text>

      {/* Browser render */}
      <rect x="76" y="138" width="8" height="32" fill="color-mix(in oklch, var(--brand) 40%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="92" y="158" className="text-[9px] fill-current opacity-70">render</text>

      <defs>
        <marker id="arrSeq" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      HTTP-sekvensdiagram — request går ned, response opp.
    </figcaption>
  </figure>
);

// ============= SQL EVALUATION ORDER =============
// The logical query processing pipeline — clears up "why can't I use SELECT alias in WHERE".
export const SqlEvalOrder: FC = () => {
  const steps = [
    { id: "FROM", note: "bygger rader" },
    { id: "JOIN", note: "kobler tabeller" },
    { id: "WHERE", note: "filtrerer rader" },
    { id: "GROUP BY", note: "lager grupper" },
    { id: "HAVING", note: "filtrerer grupper" },
    { id: "SELECT", note: "velger kolonner" },
    { id: "DISTINCT", note: "fjerner duplikater" },
    { id: "ORDER BY", note: "sorterer" },
    { id: "LIMIT", note: "kutter" },
  ];
  return (
    <figure className="my-4">
      <div className="flex flex-col gap-1.5 max-w-sm mx-auto">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded border border-border bg-card/60 px-3 py-1.5"
          >
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-brand/15 text-brand text-[10px] font-mono font-semibold">
              {i + 1}
            </span>
            <span className="font-mono text-xs font-semibold w-20">{s.id}</span>
            <span className="text-[11px] text-muted-foreground">{s.note}</span>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Logisk evalueringsrekkefølge — selv om vi SKRIVER SELECT først.
      </figcaption>
    </figure>
  );
};

// ============= NORMALIZATION 1NF → 3NF =============
// Shows a denormalized table being split.
export const NormalizationSplit: FC = () => (
  <figure className="my-4">
    <div className="space-y-3 text-[11px]">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-destructive mb-1 font-semibold">
          Før — brudd på 3NF (transitiv avhengighet)
        </div>
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-muted/40">
              <th className="border border-border px-2 py-1 text-left font-mono">KundeNr</th>
              <th className="border border-border px-2 py-1 text-left font-mono">Navn</th>
              <th className="border border-border px-2 py-1 text-left font-mono">PostNr</th>
              <th className="border border-border px-2 py-1 text-left font-mono text-destructive">Poststed</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-border px-2 py-1">1</td><td className="border border-border px-2 py-1">Ola</td><td className="border border-border px-2 py-1">0150</td><td className="border border-border px-2 py-1 text-destructive">Oslo</td></tr>
            <tr><td className="border border-border px-2 py-1">2</td><td className="border border-border px-2 py-1">Kari</td><td className="border border-border px-2 py-1">0150</td><td className="border border-border px-2 py-1 text-destructive">Oslo</td></tr>
            <tr><td className="border border-border px-2 py-1">3</td><td className="border border-border px-2 py-1">Per</td><td className="border border-border px-2 py-1">5003</td><td className="border border-border px-2 py-1 text-destructive">Bergen</td></tr>
          </tbody>
        </table>
        <p className="text-[10px] text-muted-foreground mt-1">Poststed gjentas — endring må gjøres mange steder.</p>
      </div>

      <div className="text-center text-muted-foreground text-[10px]">↓ splitt på PostNr</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-success mb-1 font-semibold">Kunde</div>
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-2 py-1 text-left font-mono">KundeNr</th>
                <th className="border border-border px-2 py-1 text-left font-mono">Navn</th>
                <th className="border border-border px-2 py-1 text-left font-mono">PostNr</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-border px-2 py-1">1</td><td className="border border-border px-2 py-1">Ola</td><td className="border border-border px-2 py-1">0150</td></tr>
              <tr><td className="border border-border px-2 py-1">2</td><td className="border border-border px-2 py-1">Kari</td><td className="border border-border px-2 py-1">0150</td></tr>
              <tr><td className="border border-border px-2 py-1">3</td><td className="border border-border px-2 py-1">Per</td><td className="border border-border px-2 py-1">5003</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-success mb-1 font-semibold">Poststed</div>
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-2 py-1 text-left font-mono">PostNr</th>
                <th className="border border-border px-2 py-1 text-left font-mono">Poststed</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-border px-2 py-1">0150</td><td className="border border-border px-2 py-1">Oslo</td></tr>
              <tr><td className="border border-border px-2 py-1">5003</td><td className="border border-border px-2 py-1">Bergen</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        FK <span className="font-mono">Kunde.PostNr → Poststed.PostNr</span> — ett sted å oppdatere stedsnavnet.
      </p>
    </div>
  </figure>
);

// ============= CROW'S FOOT NOTATION CHEAT SHEET =============
export const CrowsFootCheat: FC = () => {
  const items: { sym: string; label: string; meaning: string }[] = [
    { sym: "─|─", label: "én og bare én", meaning: "obligatorisk, maks 1" },
    { sym: "─O─|─", label: "null eller én", meaning: "valgfri, maks 1" },
    { sym: "─|─<", label: "én eller flere", meaning: "obligatorisk, mange" },
    { sym: "─O─<", label: "null eller flere", meaning: "valgfri, mange" },
  ];
  return (
    <figure className="my-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div key={it.sym} className="rounded border border-border bg-card/60 p-2">
            <div className="font-mono text-base text-center text-brand">{it.sym}</div>
            <div className="text-[11px] font-semibold text-center mt-1">{it.label}</div>
            <div className="text-[10px] text-muted-foreground text-center">{it.meaning}</div>
          </div>
        ))}
      </div>
      <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
        Kråkefot — innerst symbol = min, ytterst = max. Les fra «én av andre siden».
      </figcaption>
    </figure>
  );
};

// ============= ACID — ATOMIC BANK TRANSFER =============
// Shows the all-or-nothing property visually.
export const AcidAtomic: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      {/* Account A */}
      <rect x="10" y="50" width="100" height="60" rx="4" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="60" y="72" textAnchor="middle" className="text-[10px] fill-current font-semibold">Konto A</text>
      <text x="60" y="92" textAnchor="middle" className="text-[12px] fill-current font-mono">1000 →  900</text>

      {/* Transaction box */}
      <rect x="130" y="20" width="120" height="120" rx="6" fill="color-mix(in oklch, var(--success) 8%, transparent)" stroke={STROKE} strokeDasharray="4 3" strokeWidth="1.5" />
      <text x="190" y="40" textAnchor="middle" className="text-[10px] fill-current font-semibold">TRANSAKSJON</text>
      <text x="190" y="80" textAnchor="middle" className="text-[10px] fill-current font-mono">UPDATE A −100</text>
      <text x="190" y="100" textAnchor="middle" className="text-[10px] fill-current font-mono">UPDATE B +100</text>
      <text x="190" y="125" textAnchor="middle" className="text-[10px] fill-current opacity-70">COMMIT eller ROLLBACK</text>

      {/* Account B */}
      <rect x="270" y="50" width="100" height="60" rx="4" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} strokeWidth="1.5" />
      <text x="320" y="72" textAnchor="middle" className="text-[10px] fill-current font-semibold">Konto B</text>
      <text x="320" y="92" textAnchor="middle" className="text-[12px] fill-current font-mono">500 → 600</text>

      {/* Arrows */}
      <path d="M110 80 L 130 80" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrAcid)" />
      <path d="M250 80 L 270 80" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrAcid)" />

      <text x="190" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Begge UPDATE-ene lykkes — eller INGEN av dem (atomicity).
      </text>
      <defs>
        <marker id="arrAcid" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Atomicity i en bankoverføring — alt eller ingenting.
    </figcaption>
  </figure>
);

// ============= HTML SEMANTIC PAGE LAYOUT =============
export const HtmlSemanticLayout: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 220" className="w-full max-w-md mx-auto text-foreground">
      {/* outer html/body */}
      <rect x="6" y="6" width="308" height="208" fill="none" stroke={STROKE} strokeDasharray="3 3" />
      <text x="14" y="20" className="text-[9px] fill-current opacity-60 font-mono">&lt;body&gt;</text>

      {/* header */}
      <rect x="20" y="28" width="280" height="32" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="160" y="49" textAnchor="middle" className="text-[11px] fill-current font-mono">&lt;header&gt;</text>

      {/* nav */}
      <rect x="20" y="66" width="280" height="20" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
      <text x="160" y="80" textAnchor="middle" className="text-[10px] fill-current font-mono">&lt;nav&gt;</text>

      {/* main + aside */}
      <rect x="20" y="92" width="200" height="80" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="120" y="135" textAnchor="middle" className="text-[11px] fill-current font-mono">&lt;main&gt;</text>
      <text x="120" y="150" textAnchor="middle" className="text-[9px] fill-current opacity-70 font-mono">&lt;article&gt;</text>

      <rect x="226" y="92" width="74" height="80" fill="color-mix(in oklch, var(--muted) 50%, transparent)" stroke={STROKE} />
      <text x="263" y="135" textAnchor="middle" className="text-[10px] fill-current font-mono">&lt;aside&gt;</text>

      {/* footer */}
      <rect x="20" y="178" width="280" height="28" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="160" y="196" textAnchor="middle" className="text-[11px] fill-current font-mono">&lt;footer&gt;</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Semantisk HTML5 — beskriv rolle, ikke utseende.
    </figcaption>
  </figure>
);

// ============= SQL INJECTION — CONCAT VS PARAMETER =============
export const SqlInjectionCompare: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3">
      <div className="rounded border-2 border-destructive/40 bg-destructive/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">
          ✗ Sårbart — strengkonkatenering
        </div>
        <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed">{`navn = "Ola' OR '1'='1"
sql = "SELECT * FROM users " +
      "WHERE name = '" + navn + "'"

→ SELECT * FROM users
  WHERE name = 'Ola' OR '1'='1'
  ─── alle rader returneres ───`}</pre>
      </div>
      <div className="rounded border-2 border-success/40 bg-success/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1">
          ✓ Trygt — prepared statement
        </div>
        <pre className="text-[10px] font-mono whitespace-pre-wrap leading-relaxed">{`navn = "Ola' OR '1'='1"
cursor.execute(
  "SELECT * FROM users WHERE name = %s",
  (navn,)
)

→ databasen ser
  navn som DATA, ikke SQL-kode`}</pre>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Prepared statements skiller SQL-kode fra brukerdata — derfor stopper de injection.
    </figcaption>
  </figure>
);

// ============= SESSION / COOKIE FLOW =============
export const SessionFlow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 220" className="w-full max-w-md mx-auto text-foreground">
      {/* Browser */}
      <rect x="10" y="20" width="80" height="40" rx="3" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="44" textAnchor="middle" className="text-[10px] fill-current font-semibold">Nettleser</text>
      <line x1="50" y1="60" x2="50" y2="200" stroke={STROKE} strokeDasharray="3 3" />

      {/* Server */}
      <rect x="290" y="20" width="80" height="40" rx="3" fill="color-mix(in oklch, var(--success) 20%, transparent)" stroke={STROKE} />
      <text x="330" y="44" textAnchor="middle" className="text-[10px] fill-current font-semibold">Server</text>
      <line x1="330" y1="60" x2="330" y2="200" stroke={STROKE} strokeDasharray="3 3" />

      {/* Step 1: login */}
      <line x1="52" y1="80" x2="328" y2="80" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrSF)" />
      <text x="190" y="75" textAnchor="middle" className="text-[10px] fill-current font-mono">POST /login (passord)</text>

      {/* Step 2: Set-Cookie */}
      <line x1="328" y1="110" x2="52" y2="110" stroke={STROKE} strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrSF)" />
      <text x="190" y="105" textAnchor="middle" className="text-[10px] fill-current font-mono">Set-Cookie: sid=abc123</text>

      {/* Step 3: subsequent request */}
      <line x1="52" y1="150" x2="328" y2="150" stroke={STROKE} strokeWidth="1.5" markerEnd="url(#arrSF)" />
      <text x="190" y="145" textAnchor="middle" className="text-[10px] fill-current font-mono">GET /dashboard · Cookie: sid=abc123</text>

      {/* Server lookup */}
      <rect x="305" y="158" width="60" height="34" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.5" />
      <text x="335" y="172" textAnchor="middle" className="text-[9px] fill-current font-mono">sessions[</text>
      <text x="335" y="184" textAnchor="middle" className="text-[9px] fill-current font-mono">abc123]</text>

      <text x="190" y="210" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Cookie holder bare ID — selve dataene ligger på serveren.
      </text>

      <defs>
        <marker id="arrSF" viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={STROKE} />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Session-cookie inneholder en ID som server slår opp på hver request.
    </figcaption>
  </figure>
);

// ============= INDEX vs FULL SCAN =============
export const IndexVsScan: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      <text x="95" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Uten indeks</text>
      <text x="285" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Med indeks</text>

      {/* Sequential scan: many rows checked */}
      <g>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = 30 + (i % 10) * 13;
          const y = 30 + Math.floor(i / 10) * 16;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="10"
              height="12"
              fill={i === 14 ? "color-mix(in oklch, var(--success) 50%, transparent)" : "color-mix(in oklch, var(--destructive) 25%, transparent)"}
              stroke={STROKE}
              strokeWidth="0.5"
            />
          );
        })}
        <text x="95" y="80" textAnchor="middle" className="text-[9px] fill-current opacity-70">
          alle 20 rader sjekkes
        </text>
        <text x="95" y="95" textAnchor="middle" className="text-[10px] fill-current font-mono">
          O(n)
        </text>
      </g>

      {/* B-tree shortcut */}
      <g>
        <rect x="265" y="30" width="40" height="12" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="285" y="40" textAnchor="middle" className="text-[8px] fill-current font-mono">rot</text>
        <line x1="285" y1="42" x2="270" y2="55" stroke={STROKE} strokeWidth="0.5" />
        <line x1="285" y1="42" x2="300" y2="55" stroke={STROKE} strokeWidth="0.5" />
        <rect x="255" y="55" width="30" height="10" fill="var(--muted)" stroke={STROKE} strokeWidth="0.5" />
        <rect x="290" y="55" width="30" height="10" fill="color-mix(in oklch, var(--success) 50%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="285" y="80" textAnchor="middle" className="text-[9px] fill-current opacity-70">
          få hopp til treffet
        </text>
        <text x="285" y="95" textAnchor="middle" className="text-[10px] fill-current font-mono">
          O(log n)
        </text>
      </g>

      <text x="190" y="130" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        Indeks bytter skann mot målrettet oppslag — derfor er WHERE/JOIN/ORDER raskere.
      </text>
      <text x="190" y="155" textAnchor="middle" className="text-[10px] fill-current opacity-60">
        Pris: ekstra plass + tregere INSERT/UPDATE/DELETE (indeksen må vedlikeholdes).
      </text>
    </svg>
  </figure>
);

// ============= 1:1 / 1:M / M:N RELATIONSHIPS =============
export const RelationshipKinds: FC = () => (
  <figure className="my-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
      <div className="rounded border border-border p-3">
        <div className="text-center font-semibold mb-2">1 : 1</div>
        <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
          <span className="rounded bg-brand/15 px-2 py-0.5">Person</span>
          <span>—|</span>
          <span>|—</span>
          <span className="rounded bg-brand/15 px-2 py-0.5">Pass</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 text-center">
          én person ↔ ett pass
        </div>
      </div>
      <div className="rounded border border-border p-3">
        <div className="text-center font-semibold mb-2">1 : M</div>
        <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
          <span className="rounded bg-brand/15 px-2 py-0.5">Kunde</span>
          <span>—|</span>
          <span>—&lt;</span>
          <span className="rounded bg-brand/15 px-2 py-0.5">Utleie</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 text-center">
          én kunde ↔ mange utleier (vanligst)
        </div>
      </div>
      <div className="rounded border border-border p-3">
        <div className="text-center font-semibold mb-2">M : N (med koblingstabell)</div>
        <div className="flex items-center justify-center gap-1 font-mono text-[10px] flex-wrap">
          <span className="rounded bg-brand/15 px-2 py-0.5">Student</span>
          <span>—|</span>
          <span>—&lt;</span>
          <span className="rounded bg-success/20 px-1 py-0.5">SK</span>
          <span>&gt;—</span>
          <span>|—</span>
          <span className="rounded bg-brand/15 px-2 py-0.5">Kurs</span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-2 text-center">
          M:N brytes opp i to 1:M mot junction-tabellen — hver SK-rad har
          nøyaktig én Student og én Kurs.
        </div>
      </div>
    </div>
  </figure>
);

// ============= REGISTRY =============
export const VISUALS: Record<string, FC> = {
  "memory-hierarchy": MemoryHierarchy,
  "join-venn-all": JoinVennAll,
  "join-venn-inner": () => <JoinVenn kind="INNER" />,
  "join-venn-left": () => <JoinVenn kind="LEFT" />,
  "join-venn-full": () => <JoinVenn kind="FULL" />,
  "css-box-model": CssBoxModel,
  "btree-index": BTreeIndex,
  "db-page": DatabasePage,
  "http-sequence": HttpSequence,
  "sql-eval-order": SqlEvalOrder,
  "normalization-split": NormalizationSplit,
  "crows-foot-cheat": CrowsFootCheat,
  "acid-atomic": AcidAtomic,
  "html-semantic": HtmlSemanticLayout,
  "sql-injection-compare": SqlInjectionCompare,
  "session-flow": SessionFlow,
  "index-vs-scan": IndexVsScan,
  "relationship-kinds": RelationshipKinds,
  ...DB_MODELL_VISUALS,
};

export type VisualKey = keyof typeof VISUALS;
