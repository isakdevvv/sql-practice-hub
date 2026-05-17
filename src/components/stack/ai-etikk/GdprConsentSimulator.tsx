import { useMemo, useState } from "react";

// =======================================================================
// GdprConsentSimulator.tsx
// -----------------------------------------------------------------------
// Brukeren konfigurerer et simulert datainnsamlingsskjema og ser hvilke
// GDPR-prinsipper som overholdes eller brytes. "Dark pattern"-knapper viser
// vanlige fellesgreper man IKKE skal gjøre. Til slutt: right-to-explanation —
// se hva en bruker faktisk får ut av en black-box-modell, og hvorfor det
// ofte ikke er nok.
// =======================================================================

type Purpose = "marketing" | "personalisering" | "lovkrav" | "tjeneste";
type Lawful = "consent" | "contract" | "legal-obligation" | "legitimate-interest";

const GDPR_PRINSIPPER = [
  { id: "lawfulness", name: "Lovlighet", desc: "Du må ha et lovlig grunnlag (samtykke, kontrakt, ...)." },
  { id: "fairness", name: "Rettferdighet", desc: "Behandling skal være ikke-villedende for brukeren." },
  { id: "transparency", name: "Åpenhet", desc: "Bruker må forstå hva som skjer med dataene." },
  { id: "purpose", name: "Formålsbegrensning", desc: "Data samles til ett formål, brukes ikke til andre uten nytt grunnlag." },
  { id: "minimisation", name: "Dataminimering", desc: "Bare det som er strengt nødvendig samles." },
  { id: "accuracy", name: "Korrekthet", desc: "Data skal være riktige og oppdaterte." },
  { id: "storage", name: "Lagringsbegrensning", desc: "Data slettes når formålet er oppfylt." },
  { id: "integrity", name: "Integritet & konfidensialitet", desc: "Data beskyttes mot uautorisert tilgang." },
  { id: "accountability", name: "Ansvarlighet", desc: "Du må kunne dokumentere at du følger GDPR." },
] as const;

type PrinsippId = (typeof GDPR_PRINSIPPER)[number]["id"];

type DataType =
  | "navn"
  | "epost"
  | "ip"
  | "lokasjon"
  | "atferd"
  | "helse"
  | "betaling";

const DATA_TYPES: { id: DataType; label: string; sensitiv: boolean }[] = [
  { id: "navn", label: "Navn", sensitiv: false },
  { id: "epost", label: "E-post", sensitiv: false },
  { id: "ip", label: "IP-adresse", sensitiv: false },
  { id: "lokasjon", label: "GPS-lokasjon", sensitiv: true },
  { id: "atferd", label: "Atferdsdata (klikk)", sensitiv: false },
  { id: "helse", label: "Helse-/biometri-data", sensitiv: true },
  { id: "betaling", label: "Betalingsdetaljer", sensitiv: true },
];

type Storage = "30d" | "1y" | "5y" | "forever";

const STORAGE_LABEL: Record<Storage, string> = {
  "30d": "30 dager",
  "1y": "1 år",
  "5y": "5 år",
  forever: "ubegrenset",
};

type ConsentForm = "ja-nei" | "forhakede-bokser" | "granulert" | "uten-samtykke";

export function GdprConsentSimulator() {
  const [purpose, setPurpose] = useState<Purpose>("tjeneste");
  const [lawful, setLawful] = useState<Lawful>("consent");
  const [datas, setDatas] = useState<DataType[]>(["navn", "epost"]);
  const [storage, setStorage] = useState<Storage>("1y");
  const [consent, setConsent] = useState<ConsentForm>("granulert");
  const [transparent, setTransparent] = useState(true);
  const [encrypted, setEncrypted] = useState(true);
  const [reuseForMarketing, setReuseForMarketing] = useState(false);
  const [docExists, setDocExists] = useState(true);

  function toggleData(d: DataType) {
    setDatas((cur) =>
      cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d],
    );
  }

  function applyDarkPattern(p: string) {
    if (p === "forhakede") {
      setConsent("forhakede-bokser");
      setTransparent(false);
    } else if (p === "alt-eller-intet") {
      setConsent("ja-nei");
    } else if (p === "skjult-marketing") {
      setReuseForMarketing(true);
      setTransparent(false);
    } else if (p === "evig") {
      setStorage("forever");
    } else if (p === "alle-data") {
      setDatas(DATA_TYPES.map((d) => d.id));
    } else if (p === "uten-samtykke") {
      setConsent("uten-samtykke");
      setLawful("legitimate-interest");
    }
  }

  // Vurder hvert GDPR-prinsipp
  const violations = useMemo(() => {
    const brutt: Record<PrinsippId, string | null> = {
      lawfulness: null,
      fairness: null,
      transparency: null,
      purpose: null,
      minimisation: null,
      accuracy: null,
      storage: null,
      integrity: null,
      accountability: null,
    };
    if (consent === "uten-samtykke" && lawful === "consent") {
      brutt.lawfulness =
        "Du har valgt 'samtykke' som grunnlag, men skjemaet samler uten samtykke.";
    }
    if (consent === "forhakede-bokser") {
      brutt.fairness =
        "Forhakede samtykkebokser er ikke gyldig aktivt samtykke (EDPB Guidelines 05/2020).";
      brutt.lawfulness = "Samtykket er ikke informert og frivillig — ikke gyldig grunnlag.";
    }
    if (consent === "ja-nei") {
      brutt.fairness =
        "Alt-eller-intet-samtykke er som regel ikke gyldig — brukeren skal kunne velge granulert (per formål).";
    }
    if (!transparent) {
      brutt.transparency =
        "Personvernerklæring er enten skjult eller villedende. Bruker forstår ikke hva som skjer.";
    }
    if (reuseForMarketing && purpose !== "marketing") {
      brutt.purpose = `Data samlet til '${purpose}' brukes også til markedsføring uten nytt samtykke.`;
    }
    // Minimering: er det data som ikke trengs for formålet?
    const sensitivIDatas = datas.filter(
      (d) => DATA_TYPES.find((t) => t.id === d)?.sensitiv,
    );
    if (purpose === "tjeneste" && datas.includes("helse")) {
      brutt.minimisation =
        "Helsedata er sensitivt (art. 9) — krever eksplisitt samtykke + er ikke 'minimum' for vanlig tjeneste.";
    }
    if (purpose === "marketing" && (datas.includes("helse") || datas.includes("betaling"))) {
      brutt.minimisation =
        "Markedsføring trenger sjelden helse-/betalingsdetaljer — overinnsamling.";
    }
    if (datas.length >= 6) {
      brutt.minimisation =
        "Du samler ALT — typisk dataminimerings-brudd.";
    }
    if (storage === "forever") {
      brutt.storage = "Ubegrenset lagring bryter lagringsbegrensning.";
    }
    if (storage === "5y" && purpose === "marketing") {
      brutt.storage = "5 år er som regel for lenge for markedsføringsdata.";
    }
    if (!encrypted) {
      brutt.integrity =
        "Dataene lagres ukryptert. Bryter art. 32 om sikkerhet (særlig kritisk for sensitiv data).";
    }
    if (!docExists) {
      brutt.accountability =
        "Ingen intern dokumentasjon — du kan ikke vise til regulator at du følger GDPR.";
    }
    // sensitiv + ikke eksplisitt samtykke
    if (sensitivIDatas.length > 0 && lawful !== "consent") {
      brutt.lawfulness =
        "Sensitive kategorier (art. 9) krever som hovedregel eksplisitt samtykke.";
    }
    return brutt;
  }, [
    consent,
    transparent,
    reuseForMarketing,
    purpose,
    datas,
    storage,
    encrypted,
    docExists,
    lawful,
  ]);

  const numBroken = Object.values(violations).filter(Boolean).length;
  const score = Math.max(0, 9 - numBroken);
  const scoreColor =
    score >= 8 ? "text-success" : score >= 5 ? "text-amber-600 dark:text-amber-400" : "text-destructive";

  // Right-to-explanation: vis en "modellforklaring" som er useless
  const [explainScenario, setExplainScenario] = useState<"black-box" | "shap" | "rule-based">(
    "black-box",
  );
  const explanationByScenario: Record<typeof explainScenario, string> = {
    "black-box":
      "Vi kan dessverre ikke gi en konkret forklaring; vedtaket er basert på en avansert algoritme som tar mange faktorer i betraktning.",
    shap:
      "Topp-3 features som bidro mot lånet: inntekt (-0.18), tidligere mislighold (-0.12), postnummer (-0.07). Topp-3 som bidro for: alder på konto (+0.05), antall innskudd (+0.03), kontotype (+0.02).",
    "rule-based":
      "Lånet ble avslått fordi (1) lønn < 350 000 OG (2) gjeldsgrad > 0.6. Hvis ett av kriteriene endres, kan vedtaket revurderes — fyll inn klageskjema i kontoen din.",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Skjemakonfigurasjon */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Konfigurer datainnsamling
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Formål">
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as Purpose)}
                className="w-full text-xs rounded border border-border bg-background px-2 py-1.5"
              >
                <option value="tjeneste">Levere tjenesten</option>
                <option value="personalisering">Personalisering</option>
                <option value="marketing">Markedsføring</option>
                <option value="lovkrav">Oppfylle lovkrav</option>
              </select>
            </Field>
            <Field label="Lovlig grunnlag">
              <select
                value={lawful}
                onChange={(e) => setLawful(e.target.value as Lawful)}
                className="w-full text-xs rounded border border-border bg-background px-2 py-1.5"
              >
                <option value="consent">Samtykke (art. 6.1.a)</option>
                <option value="contract">Avtale (art. 6.1.b)</option>
                <option value="legal-obligation">Lovkrav (art. 6.1.c)</option>
                <option value="legitimate-interest">Berettiget interesse (art. 6.1.f)</option>
              </select>
            </Field>
            <Field label="Lagringstid">
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value as Storage)}
                className="w-full text-xs rounded border border-border bg-background px-2 py-1.5"
              >
                {(Object.keys(STORAGE_LABEL) as Storage[]).map((s) => (
                  <option key={s} value={s}>
                    {STORAGE_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Samtykke-form">
              <select
                value={consent}
                onChange={(e) => setConsent(e.target.value as ConsentForm)}
                className="w-full text-xs rounded border border-border bg-background px-2 py-1.5"
              >
                <option value="granulert">Granulert (én boks per formål)</option>
                <option value="ja-nei">Alt-eller-intet (én boks)</option>
                <option value="forhakede-bokser">Forhakede bokser</option>
                <option value="uten-samtykke">Ingen samtykke-spørsmål</option>
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Datatyper du samler
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DATA_TYPES.map((d) => {
                const on = datas.includes(d.id);
                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => toggleData(d.id)}
                    className={`text-[11px] rounded-md px-2 py-1 border ${
                      on
                        ? d.sensitiv
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-brand bg-brand/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.label}
                    {d.sensitiv && on && " ⚠"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
              />
              Personvernerklæring vist
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={encrypted}
                onChange={(e) => setEncrypted(e.target.checked)}
              />
              Kryptert lagring
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={reuseForMarketing}
                onChange={(e) => setReuseForMarketing(e.target.checked)}
              />
              Gjenbruk til marketing
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={docExists}
                onChange={(e) => setDocExists(e.target.checked)}
              />
              Intern dokumentasjon
            </label>
          </div>

          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-destructive font-semibold mb-1">
              Dark patterns — slik gjør du det IKKE
            </div>
            <div className="flex flex-wrap gap-1.5">
              <DarkBtn onClick={() => applyDarkPattern("forhakede")}>
                Sett alle bokser pre-haket
              </DarkBtn>
              <DarkBtn onClick={() => applyDarkPattern("alt-eller-intet")}>
                Tving "alt-eller-intet"
              </DarkBtn>
              <DarkBtn onClick={() => applyDarkPattern("skjult-marketing")}>
                Gjenbruk uten varsel
              </DarkBtn>
              <DarkBtn onClick={() => applyDarkPattern("evig")}>
                Lagre for alltid
              </DarkBtn>
              <DarkBtn onClick={() => applyDarkPattern("alle-data")}>
                Samle alt
              </DarkBtn>
              <DarkBtn onClick={() => applyDarkPattern("uten-samtykke")}>
                Hopp over samtykke
              </DarkBtn>
            </div>
          </div>
        </div>

        {/* Score-panel */}
        <div>
          <div className="rounded-lg border border-border bg-background p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              GDPR-score (9 prinsipper)
            </div>
            <div className={`text-4xl font-bold tabular-nums ${scoreColor}`}>
              {score}
              <span className="text-base text-muted-foreground font-normal">
                {" "}
                / 9
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {numBroken} prinsipp(er) brutt
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {GDPR_PRINSIPPER.map((p) => {
              const v = violations[p.id];
              return (
                <div
                  key={p.id}
                  className={`rounded-md border px-2.5 py-1.5 text-[11px] ${
                    v
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-success/30 bg-success/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        v ? "bg-destructive" : "bg-success"
                      }`}
                    />
                    <span className="font-medium text-foreground">{p.name}</span>
                  </div>
                  <div className="text-muted-foreground">{v ?? p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right to explanation */}
      <div className="mt-6 rounded-lg border border-brand/30 bg-brand/5 p-4">
        <div className="text-[10px] uppercase tracking-wider text-brand font-semibold mb-1">
          Retten til forklaring (art. 22)
        </div>
        <p className="text-sm mb-3">
          En bruker har fått låneavslag og krever en forklaring. Hvilken
          modell-arkitektur ga du dem?
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(["black-box", "shap", "rule-based"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setExplainScenario(s)}
              className={`text-xs rounded-md px-3 py-1.5 border ${
                explainScenario === s
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "black-box"
                ? "Deep net (black-box)"
                : s === "shap"
                  ? "Black-box + SHAP-forklaring"
                  : "Rule-based / lineær"}
            </button>
          ))}
        </div>
        <div className="rounded border border-border bg-background p-3 text-xs font-mono whitespace-pre-wrap">
          {explanationByScenario[explainScenario]}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {explainScenario === "black-box"
            ? "Tilfredsstiller IKKE art. 22 — bruker kan verken kontestere eller endre. Vanlig praksis i finansbransjen er fortsatt utilstrekkelig."
            : explainScenario === "shap"
              ? "Tekniske attribusjoner uten tolkbar handling. Bruker vet 'hvilke features bidro' men ikke 'hva må endres'. Ofte ikke nok juridisk."
              : "Tilfredsstiller art. 22: actionable + kontesterbar. Reduserer prediksjonskraft, men nødvendig for vedtak som rammer enkeltpersoner."}
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      {children}
    </label>
  );
}

function DarkBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] rounded-md px-2.5 py-1 border border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10"
    >
      {children}
    </button>
  );
}
