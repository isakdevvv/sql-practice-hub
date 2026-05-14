import { useState } from "react";
import { Tex } from "@/components/Tex";

/** Liten kalkulator for stop-and-wait utnyttelse. */
export function UtilizationCalc() {
  const [L, setL] = useState(1000); // bytes
  const [R, setR] = useState(1_000_000_000); // bits/s
  const [rtt, setRtt] = useState(30); // ms

  const Lbits = L * 8;
  const tTrans = Lbits / R; // sekunder
  const rttSec = rtt / 1000;
  const U = tTrans / (rttSec + tTrans);
  const tTransMs = tTrans * 1000;

  return (
    <div className="rounded-xl border border-border bg-card p-5 my-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-3">
        Kalkulator — stop-and-wait utnyttelse
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <label className="block">
          <span className="text-muted-foreground">Pakkestørrelse L (B)</span>
          <input
            type="number"
            value={L}
            onChange={(e) => setL(Number(e.target.value))}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 font-mono"
          />
        </label>
        <label className="block">
          <span className="text-muted-foreground">Linkrate R (bits/s)</span>
          <input
            type="number"
            value={R}
            onChange={(e) => setR(Number(e.target.value))}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 font-mono"
          />
        </label>
        <label className="block">
          <span className="text-muted-foreground">RTT (ms)</span>
          <input
            type="number"
            value={rtt}
            onChange={(e) => setRtt(Number(e.target.value))}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 font-mono"
          />
        </label>
      </div>
      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded border border-border bg-background/50 p-3">
          <div className="text-xs text-muted-foreground">Transmisjonstid L/R</div>
          <div className="font-mono text-base mt-1">{tTransMs.toFixed(4)} ms</div>
        </div>
        <div className="rounded border border-border bg-background/50 p-3">
          <div className="text-xs text-muted-foreground">RTT + L/R</div>
          <div className="font-mono text-base mt-1">{(rtt + tTransMs).toFixed(4)} ms</div>
        </div>
        <div className="rounded border border-brand/40 bg-brand/5 p-3">
          <div className="text-xs text-muted-foreground">U_sender</div>
          <div className="font-mono text-base mt-1">
            {U.toFixed(6)} ({(U * 100).toFixed(4)} %)
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Med Kuroses default-tall (L=1000 B, R=1 Gbps, RTT=30 ms) får du{" "}
        <Tex>{`U = 0.000266`}</Tex> — bare <strong>0.0266 %</strong> av lenken brukes. 1 Gbps
        forblir 270 kbps effektivt. Det er <em>motivasjonen</em> for pipelining (GBN/SR/TCP).
      </p>
    </div>
  );
}
