import { a11yProps, type IllustrationProps } from "./types";

// 4 nodes with non-tree edges (one cycle) — a simple graph.
export function GraphNode({ size = 64, className, title }: IllustrationProps) {
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
      {/* edges first */}
      <line x1="14" y1="14" x2="48" y2="18" />
      <line x1="14" y1="14" x2="20" y2="48" />
      <line x1="48" y1="18" x2="50" y2="50" />
      <line x1="20" y1="48" x2="50" y2="50" />
      <line x1="14" y1="14" x2="50" y2="50" opacity={0.5} />
      {/* nodes */}
      <circle cx="14" cy="14" r="6" fill="currentColor" stroke="none" opacity={0.15} />
      <circle cx="14" cy="14" r="6" />
      <circle cx="48" cy="18" r="6" fill="currentColor" stroke="none" opacity={0.15} />
      <circle cx="48" cy="18" r="6" />
      <circle cx="20" cy="48" r="6" fill="currentColor" stroke="none" opacity={0.15} />
      <circle cx="20" cy="48" r="6" />
      <circle cx="50" cy="50" r="6" fill="currentColor" stroke="none" opacity={0.15} />
      <circle cx="50" cy="50" r="6" />
    </svg>
  );
}
