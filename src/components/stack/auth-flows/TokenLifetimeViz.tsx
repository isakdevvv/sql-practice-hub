import { useMemo, useState } from "react";
import { AlertTriangle, ServerCog, Smartphone, Database, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// TokenLifetimeViz — visualiser hvor tokens lever og hvor lenge.
//
// Tre rader (klient / server / datastore) × tre kolonner (Session, JWT, OAuth).
// Per token-type: justerbar utløpstid og en simulert "tyveri ved t=0" som viser
// hvor lenge den stjålne tokenen er gyldig før revokering.
// ---------------------------------------------------------------------------

type TokenKind = "session" | "jwt-stateless" | "oauth-access" | "oauth-refresh";

type TokenConfig = {
  id: TokenKind;
  label: string;
  storage: "client" | "server" | "store";
  storageLabel: string;
  /** Hvor lenge gyldig — i sekunder, justerbart. */
  ttlSec: number;
  /** Kan den revokeres uten å vente på utløp? */
  revocable: boolean;
  /** Beskrivelse av hvordan revokering fungerer. */
  revokeNote: string;
  blurb: string;
};

const DEFAULT_CONFIG: Record<TokenKind, TokenConfig> = {
  session: {
    id: "session",
    label: "Session-cookie",
    storage: "store",
    storageLabel: "Server-side (Redis)",
    ttlSec: 60 * 60 * 24, // 1 dag
    revocable: true,
    revokeNote: "Slett raden i session-store → øyeblikkelig revokert.",
    blurb: "Cookien er bare en pekepinn. Hele staten ligger i server-store. Tap = slett rad.",
  },
  "jwt-stateless": {
    id: "jwt-stateless",
    label: "JWT (stateless)",
    storage: "client",
    storageLabel: "Klient (localStorage/cookie)",
    ttlSec: 60 * 60, // 1 time
    revocable: false,
    revokeNote:
      "Kan IKKE revokeres uten blacklist-DB. Standard løsning: hold exp kort + blacklist for nødtilfeller.",
    blurb:
      "Serveren har ingen state. En stjålet JWT er gyldig til exp uansett om brukeren bytter passord.",
  },
  "oauth-access": {
    id: "oauth-access",
    label: "OAuth access_token",
    storage: "client",
    storageLabel: "Klient (in-memory eller secure cookie)",
    ttlSec: 60 * 60, // 1 time
    revocable: false,
    revokeNote:
      "Access-tokens revokeres typisk IKKE (samme problem som JWT). Trygghet via kort exp + roterende refresh.",
    blurb:
      "Kortlevd. Klienten bruker den ved hver API-kall til access utløper — da hentes ny via refresh_token.",
  },
  "oauth-refresh": {
    id: "oauth-refresh",
    label: "OAuth refresh_token",
    storage: "store",
    storageLabel: "Auth-server-DB (klienten har kopi)",
    ttlSec: 60 * 60 * 24 * 30, // 30 dager
    revocable: true,
    revokeNote:
      "Lagret i auth-server-DB. Kan revokeres → ingen ny access kan fås. Token rotation (RFC 6819) oppdager også tyveri.",
    blurb:
      "Langlevd. Brukes til å hente nye access-tokens. Skal lagres MER sikkert (helst httpOnly+Secure).",
  },
};

const STORAGE_ICON: Record<TokenConfig["storage"], typeof Smartphone> = {
  client: Smartphone,
  server: ServerCog,
  store: Database,
};

const STORAGE_COLOR: Record<TokenConfig["storage"], string> = {
  client: "#0ea5e9",
  server: "#a855f7",
  store: "#f59e0b",
};

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec} s`;
  if (sec < 3600) return `${Math.round(sec / 60)} min`;
  if (sec < 86400) return `${Math.round(sec / 360) / 10} t`;
  return `${Math.round(sec / 8640) / 10} d`;
}

const TTL_PRESETS: { label: string; sec: number }[] = [
  { label: "5 min", sec: 5 * 60 },
  { label: "1 t", sec: 60 * 60 },
  { label: "1 d", sec: 60 * 60 * 24 },
  { label: "7 d", sec: 60 * 60 * 24 * 7 },
  { label: "30 d", sec: 60 * 60 * 24 * 30 },
  { label: "365 d", sec: 60 * 60 * 24 * 365 },
];

export function TokenLifetimeViz() {
  const [configs, setConfigs] = useState<Record<TokenKind, TokenConfig>>(DEFAULT_CONFIG);
  const [stolen, setStolen] = useState<TokenKind | null>(null);
  const [revokeAt, setRevokeAt] = useState(0); // sekunder etter tyveri

  const maxTtl = useMemo(
    () => Math.max(...Object.values(configs).map((c) => c.ttlSec)),
    [configs],
  );

  function setTtl(kind: TokenKind, sec: number) {
    setConfigs((c) => ({ ...c, [kind]: { ...c[kind], ttlSec: sec } }));
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Token-levetid
        </div>
        <div className="text-sm font-semibold">
          Hvor lever tokenet — og hvor lenge er en stjålet token gyldig?
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tidslinje */}
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Levetid-tidslinje (logaritmisk skala)
            </div>
            <div className="text-[10px] text-muted-foreground">
              Skala: 5 min → 1 år
            </div>
          </div>
          <div className="space-y-2.5">
            {(Object.keys(configs) as TokenKind[]).map((kind) => (
              <LifelineRow
                key={kind}
                cfg={configs[kind]}
                maxTtl={maxTtl}
                stolen={stolen === kind}
                onSteal={() => {
                  setStolen(kind);
                  setRevokeAt(0);
                }}
              />
            ))}
          </div>
          {stolen && (
            <div className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                <AlertTriangle className="h-3.5 w-3.5" /> Stjålet: {configs[stolen].label}
              </div>
              <p className="mt-1 text-rose-700 leading-snug">{configs[stolen].revokeNote}</p>
              {configs[stolen].revocable && (
                <div className="mt-2">
                  <label className="text-[10px] text-rose-700">
                    Tid før admin revokerer: <strong>{fmtDuration(revokeAt)}</strong>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={configs[stolen].ttlSec}
                    step={Math.max(1, Math.floor(configs[stolen].ttlSec / 60))}
                    value={revokeAt}
                    onChange={(e) => setRevokeAt(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-1 text-[10px] text-rose-700">
                    Angriper har tilgang i <strong>{fmtDuration(revokeAt)}</strong> før revokering.
                    Ved utløp uten revokering: <strong>{fmtDuration(configs[stolen].ttlSec)}</strong>.
                  </div>
                </div>
              )}
              {!configs[stolen].revocable && (
                <div className="mt-2 text-[10px] text-rose-700">
                  Ikke revokerbar uten ekstra infrastruktur. Angriper har full tilgang i{" "}
                  <strong>{fmtDuration(configs[stolen].ttlSec)}</strong>.
                </div>
              )}
              <button
                type="button"
                onClick={() => setStolen(null)}
                className="mt-2 text-[10px] underline text-rose-700"
              >
                Avslutt scenario
              </button>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.keys(configs) as TokenKind[]).map((kind) => {
            const cfg = configs[kind];
            const Icon = STORAGE_ICON[cfg.storage];
            return (
              <div key={kind} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" style={{ color: STORAGE_COLOR[cfg.storage] }} />
                  <div className="text-sm font-semibold">{cfg.label}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{cfg.storageLabel}</div>
                <p className="mt-1.5 text-[11px] leading-snug">{cfg.blurb}</p>
                <div className="mt-2">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Utløpstid: <strong>{fmtDuration(cfg.ttlSec)}</strong>
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {TTL_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setTtl(kind, p.sec)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          cfg.ttlSec === p.sec
                            ? "bg-brand text-brand-foreground border-brand"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-[10px]">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded ${
                      cfg.revocable
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {cfg.revocable ? "Revokerbar" : "Ikke revokerbar"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 leading-snug">
          <strong>Tommelfingerregel:</strong> hvis du IKKE kan revokere en token (stateless JWT),
          hold exp kort (≤ 15 min). Mister du den, har angriperen tilgang i hele exp-vinduet.
          Sessions og refresh-tokens kan revokeres på sekundet — derfor får de leve lenger.
        </div>
      </div>
    </div>
  );
}

function LifelineRow({
  cfg,
  maxTtl,
  stolen,
  onSteal,
}: {
  cfg: TokenConfig;
  maxTtl: number;
  stolen: boolean;
  onSteal: () => void;
}) {
  // Log-skala for å unngå at 30 d eter opp 5 min.
  const logTtl = Math.log10(cfg.ttlSec + 1);
  const logMax = Math.log10(maxTtl + 1);
  const widthPct = (logTtl / logMax) * 100;
  const color = STORAGE_COLOR[cfg.storage];
  const Icon = STORAGE_ICON[cfg.storage];

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="font-medium flex items-center gap-1">
          <Icon className="h-3 w-3" style={{ color }} />
          {cfg.label}
        </span>
        <span className="text-muted-foreground">
          gyldig i {fmtDuration(cfg.ttlSec)} · {cfg.revocable ? "revokerbar" : "ikke revokerbar"}
        </span>
      </div>
      <div className="relative h-5 bg-muted rounded-md overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${widthPct}%`,
            background: stolen ? "#dc2626" : color,
            opacity: stolen ? 0.85 : 0.7,
          }}
        />
        {stolen && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
            STJÅLET — gyldig {fmtDuration(cfg.ttlSec)}
          </div>
        )}
        <button
          type="button"
          onClick={onSteal}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded bg-background/90 border border-border hover:bg-background"
        >
          {stolen ? "Stjålet" : "Stjel"}
        </button>
      </div>
    </div>
  );
}
