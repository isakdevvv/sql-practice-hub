import { useState } from "react";
import { ChevronRight, ChevronDown, FileText, FolderTree, GitCommit, Hash, type LucideIcon } from "lucide-react";

// --------------------------------------------------------------------------
// Object-model-explorer.
// Lite eksempel-repo med én commit. Studenten klikker for å «se inn i» hvert
// objekt: commit → tree → (tree | blob). Hver visning matcher det du faktisk
// ser med `git cat-file -p <sha>`.
// --------------------------------------------------------------------------

type ObjKind = "commit" | "tree" | "blob";
type GitObj =
  | { kind: "commit"; sha: string; tree: string; parent: string | null; author: string; message: string }
  | { kind: "tree"; sha: string; entries: { mode: string; type: ObjKind; sha: string; name: string }[] }
  | { kind: "blob"; sha: string; content: string };

// Liten verden — én commit med rot-tree, src/-tree og 3 blobs.
const OBJECTS: Record<string, GitObj> = {
  "9a7f3c1": {
    kind: "commit",
    sha: "9a7f3c1",
    tree: "4b8d2e0",
    parent: "ab12cdf",
    author: "Isak <i@x> 1710000000 +0100",
    message: "feat: la til parser",
  },
  "4b8d2e0": {
    kind: "tree",
    sha: "4b8d2e0",
    entries: [
      { mode: "100644", type: "blob", sha: "a1b2c3d", name: "README.md" },
      { mode: "100644", type: "blob", sha: "e4f5a6b", name: "package.json" },
      { mode: "040000", type: "tree", sha: "c7d8e9f", name: "src" },
    ],
  },
  c7d8e9f: {
    kind: "tree",
    sha: "c7d8e9f",
    entries: [
      { mode: "100644", type: "blob", sha: "12a34b5", name: "parser.ts" },
      { mode: "100644", type: "blob", sha: "67c89d0", name: "index.ts" },
    ],
  },
  a1b2c3d: {
    kind: "blob",
    sha: "a1b2c3d",
    content: `# git-dyp-demo

Eksempel-repo for å vise hvordan Git lagrer ting.
`,
  },
  e4f5a6b: {
    kind: "blob",
    sha: "e4f5a6b",
    content: `{
  "name": "git-dyp-demo",
  "version": "0.0.1"
}
`,
  },
  "12a34b5": {
    kind: "blob",
    sha: "12a34b5",
    content: `export function parse(input: string) {
  return input.trim().split(/\\s+/);
}
`,
  },
  "67c89d0": {
    kind: "blob",
    sha: "67c89d0",
    content: `import { parse } from "./parser";
console.log(parse("hello world"));
`,
  },
};

const KIND_COLOR: Record<ObjKind, string> = {
  commit: "rgb(168,85,247)", // lilla
  tree: "rgb(56,189,248)", // blå
  blob: "rgb(34,197,94)", // grønn
};

const KIND_ICON: Record<ObjKind, LucideIcon> = {
  commit: GitCommit,
  tree: FolderTree,
  blob: FileText,
};

function ObjectCard({
  sha,
  expanded,
  onToggle,
  onOpen,
}: {
  sha: string;
  expanded: boolean;
  onToggle: () => void;
  onOpen: (sha: string) => void;
}) {
  const obj = OBJECTS[sha];
  if (!obj) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground italic font-mono">
        {sha} (utenfor demo-repoet)
      </div>
    );
  }
  const Color = KIND_COLOR[obj.kind];
  const Icon = KIND_ICON[obj.kind];

  return (
    <div
      className="rounded-md border bg-background/40"
      style={{ borderColor: `${Color}66` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30"
      >
        {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <Icon className="h-4 w-4" style={{ color: Color }} />
        <span className="text-xs font-semibold" style={{ color: Color }}>
          {obj.kind}
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">{obj.sha}</span>
        <code className="ml-auto text-[10px] text-muted-foreground">git cat-file -p {obj.sha}</code>
      </button>

      {expanded && (
        <div className="border-t px-3 py-2" style={{ borderColor: `${Color}33` }}>
          {obj.kind === "commit" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap">
              <span className="text-muted-foreground">tree   </span>
              <button
                onClick={() => onOpen(obj.tree)}
                className="underline decoration-dotted hover:text-brand"
                style={{ color: KIND_COLOR.tree }}
              >
                {obj.tree}
              </button>
              {"\n"}
              {obj.parent && (
                <>
                  <span className="text-muted-foreground">parent </span>
                  <span className="text-muted-foreground">{obj.parent}</span>
                  {"\n"}
                </>
              )}
              <span className="text-muted-foreground">author </span>
              <span>{obj.author}</span>
              {"\n\n"}
              <span>{obj.message}</span>
            </pre>
          )}
          {obj.kind === "tree" && (
            <pre className="font-mono text-[11px] leading-snug">
              {obj.entries.map((e) => (
                <div key={e.sha}>
                  <span className="text-muted-foreground">{e.mode}</span>{" "}
                  <span style={{ color: KIND_COLOR[e.type] }}>{e.type.padEnd(5)}</span>{" "}
                  <button
                    onClick={() => onOpen(e.sha)}
                    className="underline decoration-dotted hover:text-brand"
                    style={{ color: KIND_COLOR[e.type] }}
                  >
                    {e.sha}
                  </button>{" "}
                  <span>{e.name}</span>
                </div>
              ))}
            </pre>
          )}
          {obj.kind === "blob" && (
            <pre className="font-mono text-[11px] leading-snug whitespace-pre-wrap text-foreground/85">
              {obj.content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function ObjectModelExplorer() {
  // Hvilke sha-er har studenten åpnet? Vi rendrer en stabel.
  const [opened, setOpened] = useState<string[]>(["9a7f3c1"]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "9a7f3c1": true });

  const open = (sha: string) => {
    setExpanded((m) => ({ ...m, [sha]: true }));
    setOpened((arr) => (arr.includes(sha) ? arr : [...arr, sha]));
  };

  const reset = () => {
    setOpened(["9a7f3c1"]);
    setExpanded({ "9a7f3c1": true });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-brand font-semibold mb-1">
        Git-objekt-utforsker
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Ett lite repo, én commit. Klikk på en sha for å åpne det objektet. Du ser hva{" "}
        <code className="font-mono">git cat-file -p &lt;sha&gt;</code> ville printet.
      </p>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px]">
        <span className="inline-flex items-center gap-1">
          <Hash className="h-3 w-3" />
          <span className="font-mono">sha</span>
        </span>
        {(["commit", "tree", "blob"] as const).map((k) => {
          const Icon = KIND_ICON[k];
          return (
            <span key={k} className="inline-flex items-center gap-1">
              <Icon className="h-3 w-3" style={{ color: KIND_COLOR[k] }} />
              <span style={{ color: KIND_COLOR[k] }}>{k}</span>
            </span>
          );
        })}
        <button
          onClick={reset}
          className="ml-auto text-muted-foreground hover:text-foreground underline decoration-dotted"
        >
          Nullstill
        </button>
      </div>

      <div className="space-y-2">
        {opened.map((sha) => (
          <ObjectCard
            key={sha}
            sha={sha}
            expanded={expanded[sha] ?? false}
            onToggle={() => setExpanded((m) => ({ ...m, [sha]: !m[sha] }))}
            onOpen={open}
          />
        ))}
      </div>

      <div className="mt-3 rounded-md border border-border bg-background/40 p-3 text-xs">
        <div className="font-semibold mb-1">Hvorfor det er greit å vite</div>
        <p className="leading-relaxed text-muted-foreground">
          En commit er et snapshot — ikke et diff. Den lagrer en peker til et <em>tree</em> (rot-katalogen
          slik den så ut da), som peker til <em>blobs</em> (filinnhold) og andre trees (under-kataloger). Når
          to commits deler en uendret fil, peker begge på <strong>samme</strong> blob-sha — derfor er Git så
          plassgjerrig. Diff-ene du ser i <code className="font-mono">git log -p</code> er beregnet på flua
          ved å sammenligne treet i to commits.
        </p>
      </div>
    </div>
  );
}
