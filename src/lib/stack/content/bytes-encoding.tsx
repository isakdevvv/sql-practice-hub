import { BytesEncodingPage } from "@/components/stack/bytes-encoding/BytesEncodingPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-bytes-encoding",
  slug: "bytes-encoding",
  title: "Bytes & encoding",
  group: "eksamen",
  order: 1,
  status: "ready",
  shortDescription:
    "En byte er bare et tall 0–255. Hvordan blir tegn til bytes? UTF-8, ASCII, hex.",
  prerequisites: [],
  Component: BytesEncodingPage,
};
