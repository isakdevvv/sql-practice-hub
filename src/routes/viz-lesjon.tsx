import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/viz-lesjon")({
  component: () => <Outlet />,
});
