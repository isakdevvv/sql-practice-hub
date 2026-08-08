import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Layers, Search, ArrowDown, ArrowUp, CornerDownLeft, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAN_SECTIONS,
  SYNOPSIS_LEGEND,
  EXPLORER_NAMES,
  pagesForName,
  type ManSectionNum,
  type SynopsisToken,
  type MockManPage,
} from "@/lib/dte2505/hjelpesystemerData";

// ---------------------------------------------------------------------------
// Oppgavetype 2 — GUIDET SIMULERING (lær-modus).
//
// Null prestasjonskrav. Studenten utforsker en ekte-nok manualside: bytter
// seksjon på samme navn, klikker på SYNOPSIS-notasjonen for å få vite hva
// klammer og streker betyr, og prøver less-tastene på en side som faktisk
// ruller og faktisk lar seg søke i.
//
// Manualsiden er gjengitt STRUKTURELT, ikke som en tekstblokk, slik at hver
// del kan være klikkbar og forklart for seg.
// ---------------------------------------------------------------------------

const KIND_STYLE: Record<SynopsisToken["kind"], string> = {
  command: "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  optional: "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  required: "border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  repeat: "border-teal-500/60 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  either: "border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  placeholder: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const KIND_LABEL: Record<SynopsisToken["kind"], string> = {
  command: "kommandonavn",
  optional: "valgfritt",
  required: "påkrevd",
  repeat: "gjentakbart",
  either: "enten-eller",
  placeholder: "plassholder",
};

const PAGE_SECTIONS = [
  { id: "NAME", no: "navn", what: "Sidenavnet og én setning om hva det er. Dette er den eneste linja apropos og whatis leser." },
  { id: "SYNOPSIS", no: "kallesyntaks", what: "Hvordan kommandoen skrives, med klammer for valgfritt og store bokstaver for plassholdere." },
  { id: "DESCRIPTION", no: "beskrivelse", what: "Hva den gjør, i prosa. Ofte den lengste delen — og den de fleste hopper over." },
  { id: "OPTIONS", no: "opsjoner", what: "Hvert flagg med kortform, langform og forklaring." },
  { id: "EXAMPLES", no: "eksempler", what: "Konkrete kommandolinjer. Erfarne brukere hopper hit først, hvis seksjonen finnes." },
  { id: "SEE ALSO", no: "se også", what: "Beslektede sider med navn og seksjon. Den vanligste veien videre når du er på feil side." },
];

export function ManUtforsker() {
  const [name, setName] = useState("passwd");
  const [section, setSection] = useState<ManSectionNum>(1);
  const [token, setToken] = useState<SynopsisToken | null>(null);
  const [openTree, setOpenTree] = useState<ManSectionNum | null>(null);
  const [term, setTerm] = useState("");
  const [activeHit, setActiveHit] = useState(0);
  const [pageSectionNote, setPageSectionNote] = useState<string | null>(null);

  const viewport = useRef<HTMLDivElement>(null);
  const activeMark = useRef<HTMLElement | null>(null);

  const available = useMemo(() => pagesForName(name), [name]);
  const page: MockManPage | undefined = available.find((p) => p.section === section) ?? available[0];

  // Bytter du navn, hopper vi til den laveste seksjonen — akkurat som man selv gjør.
  useEffect(() => {
    const first = pagesForName(name)[0];
    if (first) setSection(first.section);
    setToken(null);
    setTerm("");
  }, [name]);

  useEffect(() => {
    activeMark.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeHit, term]);

  // --- søk i siden (less: /ord, n, N) -------------------------------------
  const query = term.trim().toLowerCase();
  let hitCounter = 0;
  const totalHits = useMemo(() => {
    if (!page || !query) return 0;
    const haystack = [
      page.name,
      page.oneLiner,
      ...page.synopsis.flatMap((l) => l.map((t) => t.text)),
      ...page.description,
      ...page.options.flatMap((o) => [o.short, o.long, o.text]),
      ...page.examples.flatMap((e) => [e.cmd, e.text]),
      ...page.seeAlso,
    ].join("\n").toLowerCase();
    return haystack.split(query).length - 1;
  }, [page, query]);

  /** Marker treff i en tekstbit. Teller opp globalt slik at n/N kan hoppe. */
  function Hl({ text }: { text: string }) {
    if (!query) return <>{text}</>;
    const parts: React.ReactNode[] = [];
    const lower = text.toLowerCase();
    let i = 0;
    while (i < text.length) {
      const at = lower.indexOf(query, i);
      if (at === -1) {
        parts.push(text.slice(i));
        break;
      }
      if (at > i) parts.push(text.slice(i, at));
      const myIndex = hitCounter++;
      const isActive = myIndex === activeHit % Math.max(totalHits, 1);
      parts.push(
        <mark
          key={`${at}-${myIndex}`}
          ref={isActive ? (el) => (activeMark.current = el) : undefined}
          className={cn(
            "rounded px-0.5",
            isActive ? "bg-brand text-brand-foreground" : "bg-amber-300/60 text-foreground dark:bg-amber-500/40",
          )}
        >
          {text.slice(at, at + query.length)}
        </mark>,
      );
      i = at + query.length;
    }
    return <>{parts}</>;
  }

  function scrollScreen(dir: 1 | -1) {
    const el = viewport.current;
    if (!el) return;
    el.scrollBy({ top: dir * (el.clientHeight - 40), behavior: "smooth" });
  }
  function jumpEnd(where: "top" | "bottom") {
    const el = viewport.current;
    if (!el) return;
    el.scrollTo({ top: where === "top" ? 0 : el.scrollHeight, behavior: "smooth" });
  }

  if (!page) return null;

  return (
    <div className="rounded-xl border-2 border-brand/30 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="h-4 w-4 text-brand" /> Manualside-utforsker
        </div>
        <span className="text-xs text-muted-foreground">Lær-modus — ingenting kan gjøres feil her</span>
      </div>

      {/* ---- velg navn ---- */}
      <div className="border-b px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">1. Velg et navn</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EXPLORER_NAMES.map((n) => (
            <button
              key={n.name}
              onClick={() => setName(n.name)}
              title={n.teaser}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs hover:bg-accent",
                name === n.name && "border-brand bg-brand/10",
              )}
            >
              {n.name}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {EXPLORER_NAMES.find((n) => n.name === name)?.teaser}
        </p>
      </div>

      {/* ---- seksjonstreet ---- */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Layers className="h-3 w-3" /> 2. Velg seksjon
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {MAN_SECTIONS.map((s) => {
            const has = available.some((p) => p.section === s.num);
            const active = has && section === s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  if (has) setSection(s.num);
                  setOpenTree(openTree === s.num ? null : s.num);
                }}
                className={cn(
                  "flex flex-col items-center rounded-md border px-1 py-1.5 text-center transition-colors",
                  active && "border-brand bg-brand/15",
                  !active && has && "border-emerald-500/50 bg-emerald-500/5 hover:bg-accent",
                  !has && "border-dashed opacity-55 hover:opacity-100",
                  openTree === s.num && !active && "ring-1 ring-brand/40",
                )}
              >
                <span className="font-mono text-sm font-semibold">{s.num}</span>
                <span className="text-[9px] leading-tight">{s.title}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Heltrukket ramme = <span className="text-emerald-600 dark:text-emerald-400">{name} finnes i denne seksjonen</span>.
          Stiplet = ingen side med det navnet der. Trykk uansett for å lese hva seksjonen inneholder.
        </div>
        {openTree && (
          <div className="mt-2 rounded-lg border bg-muted/40 p-3 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold">
                  Seksjon {openTree}: {MAN_SECTIONS[openTree - 1].title}
                </span>{" "}
                <span className="text-muted-foreground">({MAN_SECTIONS[openTree - 1].english})</span>
                <p className="mt-1 leading-relaxed text-muted-foreground">{MAN_SECTIONS[openTree - 1].blurb}</p>
                <p className="mt-1 font-mono text-[11px]">{MAN_SECTIONS[openTree - 1].example}</p>
              </div>
              <button onClick={() => setOpenTree(null)} aria-label="Lukk" className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
        {available.length > 1 && (
          <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
            <span className="font-semibold">{name}</span> finnes i {available.length} seksjoner:{" "}
            {available.map((a) => (
              <button
                key={a.section}
                onClick={() => setSection(a.section)}
                className={cn(
                  "mx-0.5 rounded border px-1.5 py-0.5 font-mono",
                  section === a.section ? "border-brand bg-brand/15" : "hover:bg-accent",
                )}
              >
                {a.name}({a.section})
              </button>
            ))}
            <div className="mt-1 text-muted-foreground">
              Skriver du bare <code className="font-mono">man {name}</code>, får du{" "}
              <code className="font-mono">
                {name}({available[0].section})
              </code>{" "}
              — den laveste. Alt annet må du be om selv.
            </div>
          </div>
        )}
      </div>

      {/* ---- less-linja ---- */}
      <div className="flex flex-wrap items-center gap-1.5 border-b bg-muted/30 px-4 py-2 text-xs">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">3. Naviger</span>
        <KeyBtn onClick={() => scrollScreen(1)} title="Bla én skjerm ned">
          Mellomrom <ArrowDown className="h-3 w-3" />
        </KeyBtn>
        <KeyBtn onClick={() => scrollScreen(-1)} title="Bla én skjerm opp">
          b <ArrowUp className="h-3 w-3" />
        </KeyBtn>
        <KeyBtn onClick={() => jumpEnd("top")} title="Til toppen">g</KeyBtn>
        <KeyBtn onClick={() => jumpEnd("bottom")} title="Til bunnen">G</KeyBtn>
        <span className="mx-1 inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-muted-foreground">/</span>
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setActiveHit(0);
            }}
            placeholder="søk i siden"
            aria-label="Søk i manualsiden"
            className="w-28 bg-transparent font-mono outline-none"
          />
          <CornerDownLeft className="h-3 w-3 text-muted-foreground" />
        </span>
        <KeyBtn onClick={() => setActiveHit((h) => h + 1)} title="Neste treff" disabled={totalHits === 0}>
          n
        </KeyBtn>
        <KeyBtn onClick={() => setActiveHit((h) => h - 1 + totalHits)} title="Forrige treff" disabled={totalHits === 0}>
          N
        </KeyBtn>
        {term && (
          <span className={cn("ml-1", totalHits === 0 ? "text-rose-500" : "text-muted-foreground")}>
            {totalHits === 0 ? "Mønster ikke funnet" : `treff ${(activeHit % totalHits) + 1} av ${totalHits}`}
          </span>
        )}
        <span className="ml-auto text-muted-foreground">
          q avslutter og gir deg skallet tilbake
        </span>
      </div>

      {/* ---- selve siden ---- */}
      <div ref={viewport} className="max-h-[26rem] overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between border-b pb-2 font-mono text-[11px] text-muted-foreground">
          <span>
            {page.name.toUpperCase()}({page.section})
          </span>
          <span>Manualsider</span>
          <span>
            {page.name.toUpperCase()}({page.section})
          </span>
        </div>

        <Blokk id="NAME" onInfo={setPageSectionNote}>
          <div className="font-mono text-sm">
            <span className="font-semibold">
              <Hl text={page.name} />
            </span>{" "}
            - <Hl text={page.oneLiner} />
          </div>
        </Blokk>

        <Blokk id="SYNOPSIS" onInfo={setPageSectionNote}>
          <div className="space-y-2">
            {page.synopsis.map((line, li) => (
              <div key={li} className="flex flex-wrap items-center gap-1.5">
                {line.map((tk, ti) => (
                  <button
                    key={ti}
                    onClick={() => setToken(tk)}
                    className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-sm transition-all hover:brightness-110",
                      KIND_STYLE[tk.kind],
                      token === tk && "ring-2 ring-brand/50",
                    )}
                  >
                    <Hl text={tk.text} />
                  </button>
                ))}
              </div>
            ))}
          </div>
          {token ? (
            <div className="mt-2 rounded-lg border border-brand/40 bg-brand/5 p-2.5 text-xs">
              <span className="font-mono font-semibold">{token.text}</span>{" "}
              <span className="rounded bg-muted px-1 py-0.5 text-[10px] uppercase tracking-wider">
                {KIND_LABEL[token.kind]}
              </span>
              <p className="mt-1 leading-relaxed">{token.note}</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Trykk på en bit av SYNOPSIS for å få vite hva notasjonen betyr.
            </p>
          )}
        </Blokk>

        <Blokk id="DESCRIPTION" onInfo={setPageSectionNote}>
          <div className="space-y-2 text-sm leading-relaxed">
            {page.description.map((d, i) => (
              <p key={i}>
                <Hl text={d} />
              </p>
            ))}
          </div>
        </Blokk>

        {page.options.length > 0 && (
          <Blokk id="OPTIONS" onInfo={setPageSectionNote}>
            <div className="space-y-1.5">
              {page.options.map((o, i) => (
                <div key={i} className="grid gap-x-3 sm:grid-cols-[10rem_1fr]">
                  <div className="font-mono text-xs">
                    {o.short && (
                      <span className="rounded bg-amber-500/15 px-1 py-0.5 text-amber-700 dark:text-amber-300">
                        <Hl text={o.short} />
                      </span>
                    )}
                    {o.short && o.long && <span className="mx-1 text-muted-foreground">/</span>}
                    {o.long && (
                      <span className="rounded bg-violet-500/15 px-1 py-0.5 text-violet-700 dark:text-violet-300">
                        <Hl text={o.long} />
                      </span>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed">
                    <Hl text={o.text} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Gult = kortform (én bindestrek, én bokstav). Lilla = langform (to bindestreker, et helt
              ord). Står begge på samme linje, er de nøyaktig samme flagg.
            </p>
          </Blokk>
        )}

        {page.examples.length > 0 && (
          <Blokk id="EXAMPLES" onInfo={setPageSectionNote}>
            <div className="space-y-2">
              {page.examples.map((e, i) => (
                <div key={i} className="rounded-lg border bg-muted/40 p-2">
                  <div className="font-mono text-xs">
                    <Hl text={e.cmd} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <Hl text={e.text} />
                  </div>
                </div>
              ))}
            </div>
          </Blokk>
        )}

        {page.seeAlso.length > 0 && (
          <Blokk id="SEE ALSO" onInfo={setPageSectionNote}>
            <div className="flex flex-wrap gap-1.5">
              {page.seeAlso.map((s) => {
                const m = s.match(/^(\w+)\((\d)\)$/);
                const canOpen = m && pagesForName(m[1]).some((p) => String(p.section) === m[2]);
                return (
                  <button
                    key={s}
                    disabled={!canOpen}
                    onClick={() => {
                      if (!m) return;
                      setName(m[1]);
                      setTimeout(() => setSection(Number(m[2]) as ManSectionNum), 0);
                    }}
                    className={cn(
                      "rounded-md border px-2 py-1 font-mono text-xs",
                      canOpen ? "hover:bg-accent" : "opacity-50",
                    )}
                  >
                    <Hl text={s} />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Legg merke til at hver henvisning har seksjonsnummer. Det er slik manualen skiller to
              sider med samme navn. De som kan åpnes her, er klikkbare.
            </p>
          </Blokk>
        )}
      </div>

      {pageSectionNote && (
        <div className="border-t bg-brand/5 px-4 py-2.5 text-xs">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <span>{pageSectionNote}</span>
            <button
              onClick={() => setPageSectionNote(null)}
              className="ml-auto text-muted-foreground hover:text-foreground"
              aria-label="Lukk"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ---- notasjonsnøkkelen ---- */}
      <div className="border-t px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Nøkkel til SYNOPSIS-notasjonen
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {SYNOPSIS_LEGEND.map((l) => (
            <div key={l.symbol} className="rounded-lg border bg-muted/30 p-2 text-xs">
              <span className="font-mono font-semibold">{l.symbol}</span>{" "}
              <span className="text-muted-foreground">({l.name})</span>
              <p className="mt-0.5 leading-relaxed">{l.meaning}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{l.example}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KeyBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 font-mono hover:bg-accent",
        disabled && "opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function Blokk({
  id,
  children,
  onInfo,
}: {
  id: string;
  children: React.ReactNode;
  onInfo: (note: string) => void;
}) {
  const meta = PAGE_SECTIONS.find((p) => p.id === id)!;
  return (
    <section className="mb-4">
      <button
        onClick={() => onInfo(`${meta.id} (${meta.no}): ${meta.what}`)}
        className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-brand hover:underline"
      >
        {meta.id}
        <Info className="h-3 w-3 opacity-60" />
      </button>
      <div className="pl-3 sm:pl-6">{children}</div>
    </section>
  );
}
