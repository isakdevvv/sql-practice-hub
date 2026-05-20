import * as React from "react";

/**
 * Små, gjenkjennelige ikoner for «Databaser & web»-mini-kurset (DTE-2509).
 * Hver eksport er en SVG i 48×48 viewBox, bruker `currentColor` så fargen
 * arves av tekst-konteksten. Holdes bevisst enkle (1–2 farger, kraftige
 * linjer) for å minne om kjente UI-symboler: HTML-tag, nøkkel, tabell osv.
 *
 * Speiler stilen fra `kurose-kurs/visualDefIcons.tsx` så heile prosjektet
 * har konsistent ikon-språk.
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
// HTML / CSS / JS
// ------------------------------------------------------------------

export const HtmlTagIcon = (p: IconProps) => (
  <S {...p}>
    {/* <h> tag */}
    <path d="M6 14l-4 10 4 10" />
    <path d="M42 14l4 10-4 10" />
    <text
      x="24"
      y="30"
      textAnchor="middle"
      fontSize="13"
      fontFamily="ui-monospace, monospace"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      h
    </text>
  </S>
);

export const CssRuleIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="3" />
    <line x1="12" y1="16" x2="20" y2="16" />
    <line x1="14" y1="22" x2="34" y2="22" />
    <line x1="14" y1="28" x2="30" y2="28" />
    <line x1="14" y1="34" x2="26" y2="34" />
  </S>
);

export const JsBracesIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M18 8c-4 0-6 2-6 6v6c0 2-1 4-4 4 3 0 4 2 4 4v6c0 4 2 6 6 6" />
    <path d="M30 8c4 0 6 2 6 6v6c0 2 1 4 4 4-3 0-4 2-4 4v6c0 4-2 6-6 6" />
  </S>
);

export const DomTreeIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="18" y="6" width="12" height="8" rx="1.5" />
    <line x1="24" y1="14" x2="24" y2="20" />
    <line x1="12" y1="20" x2="36" y2="20" />
    <line x1="12" y1="20" x2="12" y2="26" />
    <line x1="24" y1="20" x2="24" y2="26" />
    <line x1="36" y1="20" x2="36" y2="26" />
    <rect x="6" y="26" width="12" height="8" rx="1.5" />
    <rect x="18" y="26" width="12" height="8" rx="1.5" />
    <rect x="30" y="26" width="12" height="8" rx="1.5" />
  </S>
);

// ------------------------------------------------------------------
// Git
// ------------------------------------------------------------------

export const GitCommitIcon = (p: IconProps) => (
  <S {...p}>
    <line x1="6" y1="24" x2="18" y2="24" />
    <line x1="30" y1="24" x2="42" y2="24" />
    <circle cx="24" cy="24" r="6" />
  </S>
);

export const GitBranchIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="10" r="3" />
    <circle cx="12" cy="38" r="3" />
    <circle cx="36" cy="24" r="3" />
    <line x1="12" y1="13" x2="12" y2="35" />
    <path d="M12 24c0-6 6-11 21-11" transform="translate(0,0)" />
  </S>
);

export const GitMergeIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="10" r="3" />
    <circle cx="36" cy="10" r="3" />
    <circle cx="24" cy="38" r="3" />
    <path d="M12 13c0 8 6 12 12 16" />
    <path d="M36 13c0 8-6 12-12 16" />
  </S>
);

// ------------------------------------------------------------------
// Flask / Routing / Jinja
// ------------------------------------------------------------------

export const FlaskBottleIcon = (p: IconProps) => (
  <S {...p}>
    <path d="M18 6h12v8l8 22a4 4 0 0 1-4 5H14a4 4 0 0 1-4-5l8-22V6" />
    <line x1="18" y1="14" x2="30" y2="14" />
    <path d="M14 30h20" />
  </S>
);

export const RouteIcon = (p: IconProps) => (
  <S {...p}>
    {/* URL boks -> pil -> handler boks */}
    <rect x="4" y="18" width="16" height="12" rx="1.5" />
    <rect x="28" y="18" width="16" height="12" rx="1.5" />
    <line x1="20" y1="24" x2="28" y2="24" />
    <path d="M28 24l-3-2M28 24l-3 2" />
    <line x1="8" y1="24" x2="16" y2="24" />
    <line x1="32" y1="22" x2="40" y2="22" />
    <line x1="32" y1="26" x2="38" y2="26" />
  </S>
);

export const JinjaIcon = (p: IconProps) => (
  <S {...p}>
    {/* {{ }} */}
    <path d="M14 8c-3 0-5 2-5 5v7c0 2-1 4-3 4 2 0 3 2 3 4v7c0 3 2 5 5 5" />
    <path d="M18 8c-3 0-5 2-5 5v7c0 2-1 4-3 4 2 0 3 2 3 4v7c0 3 2 5 5 5" />
    <path d="M34 8c3 0 5 2 5 5v7c0 2 1 4 3 4-2 0-3 2-3 4v7c0 3-2 5-5 5" />
    <path d="M30 8c3 0 5 2 5 5v7c0 2 1 4 3 4-2 0-3 2-3 4v7c0 3-2 5-5 5" />
  </S>
);

// ------------------------------------------------------------------
// Database — tabell, rad, kolonne, nøkler
// ------------------------------------------------------------------

export const DbTableIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="6" y="8" width="36" height="32" rx="2" />
    <line x1="6" y1="18" x2="42" y2="18" />
    <line x1="6" y1="28" x2="42" y2="28" />
    <line x1="20" y1="8" x2="20" y2="40" />
    <line x1="32" y1="8" x2="32" y2="40" />
  </S>
);

export const DbRowIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="4" y="20" width="40" height="8" rx="1.5" />
    <line x1="14" y1="20" x2="14" y2="28" />
    <line x1="24" y1="20" x2="24" y2="28" />
    <line x1="34" y1="20" x2="34" y2="28" />
  </S>
);

export const DbColumnIcon = (p: IconProps) => (
  <S {...p}>
    <rect x="20" y="4" width="8" height="40" rx="1.5" />
    <line x1="20" y1="14" x2="28" y2="14" />
    <line x1="20" y1="24" x2="28" y2="24" />
    <line x1="20" y1="34" x2="28" y2="34" />
  </S>
);

export const PrimaryKeyIcon = (p: IconProps) => (
  <S {...p}>
    {/* Nøkkel */}
    <circle cx="14" cy="24" r="7" />
    <circle cx="14" cy="24" r="2.5" />
    <line x1="21" y1="24" x2="42" y2="24" />
    <line x1="36" y1="24" x2="36" y2="30" />
    <line x1="42" y1="24" x2="42" y2="32" />
  </S>
);

export const ForeignKeyIcon = (p: IconProps) => (
  <S {...p}>
    {/* To sammenkoblede nøkler */}
    <circle cx="12" cy="24" r="5" />
    <circle cx="12" cy="24" r="1.8" />
    <line x1="17" y1="24" x2="24" y2="24" />
    <circle cx="36" cy="24" r="5" />
    <circle cx="36" cy="24" r="1.8" />
    <line x1="24" y1="24" x2="31" y2="24" />
    <path d="M22 21l2-3M22 27l2 3M26 21l-2-3M26 27l-2 3" />
  </S>
);

export const JoinIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="18" cy="24" r="10" />
    <circle cx="30" cy="24" r="10" />
  </S>
);

export const FuncDepIcon = (p: IconProps) => (
  <S {...p}>
    {/* X -> Y */}
    <text
      x="10"
      y="30"
      fontSize="14"
      fontFamily="ui-monospace, monospace"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      X
    </text>
    <line x1="18" y1="24" x2="30" y2="24" />
    <path d="M30 24l-3-2M30 24l-3 2" />
    <text
      x="32"
      y="30"
      fontSize="14"
      fontFamily="ui-monospace, monospace"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      Y
    </text>
  </S>
);

export const DeterminantIcon = (p: IconProps) => (
  <S {...p}>
    {/* Pil ut fra en boks: «X bestemmer» */}
    <rect x="4" y="18" width="14" height="12" rx="1.5" />
    <text
      x="11"
      y="28"
      textAnchor="middle"
      fontSize="9"
      fontFamily="ui-monospace, monospace"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      X
    </text>
    <line x1="18" y1="24" x2="32" y2="24" />
    <path d="M32 24l-3-2M32 24l-3 2" />
    <circle cx="38" cy="18" r="2" />
    <circle cx="38" cy="24" r="2" />
    <circle cx="38" cy="30" r="2" />
  </S>
);

export const CandidateKeyIcon = (p: IconProps) => (
  <S {...p}>
    {/* Liten nøkkel med stjerne — minimal og unik */}
    <circle cx="14" cy="24" r="6" />
    <circle cx="14" cy="24" r="2" />
    <line x1="20" y1="24" x2="38" y2="24" />
    <line x1="34" y1="24" x2="34" y2="28" />
    <path d="M40 10l1.2 3 3-0.2-2.4 1.8 0.8 3-2.6-1.6-2.6 1.6 0.8-3-2.4-1.8 3 0.2z" />
  </S>
);

// ------------------------------------------------------------------
// SQL-kommandoer
// ------------------------------------------------------------------

function KeywordIcon(label: string) {
  return (p: IconProps) => (
    <S {...p}>
      <rect x="4" y="16" width="40" height="16" rx="3" />
      <text
        x="24"
        y="27"
        textAnchor="middle"
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        {label}
      </text>
    </S>
  );
}

export const SelectIcon = KeywordIcon("SELECT");
export const InsertIcon = KeywordIcon("INSERT");
export const UpdateIcon = KeywordIcon("UPDATE");
export const DeleteIcon = KeywordIcon("DELETE");

export const IndexIcon = (p: IconProps) => (
  <S {...p}>
    {/* Bok med bokmerke */}
    <rect x="8" y="6" width="28" height="36" rx="1.5" />
    <line x1="14" y1="14" x2="30" y2="14" />
    <line x1="14" y1="20" x2="30" y2="20" />
    <line x1="14" y1="26" x2="30" y2="26" />
    <path d="M36 6v18l-4-4-4 4V6" />
  </S>
);

export const TransactionIcon = (p: IconProps) => (
  <S {...p}>
    {/* ACID som 4 små bokser */}
    <rect x="4" y="14" width="9" height="9" rx="1" />
    <rect x="15" y="14" width="9" height="9" rx="1" />
    <rect x="26" y="14" width="9" height="9" rx="1" />
    <rect x="37" y="14" width="7" height="9" rx="1" />
    <text x="8.5" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">A</text>
    <text x="19.5" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">C</text>
    <text x="30.5" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">I</text>
    <text x="40.5" y="22" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">D</text>
    <line x1="6" y1="32" x2="42" y2="32" />
    <path d="M42 32l-3-2M42 32l-3 2" />
  </S>
);

// ------------------------------------------------------------------
// Brukere / login / passord
// ------------------------------------------------------------------

export const UserIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="16" r="6" />
    <path d="M10 40c2-8 8-12 14-12s12 4 14 12" />
  </S>
);

export const LoginIcon = (p: IconProps) => (
  <S {...p}>
    {/* bruker + passord-felt */}
    <circle cx="14" cy="14" r="5" />
    <path d="M6 28c2-6 6-9 8-9s6 3 8 9" />
    <rect x="4" y="32" width="40" height="10" rx="1.5" />
    <circle cx="11" cy="37" r="1.6" />
    <circle cx="17" cy="37" r="1.6" />
    <circle cx="23" cy="37" r="1.6" />
    <circle cx="29" cy="37" r="1.6" />
    <circle cx="35" cy="37" r="1.6" />
  </S>
);

export const HashSaltIcon = (p: IconProps) => (
  <S {...p}>
    {/* # + saltbøsse */}
    <line x1="6" y1="14" x2="22" y2="14" />
    <line x1="6" y1="22" x2="22" y2="22" />
    <line x1="11" y1="8" x2="9" y2="28" />
    <line x1="19" y1="8" x2="17" y2="28" />
    <rect x="28" y="22" width="14" height="16" rx="1.5" />
    <line x1="28" y1="28" x2="42" y2="28" />
    <circle cx="32" cy="18" r="0.8" fill="currentColor" />
    <circle cx="36" cy="16" r="0.8" fill="currentColor" />
    <circle cx="38" cy="20" r="0.8" fill="currentColor" />
  </S>
);

export const SessionCookieIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="26" r="14" />
    <circle cx="18" cy="22" r="1.5" fill="currentColor" />
    <circle cx="28" cy="20" r="1.5" fill="currentColor" />
    <circle cx="30" cy="30" r="1.5" fill="currentColor" />
    <circle cx="20" cy="32" r="1.5" fill="currentColor" />
    <path d="M10 16c2-4 6-7 12-8" />
  </S>
);

export const JwtIcon = (p: IconProps) => (
  <S {...p}>
    {/* tre segmenter */}
    <rect x="3" y="18" width="13" height="12" rx="1.5" />
    <rect x="17.5" y="18" width="13" height="12" rx="1.5" />
    <rect x="32" y="18" width="13" height="12" rx="1.5" />
    <line x1="6" y1="24" x2="13" y2="24" />
    <line x1="20.5" y1="24" x2="27.5" y2="24" />
    <line x1="35" y1="24" x2="42" y2="24" />
  </S>
);

// ------------------------------------------------------------------
// REST / API / HTTPS / CORS
// ------------------------------------------------------------------

export const RestIcon = (p: IconProps) => (
  <S {...p}>
    {/* ressurs + HTTP-verb rundt */}
    <circle cx="24" cy="24" r="6" />
    <text x="6" y="14" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">GET</text>
    <text x="36" y="14" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">PUT</text>
    <text x="2" y="40" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">POST</text>
    <text x="32" y="40" fontSize="6" fontWeight="700" fill="currentColor" stroke="none">DEL</text>
    <line x1="14" y1="16" x2="20" y2="20" />
    <line x1="34" y1="16" x2="28" y2="20" />
    <line x1="14" y1="34" x2="20" y2="28" />
    <line x1="34" y1="34" x2="28" y2="28" />
  </S>
);

export const ApiEndpointIcon = (p: IconProps) => (
  <S {...p}>
    {/* «socket» — stikkontakt-look */}
    <circle cx="24" cy="24" r="14" />
    <circle cx="20" cy="22" r="1.5" fill="currentColor" />
    <circle cx="28" cy="22" r="1.5" fill="currentColor" />
    <path d="M18 30h12" />
  </S>
);

export const SqlInjectionIcon = (p: IconProps) => (
  <S {...p}>
    {/* tabell med revne kanter */}
    <path d="M6 12h12l3-3 3 3h18v8H6z" />
    <path d="M6 20v18l3-3 4 3 4-3 4 3 4-3 4 3 3-3 4 3 4-3 4 3V20" />
  </S>
);

export const XssIcon = (p: IconProps) => (
  <S {...p}>
    {/* <script> */}
    <path d="M6 14l-4 10 4 10" />
    <path d="M42 14l4 10-4 10" />
    <text
      x="24"
      y="29"
      textAnchor="middle"
      fontSize="8"
      fontFamily="ui-monospace, monospace"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      script
    </text>
  </S>
);

export const CsrfIcon = (p: IconProps) => (
  <S {...p}>
    {/* to nettsteder med pil mellom */}
    <rect x="4" y="14" width="14" height="20" rx="1.5" />
    <rect x="30" y="14" width="14" height="20" rx="1.5" />
    <line x1="6" y1="20" x2="16" y2="20" />
    <line x1="6" y1="24" x2="14" y2="24" />
    <line x1="32" y1="20" x2="42" y2="20" />
    <line x1="32" y1="24" x2="40" y2="24" />
    <path d="M18 28c4 6 8 6 12 0" />
    <path d="M30 28l-3-1M30 28l-1-3" />
  </S>
);

export const HttpsIcon = (p: IconProps) => (
  <S {...p}>
    <circle cx="24" cy="26" r="14" />
    <path d="M12 22a12 12 0 0 1 24 0" />
    <path d="M14 30h20" />
    <rect x="20" y="14" width="8" height="8" rx="1" />
    <path d="M22 14v-2a2 2 0 0 1 4 0v2" />
  </S>
);

export const CorsIcon = (p: IconProps) => (
  <S {...p}>
    {/* origin tillat: globus + check */}
    <circle cx="20" cy="24" r="12" />
    <path d="M8 24h24" />
    <path d="M20 12c4 6 4 18 0 24" />
    <path d="M20 12c-4 6-4 18 0 24" />
    <path d="M34 28l4 4 6-8" />
  </S>
);
