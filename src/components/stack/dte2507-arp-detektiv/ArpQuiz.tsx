import { useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

type Choice = {
  mac: string;
  label: string;
  isCorrect: boolean;
  explain: string;
};

type Scenario = {
  id: string;
  title: string;
  description: string;
  hosts: Array<{ name: string; ip: string; mac: string; role?: string }>;
  question: string;
  choices: Choice[];
  takeaway: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "same-subnet",
    title: "Scenario A — samme subnett",
    description:
      "Host A og Host B er på det samme subnettet (samme switch, samme broadcast-domene). A vil sende en IP-pakke til B.",
    hosts: [
      { name: "Host A", ip: "192.168.1.10", mac: "AA:AA:AA:AA:AA:AA", role: "sender" },
      { name: "Host B", ip: "192.168.1.20", mac: "BB:BB:BB:BB:BB:BB", role: "destinasjon" },
      { name: "Gateway-router", ip: "192.168.1.1", mac: "RR:RR:RR:RR:RR:RR", role: "gateway" },
    ],
    question:
      "Hvilken destinasjons-MAC legger Host A i Ethernet-rammen som inneholder IP-pakken til B?",
    choices: [
      {
        mac: "BB:BB:BB:BB:BB:BB",
        label: "Bs egen MAC",
        isCorrect: true,
        explain:
          "Riktig. Innenfor samme subnett bruker Ethernet destinasjonens faktiske MAC. ARP slår opp B.ip → B.mac.",
      },
      {
        mac: "RR:RR:RR:RR:RR:RR",
        label: "Routerens MAC",
        isCorrect: false,
        explain:
          "Feil. Routeren er kun involvert når trafikken skal forlate subnettet. Her er B på samme subnett.",
      },
      {
        mac: "FF:FF:FF:FF:FF:FF",
        label: "Broadcast-MAC",
        isCorrect: false,
        explain:
          "Feil. Broadcast brukes kun til ARP-forespørselen selv («hvem har 192.168.1.20?»), ikke den vanlige IP-rammen etter at MAC er funnet.",
      },
    ],
    takeaway:
      "Samme subnett ⇒ destinasjons-MAC i rammen er destinasjonens faktiske MAC. ARP løser direkte.",
  },
  {
    id: "cross-subnet",
    title: "Scenario B — over subnett (Kurose fig. 6.19)",
    description:
      "Host A er på Subnet 1 (192.168.1.0/24). Host C er på Subnet 2 (10.0.0.0/24). Gateway-routeren har én interface på hvert subnett. A vil sende til C.",
    hosts: [
      { name: "Host A", ip: "192.168.1.10", mac: "AA:AA:AA:AA:AA:AA", role: "sender (Subnet 1)" },
      { name: "Router (Subnet 1-side)", ip: "192.168.1.1", mac: "R1:R1:R1:R1:R1:R1", role: "gateway-IF1" },
      { name: "Router (Subnet 2-side)", ip: "10.0.0.1", mac: "R2:R2:R2:R2:R2:R2", role: "gateway-IF2" },
      { name: "Host C", ip: "10.0.0.50", mac: "CC:CC:CC:CC:CC:CC", role: "destinasjon (Subnet 2)" },
    ],
    question:
      "Hvilken MAC legger A i destinasjons-feltet i Ethernet-rammen?",
    choices: [
      {
        mac: "CC:CC:CC:CC:CC:CC",
        label: "Cs MAC (faktisk destinasjon)",
        isCorrect: false,
        explain:
          "Feil — og dette er kjernen i Kurose-eksemplet. Ethernet er linklag: en ramme krysser ÉN link av gangen. C ligger ikke på A sin link.",
      },
      {
        mac: "R1:R1:R1:R1:R1:R1",
        label: "Gateway-routerens MAC på Subnet 1-siden",
        isCorrect: true,
        explain:
          "Riktig. A ser at C ikke er i sitt eget subnett, ARP-er gatewayens IP (192.168.1.1), og legger gatewayens MAC i rammen. IP-headeren beholder Cs IP-adresse — det er bare linklags-adressen som er gateway-en.",
      },
      {
        mac: "R2:R2:R2:R2:R2:R2",
        label: "Routerens MAC på Subnet 2-siden",
        isCorrect: false,
        explain:
          "Feil. A kan ikke ARP-e en MAC som ligger på et annet subnett — ARP-meldinger sendes ikke over routere.",
      },
      {
        mac: "FF:FF:FF:FF:FF:FF",
        label: "Broadcast-MAC",
        isCorrect: false,
        explain:
          "Feil. Den endelige IP-rammen er unicast til gateway, ikke broadcast.",
      },
    ],
    takeaway:
      "Over subnett ⇒ destinasjons-MAC i rammen er GATEWAY-routerens MAC. IP-destinasjonen er fortsatt C. Routeren skifter destinasjons-MAC når den retransmitterer på Subnet 2-siden.",
  },
  {
    id: "arp-request",
    title: "Scenario C — ARP-forespørselen selv",
    description:
      "Host A vet IP-en til B (192.168.1.20) men har ingen MAC i cachen. A må kringkaste en ARP-forespørsel.",
    hosts: [
      { name: "Host A", ip: "192.168.1.10", mac: "AA:AA:AA:AA:AA:AA", role: "spør" },
      { name: "Host B", ip: "192.168.1.20", mac: "BB:BB:BB:BB:BB:BB", role: "skal svare" },
    ],
    question:
      "Hvilken destinasjons-MAC har selve ARP-forespørselen?",
    choices: [
      {
        mac: "FF:FF:FF:FF:FF:FF",
        label: "Broadcast (FF:FF:FF:FF:FF:FF)",
        isCorrect: true,
        explain:
          "Riktig. ARP-spørringen ER en kringkastet melding: «Hvem har 192.168.1.20?» Alle på subnettet ser den; bare B svarer (unicast).",
      },
      {
        mac: "BB:BB:BB:BB:BB:BB",
        label: "Bs MAC",
        isCorrect: false,
        explain:
          "Feil. Det er nettopp Bs MAC vi prøver å finne ut — A vet den ikke ennå.",
      },
      {
        mac: "00:00:00:00:00:00",
        label: "Null-MAC",
        isCorrect: false,
        explain:
          "Feil. Ethernet bruker FF:FF:FF:FF:FF:FF som broadcast, ikke null.",
      },
    ],
    takeaway:
      "ARP-forespørsel: broadcast. ARP-svar: unicast. Bare på samme subnett (link) — ARP krysser ikke routere.",
  },
];

export function ArpQuiz() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [answered, setAnswered] = useState<Record<string, string>>({});

  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId)!,
    [scenarioId],
  );

  const chosenMac = answered[scenarioId];
  const chosen = scenario.choices.find((c) => c.mac === chosenMac);

  function reset() {
    setAnswered({});
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          ARP-detektiven
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-card hover:border-brand/40"
        >
          <RotateCcw className="h-3 w-3" /> Nullstill svar
        </button>
      </div>

      <div className="border-b border-border bg-muted/10 px-4 py-2 flex gap-1.5 flex-wrap">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setScenarioId(s.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              scenarioId === s.id
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40 text-foreground"
            }`}
          >
            {s.title.split("—")[0].trim()}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold mb-1">{scenario.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {scenario.description}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Node</th>
                <th className="text-left font-semibold px-3 py-2 font-mono">IP</th>
                <th className="text-left font-semibold px-3 py-2 font-mono">MAC</th>
                <th className="text-left font-semibold px-3 py-2">Rolle</th>
              </tr>
            </thead>
            <tbody>
              {scenario.hosts.map((h) => (
                <tr key={h.name} className="border-t border-border">
                  <td className="px-3 py-2">{h.name}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">{h.ip}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">{h.mac}</td>
                  <td className="px-3 py-2 text-muted-foreground text-[12px]">{h.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <p className="font-semibold text-sm mb-2">{scenario.question}</p>
          <div className="space-y-2">
            {scenario.choices.map((c) => {
              const isChosen = chosenMac === c.mac;
              const isCorrect = c.isCorrect;
              const showAsCorrect = chosenMac && isCorrect;
              const showAsWrong = isChosen && !isCorrect;

              let cls = "border-border bg-card hover:border-brand/40";
              if (showAsCorrect) cls = "border-emerald-500/50 bg-emerald-500/5";
              else if (showAsWrong) cls = "border-red-500/50 bg-red-500/5";
              else if (chosenMac && isCorrect) cls = "border-emerald-500/40 bg-emerald-500/5";

              return (
                <button
                  key={c.mac}
                  type="button"
                  onClick={() =>
                    setAnswered((a) => ({ ...a, [scenarioId]: c.mac }))
                  }
                  disabled={!!chosenMac}
                  className={`w-full text-left rounded-md border px-3 py-2 transition-colors disabled:cursor-default ${cls}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[12px]">{c.mac}</div>
                      <div className="text-xs text-muted-foreground">{c.label}</div>
                    </div>
                    {chosenMac && isCorrect && (
                      <Check className="h-4 w-4 text-emerald-600" />
                    )}
                    {showAsWrong && <X className="h-4 w-4 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {chosen && (
          <div
            className={`rounded-md border p-3 text-sm ${
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
                <span className="font-mono">
                  {scenario.choices.find((c) => c.isCorrect)?.mac}
                </span>{" "}
                — {scenario.choices.find((c) => c.isCorrect)?.explain}
              </div>
            )}
          </div>
        )}

        {chosen && (
          <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-sm">
            <span className="font-semibold text-brand">Læringspoeng:</span>{" "}
            {scenario.takeaway}
          </div>
        )}
      </div>
    </div>
  );
}
