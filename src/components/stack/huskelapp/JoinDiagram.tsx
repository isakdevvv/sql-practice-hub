/**
 * Small Venn-style SVG illustration for JOIN types.
 * variant: which area to fill.
 */
export type JoinVariant =
  | "inner"
  | "left"
  | "right"
  | "full"
  | "leftOnly"
  | "rightOnly"
  | "fullOnly"
  | "cross";

export function JoinDiagram({
  variant,
  size = 64,
}: {
  variant: JoinVariant;
  size?: number;
}) {
  const w = size * 1.6;
  const h = size;
  const r = size * 0.42;
  const cxL = size * 0.55;
  const cxR = w - size * 0.55;
  const cy = h / 2;
  const fill = "currentColor";

  // Use clipPaths to draw highlighted regions.
  const id = `jd-${variant}-${size}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`JOIN-diagram (${variant})`}
      className="text-brand"
    >
      <defs>
        <clipPath id={`${id}-l`}>
          <circle cx={cxL} cy={cy} r={r} />
        </clipPath>
        <clipPath id={`${id}-r`}>
          <circle cx={cxR} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Highlighted regions (drawn first, then outlined on top) */}
      {variant === "inner" && (
        <g clipPath={`url(#${id}-l)`} opacity="0.55">
          <circle cx={cxR} cy={cy} r={r} fill={fill} />
        </g>
      )}
      {variant === "left" && (
        <>
          <circle cx={cxL} cy={cy} r={r} fill={fill} opacity="0.55" />
        </>
      )}
      {variant === "right" && (
        <circle cx={cxR} cy={cy} r={r} fill={fill} opacity="0.55" />
      )}
      {variant === "full" && (
        <>
          <circle cx={cxL} cy={cy} r={r} fill={fill} opacity="0.55" />
          <circle cx={cxR} cy={cy} r={r} fill={fill} opacity="0.55" />
        </>
      )}
      {variant === "leftOnly" && (
        <g>
          <circle cx={cxL} cy={cy} r={r} fill={fill} opacity="0.55" />
          <g clipPath={`url(#${id}-l)`}>
            <circle cx={cxR} cy={cy} r={r} fill="var(--background, #fff)" opacity="1" />
          </g>
        </g>
      )}
      {variant === "rightOnly" && (
        <g>
          <circle cx={cxR} cy={cy} r={r} fill={fill} opacity="0.55" />
          <g clipPath={`url(#${id}-r)`}>
            <circle cx={cxL} cy={cy} r={r} fill="var(--background, #fff)" opacity="1" />
          </g>
        </g>
      )}
      {variant === "fullOnly" && (
        <g>
          <circle cx={cxL} cy={cy} r={r} fill={fill} opacity="0.55" />
          <circle cx={cxR} cy={cy} r={r} fill={fill} opacity="0.55" />
          <g clipPath={`url(#${id}-l)`}>
            <circle cx={cxR} cy={cy} r={r} fill="var(--background, #fff)" />
          </g>
        </g>
      )}
      {variant === "cross" && (
        <g>
          <circle cx={cxL} cy={cy} r={r} fill={fill} opacity="0.55" />
          <circle cx={cxR} cy={cy} r={r} fill={fill} opacity="0.55" />
          <text
            x={w / 2}
            y={cy + 4}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={size * 0.32}
            fontWeight="700"
          >
            ×
          </text>
        </g>
      )}

      {/* Outlines */}
      <circle cx={cxL} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx={cxR} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        x={cxL - r * 0.5}
        y={h - 4}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={size * 0.18}
      >
        A
      </text>
      <text
        x={cxR + r * 0.5}
        y={h - 4}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={size * 0.18}
      >
        B
      </text>
    </svg>
  );
}
