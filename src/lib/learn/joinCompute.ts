import type { Cell, JoinType, VisualTable } from "./types";

export interface JoinResultRow {
  /** Combined cells in column order [...left.columns, ...right.columns] */
  cells: Cell[];
  /** Index of the left source row, or null if none (RIGHT/FULL outer). */
  leftIdx: number | null;
  /** Index of the right source row, or null if none (LEFT/FULL outer). */
  rightIdx: number | null;
}

export interface JoinResult {
  columns: { name: string; from: "left" | "right" }[];
  rows: JoinResultRow[];
  /** Indices of left rows that participated in at least one match. */
  matchedLeft: Set<number>;
  /** Indices of right rows that participated in at least one match. */
  matchedRight: Set<number>;
}

export interface JoinOptions {
  leftAlias?: string;
  rightAlias?: string;
}

function asArray(k: string | string[]): string[] {
  return Array.isArray(k) ? k : [k];
}

function colIdxs(table: VisualTable, keys: string[], side: "Left" | "Right") {
  return keys.map((k) => {
    const idx = table.columns.indexOf(k);
    if (idx < 0) throw new Error(`${side} key "${k}" not in ${table.name}`);
    return idx;
  });
}

const NULL_CELLS = (n: number): Cell[] => Array.from({ length: n }, () => null);

function rowsKeyEqual(left: Cell[], right: Cell[], lis: number[], ris: number[]): boolean {
  for (let i = 0; i < lis.length; i++) {
    const lv = left[lis[i]];
    const rv = right[ris[i]];
    if (lv === null || rv === null) return false;
    if (lv !== rv) return false;
  }
  return true;
}

function prefixedColumns(
  table: VisualTable,
  alias: string | undefined,
  from: "left" | "right",
) {
  const prefix = alias ? `${alias}.` : "";
  return table.columns.map((c) => ({ name: prefix + c, from }));
}

export function computeJoin(
  left: VisualTable,
  right: VisualTable,
  leftKey: string | string[],
  rightKey: string | string[],
  type: JoinType,
  options: JoinOptions = {},
): JoinResult {
  const leftKeys = asArray(leftKey);
  const rightKeys = asArray(rightKey);
  if (leftKeys.length !== rightKeys.length) {
    throw new Error("leftKey and rightKey must have the same number of columns");
  }
  const lis = colIdxs(left, leftKeys, "Left");
  const ris = colIdxs(right, rightKeys, "Right");

  const columns = [
    ...prefixedColumns(left, options.leftAlias, "left"),
    ...prefixedColumns(right, options.rightAlias, "right"),
  ];

  const rows: JoinResultRow[] = [];
  const matchedLeft = new Set<number>();
  const matchedRight = new Set<number>();

  if (type === "CROSS") {
    for (let i = 0; i < left.rows.length; i++) {
      for (let j = 0; j < right.rows.length; j++) {
        rows.push({
          cells: [...left.rows[i], ...right.rows[j]],
          leftIdx: i,
          rightIdx: j,
        });
        matchedLeft.add(i);
        matchedRight.add(j);
      }
    }
    return { columns, rows, matchedLeft, matchedRight };
  }

  // INNER + LEFT + RIGHT + FULL share the matching pass
  for (let i = 0; i < left.rows.length; i++) {
    let foundMatch = false;
    for (let j = 0; j < right.rows.length; j++) {
      if (rowsKeyEqual(left.rows[i], right.rows[j], lis, ris)) {
        rows.push({
          cells: [...left.rows[i], ...right.rows[j]],
          leftIdx: i,
          rightIdx: j,
        });
        matchedLeft.add(i);
        matchedRight.add(j);
        foundMatch = true;
      }
    }
    if (!foundMatch && (type === "LEFT" || type === "FULL")) {
      rows.push({
        cells: [...left.rows[i], ...NULL_CELLS(right.columns.length)],
        leftIdx: i,
        rightIdx: null,
      });
    }
  }

  if (type === "RIGHT" || type === "FULL") {
    for (let j = 0; j < right.rows.length; j++) {
      if (!matchedRight.has(j)) {
        rows.push({
          cells: [...NULL_CELLS(left.columns.length), ...right.rows[j]],
          leftIdx: null,
          rightIdx: j,
        });
      }
    }
  }

  return { columns, rows, matchedLeft, matchedRight };
}

export const ALL_JOIN_TYPES: JoinType[] = ["INNER", "LEFT", "RIGHT", "FULL"];

export function joinSql(
  left: VisualTable,
  right: VisualTable,
  leftKey: string | string[],
  rightKey: string | string[],
  type: JoinType,
  options: JoinOptions = {},
): string {
  const leftKeys = asArray(leftKey);
  const rightKeys = asArray(rightKey);
  const lAlias = options.leftAlias;
  const rAlias = options.rightAlias;
  const lRef = lAlias ?? left.name;
  const rRef = rAlias ?? right.name;
  const fromClause = lAlias ? `FROM ${left.name} ${lAlias}` : `FROM ${left.name}`;
  const joinClause = (kind: string) =>
    rAlias ? `${kind} ${right.name} ${rAlias}` : `${kind} ${right.name}`;

  if (type === "CROSS") {
    return `SELECT *\n${fromClause}\n${joinClause("CROSS JOIN")};`;
  }
  const kind =
    type === "INNER"
      ? "INNER JOIN"
      : type === "LEFT"
        ? "LEFT JOIN"
        : type === "RIGHT"
          ? "RIGHT JOIN"
          : "FULL OUTER JOIN";
  const onClause = leftKeys
    .map((k, i) => `${lRef}.${k} = ${rRef}.${rightKeys[i]}`)
    .join("\n     AND ");
  return `SELECT *\n${fromClause}\n${joinClause(kind)}\n  ON ${onClause};`;
}
