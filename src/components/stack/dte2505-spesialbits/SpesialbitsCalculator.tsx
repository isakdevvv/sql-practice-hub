import { useMemo, useState } from "react";

// Interaktiv 12-bits permission-builder for setuid/setgid/sticky + rwx for u/g/o.
//
// Output:
// - 4-sifret oktal-streng (chmod NNNN fil)
// - 9-tegns rwx-streng med s/S/t/T-substitusjon
// - Komplett ls -l-linje (type-tegn foran avhengig av om "katalog"-toggle er på)

type Bit = boolean;
type Perm = { r: Bit; w: Bit; x: Bit };
type Mode = {
  setuid: Bit;
  setgid: Bit;
  sticky: Bit;
  u: Perm;
  g: Perm;
  o: Perm;
};

function permToOctal(p: Perm): number {
  return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
}

function specialToOctal(m: Mode): number {
  return (m.setuid ? 4 : 0) + (m.setgid ? 2 : 0) + (m.sticky ? 1 : 0);
}

/**
 * Generer rwx-strengen (9 tegn) gitt mode-bits.
 * - setuid skifter eier-x: x→s, -→S
 * - setgid skifter gruppe-x: x→s, -→S
 * - sticky skifter andre-x: x→t, -→T
 */
export function modeToRwxString(m: Mode): string {
  const userX = m.setuid ? (m.u.x ? "s" : "S") : m.u.x ? "x" : "-";
  const groupX = m.setgid ? (m.g.x ? "s" : "S") : m.g.x ? "x" : "-";
  const otherX = m.sticky ? (m.o.x ? "t" : "T") : m.o.x ? "x" : "-";
  return (
    (m.u.r ? "r" : "-") +
    (m.u.w ? "w" : "-") +
    userX +
    (m.g.r ? "r" : "-") +
    (m.g.w ? "w" : "-") +
    groupX +
    (m.o.r ? "r" : "-") +
    (m.o.w ? "w" : "-") +
    otherX
  );
}

export function modeToOctal4(m: Mode): string {
  return `${specialToOctal(m)}${permToOctal(m.u)}${permToOctal(m.g)}${permToOctal(m.o)}`;
}

type Preset = {
  label: string;
  desc: string;
  mode: Mode;
  isDir: boolean;
  fileLabel: string;
};

const PRESETS: Preset[] = [
  {
    label: "/usr/bin/passwd",
    desc: "Setuid-root: vanlige brukere kan endre sitt eget passord (skrive til /etc/shadow).",
    mode: {
      setuid: true,
      setgid: false,
      sticky: false,
      u: { r: true, w: true, x: true },
      g: { r: true, w: false, x: true },
      o: { r: true, w: false, x: true },
    },
    isDir: false,
    fileLabel: "/usr/bin/passwd",
  },
  {
    label: "/tmp",
    desc: "Sticky: alle kan skrive, men bare eier kan slette sine egne filer.",
    mode: {
      setuid: false,
      setgid: false,
      sticky: true,
      u: { r: true, w: true, x: true },
      g: { r: true, w: true, x: true },
      o: { r: true, w: true, x: true },
    },
    isDir: true,
    fileLabel: "/tmp",
  },
  {
    label: "/srv/teamdata",
    desc: "Setgid-katalog: nye filer arver gruppen til katalogen (delt team-mappe).",
    mode: {
      setuid: false,
      setgid: true,
      sticky: false,
      u: { r: true, w: true, x: true },
      g: { r: true, w: true, x: true },
      o: { r: true, w: false, x: true },
    },
    isDir: true,
    fileLabel: "/srv/teamdata",
  },
  {
    label: "Vanlig binær (755)",
    desc: "Ingen spesialbits — kjører som den som starter den.",
    mode: {
      setuid: false,
      setgid: false,
      sticky: false,
      u: { r: true, w: true, x: true },
      g: { r: true, w: false, x: true },
      o: { r: true, w: false, x: true },
    },
    isDir: false,
    fileLabel: "./script.sh",
  },
];

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

function SpecialToggle({
  name,
  on,
  onToggle,
  hint,
}: {
  name: string;
  on: boolean;
  onToggle: () => void;
  hint: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
        on
          ? "border-brand bg-brand/10"
          : "border-border bg-card hover:border-brand/40"
      }`}
      aria-pressed={on}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-sm border ${
            on ? "bg-brand border-brand" : "border-border"
          }`}
        />
        <span className="font-mono text-sm font-semibold">{name}</span>
      </div>
      <span className="text-[11px] text-muted-foreground leading-tight">{hint}</span>
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
      <div className="ml-3 font-mono text-xs text-muted-foreground">
        oktal: <span className="text-brand font-bold">{permToOctal(perm)}</span>
      </div>
    </div>
  );
}

export function SpesialbitsCalculator() {
  const [mode, setMode] = useState<Mode>(PRESETS[0].mode);
  const [isDir, setIsDir] = useState(PRESETS[0].isDir);
  const [fileLabel, setFileLabel] = useState(PRESETS[0].fileLabel);
  const [presetIdx, setPresetIdx] = useState(0);

  const rwx = modeToRwxString(mode);
  const oct = modeToOctal4(mode);

  const lsLine = useMemo(() => {
    const typeChar = isDir ? "d" : "-";
    const owner = isDir ? "root" : mode.setuid ? "root" : "isak";
    const group = mode.setgid && isDir ? "developers" : "users";
    const size = isDir ? "4096" : "59976";
    return `${typeChar}${rwx} 1 ${owner} ${group} ${size} mai 15 09:42 ${fileLabel}`;
  }, [rwx, isDir, mode.setuid, mode.setgid, fileLabel]);

  const meaning = useMemo(() => {
    const parts: string[] = [];
    if (mode.setuid) {
      parts.push(
        mode.u.x
          ? "setuid + eier-x: binæren kjører som EIER (typisk root) for alle som starter den."
          : "setuid uten eier-x: stor S — bit er satt, men fila er ikke kjørbar. Sjelden meningsfullt.",
      );
    }
    if (mode.setgid) {
      if (isDir) {
        parts.push(
          "setgid på katalog: nye filer i katalogen arver katalogens gruppe (ikke skaperens primær-gruppe).",
        );
      } else {
        parts.push(
          mode.g.x
            ? "setgid på binær: prosessen får filgruppens rettigheter ved kjøring."
            : "setgid uten gruppe-x: stor S — bit satt, men ikke kjørbar.",
        );
      }
    }
    if (mode.sticky) {
      if (isDir) {
        parts.push(
          "sticky på katalog: bare EIER av en fil (eller root) kan slette/rename den, selv om andre har w på katalogen. Som /tmp.",
        );
      } else {
        parts.push("sticky på fil: ignorert på Linux i moderne kerneler.");
      }
    }
    if (parts.length === 0) return "Ingen spesialbits — standard rwx-semantikk.";
    return parts.join(" ");
  }, [mode, isDir]);

  function applyPreset(idx: number) {
    setPresetIdx(idx);
    setMode(PRESETS[idx].mode);
    setIsDir(PRESETS[idx].isDir);
    setFileLabel(PRESETS[idx].fileLabel);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Bygg modus — alle 12 bits</h3>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Spesialbits (foran de tre vanlige siffrene)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <SpecialToggle
              name="setuid (4)"
              on={mode.setuid}
              onToggle={() => setMode({ ...mode, setuid: !mode.setuid })}
              hint="Fil: kjør som eier. Vises som s/S i eier-x."
            />
            <SpecialToggle
              name="setgid (2)"
              on={mode.setgid}
              onToggle={() => setMode({ ...mode, setgid: !mode.setgid })}
              hint="Dir: arve gruppe. Vises som s/S i gruppe-x."
            />
            <SpecialToggle
              name="sticky (1)"
              on={mode.sticky}
              onToggle={() => setMode({ ...mode, sticky: !mode.sticky })}
              hint="Dir: bare eier sletter. Vises som t/T i andre-x."
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            rwx for u/g/o
          </div>
          <div className="space-y-2.5">
            <PermRow who="u" perm={mode.u} onChange={(p) => setMode({ ...mode, u: p })} />
            <PermRow who="g" perm={mode.g} onChange={(p) => setMode({ ...mode, g: p })} />
            <PermRow who="o" perm={mode.o} onChange={(p) => setMode({ ...mode, o: p })} />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDir}
              onChange={(e) => setIsDir(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            <span>Katalog (endrer type-tegn i ls -l og semantikk)</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground mb-1">4-sifret oktal</div>
            <div className="font-mono text-2xl text-brand font-bold">{oct}</div>
            <div className="mt-1 text-xs text-muted-foreground font-mono">chmod {oct} {fileLabel}</div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs text-muted-foreground mb-1">9-tegns rwx-streng</div>
            <div className="font-mono text-lg text-brand font-bold">{rwx}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {isDir ? "d" : "-"} foran i ls -l. s/S = setuid/setgid; t/T = sticky.
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-dashed border-border p-3 bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Slik dukker det opp i ls -l</div>
          <pre className="font-mono text-xs whitespace-pre overflow-x-auto">{lsLine}</pre>
        </div>

        <div className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3 text-sm">
          <strong className="text-brand">Tolkning: </strong>
          <span className="text-muted-foreground">{meaning}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Hopp rett til et klassisk eksempel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                presetIdx === i
                  ? "border-brand bg-brand/10"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              <div className="font-mono text-sm font-semibold">{p.label}</div>
              <div className="text-xs text-muted-foreground leading-tight">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
