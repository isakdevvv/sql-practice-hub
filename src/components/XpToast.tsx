import { useEffect, useRef, useState } from "react";
import { subscribeXP, type XpEvent, type XpSource } from "@/lib/progress/xpClient";

const SOURCE_TOAST_LABEL: Record<XpSource, string> = {
  sql: "SQL-oppgave løst",
  drag: "Drag-oppgave løst",
  card: "Flashcard",
  drill: "Drill-steg",
  join: "JOIN-øvelse",
  "mini-kurs": "Mini-kurs",
  prosjekt: "Prosjekt-trinn",
  "eksamen-trinn": "Eksamen-trinn",
};

const MAX_VISIBLE = 3;
const AUTO_HIDE_MS = 2500;

interface ToastItem {
  id: number;
  amount: number;
  source: XpSource;
}

/**
 * XpToast — viser toast nederst til høyre når awardXP gir XP.
 *
 * - Maks 3 stack'es samtidig (eldre rulles ut).
 * - Auto-skjul etter 2.5s per toast.
 * - Suspended hvis prefers-reduced-motion: vi rendrer ikke noe i det
 *   hele tatt for å være snille mot brukere som ikke vil ha "popups".
 *   (Alternativt kunne vi vise uten animasjon — men de fleste som
 *   slår på reduced-motion ønsker også færre flytende elementer.)
 * - Mountes via SiteHeader. Bruker fixed positioning så den ligger på
 *   toppen av all annen UI uten å trenge et portal.
 */
export function XpToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, number>>(new Map());
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const unsub = subscribeXP((_total, lastEvent?: XpEvent) => {
      // Vi reagerer kun når subscribeXP gir oss en konkret event —
      // f.eks. initial-snapshot uten event skal ikke vise toast.
      if (!lastEvent || lastEvent.amount <= 0) return;
      const id = ++idRef.current;
      const item: ToastItem = {
        id,
        amount: lastEvent.amount,
        source: lastEvent.source,
      };
      setToasts((cur) => {
        const next = [...cur, item];
        // Cap til MAX_VISIBLE — kast eldste hvis vi går over.
        while (next.length > MAX_VISIBLE) {
          const dropped = next.shift();
          if (dropped) {
            const t = timersRef.current.get(dropped.id);
            if (t) {
              window.clearTimeout(t);
              timersRef.current.delete(dropped.id);
            }
          }
        }
        return next;
      });
      const timer = window.setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.id !== id));
        timersRef.current.delete(id);
      }, AUTO_HIDE_MS);
      timersRef.current.set(id, timer);
    });
    return () => {
      unsub();
      for (const t of timersRef.current.values()) window.clearTimeout(t);
      timersRef.current.clear();
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-72 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="xptoast-in pointer-events-auto rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-lg"
          role="status"
        >
          <span className="font-semibold text-brand tabular-nums">+{t.amount} XP</span>
          <span className="mx-1.5 text-muted-foreground">·</span>
          <span className="text-foreground/90">{SOURCE_TOAST_LABEL[t.source]}</span>
        </div>
      ))}
      <style>{`
        @keyframes xptoast-in-kf {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .xptoast-in { animation: xptoast-in-kf 180ms ease-out; }
      `}</style>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}
