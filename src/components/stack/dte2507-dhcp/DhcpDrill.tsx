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
  title: string;
  prompt: string;
  context?: string;
  choices: Choice[];
  takeaway: string;
};

const QUESTIONS: Question[] = [
  {
    id: "discover-broadcast",
    title: "Hvorfor må Discover være broadcast?",
    prompt:
      "Klienten skal sende sin første DHCPDISCOVER. Hvorfor kan den ikke unicaste denne direkte til DHCP-serveren på 192.168.1.1?",
    choices: [
      {
        id: "no-ip-no-server",
        label:
          "Klienten har ingen IP enda OG kjenner ikke server-IP-en — den vet ikke en gang om en server finnes på linken.",
        isCorrect: true,
        explain:
          "Ja. Hele poenget med DHCP er å konfigurere klienten fra null. Den vet ikke sin egen IP, sin subnettmaske, sin gateway eller hvor DHCP-serveren ligger. Eneste alternativ er en L2-broadcast (255.255.255.255 + FF:FF:FF:FF:FF:FF) som alle på linken må behandle.",
      },
      {
        id: "ip-but-no-mac",
        label: "Klienten har IP, men mangler serverens MAC.",
        isCorrect: false,
        explain:
          "Nei — klienten har ikke IP. Det er nettopp det den prøver å skaffe seg. ARP løser IP→MAC, men ARP forutsetter at klienten har en IP å sende FRA.",
      },
      {
        id: "udp-rule",
        label: "UDP krever alltid broadcast.",
        isCorrect: false,
        explain:
          "Nei — UDP unicaster fint. Det er DHCP-spesifikt at den første pakken må kringkastes.",
      },
      {
        id: "performance",
        label:
          "Broadcast er raskere enn unicast på lokalnett.",
        isCorrect: false,
        explain:
          "Nei. Broadcast er ofte tregere fordi alle hosts på linken må prosessere rammen. Det handler om hva som er mulig, ikke hva som er raskt.",
      },
    ],
    takeaway:
      "DHCP er en bootstrap-protokoll. Den må fungere med null forhåndskunnskap — derfor broadcast.",
  },
  {
    id: "request-broadcast",
    title: "Hvorfor er REQUEST også broadcast?",
    prompt:
      "På et stort kontornett finnes det to DHCP-servere for redundans. Begge sendte hver sin OFFER til klienten. Hvorfor sender klienten REQUEST som broadcast i stedet for unicast til den ene serveren den valgte?",
    context:
      "Klienten har «valgt» én OFFER (typisk den første som kom inn) og må nå formelt akseptere den.",
    choices: [
      {
        id: "tell-losers",
        label:
          "For at TAPENDE servere skal se hvilken server-id som ble valgt og frigjøre IP-en de selv reserverte.",
        isCorrect: true,
        explain:
          "Riktig. REQUEST inneholder feltet «server-identifier». Hver server sjekker: er det MIN ID? Hvis ja → svar med ACK. Hvis nei → frigjør den reserverte IP-en og kast tilbudet. Uten broadcast ville taperne hatt en IP «hengende» til lease-OFFERED-timeout går ut.",
      },
      {
        id: "still-no-ip",
        label: "Klienten har fortsatt ikke fått ACK, så har ingen IP enda.",
        isCorrect: false,
        explain:
          "Delvis riktig premiss (klienten har faktisk ikke konfigurert IP-en enda), men ikke hovedgrunnen. Klienten KUNNE i prinsippet brukt OFFER-en sin tilbudte IP som source-IP. Hovedgrunnen er koordineringen mellom serverne.",
      },
      {
        id: "rfc-says-so",
        label: "RFC 2131 sier bare at det må være broadcast — uten grunn.",
        isCorrect: false,
        explain:
          "Nei. RFC 2131 spesifiserer det nettopp FORDI det løser server-koordineringen, og forklarer det eksplisitt.",
      },
      {
        id: "for-relay",
        label: "For å nå DHCP-relay-agenter på andre subnett.",
        isCorrect: false,
        explain:
          "Relay-agenter finnes, men relayet skjer uavhengig — agenten fanger broadcasten og videresender som unicast. Det er ikke grunnen til broadcasten i seg selv.",
      },
    ],
    takeaway:
      "Broadcast på REQUEST = koordinering mellom flere DHCP-servere. Taperne får beskjed om å frigjøre IP-ene de tilbød.",
  },
  {
    id: "lease-renewal",
    title: "Hva skjer ved lease-fornyelse?",
    prompt:
      "Klienten har en aktiv lease (BOUND-tilstand) med 24 timer remaining. Halve tiden går (12 timer). Hva gjør klienten nå?",
    context:
      "T1 = 50 % av lease (renewal-timer). T2 = 87,5 % (rebinding-timer).",
    choices: [
      {
        id: "unicast-request",
        label:
          "Sender en DHCPREQUEST som UNICAST direkte til serveren — klienten har jo IP nå, og kjenner serverens IP fra ACK-en.",
        isCorrect: true,
        explain:
          "Riktig. Ved T1 prøver klienten å fornye hos sin opprinnelige server som unicast. Får den ACK → lease utvidet, T1/T2 restartes. Hvis serveren er nede når T2 (87,5 %) treffes, faller klienten tilbake til broadcast (rebinding) for å finne en hvilken som helst server som vil ta over leasen.",
      },
      {
        id: "full-dora",
        label: "Kjører hele DORA-prosessen fra Discover på nytt.",
        isCorrect: false,
        explain:
          "Nei — det ville vært unødvendig broadcast-trafikk. Renewal er en optimalisert sti: bare REQUEST + ACK, og som unicast siden klienten allerede er ferdig konfigurert.",
      },
      {
        id: "nothing",
        label: "Ingenting før lease utløper.",
        isCorrect: false,
        explain:
          "Nei. Klienten må prøve å fornye FØR utløp, ellers risikerer den å miste IP-en mens en applikasjon kjører. T1 = 50 % gir rikelig tid til retry.",
      },
      {
        id: "release",
        label:
          "Sender DHCPRELEASE og kjører hele DORA på nytt.",
        isCorrect: false,
        explain:
          "RELEASE brukes ved frivillig fra-koblings — for eksempel når en mobil-klient bytter nett. Ikke ved fornyelse.",
      },
    ],
    takeaway:
      "Fornyelse = REQUEST+ACK unicast ved T1 (50 %). Først ved T2 (87,5 %) fallback til broadcast.",
  },
  {
    id: "udp-67-68",
    title: "Hvorfor to UDP-porter (67 og 68)?",
    prompt:
      "Hvorfor bruker DHCP to forskjellige well-known-porter — server på 67, klient på 68 — i stedet for én port slik HTTP gjør?",
    choices: [
      {
        id: "client-cant-filter",
        label:
          "Klienten har ikke IP — kan ikke filtrere på destinasjons-IP. To porter lar klienten ignorere kringkastinger som er ment for andre klienter (eller for servere som lytter på 67).",
        isCorrect: true,
        explain:
          "Riktig. Når en broadcast lander på linken må alle hosts åpne den. Med to porter slipper en DHCP-server å bli forvirret av broadcasts beregnet for klienter (port 68), og klienter kan ignorere annen server-til-server-trafikk (port 67).",
      },
      {
        id: "legacy",
        label: "Arv fra BOOTP, og DHCP måtte være bakoverkompatibel.",
        isCorrect: false,
        explain:
          "Delvis sant — DHCP arvet 67/68 fra BOOTP. Men selve grunnen til portskillet i BOOTP var allerede koden i forrige svar. Bakoverkompatibilitet forklarer hvorfor portene er akkurat 67/68, ikke hvorfor de er to.",
      },
      {
        id: "tcp-vs-udp",
        label: "Den ene porten er TCP, den andre UDP.",
        isCorrect: false,
        explain:
          "Nei. Begge er UDP. DHCP bruker ikke TCP — det ville krevd handshake og dermed IP-konfigurasjon før IP-konfigurasjon, en kylling-og-egg.",
      },
      {
        id: "security",
        label: "For å hindre spoofing.",
        isCorrect: false,
        explain:
          "Nei. To porter gir ingen autentisering. DHCP-spoofing er fortsatt et reelt problem (forsvar: DHCP snooping på switch).",
      },
    ],
    takeaway:
      "67 = server lytter. 68 = klient lytter. Skille på port lar broadcasts dirigeres til rett type lytter selv uten L3-adresse.",
  },
];

export function DhcpDrill() {
  const [questionId, setQuestionId] = useState(QUESTIONS[0].id);
  const [answered, setAnswered] = useState<Record<string, string>>({});

  const question = QUESTIONS.find((q) => q.id === questionId) ?? QUESTIONS[0];
  const chosenId = answered[questionId];
  const chosen = question.choices.find((c) => c.id === chosenId);

  function reset() {
    setAnswered({});
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          DHCP-drill
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
        {QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setQuestionId(q.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              questionId === q.id
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-card hover:border-brand/40 text-foreground"
            }`}
          >
            Q{i + 1}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold mb-1">{question.title}</h3>
          <p className="text-sm leading-relaxed">{question.prompt}</p>
          {question.context && (
            <p className="mt-2 text-[12px] text-muted-foreground italic leading-relaxed">
              {question.context}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {question.choices.map((c) => {
            const isChosen = chosenId === c.id;
            const showAsCorrect = chosenId && c.isCorrect;
            const showAsWrong = isChosen && !c.isCorrect;

            let cls = "border-border bg-card hover:border-brand/40";
            if (showAsCorrect) cls = "border-emerald-500/50 bg-emerald-500/5";
            else if (showAsWrong) cls = "border-red-500/50 bg-red-500/5";

            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setAnswered((a) => ({ ...a, [questionId]: c.id }))
                }
                disabled={!!chosenId}
                className={`w-full text-left rounded-md border px-3 py-2 transition-colors disabled:cursor-default ${cls}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm">{c.label}</div>
                  {chosenId && c.isCorrect && (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  {showAsWrong && (
                    <X className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
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
                {question.choices.find((c) => c.isCorrect)?.explain}
              </div>
            )}
          </div>
        )}

        {chosen && (
          <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-sm">
            <span className="font-semibold text-brand">Læringspoeng:</span>{" "}
            {question.takeaway}
          </div>
        )}
      </div>
    </div>
  );
}
