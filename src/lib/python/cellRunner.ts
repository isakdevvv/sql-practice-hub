import { getPyodide } from "./pyodideLoader";

export type CellOutput =
  | { kind: "stdout"; text: string }
  | { kind: "stderr"; text: string }
  | { kind: "result"; text: string }
  | { kind: "image"; mime: "image/png"; data: string }
  | { kind: "error"; text: string };

export interface CellRunResult {
  ok: boolean;
  outputs: CellOutput[];
}

let kernelReady = false;
const installedPackages = new Set<string>();

const PYODIDE_BUILTIN_PACKAGES = new Set([
  "numpy",
  "scipy",
  "scikit-learn",
  "matplotlib",
  "pandas",
  "sympy",
  "networkx",
  "statsmodels",
  "seaborn",
  "pillow",
  "lxml",
  "regex",
  "beautifulsoup4",
  "sqlite3",
  "micropip",
]);

// Auto-load packages when a cell imports them, so users don't have to think
// about loadPackage/micropip explicitly. Matches `import x` / `from x import …`
// at the start of a (possibly indented) line.
const IMPORT_RE = /^[ \t]*(?:from[ \t]+([A-Za-z_][A-Za-z0-9_]*)|import[ \t]+([A-Za-z_][A-Za-z0-9_]*))/gm;

const IMPORT_TO_PACKAGE: Record<string, string> = {
  cv2: "opencv-python",
  sklearn: "scikit-learn",
  PIL: "pillow",
  bs4: "beautifulsoup4",
};

function detectRequiredPackages(code: string): string[] {
  const found = new Set<string>();
  IMPORT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(code))) {
    const mod = m[1] || m[2];
    if (!mod) continue;
    const pkg = IMPORT_TO_PACKAGE[mod] ?? mod;
    if (PYODIDE_BUILTIN_PACKAGES.has(pkg)) found.add(pkg);
  }
  return Array.from(found);
}

async function ensurePackages(packages: string[]): Promise<void> {
  const missing = packages.filter((p) => !installedPackages.has(p));
  if (missing.length === 0) return;
  const py = await getPyodide();
  await py.loadPackage(missing);
  missing.forEach((p) => installedPackages.add(p));
}

// Set up the persistent kernel namespace once. All cells run inside `__kernel__`,
// so a variable defined in cell 1 is visible in cell 2 — exactly like Jupyter.
async function ensureKernel(): Promise<void> {
  if (kernelReady) return;
  const py = await getPyodide();
  await py.runPythonAsync(`
import sys, io, base64, json as _json
__kernel__ = {"__name__": "__main__"}
__cell_outputs__ = []
__figure_pngs__ = []

def __reset_cell__():
    global __cell_outputs__, __figure_pngs__
    __cell_outputs__ = []
    __figure_pngs__ = []

def __capture_matplotlib__():
    """If matplotlib is loaded and has open figures, render each as base64 PNG
    and append to __figure_pngs__, then close them so they don't pile up."""
    mpl = sys.modules.get("matplotlib")
    if mpl is None:
        return
    try:
        import matplotlib.pyplot as plt
        fignums = list(plt.get_fignums())
        for n in fignums:
            fig = plt.figure(n)
            buf = io.BytesIO()
            fig.savefig(buf, format="png", bbox_inches="tight")
            buf.seek(0)
            __figure_pngs__.append(base64.b64encode(buf.read()).decode("ascii"))
            plt.close(fig)
    except Exception:
        pass
`);
  kernelReady = true;
}

/**
 * Run a single cell against the persistent kernel namespace. The cell sees
 * variables defined by earlier cells. Stdout/stderr is captured per-cell.
 * The value of the last expression (if any) is returned as a "result" output,
 * matching Jupyter's "expression at end of cell" convention.
 */
export async function runCell(code: string): Promise<CellRunResult> {
  const py = await getPyodide();
  await ensureKernel();
  await ensurePackages(detectRequiredPackages(code));

  let stdout = "";
  let stderr = "";
  py.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  py.setStderr({ batched: (s: string) => (stderr += s + "\n") });

  py.globals.set("__cell_source__", code);

  try {
    await py.runPythonAsync(`
import ast, json
__reset_cell__()
__cell_result_repr__ = None
__cell_error__ = None

# Try to split off the final expression so we can capture its value (Jupyter style).
try:
    _module = ast.parse(__cell_source__, mode="exec")
    if _module.body and isinstance(_module.body[-1], ast.Expr):
        _last = _module.body.pop()
        _exec_mod = ast.Module(body=_module.body, type_ignores=[])
        _eval_expr = ast.Expression(body=_last.value)
        ast.fix_missing_locations(_exec_mod)
        ast.fix_missing_locations(_eval_expr)
        exec(compile(_exec_mod, "<cell>", "exec"), __kernel__)
        _val = eval(compile(_eval_expr, "<cell>", "eval"), __kernel__)
        if _val is not None:
            __cell_result_repr__ = repr(_val)
    else:
        exec(compile(__cell_source__, "<cell>", "exec"), __kernel__)
except Exception as _e:
    import traceback
    __cell_error__ = "".join(traceback.format_exception_only(type(_e), _e)).rstrip()

__capture_matplotlib__()
__cell_summary__ = json.dumps({
    "result": __cell_result_repr__,
    "error": __cell_error__,
    "figures": __figure_pngs__,
})
`);

    const summaryJson = py.globals.get("__cell_summary__") as string;
    const summary = JSON.parse(summaryJson) as {
      result: string | null;
      error: string | null;
      figures: string[];
    };

    const outputs: CellOutput[] = [];
    if (stdout) outputs.push({ kind: "stdout", text: stdout.trimEnd() });
    if (stderr) outputs.push({ kind: "stderr", text: stderr.trimEnd() });
    for (const fig of summary.figures) {
      outputs.push({ kind: "image", mime: "image/png", data: fig });
    }
    if (summary.result != null) {
      outputs.push({ kind: "result", text: summary.result });
    }
    if (summary.error) {
      outputs.push({ kind: "error", text: summary.error });
      return { ok: false, outputs };
    }
    return { ok: true, outputs };
  } catch (err) {
    return {
      ok: false,
      outputs: [
        { kind: "error", text: err instanceof Error ? err.message : String(err) },
      ],
    };
  }
}

/** Reset the kernel: clear all variables defined by cells so far. */
export async function resetKernel(): Promise<void> {
  if (!kernelReady) return;
  const py = await getPyodide();
  await py.runPythonAsync(`
__kernel__.clear()
__kernel__["__name__"] = "__main__"
__reset_cell__()
`);
}
