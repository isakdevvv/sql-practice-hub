// Route /dte2507/pcap — Wireshark / pcap-analyse-quiz med 15+ scenarier.
//
// Layout speiler /joins: sidebar med scenario-liste + framdrift, hovedpanel
// med PcapQuiz-komponenten. Progresjon lagres i localStorage så refresh
// beholder hva som er løst.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PcapQuiz } from "@/components/dte2507/PcapQuiz";
import { PCAP_SCENARIOS } from "@/lib/dte2507/pcapScenarios";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dte2507/pcap")({
  head: () => ({
    meta: [
      { title: "Pcap-quiz — DTE-2507 Wireshark-analyse" },
      {
        name: "description",
        content:
          "15+ pcap-scenarier i Wireshark-format. HTTP, TLS, DNS, ARP-spoofing, port-skanning. Multiple-choice med forklaring.",
      },
    ],
  }),
  component: PcapQuizPage,
});

const STORAGE_KEY = "dte2507-pcap-solved-v1";

function loadSolved(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSolved(solved: Record<string, true>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
  } catch {
    /* quota / disabled — ignore */
  }
}

function PcapQuizPage() {
  const [activeId, setActiveId] = useState(PCAP_SCENARIOS[0]?.id ?? "");
  const [solved, setSolved] = useState<Record<string, true>>({});

  const scenario = useMemo(
    () => PCAP_SCENARIOS.find((s) => s.id === activeId) ?? PCAP_SCENARIOS[0],
    [activeId],
  );
  const idx = Math.max(
    0,
    PCAP_SCENARIOS.findIndex((s) => s.id === activeId),
  );
  const solvedCount = Object.keys(solved).length;

  useEffect(() => {
    setSolved(loadSolved());
  }, []);

  function markSolved(id: string) {
    setSolved((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true as const };
      saveSolved(next);
      return next;
    });
  }

  function go(delta: number) {
    const len = PCAP_SCENARIOS.length;
    const next = (idx + delta + len) % len;
    setActiveId(PCAP_SCENARIOS[next].id);
  }

  function goNextUnsolved() {
    const fresh = loadSolved();
    setSolved(fresh);
    const len = PCAP_SCENARIOS.length;
    for (let i = 1; i <= len; i++) {
      const cand = PCAP_SCENARIOS[(idx + i) % len];
      if (!fresh[cand.id]) {
        setActiveId(cand.id);
        return;
      }
    }
    setActiveId(PCAP_SCENARIOS[(idx + 1) % len].id);
  }

  function reset() {
    saveSolved({});
    setSolved({});
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Ingen pcap-scenarier ennå.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
            DTE-2507 · Wireshark-praksis
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pcap-quiz — les nettverkstrafikk
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Hvert scenario viser en pakke-liste i Wireshark-format. Svar på
            multiple-choice; svar markeres grønn ved riktig. Samme oppgaveform
            som DTE-2507-eksamen pleier å bruke.
          </p>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          <aside className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Scenarier ({solvedCount}/{PCAP_SCENARIOS.length})
              </div>
              {solvedCount > 0 && (
                <button
                  onClick={reset}
                  title="Nullstill progresjon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
            <div
              className="h-1 w-full rounded-full bg-muted overflow-hidden mb-3"
              aria-label="Progresjon"
            >
              <div
                className="h-full bg-success transition-all"
                style={{
                  width: `${(solvedCount / PCAP_SCENARIOS.length) * 100}%`,
                }}
              />
            </div>
            {PCAP_SCENARIOS.map((s) => {
              const isSolved = !!solved[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                    s.id === activeId
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate flex-1">{s.title}</span>
                    {isSolved && (
                      <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {"●".repeat(s.difficulty)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {s.topic}
                    </span>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="space-y-3">
            <PcapQuiz
              key={scenario.id}
              scenario={scenario}
              onSolved={() => {
                markSolved(scenario.id);
              }}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Button size="sm" variant="ghost" onClick={() => go(-1)}>
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Forrige
              </Button>
              <Button size="sm" variant="ghost" onClick={goNextUnsolved}>
                Neste uløste
              </Button>
              <Button size="sm" variant="ghost" onClick={() => go(1)}>
                Neste <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
