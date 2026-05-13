import { useMemo, useState } from "react";
import { Tex } from "@/components/Tex";

type TLBEntry = {
  vpn: number;
  pfn: number;
  valid: boolean;
};

type PTEntry = {
  vpn: number;
  pfn: number;
  valid: boolean;
};

type Preset = {
  label: string;
  vaBits: number;
  pageBits: number;
  pageTable: PTEntry[];
  tlb: TLBEntry[];
  /** Default virtual address (decimal) */
  virtual: number;
  note: string;
};

const PRESETS: Preset[] = [
  {
    label: "Liten 16-bit space, TLB-hit",
    vaBits: 16,
    pageBits: 12,
    pageTable: [
      { vpn: 0, pfn: 5, valid: true },
      { vpn: 1, pfn: 2, valid: true },
      { vpn: 2, pfn: 7, valid: true },
      { vpn: 3, pfn: 0, valid: false },
      { vpn: 4, pfn: 4, valid: true },
      { vpn: 5, pfn: 6, valid: true },
      { vpn: 6, pfn: 1, valid: true },
      { vpn: 7, pfn: 3, valid: true },
      { vpn: 8, pfn: 9, valid: true },
      { vpn: 9, pfn: 11, valid: true },
      { vpn: 10, pfn: 8, valid: true },
      { vpn: 11, pfn: 12, valid: true },
      { vpn: 12, pfn: 14, valid: true },
      { vpn: 13, pfn: 15, valid: true },
      { vpn: 14, pfn: 10, valid: true },
      { vpn: 15, pfn: 13, valid: true },
    ],
    tlb: [
      { vpn: 2, pfn: 7, valid: true },
      { vpn: 5, pfn: 6, valid: true },
      { vpn: 9, pfn: 11, valid: true },
    ],
    virtual: 0x2123, // VPN=2 → TLB-hit
    note: "Virtuell adresse 0x2123 — VPN=2 finnes i TLB → cache-hit, ingen page-tabell-oppslag.",
  },
  {
    label: "TLB-miss, men i page-tabell",
    vaBits: 16,
    pageBits: 12,
    pageTable: [
      { vpn: 0, pfn: 5, valid: true },
      { vpn: 1, pfn: 2, valid: true },
      { vpn: 2, pfn: 7, valid: true },
      { vpn: 3, pfn: 0, valid: false },
      { vpn: 4, pfn: 4, valid: true },
      { vpn: 5, pfn: 6, valid: true },
      { vpn: 6, pfn: 1, valid: true },
      { vpn: 7, pfn: 3, valid: true },
      { vpn: 8, pfn: 9, valid: true },
      { vpn: 9, pfn: 11, valid: true },
    ],
    tlb: [
      { vpn: 2, pfn: 7, valid: true },
      { vpn: 5, pfn: 6, valid: true },
    ],
    virtual: 0x7045, // VPN=7 → TLB-miss → page-table-hit
    note: "VPN=7 ikke i TLB, men gyldig i page-tabellen. To minneaksesser: PT-oppslag + faktisk data.",
  },
  {
    label: "Page fault (ugyldig PTE)",
    vaBits: 16,
    pageBits: 12,
    pageTable: [
      { vpn: 0, pfn: 5, valid: true },
      { vpn: 1, pfn: 2, valid: true },
      { vpn: 2, pfn: 7, valid: true },
      { vpn: 3, pfn: 0, valid: false },
      { vpn: 4, pfn: 4, valid: true },
    ],
    tlb: [{ vpn: 2, pfn: 7, valid: true }],
    virtual: 0x3500, // VPN=3 → invalid PTE → page fault
    note: "VPN=3 har valid=0 → page fault. Kernelen håndterer: laster siden fra disk eller dreper prosessen.",
  },
];

function bitstr(value: number, bits: number): string {
  let s = value.toString(2).padStart(bits, "0");
  // Group in nibbles for readability
  const out: string[] = [];
  for (let i = 0; i < s.length; i += 4) {
    out.push(s.slice(i, i + 4));
  }
  return out.join(" ");
}

export function AddressTranslator() {
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];
  const [vaText, setVaText] = useState(`0x${preset.virtual.toString(16).toUpperCase()}`);

  // Parse VA
  const va = useMemo(() => {
    const trimmed = vaText.trim();
    if (trimmed === "") return 0;
    if (trimmed.toLowerCase().startsWith("0x")) {
      const v = parseInt(trimmed.slice(2), 16);
      return isNaN(v) ? 0 : v;
    }
    if (trimmed.toLowerCase().startsWith("0b")) {
      const v = parseInt(trimmed.slice(2), 2);
      return isNaN(v) ? 0 : v;
    }
    const v = parseInt(trimmed, 10);
    return isNaN(v) ? 0 : v;
  }, [vaText]);

  function applyPreset(i: number) {
    setPresetIdx(i);
    setVaText(`0x${PRESETS[i].virtual.toString(16).toUpperCase()}`);
  }

  const vpnBits = preset.vaBits - preset.pageBits;
  const offsetMask = (1 << preset.pageBits) - 1;
  const offset = va & offsetMask;
  const vpn = (va >>> preset.pageBits) & ((1 << vpnBits) - 1);

  const tlbEntry = preset.tlb.find((e) => e.valid && e.vpn === vpn);
  const tlbHit = !!tlbEntry;
  const pte = preset.pageTable.find((e) => e.vpn === vpn);
  const pageFault = !tlbHit && (!pte || !pte.valid);
  const pfn = tlbHit ? tlbEntry!.pfn : pte && pte.valid ? pte.pfn : null;
  const physical = pfn === null ? null : (pfn << preset.pageBits) | offset;
  const maxVa = (1 << preset.vaBits) - 1;
  const vaOutOfRange = va < 0 || va > maxVa;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Adresseoversettelse — steg for steg
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(i)}
              className={`text-xs rounded-md border px-2 py-1 transition-colors ${
                presetIdx === i
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border bg-background hover:border-brand/40 text-muted-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="va" className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Virtuell adresse ({preset.vaBits} bit, page-størrelse{" "}
            <Tex>{`2^{${preset.pageBits}}`}</Tex> = {1 << preset.pageBits} byte)
          </label>
          <input
            id="va"
            value={vaText}
            onChange={(e) => setVaText(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1 font-mono text-sm"
            placeholder="0x2123"
          />
        </div>

        {vaOutOfRange ? (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
            Adressen er utenfor virtuelt adresserom (max 0x{maxVa.toString(16).toUpperCase()}).
          </div>
        ) : null}

        {/* Step 1: split */}
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Steg 1 — del adressen i VPN + offset
          </div>
          <div className="font-mono text-xs break-all">
            VA = <span className="text-brand">{bitstr(va, preset.vaBits)}</span>
          </div>
          <div className="font-mono text-xs mt-1 break-all">
            =&nbsp;<span className="text-orange-500">{bitstr(vpn, vpnBits)}</span>{" "}
            (VPN={vpn}) | <span className="text-emerald-500">{bitstr(offset, preset.pageBits)}</span>{" "}
            (offset={offset})
          </div>
        </div>

        {/* Step 2: TLB lookup */}
        <div
          className={`rounded-md border p-3 ${
            tlbHit
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-border bg-background"
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Steg 2 — slå opp VPN i TLB
          </div>
          {tlbHit ? (
            <div className="text-sm">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">TLB-hit:</span>{" "}
              VPN={vpn} → PFN={tlbEntry!.pfn}. Ferdig — ingen page-table-oppslag.
            </div>
          ) : (
            <div className="text-sm">
              <span className="font-semibold text-rose-600 dark:text-rose-400">TLB-miss</span> for VPN={vpn}.
              Gå videre til page-tabellen.
            </div>
          )}
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="font-semibold text-muted-foreground">TLB</div>
            <div className="font-semibold text-muted-foreground">VPN</div>
            <div className="font-semibold text-muted-foreground">PFN</div>
            {preset.tlb.map((e, i) => (
              <FragmentRow key={i} active={tlbHit && e.vpn === vpn} cells={[`slot ${i}`, String(e.vpn), String(e.pfn)]} />
            ))}
          </div>
        </div>

        {/* Step 3: page table */}
        {!tlbHit && (
          <div
            className={`rounded-md border p-3 ${
              pageFault
                ? "border-rose-500/40 bg-rose-500/10"
                : "border-emerald-500/40 bg-emerald-500/10"
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Steg 3 — slå opp VPN i page-tabellen
            </div>
            {pageFault ? (
              <div className="text-sm">
                <span className="font-semibold text-rose-600 dark:text-rose-400">Page fault:</span>{" "}
                VPN={vpn} {pte ? "har valid=0" : "finnes ikke i tabellen"}. Kernelen tar over.
              </div>
            ) : (
              <div className="text-sm">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Page-tabell-hit:</span>{" "}
                VPN={vpn} → PFN={pte!.pfn}. Vil bli cachet i TLB for neste gang.
              </div>
            )}
          </div>
        )}

        {/* Step 4: physical */}
        <div className="rounded-md border border-border bg-background p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Steg 4 — bygg fysisk adresse
          </div>
          {physical === null ? (
            <div className="text-sm text-muted-foreground">
              Ingen fysisk adresse — page fault håndteres av kernelen.
            </div>
          ) : (
            <>
              <div className="text-sm font-mono">
                PFN={pfn} ×{" "}
                <Tex>{`2^{${preset.pageBits}}`}</Tex> + offset={offset} =
                <span className="text-brand"> 0x{physical.toString(16).toUpperCase()}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-1 break-all">
                = {bitstr(physical, preset.vaBits)}
              </div>
            </>
          )}
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-xs text-foreground">
          <span className="font-semibold">Notat:</span> {preset.note}
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ active, cells }: { active: boolean; cells: string[] }) {
  const cls = active
    ? "bg-emerald-500/20 border border-emerald-500/40"
    : "border border-transparent";
  return (
    <>
      {cells.map((c, i) => (
        <div
          key={i}
          className={`px-1.5 py-1 font-mono rounded ${cls}`}
        >
          {c}
        </div>
      ))}
    </>
  );
}
