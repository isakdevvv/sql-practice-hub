import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Radio, Binary, RotateCcw } from "lucide-react";

type Tab = "intro" | "morse" | "binary";

export function Trinn0SignalsCodesPage() {
  const [tab, setTab] = useState<Tab>("intro");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Trinn 0 — Signaler og koder</h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Før vi kommer til transistorer og NAND-porter: hvordan en lampe eller telegrafkabel kan
            kode mening. Morse-kode er den enkleste broa fra «på/av» til informasjon. Petzold Code,
            kap. 1–3.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
          <TabBtn
            active={tab === "intro"}
            onClick={() => setTab("intro")}
            icon={<BookOpen className="h-3.5 w-3.5" />}
          >
            0. Start her
          </TabBtn>
          <TabBtn
            active={tab === "morse"}
            onClick={() => setTab("morse")}
            icon={<Radio className="h-3.5 w-3.5" />}
          >
            1. Morse-koder
          </TabBtn>
          <TabBtn
            active={tab === "binary"}
            onClick={() => setTab("binary")}
            icon={<Binary className="h-3.5 w-3.5" />}
          >
            2. Bit-strøm
          </TabBtn>
        </div>

        {tab === "intro" && <Intro onPick={setTab} />}
        {tab === "morse" && <MorseModule />}
        {tab === "binary" && <BinaryModule />}

        <Lessons />
      </main>
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Intro({ onPick }: { onPick: (t: Tab) => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Hvorfor dette trinnet finnes</h2>
        <p className="text-muted-foreground">
          Du har sikkert hørt «datamaskiner består av 0-er og 1-er». Men HVORFOR akkurat to verdier?
          Svaret er ikke matematikk — det er fysikk. En bryter er enten av eller på. En lampe lyser
          eller ikke. Det er enklest å lage pålitelige systemer av to-tilstander-elementer.
        </p>
        <p className="text-muted-foreground mt-2">
          Petzold bygger argumentet stein for stein: hvis en lampe kan slås av og på, kan vi avtale
          et tids-mønster (Morse). Med to lamper kan vi gjøre det parallelt. Med åtte lamper har vi
          en byte. Med millioner har vi en CPU.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold mb-2">Ordbok</h2>
        <dl className="space-y-2.5 text-[13px]">
          <Def term="Signal">
            En fysisk hendelse som bærer informasjon. Lyd, lys, spenning på en ledning — alt teller,
            så lenge mottakeren kan lese det.
          </Def>
          <Def term="Binær (to-tilstand)">
            Et signal som kun har to mulige verdier. På/av, høyspenning/lav, «punkt»/«strek».
            Lettest å bygge robuste systemer rundt.
          </Def>
          <Def term="Kode">
            En avtale om hvordan signaler skal tolkes. Morse-kodens avtale er «punkt-strek = A,
            strek-punkt-punkt-punkt = B, ...».
          </Def>
          <Def term="Bit">
            «Binary digit». En enkelt 0 eller 1. Mest grunnleggende enhet for informasjon i
            datamaskiner.
          </Def>
          <Def term="Byte">
            8 bits gruppert sammen. Kan representere 2⁸ = 256 ulike verdier. Standardenhet — en
            ASCII-bokstav passer i én byte.
          </Def>
          <Def term="ASCII">
            Tabell som tilordner et tall (0–127) til hvert vanlige tegn. «A» = 65, «a» = 97, «0» =
            48, mellomrom = 32. Hver bokstav passer i 7 bits (en byte med plass til overs).
          </Def>
        </dl>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={() => onPick("morse")}>
          Start på modul 1 →
        </Button>
      </div>
    </div>
  );
}

function Def({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{children}</dd>
    </div>
  );
}

// ============================================================
// MODUL 1 — MORSE
// ============================================================

const MORSE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
};

function MorseModule() {
  const [text, setText] = useState("HEI");
  const [playing, setPlaying] = useState(false);
  const [pulseIdx, setPulseIdx] = useState(-1);

  const symbols = useMemo(() => {
    const upper = text.toUpperCase();
    const out: { char: string; code: string }[] = [];
    for (const c of upper) {
      if (c === " ") out.push({ char: " ", code: "/" });
      else if (MORSE[c]) out.push({ char: c, code: MORSE[c] });
    }
    return out;
  }, [text]);

  // Bygg pulse-sekvens: hver punkt = 1 enhet på, hver strek = 3 enheter på,
  // 1 enhet pause mellom signaler i bokstav, 3 enheter mellom bokstaver,
  // 7 enheter mellom ord. Vi bruker UNIT som tid per "skritt".
  const pulses = useMemo(() => {
    const out: { on: boolean; len: number; charIdx: number }[] = [];
    symbols.forEach((sym, i) => {
      if (sym.code === "/") {
        out.push({ on: false, len: 7, charIdx: i });
        return;
      }
      for (const m of sym.code) {
        out.push({ on: true, len: m === "." ? 1 : 3, charIdx: i });
        out.push({ on: false, len: 1, charIdx: i });
      }
      out.push({ on: false, len: 2, charIdx: i });
    });
    return out;
  }, [symbols]);

  useEffect(() => {
    if (!playing) {
      setPulseIdx(-1);
      return;
    }
    let cancelled = false;
    let i = 0;
    const UNIT = 90;
    function next() {
      if (cancelled || i >= pulses.length) {
        setPlaying(false);
        setPulseIdx(-1);
        return;
      }
      setPulseIdx(i);
      const dur = pulses[i].len * UNIT;
      setTimeout(() => {
        i++;
        next();
      }, dur);
    }
    next();
    return () => {
      cancelled = true;
    };
  }, [playing, pulses]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hva skjer her:</strong> du skriver tekst. Vi slår opp
        hver bokstav i Morse-tabellen. Hver punkt og strek er en kort eller lang «på»-tilstand på
        lampa. Trykk «Send» og se det spille av. Det er DETTE Petzold mener med «to-tilstand-system
        kan bære informasjon».
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={20}
          className="w-full rounded border border-border bg-background p-2 font-mono text-sm"
          placeholder="HEI VERDEN"
        />

        <div className="mt-3 flex items-center gap-3">
          <Button size="sm" onClick={() => setPlaying((v) => !v)}>
            {playing ? "Stopp" : "Send"}
          </Button>
          <div
            className={`h-10 w-10 rounded-full border-2 transition-all ${
              pulseIdx >= 0 && pulses[pulseIdx]?.on
                ? "bg-amber-400 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                : "bg-muted border-border"
            }`}
            title="Lampa"
          />
          <span className="text-xs text-muted-foreground">
            {pulseIdx >= 0 ? (pulses[pulseIdx].on ? "PÅ" : "av") : "klar"}
          </span>
        </div>

        <div className="mt-4 space-y-1.5">
          {symbols.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded px-2 py-1 ${
                pulseIdx >= 0 && pulses[pulseIdx]?.charIdx === i
                  ? "bg-amber-500/10 border border-amber-500/40"
                  : ""
              }`}
            >
              <span className="font-mono font-bold w-6 text-center">{s.char}</span>
              <span className="font-mono text-lg tracking-widest">{s.code}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Aha-momentet:</strong> alle bokstaver i hele alfabetet
        er bygd av <em>to</em> grunnsignaler (punkt og strek) pluss pauser. Det er nøyaktig samme
        idé som senere blir 0 og 1 i en bit-strøm. Forskjellen er at moderne datamaskiner ikke
        bruker tid mellom signaler — de bruker en klokke (kommer i senere trinn).
      </div>
    </div>
  );
}

// ============================================================
// MODUL 2 — BINARY (ASCII pulse-strøm)
// ============================================================

function BinaryModule() {
  const [text, setText] = useState("HEI");

  const upper = text.toUpperCase().slice(0, 4);
  const chars = [...upper].map((c) => ({
    char: c,
    code: c.charCodeAt(0),
    bits: c.charCodeAt(0).toString(2).padStart(8, "0"),
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Fra Morse til moderne bits:</strong> i stedet for
        variable tids-lengder bestemmer vi at hver bokstav bruker akkurat 8 «slot-er» (bits). Hver
        slot er enten 0 eller 1. Da kan vi sende dem på en fast takt — ingen pauser å gjette på. Det
        er det ASCII gjør: hver bokstav får et fast 8-bit-mønster.
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={4}
          className="w-full rounded border border-border bg-background p-2 font-mono text-sm mb-3"
          placeholder="HEI"
        />

        <div className="space-y-3">
          {chars.map((c, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-baseline gap-3 text-xs">
                <span className="font-mono font-bold text-lg w-6">{c.char}</span>
                <span className="text-muted-foreground">ASCII-tall:</span>
                <span className="font-mono">{c.code}</span>
                <span className="text-muted-foreground">→ binær:</span>
                <span className="font-mono">{c.bits}</span>
              </div>
              <div className="flex gap-[2px]">
                {c.bits.split("").map((b, j) => (
                  <div
                    key={j}
                    className={`w-8 h-8 rounded-sm flex items-center justify-center font-mono text-sm ${
                      b === "1"
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Hvorfor 8 bits per bokstav?</strong> En byte gir 2⁸ =
        256 mulige verdier. Det er nok til alle bokstaver i engelsk alfabet (begge størrelser),
        siffer, skilletegn og kontroll-tegn, med plass til overs. Når vi senere lager CPU-er, blir
        8-bits-grupper den naturlige enheten. Hadde vi valgt 7 bits per tegn (minst nødvendig for
        ASCII) ville vi spart penger, men miste mye praktisk fleksibilitet.
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <section className="mt-10 space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Hva som kommer senere</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
        <li>
          <strong className="text-foreground">Trinn 1: Transistor</strong> — erstatte lampa med en
          bryter som kan styre seg selv. Da kan vi lage logikk.
        </li>
        <li>
          <strong className="text-foreground">Trinn 2: NAND-porter</strong> — kombinere transistorer
          til byggesteiner som regner med 0 og 1.
        </li>
        <li>
          <strong className="text-foreground">Trinn 3: Adders</strong> — NAND-porter som faktisk
          legger sammen bits, akkurat som vi nå har sett ASCII-tall.
        </li>
      </ul>
    </section>
  );
}
