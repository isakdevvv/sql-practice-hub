import type { PyExercise } from "./types";

/**
 * Kurose & Ross 8. utg. — kvantitative Python-oppgaver (fase 1).
 *
 * 12 oppgaver som dekker hull i pensum med bokens egne regnestykker:
 *   1. Ende-til-ende-forsinkelse (Ch 1.4)
 *   2. Statistisk multipleksing — Monte Carlo (Ch 1.3)
 *   3. UDP-checksum (Ch 3.3)
 *   4. EWMA RTT-estimering (Ch 3.5.3)
 *   5. Stop-and-wait — alternating-bit-protokoll (Ch 3.4)
 *   6. Conditional GET-klient (Ch 2.2.5)
 *   7. NAT-tabell (Ch 4.3.3)
 *   8. Longest prefix match (Ch 4.3.2)
 *   9. Diffie-Hellman (Ch 8.2)
 *  10. HMAC vs naiv hash (Ch 8.3)
 *  11. CRC modulo-2 (Ch 6.2)
 *  12. Mini-CDN-resolver (Ch 2.6)
 *
 * Pyodide har ikke ekte sockets — der vi trenger I/O bruker vi mock-objekter.
 * Hver oppgave har assertions som verifiserer at studenten er ferdig.
 */
export const PY_KUROSE_EXERCISES: PyExercise[] = [
  // ------------------------------------------------------------
  // 1. Ende-til-ende-forsinkelse (Ch 1.4)
  // ------------------------------------------------------------
  {
    id: "py-kurose-end-to-end-delay",
    topic: "Kurose — Fysisk lag",
    title: "Ende-til-ende-forsinkelse over N lenker",
    description:
      "Kurose & Ross definerer nodal-forsinkelse som d_nodal = d_proc + d_queue + d_trans + d_prop (s. 35-37). " +
      "Vi forenkler ved å droppe køforsinkelsen og summere over alle N lenker. Skriv " +
      "nodal_delay(L, R, d, s, d_proc) som returnerer summen av prosesserings-, transmisjons- og propageringsforsinkelsen for én lenke, " +
      "og end_to_end(links, L, d_proc) som tar en liste med (R, d, s)-tuples for hver lenke og summerer.",
    requires: [],
    starter: `# Ende-til-ende-forsinkelse over N lenker.
# Vi ignorerer d_queue (køforsinkelse) som krever en trafikkmodell.
#
# d_trans  = L / R          (transmisjon — sek)
# d_prop   = d / s          (propagering — sek)
# d_nodal  = d_proc + d_trans + d_prop
#
# L      = pakkestørrelse (bits)
# R      = lenkebåndbredde (bits/s)
# d      = lenkelengde (meter)
# s      = signalhastighet (m/s, typisk 2.5e8)
# d_proc = ruter-prosesseringsforsinkelse (s, typisk 3e-3)

def nodal_delay(L, R, d, s, d_proc):
    # TODO: returner d_proc + d_trans + d_prop
    pass

def end_to_end(links, L, d_proc):
    """links = [(R1, d1, s1), (R2, d2, s2), ...] — summer nodal_delay over alle."""
    # TODO: summer over alle lenker
    pass


# Selv-test: L=12000 bit (1500 B), tre identiske lenker à 10 Mbps, 1000 km, 2.5e8 m/s.
L = 12000
links = [(10e6, 1_000_000, 2.5e8)] * 3
total = end_to_end(links, L, d_proc=3e-3)
print(f"Total delay: {total*1000:.3f} ms")

# Forventet per lenke: d_proc=3 ms, d_trans=12000/10e6=1.2 ms, d_prop=1e6/2.5e8=4 ms = 8.2 ms.
# Tre lenker => 24.6 ms.
assert abs(total - 0.0246) < 1e-6, f"Forventet 24.6 ms, fikk {total*1000:.3f} ms"

# Sjekk at LAN-lenker (lav d) domineres av d_trans, satellitt-lenker av d_prop.
lan = nodal_delay(12000, 100e6, 100, 2.5e8, d_proc=0)
sat = nodal_delay(12000, 100e6, 36_000_000, 2.5e8, d_proc=0)
assert lan < 1e-3, "LAN bør være under 1 ms"
assert sat > 0.1, "Geostasjonær satellitt bør være > 100 ms (propageringsdominert)"
print("OK")
`,
    solution: `def nodal_delay(L, R, d, s, d_proc):
    d_trans = L / R
    d_prop = d / s
    return d_proc + d_trans + d_prop

def end_to_end(links, L, d_proc):
    return sum(nodal_delay(L, R, d, s, d_proc) for (R, d, s) in links)
`,
    hints: [
      "d_trans = L / R (sekunder hvis L i bits og R i bits/s).",
      "d_prop = d / s (sekunder hvis d i meter og s i m/s).",
      "end_to_end bruker en for-løkke eller sum() over linkene.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 1.4 'Delay, Loss, and Throughput'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "Boken definerer d_nodal = d_proc + d_queue + d_trans + d_prop. Karavananalogien er pedagogikk-gull.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 2. Statistisk multipleksing — Monte Carlo (Ch 1.3)
  // ------------------------------------------------------------
  {
    id: "py-kurose-stat-mux-monte-carlo",
    topic: "Kurose — Fysisk lag",
    title: "Statistisk multipleksing — Monte Carlo",
    description:
      "Kurose & Ross's klassiske eksempel (s. 30-31): 35 brukere som hver er aktiv 10 % av tida. " +
      "Med kretssvitsjing får man kun plass til 10 samtidige. Med pakkesvitsjing er sannsynligheten " +
      "for at >10 er aktive samtidig under 0.04 %. Simuler dette med Monte Carlo og sammenlign med " +
      "den eksakte binomialsannsynligheten.",
    requires: [],
    starter: `import random
from math import comb

N = 35           # antall brukere
p = 0.10         # aktivitetsrate per bruker
K = 10           # maks samtidige som linka takler
TRIALS = 20000

def mc_p_overload(N, p, K, trials):
    """Andel av forsøk der > K brukere er samtidig aktive."""
    # TODO: i hvert forsøk, trekk N uavhengige Bernoulli(p)
    #       og tell hvor mange ganger antall aktive > K.
    pass

def binomial_p_overload(N, p, K):
    """Eksakt: P(X > K) der X ~ Binomial(N, p)."""
    # TODO: 1 - sum_{k=0..K} C(N,k) p^k (1-p)^(N-k)
    pass

random.seed(42)
mc = mc_p_overload(N, p, K, TRIALS)
exact = binomial_p_overload(N, p, K)
print(f"Monte Carlo (n={TRIALS}): P(>10 aktive) = {mc:.5f}")
print(f"Eksakt binomial:           P(>10 aktive) = {exact:.5f}")

# Boka sier < 0.04 % — vi er romslige fordi Monte Carlo har varians.
assert exact < 0.0005, "Boka oppgir < 0.04 % — eksakt-tallet bør stemme."
assert abs(mc - exact) < 0.002, "Monte Carlo bør ligge nær eksakt for n=20000."
print("OK — statistisk multipleksing slår kretssvitsjing.")
`,
    solution: `import random
from math import comb

def mc_p_overload(N, p, K, trials):
    overload = 0
    for _ in range(trials):
        active = sum(1 for _ in range(N) if random.random() < p)
        if active > K:
            overload += 1
    return overload / trials

def binomial_p_overload(N, p, K):
    cdf = sum(comb(N, k) * (p ** k) * ((1 - p) ** (N - k)) for k in range(K + 1))
    return 1.0 - cdf
`,
    hints: [
      "Bernoulli-trekning: random.random() < p teller som 'aktiv'.",
      "Tell antall aktive i hvert forsøk; del på antall forsøk for andel.",
      "Eksakt: bruk math.comb(N, k) og potens. Husk å summere k=0..K og trekke fra 1.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 1.3.2 'Packet Switching vs. Circuit Switching'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "Boken viser at packet switching takler 35 brukere på samme link som circuit switching gir kun 10 brukere — med < 0.04 % overlast.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 3. UDP-checksum (Ch 3.3)
  // ------------------------------------------------------------
  {
    id: "py-kurose-udp-checksum",
    topic: "Kurose — Transportlag",
    title: "UDP-checksum — 16-bit ord + wraparound",
    description:
      "Kurose & Ross beskriver UDP-checksum-algoritmen (s. 224-225): summer alle 16-bit-ord, " +
      "wrap rundt overflow tilbake til bit 0 (1-er-komplement-aritmetikk), og ta så 1-er-komplementet " +
      "av summen. Mottaker summerer ALLE 16-bit-ord inkludert checksum-feltet og forventer 0xFFFF.",
    requires: [],
    starter: `# UDP-checksum (forenklet — uten pseudo-header for IPv4).
# Boka's eksempel (s. 224): tre 16-bit ord
#   0110 0110 0110 0000
#   0101 0101 0101 0101
#   1000 1111 0000 1100
# Summen (med wraparound) er  0100 1010 1100 0010 = 0x4AC2.
# 1-er-komplementet av summen er checksum-feltet: 1011 0101 0011 1101 = 0xB53D.

def add16(a, b):
    """1-er-komplement-addisjon: legg til wraparound-carry tilbake i bit 0."""
    # TODO: vanlig sum, deretter (s & 0xFFFF) + (s >> 16) til carry er 0
    pass

def checksum(words):
    """Returner 16-bit 1-er-komplement-checksum av en liste 16-bit-ord."""
    # TODO: reduser med add16, ta så 1-er-komplement (~s & 0xFFFF)
    pass


# Test 1: kjent eksempel
words = [0b0110011001100000, 0b0101010101010101, 0b1000111100001100]
cs = checksum(words)
print(f"checksum = 0x{cs:04X}  ({cs:016b})")
assert cs == 0xB53D, f"Forventet 0xB53D, fikk 0x{cs:04X}"

# Test 2: mottaker — sum av ord + checksum skal gi 0xFFFF
verify = add16(add16(add16(words[0], words[1]), words[2]), cs)
assert verify == 0xFFFF, f"Verifikasjon feilet: 0x{verify:04X}"

# Test 3: enkel wraparound — to like ord på 0x8000 + 0x8000 = 0x10000 -> wraps til 0x0001
assert add16(0x8000, 0x8000) == 0x0001
print("OK — UDP-checksum-aritmetikk.")
`,
    solution: `def add16(a, b):
    s = a + b
    while s >> 16:
        s = (s & 0xFFFF) + (s >> 16)
    return s

def checksum(words):
    s = 0
    for w in words:
        s = add16(s, w)
    return (~s) & 0xFFFF
`,
    hints: [
      "1-er-komplement-addisjon: når summen overstiger 16 bit, legg carry-bittet tilbake i bit 0.",
      "Bruk while-løkke i add16: så lenge s >> 16 er ikke-null, fold over.",
      "Til slutt: ~s & 0xFFFF tar 16-bit 1-er-komplement.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 3.3.2 'UDP Checksum'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "End-to-end principle: lenkene gir CRC, men hopper-over-minne kan korrupere — derfor egen checksum på transportlaget.",
      },
      {
        title: "RFC 1071 — Computing the Internet Checksum",
        url: "https://www.rfc-editor.org/rfc/rfc1071",
        note: "Den offisielle beskrivelsen av 1-er-komplement-summeringen.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 4. EWMA RTT (Ch 3.5.3)
  // ------------------------------------------------------------
  {
    id: "py-kurose-ewma-rtt",
    topic: "Kurose — Transportlag",
    title: "EWMA RTT-estimering (Jacobson/Karels)",
    description:
      "Implementer Jacobson/Karels RTT-estimator fra Kurose & Ross s. 247-249. " +
      "EstimatedRTT_n = (1-α)·EstimatedRTT_{n-1} + α·SampleRTT_n med α=0.125. " +
      "DevRTT_n  = (1-β)·DevRTT_{n-1} + β·|SampleRTT - EstimatedRTT|  med β=0.25. " +
      "TimeoutInterval = EstimatedRTT + 4·DevRTT.",
    requires: [],
    starter: `# Jacobson/Karels — eksponentielt vektet glidende gjennomsnitt for RTT.
# Standardverdier definert i RFC 6298 og brukt i alle moderne TCP-stacker.

ALPHA = 0.125
BETA = 0.25

def estimate_rtt(samples):
    """Returnerer lister (estimated, devrtt, timeout) per sample, gitt en sekvens SampleRTT-målinger."""
    # TODO: init EstimatedRTT = samples[0], DevRTT = samples[0]/2
    # for hver påfølgende sample: oppdater EstimatedRTT, så DevRTT, så TimeoutInterval.
    pass


# Test: konstant RTT skal gi konvergens
samples = [100, 100, 100, 100, 100, 100]
e, d, t = estimate_rtt(samples)
print(f"konvergens: estimated[-1]={e[-1]:.3f}, dev[-1]={d[-1]:.3f}, timeout[-1]={t[-1]:.3f}")
assert abs(e[-1] - 100) < 0.001
assert d[-1] < 30  # devRTT skal krympe mot 0
assert t[-1] < 250

# Test: en hopp i RTT skal påvirke timeout (ikke umiddelbart, men over tid)
samples2 = [100, 100, 100, 100, 200, 200, 200, 200]
e2, d2, t2 = estimate_rtt(samples2)
print(f"etter hopp: estimated={e2[-1]:.1f}, devRTT={d2[-1]:.1f}, timeout={t2[-1]:.1f}")
# Estimatoren har α=0.125 så den drar seg sakte oppover.
assert 100 < e2[-1] < 200
# DevRTT har økt fordi avstanden mellom sample og estimat var stor en stund.
assert d2[-1] > d[-1]
print("OK")
`,
    solution: `ALPHA = 0.125
BETA = 0.25

def estimate_rtt(samples):
    if not samples:
        return [], [], []
    estimated = [samples[0]]
    dev = [samples[0] / 2]
    timeout = [estimated[0] + 4 * dev[0]]
    for s in samples[1:]:
        e_new = (1 - ALPHA) * estimated[-1] + ALPHA * s
        d_new = (1 - BETA) * dev[-1] + BETA * abs(s - estimated[-1])
        estimated.append(e_new)
        dev.append(d_new)
        timeout.append(e_new + 4 * d_new)
    return estimated, dev, timeout
`,
    hints: [
      "Oppdater rekkefølge: bruk gammel EstimatedRTT i DevRTT-formelen FØR du oppdaterer EstimatedRTT.",
      "DevRTT bruker absoluttverdi: abs(SampleRTT - EstimatedRTT).",
      "TimeoutInterval = EstimatedRTT + 4·DevRTT — sikkerhetsmargin på 4 standardavvik.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 3.5.3 'Round-Trip Time Estimation and Timeout'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "EWMA-vekter velges slik at nyere målinger teller mer enn eldre. α=0.125, β=0.25 er anbefalt i RFC 6298.",
      },
      {
        title: "RFC 6298 — Computing TCP's Retransmission Timer",
        url: "https://www.rfc-editor.org/rfc/rfc6298",
        note: "Offisiell algoritmebeskrivelse inkludert minimum-RTO=1s og Karn-regel.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 5. Stop-and-wait (Ch 3.4)
  // ------------------------------------------------------------
  {
    id: "py-kurose-stop-and-wait",
    topic: "Kurose — Transportlag",
    title: "Stop-and-wait — alternating-bit-protokoll",
    description:
      "Implementer rdt3.0-aktig alternating-bit-protokoll mot en mock-kanal som mister enkelte pakker. " +
      "Avsender bytter sekvensnummer 0↔1 mellom hver vellykket overføring og venter på ACK. " +
      "Ved timeout retransmitterer den siste pakka. Se Kurose & Ross s. 209-213.",
    requires: [],
    starter: `# Stop-and-wait-avsender mot mock-kanal som taper hver tredje pakke.
# Pyodide har ikke ekte nett — vi simulerer kanalen som en liste-baserte kø.

class LossyChannel:
    """Mister hvert tap_every'te pakke som sendes. Returnerer ACK ellers."""
    def __init__(self, tap_every=3):
        self.tap_every = tap_every
        self.sent = 0
        self.received = []   # mottatte pakker (data, seq)

    def send(self, data, seq):
        self.sent += 1
        if self.sent % self.tap_every == 0:
            return None   # tapt
        self.received.append((data, seq))
        return ("ACK", seq)


def stop_and_wait(messages, channel, max_attempts=10):
    """Send hver melding pålitelig over en upålitelig kanal.

    Returnerer antall *forsøk* totalt (inkl. retransmits)."""
    # TODO:
    # 1. seq starter på 0.
    # 2. For hver melding: send (msg, seq), vent på ACK.
    #    Hvis None (tap) eller feil seq: retransmitter.
    # 3. Når ACK ok: flip seq = 1 - seq, gå videre.
    # 4. max_attempts forhindrer evig løkke i tester.
    pass


# Selv-test
ch = LossyChannel(tap_every=3)
attempts = stop_and_wait(["A", "B", "C", "D"], ch)
print(f"attempts={attempts}, received={ch.received}")

# Alle 4 meldinger må komme fram, og i riktig rekkefølge.
data_only = [m for (m, _) in ch.received]
assert data_only == ["A", "B", "C", "D"], f"Feil leveranse: {data_only}"

# Sekvensnumrene skal alternere 0,1,0,1.
seqs = [s for (_, s) in ch.received]
assert seqs == [0, 1, 0, 1], f"Feil seq-rekkefølge: {seqs}"

# Minst én retransmit skal ha skjedd (kanalen mister hver 3.).
assert attempts > 4
print("OK — alternating-bit fungerer mot 33 % tap.")
`,
    solution: `class LossyChannel:
    def __init__(self, tap_every=3):
        self.tap_every = tap_every
        self.sent = 0
        self.received = []
    def send(self, data, seq):
        self.sent += 1
        if self.sent % self.tap_every == 0:
            return None
        self.received.append((data, seq))
        return ("ACK", seq)

def stop_and_wait(messages, channel, max_attempts=10):
    seq = 0
    total_attempts = 0
    for msg in messages:
        for _ in range(max_attempts):
            total_attempts += 1
            ack = channel.send(msg, seq)
            if ack is not None and ack == ("ACK", seq):
                break
        else:
            raise RuntimeError(f"Maks forsøk for {msg!r}")
        seq = 1 - seq
    return total_attempts
`,
    hints: [
      "Bruk en indre while-løkke: send + sjekk ACK; bryt når ACK matcher gjeldende seq.",
      "Etter at en melding er ack-et, flipper du seq = 1 - seq før neste melding.",
      "Tell totalt antall send-forsøk — dette inkluderer retransmits.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 3.4 'Principles of Reliable Data Transfer'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "rdt1.0 → rdt2.0 → rdt2.1 → rdt3.0: ett problem av gangen. Alternating-bit er rdt3.0 over en kanal med tap.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 6. Conditional GET (Ch 2.2.5)
  // ------------------------------------------------------------
  {
    id: "py-kurose-conditional-get",
    topic: "Kurose — Applikasjonslag",
    title: "Conditional GET — If-Modified-Since",
    description:
      "Web-cacher unngår unødig datatrafikk ved å sende en HTTP GET med If-Modified-Since-header. " +
      "Serveren svarer 304 Not Modified (uten body) hvis ressursen er uendret, ellers 200 OK med ny body. " +
      "Se Kurose & Ross s. 115-116. Bygg en klient som tar avgjørelsen.",
    requires: [],
    starter: `# Conditional GET-klient mot en mock-server.

class MockHTTPServer:
    """Returnerer 304 hvis If-Modified-Since >= last_modified, ellers 200."""
    def __init__(self, body, last_modified):
        self.body = body
        self.last_modified = last_modified

    def request(self, headers):
        ims = headers.get("If-Modified-Since")
        if ims is not None and ims >= self.last_modified:
            return {"status": 304, "headers": {"Last-Modified": self.last_modified}, "body": b""}
        return {
            "status": 200,
            "headers": {"Last-Modified": self.last_modified, "Content-Length": str(len(self.body))},
            "body": self.body,
        }


class ConditionalCache:
    def __init__(self):
        self.body = None
        self.last_modified = None

    def fetch(self, server):
        """Hent fra server. Returner body. Bruk If-Modified-Since hvis vi har en kopi."""
        # TODO:
        # 1. Bygg headers — legg til If-Modified-Since hvis vi har en cached last_modified.
        # 2. Kall server.request(headers).
        # 3. Hvis 304: returner cached body (uendret).
        # 4. Hvis 200: oppdater self.body + self.last_modified, returner body.
        pass


# Selv-test
server = MockHTTPServer(body=b"<html>hei</html>", last_modified="Wed, 09 May 2026 12:00:00 GMT")
cache = ConditionalCache()

# Første GET — ingen cache => 200.
body1 = cache.fetch(server)
assert body1 == b"<html>hei</html>"
assert cache.last_modified == "Wed, 09 May 2026 12:00:00 GMT"

# Andre GET — server er uendret => 304, men cache returnerer body lokalt.
body2 = cache.fetch(server)
assert body2 == b"<html>hei</html>"

# Server oppdaterer ressursen — neste GET får 200 med ny body.
server.body = b"<html>oppdatert</html>"
server.last_modified = "Wed, 10 May 2026 09:00:00 GMT"
body3 = cache.fetch(server)
assert body3 == b"<html>oppdatert</html>"
assert cache.last_modified == "Wed, 10 May 2026 09:00:00 GMT"
print("OK — conditional GET sparer båndbredde.")
`,
    solution: `class ConditionalCache:
    def __init__(self):
        self.body = None
        self.last_modified = None

    def fetch(self, server):
        headers = {}
        if self.last_modified is not None:
            headers["If-Modified-Since"] = self.last_modified
        resp = server.request(headers)
        if resp["status"] == 304:
            return self.body
        # 200 — oppdater cache
        self.body = resp["body"]
        self.last_modified = resp["headers"].get("Last-Modified")
        return self.body
`,
    hints: [
      "Bare send If-Modified-Since hvis du faktisk har en kopi (cache.last_modified er ikke None).",
      "304 betyr: behold lokal kopi. 200 betyr: erstatt lokal kopi.",
      "Husk å oppdatere både self.body og self.last_modified ved 200-svar.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 2.2.5 'Conditional GET'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "Kjerneoptimering for web-cacher. Sparer båndbredde når ressurser sjelden endres.",
      },
      {
        title: "RFC 7232 — HTTP/1.1 Conditional Requests",
        url: "https://www.rfc-editor.org/rfc/rfc7232",
        note: "Beskriver If-Modified-Since, If-None-Match (ETag) og 304-responsen.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 7. NAT-tabell (Ch 4.3.3)
  // ------------------------------------------------------------
  {
    id: "py-kurose-nat-table",
    topic: "Kurose — Nettverkslag",
    title: "NAT-tabell — WAN↔LAN port-rewriting",
    description:
      "NAT-routeren (Network Address Translation) skriver om kilde-/destinasjons-IP og -port mellom " +
      "et privat LAN og det offentlige Internett. Implementer translate(packet, table) som håndterer " +
      "begge retninger, og allokerer ledige porter i området 1024-65535. Se Kurose & Ross s. 343-346.",
    requires: [],
    starter: `# NAT-tabell.
# En pakke har {"src_ip", "src_port", "dst_ip", "dst_port", "direction"}
# direction = "out" (LAN -> WAN) eller "in" (WAN -> LAN).
# WAN-IP til routeren er konstant. LAN er 10.0.0.x.

WAN_IP = "138.76.29.7"
PORT_MIN = 1024
PORT_MAX = 65535


class NATTable:
    def __init__(self):
        # Mapping (lan_ip, lan_port) <-> wan_port
        self.lan_to_wan = {}   # (lan_ip, lan_port) -> wan_port
        self.wan_to_lan = {}   # wan_port -> (lan_ip, lan_port)
        self.next_port = PORT_MIN

    def _allocate_port(self):
        """Finn neste ledige port i [PORT_MIN, PORT_MAX]."""
        # TODO: skann forover fra self.next_port til vi finner en ledig.
        # Raise RuntimeError hvis ingen er ledig.
        pass

    def translate(self, pkt):
        """Returner en NY pakke med oversatte adresser, eller None hvis pakka droppes."""
        # TODO:
        # direction == "out": allokér wan_port for (src_ip, src_port) hvis ikke finnes,
        #                     skriv om src_ip -> WAN_IP, src_port -> wan_port.
        # direction == "in":  slå opp dst_port i wan_to_lan; hvis ukjent -> drop.
        #                     skriv om dst_ip -> lan_ip, dst_port -> lan_port.
        pass


# Selv-test
nat = NATTable()

# 1. To LAN-host åpner forbindelse mot offentlig server.
out1 = nat.translate({"src_ip": "10.0.0.1", "src_port": 3345,
                      "dst_ip": "128.119.40.186", "dst_port": 80, "direction": "out"})
out2 = nat.translate({"src_ip": "10.0.0.2", "src_port": 3345,
                      "dst_ip": "128.119.40.186", "dst_port": 80, "direction": "out"})

assert out1["src_ip"] == WAN_IP
assert out2["src_ip"] == WAN_IP
# To LAN-host med SAMME src_port må mappes til to FORSKJELLIGE wan_port.
assert out1["src_port"] != out2["src_port"], "NAT må allokere unike wan-porter."

# 2. Svar fra server tilbake — riktig pakke til riktig LAN-host.
in1 = nat.translate({"src_ip": "128.119.40.186", "src_port": 80,
                     "dst_ip": WAN_IP, "dst_port": out1["src_port"], "direction": "in"})
assert in1["dst_ip"] == "10.0.0.1"
assert in1["dst_port"] == 3345

in2 = nat.translate({"src_ip": "128.119.40.186", "src_port": 80,
                     "dst_ip": WAN_IP, "dst_port": out2["src_port"], "direction": "in"})
assert in2["dst_ip"] == "10.0.0.2"

# 3. Pakke til en port vi aldri har sett -> drop.
drop = nat.translate({"src_ip": "128.119.40.186", "src_port": 80,
                      "dst_ip": WAN_IP, "dst_port": 9999, "direction": "in"})
assert drop is None, "Ukjent port skal droppes (ingen connection setup)."

print("OK — NAT-router er stateful pakke-omskriver.")
`,
    solution: `WAN_IP = "138.76.29.7"
PORT_MIN = 1024
PORT_MAX = 65535


class NATTable:
    def __init__(self):
        self.lan_to_wan = {}
        self.wan_to_lan = {}
        self.next_port = PORT_MIN

    def _allocate_port(self):
        start = self.next_port
        for _ in range(PORT_MAX - PORT_MIN + 1):
            p = self.next_port
            self.next_port = PORT_MIN if self.next_port >= PORT_MAX else self.next_port + 1
            if p not in self.wan_to_lan:
                return p
        raise RuntimeError("Ingen ledige NAT-porter")

    def translate(self, pkt):
        if pkt["direction"] == "out":
            key = (pkt["src_ip"], pkt["src_port"])
            wan_port = self.lan_to_wan.get(key)
            if wan_port is None:
                wan_port = self._allocate_port()
                self.lan_to_wan[key] = wan_port
                self.wan_to_lan[wan_port] = key
            return {
                "src_ip": WAN_IP, "src_port": wan_port,
                "dst_ip": pkt["dst_ip"], "dst_port": pkt["dst_port"],
                "direction": "out",
            }
        # direction == "in"
        mapping = self.wan_to_lan.get(pkt["dst_port"])
        if mapping is None:
            return None
        lan_ip, lan_port = mapping
        return {
            "src_ip": pkt["src_ip"], "src_port": pkt["src_port"],
            "dst_ip": lan_ip, "dst_port": lan_port,
            "direction": "in",
        }
`,
    hints: [
      "To dicts: én fra (lan_ip, lan_port) til wan_port, og en omvendt for raskt oppslag begge veier.",
      "Hvis en LAN-host sender en pakke på et flow vi allerede har, gjenbruk samme wan-port.",
      "Inn-pakke uten matchende mapping skal returnere None (droppes).",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 4.3.3 'Network Address Translation (NAT)'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "NAT er kontroversielt: bryter end-to-end principle, gjør P2P vanskelig, men avlaster IPv4-adresseromm.",
      },
      {
        title: "RFC 4787 — NAT Behavioral Requirements for Unicast UDP",
        url: "https://www.rfc-editor.org/rfc/rfc4787",
        note: "Definerer endpoint-independent mapping, port preservation, og hvordan god NAT-implementasjon skal oppføre seg.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 8. Longest prefix match (Ch 4.3.2)
  // ------------------------------------------------------------
  {
    id: "py-kurose-longest-prefix",
    topic: "Kurose — Nettverkslag",
    title: "Longest prefix match — forwarding-tabell",
    description:
      "Routere bruker longest-prefix-matching på destinasjons-IPen for å velge utgående interface. " +
      "Se Kurose & Ross s. 333-335. Implementer lookup(dest_ip, table) der table er en liste " +
      "[(prefix_cidr, interface)] — returner interfaceet med det lengste prefikset som matcher.",
    requires: [],
    starter: `def ip_to_int(ip):
    """Konverter '192.168.1.1' til 32-bit int."""
    parts = [int(p) for p in ip.split(".")]
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]


def lookup(dest_ip, table):
    """Returner interface med lengste matchende prefiks, eller None hvis ingen match.

    table = [(prefix_cidr, interface), ...]
    prefix_cidr-format: '11001000 00010111 00010000 00000000/21' eller '200.23.16.0/21'.
    Vi støtter sistnevnte (dotted-decimal / lengde).
    """
    # TODO:
    # 1. ip_int = ip_to_int(dest_ip)
    # 2. For hver (prefix_cidr, iface):
    #    a. Split på '/', få prefix_ip og prefix_len.
    #    b. Bygg maske: 0 hvis len==0, ellers (0xffffffff << (32 - len)) & 0xffffffff
    #    c. Hvis (ip_int & mask) == (prefix_int & mask): kandidat.
    # 3. Returner kandidaten med STØRST prefix_len.
    pass


# Selv-test — Kurose-eksempel s. 334
table = [
    ("200.23.16.0/21", "if0"),
    ("200.23.18.0/23", "if1"),
    ("200.23.24.0/21", "if2"),
    ("0.0.0.0/0",      "default"),
]

# 200.23.18.5 ligger i BÅDE /21 og /23 — /23 er lengst, må vinne.
assert lookup("200.23.18.5",  table) == "if1"
# 200.23.16.5 matcher kun /21.
assert lookup("200.23.16.5",  table) == "if0"
# Ut av alle eksplisitte prefiks — default-rute.
assert lookup("8.8.8.8",      table) == "default"
# 200.23.24.99 matcher den siste /21.
assert lookup("200.23.24.99", table) == "if2"
print("OK — longest-prefix-matching.")
`,
    solution: `def ip_to_int(ip):
    parts = [int(p) for p in ip.split(".")]
    return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]


def lookup(dest_ip, table):
    ip_int = ip_to_int(dest_ip)
    best_iface = None
    best_len = -1
    for prefix_cidr, iface in table:
        prefix_ip_str, prefix_len_str = prefix_cidr.split("/")
        prefix_len = int(prefix_len_str)
        prefix_int = ip_to_int(prefix_ip_str)
        mask = 0 if prefix_len == 0 else (0xFFFFFFFF << (32 - prefix_len)) & 0xFFFFFFFF
        if (ip_int & mask) == (prefix_int & mask):
            if prefix_len > best_len:
                best_len = prefix_len
                best_iface = iface
    return best_iface
`,
    hints: [
      "Konverter IP til 32-bit int — bit-shift på oktetene.",
      "Maske: (0xFFFFFFFF << (32 - prefix_len)) & 0xFFFFFFFF. Pass på spesialtilfellet /0.",
      "Iterer tabellen, hold styr på best prefix_len som matcher — det er svaret.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 4.3.2 'Forwarding'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "Boken viser at forwarding-tabellen lagrer prefiks-ranger, ikke individuelle adresser. Lengste match vinner.",
      },
      {
        title: "RFC 4632 — CIDR",
        url: "https://www.rfc-editor.org/rfc/rfc4632",
        note: "Classless Inter-Domain Routing — bakgrunnen for hvorfor prefiks-lengde varierer fritt.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 9. Diffie-Hellman (Ch 8.2)
  // ------------------------------------------------------------
  {
    id: "py-kurose-diffie-hellman",
    topic: "Kurose — Sikkerhet",
    title: "Diffie-Hellman key exchange",
    description:
      "Alice og Bob avtaler en delt nøkkel over en åpen kanal uten å sende selve nøkkelen. " +
      "De avtaler p (primtall) og g (generator). Alice velger hemmelig S_A og sender T_A = g^S_A mod p. " +
      "Bob velger hemmelig S_B og sender T_B = g^S_B mod p. Begge regner ut S = T_B^S_A = T_A^S_B mod p. " +
      "Se Kurose & Ross s. 632-633.",
    requires: [],
    starter: `# Diffie-Hellman med små eksempel-tall.
# (Ekte DH bruker p på 2048 bit; vi bruker p=11, g=2 så vi kan regne for hånd.)

def dh_public(g, secret, p):
    """T = g^secret mod p — sendes over kanalen."""
    # TODO: bruk innebygd pow(base, exp, mod)
    pass

def dh_shared(received, secret, p):
    """S = received^secret mod p — den felles nøkkelen."""
    # TODO
    pass


# Selv-test 1: bokens tall (p=11, g=2, S_A=5, S_B=12)
p, g = 11, 2
S_A, S_B = 5, 12
T_A = dh_public(g, S_A, p)
T_B = dh_public(g, S_B, p)
print(f"T_A = {T_A}, T_B = {T_B}")

# Alice regner ut delt nøkkel
S_alice = dh_shared(T_B, S_A, p)
# Bob regner ut delt nøkkel
S_bob = dh_shared(T_A, S_B, p)

print(f"S_alice = {S_alice}, S_bob = {S_bob}")
assert S_alice == S_bob, "Alice og Bob må komme fram til SAMME hemmelige nøkkel."

# Bokens svar: T_A = 2^5 mod 11 = 32 mod 11 = 10
#              T_B = 2^12 mod 11 = 4096 mod 11 = 4
#              S = 4^5 mod 11 = 10^12 mod 11 = 1
assert T_A == 10
assert T_B == 4
assert S_alice == 1

# Selv-test 2: andre tall — sjekk at delt nøkkel er deterministisk og lik.
p2, g2 = 23, 5
S_alice2 = dh_shared(dh_public(g2, 6, p2), 15, p2)
S_bob2 = dh_shared(dh_public(g2, 15, p2), 6, p2)
assert S_alice2 == S_bob2
print("OK — Diffie-Hellman, en av kryptografiens mest elegante triks.")
`,
    solution: `def dh_public(g, secret, p):
    return pow(g, secret, p)

def dh_shared(received, secret, p):
    return pow(received, secret, p)
`,
    hints: [
      "pow(base, exp, mod) i Python er effektiv modulær eksponentiering.",
      "Begge formler er pow(g, secret, p) — bare basen er forskjellig: g eller mottatt verdi.",
      "Magien: (g^S_A)^S_B = g^(S_A·S_B) = (g^S_B)^S_A. Mod p endrer ingenting.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 8.2.2 'Diffie-Hellman Key Exchange'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "Sikkerheten hviler på diskret-logaritme-problemet: gitt g, p og g^x mod p er det vanskelig å finne x.",
      },
      {
        title: "RFC 7919 — Negotiated FFDHE Parameters for TLS",
        url: "https://www.rfc-editor.org/rfc/rfc7919",
        note: "Standardiserte 'safe primes' for TLS-Diffie-Hellman — du skal IKKE generere egne p i prod.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 10. HMAC vs naiv hash (Ch 8.3)
  // ------------------------------------------------------------
  {
    id: "py-kurose-hmac-vs-naive",
    topic: "Kurose — Sikkerhet",
    title: "HMAC vs naiv H(m‖s)",
    description:
      "Kurose & Ross beskriver hvorfor man trenger HMAC og ikke bare H(m) (forfalskbar) eller " +
      "H(m‖secret) (sårbar for length-extension i Merkle-Damgård-hashes). I denne oppgaven viser vi " +
      "konkret at H(m) lett kan forfalskes, mens et delt secret beskytter mot dette. Se s. 642-643.",
    requires: [],
    starter: `import hashlib

# En naiv "MAC" som bare hash-er meldinga (ingen secret).
def naive_hash(msg):
    return hashlib.sha256(msg).hexdigest()

# Bedre: konkateneres med et delt secret (s for sender).
def keyed_hash(msg, secret):
    return hashlib.sha256(msg + secret).hexdigest()


# === Demo 1: Mallory kan trivielt forfalske naive_hash ===
# Alice sender (msg, naive_hash(msg)). Mallory snapper opp, endrer msg,
# regner ut naive_hash(forged) og sender til Bob. Bob ser at hash-en stemmer.

original = b"Send $100 to Bob"
forged   = b"Send $999 to Mallory"

# TODO: lag forged_tag som Mallory ville produsert.
forged_tag = ...  # endre denne
assert forged_tag == naive_hash(forged), "Forgery skal være enkelt — det er hele poenget."
print(f"Mallory's forfalskede tag: {forged_tag[:16]}...")


# === Demo 2: keyed_hash med ukjent secret kan IKKE forfalskes ===
secret = b"shared-key-only-Alice-and-Bob-know"
real_tag = keyed_hash(original, secret)

# TODO: skriv en funksjon mallory_attempt(msg) som returnerer det BESTE Mallory kan gjøre
# UTEN å kjenne secret. Hun kjenner kun til hashlib og at funksjonen heter sha256.
# Hint: hun MÅ gjette — det eneste hun kan gjøre er å sende msg uten gyldig tag.
def mallory_attempt(msg):
    """Mallory har ikke secret. Hun returnerer sitt beste forsøk på en tag."""
    # TODO: returner sha256(msg) — den eneste hash hun kan produsere uten secret.
    pass

mallory_tag = mallory_attempt(forged)
# Mallory's tag KAN IKKE matche keyed_hash(forged, secret).
assert mallory_tag != keyed_hash(forged, secret), "Skulle ikke matche — secret er ukjent."
print(f"Mallory's blind forsøk: {mallory_tag[:16]}...")
print(f"Bob forventer:          {keyed_hash(forged, secret)[:16]}...")
print("OK — uten secret er forgery praktisk umulig (2^-256 sjanse).")
`,
    solution: `import hashlib

def naive_hash(msg):
    return hashlib.sha256(msg).hexdigest()

def keyed_hash(msg, secret):
    return hashlib.sha256(msg + secret).hexdigest()

original = b"Send $100 to Bob"
forged   = b"Send $999 to Mallory"

# Mallory regner bare ut hashen selv — det er det som er problemet.
forged_tag = naive_hash(forged)
assert forged_tag == naive_hash(forged)

secret = b"shared-key-only-Alice-and-Bob-know"

def mallory_attempt(msg):
    # Mallory har ingen secret — eneste hun kan gjøre er å hashe meldinga rått.
    return hashlib.sha256(msg).hexdigest()

mallory_tag = mallory_attempt(forged)
assert mallory_tag != keyed_hash(forged, secret)
`,
    hints: [
      "Mallorys 'angrep' på naive_hash er bare å kalle naive_hash(forged) — det er ingen secret involvert.",
      "I demo 2 returnerer Mallory beste blind-gjett: sha256(msg) uten secret.",
      "Konklusjon: en MAC må binde meldingen til et hemmelig nøkkelmateriale. HMAC gjør dette på en måte som motstår length-extension.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 8.3 'Message Integrity and Digital Signatures'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "MAC = Message Authentication Code. HMAC er standarden (RFC 2104) som motstår length-extension.",
      },
      {
        title: "RFC 2104 — HMAC: Keyed-Hashing for Message Authentication",
        url: "https://www.rfc-editor.org/rfc/rfc2104",
        note: "Definisjonen: HMAC(k, m) = H((k ⊕ opad) ‖ H((k ⊕ ipad) ‖ m)). To hash-runder med XOR-paddet nøkkel.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 11. CRC modulo-2 (Ch 6.2)
  // ------------------------------------------------------------
  {
    id: "py-kurose-crc",
    topic: "Kurose — Lenkelag",
    title: "CRC modulo-2 — D=101110, G=1001",
    description:
      "Cyclic Redundancy Check (CRC) er den vanligste feildeteksjonen på lenkelaget. Sender vil sende " +
      "D etterfulgt av en r-bit rest R som gjør at hele bitstrengen er delelig (modulo-2) på generatoren G. " +
      "Bokens eksempel s. 519: D=101110, G=1001 (r=3 så vi shifter D venstre 3 bit, deretter modulo-2-deler). " +
      "Forventet R = 011.",
    requires: [],
    starter: `# CRC modulo-2 — boolsk XOR-divisjon.
# G har grad r (r+1 bit). Vi shifter D venstre r bit, deretter divider med G.
# Resten R legger vi bak D. Mottaker deler hele D·2^r XOR R på G — skal gi 0.

def crc(D_bits, G_bits):
    """D_bits og G_bits er bit-lister, msb først. Returner restbiten R som bit-liste av lengde r."""
    # TODO:
    # 1. r = len(G_bits) - 1
    # 2. Lag dividend = D_bits + [0]*r  (shift left).
    # 3. For i fra 0 til len(D_bits)-1:
    #    Hvis dividend[i] == 1: XOR G_bits inn på posisjon i..i+r+1.
    # 4. Returner de siste r bittene.
    pass


# Selv-test — bokens eksempel
D = [1, 0, 1, 1, 1, 0]
G = [1, 0, 0, 1]
R = crc(D, G)
print(f"D = {D}")
print(f"G = {G}")
print(f"R = {R}   (forventet [0, 1, 1])")
assert R == [0, 1, 1], f"Forventet [0, 1, 1], fikk {R}"

# Selv-test 2: hvis vi sender D + R, skal mottaker få rest 0.
T = D + R
R_check = crc(T[:len(D)], G)  # vi tester at vår CRC fortsatt gir R for D delen
# Sjekk integritet ved å re-CRC hele frame T mot G (skal gi 0):
def divides_evenly(T_bits, G_bits):
    rem = list(T_bits)
    for i in range(len(T_bits) - len(G_bits) + 1):
        if rem[i] == 1:
            for j in range(len(G_bits)):
                rem[i + j] ^= G_bits[j]
    return all(b == 0 for b in rem[-(len(G_bits) - 1):])

assert divides_evenly(T, G), "Mottatt frame D‖R skal være delelig på G."

# Selv-test 3: en bit-flip skal detekteres (resten blir ikke 0).
T_corrupt = list(T)
T_corrupt[2] ^= 1
assert not divides_evenly(T_corrupt, G), "Bit-flip skal gi rest ≠ 0 — feildeteksjon."
print("OK — CRC fanger bit-feil.")
`,
    solution: `def crc(D_bits, G_bits):
    r = len(G_bits) - 1
    dividend = list(D_bits) + [0] * r
    for i in range(len(D_bits)):
        if dividend[i] == 1:
            for j in range(len(G_bits)):
                dividend[i + j] ^= G_bits[j]
    return dividend[-r:]
`,
    hints: [
      "Modulo-2-divisjon er XOR-divisjon: ingen carries, ingen subtraksjon.",
      "Shift D venstre med r nuller før divisjon — det gir 'plass' til resten.",
      "Når bit i er 1: XOR G inn på posisjon i. Når bit i er 0: hopp over.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 6.2.3 'Cyclic Redundancy Check (CRC)'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "Ethernet bruker CRC-32 (G = 0x04C11DB7). Alle 1-bit-feil, alle 2-bit-feil og alle odd-vekt-feil fanges.",
      },
    ],
  },

  // ------------------------------------------------------------
  // 12. Mini-CDN resolver (Ch 2.6)
  // ------------------------------------------------------------
  {
    id: "py-kurose-cdn-resolver",
    topic: "Kurose — Applikasjonslag",
    title: "Mini-CDN-resolver — Host-header til origin eller CDN",
    description:
      "I Kurose & Ross's CDN-eksempel s. 148 sender NetCinema sin web-server (servlet) klienter til " +
      "en KingCDN-CNAME hvis de ber om video, ellers svarer den selv. Skriv resolve(host_header) som tar " +
      "en Host-header og returnerer ('origin', 'video.netcinema.com') eller ('cdn', 'a1105.kingcdn.com') " +
      "basert på et regex.",
    requires: [],
    starter: `import re

# Regler:
#   * video.netcinema.com og www.video.netcinema.com -> CDN-CNAME
#   * Alt annet (*.netcinema.com)                    -> origin
#   * Helt ukjent host                                -> None

ORIGIN_DOMAIN = "netcinema.com"
CDN_HOST = "a1105.kingcdn.com"


def resolve(host_header):
    """Returner ('cdn', host) | ('origin', host) | None basert på Host."""
    # TODO:
    # 1. Lower-case og strip whitespace.
    # 2. Hvis host endrer med ".netcinema.com" eller er "netcinema.com":
    #    a. Hvis venstre del matcher r'^(www\\.)?video$' -> CDN
    #    b. Ellers -> origin
    # 3. Ellers -> None.
    pass


# Selv-test
assert resolve("video.netcinema.com") == ("cdn", CDN_HOST)
assert resolve("www.video.netcinema.com") == ("cdn", CDN_HOST)
assert resolve("VIDEO.NETCINEMA.COM") == ("cdn", CDN_HOST), "Case-insensitive."
assert resolve("netcinema.com") == ("origin", "netcinema.com")
assert resolve("www.netcinema.com") == ("origin", "www.netcinema.com")
assert resolve("static.netcinema.com") == ("origin", "static.netcinema.com")
assert resolve("example.com") is None
assert resolve("  video.netcinema.com  ") == ("cdn", CDN_HOST), "Whitespace skal trimmes."
print("OK — CDN-resolver router video til KingCDN, alt annet til origin.")
`,
    solution: `import re

ORIGIN_DOMAIN = "netcinema.com"
CDN_HOST = "a1105.kingcdn.com"

VIDEO_RE = re.compile(r"^(www\\.)?video$")


def resolve(host_header):
    if host_header is None:
        return None
    host = host_header.strip().lower()
    if host == ORIGIN_DOMAIN:
        return ("origin", host)
    suffix = "." + ORIGIN_DOMAIN
    if not host.endswith(suffix):
        return None
    left = host[: -len(suffix)]
    if VIDEO_RE.match(left):
        return ("cdn", CDN_HOST)
    return ("origin", host)
`,
    hints: [
      "Bruk str.lower() og str.strip() før du sjekker — Host-header er case-insensitive.",
      "Sjekk om host slutter på '.netcinema.com'. Hvis ikke: return None.",
      "Et regex som r'^(www\\.)?video$' fanger både 'video' og 'www.video' som CDN-kandidat.",
    ],
    docs: [
      {
        title: "Kurose & Ross — Section 2.6 'Video Streaming and Content Distribution Networks'",
        url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
        note: "CDN-er bruker DNS-redirect: klient slår opp video.netcinema.com -> CNAME til kingcdn.com -> nær CDN-noder.",
      },
    ],
  },
];
