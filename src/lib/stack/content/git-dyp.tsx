import { lazy } from "react";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-git-dyp",
  slug: "git-dyp",
  title: "Git-dyp — internals, rebase, bisect, reflog",
  group: "stack",
  order: 115,
  status: "ready",
  shortDescription:
    "Git-objekter, rebase vs merge, interactive rebase, cherry-pick, bisect, reflog og vanlige feller.",
  prerequisites: [],
  Component: lazy(() => import("@/components/stack/git-dyp/GitDypPage").then((m) => ({ default: m.GitDypPage }))),
};
