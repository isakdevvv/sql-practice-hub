import { a11yProps, type IllustrationProps } from "./types";

// Heraldic shield with a centered check mark, representing security/defense.
export function Shield({ size = 64, className, title }: IllustrationProps) {
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
      <path d="M32 6l20 6v18c0 14-10 22-20 26-10-4-20-12-20-26V12z" />
      <path d="M22 32l8 8 14-16" />
    </svg>
  );
}
