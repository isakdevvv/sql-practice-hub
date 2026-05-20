import * as React from "react";

/**
 * Ikoner for VisualDefs i KuroseKap2Page (applikasjonslaget):
 * HTTP, DNS, SMTP/IMAP, P2P/BitTorrent, video/CDN og sockets.
 *
 * Samme stil-konvensjon som visualDefIcons.tsx: 48×48 viewBox,
 * currentColor stroke, enkle gjenkjennelige former. Hvert ikon er
 * en standalone React-komponent som tar IconProps videre til <svg>.
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
// 2.1 — App-arkitektur, sockets, transport-services
// ------------------------------------------------------------------

export const ClientServerArchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="6" width="14" height="20" rx="1.5" />
    <line x1="23" y1="10" x2="31" y2="10" />
    <line x1="23" y1="14" x2="31" y2="14" />
    <line x1="23" y1="18" x2="31" y2="18" />
    <path d="M27 26v6" />
    <path d="M27 32l-12 8M27 32l0 8M27 32l12 8" />
    <rect x="10" y="38" width="10" height="6" rx="1" />
    <rect x="22" y="38" width="10" height="6" rx="1" />
    <rect x="34" y="38" width="10" height="6" rx="1" />
  </S>
);

export const P2PArchIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="12" r="4" />
    <circle cx="38" cy="12" r="4" />
    <circle cx="10" cy="36" r="4" />
    <circle cx="38" cy="36" r="4" />
    <circle cx="24" cy="24" r="4" />
    <line x1="14" y1="12" x2="34" y2="12" />
    <line x1="14" y1="36" x2="34" y2="36" />
    <line x1="10" y1="16" x2="10" y2="32" />
    <line x1="38" y1="16" x2="38" y2="32" />
    <line x1="14" y1="14" x2="22" y2="22" />
    <line x1="34" y1="14" x2="26" y2="22" />
    <line x1="14" y1="34" x2="22" y2="26" />
    <line x1="34" y1="34" x2="26" y2="26" />
  </S>
);

export const HybridArchIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="4" width="12" height="10" rx="1.5" />
    <line x1="20" y1="7" x2="28" y2="7" />
    <line x1="20" y1="10" x2="28" y2="10" />
    <line x1="24" y1="14" x2="12" y2="26" strokeDasharray="2 2" />
    <line x1="24" y1="14" x2="36" y2="26" strokeDasharray="2 2" />
    <circle cx="10" cy="30" r="4" />
    <circle cx="38" cy="30" r="4" />
    <circle cx="24" cy="42" r="4" />
    <path d="M14 30h20M10 34l13 7M38 34l-13 7" />
  </S>
);

export const SocketPlugIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="16" width="20" height="16" rx="2" />
    <circle cx="12" cy="22" r="1.5" fill="currentColor" />
    <circle cx="20" cy="22" r="1.5" fill="currentColor" />
    <circle cx="16" cy="28" r="1.5" fill="currentColor" />
    <path d="M26 24h6" />
    <path d="M32 18l8 6-8 6z" fill="currentColor" />
  </S>
);

export const AddrPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <text x="14" y="27" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      IP
    </text>
    <line x1="24" y1="18" x2="24" y2="30" />
    <text x="36" y="27" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      :port
    </text>
  </S>
);

export const TransportMenuIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="6" width="28" height="36" rx="2" />
    <line x1="14" y1="14" x2="34" y2="14" />
    <line x1="14" y1="22" x2="34" y2="22" />
    <line x1="14" y1="30" x2="34" y2="30" />
    <line x1="14" y1="38" x2="34" y2="38" />
    <path d="M15 13l1.5 1.5L19 12" />
    <path d="M15 21l1.5 1.5L19 19" />
  </S>
);

export const ProtocolDocIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 6h20l8 8v28H10z" />
    <path d="M30 6v8h8" />
    <line x1="14" y1="22" x2="34" y2="22" />
    <line x1="14" y1="28" x2="34" y2="28" />
    <line x1="14" y1="34" x2="28" y2="34" />
  </S>
);

export const PortNumberIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="24" rx="2" />
    <text x="24" y="29" textAnchor="middle" fontSize="11" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      :443
    </text>
    <line x1="6" y1="18" x2="42" y2="18" />
  </S>
);

export const ThroughputJitterIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 36L12 28L18 32L26 18L34 24L44 12" />
    <circle cx="12" cy="28" r="1.5" fill="currentColor" />
    <circle cx="26" cy="18" r="1.5" fill="currentColor" />
    <circle cx="44" cy="12" r="1.5" fill="currentColor" />
    <line x1="4" y1="42" x2="44" y2="42" />
    <line x1="4" y1="42" x2="4" y2="8" />
  </S>
);

export const RttLoopIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <circle cx="38" cy="24" r="4" />
    <path d="M14 22c8-12 16-12 20 0" />
    <path d="M30 16l4 6-6 2" />
    <path d="M34 26c-8 12-16 12-20 0" />
    <path d="M18 32l-4-6 6-2" />
  </S>
);

export const StateMemoryIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <rect x="11" y="15" width="26" height="6" rx="1" />
    <rect x="11" y="24" width="26" height="6" rx="1" />
    <circle cx="14" cy="34" r="1.5" fill="currentColor" />
    <circle cx="18" cy="34" r="1.5" fill="currentColor" />
    <circle cx="22" cy="34" r="1.5" fill="currentColor" />
  </S>
);

export const PushPullIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" rx="1.5" />
    <rect x="30" y="14" width="14" height="20" rx="1.5" />
    <path d="M18 20h12M30 20l-3-2M30 20l-3 2" />
    <path d="M30 28H18M18 28l3-2M18 28l3 2" />
  </S>
);

export const BdpPipeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 18h40v12H4z" />
    <circle cx="10" cy="24" r="1.5" fill="currentColor" />
    <circle cx="16" cy="24" r="1.5" fill="currentColor" />
    <circle cx="22" cy="24" r="1.5" fill="currentColor" />
    <circle cx="28" cy="24" r="1.5" fill="currentColor" />
    <circle cx="34" cy="24" r="1.5" fill="currentColor" />
    <circle cx="40" cy="24" r="1.5" fill="currentColor" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      BW × RTT
    </text>
  </S>
);

// ------------------------------------------------------------------
// 2.2 — HTTP
// ------------------------------------------------------------------

export const ReqResIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="12" height="32" rx="1.5" />
    <rect x="32" y="8" width="12" height="32" rx="1.5" />
    <path d="M16 18h16M32 18l-3-2M32 18l-3 2" />
    <path d="M32 30H16M16 30l3-2M16 30l3 2" />
    <text x="22" y="14" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      GET
    </text>
    <text x="26" y="36" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      200
    </text>
  </S>
);

export const PersistentChainIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="10" height="8" rx="1.5" />
    <rect x="19" y="20" width="10" height="8" rx="1.5" />
    <rect x="34" y="20" width="10" height="8" rx="1.5" />
    <line x1="14" y1="24" x2="19" y2="24" />
    <line x1="29" y1="24" x2="34" y2="24" />
    <text x="9" y="38" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      req1
    </text>
    <text x="24" y="38" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      req2
    </text>
    <text x="39" y="38" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      req3
    </text>
  </S>
);

export const HolBlockIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="8" height="10" rx="1" />
    <rect x="16" y="20" width="8" height="10" rx="1" />
    <rect x="26" y="20" width="8" height="10" rx="1" />
    <rect x="36" y="20" width="8" height="10" rx="1" />
    <line x1="10" y1="14" x2="10" y2="20" />
    <path d="M6 14h8M10 8v6" />
    <line x1="6" y1="36" x2="44" y2="36" strokeDasharray="2 2" />
    <text x="10" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      slow
    </text>
  </S>
);

export const Http2Icon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 24c10-6 10-6 20 0s10 6 20 0" />
    <path d="M4 24c10 6 10 6 20 0s10-6 20 0" />
    <text x="24" y="42" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontWeight="bold">
      H/2
    </text>
  </S>
);

export const Http3QuicIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 18l8-8 6 6 6-6 6 6 6-6 6 8" />
    <path d="M6 30l8 8 6-6 6 6 6-6 6 6 6-8" />
    <text x="24" y="28" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontWeight="bold">
      QUIC
    </text>
  </S>
);

export const CookieIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    <circle cx="28" cy="22" r="1.5" fill="currentColor" />
    <circle cx="22" cy="30" r="1.5" fill="currentColor" />
    <circle cx="30" cy="30" r="1.5" fill="currentColor" />
    <circle cx="16" cy="28" r="1.5" fill="currentColor" />
  </S>
);

export const HttpMethodIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="12" width="40" height="24" rx="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      GET
    </text>
    <path d="M4 18l40 0" />
  </S>
);

export const StatusBadgeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="29" textAnchor="middle" fontSize="12" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      2xx
    </text>
  </S>
);

export const ConditionalGetIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="14" rx="2" />
    <text x="24" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      If-None-Match
    </text>
    <path d="M24 24v6M22 28l2 2 2-2" />
    <rect x="6" y="30" width="36" height="12" rx="2" />
    <text x="24" y="39" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontWeight="bold">
      304
    </text>
  </S>
);

export const ProxyCacheIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="10" height="20" rx="1.5" />
    <rect x="19" y="14" width="10" height="20" rx="1.5" />
    <rect x="32" y="14" width="10" height="20" rx="1.5" />
    <path d="M16 24h3M29 24h3" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      cache
    </text>
  </S>
);

export const CorsIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="16" cy="24" r="10" />
    <circle cx="32" cy="24" r="10" />
    <text x="16" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      app
    </text>
    <text x="32" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      api
    </text>
    <path d="M24 14l-2 4h4l-2 4" strokeWidth="1.2" />
  </S>
);

export const HttpsLockIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="22" width="28" height="20" rx="2" />
    <path d="M16 22v-6a8 8 0 0116 0v6" />
    <circle cx="24" cy="32" r="2" />
    <line x1="24" y1="34" x2="24" y2="38" />
  </S>
);

// ------------------------------------------------------------------
// 2.3 — DNS
// ------------------------------------------------------------------

export const HierarchyTreeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="8" r="3" />
    <circle cx="12" cy="24" r="3" />
    <circle cx="24" cy="24" r="3" />
    <circle cx="36" cy="24" r="3" />
    <circle cx="6" cy="40" r="3" />
    <circle cx="18" cy="40" r="3" />
    <circle cx="30" cy="40" r="3" />
    <circle cx="42" cy="40" r="3" />
    <line x1="24" y1="11" x2="12" y2="21" />
    <line x1="24" y1="11" x2="24" y2="21" />
    <line x1="24" y1="11" x2="36" y2="21" />
    <line x1="12" y1="27" x2="6" y2="37" />
    <line x1="12" y1="27" x2="18" y2="37" />
    <line x1="36" y1="27" x2="30" y2="37" />
    <line x1="36" y1="27" x2="42" y2="37" />
  </S>
);

export const RootServerIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      ROOT
    </text>
    <text x="24" y="32" textAnchor="middle" fontSize="14" stroke="none" fill="currentColor" fontWeight="bold">
      .
    </text>
  </S>
);

export const IterRecurIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="4" />
    <circle cx="24" cy="24" r="4" />
    <circle cx="40" cy="24" r="4" />
    <path d="M12 22h8M20 22l-2-1.5M20 22l-2 1.5" />
    <path d="M28 22h8M36 22l-2-1.5M36 22l-2 1.5" />
    <path d="M28 26h8M36 26l-2-1.5M36 26l-2 1.5" strokeDasharray="2 1" />
    <path d="M12 26h8M20 26l-2-1.5M20 26l-2 1.5" strokeDasharray="2 1" />
  </S>
);

export const TtlClockIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M24 14v10l8 4" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      TTL
    </text>
  </S>
);

export const DnsRecordIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="2" />
    <text x="10" y="20" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      A
    </text>
    <text x="10" y="28" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      MX
    </text>
    <text x="10" y="36" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      CNAME
    </text>
    <line x1="24" y1="14" x2="24" y2="36" />
    <text x="30" y="20" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      1.2.3.4
    </text>
    <text x="30" y="28" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      mx1
    </text>
    <text x="30" y="36" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      cdn
    </text>
  </S>
);

export const GlueIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="6" />
    <circle cx="34" cy="24" r="6" />
    <path d="M18 22l12 0" />
    <path d="M18 26l12 0" />
    <rect x="20" y="20" width="8" height="8" rx="1" fill="currentColor" />
  </S>
);

export const StubResolverIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="1.5" />
    <text x="13" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      OS
    </text>
    <path d="M20 24h12M32 24l-2-2M32 24l-2 2" />
    <circle cx="38" cy="24" r="6" />
  </S>
);

export const ReverseArrowIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="12" rx="1.5" />
    <text x="24" y="19" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      1.2.3.4
    </text>
    <path d="M24 24v6M22 28l2 2 2-2" strokeDasharray="2 1" />
    <rect x="4" y="30" width="40" height="12" rx="1.5" />
    <text x="24" y="39" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      host.no
    </text>
  </S>
);

export const AuthoritativeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="28" height="28" rx="2" />
    <path d="M24 16l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L15 23l6-1z" fill="currentColor" stroke="none" />
    <text x="24" y="44" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      AA
    </text>
  </S>
);

export const NegativeCacheIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="24" rx="2" />
    <text x="24" y="28" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      NX
    </text>
    <circle cx="24" cy="24" r="14" strokeWidth="2.5" />
    <line x1="14" y1="14" x2="34" y2="34" strokeWidth="2.5" />
  </S>
);

export const SignedShieldIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l14 4v12c0 10-7 17-14 20-7-3-14-10-14-20V10z" />
    <path d="M18 24l4 4 8-10" strokeWidth="2.2" />
  </S>
);

export const Edns0Icon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="14" height="12" rx="1.5" />
    <text x="11" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      512
    </text>
    <path d="M18 24h10M28 24l-2-2M28 24l-2 2" />
    <rect x="28" y="14" width="18" height="20" rx="1.5" />
    <text x="37" y="26" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      4096
    </text>
  </S>
);

// ------------------------------------------------------------------
// 2.4 — E-post og P2P
// ------------------------------------------------------------------

export const SmtpServerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="22" rx="2" />
    <path d="M6 10l18 14 18-14" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      SMTP
    </text>
  </S>
);

export const ImapMailboxIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="24" rx="2" />
    <path d="M16 14v-4h16v4" />
    <line x1="6" y1="22" x2="42" y2="22" />
    <circle cx="24" cy="30" r="2" fill="currentColor" />
  </S>
);

export const MimeAttachmentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="6" width="22" height="32" rx="2" />
    <line x1="12" y1="14" x2="26" y2="14" />
    <line x1="12" y1="20" x2="26" y2="20" />
    <line x1="12" y1="26" x2="20" y2="26" />
    <path d="M30 22c4 0 8 4 8 8s-4 8-8 8c-3 0-6-3-6-6s3-5 5-5 4 2 4 4-2 4-3 4" />
  </S>
);

export const SwarmIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="3" />
    <circle cx="8" cy="14" r="3" />
    <circle cx="40" cy="14" r="3" />
    <circle cx="8" cy="34" r="3" />
    <circle cx="40" cy="34" r="3" />
    <circle cx="24" cy="6" r="3" />
    <circle cx="24" cy="42" r="3" />
    <line x1="11" y1="14" x2="21" y2="22" />
    <line x1="37" y1="14" x2="27" y2="22" />
    <line x1="11" y1="34" x2="21" y2="26" />
    <line x1="37" y1="34" x2="27" y2="26" />
    <line x1="24" y1="9" x2="24" y2="21" />
    <line x1="24" y1="27" x2="24" y2="39" />
    <line x1="11" y1="14" x2="37" y2="14" strokeDasharray="2 2" />
    <line x1="11" y1="34" x2="37" y2="34" strokeDasharray="2 2" />
  </S>
);

export const ExchangeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="24" r="6" />
    <circle cx="36" cy="24" r="6" />
    <path d="M18 20h12M30 20l-2-2M30 20l-2 2" />
    <path d="M30 28H18M18 28l2-2M18 28l2 2" />
  </S>
);

export const DhtRingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <circle cx="24" cy="8" r="2.5" fill="currentColor" />
    <circle cx="40" cy="24" r="2.5" fill="currentColor" />
    <circle cx="24" cy="40" r="2.5" fill="currentColor" />
    <circle cx="8" cy="24" r="2.5" fill="currentColor" />
    <circle cx="35" cy="13" r="2.5" fill="currentColor" />
    <circle cx="35" cy="35" r="2.5" fill="currentColor" />
    <circle cx="13" cy="35" r="2.5" fill="currentColor" />
    <circle cx="13" cy="13" r="2.5" fill="currentColor" />
  </S>
);

export const HandshakeLinesIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="40" height="32" rx="2" />
    <line x1="8" y1="14" x2="44" y2="14" stroke="none" />
    <text x="6" y="17" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">HELO</text>
    <text x="6" y="24" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">MAIL FROM</text>
    <text x="6" y="31" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">RCPT TO</text>
    <text x="6" y="38" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">DATA</text>
  </S>
);

export const EnvelopeHeaderIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="12" width="40" height="24" rx="1.5" />
    <path d="M4 12l20 14 20-14" />
    <rect x="14" y="20" width="20" height="10" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" />
    <text x="24" y="27" textAnchor="middle" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      From:
    </text>
  </S>
);

export const SpfDmarcIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l14 4v12c0 10-7 17-14 20-7-3-14-10-14-20V10z" />
    <text x="24" y="28" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      SPF
    </text>
  </S>
);

export const ChunkPieceIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 10h12v4a2 2 0 004 0v-4h12v12h-4a2 2 0 000 4h4v12H34v-4a2 2 0 00-4 0v4H18v-4a2 2 0 00-4 0v4h-4V26h4a2 2 0 000-4h-4z" />
  </S>
);

export const RarestFirstIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="30" width="6" height="10" />
    <rect x="14" y="26" width="6" height="14" />
    <rect x="22" y="22" width="6" height="18" />
    <rect x="30" y="14" width="6" height="26" />
    <rect x="38" y="8" width="6" height="32" stroke="currentColor" strokeWidth="2.5" />
    <path d="M41 4l4 4-4 4M41 4v8" strokeWidth="1.5" />
  </S>
);

export const TrackerListIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <line x1="10" y1="14" x2="38" y2="14" />
    <text x="11" y="13" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">peers</text>
    <line x1="10" y1="22" x2="38" y2="22" />
    <line x1="10" y1="30" x2="38" y2="30" />
    <line x1="10" y1="38" x2="38" y2="38" />
    <circle cx="14" cy="26" r="1.5" fill="currentColor" />
    <circle cx="14" cy="34" r="1.5" fill="currentColor" />
  </S>
);

export const ChokingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="6" />
    <circle cx="34" cy="24" r="6" />
    <path d="M20 24h8" strokeDasharray="2 2" />
    <line x1="20" y1="18" x2="28" y2="30" strokeWidth="2.5" />
    <line x1="28" y1="18" x2="20" y2="30" strokeWidth="2.5" />
  </S>
);

// ------------------------------------------------------------------
// 2.5 — Video og CDN
// ------------------------------------------------------------------

export const BitrateLadderIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 40l4-6 6 0M18 34l6 0 0-6M24 28l6 0 0-6M30 22l6 0 0-6M36 16l4 0" />
    <path d="M14 40l4-6h2l2-4h2l2-4h2l2-4h2l2-4" />
    <circle cx="8" cy="40" r="2" fill="currentColor" />
    <polygon points="22,18 28,22 22,26" fill="currentColor" />
  </S>
);

export const ManifestIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 6h20l8 8v28H10z" />
    <path d="M30 6v8h8" />
    <line x1="14" y1="22" x2="34" y2="22" />
    <line x1="14" y1="26" x2="30" y2="26" />
    <line x1="14" y1="30" x2="34" y2="30" />
    <line x1="14" y1="34" x2="28" y2="34" />
    <text x="14" y="18" fontSize="4" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">.mpd</text>
  </S>
);

export const CdnGlobeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <ellipse cx="24" cy="24" rx="8" ry="18" />
    <line x1="6" y1="24" x2="42" y2="24" />
    <circle cx="14" cy="14" r="2" fill="currentColor" />
    <circle cx="34" cy="14" r="2" fill="currentColor" />
    <circle cx="14" cy="34" r="2" fill="currentColor" />
    <circle cx="34" cy="34" r="2" fill="currentColor" />
  </S>
);

export const CdnWhyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="6" />
    <circle cx="34" cy="24" r="6" />
    <path d="M20 24h8M28 24l-2-2M28 24l-2 2" />
    <text x="14" y="40" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      bruker
    </text>
    <text x="34" y="40" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      edge
    </text>
    <path d="M14 8l3 6h-2l-1 4-1-4h-2z" fill="currentColor" stroke="none" />
  </S>
);

export const DnsMapIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M10 18c8-4 20-4 28 0" />
    <path d="M10 30c8 4 20 4 28 0" />
    <line x1="24" y1="8" x2="24" y2="40" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      DNS
    </text>
  </S>
);

export const CacheLayerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="32" width="36" height="8" rx="1" />
    <rect x="10" y="22" width="28" height="8" rx="1" />
    <rect x="14" y="12" width="20" height="8" rx="1" />
    <text x="24" y="38" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      edge
    </text>
    <text x="24" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      regional
    </text>
    <text x="24" y="18" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      origin
    </text>
  </S>
);

export const BufferBarIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="1.5" />
    <rect x="6" y="18" width="22" height="12" rx="1.5" fill="currentColor" opacity="0.35" stroke="none" />
    <line x1="14" y1="14" x2="14" y2="34" strokeDasharray="2 2" />
    <line x1="22" y1="14" x2="22" y2="34" strokeDasharray="2 2" />
    <line x1="30" y1="14" x2="30" y2="34" strokeDasharray="2 2" />
    <text x="24" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      buffer
    </text>
  </S>
);

export const OriginShieldIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4l14 4v14c0 10-7 17-14 20-7-3-14-10-14-20V8z" />
    <rect x="18" y="18" width="12" height="10" rx="1" />
    <circle cx="22" cy="23" r="1" fill="currentColor" />
    <circle cx="26" cy="23" r="1" fill="currentColor" />
  </S>
);

export const CacheWarmIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="20" width="32" height="20" rx="2" />
    <path d="M22 6c-2 4 2 4 0 8s2 4 0 8" />
    <path d="M26 6c-2 4 2 4 0 8s2 4 0 8" />
    <path d="M30 6c-2 4 2 4 0 8s2 4 0 8" />
  </S>
);

export const LiveBroadcastIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="18" x2="24" y2="44" strokeWidth="2.5" />
    <path d="M14 44h20" />
    <path d="M18 22l-6-6M30 22l6-6" />
    <circle cx="24" cy="14" r="3" fill="currentColor" />
    <path d="M14 8c-2 2-2 6 0 8M34 8c2 2 2 6 0 8" />
    <path d="M10 6c-3 4-3 12 0 16M38 6c3 4 3 12 0 16" />
  </S>
);

export const CodecChipIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="12" y="12" width="24" height="24" rx="2" />
    <rect x="18" y="18" width="12" height="12" />
    <path d="M6 18h6M6 24h6M6 30h6M36 18h6M36 24h6M36 30h6M18 6v6M24 6v6M30 6v6M18 36v6M24 36v6M30 36v6" />
  </S>
);

export const AnycastIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <circle cx="10" cy="10" r="3" />
    <circle cx="38" cy="10" r="3" />
    <circle cx="10" cy="38" r="3" />
    <circle cx="38" cy="38" r="3" />
    <line x1="13" y1="12" x2="21" y2="22" strokeDasharray="2 2" />
    <line x1="35" y1="12" x2="27" y2="22" strokeDasharray="2 2" />
    <line x1="13" y1="36" x2="21" y2="26" strokeDasharray="2 2" />
    <line x1="35" y1="36" x2="27" y2="26" strokeDasharray="2 2" />
    <text x="24" y="46" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      samme IP
    </text>
  </S>
);

// ------------------------------------------------------------------
// 2.6 — Sockets
// ------------------------------------------------------------------

export const TcpServerCallIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="40" height="32" rx="2" />
    <text x="24" y="16" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      socket()
    </text>
    <text x="24" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      bind()
    </text>
    <text x="24" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      listen()
    </text>
    <text x="24" y="34" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      accept()
    </text>
  </S>
);

export const TcpClientCallIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="40" height="32" rx="2" />
    <text x="24" y="16" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      socket()
    </text>
    <text x="24" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      connect()
    </text>
    <text x="24" y="28" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      send/recv
    </text>
    <text x="24" y="34" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      close()
    </text>
  </S>
);

export const UdpPacketIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      UDP
    </text>
    <path d="M2 24h4M42 24h4" />
  </S>
);

export const StreamRiverIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 18c6-4 12 4 18 0s12 4 18 0M4 24c6-4 12 4 18 0s12 4 18 0M4 30c6-4 12 4 18 0s12 4 18 0" />
    <text x="24" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      bytestrøm
    </text>
  </S>
);

export const BlockingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M24 14v10l8 4" />
    <path d="M16 38l-2 4M32 38l2 4" />
  </S>
);

export const PartialBufferIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="1.5" />
    <rect x="4" y="18" width="26" height="12" fill="currentColor" opacity="0.3" stroke="none" />
    <line x1="30" y1="14" x2="30" y2="34" strokeDasharray="2 2" />
    <text x="17" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      sendt
    </text>
    <text x="37" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      rest
    </text>
  </S>
);

export const PortReuseIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      TIME_WAIT
    </text>
    <path d="M14 26h20M30 26l-2-2M30 26l-2 2" />
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">
      :port
    </text>
  </S>
);

export const NagleIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="6" height="6" />
    <rect x="14" y="12" width="6" height="6" />
    <rect x="22" y="12" width="6" height="6" />
    <path d="M30 15h4M34 15l-2-1.5M34 15l-2 1.5" />
    <rect x="36" y="10" width="10" height="10" />
    <text x="41" y="32" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      ett
    </text>
    <text x="24" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      Nagle samler
    </text>
  </S>
);

export const EpollPanelIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="2" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    <circle cx="20" cy="18" r="1.5" />
    <circle cx="28" cy="18" r="1.5" />
    <circle cx="36" cy="18" r="1.5" fill="currentColor" />
    <circle cx="12" cy="26" r="1.5" />
    <circle cx="20" cy="26" r="1.5" fill="currentColor" />
    <circle cx="28" cy="26" r="1.5" />
    <circle cx="36" cy="26" r="1.5" />
    <circle cx="12" cy="34" r="1.5" />
    <circle cx="20" cy="34" r="1.5" />
    <circle cx="28" cy="34" r="1.5" fill="currentColor" />
    <circle cx="36" cy="34" r="1.5" />
  </S>
);

export const MtuRulerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="10" />
    <line x1="10" y1="20" x2="10" y2="14" />
    <line x1="18" y1="20" x2="18" y2="14" />
    <line x1="26" y1="20" x2="26" y2="14" />
    <line x1="34" y1="20" x2="34" y2="14" />
    <line x1="42" y1="20" x2="42" y2="14" />
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      1500 B
    </text>
  </S>
);

export const RawIpIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="24" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      IP header
    </text>
    <line x1="6" y1="24" x2="42" y2="24" strokeDasharray="2 2" />
    <text x="24" y="32" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">
      payload
    </text>
  </S>
);
