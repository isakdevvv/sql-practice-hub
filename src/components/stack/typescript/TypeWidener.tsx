// TypeWidener — viser hvordan TypeScript bestemmer inferert type basert på
// hvordan en verdi er erklært. Samme verdi, ulike erklæringer, ulik type.
//
// Pedagogikken: literal type vs widened type vs const assertion. Studenten
// klikker mellom presets og ser tre ting:
//   1. Erklæringen
//   2. Den inferte typen
//   3. Hva som er lovlig å gjøre etterpå
//
// Ingen kompilator nødvendig — disse svarene er deterministiske og
// presample-baserte (lik en interaktiv tabell).

import { useState } from "react";
import { cn } from "@/lib/utils";

interface WidenCase {
  decl: string;
  inferred: string;
  why: string;
  legal: { code: string; ok: boolean; note: string }[];
}

const CASES: WidenCase[] = [
  {
    decl: `const x = 3;`,
    inferred: `3`,
    why: "const + literal → TS bruker den NØYAKTIGE verdien som type. x kan aldri bli noe annet enn 3.",
    legal: [
      { code: `x === 3`, ok: true, note: "samme literal — alltid sant" },
      {
        code: `let y: number = x`,
        ok: true,
        note: "literal 3 widener seg til number ved tilordning",
      },
      {
        code: `x = 4`,
        ok: false,
        note: "const kan ikke reassignes — kompilator-feil",
      },
    ],
  },
  {
    decl: `let x = 3;`,
    inferred: `number`,
    why: "let signaliserer at verdien kan endres, så TS «widener» literal-typen 3 til number umiddelbart.",
    legal: [
      { code: `x = 4`, ok: true, note: "OK — number aksepterer alle tall" },
      {
        code: `x = "tre"`,
        ok: false,
        note: "string er ikke tilordnbar til number",
      },
      {
        code: `const y: 3 = x`,
        ok: false,
        note: "x er number, ikke literal 3 lenger",
      },
    ],
  },
  {
    decl: `const x = 3 as const;`,
    inferred: `3`,
    why: "as const tvinger smaleste mulige type — uten den ville verdi som ikke er primitive blitt widened.",
    legal: [
      { code: `x === 3`, ok: true, note: "samme literal" },
      {
        code: `let y: number = x`,
        ok: true,
        note: "literal 3 kan widenes til number",
      },
    ],
  },
  {
    decl: `const arr = [1, 2, 3];`,
    inferred: `number[]`,
    why: "Arrays widenes til mutable arrays. Ingen literal-typer beholdes, og lengden glemmes.",
    legal: [
      {
        code: `arr.push(4)`,
        ok: true,
        note: "number[] er muterbar — push er lov",
      },
      {
        code: `const t: [1,2,3] = arr`,
        ok: false,
        note: "arr er number[], ikke tuple [1,2,3]",
      },
    ],
  },
  {
    decl: `const arr = [1, 2, 3] as const;`,
    inferred: `readonly [1, 2, 3]`,
    why: "as const gjør arrayet til en readonly-tuple med EKSAKT lengde og literal-elementer.",
    legal: [
      {
        code: `arr[0] === 1`,
        ok: true,
        note: "type-systemet vet element 0 er literal 1",
      },
      {
        code: `arr.push(4)`,
        ok: false,
        note: "readonly — ingen mutering",
      },
      {
        code: `arr.length`,
        ok: true,
        note: "kjent som 3 (literal)",
      },
    ],
  },
  {
    decl: `const obj = { rolle: "admin" };`,
    inferred: `{ rolle: string }`,
    why: "Objekt-felt widenes som let — string-literal blir til string, ellers ville objektet vært ubrukelig som muterbar form.",
    legal: [
      {
        code: `obj.rolle = "bruker"`,
        ok: true,
        note: "rolle er string — alle strings OK",
      },
      {
        code: `type R = "admin" | "bruker"; const r: R = obj.rolle`,
        ok: false,
        note: "obj.rolle er string, ikke union — TS vet ikke at det fortsatt er \"admin\"",
      },
    ],
  },
  {
    decl: `const obj = { rolle: "admin" } as const;`,
    inferred: `{ readonly rolle: "admin" }`,
    why: "as const gjør hele objektet readonly med literal-felt — perfekt for «konfig-objekter» og discriminated unions.",
    legal: [
      {
        code: `type R = "admin" | "bruker"; const r: R = obj.rolle`,
        ok: true,
        note: "obj.rolle er literal \"admin\" — union aksepterer",
      },
      {
        code: `obj.rolle = "bruker"`,
        ok: false,
        note: "readonly — kan ikke endres",
      },
    ],
  },
];

export function TypeWidener() {
  const [active, setActive] = useState(0);
  const c = CASES[active];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Type-widening — klikk en erklæring
        </div>
        <div className="flex flex-wrap gap-1">
          {CASES.map((cc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-mono border transition-colors",
                i === active
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background hover:border-brand/40",
              )}
            >
              {cc.decl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Erklæring
          </div>
          <pre className="font-mono text-xs whitespace-pre overflow-x-auto bg-muted/30 rounded p-2 mb-3">
            {c.decl}
          </pre>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            TypeScript inferer
          </div>
          <pre className="font-mono text-sm text-brand whitespace-pre overflow-x-auto bg-brand/5 border border-brand/30 rounded p-2 mb-3">
            {c.inferred}
          </pre>
          <div className="text-[11px] text-muted-foreground">{c.why}</div>
        </div>

        <div className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Hva er lovlig?
          </div>
          <ul className="space-y-2">
            {c.legal.map((l, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={cn(
                    "shrink-0 mt-0.5 inline-flex items-center justify-center h-4 w-4 rounded text-[10px] font-bold",
                    l.ok
                      ? "bg-green-500/15 text-green-700 dark:text-green-400"
                      : "bg-red-500/15 text-red-600 dark:text-red-400",
                  )}
                >
                  {l.ok ? "✓" : "✗"}
                </span>
                <div className="flex-1 min-w-0">
                  <code className="font-mono text-xs text-foreground break-all">
                    {l.code}
                  </code>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {l.note}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
