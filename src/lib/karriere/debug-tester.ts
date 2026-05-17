// Test-runner for Debug-jakt.
// Python: bygger en test-driver som kaller funksjonen og printer JSON.
// SQL: kjører setup + brukerens query via /api/query og sammenligner rader.

import { runScript } from "@/lib/python/runner";
import { runQuery } from "@/lib/engine/sqlEngine";
import type { DebugBug, TestCase } from "./debug-bugs";

export interface TestResult {
  beskrivelse: string;
  passerte: boolean;
  faktisk?: unknown;
  forventet?: unknown;
  feilmelding?: string;
}

export interface TestRunOutcome {
  ok: boolean; // true = alle tester passerte
  results: TestResult[];
  /** Generell feilmelding hvis koden ikke kjørte i det hele tatt. */
  runtimeError?: string;
  stdout?: string;
}

// ----------------------------------------------------------------------------
// PYTHON
// ----------------------------------------------------------------------------

/**
 * Bygger en test-driver i Python. Driveren leser hver TestCase, kaller
 * funksjonen, fanger eksepsjoner per case, og printer ETT JSON-objekt
 * per linje med prefix __TEST__.
 *
 * Spesial-input-sentineler:
 *  - __sentinel_first__: tester at to påfølgende kall ikke deler default-state
 *  - __call_idx__ etterfulgt av [n, idx, arg]: kaller funksjon(n)[idx](arg)
 *  - __async__: kaller funksjonen som coroutine via asyncio.run
 *  - __cache_lookup__: setter opp en fast cache og tester lookup
 */
function buildPythonDriver(funksjonsnavn: string, testCases: TestCase[]): string {
  const cases = testCases.map((c) => ({
    beskrivelse: c.beskrivelse,
    input: c.input ?? [],
    expected: c.expected ?? null,
  }));
  return `
import json as __json
import sys as __sys
__cases = __json.loads(${JSON.stringify(JSON.stringify(cases))})
__fn = ${funksjonsnavn}

def __compare(faktisk, forventet):
    # Tuples → lister ved sammenligning (JSON kan ikke skille).
    if isinstance(faktisk, tuple):
        faktisk = list(faktisk)
    if isinstance(faktisk, float) and isinstance(forventet, (int, float)):
        return abs(faktisk - forventet) < 1e-9
    return faktisk == forventet

for __c in __cases:
    __input = __c["input"]
    __exp = __c["expected"]
    __resultat = {"beskrivelse": __c["beskrivelse"], "passerte": False}
    try:
        if len(__input) > 0 and __input[0] == "__sentinel_first__":
            # Test for mutable default: kall to ganger uten ekstra argumenter.
            __r1 = __fn("a")
            __r2 = __fn("b")
            # Andre kall skal være ["b"], ikke ["a", "b"].
            __faktisk = __r2
        elif len(__input) > 0 and __input[0] == "__call_idx__":
            # __call_idx__, n, idx, arg → fn(n)[idx](arg)
            _, __n, __idx, __arg = __input
            __faktisk = __fn(__n)[__idx](__arg)
        elif len(__input) > 0 and __input[0] == "__async__":
            import asyncio
            __faktisk = asyncio.run(__fn())
        elif len(__input) > 0 and __input[0] == "__cache_lookup__":
            __cache = {"alice": 1, "bob": 2}
            __faktisk = __fn(__cache, __input[1])
        else:
            __faktisk = __fn(*__input)
        # Konverter tuples til lister for JSON
        def __normaliser(v):
            if isinstance(v, tuple):
                return [__normaliser(x) for x in v]
            if isinstance(v, list):
                return [__normaliser(x) for x in v]
            if isinstance(v, dict):
                return {str(k): __normaliser(vv) for k, vv in v.items()}
            return v
        __faktisk_norm = __normaliser(__faktisk)
        __resultat["faktisk"] = __faktisk_norm
        __resultat["forventet"] = __exp
        __resultat["passerte"] = __compare(__faktisk_norm, __exp)
    except Exception as __e:
        __resultat["feilmelding"] = f"{type(__e).__name__}: {__e}"
        __resultat["forventet"] = __exp
    print("__TEST__" + __json.dumps(__resultat))
`;
}

export async function runPythonTests(bug: DebugBug, userCode: string): Promise<TestRunOutcome> {
  if (!bug.funksjonsnavn || !bug.testCases) {
    return { ok: false, results: [], runtimeError: "Bug har ingen Python-tester konfigurert" };
  }
  const driver = buildPythonDriver(bug.funksjonsnavn, bug.testCases);
  const full = userCode + "\n\n" + driver;
  const out = await runScript(full);
  if (!out.ok) {
    return {
      ok: false,
      results: [],
      runtimeError: out.error ?? "Ukjent feil",
      stdout: out.stdout,
    };
  }
  const linjer = out.stdout.split("\n");
  const results: TestResult[] = [];
  const annetStdout: string[] = [];
  for (const linje of linjer) {
    if (linje.startsWith("__TEST__")) {
      try {
        const r = JSON.parse(linje.slice(8)) as TestResult;
        results.push(r);
      } catch {
        /* ignore */
      }
    } else if (linje.trim()) {
      annetStdout.push(linje);
    }
  }
  const ok = results.length === bug.testCases.length && results.every((r) => r.passerte);
  return { ok, results, stdout: annetStdout.join("\n") };
}

// ----------------------------------------------------------------------------
// SQL
// ----------------------------------------------------------------------------

function rowsEqual(a: unknown[][], b: unknown[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const r1 = a[i];
    const r2 = b[i];
    if (r1.length !== r2.length) return false;
    for (let j = 0; j < r1.length; j++) {
      // SQLite kan returnere number som string i noen tilfeller — løs sammenligning.
      const v1 = r1[j];
      const v2 = r2[j];
      if (v1 === null && v2 === null) continue;
      if (typeof v1 === "number" && typeof v2 === "number") {
        if (Math.abs(v1 - v2) > 1e-9) return false;
        continue;
      }
      if (String(v1) !== String(v2)) return false;
    }
  }
  return true;
}

export async function runSqlTest(bug: DebugBug, userSql: string): Promise<TestRunOutcome> {
  if (!bug.sqlTest) {
    return { ok: false, results: [], runtimeError: "Bug har ingen SQL-test konfigurert" };
  }
  const { setup, expectedRows, expectedColumns } = bug.sqlTest;
  // Bruk "blank" dataset så vi får et tomt skjema. preSql kjører CREATE+INSERT
  // FØR brukerens SELECT, deretter blir resultatet av brukerens query returnert.
  const out = await runQuery(userSql, "blank", {
    mode: "select",
    preSql: setup,
  });
  if (!out.success || !out.result) {
    return {
      ok: false,
      results: [
        {
          beskrivelse: "SQL-spørringen feilet",
          passerte: false,
          feilmelding: out.error ?? "Ukjent feil",
        },
      ],
      runtimeError: out.error,
    };
  }
  const radSjekk: TestResult = {
    beskrivelse: `Rader matcher forventet output (${expectedRows.length} rader)`,
    passerte: rowsEqual(out.result.rows, expectedRows),
    faktisk: out.result.rows,
    forventet: expectedRows,
  };
  const results: TestResult[] = [radSjekk];
  if (expectedColumns) {
    const matcherKolonner =
      out.result.columns.length === expectedColumns.length &&
      out.result.columns.every((c, i) => c === expectedColumns[i]);
    results.unshift({
      beskrivelse: `Kolonnenavn er ${expectedColumns.join(", ")}`,
      passerte: matcherKolonner,
      faktisk: out.result.columns,
      forventet: expectedColumns,
    });
  }
  const ok = results.every((r) => r.passerte);
  return { ok, results };
}

export async function runTests(bug: DebugBug, userCode: string): Promise<TestRunOutcome> {
  if (bug.sprak === "python") return runPythonTests(bug, userCode);
  return runSqlTest(bug, userCode);
}
