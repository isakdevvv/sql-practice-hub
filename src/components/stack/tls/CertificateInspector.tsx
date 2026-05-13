import { useState } from "react";
import { FileText, AlertTriangle, ShieldCheck, Eraser, ClipboardPaste } from "lucide-react";

type ForgeModule = typeof import("node-forge");

async function loadForge(): Promise<ForgeModule> {
  const mod = await import("node-forge");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mod as any).default ?? mod;
}

// ISRG Root X1 — Let's Encrypts rotsertifikat. Selvsignert, langt holdbarhet,
// stabilt eksempel som ikke roterer. Bra studieobjekt: viser en KOMPLETT X.509-struktur
// med navn, validitet, signatur og extensions.
const EXAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----`;

type ParsedCert = {
  subject: { name: string; value: string }[];
  issuer: { name: string; value: string }[];
  serialNumber: string;
  validFrom: string;
  validTo: string;
  signatureAlgorithm: string;
  publicKey: { type: string; bits: number };
  extensions: { name: string; value: string }[];
  selfSigned: boolean;
};

function formatDate(d: Date): string {
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function describeAttribute(name: string): string {
  switch (name) {
    case "commonName":
      return "CN (Common Name)";
    case "countryName":
      return "C (Country)";
    case "stateOrProvinceName":
      return "ST (State)";
    case "localityName":
      return "L (Locality)";
    case "organizationName":
      return "O (Organization)";
    case "organizationalUnitName":
      return "OU (Org. Unit)";
    default:
      return name;
  }
}

export function CertificateInspector() {
  const [pemInput, setPemInput] = useState<string>(EXAMPLE_PEM);
  const [parsed, setParsed] = useState<ParsedCert | null>(null);
  const [error, setError] = useState<string>("");

  async function parse() {
    setError("");
    setParsed(null);
    try {
      const forge = await loadForge();
      const cert = forge.pki.certificateFromPem(pemInput);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sigOidLookup = (forge.pki.oids as Record<string, string>);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sigOidValue: string = (cert as any).siginfo?.algorithmOid ?? (cert as any).signatureOid ?? "";
      const sigAlgName = sigOidValue && sigOidLookup[sigOidValue] ? sigOidLookup[sigOidValue] : sigOidValue || "ukjent";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pk = cert.publicKey as any;
      const pkBits = pk?.n?.bitLength ? pk.n.bitLength() : 0;

      const extensions: { name: string; value: string }[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const ext of (cert.extensions as any[]) ?? []) {
        const name: string = ext.name ?? ext.id;
        let value = "";
        if (name === "subjectAltName" && ext.altNames) {
          value = ext.altNames
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((a: any) => a.value)
            .filter(Boolean)
            .join(", ");
        } else if (name === "keyUsage") {
          const flags: string[] = [];
          if (ext.digitalSignature) flags.push("digitalSignature");
          if (ext.nonRepudiation) flags.push("nonRepudiation");
          if (ext.keyEncipherment) flags.push("keyEncipherment");
          if (ext.dataEncipherment) flags.push("dataEncipherment");
          if (ext.keyAgreement) flags.push("keyAgreement");
          if (ext.keyCertSign) flags.push("keyCertSign");
          if (ext.cRLSign) flags.push("cRLSign");
          value = flags.join(", ");
        } else if (name === "basicConstraints") {
          value = `cA=${ext.cA ?? false}${ext.pathLenConstraint !== undefined ? `, pathLen=${ext.pathLenConstraint}` : ""}`;
        } else if (name === "extKeyUsage") {
          const flags: string[] = [];
          if (ext.serverAuth) flags.push("serverAuth");
          if (ext.clientAuth) flags.push("clientAuth");
          if (ext.codeSigning) flags.push("codeSigning");
          if (ext.emailProtection) flags.push("emailProtection");
          if (ext.timeStamping) flags.push("timeStamping");
          value = flags.join(", ");
        } else if (typeof ext.value === "string") {
          value = ext.value.slice(0, 120);
        } else {
          value = "(present)";
        }
        extensions.push({ name, value });
      }

      const subject = cert.subject.attributes.map((a) => ({
        name: describeAttribute(a.name ?? ""),
        value: String(a.value ?? ""),
      }));
      const issuer = cert.issuer.attributes.map((a) => ({
        name: describeAttribute(a.name ?? ""),
        value: String(a.value ?? ""),
      }));

      const subjectStr = subject.map((s) => `${s.name}=${s.value}`).join(",");
      const issuerStr = issuer.map((s) => `${s.name}=${s.value}`).join(",");

      setParsed({
        subject,
        issuer,
        serialNumber: cert.serialNumber,
        validFrom: formatDate(cert.validity.notBefore),
        validTo: formatDate(cert.validity.notAfter),
        signatureAlgorithm: sigAlgName,
        publicKey: { type: pk?.n ? "RSA" : "EC/ukjent", bits: pkBits },
        extensions,
        selfSigned: subjectStr === issuerStr,
      });
    } catch (e) {
      setError(`Klarte ikke parse: ${String(e)}`);
    }
  }

  function loadExample() {
    setPemInput(EXAMPLE_PEM);
    setError("");
    setParsed(null);
  }

  function clear() {
    setPemInput("");
    setParsed(null);
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand" />
          Lim inn et X.509-sertifikat (PEM)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          PEM-format starter med <code className="font-mono">-----BEGIN CERTIFICATE-----</code>
          og slutter med <code className="font-mono">-----END CERTIFICATE-----</code>. Vi
          parser med <code className="font-mono">forge.pki.certificateFromPem()</code> —
          samme ASN.1-parsing som <code className="font-mono">openssl x509</code> gjør.
        </p>
        <textarea
          value={pemInput}
          onChange={(ev) => setPemInput(ev.target.value)}
          rows={10}
          className="w-full font-mono text-[10px] bg-background border border-border rounded-md p-2"
          placeholder="-----BEGIN CERTIFICATE-----..."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={parse}
            disabled={!pemInput}
            className="inline-flex items-center gap-2 rounded-md bg-brand text-brand-foreground px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Parser sertifikat
          </button>
          <button
            onClick={loadExample}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Last inn eksempel (ISRG Root X1)
          </button>
          <button
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            <Eraser className="h-3.5 w-3.5" />
            Tøm
          </button>
        </div>
        {error && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-destructive">{error}</span>
          </div>
        )}
      </div>

      {parsed && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            Parsed innhold
            {parsed.selfSigned && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand bg-brand/10 border border-brand/30 rounded px-2 py-0.5">
                Selvsignert (rot-CA)
              </span>
            )}
          </h3>

          <Section title="Subject (hvem sertifikatet identifiserer)">
            <AttrList items={parsed.subject} />
          </Section>

          <Section title="Issuer (hvem som signerte)">
            <AttrList items={parsed.issuer} />
            {parsed.selfSigned && (
              <p className="mt-2 text-xs text-muted-foreground">
                Subject == Issuer → selvsignert. Dette er typisk for en rot-CA: den signerer
                seg selv, og du må stole på den fordi den ligger pre-installert i
                OS/nettleser.
              </p>
            )}
          </Section>

          <div className="grid sm:grid-cols-2 gap-3">
            <KV label="Serienummer" value={parsed.serialNumber} mono />
            <KV
              label="Signaturalgoritme"
              value={parsed.signatureAlgorithm}
              mono
            />
            <KV label="Gyldig fra" value={parsed.validFrom} mono />
            <KV label="Gyldig til" value={parsed.validTo} mono />
            <KV
              label="Public key"
              value={`${parsed.publicKey.type} ${parsed.publicKey.bits} bit`}
              mono
            />
            <KV label="Extensions" value={`${parsed.extensions.length} stk`} />
          </div>

          {parsed.extensions.length > 0 && (
            <Section title="Extensions (X.509 v3)">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left font-semibold px-3 py-2 w-48">Navn</th>
                      <th className="text-left font-semibold px-3 py-2">Verdi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.extensions.map((ext, idx) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-brand break-all">{ext.name}</td>
                        <td className="px-3 py-2 text-muted-foreground break-all">
                          {ext.value || <em className="opacity-60">tom</em>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs">
            <strong className="text-brand">Hva nettleseren gjør med dette:</strong> verifiserer
            at signaturen er gyldig opp en kjede til en rot-CA i sin trust store, sjekker at
            domenenavnet matcher subjectAltName, og at nå er mellom notBefore og notAfter.
            Hvis noe svikter — rød advarsel.
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function AttrList({ items }: { items: { name: string; value: string }[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {items.map((it, idx) => (
        <li key={idx} className="flex flex-wrap gap-2">
          <span className="font-mono text-xs text-muted-foreground w-40 shrink-0">
            {it.name}
          </span>
          <span className="font-mono text-xs break-all">{it.value}</span>
        </li>
      ))}
      {items.length === 0 && (
        <li className="text-xs text-muted-foreground italic">(ingen attributter)</li>
      )}
    </ul>
  );
}

function KV({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      <div className={mono ? "font-mono text-xs break-all" : "text-sm"}>{value}</div>
    </div>
  );
}
