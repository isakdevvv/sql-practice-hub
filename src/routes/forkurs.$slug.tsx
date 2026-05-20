import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StackPageShell } from "@/components/stack/StackPageShell";
import { F01Virtualisering } from "@/components/stack/forkurs/F01Virtualisering";
import { F02InstallerVm } from "@/components/stack/forkurs/F02InstallerVm";
import { F03Snapshots } from "@/components/stack/forkurs/F03Snapshots";
import { F04Terminal } from "@/components/stack/forkurs/F04Terminal";
import { F05PythonGrunn } from "@/components/stack/forkurs/F05PythonGrunn";
import { F06FilerPython } from "@/components/stack/forkurs/F06FilerPython";
import { F07NettsideFlyt } from "@/components/stack/forkurs/F07NettsideFlyt";
import { F08IpPort } from "@/components/stack/forkurs/F08IpPort";
import { F09WiresharkPing } from "@/components/stack/forkurs/F09WiresharkPing";
import { F10BinaerHex } from "@/components/stack/forkurs/F10BinaerHex";
import { F11KryptoIntuisjon } from "@/components/stack/forkurs/F11KryptoIntuisjon";
import { getBit } from "@/components/stack/forkurs/bits";
import type { ComponentType } from "react";

const BIT_COMPONENTS: Record<string, ComponentType> = {
  "f01-virtualisering": F01Virtualisering,
  "f02-installer-vm": F02InstallerVm,
  "f03-snapshots": F03Snapshots,
  "f04-terminal": F04Terminal,
  "f05-python-grunn": F05PythonGrunn,
  "f06-filer-python": F06FilerPython,
  "f07-nettside-flyt": F07NettsideFlyt,
  "f08-ip-port": F08IpPort,
  "f09-wireshark-ping": F09WiresharkPing,
  "f10-binaer-hex": F10BinaerHex,
  "f11-krypto-intuisjon": F11KryptoIntuisjon,
};

export const Route = createFileRoute("/forkurs/$slug")({
  head: ({ params }) => {
    const bit = getBit(params.slug);
    return {
      meta: [
        { title: bit ? `${bit.bitId} ${bit.tittel} — Forkurs` : "Forkurs" },
        { name: "description", content: bit?.blurb ?? "Forkurs-bit" },
      ],
    };
  },
  component: ForkursBitPage,
});

function ForkursBitPage() {
  const { slug } = useParams({ from: "/forkurs/$slug" });
  const Component = BIT_COMPONENTS[slug];

  if (Component) {
    return <Component />;
  }

  return (
    <StackPageShell title="Forkurs" group="eksamen">
      <article className="container mx-auto px-4 py-10 max-w-2xl">
        <Link
          to="/forkurs"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3 w-3" /> Tilbake til forkurs-løypen
        </Link>
        <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Ukjent bit</h1>
          <p className="text-sm text-muted-foreground">
            Slug &quot;{slug}&quot; finnes ikke i forkurs-registeret.
          </p>
        </div>
      </article>
    </StackPageShell>
  );
}
