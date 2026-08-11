import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, Target, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAAL_OPPGAVER,
  NETT,
  TOM_PAKKE,
  type CheckOutcome,
  type MaalOppgave,
  type PakkeBygg,
  type Transport,
} from "@/lib/dte2507/skjelettEngine";

// ---------------------------------------------------------------------------
// Oppgavetype 3 — MÅLOPPGAVE MED TILSTANDSSJEKK (§3.1).
//
// Sjekken leser MÅLTILSTANDEN studenten bygde, ikke en tekststreng. Det gir to
// ting regex aldri kan gi:
//   1. flere riktige veier godtas,
//   2. tilbakemeldingen kan si nøyaktig hvilket felt som var galt, og hvorfor.
//
// All logikk ligger i `MAAL_OPPGAVER[].sjekk()` i skjelettEngine.ts. Denne
// komponenten samler bare inn tilstanden og viser resultatet.
// ---------------------------------------------------------------------------

const MAC_VALG: { id: NonNullable<PakkeBygg["maalMacValg"]>; label: string; adresse: string }[] = [
  { id: "gateway", label: "Hjemmeruteren", adresse: NETT.gatewayMac },
  { id: "tjener", label: "Webtjeneren", adresse: NETT.tjenerMac },
  { id: "kringkasting", label: "Kringkasting (alle)", adresse: "ff:ff:ff:ff:ff:ff" },
];

const IP_VALG: { verdi: string; label: string }[] = [
  { verdi: NETT.tjenerIp, label: `Webtjeneren (${NETT.tjenerIp})` },
  { verdi: NETT.gatewayIp, label: `Hjemmeruteren (${NETT.gatewayIp})` },
  { verdi: NETT.klientIp, label: `Din egen laptop (${NETT.klientIp})` },
];

const PORT_VALG = [
  { verdi: 443, label: "443 — HTTPS" },
  { verdi: 80, label: "80 — HTTP" },
  { verdi: 53, label: "53 — DNS" },
  { verdi: 22, label: "22 — SSH" },
];

export function PakkeByggeren() {
  const [idx, setIdx] = useState(0);
  const [bygg, setBygg] = useState<PakkeBygg>(TOM_PAKKE);
  const [utfall, setUtfall] = useState<CheckOutcome | null>(null);
  const [visHint, setVisHint] = useState(false);
  const [loste, setLoste] = useState<Record<string, true>>({});

  const oppgave: MaalOppgave = MAAL_OPPGAVER[idx];
  const brukerFelt = (f: keyof PakkeBygg) => oppgave.felter.includes(f);
  const erTallOppgave = oppgave.felter.length === 1 && oppgave.felter[0] === "nyttelastBytes";

  function bytt(retning: 1 | -1) {
    setIdx((i) => (i + retning + MAAL_OPPGAVER.length) % MAAL_OPPGAVER.length);
    setBygg(TOM_PAKKE);
    setUtfall(null);
    setVisHint(false);
  }

  function sjekk() {
    const res = oppgave.sjekk(bygg);
    setUtfall(res);
    if (res.verdict === "riktig") setLoste((l) => ({ ...l, [oppgave.id]: true }));
  }

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-brand" />
          Måloppgave
          <span className="text-xs font-normal text-muted-foreground">
            {idx + 1} / {MAAL_OPPGAVER.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {Object.keys(loste).length} av {MAAL_OPPGAVER.length} løst
        </span>
      </div>

      <div className="p-4">
        <h4 className="font-medium">{oppgave.tittel}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{oppgave.prompt}</p>

        {/* Feltene — kun de oppgaven faktisk bruker */}
        <div className="mt-4 space-y-3">
          {brukerFelt("transport") && (
            <FeltRad etikett="Transportprotokoll">
              {(["tcp", "udp"] as Transport[]).map((t) => (
                <Knapp
                  key={t}
                  valgt={bygg.transport === t}
                  onClick={() => {
                    setBygg((b) => ({ ...b, transport: t }));
                    setUtfall(null);
                  }}
                >
                  {t.toUpperCase()}
                </Knapp>
              ))}
            </FeltRad>
          )}

          {brukerFelt("maalPort") && (
            <FeltRad etikett="Målport (transportlaget)">
              {PORT_VALG.map((p) => (
                <Knapp
                  key={p.verdi}
                  valgt={bygg.maalPort === p.verdi}
                  onClick={() => {
                    setBygg((b) => ({ ...b, maalPort: p.verdi }));
                    setUtfall(null);
                  }}
                >
                  {p.label}
                </Knapp>
              ))}
            </FeltRad>
          )}

          {brukerFelt("maalIp") && (
            <FeltRad etikett="Mål-IP (nettverkslaget)">
              {IP_VALG.map((v) => (
                <Knapp
                  key={v.verdi}
                  valgt={bygg.maalIp === v.verdi}
                  onClick={() => {
                    setBygg((b) => ({ ...b, maalIp: v.verdi }));
                    setUtfall(null);
                  }}
                >
                  {v.label}
                </Knapp>
              ))}
            </FeltRad>
          )}

          {brukerFelt("maalMacValg") && (
            <FeltRad etikett="Mål-MAC (lenkelaget)">
              {MAC_VALG.map((v) => (
                <Knapp
                  key={v.id}
                  valgt={bygg.maalMacValg === v.id}
                  onClick={() => {
                    setBygg((b) => ({ ...b, maalMacValg: v.id }));
                    setUtfall(null);
                  }}
                >
                  <span>{v.label}</span>
                  <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                    {v.adresse}
                  </span>
                </Knapp>
              ))}
            </FeltRad>
          )}

          {erTallOppgave && (
            <FeltRad etikett="Ditt svar (heltall)">
              <input
                type="number"
                value={bygg.nyttelastBytes ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setBygg((b) => ({ ...b, nyttelastBytes: v === "" ? null : Number(v) }));
                  setUtfall(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sjekk();
                }}
                className="w-36 rounded-md border border-border bg-background px-3 py-1.5 text-sm tabular-nums"
                placeholder="skriv tallet"
              />
            </FeltRad>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={sjekk}
            className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-foreground hover:bg-brand/90"
          >
            Sjekk
          </button>
          <button
            onClick={() => setVisHint((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {visHint ? "Skjul hint" : "Hint"}
          </button>
          <button
            onClick={() => {
              setBygg(TOM_PAKKE);
              setUtfall(null);
            }}
            className="rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
          >
            Nullstill
          </button>
        </div>

        {visHint && (
          <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-[13px] leading-relaxed">
            {oppgave.hint}
          </p>
        )}

        {utfall && <Tilbakemelding utfall={utfall} oppgave={oppgave} />}
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3">
        <button
          onClick={() => bytt(-1)}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" /> Forrige
        </button>
        <button
          onClick={() => bytt(1)}
          className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-accent"
        >
          Neste <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Tilbakemelding({ utfall, oppgave }: { utfall: CheckOutcome; oppgave: MaalOppgave }) {
  const stil =
    utfall.verdict === "riktig"
      ? "border-emerald-500/60 bg-emerald-500/10"
      : utfall.verdict === "nesten"
        ? "border-amber-500/60 bg-amber-500/10"
        : "border-rose-500/60 bg-rose-500/10";

  const merke =
    utfall.verdict === "riktig" ? "Riktig" : utfall.verdict === "nesten" ? "Nesten" : "Ikke ennå";

  const Ikon = utfall.verdict === "riktig" ? CheckCircle2 : XCircle;

  return (
    <div className={`mt-4 rounded-lg border p-3 ${stil}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
        <Ikon className="h-3.5 w-3.5" />
        {merke}
      </div>
      <p className="mt-2 text-sm leading-relaxed">{utfall.message}</p>
      {utfall.verdict === "riktig" && (
        <>
          <p className="mt-3 border-t border-emerald-500/20 pt-2 text-sm font-medium">
            {oppgave.laerdom}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">Målet var: {oppgave.maal}</p>
        </>
      )}
    </div>
  );
}

function FeltRad({ etikett, children }: { etikett: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {etikett}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Knapp({
  valgt,
  onClick,
  children,
}: {
  valgt: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent",
        valgt ? "border-brand bg-brand/10 font-medium" : "border-border bg-background",
      )}
    >
      {children}
    </button>
  );
}
