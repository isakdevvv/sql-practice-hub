import * as React from "react";

/**
 * Visuelle ikoner for Kurose kap. 6 — link-laget og LAN.
 *
 * 48×48 viewBox, `currentColor`, enkle to-tre-linjers SVG. Brukes som
 * `icon` i `VisualDefs` for kap.-6-blokkene.
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

function T({
  x,
  y,
  size = 6,
  children,
}: {
  x: number;
  y: number;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={size}
      stroke="none"
      fill="currentColor"
      fontFamily="ui-monospace,monospace"
    >
      {children}
    </text>
  );
}

// ------------------------------------------------------------------
// Ramme / Ethernet-strukturer
// ------------------------------------------------------------------

export const FrameIcon = (p: IconProps) => (
  <S {...p}>
    {/* En full Ethernet-ramme split i felter */}
    <rect x="3" y="18" width="42" height="14" rx="1.5" />
    <line x1="10" y1="18" x2="10" y2="32" />
    <line x1="18" y1="18" x2="18" y2="32" />
    <line x1="26" y1="18" x2="26" y2="32" />
    <line x1="34" y1="18" x2="34" y2="32" />
    <line x1="40" y1="18" x2="40" y2="32" />
    <T x={24} y={14} size={5}>FRAME</T>
  </S>
);

export const EthernetFrameIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="16" width="44" height="16" rx="1.5" />
    <line x1="8" y1="16" x2="8" y2="32" />
    <line x1="16" y1="16" x2="16" y2="32" />
    <line x1="24" y1="16" x2="24" y2="32" />
    <line x1="30" y1="16" x2="30" y2="32" />
    <line x1="40" y1="16" x2="40" y2="32" />
    <T x={5} y={28} size={4}>P</T>
    <T x={12} y={28} size={4}>D</T>
    <T x={20} y={28} size={4}>S</T>
    <T x={27} y={28} size={4}>T</T>
    <T x={35} y={28} size={4}>DATA</T>
    <T x={43} y={28} size={4}>F</T>
  </S>
);

export const PreambleIcon = (p: IconProps) => (
  <S {...p}>
    {/* Skarp sagtann-puls (klokke-sync) */}
    <path d="M4 30l4-12 4 12 4-12 4 12 4-12 4 12 4-12 4 12" />
    <path d="M36 18l4 12" />
    <line x1="4" y1="36" x2="44" y2="36" />
  </S>
);

export const SfdIcon = (p: IconProps) => (
  <S {...p}>
    {/* Pil som peker på rammens start */}
    <rect x="22" y="14" width="20" height="20" rx="1.5" />
    <path d="M28 18v12M32 18v12M36 18v12" />
    <path d="M4 24h14M14 20l4 4-4 4" />
    <T x={32} y={42} size={5}>SFD</T>
  </S>
);

export const InterFrameGapIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="18" width="14" height="12" rx="1" />
    <rect x="32" y="18" width="14" height="12" rx="1" />
    <path d="M18 24h12" strokeDasharray="2 2" />
    <T x={24} y={14} size={5}>GAP</T>
  </S>
);

export const PayloadIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <T x={24} y={28} size={9}>DATA</T>
  </S>
);

export const JumboFrameIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="14" width="44" height="20" rx="2" />
    <line x1="8" y1="14" x2="8" y2="34" />
    <T x={26} y={27} size={6}>JUMBO</T>
    <path d="M4 40h40M6 38l-2 2 2 2M42 38l2 2-2 2" />
  </S>
);

export const EtherTypeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <T x={24} y={22} size={5}>TYPE</T>
    <T x={24} y={30} size={6}>0x0800</T>
  </S>
);

export const FcsIcon = (p: IconProps) => (
  <S {...p}>
    {/* CRC-trailer: hash-mønster */}
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M14 18l-3 12M22 18l-3 12M30 18l-3 12M38 18l-3 12" />
    <T x={24} y={42} size={5}>FCS</T>
  </S>
);

// ------------------------------------------------------------------
// MAC / adresser
// ------------------------------------------------------------------

export const MacIcon = (p: IconProps) => (
  <S {...p}>
    {/* 6 hex-par */}
    <rect x="2" y="18" width="44" height="12" rx="1.5" />
    <line x1="9.3" y1="18" x2="9.3" y2="30" />
    <line x1="16.6" y1="18" x2="16.6" y2="30" />
    <line x1="24" y1="18" x2="24" y2="30" />
    <line x1="31.3" y1="18" x2="31.3" y2="30" />
    <line x1="38.6" y1="18" x2="38.6" y2="30" />
    <T x={5.6} y={27} size={4}>AA</T>
    <T x={12.9} y={27} size={4}>BB</T>
    <T x={20.3} y={27} size={4}>CC</T>
    <T x={27.6} y={27} size={4}>11</T>
    <T x={34.9} y={27} size={4}>22</T>
    <T x={42.3} y={27} size={4}>33</T>
  </S>
);

export const DstSrcMacIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="18" width="20" height="12" rx="1.5" />
    <rect x="26" y="18" width="20" height="12" rx="1.5" />
    <T x={12} y={26} size={5}>DST</T>
    <T x={36} y={26} size={5}>SRC</T>
    <path d="M22 24h4" />
  </S>
);

export const OuiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="18" width="44" height="12" rx="1.5" />
    <line x1="24" y1="18" x2="24" y2="30" />
    <T x={12} y={27} size={5}>OUI</T>
    <T x={36} y={27} size={5}>NIC</T>
    <path d="M12 14v2M36 14v2" />
  </S>
);

export const IgUlBitIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="1.5" />
    <line x1="10" y1="16" x2="10" y2="32" />
    <line x1="16" y1="16" x2="16" y2="32" />
    <T x={7} y={26} size={6}>I</T>
    <T x={13} y={26} size={6}>U</T>
    <T x={30} y={26} size={5}>byte0</T>
    <path d="M7 38l3-2-3-2M13 38l3-2-3-2" />
  </S>
);

export const BroadcastMacIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="18" width="44" height="12" rx="1.5" />
    <T x={24} y={27} size={6}>FF:FF:FF</T>
    <path d="M24 10v4M14 12l4 2M34 12l-4 2" />
  </S>
);

// ------------------------------------------------------------------
// Feiloppdaging
// ------------------------------------------------------------------

export const ParityIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="32" height="12" rx="1.5" />
    <rect x="38" y="18" width="6" height="12" rx="1" />
    <T x={10} y={27} size={5}>1</T>
    <T x={18} y={27} size={5}>0</T>
    <T x={26} y={27} size={5}>1</T>
    <T x={34} y={27} size={5}>1</T>
    <T x={41} y={27} size={5}>P</T>
  </S>
);

export const Parity2DIcon = (p: IconProps) => (
  <S {...p}>
    {/* 3x3 grid + paritet kolonne/rad */}
    <rect x="6" y="6" width="30" height="30" />
    <line x1="16" y1="6" x2="16" y2="36" />
    <line x1="26" y1="6" x2="26" y2="36" />
    <line x1="6" y1="16" x2="36" y2="16" />
    <line x1="6" y1="26" x2="36" y2="26" />
    <rect x="38" y="6" width="6" height="30" />
    <rect x="6" y="38" width="30" height="6" />
    <rect x="38" y="38" width="6" height="6" />
  </S>
);

export const ChecksumIcon = (p: IconProps) => (
  <S {...p}>
    {/* Sum-symbol */}
    <path d="M14 10h20l-12 14 12 14H14" strokeWidth="2.2" />
    <T x={42} y={26} size={6}>Σ</T>
  </S>
);

export const CrcIcon = (p: IconProps) => (
  <S {...p}>
    {/* Polynom-divisjon: tall over strek */}
    <T x={16} y={16} size={7}>CRC</T>
    <path d="M6 22h36" strokeWidth="1.5" />
    <T x={24} y={32} size={7}>÷ G</T>
    <path d="M40 22l-4 4M40 26l-4-4" strokeWidth="1.2" />
  </S>
);

export const GeneratorPolyIcon = (p: IconProps) => (
  <S {...p}>
    <T x={24} y={20} size={7}>G(x)</T>
    <T x={24} y={34} size={6}>x³+x+1</T>
    <rect x="6" y="6" width="36" height="36" rx="3" />
  </S>
);

export const BurstErrorIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="20" width="44" height="8" rx="1" />
    {/* X-er over et område */}
    <path d="M16 18l4 12M20 18l-4 12" />
    <path d="M22 18l4 12M26 18l-4 12" />
    <path d="M28 18l4 12M32 18l-4 12" />
  </S>
);

export const Gf2Icon = (p: IconProps) => (
  <S {...p}>
    <T x={24} y={20} size={9}>XOR</T>
    <T x={24} y={36} size={7}>GF(2)</T>
  </S>
);

export const HammingIcon = (p: IconProps) => (
  <S {...p}>
    {/* To 7-bit-ord der bit 3 skiller dem */}
    <rect x="4" y="12" width="40" height="8" rx="1" />
    <rect x="4" y="26" width="40" height="8" rx="1" />
    <line x1="10" y1="12" x2="10" y2="20" />
    <line x1="16" y1="12" x2="16" y2="20" />
    <line x1="22" y1="12" x2="22" y2="20" />
    <line x1="28" y1="12" x2="28" y2="20" />
    <line x1="34" y1="12" x2="34" y2="20" />
    <line x1="40" y1="12" x2="40" y2="20" />
    <line x1="10" y1="26" x2="10" y2="34" />
    <line x1="16" y1="26" x2="16" y2="34" />
    <line x1="22" y1="26" x2="22" y2="34" />
    <line x1="28" y1="26" x2="28" y2="34" />
    <line x1="34" y1="26" x2="34" y2="34" />
    <line x1="40" y1="26" x2="40" y2="34" />
    <path d="M25 16l-2 14" strokeWidth="2.4" />
  </S>
);

export const FecBecIcon = (p: IconProps) => (
  <S {...p}>
    {/* Reparer-pil vs spør-igjen-pil */}
    <path d="M6 18h12M14 14l4 4-4 4" />
    <T x={28} y={20} size={6}>FIX</T>
    <path d="M6 32l12-4M10 26l-4 6 6 2" />
    <T x={28} y={34} size={6}>ASK</T>
  </S>
);

// ------------------------------------------------------------------
// Link / fysisk
// ------------------------------------------------------------------

export const NodeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="6" />
    <line x1="6" y1="24" x2="18" y2="24" />
    <line x1="30" y1="24" x2="42" y2="24" />
    <line x1="24" y1="6" x2="24" y2="18" />
    <line x1="24" y1="30" x2="24" y2="42" />
  </S>
);

export const FramingIcon = (p: IconProps) => (
  <S {...p}>
    {/* Bit-strøm med markører for start/slutt */}
    <path d="M4 24h40" strokeDasharray="2 2" />
    <path d="M12 18v12M36 18v12" strokeWidth="2.4" />
    <T x={8} y={14} size={5}>START</T>
    <T x={40} y={14} size={5}>END</T>
  </S>
);

export const DuplexIcon = (p: IconProps) => (
  <S {...p}>
    {/* To piler i hver sin retning */}
    <path d="M6 18h32M34 14l4 4-4 4" />
    <path d="M42 30H10M14 26l-4 4 4 4" />
  </S>
);

export const MtuIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="2" />
    <path d="M4 40h40M6 38l-2 2 2 2M42 38l2 2-2 2" />
    <T x={24} y={28} size={6}>1500</T>
  </S>
);

export const ReliableLinkIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 24l6 6 14-14" strokeWidth="2.4" />
    <circle cx="24" cy="24" r="18" />
  </S>
);

export const PauseIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="10" width="6" height="28" rx="1" />
    <rect x="28" y="10" width="6" height="28" rx="1" />
  </S>
);

export const PointToPointIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="5" />
    <circle cx="38" cy="24" r="5" />
    <line x1="15" y1="24" x2="33" y2="24" strokeWidth="2.4" />
  </S>
);

export const BroadcastMediumIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="28" x2="44" y2="28" strokeWidth="2.4" />
    <circle cx="10" cy="16" r="3" />
    <circle cx="20" cy="16" r="3" />
    <circle cx="30" cy="16" r="3" />
    <circle cx="40" cy="16" r="3" />
    <line x1="10" y1="19" x2="10" y2="28" />
    <line x1="20" y1="19" x2="20" y2="28" />
    <line x1="30" y1="19" x2="30" y2="28" />
    <line x1="40" y1="19" x2="40" y2="28" />
  </S>
);

export const NicIcon = (p: IconProps) => (
  <S {...p}>
    {/* Et NIC-kort */}
    <rect x="6" y="12" width="36" height="24" rx="1.5" />
    <rect x="10" y="22" width="6" height="4" />
    <rect x="18" y="22" width="6" height="4" />
    <rect x="26" y="22" width="6" height="4" />
    <rect x="34" y="22" width="4" height="4" />
    <path d="M6 32h36" />
    <path d="M10 32v4M14 32v4M18 32v4M22 32v4M26 32v4M30 32v4M34 32v4" />
  </S>
);

export const PromiscuousIcon = (p: IconProps) => (
  <S {...p}>
    {/* Øye */}
    <path d="M4 24c4-8 12-12 20-12s16 4 20 12c-4 8-12 12-20 12S8 32 4 24z" />
    <circle cx="24" cy="24" r="5" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
  </S>
);

// ------------------------------------------------------------------
// CSMA / ALOHA / multiple-access
// ------------------------------------------------------------------

export const ChannelPartitionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="1.5" />
    <line x1="14" y1="14" x2="14" y2="34" />
    <line x1="24" y1="14" x2="24" y2="34" />
    <line x1="34" y1="14" x2="34" y2="34" />
  </S>
);

export const AlohaIcon = (p: IconProps) => (
  <S {...p}>
    {/* To rammer som overlapper = kollisjon */}
    <rect x="6" y="14" width="22" height="8" rx="1" />
    <rect x="20" y="26" width="22" height="8" rx="1" />
    <path d="M24 12l-2-4M28 12l2-4M22 38l2 4M26 38l-2 4" />
  </S>
);

export const SlotAlohaIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <line x1="6" y1="12" x2="6" y2="38" strokeDasharray="2 2" />
    <line x1="16" y1="12" x2="16" y2="38" strokeDasharray="2 2" />
    <line x1="26" y1="12" x2="26" y2="38" strokeDasharray="2 2" />
    <line x1="36" y1="12" x2="36" y2="38" strokeDasharray="2 2" />
    <rect x="6" y="18" width="10" height="8" />
    <rect x="26" y="18" width="10" height="8" />
  </S>
);

export const CsmaIcon = (p: IconProps) => (
  <S {...p}>
    {/* Øre / lytt */}
    <path d="M14 14c0-6 6-10 12-8s10 8 6 14c-2 4-4 6-2 10s-4 6-8 4-6-8-6-12" />
    <circle cx="20" cy="22" r="2" />
  </S>
);

export const CsmaCdIcon = (p: IconProps) => (
  <S {...p}>
    {/* Kollisjon (lyn/stjerne) */}
    <path d="M24 8l3 10 10 1-8 6 3 11-8-6-8 6 3-11-8-6 10-1z" />
  </S>
);

export const BackoffIcon = (p: IconProps) => (
  <S {...p}>
    {/* Eksponensielt vinduer */}
    <rect x="4" y="32" width="4" height="6" />
    <rect x="12" y="28" width="6" height="10" />
    <rect x="22" y="20" width="10" height="18" />
    <rect x="36" y="8" width="8" height="30" />
  </S>
);

export const PollingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="4" />
    <circle cx="10" cy="34" r="4" />
    <circle cx="24" cy="34" r="4" />
    <circle cx="38" cy="34" r="4" />
    <path d="M22 14l-10 16M24 14v16M26 14l10 16" strokeDasharray="2 2" />
  </S>
);

export const TokenRingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <circle cx="38" cy="24" r="3" fill="currentColor" />
  </S>
);

export const PropagationIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="6" />
    <circle cx="24" cy="24" r="12" strokeDasharray="2 2" />
    <circle cx="24" cy="24" r="18" strokeDasharray="2 2" />
    <path d="M24 24l16-10" />
  </S>
);

export const JamIcon = (p: IconProps) => (
  <S {...p}>
    {/* Noise bars */}
    <path d="M6 24l4-8 4 16 4-12 4 8 4-16 4 12 4-4 4 8 4-12" />
    <T x={24} y={42} size={5}>JAM</T>
  </S>
);

export const HiddenTerminalIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="24" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <path d="M14 24h6M28 24h6" />
    <path d="M10 32c4 4 24 4 28 0" strokeDasharray="2 2" />
    <path d="M14 38l4-4M30 34l4 4" strokeWidth="2.2" />
  </S>
);

export const CsmaCaIcon = (p: IconProps) => (
  <S {...p}>
    {/* CSMA/CA = unngå før sending */}
    <circle cx="24" cy="24" r="16" />
    <path d="M14 14l20 20M14 34l20-20" strokeWidth="2" />
  </S>
);

export const CaptureEffectIcon = (p: IconProps) => (
  <S {...p}>
    {/* En sterk og en svak puls */}
    <path d="M6 30l4-4 4 4 4-12 4 12 4-4 4 4" strokeWidth="2.4" />
    <path d="M30 30l3-2 3 2 3-4 3 4" strokeWidth="1" opacity="0.6" />
  </S>
);

export const OfferedLoadIcon = (p: IconProps) => (
  <S {...p}>
    {/* G-aksen med klokke-formet kurve */}
    <path d="M6 38h36M6 38L6 8" />
    <path d="M8 36c4-10 8-18 12-18s8 8 12 18" />
    <T x={36} y={14} size={6}>G</T>
  </S>
);

// ------------------------------------------------------------------
// ARP / switch / STP
// ------------------------------------------------------------------

export const ArpIcon = (p: IconProps) => (
  <S {...p}>
    <T x={12} y={28} size={14}>?</T>
    <path d="M22 24h12M30 20l4 4-4 4" />
    <T x={40} y={28} size={6}>MAC</T>
  </S>
);

export const ArpCacheIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <line x1="24" y1="10" x2="24" y2="38" />
    <line x1="6" y1="18" x2="42" y2="18" />
    <line x1="6" y1="26" x2="42" y2="26" />
    <line x1="6" y1="34" x2="42" y2="34" />
    <T x={15} y={16} size={4}>IP</T>
    <T x={33} y={16} size={4}>MAC</T>
  </S>
);

export const IpBroadcastIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="20" width="20" height="8" rx="1" />
    <T x={24} y={26} size={5}>.255</T>
    <path d="M24 18v-4M14 24l-6 0M34 24l6 0M18 30l-4 4M30 30l4 4" />
  </S>
);

export const SwitchTableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <line x1="28" y1="10" x2="28" y2="38" />
    <line x1="6" y1="18" x2="42" y2="18" />
    <line x1="6" y1="26" x2="42" y2="26" />
    <line x1="6" y1="34" x2="42" y2="34" />
    <T x={17} y={16} size={4}>MAC</T>
    <T x={35} y={16} size={4}>PORT</T>
  </S>
);

export const SelfLearningIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="14" rx="2" />
    <path d="M14 20l-4-8M14 12l-3 0M14 12l0-3" strokeWidth="1.6" />
    <T x={28} y={30} size={5}>LEARN</T>
  </S>
);

export const PlugPlayIcon = (p: IconProps) => (
  <S {...p}>
    {/* Plugg + sjekk */}
    <path d="M8 14v8M14 14v8M6 22h10v4c0 4 8 4 8 0v-4" />
    <path d="M28 26l4 4 8-12" strokeWidth="2.4" />
  </S>
);

export const GratuitousArpIcon = (p: IconProps) => (
  <S {...p}>
    <T x={12} y={28} size={9}>!</T>
    <path d="M18 24h14M28 20l4 4-4 4" />
    <T x={40} y={28} size={5}>ALL</T>
  </S>
);

export const ArpSpoofIcon = (p: IconProps) => (
  <S {...p}>
    {/* Maske */}
    <path d="M6 16c4-4 14-4 18 0 4-4 14-4 18 0v8c0 8-10 12-18 8-8 4-18 0-18-8z" />
    <circle cx="16" cy="22" r="2" fill="currentColor" />
    <circle cx="32" cy="22" r="2" fill="currentColor" />
  </S>
);

export const FloodingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="20" width="12" height="8" rx="1" />
    <path d="M18 24l-12-8M18 24l-12 0M18 24l-12 8" />
    <path d="M30 24l12-8M30 24l12 0M30 24l12 8" />
  </S>
);

export const TableAgingIcon = (p: IconProps) => (
  <S {...p}>
    {/* Klokke + sletting */}
    <circle cx="24" cy="24" r="14" />
    <path d="M24 16v8l6 4" />
  </S>
);

export const SpanningTreeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="3" />
    <circle cx="12" cy="26" r="3" />
    <circle cx="24" cy="26" r="3" />
    <circle cx="36" cy="26" r="3" />
    <circle cx="12" cy="40" r="3" />
    <circle cx="36" cy="40" r="3" />
    <path d="M22 12l-8 12M24 13v10M26 12l8 12" />
    <path d="M12 29v8M36 29v8" />
    <path d="M14 26h8" strokeDasharray="1.5 1.5" opacity="0.5" />
  </S>
);

export const BpduIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="16" width="32" height="16" rx="2" />
    <T x={24} y={27} size={6}>BPDU</T>
    <path d="M0 24h8M40 24h8" />
  </S>
);

export const VrrpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="18" height="12" rx="1.5" />
    <rect x="26" y="10" width="18" height="12" rx="1.5" />
    <path d="M22 16h4" strokeDasharray="2 2" />
    <rect x="14" y="28" width="20" height="10" rx="1.5" strokeDasharray="2 2" />
    <T x={24} y={35} size={5}>VIP</T>
  </S>
);

// ------------------------------------------------------------------
// Switch / hub / hierarchy
// ------------------------------------------------------------------

export const HubIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="6" />
    <path d="M24 18v-12M24 30v12M18 24h-12M30 24h12M20 20l-8-8M28 20l8-8M20 28l-8 8M28 28l8 8" />
  </S>
);

export const SwitchBoxIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="14" rx="1.5" />
    <rect x="8" y="22" width="4" height="6" />
    <rect x="14" y="22" width="4" height="6" />
    <rect x="20" y="22" width="4" height="6" />
    <rect x="26" y="22" width="4" height="6" />
    <rect x="32" y="22" width="4" height="6" />
    <rect x="38" y="22" width="4" height="6" />
  </S>
);

export const SwitchHierarchyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="6" width="8" height="6" rx="1" />
    <rect x="8" y="20" width="8" height="6" rx="1" />
    <rect x="32" y="20" width="8" height="6" rx="1" />
    <rect x="4" y="36" width="6" height="5" rx="1" />
    <rect x="14" y="36" width="6" height="5" rx="1" />
    <rect x="28" y="36" width="6" height="5" rx="1" />
    <rect x="38" y="36" width="6" height="5" rx="1" />
    <path d="M22 12l-8 8M26 12l10 8" />
    <path d="M10 26v10M14 26l3 10M36 26l-5 10M36 26v10" />
  </S>
);

export const AutoNegotiationIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="6" />
    <circle cx="34" cy="24" r="6" />
    <path d="M20 22h8M20 26h8M22 18l-2 4 2 4M26 18l2 4-2 4" />
  </S>
);

export const PoeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="16" width="36" height="16" rx="2" />
    <path d="M22 14l-2 8h4l-2 8" strokeWidth="2.4" />
  </S>
);

export const CamIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="2" />
    <rect x="8" y="14" width="32" height="6" />
    <rect x="8" y="22" width="32" height="6" />
    <rect x="8" y="30" width="32" height="4" />
    <T x={24} y={19} size={4}>CAM</T>
  </S>
);

export const ManchesterIcon = (p: IconProps) => (
  <S {...p}>
    {/* Klokke-koding: overgang midt-i bit */}
    <path d="M4 30v-12h6v12h6v-12h6v12h6v-12h6v12h6v-12h4" />
  </S>
);

// ------------------------------------------------------------------
// VLAN
// ------------------------------------------------------------------

export const VlanIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="14" rx="1.5" />
    <rect x="8" y="22" width="4" height="6" fill="currentColor" />
    <rect x="14" y="22" width="4" height="6" fill="currentColor" />
    <rect x="20" y="22" width="4" height="6" />
    <rect x="26" y="22" width="4" height="6" />
    <rect x="32" y="22" width="4" height="6" opacity="0.6" />
    <rect x="38" y="22" width="4" height="6" opacity="0.6" />
  </S>
);

export const VlanTagIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="16" width="44" height="16" rx="1.5" />
    <rect x="16" y="14" width="10" height="20" rx="1" fill="currentColor" opacity="0.3" />
    <T x={21} y={26} size={5}>TAG</T>
    <T x={36} y={26} size={5}>DATA</T>
  </S>
);

export const TrunkLinkIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="10" width="14" height="10" rx="1.5" />
    <rect x="32" y="10" width="14" height="10" rx="1.5" />
    <path d="M16 15h16" strokeWidth="3" />
    <T x={24} y={28} size={5}>TRUNK</T>
    <path d="M20 32h2M24 32h2M28 32h2" />
  </S>
);

export const NativeVlanIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="1.5" />
    <T x={24} y={27} size={6}>NO-TAG</T>
  </S>
);

export const InterVlanRoutingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="22" width="14" height="10" rx="1" />
    <rect x="30" y="22" width="14" height="10" rx="1" />
    <path d="M18 27c2-12 10-12 12 0" />
    <circle cx="24" cy="10" r="4" />
    <path d="M21 13l-1 4M27 13l1 4" />
  </S>
);

export const FirewallVlanIcon = (p: IconProps) => (
  <S {...p}>
    {/* Mur */}
    <rect x="6" y="14" width="36" height="22" />
    <line x1="14" y1="14" x2="14" y2="20" />
    <line x1="22" y1="14" x2="22" y2="20" />
    <line x1="30" y1="14" x2="30" y2="20" />
    <line x1="38" y1="14" x2="38" y2="20" />
    <line x1="10" y1="20" x2="10" y2="28" />
    <line x1="18" y1="20" x2="18" y2="28" />
    <line x1="26" y1="20" x2="26" y2="28" />
    <line x1="34" y1="20" x2="34" y2="28" />
    <line x1="42" y1="20" x2="42" y2="28" />
    <line x1="6" y1="28" x2="42" y2="28" />
    <line x1="14" y1="28" x2="14" y2="36" />
    <line x1="22" y1="28" x2="22" y2="36" />
    <line x1="30" y1="28" x2="30" y2="36" />
    <line x1="38" y1="28" x2="38" y2="36" />
    <line x1="6" y1="20" x2="42" y2="20" />
  </S>
);

export const VlanHoppingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="10" height="8" rx="1" />
    <rect x="20" y="20" width="10" height="8" rx="1" />
    <rect x="34" y="20" width="10" height="8" rx="1" />
    <path d="M11 18c4-12 14-12 18 0" strokeWidth="2" />
    <path d="M27 18l-2-3M27 18l-3 1" />
  </S>
);

export const PrivateVlanIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="14" rx="1.5" />
    <line x1="13" y1="20" x2="13" y2="34" strokeWidth="2.4" />
    <line x1="23" y1="20" x2="23" y2="34" strokeWidth="2.4" />
    <line x1="33" y1="20" x2="33" y2="34" strokeWidth="2.4" />
    <T x={24} y={14} size={5}>PVLAN</T>
  </S>
);

export const VoiceVlanIcon = (p: IconProps) => (
  <S {...p}>
    {/* Telefon */}
    <path d="M14 10c-4 4-4 16 0 24s20 4 24 0c-2-4-6-4-8-2s-6 2-10-2-4-8-2-10 2-6-2-8-2-2-2-2z" />
  </S>
);

export const VtpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="14" height="10" rx="1" />
    <rect x="30" y="10" width="14" height="10" rx="1" />
    <rect x="4" y="28" width="14" height="10" rx="1" />
    <rect x="30" y="28" width="14" height="10" rx="1" />
    <path d="M18 15h12M18 33h12M11 20v8M37 20v8" strokeDasharray="2 2" />
  </S>
);

export const QinqIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="16" width="44" height="16" rx="1.5" />
    <rect x="10" y="14" width="8" height="20" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="20" y="14" width="8" height="20" rx="1" fill="currentColor" opacity="0.6" />
    <T x={36} y={26} size={5}>DATA</T>
  </S>
);

// ------------------------------------------------------------------
// Datasenter-topologi
// ------------------------------------------------------------------

export const TorSwitchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="6" rx="1" />
    <rect x="6" y="14" width="36" height="28" rx="1" />
    <line x1="6" y1="22" x2="42" y2="22" />
    <line x1="6" y1="28" x2="42" y2="28" />
    <line x1="6" y1="34" x2="42" y2="34" />
  </S>
);

export const ThreeTierIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="4" width="8" height="6" rx="1" />
    <rect x="10" y="18" width="8" height="6" rx="1" />
    <rect x="30" y="18" width="8" height="6" rx="1" />
    <rect x="4" y="34" width="6" height="6" rx="1" />
    <rect x="14" y="34" width="6" height="6" rx="1" />
    <rect x="28" y="34" width="6" height="6" rx="1" />
    <rect x="38" y="34" width="6" height="6" rx="1" />
    <path d="M22 10l-8 8M26 10l8 8M14 24l-7 10M14 24l3 10M34 24l-3 10M34 24l7 10" />
  </S>
);

export const FatTreeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="4" width="8" height="6" rx="1" />
    <rect x="10" y="18" width="8" height="6" rx="1" />
    <rect x="30" y="18" width="8" height="6" rx="1" />
    <rect x="4" y="34" width="6" height="6" rx="1" />
    <rect x="14" y="34" width="6" height="6" rx="1" />
    <rect x="28" y="34" width="6" height="6" rx="1" />
    <rect x="38" y="34" width="6" height="6" rx="1" />
    <path d="M22 10l-8 8M22 10l16 8M26 10l-16 8M26 10l8 8" strokeWidth="2.2" />
    <path d="M14 24l-7 10M14 24l3 10M34 24l-3 10M34 24l7 10" />
  </S>
);

export const LeafSpineIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="6" width="8" height="6" rx="1" />
    <rect x="20" y="6" width="8" height="6" rx="1" />
    <rect x="36" y="6" width="8" height="6" rx="1" />
    <rect x="4" y="34" width="8" height="6" rx="1" />
    <rect x="20" y="34" width="8" height="6" rx="1" />
    <rect x="36" y="34" width="8" height="6" rx="1" />
    <path d="M8 12l16 22M8 12v22M8 12l32 22M24 12l-16 22M24 12v22M24 12l16 22M40 12l-32 22M40 12l-16 22M40 12v22" />
  </S>
);

export const EcmpIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="4" />
    <circle cx="40" cy="24" r="4" />
    <path d="M12 24c8-14 16-14 24 0" />
    <path d="M12 24c8-6 16-6 24 0" />
    <path d="M12 24c8 6 16 6 24 0" />
    <path d="M12 24c8 14 16 14 24 0" />
  </S>
);

export const BisectionIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="12" r="3" />
    <circle cx="38" cy="12" r="3" />
    <circle cx="10" cy="36" r="3" />
    <circle cx="38" cy="36" r="3" />
    <path d="M13 12h22M13 36h22M10 15v18M38 15v18" />
    <path d="M24 4v40" strokeWidth="2.4" strokeDasharray="3 2" />
  </S>
);

export const OversubscriptionIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 20h40l-6 8H10z" />
    <T x={24} y={38} size={6}>4:1</T>
  </S>
);

export const EastWestIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 16h36M38 12l4 4-4 4" />
    <path d="M42 32H6M10 28l-4 4 4 4" />
    <path d="M24 4v6M24 38v6" strokeDasharray="2 2" />
  </S>
);

export const ClosIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="10" r="3" />
    <circle cx="24" cy="10" r="3" />
    <circle cx="40" cy="10" r="3" />
    <circle cx="8" cy="24" r="3" />
    <circle cx="24" cy="24" r="3" />
    <circle cx="40" cy="24" r="3" />
    <circle cx="8" cy="38" r="3" />
    <circle cx="24" cy="38" r="3" />
    <circle cx="40" cy="38" r="3" />
    <path d="M11 10l10 14M27 10l10 14M21 10L11 24M37 10l-10 14" />
    <path d="M11 24l10 14M27 24l10 14M21 24l-10 14M37 24l-10 14" />
  </S>
);

export const DcbIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <path d="M10 24h8M22 24h8M34 24h6" strokeWidth="2.2" />
    <T x={24} y={42} size={5}>DCB</T>
  </S>
);

export const RdmaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" rx="1" />
    <rect x="30" y="14" width="14" height="20" rx="1" />
    <path d="M18 24h12" strokeWidth="3" />
    <T x={11} y={28} size={5}>RAM</T>
    <T x={37} y={28} size={5}>RAM</T>
  </S>
);

export const BgpIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="8" />
    <circle cx="34" cy="24" r="8" />
    <path d="M22 24h4" strokeWidth="2.4" />
    <T x={14} y={27} size={5}>AS1</T>
    <T x={34} y={27} size={5}>AS2</T>
  </S>
);

export const VxlanIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="1.5" strokeDasharray="2 2" />
    <rect x="14" y="22" width="20" height="4" fill="currentColor" />
    <T x={24} y={14} size={5}>VNI</T>
  </S>
);

// ------------------------------------------------------------------
// MPLS
// ------------------------------------------------------------------

export const MplsLabelIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="14" height="10" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="20" y="20" width="24" height="10" rx="1" />
    <T x={11} y={27} size={5}>100</T>
    <T x={32} y={27} size={5}>DATA</T>
  </S>
);

export const LsrIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <circle cx="14" cy="24" r="2" />
    <circle cx="24" cy="24" r="2" />
    <circle cx="34" cy="24" r="2" />
    <T x={24} y={42} size={5}>LSR</T>
  </S>
);

export const LspIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="6" cy="24" r="3" />
    <circle cx="20" cy="24" r="3" />
    <circle cx="34" cy="24" r="3" />
    <circle cx="44" cy="24" r="3" />
    <path d="M9 24h8M23 24h8M37 24h4" strokeWidth="2.4" />
  </S>
);

export const PushSwapPopIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="10" height="8" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="14" y="20" width="20" height="8" rx="1" />
    <path d="M16 16l4-4 4 4M28 36l-4 4-4-4" />
    <T x={42} y={26} size={5}>op</T>
  </S>
);

export const FecIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="3" />
    <circle cx="24" cy="14" r="3" />
    <circle cx="34" cy="14" r="3" />
    <rect x="6" y="26" width="36" height="12" rx="2" />
    <path d="M14 17v9M24 17v9M34 17v9" />
    <T x={24} y={35} size={5}>FEC</T>
  </S>
);

export const LdpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="14" height="10" rx="1" />
    <rect x="30" y="20" width="14" height="10" rx="1" />
    <path d="M18 22h12M30 28H18M30 22l-3-2M30 22l-3 2M18 28l3-2M18 28l3 2" />
  </S>
);

export const MplsVpnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="20" width="8" height="10" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="10" y="20" width="10" height="10" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="20" y="20" width="24" height="10" rx="1" />
    <T x={6} y={27} size={4}>VPN</T>
    <T x={15} y={27} size={4}>LSP</T>
    <T x={32} y={27} size={5}>DATA</T>
  </S>
);

export const L3VpnIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="5" />
    <circle cx="38" cy="24" r="5" />
    <path d="M15 24h18" strokeDasharray="2 2" />
    <rect x="20" y="20" width="8" height="8" rx="1" />
    <T x={24} y={27} size={5}>L3</T>
  </S>
);

export const VplsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="18" width="14" height="12" rx="1.5" />
    <rect x="32" y="18" width="14" height="12" rx="1.5" />
    <path d="M16 24h16" strokeWidth="3" strokeDasharray="3 2" />
    <T x={24} y={14} size={5}>L2</T>
  </S>
);

export const TrafficEngIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 24c8-12 18-12 26 0" strokeWidth="2.4" />
    <path d="M11 24c8 12 18 12 26 0" opacity="0.3" strokeDasharray="2 2" />
  </S>
);

export const SegmentRoutingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="6" height="10" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="12" y="20" width="6" height="10" rx="1" fill="currentColor" opacity="0.35" />
    <rect x="20" y="20" width="6" height="10" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="28" y="20" width="16" height="10" rx="1" />
    <T x={36} y={27} size={5}>DATA</T>
  </S>
);

export const ExpBitIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="10" rx="1" />
    <rect x="6" y="22" width="8" height="6" fill="currentColor" />
    <T x={28} y={27} size={5}>QoS</T>
  </S>
);

export const MplsTtlIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="20" height="10" rx="1" />
    <rect x="26" y="20" width="18" height="10" rx="1" />
    <T x={14} y={27} size={5}>TTL</T>
    <T x={35} y={27} size={5}>DATA</T>
  </S>
);
