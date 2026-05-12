import { NlpPage } from "@/components/stack/dte2501-ml/NlpPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-dte2501-nlp",
  slug: "dte2501-nlp-intro",
  title: "Natural Language Processing",
  group: "eksamen",
  order: 44,
  status: "ready",
  shortDescription:
    "Tokenisering, BoW, TF-IDF. Word2Vec og GloVe-embeddings. Tekst-klassifikasjon.",
  prerequisites: [],
  Component: NlpPage,
};
