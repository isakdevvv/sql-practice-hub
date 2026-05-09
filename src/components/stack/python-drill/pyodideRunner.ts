// Lett-vekt Python-runner for drill-oppgavene. Gjenbruker den delte
// `getPyodide()`-instansen fra /python-ruten — vi trenger ingen mysql-shim
// eller variabel-snapshots her, bare stdout.

import { getPyodide } from "@/lib/python/pyodideLoader";

export interface CheckResult {
  ok: boolean;
  passed: boolean;
  actual: string;
  expected: string;
  error: string | null;
}

/** Normalisere stdout for sammenligning: trim trailing whitespace per linje + samlet. */
function normalize(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/^\s+|\s+$/g, "");
}

/**
 * Kjør Python-koden i Pyodide og sammenlign stdout med forventet utdata.
 * Sammenligning er lemfeldig på trailing whitespace, men streng på innhold.
 */
export async function runAndCheck(
  code: string,
  expected: string,
): Promise<CheckResult> {
  let py;
  try {
    py = await getPyodide();
  } catch (err) {
    return {
      ok: false,
      passed: false,
      actual: "",
      expected,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  let stdout = "";
  py.setStdout({ batched: (s: string) => (stdout += s + "\n") });
  py.setStderr({ batched: (s: string) => (stdout += s + "\n") });

  try {
    py.globals.set("__drill_code__", code);
    await py.runPythonAsync(`
_ns = {"__name__": "__main__"}
exec(__drill_code__, _ns)
`);
    const actual = stdout.trimEnd();
    return {
      ok: true,
      passed: normalize(actual) === normalize(expected),
      actual,
      expected,
      error: null,
    };
  } catch (err) {
    return {
      ok: true,
      passed: false,
      actual: stdout.trimEnd(),
      expected,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
