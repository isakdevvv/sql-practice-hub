import { lazy } from "react";
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
  Component: lazy(() => import("@/components/stack/korutiner/KorutinerPage").then((m) => ({ default: m.KorutinerPage }))),
};
