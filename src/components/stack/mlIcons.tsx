import * as React from "react";

/**
 * Små, gjenkjennelige ikoner for ML/AI-termer (DTE-2501 AI, DTE-2602 ML,
 * RNN, RL, greedy/NP osv.). Hver eksport er en SVG tegnet i 48×48 viewBox
 * og bruker `currentColor` så den arver tekst-farge.
 *
 * Følger samme mønster som `kurose-kurs/visualDefIcons.tsx`: én-to farger,
 * tydelige linjer, designet for å fungere i 32px-sirkler inni VisualDefs.
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
// MCTS / tre-søk
// ============================================================

export const TreeSearchIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="3" />
    <circle cx="12" cy="26" r="3" />
    <circle cx="24" cy="26" r="3" />
    <circle cx="36" cy="26" r="3" />
    <circle cx="8" cy="40" r="2.5" />
    <circle cx="18" cy="40" r="2.5" />
    <circle cx="30" cy="40" r="2.5" />
    <circle cx="40" cy="40" r="2.5" />
    <path d="M22 12l-8 12M24 13v10M26 12l8 12" />
    <path d="M11 28l-2 10M13 28l4 10M34 28l-3 10M37 28l2 10" />
  </S>
);

export const SelectionIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="3" />
    <circle cx="14" cy="24" r="3" />
    <circle cx="34" cy="24" r="3" />
    <circle cx="34" cy="38" r="3" />
    <path d="M22 12l-7 10M26 12l7 10M34 27v8" strokeWidth="2.6" />
    <path d="M14 27v6M14 36h-2M14 36h2" opacity="0.4" />
  </S>
);

export const ExpansionIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="14" r="3" />
    <circle cx="14" cy="30" r="3" />
    <circle cx="34" cy="30" r="3" strokeDasharray="2 2" />
    <path d="M22 16l-7 12M26 16l7 12" strokeDasharray="2 2" />
    <path d="M30 30h8M34 26v8" strokeWidth="2.4" />
  </S>
);

export const RolloutIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="2.5" />
    <path d="M12 16l6 6M20 24l4 6M26 32l5 4M33 38l6 2" strokeDasharray="3 2" />
    <path d="M38 38l4 2M42 40l-3 1M42 40l-1-3" />
  </S>
);

export const BackpropTreeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="10" r="3" />
    <circle cx="14" cy="26" r="3" />
    <circle cx="34" cy="26" r="3" />
    <circle cx="14" cy="40" r="2.5" />
    <path d="M14 38v-9M16 31l-2-2M12 31l2-2" strokeWidth="2.2" />
    <path d="M16 24l7-11" strokeWidth="2.2" />
    <path d="M21 17l-2 2M21 17l-3-1" />
  </S>
);

export const UcbIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38l8-6 6 4 8-12 6 6 8-4" />
    <path d="M6 42h36" />
    <path d="M14 22l4-4M14 22l4 4" opacity="0.6" />
    <text x="24" y="14" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
      UCB
    </text>
  </S>
);

export const PolicyIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="2" />
    <path d="M22 24h12M30 20l4 4-4 4" />
    <circle cx="40" cy="24" r="3" />
  </S>
);

export const BranchingIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="8" r="2.5" />
    <path d="M24 10v6" />
    <path d="M24 16l-10 8M24 16l-4 8M24 16l4 8M24 16l10 8" />
    <circle cx="14" cy="26" r="2" />
    <circle cx="20" cy="26" r="2" />
    <circle cx="28" cy="26" r="2" />
    <circle cx="34" cy="26" r="2" />
    <path d="M14 28v6M20 28v6M28 28v6M34 28v6" opacity="0.5" />
  </S>
);

export const AnytimeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M24 14v10l7 4" />
    <path d="M36 12l4-4M38 10h4M38 10v-4" opacity="0.6" />
  </S>
);

// ============================================================
// HMM / Particle filter / belief
// ============================================================

export const HiddenStateIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="20" r="8" strokeDasharray="3 2" />
    <path d="M16 32l4 4M32 32l-4 4M20 36h8" />
    <circle cx="21" cy="18" r="1.2" fill="currentColor" />
    <circle cx="27" cy="18" r="1.2" fill="currentColor" />
    <path d="M20 24h8" />
  </S>
);

export const ObservationIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 24c4-8 12-12 18-12s14 4 18 12c-4 8-12 12-18 12s-14-4-18-12z" />
    <circle cx="24" cy="24" r="5" />
    <circle cx="24" cy="24" r="1.6" fill="currentColor" />
  </S>
);

export const MotionModelIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="24" r="3" />
    <circle cx="36" cy="24" r="3" />
    <path d="M14 24h18" />
    <path d="M30 20l4 4-4 4" />
    <path d="M18 18l2-4M24 16l2-4M30 18l-2-4" opacity="0.5" />
  </S>
);

export const SensorModelIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 30c4-10 24-10 28 0" />
    <path d="M14 30c3-7 17-7 20 0" opacity="0.6" />
    <path d="M18 30c2-4 10-4 12 0" opacity="0.4" />
    <circle cx="24" cy="30" r="2" fill="currentColor" />
    <path d="M24 38v4" />
  </S>
);

export const BeliefIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 36l4-2 4-6 4-12 4 6 4-2 4-4 4 8 4-6 4 4 4-2" />
    <path d="M6 40h36" />
  </S>
);

export const PredictUpdateIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="16" r="4" />
    <circle cx="34" cy="32" r="4" />
    <path d="M17 18l14 12" />
    <path d="M27 26l4 4-4 0M31 30l0-4" />
    <text x="14" y="34" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">
      pred
    </text>
    <text x="34" y="18" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">
      upd
    </text>
  </S>
);

export const ParticleFilterIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="2" />
    <circle cx="12" cy="20" r="1.2" fill="currentColor" />
    <circle cx="16" cy="26" r="1.2" fill="currentColor" />
    <circle cx="20" cy="22" r="1.2" fill="currentColor" />
    <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    <circle cx="25" cy="20" r="1.6" fill="currentColor" />
    <circle cx="27" cy="26" r="1.6" fill="currentColor" />
    <circle cx="30" cy="22" r="1.4" fill="currentColor" />
    <circle cx="32" cy="28" r="1.2" fill="currentColor" />
    <circle cx="36" cy="24" r="1" fill="currentColor" />
  </S>
);

export const ResampleIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="12" r="1.5" fill="currentColor" />
    <circle cx="18" cy="12" r="2.5" fill="currentColor" />
    <circle cx="28" cy="12" r="1" fill="currentColor" />
    <circle cx="38" cy="12" r="3" fill="currentColor" />
    <path d="M14 22v4M22 22v4M30 22v4" />
    <circle cx="14" cy="38" r="2" fill="currentColor" />
    <circle cx="22" cy="38" r="2" fill="currentColor" />
    <circle cx="30" cy="38" r="2" fill="currentColor" />
    <circle cx="38" cy="38" r="2" fill="currentColor" />
  </S>
);

// ============================================================
// RL / Q-learning / MDP
// ============================================================

export const ModelFreeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="14" height="14" rx="1.5" strokeDasharray="3 2" />
    <path d="M13 14v6M10 17h6" opacity="0.5" />
    <path d="M22 30l8-8 8 8M30 22v14" />
    <text x="13" y="32" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">
      ?
    </text>
  </S>
);

export const QTableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="1.5" />
    <path d="M6 18h36M6 26h36M6 34h36" />
    <path d="M16 10v28M26 10v28M36 10v28" />
    <text x="11" y="16" fontSize="6" textAnchor="middle" fill="currentColor" stroke="none">
      Q
    </text>
  </S>
);

export const AlphaIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      fontSize="28"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontStyle="italic"
    >
      α
    </text>
  </S>
);

export const GammaIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      fontSize="28"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontStyle="italic"
    >
      γ
    </text>
  </S>
);

export const TdErrorIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38l10-6 8 4 6-14 8 6 4-4" />
    <path d="M16 32l8 4M16 32l4-10" strokeDasharray="2 2" />
    <text x="40" y="14" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">
      δ
    </text>
  </S>
);

export const QUpdateIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="14" height="20" rx="1.5" />
    <path d="M22 24h12M30 20l4 4-4 4" />
    <rect x="34" y="14" width="8" height="20" rx="1.5" />
    <path d="M36 18v12M38 18v12M40 18v12" opacity="0.5" />
  </S>
);

export const EpsilonGreedyIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="16"
      y="32"
      fontSize="22"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontStyle="italic"
    >
      ε
    </text>
    <path d="M28 16l12 0M28 16l4-4M28 16l4 4" />
    <path d="M28 32l12 0M28 32l8-4M28 32l8 4" opacity="0.5" />
  </S>
);

// ============================================================
// RNN / sekvenser / nevrale nett
// ============================================================

export const TimestepIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 36h36" />
    <path d="M10 36v-4M18 36v-6M26 36v-8M34 36v-10M42 36v-12" />
    <text x="24" y="14" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">
      t = 1, 2, 3 ...
    </text>
  </S>
);

export const InputXIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="20" width="8" height="8" rx="1" />
    <rect x="18" y="20" width="8" height="8" rx="1" />
    <rect x="30" y="20" width="8" height="8" rx="1" />
    <text x="10" y="38" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">
      x₁
    </text>
    <text x="22" y="38" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">
      x₂
    </text>
    <text x="34" y="38" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">
      x₃
    </text>
  </S>
);

export const HiddenHIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="14" width="36" height="20" rx="3" />
    <circle cx="14" cy="24" r="2" fill="currentColor" />
    <circle cx="22" cy="24" r="2" fill="currentColor" />
    <circle cx="30" cy="24" r="2" fill="currentColor" />
    <circle cx="38" cy="24" r="2" fill="currentColor" />
    <text x="24" y="42" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">
      h_t
    </text>
  </S>
);

export const RnnCellIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="3" />
    <path d="M24 14V8M24 8h-12M12 8v6" />
    <path d="M14 14l-3-3M14 14l4 0M14 14l0 4" opacity="0.5" />
    <text x="24" y="28" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">
      RNN
    </text>
  </S>
);

export const WeightsIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="2.5" />
    <circle cx="10" cy="24" r="2.5" />
    <circle cx="10" cy="34" r="2.5" />
    <circle cx="38" cy="20" r="2.5" />
    <circle cx="38" cy="30" r="2.5" />
    <path d="M12 14l24 6M12 24l24-4M12 24l24 6M12 34l24-4" />
  </S>
);

export const OutputYIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="14" y="14" width="20" height="20" rx="3" />
    <text x="24" y="28" fontSize="12" textAnchor="middle" fill="currentColor" stroke="none">
      y
    </text>
    <path d="M34 24h8M40 22l2 2-2 2" />
  </S>
);

export const VanishingGradIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 12l4 6 4 8 4 6 4 4 4 2 4 1 4 0.5 4 0.2 4 0.1" />
    <path d="M6 40h36" />
    <path d="M40 18l-4 4M40 18l-2 4" opacity="0.4" />
  </S>
);

// ============================================================
// Greedy / kompleksitet / NP
// ============================================================

export const AlgorithmIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <path d="M10 16h24M10 22h20M10 28h26M10 34h16" />
  </S>
);

export const GreedyIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38l8-6 4 2 8-14 4 4 4-6 8 4" />
    <circle cx="14" cy="32" r="2.5" fill="currentColor" />
    <path d="M14 32l4-4M18 28l-2 0M18 28l0-2" opacity="0.6" />
  </S>
);

export const OptimalIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M24 6l4 12h12l-10 8 4 14-10-8-10 8 4-14-10-8h12z" />
  </S>
);

export const BruteForceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="6" width="10" height="10" rx="1" />
    <rect x="20" y="6" width="10" height="10" rx="1" />
    <rect x="34" y="6" width="8" height="10" rx="1" />
    <rect x="6" y="20" width="10" height="10" rx="1" />
    <rect x="20" y="20" width="10" height="10" rx="1" />
    <rect x="34" y="20" width="8" height="10" rx="1" />
    <rect x="6" y="34" width="10" height="8" rx="1" />
    <rect x="20" y="34" width="10" height="8" rx="1" />
    <rect x="34" y="34" width="8" height="8" rx="1" />
  </S>
);

export const NSymbolIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      fontSize="28"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontStyle="italic"
    >
      n
    </text>
  </S>
);

export const BigOIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 38l4-4 4-8 4-12 4 0 4 8 4 6 4 4 4 2 4 1 4 0.5" />
    <path d="M6 40h36" />
    <text x="12" y="14" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">
      O(n)
    </text>
  </S>
);

export const PolyTimeIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 40c4-2 8-6 12-12s8-14 12-18 8-6 12-6" />
    <path d="M6 40h36" />
    <text x="12" y="14" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">
      n^k
    </text>
  </S>
);

export const PclassIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <text
      x="24"
      y="30"
      fontSize="18"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontWeight="bold"
    >
      P
    </text>
  </S>
);

export const NpClassIcon = (p: IconProps) => (
  <S {...p}>
    <ellipse cx="24" cy="24" rx="18" ry="14" />
    <circle cx="20" cy="24" r="8" />
    <text x="20" y="28" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">
      P
    </text>
    <text x="34" y="22" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">
      NP
    </text>
  </S>
);

export const NpHardIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 36h36" />
    <rect x="10" y="28" width="6" height="8" />
    <rect x="18" y="22" width="6" height="14" />
    <rect x="26" y="14" width="6" height="22" />
    <rect x="34" y="10" width="6" height="26" />
    <path d="M6 8h4M44 8l-2-2M44 8l-2 2" />
  </S>
);

export const ApproxIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M8 18c4-2 8 2 12 0s8-4 12-2 8 4 8 4" />
    <path d="M8 30c4-2 8 2 12 0s8-4 12-2 8 4 8 4" />
    <text x="24" y="14" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">
      ≈
    </text>
  </S>
);

export const HarmonicIcon = (p: IconProps) => (
  <S {...p}>
    <text x="24" y="22" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">
      H_n
    </text>
    <text x="24" y="36" fontSize="9" textAnchor="middle" fill="currentColor" stroke="none">
      1+½+⅓+…
    </text>
  </S>
);

export const LogNIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 40c8-2 14-6 18-14s8-14 18-18" />
    <path d="M6 40h36" />
    <text x="14" y="16" fontSize="10" textAnchor="middle" fill="currentColor" stroke="none">
      ln n
    </text>
  </S>
);

export const TriangleIneqIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 36L24 10l14 26z" />
    <circle cx="10" cy="36" r="1.6" fill="currentColor" />
    <circle cx="24" cy="10" r="1.6" fill="currentColor" />
    <circle cx="38" cy="36" r="1.6" fill="currentColor" />
    <text x="8" y="42" fontSize="7" fill="currentColor" stroke="none">
      A
    </text>
    <text x="24" y="8" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none">
      B
    </text>
    <text x="40" y="42" fontSize="7" fill="currentColor" stroke="none">
      C
    </text>
  </S>
);
