import { RoomRecyclerPage } from "@/components/stack/room-recycler/RoomRecyclerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-room-recycler",
  slug: "room-recycler",
  title: "Room og RecyclerView — lokal DB og skalerbare lister",
  group: "eksamen",
  order: 59,
  status: "ready",
  shortDescription:
    "Room (Entity/DAO/Database) og RecyclerView (Adapter/ViewHolder/DiffUtil) — Android sin standard for data og lister.",
  prerequisites: [],
  Component: RoomRecyclerPage,
};
