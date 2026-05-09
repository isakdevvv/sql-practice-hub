import type { ComponentType } from "react";

export type TrinnGroup = "eksamen" | "stack";
export type TrinnStatus = "ready" | "stub";

export interface Prerequisite {
  slug: string;
  title: string;
}

export interface TrinnContent {
  id: string;            // unique, e.g. "eksamen-bytes-encoding"
  slug: string;          // URL slug, e.g. "bytes-encoding"
  title: string;         // Norwegian title shown on cards/pages
  group: TrinnGroup;
  order: number;         // display order within group
  status: TrinnStatus;
  shortDescription: string;
  prerequisites: Prerequisite[];
  Component: ComponentType;
}
