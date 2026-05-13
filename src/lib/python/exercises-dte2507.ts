import type { PyExercise } from "./types";

// Nettverks- og krypto-relaterte Python-oppgaver for DTE-2507.
// Pyodide har ikke ekte sockets, derfor simulerer vi struktur og lar
// studenten teste mot forhåndsdefinerte input/output. hashlib finnes.

export const DTE2507_EXERCISES: PyExercise[] = [
  {
    id: "py-dte2507-socket-skeleton",
    topic: "DTE-2507",
    level: 1,
    title: "TCP-klient-skjelett",
    description:
      "Skriv en funksjon make_request(host: str, port: int, msg: bytes) -> bytes som BYGGER og returnerer hva som ville blitt sendt — vi sjekker struktur. " +
      "Bruk socket.socket, connect((host, port)), sendall(msg), recv(4096), close. Pyodide har ikke ekte nettverk, men koden må være korrekt.",
    requires: [],
    starter: `# Skriv en funksjon som lager strukturen for en TCP-klient.
# Sjekkes mot en mock-socket.
import socket

class MockSocket:
    def __init__(self, *args, **kwargs):
        self.calls = []
    def connect(self, addr):
        self.calls.append(("connect", addr))
    def sendall(self, data):
        self.calls.append(("sendall", data))
    def recv(self, n):
        self.calls.append(("recv", n))
        return b"HTTP/1.1 200 OK\\r\\n\\r\\nhello"
    def close(self):
        self.calls.append(("close",))

socket.socket = lambda *a, **k: MockSocket()

def make_request(host: str, port: int, msg: bytes) -> bytes:
    # TODO: lag socket, connect, sendall, recv, close, returner svar
    pass

resp = make_request("example.com", 80, b"GET / HTTP/1.1\\r\\nHost: x\\r\\n\\r\\n")
print(resp)
assert resp.startswith(b"HTTP/1.1 200")
print("OK")
`,
    solution: `import socket

def make_request(host: str, port: int, msg: bytes) -> bytes:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((host, port))
    s.sendall(msg)
    data = s.recv(4096)
    s.close()
    return data
`,
    hints: [
      "Lag socket: s = socket.socket(socket.AF_INET, socket.SOCK_STREAM).",
      "Connect tar en TUPLE: s.connect((host, port)).",
      "Recv returnerer bytes — det er hva du skal returnere.",
    ],
  },
  {
    id: "py-dte2507-subnet-calc",
    topic: "DTE-2507",
    level: 1,
    title: "Subnet-kalkulator i Python",
    description:
      "Skriv subnet_info(cidr: str) -> dict som tar f.eks. '192.168.1.130/26' og returnerer dict med keys: network, broadcast, num_total, num_usable.",
    requires: [],
    starter: `def subnet_info(cidr: str) -> dict:
    # TODO: parse CIDR, regn ut network, broadcast, antall
    pass

r = subnet_info("192.168.1.130/26")
print(r)
assert r["network"] == "192.168.1.128"
assert r["broadcast"] == "192.168.1.191"
assert r["num_total"] == 64
assert r["num_usable"] == 62
print("OK")
`,
    solution: `def subnet_info(cidr: str) -> dict:
    ip_str, prefix_str = cidr.split("/")
    prefix = int(prefix_str)
    octets = [int(x) for x in ip_str.split(".")]
    ip_int = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]
    mask = 0 if prefix == 0 else (0xffffffff << (32 - prefix)) & 0xffffffff
    network = ip_int & mask
    broadcast = network | (~mask & 0xffffffff)

    def to_str(v):
        return ".".join(str((v >> s) & 0xff) for s in (24, 16, 8, 0))

    total = 2 ** (32 - prefix)
    return {
        "network": to_str(network),
        "broadcast": to_str(broadcast),
        "num_total": total,
        "num_usable": total - 2 if total > 2 else total,
    }
`,
    hints: [
      "Split på '/' for å skille IP og prefix.",
      "Konverter IP til int: (a<<24) | (b<<16) | (c<<8) | d.",
      "Maske: 0xffffffff << (32 - prefix), AND-d med 0xffffffff for å holde 32 bit.",
      "network = ip & mask, broadcast = network | ~mask.",
    ],
  },
  {
    id: "py-dte2507-rsa-mini",
    topic: "DTE-2507",
    level: 2,
    title: "RSA-mini med små primtall",
    description:
      "Skriv en RSA-implementasjon: rsa_keygen(p, q, e) -> (n, d), rsa_encrypt(m, e, n), rsa_decrypt(c, d, n). " +
      "Test med p=61, q=53, e=17. Krypter m=65, dekrypter, sjekk at du får 65 tilbake.",
    requires: [],
    starter: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def mod_inverse(e, phi):
    # Utvidet Euklid
    old_r, r = e, phi
    old_s, s = 1, 0
    while r != 0:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    return old_s % phi

def rsa_keygen(p, q, e):
    n = p * q
    phi = (p - 1) * (q - 1)
    assert gcd(e, phi) == 1
    d = mod_inverse(e, phi)
    return n, d

def rsa_encrypt(m, e, n):
    return pow(m, e, n)

def rsa_decrypt(c, d, n):
    return pow(c, d, n)

# TODO: test med p=61, q=53, e=17
# Krypter m=65, dekrypter
n, d = rsa_keygen(61, 53, 17)
print(f"n={n}, d={d}")
c = rsa_encrypt(65, 17, n)
print(f"c={c}")
m_back = rsa_decrypt(c, d, n)
print(f"m={m_back}")
assert m_back == 65
print("RSA round-trip OK")
`,
    solution: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def mod_inverse(e, phi):
    old_r, r = e, phi
    old_s, s = 1, 0
    while r != 0:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    return old_s % phi

def rsa_keygen(p, q, e):
    n = p * q
    phi = (p - 1) * (q - 1)
    d = mod_inverse(e, phi)
    return n, d

def rsa_encrypt(m, e, n):
    return pow(m, e, n)

def rsa_decrypt(c, d, n):
    return pow(c, d, n)

n, d = rsa_keygen(61, 53, 17)
c = rsa_encrypt(65, 17, n)
assert rsa_decrypt(c, d, n) == 65
print("OK")
`,
    hints: [
      "Python har innebygd pow(base, exp, mod) som er rask modulær eksponentiering.",
      "Bruk utvidet Euklid for å finne modulær invers d = e^(-1) mod φ.",
      "Du må sikre at gcd(e, φ) = 1, ellers eksisterer ikke d.",
    ],
  },
  {
    id: "py-dte2507-caesar-vigenere",
    topic: "DTE-2507",
    level: 1,
    title: "Caesar og Vigenère",
    description:
      "Implementer to klassiske shift-cipher-funksjoner: caesar(text, shift) som flytter alle bokstaver shift posisjoner, og vigenere(text, key) som bruker en nøkkel-streng for variabel shift.",
    requires: [],
    starter: `def caesar(text: str, shift: int) -> str:
    # TODO: flytt hver bokstav 'shift' steg. Behold mellomrom.
    pass

def vigenere(text: str, key: str) -> str:
    # TODO: shift med key[i % len(key)].
    pass

assert caesar("HELLO", 3) == "KHOOR"
assert caesar("KHOOR", -3) == "HELLO"
assert vigenere("HELLO", "AB") == "HFLMO"  # H+0, E+1, L+0, L+1, O+0
print("OK")
`,
    solution: `def caesar(text: str, shift: int) -> str:
    out = []
    for c in text:
        if c.isalpha():
            base = ord("A") if c.isupper() else ord("a")
            out.append(chr((ord(c) - base + shift) % 26 + base))
        else:
            out.append(c)
    return "".join(out)

def vigenere(text: str, key: str) -> str:
    out = []
    ki = 0
    for c in text:
        if c.isalpha():
            base = ord("A") if c.isupper() else ord("a")
            shift = ord(key[ki % len(key)].upper()) - ord("A")
            out.append(chr((ord(c) - base + shift) % 26 + base))
            ki += 1
        else:
            out.append(c)
    return "".join(out)
`,
    hints: [
      "ord('A') = 65. (ord(c) - 65 + shift) % 26 + 65 gir ny bokstav for store.",
      "Vigenère: hold en separat key-indeks som bare øker for ALFABETISKE tegn.",
    ],
  },
  {
    id: "py-dte2507-hashlib",
    topic: "DTE-2507",
    level: 1,
    title: "Hashing med hashlib",
    description:
      "Bruk Pythons hashlib. Skriv hash_password(password: str, salt: bytes) -> str som returnerer hex-digest av SHA-256(salt + password.encode()). " +
      "Skriv også verify(pw: str, salt: bytes, expected_hex: str) -> bool.",
    requires: [],
    starter: `import hashlib

def hash_password(password: str, salt: bytes) -> str:
    # TODO: konkateneer salt + password.encode() og SHA-256
    pass

def verify(pw: str, salt: bytes, expected_hex: str) -> bool:
    return hash_password(pw, salt) == expected_hex

salt = b"\\x01\\x02\\x03\\x04"
h = hash_password("hemmelig", salt)
print(f"hash = {h}")
assert verify("hemmelig", salt, h)
assert not verify("feil", salt, h)
print("OK")
`,
    solution: `import hashlib

def hash_password(password: str, salt: bytes) -> str:
    return hashlib.sha256(salt + password.encode()).hexdigest()

def verify(pw, salt, expected_hex):
    return hash_password(pw, salt) == expected_hex
`,
    hints: [
      "hashlib.sha256(data) returnerer et hash-objekt.",
      "Bruk .hexdigest() for å få det som hex-streng.",
      "I praksis: bruk en SLOW KDF som bcrypt/argon2, ikke ren SHA-256.",
    ],
  },
  {
    id: "py-dte2507-http-parse",
    topic: "DTE-2507",
    level: 2,
    title: "Tolk rå HTTP-request",
    description:
      "Skriv parse_request(raw: bytes) -> dict som tar en rå HTTP-request og returnerer dict med method, path, version, headers (dict) og body (bytes).",
    requires: [],
    starter: `RAW = (b"GET /home HTTP/1.1\\r\\n"
       b"Host: example.no\\r\\n"
       b"User-Agent: curl/7.0\\r\\n"
       b"Accept: */*\\r\\n"
       b"\\r\\n")

def parse_request(raw: bytes) -> dict:
    # TODO: splitt headere og body, parse første linje, og headere
    pass

r = parse_request(RAW)
print(r)
assert r["method"] == "GET"
assert r["path"] == "/home"
assert r["version"] == "HTTP/1.1"
assert r["headers"]["Host"] == "example.no"
print("OK")
`,
    solution: `def parse_request(raw: bytes) -> dict:
    head, _, body = raw.partition(b"\\r\\n\\r\\n")
    lines = head.split(b"\\r\\n")
    method, path, version = lines[0].decode().split()
    headers = {}
    for line in lines[1:]:
        if not line:
            continue
        k, _, v = line.decode().partition(":")
        headers[k.strip()] = v.strip()
    return {"method": method, "path": path, "version": version, "headers": headers, "body": body}
`,
    hints: [
      "bytes.partition(b'\\r\\n\\r\\n') skiller headers fra body i ett kall.",
      "Første linje: 'METHOD PATH VERSION' — split() funker.",
      "Header-linjer: split på første ':' med partition.",
    ],
  },
  {
    id: "py-dte2507-cert-parse",
    topic: "DTE-2507",
    level: 2,
    title: "Forenklet X.509-tolking",
    description:
      "Vi har en mock-cert-streng. Skriv en funksjon parse_cert(text: str) -> dict som plukker ut subject, issuer, valid_from, valid_to, og signature_algorithm.",
    requires: [],
    starter: `CERT_TEXT = """
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 04:5b:c0
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN=Let's Encrypt R3
        Validity
            Not Before: Mar 14 10:00:00 2024 GMT
            Not After : Jun 12 10:00:00 2024 GMT
        Subject: CN=shop.example.no
"""

def parse_cert(text: str) -> dict:
    # TODO: trekk ut feltene som dict-keys: subject, issuer,
    # valid_from, valid_to, sig_alg
    pass

r = parse_cert(CERT_TEXT)
print(r)
assert r["subject"] == "CN=shop.example.no"
assert r["issuer"] == "CN=Let's Encrypt R3"
assert "sha256" in r["sig_alg"]
print("OK")
`,
    solution: `import re

def parse_cert(text: str) -> dict:
    def grab(pattern):
        m = re.search(pattern, text)
        return m.group(1).strip() if m else None
    return {
        "subject": grab(r"Subject:\\s*(.+)"),
        "issuer": grab(r"Issuer:\\s*(.+)"),
        "valid_from": grab(r"Not Before:\\s*(.+)"),
        "valid_to": grab(r"Not After\\s*:\\s*(.+)"),
        "sig_alg": grab(r"Signature Algorithm:\\s*(.+)"),
    }
`,
    hints: [
      "re.search returnerer et Match-objekt eller None.",
      "Bruk en grupperende parentes (.+) for å fange resten av linja.",
      "Test hver regex isolert hvis assert feiler.",
    ],
  },
  {
    id: "py-dte2507-hmac",
    topic: "DTE-2507",
    level: 2,
    title: "HMAC for meldingsautentisering",
    description:
      "Bruk hmac-modulet. Skriv sign(msg: bytes, key: bytes) -> str (hex digest) og verify(msg, key, sig). " +
      "hmac.compare_digest gir konstant-tid sammenligning som er sikker mot timing-angrep.",
    requires: [],
    starter: `import hmac
import hashlib

def sign(msg: bytes, key: bytes) -> str:
    # TODO: HMAC-SHA256, returner hex digest
    pass

def verify(msg: bytes, key: bytes, sig: str) -> bool:
    # TODO: bruk hmac.compare_digest
    pass

key = b"hemmelig-app-key"
msg = b"betal 1000 NOK til 123"
s = sign(msg, key)
print(f"sig = {s}")
assert verify(msg, key, s)
assert not verify(b"betal 9999 NOK til 999", key, s)
print("OK")
`,
    solution: `import hmac
import hashlib

def sign(msg: bytes, key: bytes) -> str:
    return hmac.new(key, msg, hashlib.sha256).hexdigest()

def verify(msg: bytes, key: bytes, sig: str) -> bool:
    return hmac.compare_digest(sign(msg, key), sig)
`,
    hints: [
      "hmac.new(key, msg, hashlib.sha256) lager et HMAC-objekt.",
      ".hexdigest() gir hex-streng.",
      "compare_digest beskytter mot timing-angrep — IKKE bruk == direkte.",
    ],
  },
];
