import * as React from "react";

/**
 * Kap. 7-spesifikke ikoner: trådløst & mobilt — WiFi-vifte, AP, CSMA/CA,
 * RTS/CTS, hidden terminal, cellulær tårn, håndover, mobile IP, TCP+wireless.
 * 48x48 viewBox; bruker currentColor.
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

// ============================================================
// 7.1 — Radio-karakteristikker
// ============================================================

// Path loss — bølge som svekker over avstand
export const PathLossIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="36" r="2" fill="currentColor" stroke="none" />
    <path d="M12 30c4-2 4-2 6 0M20 26c4-3 4-3 6 0M28 22c4-4 4-4 6 0" />
    <line x1="6" y1="42" x2="42" y2="42" />
    <text x="40" y="40" textAnchor="end" fontSize="6" stroke="none" fill="currentColor">d</text>
  </S>
);

// Multipath — direkte + reflektert bølge
export const MultipathIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="2" fill="currentColor" stroke="none" />
    <circle cx="40" cy="24" r="2" fill="currentColor" stroke="none" />
    <path d="M10 24h28" strokeDasharray="2 2" />
    <path d="M10 24c6-14 22-14 28 0" />
    <path d="M10 24c4 12 24 12 28 0" />
  </S>
);

// SNR — signal-til-støy ratio
export const SnrIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38l4-12 4 8 4-18 4 14 4-6 4 10" />
    <line x1="6" y1="42" x2="42" y2="42" />
    <text x="34" y="14" fontSize="6" stroke="none" fill="currentColor">dB</text>
  </S>
);

// Interferens — to bølger som krasjer
export const InterferenceIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 18q4-6 8 0t8 0t8 0t8 0t6 0" />
    <path d="M6 34q3 4 6 0t6 0t6 0t6 0t6 0t6 0" />
    <path d="M22 8l8 32M30 8l-8 32" strokeWidth="1.2" />
  </S>
);

// Hidden terminal — 3 noder, vegg i midten
export const HiddenTerminalIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" fill="currentColor" stroke="none" />
    <circle cx="24" cy="10" r="3" fill="currentColor" stroke="none" />
    <circle cx="40" cy="24" r="3" fill="currentColor" stroke="none" />
    <line x1="11" y1="22" x2="22" y2="12" />
    <line x1="37" y1="22" x2="26" y2="12" />
    <path d="M14 32h20" strokeDasharray="2 2" />
    <rect x="22" y="34" width="4" height="10" fill="currentColor" stroke="none" />
    <text x="24" y="46" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">vegg</text>
  </S>
);

// Exposed terminal — node med kryss
export const ExposedTerminalIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="4" fill="currentColor" stroke="none" />
    <circle cx="34" cy="24" r="4" fill="currentColor" stroke="none" />
    <path d="M18 24h12" />
    <path d="M10 14l-4-4M10 34l-4 4M38 14l4-4M38 34l4 4" strokeWidth="1.2" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">✕</text>
  </S>
);

// Half-duplex — pil med stoppskilt
export const HalfDuplexIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 18h24l-4-3M8 18l4 3" />
    <path d="M40 30H16l4 3M40 30l-4-3" />
    <circle cx="40" cy="18" r="4" />
    <line x1="37" y1="18" x2="43" y2="18" />
  </S>
);

// Shadow fading — bygning som blokkerer
export const ShadowFadingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="2" fill="currentColor" stroke="none" />
    <circle cx="40" cy="24" r="2" fill="currentColor" stroke="none" />
    <rect x="20" y="14" width="8" height="20" />
    <path d="M10 24h8M30 24h8" strokeDasharray="2 2" />
  </S>
);

// Co-channel — to AP-er på samme farge
export const CoChannelIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="14" height="8" rx="1" />
    <rect x="28" y="20" width="14" height="8" rx="1" />
    <text x="13" y="14" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">f1</text>
    <text x="35" y="14" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">f1</text>
    <path d="M20 24h8" strokeDasharray="2 1" />
    <path d="M22 36l4-4M22 32l4 4" strokeWidth="1.2" />
  </S>
);

// Adjacent channel — overlappende bånd
export const AdjacentChannelIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 30q4-18 10 0" />
    <path d="M14 30q4-18 10 0" />
    <path d="M22 30q4-18 10 0" />
    <line x1="4" y1="34" x2="44" y2="34" />
  </S>
);

// FSPL — formel-boks
export const FsplIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      20·log d
    </text>
  </S>
);

// Modulasjon — konstellasjons-punkter
export const ModulationIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="6" x2="24" y2="42" strokeWidth="1" />
    <line x1="6" y1="24" x2="42" y2="24" strokeWidth="1" />
    <circle cx="14" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="14" cy="34" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="34" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="29" cy="19" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="29" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="29" cy="29" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

// Antenne-gain — antenne med stråle-vifte
export const AntennaGainIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="8" x2="24" y2="30" />
    <path d="M20 12l4-4 4 4" />
    <rect x="18" y="30" width="12" height="10" />
    <path d="M24 8c-10 0-14 6-14 12M24 8c10 0 14 6 14 12" strokeDasharray="2 2" />
  </S>
);

// ============================================================
// 7.2 — WiFi 802.11
// ============================================================

// CSMA/CA — lytt-vent-send
export const CsmaCaIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <path d="M6 24c-2-4-2-8 0-12M14 24c2-4 2-8 0-12" strokeWidth="1.2" />
    <path d="M18 24h14l-3-3M18 24l3 3" />
    <rect x="34" y="18" width="10" height="12" rx="1" />
  </S>
);

// DIFS — pause-symbol
export const DifsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="6" height="20" />
    <rect x="28" y="14" width="6" height="20" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">DIFS</text>
  </S>
);

// SIFS — kortere pause
export const SifsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="18" width="4" height="14" />
    <rect x="26" y="18" width="4" height="14" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">SIFS</text>
  </S>
);

// Backoff / CW — terning + telle-ned
export const BackoffIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="20" height="20" rx="2" />
    <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="24" cy="20" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="20" cy="24" r="1.2" fill="currentColor" stroke="none" />
    <path d="M32 22h8l-3-3M32 22l3 3" />
    <text x="42" y="36" textAnchor="end" fontSize="6" stroke="none" fill="currentColor">CW</text>
  </S>
);

// RTS/CTS — handshake-piler
export const RtsCtsIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="14" r="3" fill="currentColor" stroke="none" />
    <circle cx="40" cy="14" r="3" fill="currentColor" stroke="none" />
    <path d="M11 14h24l-3-2M11 14l3 2" />
    <text x="24" y="11" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">RTS</text>
    <path d="M37 30H13l3-2M37 30l-3 2" />
    <text x="24" y="40" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">CTS</text>
  </S>
);

// Beacon — kringkasting fra AP
export const BeaconIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="22" width="12" height="10" rx="1" />
    <line x1="24" y1="22" x2="24" y2="14" />
    <circle cx="24" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M14 12q10-10 20 0" />
    <path d="M10 14q14-14 28 0" />
  </S>
);

// Assosiasjon — laptop-kobling
export const AssociationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="14" height="10" rx="1" />
    <rect x="28" y="20" width="14" height="10" rx="1" />
    <path d="M20 25h8" strokeDasharray="2 1" />
    <circle cx="24" cy="25" r="1.5" fill="currentColor" stroke="none" />
    <path d="M24 18v-4M22 14l2-2 2 2" />
  </S>
);

// Autentisering — nøkkel
export const AuthIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="16" cy="24" r="6" />
    <line x1="22" y1="24" x2="40" y2="24" />
    <line x1="34" y1="24" x2="34" y2="30" />
    <line x1="40" y1="24" x2="40" y2="30" />
  </S>
);

// NAV — virtuell timer
export const NavTimerIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M24 14v10l7 4" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">NAV</text>
  </S>
);

// Slot-tid — tids-rute
export const SlotTimeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="6" height="8" />
    <rect x="14" y="20" width="6" height="8" />
    <rect x="22" y="20" width="6" height="8" />
    <rect x="30" y="20" width="6" height="8" />
    <rect x="38" y="20" width="6" height="8" />
    <line x1="4" y1="34" x2="44" y2="34" />
  </S>
);

// 802.11 generations — tre nivåer
export const Wifi80211Icon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 32q16-16 32 0" />
    <path d="M14 36q10-10 20 0" />
    <path d="M20 40q4-4 8 0" />
    <circle cx="24" cy="42" r="1.5" fill="currentColor" stroke="none" />
    <text x="24" y="14" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">a/b/g/n/ax</text>
  </S>
);

// Eksponentiell backoff — søyler dobles
export const ExpBackoffIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="32" width="6" height="6" />
    <rect x="14" y="26" width="6" height="12" />
    <rect x="22" y="14" width="6" height="24" />
    <line x1="4" y1="40" x2="44" y2="40" />
    <text x="42" y="14" textAnchor="end" fontSize="6" stroke="none" fill="currentColor">2×</text>
  </S>
);

// MU-MIMO — flere stråler
export const MuMimoIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="6" width="8" height="8" />
    <path d="M24 14l-12 28" />
    <path d="M24 14l-2 28" />
    <path d="M24 14l8 28" />
    <circle cx="12" cy="42" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="22" cy="42" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="32" cy="42" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

// ============================================================
// 7.3 — Cellular
// ============================================================

// Celle — sekskant
export const CelleIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l16 9v18l-16 9-16-9V15z" />
    <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
  </S>
);

// Basestasjon — tårn
export const BaseStationIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M16 42l8-30 8 30" />
    <line x1="20" y1="28" x2="28" y2="28" />
    <line x1="18" y1="34" x2="30" y2="34" />
    <path d="M18 12q6-8 12 0" />
    <path d="M14 8q10-10 20 0" />
  </S>
);

// Kjernenett — sky med ruter
export const CoreNetIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M12 30c-4 0-6-3-6-6s2-6 6-6c0-4 4-6 8-6s6 2 7 5c4-1 9 2 9 7 0 3-2 6-6 6z" />
    <rect x="18" y="32" width="12" height="6" rx="1" />
    <circle cx="22" cy="35" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="26" cy="35" r="0.8" fill="currentColor" stroke="none" />
  </S>
);

// 2G GSM — gammel telefon
export const Gsm2GIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="8" width="20" height="32" rx="2" />
    <rect x="17" y="12" width="14" height="10" />
    <circle cx="20" cy="28" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="24" cy="28" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="28" cy="28" r="1.5" fill="currentColor" stroke="none" />
    <text x="24" y="46" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">2G</text>
  </S>
);

// 4G LTE — signal-søyler
export const Lte4GIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="32" width="6" height="8" />
    <rect x="18" y="24" width="6" height="16" />
    <rect x="28" y="16" width="6" height="24" />
    <rect x="38" y="8" width="6" height="32" />
    <text x="24" y="46" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">4G</text>
  </S>
);

// 5G — signal med slice-bånd
export const FiveGIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 36q16-24 32 0" />
    <path d="M14 38q10-16 20 0" />
    <path d="M20 40q4-8 8 0" />
    <text x="24" y="20" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">5G</text>
  </S>
);

// Frequency reuse — fargede celler
export const FreqReuseIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 12l8 4v8l-8 4-8-4v-8z" />
    <text x="14" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">f1</text>
    <path d="M34 12l8 4v8l-8 4-8-4v-8z" />
    <text x="34" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">f1</text>
    <path d="M24 30l8 4v8l-8 4-8-4v-8z" />
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">f2</text>
  </S>
);

// NodeB-familie — sender med generasjons-merke
export const NodeBIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="22" rx="1" />
    <line x1="24" y1="14" x2="24" y2="8" />
    <circle cx="24" cy="8" r="2" />
    <text x="24" y="29" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">eNB</text>
  </S>
);

// HSS / UDM — database med nøkkel
export const HssIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="12" rx="14" ry="4" />
    <path d="M10 12v20q0 4 14 4t14-4V12" />
    <path d="M10 22q0 4 14 4t14-4" />
    <circle cx="20" cy="36" r="2" />
    <line x1="22" y1="36" x2="30" y2="36" />
  </S>
);

// MME / AMF — kart-stift
export const MmeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="22" rx="2" />
    <path d="M14 16l4 4 6-6 6 8 4-4" />
    <circle cx="24" cy="36" r="2" fill="currentColor" stroke="none" />
    <path d="M24 38l-3 6h6z" />
  </S>
);

// S-GW/P-GW/UPF — gateway-boks med IP
export const GatewayIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="32" height="20" rx="2" />
    <line x1="4" y1="24" x2="8" y2="24" />
    <line x1="40" y1="24" x2="44" y2="24" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">GW</text>
  </S>
);

// OFDMA — kanal-rutenett
export const OfdmaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" />
    <line x1="14" y1="14" x2="14" y2="34" />
    <line x1="22" y1="14" x2="22" y2="34" />
    <line x1="30" y1="14" x2="30" y2="34" />
    <line x1="38" y1="14" x2="38" y2="34" />
    <line x1="6" y1="24" x2="42" y2="24" />
  </S>
);

// SIM — SIM-kort
export const SimCardIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 10h16l8 8v22a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" />
    <rect x="18" y="22" width="12" height="10" rx="1" />
    <line x1="22" y1="22" x2="22" y2="32" />
    <line x1="26" y1="22" x2="26" y2="32" />
    <line x1="18" y1="27" x2="30" y2="27" />
  </S>
);

// ============================================================
// 7.4 — Mobilitet
// ============================================================

// Home network — hus
export const HomeNetIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 24l16-14 16 14" />
    <path d="M12 22v18h24V22" />
    <rect x="20" y="28" width="8" height="12" />
  </S>
);

// Home agent — hus + agent-skjerm
export const HomeAgentIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 22l16-14 16 14" />
    <path d="M12 20v20h24V20" />
    <rect x="18" y="26" width="12" height="10" rx="1" />
    <text x="24" y="33" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">HA</text>
  </S>
);

// Foreign network — koffert/utenlandsk hus
export const ForeignAgentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="18" width="28" height="20" rx="2" />
    <path d="M18 18v-4h12v4" />
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">FA</text>
  </S>
);

// Care-of-address — hotellrom-nøkkel
export const CoaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="14" width="20" height="20" rx="1" />
    <text x="20" y="28" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">312</text>
    <circle cx="36" cy="34" r="3" />
    <path d="M36 31v-6M33 23h6" />
  </S>
);

// Tunneling — pakke-inni-pakke
export const TunnelingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="3" />
    <rect x="12" y="20" width="24" height="8" rx="1" />
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">data</text>
  </S>
);

// Triangle routing — trekant-pil
export const TriangleRoutingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="38" r="2" fill="currentColor" stroke="none" />
    <circle cx="24" cy="10" r="2" fill="currentColor" stroke="none" />
    <circle cx="40" cy="38" r="2" fill="currentColor" stroke="none" />
    <path d="M10 36l12-22" />
    <path d="M26 12l12 24l-3-1M38 36l-1-3" />
    <path d="M10 38h28" strokeDasharray="2 2" />
  </S>
);

// GTP tunnel — rør-segmenter
export const GtpTunnelIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="10" cy="24" rx="4" ry="8" />
    <ellipse cx="38" cy="24" rx="4" ry="8" />
    <line x1="10" y1="16" x2="38" y2="16" />
    <line x1="10" y1="32" x2="38" y2="32" />
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">GTP</text>
  </S>
);

// Correspondent — server som snakker
export const CorrespondentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="10" width="20" height="24" rx="1" />
    <line x1="18" y1="16" x2="30" y2="16" />
    <line x1="18" y1="20" x2="30" y2="20" />
    <line x1="18" y1="24" x2="30" y2="24" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">CN</text>
  </S>
);

// Registrering — sjekkliste
export const RegistrationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="8" width="28" height="32" rx="2" />
    <path d="M14 16l3 3 5-5M14 24l3 3 5-5M14 32l3 3 5-5" />
    <line x1="26" y1="18" x2="34" y2="18" />
    <line x1="26" y1="26" x2="34" y2="26" />
    <line x1="26" y1="34" x2="34" y2="34" />
  </S>
);

// Co-located COA — host m/egen adresse
export const ColocatedCoaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="14" width="20" height="14" rx="1" />
    <path d="M6 32h28l-2 4H8z" />
    <text x="20" y="24" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">IP</text>
    <circle cx="38" cy="36" r="4" />
    <text x="38" y="38" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">+</text>
  </S>
);

// Reverse tunnel — pil bakover
export const ReverseTunnelIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="6" />
    <path d="M36 24H10l4-3M10 24l4 3" />
  </S>
);

// Soft-state — timer m/utløp
export const SoftStateIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" strokeDasharray="3 2" />
    <path d="M24 14v10l6 4" />
  </S>
);

// Encapsulation overhead — pakke m/ekstra header
export const EncapOverheadIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="1" />
    <rect x="4" y="18" width="10" height="12" fill="currentColor" stroke="none" />
    <rect x="14" y="18" width="6" height="12" />
    <text x="34" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">+20B</text>
  </S>
);

// ============================================================
// 7.5 — Håndover
// ============================================================

// Hard handover — bil m/bytte-pil mellom celler
export const HardHandoverIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="24" r="8" />
    <circle cx="36" cy="24" r="8" />
    <path d="M18 24h12l-3-3M18 24l3 3" />
    <rect x="22" y="32" width="4" height="8" fill="currentColor" stroke="none" />
  </S>
);

// Soft handover — overlappende sirkler
export const SoftHandoverIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="18" cy="24" r="10" />
    <circle cx="30" cy="24" r="10" />
    <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
  </S>
);

// Måle-rapport — målestokk + pil opp
export const MeasureReportIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 38l8-8 6 6 10-14 8 10" />
    <line x1="6" y1="42" x2="42" y2="42" />
    <path d="M38 18v-6l-2 2M38 12l2 2" />
  </S>
);

// Frekvens-bytte — to bølger over hverandre
export const FreqSwitchIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 18q4-6 8 0t8 0t8 0t8 0t6 0" />
    <path d="M6 32q3-4 6 0t6 0t6 0t6 0t6 0t6 0" />
    <path d="M22 24h4l-1-2M26 24l-1 2" />
  </S>
);

// WiFi roaming — laptop som flytter
export const WifiRoamingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="12" height="8" rx="1" />
    <path d="M18 24h12" strokeDasharray="2 2" />
    <rect x="30" y="20" width="12" height="8" rx="1" />
    <path d="M12 18q-2-4 0-8M36 18q-2-4 0-8" />
  </S>
);

// Kontekst-overføring — boks som flyttes
export const ContextTransferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="12" height="12" />
    <rect x="32" y="18" width="12" height="12" />
    <path d="M16 24h16l-3-3M16 24l3 3" />
    <text x="10" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">ctx</text>
  </S>
);

// RSRP/RSRQ — bølge + søyle
export const RsrpIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 30q16-20 32 0" />
    <path d="M14 32q10-12 20 0" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">dBm</text>
  </S>
);

// TTT — timer m/terskel
export const TttIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="12" />
    <path d="M24 16v8l5 3" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">TTT</text>
  </S>
);

// Mobile- vs network-controlled — hånd vs sky
export const ControlMobileNetIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="12" height="14" rx="1" />
    <circle cx="12" cy="38" r="1.5" fill="currentColor" stroke="none" />
    <path d="M22 24c-2-4 2-8 6-6 0-4 6-4 8 0 4-1 7 2 6 6h-20z" />
    <path d="M22 24h20" />
  </S>
);

// X2/Xn-grensesnitt — to BS med rør
export const X2InterfaceIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 36l6-22 6 22" />
    <path d="M26 36l6-22 6 22" />
    <path d="M14 20q10-6 20 0" />
    <text x="24" y="14" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">X2</text>
  </S>
);

// Conditional handover — forhåndsforberedt
export const ChoIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="1" />
    <rect x="28" y="14" width="14" height="20" rx="1" />
    <path d="M20 24h8" strokeDasharray="1 1" />
    <text x="24" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">CHO</text>
    <path d="M13 12l-2-4M13 12l2-4M35 12l-2-4M35 12l2-4" />
  </S>
);

// Ping-pong — frem-tilbake-piler
export const PingPongIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <path d="M14 20h20l-3-2M14 20l3-2" />
    <path d="M34 28H14l3 2M34 28l-3 2" />
  </S>
);

// 802.11r — rask roam-merke
export const FastRoamIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M20 6l-8 22h10l-4 14 18-24h-12l6-12z" />
    <text x="40" y="44" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">11r</text>
  </S>
);

// ============================================================
// 7.6 — TCP & wireless
// ============================================================

// Bit-feil vs pakketap — bit-strøm m/feil
export const BitErrorIcon = (p: IconProps) => (
  <S {...p}>
    <text x="6" y="22" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">10110</text>
    <text x="6" y="34" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">10</text>
    <text x="20" y="34" fontSize="7" stroke="none" fill="currentColor" fontWeight="bold">X</text>
    <text x="26" y="34" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">10</text>
  </S>
);

// Link-layer ARQ — retransmit-pil i sløyfe
export const LinkArqIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="1" />
    <path d="M14 18v-4h20v4" />
    <path d="M14 30v4h20v-4" />
    <path d="M38 14q4 4 0 8M10 34q-4-4 0-8" strokeWidth="1.2" />
  </S>
);

// Spurious timeout — klokke m/utropstegn
export const SpuriousTimeoutIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="20" cy="24" r="12" />
    <path d="M20 16v8l5 3" />
    <text x="38" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" stroke="none" fill="currentColor">!</text>
  </S>
);

// PEP — proxy i midten
export const PepIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <rect x="18" y="18" width="12" height="12" rx="1" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24h7M30 24h7" />
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">PEP</text>
  </S>
);

// CUBIC vs BBR — to kurver
export const CubicBbrIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38c4-8 6-8 8 0 4-12 6-12 8 0 4-16 6-16 8 0" />
    <line x1="6" y1="14" x2="42" y2="14" strokeDasharray="2 2" />
    <line x1="4" y1="42" x2="44" y2="42" />
  </S>
);

// Mobilitets-jitter — sagtann-RTT
export const JitterMobIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 30l4-8 4 8 4-12 4 12 4-6 4 6 4-10 4 10" />
    <line x1="4" y1="38" x2="44" y2="38" />
  </S>
);

// Bufferbloat — oppblåst kø
export const BufferbloatIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="1" />
    <rect x="8" y="16" width="6" height="16" fill="currentColor" stroke="none" />
    <rect x="16" y="16" width="6" height="16" fill="currentColor" stroke="none" />
    <rect x="24" y="16" width="6" height="16" fill="currentColor" stroke="none" />
    <rect x="32" y="16" width="6" height="16" fill="currentColor" stroke="none" />
  </S>
);

// Snoop — basestasjon cacher
export const SnoopIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 38l6-20 6 20" />
    <rect x="28" y="22" width="14" height="10" rx="1" />
    <path d="M30 27h10M30 30h6" />
    <circle cx="35" cy="14" r="3" />
    <line x1="33" y1="14" x2="37" y2="14" />
  </S>
);

// Split-TCP — kuttet linje
export const SplitTcpIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24h10" />
    <path d="M27 24h10" />
    <path d="M21 18l6 12M21 30l6-12" strokeWidth="1" />
  </S>
);

// ELN — varsel-flagg
export const ElnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="10" width="20" height="14" />
    <text x="24" y="20" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontWeight="bold">ELN</text>
    <line x1="14" y1="10" x2="14" y2="42" />
  </S>
);

// SACK — selektiv kvittering m/hull
export const SackIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="6" height="8" />
    <rect x="12" y="20" width="6" height="8" />
    <rect x="20" y="20" width="6" height="8" strokeDasharray="2 2" />
    <rect x="28" y="20" width="6" height="8" />
    <rect x="36" y="20" width="6" height="8" />
    <text x="23" y="26" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor">?</text>
  </S>
);

// Slow start — eksponential-kurve oppover
export const SlowStartIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 40q14 0 18-12t14-22" />
    <line x1="6" y1="42" x2="42" y2="42" />
    <line x1="6" y1="6" x2="6" y2="42" />
  </S>
);
