import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/stack")({
  component: StackLayout,
});

function StackLayout() {
  return <Outlet />;
}
