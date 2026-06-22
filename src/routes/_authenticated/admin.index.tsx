import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CalendarDays, UtensilsCrossed, Images, Settings, Sparkles, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const [bk, pending, menu, slots] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("menu_items").select("id", { count: "exact", head: true }),
        supabase.from("booking_slots").select("id", { count: "exact", head: true }).eq("available", true),
      ]);
      return {
        total: bk.count ?? 0,
        pending: pending.count ?? 0,
        menu: menu.count ?? 0,
        slots: slots.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin_recent"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const tiles = [
    { label: "Total bookings", value: stats?.total ?? 0, icon: ClipboardList, to: "/_authenticated/admin/bookings" },
    { label: "Pending requests", value: stats?.pending ?? 0, icon: ClipboardList, to: "/_authenticated/admin/bookings", accent: true },
    { label: "Available slots", value: stats?.slots ?? 0, icon: CalendarDays, to: "/_authenticated/admin/slots" },
    { label: "Menu items", value: stats?.menu ?? 0, icon: UtensilsCrossed, to: "/_authenticated/admin/menu" },
  ];
  const quick = [
    { to: "/_authenticated/admin/bookings", icon: ClipboardList, label: "Bookings" },
    { to: "/_authenticated/admin/slots", icon: CalendarDays, label: "Slots" },
    { to: "/_authenticated/admin/menu", icon: UtensilsCrossed, label: "Menu" },
    { to: "/_authenticated/admin/events", icon: Sparkles, label: "Event Types" },
    { to: "/_authenticated/admin/gallery", icon: Images, label: "Gallery" },
    { to: "/_authenticated/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quick overview of your catering business.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to as any}>
            <Card className={`transition hover:-translate-y-0.5 hover:shadow-warm ${t.accent ? "border-primary/40" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t.label}</span>
                  <t.icon className={`h-5 w-5 ${t.accent ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className={`mt-3 font-display text-3xl font-bold ${t.accent ? "text-primary" : ""}`}>{t.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="font-display text-xl font-semibold">Recent bookings</h2>
            <div className="mt-4 divide-y">
              {(recent ?? []).length === 0 && <p className="py-6 text-sm text-muted-foreground">No bookings yet.</p>}
              {(recent ?? []).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{b.customer_name} <span className="text-xs text-muted-foreground">• {b.phone}</span></div>
                    <div className="text-xs text-muted-foreground">{b.event_type} • {b.slot_date} {b.slot_time} • {b.guest_count} guests</div>
                  </div>
                  <Badge variant={b.status === "Pending" ? "default" : b.status === "Confirmed" ? "secondary" : "destructive"}>{b.status}</Badge>
                </div>
              ))}
            </div>
            <Link to="/_authenticated/admin/bookings" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">View all bookings →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-display text-xl font-semibold">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {quick.map((q) => (
                <Link key={q.label} to={q.to as any} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center text-sm transition hover:border-primary hover:bg-secondary">
                  <q.icon className="h-5 w-5 text-primary" />
                  {q.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
