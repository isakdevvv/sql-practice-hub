import * as React from "react";

/**
 * Ikoner for KuroseKap5Page (control-plane: routing, OSPF, BGP, SDN, ICMP,
 * SNMP, DHCP). Hver eksport er en SVG i 48×48 viewBox med `currentColor`
 * stroke. Designet bevisst minimalt for gjenkjennelse i VisualDefs-kortene.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function S(props: IconProps & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <svg {...baseProps} {...rest}>
      {children}
    </svg>
  );
}

// ------------------------------------------------------------------
// Generelle control-plane / data-plane
// ------------------------------------------------------------------

// Data-plane: ruterboks med pil tvers igjennom (per-pakke videresending)
export const DataPlaneIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="16" width="32" height="16" rx="2" />
    <path d="M4 24h6M38 24h6M44 24l-3-3M44 24l-3 3" />
    <circle cx="16" cy="24" r="1.4" fill="currentColor" />
    <circle cx="24" cy="24" r="1.4" fill="currentColor" />
    <circle cx="32" cy="24" r="1.4" fill="currentColor" />
  </S>
);

// Control-plane: kontrollerhjerne over rutere
export const ControlPlaneIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="12" r="6" />
    <path d="M21 12h6M24 9v6" />
    <rect x="6" y="30" width="10" height="10" rx="1.5" />
    <rect x="19" y="30" width="10" height="10" rx="1.5" />
    <rect x="32" y="30" width="10" height="10" rx="1.5" />
    <path d="M24 18l-13 12M24 18v12M24 18l13 12" strokeDasharray="2 2" />
  </S>
);

// Distribuert control-plane: bare rutere som snakker med naboer
export const DistributedIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="5" />
    <circle cx="36" cy="12" r="5" />
    <circle cx="12" cy="36" r="5" />
    <circle cx="36" cy="36" r="5" />
    <path d="M17 12h14M12 17v14M36 17v14M17 36h14" />
  </S>
);

// SDN-controller (sentral boks + dotted control-links til switcher)
export const SdnControllerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="4" width="20" height="10" rx="1.5" />
    <path d="M19 9h10" />
    <rect x="4" y="32" width="10" height="10" rx="1.5" />
    <rect x="19" y="32" width="10" height="10" rx="1.5" />
    <rect x="34" y="32" width="10" height="10" rx="1.5" />
    <path d="M24 14l-15 18M24 14v18M24 14l15 18" strokeDasharray="2 2" />
  </S>
);

// Routing vs forwarding: split diagram
export const RoutingVsForwardingIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4v40" strokeDasharray="2 2" />
    <circle cx="12" cy="14" r="3" />
    <circle cx="12" cy="34" r="3" />
    <path d="M15 14h6M15 34h6" />
    <rect x="30" y="10" width="14" height="8" rx="1" />
    <rect x="30" y="30" width="14" height="8" rx="1" />
    <path d="M28 14h2M28 34h2M32 22l4 4-4 4" />
  </S>
);

// Forwarding-tabell: tabell + pil
export const ForwardingTableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="1.5" />
    <path d="M6 16h36M6 24h36M6 32h36M22 8v32" />
    <path d="M10 12h8M26 12h6M10 20h8M26 20h6M10 28h8M26 28h6" />
  </S>
);

// RIB vs FIB: to stablete tabeller
export const RibFibIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="22" height="28" rx="1.5" />
    <path d="M4 14h22M4 20h22M4 26h22M4 32h22" />
    <rect x="28" y="18" width="16" height="18" rx="1.5" />
    <path d="M28 24h16M28 30h16" />
    <path d="M26 22l2 0" strokeDasharray="1 1" />
  </S>
);

// Konvergens: noder som samles om felles verdi
export const ConvergenceIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="4" />
    <path d="M24 24l-12-10M24 24l12-10M24 24l-12 10M24 24l12 10" />
    <circle cx="10" cy="12" r="2.5" />
    <circle cx="38" cy="12" r="2.5" />
    <circle cx="10" cy="36" r="2.5" />
    <circle cx="38" cy="36" r="2.5" />
  </S>
);

// Routing-loop: pil i ring
export const RoutingLoopIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="16" cy="24" r="4" />
    <circle cx="32" cy="24" r="4" />
    <path d="M20 22c4-6 8-6 12 0" />
    <path d="M28 22l4 0M32 22l-2-2" />
    <path d="M28 26c-4 6-8 6-12 0" />
    <path d="M20 26l-4 0M16 26l2 2" />
  </S>
);

// Black hole: pakke som forsvinner inn i hull
export const BlackHoleIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="32" cy="24" r="8" />
    <circle cx="32" cy="24" r="3" fill="currentColor" />
    <rect x="4" y="20" width="8" height="8" rx="1" />
    <path d="M12 24h12" strokeDasharray="2 2" />
  </S>
);

// Topologi-database: kart-ikon med noder
export const TopologyDbIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <circle cx="14" cy="18" r="2" />
    <circle cx="34" cy="18" r="2" />
    <circle cx="14" cy="32" r="2" />
    <circle cx="34" cy="32" r="2" />
    <circle cx="24" cy="25" r="2" />
    <path d="M16 18h16M16 32h16M14 20v10M34 20v10M16 19l6 5M32 19l-6 5" />
  </S>
);

// Soft-state: klokke som tikker ned
export const SoftStateIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="26" r="14" />
    <path d="M24 18v8l6 4" />
    <path d="M16 6l-4 4M32 6l4 4" />
  </S>
);

// ------------------------------------------------------------------
// Routing-algoritmer
// ------------------------------------------------------------------

// Link-state: flood (utstrålende bølger fra én node)
export const LinkStateIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <circle cx="24" cy="24" r="9" strokeDasharray="2 2" />
    <circle cx="24" cy="24" r="16" strokeDasharray="2 2" />
    <circle cx="8" cy="24" r="2" />
    <circle cx="40" cy="24" r="2" />
    <circle cx="24" cy="8" r="2" />
    <circle cx="24" cy="40" r="2" />
  </S>
);

// Dijkstra: graf med uthevet korteste sti
export const DijkstraIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="24" cy="10" r="3" />
    <circle cx="24" cy="38" r="3" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24h13M24 13v22M27 24h10" strokeWidth="0.8" />
    <path d="M11 24l13-14M24 10l13 14" strokeWidth="2.6" />
  </S>
);

// Visited-set N: noder ringet inn
export const VisitedSetIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="20" cy="24" rx="14" ry="10" strokeDasharray="2 2" />
    <circle cx="12" cy="22" r="2" fill="currentColor" />
    <circle cx="20" cy="20" r="2" fill="currentColor" />
    <circle cx="20" cy="28" r="2" fill="currentColor" />
    <circle cx="28" cy="24" r="2" fill="currentColor" />
    <circle cx="40" cy="14" r="2" />
    <circle cx="40" cy="34" r="2" />
  </S>
);

// Dist-tabell: liten matrise / liste
export const DistTableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="8" width="32" height="32" rx="1.5" />
    <path d="M8 16h32M8 24h32M8 32h32M20 8v32" />
    <path d="M12 12h4M26 12h8M12 20h4M26 20h8M12 28h4M26 28h8M12 36h4M26 36h8" />
  </S>
);

// Relax-steg: pil som krymper
export const RelaxIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <circle cx="38" cy="24" r="3" />
    <path d="M13 24h22" strokeDasharray="2 2" />
    <path d="M13 18c5-4 17-4 22 0" />
    <path d="M35 18l-2-2M35 18l-2 2" />
    <path d="M22 32l-3-3M22 32l3-3" />
  </S>
);

// Distance-vector: vektor sendt mellom noder
export const DistanceVectorIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <rect x="6" y="32" width="8" height="12" rx="1" />
    <path d="M8 36h4M8 39h4M8 42h4" />
    <rect x="34" y="32" width="8" height="12" rx="1" />
    <path d="M36 36h4M36 39h4M36 42h4" />
    <path d="M14 22l20 0M34 22l-3-2M34 22l-3 2" />
    <path d="M34 26l-20 0M14 26l3 2M14 26l3-2" />
  </S>
);

// Bellman-Ford-likning: liten formel
export const BellmanFordIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <path d="M10 24h4M16 20l2 8M18 20l-2 8M22 24h4" />
    <path d="M30 20v8M28 20h4M28 28h4M36 21v6M34 24h4" />
  </S>
);

// Asynkron oppdatering: klokker som ikke er synket
export const AsyncIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="16" r="6" />
    <path d="M14 12v4l3 2" />
    <circle cx="34" cy="32" r="6" />
    <path d="M34 28v4l-3 2" />
    <path d="M20 18l8 8" strokeDasharray="2 2" />
  </S>
);

// Count-to-infinity: piltall som vokser
export const CountInfinityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 32l4-8 4 4 4-10 4 6 4-12 4 8 4-4 4 10 4-6" />
    <path d="M40 16c2-2 4-2 4 0s-2 2-4 0-4-2-4 0 2 2 4 0" />
  </S>
);

// Split horizon: pil som er stoppet bakover
export const SplitHorizonIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="24" r="4" />
    <circle cx="36" cy="24" r="4" />
    <path d="M16 24h16M32 24l-3-2M32 24l-3 2" />
    <path d="M32 18l-16 0" strokeDasharray="2 2" />
    <path d="M20 14l-4 4 4 4" />
    <line x1="14" y1="12" x2="22" y2="24" strokeWidth="2.4" />
  </S>
);

// Poisoned reverse: pil med "∞"-merke
export const PoisonReverseIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="24" r="4" />
    <circle cx="36" cy="24" r="4" />
    <path d="M32 24H16M16 24l3-2M16 24l3 2" />
    <text x="20" y="16" fontSize="10" fill="currentColor" stroke="none">∞</text>
  </S>
);

// RIP-grense: tall 15 / hop limit
export const RipLimitIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="2.5" />
    <circle cx="18" cy="24" r="2.5" />
    <circle cx="28" cy="24" r="2.5" />
    <circle cx="40" cy="24" r="2.5" />
    <path d="M10 24h6M20 24h6M30 24h8" />
    <text x="14" y="40" fontSize="8" fill="currentColor" stroke="none">≤15</text>
  </S>
);

// Kompleksitet / big-O
export const ComplexityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38c0-16 6-24 16-24s16 8 16 24" />
    <path d="M6 38h36" />
    <text x="14" y="14" fontSize="9" fill="currentColor" stroke="none">O(n log n)</text>
  </S>
);

// ------------------------------------------------------------------
// OSPF
// ------------------------------------------------------------------

// AS: stort område med rutere
export const AsIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24c0-10 8-16 18-16s18 6 18 16-8 16-18 16-18-6-18-16z" strokeDasharray="3 2" />
    <circle cx="16" cy="20" r="2" />
    <circle cx="32" cy="20" r="2" />
    <circle cx="24" cy="32" r="2" />
    <path d="M16 22v8M32 22v8M18 20h12" />
  </S>
);

// OSPF logo-aktig: en stjerne/sti
export const OspfIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="3" />
    <circle cx="10" cy="14" r="2.5" />
    <circle cx="38" cy="14" r="2.5" />
    <circle cx="10" cy="34" r="2.5" />
    <circle cx="38" cy="34" r="2.5" />
    <path d="M21 23l-9-7M27 23l9-7M21 25l-9 7M27 25l9 7" strokeWidth="2.4" />
  </S>
);

// LSA: pakke / brev med "LSA"
export const LsaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="24" rx="1.5" />
    <path d="M6 14l18 12 18-12" />
    <text x="14" y="32" fontSize="9" fill="currentColor" stroke="none">LSA</text>
  </S>
);

// Router-LSA (type 1)
export const RouterLsaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="18" width="28" height="12" rx="2" />
    <circle cx="16" cy="24" r="1.4" fill="currentColor" />
    <circle cx="24" cy="24" r="1.4" fill="currentColor" />
    <circle cx="32" cy="24" r="1.4" fill="currentColor" />
    <text x="18" y="42" fontSize="9" fill="currentColor" stroke="none">T1</text>
  </S>
);

// Network-LSA (type 2)
export const NetworkLsaIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="22" x2="42" y2="22" strokeWidth="2.4" />
    <rect x="8" y="28" width="6" height="8" rx="1" />
    <rect x="21" y="28" width="6" height="8" rx="1" />
    <rect x="34" y="28" width="6" height="8" rx="1" />
    <path d="M11 28v-6M24 28v-6M37 28v-6" />
    <text x="18" y="14" fontSize="9" fill="currentColor" stroke="none">T2</text>
  </S>
);

// Summary-LSA (type 3) — ABR krysser grense
export const SummaryLsaIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4v40" strokeDasharray="3 2" />
    <circle cx="14" cy="24" r="3" />
    <circle cx="34" cy="24" r="3" />
    <path d="M17 24h14M31 24l-3-2M31 24l-3 2" />
    <text x="18" y="42" fontSize="9" fill="currentColor" stroke="none">T3</text>
  </S>
);

// ASBR + eksterne ruter (T4/T5)
export const AsbrIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="18" cy="24" r="4" />
    <rect x="32" y="18" width="12" height="12" rx="1.5" />
    <path d="M22 24h10" />
    <text x="34" y="14" fontSize="8" fill="currentColor" stroke="none">ext</text>
    <text x="10" y="42" fontSize="9" fill="currentColor" stroke="none">T4/5</text>
  </S>
);

// Flooding: utstrålende pakker
export const FloodingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <path d="M24 21l0-12M24 27l0 12M21 24l-12 0M27 24l12 0" />
    <path d="M22 22l-9-9M26 22l9-9M22 26l-9 9M26 26l9 9" />
  </S>
);

// LSDB: liten database
export const LsdbIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="12" rx="14" ry="4" />
    <path d="M10 12v24c0 2 6 4 14 4s14-2 14-4V12" />
    <path d="M10 20c0 2 6 4 14 4s14-2 14-4" />
    <path d="M10 28c0 2 6 4 14 4s14-2 14-4" />
  </S>
);

// Areas: konsentriske områder
export const AreasIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="20" strokeDasharray="3 2" />
    <circle cx="24" cy="24" r="12" strokeDasharray="3 2" />
    <circle cx="24" cy="24" r="4" />
  </S>
);

// Area 0 backbone
export const BackboneIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="24" x2="44" y2="24" strokeWidth="3" />
    <circle cx="12" cy="24" r="2.5" />
    <circle cx="24" cy="24" r="2.5" />
    <circle cx="36" cy="24" r="2.5" />
    <path d="M12 22v-8M24 22v-8M36 22v-8M12 26v8M24 26v8M36 26v8" />
    <text x="19" y="44" fontSize="9" fill="currentColor" stroke="none">A0</text>
  </S>
);

// Stub area: ring med default-pil
export const StubAreaIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" strokeDasharray="3 2" />
    <circle cx="24" cy="24" r="3" />
    <path d="M27 24h14M41 24l-3-2M41 24l-3 2" />
    <text x="34" y="14" fontSize="8" fill="currentColor" stroke="none">def</text>
  </S>
);

// Hello-pakker: små piler frem og tilbake
export const HelloIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <path d="M14 21h20M34 21l-3-2M34 21l-3 2" />
    <path d="M34 27H14M14 27l3-2M14 27l3 2" />
    <text x="16" y="14" fontSize="7" fill="currentColor" stroke="none">hello</text>
  </S>
);

// ECMP: flere like-veier
export const EcmpIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 23c8-10 18-10 26 0" />
    <path d="M11 24h26" />
    <path d="M11 25c8 10 18 10 26 0" />
  </S>
);

// ------------------------------------------------------------------
// BGP
// ------------------------------------------------------------------

// BGP: AS-path-symbol
export const BgpIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="4" />
    <circle cx="24" cy="14" r="4" />
    <circle cx="40" cy="24" r="4" />
    <circle cx="24" cy="34" r="4" />
    <path d="M12 24l8-6M28 14l8 6M36 26l-8 6M20 32l-8-6" />
  </S>
);

// eBGP vs iBGP: to AS-er med pil mellom
export const EbgpIbgpIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="14" cy="24" rx="10" ry="14" strokeDasharray="3 2" />
    <ellipse cx="36" cy="24" rx="10" ry="14" strokeDasharray="3 2" />
    <circle cx="22" cy="24" r="2" />
    <circle cx="28" cy="24" r="2" />
    <path d="M24 24h2" strokeWidth="2.4" />
    <circle cx="10" cy="24" r="1.5" />
    <circle cx="40" cy="24" r="1.5" />
    <path d="M11 24h10M30 24h9" strokeDasharray="1 1" />
  </S>
);

// Prefiks-annonsering: høyttaler med "/24"
export const PrefixAdvertIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 18l8-6v24l-8-6z" />
    <path d="M8 22h-4v4h4" />
    <path d="M20 16c4 2 4 14 0 16" />
    <text x="26" y="28" fontSize="9" fill="currentColor" stroke="none">/24</text>
  </S>
);

// Withdrawal: pakke med kryss
export const WithdrawalIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="14" width="28" height="20" rx="2" />
    <path d="M14 18l10 10M24 18l-10 10" />
  </S>
);

// AS_PATH: lenket sti av AS-er
export const AsPathIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="4" />
    <circle cx="20" cy="24" r="4" />
    <circle cx="32" cy="24" r="4" />
    <circle cx="44" cy="24" r="3" />
    <path d="M12 24h4M24 24h4M36 24h5" />
    <text x="6" y="14" fontSize="7" fill="currentColor" stroke="none">A1 A2 A3</text>
  </S>
);

// AS_PATH-prepending: gjentatt eget AS
export const PrependingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="18" cy="24" r="3" />
    <circle cx="28" cy="24" r="3" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24h4M21 24h4M31 24h6" />
    <text x="4" y="14" fontSize="7" fill="currentColor" stroke="none">A A A B</text>
  </S>
);

// ORIGIN: liten merke
export const OriginIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M24 14v10l7 5" />
    <text x="14" y="42" fontSize="8" fill="currentColor" stroke="none">IGP</text>
  </S>
);

// LOCAL_PREF: vektskål
export const LocalPrefIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6v32M14 36h20" />
    <path d="M24 12l-12 8h24z" />
    <path d="M12 20c0 4 4 6 8 4M36 20c0 4-4 6-8 4" />
    <text x="18" y="44" fontSize="7" fill="currentColor" stroke="none">LP</text>
  </S>
);

// MED: lite hint-skilt
export const MedIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l16 14-16 14L8 20z" />
    <text x="16" y="26" fontSize="9" fill="currentColor" stroke="none">MED</text>
  </S>
);

// NEXT_HOP: pil til neste node
export const NextHopIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" fill="currentColor" />
    <circle cx="38" cy="24" r="4" />
    <path d="M13 24h21M34 24l-3-2M34 24l-3 2" />
    <text x="6" y="14" fontSize="7" fill="currentColor" stroke="none">NEXT</text>
  </S>
);

// Rute-seleksjon: tre-diagram / beslutningstre
export const DecisionTreeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="8" r="2.5" />
    <circle cx="12" cy="22" r="2.5" />
    <circle cx="36" cy="22" r="2.5" />
    <circle cx="6" cy="38" r="2" />
    <circle cx="18" cy="38" r="2" />
    <circle cx="30" cy="38" r="2" />
    <circle cx="42" cy="38" r="2" />
    <path d="M24 10l-12 10M24 10l12 10M12 24l-6 12M12 24l6 12M36 24l-6 12M36 24l6 12" />
  </S>
);

// Kunde-policy: $ inn
export const CustomerPolicyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <text x="20" y="29" fontSize="14" fill="currentColor" stroke="none">$</text>
    <path d="M40 8l-6 6M40 14l-6-6" />
  </S>
);

// Peer-policy: to like rutere koblet
export const PeerPolicyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="14" height="12" rx="1.5" />
    <rect x="28" y="18" width="14" height="12" rx="1.5" />
    <path d="M20 24h8" />
    <text x="16" y="42" fontSize="8" fill="currentColor" stroke="none">free</text>
  </S>
);

// Provider-policy: ruter med $ ut
export const ProviderPolicyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="14" height="12" rx="1.5" />
    <path d="M20 24h10" />
    <text x="30" y="28" fontSize="11" fill="currentColor" stroke="none">$</text>
    <path d="M34 22l4-4M34 30l4 4" />
  </S>
);

// Gao-Rexford: hierarki kunde > peer > provider
export const GaoRexfordIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l14 24H10z" />
    <path d="M14 22h20M18 14h12" />
    <text x="18" y="36" fontSize="7" fill="currentColor" stroke="none">C&gt;P&gt;Pr</text>
  </S>
);

// ------------------------------------------------------------------
// SDN
// ------------------------------------------------------------------

// SDN: controller med pil ned
export const SdnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="12" y="6" width="24" height="10" rx="1.5" />
    <path d="M16 11h16" />
    <path d="M24 16v8M24 24l-3-3M24 24l3-3" strokeDasharray="2 2" />
    <rect x="8" y="32" width="32" height="10" rx="1.5" />
    <path d="M14 37h4M22 37h4M30 37h4" />
  </S>
);

// SDN-arkitektur: tre lag
export const SdnArchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="8" rx="1" />
    <rect x="6" y="20" width="36" height="8" rx="1" />
    <rect x="6" y="34" width="36" height="8" rx="1" />
    <path d="M24 14v6M24 28v6" strokeDasharray="1 1" />
  </S>
);

// OpenFlow: pakke fra controller til switch
export const OpenFlowIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="10" r="5" />
    <path d="M11 10h6M14 7v6" />
    <rect x="6" y="28" width="36" height="14" rx="1.5" />
    <path d="M12 33h6M22 33h6M32 33h6" />
    <path d="M14 15v8l16 5" strokeDasharray="2 2" />
    <path d="M30 28l-3-1M30 28l-1-3" />
  </S>
);

// Flow-entry: rad i tabell med match → action
export const FlowEntryIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="1.5" />
    <path d="M4 22h40M24 14v20" />
    <text x="8" y="20" fontSize="6" fill="currentColor" stroke="none">match</text>
    <text x="26" y="20" fontSize="6" fill="currentColor" stroke="none">action</text>
    <path d="M20 26l4 0M22 24l2 2-2 2" />
  </S>
);

// Match-felter: liste av felter
export const MatchFieldsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="6" width="32" height="36" rx="1.5" />
    <path d="M12 14h24M12 20h24M12 26h24M12 32h24M12 38h16" />
  </S>
);

// Action-set: gear / drop-pil
export const ActionSetIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="8" />
    <circle cx="24" cy="24" r="3" />
    <path d="M24 8v6M24 34v6M8 24h6M34 24h6M13 13l4 4M31 31l4 4M13 35l4-4M31 17l4-4" />
  </S>
);

// Proactive vs reactive: to piler
export const ProactiveReactiveIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="3" />
    <rect x="28" y="10" width="14" height="8" rx="1" />
    <path d="M13 14h15" />
    <circle cx="10" cy="34" r="3" />
    <rect x="28" y="30" width="14" height="8" rx="1" />
    <path d="M28 34H13" strokeDasharray="2 2" />
    <path d="M13 34l3-2M13 34l3 2" />
  </S>
);

// Logisk sentralisering: én abstrahert controller over flere fysiske
export const LogicalCentralIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="10" rx="14" ry="4" strokeDasharray="3 2" />
    <rect x="6" y="22" width="8" height="6" rx="1" />
    <rect x="20" y="22" width="8" height="6" rx="1" />
    <rect x="34" y="22" width="8" height="6" rx="1" />
    <path d="M10 22v-7M24 22v-7M38 22v-7" />
    <rect x="14" y="36" width="20" height="6" rx="1" />
    <path d="M10 28v8h28v-8" strokeDasharray="1 1" />
  </S>
);

// Nord/sør-bound API: kompass-aktig
export const NorthSouthApiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="4" width="20" height="8" rx="1" />
    <rect x="14" y="20" width="20" height="8" rx="1" />
    <rect x="14" y="36" width="20" height="8" rx="1" />
    <path d="M24 12v8M24 28v8" />
    <text x="2" y="26" fontSize="6" fill="currentColor" stroke="none">N</text>
    <text x="2" y="34" fontSize="6" fill="currentColor" stroke="none">S</text>
  </S>
);

// Network OS: stylized OS-vindu med nett
export const NetworkOsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="40" height="32" rx="2" />
    <path d="M4 16h40" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="13" cy="12" r="1" fill="currentColor" />
    <circle cx="17" cy="12" r="1" fill="currentColor" />
    <circle cx="16" cy="24" r="2" />
    <circle cx="32" cy="24" r="2" />
    <circle cx="24" cy="34" r="2" />
    <path d="M18 24h12M18 26l5 7M30 26l-5 7" />
  </S>
);

// Datasenter: server-stativer
export const DataCenterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="14" height="28" rx="1.5" />
    <rect x="28" y="10" width="14" height="28" rx="1.5" />
    <path d="M6 18h14M6 24h14M6 30h14M28 18h14M28 24h14M28 30h14" />
  </S>
);

// ------------------------------------------------------------------
// ICMP
// ------------------------------------------------------------------

// ICMP: konvolutt med "!"
export const IcmpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="24" rx="1.5" />
    <path d="M6 14l18 12 18-12" />
    <text x="20" y="40" fontSize="11" fill="currentColor" stroke="none">!</text>
  </S>
);

// Type + kode: liten kode-merke
export const TypeCodeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M24 14v20" />
    <text x="10" y="28" fontSize="9" fill="currentColor" stroke="none">type</text>
    <text x="27" y="28" fontSize="9" fill="currentColor" stroke="none">code</text>
  </S>
);

// Echo / Ping
export const PingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <circle cx="38" cy="24" r="3" />
    <path d="M13 22h22M35 22l-3-2M35 22l-3 2" />
    <path d="M35 26H13M13 26l3-2M13 26l3 2" />
    <text x="16" y="14" fontSize="7" fill="currentColor" stroke="none">echo</text>
  </S>
);

// Destination unreachable: ruter med X
export const DestUnreachableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="14" width="28" height="14" rx="2" />
    <path d="M16 18l4 4-4 4M28 18l-4 4 4 4" />
    <path d="M4 24h6" />
    <text x="14" y="42" fontSize="8" fill="currentColor" stroke="none">unreach</text>
  </S>
);

// Pakke for stor: stor pakke som ikke passer
export const PacketTooBigIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="22" height="12" rx="1.5" />
    <rect x="32" y="22" width="8" height="4" rx="1" />
    <path d="M28 24h2" />
    <path d="M30 22l2 2-2 2" />
  </S>
);

// Time exceeded: klokke med pil
export const TimeExceededIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="22" cy="24" r="10" />
    <path d="M22 16v8l6 4" />
    <text x="34" y="14" fontSize="9" fill="currentColor" stroke="none">0</text>
    <path d="M34 18l4 4-4 4" />
  </S>
);

// Source quench: bremset pil
export const SourceQuenchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="16" height="8" rx="1" />
    <path d="M22 24h12" />
    <path d="M30 18l4 6-4 6" />
    <path d="M36 16v16" strokeWidth="2.4" />
  </S>
);

// Redirect: pil som svinger
export const RedirectIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <path d="M13 24h12c4 0 6-3 6-6v-2" />
    <path d="M28 18l3-2 3 2" />
    <circle cx="32" cy="10" r="3" />
  </S>
);

// Router solicit / advertise
export const RouterSolicitIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="18" width="20" height="12" rx="2" />
    <circle cx="20" cy="24" r="1.4" fill="currentColor" />
    <circle cx="28" cy="24" r="1.4" fill="currentColor" />
    <path d="M14 24l-6-6M14 24l-6 6M34 24l6-6M34 24l6 6" strokeDasharray="2 2" />
  </S>
);

// Traceroute: numbererte hops
export const TracerouteIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="20" cy="24" r="3" />
    <circle cx="32" cy="24" r="3" />
    <circle cx="42" cy="24" r="2.5" />
    <path d="M11 24h6M23 24h6M35 24h4.5" />
    <text x="6" y="14" fontSize="7" fill="currentColor" stroke="none">1 2 3</text>
  </S>
);

// Rate-limiting: pil med stoppskilt
export const RateLimitIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24h22M28 24l-3-2M28 24l-3 2" />
    <circle cx="36" cy="24" r="6" />
    <path d="M31 24h10" strokeWidth="2.4" />
  </S>
);

// ICMP-sikkerhet: skjold
export const SecurityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4l16 6v12c0 10-8 18-16 22-8-4-16-12-16-22V10z" />
    <path d="M18 24l4 4 8-10" />
  </S>
);

// ------------------------------------------------------------------
// SNMP
// ------------------------------------------------------------------

// SNMP: get/trap arrows
export const SnmpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" rx="1.5" />
    <rect x="30" y="14" width="14" height="20" rx="1.5" />
    <path d="M18 20h12M30 20l-3-2M30 20l-3 2" />
    <path d="M30 28H18M18 28l3-2M18 28l3 2" />
  </S>
);

// Manager / NMS
export const NmsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="22" rx="2" />
    <path d="M6 28h36" />
    <path d="M20 32v4M28 32v4M14 36h20" />
    <path d="M10 24l5-8 5 4 5-10 5 6 5-4 5 10" />
  </S>
);

// Agent: liten daemon
export const AgentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <circle cx="20" cy="22" r="1.5" fill="currentColor" />
    <circle cx="28" cy="22" r="1.5" fill="currentColor" />
    <path d="M20 28h8" />
    <path d="M18 14v-4M30 14v-4" />
  </S>
);

// MIB: tre-hierarki
export const MibTreeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="8" r="2" />
    <circle cx="12" cy="22" r="2" />
    <circle cx="36" cy="22" r="2" />
    <circle cx="6" cy="38" r="2" />
    <circle cx="18" cy="38" r="2" />
    <circle cx="30" cy="38" r="2" />
    <circle cx="42" cy="38" r="2" />
    <path d="M24 10l-12 10M24 10l12 10M12 24l-6 12M12 24l6 12M36 24l-6 12M36 24l6 12" />
  </S>
);

// OID: dotted path
export const OidIcon = (p: IconProps) => (
  <S {...p}>
    <text x="4" y="28" fontSize="9" fill="currentColor" stroke="none">1.3.6.1.2</text>
    <circle cx="40" cy="26" r="1.5" fill="currentColor" />
    <circle cx="44" cy="26" r="1.5" fill="currentColor" />
  </S>
);

// GET/GETNEXT: lupe med pil
export const SnmpGetIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="18" cy="18" r="8" />
    <path d="M24 24l8 8" />
    <path d="M30 32l8-4M38 28l-2 6" />
  </S>
);

// SET: skiftnøkkel
export const SnmpSetIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M30 8l6 6-18 18-6-6z" />
    <circle cx="34" cy="12" r="3" />
    <path d="M14 32l-6 6M10 38l4 0" />
  </S>
);

// TRAP / INFORM: alarm-klokke
export const TrapIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 32V20a10 10 0 0120 0v12z" />
    <path d="M10 36h28" />
    <path d="M20 38c0 2 2 4 4 4s4-2 4-4" />
    <path d="M22 6h4" />
  </S>
);

// Walk: footprints
export const SnmpWalkIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 32c2-4 6-4 6 0M16 26c2-4 6-4 6 0M24 20c2-4 6-4 6 0M32 14c2-4 6-4 6 0" />
    <path d="M8 38h32" />
  </S>
);

// SNMP-versjoner: v1 v2 v3
export const SnmpVersionsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="12" height="16" rx="1.5" />
    <rect x="18" y="16" width="12" height="16" rx="1.5" />
    <rect x="32" y="16" width="12" height="16" rx="1.5" />
    <text x="7" y="28" fontSize="9" fill="currentColor" stroke="none">v1</text>
    <text x="20" y="28" fontSize="8" fill="currentColor" stroke="none">v2c</text>
    <text x="35" y="28" fontSize="9" fill="currentColor" stroke="none">v3</text>
  </S>
);

// Community-string: tekst-bobble
export const CommunityStringIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="20" rx="3" />
    <path d="M14 32l-4 6 8-6" />
    <text x="11" y="26" fontSize="8" fill="currentColor" stroke="none">public</text>
  </S>
);

// ASN.1 / BER: bytes på tråden
export const Asn1Icon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="8" height="8" rx="1" />
    <rect x="14" y="20" width="8" height="8" rx="1" />
    <rect x="24" y="20" width="8" height="8" rx="1" />
    <rect x="34" y="20" width="8" height="8" rx="1" />
    <text x="6" y="38" fontSize="6" fill="currentColor" stroke="none">30 82</text>
  </S>
);

// ------------------------------------------------------------------
// DHCP
// ------------------------------------------------------------------

// DHCP: IP-tag
export const DhcpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="10" y="29" fontSize="10" fill="currentColor" stroke="none">DHCP</text>
    <circle cx="38" cy="24" r="1.5" fill="currentColor" />
  </S>
);

// DHCP-server
export const DhcpServerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="6" width="20" height="36" rx="1.5" />
    <path d="M14 14h20M14 22h20M14 30h20" />
    <circle cx="18" cy="10" r="1" fill="currentColor" />
    <circle cx="18" cy="18" r="1" fill="currentColor" />
    <circle cx="18" cy="26" r="1" fill="currentColor" />
    <circle cx="18" cy="34" r="1" fill="currentColor" />
  </S>
);

// DORA-dans (4 piler i sirkel)
export const DoraIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" strokeDasharray="3 2" />
    <text x="6" y="14" fontSize="7" fill="currentColor" stroke="none">D</text>
    <text x="36" y="14" fontSize="7" fill="currentColor" stroke="none">O</text>
    <text x="36" y="40" fontSize="7" fill="currentColor" stroke="none">R</text>
    <text x="6" y="40" fontSize="7" fill="currentColor" stroke="none">A</text>
  </S>
);

// Discover (broadcast)
export const DiscoverIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <path d="M24 24l-12-12M24 24l12-12M24 24l-12 12M24 24l12 12" strokeDasharray="2 2" />
    <text x="10" y="44" fontSize="7" fill="currentColor" stroke="none">broadcast</text>
  </S>
);

// Offer
export const OfferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <path d="M14 24l4-6 4 4 4-6 4 4 4-2" />
    <text x="18" y="40" fontSize="7" fill="currentColor" stroke="none">offer</text>
  </S>
);

// Request
export const RequestIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="12" height="12" rx="1.5" />
    <path d="M18 24h22M40 24l-3-2M40 24l-3 2" />
    <text x="22" y="20" fontSize="7" fill="currentColor" stroke="none">REQ</text>
  </S>
);

// Ack
export const AckIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M16 24l6 6 12-14" />
  </S>
);

// Broadcast (alle får)
export const BroadcastIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 24c0-10 6-16 16-16s16 6 16 16" />
    <path d="M14 24c0-6 4-10 10-10s10 4 10 10" />
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <path d="M24 27v12" />
  </S>
);

// Lease-tid
export const LeaseTimeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M24 14v10l8 4" />
    <path d="M24 38v4M24 6v4M6 24h4M38 24h4" />
  </S>
);

// T1/T2 timer punkter
export const T1T2Icon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24h36" strokeWidth="2.4" />
    <circle cx="6" cy="24" r="2" fill="currentColor" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
    <circle cx="36" cy="24" r="2" fill="currentColor" />
    <circle cx="42" cy="24" r="2" fill="currentColor" />
    <text x="20" y="40" fontSize="7" fill="currentColor" stroke="none">T1 T2</text>
  </S>
);

// Relay-agent
export const RelayAgentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="10" height="8" rx="1" />
    <rect x="20" y="20" width="8" height="8" rx="1" />
    <rect x="34" y="20" width="10" height="8" rx="1" />
    <path d="M14 24h6M28 24h6M28 24l-3-2M28 24l-3 2M34 24l-3-2M34 24l-3 2" />
  </S>
);

// DHCP-opsjoner: liste
export const DhcpOptionsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="6" width="28" height="36" rx="1.5" />
    <path d="M14 14h20M14 20h20M14 26h20M14 32h12" />
  </S>
);

// DECLINE/RELEASE: minus / utvisning
export const DeclineReleaseIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="18" width="20" height="12" rx="1.5" />
    <path d="M28 24h12" />
    <path d="M36 20l4 4-4 4" />
    <path d="M12 22l4 4M16 22l-4 4" />
  </S>
);

// Link-local 169.254
export const LinkLocalIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="14" rx="2" />
    <text x="6" y="29" fontSize="8" fill="currentColor" stroke="none">169.254</text>
  </S>
);
