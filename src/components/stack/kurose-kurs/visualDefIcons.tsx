import * as React from "react";

/**
 * Små, gjenkjennelige ikoner for nettverks-termer. Hver eksport er en SVG
 * tegnet i 48×48 viewBox og bruker `currentColor` så den arver tekst-farge.
 * Holdes bevisst enkle (én-to farger, kraftige linjer) for å minne om kjente
 * UI-symboler (wifi-vifta, ruter, koffert/server osv.).
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
// Hosts og endepunkter
// ------------------------------------------------------------------

export const HostIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="12" width="32" height="20" rx="2" />
    <path d="M4 36h40l-2 4H6z" />
    <line x1="20" y1="28" x2="28" y2="28" />
  </S>
);

export const ClientServerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" rx="1.5" />
    <rect x="30" y="14" width="14" height="20" rx="1.5" />
    <path d="M19 22h10M29 22l-3-2M29 22l-3 2" />
    <path d="M29 30H19M19 30l3-2M19 30l3 2" />
    <line x1="33" y1="18" x2="41" y2="18" />
    <line x1="33" y1="22" x2="41" y2="22" />
    <line x1="33" y1="26" x2="41" y2="26" />
  </S>
);

export const LinkCableIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24c4-8 8 8 12 0s8 8 12 0 8 8 12 0" />
    <circle cx="6" cy="24" r="2" />
    <circle cx="42" cy="24" r="2" />
  </S>
);

export const PacketIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="22" rx="2" />
    <path d="M6 14l18 14L42 14" />
    <text x="24" y="34" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      DATA
    </text>
  </S>
);

export const RouterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="24" width="32" height="14" rx="2" />
    <line x1="14" y1="32" x2="14" y2="32" strokeWidth="3" />
    <line x1="20" y1="32" x2="20" y2="32" strokeWidth="3" />
    <line x1="26" y1="32" x2="26" y2="32" strokeWidth="3" />
    <line x1="32" y1="32" x2="32" y2="32" strokeWidth="3" />
    <path d="M18 24l-4-6M24 24v-8M30 24l4-6" />
    <circle cx="14" cy="14" r="1.5" />
    <circle cx="24" cy="10" r="1.5" />
    <circle cx="34" cy="14" r="1.5" />
  </S>
);

export const SwitchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="14" rx="2" />
    <rect x="8" y="25" width="3" height="4" />
    <rect x="13" y="25" width="3" height="4" />
    <rect x="18" y="25" width="3" height="4" />
    <rect x="23" y="25" width="3" height="4" />
    <rect x="28" y="25" width="3" height="4" />
    <rect x="33" y="25" width="3" height="4" />
    <rect x="38" y="25" width="3" height="4" />
  </S>
);

export const ProtocolIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M16 18h-8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2l-1 4 5-4h6a3 3 0 0 0 3-3" />
    <path d="M32 14h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-2l1 4-5-4h-6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3z" />
  </S>
);

export const ApiSocketIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="18" height="28" rx="2" />
    <circle cx="13" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
    <circle cx="13" cy="28" r="1.5" />
    <circle cx="17" cy="28" r="1.5" />
    <path d="M24 24h6m-3-3v6" />
    <path d="M30 18h12v12H30z" />
  </S>
);

export const IspCloudIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 30c-4 0-7-3-7-7s3-7 7-7c1-4 5-7 9-7s8 3 9 7c4 0 7 3 7 7s-3 7-7 7z" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      ISP
    </text>
  </S>
);

export const IxpCrossroadIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="5" />
    <path d="M24 19V6M24 29v13M19 24H6M29 24h13" />
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="40" cy="8" r="2.5" />
    <circle cx="8" cy="40" r="2.5" />
    <circle cx="40" cy="40" r="2.5" />
  </S>
);

export const TierPyramidIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6L8 40h32z" />
    <line x1="14" y1="28" x2="34" y2="28" />
    <line x1="19" y1="18" x2="29" y2="18" />
    <text x="24" y="38" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">3</text>
    <text x="24" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">2</text>
    <text x="24" y="16" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">1</text>
  </S>
);

export const RfcDocIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M12 6h18l8 8v28H12z" />
    <path d="M30 6v8h8" />
    <line x1="16" y1="22" x2="34" y2="22" />
    <line x1="16" y1="27" x2="34" y2="27" />
    <line x1="16" y1="32" x2="28" y2="32" />
    <text x="20" y="16" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      RFC
    </text>
  </S>
);

export const DistributedAppIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="4" />
    <circle cx="10" cy="34" r="4" />
    <circle cx="38" cy="34" r="4" />
    <line x1="24" y1="14" x2="12" y2="30" />
    <line x1="24" y1="14" x2="36" y2="30" />
    <line x1="14" y1="34" x2="34" y2="34" />
  </S>
);

// ------------------------------------------------------------------
// Aksess og bærelag
// ------------------------------------------------------------------

export const AccessHouseIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 24l12-10 12 10v14H8z" />
    <rect x="16" y="28" width="8" height="10" />
    <path d="M32 30h10" strokeDasharray="2 2" />
    <circle cx="42" cy="30" r="2" />
  </S>
);

export const LastMileRulerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="8" />
    <line x1="10" y1="20" x2="10" y2="24" />
    <line x1="16" y1="20" x2="16" y2="24" />
    <line x1="22" y1="20" x2="22" y2="24" />
    <line x1="28" y1="20" x2="28" y2="24" />
    <line x1="34" y1="20" x2="34" y2="24" />
    <line x1="40" y1="20" x2="40" y2="24" />
    <text x="24" y="35" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">1 km</text>
  </S>
);

export const FiberIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 28c8-2 12-12 20-12s12 10 16 14" stroke="currentColor" />
    <circle cx="6" cy="28" r="2" fill="currentColor" stroke="none" />
    <circle cx="42" cy="30" r="2" fill="currentColor" stroke="none" />
    <path d="M14 18l3 3M20 14l3 3M28 12l3 3" />
  </S>
);

export const DslPhoneIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 8v32M38 8v32" />
    <line x1="6" y1="12" x2="14" y2="12" />
    <line x1="34" y1="12" x2="42" y2="12" />
    <path d="M14 24c4 0 8-2 10-2s6 2 10 2" strokeDasharray="3 2" />
  </S>
);

export const HfcCoaxIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="12" />
    <circle cx="24" cy="24" r="8" />
    <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    <line x1="36" y1="24" x2="44" y2="24" strokeWidth="3" />
  </S>
);

export const WifiIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 22c8-8 24-8 32 0" />
    <path d="M13 27c6-6 16-6 22 0" />
    <path d="M18 32c4-3 8-3 12 0" />
    <circle cx="24" cy="38" r="2" fill="currentColor" stroke="none" />
  </S>
);

export const CoreRouterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <line x1="6" y1="22" x2="42" y2="22" />
    <line x1="6" y1="28" x2="42" y2="28" />
    <text x="24" y="20" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      TB/s
    </text>
  </S>
);

export const BackboneIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 24h40" strokeWidth="4" />
    <circle cx="10" cy="24" r="3" fill="currentColor" stroke="none" />
    <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    <circle cx="38" cy="24" r="3" fill="currentColor" stroke="none" />
    <path d="M10 24l-4 8M10 24l-4-8M38 24l4 8M38 24l4-8" />
  </S>
);

export const DataCenterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="8" width="32" height="6" rx="1" />
    <rect x="8" y="18" width="32" height="6" rx="1" />
    <rect x="8" y="28" width="32" height="6" rx="1" />
    <rect x="8" y="38" width="32" height="2" rx="1" />
    <circle cx="12" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="21" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="21" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="31" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="15" cy="31" r="0.8" fill="currentColor" stroke="none" />
  </S>
);

export const PeeringIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="16" cy="24" r="8" />
    <circle cx="32" cy="24" r="8" />
    <path d="M16 20c4-2 12-2 16 0" strokeDasharray="2 2" />
    <path d="M16 28c4 2 12 2 16 0" strokeDasharray="2 2" />
  </S>
);

export const TransitIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 24h28l-4-4M36 24l-4 4" strokeWidth="2" />
    <text x="24" y="38" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor">$</text>
  </S>
);

export const MultiHomingIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M16 24l8-10 8 10v14H16z" />
    <path d="M8 8l8 12M40 8l-8 12" />
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="40" cy="8" r="2.5" />
  </S>
);

export const PopIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="18" width="20" height="22" />
    <line x1="14" y1="24" x2="34" y2="24" />
    <line x1="14" y1="30" x2="34" y2="30" />
    <path d="M24 18V8M20 12l4-4 4 4" />
  </S>
);

// ------------------------------------------------------------------
// Svitsje-modeller
// ------------------------------------------------------------------

export const CircuitSwitchIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <circle cx="38" cy="24" r="3" />
    <path d="M13 24h22" strokeWidth="3" />
    <path d="M8 12c2 2 2 6 0 8M40 12c-2 2-2 6 0 8" />
  </S>
);

export const PacketSwitchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="12" width="10" height="8" rx="1" />
    <rect x="18" y="20" width="10" height="8" rx="1" />
    <rect x="34" y="14" width="10" height="8" rx="1" />
    <rect x="10" y="30" width="10" height="8" rx="1" />
    <rect x="28" y="32" width="10" height="8" rx="1" />
  </S>
);

export const FdmIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 36c2-12 4 4 6-8s4 12 6-2 4 8 6-6 4 10 6-4 4 6 6-2 4 4 6-1" />
    <line x1="6" y1="40" x2="42" y2="40" />
  </S>
);

export const TdmIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="6" height="8" />
    <rect x="14" y="20" width="6" height="8" />
    <rect x="22" y="20" width="6" height="8" />
    <rect x="30" y="20" width="6" height="8" />
    <rect x="38" y="20" width="4" height="8" />
    <text x="9" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">A</text>
    <text x="17" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">B</text>
    <text x="25" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">A</text>
    <text x="33" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">B</text>
    <line x1="6" y1="34" x2="42" y2="34" />
    <path d="M6 36v-2M42 36v-2M24 36v-2" />
  </S>
);

export const StatMuxDiceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="28" height="28" rx="3" />
    <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="24" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="31" cy="31" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="31" cy="17" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17" cy="31" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

export const StoreForwardIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="14" rx="2" />
    <rect x="18" y="18" width="12" height="6" rx="1" />
    <path d="M14 21h-6M34 21h6l-3-3M40 21l-3 3" />
  </S>
);

export const CutThroughIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="14" rx="2" strokeDasharray="3 2" />
    <path d="M4 21h40l-4-3M44 21l-4 3" strokeWidth="2" />
  </S>
);

export const QueueIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="8" height="10" />
    <rect x="16" y="18" width="8" height="10" />
    <rect x="26" y="18" width="8" height="10" />
    <path d="M36 23h6l-2-2M42 23l-2 2" />
  </S>
);

export const BufferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="8" width="20" height="6" />
    <rect x="14" y="16" width="20" height="6" />
    <rect x="14" y="24" width="20" height="6" />
    <rect x="14" y="32" width="20" height="6" />
  </S>
);

export const HandshakeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 22l6-6 6 6-6 6z" />
    <path d="M28 22l6-6 6 6-6 6z" />
    <path d="M20 22h8" strokeDasharray="2 2" />
    <path d="M14 30c4 4 16 4 20 0" />
  </S>
);

export const VirtualCircuitIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" strokeDasharray="3 3" />
    <circle cx="10" cy="24" r="2" fill="currentColor" stroke="none" />
    <circle cx="38" cy="24" r="2" fill="currentColor" stroke="none" />
  </S>
);

export const BurstIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38h4l1-8 1 12 1-20 1 14 1-4h4l1-12 1 16 1-6h22" />
    <line x1="6" y1="40" x2="42" y2="40" />
  </S>
);

export const QosLaneIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="10" rx="1" />
    <rect x="6" y="22" width="36" height="10" rx="1" />
    <rect x="6" y="34" width="36" height="6" rx="1" />
    <text x="10" y="18" fontSize="6" stroke="none" fill="currentColor">★</text>
    <line x1="14" y1="27" x2="38" y2="27" strokeDasharray="2 2" />
    <line x1="14" y1="37" x2="38" y2="37" strokeDasharray="2 2" />
  </S>
);

// ------------------------------------------------------------------
// Forsinkelse / throughput
// ------------------------------------------------------------------

export const ProcDelayIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="20" cy="20" r="10" />
    <line x1="28" y1="28" x2="38" y2="38" strokeWidth="2" />
    <rect x="15" y="15" width="10" height="3" />
    <rect x="15" y="22" width="6" height="3" />
  </S>
);

export const QueueDelayIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="16" width="6" height="14" />
    <rect x="14" y="16" width="6" height="14" />
    <rect x="22" y="16" width="6" height="14" />
    <path d="M32 23h8" />
    <circle cx="40" cy="38" r="3" stroke="none" fill="currentColor" />
    <text x="40" y="40" textAnchor="middle" fontSize="4" stroke="none" fill="var(--background,white)">⏱</text>
  </S>
);

export const TransDelayIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="18" width="14" height="12" rx="1" />
    <path d="M22 24h20" strokeWidth="3" />
    <circle cx="28" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="40" cy="24" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

export const PropDelayIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="24" x2="42" y2="24" strokeWidth="2" />
    <circle cx="6" cy="24" r="2" fill="currentColor" stroke="none" />
    <circle cx="42" cy="24" r="2" fill="currentColor" stroke="none" />
    <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    <path d="M28 20l4-2M28 28l4 2" />
  </S>
);

export const SumSigmaIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 10h20l-12 14 12 14H14" strokeWidth="2.5" />
  </S>
);

export const TrafficIntensityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 36a16 16 0 0 1 32 0" />
    <line x1="24" y1="36" x2="34" y2="20" strokeWidth="2" />
    <circle cx="24" cy="36" r="2" fill="currentColor" stroke="none" />
    <text x="14" y="34" fontSize="5" stroke="none" fill="currentColor">0</text>
    <text x="34" y="34" fontSize="5" stroke="none" fill="currentColor">1</text>
  </S>
);

export const ThroughputPipeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 18h40v12H4z" />
    <circle cx="10" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="26" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="42" cy="24" r="1.5" fill="currentColor" stroke="none" />
  </S>
);

export const BdpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="8" />
    <circle cx="10" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="26" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="34" cy="24" r="1.5" fill="currentColor" stroke="none" />
    <line x1="6" y1="34" x2="42" y2="34" />
    <line x1="6" y1="32" x2="6" y2="36" />
    <line x1="42" y1="32" x2="42" y2="36" />
    <text x="24" y="41" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">RTT × R</text>
  </S>
);

export const LossIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="16" width="14" height="14" rx="1" />
    <path d="M26 18l14 12M40 18L26 30" strokeWidth="2" />
  </S>
);

export const RttLoopIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 18c8-8 20-8 28 0" />
    <path d="M38 18l-4-1M38 18l-1 4" />
    <path d="M38 30c-8 8-20 8-28 0" />
    <path d="M10 30l4 1M10 30l1-4" />
  </S>
);

export const JitterIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="36" x2="42" y2="36" />
    <line x1="10" y1="36" x2="10" y2="26" strokeWidth="2" />
    <line x1="16" y1="36" x2="16" y2="14" strokeWidth="2" />
    <line x1="22" y1="36" x2="22" y2="22" strokeWidth="2" />
    <line x1="28" y1="36" x2="28" y2="10" strokeWidth="2" />
    <line x1="34" y1="36" x2="34" y2="20" strokeWidth="2" />
    <line x1="40" y1="36" x2="40" y2="28" strokeWidth="2" />
  </S>
);

export const GoodputIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="8" />
    <rect x="6" y="20" width="24" height="8" fill="currentColor" stroke="none" opacity="0.3" />
    <text x="18" y="14" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">payload</text>
    <text x="36" y="14" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">hdr</text>
  </S>
);

export const TracerouteIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="20" cy="24" r="3" />
    <circle cx="32" cy="24" r="3" />
    <circle cx="42" cy="24" r="3" />
    <line x1="11" y1="24" x2="17" y2="24" strokeDasharray="2 2" />
    <line x1="23" y1="24" x2="29" y2="24" strokeDasharray="2 2" />
    <line x1="35" y1="24" x2="39" y2="24" strokeDasharray="2 2" />
    <text x="8" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">1</text>
    <text x="20" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">2</text>
    <text x="32" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">3</text>
    <text x="42" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">4</text>
  </S>
);

// ------------------------------------------------------------------
// Lag-modellen
// ------------------------------------------------------------------

export const AppLayerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="28" height="28" rx="3" />
    <rect x="14" y="14" width="8" height="8" rx="1" />
    <rect x="26" y="14" width="8" height="8" rx="1" />
    <rect x="14" y="26" width="8" height="8" rx="1" />
    <rect x="26" y="26" width="8" height="8" rx="1" />
  </S>
);

export const TransportLayerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="13" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">80</text>
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">443</text>
    <text x="35" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">22</text>
  </S>
);

export const NetworkLayerIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M8 24h32" />
    <path d="M24 8c5 8 5 24 0 32M24 8c-5 8-5 24 0 32" />
  </S>
);

export const LinkLayerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="10" width="20" height="20" rx="2" />
    <line x1="18" y1="14" x2="18" y2="22" strokeWidth="2" />
    <line x1="22" y1="14" x2="22" y2="22" strokeWidth="2" />
    <line x1="26" y1="14" x2="26" y2="22" strokeWidth="2" />
    <line x1="30" y1="14" x2="30" y2="22" strokeWidth="2" />
    <line x1="22" y1="30" x2="22" y2="40" />
    <line x1="26" y1="30" x2="26" y2="40" />
    <rect x="20" y="38" width="8" height="4" />
  </S>
);

export const PhysicalLayerIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 24q4-10 8 0t8 0t8 0t8 0t8 0" strokeWidth="2" />
    <text x="24" y="38" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">0 1 0 1</text>
  </S>
);

export const EncapsulationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" />
    <rect x="9" y="17" width="30" height="14" />
    <rect x="14" y="20" width="20" height="8" />
    <rect x="19" y="22" width="10" height="4" />
  </S>
);

export const HeaderPayloadIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="10" height="12" />
    <rect x="16" y="18" width="26" height="12" />
    <text x="11" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">H</text>
    <text x="29" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">payload</text>
  </S>
);

export const PduIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="9" width="36" height="6" rx="1" />
    <rect x="6" y="17" width="36" height="6" rx="1" />
    <rect x="6" y="25" width="36" height="6" rx="1" />
    <rect x="6" y="33" width="36" height="6" rx="1" />
    <text x="8" y="13" fontSize="5" stroke="none" fill="currentColor">msg</text>
    <text x="8" y="21" fontSize="5" stroke="none" fill="currentColor">seg</text>
    <text x="8" y="29" fontSize="5" stroke="none" fill="currentColor">pkt</text>
    <text x="8" y="37" fontSize="5" stroke="none" fill="currentColor">frame</text>
  </S>
);

export const ServiceModelIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="8" width="28" height="32" rx="2" />
    <line x1="14" y1="14" x2="34" y2="14" />
    <line x1="14" y1="20" x2="34" y2="20" />
    <line x1="14" y1="26" x2="34" y2="26" />
    <line x1="14" y1="32" x2="28" y2="32" />
    <circle cx="13" cy="14" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="20" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="26" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13" cy="32" r="0.8" fill="currentColor" stroke="none" />
  </S>
);

export const HoriVertArrowsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="14" height="28" />
    <rect x="28" y="10" width="14" height="28" />
    <path d="M14 16v16M34 16v16" strokeDasharray="2 2" />
    <path d="M20 24h8" />
    <path d="M28 24l-2-2M28 24l-2 2" />
  </S>
);

export const OsiSevenLayerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="6" width="28" height="5" />
    <rect x="10" y="12" width="28" height="5" />
    <rect x="10" y="18" width="28" height="5" />
    <rect x="10" y="24" width="28" height="5" />
    <rect x="10" y="30" width="28" height="5" />
    <rect x="10" y="36" width="28" height="3" />
    <text x="6" y="10" fontSize="4" stroke="none" fill="currentColor">7</text>
    <text x="6" y="16" fontSize="4" stroke="none" fill="currentColor">6</text>
    <text x="6" y="22" fontSize="4" stroke="none" fill="currentColor">5</text>
  </S>
);

export const SessionPresIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="14" width="28" height="6" />
    <rect x="10" y="22" width="28" height="6" />
    <path d="M10 14l28 0M10 28l28 0" strokeDasharray="2 2" />
    <text x="24" y="19" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">presentasjon</text>
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">sesjon</text>
  </S>
);

export const DemuxIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="14" height="8" />
    <path d="M18 24h6" />
    <path d="M24 24l8-8M24 24l8 0M24 24l8 8" />
    <rect x="32" y="8" width="12" height="6" />
    <rect x="32" y="21" width="12" height="6" />
    <rect x="32" y="34" width="12" height="6" />
  </S>
);

export const EndToEndIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="4" fill="currentColor" stroke="none" />
    <circle cx="40" cy="24" r="4" fill="currentColor" stroke="none" />
    <rect x="16" y="20" width="6" height="8" />
    <rect x="26" y="20" width="6" height="8" />
    <line x1="12" y1="24" x2="16" y2="24" strokeDasharray="1 1" />
    <line x1="22" y1="24" x2="26" y2="24" strokeDasharray="1 1" />
    <line x1="32" y1="24" x2="36" y2="24" strokeDasharray="1 1" />
  </S>
);
