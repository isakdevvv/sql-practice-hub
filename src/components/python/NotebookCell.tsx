import { Play, Loader2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { PythonEditor } from "@/components/python/PythonEditor";
import { Button } from "@/components/ui/button";
import type { CellOutput } from "@/lib/python/cellRunner";
import { cn } from "@/lib/utils";

export interface NotebookCellState {
  id: string;
  code: string;
  outputs: CellOutput[];
  running: boolean;
  /** Monotonic execution counter shown to the left of the cell (Jupyter "In [n]"). */
  execCount: number | null;
}

interface Props {
  cell: NotebookCellState;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  kernelReady: boolean;
}

export function NotebookCell({
  cell,
  onCodeChange,
  onRun,
  onDelete,
  onMoveUp,
  onMoveDown,
  canDelete,
  canMoveUp,
  canMoveDown,
  kernelReady,
}: Props) {
  const counter = cell.running
    ? "[*]"
    : cell.execCount != null
      ? `[${cell.execCount}]`
      : "[ ]";

  return (
    <div className="group rounded-md border bg-card">
      <div className="flex items-stretch">
        <div className="flex w-16 shrink-0 flex-col items-center gap-1 border-r bg-muted/40 py-2 text-xs font-mono text-muted-foreground">
          <span className="select-none">In&nbsp;{counter}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onRun}
            disabled={cell.running || !kernelReady}
            title={kernelReady ? "Kjør celle (Ctrl/⌘+Enter)" : "Venter på Python-runtime…"}
          >
            {cell.running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="border-b">
            <PythonEditor
              value={cell.code}
              onChange={onCodeChange}
              onRun={onRun}
              height={`${Math.max(80, Math.min(400, (cell.code.split("\n").length + 1) * 20))}px`}
            />
          </div>
          {cell.outputs.length > 0 && (
            <div className="space-y-1 px-3 py-2 font-mono text-xs">
              {cell.outputs.map((out, i) => (
                <CellOutputView key={i} output={out} />
              ))}
            </div>
          )}
        </div>

        <div className="flex w-8 shrink-0 flex-col items-center gap-0.5 border-l bg-muted/40 py-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="Flytt celle opp"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="Flytt celle ned"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            disabled={!canDelete}
            title="Slett celle"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CellOutputView({ output }: { output: CellOutput }) {
  if (output.kind === "image") {
    return (
      <div className="py-1">
        <img
          src={`data:${output.mime};base64,${output.data}`}
          alt="Plot fra cellen"
          className="max-w-full rounded border bg-white"
        />
      </div>
    );
  }
  return (
    <pre
      className={cn(
        "whitespace-pre-wrap break-words",
        output.kind === "stderr" || output.kind === "error"
          ? "text-destructive"
          : output.kind === "result"
            ? "text-foreground"
            : "text-foreground/80",
      )}
    >
      {output.text}
    </pre>
  );
}
