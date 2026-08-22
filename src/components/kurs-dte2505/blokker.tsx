// Byggeklosser for DTE-2505-skjermene.
//
// Alt her er laget for én telefonskjerm (~600 px høyde). Derfor:
//   - liten typografi (text-sm som standard, text-xs i bihjelp)
//   - maks fire punkter i en liste
//   - tunge simulatorer pakkes i <Figur>, som gir dem en fast makshøyde
//     med intern scroll i stedet for å presse resten av skjermen ut av syne.
//
// Skjermene selv er props-løse komponenter (jf. `Skjerm` i src/lib/kurs/types.ts).
// Fabrikkene som lager dem ligger i src/lib/kurs/fag/dte-2505/byggere.tsx —
// denne fila inneholder bare presentasjonen.

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- ramme og typografi ---------------- */

export function Ramme({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col gap-3 text-sm leading-relaxed">
      {children}
    </div>
  );
}

export function Ingress({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-foreground">{children}</p>;
}

export function Bihjelp({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}

/** Uthevet begrep. Første gang et begrep dukker opp skal fullt navn stå her. */
export function Term({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export function Punkter({ punkter }: { punkter: readonly ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {punkter.map((p, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary/70" />
          <span className="text-sm leading-relaxed">{p}</span>
        </li>
      ))}
    </ul>
  );
}

/** Kort «husk dette»-boks. Brukes sparsomt — maks én per skjerm. */
export function Merk({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
      {children}
    </div>
  );
}

export function Kodelinje({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">{children}</code>
  );
}

export function Kodeblokk({ kode, tittel }: { kode: string; tittel?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted/50">
      {tittel ? (
        <div className="border-b bg-muted/70 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          {tittel}
        </div>
      ) : null}
      <pre className="overflow-x-auto px-3 py-2 font-mono text-[12.5px] leading-relaxed">
        {kode}
      </pre>
    </div>
  );
}

/* ---------------- figur / simulator ---------------- */

/**
 * Pakker en gjenbrukt visualisering. `hoyde` er makshøyden figuren får lov å ta
 * på en telefon; går innholdet over, scroller figuren internt slik at resten av
 * skjermen (tittel, fikle-hint) blir stående.
 */
export function Figur({
  children,
  hint,
  hoyde = "max-h-[400px]",
}: {
  children: ReactNode;
  hint?: ReactNode;
  hoyde?: string;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className={cn("min-h-0 overflow-auto rounded-xl border bg-card p-2", hoyde)}>
        {children}
      </div>
      {hint ? <Bihjelp>{hint}</Bihjelp> : null}
    </div>
  );
}

/* ---------------- svar-widgets ---------------- */

export interface Valg {
  tekst: ReactNode;
  /** Settes på det ene riktige alternativet i en sjekk. */
  riktig?: boolean;
  /** Vises etter at studenten har valgt — hvorfor dette er riktig/galt. */
  hvorfor?: ReactNode;
}

/**
 * Flervalg. Brukes både til `anslag` (gjett før fasit — ingen «feil» straff)
 * og til `sjekk` (riktig/galt markeres). `onSvar` kobles til
 * `useSkjerm().besvart()` av fabrikken i byggere.tsx.
 */
export function Flervalg({
  sporsmal,
  valg,
  fasit,
  modus,
  onSvar,
}: {
  sporsmal: ReactNode;
  valg: readonly Valg[];
  /** Forklaringen som avsløres etter svar. */
  fasit: ReactNode;
  modus: "anslag" | "sjekk";
  onSvar?: () => void;
}) {
  const [valgt, setValgt] = useState<number | null>(null);
  const svart = valgt !== null;

  function velg(i: number) {
    if (svart) return;
    setValgt(i);
    onSvar?.();
  }

  return (
    <Ramme>
      <p className="text-[15px] font-medium leading-relaxed">{sporsmal}</p>
      {modus === "anslag" && !svart ? (
        <Bihjelp>Gjett først. Det er poenget — du husker fasiten bedre om du har satset på et svar.</Bihjelp>
      ) : null}
      <div className="flex flex-col gap-2">
        {valg.map((v, i) => {
          const erValgt = valgt === i;
          const vis = svart && modus === "sjekk";
          return (
            <button
              key={i}
              type="button"
              onClick={() => velg(i)}
              disabled={svart}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                !svart && "hover:border-primary/60 hover:bg-primary/5",
                erValgt && !vis && "border-primary bg-primary/10",
                vis && v.riktig && "border-emerald-500 bg-emerald-500/10",
                vis && erValgt && !v.riktig && "border-rose-500 bg-rose-500/10",
                svart && !erValgt && !(vis && v.riktig) && "opacity-60",
              )}
            >
              <span>{v.tekst}</span>
              {svart && erValgt && v.hvorfor ? (
                <span className="mt-1 block text-xs text-muted-foreground">{v.hvorfor}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {svart ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          {fasit}
        </div>
      ) : null}
    </Ramme>
  );
}

/** Tallgjetning: studenten skriver et anslag før tallet avsløres. */
export function Tallanslag({
  sporsmal,
  enhet,
  fasit,
  fasitTall,
  onSvar,
}: {
  sporsmal: ReactNode;
  enhet?: string;
  fasit: ReactNode;
  fasitTall: number;
  onSvar?: () => void;
}) {
  const [tekst, setTekst] = useState("");
  const [levert, setLevert] = useState(false);
  const gjett = Number(tekst.replace(",", "."));
  const gyldig = tekst.trim() !== "" && Number.isFinite(gjett);

  return (
    <Ramme>
      <p className="text-[15px] font-medium leading-relaxed">{sporsmal}</p>
      <div className="flex items-center gap-2">
        <input
          inputMode="decimal"
          value={tekst}
          disabled={levert}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="ditt anslag"
          className="w-32 rounded-lg border bg-background px-3 py-2 text-sm"
        />
        {enhet ? <span className="text-sm text-muted-foreground">{enhet}</span> : null}
        {!levert ? (
          <button
            type="button"
            disabled={!gyldig}
            onClick={() => {
              setLevert(true);
              onSvar?.();
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            Lås anslaget
          </button>
        ) : null}
      </div>
      {levert ? (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border px-3 py-2 text-sm">
            Du gjettet <strong>{gjett}</strong>
            {enhet ? ` ${enhet}` : ""} — fasit er{" "}
            <strong>
              {fasitTall}
              {enhet ? ` ${enhet}` : ""}
            </strong>
            .
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            {fasit}
          </div>
        </div>
      ) : (
        <Bihjelp>Ikke hopp over. Et tall du har satset på fester seg; et tall du leser gjør ikke det.</Bihjelp>
      )}
    </Ramme>
  );
}

/* ---------------- recall til slutt ---------------- */

export interface RecallKort {
  forside: ReactNode;
  bakside: ReactNode;
}

/**
 * Recall-kort. Kommer alltid PÅ SLUTTEN av et undertema — aldri som inngang.
 * Poenget er å sjekke at forståelsen fra simulatorene sitter, ikke å pugge inn
 * begreper studenten ennå ikke har sett fungere.
 */
export function Recall({ kort, onSvar }: { kort: readonly RecallKort[]; onSvar?: () => void }) {
  const [i, setI] = useState(0);
  const [snudd, setSnudd] = useState(false);
  const k = kort[i];
  const sist = i === kort.length - 1;

  return (
    <Ramme>
      <Bihjelp>
        Kort {i + 1} av {kort.length} — svar høyt for deg selv før du snur.
      </Bihjelp>
      <button
        type="button"
        onClick={() => {
          setSnudd(true);
          if (sist) onSvar?.();
        }}
        className="min-h-[180px] rounded-xl border bg-card px-4 py-4 text-left"
      >
        <p className="text-[15px] font-medium leading-relaxed">{k.forside}</p>
        {snudd ? (
          <p className="mt-3 border-t pt-3 text-sm leading-relaxed text-muted-foreground">
            {k.bakside}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">Trykk for å snu</p>
        )}
      </button>
      {snudd && !sist ? (
        <button
          type="button"
          onClick={() => {
            setI(i + 1);
            setSnudd(false);
          }}
          className="self-start rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Neste kort
        </button>
      ) : null}
    </Ramme>
  );
}

/* ---------------- oppsummering ---------------- */

export function Oppsummering({
  punkter,
  videre,
}: {
  punkter: readonly ReactNode[];
  videre?: ReactNode;
}) {
  return (
    <Ramme>
      <p className="text-[15px] font-medium">Dette sitter nå:</p>
      <Punkter punkter={punkter} />
      {videre ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium">Videre: </span>
          {videre}
        </div>
      ) : null}
    </Ramme>
  );
}
