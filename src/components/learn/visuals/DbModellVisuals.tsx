// Visuelle komponenter for database-modell-flashcards (begrep + design).
// Følger samme mønster som Visuals.tsx: tema-aware SVG i <figure>,
// currentColor-stroke, text-foreground, tailwind. Registry eksporteres
// nederst som DB_MODELL_VISUALS og spres inn i VISUALS i Visuals.tsx.

import type { FC } from "react";

const STROKE = "currentColor";

// =============================================================
// Felles små byggesteiner
// =============================================================

const arrowMarker = (id: string) => (
  <marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M 0 0 L 8 4 L 0 8 z" fill={STROKE} />
  </marker>
);

// =============================================================
// GRUNNBEGREP
// =============================================================

// Database som "skap" med tabeller inni — for c-db.
export const DatabaseIcon: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 180" className="w-full max-w-sm mx-auto text-foreground">
      {/* Sylinder (klassisk DB-ikon) */}
      <ellipse cx="60" cy="40" rx="40" ry="14" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} />
      <path d="M 20 40 L 20 140 A 40 14 0 0 0 100 140 L 100 40" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <path d="M 20 70 A 40 14 0 0 0 100 70" fill="none" stroke={STROKE} strokeOpacity="0.5" />
      <path d="M 20 100 A 40 14 0 0 0 100 100" fill="none" stroke={STROKE} strokeOpacity="0.5" />
      <text x="60" y="170" textAnchor="middle" className="text-[10px] fill-current font-semibold">Database</text>

      {/* Pil */}
      <line x1="105" y1="90" x2="150" y2="90" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#dbArr1)" />

      {/* Tabeller inni */}
      <g>
        <rect x="160" y="30" width="140" height="38" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
        <line x1="160" y1="44" x2="300" y2="44" stroke={STROKE} strokeOpacity="0.6" />
        <text x="230" y="40" textAnchor="middle" className="text-[9px] fill-current font-mono">KUNDE</text>
        <text x="230" y="60" textAnchor="middle" className="text-[8px] fill-current opacity-70">id · navn · epost</text>

        <rect x="160" y="76" width="140" height="38" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
        <line x1="160" y1="90" x2="300" y2="90" stroke={STROKE} strokeOpacity="0.6" />
        <text x="230" y="86" textAnchor="middle" className="text-[9px] fill-current font-mono">ORDRE</text>
        <text x="230" y="106" textAnchor="middle" className="text-[8px] fill-current opacity-70">id · kundeId · dato</text>

        <rect x="160" y="122" width="140" height="38" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
        <line x1="160" y1="136" x2="300" y2="136" stroke={STROKE} strokeOpacity="0.6" />
        <text x="230" y="132" textAnchor="middle" className="text-[9px] fill-current font-mono">PRODUKT</text>
        <text x="230" y="152" textAnchor="middle" className="text-[8px] fill-current opacity-70">id · navn · pris</text>
      </g>
      <defs>{arrowMarker("dbArr1")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      En database er en samling av tabeller med tydelig struktur.
    </figcaption>
  </figure>
);

// Tabell med markerte rad/kolonne — for c-tabell, c-rad, c-kolonne.
export const TableAnatomy: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 170" className="w-full max-w-md mx-auto text-foreground">
      {/* Kolonne-highlight (vertikal stripe) */}
      <rect x="100" y="30" width="80" height="120" fill="color-mix(in oklch, var(--brand) 12%, transparent)" />
      {/* Rad-highlight (horisontal stripe) */}
      <rect x="20" y="78" width="320" height="22" fill="color-mix(in oklch, var(--success) 15%, transparent)" />

      {/* Rutenett */}
      <g stroke={STROKE} strokeWidth="0.6">
        <rect x="20" y="30" width="320" height="120" fill="none" />
        <line x1="20" y1="56" x2="340" y2="56" />
        <line x1="20" y1="78" x2="340" y2="78" />
        <line x1="20" y1="100" x2="340" y2="100" />
        <line x1="20" y1="122" x2="340" y2="122" />
        <line x1="100" y1="30" x2="100" y2="150" />
        <line x1="180" y1="30" x2="180" y2="150" />
        <line x1="260" y1="30" x2="260" y2="150" />
      </g>

      {/* Header */}
      <g className="text-[10px] fill-current font-mono font-semibold">
        <text x="60" y="48" textAnchor="middle">id</text>
        <text x="140" y="48" textAnchor="middle">navn</text>
        <text x="220" y="48" textAnchor="middle">epost</text>
        <text x="300" y="48" textAnchor="middle">by</text>
      </g>

      {/* Verdier */}
      <g className="text-[10px] fill-current font-mono">
        <text x="60" y="71" textAnchor="middle">1</text>
        <text x="140" y="71" textAnchor="middle">Ola</text>
        <text x="220" y="71" textAnchor="middle">ola@…</text>
        <text x="300" y="71" textAnchor="middle">Tromsø</text>

        <text x="60" y="93" textAnchor="middle">2</text>
        <text x="140" y="93" textAnchor="middle">Kari</text>
        <text x="220" y="93" textAnchor="middle">kari@…</text>
        <text x="300" y="93" textAnchor="middle">Oslo</text>

        <text x="60" y="115" textAnchor="middle">3</text>
        <text x="140" y="115" textAnchor="middle">Liv</text>
        <text x="220" y="115" textAnchor="middle">liv@…</text>
        <text x="300" y="115" textAnchor="middle">Bergen</text>

        <text x="60" y="137" textAnchor="middle">4</text>
        <text x="140" y="137" textAnchor="middle">Per</text>
        <text x="220" y="137" textAnchor="middle">per@…</text>
        <text x="300" y="137" textAnchor="middle">Bodø</text>
      </g>

      {/* Etiketter */}
      <text x="140" y="23" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--brand)" }}>
        kolonne (attributt)
      </text>
      <text x="355" y="92" textAnchor="end" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>
        rad (tuppel)
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Tabell = rader (én registrering hver) × kolonner (én egenskap hver).
    </figcaption>
  </figure>
);

// =============================================================
// NØKLER
// =============================================================

// PK/FK med pil mellom to tabeller — for c-pk, c-fk, c-pk-vs-fk.
export const PkFkArrow: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto text-foreground">
      {/* KUNDE */}
      <g>
        <rect x="20" y="30" width="150" height="120" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
        <rect x="20" y="30" width="150" height="22" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} />
        <text x="95" y="46" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">KUNDE</text>
        {/* PK-rad */}
        <rect x="20" y="52" width="150" height="22" fill="color-mix(in oklch, var(--success) 28%, transparent)" />
        <text x="30" y="68" className="text-[10px] fill-current font-mono font-bold">PK  kundeNr</text>
        <text x="30" y="90" className="text-[10px] fill-current font-mono">    navn</text>
        <text x="30" y="110" className="text-[10px] fill-current font-mono">    epost</text>
        <text x="30" y="130" className="text-[10px] fill-current font-mono">    by</text>
      </g>

      {/* ORDRE */}
      <g>
        <rect x="250" y="30" width="150" height="120" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
        <rect x="250" y="30" width="150" height="22" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} />
        <text x="325" y="46" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">ORDRE</text>
        <text x="260" y="68" className="text-[10px] fill-current font-mono font-bold">PK  ordreNr</text>
        {/* FK-rad highlighted */}
        <rect x="250" y="74" width="150" height="22" fill="color-mix(in oklch, var(--brand) 28%, transparent)" />
        <text x="260" y="90" className="text-[10px] fill-current font-mono font-bold">FK  kundeNr</text>
        <text x="260" y="110" className="text-[10px] fill-current font-mono">    dato</text>
        <text x="260" y="130" className="text-[10px] fill-current font-mono">    sum</text>
      </g>

      {/* FK → PK pil */}
      <path d="M 250 85 C 215 85 205 63 175 63" fill="none" stroke={STROKE} strokeWidth="1.3" markerEnd="url(#pkfkArr)" />
      <text x="212" y="78" textAnchor="middle" className="text-[9px] fill-current opacity-70">peker til</text>

      <defs>{arrowMarker("pkfkArr")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      <span className="font-semibold" style={{ color: "var(--success)" }}>PK</span> identifiserer raden i egen tabell;{" "}
      <span className="font-semibold" style={{ color: "var(--brand)" }}>FK</span> peker til en PK i en annen tabell.
    </figcaption>
  </figure>
);

// Komposittnøkkel: tabell med to highlighta PK-kolonner — supports c-rm-superkey-ish.
export const CompositeKey: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 340 170" className="w-full max-w-sm mx-auto text-foreground">
      <rect x="20" y="20" width="300" height="130" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} />
      <rect x="20" y="20" width="300" height="22" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} />
      <text x="170" y="36" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">ORDRELINJE</text>

      {/* highlight PK kolonner */}
      <rect x="20" y="42" width="100" height="108" fill="color-mix(in oklch, var(--success) 22%, transparent)" />
      <rect x="120" y="42" width="100" height="108" fill="color-mix(in oklch, var(--success) 22%, transparent)" />

      {/* header */}
      <g className="text-[10px] fill-current font-mono font-bold">
        <text x="70" y="58" textAnchor="middle">PK ordreNr</text>
        <text x="170" y="58" textAnchor="middle">PK prodNr</text>
        <text x="270" y="58" textAnchor="middle">antall</text>
      </g>
      {/* divider */}
      <line x1="20" y1="64" x2="320" y2="64" stroke={STROKE} strokeOpacity="0.6" />

      {/* rows */}
      <g className="text-[10px] fill-current font-mono">
        <text x="70" y="82" textAnchor="middle">100</text>
        <text x="170" y="82" textAnchor="middle">P-1</text>
        <text x="270" y="82" textAnchor="middle">3</text>

        <text x="70" y="100" textAnchor="middle">100</text>
        <text x="170" y="100" textAnchor="middle">P-2</text>
        <text x="270" y="100" textAnchor="middle">1</text>

        <text x="70" y="118" textAnchor="middle">101</text>
        <text x="170" y="118" textAnchor="middle">P-1</text>
        <text x="270" y="118" textAnchor="middle">2</text>

        <text x="70" y="136" textAnchor="middle">101</text>
        <text x="170" y="136" textAnchor="middle">P-7</text>
        <text x="270" y="136" textAnchor="middle">5</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Komposittnøkkel: PK består av flere kolonner sammen — hver enkelt er ikke unik.
    </figcaption>
  </figure>
);

// Supernøkkel / kandidat / PK som "nøstede" mengder.
export const SuperCandidatePk: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 210" className="w-full max-w-sm mx-auto text-foreground">
      {/* Supernøkler — ytterst */}
      <ellipse cx="180" cy="105" rx="160" ry="90" fill="color-mix(in oklch, var(--muted) 40%, transparent)" stroke={STROKE} strokeOpacity="0.7" />
      <text x="180" y="32" textAnchor="middle" className="text-[10px] fill-current opacity-70">supernøkler (entydige, kan ha overflødige felt)</text>

      {/* Kandidatnøkler */}
      <ellipse cx="180" cy="115" rx="115" ry="60" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
      <text x="180" y="72" textAnchor="middle" className="text-[10px] fill-current font-semibold">kandidatnøkler (minimale)</text>

      {/* PK */}
      <ellipse cx="180" cy="125" rx="55" ry="26" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} />
      <text x="180" y="129" textAnchor="middle" className="text-[11px] fill-current font-semibold">PK (valgt)</text>

      <text x="180" y="200" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        PK ⊂ kandidat ⊂ super
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Hver primærnøkkel er en kandidatnøkkel, og hver kandidat er en supernøkkel.
    </figcaption>
  </figure>
);

// =============================================================
// RELASJONER
// =============================================================

// M:N → koblingstabell — for c-mn.
export const MnJunction: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 480 180" className="w-full max-w-lg mx-auto text-foreground">
      {/* Student */}
      <rect x="20" y="60" width="100" height="60" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <rect x="20" y="60" width="100" height="20" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="70" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">STUDENT</text>
      <text x="70" y="94" textAnchor="middle" className="text-[9px] fill-current font-mono">PK sid</text>
      <text x="70" y="110" textAnchor="middle" className="text-[9px] fill-current font-mono">navn</text>

      {/* Junction */}
      <rect x="190" y="50" width="100" height="80" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <rect x="190" y="50" width="100" height="20" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} />
      <text x="240" y="64" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">TAR</text>
      <text x="240" y="84" textAnchor="middle" className="text-[9px] fill-current font-mono font-bold">PK,FK sid</text>
      <text x="240" y="100" textAnchor="middle" className="text-[9px] fill-current font-mono font-bold">PK,FK fkode</text>
      <text x="240" y="116" textAnchor="middle" className="text-[9px] fill-current font-mono">semester</text>

      {/* Fag */}
      <rect x="360" y="60" width="100" height="60" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <rect x="360" y="60" width="100" height="20" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="410" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">FAG</text>
      <text x="410" y="94" textAnchor="middle" className="text-[9px] fill-current font-mono">PK fkode</text>
      <text x="410" y="110" textAnchor="middle" className="text-[9px] fill-current font-mono">navn</text>

      {/* Linjer + crow's foot markører */}
      <line x1="120" y1="90" x2="190" y2="90" stroke={STROKE} strokeWidth="1.2" />
      <line x1="290" y1="90" x2="360" y2="90" stroke={STROKE} strokeWidth="1.2" />

      {/* Crow on junction side */}
      <g stroke={STROKE} strokeWidth="1" fill="none">
        <path d="M 185 90 L 180 84 M 185 90 L 180 90 M 185 90 L 180 96" />
        <path d="M 295 90 L 300 84 M 295 90 L 300 90 M 295 90 L 300 96" />
      </g>
      {/* One on entity side */}
      <line x1="125" y1="84" x2="125" y2="96" stroke={STROKE} strokeWidth="1" />
      <line x1="355" y1="84" x2="355" y2="96" stroke={STROKE} strokeWidth="1" />

      <text x="155" y="80" textAnchor="middle" className="text-[9px] fill-current opacity-70">1 : M</text>
      <text x="325" y="80" textAnchor="middle" className="text-[9px] fill-current opacity-70">M : 1</text>

      <text x="240" y="155" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        M:N mellom STUDENT og FAG → to 1:M mot junction-tabellen TAR.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Koblingstabellen holder begge FK-er pluss eventuelle relasjons-attributter (f.eks. semester).
    </figcaption>
  </figure>
);

// FK på mange-siden — for c-er-fk-side.
export const FkOnManySide: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 170" className="w-full max-w-lg mx-auto text-foreground">
      {/* Kunde (1) */}
      <rect x="20" y="40" width="130" height="90" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <rect x="20" y="40" width="130" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="85" y="56" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">KUNDE</text>
      <text x="30" y="80" className="text-[10px] fill-current font-mono font-bold">PK kundeNr</text>
      <text x="30" y="100" className="text-[10px] fill-current font-mono">   navn</text>

      {/* Bestilling (M) */}
      <rect x="270" y="20" width="130" height="130" fill="color-mix(in oklch, var(--success) 15%, transparent)" stroke={STROKE} />
      <rect x="270" y="20" width="130" height="22" fill="color-mix(in oklch, var(--success) 30%, transparent)" stroke={STROKE} />
      <text x="335" y="36" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">BESTILLING</text>
      <text x="280" y="60" className="text-[10px] fill-current font-mono font-bold">PK ordreNr</text>
      <rect x="270" y="66" width="130" height="22" fill="color-mix(in oklch, var(--brand) 28%, transparent)" />
      <text x="280" y="82" className="text-[10px] fill-current font-mono font-bold">FK kundeNr</text>
      <text x="280" y="105" className="text-[10px] fill-current font-mono">   dato</text>
      <text x="280" y="125" className="text-[10px] fill-current font-mono">   sum</text>

      {/* Relasjon */}
      <line x1="150" y1="80" x2="270" y2="80" stroke={STROKE} strokeWidth="1.3" />
      {/* one bar */}
      <line x1="160" y1="73" x2="160" y2="87" stroke={STROKE} />
      {/* crow's foot */}
      <g stroke={STROKE} fill="none">
        <line x1="260" y1="80" x2="252" y2="72" />
        <line x1="260" y1="80" x2="252" y2="88" />
        <line x1="260" y1="80" x2="248" y2="80" />
      </g>
      <text x="210" y="70" textAnchor="middle" className="text-[10px] fill-current opacity-70">1 : M</text>

      <text x="210" y="155" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        FK-en bor alltid på mange-siden.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Én KUNDE kan ha mange BESTILLINGer — derfor er kundeNr en kolonne i BESTILLING.
    </figcaption>
  </figure>
);

// Rekursiv relasjon — for c-er-rekursiv.
export const RecursiveRelation: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 200" className="w-full max-w-sm mx-auto text-foreground">
      <rect x="100" y="40" width="160" height="100" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <rect x="100" y="40" width="160" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="180" y="56" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">ANSATT</text>
      <text x="110" y="80" className="text-[10px] fill-current font-mono font-bold">PK ansattNr</text>
      <text x="110" y="100" className="text-[10px] fill-current font-mono">   navn</text>
      <rect x="100" y="106" width="160" height="22" fill="color-mix(in oklch, var(--brand) 28%, transparent)" />
      <text x="110" y="122" className="text-[10px] fill-current font-mono font-bold">FK lederNr</text>

      {/* Loop */}
      <path d="M 260 80 C 320 60 320 140 260 117" fill="none" stroke={STROKE} strokeWidth="1.4" markerEnd="url(#recArr)" />
      <text x="320" y="100" textAnchor="middle" className="text-[10px] fill-current opacity-70">leder</text>

      <text x="180" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        FK lederNr → ansattNr i samme tabell
      </text>
      <text x="180" y="188" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        En ansatt har én leder (også en ansatt).
      </text>

      <defs>{arrowMarker("recArr")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Rekursiv relasjon — entiteten refererer til seg selv via FK.
    </figcaption>
  </figure>
);

// Relasjons-attributt i M:N junction — for c-er-mn-junction.
export const MnRelationAttribute: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 440 180" className="w-full max-w-lg mx-auto text-foreground">
      {/* Student */}
      <rect x="20" y="60" width="90" height="60" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="65" y="78" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">STUDENT</text>
      <text x="65" y="98" textAnchor="middle" className="text-[9px] fill-current font-mono">sid</text>
      <text x="65" y="112" textAnchor="middle" className="text-[9px] fill-current font-mono">navn</text>

      {/* Junction TAR */}
      <rect x="170" y="40" width="110" height="100" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} strokeWidth="1.3" />
      <text x="225" y="58" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">TAR</text>
      <text x="225" y="78" textAnchor="middle" className="text-[9px] fill-current font-mono">FK sid</text>
      <text x="225" y="92" textAnchor="middle" className="text-[9px] fill-current font-mono">FK fkode</text>
      <rect x="170" y="98" width="110" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" />
      <text x="225" y="113" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">semester</text>
      <text x="225" y="132" textAnchor="middle" className="text-[8px] fill-current opacity-70">(relasjons-attributt)</text>

      {/* Fag */}
      <rect x="340" y="60" width="90" height="60" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
      <text x="385" y="78" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">FAG</text>
      <text x="385" y="98" textAnchor="middle" className="text-[9px] fill-current font-mono">fkode</text>
      <text x="385" y="112" textAnchor="middle" className="text-[9px] fill-current font-mono">navn</text>

      <line x1="110" y1="90" x2="170" y2="90" stroke={STROKE} strokeWidth="1.2" />
      <line x1="280" y1="90" x2="340" y2="90" stroke={STROKE} strokeWidth="1.2" />

      <text x="225" y="165" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        «semester» hører til relasjonen, ikke til Student eller Fag.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Attributter på en M:N-relasjon havner i koblingstabellen.
    </figcaption>
  </figure>
);

// =============================================================
// INTEGRITET
// =============================================================

// Referanseintegritet — FK må peke til eksisterende rad. For c-ref-int, c-rm-referanseintegritet.
export const RefIntegrity: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 220" className="w-full max-w-lg mx-auto text-foreground">
      {/* Kunde */}
      <rect x="20" y="20" width="140" height="100" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <rect x="20" y="20" width="140" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="90" y="36" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">KUNDE</text>
      <g className="text-[10px] fill-current font-mono">
        <text x="30" y="58">1 · Ola</text>
        <text x="30" y="76">2 · Kari</text>
        <text x="30" y="94">3 · Liv</text>
        <text x="30" y="112" className="opacity-60">(ingen 99)</text>
      </g>

      {/* Utleie */}
      <rect x="240" y="20" width="160" height="180" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
      <rect x="240" y="20" width="160" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="320" y="36" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">UTLEIE (FK kundeNr)</text>

      {/* OK rader */}
      <rect x="240" y="46" width="160" height="20" fill="color-mix(in oklch, var(--success) 20%, transparent)" />
      <text x="250" y="60" className="text-[10px] fill-current font-mono">u1 → kunde 1 ✓</text>
      <rect x="240" y="68" width="160" height="20" fill="color-mix(in oklch, var(--success) 20%, transparent)" />
      <text x="250" y="82" className="text-[10px] fill-current font-mono">u2 → kunde 3 ✓</text>

      {/* Brudd */}
      <rect x="240" y="100" width="160" height="40" fill="color-mix(in oklch, var(--destructive) 25%, transparent)" stroke="var(--destructive)" />
      <text x="250" y="116" className="text-[10px] fill-current font-mono">u3 → kunde 99 ✗</text>
      <text x="250" y="132" className="text-[10px] font-mono" style={{ fill: "var(--destructive)" }}>FK refererer ingenting!</text>

      {/* Pil for OK */}
      <line x1="240" y1="56" x2="165" y2="58" stroke={STROKE} strokeWidth="1" markerEnd="url(#refOk)" />
      <line x1="240" y1="78" x2="165" y2="94" stroke={STROKE} strokeWidth="1" markerEnd="url(#refOk)" />
      {/* Pil for brudd */}
      <line x1="240" y1="116" x2="170" y2="116" stroke="var(--destructive)" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#refBad)" />

      <text x="210" y="190" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        Referanseintegritet hindrer FK fra å peke til noe som ikke finnes.
      </text>
      <defs>
        {arrowMarker("refOk")}
        <marker id="refBad" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--destructive)" />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      DBMS-en avviser FK-verdier som ikke har match i den refererte tabellen.
    </figcaption>
  </figure>
);

// Entitetsintegritet — PK ikke NULL. For c-rm-entitetsintegritet.
export const EntityIntegrity: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 320 170" className="w-full max-w-sm mx-auto text-foreground">
      <rect x="20" y="20" width="280" height="130" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
      <rect x="20" y="20" width="280" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="160" y="36" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">KUNDE</text>

      <g className="text-[10px] fill-current font-mono">
        <rect x="20" y="42" width="100" height="108" fill="color-mix(in oklch, var(--success) 18%, transparent)" />
        <text x="30" y="58" className="font-bold">PK kundeNr</text>
        <text x="140" y="58" className="font-bold">navn</text>

        <text x="30" y="80">1</text>
        <text x="140" y="80">Ola</text>

        <text x="30" y="98">2</text>
        <text x="140" y="98">Kari</text>

        <rect x="20" y="106" width="280" height="22" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" />
        <text x="30" y="122" style={{ fill: "var(--destructive)" }}>NULL</text>
        <text x="140" y="122">Per</text>
        <text x="220" y="122" className="text-[9px]" style={{ fill: "var(--destructive)" }}>✗ avvist</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Entitetsintegritet: ingen del av PK kan være NULL.
    </figcaption>
  </figure>
);

// Domene som filter — for c-rm-domene, c-rm-domeneintegritet.
export const DomainFilter: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto text-foreground">
      {/* Inn */}
      <g>
        <text x="50" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Inn-verdier</text>
        <rect x="10" y="30" width="80" height="20" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="50" y="44" textAnchor="middle" className="text-[9px] fill-current font-mono">42</text>
        <rect x="10" y="55" width="80" height="20" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="50" y="69" textAnchor="middle" className="text-[9px] fill-current font-mono">-7</text>
        <rect x="10" y="80" width="80" height="20" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="50" y="94" textAnchor="middle" className="text-[9px] fill-current font-mono">"abc"</text>
        <rect x="10" y="105" width="80" height="20" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="50" y="119" textAnchor="middle" className="text-[9px] fill-current font-mono">200</text>
        <rect x="10" y="130" width="80" height="20" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="50" y="144" textAnchor="middle" className="text-[9px] fill-current font-mono">NULL</text>
      </g>

      {/* Filter */}
      <g>
        <rect x="130" y="20" width="170" height="140" fill="color-mix(in oklch, var(--brand) 14%, transparent)" stroke={STROKE} />
        <text x="215" y="40" textAnchor="middle" className="text-[10px] fill-current font-semibold">DOMENE: alder</text>
        <text x="215" y="60" textAnchor="middle" className="text-[10px] fill-current font-mono">TYPE: INTEGER</text>
        <text x="215" y="80" textAnchor="middle" className="text-[10px] fill-current font-mono">NOT NULL</text>
        <text x="215" y="100" textAnchor="middle" className="text-[10px] fill-current font-mono">CHECK 0 ≤ x ≤ 150</text>
      </g>

      {/* Out */}
      <g>
        <text x="370" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Godkjent</text>
        <rect x="330" y="30" width="80" height="20" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="370" y="44" textAnchor="middle" className="text-[9px] fill-current font-mono">42 ✓</text>
        <rect x="330" y="55" width="80" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="370" y="69" textAnchor="middle" className="text-[9px] fill-current font-mono">-7 ✗</text>
        <rect x="330" y="80" width="80" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="370" y="94" textAnchor="middle" className="text-[9px] fill-current font-mono">"abc" ✗</text>
        <rect x="330" y="105" width="80" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="370" y="119" textAnchor="middle" className="text-[9px] fill-current font-mono">200 ✗</text>
        <rect x="330" y="130" width="80" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" stroke={STROKE} strokeWidth="0.5" />
        <text x="370" y="144" textAnchor="middle" className="text-[9px] fill-current font-mono">NULL ✗</text>
      </g>

      {/* Piler */}
      <line x1="92" y1="90" x2="128" y2="90" stroke={STROKE} strokeWidth="1" markerEnd="url(#domArr)" />
      <line x1="302" y1="90" x2="328" y2="90" stroke={STROKE} strokeWidth="1" markerEnd="url(#domArr)" />
      <defs>{arrowMarker("domArr")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Domeneintegritet = typeregel + skranker virker som et filter på hver verdi.
    </figcaption>
  </figure>
);

// Redundans-illustrasjon — for c-redundans.
export const RedundancyTable: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
      <rect x="20" y="20" width="320" height="140" fill="color-mix(in oklch, var(--brand) 8%, transparent)" stroke={STROKE} />
      <rect x="20" y="20" width="320" height="22" fill="color-mix(in oklch, var(--brand) 30%, transparent)" stroke={STROKE} />
      <text x="180" y="36" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">UTLEIE_DENORMALISERT</text>

      {/* Header */}
      <g className="text-[10px] fill-current font-mono font-bold">
        <text x="40" y="58">id</text>
        <text x="100" y="58">kundeNavn</text>
        <text x="220" y="58">epost</text>
        <text x="310" y="58">dato</text>
      </g>
      <line x1="20" y1="64" x2="340" y2="64" stroke={STROKE} strokeOpacity="0.4" />

      {/* Same Ola repeated */}
      <rect x="20" y="66" width="320" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" />
      <g className="text-[10px] fill-current font-mono">
        <text x="40" y="80">u1</text>
        <text x="100" y="80">Ola Olsen</text>
        <text x="220" y="80">ola@x.no</text>
        <text x="310" y="80">02-01</text>
      </g>
      <rect x="20" y="86" width="320" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" />
      <g className="text-[10px] fill-current font-mono">
        <text x="40" y="100">u2</text>
        <text x="100" y="100">Ola Olsen</text>
        <text x="220" y="100">ola@x.no</text>
        <text x="310" y="100">05-03</text>
      </g>
      <rect x="20" y="106" width="320" height="20" fill="color-mix(in oklch, var(--destructive) 18%, transparent)" />
      <g className="text-[10px] fill-current font-mono">
        <text x="40" y="120">u3</text>
        <text x="100" y="120">Ola Olsen</text>
        <text x="220" y="120">ola@x.no</text>
        <text x="310" y="120">11-22</text>
      </g>

      <text x="180" y="148" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        Endrer Ola epost? Må endre 3 steder → risiko for inkonsistens.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Redundans = samme data lagret flere ganger — kilden til oppdaterings-anomalier.
    </figcaption>
  </figure>
);

// =============================================================
// NORMALISERING
// =============================================================

// 1NF-brudd: komma-separert verdi i celle.
export const NfViolation1: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border-2 border-destructive/40 bg-destructive/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-2">✗ Bryter 1NF</div>
        <table className="w-full font-mono text-[10px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1">id</th>
              <th className="text-left py-1">navn</th>
              <th className="text-left py-1">telefoner</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Ola</td><td className="text-destructive">555-1, 555-2, 555-3</td></tr>
            <tr><td>2</td><td>Kari</td><td className="text-destructive">555-9</td></tr>
          </tbody>
        </table>
        <div className="text-[9px] mt-2 opacity-70">Flere verdier i én celle.</div>
      </div>
      <div className="rounded border-2 border-success/40 bg-success/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-2">✓ I 1NF</div>
        <div className="font-mono text-[10px] mb-1">PERSON</div>
        <table className="w-full font-mono text-[10px] mb-2">
          <thead><tr className="border-b border-border"><th className="text-left">id</th><th className="text-left">navn</th></tr></thead>
          <tbody><tr><td>1</td><td>Ola</td></tr><tr><td>2</td><td>Kari</td></tr></tbody>
        </table>
        <div className="font-mono text-[10px] mb-1">TELEFON</div>
        <table className="w-full font-mono text-[10px]">
          <thead><tr className="border-b border-border"><th className="text-left">pid</th><th className="text-left">nr</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>555-1</td></tr>
            <tr><td>1</td><td>555-2</td></tr>
            <tr><td>1</td><td>555-3</td></tr>
            <tr><td>2</td><td>555-9</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      1NF krever atomiske verdier — flerverdi-attributter må splittes ut i egen tabell.
    </figcaption>
  </figure>
);

// 2NF: partiell avhengighet på kompositt-PK.
export const NfViolation2: FC = () => (
  <figure className="my-4">
    <div className="grid md:grid-cols-2 gap-3 text-[11px]">
      <div className="rounded border-2 border-destructive/40 bg-destructive/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-2">✗ Bryter 2NF</div>
        <div className="font-mono text-[10px] mb-1">ORDRELINJE  (PK = ordreNr, prodNr)</div>
        <table className="w-full font-mono text-[10px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left">PK ordreNr</th>
              <th className="text-left">PK prodNr</th>
              <th className="text-left">antall</th>
              <th className="text-left text-destructive">prodNavn</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>100</td><td>P-1</td><td>3</td><td className="text-destructive">Skrue</td></tr>
            <tr><td>101</td><td>P-1</td><td>2</td><td className="text-destructive">Skrue</td></tr>
            <tr><td>102</td><td>P-1</td><td>9</td><td className="text-destructive">Skrue</td></tr>
          </tbody>
        </table>
        <div className="text-[9px] mt-2 opacity-80">prodNavn avhenger bare av <code>prodNr</code> — partiell avhengighet.</div>
      </div>
      <div className="rounded border-2 border-success/40 bg-success/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-success font-semibold mb-2">✓ I 2NF — splitt</div>
        <div className="font-mono text-[10px] mb-1">ORDRELINJE</div>
        <table className="w-full font-mono text-[10px] mb-2">
          <thead><tr className="border-b border-border"><th className="text-left">PK,FK ordreNr</th><th className="text-left">PK,FK prodNr</th><th className="text-left">antall</th></tr></thead>
          <tbody>
            <tr><td>100</td><td>P-1</td><td>3</td></tr>
            <tr><td>101</td><td>P-1</td><td>2</td></tr>
            <tr><td>102</td><td>P-1</td><td>9</td></tr>
          </tbody>
        </table>
        <div className="font-mono text-[10px] mb-1">PRODUKT</div>
        <table className="w-full font-mono text-[10px]">
          <thead><tr className="border-b border-border"><th className="text-left">PK prodNr</th><th className="text-left">prodNavn</th></tr></thead>
          <tbody><tr><td>P-1</td><td>Skrue</td></tr></tbody>
        </table>
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      2NF: alle ikke-nøkkelfelt må avhenge av HELE den sammensatte primærnøkkelen.
    </figcaption>
  </figure>
);

// 3NF: transitiv avhengighet A→B→C.
export const NfViolation3: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 170" className="w-full max-w-lg mx-auto text-foreground">
      {/* Tre noder for transitiv avhengighet */}
      <rect x="20" y="60" width="100" height="40" rx="6" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} />
      <text x="70" y="78" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">kundeNr</text>
      <text x="70" y="92" textAnchor="middle" className="text-[9px] fill-current opacity-70">(PK)</text>

      <rect x="160" y="60" width="100" height="40" rx="6" fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} />
      <text x="210" y="78" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">postNr</text>
      <text x="210" y="92" textAnchor="middle" className="text-[9px] fill-current opacity-70">(ikke-nøkkel)</text>

      <rect x="300" y="60" width="100" height="40" rx="6" fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} />
      <text x="350" y="78" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">poststed</text>
      <text x="350" y="92" textAnchor="middle" className="text-[9px] fill-current opacity-70">(ikke-nøkkel)</text>

      <line x1="120" y1="80" x2="160" y2="80" stroke={STROKE} strokeWidth="1.3" markerEnd="url(#fdArr1)" />
      <line x1="260" y1="80" x2="300" y2="80" stroke={STROKE} strokeWidth="1.3" markerEnd="url(#fdArr1)" />
      <path d="M 70 60 C 70 20 350 20 350 60" fill="none" stroke="var(--destructive)" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#fdBad)" />
      <text x="210" y="30" textAnchor="middle" className="text-[9px] fill-current font-semibold" style={{ fill: "var(--destructive)" }}>
        transitiv: kundeNr → poststed (via postNr)
      </text>

      <text x="210" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        3NF: ingen ikke-nøkkel skal avhenge av en annen ikke-nøkkel.
      </text>
      <text x="210" y="153" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Løsning: egen POSTSTED-tabell og FK postNr i KUNDE.
      </text>
      <defs>
        {arrowMarker("fdArr1")}
        <marker id="fdBad" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--destructive)" />
        </marker>
      </defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Transitiv avhengighet: kundeNr bestemmer postNr som bestemmer poststed.
    </figcaption>
  </figure>
);

// BCNF: determinant må være kandidatnøkkel.
export const BcnfExample: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto text-foreground">
      <text x="210" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">
        Bestilling(<tspan className="font-bold">kursnavn</tspan>, dag, <tspan className="font-bold">instruktør</tspan>) — FD: instruktør → kursnavn
      </text>
      <rect x="40" y="40" width="120" height="35" rx="6" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="100" y="62" textAnchor="middle" className="text-[10px] fill-current font-mono">instruktør</text>

      <rect x="260" y="40" width="120" height="35" rx="6" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="320" y="62" textAnchor="middle" className="text-[10px] fill-current font-mono">kursnavn</text>

      <line x1="160" y1="57" x2="260" y2="57" stroke={STROKE} strokeWidth="1.3" markerEnd="url(#bcArr)" />
      <text x="210" y="50" textAnchor="middle" className="text-[9px] fill-current opacity-70">→</text>

      <text x="210" y="100" textAnchor="middle" className="text-[10px] fill-current">
        Problem: <tspan className="font-mono">instruktør</tspan> er determinant, men IKKE kandidatnøkkel.
      </text>
      <text x="210" y="120" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        BCNF krever: alle determinanter må være kandidatnøkler.
      </text>
      <text x="210" y="145" textAnchor="middle" className="text-[10px] fill-current font-semibold" style={{ fill: "var(--success)" }}>
        Løsning: splitt i INSTRUKTØR(instruktør, kursnavn) + BESTILLING(instruktør, dag).
      </text>

      <defs>{arrowMarker("bcArr")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      BCNF er strengere enn 3NF — fjerner sjeldne anomalier der en ikke-kandidat bestemmer en del av PK.
    </figcaption>
  </figure>
);

// Anomalier (insert / update / delete) konkret tabell.
export const AnomaliesTable: FC = () => (
  <figure className="my-4">
    <div className="rounded border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Denormalisert STUDENT_FAG</div>
      <table className="w-full font-mono text-[10px] mb-2">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1">studentId</th>
            <th className="text-left">navn</th>
            <th className="text-left">fagkode</th>
            <th className="text-left">fagnavn</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Ola</td><td>INF1000</td><td>Programmering</td></tr>
          <tr><td>1</td><td>Ola</td><td>MAT1001</td><td>Diskret matte</td></tr>
          <tr className="bg-destructive/15"><td>2</td><td>Kari</td><td>INF1000</td><td>Programmering</td></tr>
        </tbody>
      </table>
    </div>
    <div className="grid sm:grid-cols-3 gap-2 text-[10px] mt-2">
      <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
        <div className="font-semibold text-destructive mb-1">Insert-anomali</div>
        Kan ikke registrere et nytt fag uten å samtidig ha en student.
      </div>
      <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
        <div className="font-semibold text-destructive mb-1">Update-anomali</div>
        Endre navnet på INF1000 → må endres på ALLE rader. Glipp ⇒ inkonsistens.
      </div>
      <div className="rounded border border-destructive/40 bg-destructive/5 p-2">
        <div className="font-semibold text-destructive mb-1">Delete-anomali</div>
        Sletter siste rad om Kari (markert) → MAT1001 forsvinner også.
      </div>
    </div>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-2">
      Anomalier er konsekvensen av redundans — normalisering eliminerer dem.
    </figcaption>
  </figure>
);

// FD som rettet graf — for c-norm-fd, c-norm-determinant.
export const FdGraph: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 170" className="w-full max-w-sm mx-auto text-foreground">
      <rect x="30" y="60" width="80" height="40" rx="6" fill="color-mix(in oklch, var(--success) 25%, transparent)" stroke={STROKE} />
      <text x="70" y="78" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">kundeNr</text>
      <text x="70" y="92" textAnchor="middle" className="text-[8px] fill-current opacity-70">determinant</text>

      <rect x="230" y="20" width="100" height="32" rx="6" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="280" y="40" textAnchor="middle" className="text-[10px] fill-current font-mono">navn</text>

      <rect x="230" y="65" width="100" height="32" rx="6" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="280" y="85" textAnchor="middle" className="text-[10px] fill-current font-mono">epost</text>

      <rect x="230" y="110" width="100" height="32" rx="6" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="280" y="130" textAnchor="middle" className="text-[10px] fill-current font-mono">postNr</text>

      <line x1="110" y1="75" x2="230" y2="36" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#fdAr2)" />
      <line x1="110" y1="80" x2="230" y2="81" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#fdAr2)" />
      <line x1="110" y1="85" x2="230" y2="126" stroke={STROKE} strokeWidth="1.2" markerEnd="url(#fdAr2)" />

      <text x="180" y="158" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        kundeNr → navn, epost, postNr
      </text>

      <defs>{arrowMarker("fdAr2")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      FD-pil: venstreside bestemmer høyresiden entydig.
    </figcaption>
  </figure>
);

// Denormalisering — slå sammen for ytelse.
export const Denormalization: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 440 170" className="w-full max-w-lg mx-auto text-foreground">
      {/* Venstre: normalisert (mange JOINs) */}
      <g>
        <text x="80" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Normalisert (OLTP)</text>
        <rect x="20" y="30" width="50" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
        <text x="45" y="48" textAnchor="middle" className="text-[9px] fill-current font-mono">Ordre</text>
        <rect x="90" y="30" width="50" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
        <text x="115" y="48" textAnchor="middle" className="text-[9px] fill-current font-mono">Kunde</text>
        <rect x="20" y="80" width="50" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
        <text x="45" y="98" textAnchor="middle" className="text-[9px] fill-current font-mono">Linje</text>
        <rect x="90" y="80" width="50" height="28" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
        <text x="115" y="98" textAnchor="middle" className="text-[9px] fill-current font-mono">Produkt</text>
        <line x1="70" y1="44" x2="90" y2="44" stroke={STROKE} />
        <line x1="45" y1="58" x2="45" y2="80" stroke={STROKE} />
        <line x1="70" y1="94" x2="90" y2="94" stroke={STROKE} />
        <text x="80" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-70">trygt mot anomalier</text>
        <text x="80" y="150" textAnchor="middle" className="text-[10px] fill-current opacity-70">men 3+ JOINs per spørring</text>
      </g>

      <text x="220" y="90" textAnchor="middle" className="text-[14px] fill-current">→</text>

      {/* Høyre: denormalisert */}
      <g>
        <text x="350" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Denormalisert (DWH/rapport)</text>
        <rect x="260" y="30" width="180" height="80" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
        <text x="350" y="50" textAnchor="middle" className="text-[10px] fill-current font-mono">ORDRE_FLAT</text>
        <text x="270" y="68" className="text-[9px] fill-current font-mono">ordreId, kundeNavn,</text>
        <text x="270" y="82" className="text-[9px] fill-current font-mono">prodNavn, pris,</text>
        <text x="270" y="96" className="text-[9px] fill-current font-mono">antall, dato …</text>
        <text x="350" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-70">én tabell = raske SELECT</text>
        <text x="350" y="150" textAnchor="middle" className="text-[10px] fill-current opacity-70">dyrere oppdateringer</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Denormalisering bytter skrive-renhet mot lese-fart. Brukes i analyse-databaser.
    </figcaption>
  </figure>
);

// =============================================================
// ER-MODELL
// =============================================================

// Entitet (rektangel) + attributter (oval).
export const ErEntityAttr: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 180" className="w-full max-w-md mx-auto text-foreground">
      <rect x="140" y="70" width="100" height="40" fill="color-mix(in oklch, var(--brand) 22%, transparent)" stroke={STROKE} strokeWidth="1.4" />
      <text x="190" y="94" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">KUNDE</text>

      <ellipse cx="50" cy="40" rx="40" ry="16" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="44" textAnchor="middle" className="text-[9px] fill-current font-mono">kundeNr</text>
      <line x1="80" y1="50" x2="145" y2="80" stroke={STROKE} />
      {/* underline for PK */}
      <line x1="32" y1="46" x2="68" y2="46" stroke={STROKE} />

      <ellipse cx="50" cy="120" rx="40" ry="16" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="50" y="124" textAnchor="middle" className="text-[9px] fill-current font-mono">navn</text>
      <line x1="80" y1="110" x2="145" y2="100" stroke={STROKE} />

      <ellipse cx="330" cy="40" rx="40" ry="16" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="330" y="44" textAnchor="middle" className="text-[9px] fill-current font-mono">epost</text>
      <line x1="300" y1="50" x2="240" y2="80" stroke={STROKE} />

      <ellipse cx="330" cy="120" rx="40" ry="16" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="330" y="124" textAnchor="middle" className="text-[9px] fill-current font-mono">by</text>
      <line x1="300" y1="110" x2="240" y2="100" stroke={STROKE} />

      <text x="190" y="160" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Rektangel = entitet. Oval = attributt. Understreket = PK.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Chen-notasjon: entiteten i midten med attributtene rundt.
    </figcaption>
  </figure>
);

// Svak entitet (dobbel-kantet rektangel).
export const ErWeakEntity: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 400 170" className="w-full max-w-md mx-auto text-foreground">
      {/* Sterk entitet ORDRE */}
      <rect x="30" y="60" width="110" height="50" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} strokeWidth="1.4" />
      <text x="85" y="90" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">ORDRE</text>

      {/* Identifiserende relasjon — diamond med dobbel kant */}
      <g transform="translate(200 85)">
        <polygon points="-30,0 0,-22 30,0 0,22" fill="color-mix(in oklch, var(--muted) 60%, transparent)" stroke={STROKE} />
        <polygon points="-22,0 0,-15 22,0 0,15" fill="none" stroke={STROKE} />
        <text x="0" y="4" textAnchor="middle" className="text-[9px] fill-current">HAR</text>
      </g>

      {/* Svak entitet ORDRELINJE — dobbel-kantet rektangel */}
      <rect x="260" y="60" width="120" height="50" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} strokeWidth="1.4" />
      <rect x="265" y="65" width="110" height="40" fill="none" stroke={STROKE} />
      <text x="320" y="90" textAnchor="middle" className="text-[11px] fill-current font-mono font-semibold">ORDRELINJE</text>

      <line x1="140" y1="85" x2="170" y2="85" stroke={STROKE} strokeWidth="1.2" />
      <line x1="230" y1="85" x2="260" y2="85" stroke={STROKE} strokeWidth="1.2" />

      <text x="200" y="140" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        Dobbel kant = svak entitet. PK = (FK til eier + delvis ID).
      </text>
      <text x="200" y="156" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        ORDRELINJE finnes ikke uten en ORDRE.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Svak entitet er eksistensavhengig — eierens PK er en del av dens PK.
    </figcaption>
  </figure>
);

// Total vs partiell deltakelse (heltrukken vs O).
export const ErParticipation: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 200" className="w-full max-w-lg mx-auto text-foreground">
      {/* Total */}
      <g>
        <text x="105" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Total deltakelse</text>
        <rect x="20" y="50" width="80" height="40" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
        <text x="60" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono">ORDRE</text>
        <rect x="140" y="50" width="80" height="40" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
        <text x="180" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono">KUNDE</text>
        {/* solid double line */}
        <line x1="100" y1="68" x2="140" y2="68" stroke={STROKE} strokeWidth="1.4" />
        <line x1="100" y1="72" x2="140" y2="72" stroke={STROKE} strokeWidth="1.4" />
        <text x="120" y="105" textAnchor="middle" className="text-[10px] fill-current font-mono">|</text>
        <text x="120" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-70">FK NOT NULL</text>
      </g>

      {/* Partial */}
      <g>
        <text x="335" y="20" textAnchor="middle" className="text-[10px] fill-current font-semibold">Partiell deltakelse</text>
        <rect x="240" y="50" width="80" height="40" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
        <text x="280" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono">SAK</text>
        <rect x="360" y="50" width="80" height="40" fill="color-mix(in oklch, var(--brand) 18%, transparent)" stroke={STROKE} />
        <text x="400" y="74" textAnchor="middle" className="text-[10px] fill-current font-mono">ANSATT</text>
        {/* single line + O */}
        <line x1="320" y1="70" x2="360" y2="70" stroke={STROKE} strokeWidth="1.2" />
        <circle cx="334" cy="70" r="4" fill="none" stroke={STROKE} />
        <text x="340" y="105" textAnchor="middle" className="text-[10px] fill-current font-mono">O</text>
        <text x="340" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-70">FK kan være NULL</text>
      </g>

      <text x="210" y="170" textAnchor="middle" className="text-[10px] fill-current opacity-80">
        Indre symbol angir minimum: `|` = obligatorisk, `O` = valgfri.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Total deltakelse oversettes til NOT NULL på fremmednøkkelen.
    </figcaption>
  </figure>
);

// Flerverdi-attributt → egen tabell.
export const ErMultivaluedAttr: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto text-foreground">
      {/* ER side: double ellipse */}
      <g>
        <rect x="30" y="60" width="80" height="40" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
        <text x="70" y="84" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">PERSON</text>
        <ellipse cx="160" cy="80" rx="40" ry="18" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
        <ellipse cx="160" cy="80" rx="32" ry="12" fill="none" stroke={STROKE} />
        <text x="160" y="84" textAnchor="middle" className="text-[9px] fill-current font-mono">telefon</text>
        <line x1="110" y1="80" x2="120" y2="80" stroke={STROKE} />
        <text x="115" y="125" textAnchor="middle" className="text-[10px] fill-current opacity-70">flerverdi-attributt</text>
      </g>

      <text x="220" y="84" textAnchor="middle" className="text-[16px] fill-current">→</text>

      {/* Relational: two tables */}
      <g>
        <rect x="240" y="40" width="80" height="40" fill="color-mix(in oklch, var(--brand) 15%, transparent)" stroke={STROKE} />
        <text x="280" y="58" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">PERSON</text>
        <text x="280" y="73" textAnchor="middle" className="text-[9px] fill-current font-mono">PK pid</text>

        <rect x="340" y="40" width="80" height="60" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
        <text x="380" y="58" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">TELEFON</text>
        <text x="380" y="73" textAnchor="middle" className="text-[9px] fill-current font-mono">FK pid</text>
        <text x="380" y="88" textAnchor="middle" className="text-[9px] fill-current font-mono">nr</text>

        <line x1="320" y1="60" x2="340" y2="60" stroke={STROKE} />
        <text x="330" y="135" textAnchor="middle" className="text-[10px] fill-current opacity-70">1 : M</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Flerverdi-attributter mappes til en egen tabell — aldri komma-liste i én kolonne.
    </figcaption>
  </figure>
);

// Sammensatt attributt (har deler).
export const ErCompositeAttr: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 380 170" className="w-full max-w-md mx-auto text-foreground">
      <rect x="30" y="60" width="80" height="40" fill="color-mix(in oklch, var(--brand) 20%, transparent)" stroke={STROKE} />
      <text x="70" y="84" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">PERSON</text>

      <ellipse cx="200" cy="80" rx="50" ry="18" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
      <text x="200" y="84" textAnchor="middle" className="text-[10px] fill-current font-mono">adresse</text>
      <line x1="110" y1="80" x2="150" y2="80" stroke={STROKE} />

      {/* deler */}
      <ellipse cx="320" cy="30" rx="35" ry="13" fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x="320" y="34" textAnchor="middle" className="text-[9px] fill-current font-mono">gate</text>
      <ellipse cx="320" cy="80" rx="35" ry="13" fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x="320" y="84" textAnchor="middle" className="text-[9px] fill-current font-mono">postNr</text>
      <ellipse cx="320" cy="130" rx="35" ry="13" fill="color-mix(in oklch, var(--success) 14%, transparent)" stroke={STROKE} />
      <text x="320" y="134" textAnchor="middle" className="text-[9px] fill-current font-mono">sted</text>

      <line x1="250" y1="75" x2="285" y2="40" stroke={STROKE} />
      <line x1="250" y1="80" x2="285" y2="80" stroke={STROKE} />
      <line x1="250" y1="85" x2="285" y2="120" stroke={STROKE} />

      <text x="200" y="160" textAnchor="middle" className="text-[10px] fill-current opacity-70">
        Mappes til flere kolonner i samme tabell — ikke til egen tabell.
      </text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Sammensatt attributt har deler (gate, postNr, sted) som du kan lagre hver for seg.
    </figcaption>
  </figure>
);

// =============================================================
// RELASJONSMODELL
// =============================================================

// Tuple/attributt — formelt skjema.
export const TupleAttribute: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 360 180" className="w-full max-w-md mx-auto text-foreground">
      <rect x="20" y="20" width="320" height="140" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
      <rect x="20" y="20" width="320" height="22" fill="color-mix(in oklch, var(--brand) 28%, transparent)" stroke={STROKE} />
      <text x="180" y="36" textAnchor="middle" className="text-[10px] fill-current font-mono font-semibold">PRODUKT (relasjon)</text>

      {/* header (attributter) */}
      <g className="text-[10px] fill-current font-mono font-bold">
        <text x="60" y="60" textAnchor="middle">pid</text>
        <text x="160" y="60" textAnchor="middle">navn</text>
        <text x="270" y="60" textAnchor="middle">pris</text>
      </g>
      <line x1="20" y1="66" x2="340" y2="66" stroke={STROKE} strokeOpacity="0.5" />

      {/* tupler */}
      <rect x="20" y="68" width="320" height="22" fill="color-mix(in oklch, var(--success) 22%, transparent)" />
      <g className="text-[10px] fill-current font-mono">
        <text x="60" y="84" textAnchor="middle">1</text>
        <text x="160" y="84" textAnchor="middle">Skrue</text>
        <text x="270" y="84" textAnchor="middle">3.50</text>
      </g>
      <g className="text-[10px] fill-current font-mono">
        <text x="60" y="106" textAnchor="middle">2</text>
        <text x="160" y="106" textAnchor="middle">Mutter</text>
        <text x="270" y="106" textAnchor="middle">1.20</text>
        <text x="60" y="128" textAnchor="middle">3</text>
        <text x="160" y="128" textAnchor="middle">Bolt</text>
        <text x="270" y="128" textAnchor="middle">4.80</text>
      </g>

      {/* annotasjoner */}
      <text x="355" y="84" textAnchor="end" className="text-[9px] fill-current" style={{ fill: "var(--success)" }}>← tuppel (rad)</text>
      <text x="160" y="155" textAnchor="middle" className="text-[10px] fill-current">attributt = kolonne med navn + datatype</text>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      «Relasjon» = tabell. Tuppel = rad. Attributt = kolonne. Skjemaet er navnene + typene.
    </figcaption>
  </figure>
);

// =============================================================
// RELASJONSALGEBRA
// =============================================================

export const AlgSelection: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto text-foreground">
      <text x="210" y="20" textAnchor="middle" className="text-[11px] fill-current font-mono">σ<tspan baselineShift="sub" fontSize="8">pris &gt; 100</tspan>(Produkt)  ≡  SELECT * FROM Produkt WHERE pris &gt; 100</text>

      {/* inn-tabell */}
      <g>
        <rect x="20" y="40" width="160" height="120" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
        <rect x="20" y="40" width="160" height="20" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} />
        <text x="100" y="54" textAnchor="middle" className="text-[9px] fill-current font-mono font-bold">navn · pris</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="30" y="78">Skrue · 50</text>
          <rect x="20" y="82" width="160" height="18" fill="color-mix(in oklch, var(--success) 25%, transparent)" />
          <text x="30" y="96">Bolt · 120</text>
          <text x="30" y="116">Mutter · 30</text>
          <rect x="20" y="120" width="160" height="18" fill="color-mix(in oklch, var(--success) 25%, transparent)" />
          <text x="30" y="134">Skive · 150</text>
          <text x="30" y="152">Spiker · 25</text>
        </g>
      </g>

      <line x1="180" y1="100" x2="240" y2="100" stroke={STROKE} strokeWidth="1.3" markerEnd="url(#selArr)" />
      <text x="210" y="92" textAnchor="middle" className="text-[10px] fill-current opacity-70">σ pris&gt;100</text>

      {/* ut-tabell */}
      <g>
        <rect x="240" y="60" width="160" height="80" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
        <rect x="240" y="60" width="160" height="20" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} />
        <text x="320" y="74" textAnchor="middle" className="text-[9px] fill-current font-mono font-bold">navn · pris</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="250" y="98">Bolt · 120</text>
          <text x="250" y="118">Skive · 150</text>
        </g>
      </g>

      <defs>{arrowMarker("selArr")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      σ (seleksjon) filtrerer RADER — tilsvarer WHERE i SQL.
    </figcaption>
  </figure>
);

export const AlgProjection: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 420 180" className="w-full max-w-lg mx-auto text-foreground">
      <text x="210" y="20" textAnchor="middle" className="text-[11px] fill-current font-mono">π<tspan baselineShift="sub" fontSize="8">navn, pris</tspan>(Produkt)  ≡  SELECT DISTINCT navn, pris FROM Produkt</text>

      <g>
        <rect x="20" y="40" width="180" height="120" fill="color-mix(in oklch, var(--brand) 10%, transparent)" stroke={STROKE} />
        <rect x="20" y="40" width="180" height="20" fill="color-mix(in oklch, var(--brand) 25%, transparent)" stroke={STROKE} />
        <text x="110" y="54" textAnchor="middle" className="text-[9px] fill-current font-mono font-bold">pid · navn · pris</text>
        {/* highlight projected columns */}
        <rect x="65" y="60" width="135" height="100" fill="color-mix(in oklch, var(--success) 18%, transparent)" />
        <g className="text-[10px] fill-current font-mono">
          <text x="30" y="78">1 · Skrue · 50</text>
          <text x="30" y="98">2 · Bolt · 120</text>
          <text x="30" y="118">3 · Mutter · 30</text>
          <text x="30" y="138">4 · Skive · 150</text>
        </g>
      </g>

      <line x1="200" y1="100" x2="240" y2="100" stroke={STROKE} strokeWidth="1.3" markerEnd="url(#projArr)" />
      <text x="220" y="92" textAnchor="middle" className="text-[10px] fill-current opacity-70">π</text>

      <g>
        <rect x="240" y="50" width="160" height="110" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
        <rect x="240" y="50" width="160" height="20" fill="color-mix(in oklch, var(--success) 35%, transparent)" stroke={STROKE} />
        <text x="320" y="64" textAnchor="middle" className="text-[9px] fill-current font-mono font-bold">navn · pris</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="250" y="88">Skrue · 50</text>
          <text x="250" y="106">Bolt · 120</text>
          <text x="250" y="124">Mutter · 30</text>
          <text x="250" y="142">Skive · 150</text>
        </g>
      </g>

      <defs>{arrowMarker("projArr")}</defs>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      π (projeksjon) plukker ut KOLONNER — duplikater fjernes implisitt i algebra.
    </figcaption>
  </figure>
);

export const AlgJoin: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 460 180" className="w-full max-w-lg mx-auto text-foreground">
      <text x="230" y="20" textAnchor="middle" className="text-[11px] fill-current font-mono">A ⋈ B  ≡  INNER JOIN ON felles attributter</text>

      <g>
        <rect x="20" y="40" width="120" height="100" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
        <text x="80" y="56" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">A: kid, navn</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="30" y="78">1 · Ola</text>
          <text x="30" y="96">2 · Kari</text>
          <text x="30" y="114">3 · Liv</text>
        </g>
      </g>

      <text x="160" y="100" textAnchor="middle" className="text-[16px] fill-current">⋈</text>

      <g>
        <rect x="180" y="40" width="120" height="100" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
        <text x="240" y="56" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">B: kid, sum</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="190" y="78">1 · 100</text>
          <text x="190" y="96">2 · 200</text>
          <text x="190" y="114">5 · 999</text>
        </g>
      </g>

      <text x="325" y="100" textAnchor="middle" className="text-[14px] fill-current">→</text>

      <g>
        <rect x="345" y="40" width="110" height="100" fill="color-mix(in oklch, var(--success) 22%, transparent)" stroke={STROKE} />
        <text x="400" y="56" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">kid · navn · sum</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="355" y="78">1 · Ola · 100</text>
          <text x="355" y="96">2 · Kari · 200</text>
        </g>
        <text x="400" y="125" textAnchor="middle" className="text-[9px] fill-current opacity-70">3 og 5 forsvinner</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Natural join matcher rader der felles attributter er like.
    </figcaption>
  </figure>
);

export const AlgSetOps: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 460 170" className="w-full max-w-lg mx-auto text-foreground">
      {(["UNION", "INTERSECT", "EXCEPT"] as const).map((op, idx) => {
        const cx = 80 + idx * 150;
        const cy = 85;
        const filledA = op !== "INTERSECT";
        const filledB = op === "UNION";
        const filledMid = op !== "EXCEPT";
        return (
          <g key={op}>
            <defs>
              <clipPath id={`setA-${op}`}><circle cx={cx - 20} cy={cy} r="40" /></clipPath>
              <clipPath id={`setB-${op}`}><circle cx={cx + 20} cy={cy} r="40" /></clipPath>
            </defs>
            {filledA && <circle cx={cx - 20} cy={cy} r="40" fill="color-mix(in oklch, var(--brand) 30%, transparent)" />}
            {filledB && <circle cx={cx + 20} cy={cy} r="40" fill="color-mix(in oklch, var(--brand) 30%, transparent)" />}
            {filledMid && (
              <g clipPath={`url(#setA-${op})`}>
                <circle cx={cx + 20} cy={cy} r="40" fill="color-mix(in oklch, var(--success) 45%, transparent)" />
              </g>
            )}
            <circle cx={cx - 20} cy={cy} r="40" fill="none" stroke={STROKE} />
            <circle cx={cx + 20} cy={cy} r="40" fill="none" stroke={STROKE} />
            <text x={cx - 32} y={cy + 4} textAnchor="middle" className="text-[10px] fill-current font-mono">A</text>
            <text x={cx + 32} y={cy + 4} textAnchor="middle" className="text-[10px] fill-current font-mono">B</text>
            <text x={cx} y={150} textAnchor="middle" className="text-[10px] fill-current font-semibold">{op}</text>
          </g>
        );
      })}
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      UNION = A ∪ B. INTERSECT = A ∩ B. EXCEPT/MINUS = A \ B. Begge inn-relasjoner må ha samme skjema.
    </figcaption>
  </figure>
);

export const AlgCrossProduct: FC = () => (
  <figure className="my-4">
    <svg viewBox="0 0 460 200" className="w-full max-w-lg mx-auto text-foreground">
      <text x="230" y="20" textAnchor="middle" className="text-[11px] fill-current font-mono">A × B  →  |A| · |B| rader (alle kombinasjoner)</text>

      <g>
        <rect x="20" y="40" width="90" height="80" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
        <text x="65" y="56" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">A</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="30" y="76">a1</text>
          <text x="30" y="94">a2</text>
          <text x="30" y="112">a3</text>
        </g>
      </g>

      <text x="130" y="84" textAnchor="middle" className="text-[16px] fill-current">×</text>

      <g>
        <rect x="150" y="40" width="90" height="80" fill="color-mix(in oklch, var(--brand) 12%, transparent)" stroke={STROKE} />
        <text x="195" y="56" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">B</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="160" y="76">b1</text>
          <text x="160" y="94">b2</text>
        </g>
      </g>

      <text x="260" y="84" textAnchor="middle" className="text-[14px] fill-current">→</text>

      <g>
        <rect x="280" y="40" width="170" height="140" fill="color-mix(in oklch, var(--success) 18%, transparent)" stroke={STROKE} />
        <text x="365" y="56" textAnchor="middle" className="text-[10px] fill-current font-mono font-bold">A × B  (3 · 2 = 6 rader)</text>
        <g className="text-[10px] fill-current font-mono">
          <text x="295" y="76">a1, b1</text><text x="385" y="76">a1, b2</text>
          <text x="295" y="94">a2, b1</text><text x="385" y="94">a2, b2</text>
          <text x="295" y="112">a3, b1</text><text x="385" y="112">a3, b2</text>
        </g>
        <text x="365" y="160" textAnchor="middle" className="text-[9px] fill-current opacity-70">SQL: CROSS JOIN — eller glemt ON-betingelse</text>
      </g>
    </svg>
    <figcaption className="text-center text-[11px] text-muted-foreground mt-1">
      Kartesisk produkt: hver rad i A kombineres med hver rad i B.
    </figcaption>
  </figure>
);

// =============================================================
// REGISTRY
// =============================================================

export const DB_MODELL_VISUALS: Record<string, FC> = {
  // grunnbegrep
  "db-database-icon": DatabaseIcon,
  "db-table-anatomy": TableAnatomy,
  // nøkler
  "db-pk-fk-arrow": PkFkArrow,
  "db-composite-key": CompositeKey,
  "db-super-candidate-pk": SuperCandidatePk,
  // relasjoner
  "db-mn-junction": MnJunction,
  "db-fk-many-side": FkOnManySide,
  "db-recursive-relation": RecursiveRelation,
  "db-mn-relation-attr": MnRelationAttribute,
  // integritet
  "db-ref-integrity": RefIntegrity,
  "db-entity-integrity": EntityIntegrity,
  "db-domain-filter": DomainFilter,
  "db-redundancy": RedundancyTable,
  // normalisering
  "db-1nf-violation": NfViolation1,
  "db-2nf-split": NfViolation2,
  "db-3nf-transitive": NfViolation3,
  "db-bcnf": BcnfExample,
  "db-anomalies": AnomaliesTable,
  "db-fd-graph": FdGraph,
  "db-denormalization": Denormalization,
  // ER
  "db-er-entity-attr": ErEntityAttr,
  "db-er-weak": ErWeakEntity,
  "db-er-participation": ErParticipation,
  "db-er-multivalued": ErMultivaluedAttr,
  "db-er-composite-attr": ErCompositeAttr,
  // relasjonsmodell
  "db-tuple-attribute": TupleAttribute,
  // relasjonsalgebra
  "db-alg-selection": AlgSelection,
  "db-alg-projection": AlgProjection,
  "db-alg-join": AlgJoin,
  "db-alg-set-ops": AlgSetOps,
  "db-alg-cross-product": AlgCrossProduct,
};
