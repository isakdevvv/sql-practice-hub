/**
 * Datamodell for ML Pipeline Builder. Hvert valg kontribuerer kode-fragmenter
 * som blir slått sammen til ett ferdig sklearn-script av `assemble()`.
 */

export type CategoryId =
  | "dataset"
  | "preprocessor"
  | "model"
  | "split"
  | "cv"
  | "tuning"
  | "eval"
  | "output";

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
  /** Hvis true: nøyaktig én option i kategorien skal være aktiv. */
  radio?: boolean;
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "dataset",
    label: "Datasett",
    description: "Velg ÉTT datasett som lastes inn.",
    radio: true,
  },
  {
    id: "preprocessor",
    label: "Preprocessor",
    description: "Skalering, encoding, imputering, ColumnTransformer.",
  },
  {
    id: "model",
    label: "Modell",
    description: "Velg ÉN klassifikator.",
    radio: true,
  },
  {
    id: "split",
    label: "Train/test-split",
    description: "Stratify ja/nei og test_size.",
  },
  {
    id: "cv",
    label: "Kryssvalidering",
    description: "StratifiedKFold, TimeSeriesSplit eller GroupKFold.",
  },
  {
    id: "tuning",
    label: "Hyperparameter-tuning",
    description: "GridSearchCV eller RandomizedSearchCV (med grid per modell).",
  },
  {
    id: "eval",
    label: "Evaluering",
    description: "accuracy, classification_report, confusion_matrix, ROC-AUC, cross_val_score.",
  },
  {
    id: "output",
    label: "Output-format",
    description: "Print, pandas-DataFrame eller matplotlib-plots.",
  },
];

/** Kode-fragmenter en option kan kontribuere til det endelige scriptet. */
export interface CodeContribution {
  /** import-statements (dedupliseres). */
  imports?: string[];
  /** Dataset-loading-blokk (settes etter imports). Brukes kun av dataset-options. */
  dataset?: string;
  /** Hvilke kolonne-typer datasettet har — styrer ColumnTransformer. */
  datasetInfo?: {
    /** Navn på pandas-DataFrame-variabelen, om aktuelt (default: "X"). */
    isPandas?: boolean;
    /** Numeriske kolonner. */
    numericCols?: string[];
    /** Kategoriske kolonner. */
    categoricalCols?: string[];
    /** Antall klasser (2 => binær). */
    binary?: boolean;
  };
  /** Preprocessor-trinn: navn → sklearn-uttrykk (legges i Pipeline-steg). */
  preprocSteps?: { name: string; expr: string }[];
  /** Modell-uttrykk (én pr. option), brukt i Pipeline-siste-steg. */
  modelExpr?: string;
  /** Param-grid for GridSearchCV / RandomizedSearchCV. */
  paramGrid?: string;
  /** Split-blokk (overstyrer default train_test_split). */
  splitBlock?: string;
  /** CV-objekt-deklarasjon (cv = ...). */
  cvBlock?: string;
  /** Tuning-blokk (wrapper rundt pipe). */
  tuningBlock?: string;
  /** Evaluerings-fragmenter (kjøres etter fit). */
  evalBlocks?: string[];
  /** Output-format-helper (f.eks. DataFrame av resultater eller plt.show). */
  outputBlocks?: string[];
}

export interface AppOption {
  id: string;
  category: CategoryId;
  label: string;
  /** Kort forklaring vist under label. */
  description: string;
  /** Forutsetter andre options (de aktiveres automatisk). */
  requires?: string[];
  /** Kan ikke kombineres med disse options. */
  conflicts?: string[];
  /** På som standard ved første lasting. */
  defaultOn?: boolean;
  /** Hvilken kategori option-en hører til ved radio-valg. */
  contributes: CodeContribution;
}
