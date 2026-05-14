import { type FC } from "react";
import type { Actor, Step } from "./steps";

interface Node {
  id: Actor;
  label: string;
  sublabel?: string;
  /** Senter-koordinat i SVG-viewbox (0-800 × 0-360). */
  x: number;
  y: number;
}

const NODES: Node[] = [
  { id: "laptop", label: "Bobs laptop", sublabel: "68.85.2.101", x: 60, y: 100 },
  { id: "switch", label: "Switch", sublabel: "skole-LAN", x: 175, y: 100 },
  { id: "gateway", label: "Gateway", sublabel: "68.85.2.1", x: 290, y: 100 },
  { id: "comcast", label: "Comcast", sublabel: "AS-routere", x: 430, y: 100 },
  { id: "dns", label: "DNS", sublabel: "68.87.71.226", x: 430, y: 30 },
  { id: "google-net", label: "Google AS", sublabel: "BGP", x: 580, y: 100 },
  { id: "google", label: "google.com", sublabel: "64.233.169.105", x: 720, y: 100 },
];

const LINKS: { from: Actor; to: Actor }[] = [
  { from: "laptop", to: "switch" },
  { from: "switch", to: "gateway" },
  { from: "gateway", to: "comcast" },
  { from: "comcast", to: "dns" },
  { from: "comcast", to: "google-net" },
  { from: "google-net", to: "google" },
];

interface Props {
  step: Step;
}

export const NetworkScene: FC<Props> = ({ step }) => {
  const activeSet = new Set(step.active);
  const arrowFrom = step.arrow ? NODES.find((n) => n.id === step.arrow!.from) : null;
  const arrowTo = step.arrow ? NODES.find((n) => n.id === step.arrow!.to) : null;

  return (
    <svg
      viewBox="0 0 800 200"
      className="w-full h-auto bg-muted/20 rounded-lg border border-border"
      role="img"
      aria-label={`Nettverksdiagram for steg ${step.n}`}
    >
      {/* Definitions */}
      <defs>
        <marker
          id="day-arrow"
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

      {/* Static links (grey) */}
      {LINKS.map((l) => {
        const a = NODES.find((n) => n.id === l.from)!;
        const b = NODES.find((n) => n.id === l.to)!;
        return (
          <line
            key={`${l.from}-${l.to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Animated arrow for current step */}
      {arrowFrom && arrowTo && (
        <g className="text-brand">
          <line
            x1={arrowFrom.x}
            y1={arrowFrom.y}
            x2={arrowTo.x}
            y2={arrowTo.y}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            markerEnd="url(#day-arrow)"
          >
            <animate
              attributeName="stroke-dasharray"
              from="0 1000"
              to="1000 0"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </line>
          <text
            x={(arrowFrom.x + arrowTo.x) / 2}
            y={(arrowFrom.y + arrowTo.y) / 2 - 8}
            textAnchor="middle"
            className="text-[10px] fill-current font-mono font-semibold"
          >
            {step.arrow!.label}
          </text>
        </g>
      )}

      {/* Nodes */}
      {NODES.map((n) => {
        const active = activeSet.has(n.id);
        return (
          <g key={n.id} className={active ? "text-brand" : "text-muted-foreground"}>
            <rect
              x={n.x - 42}
              y={n.y - 18}
              width="84"
              height="36"
              rx="8"
              fill={active ? "color-mix(in oklch, var(--brand) 18%, transparent)" : "var(--card)"}
              stroke="currentColor"
              strokeWidth={active ? "2" : "1.2"}
            />
            <text
              x={n.x}
              y={n.y - 2}
              textAnchor="middle"
              className="text-[11px] fill-current font-semibold"
            >
              {n.label}
            </text>
            {n.sublabel && (
              <text
                x={n.x}
                y={n.y + 11}
                textAnchor="middle"
                className="text-[9px] fill-current font-mono opacity-70"
              >
                {n.sublabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
