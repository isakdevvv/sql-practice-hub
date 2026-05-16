import { a11yProps, type IllustrationProps } from "./types";

// 2D scatter with two classes — filled circles vs hollow circles —
// and a faint decision boundary between them.
export function ScatterPlot({ size = 64, className, title }: IllustrationProps) {
  const classA = [
    [16, 18],
    [20, 14],
    [14, 24],
    [22, 22],
    [18, 28],
  ];
  const classB = [
    [44, 40],
    [48, 36],
    [52, 44],
    [40, 46],
    [46, 50],
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
      {/* decision boundary */}
      <line x1="14" y1="52" x2="56" y2="14" opacity={0.4} strokeDasharray="3 3" />
      {/* class A: filled */}
      {classA.map(([cx, cy]) => (
        <circle key={`a${cx}${cy}`} cx={cx} cy={cy} r="2.4" fill="currentColor" stroke="none" />
      ))}
      {/* class B: hollow */}
      {classB.map(([cx, cy]) => (
        <circle key={`b${cx}${cy}`} cx={cx} cy={cy} r="2.4" />
      ))}
    </svg>
  );
}
