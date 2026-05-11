import { Trinn7BytesDypPage } from "@/components/stack/trinn-7-bytes-dyp/Trinn7BytesDypPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-7-bytes-dyp",
  slug: "trinn-7-bytes-dyp",
  title: "7. Bytes & str — dypere",
  group: "stack",
  order: 7,
  status: "ready",
  shortDescription: "Endianness, multi-byte encodings, og hvordan bytes blir til tall.",
  prerequisites: [],
  Component: Trinn7BytesDypPage,
};
