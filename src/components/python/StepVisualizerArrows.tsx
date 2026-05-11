import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ObjId } from "@/lib/python/types";

export interface ArrowSpec {
  /** Key in dotRefs map — the small ● that originates the arrow. */
  sourceKey: string;
  targetId: ObjId;
}

interface Props {
  containerRef: React.RefObject<HTMLElement | null>;
  dotRefs: React.RefObject<Map<string, HTMLElement>>;
  heapRefs: React.RefObject<Map<ObjId, HTMLElement>>;
  arrows: ArrowSpec[];
  /** Bumped by parent when arrows might need re-measuring (e.g. step changed). */
  recomputeKey: number;
}

interface Path {
  d: string;
  selfLoop: boolean;
}

/**
 * SVG overlay that draws reference arrows from variable dots to heap boxes.
 * Positions are measured against `containerRef`'s bounding rect, so the SVG
 * must be position:absolute inset:0 of that same container.
 */
export function StepVisualizerArrows({
  containerRef,
  dotRefs,
  heapRefs,
  arrows,
  recomputeKey,
}: Props) {
  const [paths, setPaths] = useState<Path[]>([]);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);

  const recompute = () => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    setSize({ w: cRect.width, h: cRect.height });
    const out: Path[] = [];
    for (const a of arrows) {
      const src = dotRefs.current?.get(a.sourceKey);
      const tgt = heapRefs.current?.get(a.targetId);
      if (!src || !tgt) continue;
      const sRect = src.getBoundingClientRect();
      const tRect = tgt.getBoundingClientRect();
      // Source = right-middle of the dot
      const sx = sRect.right - cRect.left;
      const sy = sRect.top + sRect.height / 2 - cRect.top;
      // Target = left-middle of the heap box
      const tx = tRect.left - cRect.left;
      const ty = tRect.top + tRect.height / 2 - cRect.top;
      const selfLoop = src.closest("[data-heap-box]") === tgt;
      if (selfLoop) {
        // Loop out and back to the same box.
        const r = Math.max(24, tRect.height / 2 + 8);
        out.push({
          d: `M ${sx} ${sy} C ${sx + r} ${sy - r} ${tx - r} ${ty - r} ${tx} ${ty}`,
          selfLoop: true,
        });
      } else {
        const dx = Math.max(40, Math.abs(tx - sx) * 0.4);
        out.push({
          d: `M ${sx} ${sy} C ${sx + dx} ${sy} ${tx - dx} ${ty} ${tx} ${ty}`,
          selfLoop: false,
        });
      }
    }
    setPaths(out);
  };

  const schedule = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      recompute();
    });
  };

  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recomputeKey, arrows]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    // Also observe each heap box and dot so wrapping changes trigger remeasure.
    dotRefs.current?.forEach((el) => ro.observe(el));
    heapRefs.current?.forEach((el) => ro.observe(el));
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recomputeKey]);

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={size.w}
      height={size.h}
      style={{ overflow: "visible" }}
      role="presentation"
    >
      <defs>
        <marker
          id="viz-arrowhead"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          markerEnd="url(#viz-arrowhead)"
          className="text-brand/70"
        />
      ))}
    </svg>
  );
}
