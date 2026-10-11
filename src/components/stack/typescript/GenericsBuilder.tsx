// GenericsBuilder — viser hvordan en generisk signatur «instansieres» når
// du gir T en konkret type. Brukeren velger:
//   1. En generisk fasong (id, par, forste, lengde-m-constraint)
//   2. Én eller flere konkrete typer for T (og evt. U)
//
// Komponenten beregner den resulterende signaturen og et eksempel-kall.
// Hvis T bryter en constraint, vises det med en rød badge — samme idé
// som TS faktisk ville rapportert.

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Shape {
  id: string;
  label: string;
  description: string;
  /** Generisk signatur som vist i koden — bruker plassholdere %T%, %U%, %C%. */
  template: string;
  /** Constraint på T, eller null. Vises i sjablongen og brukes til validering. */
  constraintT?: { kind: "extends"; tag: string };
  /** Bruker en andre type-variabel U? */
  hasU?: boolean;
  /** Hvordan bygge et eksempel-kall fra konkrete typer. */
  example: (t: string, u?: string) => { code: string; resultType: string };
}

const TYPES = [
  { label: "number", value: "number", hasLength: false },
  { label: "string", value: "string", hasLength: true },
  { label: "boolean", value: "boolean", hasLength: false },
  { label: "User", value: "User", hasLength: false },
  { label: "number[]", value: "number[]", hasLength: true },
  { label: "string[]", value: "string[]", hasLength: true },
];

const SHAPES: Shape[] = [
  {
    id: "id",
    label: "Identitet",
    description:
      "Den enkleste generic — returnerer det du sender inn, med typen i behold.",
    template: `function id<T>(x: T): T {
  return x;
}`,
    example: (t) => ({
      code: `const v = id<${t}>(${sampleFor(t)});`,
      resultType: t,
    }),
  },
  {
    id: "forste",
    label: "Første element",
    description:
      "Plukker første element ut av en liste. Returtypen følger element-typen.",
    template: `function forste<T>(liste: T[]): T {
  return liste[0];
}`,
    example: (t) => ({
      code: `const v = forste<${t}>(${arraySampleFor(t)});`,
      resultType: t,
    }),
  },
  {
    id: "par",
    label: "Par av to typer",
    description:
      "To type-variabler. Resultatet er en tuple som husker rekkefølgen.",
    template: `function par<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}`,
    hasU: true,
    example: (t, u) => ({
      code: `const v = par<${t}, ${u}>(${sampleFor(t)}, ${sampleFor(u!)});`,
      resultType: `[${t}, ${u}]`,
    }),
  },
  {
    id: "lengde",
    label: "Constraint: T extends { length: number }",
    description:
      "T må ha en .length-egenskap. Hvis du prøver med number — type-feil.",
    template: `function lengde<T extends { length: number }>(x: T): number {
  return x.length;
}`,
    constraintT: { kind: "extends", tag: "length:number" },
    example: (t) => ({
      code: `const n = lengde<${t}>(${sampleFor(t)});`,
      resultType: `number`,
    }),
  },
];

function sampleFor(t: string): string {
  switch (t) {
    case "number":
      return "42";
    case "string":
      return `"hei"`;
    case "boolean":
      return "true";
    case "User":
      return `{ id: 1, navn: "Ada" }`;
    case "number[]":
      return `[1, 2, 3]`;
    case "string[]":
      return `["a", "b"]`;
    default:
      return `/* ${t} */`;
  }
}

function arraySampleFor(t: string): string {
  switch (t) {
    case "number":
      return "[1, 2, 3]";
    case "string":
      return `["a", "b"]`;
    case "boolean":
      return "[true, false]";
    case "User":
      return `[{ id: 1, navn: "Ada" }]`;
    case "number[]":
      return `[[1, 2], [3, 4]]`;
    case "string[]":
      return `[["a"], ["b"]]`;
    default:
      return `[/* ${t} */]`;
  }
}

function hasLengthProperty(t: string): boolean {
  return TYPES.find((x) => x.value === t)?.hasLength ?? false;
}

function fillTemplate(shape: Shape, t: string, u?: string): string {
  let out = shape.template
    .replaceAll("<T>", `<${t}>`)
    .replace(/: T\b/g, `: ${t}`)
    .replace(/\(x: T\b/g, `(x: ${t}`)
    .replace(/\(liste: T\[\]/g, `(liste: ${t}[]`);
  if (shape.hasU && u) {
    out = out
      .replace(/<T, U>/, `<${t}, ${u}>`)
      .replace(/\(a: T, b: U\)/, `(a: ${t}, b: ${u})`)
      .replace(/: \[T, U\]/, `: [${t}, ${u}]`)
      .replace(/return \[a, b\];/, `return [a, b];`);
  }
  if (shape.constraintT) {
    out = out.replace(/<T extends \{ length: number \}>/, `<${t}>`);
  }
  return out;
}

export function GenericsBuilder() {
  const [shapeIdx, setShapeIdx] = useState(0);
  const [t, setT] = useState("number");
  const [u, setU] = useState("string");
  const shape = SHAPES[shapeIdx];

  const constraintViolated =
    shape.constraintT?.tag === "length:number" && !hasLengthProperty(t);

  const concreteSignature = useMemo(
    () => fillTemplate(shape, t, shape.hasU ? u : undefined),
    [shape, t, u],
  );
  const ex = useMemo(
    () => shape.example(t, shape.hasU ? u : undefined),
    [shape, t, u],
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Generics-bygger
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {SHAPES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setShapeIdx(i)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors",
                i === shapeIdx
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:border-brand/40",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {shape.description}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Generisk sjablong
          </div>
          <pre className="font-mono text-xs whitespace-pre overflow-x-auto bg-muted/30 rounded p-2 mb-4">
            {shape.template}
          </pre>

          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Velg T
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setT(opt.value)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-mono border transition-colors",
                  t === opt.value
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-background hover:border-brand/40",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {shape.hasU && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Velg U
              </div>
              <div className="flex flex-wrap gap-1">
                {TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setU(opt.value)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-mono border transition-colors",
                      u === opt.value
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Konkret signatur
            </div>
            {constraintViolated ? (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400">
                CONSTRAINT BRUDD
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-500/15 text-green-700 dark:text-green-400">
                OK
              </span>
            )}
          </div>
          <pre
            className={cn(
              "font-mono text-xs whitespace-pre overflow-x-auto rounded p-2 mb-3 border",
              constraintViolated
                ? "bg-red-500/5 border-red-500/30"
                : "bg-brand/5 border-brand/30",
            )}
          >
            {concreteSignature}
          </pre>

          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Eksempel-kall
          </div>
          <pre className="font-mono text-xs whitespace-pre overflow-x-auto bg-muted/30 rounded p-2">
            {ex.code}
          </pre>
          <div className="text-[11px] text-muted-foreground mt-2">
            Inferert resultat:{" "}
            <code className="font-mono text-foreground">{ex.resultType}</code>
          </div>

          {constraintViolated && (
            <div className="mt-3 text-[11px] text-red-600 dark:text-red-400 leading-snug">
              <strong>{t}</strong> har ikke <code>.length</code> — TypeScript
              ville rapportert{" "}
              <em>
                «Argument of type '{t}' is not assignable to parameter of type
                '{`{ length: number }`}'».
              </em>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
