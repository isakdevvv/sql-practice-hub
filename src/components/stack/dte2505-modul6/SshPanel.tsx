import { KeyRound, Laptop, Server, FileCog, Monitor, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { TJENER, type SshState } from "@/lib/dte2505/sshEngine";

// ---------------------------------------------------------------------------
// Tilstandspanelet for SSH-delen av modul 6.
//
// To kolonner, fordi det er ÉN forvirring som gjentar seg i alle SSH-oppgaver:
// hvilken maskin er jeg på, og hvilken halvdel av nøkkelparet ligger hvor.
// Panelet gjør begge deler synlige hele tiden.
// ---------------------------------------------------------------------------

export function SshPanel({ state }: { state: SshState }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* ---- din maskin ---- */}
      <div
        className={cn(
          "rounded-lg border-2 bg-card p-2.5 transition-colors",
          !state.tilkoblet ? "border-sky-500/70 bg-sky-500/5" : "border-border opacity-70",
        )}
      >
        <div className="mb-1.5 flex items-center gap-1.5 border-b pb-1.5">
          <Laptop className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span className="text-xs font-semibold">Din laptop</span>
          {!state.tilkoblet && (
            <span className="ml-auto rounded bg-sky-500/20 px-1.5 text-[9px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
              du er her
            </span>
          )}
        </div>

        <Rad ikon={<KeyRound className="h-3 w-3" />} navn="~/.ssh/ (nøkkelpar)">
          {state.noklerLokalt.length === 0 ? (
            <Tom>ingen nøkler laget</Tom>
          ) : (
            <ul className="space-y-0.5">
              {state.noklerLokalt.map((n) => (
                <li key={n.navn}>
                  <span className="font-mono text-[11px]">{n.navn}</span>{" "}
                  <span className="rounded border border-rose-500/50 bg-rose-500/10 px-1 text-[9px] text-rose-700 dark:text-rose-300">
                    privat
                  </span>{" "}
                  <span className="font-mono text-[11px]">{n.navn}.pub</span>{" "}
                  <span className="rounded border border-emerald-500/50 bg-emerald-500/10 px-1 text-[9px] text-emerald-700 dark:text-emerald-300">
                    offentlig
                  </span>
                  {n.passfrase && <span className="ml-1 text-[10px] text-muted-foreground">· passfrase</span>}
                </li>
              ))}
            </ul>
          )}
        </Rad>

        <Rad ikon={<ShieldCheck className="h-3 w-3" />} navn="ssh-agent">
          {state.agentNokler.length === 0 ? (
            <Tom>tom — passfrasen spørres hver gang</Tom>
          ) : (
            <span className="font-mono text-[11px]">{state.agentNokler.join(", ")} (opplåst i minnet)</span>
          )}
        </Rad>

        <Rad ikon={<FileCog className="h-3 w-3" />} navn="~/.ssh/config">
          {state.config.length === 0 ? (
            <Tom>ingen oppføringer</Tom>
          ) : (
            <ul className="space-y-0.5">
              {state.config.map((c) => (
                <li key={c.alias} className="font-mono text-[11px]">
                  {c.alias} → {c.user ? `${c.user}@` : ""}
                  {c.hostName}
                  {c.identityFile ? ` (${c.identityFile})` : ""}
                  {c.forwardX11 ? " +X11" : ""}
                </li>
              ))}
            </ul>
          )}
        </Rad>

        <Rad ikon={<Monitor className="h-3 w-3" />} navn="X-tjener">
          {state.xTjenerKjorer ? (
            <span className="text-[11px]">
              kjører på <span className="font-mono">{state.lokalDisplay}</span> — skjermen din
            </span>
          ) : (
            <Tom>ingen grafikk</Tom>
          )}
        </Rad>
      </div>

      {/* ---- tjeneren ---- */}
      <div
        className={cn(
          "rounded-lg border-2 bg-card p-2.5 transition-colors",
          state.tilkoblet ? "border-amber-500/70 bg-amber-500/5" : "border-border opacity-70",
        )}
      >
        <div className="mb-1.5 flex items-center gap-1.5 border-b pb-1.5">
          <Server className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold">{TJENER.host}</span>
          {state.tilkoblet && (
            <span className="ml-auto rounded bg-amber-500/20 px-1.5 text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
              du er her
            </span>
          )}
        </div>

        <Rad ikon={<KeyRound className="h-3 w-3" />} navn="~/.ssh/authorized_keys">
          {state.autoriserteNokler.length === 0 ? (
            <Tom>tom — bare passord virker</Tom>
          ) : (
            <ul className="space-y-0.5">
              {state.autoriserteNokler.map((n) => (
                <li key={n} className="text-[11px]">
                  <span className="font-mono">{n}.pub</span>{" "}
                  <span className="rounded border border-emerald-500/50 bg-emerald-500/10 px-1 text-[9px] text-emerald-700 dark:text-emerald-300">
                    offentlig
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Rad>

        <Rad ikon={<ShieldCheck className="h-3 w-3" />} navn="Innlogging tillatt med">
          <span className="text-[11px]">
            nøkkel{state.tjenerTillaterPassord ? " og passord" : " (passord er slått av)"}
            {state.tjenerTillaterX11 ? " · X11Forwarding yes" : " · X11Forwarding no"}
          </span>
        </Rad>

        <Rad ikon={<Monitor className="h-3 w-3" />} navn="DISPLAY i økta">
          {state.tilkoblet ? (
            state.display ? (
              <span className="text-[11px]">
                <span className="font-mono">{state.display}</span> — enden av SSH-tunnelen, ikke en skjerm
              </span>
            ) : (
              <Tom>tom — ingen grafikk i denne økta</Tom>
            )
          ) : (
            <Tom>ikke tilkoblet</Tom>
          )}
        </Rad>

        <Rad ikon={<FileCog className="h-3 w-3" />} navn="Overførte filer">
          {state.overfort.length === 0 ? <Tom>ingen</Tom> : <span className="font-mono text-[11px]">{state.overfort.join(", ")}</span>}
        </Rad>
      </div>
    </div>
  );
}

function Rad({ ikon, navn, children }: { ikon: React.ReactNode; navn: string; children: React.ReactNode }) {
  return (
    <div className="mt-1.5 first:mt-0">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {ikon}
        {navn}
      </div>
      <div className="mt-0.5 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

function Tom({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] italic text-muted-foreground">({children})</span>;
}
