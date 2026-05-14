import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Lock } from "lucide-react";
import { Tex, TexBlock } from "@/components/Tex";

type ForgeModule = typeof import("node-forge");

async function loadForge(): Promise<ForgeModule> {
  const mod = await import("node-forge");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mod as any).default ?? mod;
}

/**
 * AesBlockModes — det berømte "ECB-pingvin"-eksempelet, kjørt med ekte AES.
 *
 * Et 16×16 pixelbilde av en pingvin-silhuett kodes som 16 byte per 4×4-blokk
 * (én pixel = én byte, svart = 0xFF, hvit = 0x00). Det gir et 16-byte AES-blokk
 * for hvert 4×4-felt — perfekt for å vise ECB vs CBC vs CTR.
 *
 *   ECB:  AES_K( plain_block )                        ← deterministisk pr blokk
 *   CBC:  AES_K( plain_block ⊕ prev_ciphertext )
 *   CTR:  plain_block ⊕ AES_K( counter )              ← GCM bruker CTR under panseret
 *
 * Resultat: ECB-bildet beholder pingvinens omriss; CBC og CTR ser ut som støy.
 */

const SIZE = 16; // 16×16 pixel image
const BLOCK = 4; // 4×4 pixels per cipher block
const BLOCKS_PER_ROW = SIZE / BLOCK; // 4
const TOTAL_BLOCKS = BLOCKS_PER_ROW * BLOCKS_PER_ROW; // 16

// Penguin silhouette as a 16×16 bitmap. 1 = body (black), 0 = background (white),
// 2 = belly (medium grey). The pattern is intentionally chunky so the 4×4 block
// boundaries line up with body parts (head/eyes/belly/feet).
const PENGUIN: number[][] = [
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
  [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
];

function pixelValueByte(v: number): number {
  // Encode the pixel as a byte that AES will see. We pick distinct, well-spread
  // values so different "colors" produce different ciphertexts in ECB.
  if (v === 0) return 0x00; // background
  if (v === 1) return 0xff; // body
  return 0x80; // belly
}

// Extract a 4×4 block as 16 bytes (row-major)
function extractBlockBytes(blockRow: number, blockCol: number): number[] {
  const bytes: number[] = [];
  for (let r = 0; r < BLOCK; r++) {
    for (let c = 0; c < BLOCK; c++) {
      const v = PENGUIN[blockRow * BLOCK + r][blockCol * BLOCK + c];
      bytes.push(pixelValueByte(v));
    }
  }
  return bytes;
}

function bytesToBinaryString(bytes: number[]): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b & 0xff);
  return s;
}

function xorBytes(a: number[], b: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.length; i++) out.push((a[i] ^ b[i]) & 0xff);
  return out;
}

function bytesFromBinary(bin: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i) & 0xff);
  return out;
}

// Hash 16 ciphertext bytes into a stable RGB color. Same bytes → same color.
function bytesToColor(bytes: number[]): string {
  // FNV-1a-ish over the bytes, then derive HSL.
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = (h * 0x01000193) >>> 0;
  }
  const hue = h % 360;
  const sat = 35 + ((h >>> 8) % 45);
  const lit = 35 + ((h >>> 16) % 35);
  return `hsl(${hue} ${sat}% ${lit}%)`;
}

// Render the unencrypted plaintext "image" to a CSS color: keeps the penguin
// recognisable. Pixel-level (not block-level).
function plainPixelColor(v: number): string {
  if (v === 0) return "#f8fafc"; // white-ish
  if (v === 1) return "#0f172a"; // near-black body
  return "#94a3b8"; // belly grey
}

type Mode = "ECB" | "CBC" | "CTR";

type EncryptOutput = {
  ciphertextBlocks: number[][]; // 16 blocks of 16 bytes each
};

function encryptBlocksEcb(forge: ForgeModule, key: number[]): EncryptOutput {
  const keyStr = bytesToBinaryString(key);
  const out: number[][] = [];
  for (let br = 0; br < BLOCKS_PER_ROW; br++) {
    for (let bc = 0; bc < BLOCKS_PER_ROW; bc++) {
      const block = extractBlockBytes(br, bc);
      // node-forge AES-ECB will PKCS#7-pad. We feed exactly 16 bytes, get
      // 32 bytes back (16 ciphertext + 16 padding). Take first 16.
      const cipher = forge.cipher.createCipher("AES-ECB", keyStr);
      cipher.start({});
      cipher.update(forge.util.createBuffer(bytesToBinaryString(block)));
      cipher.finish();
      const ctBin = cipher.output.getBytes();
      out.push(bytesFromBinary(ctBin).slice(0, 16));
    }
  }
  return { ciphertextBlocks: out };
}

function encryptBlocksCbc(forge: ForgeModule, key: number[], iv: number[]): EncryptOutput {
  const keyStr = bytesToBinaryString(key);
  // Encrypt all 16 blocks concatenated as one CBC stream. The whole plaintext
  // is 16 blocks × 16 bytes = 256 bytes, exact block boundary.
  const allBytes: number[] = [];
  for (let br = 0; br < BLOCKS_PER_ROW; br++) {
    for (let bc = 0; bc < BLOCKS_PER_ROW; bc++) {
      const block = extractBlockBytes(br, bc);
      allBytes.push(...block);
    }
  }
  const cipher = forge.cipher.createCipher("AES-CBC", keyStr);
  cipher.start({ iv: bytesToBinaryString(iv) });
  cipher.update(forge.util.createBuffer(bytesToBinaryString(allBytes)));
  cipher.finish();
  const ctBin = cipher.output.getBytes();
  const ctBytes = bytesFromBinary(ctBin);
  // Take the first 256 bytes (16 blocks). Anything after is PKCS#7 padding.
  const out: number[][] = [];
  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    out.push(ctBytes.slice(i * 16, i * 16 + 16));
  }
  return { ciphertextBlocks: out };
}

function encryptBlocksCtr(forge: ForgeModule, key: number[], iv: number[]): EncryptOutput {
  // CTR mode: ciphertext = plaintext ⊕ AES_K(counter || nonce). This is what
  // GCM uses for confidentiality. node-forge has CTR built in.
  const keyStr = bytesToBinaryString(key);
  const allBytes: number[] = [];
  for (let br = 0; br < BLOCKS_PER_ROW; br++) {
    for (let bc = 0; bc < BLOCKS_PER_ROW; bc++) {
      const block = extractBlockBytes(br, bc);
      allBytes.push(...block);
    }
  }
  const cipher = forge.cipher.createCipher("AES-CTR", keyStr);
  cipher.start({ iv: bytesToBinaryString(iv) });
  cipher.update(forge.util.createBuffer(bytesToBinaryString(allBytes)));
  cipher.finish();
  const ctBytes = bytesFromBinary(cipher.output.getBytes());
  const out: number[][] = [];
  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    out.push(ctBytes.slice(i * 16, i * 16 + 16));
  }
  return { ciphertextBlocks: out };
}

// Render one of the 16 4×4 blocks given an array of 16 ciphertext bytes.
// Each pixel in the block gets a color derived from its byte. This intentionally
// reveals byte-by-byte structure: in CBC/CTR every byte is pseudo-random; in
// ECB the byte pattern is a deterministic function of the plaintext block, so
// identical plaintext blocks produce identical pixel-byte patterns.
function blockPixelColor(byte: number): string {
  const hue = (byte * 137) % 360;
  return `hsl(${hue} 55% ${28 + (byte % 35)}%)`;
}

const TILE = 14; // px per pixel in the rendered images
const IMG_PX = SIZE * TILE; // 224px image

type RepeatStats = {
  ecbUnique: number;
  cbcUnique: number;
  ctrUnique: number;
};

function countUniqueBlocks(blocks: number[][]): number {
  const seen = new Set<string>();
  for (const b of blocks) seen.add(b.join(","));
  return seen.size;
}

export function AesBlockModes() {
  const [forge, setForge] = useState<ForgeModule | null>(null);
  const [key, setKey] = useState<number[] | null>(null);
  const [iv, setIv] = useState<number[] | null>(null);
  const [ecbOut, setEcbOut] = useState<EncryptOutput | null>(null);
  const [cbcOut, setCbcOut] = useState<EncryptOutput | null>(null);
  const [ctrOut, setCtrOut] = useState<EncryptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState(
    "aaaaaaaaaaaaaaaa" + "aaaaaaaaaaaaaaaa" + "aaaaaaaaaaaaaaaa",
  );
  const [textCiphers, setTextCiphers] = useState<{ ecb: string; cbc: string; ctr: string } | null>(
    null,
  );
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    (async () => {
      try {
        const f = await loadForge();
        setForge(f);
        const k = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
        const i = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
        setKey(k);
        setIv(i);
        runAll(f, k, i);
      } catch (e) {
        setError(String(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runAll(f: ForgeModule, k: number[], i: number[]) {
    try {
      setEcbOut(encryptBlocksEcb(f, k));
      setCbcOut(encryptBlocksCbc(f, k, i));
      setCtrOut(encryptBlocksCtr(f, k, i));
      // Text demo
      const inputBytes = (() => {
        const arr: number[] = [];
        for (let idx = 0; idx < textInput.length; idx++) arr.push(textInput.charCodeAt(idx) & 0xff);
        return arr;
      })();
      const keyStr = bytesToBinaryString(k);
      const ivStr = bytesToBinaryString(i);
      const ecbCipher = f.cipher.createCipher("AES-ECB", keyStr);
      ecbCipher.start({});
      ecbCipher.update(f.util.createBuffer(bytesToBinaryString(inputBytes)));
      ecbCipher.finish();
      const cbcCipher = f.cipher.createCipher("AES-CBC", keyStr);
      cbcCipher.start({ iv: ivStr });
      cbcCipher.update(f.util.createBuffer(bytesToBinaryString(inputBytes)));
      cbcCipher.finish();
      const ctrCipher = f.cipher.createCipher("AES-CTR", keyStr);
      ctrCipher.start({ iv: ivStr });
      ctrCipher.update(f.util.createBuffer(bytesToBinaryString(inputBytes)));
      ctrCipher.finish();
      setTextCiphers({
        ecb: f.util.bytesToHex(ecbCipher.output.getBytes()),
        cbc: f.util.bytesToHex(cbcCipher.output.getBytes()),
        ctr: f.util.bytesToHex(ctrCipher.output.getBytes()),
      });
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }

  function regenerate() {
    if (!forge) return;
    const k = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
    const i = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    setKey(k);
    setIv(i);
    runAll(forge, k, i);
  }

  useEffect(() => {
    if (!forge || !key || !iv) return;
    runAll(forge, key, iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textInput]);

  const stats: RepeatStats | null = useMemo(() => {
    if (!ecbOut || !cbcOut || !ctrOut) return null;
    return {
      ecbUnique: countUniqueBlocks(ecbOut.ciphertextBlocks),
      cbcUnique: countUniqueBlocks(cbcOut.ciphertextBlocks),
      ctrUnique: countUniqueBlocks(ctrOut.ciphertextBlocks),
    };
  }, [ecbOut, cbcOut, ctrOut]);

  // Count plaintext-block uniqueness to give context for ECB's collapse
  const plainUnique = useMemo(() => {
    const seen = new Set<string>();
    for (let br = 0; br < BLOCKS_PER_ROW; br++) {
      for (let bc = 0; bc < BLOCKS_PER_ROW; bc++) {
        seen.add(extractBlockBytes(br, bc).join(","));
      }
    }
    return seen.size;
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground flex-1 min-w-[240px]">
          Klartekst er et 16×16 «pingvin-bilde» kodet som byte. Hvert 4×4-felt blir en hel 16-byte
          AES-blokk. Vi krypterer med samme AES-256-nøkkel i tre moduser. Se hvor ECB svikter.
        </div>
        <button
          type="button"
          onClick={regenerate}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
        >
          <RefreshCw className="h-3 w-3" />
          Ny nøkkel + IV
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ImagePanel
          label="Klartekst"
          subtitle="pingvin, ukryptert"
          renderImage={(svg) => svg}
          showPlain
          ciphertextBlocks={null}
          uniqueBlocks={plainUnique}
          warningLevel="info"
        />
        <ImagePanel
          label="AES-ECB"
          subtitle="hver blokk uavhengig"
          ciphertextBlocks={ecbOut?.ciphertextBlocks ?? null}
          uniqueBlocks={stats?.ecbUnique}
          warningLevel="danger"
        />
        <ImagePanel
          label="AES-CBC"
          subtitle="kjedet med IV"
          ciphertextBlocks={cbcOut?.ciphertextBlocks ?? null}
          uniqueBlocks={stats?.cbcUnique}
          warningLevel="ok"
        />
        <ImagePanel
          label="AES-CTR (≈ GCM)"
          subtitle="counter-mode, parallelt"
          ciphertextBlocks={ctrOut?.ciphertextBlocks ?? null}
          uniqueBlocks={stats?.ctrUnique}
          warningLevel="ok"
        />
      </div>

      <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <strong>ECB avslører mønstre.</strong> Identiske klartekst-blokker gir identiske
          ciphertext-blokker — i pingvinen ovenfor ser du fortsatt omrisset selv etter «kryptering».
          Bruk <strong>aldri</strong> ECB på reelle data. Standard i 2026: AES-GCM (som internt er
          CTR + en authentication tag).
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-4 space-y-2">
        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-brand" />
          Tekst-demo — skriv noe med gjentakelser
        </div>
        <p className="text-xs text-muted-foreground">
          Hver 16-byte blokk av input krypteres. I ECB blir samme 16-byte blokk ALLTID samme
          ciphertext-blokk — du ser repetisjoner direkte i hex.
        </p>
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="w-full font-mono text-xs rounded-md border border-border bg-background px-2 py-1.5"
          placeholder="aaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaa ..."
        />
        {textCiphers && (
          <div className="grid sm:grid-cols-3 gap-2 mt-2">
            <CipherHexCard label="ECB" hex={textCiphers.ecb} highlightRepeats />
            <CipherHexCard label="CBC" hex={textCiphers.cbc} highlightRepeats />
            <CipherHexCard label="CTR / GCM" hex={textCiphers.ctr} highlightRepeats />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-background p-4 text-xs space-y-2">
        <div className="font-semibold text-foreground">Formelene</div>
        <TexBlock>{`\\text{ECB:}\\quad C_i = E_K(P_i)`}</TexBlock>
        <TexBlock>{`\\text{CBC:}\\quad C_i = E_K(P_i \\oplus C_{i-1}),\\ C_0 = \\text{IV}`}</TexBlock>
        <TexBlock>{`\\text{CTR / GCM:}\\quad C_i = P_i \\oplus E_K(\\text{nonce} \\Vert i)`}</TexBlock>
        <p className="text-muted-foreground">
          I ECB er <Tex>{`E_K`}</Tex> ren funksjon av <Tex>{`P_i`}</Tex>, så like klartekst-blokker
          → like ciphertext-blokker. CBC kjeder inn forrige ciphertext; CTR bruker en stadig økende
          teller. Begge gir pseudo-tilfeldig output selv om klartekst-blokken er identisk.
        </p>
      </div>
    </div>
  );
}

function ImagePanel({
  label,
  subtitle,
  ciphertextBlocks,
  uniqueBlocks,
  warningLevel,
  showPlain,
  renderImage,
}: {
  label: string;
  subtitle: string;
  ciphertextBlocks: number[][] | null;
  uniqueBlocks: number | undefined;
  warningLevel: "info" | "ok" | "danger";
  showPlain?: boolean;
  renderImage?: (svg: ReactNode) => ReactNode;
}) {
  const tone =
    warningLevel === "danger"
      ? "border-rose-500/40 bg-rose-500/5"
      : warningLevel === "ok"
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-border bg-background";

  const labelTone =
    warningLevel === "danger"
      ? "text-rose-700 dark:text-rose-300"
      : warningLevel === "ok"
        ? "text-emerald-700 dark:text-emerald-300"
        : "text-foreground";

  // Render the image.
  let svg: ReactNode;
  if (showPlain) {
    svg = (
      <svg
        viewBox={`0 0 ${IMG_PX} ${IMG_PX}`}
        className="w-full h-auto"
        role="img"
        aria-label="Pingvin klartekst"
      >
        {PENGUIN.flatMap((row, ry) =>
          row.map((v, cx) => (
            <rect
              key={`${ry}-${cx}`}
              x={cx * TILE}
              y={ry * TILE}
              width={TILE}
              height={TILE}
              fill={plainPixelColor(v)}
            />
          )),
        )}
        {/* Block boundaries */}
        {Array.from({ length: BLOCKS_PER_ROW - 1 }).map((_, i) => (
          <line
            key={`vline-${i}`}
            x1={(i + 1) * BLOCK * TILE}
            y1={0}
            x2={(i + 1) * BLOCK * TILE}
            y2={IMG_PX}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: BLOCKS_PER_ROW - 1 }).map((_, i) => (
          <line
            key={`hline-${i}`}
            x1={0}
            y1={(i + 1) * BLOCK * TILE}
            x2={IMG_PX}
            y2={(i + 1) * BLOCK * TILE}
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
        ))}
      </svg>
    );
  } else if (ciphertextBlocks) {
    // Color each 4×4 region. If the label is ECB, render with the block-level
    // hash color so identical plaintext blocks → identical ciphertext blocks →
    // identical color (revealing the penguin). For CBC/CTR, color each pixel
    // by its actual ciphertext byte → pseudo-random.
    const useBlockColor = label.startsWith("AES-ECB");
    svg = (
      <svg
        viewBox={`0 0 ${IMG_PX} ${IMG_PX}`}
        className="w-full h-auto"
        role="img"
        aria-label={label}
      >
        {ciphertextBlocks.map((blockBytes, idx) => {
          const br = Math.floor(idx / BLOCKS_PER_ROW);
          const bc = idx % BLOCKS_PER_ROW;
          if (useBlockColor) {
            const color = bytesToColor(blockBytes);
            return (
              <rect
                key={idx}
                x={bc * BLOCK * TILE}
                y={br * BLOCK * TILE}
                width={BLOCK * TILE}
                height={BLOCK * TILE}
                fill={color}
              />
            );
          }
          return blockBytes.map((byte, j) => {
            const r = Math.floor(j / BLOCK);
            const c = j % BLOCK;
            return (
              <rect
                key={`${idx}-${j}`}
                x={(bc * BLOCK + c) * TILE}
                y={(br * BLOCK + r) * TILE}
                width={TILE}
                height={TILE}
                fill={blockPixelColor(byte)}
              />
            );
          });
        })}
        {Array.from({ length: BLOCKS_PER_ROW - 1 }).map((_, i) => (
          <line
            key={`vline-${i}`}
            x1={(i + 1) * BLOCK * TILE}
            y1={0}
            x2={(i + 1) * BLOCK * TILE}
            y2={IMG_PX}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: BLOCKS_PER_ROW - 1 }).map((_, i) => (
          <line
            key={`hline-${i}`}
            x1={0}
            y1={(i + 1) * BLOCK * TILE}
            x2={IMG_PX}
            y2={(i + 1) * BLOCK * TILE}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        ))}
      </svg>
    );
  } else {
    svg = (
      <div
        className="w-full grid place-items-center text-xs text-muted-foreground"
        style={{ aspectRatio: "1 / 1" }}
      >
        krypterer…
      </div>
    );
  }

  const wrapped = renderImage ? renderImage(svg) : svg;

  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <div className={`text-xs font-semibold ${labelTone}`}>{label}</div>
      <div className="text-[10px] text-muted-foreground mb-2">{subtitle}</div>
      <div className="rounded overflow-hidden">{wrapped}</div>
      <div className="mt-2 text-[10.5px] text-muted-foreground">
        Unike blokker: <span className="font-mono text-foreground">{uniqueBlocks ?? "—"}</span> /{" "}
        {TOTAL_BLOCKS}
      </div>
    </div>
  );
}

function CipherHexCard({
  label,
  hex,
  highlightRepeats,
}: {
  label: string;
  hex: string;
  highlightRepeats?: boolean;
}) {
  // Split into 16-byte (32-hex-char) blocks
  const blocks: string[] = [];
  for (let i = 0; i < hex.length; i += 32) blocks.push(hex.slice(i, i + 32));
  const seen = new Map<string, number>();
  blocks.forEach((b) => seen.set(b, (seen.get(b) ?? 0) + 1));
  const repeats = highlightRepeats && Array.from(seen.values()).some((c) => c > 1);
  return (
    <div
      className={`rounded-md border p-2 ${repeats ? "border-rose-500/40 bg-rose-500/5" : "border-border bg-background"}`}
    >
      <div className="text-[11px] font-semibold flex items-center justify-between">
        <span>{label}</span>
        {repeats && (
          <span className="text-rose-600 dark:text-rose-400 text-[10px]">gjentakelse!</span>
        )}
      </div>
      <div className="font-mono text-[9.5px] break-all leading-tight mt-1 space-y-0.5">
        {blocks.map((b, i) => {
          const dup = (seen.get(b) ?? 0) > 1;
          return (
            <div
              key={i}
              className={
                dup && highlightRepeats
                  ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded px-1"
                  : ""
              }
            >
              {b}
            </div>
          );
        })}
      </div>
    </div>
  );
}
