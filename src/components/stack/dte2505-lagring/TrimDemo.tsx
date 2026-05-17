import { useState } from "react";
import { File, Trash2, ShieldCheck, ShieldOff } from "lucide-react";

// ---------------------------------------------------------------------------
// TrimDemo — viser hva som skjer fysisk i NAND når OS sletter en fil.
//
// To kolonner: uten TRIM og med TRIM. I begge tilfeller sletter OS bare
// filsystem-pekerne, men i TRIM-tilfellet sender OS en TRIM-kommando som lar
// SSD-controlleren markere page-ene som "vet er ikke valid" — slik at neste
// garbage collection kan erase blocken uten å først flytte data som ikke
// trengs lenger.
// ---------------------------------------------------------------------------

type CellViz = {
  state: "empty" | "valid" | "stale-known" | "stale-unknown";
  file?: string;
};

const FILES = ["video.mp4", "doc.pdf", "img.jpg", "logs.txt"];

function initial(): CellViz[] {
  return [
    { state: "valid", file: "video.mp4" },
    { state: "valid", file: "video.mp4" },
    { state: "valid", file: "doc.pdf" },
    { state: "valid", file: "img.jpg" },
    { state: "valid", file: "logs.txt" },
    { state: "valid", file: "logs.txt" },
    { state: "empty" },
    { state: "empty" },
  ];
}

export function TrimDemo() {
  const [withoutTrim, setWithoutTrim] = useState<CellViz[]>(initial);
  const [withTrim, setWithTrim] = useState<CellViz[]>(initial);
  const [selected, setSelected] = useState<string>("video.mp4");

  function deleteFile() {
    // Uten TRIM: OS markerer filsystem-pekerne som ledige, men SSD vet ikke det.
    setWithoutTrim((prev) =>
      prev.map((c) => (c.file === selected ? { state: "stale-unknown", file: c.file } : c)),
    );
    // Med TRIM: OS sender også TRIM-kommando → SSD vet at pages kan ignoreres ved GC.
    setWithTrim((prev) =>
      prev.map((c) => (c.file === selected ? { state: "stale-known", file: c.file } : c)),
    );
  }

  function runGc() {
    setWithoutTrim((prev) => {
      // SSD ser bare valid + empty. Tror "stale-unknown" fortsatt er valid.
      // GC må flytte alt "stale-unknown" til ny block før erase.
      const next: CellViz[] = [];
      const toMove = prev.filter((c) => c.state === "valid" || c.state === "stale-unknown");
      for (const c of toMove) next.push({ ...c });
      while (next.length < 8) next.push({ state: "empty" });
      return next;
    });
    setWithTrim((prev) => {
      // SSD vet at "stale-known" er borte, flytter bare valid.
      const next: CellViz[] = [];
      const toMove = prev.filter((c) => c.state === "valid");
      for (const c of toMove) next.push({ ...c });
      while (next.length < 8) next.push({ state: "empty" });
      return next;
    });
  }

  function reset() {
    setWithoutTrim(initial());
    setWithTrim(initial());
  }

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card p-4">
      <div className="flex items-center flex-wrap gap-2 mb-4 text-sm">
        <span className="text-muted-foreground">Slett fil:</span>
        {FILES.map((f) => (
          <button
            key={f}
            onClick={() => setSelected(f)}
            className={`rounded-md border px-2.5 py-1 text-xs font-mono ${
              selected === f ? "border-brand bg-brand/10 text-brand" : "bg-card hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={deleteFile}
          className="ml-auto rounded-md bg-destructive/90 text-destructive-foreground px-3 py-1.5 text-sm hover:bg-destructive inline-flex items-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" /> Slett {selected}
        </button>
        <button
          onClick={runGc}
          className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          Kjør garbage collection
        </button>
        <button
          onClick={reset}
          className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          Nullstill
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CellGrid
          title="Uten TRIM"
          icon={<ShieldOff className="h-4 w-4 text-destructive" />}
          cells={withoutTrim}
          note="OS sier ifra til filsystemet om at filen er borte, men sender ingen besked til SSD-en. Cellene står merket som valid på fysisk nivå. Ved GC må controller flytte ALLE pages — også de som er filsystem-slettet — fordi den ikke vet at de er ledige."
        />
        <CellGrid
          title="Med TRIM"
          icon={<ShieldCheck className="h-4 w-4 text-success" />}
          cells={withTrim}
          note="OS sender også en TRIM-kommando til SSD: 'LBA X..Y er ikke i bruk mer'. Controller markerer pages som stale-known. Ved GC ignoreres de — ingen unødvendig flytting. Mindre write amplification, mindre slitasje."
        />
      </div>
    </div>
  );
}

function CellGrid({
  title,
  icon,
  cells,
  note,
}: {
  title: string;
  icon: React.ReactNode;
  cells: CellViz[];
  note: string;
}) {
  return (
    <div>
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      <div className="grid grid-cols-4 gap-1.5">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`aspect-square rounded-md border-2 p-1 flex flex-col items-center justify-center text-[10px] font-mono ${
              c.state === "empty"
                ? "border-muted bg-muted/30 text-muted-foreground"
                : c.state === "valid"
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : c.state === "stale-known"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 line-through"
                    : "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-400"
            }`}
            title={c.state}
          >
            {c.file ? <File className="h-3 w-3 mb-0.5" /> : null}
            <span className="text-center leading-tight">{c.file ?? "—"}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{note}</p>
    </div>
  );
}
