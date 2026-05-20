import * as React from "react";

/**
 * Små, gjenkjennelige ikoner for sannsynlighet, statistikk, regularisering
 * og big-data-algoritmer. Hver eksport er en SVG i 48×48 viewBox og bruker
 * `currentColor` så den arver tekst-farge. Holdes enkle (én-to "shapes",
 * tydelige linjer) for å minne om kjente UI-symboler (terning, bell-kurve,
 * histogram-stolper, sketch-array osv.).
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
// Probability primitives
// ------------------------------------------------------------------

export const DiceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="8" y="8" width="32" height="32" rx="4" />
    <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    <circle cx="32" cy="16" r="1.6" fill="currentColor" />
    <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    <circle cx="16" cy="32" r="1.6" fill="currentColor" />
    <circle cx="32" cy="32" r="1.6" fill="currentColor" />
  </S>
);

export const CoinIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <path d="M19 18h6M19 24h10M19 30h6" />
  </S>
);

export const ProbabilityIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" />
    <text
      x="24"
      y="29"
      textAnchor="middle"
      fontSize="12"
      fontFamily="serif"
      fill="currentColor"
      stroke="none"
    >
      P(A)
    </text>
  </S>
);

// ------------------------------------------------------------------
// Central tendency
// ------------------------------------------------------------------

export const MeanIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="36" x2="42" y2="36" />
    <rect x="9" y="26" width="5" height="10" />
    <rect x="17" y="20" width="5" height="16" />
    <rect x="25" y="14" width="5" height="22" />
    <rect x="33" y="22" width="5" height="14" />
    <line x1="6" y1="22" x2="42" y2="22" strokeDasharray="3 3" />
  </S>
);

export const MedianIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="36" x2="42" y2="36" />
    <rect x="8" y="28" width="5" height="8" />
    <rect x="15" y="22" width="5" height="14" />
    <rect x="22" y="14" width="5" height="22" />
    <rect x="29" y="20" width="5" height="16" />
    <rect x="36" y="26" width="5" height="10" />
    <line x1="24.5" y1="8" x2="24.5" y2="40" strokeDasharray="2 3" />
  </S>
);

export const VarianceIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 36c4 0 6-22 18-22s14 22 18 22" />
    <line x1="24" y1="14" x2="24" y2="36" strokeDasharray="2 3" />
    <text
      x="14"
      y="34"
      fontSize="9"
      fontFamily="serif"
      fill="currentColor"
      stroke="none"
    >
      σ
    </text>
  </S>
);

// ------------------------------------------------------------------
// Distributions
// ------------------------------------------------------------------

export const HistogramIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <rect x="8" y="28" width="5" height="10" />
    <rect x="14" y="22" width="5" height="16" />
    <rect x="20" y="14" width="5" height="24" />
    <rect x="26" y="18" width="5" height="20" />
    <rect x="32" y="24" width="5" height="14" />
    <rect x="38" y="30" width="4" height="8" />
  </S>
);

export const PdfIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <path d="M6 38c4 0 6-22 18-22s14 22 18 22" />
  </S>
);

export const CdfIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <path d="M6 36c6 0 8-2 12-12s8-12 14-12 8 0 10 0" />
  </S>
);

export const NormalIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <path d="M6 36c4 0 6-22 18-22s14 22 18 22" />
    <line x1="24" y1="14" x2="24" y2="38" strokeDasharray="2 3" />
  </S>
);

export const BinomialIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <rect x="8" y="32" width="4" height="6" />
    <rect x="13" y="26" width="4" height="12" />
    <rect x="18" y="18" width="4" height="20" />
    <rect x="23" y="12" width="4" height="26" />
    <rect x="28" y="18" width="4" height="20" />
    <rect x="33" y="26" width="4" height="12" />
    <rect x="38" y="32" width="4" height="6" />
  </S>
);

export const PoissonIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <rect x="8" y="26" width="4" height="12" />
    <rect x="13" y="16" width="4" height="22" />
    <rect x="18" y="14" width="4" height="24" />
    <rect x="23" y="20" width="4" height="18" />
    <rect x="28" y="26" width="4" height="12" />
    <rect x="33" y="30" width="4" height="8" />
    <rect x="38" y="34" width="4" height="4" />
  </S>
);

// ------------------------------------------------------------------
// Sampling / inference
// ------------------------------------------------------------------

export const SamplingIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="4" width="22" height="22" rx="2" />
    <circle cx="9" cy="10" r="1.4" fill="currentColor" />
    <circle cx="15" cy="9" r="1.4" fill="currentColor" />
    <circle cx="21" cy="13" r="1.4" fill="currentColor" />
    <circle cx="11" cy="17" r="1.4" fill="currentColor" />
    <circle cx="18" cy="21" r="1.4" fill="currentColor" />
    <path d="M26 18l8 8" />
    <circle cx="36" cy="30" r="1.8" fill="currentColor" />
    <circle cx="40" cy="36" r="1.8" fill="currentColor" />
    <circle cx="32" cy="38" r="1.8" fill="currentColor" />
  </S>
);

export const CltIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M3 22c1 0 1.5-6 4-6s3 6 4 6" />
    <path d="M13 22c1 0 1.5-6 4-6s3 6 4 6" />
    <path d="M23 22c1 0 1.5-6 4-6s3 6 4 6" />
    <path d="M9 32l3 6h6" />
    <path d="M21 32l3 6h6" />
    <path d="M33 32l-3 6" />
    <path d="M6 44c5 0 6-16 18-16s13 16 18 16" />
  </S>
);

export const CiIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="8" y1="24" x2="40" y2="24" strokeWidth="2.4" />
    <line x1="8" y1="18" x2="8" y2="30" strokeWidth="2.4" />
    <line x1="40" y1="18" x2="40" y2="30" strokeWidth="2.4" />
    <circle cx="24" cy="24" r="2.4" fill="currentColor" />
  </S>
);

export const HypothesisIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="16" width="16" height="16" rx="2" />
    <rect x="28" y="16" width="16" height="16" rx="2" />
    <text
      x="12"
      y="28"
      textAnchor="middle"
      fontSize="9"
      fontFamily="serif"
      fill="currentColor"
      stroke="none"
    >
      H₀
    </text>
    <text
      x="36"
      y="28"
      textAnchor="middle"
      fontSize="9"
      fontFamily="serif"
      fill="currentColor"
      stroke="none"
    >
      H₁
    </text>
    <path d="M20 24h8M28 24l-2-2M28 24l-2 2" />
  </S>
);

export const BootstrapIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="10" cy="14" r="2" fill="currentColor" />
    <circle cx="18" cy="14" r="2" fill="currentColor" />
    <circle cx="26" cy="14" r="2" fill="currentColor" />
    <circle cx="34" cy="14" r="2" fill="currentColor" />
    <path d="M40 18c0 6-4 10-10 10H18c-6 0-10 4-10 10" />
    <path d="M8 38l-3-3M8 38l3-3" />
    <circle cx="14" cy="36" r="1.6" fill="currentColor" />
    <circle cx="22" cy="36" r="1.6" fill="currentColor" />
    <circle cx="30" cy="36" r="1.6" fill="currentColor" />
  </S>
);

export const PValueIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <path d="M6 36c4 0 6-22 18-22s14 22 18 22" />
    <path
      d="M34 36c2 0 4-6 8-6V36z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
    />
  </S>
);

// ------------------------------------------------------------------
// Regression / ML
// ------------------------------------------------------------------

export const RegressionIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <line x1="6" y1="38" x2="6" y2="6" />
    <line x1="8" y1="36" x2="42" y2="10" />
    <circle cx="12" cy="32" r="1.4" fill="currentColor" />
    <circle cx="18" cy="30" r="1.4" fill="currentColor" />
    <circle cx="24" cy="22" r="1.4" fill="currentColor" />
    <circle cx="30" cy="20" r="1.4" fill="currentColor" />
    <circle cx="36" cy="14" r="1.4" fill="currentColor" />
  </S>
);

export const ResidualIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="24" x2="42" y2="24" />
    <circle cx="10" cy="18" r="1.4" fill="currentColor" />
    <line x1="10" y1="18" x2="10" y2="24" />
    <circle cx="18" cy="30" r="1.4" fill="currentColor" />
    <line x1="18" y1="24" x2="18" y2="30" />
    <circle cx="26" cy="20" r="1.4" fill="currentColor" />
    <line x1="26" y1="20" x2="26" y2="24" />
    <circle cx="34" cy="28" r="1.4" fill="currentColor" />
    <line x1="34" y1="24" x2="34" y2="28" />
  </S>
);

export const RidgeIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="6" x2="24" y2="42" />
    <line x1="6" y1="24" x2="42" y2="24" />
    <circle
      cx="24"
      cy="24"
      r="10"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
    />
  </S>
);

export const LassoIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="6" x2="24" y2="42" />
    <line x1="6" y1="24" x2="42" y2="24" />
    <path
      d="M24 14l10 10-10 10-10-10z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
    />
  </S>
);

export const LambdaIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="28"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      λ
    </text>
  </S>
);

export const CoefficientIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="32"
      textAnchor="middle"
      fontSize="20"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      w
    </text>
    <text
      x="32"
      y="36"
      fontSize="10"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      i
    </text>
  </S>
);

export const BiasVarianceIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <line x1="6" y1="38" x2="6" y2="6" />
    <path d="M10 30c4-6 8-8 16-8s10 2 14 6" />
    <path d="M10 10c4 6 8 8 16 8s10-2 14-6" />
    <circle cx="26" cy="22" r="2" fill="currentColor" />
  </S>
);

export const ElasticNetIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="6" x2="24" y2="42" />
    <line x1="6" y1="24" x2="42" y2="24" />
    <path
      d="M24 14c5 0 9 4 9 9s-4 9-9 9-9-4-9-9c0-3 1-5 3-7z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
    />
  </S>
);

// ------------------------------------------------------------------
// Linear algebra: eigen / SVD / PCA
// ------------------------------------------------------------------

export const EigenvectorIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="24" y1="40" x2="24" y2="8" />
    <path d="M24 8l-3 5M24 8l3 5" />
    <text
      x="30"
      y="22"
      fontSize="11"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      v
    </text>
  </S>
);

export const EigenvalueIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="28"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      λ
    </text>
  </S>
);

export const EigenDecompIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" />
    <line x1="11" y1="14" x2="11" y2="34" strokeDasharray="2 2" />
    <line x1="4" y1="24" x2="18" y2="24" strokeDasharray="2 2" />
    <text x="22" y="27" fontSize="10" fill="currentColor" stroke="none">
      =
    </text>
    <rect x="28" y="14" width="16" height="20" />
    <line x1="28" y1="14" x2="44" y2="34" />
  </S>
);

export const SvdIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="2" y="14" width="10" height="20" />
    <text x="13" y="27" fontSize="9" fill="currentColor" stroke="none">
      =
    </text>
    <rect x="18" y="14" width="8" height="20" />
    <line x1="18" y1="14" x2="26" y2="34" />
    <text x="26" y="27" fontSize="9" fill="currentColor" stroke="none">
      ·
    </text>
    <rect x="30" y="14" width="14" height="10" />
    <line x1="30" y1="14" x2="44" y2="24" strokeDasharray="2 2" />
  </S>
);

export const SingularValueIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <rect x="9" y="10" width="5" height="28" />
    <rect x="17" y="18" width="5" height="20" />
    <rect x="25" y="26" width="5" height="12" />
    <rect x="33" y="32" width="5" height="6" />
    <text
      x="6"
      y="46"
      fontSize="9"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      σ
    </text>
  </S>
);

export const RankIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" />
    <line x1="6" y1="20" x2="42" y2="20" />
    <line x1="6" y1="30" x2="42" y2="30" />
    <line x1="20" y1="10" x2="20" y2="38" />
    <line x1="32" y1="10" x2="32" y2="38" />
    <text
      x="24"
      y="46"
      textAnchor="middle"
      fontSize="9"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      r
    </text>
  </S>
);

export const RankKIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" />
    <line x1="14" y1="10" x2="14" y2="38" strokeDasharray="2 2" />
    <line x1="6" y1="18" x2="42" y2="18" strokeDasharray="2 2" />
    <rect
      x="6"
      y="10"
      width="8"
      height="8"
      fill="currentColor"
      fillOpacity="0.2"
    />
  </S>
);

export const PcaIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="32" r="1.4" fill="currentColor" />
    <circle cx="18" cy="28" r="1.4" fill="currentColor" />
    <circle cx="22" cy="26" r="1.4" fill="currentColor" />
    <circle cx="28" cy="22" r="1.4" fill="currentColor" />
    <circle cx="32" cy="18" r="1.4" fill="currentColor" />
    <circle cx="36" cy="14" r="1.4" fill="currentColor" />
    <line x1="10" y1="36" x2="40" y2="10" />
    <path d="M40 10l-4 0M40 10l0 4" />
  </S>
);

// ------------------------------------------------------------------
// GMM / clustering / autoencoder
// ------------------------------------------------------------------

export const GmmIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="4" y1="38" x2="44" y2="38" />
    <path d="M4 36c2 0 4-16 12-16s10 16 12 16" />
    <path d="M22 36c2 0 4-12 10-12s8 12 12 12" />
  </S>
);

export const MixingCoefIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="28"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      π
    </text>
  </S>
);

export const MuIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="28"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      μ
    </text>
  </S>
);

export const SigmaIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="34"
      textAnchor="middle"
      fontSize="28"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      Σ
    </text>
  </S>
);

export const ResponsibilityIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="16" cy="24" r="10" />
    <circle cx="32" cy="24" r="10" />
    <circle cx="24" cy="24" r="1.8" fill="currentColor" />
    <text
      x="24"
      y="46"
      textAnchor="middle"
      fontSize="9"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      γ
    </text>
  </S>
);

export const EmAlgoIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="14"
      y="20"
      textAnchor="middle"
      fontSize="11"
      fontFamily="serif"
      fontWeight="bold"
      fill="currentColor"
      stroke="none"
    >
      E
    </text>
    <text
      x="34"
      y="34"
      textAnchor="middle"
      fontSize="11"
      fontFamily="serif"
      fontWeight="bold"
      fill="currentColor"
      stroke="none"
    >
      M
    </text>
    <path d="M20 16c8-2 14 4 14 12" />
    <path d="M34 28l-2 2M34 28l-2-2" strokeLinecap="round" />
    <path d="M28 36c-8 2-14-4-14-12" />
    <path d="M14 24l2-2M14 24l2 2" strokeLinecap="round" />
  </S>
);

export const LogLikelihoodIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="38" x2="42" y2="38" />
    <line x1="6" y1="38" x2="6" y2="6" />
    <path d="M8 36c4 0 8-8 14-14s12-12 18-12" />
    <text
      x="32"
      y="32"
      fontSize="10"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      L
    </text>
  </S>
);

export const AutoencoderIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="8" cy="12" r="2" />
    <circle cx="8" cy="24" r="2" />
    <circle cx="8" cy="36" r="2" />
    <circle cx="20" cy="20" r="2" />
    <circle cx="20" cy="28" r="2" />
    <circle cx="28" cy="24" r="2" />
    <circle cx="36" cy="20" r="2" />
    <circle cx="36" cy="28" r="2" />
    <circle cx="44" cy="12" r="2" />
    <circle cx="44" cy="24" r="2" />
    <circle cx="44" cy="36" r="2" />
    <path d="M10 12l8 8M10 24l8-4M10 24l8 4M10 36l8-8" />
    <path d="M22 20l4 4M22 28l4-4M30 24l4-4M30 24l4 4" />
    <path d="M38 20l4-8M38 20l4 4M38 28l4-4M38 28l4 8" />
  </S>
);

export const LatentSpaceIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="14" strokeDasharray="3 3" />
    <circle cx="24" cy="24" r="2.4" fill="currentColor" />
    <text
      x="24"
      y="46"
      textAnchor="middle"
      fontSize="9"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      z
    </text>
  </S>
);

export const EncoderIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 8l18 16L6 40z" />
    <text
      x="14"
      y="28"
      fontSize="10"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      f
    </text>
  </S>
);

export const DecoderIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M42 8L24 24l18 16z" />
    <text
      x="30"
      y="28"
      fontSize="10"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      g
    </text>
  </S>
);

export const ReconstructionIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="14" width="14" height="20" />
    <text x="8" y="46" fontSize="8" fill="currentColor" stroke="none">
      x
    </text>
    <path d="M20 24l8 0M28 24l-2-2M28 24l-2 2" />
    <rect x="30" y="14" width="14" height="20" strokeDasharray="2 2" />
    <text x="34" y="46" fontSize="8" fill="currentColor" stroke="none">
      x̂
    </text>
  </S>
);

export const UnderOverCompleteIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M6 8l18 16L6 40zM42 8L24 24l18 16z" />
    <text
      x="24"
      y="46"
      textAnchor="middle"
      fontSize="9"
      fontFamily="serif"
      fill="currentColor"
      stroke="none"
    >
      k
    </text>
  </S>
);

// ------------------------------------------------------------------
// Big-data probabilistic
// ------------------------------------------------------------------

export const HashIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="14" y1="6" x2="10" y2="42" />
    <line x1="34" y1="6" x2="30" y2="42" />
    <line x1="6" y1="18" x2="42" y2="18" />
    <line x1="6" y1="30" x2="42" y2="30" />
  </S>
);

export const BitarrayIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="6" height="12" />
    <rect x="10" y="18" width="6" height="12" fill="currentColor" fillOpacity="0.3" />
    <rect x="16" y="18" width="6" height="12" />
    <rect x="22" y="18" width="6" height="12" fill="currentColor" fillOpacity="0.3" />
    <rect x="28" y="18" width="6" height="12" />
    <rect x="34" y="18" width="6" height="12" fill="currentColor" fillOpacity="0.3" />
    <text x="6" y="27" fontSize="9" fill="currentColor" stroke="none">0</text>
    <text x="12" y="27" fontSize="9" fill="currentColor" stroke="none">1</text>
    <text x="18" y="27" fontSize="9" fill="currentColor" stroke="none">0</text>
    <text x="24" y="27" fontSize="9" fill="currentColor" stroke="none">1</text>
    <text x="30" y="27" fontSize="9" fill="currentColor" stroke="none">0</text>
    <text x="36" y="27" fontSize="9" fill="currentColor" stroke="none">1</text>
  </S>
);

export const BucketIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M10 14h28l-3 24H13z" />
    <line x1="9" y1="14" x2="39" y2="14" />
    <circle cx="24" cy="26" r="3" fill="currentColor" />
  </S>
);

export const CardinalityIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="28"
      textAnchor="middle"
      fontSize="11"
      fontFamily="serif"
      fill="currentColor"
      stroke="none"
    >
      {"{a,b,c}"}
    </text>
    <text
      x="24"
      y="42"
      textAnchor="middle"
      fontSize="11"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      |·| = 3
    </text>
  </S>
);

export const ProbabilisticAlgoIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="14" cy="14" r="3" fill="currentColor" />
    <circle cx="34" cy="14" r="3" />
    <circle cx="14" cy="34" r="3" />
    <circle cx="34" cy="34" r="3" fill="currentColor" />
    <line x1="14" y1="14" x2="34" y2="34" strokeDasharray="2 2" />
    <line x1="34" y1="14" x2="14" y2="34" strokeDasharray="2 2" />
  </S>
);

export const FalsePositiveIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="24" r="16" />
    <path d="M16 16l16 16M32 16L16 32" strokeWidth="2.4" />
  </S>
);

export const JaccardIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="18" cy="24" r="12" />
    <circle cx="30" cy="24" r="12" />
  </S>
);

export const ShingleIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="18" width="12" height="12" />
    <rect x="12" y="18" width="12" height="12" />
    <rect x="20" y="18" width="12" height="12" />
    <rect x="28" y="18" width="12" height="12" />
  </S>
);

export const LeadingZerosIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="29"
      textAnchor="middle"
      fontSize="11"
      fontFamily="monospace"
      fill="currentColor"
      stroke="none"
    >
      000101
    </text>
    <path d="M9 32l8 0M9 32l0-3" />
  </S>
);

export const ShaIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="10" width="36" height="28" rx="2" />
    <path d="M24 18v4M24 22l-4 2M24 22l4 2M20 24v6M28 24v6" />
    <circle cx="24" cy="18" r="2" fill="currentColor" />
  </S>
);

export const MapReduceIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="8" width="10" height="8" />
    <rect x="4" y="20" width="10" height="8" />
    <rect x="4" y="32" width="10" height="8" />
    <rect x="34" y="14" width="10" height="8" />
    <rect x="34" y="26" width="10" height="8" />
    <path d="M14 12l20 6M14 24l20-6M14 24l20 6M14 36l20-6" />
  </S>
);

export const BloomFormulaIcon = (p: IconProps) => (
  <S {...p}>
    <text
      x="24"
      y="32"
      textAnchor="middle"
      fontSize="14"
      fontFamily="serif"
      fontStyle="italic"
      fill="currentColor"
      stroke="none"
    >
      m,n,k
    </text>
  </S>
);
