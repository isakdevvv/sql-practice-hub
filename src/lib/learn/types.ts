// Types for the learn module: flashcards, drag exercises, JOIN visualizer.
// These are intentionally separate from the SQL `Problem` type — they don't
// run SQL, they're answered in-page.

// ---------- FLASHCARDS ----------

export type CardCategory =
  | "begrep"
  | "sql"
  | "design"
  | "flask"
  | "http"
  | "sikkerhet"
  | "praktisk"
  | "statistikk";

export interface FlashCard {
  id: string;
  category: CardCategory;
  topic: string;
  question: string;
  answer: string; // plain text or simple inline-code via `backticks`
  /** Optional code block shown below the answer. */
  code?: string;
  /** Optional visual diagram, key into the VISUALS registry
   *  (see src/components/learn/visuals/Visuals.tsx). Shown above the
   *  answer text — used for the iconic diagrams data engineers expect
   *  (CSS box model, JOIN Venn, B-tree, memory hierarchy, etc.). */
  visual?: string;
}

// ---------- DRAG EXERCISES ----------

export type DragExercise =
  | MatchExercise
  | OrderExercise
  | FillExercise
  | CrowsFootExercise
  | QuizExercise;

export interface MatchExercise {
  id: string;
  kind: "match";
  title: string;
  prompt: string;
  topic: string;
  /** Each pair: left stays put, right gets shuffled and dragged onto left. */
  pairs: { left: string; right: string }[];
  /** Optional explanation shown after the user checks the answer. */
  explanation?: string;
}

export interface OrderExercise {
  id: string;
  kind: "order";
  title: string;
  prompt: string;
  topic: string;
  /** Items in the correct order. They will be shuffled in the UI. */
  items: string[];
  /** Short note shown after the user solves it. */
  explanation?: string;
}

export interface FillExercise {
  id: string;
  kind: "fill";
  title: string;
  prompt: string;
  topic: string;
  /** Template with __1__, __2__, ... placeholders. */
  template: string;
  /** Correct value for each placeholder, in order. */
  blanks: string[];
  /** Items the user can drag — should include `blanks` plus distractors. */
  options: string[];
  /** Optional reference snippet shown above the exercise — a complete code
   *  example illustrating the same pattern, so the user has something to
   *  pattern-match against. Best for Flask/Python where structure matters. */
  example?: string;
  /** Optional language hint for the example/template ("python" | "html" | "sql"). */
  language?: "python" | "html" | "sql";
  explanation?: string;
}

// ---------- CROW'S FOOT ----------

/** Min-symbol on a relationship end: "|" = obligatorisk (1), "O" = valgfri (0). */
export type CfMin = "|" | "O";
/** Max-symbol on a relationship end: "|" = én, "<" = mange (krage). */
export type CfMax = "|" | "<";

export interface CrowsFootExercise {
  id: string;
  kind: "crowsfoot";
  title: string;
  prompt: string;
  topic: string;
  /** Scenario text — describes the relationship in plain Norwegian. */
  scenario: string;
  /** Left entity name (e.g. "KUNDE"). */
  entityA: string;
  /** Right entity name (e.g. "BESTILLING"). */
  entityB: string;
  /** Symbols placed at the line ends, read left-to-right.
   *  Convention: symbol near entity X tells "how many X per one of the other".
   *  So `aMin/aMax` (near A) = cardinality of A, read as «for én B, hvor mange A?». */
  answer: {
    aMin: CfMin;
    aMax: CfMax;
    bMin: CfMin;
    bMax: CfMax;
  };
  explanation: string;
}

// ---------- QUIZ (multiple choice) ----------

export interface QuizOption {
  /** Option text — what the user picks. */
  text: string;
  /** True if this option is part of the correct answer. */
  correct: boolean;
  /** Optional one-line rationale shown after the user submits — explains why
   *  this option is right or wrong. Powerful for security/HTTP exercises. */
  rationale?: string;
}

export interface QuizExercise {
  id: string;
  kind: "quiz";
  title: string;
  prompt: string;
  topic: string;
  /** The question itself. May span multiple lines. */
  question: string;
  /** Optional code block shown above the options. */
  code?: string;
  /** Optional language hint for the code block. */
  language?: "python" | "html" | "sql" | "javascript" | "http";
  options: QuizOption[];
  /** Default false: exactly one option is correct. true allows multi-select. */
  multi?: boolean;
  /** Overall explanation shown after submit, regardless of which option was picked. */
  explanation?: string;
}

// ---------- VISUAL JOIN ----------

export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL" | "CROSS";

export type Cell = string | number | null;

export interface VisualTable {
  name: string;
  columns: string[];
  rows: Cell[][];
}

export interface JoinExercise {
  id: string;
  title: string;
  scenario: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  left: VisualTable;
  right: VisualTable;
  /** Column(s) on the left used for the join. Pass an array for composite-key joins. */
  leftKey: string | string[];
  /** Column(s) on the right used for the join. Pass an array for composite-key joins. */
  rightKey: string | string[];
  /** Optional SQL alias for the left side. Required for self-joins (same table on both sides). */
  leftAlias?: string;
  /** Optional SQL alias for the right side. */
  rightAlias?: string;
  /** Optional set of join types this exercise is most instructive for.
   *  Defaults to all four [INNER, LEFT, RIGHT, FULL]. */
  joinTypes?: JoinType[];
  /** Optional: lock the hidden target to a specific JOIN type. When unset, the
   *  target is picked randomly from `joinTypes`. Use this when the scenario
   *  itself implies a specific answer (e.g. "alle kombinasjoner" → CROSS). */
  correctType?: JoinType;
  explanation: string;
}
