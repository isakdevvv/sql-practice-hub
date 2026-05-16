import { a11yProps, type IllustrationProps } from "./types";

// Generic binary-tree node: root with two children.
export function TreeNode({ size = 64, className, title }: IllustrationProps) {
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
      <line x1="32" y1="18" x2="16" y2="42" />
      <line x1="32" y1="18" x2="48" y2="42" />
      <circle cx="32" cy="14" r="7" />
      <circle cx="16" cy="46" r="7" />
      <circle cx="48" cy="46" r="7" />
    </svg>
  );
}
