import { useState } from "react";
import { Compass, Keyboard, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { LESS_KEYS, DOC_DIRS } from "@/lib/dte2505/hjelpesystemerData";

// ---------------------------------------------------------------------------
// Tre små oversikter som hører til lær-delen:
//   1. VerktoyVelger — «hva vet du?» avgjør hvilket verktøy du skal ta.
//   2. LessTaster    — tastene du trenger når du først er inne i en side.
//   3. SisteUtvei    — /usr/share/doc, når alt annet er tomt.
// ---------------------------------------------------------------------------

const SITUATIONS = [
  {
    know: "Jeg kjenner navnet og vil lese alt",
    tool: "man NAVN",
    detail:
      "Full manualside i søkeleseren. Legg til seksjonsnummer foran navnet hvis du vet at navnet finnes flere steder: man 5 passwd.",
    color: "border-sky-500/60 bg-sky-500/5",
  },
  {
    know: "Jeg kjenner navnet, men vil bare vite hva det er",
    tool: "whatis NAVN",
    detail: "Én linje per seksjon navnet finnes i. Identisk med man -f. Krever eksakt navn.",
    color: "border-violet-500/60 bg-violet-500/5",
  },
  {
    know: "Jeg vet hva jeg vil oppnå, men ikke hva det heter",
    tool: "apropos ORD",
    detail:
      "Fritekstsøk i navn og beskrivelser for alle sider. Identisk med man -k. Husk at beskrivelsene er på engelsk.",
    color: "border-emerald-500/60 bg-emerald-500/5",
  },
  {
    know: "Jeg trenger bare å se flaggene, raskt",
    tool: "KOMMANDO --help",
    detail:
      "Programmets egen korte bruksanvisning, rett i terminalen. Finnes ikke alltid — eldre verktøy svarer med «ukjent opsjon».",
    color: "border-amber-500/60 bg-amber-500/5",
  },
  {
    know: "Jeg vil lære pakken skikkelig, ikke slå opp",
    tool: "info PAKKE",
    detail:
      "GNU sitt eget dokumentasjonssystem: kapittelinndelte noder du navigerer i med Tab, Enter og u. Skrevet for å leses fra start.",
    color: "border-teal-500/60 bg-teal-500/5",
  },
  {
    know: "Jeg lurer på hvor kommandoen bor",
    tool: "type NAVN",
    detail:
      "Sier om det er et program (med bane), et alias, et reservert ord eller innebygd i skallet. which gir bare banen, og finner aldri innebygde. whereis gir program + kildekode + manualside.",
    color: "border-fuchsia-500/60 bg-fuchsia-500/5",
  },
];

export function VerktoyVelger() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Compass className="h-4 w-4 text-brand" /> Hvilket verktøy?
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Valget avhenger ikke av hva du leter etter, men av <em>hva du allerede vet</em>. Trykk på
        situasjonen din.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {SITUATIONS.map((s, i) => (
          <button
            key={s.tool}
            onClick={() => setOpen(open === i ? null : i)}
            className={cn(
              "rounded-lg border-2 p-3 text-left transition-all",
              s.color,
              open === i ? "ring-2 ring-brand/40" : "hover:brightness-105",
            )}
          >
            <div className="text-xs text-muted-foreground">{s.know}</div>
            <div className="mt-1 font-mono text-sm font-semibold">{s.tool}</div>
            {open === i && <p className="mt-2 border-t pt-2 text-xs leading-relaxed">{s.detail}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LessTaster() {
  const [active, setActive] = useState<string | null>(null);
  const item = LESS_KEYS.find((k) => k.key === active);
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Keyboard className="h-4 w-4 text-brand" /> Inne i manualsiden
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        man viser ikke siden selv — den sender den videre til søkeleseren <code className="font-mono">less</code>.
        Tastene under er derfor less sine, og virker like godt når du blar i en loggfil.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {LESS_KEYS.map((k) => (
          <button
            key={k.key}
            onClick={() => setActive(active === k.key ? null : k.key)}
            className={cn(
              "rounded-md border-2 px-2.5 py-1.5 font-mono text-xs shadow-[0_2px_0_0] shadow-border hover:bg-accent",
              active === k.key && "border-brand bg-brand/10",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className="mt-3 min-h-[2.5rem] rounded-lg border bg-muted/30 p-2.5 text-xs leading-relaxed">
        {item ? (
          <>
            <span className="font-mono font-semibold">{item.label}</span> — {item.what}
          </>
        ) : (
          <span className="text-muted-foreground">Trykk på en tast for å se hva den gjør.</span>
        )}
      </div>
    </div>
  );
}

export function SisteUtvei() {
  const [pkg, setPkg] = useState(DOC_DIRS[1].pkg);
  const files = DOC_DIRS.find((d) => d.pkg === pkg)!.files;
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <FolderOpen className="h-4 w-4 text-brand" /> Siste utvei: /usr/share/doc
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Når manualsiden er tynn og <code className="font-mono">--help</code> ikke hjelper: hver pakke
        får legge egne filer her. Ofte er det eneste stedet et fungerende eksempeloppsett finnes.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {DOC_DIRS.map((d) => (
          <button
            key={d.pkg}
            onClick={() => setPkg(d.pkg)}
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-xs hover:bg-accent",
              pkg === d.pkg && "border-brand bg-brand/10",
            )}
          >
            {d.pkg}
          </button>
        ))}
      </div>
      <div className="mt-2 rounded-lg border bg-muted/30 p-2.5 font-mono text-xs">
        <div className="text-muted-foreground">/usr/share/doc/{pkg}/</div>
        <div className="mt-1 grid gap-0.5 sm:grid-cols-2">
          {files.map((f) => (
            <div key={f}>├── {f}</div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Mange av filene er komprimert (endelsen <code className="font-mono">.gz</code>). Les dem med{" "}
        <code className="font-mono">zless</code> eller <code className="font-mono">zcat</code> i stedet
        for less og cat.
      </p>
    </div>
  );
}
