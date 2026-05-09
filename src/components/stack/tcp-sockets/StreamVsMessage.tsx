import { useState } from "react";
import { Button } from "@/components/ui/button";

const REQUEST_A = "GET /a HTTP/1.1\r\nHost: x\r\n\r\n";
const REQUEST_B = "GET /b HTTP/1.1\r\nHost: x\r\n\r\n";
const STREAM = REQUEST_A + REQUEST_B;

export function StreamVsMessage() {
  const [showBoundary, setShowBoundary] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-1">TCP er en stream — ikke meldinger</h3>
      <p className="text-sm text-muted-foreground mb-4">
        TCP gir deg bytes i riktig rekkefølge — men ingen «her slutter melding 1, her starter
        melding 2». Det må du finne ut selv.
      </p>

      {/* Bytes som ankommer */}
      <div className="rounded-lg bg-background border border-border p-4 mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Det du får fra <code>recv()</code>:
        </div>
        <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap break-all leading-relaxed">
          {showBoundary ? (
            <>
              <span className="bg-brand/15 text-foreground rounded px-0.5">
                {REQUEST_A.replace(/\r\n/g, "\\r\\n")}
              </span>
              <span className="text-brand mx-0.5">|</span>
              <span className="bg-success/15 text-foreground rounded px-0.5">
                {REQUEST_B.replace(/\r\n/g, "\\r\\n")}
              </span>
            </>
          ) : (
            <span className="text-foreground/85">
              {STREAM.replace(/\r\n/g, "\\r\\n")}
            </span>
          )}
        </pre>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {showBoundary
          ? "Skillet er der — men det er HTTP-protokollen som definerer at \\r\\n\\r\\n betyr «slutten av headere», ikke TCP."
          : "Hvor slutter request 1 og hvor starter request 2? TCP forteller deg ingenting om det."}
      </p>

      <Button size="sm" variant="outline" onClick={() => setShowBoundary((v) => !v)}>
        {showBoundary ? "Skjul skillet" : "Vis hvor HTTP definerer skillet"}
      </Button>

      <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
        <strong className="text-amber-700 dark:text-amber-400">Viktig:</strong>{" "}
        <code>recv(1024)</code> kan gi deg en halv request, en hel request, eller to gluet sammen.
        HTTP, JSON-lines og andre protokoller på toppen definerer sin egen «framing» (Content-Length,
        chunked, \r\n\r\n) for å vite når én melding er ferdig.
      </div>
    </div>
  );
}
