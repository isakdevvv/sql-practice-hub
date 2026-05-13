import { useState } from "react";
import { Loader2, KeyRound, Lock, Unlock, PenTool, CheckCircle2, XCircle } from "lucide-react";

type ForgeModule = typeof import("node-forge");

type KeyPair = {
  publicKeyPem: string;
  privateKeyPem: string;
  fingerprint: string;
};

type SignResult = {
  signatureHex: string;
  signedMessage: string;
};

function chunkHex(hex: string, size = 64): string {
  const parts: string[] = [];
  for (let i = 0; i < hex.length; i += size) {
    parts.push(hex.slice(i, i + size));
  }
  return parts.join("\n");
}

async function loadForge(): Promise<ForgeModule> {
  const mod = await import("node-forge");
  // node-forge ships both default and namespace export
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mod as any).default ?? mod;
}

export function RsaPlayground() {
  const [forge, setForge] = useState<ForgeModule | null>(null);
  const [keys, setKeys] = useState<KeyPair | null>(null);
  const [generating, setGenerating] = useState(false);

  const [message, setMessage] = useState("Hemmelig melding fra DTE-2507");
  const [ciphertextHex, setCiphertextHex] = useState<string>("");
  const [decryptedText, setDecryptedText] = useState<string>("");
  const [encError, setEncError] = useState<string>("");

  const [signature, setSignature] = useState<SignResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<"ok" | "fail" | null>(null);
  const [busy, setBusy] = useState(false);

  async function ensureForge(): Promise<ForgeModule> {
    if (forge) return forge;
    const f = await loadForge();
    setForge(f);
    return f;
  }

  function fingerprintFromPem(f: ForgeModule, publicKeyPem: string): string {
    const publicKey = f.pki.publicKeyFromPem(publicKeyPem);
    const der = f.asn1
      .toDer(f.pki.publicKeyToAsn1(publicKey) as ReturnType<typeof f.asn1.create>)
      .getBytes();
    const md = f.md.sha256.create();
    md.update(der);
    const hex = md.digest().toHex();
    // group into pairs separated by colons for typical fingerprint look
    return (
      hex
        .match(/.{2}/g)
        ?.slice(0, 16)
        .join(":") + "..."
    );
  }

  async function generateKeyPair() {
    setGenerating(true);
    setKeys(null);
    setCiphertextHex("");
    setDecryptedText("");
    setSignature(null);
    setVerifyResult(null);
    setEncError("");
    try {
      const f = await ensureForge();
      // Let UI render the "Genererer..." spinner first
      await new Promise((r) => setTimeout(r, 0));
      const kp = await new Promise<{
        publicKey: ReturnType<typeof f.pki.rsa.generateKeyPair>["publicKey"];
        privateKey: ReturnType<typeof f.pki.rsa.generateKeyPair>["privateKey"];
      }>((resolve, reject) => {
        f.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, (err, kp) => {
          if (err || !kp) reject(err ?? new Error("Ingen nøkkel"));
          else resolve(kp);
        });
      });
      const publicKeyPem = f.pki.publicKeyToPem(kp.publicKey);
      const privateKeyPem = f.pki.privateKeyToPem(kp.privateKey);
      setKeys({
        publicKeyPem,
        privateKeyPem,
        fingerprint: fingerprintFromPem(f, publicKeyPem),
      });
    } catch (e) {
      setEncError(String(e));
    } finally {
      setGenerating(false);
    }
  }

  async function encrypt() {
    if (!keys) return;
    setBusy(true);
    setEncError("");
    setDecryptedText("");
    try {
      const f = await ensureForge();
      const publicKey = f.pki.publicKeyFromPem(keys.publicKeyPem);
      const bytes = f.util.encodeUtf8(message);
      // RSA-OAEP with SHA-256 — produksjons-padding
      const encrypted = publicKey.encrypt(bytes, "RSA-OAEP", {
        md: f.md.sha256.create(),
        mgf1: { md: f.md.sha256.create() },
      });
      setCiphertextHex(f.util.bytesToHex(encrypted));
    } catch (e) {
      setEncError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function decrypt() {
    if (!keys || !ciphertextHex) return;
    setBusy(true);
    setEncError("");
    try {
      const f = await ensureForge();
      const privateKey = f.pki.privateKeyFromPem(keys.privateKeyPem);
      const cipherBytes = f.util.hexToBytes(ciphertextHex);
      const decryptedBytes = privateKey.decrypt(cipherBytes, "RSA-OAEP", {
        md: f.md.sha256.create(),
        mgf1: { md: f.md.sha256.create() },
      });
      setDecryptedText(f.util.decodeUtf8(decryptedBytes));
    } catch (e) {
      setEncError(`Dekryptering feilet: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function sign() {
    if (!keys) return;
    setBusy(true);
    setVerifyResult(null);
    setEncError("");
    try {
      const f = await ensureForge();
      const privateKey = f.pki.privateKeyFromPem(keys.privateKeyPem);
      const md = f.md.sha256.create();
      md.update(f.util.encodeUtf8(message));
      const sig = privateKey.sign(md);
      setSignature({ signatureHex: f.util.bytesToHex(sig), signedMessage: message });
    } catch (e) {
      setEncError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!keys || !signature) return;
    setBusy(true);
    try {
      const f = await ensureForge();
      const publicKey = f.pki.publicKeyFromPem(keys.publicKeyPem);
      const md = f.md.sha256.create();
      // verifiser mot CURRENT message — om brukeren endrer den etter signering, feiler verifiseringen
      md.update(f.util.encodeUtf8(message));
      try {
        const ok = publicKey.verify(md.digest().bytes(), f.util.hexToBytes(signature.signatureHex));
        setVerifyResult(ok ? "ok" : "fail");
      } catch {
        setVerifyResult("fail");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand" />
          Steg 1 — generer ekte RSA-2048
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Vi bruker <code className="font-mono">node-forge</code> til å generere et 2048-bit
          nøkkelpar i nettleseren. Modulus n blir et tall på ca. 617 desimaler — ikke
          faktoriserbart i dette tiåret.
        </p>
        <button
          onClick={generateKeyPair}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Genererer (3-10 sek)...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Generer 2048-bit RSA-nøkkelpar
            </>
          )}
        </button>

        {keys && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-success/30 bg-success/5 p-3">
              <div className="text-xs uppercase tracking-wider text-success font-semibold mb-1">
                Public key fingerprint (SHA-256 av DER)
              </div>
              <code className="font-mono text-xs break-all">{keys.fingerprint}</code>
            </div>
            <details className="rounded-lg border border-border bg-muted/30 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                Vis PEM-nøkler (klikk for å åpne)
              </summary>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Public key</div>
                  <pre className="font-mono text-[10px] whitespace-pre-wrap break-all bg-background border border-border rounded p-2 max-h-40 overflow-auto">
                    {keys.publicKeyPem}
                  </pre>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Private key</div>
                  <pre className="font-mono text-[10px] whitespace-pre-wrap break-all bg-background border border-border rounded p-2 max-h-40 overflow-auto">
                    {keys.privateKeyPem}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Steg 2 — melding</h3>
        <textarea
          value={message}
          onChange={(ev) => {
            setMessage(ev.target.value);
            setVerifyResult(null);
          }}
          rows={2}
          className="w-full font-mono text-sm bg-background border border-border rounded-md p-2"
          placeholder="Skriv en melding..."
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-brand" />
          Steg 3 — krypter / dekrypter (RSA-OAEP, SHA-256)
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={encrypt}
            disabled={!keys || busy || !message}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5" />
            Krypter med PEM offentlig nøkkel
          </button>
          <button
            onClick={decrypt}
            disabled={!keys || busy || !ciphertextHex}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <Unlock className="h-3.5 w-3.5" />
            Dekrypter med PEM privat nøkkel
          </button>
        </div>
        {ciphertextHex && (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-1">
              Ciphertext (hex, {ciphertextHex.length / 2} byte = {ciphertextHex.length / 2 * 8} bit)
            </div>
            <pre className="font-mono text-[10px] whitespace-pre-wrap break-all bg-background border border-border rounded p-2 max-h-40 overflow-auto">
              {chunkHex(ciphertextHex)}
            </pre>
          </div>
        )}
        {decryptedText && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-success font-semibold mb-1">
              Dekryptert klartekst
            </div>
            <code className="font-mono break-all">{decryptedText}</code>
          </div>
        )}
        {encError && (
          <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {encError}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <PenTool className="h-4 w-4 text-brand" />
          Steg 4 — signer / verifiser (RSA-PKCS1-v1_5 over SHA-256)
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={sign}
            disabled={!keys || busy || !message}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <PenTool className="h-3.5 w-3.5" />
            Signer med privat nøkkel
          </button>
          <button
            onClick={verify}
            disabled={!keys || busy || !signature}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verifiser signatur
          </button>
        </div>
        {signature && (
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">
              Signatur (hex, {signature.signatureHex.length / 2} byte)
            </div>
            <pre className="font-mono text-[10px] whitespace-pre-wrap break-all bg-background border border-border rounded p-2 max-h-32 overflow-auto">
              {chunkHex(signature.signatureHex)}
            </pre>
            <p className="text-xs text-muted-foreground mt-1">
              Signaturen ble laget over meldingen «{signature.signedMessage}». Endrer du
              meldingen og verifiserer, feiler verifiseringen.
            </p>
          </div>
        )}
        {verifyResult === "ok" && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="font-semibold text-success">Verifisert</span> — signaturen matcher
            meldingen og public key.
          </div>
        )}
        {verifyResult === "fail" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-destructive">Verifisering FEILET</span> —
            meldingen er endret eller signaturen er ikke fra denne private nøkkelen.
          </div>
        )}
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
        <h4 className="font-semibold text-brand mb-2">
          Hvorfor er ekte RSA-2048 ikke det samme som mini-versjonen?
        </h4>
        <ul className="space-y-1.5 list-disc pl-5 text-muted-foreground">
          <li>
            <strong>Nøkkelstørrelse:</strong> mini brukte n=143 (8 bit). RSA-2048 har n med
            2048 bit ≈ 617 desimaler. Best kjente faktorisering er 829 bit (RSA-250, 2020) —
            2048 er ikke i nærheten av brytbart klassisk.
          </li>
          <li>
            <strong>Padding (OAEP):</strong> ekte RSA legger til randomisert padding før
            kryptering. To krypteringer av samme melding gir DIFFERENT ciphertext — uten
            padding ville en angriper kunne se «aha, samme melding som sist».
          </li>
          <li>
            <strong>Public exponent e=65537:</strong> stort nok til å unngå low-exponent
            angrep, lite nok til at kryptering er rask.
          </li>
          <li>
            <strong>Signering med PKCS#1 v1.5 / PSS:</strong> man signerer ALDRI meldingen
            direkte — alltid hashen, med padding. Ellers er signaturen sårbar for
            existential forgery.
          </li>
        </ul>
      </div>
    </div>
  );
}
