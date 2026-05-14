import { useEffect, useRef, useState } from "react";
import { Download, Upload, User, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  loadProgress,
  downloadProgressJson,
  importFromJson,
  levelFromXP,
  getExportFreshness,
  type Progress,
} from "@/lib/progress/storage";

// Profil/innlogging-knapp i headeren: JSON-fila er identiteten. Eksport laster
// ned snapshot, import skriver det inn i localStorage (= "logg inn"). Gul prikk
// hvis det er ulagrede løsninger (per getExportFreshness).
export function ProfileButton() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function refresh() {
    setProgress(loadProgress());
  }

  useEffect(() => {
    refresh();
    function onStorage(e: StorageEvent) {
      if (e.key === "sql-practice-progress-v1") refresh();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Re-evaluate freshness every time the popover opens (no extra polling cost).
  useEffect(() => {
    if (open) refresh();
  }, [open]);

  if (!progress) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 px-0" aria-label="Profil" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  const solved = Object.values(progress.attempts).filter((a) => a.solved).length;
  const lvl = levelFromXP(progress.xp);
  const fresh = getExportFreshness();

  function onExport() {
    downloadProgressJson();
    refresh();
    setMsg({ kind: "ok", text: "Eksportert. Behold fila trygt." });
    setTimeout(() => setMsg(null), 3500);
  }

  function onImportClick() {
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const existing = loadProgress();
    const existingSolved = Object.values(existing.attempts).filter((a) => a.solved).length;
    if (existingSolved > 0) {
      const ok = window.confirm(
        `Dette overskriver eksisterende fremgang (${existingSolved} løste oppgaver).\nFortsette?`,
      );
      if (!ok) return;
    }

    const text = await file.text();
    const result = importFromJson(text);
    if (result.ok) {
      refresh();
      setMsg({ kind: "ok", text: `Importert fra ${file.name}.` });
    } else {
      setMsg({ kind: "err", text: result.error });
    }
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 px-2 gap-1.5"
          aria-label="Profil og fremgang"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium tabular-nums">
            Nv {lvl}
          </span>
          {fresh.stale && (
            <span
              className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500"
              aria-label="Ulagret fremgang"
              title="Du har ulagret fremgang — eksporter for å sikre den"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Profil</div>
              <div className="text-[11px] text-muted-foreground">
                Lagres lokalt. Fila er din "innlogging".
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Zap className="h-3.5 w-3.5 text-brand" />
              <span className="tabular-nums">{progress.xp} XP</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Nivå" value={lvl.toString()} />
            <Stat label="Løst" value={solved.toString()} />
            <Stat label="Streak" value={progress.streak.toString()} />
          </div>

          <div className="rounded-md border border-border bg-muted/30 px-2.5 py-2 text-[11px] text-muted-foreground">
            {fresh.exportedAt == null ? (
              <>Ikke eksportert ennå. Last ned fila for å beholde fremgangen.</>
            ) : fresh.unsavedSolves > 0 ? (
              <>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {fresh.unsavedSolves} ulagret{fresh.unsavedSolves === 1 ? "" : "e"} løsning
                  {fresh.unsavedSolves === 1 ? "" : "er"}
                </span>{" "}
                siden siste eksport ({fresh.daysSince}d siden).
              </>
            ) : (
              <>Sist eksportert {fresh.daysSince === 0 ? "i dag" : `${fresh.daysSince}d siden`}.</>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={onExport} className="text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Eksporter
            </Button>
            <Button size="sm" variant="outline" onClick={onImportClick} className="text-xs">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Importer
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFileChange}
          />

          {msg && (
            <div
              className={`rounded-md border px-2.5 py-1.5 text-[11px] ${
                msg.kind === "ok"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}
