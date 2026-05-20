import * as React from "react";

/**
 * Egen-tegnede SVG-ikoner for forkurs-modulene F-01..F-11. Hver eksport er
 * en SVG i 48×48 viewBox som bruker `currentColor` så den arver tekst-farge
 * fra omgivelsen. Stilen er bevisst minimal (én-to farger, kraftige linjer)
 * for å minne om kjente UI-symboler — dukkehus, harddisk, kamera, hengelås.
 *
 * Brukes sammen med `VisualDefs` fra `../kurose-kurs/VisualDefs`.
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

// Hjelper for å tegne tekst inni ikoner (uten stroke, fyllt currentColor)
function Tx({
  x,
  y,
  size = 9,
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
      fontWeight={700}
    >
      {children}
    </text>
  );
}

// ------------------------------------------------------------------
// F-01: host / guest / hypervisor
// ------------------------------------------------------------------

// "Host" — datamaskin med et lite hus oppå (din ekte maskin = hjemmet)
export const HostIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="36" height="20" rx="2" />
    <path d="M4 44h40l-2 2H6z" />
    <line x1="20" y1="36" x2="28" y2="36" />
    {/* lite hus oppå */}
    <path d="M16 18l8-10 8 10" />
    <rect x="20" y="12" width="8" height="6" />
  </S>
);

// "Guest" — datamaskin med spørsmålstegn (tror den kjører på ekte maskinvare)
export const GuestIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="22" rx="2" />
    <path d="M4 40h40l-2 4H6z" />
    <path d="M20 24c0-2 2-4 4-4s4 2 4 4-4 2-4 5" />
    <circle cx="24" cy="32" r="0.8" fill="currentColor" stroke="none" />
  </S>
);

// "Hypervisor" — lagdelt sandwich; tre stablete lag med en uthevet mellommann
export const HypervisorIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="8" rx="1.5" />
    <rect x="6" y="20" width="36" height="8" rx="1.5" strokeWidth="2.4" />
    <rect x="6" y="32" width="36" height="8" rx="1.5" />
    <Tx x={24} y={26} size={6}>HV</Tx>
  </S>
);

// ------------------------------------------------------------------
// F-02: ISO / Disk-image / RAM-allokering
// ------------------------------------------------------------------

// "ISO" — DVD/skive med hull i midten
export const IsoDiscIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="18" />
    <circle cx="24" cy="24" r="4" />
    <path d="M24 6a18 18 0 0 1 13 30" />
    <Tx x={24} y={14} size={5}>ISO</Tx>
  </S>
);

// "Disk-image (.vdi)" — rektangel med .vdi-etikett
export const DiskImageIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <line x1="6" y1="18" x2="42" y2="18" />
    <Tx x={24} y={30} size={8}>.vdi</Tx>
  </S>
);

// "RAM-allokering" — chip med pinner
export const RamChipIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="14" width="28" height="20" rx="1.5" />
    <line x1="14" y1="34" x2="14" y2="40" />
    <line x1="20" y1="34" x2="20" y2="40" />
    <line x1="28" y1="34" x2="28" y2="40" />
    <line x1="34" y1="34" x2="34" y2="40" />
    <line x1="14" y1="8" x2="14" y2="14" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="28" y1="8" x2="28" y2="14" />
    <line x1="34" y1="8" x2="34" y2="14" />
    <Tx x={24} y={27} size={7}>RAM</Tx>
  </S>
);

// ------------------------------------------------------------------
// F-03: snapshot / rollback / tilstand
// ------------------------------------------------------------------

// "Snapshot" — kamera
export const CameraSnapshotIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 14h6l2-4h20l2 4h6v24H6z" />
    <circle cx="24" cy="26" r="7" />
    <circle cx="24" cy="26" r="3" />
    <circle cx="38" cy="18" r="1" fill="currentColor" stroke="none" />
  </S>
);

// "Rollback" — sirkelpil bakover
export const RollbackIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 24a14 14 0 1 0 4-10" />
    <path d="M14 6v10h10" />
  </S>
);

// "Tilstand" — state-machine boks med to noder
export const TilstandIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="7" />
    <circle cx="34" cy="24" r="7" />
    <path d="M21 24h6" />
    <path d="M27 24l-2-2M27 24l-2 2" />
    <Tx x={14} y={27} size={7}>A</Tx>
    <Tx x={34} y={27} size={7}>B</Tx>
  </S>
);

// ------------------------------------------------------------------
// F-04: prompt / shell / kommando
// ------------------------------------------------------------------

// "Prompt" — $_ med blinkende cursor
export const PromptIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="10" width="40" height="28" rx="2" />
    <Tx x={14} y={29} size={12}>$</Tx>
    <rect x="22" y="22" width="8" height="2" fill="currentColor" stroke="none" />
  </S>
);

// "Shell" — terminal-vindu med > tegn
export const ShellIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="40" height="32" rx="2" />
    <line x1="4" y1="14" x2="44" y2="14" />
    <circle cx="8" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="11" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11" r="0.8" fill="currentColor" stroke="none" />
    <path d="M10 24l4 3-4 3" />
    <line x1="18" y1="32" x2="32" y2="32" />
  </S>
);

// "Kommando" — skrevet linje med blinkende understrek
export const KommandoIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <Tx x={24} y={27} size={8}>ls -la</Tx>
    <line x1="14" y1="30" x2="34" y2="30" />
  </S>
);

// ------------------------------------------------------------------
// F-05: Python-typer
// ------------------------------------------------------------------

export const IntIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="3" />
    <Tx x={24} y={31} size={20}>1</Tx>
  </S>
);

export const StrIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="3" />
    <Tx x={24} y={31} size={18}>&quot;a&quot;</Tx>
  </S>
);

export const FloatIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="3" />
    <Tx x={24} y={30} size={13}>1.5</Tx>
  </S>
);

export const BoolIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="18" height="20" rx="2" />
    <rect x="26" y="14" width="18" height="20" rx="2" />
    <Tx x={13} y={28} size={11}>T</Tx>
    <Tx x={35} y={28} size={11}>F</Tx>
  </S>
);

export const ListIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 8v32M38 8v32M10 8h2M10 40h2M38 8h-2M38 40h-2" />
    <Tx x={16} y={28} size={8}>1,</Tx>
    <Tx x={24} y={28} size={8}>2,</Tx>
    <Tx x={32} y={28} size={8}>3</Tx>
  </S>
);

export const DictIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 8c-3 0-4 1-4 4v6c0 3-2 4-4 6 2 2 4 3 4 6v6c0 3 1 4 4 4" />
    <path d="M34 8c3 0 4 1 4 4v6c0 3 2 4 4 6-2 2-4 3-4 6v6c0 3-1 4-4 4" />
    <Tx x={24} y={28} size={9}>k:v</Tx>
  </S>
);

// ------------------------------------------------------------------
// F-06: open / close / with / filsti
// ------------------------------------------------------------------

export const OpenFileIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 12h12l4 4h12v20H10z" />
    <path d="M14 20l4-4" />
    <Tx x={28} y={32} size={7}>open</Tx>
  </S>
);

export const CloseFileIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="8" width="28" height="32" rx="2" />
    <path d="M18 20l12 12M30 20l-12 12" />
  </S>
);

export const WithBlockIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 8c-4 0-4 4-4 8v8c0 4 0 8-4 8 4 0 4 4 4 8v0c0 4 0 8 4 8" />
    <path d="M34 8c4 0 4 4 4 8v8c0 4 0 8 4 8-4 0-4 4-4 8v0c0 4 0 8-4 8" />
    <Tx x={24} y={28} size={8}>with</Tx>
  </S>
);

export const FilstiIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="40" height="16" rx="2" />
    <Tx x={24} y={27} size={7}>/a/b.txt</Tx>
  </S>
);

// ------------------------------------------------------------------
// F-07: klient / ISP / DNS / server
// ------------------------------------------------------------------

// "Klient" — laptop
export const KlientLaptopIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="12" width="28" height="18" rx="1.5" />
    <line x1="14" y1="16" x2="34" y2="16" />
    <path d="M6 34h36l-2 4H8z" />
  </S>
);

// "ISP" — sky
export const IspCloudIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M14 32a8 8 0 0 1 1-15 10 10 0 0 1 19 2 7 7 0 0 1-2 13z" />
    <Tx x={24} y={28} size={7}>ISP</Tx>
  </S>
);

// "DNS" — boks med forstørrelses-glass og A→IP-pil
export const DnsLookupIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="22" rx="2" />
    <circle cx="16" cy="21" r="5" />
    <line x1="20" y1="25" x2="24" y2="29" />
    <Tx x={32} y={24} size={7}>→IP</Tx>
    <Tx x={24} y={40} size={7}>DNS</Tx>
  </S>
);

// "Server" — rack med disker
export const ServerRackIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="6" width="32" height="36" rx="2" />
    <line x1="8" y1="16" x2="40" y2="16" />
    <line x1="8" y1="26" x2="40" y2="26" />
    <line x1="8" y1="36" x2="40" y2="36" />
    <circle cx="36" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="36" cy="21" r="1" fill="currentColor" stroke="none" />
    <circle cx="36" cy="31" r="1" fill="currentColor" stroke="none" />
  </S>
);

// ------------------------------------------------------------------
// F-08: porter — SSH / SMTP / DNS / HTTP / HTTPS / MySQL
// ------------------------------------------------------------------

// SSH — nøkkel
export const SshKeyIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="24" r="6" />
    <path d="M20 24h22" />
    <path d="M34 24v6M38 24v4" />
    <Tx x={14} y={27} size={6}>22</Tx>
  </S>
);

// SMTP — konvolutt
export const SmtpEnvelopeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="12" width="40" height="24" rx="2" />
    <path d="M4 14l20 14L44 14" />
    <Tx x={24} y={34} size={6}>25</Tx>
  </S>
);

// DNS — forstørrelsesglass over tekst
export const DnsMagnifierIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="20" cy="22" r="10" />
    <line x1="28" y1="30" x2="40" y2="42" strokeWidth="2.6" />
    <Tx x={20} y={25} size={7}>DNS</Tx>
    <Tx x={20} y={42} size={6}>53</Tx>
  </S>
);

// HTTP — globus
export const HttpGlobeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M8 24h32" />
    <path d="M24 8c5 5 5 27 0 32M24 8c-5 5-5 27 0 32" />
    <Tx x={24} y={46} size={6}>80</Tx>
  </S>
);

// HTTPS — hengelås
export const HttpsLockIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="20" width="28" height="20" rx="2" />
    <path d="M16 20v-4a8 8 0 0 1 16 0v4" />
    <circle cx="24" cy="30" r="2" fill="currentColor" stroke="none" />
    <Tx x={24} y={46} size={6}>443</Tx>
  </S>
);

// MySQL — database-sylindre
export const MysqlDbIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="10" rx="14" ry="4" />
    <path d="M10 10v10c0 2 6 4 14 4s14-2 14-4V10" />
    <path d="M10 20v10c0 2 6 4 14 4s14-2 14-4V20" />
    <Tx x={24} y={42} size={6}>3306</Tx>
  </S>
);

// ------------------------------------------------------------------
// F-10: bit / byte / binær / desimal
// ------------------------------------------------------------------

// "bit" — én celle med 1
export const BitIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="14" width="12" height="20" rx="1.5" />
    <Tx x={24} y={29} size={14}>1</Tx>
  </S>
);

// "byte" — 8 celler i en rad
export const ByteIcon = (p: IconProps) => (
  <S {...p}>
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x={4 + i * 5} y={18} width={4} height={12} rx={0.5} />
    ))}
    <Tx x={24} y={42} size={7}>8 bits</Tx>
  </S>
);

// "binær" — 10101
export const BinaerIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <Tx x={24} y={28} size={10}>10101</Tx>
  </S>
);

// "desimal" — 123
export const DesimalIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="40" height="20" rx="2" />
    <Tx x={24} y={28} size={12}>123</Tx>
  </S>
);
