import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import { AlertTriangle } from "lucide-react";

type StageInfo = {
  id: string;
  title: string;
  blurb: string;
  link?: { slug: string; label: string };
  details: string;
};

const STAGES: StageInfo[] = [
  {
    id: "rawdata",
    title: "Rådata",
    blurb: "Last inn CSV, parquet, fra DB. Kjenn skjemaet.",
    link: { slug: "dte2602-eda-pandas", label: "EDA i pandas" },
    details:
      "df = pd.read_csv(...). Sjekk df.info(), df.head(), antall rader. Avgjørende: hva er målvariabelen y, og hva er X?",
  },
  {
    id: "eda",
    title: "EDA",
    blurb: "Forstå distribusjoner, korrelasjoner, NaN, outliers.",
    link: { slug: "dte2602-eda-pandas", label: "EDA i pandas" },
    details:
      "df.describe(), histogrammer, korrelasjonsmatrise, pairplot. Finn skjeve fordelinger som krever log-transform, og kategoriske kolonner som må encodes.",
  },
  {
    id: "split",
    title: "Train/Test split",
    blurb: "Del FØRST. Ellers lekker du info.",
    link: { slug: "dte2602-evaluering-metoder", label: "Evaluering" },
    details:
      "train_test_split(X, y, test_size=0.2, stratify=y, random_state=42). MÅ skje før preprocessing — ellers ser test-settet train-statistikk.",
  },
  {
    id: "preprocess",
    title: "Preprocessing",
    blurb: "Scaler, encoder, ColumnTransformer.",
    link: { slug: "dte2602-preprocessing-pipeline", label: "Pipeline" },
    details:
      "StandardScaler for numeriske, OneHotEncoder for kategoriske. Fit BARE på train; transform begge. Bruk Pipeline + ColumnTransformer for å unngå manuelle feil.",
  },
  {
    id: "fit",
    title: "Fit (tren)",
    blurb: "model.fit(X_train, y_train).",
    link: { slug: "supervised-learning", label: "Supervised learning" },
    details:
      "Velg algoritme (LogReg, Tree, RF, kNN, ...). Pipeline husker scaler-state. Cross-validation: cross_val_score(pipe, X_train, y_train, cv=5).",
  },
  {
    id: "predict",
    title: "Predict",
    blurb: "y_pred = model.predict(X_test).",
    details:
      "Lag prediksjoner på test-settet. For sannsynligheter: model.predict_proba(X_test)[:, 1] (for binær klassifikasjon).",
  },
  {
    id: "evaluate",
    title: "Evaluate",
    blurb: "Confusion matrix, F1, ROC-AUC.",
    link: { slug: "dte2602-evaluation-roc", label: "ROC og F1" },
    details:
      "Klassifikasjon: accuracy, precision, recall, F1, ROC-AUC, confusion matrix. Regresjon: RMSE, MAE, R². Sammenlign mot baseline.",
  },
];

type StageNodeData = {
  title: string;
  selected: boolean;
  warn?: boolean;
};

function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
  return (
    <div
      className={`rounded-lg border px-4 py-2.5 shadow-sm transition-colors ${
        data.selected
          ? "border-brand bg-brand/10"
          : "border-border bg-card hover:border-brand/40"
      } ${data.warn ? "ring-2 ring-destructive/40" : ""}`}
      style={{ width: 160 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-brand" />
      <div className="text-sm font-semibold text-foreground leading-tight">
        {data.title}
      </div>
      {data.warn ? (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-destructive">
          <AlertTriangle className="h-3 w-3" />
          <span>Lekkasje-fare</span>
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = { stage: StageNode };

export function MlPipelineFlow() {
  const [selectedId, setSelectedId] = useState<string>("split");
  const [showLeakage, setShowLeakage] = useState<boolean>(false);

  const nodes = useMemo<Node<StageNodeData>[]>(() => {
    return STAGES.map((s, i) => ({
      id: s.id,
      type: "stage",
      position: { x: i * 200, y: 60 },
      data: {
        title: s.title,
        selected: s.id === selectedId,
        warn: showLeakage && s.id === "preprocess",
      },
    }));
  }, [selectedId, showLeakage]);

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];
    for (let i = 0; i < STAGES.length - 1; i++) {
      const from = STAGES[i].id;
      const to = STAGES[i + 1].id;
      result.push({
        id: `${from}-${to}`,
        source: from,
        target: to,
        animated: true,
        style: { stroke: "var(--color-brand, #f97316)", strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--color-brand, #f97316)",
        },
      });
    }
    // Lekkasje-pil: preprocess → split (feil rekkefølge)
    if (showLeakage) {
      result.push({
        id: "leak",
        source: "preprocess",
        target: "split",
        animated: true,
        label: "datalekkasje!",
        labelStyle: { fontSize: 11, fill: "#dc2626", fontWeight: 600 },
        style: { stroke: "#dc2626", strokeWidth: 2, strokeDasharray: "5 3" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#dc2626" },
      });
    }
    return result;
  }, [showLeakage]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedId(node.id);
  }, []);

  const selected = STAGES.find((s) => s.id === selectedId) ?? STAGES[0];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          ML-pipeline (interaktiv)
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showLeakage}
            onChange={(e) => setShowLeakage(e.target.checked)}
            className="accent-destructive"
          />
          Vis datalekkasje-feil
        </label>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="h-[360px] bg-background" style={{ touchAction: "none" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            zoomOnScroll
            panOnDrag
          >
            <Background gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              maskColor="rgba(0,0,0,0.1)"
              style={{ background: "var(--color-card)" }}
            />
          </ReactFlow>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-border bg-background p-4 text-sm">
          <h3 className="text-base font-semibold leading-tight">
            {selected.title}
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {selected.blurb}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-foreground">
            {selected.details}
          </p>
          {selected.link ? (
            <a
              href={`/stack/${selected.link.slug}`}
              className="mt-3 inline-flex text-xs text-brand hover:underline"
            >
              → {selected.link.label}
            </a>
          ) : null}
          <p className="mt-4 text-[11px] text-muted-foreground">
            Klikk på et steg. Slå på lekkasje-toggle for å se hva som går galt
            hvis du scaler før split.
          </p>
        </aside>
      </div>
    </div>
  );
}
