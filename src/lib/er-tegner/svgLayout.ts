// Layout for the ER-tegner SVG.
//
// We don't do free-form drag-positioning — the brief says "simple grid
// auto-layout (e.g. 3 columns)". Each entity becomes a box of fixed width
// and height-grows-with-attribute-count. Boxes flow left-to-right, top-to-
// bottom on a 3-col grid with fixed gutters.
//
// Lines are routed via the "edge-of-box closest to the other box's center"
// — not pretty for crossing relationships, but enough for the few-entity
// diagrams this tool targets. Crow's-foot symbols are positioned a few px
// inboard of each line endpoint so they sit *next to* the box, not on top.

import type { Entity, ErModel, ErRelationship, CfEnd } from "./types";

export interface BoxLayout {
  entityId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineLayout {
  relId: string;
  /** Box center → box center is what the line *connects*; the rendered line
   *  uses x1/y1/x2/y2 which are clipped to the box edges. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Position for the cardinality marker on the from-side. */
  fromMarker: { x: number; y: number; end: CfEnd; angle: number };
  toMarker: { x: number; y: number; end: CfEnd; angle: number };
  label?: string;
  labelPos?: { x: number; y: number };
}

export interface DiagramLayout {
  entities: BoxLayout[];
  lines: LineLayout[];
  width: number;
  height: number;
}

const COLS = 3;
const BOX_WIDTH = 220;
const ROW_HEADER_HEIGHT = 32;
const ATTR_LINE_HEIGHT = 22;
const BOX_PADDING_Y = 8;
const COL_GAP = 80;
const ROW_GAP = 60;
const CANVAS_PADDING = 24;
const MARKER_INSET = 14;

function boxHeight(e: Entity): number {
  const attrCount = Math.max(1, e.attributes.length);
  return ROW_HEADER_HEIGHT + BOX_PADDING_Y * 2 + attrCount * ATTR_LINE_HEIGHT;
}

/**
 * Clip a line from box-center A to box-center B at the boundary of A's
 * rectangle. Used for both endpoints: passing (centerB, centerA, boxA)
 * gives the point on A nearest to B.
 */
function clipToBox(
  fromCenter: { x: number; y: number },
  toCenter: { x: number; y: number },
  box: BoxLayout,
): { x: number; y: number } {
  const dx = fromCenter.x - toCenter.x;
  const dy = fromCenter.y - toCenter.y;
  if (dx === 0 && dy === 0) return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const cx = toCenter.x;
  const cy = toCenter.y;
  // Compute t along the line from (cx,cy) toward (fromCenter) where it exits box.
  const halfW = box.width / 2;
  const halfH = box.height / 2;
  const boxCx = box.x + halfW;
  const boxCy = box.y + halfH;
  // We actually want the point on `box` closest to `fromCenter`, which is
  // where the line from boxCenter to fromCenter exits the rectangle.
  const ddx = fromCenter.x - boxCx;
  const ddy = fromCenter.y - boxCy;
  if (ddx === 0 && ddy === 0) return { x: boxCx, y: boxCy };
  const tx = ddx === 0 ? Infinity : halfW / Math.abs(ddx);
  const ty = ddy === 0 ? Infinity : halfH / Math.abs(ddy);
  const t = Math.min(tx, ty);
  return { x: boxCx + ddx * t, y: boxCy + ddy * t };
}

export function layout(model: ErModel): DiagramLayout {
  const boxes: BoxLayout[] = [];
  const heightsPerRow: number[] = [];

  // Compute box positions on a 3-col grid; row height = max box height in row.
  model.entities.forEach((e, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const h = boxHeight(e);
    heightsPerRow[row] = Math.max(heightsPerRow[row] ?? 0, h);
    boxes.push({
      entityId: e.id,
      x: CANVAS_PADDING + col * (BOX_WIDTH + COL_GAP),
      y: 0, // assigned in second pass once row heights are known
      width: BOX_WIDTH,
      height: h,
    });
  });
  const rowYs: number[] = [];
  let runningY = CANVAS_PADDING;
  for (let r = 0; r < heightsPerRow.length; r++) {
    rowYs[r] = runningY;
    runningY += heightsPerRow[r] + ROW_GAP;
  }
  boxes.forEach((b, i) => {
    const row = Math.floor(i / COLS);
    b.y = rowYs[row];
  });

  const boxById = new Map(boxes.map((b) => [b.entityId, b] as const));
  const totalCols = Math.min(COLS, model.entities.length || 1);
  const width = CANVAS_PADDING * 2 + totalCols * BOX_WIDTH + (totalCols - 1) * COL_GAP;
  const height = runningY - ROW_GAP + CANVAS_PADDING;

  const lines: LineLayout[] = model.relationships
    .map((r): LineLayout | null => mkLine(r, boxById))
    .filter((l): l is LineLayout => l !== null);

  return {
    entities: boxes,
    lines,
    width,
    height: Math.max(height, CANVAS_PADDING * 2 + ROW_HEADER_HEIGHT),
  };
}

function mkLine(
  r: ErRelationship,
  boxById: Map<string, BoxLayout>,
): LineLayout | null {
  const a = boxById.get(r.fromEntityId);
  const b = boxById.get(r.toEntityId);
  if (!a || !b) return null;
  const aCenter = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  const bCenter = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  const aEdge = clipToBox(bCenter, aCenter, a);
  const bEdge = clipToBox(aCenter, bCenter, b);
  // Move marker a few px back along the line so symbol sits inboard of edge.
  const aMarker = inset(aEdge, bEdge, MARKER_INSET);
  const bMarker = inset(bEdge, aEdge, MARKER_INSET);
  const angle = Math.atan2(bEdge.y - aEdge.y, bEdge.x - aEdge.x) * (180 / Math.PI);
  const label = r.label?.trim();
  const labelPos = label
    ? { x: (aEdge.x + bEdge.x) / 2, y: (aEdge.y + bEdge.y) / 2 - 6 }
    : undefined;
  return {
    relId: r.id,
    x1: aEdge.x,
    y1: aEdge.y,
    x2: bEdge.x,
    y2: bEdge.y,
    fromMarker: { x: aMarker.x, y: aMarker.y, end: r.fromEnd, angle },
    toMarker: { x: bMarker.x, y: bMarker.y, end: r.toEnd, angle: angle + 180 },
    label,
    labelPos,
  };
}

function inset(
  from: { x: number; y: number },
  toward: { x: number; y: number },
  px: number,
): { x: number; y: number } {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return from;
  return { x: from.x + (dx / len) * px, y: from.y + (dy / len) * px };
}
