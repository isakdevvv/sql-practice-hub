import * as React from "react";

/**
 * Ikoner for KuroseKap4Page — nettverkslaget (data-plane): IP, forwarding,
 * fabrics, IPv4/v6, OpenFlow, NAT, brannmurer, load-balancere.
 *
 * Samme stil som visualDefIcons.tsx: 48×48 viewBox, currentColor stroke,
 * holdes enkle og gjenkjennelige.
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
// 4.1 Forwarding og routing
// ------------------------------------------------------------------

// Pakke som forwardes — pil gjennom ruter på nanosekunder
export const ForwardingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="14" rx="2" />
    <path d="M4 21h10M34 21h10l-3-3M44 21l-3 3" strokeWidth="2" />
    <text x="24" y="25" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      ns
    </text>
  </S>
);

// Routing — control-plane: kart og piler mellom rutere
export const RoutingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="14" r="3" />
    <circle cx="36" cy="14" r="3" />
    <circle cx="24" cy="36" r="3" />
    <path d="M15 14h18M14 17l8 17M34 17l-8 17" strokeDasharray="3 2" />
    <text x="24" y="11" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">OSPF</text>
  </S>
);

// FIB — forwarding table: rad med prefiks → port
export const FibTableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="1.5" />
    <line x1="4" y1="18" x2="44" y2="18" />
    <line x1="4" y1="26" x2="44" y2="26" />
    <line x1="4" y1="34" x2="44" y2="34" />
    <line x1="30" y1="10" x2="30" y2="38" />
    <text x="6" y="16" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">10.1/16</text>
    <text x="32" y="16" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">P1</text>
    <text x="6" y="24" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">10.2/24</text>
    <text x="32" y="24" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">P4</text>
    <text x="6" y="32" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">0/0</text>
    <text x="32" y="32" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">P2</text>
  </S>
);

// RIB — bredere bilde av topologien (graf + tabell)
export const RibTableIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="12" r="2.5" />
    <circle cx="24" cy="8" r="2.5" />
    <circle cx="38" cy="14" r="2.5" />
    <circle cx="14" cy="24" r="2.5" />
    <circle cx="34" cy="26" r="2.5" />
    <path d="M10 12l14-4M24 8l14 6M10 12l4 12M14 24l20 2M38 14l-4 12" />
    <rect x="8" y="32" width="32" height="10" rx="1" />
    <line x1="8" y1="37" x2="40" y2="37" />
    <line x1="24" y1="32" x2="24" y2="42" />
  </S>
);

// Longest Prefix Match — uthevet lengste maske
export const LpmIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="6" rx="1" />
    <rect x="6" y="18" width="36" height="6" rx="1" />
    <rect x="6" y="26" width="36" height="6" rx="1" strokeWidth="2.8" />
    <text x="8" y="14" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">/8</text>
    <text x="8" y="22" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">/16</text>
    <text x="8" y="30" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">/24 ★</text>
    <path d="M14 36h20l-3-2M34 36l-3 2" />
  </S>
);

// Switching fabric — crossbar matrise
export const FabricCrossbarIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="12" x2="42" y2="12" />
    <line x1="6" y1="22" x2="42" y2="22" />
    <line x1="6" y1="32" x2="42" y2="32" />
    <line x1="14" y1="6" x2="14" y2="42" />
    <line x1="24" y1="6" x2="24" y2="42" />
    <line x1="34" y1="6" x2="34" y2="42" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="24" cy="22" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="32" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

// ------------------------------------------------------------------
// 4.2 Inni en ruter
// ------------------------------------------------------------------

// Input-port — pakke kommer inn, slår opp i FIB
export const InputPortIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 24h8" strokeWidth="2" />
    <path d="M12 24l-2-2M12 24l-2 2" />
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <line x1="14" y1="22" x2="34" y2="22" />
    <text x="24" y="20" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">FIB</text>
    <text x="24" y="30" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">in</text>
    <line x1="34" y1="24" x2="42" y2="24" />
  </S>
);

// Output-port — kø + scheduler ut på lenken
export const OutputPortIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="24" x2="12" y2="24" />
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <rect x="17" y="18" width="3" height="4" />
    <rect x="21" y="18" width="3" height="4" />
    <rect x="25" y="18" width="3" height="4" />
    <text x="24" y="30" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">out</text>
    <path d="M34 24h8" strokeWidth="2" />
    <path d="M42 24l-2-2M42 24l-2 2" />
  </S>
);

// Switching fabric — minne (delt minne)
export const FabricMemoryIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <line x1="14" y1="20" x2="34" y2="20" />
    <line x1="14" y1="26" x2="34" y2="26" />
    <line x1="14" y1="32" x2="34" y2="32" />
    <text x="24" y="19" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">RAM</text>
    <path d="M4 24h10M34 24h10" strokeDasharray="2 2" />
  </S>
);

// Switching fabric — buss
export const FabricBusIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 24h40" strokeWidth="4" />
    <rect x="8" y="10" width="8" height="6" />
    <rect x="20" y="10" width="8" height="6" />
    <rect x="32" y="10" width="8" height="6" />
    <rect x="8" y="32" width="8" height="6" />
    <rect x="20" y="32" width="8" height="6" />
    <rect x="32" y="32" width="8" height="6" />
    <line x1="12" y1="16" x2="12" y2="24" />
    <line x1="36" y1="32" x2="36" y2="24" />
  </S>
);

// Head-of-line blocking — første i kø blokkerer resten
export const HolBlockingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="8" height="8" fill="currentColor" stroke="none" opacity="0.5" />
    <rect x="16" y="20" width="8" height="8" />
    <rect x="26" y="20" width="8" height="8" />
    <rect x="36" y="20" width="6" height="8" />
    <path d="M14 24l-2-2M14 24l-2 2M6 14l4 4M14 14l-4 4" stroke="currentColor" strokeWidth="2" />
    <line x1="6" y1="32" x2="14" y2="32" strokeWidth="2" />
  </S>
);

// Output queue loss — pakker faller ut når kø er full
export const OutputLossIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="24" height="20" />
    <line x1="6" y1="20" x2="30" y2="20" />
    <line x1="6" y1="26" x2="30" y2="26" />
    <line x1="6" y1="32" x2="30" y2="32" />
    <rect x="34" y="10" width="6" height="6" />
    <path d="M34 10l6 6M40 10l-6 6" strokeWidth="1.5" />
    <path d="M30 24h12" />
  </S>
);

// Routing-prosessor — CPU + control-plane
export const RoutingProcessorIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="12" y="12" width="24" height="24" rx="2" />
    <rect x="18" y="18" width="12" height="12" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">CPU</text>
    <line x1="14" y1="8" x2="14" y2="12" />
    <line x1="24" y1="8" x2="24" y2="12" />
    <line x1="34" y1="8" x2="34" y2="12" />
    <line x1="14" y1="36" x2="14" y2="40" />
    <line x1="24" y1="36" x2="24" y2="40" />
    <line x1="34" y1="36" x2="34" y2="40" />
    <line x1="8" y1="18" x2="12" y2="18" />
    <line x1="8" y1="28" x2="12" y2="28" />
    <line x1="36" y1="18" x2="40" y2="18" />
    <line x1="36" y1="28" x2="40" y2="28" />
  </S>
);

// ------------------------------------------------------------------
// 4.3 IPv4 / IPv6
// ------------------------------------------------------------------

// IPv4-header — rektangel med felter
export const Ipv4HeaderIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="40" height="32" rx="1" />
    <line x1="4" y1="14" x2="44" y2="14" />
    <line x1="4" y1="20" x2="44" y2="20" />
    <line x1="4" y1="26" x2="44" y2="26" />
    <line x1="4" y1="32" x2="44" y2="32" />
    <line x1="16" y1="8" x2="16" y2="14" />
    <line x1="28" y1="8" x2="28" y2="14" />
    <line x1="20" y1="14" x2="20" y2="20" />
    <line x1="32" y1="14" x2="32" y2="20" />
    <text x="6" y="13" fontSize="3.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">V</text>
    <text x="18" y="13" fontSize="3.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">IHL</text>
    <text x="30" y="13" fontSize="3.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">TOS</text>
    <text x="14" y="31" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SRC IP</text>
    <text x="14" y="38" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">DST IP</text>
  </S>
);

// TTL — teller som dekrementeres
export const TtlIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">TTL</text>
    <text x="24" y="30" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">−1</text>
  </S>
);

// MTU — ramme-størrelse med mål
export const MtuIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="10" />
    <line x1="6" y1="34" x2="42" y2="34" />
    <line x1="6" y1="32" x2="6" y2="36" />
    <line x1="42" y1="32" x2="42" y2="36" />
    <text x="24" y="40" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">1500 B</text>
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">MTU</text>
  </S>
);

// Fragmentering — én pakke deles i mindre biter
export const FragmentationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="8" />
    <text x="24" y="16" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">stor</text>
    <path d="M24 20l-12 6M24 20v6M24 20l12 6" />
    <rect x="4" y="28" width="12" height="8" />
    <rect x="18" y="28" width="12" height="8" />
    <rect x="32" y="28" width="12" height="8" />
  </S>
);

// Path MTU Discovery — ICMP-tilbakemelding
export const PathMtuIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <rect x="20" y="20" width="8" height="8" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24h9M28 24h9" strokeWidth="2" />
    <path d="M37 24l-2-2M37 24l-2 2" />
    <path d="M24 18l-12-8" strokeDasharray="2 2" />
    <text x="14" y="10" fontSize="4.5" stroke="none" fill="currentColor">ICMP</text>
  </S>
);

// IPv6-header — fast 40 bytes, enklere
export const Ipv6HeaderIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="1" />
    <line x1="4" y1="18" x2="44" y2="18" />
    <line x1="4" y1="24" x2="44" y2="24" />
    <line x1="4" y1="32" x2="44" y2="32" />
    <text x="24" y="16" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">V6 / TC / FLOW</text>
    <text x="24" y="22" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">LEN / NXT / HL</text>
    <text x="24" y="30" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SRC 128b</text>
    <text x="24" y="36.5" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">DST 128b</text>
  </S>
);

// IPv6 vs IPv4 — felter strøket
export const Ipv6VsIpv4Icon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="18" height="28" rx="1" />
    <text x="13" y="16" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">IPv4</text>
    <line x1="6" y1="20" x2="20" y2="20" />
    <line x1="6" y1="26" x2="20" y2="26" />
    <line x1="6" y1="32" x2="20" y2="32" />
    <text x="13" y="24" textAnchor="middle" fontSize="3.5" stroke="none" fill="currentColor">chk</text>
    <text x="13" y="30" textAnchor="middle" fontSize="3.5" stroke="none" fill="currentColor">frag</text>
    <path d="M6 23h14M6 29h14" strokeWidth="1.4" />
    <rect x="26" y="10" width="18" height="28" rx="1" strokeWidth="2.2" />
    <text x="35" y="16" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">IPv6</text>
    <line x1="28" y1="20" x2="42" y2="20" />
    <line x1="28" y1="26" x2="42" y2="26" />
    <line x1="28" y1="32" x2="42" y2="32" />
  </S>
);

// 32 vs 128 bits — linjal
export const AddressRulerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="6" />
    <text x="11" y="19" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">32b</text>
    <rect x="4" y="26" width="40" height="6" />
    <text x="24" y="31" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">128b</text>
    <line x1="4" y1="38" x2="44" y2="38" />
    <line x1="4" y1="36" x2="4" y2="40" />
    <line x1="44" y1="36" x2="44" y2="40" />
  </S>
);

// Dual-stack — to lag av IP
export const DualStackIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="28" height="10" />
    <text x="24" y="17" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">IPv6</text>
    <rect x="10" y="22" width="28" height="10" />
    <text x="24" y="29" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">IPv4</text>
    <rect x="10" y="34" width="28" height="6" />
    <text x="24" y="38.5" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">link</text>
  </S>
);

// ------------------------------------------------------------------
// 4.4 Generalisert forwarding — SDN, OpenFlow
// ------------------------------------------------------------------

// SDN — kontroller over flere switcher
export const SdnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="6" width="12" height="8" rx="1" />
    <text x="24" y="12" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">CTRL</text>
    <path d="M24 14l-12 14M24 14v14M24 14l12 14" strokeDasharray="2 2" />
    <rect x="6" y="30" width="12" height="6" />
    <rect x="18" y="30" width="12" height="6" />
    <rect x="30" y="30" width="12" height="6" />
  </S>
);

// OpenFlow — kontroller-pil til flow-table
export const OpenFlowIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="16" y="6" width="16" height="8" rx="1" />
    <text x="24" y="12" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">CTRL</text>
    <path d="M24 14v8" strokeDasharray="2 2" />
    <path d="M24 22l-2-2M24 22l2-2" />
    <rect x="6" y="24" width="36" height="18" rx="1" />
    <line x1="6" y1="30" x2="42" y2="30" />
    <line x1="6" y1="36" x2="42" y2="36" />
    <line x1="22" y1="24" x2="22" y2="42" />
    <text x="14" y="29" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">match</text>
    <text x="32" y="29" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">act</text>
  </S>
);

// Match-Action-tabell — match-mønster + action
export const MatchActionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="12" width="40" height="24" rx="1" />
    <line x1="4" y1="20" x2="44" y2="20" />
    <line x1="4" y1="28" x2="44" y2="28" />
    <line x1="22" y1="12" x2="22" y2="36" />
    <line x1="34" y1="12" x2="34" y2="36" />
    <text x="5" y="18" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">match</text>
    <text x="23" y="18" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">action</text>
    <text x="35" y="18" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">pri</text>
    <text x="6" y="26" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">ip=10/8</text>
    <text x="24" y="26" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">fwd 2</text>
    <text x="36" y="26" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">5</text>
  </S>
);

// Flow — strøm av pakker som matcher samme regel
export const FlowIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 16c10-6 22 12 36 0" strokeWidth="2" />
    <path d="M6 24c10-6 22 12 36 0" strokeWidth="2" />
    <path d="M6 32c10-6 22 12 36 0" strokeWidth="2" />
    <circle cx="10" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="22" cy="20" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="34" cy="20.5" r="1.2" fill="currentColor" stroke="none" />
  </S>
);

// Actions — forward, drop, rewrite (sett av symboler)
export const ActionsIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 12h10l-2-2M16 12l-2 2" strokeWidth="1.8" />
    <text x="20" y="14" fontSize="5" stroke="none" fill="currentColor">fwd</text>
    <rect x="6" y="20" width="10" height="6" />
    <path d="M6 20l10 6M16 20l-10 6" />
    <text x="20" y="25" fontSize="5" stroke="none" fill="currentColor">drop</text>
    <path d="M6 36c2-3 6 3 8 0s6 3 8 0" />
    <text x="26" y="37" fontSize="5" stroke="none" fill="currentColor">rewrite</text>
  </S>
);

// Pipeline — flere tabeller i serie
export const PipelineIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="10" height="12" />
    <rect x="19" y="18" width="10" height="12" />
    <rect x="34" y="18" width="10" height="12" />
    <path d="M14 24h5M29 24h5" strokeWidth="2" />
    <path d="M19 24l-2-2M19 24l-2 2" />
    <path d="M34 24l-2-2M34 24l-2 2" />
    <text x="9" y="26" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">T0</text>
    <text x="24" y="26" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">T1</text>
    <text x="39" y="26" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">T2</text>
  </S>
);

// Northbound API — apper over kontrolleren
export const NorthboundIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="10" height="6" />
    <rect x="19" y="6" width="10" height="6" />
    <rect x="32" y="6" width="10" height="6" />
    <path d="M24 14v6" strokeDasharray="2 2" />
    <path d="M24 20l-2-2M24 20l2-2" />
    <rect x="10" y="22" width="28" height="10" rx="1" />
    <text x="24" y="29" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">CTRL</text>
    <text x="24" y="40" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">north ↑</text>
  </S>
);

// Southbound API — kontroller ned til switcher
export const SouthboundIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="6" width="28" height="10" rx="1" />
    <text x="24" y="13" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">CTRL</text>
    <path d="M24 16v6" strokeDasharray="2 2" />
    <path d="M24 22l-2-2M24 22l2-2" />
    <rect x="6" y="26" width="10" height="6" />
    <rect x="19" y="26" width="10" height="6" />
    <rect x="32" y="26" width="10" height="6" />
    <text x="24" y="40" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">south ↓</text>
  </S>
);

// ------------------------------------------------------------------
// 4.5 Middlebokser
// ------------------------------------------------------------------

// NAT — adresseoversetting med piler
export const NatIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="2" />
    <text x="24" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">NAT</text>
    <path d="M4 20h10M14 20l-2-2M14 20l-2 2" strokeWidth="1.6" />
    <text x="6" y="16" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">10.x</text>
    <path d="M34 28h10M44 28l-2-2M44 28l-2 2" strokeWidth="1.6" />
    <text x="34" y="38" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">pub IP</text>
  </S>
);

// NAT-traversal — STUN/hole punching, pakke prøver å bryte gjennom
export const NatTraversalIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="6" x2="24" y2="42" strokeWidth="2.5" strokeDasharray="3 2" />
    <rect x="4" y="20" width="8" height="6" />
    <rect x="36" y="20" width="8" height="6" />
    <path d="M12 23h10" />
    <path d="M22 23l-2-2M22 23l-2 2" />
    <path d="M26 23h10" />
    <path d="M36 23l-2-2M36 23l-2 2" />
    <text x="24" y="40" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">STUN</text>
  </S>
);

// NAT-typer — kjegle-form
export const NatTypesIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="3" />
    <path d="M17 24l24-12" />
    <path d="M17 24l24 12" />
    <path d="M17 24h24" />
    <circle cx="40" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="40" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="40" cy="36" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

// Stateful brannmur — vegg med sesjons-tabell
export const StatefulFirewallIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 8v32M14 8v32M20 8v32M26 8v32M32 8v32M38 8v32" />
    <rect x="4" y="14" width="40" height="6" />
    <rect x="4" y="28" width="40" height="6" />
    <text x="24" y="19" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">SYN</text>
    <text x="24" y="33" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">EST</text>
  </S>
);

// ACL — liste av regler
export const AclIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="1" />
    <line x1="6" y1="16" x2="42" y2="16" />
    <line x1="6" y1="24" x2="42" y2="24" />
    <line x1="6" y1="32" x2="42" y2="32" />
    <text x="9" y="14" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">allow 80</text>
    <text x="9" y="22" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">deny 23</text>
    <text x="9" y="30" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">allow 443</text>
    <text x="9" y="38" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">deny *</text>
  </S>
);

// Load-balancer — én VIP til mange servere
export const LoadBalancerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="6" width="12" height="8" rx="1" />
    <text x="24" y="12" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">VIP</text>
    <path d="M24 14l-14 16M24 14v16M24 14l14 16" />
    <rect x="4" y="30" width="12" height="10" />
    <rect x="18" y="30" width="12" height="10" />
    <rect x="32" y="30" width="12" height="10" />
  </S>
);

// DPI — øye som leser dypt i pakken
export const DpiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" />
    <line x1="14" y1="18" x2="14" y2="30" />
    <text x="9" y="26" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">H</text>
    <text x="29" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">payload</text>
    <circle cx="36" cy="36" r="4" />
    <circle cx="36" cy="36" r="1" fill="currentColor" stroke="none" />
    <path d="M39 39l4 4" />
  </S>
);

// Proxy / application-gateway — to halver av tilkobling
export const ProxyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <rect x="18" y="18" width="12" height="12" rx="1" />
    <text x="24" y="27" textAnchor="middle" fontSize="4.5" stroke="none" fill="currentColor">PROXY</text>
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24h7" strokeWidth="2" />
    <path d="M30 24h7" strokeWidth="2" />
    <path d="M18 24l-2-2M18 24l-2 2" />
    <path d="M37 24l-2-2M37 24l-2 2" />
  </S>
);
