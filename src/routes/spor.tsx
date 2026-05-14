import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/spor")({
  component: SporLayout,
});

function SporLayout() {
  return <Outlet />;
}
