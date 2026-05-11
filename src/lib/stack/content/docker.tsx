import { DockerPage } from "@/components/stack/docker/DockerPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "stack-docker",
  slug: "docker",
  title: "Docker — containers, Dockerfile, compose",
  group: "stack",
  order: 116,
  status: "ready",
  shortDescription:
    "Containers vs VMs, Dockerfile-direktiver, layer-cache, multi-stage, compose, networks og volumes.",
  prerequisites: [],
  Component: DockerPage,
};
