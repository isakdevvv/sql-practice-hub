import { useMemo, useState } from "react";

type Bit = boolean;
type Perm = { r: Bit; w: Bit; x: Bit };
type Mode = { u: Perm; g: Perm; o: Perm };

const emptyPerm = (): Perm => ({ r: false, w: false, x: false });
const emptyMode = (): Mode => ({ u: emptyPerm(), g: emptyPerm(), o: emptyPerm() });

function permToOctal(p: Perm): number {
  return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
}

function permToSymbolic(p: Perm): string {
  return `${p.r ? "r" : "-"}${p.w ? "w" : "-"}${p.x ? "x" : "-"}`;
}

function octalToPerm(d: number): Perm {
  return { r: (d & 4) !== 0, w: (d & 2) !== 0, x: (d & 1) !== 0 };
}

function modeToOctal(m: Mode): string {
  return `${permToOctal(m.u)}${permToOctal(m.g)}${permToOctal(m.o)}`;
}

function modeToSymbolic(m: Mode): string {
  return `${permToSymbolic(m.u)}${permToSymbolic(m.g)}${permToSymbolic(m.o)}`;
}

/** Apply a single symbolic chmod token like "u+x" or "g-w" or "o=r" to a Mode. */
function applySymbolic(m: Mode, token: string): Mode | null {
  // Format: who op perms where who in [ugoa], op in [+,-,=], perms in [rwx]+
  const match = /^([ugoa]+)([+\-=])([rwx]*)$/.exec(token.trim());
  if (!match) return null;
  const [, whoStr, op, permsStr] = match;
  const targets: Array<"u" | "g" | "o"> = [];
  for (const c of whoStr) {
    if (c === "a") targets.push("u", "g", "o");
    else if (c === "u" || c === "g" || c === "o") targets.push(c);
  }
  const setBits = { r: permsStr.includes("r"), w: permsStr.includes("w"), x: permsStr.includes("x") };
  const out: Mode = { u: { ...m.u }, g: { ...m.g }, o: { ...m.o } };
  for (const t of targets) {
    if (op === "=") {
      out[t] = { ...setBits };
    } else if (op === "+") {
      if (setBits.r) out[t].r = true;
      if (setBits.w) out[t].w = true;
      if (setBits.x) out[t].x = true;
    } else if (op === "-") {
      if (setBits.r) out[t].r = false;
      if (setBits.w) out[t].w = false;
      if (setBits.x) out[t].x = false;
    }
  }
  return out;
}

function CheckCell({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`h-10 w-10 rounded-md border font-mono text-sm font-semibold transition-colors ${
        on
          ? "bg-brand text-brand-foreground border-brand"
          : "bg-card text-muted-foreground border-border hover:border-brand/40"
      }`}
      aria-pressed={on}
      aria-label={label}
    >
      {on ? label : "-"}
    </button>
  );
}

function PermRow({
  who,
  perm,
  onChange,
}: {
  who: "u" | "g" | "o";
  perm: Perm;
  onChange: (p: Perm) => void;
}) {
  const label = who === "u" ? "Eier (u)" : who === "g" ? "Gruppe (g)" : "Andre (o)";
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm font-medium">{label}</div>
      <CheckCell label="r" on={perm.r} onToggle={() => onChange({ ...perm, r: !perm.r })} />
      <CheckCell label="w" on={perm.w} onToggle={() => onChange({ ...perm, w: !perm.w })} />
      <CheckCell label="x" on={perm.x} onToggle={() => onChange({ ...perm, x: !perm.x })} />
      <div className="ml-4 font-mono text-sm">
        <span className="text-muted-foreground">oktal: </span>
        <span className="text-brand font-bold">{permToOctal(perm)}</span>
      </div>
    </div>
  );
}

export function RwxKalkulator() {
  const [mode, setMode] = useState<Mode>(() => ({
    u: { r: true, w: true, x: true },
    g: { r: true, w: false, x: true },
    o: { r: true, w: false, x: true },
  }));

  const octal = modeToOctal(mode);
  const sym = modeToSymbolic(mode);

  const lsLine = useMemo(() => `-${sym} 1 isak users 42 mai 13 14:30 script.sh`, [sym]);

  // Reverse: octal → mode
  const [octalInput, setOctalInput] = useState("755");
  const reverseMode = useMemo(() => {
    if (!/^[0-7]{3}$/.test(octalInput)) return null;
    return {
      u: octalToPerm(Number(octalInput[0])),
      g: octalToPerm(Number(octalInput[1])),
      o: octalToPerm(Number(octalInput[2])),
    } satisfies Mode;
  }, [octalInput]);

  // Symbolic chmod builder
  const [symInput, setSymInput] = useState("u+x");
  const [symBaseMode, setSymBaseMode] = useState<Mode>(emptyMode());
  const symResultMode = useMemo(() => {
    const tokens = symInput.split(",").map((t) => t.trim()).filter(Boolean);
    let cur: Mode | null = symBaseMode;
    for (const t of tokens) {
      if (!cur) return null;
      cur = applySymbolic(cur, t);
    }
    return cur;
  }, [symInput, symBaseMode]);

  return (
    <div className="space-y-6">
      {/* Mode 1: toggle and read */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">A. Klikk bittene, les oktal og ls-streng</h3>
        <div className="space-y-2.5">
          <PermRow who="u" perm={mode.u} onChange={(p) => setMode({ ...mode, u: p })} />
          <PermRow who="g" perm={mode.g} onChange={(p) => setMode({ ...mode, g: p })} />
          <PermRow who="o" perm={mode.o} onChange={(p) => setMode({ ...mode, o: p })} />
        </div>
        <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground mb-1">Oktal</div>
            <div className="font-mono text-2xl text-brand font-bold">{octal}</div>
            <div className="mt-1 text-xs text-muted-foreground font-mono">chmod {octal} fil</div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground mb-1">Symbolsk (rwx)</div>
            <div className="font-mono text-lg text-brand font-bold">{sym}</div>
            <div className="mt-1 text-xs text-muted-foreground">u={permToSymbolic(mode.u)} g={permToSymbolic(mode.g)} o={permToSymbolic(mode.o)}</div>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-dashed border-border p-3 bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Slik dukker det opp i ls -l</div>
          <pre className="font-mono text-xs whitespace-pre overflow-x-auto">{lsLine}</pre>
        </div>
      </div>

      {/* Mode 2: octal → permission */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">B. Oktal → rettighet</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Skriv tre oktale siffer (0–7) og se hva chmod betyr i klartekst.
        </p>
        <input
          value={octalInput}
          onChange={(e) => setOctalInput(e.target.value.replace(/[^0-7]/g, "").slice(0, 3))}
          maxLength={3}
          className="font-mono text-2xl text-center w-32 bg-background border border-border rounded-md px-3 py-2"
          placeholder="755"
        />
        {reverseMode ? (
          <div className="mt-3 text-sm">
            <div className="font-mono">
              chmod {octalInput} → <span className="text-brand font-bold">{modeToSymbolic(reverseMode)}</span>
            </div>
            <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
              <li>Eier (u): {permToSymbolic(reverseMode.u)} ({permToOctal(reverseMode.u)})</li>
              <li>Gruppe (g): {permToSymbolic(reverseMode.g)} ({permToOctal(reverseMode.g)})</li>
              <li>Andre (o): {permToSymbolic(reverseMode.o)} ({permToOctal(reverseMode.o)})</li>
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            Skriv tre siffer 0–7.
          </p>
        )}
      </div>

      {/* Mode 3: symbolic chmod builder */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">C. Symbolsk chmod-bygger</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Start fra en initial-modus, anvend symbolsk chmod-token (f.eks. <code className="font-mono">u+x</code>,
          {" "}<code className="font-mono">go-w</code>, <code className="font-mono">a=r</code>). Komma-separer for flere.
        </p>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Start-modus (oktal)</label>
          <input
            value={modeToOctal(symBaseMode)}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-7]/g, "").slice(0, 3);
              if (v.length === 3) {
                setSymBaseMode({
                  u: octalToPerm(Number(v[0])),
                  g: octalToPerm(Number(v[1])),
                  o: octalToPerm(Number(v[2])),
                });
              }
            }}
            maxLength={3}
            className="font-mono text-lg w-24 bg-background border border-border rounded-md px-3 py-1.5"
          />
        </div>
        <div className="mt-3 space-y-2">
          <label className="text-xs text-muted-foreground">chmod-token(s), komma-separert</label>
          <input
            value={symInput}
            onChange={(e) => setSymInput(e.target.value)}
            className="font-mono text-sm w-full bg-background border border-border rounded-md px-3 py-2"
            placeholder="u+x, g-w, o=r"
          />
        </div>
        {symResultMode ? (
          <div className="mt-3 text-sm">
            <div className="font-mono">
              {modeToOctal(symBaseMode)} + <span className="text-brand">{symInput}</span> →{" "}
              <span className="text-brand font-bold">{modeToOctal(symResultMode)}</span> (
              <span className="font-bold">{modeToSymbolic(symResultMode)}</span>)
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            Sjekk syntaks: who (ugoa) + op (+, -, =) + perm (r/w/x).
          </p>
        )}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <div><code className="font-mono">u+x</code> — gi eier execute</div>
          <div><code className="font-mono">go-w</code> — fjern write fra gruppe og andre</div>
          <div><code className="font-mono">a=r</code> — alle har bare read</div>
        </div>
      </div>
    </div>
  );
}
