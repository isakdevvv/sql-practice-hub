import * as React from "react";

/**
 * Sikkerhets-ikoner for VisualDefs-mønsteret på SEC-sporet.
 * Hver eksport er en SVG i 48×48 viewBox som bruker `currentColor`.
 * Holdes enkle (én-to farger, kraftige linjer) for å være gjenkjennelige
 * fra UI: hengelås, sertifikat, brannmur, øye-for-IDS, osv.
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
// CIA-triangelet
// ------------------------------------------------------------------

export const ConfidentialityIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="12" y="22" width="24" height="18" rx="2" />
    <path d="M16 22v-5a8 8 0 0 1 16 0v5" />
    <circle cx="24" cy="30" r="2" fill="currentColor" />
    <line x1="24" y1="32" x2="24" y2="36" />
  </S>
);

export const IntegrityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 14h22l-4 5 4 5H10z" />
    <path d="M16 28l4 6 12-14" strokeWidth="2.4" />
  </S>
);

export const AvailabilityIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M24 14v10l7 4" strokeWidth="2.2" />
    <circle cx="24" cy="24" r="1.5" fill="currentColor" />
  </S>
);

export const AuthenticityIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="28" rx="2" />
    <circle cx="18" cy="22" r="4" />
    <path d="M14 32c0-3 2-5 4-5s4 2 4 5" />
    <line x1="26" y1="18" x2="36" y2="18" />
    <line x1="26" y1="24" x2="36" y2="24" />
    <line x1="26" y1="30" x2="34" y2="30" />
  </S>
);

// ------------------------------------------------------------------
// Autentiserings-faktorer (VET / HAR / ER)
// ------------------------------------------------------------------

export const KnowFactorIcon = (p: IconProps) => (
  <S {...p}>
    {/* tankeboble med stjerner = passord */}
    <path d="M10 14h28v16H26l-6 6v-6h-10z" />
    <text x="24" y="26" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" fontWeight="700">
      ••••
    </text>
  </S>
);

export const HaveFactorIcon = (p: IconProps) => (
  <S {...p}>
    {/* nøkkel-fob */}
    <circle cx="16" cy="24" r="6" />
    <line x1="22" y1="24" x2="40" y2="24" strokeWidth="2.4" />
    <line x1="36" y1="24" x2="36" y2="30" strokeWidth="2.4" />
    <line x1="32" y1="24" x2="32" y2="28" strokeWidth="2.4" />
    <circle cx="16" cy="24" r="2" fill="currentColor" />
  </S>
);

export const BeFactorIcon = (p: IconProps) => (
  <S {...p}>
    {/* fingeravtrykk */}
    <path d="M16 28c0-6 4-10 8-10s8 4 8 10" />
    <path d="M20 32c0-4 2-7 4-7s4 3 4 7" />
    <path d="M22 36c0-3 1-5 2-5s2 2 2 5" />
    <path d="M14 24c0-7 5-12 10-12s10 5 10 12" />
  </S>
);

// ------------------------------------------------------------------
// Kryptografiske primitiver
// ------------------------------------------------------------------

export const PlaintextIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="28" rx="2" />
    <line x1="14" y1="18" x2="34" y2="18" />
    <line x1="14" y1="24" x2="34" y2="24" />
    <line x1="14" y1="30" x2="28" y2="30" />
  </S>
);

export const CiphertextIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="28" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
      a8F3z
    </text>
    <text x="24" y="30" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
      9k!Xq
    </text>
  </S>
);

export const SymmetricKeyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="5" />
    <line x1="19" y1="24" x2="34" y2="24" strokeWidth="2.2" />
    <line x1="30" y1="24" x2="30" y2="29" strokeWidth="2.2" />
    <line x1="26" y1="24" x2="26" y2="28" strokeWidth="2.2" />
    <circle cx="14" cy="24" r="1.6" fill="currentColor" />
  </S>
);

export const AsymmetricKeyIcon = (p: IconProps) => (
  <S {...p}>
    {/* to nøkler — én lys, én fylt */}
    <circle cx="14" cy="16" r="4" />
    <line x1="18" y1="16" x2="28" y2="16" strokeWidth="1.8" />
    <line x1="25" y1="16" x2="25" y2="20" />
    <circle cx="14" cy="32" r="4" fill="currentColor" />
    <line x1="18" y1="32" x2="34" y2="32" strokeWidth="2" />
    <line x1="30" y1="32" x2="30" y2="36" />
    <line x1="26" y1="32" x2="26" y2="35" />
  </S>
);

export const HashIcon = (p: IconProps) => (
  <S {...p}>
    {/* #-symbol med pil */}
    <line x1="14" y1="14" x2="14" y2="34" strokeWidth="2.4" />
    <line x1="22" y1="14" x2="22" y2="34" strokeWidth="2.4" />
    <line x1="10" y1="20" x2="26" y2="20" strokeWidth="2.4" />
    <line x1="10" y1="28" x2="26" y2="28" strokeWidth="2.4" />
    <path d="M30 24h8m-3-3 3 3-3 3" />
  </S>
);

export const MacIcon = (p: IconProps) => (
  <S {...p}>
    {/* nøkkel + # */}
    <circle cx="10" cy="24" r="3" />
    <line x1="13" y1="24" x2="22" y2="24" />
    <line x1="14" y1="16" x2="14" y2="32" />
    <line x1="20" y1="16" x2="20" y2="32" />
    <line x1="10" y1="20" x2="24" y2="20" />
    <line x1="10" y1="28" x2="24" y2="28" />
    <text x="34" y="27" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontWeight="700">
      MAC
    </text>
  </S>
);

export const SignatureIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 32c4-2 7-8 10-12s5 6 8 8 6-4 10-2" strokeWidth="2" />
    <line x1="10" y1="38" x2="38" y2="38" />
    <path d="M30 24l4 4-2 5-5 2 4-4z" />
  </S>
);

export const CertificateIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="10" width="32" height="22" rx="2" />
    <line x1="14" y1="18" x2="32" y2="18" />
    <line x1="14" y1="24" x2="26" y2="24" />
    <circle cx="34" cy="36" r="6" />
    <path d="M31 36l2 2 4-4" strokeWidth="2.2" />
  </S>
);

export const PkiIcon = (p: IconProps) => (
  <S {...p}>
    {/* tre-nivå hierarki */}
    <rect x="20" y="6" width="8" height="6" rx="1" />
    <rect x="8" y="20" width="8" height="6" rx="1" />
    <rect x="32" y="20" width="8" height="6" rx="1" />
    <rect x="4" y="34" width="8" height="6" rx="1" />
    <rect x="20" y="34" width="8" height="6" rx="1" />
    <rect x="36" y="34" width="8" height="6" rx="1" />
    <line x1="24" y1="12" x2="12" y2="20" />
    <line x1="24" y1="12" x2="36" y2="20" />
    <line x1="12" y1="26" x2="8" y2="34" />
    <line x1="36" y1="26" x2="24" y2="34" />
    <line x1="36" y1="26" x2="40" y2="34" />
  </S>
);

// ------------------------------------------------------------------
// Protokoller & sikker transport
// ------------------------------------------------------------------

export const TlsHandshakeIcon = (p: IconProps) => (
  <S {...p}>
    {/* to hender / lås */}
    <path d="M10 24c4-4 8-4 14 0" />
    <path d="M24 24c6-4 10-4 14 0" />
    <rect x="20" y="22" width="8" height="8" rx="1" />
    <path d="M22 22v-2a2 2 0 0 1 4 0v2" />
  </S>
);

export const IpsecTunnelIcon = (p: IconProps) => (
  <S {...p}>
    {/* tunnel-form */}
    <path d="M6 32a18 18 0 0 1 36 0v6H6z" />
    <line x1="6" y1="32" x2="42" y2="32" />
    <circle cx="24" cy="30" r="3" />
    <path d="M22 30v-2a2 2 0 0 1 4 0v2" />
  </S>
);

export const WpaWifiIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 22a26 26 0 0 1 36 0" />
    <path d="M12 28a18 18 0 0 1 24 0" />
    <path d="M18 34a10 10 0 0 1 12 0" />
    <rect x="20" y="36" width="8" height="6" rx="1" />
    <path d="M22 36v-2a2 2 0 0 1 4 0v2" />
  </S>
);

// ------------------------------------------------------------------
// Brannmur, IDS, IPS
// ------------------------------------------------------------------

export const FirewallIcon = (p: IconProps) => (
  <S {...p}>
    {/* murvegg */}
    <rect x="6" y="10" width="36" height="28" />
    <line x1="6" y1="19" x2="42" y2="19" />
    <line x1="6" y1="28" x2="42" y2="28" />
    <line x1="14" y1="10" x2="14" y2="19" />
    <line x1="22" y1="19" x2="22" y2="28" />
    <line x1="30" y1="10" x2="30" y2="19" />
    <line x1="34" y1="19" x2="34" y2="28" />
    <line x1="18" y1="28" x2="18" y2="38" />
    <line x1="30" y1="28" x2="30" y2="38" />
  </S>
);

export const FirewallDropIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="32" height="20" />
    <line x1="8" y1="14" x2="40" y2="34" strokeWidth="2.4" />
    <line x1="40" y1="14" x2="8" y2="34" strokeWidth="2.4" />
  </S>
);

export const FirewallRejectIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="22" height="20" />
    <path d="M28 24l8-4v8z" fill="currentColor" />
    <path d="M36 32l4 4M40 32l-4 4" />
  </S>
);

export const FirewallAcceptIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="22" height="20" />
    <path d="M16 24l4 4 8-8" strokeWidth="2.4" />
    <path d="M30 24h10m-3-3 3 3-3 3" />
  </S>
);

export const IdsEyeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24s6-10 18-10 18 10 18 10-6 10-18 10S6 24 6 24z" />
    <circle cx="24" cy="24" r="5" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
    <path d="M38 12l4-4M38 36l4 4" />
  </S>
);

export const IpsShieldIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l14 6v10c0 10-8 16-14 20-6-4-14-10-14-20V12z" />
    <circle cx="24" cy="22" r="4" />
    <circle cx="24" cy="22" r="1.6" fill="currentColor" />
    <path d="M14 30l-4 4M34 30l4 4" />
  </S>
);

export const HostFirewallIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="28" height="18" rx="1" />
    <path d="M4 36h36l-2 4H6z" />
    <rect x="14" y="18" width="16" height="10" />
    <line x1="14" y1="23" x2="30" y2="23" />
    <line x1="22" y1="18" x2="22" y2="28" />
  </S>
);

export const NetworkFirewallIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="14" height="14" />
    <line x1="4" y1="27" x2="18" y2="27" />
    <line x1="11" y1="20" x2="11" y2="34" />
    <rect x="22" y="14" width="8" height="20" />
    <path d="M22 18h8M22 22h8M22 26h8M22 30h8" />
    <rect x="34" y="20" width="10" height="14" />
    <line x1="34" y1="27" x2="44" y2="27" />
  </S>
);

// ------------------------------------------------------------------
// Angrep
// ------------------------------------------------------------------

export const ArpSpoofIcon = (p: IconProps) => (
  <S {...p}>
    {/* maske / impersonator */}
    <path d="M10 20c2-4 8-6 14-6s12 2 14 6c-2 12-8 18-14 18s-12-6-14-18z" />
    <circle cx="18" cy="22" r="2" fill="currentColor" />
    <circle cx="30" cy="22" r="2" fill="currentColor" />
    <path d="M18 30c2 2 4 3 6 3s4-1 6-3" />
  </S>
);

export const DnsSpoofIcon = (p: IconProps) => (
  <S {...p}>
    {/* server med gift-symbol */}
    <rect x="10" y="10" width="28" height="10" rx="1" />
    <rect x="10" y="22" width="28" height="10" rx="1" />
    <circle cx="14" cy="15" r="1.4" fill="currentColor" />
    <circle cx="14" cy="27" r="1.4" fill="currentColor" />
    <path d="M22 36c-2 0-4 2-4 4M26 36c2 0 4 2 4 4M24 36v6" />
    <path d="M20 40h8" />
  </S>
);

export const SynFloodIcon = (p: IconProps) => (
  <S {...p}>
    {/* mange piler mot én server */}
    <rect x="32" y="14" width="10" height="20" rx="1" />
    <path d="M6 16l22 6M6 22l22 4M6 28l22 2M6 34l22-2" strokeWidth="1.6" />
    <text x="4" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace" fontWeight="700">
      SYN
    </text>
  </S>
);

export const DdosIcon = (p: IconProps) => (
  <S {...p}>
    {/* mange noder → én */}
    <circle cx="6" cy="10" r="2.5" fill="currentColor" />
    <circle cx="6" cy="24" r="2.5" fill="currentColor" />
    <circle cx="6" cy="38" r="2.5" fill="currentColor" />
    <circle cx="14" cy="16" r="2.5" fill="currentColor" />
    <circle cx="14" cy="32" r="2.5" fill="currentColor" />
    <rect x="32" y="18" width="10" height="14" rx="1" />
    <path d="M9 10l22 12M9 24l22 0M9 38l22-12M16 16l16 8M16 32l16-8" strokeWidth="1.4" />
  </S>
);

export const PortScanIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="22" y="8" width="20" height="32" rx="1" />
    <circle cx="26" cy="14" r="1.5" />
    <circle cx="26" cy="20" r="1.5" fill="currentColor" />
    <circle cx="26" cy="26" r="1.5" />
    <circle cx="26" cy="32" r="1.5" />
    <line x1="6" y1="14" x2="22" y2="14" strokeDasharray="2 2" />
    <line x1="6" y1="20" x2="22" y2="20" strokeDasharray="2 2" />
    <line x1="6" y1="26" x2="22" y2="26" strokeDasharray="2 2" />
    <line x1="6" y1="32" x2="22" y2="32" strokeDasharray="2 2" />
  </S>
);

export const WifiSniffIcon = (p: IconProps) => (
  <S {...p}>
    {/* antenne med øre */}
    <line x1="24" y1="34" x2="24" y2="14" strokeWidth="2.2" />
    <path d="M18 14l6-6 6 6" />
    <path d="M14 22a14 14 0 0 1 20 0" />
    <path d="M10 26a20 20 0 0 1 28 0" />
    <circle cx="24" cy="38" r="2.5" fill="currentColor" />
  </S>
);

export const MitmIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="20" width="10" height="10" rx="1" />
    <rect x="36" y="20" width="10" height="10" rx="1" />
    <path d="M12 25h10M26 25h10" />
    <circle cx="24" cy="25" r="6" />
    <path d="M21 22l6 6M27 22l-6 6" />
  </S>
);

export const ReplayIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 12a12 12 0 1 1-12 12" strokeWidth="2.2" />
    <path d="M12 24l-4-4M12 24l4-4" />
    <rect x="20" y="28" width="14" height="8" rx="1" />
    <line x1="20" y1="32" x2="34" y2="32" />
  </S>
);

export const BruteForceIcon = (p: IconProps) => (
  <S {...p}>
    {/* hammer mot lås */}
    <rect x="20" y="24" width="14" height="12" rx="1" />
    <path d="M22 24v-4a5 5 0 0 1 10 0v4" />
    <path d="M6 14l8-4 4 6-8 4z" />
    <line x1="14" y1="16" x2="22" y2="22" strokeWidth="2.2" />
  </S>
);

// ------------------------------------------------------------------
// OWASP web-angrep
// ------------------------------------------------------------------

export const SqlInjectionIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="14" rx="14" ry="4" />
    <path d="M10 14v10c0 2 6 4 14 4s14-2 14-4V14" />
    <path d="M10 24v10c0 2 6 4 14 4s14-2 14-4V24" />
    <path d="M30 8l-6 8 6 8" strokeWidth="2.2" />
  </S>
);

export const XssIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 14l-6 10 6 10M38 14l6 10-6 10" strokeWidth="2.2" />
    <text x="24" y="29" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" fontWeight="700">
      &lt;/&gt;
    </text>
  </S>
);

export const CsrfIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="1" />
    <rect x="28" y="14" width="14" height="20" rx="1" />
    <path d="M20 24h8m-3-3 3 3-3 3" strokeWidth="2" />
    <text x="13" y="28" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
      evil
    </text>
    <text x="35" y="28" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">
      bank
    </text>
  </S>
);

// ------------------------------------------------------------------
// Generelle / hjelp
// ------------------------------------------------------------------

export const PacketIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="16" height="20" rx="1" />
    <rect x="26" y="14" width="16" height="20" rx="1" />
    <line x1="6" y1="20" x2="22" y2="20" />
    <line x1="26" y1="20" x2="42" y2="20" />
  </S>
);

export const ConnectionIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" fill="currentColor" />
    <circle cx="38" cy="24" r="4" fill="currentColor" />
    <path d="M14 24h20" strokeWidth="2.2" />
    <path d="M24 18v12" />
  </S>
);

export const VlanIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="8" rx="1" />
    <circle cx="14" cy="24" r="1.6" fill="currentColor" />
    <circle cx="22" cy="24" r="1.6" fill="currentColor" />
    <circle cx="30" cy="24" r="1.6" fill="currentColor" />
    <circle cx="38" cy="24" r="1.6" fill="currentColor" />
    <path d="M10 16h8v4M22 16h8v4M34 16h8v4" />
  </S>
);

export const TrunkPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="14" height="8" rx="1" />
    <rect x="28" y="20" width="14" height="8" rx="1" />
    <path d="M20 22h8M20 26h8" strokeWidth="2.2" />
    <text x="24" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">
      tags
    </text>
  </S>
);

export const AccessPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="14" height="8" rx="1" />
    <rect x="28" y="20" width="14" height="8" rx="1" />
    <line x1="20" y1="24" x2="28" y2="24" strokeWidth="2.2" />
    <text x="24" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">
      plain
    </text>
  </S>
);

export const TranscriptHashIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="28" height="4" rx="1" />
    <rect x="6" y="14" width="28" height="4" rx="1" />
    <rect x="6" y="20" width="28" height="4" rx="1" />
    <rect x="6" y="26" width="28" height="4" rx="1" />
    <path d="M34 18h4m-2-3 2 3-2 3" />
    <line x1="38" y1="32" x2="38" y2="38" />
    <line x1="34" y1="32" x2="42" y2="32" />
    <line x1="34" y1="36" x2="42" y2="36" />
  </S>
);

export const KdfIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <path d="M14 24h10" />
    <rect x="22" y="18" width="8" height="12" rx="1" />
    <path d="M30 20l8-4M30 24l8 0M30 28l8 4" />
    <circle cx="40" cy="16" r="2" />
    <circle cx="40" cy="24" r="2" />
    <circle cx="40" cy="32" r="2" />
  </S>
);
