import type { PyExercise } from "./types";

/**
 * DTE-2505 OS-oppgaver — utvidelse (12 nye).
 *
 * Pyodide har ikke ekte syscalls (fork, exec, mmap), så oppgavene bygger
 * på MOCK-er og REGNESTYKKER:
 *   • permissions: bit-fiddling med oktale tall
 *   • scheduling: gi en jobb-liste, beregn ventetid/turnaround manuelt
 *   • paging: dict-basert sidetabell
 *   • konkurrens: mock-semafor i ren Python
 *   • shell: parse pipeline-strenger
 *   • filsystem: walk en dict-tree
 */
export const PY_DTE2505_UTVIDELSE_EXERCISES: PyExercise[] = [
  // ============ PERMISSIONS ===========================================
  {
    id: "py-2505-rwx-symbolic-to-octal",
    topic: "DTE-2505 — Permissions",
    title: "Symbolske rettigheter til oktal",
    description:
      "Skriv `to_octal(s: str) -> int` som tar en 9-tegns rettighets-streng (f.eks. `rwxr-xr--`) og returnerer den oktale verdien (754). Hver triplet (eier/gruppe/andre) har 3 bit: r=4, w=2, x=1.",
    requires: [],
    starter: `# === OPPGAVE ===
# "rwxr-xr--" = 754 (eier=7, gruppe=5, andre=4)
# "rw-r--r--" = 644
# "---------" = 0
# "rwxrwxrwx" = 777

def to_octal(s: str) -> int:
    # TODO: konverter til 3-sifret oktal
    pass


assert to_octal("rwxr-xr--") == 754
assert to_octal("rw-r--r--") == 644
assert to_octal("---------") == 0
assert to_octal("rwxrwxrwx") == 777
assert to_octal("r--r--r--") == 444
print("OK")
`,
    solution: `def to_octal(s: str) -> int:
    if len(s) != 9:
        raise ValueError("forventer 9 tegn (rwx × 3)")
    bits = {"r": 4, "w": 2, "x": 1, "-": 0}
    result = 0
    for i in range(3):
        triplet = s[i*3:(i+1)*3]
        digit = sum(bits[c] for c in triplet)
        result = result * 10 + digit
    return result


assert to_octal("rwxr-xr--") == 754
assert to_octal("rw-r--r--") == 644
assert to_octal("---------") == 0
assert to_octal("rwxrwxrwx") == 777
assert to_octal("r--r--r--") == 444
print("OK")
`,
    hints: [
      "Del strengen i 3 tripletter: s[0:3], s[3:6], s[6:9].",
      "For hver triplet: r=4, w=2, x=1, summer.",
      "Bygg den oktale verdien som desimal-tall: result = result * 10 + digit.",
    ],
    docs: [
      {
        title: "Linux file permissions",
        url: "https://www.gnu.org/software/coreutils/manual/html_node/Numeric-Modes.html",
        note: "chmod 754 fil = setter rwxr-xr-- på fil. r=4, w=2, x=1.",
      },
    ],
  },

  {
    id: "py-2505-rwx-octal-to-symbolic",
    topic: "DTE-2505 — Permissions",
    title: "Oktal til symbolske rettigheter",
    description:
      "Skriv `to_symbolic(n: int) -> str` som inverterer forrige oppgave. 754 → 'rwxr-xr--'. Sjekk at hvert siffer er 0-7.",
    requires: [],
    starter: `def to_symbolic(n: int) -> str:
    # TODO: 754 -> "rwxr-xr--"
    pass


assert to_symbolic(754) == "rwxr-xr--"
assert to_symbolic(644) == "rw-r--r--"
assert to_symbolic(777) == "rwxrwxrwx"
assert to_symbolic(0) == "---------"
assert to_symbolic(421) == "r---w---x"
print("OK")
`,
    solution: `def to_symbolic(n: int) -> str:
    if not (0 <= n <= 777):
        raise ValueError("forventer 0-777")
    digits = [(n // 100) % 10, (n // 10) % 10, n % 10]
    out = ""
    for d in digits:
        if not (0 <= d <= 7):
            raise ValueError(f"siffer {d} er ikke oktal")
        out += "r" if d & 4 else "-"
        out += "w" if d & 2 else "-"
        out += "x" if d & 1 else "-"
    return out


assert to_symbolic(754) == "rwxr-xr--"
assert to_symbolic(644) == "rw-r--r--"
assert to_symbolic(777) == "rwxrwxrwx"
assert to_symbolic(0) == "---------"
assert to_symbolic(421) == "r---w---x"
print("OK")
`,
    hints: [
      "Trekk ut hvert siffer: hundrer, tier, ener.",
      "For hvert siffer: bit 4 = r, bit 2 = w, bit 1 = x. Bruk &-operatoren.",
      "d & 4 returnerer 4 hvis bit-en er satt, ellers 0.",
    ],
    docs: [
      {
        title: "Bitwise AND for permissions",
        url: "https://docs.python.org/3/library/stdtypes.html#bitwise-operations-on-integer-types",
        note: "`d & 4` sjekker om read-bit-en er satt — vanlig mønster i C-stil OS-kode.",
      },
    ],
  },

  {
    id: "py-2505-umask-calculator",
    topic: "DTE-2505 — Permissions",
    title: "Umask-kalkulator: hva blir effektive rettigheter?",
    description:
      "Når en prosess oppretter en fil, fjerner umask bit fra default-rettighetene. `effective(mode, umask)` returnerer `mode AND NOT umask`. Standard mode for ny fil er 666, for ny katalog 777. Implementer beregningen i ren Python (du kan bruke int og bitwise).",
    requires: [],
    starter: `def effective(mode: int, umask: int) -> int:
    """Begge oppgis som oktale heltall (f.eks. 0o666 eller 666)."""
    # TODO: returner mode med umask-bittene fjernet, som oktalt heltall
    pass


# Vanligste tilfelle: fil med default 666, umask 022 -> 644
assert effective(0o666, 0o022) == 0o644

# Katalog med default 777, umask 022 -> 755
assert effective(0o777, 0o022) == 0o755

# Restriktiv umask 077 -> kun eier får tilgang
assert effective(0o666, 0o077) == 0o600
assert effective(0o777, 0o077) == 0o700

print("OK")
`,
    solution: `def effective(mode: int, umask: int) -> int:
    return mode & ~umask & 0o777


assert effective(0o666, 0o022) == 0o644
assert effective(0o777, 0o022) == 0o755
assert effective(0o666, 0o077) == 0o600
assert effective(0o777, 0o077) == 0o700
print("OK")
`,
    hints: [
      "Bruk bitwise AND og NOT: mode & ~umask.",
      "Maskèr til 9 bit med & 0o777 for å unngå at høyere bit lekker fra ~-operatoren.",
      "0o-prefiks for oktale literals i Python: 0o666 == 438 (desimalt).",
    ],
    docs: [
      {
        title: "umask(2) — set file mode creation mask",
        url: "https://man7.org/linux/man-pages/man2/umask.2.html",
        note: "umask er et FILTER, ikke en ferdig verdi — den fjerner bit fra default-rettighetene.",
      },
    ],
  },

  // ============ SCHEDULING ============================================
  {
    id: "py-2505-fcfs-scheduler",
    topic: "DTE-2505 — Scheduling",
    title: "First-Come-First-Served scheduler",
    description:
      "Gitt liste med prosesser `[(pid, arrival, burst), ...]` sortert etter ankomst, beregn snittventetid og snitt-turnaround. FCFS = ingen preemption, kjør i ankomst-rekkefølge.",
    requires: [],
    starter: `def fcfs(jobs):
    """jobs: list of (pid, arrival, burst). Returner (avg_wait, avg_turnaround)."""
    # waiting time = start - arrival
    # turnaround = completion - arrival
    # TODO
    pass


# Klassisk eksempel: P1(0, 24), P2(0, 3), P3(0, 3)
# Med FCFS i denne rekkefølgen:
# P1 ferdig på 24, P2 på 27, P3 på 30
# wait: 0, 24, 27 -> snitt 17
# turnaround: 24, 27, 30 -> snitt 27.0
w, t = fcfs([("P1", 0, 24), ("P2", 0, 3), ("P3", 0, 3)])
print(w, t)
assert abs(w - 17.0) < 0.01
assert abs(t - 27.0) < 0.01
print("OK")
`,
    solution: `def fcfs(jobs):
    waits = []
    turnarounds = []
    clock = 0
    for pid, arrival, burst in jobs:
        if clock < arrival:
            clock = arrival  # CPU er idle frem til ankomst
        wait = clock - arrival
        clock += burst
        waits.append(wait)
        turnarounds.append(clock - arrival)
    return sum(waits) / len(waits), sum(turnarounds) / len(turnarounds)


w, t = fcfs([("P1", 0, 24), ("P2", 0, 3), ("P3", 0, 3)])
assert abs(w - 17.0) < 0.01
assert abs(t - 27.0) < 0.01
print("OK")
`,
    hints: [
      "Hold en clock-variabel som starter på 0.",
      "Hvis CPU-en er idle (clock < arrival), spol clock fram til arrival.",
      "wait = clock - arrival (før job kjøres). turnaround = wait + burst.",
    ],
    docs: [
      {
        title: "FCFS Scheduling — Tanenbaum",
        url: "https://en.wikipedia.org/wiki/First-come,_first-served_(scheduling)",
        note: "Enkleste algoritme: ingen preemption, ingen prioritering. Lider av convoy effect — én lang job blokkerer korte.",
      },
    ],
  },

  {
    id: "py-2505-sjf-scheduler",
    topic: "DTE-2505 — Scheduling",
    title: "Shortest Job First (non-preemptive)",
    description:
      "SJF velger jobben med kortest burst-tid blant de ankommede når CPU-en blir ledig. Implementer non-preemptive variant: når en job starter, kjøres den ferdig.",
    requires: [],
    starter: `def sjf(jobs):
    """jobs: list of (pid, arrival, burst). Returner (avg_wait, ferdig_rekkefølge)."""
    # TODO: simuler. På hvert valg: hvilke jobs har ankommet, hvilken har minst burst?
    pass


# P1(0, 7), P2(2, 4), P3(4, 1), P4(5, 4)
# t=0: kun P1 har ankommet -> kjør P1 ferdig på 7
# t=7: P2, P3, P4 har ankommet. Korteste = P3 (1) -> ferdig 8
# t=8: P2 og P4 igjen, begge 4. Velg P2 (ankom først) -> ferdig 12
# t=12: P4 -> ferdig 16
# wait: P1=0, P3=7-4=3, P2=8-2=6, P4=12-5=7 -> snitt 4.0
w, ferdig = sjf([("P1", 0, 7), ("P2", 2, 4), ("P3", 4, 1), ("P4", 5, 4)])
print(w, ferdig)
assert abs(w - 4.0) < 0.01
assert ferdig == ["P1", "P3", "P2", "P4"]
print("OK")
`,
    solution: `def sjf(jobs):
    remaining = list(jobs)
    waits = {}
    ferdig = []
    clock = 0
    while remaining:
        ankommet = [j for j in remaining if j[1] <= clock]
        if not ankommet:
            # Hopp clock til neste ankomst
            clock = min(j[1] for j in remaining)
            continue
        # Velg jobben med kortest burst (tie-break: tidligst arrival, så pid)
        ankommet.sort(key=lambda j: (j[2], j[1]))
        chosen = ankommet[0]
        pid, arrival, burst = chosen
        waits[pid] = clock - arrival
        clock += burst
        ferdig.append(pid)
        remaining.remove(chosen)
    avg_wait = sum(waits.values()) / len(waits)
    return avg_wait, ferdig


w, ferdig = sjf([("P1", 0, 7), ("P2", 2, 4), ("P3", 4, 1), ("P4", 5, 4)])
assert abs(w - 4.0) < 0.01
assert ferdig == ["P1", "P3", "P2", "P4"]
print("OK")
`,
    hints: [
      "Hold en liste over ikke-utførte jobs. Loop til den er tom.",
      "Filtrér på arrival ≤ clock for å finne kandidater. Tom liste betyr CPU er idle — spol til neste arrival.",
      "Sorter kandidater etter burst (stigende) for å velge korteste.",
    ],
    docs: [
      {
        title: "Shortest Job First",
        url: "https://en.wikipedia.org/wiki/Shortest_job_next",
        note: "SJF gir matematisk optimal snittventetid IF du kjenner burst-tidene på forhånd. Praktisk problem: man må estimere.",
      },
    ],
  },

  {
    id: "py-2505-round-robin-scheduler",
    topic: "DTE-2505 — Scheduling",
    title: "Round Robin med kvantum",
    description:
      "RR gir hver job et tidskvantum. Når kvantumet er oppbrukt, går jobben bakerst i køen. Implementer simulator som returnerer ferdig-tidspunktet for hver job.",
    requires: [],
    starter: `from collections import deque

def round_robin(jobs, quantum):
    """jobs: list of (pid, arrival, burst). Returner dict {pid: completion_time}."""
    # TODO: kø-basert. Når en job kommer "live", legg den bak i køen.
    pass


# P1(0, 5), P2(1, 3), P3(2, 1), kvantum=2
# t=0: P1 starter, kjører 2, t=2. Kø: [P2 (ankom 1), P3 (ankom 2), P1]
# t=2: P2 kjører 2, t=4. Kø: [P3, P1, P2 (1 igjen)]
# t=4: P3 kjører 1 (ferdig), t=5. Kø: [P1, P2]
# t=5: P1 kjører 2, t=7. Kø: [P2, P1 (1 igjen)]
# t=7: P2 kjører 1 (ferdig), t=8. Kø: [P1]
# t=8: P1 kjører 1 (ferdig), t=9.
done = round_robin([("P1", 0, 5), ("P2", 1, 3), ("P3", 2, 1)], quantum=2)
print(done)
assert done == {"P1": 9, "P2": 8, "P3": 5}
print("OK")
`,
    solution: `from collections import deque

def round_robin(jobs, quantum):
    remaining = {pid: burst for pid, _, burst in jobs}
    arrivals = sorted(jobs, key=lambda j: j[1])
    arrivals_idx = 0
    q = deque()
    clock = 0
    done = {}

    def add_arrived(until):
        nonlocal arrivals_idx
        while arrivals_idx < len(arrivals) and arrivals[arrivals_idx][1] <= until:
            q.append(arrivals[arrivals_idx][0])
            arrivals_idx += 1

    add_arrived(clock)
    while q or arrivals_idx < len(arrivals):
        if not q:
            # Idle — spol til neste ankomst
            clock = arrivals[arrivals_idx][1]
            add_arrived(clock)
            continue
        pid = q.popleft()
        run = min(quantum, remaining[pid])
        clock += run
        remaining[pid] -= run
        # Legg til nye ankomster FØR vi re-køer den løpende jobben
        add_arrived(clock)
        if remaining[pid] == 0:
            done[pid] = clock
        else:
            q.append(pid)
    return done


done = round_robin([("P1", 0, 5), ("P2", 1, 3), ("P3", 2, 1)], quantum=2)
assert done == {"P1": 9, "P2": 8, "P3": 5}
print("OK")
`,
    hints: [
      "Bruk en collections.deque som kø — popleft() henter, append() legger bak.",
      "Viktig detalj: når en job har brukt kvantumet, sjekk om nye jobs har ankommet FØR du legger den løpende bak.",
      "Hvis køen blir tom og det er flere ankomster igjen, spol clock til neste arrival.",
    ],
    docs: [
      {
        title: "Round Robin scheduling",
        url: "https://en.wikipedia.org/wiki/Round-robin_scheduling",
        note: "Pre-emptive: kvantum er typisk 10-100 ms i Linux. For kort = mye context-switch overhead. For langt = degenererer til FCFS.",
      },
    ],
  },

  // ============ MINNE / PAGING ========================================
  {
    id: "py-2505-page-table-lookup",
    topic: "DTE-2505 — Minne",
    title: "Sidetabell-oppslag: virtuell → fysisk adresse",
    description:
      "Gitt sidetabell `{vpn: pfn}` og side-størrelse, oversett virtuell adresse til fysisk. Adresse splittes i (vpn, offset). Heving exception ved page fault (vpn ikke i tabellen).",
    requires: [],
    starter: `class PageFault(Exception):
    pass


def translate(va: int, page_table: dict, page_size: int) -> int:
    """va = vpn * page_size + offset. Returner pfn * page_size + offset."""
    # TODO: del adressen, slå opp, sett sammen
    pass


# 4 KB sider, sidetabell: vpn 0 -> pfn 5, vpn 1 -> pfn 2, vpn 3 -> pfn 7
PT = {0: 5, 1: 2, 3: 7}
PAGE = 4096

# VA 100 = vpn 0, offset 100. PFN 5 = PA 5*4096 + 100 = 20580
assert translate(100, PT, PAGE) == 20580

# VA 4096 + 50 = vpn 1, offset 50 -> PFN 2 -> PA 2*4096 + 50 = 8242
assert translate(4096 + 50, PT, PAGE) == 8242

# VA på vpn 2 -> page fault
try:
    translate(2 * 4096 + 0, PT, PAGE)
    assert False, "skal ha raised PageFault"
except PageFault:
    pass

print("OK")
`,
    solution: `class PageFault(Exception):
    pass


def translate(va: int, page_table: dict, page_size: int) -> int:
    vpn = va // page_size
    offset = va % page_size
    if vpn not in page_table:
        raise PageFault(f"VPN {vpn} ikke mappet")
    pfn = page_table[vpn]
    return pfn * page_size + offset


PT = {0: 5, 1: 2, 3: 7}
PAGE = 4096
assert translate(100, PT, PAGE) == 20580
assert translate(4096 + 50, PT, PAGE) == 8242
try:
    translate(2 * 4096, PT, PAGE)
    assert False
except PageFault:
    pass
print("OK")
`,
    hints: [
      "vpn = va // page_size (heltallsdivisjon).",
      "offset = va % page_size — bevares uendret i oversettelsen.",
      "Hvis vpn ikke er i page_table, kast PageFault.",
    ],
    docs: [
      {
        title: "Virtuelt minne — Tanenbaum",
        url: "https://en.wikipedia.org/wiki/Virtual_memory",
        note: "MMU gjør denne oversettelsen for hver minneaksess i hardware. Sidetabellen ligger i RAM, men cached i TLB.",
      },
    ],
  },

  {
    id: "py-2505-tlb-stats",
    topic: "DTE-2505 — Minne",
    title: "TLB hit/miss-rate (LRU-replacement)",
    description:
      "Simuler en TLB med fast størrelse N og LRU-replacement. Gitt en sekvens med VPN-adganger, returner (hits, misses). LRU = ved miss, kast den minst nylig brukte oppføringen.",
    requires: [],
    starter: `from collections import OrderedDict

def tlb_simulate(accesses, tlb_size):
    """accesses: list of vpn (int). Returner (hits, misses)."""
    # TODO: bruk OrderedDict for LRU — move_to_end ved hit
    pass


# TLB-størrelse 3, sekvens: 1, 2, 3, 1, 4, 2
# 1: miss (TLB: [1])
# 2: miss (TLB: [1, 2])
# 3: miss (TLB: [1, 2, 3])
# 1: hit  (TLB: [2, 3, 1] etter at 1 flyttes til "ny")
# 4: miss (kast 2, TLB: [3, 1, 4])
# 2: miss (kast 3, TLB: [1, 4, 2])
# -> 1 hit, 5 misses
hits, misses = tlb_simulate([1, 2, 3, 1, 4, 2], tlb_size=3)
print(hits, misses)
assert hits == 1
assert misses == 5
print("OK")
`,
    solution: `from collections import OrderedDict

def tlb_simulate(accesses, tlb_size):
    tlb = OrderedDict()
    hits = 0
    misses = 0
    for vpn in accesses:
        if vpn in tlb:
            hits += 1
            tlb.move_to_end(vpn)
        else:
            misses += 1
            if len(tlb) >= tlb_size:
                tlb.popitem(last=False)  # fjern den eldste
            tlb[vpn] = True
    return hits, misses


hits, misses = tlb_simulate([1, 2, 3, 1, 4, 2], tlb_size=3)
assert hits == 1
assert misses == 5
print("OK")
`,
    hints: [
      "OrderedDict bevarer innsettings-rekkefølge. move_to_end(key) sender en eksisterende key bakerst (= 'sist brukt').",
      "popitem(last=False) fjerner den FØRSTE — som er den minst nylig brukte med vår konvensjon.",
      "Husk å sjekke størrelse FØR du legger inn ny oppføring.",
    ],
    docs: [
      {
        title: "TLB — Translation Lookaside Buffer",
        url: "https://en.wikipedia.org/wiki/Translation_lookaside_buffer",
        note: "Moderne x86-CPUer har 64-1024 TLB-entries. TLB miss = 100x dyrere enn TLB hit (må slå opp page table i RAM).",
      },
    ],
  },

  // ============ KONKURRENS ============================================
  {
    id: "py-2505-producer-consumer-mock",
    topic: "DTE-2505 — Konkurrens",
    title: "Producer/Consumer med bounded buffer (mock)",
    description:
      "Implementer en BoundedBuffer-klasse med fast kapasitet. Producer kaller `put(x)`, consumer kaller `get()`. Hvis buffer er full, raise `BufferFull`. Hvis tom, raise `BufferEmpty`. (I ekte system ville disse blokkert med condition variables.)",
    requires: [],
    starter: `class BufferFull(Exception): pass
class BufferEmpty(Exception): pass


class BoundedBuffer:
    def __init__(self, capacity: int):
        # TODO
        pass

    def put(self, item):
        # TODO: hvis full, raise BufferFull
        pass

    def get(self):
        # TODO: hvis tom, raise BufferEmpty
        pass

    def __len__(self):
        return 0  # TODO


buf = BoundedBuffer(capacity=3)
buf.put(1); buf.put(2); buf.put(3)
assert len(buf) == 3
try:
    buf.put(4)
    assert False
except BufferFull:
    pass

assert buf.get() == 1
assert buf.get() == 2
assert buf.get() == 3
try:
    buf.get()
    assert False
except BufferEmpty:
    pass
print("OK")
`,
    solution: `from collections import deque

class BufferFull(Exception): pass
class BufferEmpty(Exception): pass


class BoundedBuffer:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.items = deque()

    def put(self, item):
        if len(self.items) >= self.capacity:
            raise BufferFull()
        self.items.append(item)

    def get(self):
        if not self.items:
            raise BufferEmpty()
        return self.items.popleft()

    def __len__(self):
        return len(self.items)


buf = BoundedBuffer(capacity=3)
buf.put(1); buf.put(2); buf.put(3)
assert len(buf) == 3
try:
    buf.put(4)
    assert False
except BufferFull:
    pass
assert buf.get() == 1
assert buf.get() == 2
assert buf.get() == 3
try:
    buf.get()
    assert False
except BufferEmpty:
    pass
print("OK")
`,
    hints: [
      "Bruk collections.deque for FIFO med O(1) append/popleft.",
      "Sjekk størrelse FØR put/get — raise hvis utenfor grensene.",
      "I ekte system: erstatt raise med wait på condition variable + notify ved put/get.",
    ],
    docs: [
      {
        title: "Producer-consumer problem",
        url: "https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem",
        note: "Klassisk synkroniserings-problem. Løses i praksis med Mutex + 2 Condition Variables (not-full, not-empty) eller med en Semaphore-basert løsning.",
      },
    ],
  },

  {
    id: "py-2505-deadlock-detection",
    topic: "DTE-2505 — Konkurrens",
    title: "Deadlock-deteksjon med Bankers algoritme",
    description:
      "Gitt allokering, behov og tilgjengelige ressurser, sjekk om en safe sequence finnes. Returner True hvis safe (ingen deadlock mulig), False ellers.",
    requires: [],
    starter: `def is_safe(allocation, need, available):
    """
    allocation: liste av lister — allocation[i] = ressurser prosess i HAR
    need:       liste av lister — need[i] = ressurser i TRENGER for å bli ferdig
    available:  liste — ressurser som er ledige nå

    Returner True hvis det finnes en sequence der alle prosesser kan bli ferdige.
    """
    # TODO: itererer. På hvert steg: finn en prosess der need <= available.
    # Når funnet: legg dens allocation tilbake i available, marker ferdig.
    pass


# Klassisk eksempel fra Tanenbaum (3 ressurstyper)
# 5 prosesser, available = [3, 3, 2]
allocation = [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]]
need =       [[7,4,3], [1,2,2], [6,0,0], [0,1,1], [4,3,1]]
available = [3, 3, 2]
assert is_safe(allocation, need, available) == True

# Hvis P1 trenger 1 ekstra unit av første ressurs, blir det usikkert
allocation_unsafe = [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]]
need_unsafe =       [[7,4,3], [1,2,2], [6,0,0], [0,1,1], [4,3,1]]
available_unsafe = [0, 3, 2]   # P1 kan ikke få sin første ressurs
assert is_safe(allocation_unsafe, need_unsafe, available_unsafe) == False

print("OK")
`,
    solution: `def is_safe(allocation, need, available):
    n = len(allocation)
    work = list(available)
    finish = [False] * n

    while True:
        progress = False
        for i in range(n):
            if finish[i]:
                continue
            if all(need[i][j] <= work[j] for j in range(len(work))):
                # P_i kan kjøre ferdig — gi tilbake ressursene
                for j in range(len(work)):
                    work[j] += allocation[i][j]
                finish[i] = True
                progress = True
        if not progress:
            break
    return all(finish)


allocation = [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]]
need =       [[7,4,3], [1,2,2], [6,0,0], [0,1,1], [4,3,1]]
available = [3, 3, 2]
assert is_safe(allocation, need, available) == True

allocation_unsafe = [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]]
need_unsafe =       [[7,4,3], [1,2,2], [6,0,0], [0,1,1], [4,3,1]]
available_unsafe = [0, 3, 2]
assert is_safe(allocation_unsafe, need_unsafe, available_unsafe) == False
print("OK")
`,
    hints: [
      "Loop til ingen prosess kan ferdiggjøres i én runde.",
      "På hvert steg: en prosess kan kjøre ferdig hvis need[i] ≤ work for alle ressurstyper.",
      "Når den kjører ferdig: legg dens allocation tilbake i work (frigjør ressurser).",
    ],
    docs: [
      {
        title: "Banker's algorithm",
        url: "https://en.wikipedia.org/wiki/Banker%27s_algorithm",
        note: "Dijkstras algoritme — sjekker om en safe sequence finnes. Konservativ: forhindrer deadlock ved å avvise risikable ressursforespørsler.",
      },
    ],
  },

  // ============ SHELL =================================================
  {
    id: "py-2505-shell-pipeline-parser",
    topic: "DTE-2505 — Shell",
    title: "Parse shell-pipeline til kommandoliste",
    description:
      "Parse en pipeline-streng som `ls -la | grep py | wc -l` til en liste av (kommando, args). Håndter ekstra whitespace. Ignorer alt mer enn tomme strenger.",
    requires: [],
    starter: `def parse_pipeline(s: str):
    """Returner liste av tupler: (kommando, [args, ...])"""
    # TODO: split på "|", strip, split videre på whitespace
    pass


assert parse_pipeline("ls -la | grep py | wc -l") == [
    ("ls", ["-la"]),
    ("grep", ["py"]),
    ("wc", ["-l"]),
]
assert parse_pipeline("ps aux") == [("ps", ["aux"])]
assert parse_pipeline("date") == [("date", [])]
# Ekstra whitespace skal håndteres
assert parse_pipeline("  ls   |  cat  ") == [("ls", []), ("cat", [])]
print("OK")
`,
    solution: `def parse_pipeline(s: str):
    cmds = []
    for stage in s.split("|"):
        parts = stage.strip().split()
        if not parts:
            continue
        cmds.append((parts[0], parts[1:]))
    return cmds


assert parse_pipeline("ls -la | grep py | wc -l") == [
    ("ls", ["-la"]),
    ("grep", ["py"]),
    ("wc", ["-l"]),
]
assert parse_pipeline("ps aux") == [("ps", ["aux"])]
assert parse_pipeline("date") == [("date", [])]
assert parse_pipeline("  ls   |  cat  ") == [("ls", []), ("cat", [])]
print("OK")
`,
    hints: [
      "s.split('|') splitter på pipe-tegnet.",
      "Bruk .strip() for å fjerne whitespace rundt hvert steg.",
      ".split() uten argument splitter på alle whitespace-sekvenser og ignorerer tomme.",
    ],
    docs: [
      {
        title: "Shell pipelines",
        url: "https://www.gnu.org/software/bash/manual/html_node/Pipelines.html",
        note: "I bash forbinder pipe stdout fra venstre kommando til stdin på høyre. Vår parser ignorer redirects (<, >) — det kan være en utvidelse.",
      },
    ],
  },

  // ============ FILSYSTEM =============================================
  {
    id: "py-2505-du-simulator",
    topic: "DTE-2505 — Filsystem",
    title: "du-simulator — beregn katalog-størrelse",
    description:
      "Implementer `du(tree)` som rekursivt summerer størrelser i en filsystem-trestruktur. Filer er `int` (bytes). Kataloger er `dict` av navn → fil/katalog.",
    requires: [],
    starter: `def du(tree):
    """tree: int (filstørrelse) eller dict (katalog). Returner total bytes."""
    # TODO: rekursjon. Hvis int -> bare returner. Hvis dict -> summer.
    pass


# Liten katalog
fs = {
    "etc": {
        "passwd": 2048,
        "shadow": 1024,
        "ssh": {
            "sshd_config": 4096,
            "ssh_host_rsa_key": 2048,
        },
    },
    "var": {
        "log": {"syslog": 50000, "auth.log": 8000},
    },
    "tmp": {},
}
assert du(fs) == 2048 + 1024 + 4096 + 2048 + 50000 + 8000
assert du(fs["etc"]["ssh"]) == 4096 + 2048
assert du(123) == 123
assert du({}) == 0
print("OK")
`,
    solution: `def du(tree):
    if isinstance(tree, int):
        return tree
    if isinstance(tree, dict):
        return sum(du(child) for child in tree.values())
    raise TypeError(f"forventet int eller dict, fikk {type(tree).__name__}")


fs = {
    "etc": {
        "passwd": 2048,
        "shadow": 1024,
        "ssh": {
            "sshd_config": 4096,
            "ssh_host_rsa_key": 2048,
        },
    },
    "var": {
        "log": {"syslog": 50000, "auth.log": 8000},
    },
    "tmp": {},
}
assert du(fs) == 2048 + 1024 + 4096 + 2048 + 50000 + 8000
assert du(fs["etc"]["ssh"]) == 4096 + 2048
assert du(123) == 123
assert du({}) == 0
print("OK")
`,
    hints: [
      "Base case: hvis tree er int, returner det.",
      "Rekursivt case: hvis tree er dict, kall du på alle verdier og summer.",
      "Tom katalog gir naturlig 0 fordi sum(())==0.",
    ],
    docs: [
      {
        title: "du(1) — disk usage",
        url: "https://man7.org/linux/man-pages/man1/du.1.html",
        note: "I praksis må du også håndtere hardlinks (samme inode telles én gang) og symlinks (følges ikke som default).",
      },
    ],
  },
];
