import { useMemo } from "react";
import katex from "katex";

type TexProps = {
  children: string;
  className?: string;
};

/**
 * Inline math: renders LaTeX inside a <span>.
 *
 * Usage:
 *   <Tex>{"E = mc^2"}</Tex>
 */
export function Tex({ children, className }: TexProps) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        throwOnError: false,
        displayMode: false,
        output: "html",
        strict: "ignore",
      }),
    [children],
  );

  return (
    <span
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Block math: renders LaTeX inside a centered <div>, in display mode.
 *
 * Usage:
 *   <TexBlock>{"\\sum_{i=1}^n x_i"}</TexBlock>
 */
export function TexBlock({ children, className }: TexProps) {
  const html = useMemo(
    () =>
      katex.renderToString(children, {
        throwOnError: false,
        displayMode: true,
        output: "html",
        strict: "ignore",
      }),
    [children],
  );

  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
