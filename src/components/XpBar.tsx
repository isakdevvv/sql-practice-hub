import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getTotalXP,
  getXPBySource,
  levelFromXP,
  subscribeXP,
  xpToNextLevel,
  type XpSource,
} from "@/lib/progress/xpClient";

const SOURCE_LABEL: Record<XpSource, string> = {
  sql: "SQL-oppgaver",
  drag: "Drag-oppgaver",
  card: "Flashcards",
  drill: "Drill",
  join: "JOIN-øvelser",
  "mini-kurs": "Mini-kurs",
  prosjekt: "Prosjekt",
  "eksamen-trinn": "Eksamen-trinn",
};

const SOURCE_ORDER: XpSource[] = [
  "sql",
  "drag",
  "card",
  "drill",
  "join",
  "mini-kurs",
  "prosjekt",
  "eksamen-trinn",
];

/**
 * XpBar — kompakt badge i SiteHeader.
 *
 * Viser "Lvl N · X XP" (eller bare "X XP" på smale skjermer). Klikk
 * navigerer til /dashboard. Hover viser tooltip med per-kilde-XP.
 *
 * Live oppdatering via `subscribeXP`. Når total endrer seg pulser
 * badge'en kort (med mindre brukeren har prefers-reduced-motion).
 */
export function XpBar() {
  const [total, setTotal] = useState<number>(() => getTotalXP());
  const [pulse, setPulse] = useState(false);
  const [hover, setHover] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const pulseTimer = useRef<number | null>(null);

  useEffect(() => {
    const unsub = subscribeXP((next) => {
      setTotal((prev) => {
        if (next !== prev && !reducedMotion) {
          setPulse(true);
          if (pulseTimer.current != null) window.clearTimeout(pulseTimer.current);
          pulseTimer.current = window.setTimeout(() => setPulse(false), 700);
        }
        return next;
      });
    });
    return () => {
      unsub();
      if (pulseTimer.current != null) window.clearTimeout(pulseTimer.current);
    };
  }, [reducedMotion]);

  const { level, current, needed } = useMemo(() => xpToNextLevel(total), [total]);
  const pct = Math.max(0, Math.min(100, Math.round((current / Math.max(1, needed)) * 100)));

  const bySource = useMemo(() => (hover ? getXPBySource() : null), [hover, total]);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to="/dashboard"
        aria-label={`Lvl ${level}, ${total} XP. Gå til dashboard.`}
        title={`Lvl ${level} · ${total} XP`}
        className={[
          "group inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60",
          "px-2 py-1 text-xs font-medium text-foreground/90",
          "hover:bg-accent hover:text-foreground transition-colors",
          pulse ? "xpbar-pulse" : "",
        ].join(" ")}
      >
        <span
          aria-hidden
          className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-brand/15 px-1 text-[10px] font-bold text-brand"
        >
          {level}
        </span>
        <span className="tabular-nums">
          <span className="hidden sm:inline">Lvl {level} · </span>
          {total} XP
        </span>
      </Link>

      {/* Tooltip — per-kilde-fordeling + progress mot neste level */}
      {hover && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-popover p-3 text-xs shadow-lg"
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="font-semibold">Lvl {level}</span>
            <span className="text-muted-foreground tabular-nums">
              {current} / {needed} til Lvl {level + 1}
            </span>
          </div>
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded bg-muted">
            <div className="h-full bg-brand" style={{ width: `${pct}%` }} aria-hidden />
          </div>
          <div className="space-y-1">
            {SOURCE_ORDER.map((src) => {
              const v = bySource?.[src] ?? 0;
              return (
                <div key={src} className="flex items-baseline justify-between gap-2">
                  <span className="text-muted-foreground">{SOURCE_LABEL[src]}</span>
                  <span className="tabular-nums font-medium">{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lokal pulse-animasjon — kjører kun når .xpbar-pulse er aktiv,
          og kjører ikke i det hele tatt hvis prefers-reduced-motion. */}
      <style>{`
        @keyframes xpbar-pulse-kf {
          0% { transform: scale(1); box-shadow: 0 0 0 0 hsl(var(--brand) / 0.55); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 6px hsl(var(--brand) / 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 hsl(var(--brand) / 0); }
        }
        .xpbar-pulse { animation: xpbar-pulse-kf 0.7s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .xpbar-pulse { animation: none; }
        }
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
