import { MvvmArkitekturPage } from "@/components/stack/mvvm-arkitektur/MvvmArkitekturPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-mvvm-arkitektur",
  slug: "mvvm-arkitektur",
  title: "MVVM-arkitektur — Model, View, ViewModel, Repository",
  group: "eksamen",
  order: 57,
  status: "ready",
  shortDescription:
    "Model-View-ViewModel, LiveData/StateFlow, observable patterns, hvorfor MVVM over MVC.",
  prerequisites: [],
  Component: MvvmArkitekturPage,
};
