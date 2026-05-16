import { a11yProps, type IllustrationProps } from "./types";

// L2 switch: wide chassis with port array along the bottom.
export function SwitchIcon({ size = 64, className, title }: IllustrationProps) {
  const ports = [10, 18, 26, 34, 42, 50];
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
      <rect x="4" y="18" width="56" height="28" rx="3" />
      {/* power LED */}
      <circle cx="52" cy="26" r="2" fill="currentColor" stroke="none" />
      {/* label strip */}
      <line x1="10" y1="26" x2="44" y2="26" opacity={0.4} />
      {/* port array */}
      {ports.map((x) => (
        <rect key={x} x={x} y={34} width="6" height="6" rx="1" />
      ))}
    </svg>
  );
}
