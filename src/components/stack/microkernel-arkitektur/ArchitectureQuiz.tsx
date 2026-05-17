import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

type ArchAnswer = "mono" | "micro";

type Claim = {
  id: string;
  text: string;
  answer: ArchAnswer;
  explanation: string;
};

const CLAIMS: Claim[] = [
  {
    id: "posix",
    text: "Bruker «POSIX-personality» som en user-space server slik at samme kjerne kan kjøre Linux- og BSD-applikasjoner side om side.",
    answer: "micro",
    explanation:
      "Personalities (kjent fra Mach/L4 og GNU Hurd) ligger som vanlige user-space-prosesser på toppen av en minimal kjerne. Monolittiske kjerner binder ABI-en hardt inn i kjernen.",
  },
  {
    id: "mach",
    text: "Mach 3.0 fra Carnegie Mellon var en av de første store referansene for denne arkitekturen.",
    answer: "micro",
    explanation:
      "Mach er stamfar til microkernel-tradisjonen og leverte port-basert IPC + ekstern minne-styring til user-space servere.",
  },
  {
    id: "ipc-cost",
    text: "Hver tjenestekall fra et brukerprogram krever som regel bare ÉN user→kernel-transisjon, fordi alle drivere bor i samme adresserom.",
    answer: "mono",
    explanation:
      "Når drivere/FS/nettverk er kompilert inn i kjernen blir tjenester nådd via direkte funksjonscall — ingen ekstra IPC-runde per subsystem.",
  },
  {
    id: "fault-iso",
    text: "Hvis disk-driveren krasjer, dør bare driver-prosessen, og scheduler/IPC kan starte den på nytt mens resten av OS-et lever videre.",
    answer: "micro",
    explanation:
      "Fault-isolation er hovedløftet til microkernel-arkitekturen (MINIX 3, QNX). I monolitt blir samme krasj til kernel panic.",
  },
  {
    id: "complexity",
    text: "Lavere kompleksitet å vedlikeholde fordi koden ikke trenger å sjonglere asynkrone meldinger mellom isolerte servere for hver eneste filoperasjon.",
    answer: "mono",
    explanation:
      "Monolitter har mer kode i kernel space, men færre bevegelige deler i selve forespørsels-flyten. Microkernel trekker kompleksiteten ut i IPC og protokoller mellom servere.",
  },
];

const SHUFFLED_IDS = CLAIMS.map((c) => c.id);

type Placement = Record<string, ArchAnswer | null>;

export function ArchitectureQuiz() {
  const [placement, setPlacement] = useState<Placement>(() =>
    Object.fromEntries(SHUFFLED_IDS.map((id) => [id, null])) as Placement
  );
  const [checked, setChecked] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);

  const palette = useMemo(
    () => SHUFFLED_IDS.filter((id) => placement[id] === null),
    [placement]
  );

  function place(id: string, target: ArchAnswer) {
    setPlacement((p) => ({ ...p, [id]: target }));
    setDragged(null);
  }

  function unplace(id: string) {
    setPlacement((p) => ({ ...p, [id]: null }));
  }

  function reset() {
    setPlacement(Object.fromEntries(SHUFFLED_IDS.map((id) => [id, null])) as Placement);
    setChecked(false);
  }

  const correctCount = useMemo(
    () =>
      CLAIMS.filter((c) => placement[c.id] !== null && placement[c.id] === c.answer)
        .length,
    [placement]
  );
  const allPlaced = palette.length === 0;
  const allCorrect = correctCount === CLAIMS.length;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Avsluttende drag-quiz</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dra hver påstand til arkitekturen den passer best. Trykk{" "}
            <em>Sjekk</em> når alle fem er plassert.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border text-xs hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill
        </button>
      </div>

      {/* Palett */}
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 min-h-[80px]">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Påstander å plassere ({palette.length} igjen)
        </div>
        <div className="flex flex-wrap gap-2">
          {palette.length === 0 && (
            <div className="text-xs text-muted-foreground italic">
              Alle plassert. Trykk Sjekk under.
            </div>
          )}
          {palette.map((id) => {
            const c = CLAIMS.find((cc) => cc.id === id)!;
            return (
              <button
                key={id}
                type="button"
                draggable
                onDragStart={() => setDragged(id)}
                onDragEnd={() => setDragged(null)}
                className={`text-left text-xs px-3 py-2 rounded border bg-card hover:bg-muted cursor-move max-w-[420px] ${
                  dragged === id ? "opacity-50" : ""
                }`}
              >
                {c.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* To dropp-soner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DropZone
          arch="mono"
          label="Monolittisk kernel"
          claims={CLAIMS.filter((c) => placement[c.id] === "mono")}
          checked={checked}
          onDrop={() => dragged && place(dragged, "mono")}
          onUnplace={unplace}
        />
        <DropZone
          arch="micro"
          label="Microkernel"
          claims={CLAIMS.filter((c) => placement[c.id] === "micro")}
          checked={checked}
          onDrop={() => dragged && place(dragged, "micro")}
          onUnplace={unplace}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {checked ? (
            <span>
              {correctCount} / {CLAIMS.length} riktig.{" "}
              {allCorrect && <span className="text-emerald-500 font-semibold">Perfekt!</span>}
            </span>
          ) : allPlaced ? (
            <span>Klar til å sjekke.</span>
          ) : (
            <span>Dra alle fem først.</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!allPlaced}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-3.5 w-3.5" />
          Sjekk
        </button>
      </div>

      {checked && (
        <div className="space-y-2 pt-1">
          {CLAIMS.map((c) => {
            const placed = placement[c.id];
            const ok = placed === c.answer;
            return (
              <div
                key={c.id}
                className={`rounded border px-3 py-2 text-xs flex items-start gap-2 ${
                  ok
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-red-500/40 bg-red-500/5"
                }`}
              >
                {ok ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="font-medium text-foreground">{c.text}</div>
                  <div className="text-muted-foreground mt-0.5">
                    Riktig: <span className="font-semibold">{c.answer === "mono" ? "monolittisk" : "microkernel"}</span>
                    {" — "}
                    {c.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DropZone({
  arch,
  label,
  claims,
  checked,
  onDrop,
  onUnplace,
}: {
  arch: ArchAnswer;
  label: string;
  claims: Claim[];
  checked: boolean;
  onDrop: () => void;
  onUnplace: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        onDrop();
      }}
      className={`rounded-md border-2 border-dashed p-3 min-h-[140px] transition-colors ${
        hover
          ? "border-brand bg-brand/5"
          : arch === "mono"
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-cyan-500/40 bg-cyan-500/5"
      }`}
    >
      <div className="text-xs font-semibold mb-2">{label}</div>
      {claims.length === 0 && (
        <div className="text-[11px] text-muted-foreground italic">
          Slipp påstander her.
        </div>
      )}
      <div className="space-y-1.5">
        {claims.map((c) => {
          const ok = c.answer === arch;
          const badgeStyle = checked
            ? ok
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-red-500/50 bg-red-500/10"
            : "border-border bg-card";
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => !checked && onUnplace(c.id)}
              className={`text-left text-xs px-2.5 py-1.5 rounded border w-full ${badgeStyle} ${
                checked ? "cursor-default" : "hover:bg-muted cursor-pointer"
              }`}
              title={checked ? undefined : "Klikk for å sende tilbake til paletten"}
            >
              {c.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
