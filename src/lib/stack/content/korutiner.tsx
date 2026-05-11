import { KorutinerPage } from "@/components/stack/korutiner/KorutinerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-korutiner",
  slug: "korutiner",
  title: "Korutiner — flertråd og asynkroni i Kotlin",
  group: "eksamen",
  order: 58,
  status: "ready",
  shortDescription:
    "suspend, launch/async, viewModelScope/lifecycleScope, Dispatchers (Main/IO/Default), structured concurrency.",
  prerequisites: [],
  Component: KorutinerPage,
};
