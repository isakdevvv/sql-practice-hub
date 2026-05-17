import { useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

/**
 * Avsluttende scenario-quiz.
 *
 * 8 reelle scenarier (database-write, sensor-polling, network-streaming, ...).
 * Brukeren matcher hvert scenario til riktig strategi-kombinasjon.
 *
 * For å unngå overpresisjon i fasit har vi 8 distinkte strategi-kombinasjoner
 * (én pr scenario), så det er en ren matching-quiz.
 */

type Scenario = {
  id: string;
  text: string;
  why: string;
  combo: string; // matcher en av COMBOS sin id
};

type Combo = {
  id: string;
  label: string;
};

const COMBOS: Combo[] = [
  {
    id: "intr+wb+cfq",
    label: "Interrupt + buffer cache (write-back) + CFQ",
  },
  {
    id: "dma+wt+none",
    label: "DMA + write-through + none/noop scheduler",
  },
  {
    id: "intr+nocache+sock",
    label: "Interrupt + ingen disk-cache + socket-kø (nett)",
  },
  {
    id: "poll+inline",
    label: "Polling (busy-wait) — kort latency-krav",
  },
  {
    id: "dma+wb+kyber",
    label: "DMA + write-back + Kyber (low-latency NVMe)",
  },
  {
    id: "intr+char",
    label: "Interrupt + character-device-driver",
  },
  {
    id: "dma+sstf",
    label: "DMA + SSTF — én hot prosess dominerer",
  },
  {
    id: "intr+scan",
    label: "Interrupt + SCAN (elevator) — RAID-controller",
  },
];

const SCENARIOS: Scenario[] = [
  {
    id: "db-write",
    text: "Database-write til SSD med ACID-krav: data MÅ være på disk før commit returnerer.",
    combo: "dma+wt+none",
    why:
      "Write-through fordi commit må vente på disk. DMA fordi DB-writes er store. none/noop fordi SSD har ingen seek og scheduler ville bare introdusere latency.",
  },
  {
    id: "sensor-poll",
    text: "Mikrokontroller-firmware leser temperatursensor hver 100 µs — overhead må være null.",
    combo: "poll+inline",
    why:
      "Polling er riktig når intervallet er så kort at en kontekstbytte til ISR ville koste mer enn busy-loopen.",
  },
  {
    id: "net-stream",
    text: "Streaming-server sender video over TCP — har egen flow control, ingen disk involvert.",
    combo: "intr+nocache+sock",
    why:
      "Nettverkskort signaliserer via interrupt. Ingen buffer cache i kjernen — det er sockets og send/recv-buffere. CFQ ville være meningsløst.",
  },
  {
    id: "kbd",
    text: "Tastaturdriver — én scancode kommer av gangen, sjelden og uforutsigbart.",
    combo: "intr+char",
    why:
      "Interrupt fordi event er sjeldent og uforutsigbart (polling ville sløse 99,99 %). Character-device fordi tastatur ikke har faste blokker.",
  },
  {
    id: "log-flush",
    text: "Web-server skriver access-loggen til disk — 1000 linjer/s, OK å miste 100 ms ved crash.",
    combo: "intr+wb+cfq",
    why:
      "Write-back gjør at log-writes batches i RAM og flushes asynkront — gir tap ved crash men enorm throughput. CFQ for rettferdig disk-deling mellom log og andre tråder.",
  },
  {
    id: "ml-train",
    text: "ML-treningsjobb leser TB av data fra NVMe — én prosess med hot path, ingen andre brukere.",
    combo: "dma+sstf",
    why:
      "DMA fordi blokkene er store. SSTF (eller deadline) når det er én prosess som dominerer — starvation er ikke et problem her.",
  },
  {
    id: "raid",
    text: "RAID-controller server flere disker for et server-rack — forutsigbar respons må holde.",
    combo: "intr+scan",
    why:
      "SCAN/elevator gir forutsigbar maks-latency og fungerer godt med mange paralelle requests fra ulike VMs. Interrupt-basert siden controllerens sin egen CPU er liten.",
  },
  {
    id: "nvme-app",
    text: "Moderne database på NVMe-flash i Linux 6.x — vil ha lavest mulig p99-latency.",
    combo: "dma+wb+kyber",
    why:
      "DMA fordi NVMe har dedicated DMA-engines. Write-back gir høyest throughput. Kyber er Linux' moderne low-latency scheduler designet for raske enheter.",
  },
];

type Placement = Record<string, string | null>; // scenarioId -> comboId

function shuffled<T>(arr: readonly T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) | 0;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ScenarioDragQuiz() {
  // Stokk combo-rekkefølgen så fasit ikke er åpenbar — én gang per mount.
  const [seed] = useState(() => Math.floor(Math.random() * 10_000));
  const comboOrder = useMemo(() => shuffled(COMBOS, seed), [seed]);

  const [placement, setPlacement] = useState<Placement>(() =>
    Object.fromEntries(SCENARIOS.map((s) => [s.id, null])),
  );
  const [checked, setChecked] = useState(false);

  function setChoice(scId: string, comboId: string | null) {
    setPlacement((p) => ({ ...p, [scId]: comboId }));
  }

  function reset() {
    setPlacement(Object.fromEntries(SCENARIOS.map((s) => [s.id, null])));
    setChecked(false);
  }

  const allFilled = Object.values(placement).every((v) => v !== null);
  const correctCount = SCENARIOS.filter(
    (s) => placement[s.id] === s.combo,
  ).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          Match scenario → strategi-kombinasjon (8 av 8)
        </div>
        <div className="flex items-center gap-2">
          {checked && (
            <div
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                correctCount === SCENARIOS.length
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              }`}
            >
              Riktig: {correctCount}/{SCENARIOS.length}
            </div>
          )}
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={!allFilled}
            className="text-xs px-2 py-1 rounded bg-brand text-brand-foreground disabled:opacity-50"
          >
            Sjekk
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {SCENARIOS.map((s, i) => {
          const choice = placement[s.id];
          const isCorrect = checked && choice === s.combo;
          const isWrong = checked && choice && choice !== s.combo;
          return (
            <div
              key={s.id}
              className={`rounded-lg border p-3 ${
                isCorrect
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : isWrong
                    ? "border-rose-500/50 bg-rose-500/5"
                    : "border-border bg-background"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-xs font-mono text-muted-foreground pt-0.5">
                  {i + 1}.
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{s.text}</div>
                  <div className="mt-2">
                    <select
                      value={choice ?? ""}
                      onChange={(e) =>
                        setChoice(s.id, e.target.value || null)
                      }
                      className="text-xs px-2 py-1 rounded border border-border bg-background w-full max-w-md"
                      disabled={checked && isCorrect}
                    >
                      <option value="">— velg strategi-kombinasjon —</option>
                      {comboOrder.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {checked && (
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <Check className="h-3 w-3" /> Riktig — {s.why}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300">
                          <X className="h-3 w-3" /> Riktig svar:{" "}
                          <em>{COMBOS.find((c) => c.id === s.combo)?.label}</em>
                          . {s.why}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
