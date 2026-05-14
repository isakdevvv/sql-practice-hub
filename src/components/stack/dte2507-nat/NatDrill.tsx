import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

type Choice = {
  id: string;
  label: string;
  isCorrect: boolean;
  explain: string;
};

type Question = {
  id: string;
  prompt: string;
  context?: string;
  choices: Choice[];
};

const QUESTIONS: Question[] = [
  {
    id: "rfc1918",
    prompt: "Hvilken av disse adressene er IKKE en privat (RFC 1918) adresse?",
    choices: [
      {
        id: "10",
        label: "10.0.0.5",
        isCorrect: false,
        explain: "Privat. 10.0.0.0/8 er hele Class A reservert til intern bruk.",
      },
      {
        id: "172",
        label: "172.20.4.7",
        isCorrect: false,
        explain:
          "Privat. 172.16.0.0/12 dekker 172.16–172.31, så 172.20 er innenfor.",
      },
      {
        id: "192168",
        label: "192.168.1.5",
        isCorrect: false,
        explain: "Privat. 192.168.0.0/16 er reservert til hjemme- og småbedriftsnett.",
      },
      {
        id: "public",
        label: "138.40.50.60",
        isCorrect: true,
        explain:
          "Riktig. 138.40.50.60 ligger i et offentlig rutbart område og kan tildeles en ISP-kunde — typisk WAN-IP på en NAT-ruter.",
      },
    ],
  },
  {
    id: "kollisjon",
    prompt:
      "Host A (10.0.0.5:3345) og Host B (10.0.0.6:3345) åpner samtidig TCP til 1.2.3.4:80. Uten port-omskriving (kun IP-omskriving), hva er problemet?",
    choices: [
      {
        id: "ingen",
        label: "Ingen problem — IP-en alene er nok",
        isCorrect: false,
        explain:
          "Feil. Hvis ruteren bare bytter src-IP til sin egen WAN-IP, blir begge utgående pakker identiske (samme src-IP:port og samme dst-IP:port). Server-svaret kan ikke entydig tilbakespores.",
      },
      {
        id: "kollisjon",
        label:
          "Svarpakkene fra server matcher to interne hosts samtidig — ruteren vet ikke hvem som skal motta",
        isCorrect: true,
        explain:
          "Riktig. Dette er hele grunnen til NAPT/PAT: ruteren må også omskrive src-port til en unik verdi, slik at retur-pakkens dst-port entydig identifiserer hvilken intern host som var avsender.",
      },
      {
        id: "broadcast",
        label: "Pakken blir broadcast og når begge",
        isCorrect: false,
        explain:
          "Feil. Unicast-pakker går ikke til broadcast — problemet er at mappingen ikke er entydig, ikke at distribusjonen er feil.",
      },
    ],
  },
  {
    id: "ipsec",
    prompt:
      "Hvorfor bryter klassisk NAT med IPsec AH (Authentication Header) end-to-end?",
    choices: [
      {
        id: "kryptert",
        label: "Fordi NAT må dekryptere innholdet",
        isCorrect: false,
        explain:
          "Feil. NAT trenger ikke å dekryptere — problemet er ikke konfidensialitet, men integritet.",
      },
      {
        id: "hash",
        label:
          "AH inkluderer IP-headeren (src/dst-IP) i sin HMAC. NAT endrer src-IP, så hashen feiler på mottakerne",
        isCorrect: true,
        explain:
          "Riktig. AH signerer hele pakken inklusive uforanderlige IP-header-felter. Når NAT omskriver src-IP, blir signaturen ugyldig. Dette er hovedgrunnen til at IPsec stort sett kjøres med NAT-T (UDP-encapsulation) i dag.",
      },
      {
        id: "port",
        label: "Fordi IPsec ikke bruker port-numre",
        isCorrect: false,
        explain:
          "Delvis sant (IPsec er på lag 3, ikke transport), men det er ikke kjernen — kjernen er at NAT muterer header-felt som er kryptografisk signert.",
      },
    ],
  },
  {
    id: "e2e",
    prompt:
      "Hvilket arkitektur-prinsipp brytes når NAT skjuler interne hoster bak én offentlig IP?",
    choices: [
      {
        id: "e2e",
        label:
          "End-to-end-prinsippet — én vert kan ikke lenger initiere forbindelse direkte til en annen vert som ligger bak en NAT",
        isCorrect: true,
        explain:
          "Riktig. Internett ble designet slik at hvilken som helst vert kan kontakte hvilken som helst annen. NAT bryter dette: utenfra kan du bare nå hoster som først har sendt UT (eller som er eksplisitt port-forwardet). Dette er kjernekritikken i Saltzer/Reed/Clark.",
      },
      {
        id: "osi",
        label: "OSI-lagdelingen",
        isCorrect: false,
        explain:
          "NAT bryter også lagdelingen (en lag-3-boks som peker inn i lag-4-portnummer), men det er ikke det største problemet — det er end-to-end-tapet.",
      },
      {
        id: "ingen",
        label: "Ingen — NAT er bare en optimalisering",
        isCorrect: false,
        explain:
          "Feil. NAT har konkrete arkitektoniske kostnader. IPv6 ble designet bl.a. for å gi tilbake end-to-end-egenskapen ved å gi nok adresser til at NAT er unødvendig.",
      },
    ],
  },
];

export function NatDrill() {
  const [answered, setAnswered] = useState<Record<string, string>>({});

  function reset() {
    setAnswered({});
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Drill — tilstandsskifte
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill svar
        </button>
      </div>

      <div className="p-4 space-y-6">
        {QUESTIONS.map((q, idx) => {
          const chosenId = answered[q.id];
          const chosen = q.choices.find((c) => c.id === chosenId);
          return (
            <div key={q.id} className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-brand font-semibold">
                Spørsmål {idx + 1} av {QUESTIONS.length}
              </div>
              <p className="font-semibold text-sm">{q.prompt}</p>
              {q.context && (
                <p className="text-xs text-muted-foreground italic">
                  {q.context}
                </p>
              )}
              <div className="space-y-1.5">
                {q.choices.map((c) => {
                  const isChosen = chosenId === c.id;
                  const isCorrect = c.isCorrect;
                  const showAsCorrect = chosenId && isCorrect;
                  const showAsWrong = isChosen && !isCorrect;

                  let cls = "border-border bg-card hover:border-brand/40";
                  if (showAsCorrect)
                    cls = "border-emerald-500/50 bg-emerald-500/5";
                  else if (showAsWrong) cls = "border-red-500/50 bg-red-500/5";

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setAnswered((a) => ({ ...a, [q.id]: c.id }))
                      }
                      disabled={!!chosenId}
                      className={`w-full text-left rounded-md border px-3 py-2 transition-colors disabled:cursor-default text-sm ${cls}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{c.label}</span>
                        {chosenId && isCorrect && (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                        {showAsWrong && <X className="h-4 w-4 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {chosen && (
                <div
                  className={`rounded-md border p-3 text-xs ${
                    chosen.isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-red-500/40 bg-red-500/10 text-red-600"
                  }`}
                >
                  <div className="font-semibold mb-1">
                    {chosen.isCorrect ? "Riktig" : "Ikke helt"}
                  </div>
                  <div className="text-foreground">{chosen.explain}</div>
                  {!chosen.isCorrect && (
                    <div className="mt-2 text-foreground">
                      <strong>Riktig svar:</strong>{" "}
                      {q.choices.find((c) => c.isCorrect)?.label} —{" "}
                      {q.choices.find((c) => c.isCorrect)?.explain}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
