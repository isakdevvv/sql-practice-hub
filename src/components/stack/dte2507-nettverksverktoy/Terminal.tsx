import { useEffect, useRef, useState } from "react";
import { TerminalSquare, Trash2 } from "lucide-react";
import { kjor } from "@/lib/dte2507/nettverkKommandoer";

/**
 * Terminalen. Bevisst enkel: én inputlinje, historikk med piltastene, og
 * utdata i monospace. Den skal ligne nok på et ekte terminalvindu til at det
 * du lærer her overføres, uten å late som den er et helt operativsystem.
 *
 * Historikken lagres ikke mellom økter. Poenget er å kjøre kommandoene, ikke
 * å bygge et arkiv.
 */

interface Rad {
  slag: "inn" | "ut" | "feil";
  tekst: string;
}

const VELKOMST: Rad[] = [
  { slag: "ut", tekst: "Etterlignet terminal — Lab 1: IP-nettverk." },
  { slag: "ut", tekst: "Fem verktøy er med. Skriv «help» for lista." },
  { slag: "ut", tekst: "" },
];

export function Terminal({ prompt = "isak@lab1 ~ %" }: { prompt?: string }) {
  const [rader, setRader] = useState<Rad[]>(VELKOMST);
  const [linje, setLinje] = useState("");
  const [historikk, setHistorikk] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const bunnRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bunnRef.current?.scrollIntoView({ block: "nearest" });
  }, [rader]);

  function send() {
    const inn = linje;
    if (inn.trim() === "clear") {
      setRader(VELKOMST);
      setLinje("");
      setHistorikk((h) => [...h, inn]);
      setHistIdx(null);
      return;
    }

    const res = kjor(inn);
    setRader((r) => [
      ...r,
      { slag: "inn", tekst: `${prompt} ${inn}` },
      ...res.linjer.map((t): Rad => ({ slag: res.feil ? "feil" : "ut", tekst: t })),
      { slag: "ut", tekst: "" },
    ]);
    if (inn.trim()) setHistorikk((h) => [...h, inn]);
    setLinje("");
    setHistIdx(null);
  }

  /**
   * Pil opp/ned blar i historikken, slik et ekte skall gjør. Enter håndteres
   * ikke her, men av skjemaet under — da virker det også der tastaturet ikke
   * har en synlig Enter, og knappen blir en ekte innsendingsknapp.
   */
  function tast(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    if (historikk.length === 0) return;
    e.preventDefault();

    const neste =
      e.key === "ArrowUp"
        ? histIdx === null
          ? historikk.length - 1
          : Math.max(0, histIdx - 1)
        : histIdx === null
          ? null
          : Math.min(historikk.length - 1, histIdx + 1);

    setHistIdx(neste);
    setLinje(neste === null ? "" : historikk[neste]);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
        <TerminalSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Terminal</span>
        <button
          type="button"
          onClick={() => setRader(VELKOMST)}
          className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Trash2 className="h-3 w-3" />
          Tøm
        </button>
      </div>

      <div
        className="max-h-[22rem] overflow-y-auto bg-slate-950 p-3 font-mono text-[12.5px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {rader.map((r, i) => (
          <pre
            key={i}
            className={`whitespace-pre-wrap break-words ${
              r.slag === "inn"
                ? "text-emerald-400"
                : r.slag === "feil"
                  ? "text-rose-400"
                  : "text-slate-200"
            }`}
          >
            {r.tekst || " "}
          </pre>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-baseline gap-2"
        >
          <span className="shrink-0 text-emerald-400">{prompt}</span>
          <input
            ref={inputRef}
            value={linje}
            onChange={(e) => setLinje(e.target.value)}
            onKeyDown={tast}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Skriv en kommando"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-slate-100 outline-none placeholder:text-slate-600"
            placeholder="prøv «help», eller «ifconfig»"
          />
          <button
            type="submit"
            className="shrink-0 rounded border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-400"
          >
            Kjør
          </button>
        </form>
        <div ref={bunnRef} />
      </div>
    </div>
  );
}
