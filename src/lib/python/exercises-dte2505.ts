import type { PyExercise } from "./types";

// Linux/OS-relaterte Python-øvelser for DTE-2505. Pyodide har ikke ekte
// /etc/passwd, ikke faktisk chmod, ingen ekte ps — vi simulerer ved å
// gi studenten en streng eller mock-fil og be dem parse / regne ut.

export const DTE2505_EXERCISES: PyExercise[] = [
  {
    id: "py-dte2505-passwd-parse",
    topic: "DTE-2505",
    level: 0,
    title: "Parse /etc/passwd",
    description:
      "Mock-versjon av /etc/passwd ligger i variabelen ETC_PASSWD. Hvert linje har syv felt skilt med kolon: " +
      "brukernavn:passord:UID:GID:GECOS:home:shell. Skriv ut en liste over alle brukernavn som har UID >= 1000 (= vanlige brukere).",
    requires: [],
    starter: `ETC_PASSWD = """root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
isak:x:1000:1000:Isak Olsen,,,:/home/isak:/bin/bash
ada:x:1001:1001:Ada Lovelace,,,:/home/ada:/bin/zsh
sysadm:x:999:999::/home/sysadm:/bin/bash"""

# TODO: Skriv ut hvert brukernavn som har UID >= 1000.
# Forventet output (rekkefølge fra fila):
# isak
# ada
`,
    solution: `for line in ETC_PASSWD.strip().split("\\n"):
    fields = line.split(":")
    name, uid = fields[0], int(fields[2])
    if uid >= 1000:
        print(name)
`,
    hints: [
      "Bruk str.split('\\n') for linjer og .split(':') for felt.",
      "UID er felt[2]. Konverter med int().",
      "Vanlige brukere har UID >= 1000 på de fleste moderne distroer.",
    ],
  },
  {
    id: "py-dte2505-chmod-octal",
    topic: "DTE-2505",
    level: 1,
    title: "chmod oktal-kalkulator",
    description:
      "Skriv en funksjon symbolic_to_octal(perm: str) -> int som tar en 9-tegns streng som 'rwxr-xr-x' " +
      "og returnerer det tilsvarende oktale tallet som integer. " +
      "Ringregel: r=4, w=2, x=1, - = 0. Returner som heltall (3 sifre).",
    requires: [],
    starter: `def symbolic_to_octal(perm: str) -> int:
    # TODO: konverter 'rwxr-xr-x' → 755
    pass

# Test:
assert symbolic_to_octal("rwxr-xr-x") == 755
assert symbolic_to_octal("rw-r--r--") == 644
assert symbolic_to_octal("rwx------") == 700
assert symbolic_to_octal("rwxrwxrwx") == 777
print("Alle tester OK")
`,
    solution: `def symbolic_to_octal(perm: str) -> int:
    values = {"r": 4, "w": 2, "x": 1, "-": 0}
    digits = []
    for i in range(0, 9, 3):
        triple = perm[i:i+3]
        digits.append(sum(values[c] for c in triple))
    return int("".join(str(d) for d in digits))

assert symbolic_to_octal("rwxr-xr-x") == 755
assert symbolic_to_octal("rw-r--r--") == 644
assert symbolic_to_octal("rwx------") == 700
assert symbolic_to_octal("rwxrwxrwx") == 777
print("Alle tester OK")
`,
    hints: [
      "Del strengen i tre biter: perm[0:3], perm[3:6], perm[6:9].",
      "Bruk en dict {'r':4,'w':2,'x':1,'-':0} og sum opp.",
      "Sett de tre sifrene sammen og konverter til int.",
    ],
  },
  {
    id: "py-dte2505-ps-parse",
    topic: "DTE-2505",
    level: 1,
    title: "Tolk ps-aux-output",
    description:
      "Mock-output fra ps aux er gitt. Skriv kode som finner ut hvilken prosess som bruker MEST CPU, " +
      "og skriv ut PID og command. Output skal være på formen 'PID 1042 bruker mest CPU: python sim.py'.",
    requires: [],
    starter: `PS_OUT = """USER       PID  %CPU %MEM COMMAND
root         1   0.0  0.5 /sbin/init
isak       901   0.2  1.2 bash
isak      1042  87.4 12.3 python sim.py
isak      1087   0.0  4.1 vim notater.md
isak      1201   5.5  8.2 node webserver.js"""

# TODO: Finn raden med høyest %CPU og skriv ut "PID <pid> bruker mest CPU: <command>"
`,
    solution: `lines = PS_OUT.strip().split("\\n")[1:]  # hopp over header
best = None
best_cpu = -1.0
for line in lines:
    parts = line.split(maxsplit=4)
    pid = parts[1]
    cpu = float(parts[2])
    cmd = parts[4]
    if cpu > best_cpu:
        best_cpu = cpu
        best = (pid, cmd)

print(f"PID {best[0]} bruker mest CPU: {best[1]}")
`,
    hints: [
      "str.split(maxsplit=4) lar deg holde resten (kommandoen) som ett felt.",
      "Hopp over første linje med [1:].",
      "Konverter CPU-verdien med float().",
    ],
  },
  {
    id: "py-dte2505-bash-output",
    topic: "DTE-2505",
    level: 2,
    title: "Simuler bash-skript-output",
    description:
      "Du har et bash-skript som teller filer. Skriv Python-kode som produserer NØYAKTIG samme stdout " +
      "for en gitt input-mappe. Mappen er gitt som en dict — keys er filnavn (slik ls ville vist dem).",
    requires: [],
    starter: `# Bash-versjonen er:
#   for f in *; do
#     echo "fil: $f"
#   done
#   echo "Totalt $(ls | wc -l) filer"

mappe = {
    "notater.md": "# Notater",
    "todo.txt": "[ ] handle",
    "script.sh": "#!/bin/bash",
}

# TODO: Skriv kode som lager den FORVENTEDE outputen:
#   fil: notater.md
#   fil: script.sh
#   fil: todo.txt
#   Totalt 3 filer
# (sortert alfabetisk, slik ls gjør)
`,
    solution: `filer = sorted(mappe.keys())
for f in filer:
    print(f"fil: {f}")
print(f"Totalt {len(filer)} filer")
`,
    hints: [
      "ls sorterer alfabetisk som default — bruk sorted().",
      "f-strings: print(f'fil: {f}').",
      "Antall er len(filer).",
    ],
  },
  {
    id: "py-dte2505-pathlib-perms",
    topic: "DTE-2505",
    level: 2,
    title: "Tolk rettigheter (S_IRWXU/G/O)",
    description:
      "stat-modus er et heltall. De ni laveste rettighet-bittene er rwxrwxrwx. " +
      "Skriv en funksjon mode_to_string(mode: int) -> str som tar et tall som 0o755 og returnerer 'rwxr-xr-x' " +
      "(9 tegn). Bruk bit-masking, ikke string-formatering på oktaltallet.",
    requires: [],
    starter: `def mode_to_string(mode: int) -> str:
    # TODO: bygg en 9-tegns streng fra mode & 0o777
    pass

assert mode_to_string(0o755) == "rwxr-xr-x"
assert mode_to_string(0o644) == "rw-r--r--"
assert mode_to_string(0o700) == "rwx------"
assert mode_to_string(0o000) == "---------"
print("OK")
`,
    solution: `def mode_to_string(mode: int) -> str:
    chars = []
    # Hvert trippel: bits 8-6 for u, 5-3 for g, 2-0 for o
    for shift in (6, 3, 0):
        triple = (mode >> shift) & 0o7
        chars.append("r" if triple & 4 else "-")
        chars.append("w" if triple & 2 else "-")
        chars.append("x" if triple & 1 else "-")
    return "".join(chars)

assert mode_to_string(0o755) == "rwxr-xr-x"
assert mode_to_string(0o644) == "rw-r--r--"
assert mode_to_string(0o700) == "rwx------"
assert mode_to_string(0o000) == "---------"
print("OK")
`,
    hints: [
      "Bruk shift: (mode >> 6) & 0o7 gir user-trippel, (mode >> 3) & 0o7 gruppe, mode & 0o7 andre.",
      "Innen hvert trippel: bit 4 = r, 2 = w, 1 = x.",
      "Bygg en liste av tegn og join til slutt.",
    ],
  },
];
