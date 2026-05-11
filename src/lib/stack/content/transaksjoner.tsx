import { TransaksjonerPage } from "@/components/stack/transaksjoner/TransaksjonerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-transaksjoner",
  slug: "transaksjoner",
  title: "Transaksjoner — ACID, isolation og deadlocks",
  group: "stack",
  order: 130,
  status: "ready",
  shortDescription:
    "ACID-egenskapene, BEGIN/COMMIT/ROLLBACK, fire isolation levels, dirty/non-repeatable/phantom reads, optimistisk vs pessimistisk låsing, savepoints og deadlocks.",
  prerequisites: [
    { slug: "nokler", title: "Primær- og fremmednøkler" },
  ],
  Component: TransaksjonerPage,
};
