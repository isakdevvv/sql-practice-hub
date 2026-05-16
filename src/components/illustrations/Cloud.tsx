import { a11yProps, type IllustrationProps } from "./types";

// Internet cloud — single rounded path.
export function Cloud({ size = 64, className, title }: IllustrationProps) {
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
      <path
        d="M18 46
           a10 10 0 0 1 -2 -19.7
           a12 12 0 0 1 23 -3
           a9 9 0 0 1 11 12.7
           a7 7 0 0 1 -7 10
           H18Z"
      />
    </svg>
  );
}
