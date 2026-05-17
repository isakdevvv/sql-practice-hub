import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, ChevronRight } from "lucide-react";

/**
 * Driver-stack — animert read()-syscall fra user-space ned til hardware.
 *
 * Brukeren ser pakken bevege seg lag for lag, og kan klikke ethvert lag
 * for å lese hva som faktisk skjer der. Bytt mellom HDD, SSD og NVMe
 * for å se hvordan kernel-laget abstraherer over ulike disk-typer.
 */

type DiskKind = "hdd" | "ssd" | "nvme";

const LAYERS = [
  {
    id: "user",
    name: "User-space",
    short: "fread(fp, buf, 4096)",
    detail:
      "Programmet kaller libc-funksjonen fread(). libc samler argumentene og legger dem i registre, deretter syscall-instruksjonen (int 0x80 / syscall) som flipper CPU-modus fra user (ring 3) til kernel (ring 0).",
  },
  {
    id: "syscall",
    name: "Syscall-grensesnitt",
    short: "sys_read(fd, buf, 4096)",
    detail:
      "Kernel-entry. Argumentene valideres (fd lovlig? buf peker inn i prosessens adresserom?). Sender saken videre til VFS basert på fd → file struct.",
  },
  {
    id: "vfs",
    name: "VFS (Virtual File System)",
    short: "vfs_read → file->f_op->read",
    detail:
      "Felles abstraksjon: alle filsystemer (ext4, btrfs, NFS, /proc, tmpfs ...) implementerer samme funksjonstabell. VFS dispatcher til riktig fs sin read-funksjon.",
  },
  {
    id: "fs",
    name: "Filsystem (f.eks. ext4)",
    short: "ext4_file_read → page cache",
    detail:
      "Slår opp inode, oversetter fil-offset til diskblokk-nummer via extents/indirect blocks. Sjekker først page cache i RAM — hit returnerer rett tilbake. Miss → request mot block layer.",
  },
  {
    id: "block",
    name: "Block layer",
    short: "submit_bio() → I/O-kø",
    detail:
      "Generisk block-I/O-lag. Pakker request i en bio-struct, legger den i en I/O-kø, kjører scheduler (CFQ/BFQ/Kyber/none) for å sortere/koalese forespørsler.",
  },
  {
    id: "driver",
    name: "Device driver",
    short: "scsi/nvme/ahci-driver",
    detail:
      "Driveren oversetter generisk block-request til kommando-format som hardwarens controller forstår (SCSI CDB, NVMe SQE, ATA-kommando). Skriver kommandoen i controllerens kommando-register eller submission queue.",
  },
  {
    id: "controller",
    name: "Controller (HBA)",
    short: "DMA-engine + hardware-kø",
    detail:
      "Controlleren leser kommandoen, setter opp DMA-overføring direkte mot RAM (uten å bry CPU), snakker bus-protokollen (SATA/SAS/PCIe) ned mot den fysiske enheten.",
  },
  {
    id: "hw",
    name: "Hardware",
    short: "Magnetisk platte / NAND / 3D-NAND",
    detail:
      "Den fysiske enheten utfører selve fysikken: roterende platte med arm (HDD), elektroner i flytende gate (SSD/NVMe). Returnerer data via DMA → controller → interrupt opp til CPU.",
  },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

const DISK_VARIANTS: Record<
  DiskKind,
  { label: string; controller: string; hw: string; latency: string }
> = {
  hdd: {
    label: "HDD (7200 rpm)",
    controller: "SATA AHCI · én I/O-kø, 32 entries",
    hw: "Roterende platte · arm seeker (~5 ms) · platte roterer (~4 ms)",
    latency: "~10 ms per random read",
  },
  ssd: {
    label: "SSD (SATA)",
    controller: "SATA AHCI · samme driver-kø som HDD",
    hw: "NAND flash · ingen seek · garbage collector i bakgrunnen",
    latency: "~0.1 ms per random read",
  },
  nvme: {
    label: "NVMe (PCIe)",
    controller: "NVMe · 64 K kø-par, hver med 64 K entries",
    hw: "PCIe direkte mot CPU · ingen SATA-flaskehals",
    latency: "~20 µs per random read",
  },
};

export function DriverStackFlow() {
  const [diskKind, setDiskKind] = useState<DiskKind>("ssd");
  const [step, setStep] = useState(0); // 0..LAYERS.length-1
  const [playing, setPlaying] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<LayerId | null>("user");

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      setStep((s) => {
        if (s >= LAYERS.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => clearTimeout(t);
  }, [playing, step]);

  function reset() {
    setStep(0);
    setPlaying(false);
    setSelectedLayer("user");
  }

  const variant = DISK_VARIANTS[diskKind];
  const sel = LAYERS.find((l) => l.id === selectedLayer) ?? LAYERS[0];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="text-xs uppercase tracking-wider text-brand font-semibold">
          read() · fra user-space til hardware og tilbake
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            {(["hdd", "ssd", "nvme"] as DiskKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setDiskKind(k)}
                className={`px-2 py-1 ${
                  diskKind === k
                    ? "bg-brand text-brand-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            {playing ? (
              <>
                <Pause className="h-3 w-3" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> Spill
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setStep((s) => Math.min(LAYERS.length - 1, s + 1))
            }
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:bg-muted"
          >
            Neste <ChevronRight className="h-3 w-3" />
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4">
        {/* Layer stack */}
        <div className="space-y-1.5">
          {LAYERS.map((layer, i) => {
            const isCurrent = i === step;
            const isPassed = i < step;
            const isSelected = layer.id === selectedLayer;
            const labelOverride =
              layer.id === "controller"
                ? variant.controller
                : layer.id === "hw"
                  ? variant.hw
                  : layer.short;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setSelectedLayer(layer.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 transition-all flex items-center gap-3 ${
                  isCurrent
                    ? "border-brand bg-brand/10 ring-2 ring-brand/30"
                    : isPassed
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-border bg-background hover:border-brand/40"
                } ${isSelected ? "ring-2 ring-brand/20" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full grid place-items-center text-[10px] font-mono shrink-0 ${
                    isCurrent
                      ? "bg-brand text-brand-foreground"
                      : isPassed
                        ? "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{layer.name}</div>
                  <div className="text-[10.5px] text-muted-foreground font-mono truncate">
                    {labelOverride}
                  </div>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-brand font-semibold">
                    AKTIV
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Lag {LAYERS.findIndex((l) => l.id === sel.id) + 1} av {LAYERS.length}
          </div>
          <div className="text-base font-semibold mb-2">{sel.name}</div>
          <div className="text-xs font-mono bg-muted/60 rounded px-2 py-1 inline-block mb-3">
            {sel.id === "controller"
              ? variant.controller
              : sel.id === "hw"
                ? variant.hw
                : sel.short}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {sel.detail}
          </p>
          {(sel.id === "controller" || sel.id === "hw") && (
            <div className="mt-3 text-[11px] rounded border border-brand/30 bg-brand/5 px-3 py-2">
              <strong>{variant.label}:</strong> {variant.latency}.
              {sel.id === "hw" && (
                <>
                  {" "}
                  Samme kernel-stack over — bare driver+controller+hw varierer.
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-[11px] text-muted-foreground">
        <strong>Hvorfor abstraksjon:</strong> all kernel-kode over driveren er
        identisk uansett om disken er HDD, SSD eller NVMe. Bytter du disk, må
        bare driveren endres. Det er denne "smale midjen" som lar Linux støtte
        tusenvis av enhetstyper med samme syscall-grensesnitt.
      </div>
    </div>
  );
}
