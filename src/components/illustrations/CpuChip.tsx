import { a11yProps, type IllustrationProps } from "./types";

// Square CPU die with pins on all 4 sides and a "CPU" label.
export function CpuChip({ size = 64, className, title }: IllustrationProps) {
  // generate pins at fixed positions
  const sidePins = [16, 24, 32, 40, 48];
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
      {/* pins top + bottom */}
      {sidePins.map((x) => (
        <line key={`t${x}`} x1={x} y1={4} x2={x} y2={12} />
      ))}
      {sidePins.map((x) => (
        <line key={`b${x}`} x1={x} y1={52} x2={x} y2={60} />
      ))}
      {/* pins left + right */}
      {sidePins.map((y) => (
        <line key={`l${y}`} x1={4} y1={y} x2={12} y2={y} />
      ))}
      {sidePins.map((y) => (
        <line key={`r${y}`} x1={52} y1={y} x2={60} y2={y} />
      ))}
      {/* die */}
      <rect x="12" y="12" width="40" height="40" rx="3" />
      {/* inner core square */}
      <rect x="22" y="22" width="20" height="20" rx="1" opacity={0.6} />
      <text
        x="32"
        y="35"
        textAnchor="middle"
        fontSize="8"
        fontFamily="monospace"
        fill="currentColor"
        stroke="none"
      >
        CPU
      </text>
    </svg>
  );
}
