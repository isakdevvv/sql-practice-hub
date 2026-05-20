import * as React from "react";

/**
 * Små, gjenkjennelige ikoner for OS-termer (DTE-2505).
 * Hver eksport er en SVG i 48×48 viewBox og bruker `currentColor`.
 * Holdes bevisst enkle (én-to farger, kraftige linjer) for å minne
 * om kjente symboler fra OSTEP-illustrasjonene (loggsegmenter, kø-
 * diagrammer, page-tables osv.).
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
// Event-loop / konkurrens
// ------------------------------------------------------------------

// fd: et tall-tag som peker på en åpen ressurs
export const FileDescriptorIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="1.5" />
    <line x1="10" y1="20" x2="16" y2="20" />
    <line x1="10" y1="24" x2="16" y2="24" />
    <line x1="10" y1="28" x2="14" y2="28" />
    <path d="M20 24h10" />
    <path d="M30 24l-3-2M30 24l-3 2" />
    <rect x="30" y="18" width="14" height="12" rx="1.5" />
    <text
      x="37"
      y="27"
      textAnchor="middle"
      fontSize="8"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      fd
    </text>
  </S>
);

// Blocking I/O: en pil som stopper helt
export const BlockingIoIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <line x1="14" y1="14" x2="34" y2="34" />
    <path d="M8 24h6" />
    <path d="M14 24l-2-2M14 24l-2 2" />
  </S>
);

// Non-blocking I/O: pil som returnerer med en svung
export const NonBlockingIoIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 30h12" />
    <path d="M20 30l-3-2M20 30l-3 2" />
    <path d="M28 30c0-8 6-12 12-12" />
    <path d="M40 18l-3-1M40 18l-1 3" />
    <path d="M28 18h12" />
    <path d="M28 18l3-2M28 18l3 2" />
  </S>
);

// epoll / select / poll: kø av events som strømmer ut til CPU
export const EpollIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="18" height="6" rx="1" />
    <rect x="6" y="20" width="18" height="6" rx="1" />
    <rect x="6" y="30" width="18" height="6" rx="1" />
    <path d="M24 13h10" />
    <path d="M24 23h10" />
    <path d="M24 33h10" />
    <circle cx="38" cy="23" r="6" />
    <path d="M35 23l2 2 3-4" />
  </S>
);

// Event loop: pil i sirkel
export const EventLoopIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M12 24a12 12 0 1 1 24 0" />
    <path d="M36 24a12 12 0 1 1-24 0" />
    <path d="M36 24l-3-3M36 24l3-3" />
    <path d="M12 24l-3 3M12 24l3 3" />
    <circle cx="24" cy="24" r="2.5" />
  </S>
);

// Reactor: sentral dispatcher + flere handlers
export const ReactorIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="6" />
    <path d="M24 18V8" />
    <path d="M24 30v10" />
    <path d="M18 24H8" />
    <path d="M30 24h10" />
    <rect x="6" y="6" width="6" height="6" rx="1" />
    <rect x="36" y="6" width="6" height="6" rx="1" />
    <rect x="6" y="36" width="6" height="6" rx="1" />
    <rect x="36" y="36" width="6" height="6" rx="1" />
  </S>
);

// CPU-bound vs I/O-bound: chip vs disk
export const CpuVsIoIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="12" width="14" height="14" rx="1.5" />
    <line x1="9" y1="9" x2="9" y2="12" />
    <line x1="13" y1="9" x2="13" y2="12" />
    <line x1="17" y1="9" x2="17" y2="12" />
    <line x1="9" y1="26" x2="9" y2="29" />
    <line x1="13" y1="26" x2="13" y2="29" />
    <line x1="17" y1="26" x2="17" y2="29" />
    <ellipse cx="35" cy="16" rx="8" ry="3" />
    <path d="M27 16v14a8 3 0 0 0 16 0V16" />
    <path d="M27 23a8 3 0 0 0 16 0" />
  </S>
);

// ------------------------------------------------------------------
// LFS / lagring
// ------------------------------------------------------------------

// Segment: stripe-rad med blokker (også brukbar for "Segment" i segmentation-modulen)
export const SegmentIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="18" width="36" height="12" rx="1.5" />
    <line x1="14" y1="18" x2="14" y2="30" />
    <line x1="22" y1="18" x2="22" y2="30" />
    <line x1="30" y1="18" x2="30" y2="30" />
    <line x1="38" y1="18" x2="38" y2="30" />
  </S>
);

// Append-only: stigende stack med pil
export const AppendOnlyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="30" width="28" height="6" rx="1" />
    <rect x="10" y="22" width="28" height="6" rx="1" />
    <rect x="10" y="14" width="28" height="6" rx="1" strokeDasharray="2 2" />
    <path d="M24 12V4" />
    <path d="M24 4l-3 3M24 4l3 3" />
  </S>
);

// Inode-mapping / imap: oppslagstabell — pil fra nøkkel til peker
export const ImapIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="16" height="32" rx="1.5" />
    <line x1="6" y1="16" x2="22" y2="16" />
    <line x1="6" y1="24" x2="22" y2="24" />
    <line x1="6" y1="32" x2="22" y2="32" />
    <text
      x="14"
      y="14"
      textAnchor="middle"
      fontSize="6"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      ino
    </text>
    <path d="M22 28h8" />
    <path d="M30 28l-2-2M30 28l-2 2" />
    <rect x="30" y="22" width="14" height="12" rx="1" />
    <line x1="34" y1="26" x2="40" y2="26" />
    <line x1="34" y1="30" x2="40" y2="30" />
  </S>
);

// Live vs dead block: grønn live, kryss på dead
export const LiveDeadIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="16" width="16" height="16" rx="1.5" />
    <path d="M10 24l3 3 6-6" />
    <rect x="26" y="16" width="16" height="16" rx="1.5" />
    <line x1="29" y1="19" x2="39" y2="29" />
    <line x1="39" y1="19" x2="29" y2="29" />
  </S>
);

// Garbage collection: kost over rader
export const GcIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="32" width="36" height="6" rx="1" />
    <line x1="12" y1="32" x2="12" y2="38" />
    <line x1="20" y1="32" x2="20" y2="38" />
    <line x1="28" y1="32" x2="28" y2="38" />
    <line x1="36" y1="32" x2="36" y2="38" />
    <path d="M14 32l8-14" />
    <path d="M22 18l8 4" />
    <path d="M22 18l-4 8" />
    <circle cx="30" cy="14" r="2" />
  </S>
);

// Write amplification: liten pil → stor pil
export const WriteAmpIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 18h8" />
    <path d="M14 18l-2-2M14 18l-2 2" />
    <text
      x="10"
      y="30"
      textAnchor="middle"
      fontSize="6"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      1×
    </text>
    <path d="M20 24h18" />
    <path d="M38 24l-4-4M38 24l-4 4" />
    <path d="M20 24v-6" />
    <path d="M20 24v6" />
    <text
      x="29"
      y="38"
      textAnchor="middle"
      fontSize="7"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      10×
    </text>
  </S>
);

// Checkpoint: flagg på en tidslinje
export const CheckpointIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="34" x2="42" y2="34" />
    <line x1="12" y1="32" x2="12" y2="36" />
    <line x1="22" y1="32" x2="22" y2="36" />
    <line x1="32" y1="32" x2="32" y2="36" />
    <line x1="32" y1="34" x2="32" y2="10" />
    <path d="M32 10l10 4-10 4z" />
  </S>
);

// ------------------------------------------------------------------
// Segmentation / minne
// ------------------------------------------------------------------

// Base + limit register: to verdier ved siden av en segment-stripe
export const BaseLimitIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="6" height="6" rx="1" />
    <rect x="6" y="30" width="6" height="6" rx="1" />
    <text
      x="9"
      y="25"
      textAnchor="middle"
      fontSize="5"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      base
    </text>
    <text
      x="9"
      y="35"
      textAnchor="middle"
      fontSize="5"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      lim
    </text>
    <path d="M12 23h6" />
    <path d="M12 33h6" />
    <rect x="18" y="18" width="24" height="14" rx="1.5" />
    <line x1="22" y1="18" x2="22" y2="32" strokeDasharray="2 2" />
    <line x1="38" y1="18" x2="38" y2="32" strokeDasharray="2 2" />
  </S>
);

// Intern fragmentering: blokk med ubrukt rest-areal markert
export const InternalFragIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="10" y="10" width="28" height="28" rx="1.5" />
    <rect x="13" y="13" width="22" height="14" fill="currentColor" opacity="0.25" stroke="none" />
    <line x1="13" y1="13" x2="35" y2="13" />
    <line x1="13" y1="27" x2="35" y2="27" />
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="6"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      sløsing
    </text>
  </S>
);

// Ekstern fragmentering: minne-rad med hull mellom blokker
export const ExternalFragIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="10" rx="1" />
    <rect x="6" y="22" width="8" height="6" fill="currentColor" opacity="0.4" stroke="none" />
    <rect x="20" y="22" width="6" height="6" fill="currentColor" opacity="0.4" stroke="none" />
    <rect x="32" y="22" width="10" height="6" fill="currentColor" opacity="0.4" stroke="none" />
    <path d="M16 32l-1 4M19 32l-1 4M28 32l-1 4M31 32l-1 4" opacity="0.6" />
  </S>
);

// First / Best / Worst fit: tre kandidat-luker med pil ned i én
export const FitStrategyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="22" width="10" height="10" rx="1" />
    <rect x="18" y="22" width="6" height="10" rx="1" />
    <rect x="28" y="22" width="16" height="10" rx="1" />
    <path d="M21 18v-6" />
    <path d="M21 12l-2 2M21 12l2 2" />
    <line x1="9" y1="34" x2="9" y2="38" />
    <line x1="36" y1="34" x2="36" y2="38" />
  </S>
);

// Compaction: piler som klemmer ting sammen
export const CompactionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="1.5" />
    <path d="M4 24h8" />
    <path d="M12 24l-3-3M12 24l-3 3" />
    <path d="M44 24h-8" />
    <path d="M36 24l3-3M36 24l3 3" />
    <line x1="18" y1="18" x2="30" y2="18" />
    <line x1="18" y1="24" x2="30" y2="24" />
    <line x1="18" y1="30" x2="30" y2="30" />
  </S>
);
