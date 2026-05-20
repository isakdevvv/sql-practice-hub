import * as React from "react";

/**
 * Visuelle ikoner for Kurose kap. 3 (transport-laget — UDP, TCP, RDT,
 * congestion control). Hver eksport er en SVG i 48×48 viewBox som arver
 * `currentColor`. Holdes bevisst enkle for å minne om kjente symboler
 * (envelope, handshake, sawtooth, fane-tilstand osv.).
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
// 3.1 — Transport-tjenester
// ------------------------------------------------------------------

export const SegmentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="2" />
    <line x1="16" y1="16" x2="16" y2="32" />
    <text x="10" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      H
    </text>
    <text x="30" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      DATA
    </text>
  </S>
);

export const EndToEndIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="6" cy="24" r="3" />
    <circle cx="42" cy="24" r="3" />
    <rect x="16" y="20" width="6" height="8" rx="1" />
    <rect x="26" y="20" width="6" height="8" rx="1" />
    <path d="M9 24h7M22 24h4M32 24h7" strokeDasharray="2 2" />
    <path d="M6 12c14 -4 28 -4 36 0" />
  </S>
);

export const LogicalLinkIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <path d="M14 24c4 -10 16 -10 20 0" strokeDasharray="3 2" />
    <path d="M14 24c4 10 16 10 20 0" strokeDasharray="3 2" />
  </S>
);

export const BestEffortIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 18l4 -4l4 4l4 -4l4 4l4 -4l4 4l4 -4l4 4" />
    <path d="M10 30h28" />
    <path d="M14 36l4 -4l4 4M28 36l4 -4l4 4" />
    <text x="24" y="14" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      ?
    </text>
  </S>
);

export const ServiceMenuIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="6" width="32" height="36" rx="2" />
    <line x1="14" y1="14" x2="34" y2="14" />
    <line x1="14" y1="20" x2="34" y2="20" />
    <line x1="14" y1="26" x2="34" y2="26" />
    <line x1="14" y1="32" x2="34" y2="32" />
    <circle cx="12" cy="14" r="1" />
    <circle cx="12" cy="20" r="1" />
    <circle cx="12" cy="26" r="1" />
  </S>
);

export const SocketIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="3" />
    <circle cx="16" cy="24" r="2" />
    <circle cx="24" cy="24" r="2" />
    <circle cx="32" cy="24" r="2" />
    <path d="M16 12v-4M24 12v-4M32 12v-4" />
  </S>
);

export const ApiVsIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 18h36" />
    <path d="M6 22h36" />
    <path d="M6 26h36" />
    <path d="M6 30h36" />
    <path d="M24 14v20" strokeDasharray="2 2" />
    <text x="14" y="12" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      TCP
    </text>
    <text x="34" y="12" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      UDP
    </text>
  </S>
);

export const ReliabilityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l16 6v10c0 10 -7 18 -16 20c-9 -2 -16 -10 -16 -20V12z" />
    <path d="M16 24l6 6l12 -12" />
  </S>
);

export const LatencyThroughputIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M10 34l8 -8l8 -2l8 -14" />
    <text x="40" y="14" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      tput
    </text>
    <text x="38" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      latency
    </text>
  </S>
);

export const TlsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="12" y="20" width="24" height="20" rx="2" />
    <path d="M16 20v-6a8 8 0 0116 0v6" />
    <circle cx="24" cy="30" r="2" />
    <line x1="24" y1="32" x2="24" y2="36" />
  </S>
);

export const ConnectionOrientedIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <path d="M14 22l20 0M34 22l-3 -2M34 22l-3 2" />
    <path d="M34 26l-20 0M14 26l3 -2M14 26l3 2" />
    <path d="M14 30l20 0M34 30l-3 -2M34 30l-3 2" />
  </S>
);

export const HolBlockingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="8" height="12" rx="1" />
    <rect x="14" y="18" width="8" height="12" rx="1" />
    <rect x="24" y="18" width="8" height="12" rx="1" />
    <rect x="34" y="18" width="8" height="12" rx="1" strokeDasharray="2 2" />
    <line x1="34" y1="18" x2="42" y2="30" strokeWidth="2.5" />
    <line x1="42" y1="18" x2="34" y2="30" strokeWidth="2.5" />
  </S>
);

export const FullDuplexIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="40" cy="24" r="3" />
    <path d="M11 20h26M37 20l-3 -2M37 20l-3 2" />
    <path d="M37 28h-26M11 28l3 -2M11 28l3 2" />
  </S>
);

// ------------------------------------------------------------------
// 3.2 — Mux/demux
// ------------------------------------------------------------------

export const PortNumberIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="29" textAnchor="middle" fontSize="11" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      :443
    </text>
  </S>
);

export const MuxIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="8" height="6" rx="1" />
    <rect x="4" y="21" width="8" height="6" rx="1" />
    <rect x="4" y="34" width="8" height="6" rx="1" />
    <path d="M12 11l12 11M12 24l12 0M12 37l12 -11" />
    <rect x="24" y="20" width="14" height="8" rx="1" />
    <path d="M38 24h6" />
  </S>
);

export const DemuxIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 24h6" />
    <rect x="10" y="20" width="14" height="8" rx="1" />
    <path d="M24 24l12 -13M24 24l12 0M24 24l12 13" />
    <rect x="36" y="8" width="8" height="6" rx="1" />
    <rect x="36" y="21" width="8" height="6" rx="1" />
    <rect x="36" y="34" width="8" height="6" rx="1" />
  </S>
);

export const TwoTupleIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      dst IP
    </text>
    <line x1="10" y1="24" x2="38" y2="24" strokeDasharray="2 2" />
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      dst port
    </text>
  </S>
);

export const FourTupleIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="2" />
    <line x1="24" y1="10" x2="24" y2="38" strokeDasharray="2 2" />
    <line x1="4" y1="24" x2="44" y2="24" strokeDasharray="2 2" />
    <text x="14" y="20" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      src IP
    </text>
    <text x="34" y="20" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      dst IP
    </text>
    <text x="14" y="33" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      src pt
    </text>
    <text x="34" y="33" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      dst pt
    </text>
  </S>
);

export const ListenSocketIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="6" />
    <path d="M16 16c-4 4 -4 12 0 16M32 16c4 4 4 12 0 16" />
    <path d="M10 12c-6 6 -6 18 0 24M38 12c6 6 6 18 0 24" />
  </S>
);

export const EphemeralPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" strokeDasharray="3 2" />
    <text x="24" y="29" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      :51873
    </text>
  </S>
);

export const WellKnownPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M14 8l4 6l4 -6M26 8l4 6l4 -6" />
    <text x="24" y="29" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      0-1023
    </text>
  </S>
);

export const RegisteredPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      1024-49151
    </text>
  </S>
);

export const DynamicPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" strokeDasharray="2 2" />
    <text x="24" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      49152+
    </text>
  </S>
);

export const NatIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="14" rx="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      NAT
    </text>
    <path d="M14 12l-4 6l4 6M34 12l4 6l-4 6" />
  </S>
);

export const BindConnectIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="14" height="12" rx="2" />
    <rect x="28" y="26" width="14" height="12" rx="2" />
    <path d="M20 16l8 16" strokeDasharray="2 2" />
    <text x="13" y="18" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      bind
    </text>
    <text x="35" y="34" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      conn
    </text>
  </S>
);

export const PortExhaustionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <line x1="10" y1="18" x2="14" y2="18" strokeWidth="3" />
    <line x1="16" y1="18" x2="20" y2="18" strokeWidth="3" />
    <line x1="22" y1="18" x2="26" y2="18" strokeWidth="3" />
    <line x1="28" y1="18" x2="32" y2="18" strokeWidth="3" />
    <line x1="34" y1="18" x2="38" y2="18" strokeWidth="3" />
    <line x1="10" y1="24" x2="14" y2="24" strokeWidth="3" />
    <line x1="16" y1="24" x2="20" y2="24" strokeWidth="3" />
    <line x1="22" y1="24" x2="26" y2="24" strokeWidth="3" />
    <line x1="28" y1="24" x2="32" y2="24" strokeWidth="3" />
    <line x1="34" y1="24" x2="38" y2="24" strokeWidth="3" />
    <path d="M6 30l36 6M42 30l-36 6" strokeWidth="2.5" />
  </S>
);

export const RstIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <line x1="12" y1="12" x2="36" y2="36" strokeWidth="3" />
    <text x="24" y="27" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      RST
    </text>
  </S>
);

// ------------------------------------------------------------------
// 3.3 — UDP
// ------------------------------------------------------------------

export const ConnectionlessIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="20" height="14" rx="1" />
    <path d="M6 14l10 8l10 -8" />
    <path d="M30 18l8 -4M30 22l8 0M30 26l8 4" />
  </S>
);

export const UdpHeaderIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="1" />
    <line x1="14" y1="16" x2="14" y2="32" />
    <line x1="24" y1="16" x2="24" y2="32" />
    <line x1="34" y1="16" x2="34" y2="32" />
    <text x="9" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      src
    </text>
    <text x="19" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      dst
    </text>
    <text x="29" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      len
    </text>
    <text x="39" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      cks
    </text>
  </S>
);

export const ChecksumIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      0xA3F1
    </text>
    <path d="M14 28l6 6l14 -14" strokeWidth="2" />
  </S>
);

export const MessageBoundaryIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="10" height="12" rx="1" />
    <rect x="18" y="18" width="10" height="12" rx="1" />
    <rect x="32" y="18" width="12" height="12" rx="1" />
    <path d="M14 18v12M28 18v12" strokeWidth="2" />
  </S>
);

export const UdpVsTcpIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 10v28" strokeWidth="2" />
    <path d="M14 18l-4 4l4 4" />
    <path d="M34 10v28" strokeWidth="2" />
    <circle cx="34" cy="14" r="2" />
    <circle cx="34" cy="22" r="2" />
    <circle cx="34" cy="30" r="2" />
    <text x="14" y="46" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      UDP
    </text>
    <text x="34" y="46" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      TCP
    </text>
  </S>
);

export const QuicIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      QUIC
    </text>
    <text x="24" y="30" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      / UDP /
    </text>
    <path d="M10 38h28" />
  </S>
);

export const PseudoHeaderIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="10" rx="1" strokeDasharray="2 2" />
    <rect x="4" y="22" width="40" height="16" rx="1" />
    <text x="24" y="17" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      pseudo (IP)
    </text>
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      UDP
    </text>
  </S>
);

export const MaxPacketIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="1" />
    <path d="M2 24h4M42 24h4" />
    <path d="M6 21l-2 3l2 3M42 21l2 3l-2 3" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      65507
    </text>
  </S>
);

export const OptionalChecksumIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" strokeDasharray="2 2" />
    <text x="24" y="22" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      0x0000
    </text>
    <text x="24" y="32" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      (valgfri)
    </text>
  </S>
);

export const PortUnreachableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="26" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      ICMP
    </text>
    <line x1="10" y1="38" x2="38" y2="38" strokeDasharray="2 2" />
    <line x1="14" y1="10" x2="34" y2="10" strokeWidth="2.5" />
  </S>
);

export const UseCasesIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="4" />
    <circle cx="34" cy="14" r="4" />
    <circle cx="14" cy="34" r="4" />
    <circle cx="34" cy="34" r="4" />
    <text x="14" y="16" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      DNS
    </text>
    <text x="34" y="16" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      NTP
    </text>
    <text x="14" y="36" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      VoIP
    </text>
    <text x="34" y="36" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      DHCP
    </text>
  </S>
);

export const VoipIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 18c4 -6 24 -6 28 0" />
    <path d="M14 22c2 -3 18 -3 20 0" />
    <path d="M18 26c1 -2 11 -2 12 0" />
    <rect x="20" y="30" width="8" height="6" rx="1" />
    <line x1="24" y1="36" x2="24" y2="40" />
  </S>
);

export const DccpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" strokeDasharray="2 2" />
    <text x="24" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      DCCP
    </text>
  </S>
);

// ------------------------------------------------------------------
// 3.4 — RDT, ACK/NAK, windows
// ------------------------------------------------------------------

export const Rdt1Icon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <circle cx="38" cy="24" r="3" />
    <path d="M13 24h22M35 24l-3 -2M35 24l-3 2" />
    <text x="24" y="38" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      1.0
    </text>
  </S>
);

export const Rdt2Icon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="3" />
    <circle cx="38" cy="14" r="3" />
    <path d="M13 14h22" />
    <path d="M35 34l-22 0M13 34l3 -2M13 34l3 2" />
    <text x="24" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      ACK/NAK
    </text>
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      2.0
    </text>
  </S>
);

export const Rdt21Icon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="3" />
    <circle cx="38" cy="14" r="3" />
    <path d="M13 14h22" />
    <text x="24" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      seq 0/1
    </text>
    <path d="M35 34l-22 0M13 34l3 -2M13 34l3 2" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      2.1
    </text>
  </S>
);

export const Rdt22Icon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="3" />
    <circle cx="38" cy="14" r="3" />
    <path d="M13 14h22" />
    <text x="24" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      dup-ACK
    </text>
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      2.2
    </text>
  </S>
);

export const Rdt3Icon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="10" r="3" />
    <circle cx="38" cy="10" r="3" />
    <path d="M13 10h22" strokeDasharray="2 2" />
    <circle cx="10" cy="24" r="6" strokeWidth="1.5" />
    <path d="M10 20v4l3 2" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      3.0
    </text>
  </S>
);

export const StopAndWaitIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="10" y1="6" x2="10" y2="42" strokeWidth="1.5" />
    <line x1="38" y1="6" x2="38" y2="42" strokeWidth="1.5" />
    <path d="M10 12l28 6" />
    <path d="M38 22l-28 6" strokeDasharray="2 2" />
    <path d="M10 32l28 6" />
  </S>
);

export const PipeliningIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="10" y1="6" x2="10" y2="42" strokeWidth="1.5" />
    <line x1="38" y1="6" x2="38" y2="42" strokeWidth="1.5" />
    <path d="M10 10l28 5" />
    <path d="M10 14l28 5" />
    <path d="M10 18l28 5" />
    <path d="M10 22l28 5" />
    <path d="M38 28l-28 4" strokeDasharray="2 2" />
    <path d="M38 32l-28 4" strokeDasharray="2 2" />
  </S>
);

export const GoBackNIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="30" x2="44" y2="30" />
    <rect x="8" y="20" width="6" height="10" />
    <rect x="14" y="20" width="6" height="10" />
    <rect x="20" y="20" width="6" height="10" fill="currentColor" fillOpacity="0.3" />
    <rect x="26" y="20" width="6" height="10" />
    <rect x="32" y="20" width="6" height="10" />
    <path d="M30 14l-8 -6M22 8l8 -2M22 8v6" />
  </S>
);

export const SelectiveRepeatIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="30" x2="44" y2="30" />
    <rect x="8" y="20" width="6" height="10" />
    <rect x="14" y="20" width="6" height="10" />
    <rect x="20" y="20" width="6" height="10" fill="currentColor" fillOpacity="0.3" />
    <rect x="26" y="20" width="6" height="10" />
    <rect x="32" y="20" width="6" height="10" />
    <path d="M23 14l0 4M21 16l4 0" />
    <path d="M23 8l0 4" />
  </S>
);

export const SeqSpaceIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="24" x2="44" y2="24" />
    <line x1="8" y1="20" x2="8" y2="28" />
    <line x1="16" y1="20" x2="16" y2="28" />
    <line x1="24" y1="20" x2="24" y2="28" />
    <line x1="32" y1="20" x2="32" y2="28" />
    <line x1="40" y1="20" x2="40" y2="28" />
    <text x="8" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      0
    </text>
    <text x="16" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      1
    </text>
    <text x="24" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      2
    </text>
    <text x="32" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      3
    </text>
    <text x="40" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      N
    </text>
  </S>
);

export const UtilizationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="10" />
    <rect x="6" y="20" width="9" height="10" fill="currentColor" fillOpacity="0.4" />
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      U = L/R / RTT
    </text>
  </S>
);

export const BdpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="6" />
    <circle cx="10" cy="24" r="1.5" fill="currentColor" />
    <circle cx="18" cy="24" r="1.5" fill="currentColor" />
    <circle cx="26" cy="24" r="1.5" fill="currentColor" />
    <circle cx="34" cy="24" r="1.5" fill="currentColor" />
    <circle cx="42" cy="24" r="1.5" fill="currentColor" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      B × RTT
    </text>
  </S>
);

export const DuplicateDetectIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="14" height="14" rx="2" />
    <rect x="28" y="24" width="14" height="14" rx="2" strokeDasharray="2 2" />
    <text x="13" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      5
    </text>
    <text x="35" y="34" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      5
    </text>
    <path d="M28 24l-8 -8" />
  </S>
);

export const NakDupAckIcon = (p: IconProps) => (
  <S {...p}>
    <text x="14" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      NAK
    </text>
    <path d="M18 24h12M30 24l-3 -2M30 24l-3 2" />
    <text x="36" y="30" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      ACK
    </text>
    <text x="36" y="38" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      ACK
    </text>
  </S>
);

export const TimerIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="26" r="14" />
    <path d="M24 18v8l6 4" />
    <path d="M16 6h16" />
    <path d="M20 6v4M28 6v4" />
  </S>
);

// ------------------------------------------------------------------
// 3.5 — TCP
// ------------------------------------------------------------------

export const SegmentationIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 14h36" strokeWidth="3" />
    <path d="M14 18v6M22 18v6M30 18v6M38 18v6" strokeDasharray="2 1" />
    <rect x="6" y="28" width="8" height="10" rx="1" />
    <rect x="16" y="28" width="8" height="10" rx="1" />
    <rect x="26" y="28" width="8" height="10" rx="1" />
    <rect x="36" y="28" width="6" height="10" rx="1" />
  </S>
);

export const SeqNumIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="1" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      seq=104857
    </text>
  </S>
);

export const CumAckIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="30" x2="44" y2="30" />
    <rect x="6" y="22" width="6" height="8" fill="currentColor" fillOpacity="0.3" />
    <rect x="13" y="22" width="6" height="8" fill="currentColor" fillOpacity="0.3" />
    <rect x="20" y="22" width="6" height="8" fill="currentColor" fillOpacity="0.3" />
    <rect x="27" y="22" width="6" height="8" />
    <rect x="34" y="22" width="6" height="8" />
    <text x="33" y="18" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      ACK 4
    </text>
  </S>
);

export const FastRetransmitIcon = (p: IconProps) => (
  <S {...p}>
    <text x="10" y="12" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      ACK 4
    </text>
    <text x="10" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      ACK 4
    </text>
    <text x="10" y="32" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      ACK 4
    </text>
    <path d="M22 22h14M36 22l-3 -2M36 22l-3 2" strokeWidth="2" />
    <text x="40" y="26" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      RX
    </text>
  </S>
);

export const RttEstimateIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 36V10" />
    <path d="M6 36h36" />
    <path d="M8 30c4 -4 8 -10 12 -6c4 4 8 -12 12 -4c4 8 8 -4 10 0" />
    <text x="40" y="14" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      EWMA
    </text>
  </S>
);

export const FlowControlIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="24" height="14" />
    <rect x="6" y="18" width="12" height="14" fill="currentColor" fillOpacity="0.3" />
    <text x="36" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      rwnd
    </text>
    <path d="M30 28h12" />
    <path d="M42 28l-3 -2M42 28l-3 2" />
  </S>
);

export const HandshakeIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="10" y1="6" x2="10" y2="42" strokeWidth="1.5" />
    <line x1="38" y1="6" x2="38" y2="42" strokeWidth="1.5" />
    <path d="M10 12l28 6" />
    <path d="M38 22l-28 6" />
    <path d="M10 32l28 6" />
    <text x="14" y="11" fontSize="5" stroke="none" fill="currentColor">
      SYN
    </text>
    <text x="20" y="20" fontSize="5" stroke="none" fill="currentColor">
      SA
    </text>
    <text x="14" y="31" fontSize="5" stroke="none" fill="currentColor">
      ACK
    </text>
  </S>
);

export const TcpStatesIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="10" width="14" height="10" rx="1" />
    <rect x="32" y="10" width="14" height="10" rx="1" />
    <rect x="17" y="28" width="14" height="10" rx="1" />
    <path d="M16 15l16 0M32 15l-3 -2M32 15l-3 2" />
    <path d="M30 33l3 -6M30 33l-3 -6" />
    <text x="9" y="17" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      CLOSED
    </text>
    <text x="39" y="17" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      LISTEN
    </text>
    <text x="24" y="35" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      EST
    </text>
  </S>
);

export const TcpFlagsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="14" rx="1" />
    <line x1="11" y1="18" x2="11" y2="32" />
    <line x1="18" y1="18" x2="18" y2="32" />
    <line x1="25" y1="18" x2="25" y2="32" />
    <line x1="32" y1="18" x2="32" y2="32" />
    <line x1="39" y1="18" x2="39" y2="32" />
    <text x="7.5" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      S
    </text>
    <text x="14.5" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      A
    </text>
    <text x="21.5" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      F
    </text>
    <text x="28.5" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      R
    </text>
    <text x="35.5" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      P
    </text>
    <text x="41.5" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      U
    </text>
  </S>
);

export const IsnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      ISN =
    </text>
    <text x="24" y="30" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      0xA47C3F
    </text>
  </S>
);

export const TimeWaitIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" strokeDasharray="3 2" />
    <path d="M24 14v10l7 4" />
    <text x="24" y="44" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      2·MSL
    </text>
  </S>
);

export const MssIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" />
    <line x1="14" y1="18" x2="14" y2="30" />
    <line x1="34" y1="18" x2="34" y2="30" />
    <text x="9" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      IP
    </text>
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      MSS=1460
    </text>
    <text x="39" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      TCP
    </text>
  </S>
);

export const KarnAlgIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="10" y1="6" x2="10" y2="42" strokeWidth="1.5" />
    <line x1="38" y1="6" x2="38" y2="42" strokeWidth="1.5" />
    <path d="M10 10l28 6" />
    <path d="M10 24l28 6" strokeDasharray="2 2" />
    <path d="M38 32l-28 6" />
    <line x1="20" y1="10" x2="30" y2="40" stroke="currentColor" strokeWidth="2" />
    <line x1="30" y1="10" x2="20" y2="40" stroke="currentColor" strokeWidth="2" />
  </S>
);

export const NagleIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="4" height="8" />
    <rect x="10" y="20" width="4" height="8" />
    <rect x="16" y="20" width="4" height="8" />
    <path d="M22 24l4 0M26 24l-2 -2M26 24l-2 2" />
    <rect x="30" y="18" width="14" height="12" />
  </S>
);

export const DelayedAckIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="12" />
    <path d="M24 16v8l6 4" />
    <text x="24" y="44" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      ACK
    </text>
  </S>
);

export const TcpOptionsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="8" />
    <rect x="4" y="20" width="40" height="8" strokeDasharray="2 2" />
    <text x="24" y="16" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      header
    </text>
    <text x="24" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      MSS, SACK, TS
    </text>
  </S>
);

export const HalfCloseIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <circle cx="38" cy="24" r="3" />
    <path d="M13 20h22M35 20l-3 -2M35 20l-3 2" />
    <text x="24" y="18" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor">
      FIN
    </text>
    <path d="M35 28h-22M13 28l3 -2M13 28l3 2" strokeDasharray="2 2" />
  </S>
);

// ------------------------------------------------------------------
// 3.6 — Congestion control
// ------------------------------------------------------------------

export const CongestionCollapseIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 14l10 8l-6 4l8 4l-4 4l10 6" strokeWidth="2" />
    <path d="M28 38l4 -4l-6 -4l8 -4l-4 -4l6 -6" strokeWidth="2" strokeDasharray="2 2" />
  </S>
);

export const CwndIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="10" />
    <rect x="4" y="20" width="20" height="10" fill="currentColor" fillOpacity="0.3" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">
      cwnd
    </text>
  </S>
);

export const AimdIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 36l8 -16l0 8l8 -12l0 6l10 -14" strokeWidth="1.8" />
  </S>
);

export const SlowStartIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 38c4 0 6 -2 8 -6c2 -4 4 -10 8 -16c4 -6 10 -12 20 -16" strokeWidth="1.8" />
  </S>
);

export const TcpRenoIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 36c4 -4 6 -10 10 -16l0 12l4 -8l0 6l4 -8l0 6l4 -8" strokeWidth="1.8" />
    <text x="40" y="14" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      Reno
    </text>
  </S>
);

export const TcpCubicIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 36c6 -2 14 -22 18 -22c4 0 12 4 18 6" strokeWidth="1.8" />
    <text x="40" y="14" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      Cubic
    </text>
  </S>
);

export const BbrIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M8 36c4 -2 8 -10 12 -12s8 -2 12 -4s8 -6 10 -8" strokeWidth="1.8" />
    <circle cx="20" cy="24" r="2" />
    <circle cx="32" cy="20" r="2" />
    <text x="40" y="14" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      BBR
    </text>
  </S>
);

export const FairnessIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="16" height="20" />
    <rect x="26" y="14" width="16" height="20" />
    <rect x="6" y="18" width="16" height="16" fill="currentColor" fillOpacity="0.3" />
    <rect x="26" y="18" width="16" height="16" fill="currentColor" fillOpacity="0.3" />
    <path d="M22 24h4" />
  </S>
);

export const SsthreshIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 38c4 -2 6 -8 12 -16" strokeWidth="1.8" />
    <path d="M18 22l6 -4l6 -4l6 -2" strokeWidth="1.8" />
    <line x1="6" y1="22" x2="42" y2="22" strokeDasharray="2 2" />
    <text x="40" y="20" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      ssthresh
    </text>
  </S>
);

export const TimeoutVsDupAckIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="6" />
    <path d="M14 10v4l3 2" />
    <text x="14" y="30" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      cwnd=1
    </text>
    <text x="34" y="14" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      3 dup
    </text>
    <text x="34" y="30" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      /2
    </text>
    <line x1="24" y1="6" x2="24" y2="42" strokeDasharray="2 2" />
  </S>
);

export const EcnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="14" rx="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      ECN
    </text>
    <path d="M14 10l4 6l4 -6M26 10l4 6l4 -6" />
  </S>
);

export const AimdThroughputIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      MSS/RTT√p
    </text>
  </S>
);

export const TcpTahoeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 36c4 -4 6 -10 10 -16M16 20v18M16 38c4 -4 6 -10 10 -16M26 22v16" strokeWidth="1.8" />
    <text x="40" y="14" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      Tahoe
    </text>
  </S>
);

export const BufferbloatIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="14" rx="2" />
    <rect x="6" y="20" width="36" height="10" fill="currentColor" fillOpacity="0.5" />
    <path d="M44 24h2" />
    <text x="24" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor">
      stor kø
    </text>
  </S>
);

export const SelfClockingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M24 14v10l6 4" />
    <path d="M40 16l4 -2M40 32l4 2M4 16l-2 -2M4 32l-2 2" />
  </S>
);

export const SenderWindowIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="8" />
    <rect x="6" y="14" width="14" height="8" fill="currentColor" fillOpacity="0.3" />
    <rect x="6" y="26" width="36" height="8" />
    <rect x="6" y="26" width="22" height="8" fill="currentColor" fillOpacity="0.3" />
    <text x="44" y="20" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      cwnd
    </text>
    <text x="44" y="32" textAnchor="end" fontSize="5" stroke="none" fill="currentColor">
      rwnd
    </text>
  </S>
);

export const ConvergenceIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38V10" />
    <path d="M6 38h36" />
    <path d="M6 14l36 16" strokeDasharray="2 2" />
    <path d="M10 30c4 -8 6 4 8 -4c2 -8 4 4 8 -2c4 -6 6 2 10 -2" strokeWidth="1.8" />
  </S>
);
