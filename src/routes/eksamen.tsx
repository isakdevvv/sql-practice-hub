import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/eksamen")({
  component: EksamenLayout,
});

function EksamenLayout() {
  return <Outlet />;
}
