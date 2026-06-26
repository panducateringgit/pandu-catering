import { createFileRoute, redirect } from "@tanstack/react-router";

// /admin/login is an alias for the existing /auth admin sign-in page.
export const Route = createFileRoute("/admin/login")({
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});
