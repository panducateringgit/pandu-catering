import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, CalendarDays, ClipboardList, UtensilsCrossed, Images,
  Settings, Sparkles, LogOut, ChefHat, ExternalLink,
} from "lucide-react";

const NAV = [
  { to: "/_authenticated/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/_authenticated/admin/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/_authenticated/admin/slots", label: "Slots", icon: CalendarDays },
  { to: "/_authenticated/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/_authenticated/admin/events", label: "Event Types", icon: Sparkles },
  { to: "/_authenticated/admin/gallery", label: "Gallery", icon: Images },
  { to: "/_authenticated/admin/settings", label: "Site Settings", icon: Settings },
];

export function AdminShell() {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-bold">Not an admin</h1>
          <p className="mt-2 text-muted-foreground">Your account doesn't have admin access. If you set up this site, sign up first to claim admin.</p>
          <Button onClick={signOut} className="mt-4">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="border-r bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen">
        <div className="flex items-center justify-between border-b border-sidebar-border p-5">
          <Link to="/_authenticated/admin" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-turmeric text-turmeric-foreground"><ChefHat className="h-5 w-5" /></div>
            <div className="leading-tight">
              <div className="font-display font-bold">Pandu Admin</div>
              <div className="text-xs text-sidebar-foreground/70">Catering CMS</div>
            </div>
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((n) => {
            const isActive = n.exact ? pathname === "/_authenticated/admin" || pathname === "/admin" : pathname.includes(n.to.replace("/_authenticated", ""));
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60"}`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-1 border-t border-sidebar-border p-3">
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/60"><ExternalLink className="h-4 w-4" /> View site</Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent/60"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <main className="bg-secondary/30">
        <div className="mx-auto max-w-7xl p-5 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
