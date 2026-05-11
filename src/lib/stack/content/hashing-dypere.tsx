import { HashingDyperePage } from "@/components/stack/hashing-dypere/HashingDyperePage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-hashing-dypere",
  slug: "hashing-dypere",
  title: "Hashing",
  group: "eksamen",
  order: 18,
  status: "ready",
  shortDescription:
    "Hash-funksjon-krav, separate chaining vs open addressing, lastfaktor, kryptografisk vs ikke, bloom filter.",
  prerequisites: [],
  Component: HashingDyperePage,
};
