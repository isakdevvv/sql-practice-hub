import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/mini-kurs")({
  component: () => <Outlet />,
});
