import * as React from "react";

/**
 * Ikoner for Kurose kap 8 — nettverkssikkerhet. 48×48 viewBox, currentColor.
 * Enkle, gjenkjennelige tegninger (lås, nøkkel, sertifikat, brannmur osv.).
 * Gjenbruk på tvers av termer der konseptet er det samme.
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
// 8.1 — Sikkerhetsmål, trusler, aktører
// ------------------------------------------------------------------

export const ConfidentialityIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="20" width="28" height="20" rx="2" />
    <path d="M16 20v-4a8 8 0 0 1 16 0v4" />
    <circle cx="24" cy="30" r="2" />
    <line x1="24" y1="32" x2="24" y2="36" />
  </S>
);

export const IntegrityIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4l16 6v10c0 10-7 18-16 22-9-4-16-12-16-22V10z" />
    <path d="M16 24l6 6 12-12" />
  </S>
);

export const AuthEndpointIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="16" cy="16" r="6" />
    <path d="M6 36c1-5 5-8 10-8s9 3 10 8" />
    <path d="M32 14l8 4-8 4" />
    <line x1="40" y1="18" x2="28" y2="18" />
  </S>
);

export const AvailabilityIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M24 12v12l8 5" />
  </S>
);

export const ThreatModelIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38h36L24 8z" />
    <line x1="24" y1="20" x2="24" y2="28" />
    <circle cx="24" cy="33" r="1.2" fill="currentColor" />
  </S>
);

export const AliceBobTrudyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="18" r="4" />
    <path d="M5 30c1-3 3-5 5-5s4 2 5 5" />
    <circle cx="38" cy="18" r="4" />
    <path d="M33 30c1-3 3-5 5-5s4 2 5 5" />
    <circle cx="24" cy="36" r="3" />
    <path d="M22 41h4" />
    <path d="M14 18h20" strokeDasharray="2 2" />
  </S>
);

export const DefenseDepthIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="2" />
    <rect x="9" y="14" width="30" height="20" rx="1.5" />
    <rect x="14" y="18" width="20" height="12" rx="1" />
    <rect x="19" y="22" width="10" height="4" rx="0.5" />
  </S>
);

export const NonRepudiationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="8" width="32" height="32" rx="2" />
    <path d="M14 18h20M14 24h20M14 30h12" />
    <circle cx="34" cy="34" r="5" />
    <path d="M31 34l2 2 4-4" />
  </S>
);

export const AuthorizationIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="14" width="32" height="22" rx="2" />
    <path d="M8 22h32" />
    <path d="M14 28h6M14 32h10" />
    <circle cx="32" cy="30" r="4" />
    <path d="M30 30l1.5 1.5L34 28.5" />
  </S>
);

export const PrivacyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M14 24c4-6 16-6 20 0-4 6-16 6-20 0z" />
    <circle cx="24" cy="24" r="3" />
    <line x1="10" y1="38" x2="38" y2="10" />
  </S>
);

export const MetadataLeakIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="12" width="32" height="20" rx="2" />
    <path d="M8 12l16 12L40 12" />
    <path d="M24 32v6M18 38h12" />
    <circle cx="38" cy="14" r="3" strokeDasharray="2 2" />
  </S>
);

export const PassiveActiveIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="5" />
    <path d="M14 19v3" />
    <path d="M8 28h12" />
    <path d="M34 30l4-4-4-4M28 26h10" />
    <circle cx="38" cy="14" r="2" fill="currentColor" />
  </S>
);

export const InsiderIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <circle cx="24" cy="22" r="5" />
    <path d="M16 36c1-5 4-8 8-8s7 3 8 8" />
    <path d="M30 18l3-3" />
    <circle cx="34" cy="14" r="2" fill="currentColor" />
  </S>
);

// ------------------------------------------------------------------
// 8.2 — Kryptografi
// ------------------------------------------------------------------

export const SymmetricKeyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="6" />
    <path d="M20 24h22M36 24v6M40 24v4" />
    <circle cx="14" cy="24" r="2" fill="currentColor" />
  </S>
);

export const AesIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="14" height="14" rx="1" />
    <rect x="28" y="6" width="14" height="14" rx="1" />
    <rect x="6" y="28" width="14" height="14" rx="1" />
    <rect x="28" y="28" width="14" height="14" rx="1" />
    <text x="13" y="16" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">A</text>
    <text x="35" y="16" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">E</text>
    <text x="13" y="38" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">S</text>
  </S>
);

export const CipherModeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="8" height="20" rx="1" />
    <rect x="14" y="14" width="8" height="20" rx="1" />
    <rect x="24" y="14" width="8" height="20" rx="1" />
    <rect x="34" y="14" width="8" height="20" rx="1" />
    <path d="M12 24h2M22 24h2M32 24h2" />
  </S>
);

export const AsymmetricKeyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="14" r="4" />
    <path d="M15 16l8 8M19 24h6M23 28h4" />
    <circle cx="36" cy="34" r="4" />
    <path d="M33 32l-8-8" />
    <text x="12" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">pub</text>
    <text x="36" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">priv</text>
  </S>
);

export const RsaIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="28" textAnchor="middle" fontSize="11" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">RSA</text>
  </S>
);

export const EccIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 36c4-14 10-22 16-22s12 8 16 22" />
    <line x1="6" y1="36" x2="42" y2="36" />
    <circle cx="18" cy="22" r="1.5" fill="currentColor" />
    <circle cx="30" cy="22" r="1.5" fill="currentColor" />
    <line x1="18" y1="22" x2="30" y2="22" strokeDasharray="2 2" />
  </S>
);

export const DiffieHellmanIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="14" r="5" />
    <circle cx="36" cy="14" r="5" />
    <circle cx="24" cy="34" r="6" />
    <path d="M16 17l5 12M32 17l-5 12" strokeDasharray="2 2" />
    <text x="24" y="37" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">K</text>
  </S>
);

export const HybridIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="4" />
    <rect x="22" y="22" width="20" height="20" rx="2" />
    <path d="M17 16l5 6" />
    <text x="32" y="36" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">sym</text>
  </S>
);

export const BlockStreamIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="8" height="8" rx="1" />
    <rect x="14" y="10" width="8" height="8" rx="1" />
    <rect x="24" y="10" width="8" height="8" rx="1" />
    <path d="M4 32h40" strokeDasharray="2 2" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">⊕ strøm</text>
  </S>
);

export const EcbIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="6" width="10" height="10" rx="1" />
    <rect x="18" y="6" width="10" height="10" rx="1" />
    <rect x="32" y="6" width="10" height="10" rx="1" />
    <rect x="4" y="20" width="10" height="10" rx="1" />
    <rect x="18" y="20" width="10" height="10" rx="1" />
    <rect x="32" y="20" width="10" height="10" rx="1" />
    <line x1="6" y1="40" x2="42" y2="40" strokeWidth="2" />
    <text x="24" y="46" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">ECB ✗</text>
  </S>
);

export const CbcIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="10" height="14" rx="1" />
    <rect x="18" y="14" width="10" height="14" rx="1" />
    <rect x="32" y="14" width="10" height="14" rx="1" />
    <path d="M14 21h4M28 21h4" />
    <circle cx="16" cy="21" r="1" fill="currentColor" />
    <circle cx="30" cy="21" r="1" fill="currentColor" />
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">CBC</text>
  </S>
);

export const CtrIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="6" width="14" height="10" rx="1" />
    <text x="11" y="14" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">CTR 1</text>
    <rect x="4" y="20" width="14" height="10" rx="1" />
    <text x="11" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">CTR 2</text>
    <path d="M20 24h8" />
    <circle cx="32" cy="24" r="4" />
    <path d="M30 22l4 4M34 22l-4 4" />
  </S>
);

export const GcmIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="28" height="28" rx="2" />
    <path d="M8 18h20M8 24h20M8 30h14" />
    <circle cx="38" cy="34" r="6" />
    <path d="M35 34l2 2 4-4" />
  </S>
);

export const IvNonceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M10 14v20M14 14v20" />
    <text x="28" y="28" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">#7341</text>
  </S>
);

export const AeadIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M12 24h24" />
    <circle cx="14" cy="14" r="3" />
    <path d="M34 34l4 4" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">enc+auth</text>
  </S>
);

export const PaddingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M30 14v20M34 14v20M38 14v20" strokeDasharray="2 2" />
    <text x="18" y="28" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">data</text>
  </S>
);

export const KeyLengthIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="4" />
    <path d="M14 24h28" strokeWidth="3" />
    <text x="28" y="20" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">2^128</text>
  </S>
);

export const ChaChaIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="22" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">ChaCha</text>
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">Poly1305</text>
  </S>
);

export const KerckhoffsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <circle cx="24" cy="24" r="6" />
    <path d="M28 28l4 4" />
    <path d="M14 14v-2M18 14v-2M30 14v-2M34 14v-2" />
  </S>
);

export const PostQuantumIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <ellipse cx="24" cy="24" rx="14" ry="5" />
    <ellipse cx="24" cy="24" rx="14" ry="5" transform="rotate(60 24 24)" />
    <ellipse cx="24" cy="24" rx="14" ry="5" transform="rotate(120 24 24)" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
  </S>
);

// ------------------------------------------------------------------
// 8.3 — Hash, MAC, signering
// ------------------------------------------------------------------

export const HashIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="14" height="28" rx="1" />
    <path d="M20 24h8" />
    <circle cx="36" cy="24" r="8" />
    <text x="36" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">#</text>
  </S>
);

export const HashWeakIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">#</text>
    <line x1="10" y1="38" x2="38" y2="10" strokeWidth="2.5" />
  </S>
);

export const MacIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="14" height="28" rx="1" />
    <circle cx="11" cy="6" r="3" />
    <path d="M20 24h8" />
    <rect x="28" y="20" width="16" height="8" rx="1" />
    <text x="36" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">TAG</text>
  </S>
);

export const HmacIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">HMAC</text>
    <circle cx="10" cy="10" r="3" />
  </S>
);

export const DigitalSignatureIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="30" height="28" rx="2" />
    <path d="M10 16h22M10 20h22M10 24h16" />
    <path d="M14 32c4-4 8 4 12-2" />
    <circle cx="38" cy="34" r="6" />
    <path d="M35 34l2 2 4-4" />
  </S>
);

export const ReplayAttackIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="6" />
    <path d="M14 10v4l3 2" />
    <rect x="24" y="20" width="20" height="14" rx="1" />
    <path d="M24 20l10 8 10-8" />
    <path d="M20 38l4-4-4-4M18 34h12" />
  </S>
);

export const PreimageIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="34" cy="14" r="6" />
    <text x="34" y="17" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">y</text>
    <path d="M28 18l-12 12" />
    <rect x="4" y="28" width="14" height="14" rx="1" />
    <text x="11" y="38" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">m=?</text>
  </S>
);

export const CollisionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="14" height="10" rx="1" />
    <text x="11" y="18" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">m1</text>
    <rect x="4" y="28" width="14" height="10" rx="1" />
    <text x="11" y="36" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">m2</text>
    <path d="M20 15l10 8M20 33l10-8" />
    <circle cx="36" cy="24" r="6" />
    <text x="36" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">=</text>
  </S>
);

export const Sha2Sha3Icon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="18" height="20" rx="2" />
    <text x="13" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SHA-2</text>
    <rect x="26" y="14" width="18" height="20" rx="2" />
    <text x="35" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SHA-3</text>
  </S>
);

export const LengthExtensionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="20" height="20" rx="1" />
    <text x="14" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">K‖m</text>
    <rect x="28" y="14" width="14" height="20" rx="1" strokeDasharray="3 2" />
    <path d="M26 24l-2 -2 2 -2M22 22h6" strokeWidth="1.4" />
  </S>
);

export const SignAlgoIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="22" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">ECDSA</text>
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">EdDSA</text>
  </S>
);

export const TimestampIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M24 14v10l6 4" />
    <circle cx="24" cy="24" r="1.5" fill="currentColor" />
  </S>
);

// ------------------------------------------------------------------
// 8.4 — Autentisering
// ------------------------------------------------------------------

export const NameOnlyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="18" r="6" />
    <path d="M12 38c2-7 7-10 12-10s10 3 12 10" />
    <path d="M36 8l4 4-4 4" strokeWidth="1.4" />
  </S>
);

export const PasswordClearIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="14" rx="2" />
    <text x="24" y="29" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">p123</text>
    <line x1="6" y1="38" x2="42" y2="38" strokeDasharray="2 2" />
  </S>
);

export const NonceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="36" height="22" rx="2" />
    <path d="M10 12v22" strokeDasharray="2 2" />
    <text x="26" y="28" textAnchor="middle" fontSize="10" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">N42</text>
  </S>
);

export const ChallengeResponseIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="5" />
    <circle cx="38" cy="24" r="5" />
    <path d="M16 20l16 0M32 20l-4-3M32 20l-4 3" />
    <path d="M32 28l-16 0M16 28l4-3M16 28l4 3" />
  </S>
);

export const MitmIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="4" />
    <circle cx="40" cy="24" r="4" />
    <circle cx="24" cy="24" r="5" />
    <path d="M12 24h7M29 24h7" />
    <path d="M24 19v-4M22 13l2-2 2 2" />
  </S>
);

export const CertificateIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="30" height="32" rx="2" />
    <path d="M10 14h22M10 18h22M10 22h16" />
    <circle cx="36" cy="32" r="7" />
    <path d="M33 32l2 2 4-4" />
    <path d="M36 39l-2 4 5-2 5 2-2-4" />
  </S>
);

export const PkiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="4" width="12" height="10" rx="1" />
    <text x="24" y="11" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">Root</text>
    <path d="M18 14l-8 8M30 14l8 8" />
    <rect x="2" y="22" width="14" height="9" rx="1" />
    <rect x="32" y="22" width="14" height="9" rx="1" />
    <path d="M9 31l4 6M39 31l-4 6" />
    <rect x="6" y="37" width="14" height="9" rx="1" />
    <rect x="28" y="37" width="14" height="9" rx="1" />
  </S>
);

export const RevokeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="28" height="32" rx="2" />
    <path d="M10 14h20M10 18h20M10 22h14" />
    <line x1="4" y1="6" x2="40" y2="42" strokeWidth="2.5" />
  </S>
);

export const X509FieldsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <path d="M6 14h36" />
    <path d="M10 20h18M10 24h22M10 28h14M10 32h20M10 36h10" />
    <text x="24" y="12" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">X.509</text>
  </S>
);

export const CertExtensionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="24" height="28" rx="2" />
    <path d="M8 16h16M8 20h16M8 24h12" />
    <rect x="30" y="14" width="14" height="10" rx="1" strokeDasharray="2 2" />
    <path d="M28 18l2 0" />
  </S>
);

export const ValidationLevelIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="32" width="10" height="10" rx="1" />
    <rect x="19" y="22" width="10" height="20" rx="1" />
    <rect x="32" y="12" width="10" height="30" rx="1" />
    <text x="11" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">DV</text>
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">OV</text>
    <text x="37" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">EV</text>
  </S>
);

export const ChainOfTrustIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="12" r="5" />
    <circle cx="24" cy="24" r="5" />
    <circle cx="38" cy="36" r="5" />
    <path d="M13 16l8 5M27 28l8 5" />
  </S>
);

export const CrlIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <path d="M10 14h28M10 18h28M10 22h20M10 26h28M10 30h22M10 34h28" />
    <line x1="8" y1="14" x2="14" y2="20" strokeWidth="1.5" />
    <line x1="8" y1="26" x2="14" y2="32" strokeWidth="1.5" />
  </S>
);

export const OcspStaplingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="20" height="20" rx="2" />
    <path d="M8 20h12M8 24h12M8 28h8" />
    <rect x="28" y="6" width="14" height="10" rx="1" />
    <text x="35" y="13" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">OCSP</text>
    <path d="M26 14l8 0M28 8l-4 12" strokeDasharray="2 2" />
  </S>
);

export const CtLogIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <path d="M10 14h28M10 20h28M10 26h28M10 32h20" />
    <circle cx="38" cy="14" r="2" fill="currentColor" />
    <circle cx="38" cy="20" r="2" fill="currentColor" />
    <circle cx="38" cy="26" r="2" fill="currentColor" />
  </S>
);

export const MtlsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" rx="1.5" />
    <rect x="30" y="14" width="14" height="20" rx="1.5" />
    <rect x="2" y="6" width="10" height="8" rx="1" />
    <rect x="36" y="6" width="10" height="8" rx="1" />
    <path d="M18 22h12M18 26h12" />
  </S>
);

export const MfaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="18" width="12" height="12" rx="2" />
    <text x="8" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">vet</text>
    <rect x="18" y="18" width="12" height="12" rx="2" />
    <text x="24" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">har</text>
    <rect x="34" y="18" width="12" height="12" rx="2" />
    <text x="40" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">er</text>
  </S>
);

// ------------------------------------------------------------------
// 8.5 — TLS
// ------------------------------------------------------------------

export const TlsRecordIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="2" />
    <path d="M14 16v16" />
    <text x="9" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">hdr</text>
    <text x="28" y="26" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">enc payload</text>
  </S>
);

export const HandshakeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="4" />
    <circle cx="38" cy="14" r="4" />
    <path d="M15 14h6M27 14h6M21 11l-3 3 3 3M27 11l3 3-3 3" />
    <circle cx="10" cy="28" r="4" />
    <circle cx="38" cy="28" r="4" />
    <path d="M15 28h6M27 28h6M27 25l3 3-3 3M21 25l-3 3 3 3" />
    <circle cx="10" cy="42" r="3" />
    <circle cx="38" cy="42" r="3" />
    <path d="M14 42h6M28 42h6" strokeDasharray="2 2" />
  </S>
);

export const CipherSuiteIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">AES-128-GCM</text>
    <text x="24" y="30" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SHA-256</text>
  </S>
);

export const ForwardSecrecyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="24" r="4" />
    <circle cx="24" cy="24" r="4" />
    <circle cx="36" cy="24" r="4" />
    <path d="M16 24h4M28 24h4" />
    <path d="M12 32v3M24 32v3M36 32v3" />
    <path d="M8 38h32" strokeWidth="2" />
    <text x="24" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">brent</text>
  </S>
);

export const MasterSecretIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="12" r="6" />
    <path d="M24 18v6M18 26l-6 8M30 26l6 8M24 24v10" />
    <rect x="6" y="34" width="12" height="8" rx="1" />
    <rect x="20" y="34" width="8" height="8" rx="1" />
    <rect x="30" y="34" width="12" height="8" rx="1" />
  </S>
);

export const SessionResumptionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M20 24l4 4 8-8" strokeWidth="2" />
    <path d="M14 12l-3-3 3-3M12 9h6" strokeWidth="1.2" />
  </S>
);

export const Tls13Icon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="22" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">TLS</text>
    <text x="24" y="32" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">1.3</text>
  </S>
);

export const ClientHelloIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="5" />
    <path d="M19 24h22M37 21l4 3-4 3" />
    <text x="30" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">Hello+SNI</text>
  </S>
);

export const ServerHelloIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="32" y="14" width="12" height="20" rx="1.5" />
    <path d="M28 24h-22M7 21l-4 3 4 3" />
    <text x="20" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">Hello+cert</text>
  </S>
);

export const FinishedMacIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M14 24l4 4 8-8" strokeWidth="2.5" />
    <text x="32" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">MAC</text>
  </S>
);

export const ZeroRttIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="5" />
    <path d="M19 22h22M19 26h18" />
    <text x="14" y="44" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">0-RTT</text>
  </S>
);

export const HkdfIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="4" />
    <path d="M24 14l-10 10M24 14l10 10M24 14v10" />
    <rect x="6" y="24" width="12" height="14" rx="1" />
    <rect x="18" y="24" width="12" height="14" rx="1" />
    <rect x="30" y="24" width="12" height="14" rx="1" />
  </S>
);

export const DowngradeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 12h32" strokeWidth="2" />
    <path d="M16 12v8M24 12v16M32 12v24" />
    <path d="M20 38l4 4 4-4" strokeWidth="2" />
  </S>
);

export const QuicIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="22" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">QUIC</text>
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">UDP</text>
  </S>
);

export const AlpnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="14" height="8" rx="1" />
    <text x="11" y="16" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">h2</text>
    <rect x="4" y="20" width="14" height="8" rx="1" />
    <text x="11" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">h3</text>
    <rect x="4" y="30" width="14" height="8" rx="1" />
    <text x="11" y="36" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">1.1</text>
    <path d="M20 24h8" />
    <rect x="28" y="20" width="16" height="8" rx="1" />
  </S>
);

// ------------------------------------------------------------------
// 8.6 — IPsec
// ------------------------------------------------------------------

export const AhIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">AH</text>
    <path d="M6 14l36 20" strokeDasharray="2 2" strokeWidth="1.2" />
  </S>
);

export const EspIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">ESP</text>
    <circle cx="10" cy="10" r="2" fill="currentColor" />
    <circle cx="38" cy="38" r="2" fill="currentColor" />
  </S>
);

export const TransportModeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="40" height="12" rx="1" />
    <path d="M14 18v12" />
    <text x="9" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">IP</text>
    <text x="28" y="27" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">enc</text>
  </S>
);

export const TunnelModeIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="24" rx="22" ry="10" />
    <rect x="14" y="20" width="20" height="8" rx="1" />
    <path d="M20 20v8" />
    <text x="17" y="26" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">ip</text>
  </S>
);

export const SaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <path d="M10 14h28M10 20h28M10 26h20M10 32h24M10 38h16" />
    <circle cx="36" cy="38" r="4" />
  </S>
);

export const IkeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="5" />
    <circle cx="34" cy="24" r="5" />
    <path d="M19 24h10" />
    <rect x="20" y="6" width="8" height="6" rx="1" />
    <text x="24" y="11" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">IKE</text>
    <path d="M24 12v6" />
  </S>
);

export const AntiReplayIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="6" height="8" rx="1" />
    <rect x="12" y="20" width="6" height="8" rx="1" />
    <rect x="20" y="20" width="6" height="8" rx="1" />
    <rect x="28" y="20" width="6" height="8" rx="1" />
    <rect x="36" y="20" width="6" height="8" rx="1" />
    <line x1="2" y1="14" x2="46" y2="14" strokeDasharray="2 2" />
    <line x1="2" y1="34" x2="46" y2="34" strokeDasharray="2 2" />
    <text x="7" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">5</text>
    <text x="15" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">6</text>
    <text x="23" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">7</text>
    <text x="31" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">8</text>
    <text x="39" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">9</text>
  </S>
);

export const SpiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">0x7f3a</text>
  </S>
);

export const SadSpdIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="10" width="20" height="28" rx="2" />
    <path d="M6 16h12M6 20h12M6 24h12M6 28h10" />
    <text x="12" y="36" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">SAD</text>
    <rect x="26" y="10" width="20" height="28" rx="2" />
    <path d="M30 16h12M30 20h12M30 24h12M30 28h10" />
    <text x="36" y="36" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">SPD</text>
  </S>
);

export const Ikev2PhasesIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="5" />
    <circle cx="24" cy="24" r="5" />
    <circle cx="38" cy="24" r="5" />
    <path d="M15 24h4M29 24h4" />
    <text x="10" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">INIT</text>
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">AUTH</text>
    <text x="38" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">SA</text>
  </S>
);

export const NatTraversalIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="2" />
    <rect x="10" y="20" width="28" height="8" rx="1" />
    <text x="6" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">U</text>
    <text x="24" y="26" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">ESP</text>
    <text x="24" y="42" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">UDP 4500</text>
  </S>
);

export const WireguardIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">Wire</text>
    <text x="24" y="32" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">Guard</text>
  </S>
);

export const SiteToSiteIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="14" width="14" height="20" rx="1.5" />
    <rect x="32" y="14" width="14" height="20" rx="1.5" />
    <path d="M16 24h16" strokeWidth="2.5" />
    <path d="M16 24c4-6 12-6 16 0" strokeDasharray="2 2" />
  </S>
);

export const SplitTunnelIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="5" />
    <path d="M15 22h10M25 22l-3-2M25 22l-3 2" />
    <path d="M15 26h10M25 26l-3-2M25 26l-3 2" />
    <rect x="28" y="10" width="16" height="10" rx="1" />
    <rect x="28" y="28" width="16" height="10" rx="1" />
  </S>
);

// ------------------------------------------------------------------
// 8.7 — Brannmurer
// ------------------------------------------------------------------

export const StatelessFilterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="8" height="8" />
    <rect x="20" y="6" width="8" height="8" />
    <rect x="34" y="6" width="8" height="8" />
    <rect x="6" y="20" width="8" height="8" />
    <rect x="20" y="20" width="8" height="8" />
    <rect x="34" y="20" width="8" height="8" />
    <rect x="6" y="34" width="8" height="8" />
    <rect x="20" y="34" width="8" height="8" />
    <rect x="34" y="34" width="8" height="8" />
  </S>
);

export const StatefulFilterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="8" height="8" />
    <rect x="20" y="6" width="8" height="8" />
    <rect x="34" y="6" width="8" height="8" />
    <rect x="6" y="20" width="8" height="8" />
    <rect x="20" y="20" width="8" height="8" />
    <rect x="34" y="20" width="8" height="8" />
    <rect x="6" y="34" width="8" height="8" />
    <rect x="20" y="34" width="8" height="8" />
    <rect x="34" y="34" width="8" height="8" />
    <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.4" />
  </S>
);

export const DefaultDenyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <line x1="11" y1="11" x2="37" y2="37" strokeWidth="3" />
  </S>
);

export const ImplicitDenyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <path d="M10 14h28M10 20h28M10 26h28" />
    <path d="M10 34h28" strokeWidth="2.5" />
    <line x1="8" y1="34" x2="40" y2="34" strokeDasharray="3 2" strokeWidth="2" />
  </S>
);

export const AppFirewallIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="8" height="8" />
    <rect x="20" y="6" width="8" height="8" />
    <rect x="34" y="6" width="8" height="8" />
    <rect x="6" y="20" width="8" height="8" />
    <rect x="20" y="20" width="8" height="8" />
    <rect x="34" y="20" width="8" height="8" />
    <rect x="6" y="34" width="8" height="8" />
    <rect x="20" y="34" width="8" height="8" />
    <rect x="34" y="34" width="8" height="8" />
    <text x="24" y="27" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">L7</text>
  </S>
);

export const TunnelSmugglingIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="24" rx="22" ry="10" />
    <rect x="14" y="20" width="20" height="8" rx="1" />
    <text x="24" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SSH</text>
    <text x="24" y="40" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">TLS:443</text>
  </S>
);

export const EgressIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="20" height="20" rx="2" />
    <path d="M24 24h14M34 20l4 4-4 4" strokeWidth="2" />
    <rect x="10" y="20" width="8" height="2" />
    <rect x="10" y="26" width="8" height="2" />
  </S>
);

export const ConntrackIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="6" width="40" height="36" rx="2" />
    <path d="M4 14h40M4 22h40M4 30h40M4 38h40" />
    <path d="M14 6v36M26 6v36M36 6v36" />
  </S>
);

export const NgfwIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="8" height="8" />
    <rect x="20" y="6" width="8" height="8" />
    <rect x="34" y="6" width="8" height="8" />
    <rect x="6" y="20" width="8" height="8" />
    <rect x="20" y="20" width="8" height="8" />
    <rect x="34" y="20" width="8" height="8" />
    <rect x="6" y="34" width="8" height="8" />
    <rect x="20" y="34" width="8" height="8" />
    <rect x="34" y="34" width="8" height="8" />
    <text x="24" y="27" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">NG</text>
  </S>
);

export const WafIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4l16 6v10c0 10-7 18-16 22-9-4-16-12-16-22V10z" />
    <text x="24" y="28" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">WAF</text>
  </S>
);

export const DmzIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="14" width="14" height="20" rx="1" />
    <rect x="18" y="14" width="12" height="20" rx="1" strokeDasharray="3 2" />
    <rect x="32" y="14" width="14" height="20" rx="1" />
    <text x="24" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">DMZ</text>
  </S>
);

export const ZeroTrustIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="14" r="6" />
    <path d="M10 38c2-7 7-10 14-10s12 3 14 10" />
    <circle cx="38" cy="10" r="3" />
    <path d="M36 10l1.5 1.5L40 9" />
  </S>
);

export const IptablesIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <path d="M6 14h36" />
    <path d="M14 14v28M22 14v28M30 14v28" strokeDasharray="2 2" />
    <text x="24" y="12" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">iptables</text>
  </S>
);

// ------------------------------------------------------------------
// 8.8 — IDS/IPS
// ------------------------------------------------------------------

export const IdsIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="24" rx="20" ry="10" />
    <circle cx="24" cy="24" r="6" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
  </S>
);

export const IpsIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="24" rx="20" ry="10" />
    <circle cx="24" cy="24" r="6" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
    <line x1="10" y1="38" x2="38" y2="10" strokeWidth="2.5" />
  </S>
);

export const SignatureBasedIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <path d="M10 14h28M10 18h28M10 22h20" />
    <path d="M14 32c4-4 8 4 12-2 4-2 8 2 10 0" strokeWidth="1.6" />
  </S>
);

export const AnomalyBasedIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M4 32c4 0 4-8 8-8s4 8 8 8 4-2 8-2 4-12 8-12 4 4 8 4" />
    <circle cx="32" cy="14" r="3" />
    <line x1="32" y1="11" x2="32" y2="7" strokeWidth="1.5" />
  </S>
);

export const DpiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <path d="M14 14v20" />
    <circle cx="28" cy="24" r="5" />
    <path d="M31 27l4 4" strokeWidth="1.6" />
  </S>
);

export const FpFnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <path d="M6 24h36M24 6v36" />
    <text x="15" y="18" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">TP</text>
    <text x="33" y="18" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">FN</text>
    <text x="15" y="36" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">FP</text>
    <text x="33" y="36" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">TN</text>
  </S>
);

export const SnortIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <text x="24" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">Snort</text>
  </S>
);

export const NidsHidsIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="20" width="14" height="14" rx="1.5" />
    <text x="9" y="29" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">N</text>
    <rect x="32" y="20" width="14" height="14" rx="1.5" />
    <text x="39" y="29" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">H</text>
    <path d="M16 27h16" />
  </S>
);

export const SpanPortIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="2" />
    <circle cx="14" cy="24" r="1.5" fill="currentColor" />
    <circle cx="22" cy="24" r="1.5" fill="currentColor" />
    <circle cx="30" cy="24" r="1.5" fill="currentColor" />
    <circle cx="38" cy="24" r="1.5" fill="currentColor" />
    <path d="M14 30v4M22 30v4M30 30v4" />
    <path d="M38 30l-2 6" strokeWidth="2" />
  </S>
);

export const NetworkTapIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24h36" strokeWidth="2.5" />
    <rect x="20" y="14" width="8" height="20" rx="1" />
    <path d="M24 34v6" strokeWidth="2" />
    <rect x="18" y="38" width="12" height="6" rx="1" />
  </S>
);

export const PrecisionIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <circle cx="24" cy="24" r="12" />
    <circle cx="24" cy="24" r="6" />
    <circle cx="24" cy="24" r="2" fill="currentColor" />
  </S>
);

export const AlertFatigueIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 10c0-3 3-6 10-6s10 3 10 6v18l4 4H10l4-4z" />
    <circle cx="24" cy="38" r="3" />
    <path d="M8 14l-4-4M40 14l4-4" strokeWidth="1.4" />
    <path d="M14 24l4-4 4 4 4-4 4 4" strokeWidth="1.2" />
  </S>
);

export const EdrIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="20" height="20" rx="1.5" />
    <path d="M10 20h12M10 24h12M10 28h10" />
    <path d="M26 24h12M34 20l4 4-4 4" />
    <circle cx="42" cy="24" r="2" fill="currentColor" />
  </S>
);

export const SiemIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="6" width="12" height="10" rx="1" />
    <rect x="32" y="6" width="12" height="10" rx="1" />
    <rect x="18" y="32" width="12" height="10" rx="1" />
    <path d="M10 16l10 16M38 16l-10 16" />
    <text x="24" y="40" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">SIEM</text>
  </S>
);

export const HoneypotIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 14h20l-2 24H16z" />
    <path d="M14 14h20M14 20h20M14 26h20M14 32h20" />
    <circle cx="36" cy="10" r="3" />
    <path d="M30 12l6-2" strokeWidth="1.2" />
  </S>
);

export const TlsBlindIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M14 24c4-6 16-6 20 0-4 6-16 6-20 0z" />
    <line x1="10" y1="38" x2="38" y2="10" strokeWidth="2.5" />
    <text x="24" y="46" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">TLS</text>
  </S>
);

export const KillChainIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="24" r="3" />
    <circle cx="18" cy="24" r="3" />
    <circle cx="28" cy="24" r="3" />
    <circle cx="38" cy="24" r="3" />
    <path d="M11 24h4M21 24h4M31 24h4" />
  </S>
);

// ------------------------------------------------------------------
// 8.9 — Web-angrep
// ------------------------------------------------------------------

export const XssIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <path d="M6 14h36" />
    <circle cx="10" cy="11" r="1" fill="currentColor" />
    <circle cx="14" cy="11" r="1" fill="currentColor" />
    <text x="24" y="30" textAnchor="middle" fontSize="11" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">{"<JS>"}</text>
  </S>
);

export const XssDefenseIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4l16 6v10c0 10-7 18-16 22-9-4-16-12-16-22V10z" />
    <text x="24" y="28" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">CSP</text>
  </S>
);

export const CsrfIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="14" height="10" rx="1" />
    <text x="11" y="17" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">evil</text>
    <rect x="30" y="28" width="14" height="10" rx="1" />
    <text x="37" y="35" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">bank</text>
    <path d="M18 16l16 14" strokeWidth="2" />
    <circle cx="11" cy="32" r="4" />
    <path d="M11 32c-1-1 1-3 0-4" />
  </S>
);

export const CsrfDefenseIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">token</text>
    <path d="M4 14l4-4M44 14l-4-4" strokeWidth="1.4" />
  </S>
);

export const SqlInjectionIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="10" rx="14" ry="4" />
    <path d="M10 10v18a14 4 0 0 0 28 0V10" />
    <path d="M10 18c0 2 6 4 14 4s14-2 14-4M10 28c0 2 6 4 14 4s14-2 14-4" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">{"' OR 1=1"}</text>
  </S>
);

export const SqlDefenseIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SELECT ?</text>
  </S>
);

export const OwaspIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="6" width="32" height="36" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="10" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">10</text>
    <text x="24" y="34" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">OWASP</text>
  </S>
);

export const StoredXssIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="10" rx="14" ry="4" />
    <path d="M10 10v18a14 4 0 0 0 28 0V10" />
    <text x="24" y="24" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace" fontWeight="bold">{"<JS>"}</text>
  </S>
);

export const ReflectedXssIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="24" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">?q=&lt;JS&gt;</text>
    <path d="M14 38l4-4-4-4M14 34h20l-4-4M14 34h20l-4 4" strokeWidth="1.2" />
  </S>
);

export const DomXssIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="6" />
    <circle cx="10" cy="14" r="3" />
    <circle cx="38" cy="14" r="3" />
    <circle cx="10" cy="34" r="3" />
    <circle cx="38" cy="34" r="3" />
    <path d="M18 22l-6-6M30 22l6-6M18 26l-6 6M30 26l6 6" />
    <text x="24" y="26" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">{"<>"}</text>
  </S>
);

export const CspIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 4l16 6v10c0 10-7 18-16 22-9-4-16-12-16-22V10z" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">CSP</text>
    <text x="24" y="32" textAnchor="middle" fontSize="5" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">self</text>
  </S>
);

export const SameSiteIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="10" />
    <path d="M14 24h20M24 14v20M16 18c4 4 12 4 16 0M16 30c4-4 12-4 16 0" />
    <text x="24" y="42" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">cookie</text>
  </S>
);

export const CsrfTokenIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="8" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">T-7f3a</text>
    <path d="M2 18l4-4M46 18l-4-4" strokeWidth="1.4" />
  </S>
);

export const BlindSqliIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="10" rx="14" ry="4" />
    <path d="M10 10v18a14 4 0 0 0 28 0V10" />
    <text x="24" y="24" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">?</text>
    <line x1="10" y1="40" x2="38" y2="12" strokeWidth="1.8" strokeDasharray="2 2" />
  </S>
);

export const PreparedStmtIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="12" rx="1.5" />
    <text x="24" y="19" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">SELECT ?</text>
    <rect x="6" y="26" width="36" height="12" rx="1.5" />
    <text x="24" y="35" textAnchor="middle" fontSize="7" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">[data]</text>
  </S>
);

export const SsrfIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="1.5" />
    <path d="M20 24h14M30 20l4 4-4 4" strokeWidth="1.6" />
    <text x="38" y="20" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">169.</text>
    <text x="38" y="28" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">254</text>
  </S>
);

export const PathTraversalIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="27" textAnchor="middle" fontSize="9" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">../../</text>
  </S>
);

export const ClickjackingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="32" height="20" rx="2" />
    <rect x="14" y="18" width="16" height="8" rx="1" />
    <text x="22" y="24" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor">click</text>
    <rect x="20" y="22" width="20" height="14" rx="1" strokeDasharray="2 2" />
    <path d="M32 36l4 6" strokeWidth="1.8" />
  </S>
);

export const SriIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <text x="24" y="22" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">sha256-</text>
    <text x="24" y="30" textAnchor="middle" fontSize="6" stroke="none" fill="currentColor" fontFamily="ui-monospace,monospace">9f2a...</text>
  </S>
);
