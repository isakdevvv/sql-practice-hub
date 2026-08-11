import { FileText, KeyRound, Boxes, Database, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { REPOS, type AptState } from "@/lib/dte2505/pakkekilderEngine";

// ---------------------------------------------------------------------------
// Den visuelle tilstanden. Dette er det som gjør modulen til noe annet enn en
// kommandoliste: studenten ser HVA en kommando gjorde med systemet, ikke bare
// hva den skrev ut.
//
// Fire ruter, i den rekkefølgen årsakskjeden går:
//   kilder → nøkler → indeks → installert
// ---------------------------------------------------------------------------

const TYPE_STIL: Record<string, string> = {
  standard: "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  ppa: "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  tredjepart: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "løs-fil": "border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  snap: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  flatpak: "border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300",
};

const TYPE_NAVN: Record<string, string> = {
  standard: "standardarkiv",
  ppa: "PPA",
  tredjepart: "tredjepart",
  "løs-fil": "løs .deb-fil",
  snap: "snap",
  flatpak: "flatpak",
};

export function SystemPanel({ state, kompakt = false }: { state: AptState; kompakt?: boolean }) {
  const kilder = state.kilder
    .map((id) => REPOS.find((r) => r.id === id))
    .filter((r): r is (typeof REPOS)[number] => Boolean(r));
  const installert = Object.values(state.installert);
  const brutte = installert.filter((p) => p.brutt);
  const indeksAntall = Object.keys(state.indeks).length;

  return (
    <div className={cn("grid gap-3", kompakt ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
      {/* ---- kilder ---- */}
      <Rute
        ikon={<FileText className="h-3.5 w-3.5" />}
        tittel="Kilder"
        undertittel="/etc/apt/sources.list(.d/)"
      >
        {kilder.length === 0 ? (
          <Tom>ingen kilder</Tom>
        ) : (
          <ul className="space-y-1">
            {kilder.map((r) => {
              const manglerNokkel = !state.nokler.includes(r.nokkel);
              return (
                <li key={r.id} className="flex items-start gap-1.5">
                  <span
                    className={cn(
                      "mt-px shrink-0 rounded border px-1 text-[9px] uppercase tracking-wider",
                      TYPE_STIL[r.type],
                    )}
                  >
                    {TYPE_NAVN[r.type]}
                  </span>
                  <span className={cn("break-all", manglerNokkel && "text-rose-600 dark:text-rose-400")}>
                    {r.label}
                    {manglerNokkel && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-[10px]">
                        <AlertTriangle className="h-2.5 w-2.5" /> uten nøkkel — avvises
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Rute>

      {/* ---- nøkler ---- */}
      <Rute
        ikon={<KeyRound className="h-3.5 w-3.5" />}
        tittel="Signeringsnøkler"
        undertittel="GNU Privacy Guard-nøkkelringen"
      >
        {state.nokler.length === 0 ? (
          <Tom>ingen nøkler</Tom>
        ) : (
          <ul className="space-y-1">
            {state.nokler.map((k) => (
              <li key={k} className="break-all font-mono text-[11px]">
                {k}
              </li>
            ))}
          </ul>
        )}
      </Rute>

      {/* ---- indeks ---- */}
      <Rute
        ikon={<Database className="h-3.5 w-3.5" />}
        tittel="Pakkeindeksen"
        undertittel="det apt slår opp i"
        varsel={state.indeksUtdatert}
      >
        {indeksAntall === 0 ? (
          <Tom>tom — «apt update» er aldri kjørt</Tom>
        ) : (
          <>
            <div className={cn(state.indeksUtdatert && "text-amber-600 dark:text-amber-400")}>
              {indeksAntall} pakker kjent
              {state.indeksUtdatert && " · UTDATERT: kildene er endret siden siste update"}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.entries(state.indeks)
                .slice(0, 10)
                .map(([n, v]) => (
                  <span
                    key={n}
                    title={`${v.version} fra ${v.repo}`}
                    className="rounded border bg-muted/50 px-1 font-mono text-[10px]"
                  >
                    {n}
                  </span>
                ))}
              {indeksAntall > 10 && <span className="text-[10px]">+{indeksAntall - 10} til</span>}
            </div>
          </>
        )}
      </Rute>

      {/* ---- installert ---- */}
      <Rute
        ikon={<Boxes className="h-3.5 w-3.5" />}
        tittel="Installert"
        undertittel={`${installert.length} pakker`}
        varsel={brutte.length > 0}
      >
        {installert.length === 0 ? (
          <Tom>ingenting</Tom>
        ) : (
          <ul className="space-y-1">
            {installert.map((p) => (
              <li key={p.navn} className="flex items-start gap-1.5">
                <span
                  className={cn(
                    "mt-px shrink-0 rounded border px-1 text-[9px] uppercase tracking-wider",
                    TYPE_STIL[p.kildeType],
                  )}
                >
                  {TYPE_NAVN[p.kildeType]}
                </span>
                <span className={cn("break-all", p.brutt && "text-rose-600 dark:text-rose-400")}>
                  <span className="font-mono text-[11px]">{p.navn}</span>{" "}
                  <span className="text-[10px] text-muted-foreground">{p.version}</span>
                  {p.brutt && (
                    <span className="ml-1 text-[10px]">
                      · iU: mangler {(p.manglerAvhengighet ?? []).join(", ")}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Rute>
    </div>
  );
}

function Rute({
  ikon,
  tittel,
  undertittel,
  varsel,
  children,
}: {
  ikon: React.ReactNode;
  tittel: string;
  undertittel: string;
  varsel?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-2.5", varsel && "border-amber-500/50")}>
      <div className="mb-1.5 flex items-center gap-1.5 border-b pb-1.5">
        <span className="text-brand">{ikon}</span>
        <span className="text-xs font-semibold">{tittel}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{undertittel}</span>
      </div>
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
}

function Tom({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] italic text-muted-foreground">({children})</span>;
}
