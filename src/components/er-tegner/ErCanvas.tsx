// SVG renderer for the ER model. Reads layout from svgLayout.ts and draws:
//   - one rectangle per entity, name in header, attributes listed below
//     (PK gets an amber underline so it pops without hijacking the title)
//   - one line per relationship with crow's-foot symbols at each end,
//     drawn as small SVG paths so they rotate with the line angle
//   - optional relationship label centered along the line

import type { ErModel } from "@/lib/er-tegner/types";
import { layout } from "@/lib/er-tegner/svgLayout";

const HEADER_HEIGHT = 32;
const ATTR_HEIGHT = 22;
const PADDING_Y = 8;

export function ErCanvas({ model }: { model: ErModel }) {
  const lay = layout(model);

  return (
    <div className="rounded-lg border border-border bg-card overflow-auto">
      <svg
        viewBox={`0 0 ${lay.width} ${lay.height}`}
        width="100%"
        style={{ minHeight: 200, maxHeight: 600 }}
        className="block"
      >
        {/* Lines first — boxes paint over them so the line tucks under the
            edge nicely. */}
        {lay.lines.map((l) => (
          <g key={l.relId}>
            <line
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className="stroke-foreground/60"
              strokeWidth={1.5}
            />
            <CrowsFootMarker x={l.fromMarker.x} y={l.fromMarker.y} end={l.fromMarker.end} angle={l.fromMarker.angle} />
            <CrowsFootMarker x={l.toMarker.x} y={l.toMarker.y} end={l.toMarker.end} angle={l.toMarker.angle} />
            {l.label && l.labelPos && (
              <text
                x={l.labelPos.x}
                y={l.labelPos.y}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 11, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
              >
                {l.label}
              </text>
            )}
          </g>
        ))}

        {/* Entity boxes */}
        {lay.entities.map((b) => {
          const e = model.entities.find((x) => x.id === b.entityId);
          if (!e) return null;
          return (
            <g key={b.entityId}>
              {/* outer box */}
              <rect
                x={b.x}
                y={b.y}
                width={b.width}
                height={b.height}
                rx={6}
                className="fill-background stroke-foreground/70"
                strokeWidth={2}
              />
              {/* header bar */}
              <rect
                x={b.x}
                y={b.y}
                width={b.width}
                height={HEADER_HEIGHT}
                rx={6}
                className="fill-muted/60"
              />
              <line
                x1={b.x}
                x2={b.x + b.width}
                y1={b.y + HEADER_HEIGHT}
                y2={b.y + HEADER_HEIGHT}
                className="stroke-border"
                strokeWidth={1}
              />
              <text
                x={b.x + b.width / 2}
                y={b.y + HEADER_HEIGHT / 2 + 5}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.3 }}
              >
                {e.name || "(uten navn)"}
              </text>

              {/* attributes */}
              {e.attributes.map((a, i) => {
                const ay = b.y + HEADER_HEIGHT + PADDING_Y + i * ATTR_HEIGHT + 14;
                const isPk = a.id === e.pkAttributeId;
                return (
                  <g key={a.id}>
                    <text
                      x={b.x + 12}
                      y={ay}
                      className={isPk ? "fill-amber-500" : "fill-foreground/85"}
                      style={{
                        fontSize: 12,
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        textDecoration: isPk ? "underline" : "none",
                      }}
                    >
                      {a.name}
                    </text>
                    <text
                      x={b.x + b.width - 12}
                      y={ay}
                      textAnchor="end"
                      className="fill-muted-foreground"
                      style={{
                        fontSize: 11,
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      }}
                    >
                      {a.type}
                      {!isPk && a.notNull ? " NN" : ""}
                    </text>
                  </g>
                );
              })}
              {e.attributes.length === 0 && (
                <text
                  x={b.x + b.width / 2}
                  y={b.y + HEADER_HEIGHT + PADDING_Y + 14}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 11, fontStyle: "italic" }}
                >
                  ingen attributter
                </text>
              )}
            </g>
          );
        })}

        {lay.entities.length === 0 && (
          <text
            x={lay.width / 2}
            y={60}
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 13 }}
          >
            Legg til en entitet for å starte.
          </text>
        )}
      </svg>
    </div>
  );
}

/**
 * A crow's-foot end-marker rendered as small SVG paths. The marker is drawn
 * in a local coordinate frame where +x points "into the line" (toward the
 * other end). We then translate+rotate it into place via a <g transform>.
 *
 * Symbol vocabulary (matches CrowsFoot.tsx):
 *   - min "|"  → tick perpendicular to line (mandatory)
 *   - min "O"  → small circle (optional)
 *   - max "|"  → tick perpendicular to line (one)
 *   - max "<"  → three-pronged crow's-foot (many)
 *
 * The min symbol is drawn closer to the box (further inboard), the max
 * symbol is drawn further out (toward the line center). This matches the
 * "innerst min, ytterst max" rule from the kråkefot-øvelser.
 */
function CrowsFootMarker({
  x,
  y,
  end,
  angle,
}: {
  x: number;
  y: number;
  end: string;
  angle: number;
}) {
  const min = end[0];
  const max = end[1];
  // In local frame: 0 = where the marker is anchored. Min sits at +6 (closer
  // to the box, since +x is away from line center, away from box). Wait —
  // angle is line-direction (from→to), so +x in local frame points along
  // the line, AWAY from this endpoint, toward the OTHER endpoint. We want
  // max ("ytterst") closer to the box and min ("innerst") closer to the line
  // center. The marker anchor is already inset 14px from the box edge, so
  // we draw max at -8 (toward box) and min at +4 (toward line center).
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} className="stroke-foreground/80 fill-none">
      {max === "|" ? (
        <line x1={-8} y1={-8} x2={-8} y2={8} strokeWidth={1.6} />
      ) : (
        // crow's foot — three lines fanning toward the box (negative x)
        <g strokeWidth={1.6}>
          <line x1={4} y1={0} x2={-10} y2={-7} />
          <line x1={4} y1={0} x2={-10} y2={0} />
          <line x1={4} y1={0} x2={-10} y2={7} />
        </g>
      )}
      {min === "|" ? (
        <line x1={4} y1={-6} x2={4} y2={6} strokeWidth={1.6} />
      ) : (
        <circle cx={4} cy={0} r={3.5} className="fill-background" strokeWidth={1.4} />
      )}
    </g>
  );
}
