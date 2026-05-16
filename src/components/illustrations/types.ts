// Shared props for inline SVG illustrations.
// All illustrations follow these conventions:
//   - `size` controls both width and height (square viewBox 64x64).
//   - `className` lets callers set a Tailwind text color so currentColor cascades.
//   - `title` becomes <title> for screen readers; if omitted, illustration is
//     marked aria-hidden (purely decorative).
export type IllustrationProps = {
  size?: number;
  className?: string;
  title?: string;
};

// Helper for the aria/title wiring so each component stays short.
export function a11yProps(title?: string) {
  if (title) {
    return {
      role: "img" as const,
      "aria-label": title,
    };
  }
  return { "aria-hidden": true as const, focusable: false as const };
}
