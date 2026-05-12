import { useMemo, useState } from "react";

export function UmaskCalculator() {
  const [umaskStr, setUmaskStr] = useState("022");
  const [target, setTarget] = useState<"file" | "dir">("file");

  const result = useMemo(() => {
    if (!/^[0-7]{3}$/.test(umaskStr)) return null;
    const umaskVal = parseInt(umaskStr, 8);
    const base = target === "file" ? 0o666 : 0o777;
    const perm = base & ~umaskVal;
    const oct = perm.toString(8).padStart(3, "0");
    const sym = oct
      .split("")
      .map((d) => {
        const n = Number(d);
        return `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;
      })
      .join("");
    return { oct, sym, base: base.toString(8) };
  }, [umaskStr, target]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold mb-3">umask — hva får nye filer?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        umask trekkes FRA grunn-rettigheten på en ny fil/katalog. Filer starter på{" "}
        <code className="font-mono">666</code> (rw-rw-rw-), kataloger på{" "}
        <code className="font-mono">777</code>. Bare det som ikke står i umask blir gitt.
      </p>
      <div className="flex items-end gap-3 mb-3 flex-wrap">
        <div>
          <label className="text-xs text-muted-foreground">umask</label>
          <input
            value={umaskStr}
            onChange={(e) => setUmaskStr(e.target.value.replace(/[^0-7]/g, "").slice(0, 3))}
            maxLength={3}
            className="block font-mono text-lg w-24 bg-background border border-border rounded-md px-3 py-1.5"
          />
        </div>
        <div className="flex gap-1 text-sm">
          <button
            onClick={() => setTarget("file")}
            className={`px-3 py-1.5 rounded-md border ${target === "file" ? "bg-brand text-brand-foreground border-brand" : "border-border"}`}
          >
            Fil (base 666)
          </button>
          <button
            onClick={() => setTarget("dir")}
            className={`px-3 py-1.5 rounded-md border ${target === "dir" ? "bg-brand text-brand-foreground border-brand" : "border-border"}`}
          >
            Katalog (base 777)
          </button>
        </div>
      </div>
      {result ? (
        <div className="rounded-lg border border-dashed border-border p-3 bg-muted/30 text-sm">
          <div className="font-mono">
            {result.base} <span className="text-muted-foreground">&amp; ~{umaskStr}</span> ={" "}
            <span className="text-brand font-bold">{result.oct}</span> ({result.sym})
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Eks: <code className="font-mono">touch ny.txt</code> → rettighet {result.oct}
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-600 dark:text-amber-400">Skriv tre oktale siffer 0–7.</p>
      )}
      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md border border-border p-2">
          <div className="font-mono text-brand">022</div>
          <div className="text-muted-foreground">Standard. Filer 644, kataloger 755.</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="font-mono text-brand">002</div>
          <div className="text-muted-foreground">Team-server. Gruppe får write også.</div>
        </div>
        <div className="rounded-md border border-border p-2">
          <div className="font-mono text-brand">077</div>
          <div className="text-muted-foreground">Privat. Bare eier får tilgang.</div>
        </div>
      </div>
    </div>
  );
}
