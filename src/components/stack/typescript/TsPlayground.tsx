// Live TypeScript-playground. Studenten skriver TS, ser transpilert JS og
// type-diagnostics fra ekte typescript-kompilator side-ved-side.
//
// Kompilatoren lastes lazy fra CDN (~10 MB) ved første klikk på "Last
// kompilator". Sammen med `lib.es5.d.ts` får vi nok til å typesjekke
// grunnleggende eksempler (primitives, Array, Object, generics).
//
// Tre paneler:
//   1. TS-source (textarea, editable)
//   2. Transpilert JS (read-only)
//   3. Diagnostics-liste (line:col + melding)
//
// Tre presets gjør det enkelt å hoppe inn i en typisk feil.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TS_CDN = "https://unpkg.com/typescript@5.4.5/lib/typescript.js";
const LIB_ES5_CDN = "https://unpkg.com/typescript@5.4.5/lib/lib.es5.d.ts";
const LIB_ES2015_CORE_CDN = "https://unpkg.com/typescript@5.4.5/lib/lib.es2015.core.d.ts";

type LoadState = "idle" | "loading" | "ready" | "error";

interface Diagnostic {
  line: number;
  col: number;
  message: string;
  category: "error" | "warning" | "info";
}

interface CompileResult {
  js: string;
  diagnostics: Diagnostic[];
}

interface Preset {
  label: string;
  description: string;
  code: string;
}

const PRESETS: Preset[] = [
  {
    label: "Manglende felt",
    description: "Funksjonen krever to felt, men kallet sender ett.",
    code: `function pris(p: { pris: number; antall: number }): number {
  return p.pris * p.antall;
}

// Mangler 'antall' — TS fanger det før kjøring
pris({ pris: 10 });`,
  },
  {
    label: "Narrowing virker",
    description: "string | number — kompilatoren snevrer typen etter typeof.",
    code: `function lengdeAv(x: string | number): number {
  if (typeof x === "string") {
    // Her er x: string — .length OK
    return x.length;
  }
  // Her er x: number
  return x;
}

console.log(lengdeAv("hei"));
console.log(lengdeAv(42));`,
  },
  {
    label: "Generic beholder T",
    description: "Uten generic blir resultatet any. Med <T> følger typen med.",
    code: `function forste<T>(liste: T[]): T {
  return liste[0];
}

const tall = forste([1, 2, 3]);     // tall: number
const ord  = forste(["a", "b"]);    // ord: string

// Constraint — T må ha .length
function lengde<T extends { length: number }>(x: T) {
  return x.length;
}
lengde("hei");      // OK
lengde(42);         // Error — number har ikke length`,
  },
  {
    label: "strictNullChecks",
    description: "string | null kan ikke kalle .length uten å sjekke null.",
    code: `function lengde(s: string | null): number {
  // Feil — s kan være null
  return s.length;
}

// Riktig:
function lengdeOK(s: string | null): number {
  return s?.length ?? 0;
}`,
  },
];

declare global {
  interface Window {
    ts?: any;
    __tsLoadPromise?: Promise<void>;
    __tsLibSources?: { name: string; content: string }[];
  }
}

function loadTypeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.ts && window.__tsLibSources) return Promise.resolve();
  if (window.__tsLoadPromise) return window.__tsLoadPromise;

  window.__tsLoadPromise = (async () => {
    // Hent kompilator + lib-filer parallelt.
    const [, libEs5, libEs2015Core] = await Promise.all([
      injectScript(TS_CDN),
      fetch(LIB_ES5_CDN).then((r) => r.text()),
      fetch(LIB_ES2015_CORE_CDN).then((r) => r.text()),
    ]);
    if (!window.ts) throw new Error("typescript lastet, men window.ts mangler");
    window.__tsLibSources = [
      { name: "lib.es5.d.ts", content: libEs5 },
      { name: "lib.es2015.core.d.ts", content: libEs2015Core },
    ];
  })();

  return window.__tsLoadPromise;
}

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      if ((existing as any).__loaded) resolve();
      else existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.src = src;
    s.onload = () => {
      (s as any).__loaded = true;
      resolve();
    };
    s.onerror = () => reject(new Error("kunne ikke laste " + src));
    document.head.appendChild(s);
  });
}

function compile(code: string): CompileResult {
  const ts = window.ts;
  const libs = window.__tsLibSources ?? [];
  const FILE = "input.ts";

  // Tom kompilator-host som leverer brukerens fil + lib-filene fra minnet.
  const sourceFiles = new Map<string, any>();
  sourceFiles.set(
    FILE,
    ts.createSourceFile(FILE, code, ts.ScriptTarget.ES2020, true),
  );
  for (const lib of libs) {
    sourceFiles.set(
      lib.name,
      ts.createSourceFile(lib.name, lib.content, ts.ScriptTarget.ES2020, true),
    );
  }

  const host = {
    getSourceFile: (name: string) => sourceFiles.get(name),
    getDefaultLibFileName: () => "lib.es5.d.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (n: string) => n,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    fileExists: (name: string) => sourceFiles.has(name),
    readFile: (name: string) => sourceFiles.get(name)?.text ?? "",
    directoryExists: () => true,
    getDirectories: () => [],
  };

  const options = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.None,
    strict: true,
    noEmitOnError: false,
    lib: ["lib.es5.d.ts", "lib.es2015.core.d.ts"],
  };

  const program = ts.createProgram([FILE], options, host as any);
  const diagnostics = [
    ...program.getSyntacticDiagnostics(sourceFiles.get(FILE)),
    ...program.getSemanticDiagnostics(sourceFiles.get(FILE)),
  ].map((d: any): Diagnostic => {
    const start = d.start ?? 0;
    const pos = d.file
      ? d.file.getLineAndCharacterOfPosition(start)
      : { line: 0, character: 0 };
    const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    return {
      line: pos.line + 1,
      col: pos.character + 1,
      message,
      category:
        d.category === ts.DiagnosticCategory.Error
          ? "error"
          : d.category === ts.DiagnosticCategory.Warning
            ? "warning"
            : "info",
    };
  });

  // Egen transpile for ren JS-output (uavhengig av semantiske feil).
  const transpileResult = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
    },
  });

  return { js: transpileResult.outputText, diagnostics };
}

export function TsPlayground() {
  const [code, setCode] = useState(PRESETS[0].code);
  const [activePreset, setActivePreset] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [result, setResult] = useState<CompileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Når kompilator er klar, kjør initial kompilering. Senere kjøringer
  // trigges av code-endringer via debounce.
  useEffect(() => {
    if (loadState !== "ready") return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      try {
        setResult(compile(code));
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [code, loadState]);

  async function handleLoad() {
    setLoadState("loading");
    setError(null);
    try {
      await loadTypeScript();
      setLoadState("ready");
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setLoadState("error");
    }
  }

  function pickPreset(i: number) {
    setActivePreset(i);
    setCode(PRESETS[i].code);
  }

  const diagnostics = result?.diagnostics ?? [];
  const errCount = diagnostics.filter((d) => d.category === "error").length;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header — last-knapp + presets */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            TypeScript-playground
          </span>
          {loadState === "idle" && (
            <button
              type="button"
              onClick={handleLoad}
              className="rounded-md bg-brand text-white text-xs font-medium px-3 py-1 hover:bg-brand/90"
            >
              Last kompilator (~3 MB)
            </button>
          )}
          {loadState === "loading" && (
            <span className="text-xs text-muted-foreground">
              Laster typescript@5.4 fra CDN …
            </span>
          )}
          {loadState === "ready" && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                errCount > 0
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-green-500/15 text-green-700 dark:text-green-400",
              )}
            >
              {errCount > 0
                ? `${errCount} type-${errCount === 1 ? "feil" : "feil"}`
                : "ingen feil"}
            </span>
          )}
          {loadState === "error" && (
            <span className="text-xs text-red-600 dark:text-red-400">
              Kunne ikke laste kompilator: {error}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => pickPreset(i)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-mono border transition-colors",
                i === activePreset
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:border-brand/40",
              )}
              title={p.description}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          {PRESETS[activePreset].description}
        </div>
      </div>

      {/* Body — tre paneler */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div>
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border">
            TypeScript-source
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full font-mono text-xs p-3 bg-transparent outline-none resize-none min-h-[260px] block"
            style={{ tabSize: 2 }}
          />
        </div>
        <div className="flex flex-col">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border">
            Transpilert JavaScript
          </div>
          <pre className="font-mono text-xs p-3 overflow-x-auto whitespace-pre flex-1 min-h-[120px] m-0">
            {loadState === "ready"
              ? (result?.js ?? "// kompilerer…")
              : "// last kompilatoren for å se transpilert JS"}
          </pre>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="border-t border-border">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20 flex items-center justify-between">
          <span>Type-diagnostics</span>
          {loadState === "ready" && (
            <span className="text-muted-foreground/70">
              {diagnostics.length === 0
                ? "klart"
                : `${diagnostics.length} melding${diagnostics.length === 1 ? "" : "er"}`}
            </span>
          )}
        </div>
        {loadState !== "ready" ? (
          <div className="px-3 py-3 text-[11px] text-muted-foreground italic">
            (last kompilatoren for å kjøre type-sjekk)
          </div>
        ) : diagnostics.length === 0 ? (
          <div className="px-3 py-3 text-[11px] text-green-700 dark:text-green-400 font-mono">
            ✓ Ingen type-feil. Koden er gyldig TS.
          </div>
        ) : (
          <ul className="divide-y divide-border max-h-48 overflow-y-auto">
            {diagnostics.map((d, i) => (
              <li
                key={i}
                className={cn(
                  "px-3 py-2 text-[11px] font-mono",
                  d.category === "error"
                    ? "text-red-700 dark:text-red-400"
                    : d.category === "warning"
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground",
                )}
              >
                <span className="font-semibold">
                  {d.line}:{d.col}
                </span>{" "}
                — {d.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
