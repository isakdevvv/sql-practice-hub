import { a11yProps, type IllustrationProps } from "./types";

// 5-bar vertical chart with x/y axes.
export function BarChart({ size = 64, className, title }: IllustrationProps) {
  const bars = [
    { x: 12, h: 16 },
    { x: 22, h: 28 },
    { x: 32, h: 22 },
    { x: 42, h: 38 },
    { x: 52, h: 12 },
  ];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11yProps(title)}
    >
      {title ? <title>{title}</title> : null}
      {/* axes */}
      <path d="M8 8v44h48" />
      {bars.map((b) => (
        <rect
          key={b.x}
          x={b.x - 4}
          y={52 - b.h}
          width="8"
          height={b.h}
          rx="1"
          fill="currentColor"
          stroke="none"
          opacity={0.7}
        />
      ))}
    </svg>
  );
}
