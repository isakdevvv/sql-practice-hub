import { LenkedeStrukturerPage } from "@/components/stack/lenkede-strukturer/LenkedeStrukturerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-lenkede-strukturer",
  slug: "lenkede-strukturer",
  title: "Lenket liste, stack, kø, prioritetskø",
  group: "eksamen",
  order: 14,
  status: "ready",
  shortDescription:
    "Single/double linked list, LIFO stack, FIFO queue, deque, heapq prioritetskø. Postfix-evaluator som klassisk stack-bruk.",
  prerequisites: [],
  Component: LenkedeStrukturerPage,
};
