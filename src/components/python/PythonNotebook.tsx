import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPyodide,
  isPyodideReady,
  onPyodideProgress,
} from "@/lib/python/pyodideLoader";
import { runCell, resetKernel } from "@/lib/python/cellRunner";
import { NotebookCell, type NotebookCellState } from "./NotebookCell";

const INITIAL_CELLS: Array<{ code: string }> = [
  {
    code:
      `# Velkommen til Python-notebook-en! Hver "celle" kjører for seg, men de\n` +
      `# deler variabler — akkurat som i Jupyter. Trykk Play (eller Ctrl/⌘+Enter)\n` +
      `# på cellen under for å starte.\n` +
      `\n` +
      `navn = "verden"\n` +
      `print(f"Hei, {navn}!")\n` +
      `2 + 2`,
  },
  {
    code:
      `# Denne cellen ser variabelen "navn" fra forrige celle.\n` +
      `lengde = len(navn)\n` +
      `f"'{navn}' har {lengde} bokstaver"`,
  },
  {
    code:
      `# Et lite plott — matplotlib lastes første gang du importerer den\n` +
      `# (kan ta noen sekunder). Figuren vises rett under cellen.\n` +
      `import matplotlib.pyplot as plt\n` +
      `\n` +
      `x = list(range(-10, 11))\n` +
      `y = [v * v for v in x]\n` +
      `\n` +
      `plt.figure(figsize=(5, 3))\n` +
      `plt.plot(x, y, marker="o")\n` +
      `plt.title("y = x²")\n` +
      `plt.grid(True)\n` +
      `plt.show()`,
  },
];

let cellIdSeq = 0;
function makeCell(code: string): NotebookCellState {
  cellIdSeq += 1;
  return {
    id: `cell-${cellIdSeq}`,
    code,
    outputs: [],
    running: false,
    execCount: null,
  };
}

export function PythonNotebook() {
  const [cells, setCells] = useState<NotebookCellState[]>(() =>
    INITIAL_CELLS.map((c) => makeCell(c.code)),
  );
  const [pyReady, setPyReady] = useState(isPyodideReady());
  const [loadStage, setLoadStage] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [execSeq, setExecSeq] = useState(0);

  useEffect(() => {
    const off = onPyodideProgress((stage) => {
      setLoadStage(stage);
      if (stage === "Klar.") setPyReady(true);
    });
    // Kick off Pyodide-loading proactively so the first Run isn't a cold start.
    getPyodide()
      .then(() => setPyReady(true))
      .catch((err) => setBootError(err instanceof Error ? err.message : String(err)));
    return off;
  }, []);

  const updateCell = useCallback(
    (id: string, patch: Partial<NotebookCellState>) => {
      setCells((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    [],
  );

  const handleRun = useCallback(
    async (id: string) => {
      const cell = cells.find((c) => c.id === id);
      if (!cell || cell.running) return;
      updateCell(id, { running: true, outputs: [] });
      const result = await runCell(cell.code);
      setExecSeq((n) => n + 1);
      setCells((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                running: false,
                outputs: result.outputs,
                execCount: execSeq + 1,
              }
            : c,
        ),
      );
    },
    [cells, execSeq, updateCell],
  );

  const handleAddCell = useCallback(() => {
    setCells((prev) => [...prev, makeCell("")]);
  }, []);

  const handleDeleteCell = useCallback((id: string) => {
    setCells((prev) => (prev.length <= 1 ? prev : prev.filter((c) => c.id !== id)));
  }, []);

  const handleMove = useCallback((id: string, dir: -1 | 1) => {
    setCells((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const handleResetKernel = useCallback(async () => {
    await resetKernel();
    setExecSeq(0);
    setCells((prev) =>
      prev.map((c) => ({ ...c, outputs: [], execCount: null, running: false })),
    );
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Python-notebook</h1>
        <div className="flex-1" />
        {pyReady ? (
          <Badge variant="secondary" className="gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Kernel klar
          </Badge>
        ) : bootError ? (
          <Badge variant="destructive">Feil: {bootError}</Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {loadStage ?? "Starter Python…"}
          </Badge>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetKernel}
          disabled={!pyReady}
          title="Tøm alle variabler og start kernel-en på nytt"
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Nullstill kernel
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Skriv Python her — kjører i nettleseren via{" "}
        <a
          href="https://pyodide.org"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Pyodide
        </a>{" "}
        (CPython kompilert til WebAssembly). Variabler deles mellom celler.
        Pakker som <code>numpy</code>, <code>pandas</code>, <code>matplotlib</code>{" "}
        lastes automatisk ved første import.
      </p>

      <div className="space-y-3">
        {cells.map((cell, i) => (
          <NotebookCell
            key={cell.id}
            cell={cell}
            kernelReady={pyReady}
            onCodeChange={(code) => updateCell(cell.id, { code })}
            onRun={() => handleRun(cell.id)}
            onDelete={() => handleDeleteCell(cell.id)}
            onMoveUp={() => handleMove(cell.id, -1)}
            onMoveDown={() => handleMove(cell.id, 1)}
            canDelete={cells.length > 1}
            canMoveUp={i > 0}
            canMoveDown={i < cells.length - 1}
          />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={handleAddCell}>
          <Plus className="mr-1.5 h-4 w-4" />
          Ny celle
        </Button>
      </div>
    </div>
  );
}
