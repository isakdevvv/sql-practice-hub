import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/karriere/debug-jakt")({
  component: DebugJaktLayout,
});

function DebugJaktLayout() {
  return <Outlet />;
}
