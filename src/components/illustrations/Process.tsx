import { a11yProps, type IllustrationProps } from "./types";

// Cog/gear representing a running OS process.
export function Process({ size = 64, className, title }: IllustrationProps) {
  // 8 teeth arranged at 45° intervals
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
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
      <g transform="translate(32 32)">
        {teeth.map((deg) => (
          <rect
            key={deg}
            x="-4"
            y="-28"
            width="8"
            height="8"
            rx="1"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="16" />
      <circle cx="32" cy="32" r="6" />
    </svg>
  );
}
