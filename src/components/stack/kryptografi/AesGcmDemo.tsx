import { useState } from "react";
import { Lock, Unlock, Key, Shuffle, AlertTriangle, CheckCircle2 } from "lucide-react";

type ForgeModule = typeof import("node-forge");

async function loadForge(): Promise<ForgeModule> {
  const mod = await import("node-forge");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mod as any).default ?? mod;
}

function chunkHex(hex: string, size = 64): string {
  const parts: string[] = [];
  for (let i = 0; i < hex.length; i += size) {
    parts.push(hex.slice(i, i + size));
  }
  return parts.join("\n");
}

export function AesGcmDemo() {
  const [forge, setForge] = useState<ForgeModule | null>(null);
  const [plaintext, setPlaintext] = useState("DTE-2507: AES-GCM gir BÅDE konfidensialitet og integritet.");
  const [keyHex, setKeyHex] = useState("");
  const [ivHex, setIvHex] = useState("");
  const [ciphertextHex, setCiphertextHex] = useState("");
  const [tagHex, setTagHex] = useState("");
  const [decrypted, setDecrypted] = useState("");
  const [error, setError] = useState("");
  const [tampered, setTampered] = useState(false);

  async function ensureForge(): Promise<ForgeModule> {
    if (forge) return forge;
    const f = await loadForge();
    setForge(f);
    return f;
  }

  async function generateKey() {
    const f = await ensureForge();
    const keyBytes = f.random.getBytesSync(32); // AES-256
    setKeyHex(f.util.bytesToHex(keyBytes));
    setCiphertextHex("");
    setTagHex("");
    setDecrypted("");
    setError("");
    setTampered(false);
  }

  async function generateIv() {
    const f = await ensureForge();
    const ivBytes = f.random.getBytesSync(12); // 96-bit IV, anbefalt for GCM
    setIvHex(f.util.bytesToHex(ivBytes));
    setCiphertextHex("");
    setTagHex("");
    setDecrypted("");
    setError("");
    setTampered(false);
  }

  async function encrypt() {
    setError("");
    setDecrypted("");
    setTampered(false);
    try {
      const f = await ensureForge();
      if (!keyHex) {
        setError("Generer en nøkkel først.");
        return;
      }
      if (!ivHex) {
        setError("Generer en IV først.");
        return;
      }
      const cipher = f.cipher.createCipher("AES-GCM", f.util.hexToBytes(keyHex));
      cipher.start({
        iv: f.util.hexToBytes(ivHex),
        tagLength: 128,
      });
      cipher.update(f.util.createBuffer(f.util.encodeUtf8(plaintext)));
      cipher.finish();
      setCiphertextHex(f.util.bytesToHex(cipher.output.getBytes()));
      setTagHex(f.util.bytesToHex(cipher.mode.tag.getBytes()));
    } catch (e) {
      setError(String(e));
    }
  }

  async function decrypt() {
    setError("");
    setDecrypted("");
    try {
      const f = await ensureForge();
      if (!ciphertextHex || !tagHex) {
        setError("Krypter noe først.");
        return;
      }
      const decipher = f.cipher.createDecipher("AES-GCM", f.util.hexToBytes(keyHex));
      decipher.start({
        iv: f.util.hexToBytes(ivHex),
        tagLength: 128,
        tag: f.util.createBuffer(f.util.hexToBytes(tagHex)),
      });
      decipher.update(f.util.createBuffer(f.util.hexToBytes(ciphertextHex)));
      const ok = decipher.finish();
      if (!ok) {
        setError(
          "Dekryptering FEILET — auth tag stemte ikke. GCM nekter å gi ut data hvis integritet er brutt.",
        );
        return;
      }
      setDecrypted(f.util.decodeUtf8(decipher.output.getBytes()));
    } catch (e) {
      setError(`Dekryptering kastet feil: ${String(e)}`);
    }
  }

  function tamper() {
    if (!ciphertextHex) return;
    // flipp ett bit i første byte
    const firstByte = parseInt(ciphertextHex.slice(0, 2), 16);
    const flipped = (firstByte ^ 0x01).toString(16).padStart(2, "0");
    setCiphertextHex(flipped + ciphertextHex.slice(2));
    setTampered(true);
    setDecrypted("");
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-brand" />
          Steg 1 — generer AES-256-nøkkel og IV
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={generateKey}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            <Key className="h-3.5 w-3.5" />
            Generer AES-256 nøkkel (32 byte)
          </button>
          <button
            onClick={generateIv}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            <Shuffle className="h-3.5 w-3.5" />
            Generer IV (12 byte)
          </button>
        </div>
        {keyHex && (
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">Nøkkel (256 bit, hex)</div>
            <code className="font-mono text-[10px] break-all block bg-background border border-border rounded p-2">
              {keyHex}
            </code>
          </div>
        )}
        {ivHex && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">IV / nonce (96 bit, hex)</div>
            <code className="font-mono text-[10px] break-all block bg-background border border-border rounded p-2">
              {ivHex}
            </code>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Aldri</strong> gjenbruk samme (nøkkel, IV)-par for to krypteringer. GCM
              kollapser hvis du gjør det.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Steg 2 — klartekst</h3>
        <textarea
          value={plaintext}
          onChange={(ev) => {
            setPlaintext(ev.target.value);
            setCiphertextHex("");
            setTagHex("");
            setDecrypted("");
            setTampered(false);
          }}
          rows={3}
          className="w-full font-mono text-sm bg-background border border-border rounded-md p-2"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-brand" />
          Steg 3 — krypter med AES-GCM
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={encrypt}
            disabled={!keyHex || !ivHex}
            className="inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5" />
            Krypter (AES-256-GCM)
          </button>
          <button
            onClick={decrypt}
            disabled={!ciphertextHex}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <Unlock className="h-3.5 w-3.5" />
            Dekrypter + verifiser tag
          </button>
          <button
            onClick={tamper}
            disabled={!ciphertextHex}
            className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-2 text-sm hover:bg-amber-500/20 disabled:opacity-50"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Tukle med ciphertext (flipp 1 bit)
          </button>
        </div>

        {ciphertextHex && (
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
              Ciphertext (hex)
              {tampered && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  TUKLET
                </span>
              )}
            </div>
            <pre className="font-mono text-[10px] whitespace-pre-wrap break-all bg-background border border-border rounded p-2 max-h-32 overflow-auto">
              {chunkHex(ciphertextHex)}
            </pre>
          </div>
        )}
        {tagHex && (
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">Auth tag (128 bit, hex)</div>
            <code className="font-mono text-[10px] break-all block bg-background border border-border rounded p-2">
              {tagHex}
            </code>
          </div>
        )}

        {decrypted && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider text-success font-semibold mb-1">
                Dekryptert OG verifisert
              </div>
              <code className="font-mono break-all">{decrypted}</code>
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <strong className="text-destructive">{error}</strong>
              {tampered && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Det er hele poenget med GCM: auth tag-en beregnes over (ciphertext + IV +
                  evt. AAD). Endrer du ÉN bit, blir den utregnede tag-en helt annerledes enn
                  den lagrede. Dekryptering avbrytes før data lekker.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
        <h4 className="font-semibold text-brand mb-2">GCM vs CBC — hvorfor velge GCM?</h4>
        <div className="overflow-x-auto rounded-lg border border-border mt-2">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-semibold px-3 py-2 w-32">Egenskap</th>
                <th className="text-left font-semibold px-3 py-2">AES-CBC</th>
                <th className="text-left font-semibold px-3 py-2">AES-GCM</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono text-brand">Konfidensialitet</td>
                <td className="px-3 py-2 text-muted-foreground">Ja</td>
                <td className="px-3 py-2 text-muted-foreground">Ja</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono text-brand">Integritet</td>
                <td className="px-3 py-2 text-destructive">Nei — trenger separat HMAC</td>
                <td className="px-3 py-2 text-success">Ja, innebygd auth tag</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono text-brand">Padding-orakel?</td>
                <td className="px-3 py-2 text-destructive">Sårbar (PKCS#7 padding)</td>
                <td className="px-3 py-2 text-success">Nei — ingen padding</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono text-brand">Parallelliserbar</td>
                <td className="px-3 py-2 text-muted-foreground">Enc: nei, Dec: ja</td>
                <td className="px-3 py-2 text-success">Begge ja — raskere</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2 font-mono text-brand">Brukt i</td>
                <td className="px-3 py-2 text-muted-foreground">TLS 1.2 (avviklet)</td>
                <td className="px-3 py-2 text-muted-foreground">TLS 1.3, HTTPS, IPsec</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          AES-GCM er <strong>AEAD</strong> (Authenticated Encryption with Associated Data) —
          standardvalget i 2026. Det eneste du må passe på: aldri gjenbruk nonce + nøkkel.
        </p>
      </div>
    </div>
  );
}
