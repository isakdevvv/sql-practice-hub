import { File, Folder, Lock } from "lucide-react";

interface Props {
  files: Record<string, string>;
  activeFile: string;
  editableFiles: string[];
  onSelect: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  isFile: boolean;
}

function buildTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [], isFile: false };
  for (const path of paths.sort()) {
    const parts = path.split("/");
    let cur = root;
    let curPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      curPath = curPath ? `${curPath}/${part}` : part;
      const isLeaf = i === parts.length - 1;
      let child = cur.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path: curPath, children: [], isFile: isLeaf };
        cur.children.push(child);
      }
      cur = child;
    }
  }
  // Sort: folders first, then files alphabetically
  function sortRec(node: TreeNode) {
    node.children.sort((a, b) => {
      if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortRec);
  }
  sortRec(root);
  return root;
}

export function FileTree({ files, activeFile, editableFiles, onSelect }: Props) {
  const tree = buildTree(Object.keys(files));
  return (
    <div className="text-sm py-2">
      {tree.children.map((node) => (
        <TreeNodeView
          key={node.path}
          node={node}
          activeFile={activeFile}
          editableFiles={editableFiles}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
}

function TreeNodeView({
  node,
  activeFile,
  editableFiles,
  onSelect,
  depth,
}: {
  node: TreeNode;
  activeFile: string;
  editableFiles: string[];
  onSelect: (path: string) => void;
  depth: number;
}) {
  const isActive = node.path === activeFile;
  const isEditable = editableFiles.includes(node.path);

  if (node.isFile) {
    return (
      <button
        onClick={() => onSelect(node.path)}
        className={`w-full flex items-center gap-1.5 text-left px-2 py-1 hover:bg-accent rounded transition-colors ${
          isActive ? "bg-accent text-foreground" : "text-muted-foreground"
        }`}
        style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
      >
        <File className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate flex-1 font-mono text-xs">{node.name}</span>
        {!isEditable && <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />}
      </button>
    );
  }
  // folder
  return (
    <div>
      <div
        className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground/70 font-medium text-xs"
        style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
      >
        <Folder className="h-3.5 w-3.5" />
        <span className="truncate">{node.name}/</span>
      </div>
      {node.children.map((child) => (
        <TreeNodeView
          key={child.path}
          node={child}
          activeFile={activeFile}
          editableFiles={editableFiles}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
