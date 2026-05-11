import { ApiTestingPage } from "@/components/stack/api-testing/ApiTestingPage";
import type { TrinnContent } from "../types";

export const content: TrinnContent = {
  id: "eksamen-api-testing",
  slug: "api-testing",
  title: "API-testing — pyramide og praksis",
  group: "eksamen",
  order: 52,
  status: "ready",
  shortDescription:
    "Test-pyramiden. Unit, integration, contract, E2E. Fixtures, mocks, fakes. Snapshot- og property-tester.",
  prerequisites: [],
  Component: ApiTestingPage,
};
