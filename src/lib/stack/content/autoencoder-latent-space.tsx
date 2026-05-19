import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-autoencoder-latent-space",
  slug: "autoencoder-latent-space",
  title: "Autoencoder — latent-rommet",
  group: "stack",
  order: 871,
  status: "ready",
  shortDescription: "Goodfellow kap. 14. Lineær autoencoder (= PCA) på 8×8-bilder. Dra k-sliderern for å se rekonstruksjons-kvalitet vs kompresjons-grad.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/autoencoder-latent-space/AutoencoderLatentSpacePage").then((m) => ({ default: m.AutoencoderLatentSpacePage }))),
};
