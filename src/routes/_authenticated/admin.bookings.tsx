import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Phone, MessageCircle, Trash2, Search } from "lucide-react";
import { BRAND, waLink } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin/bookings")({
  component: BookingsPage,
});

const STATUSES = ["Pending", "Confirmed", "Cancelled"] as const;

function BookingsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ["admin_bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (p: { id: string; status: string }) => {
      const { error } = await supabase.from("bookings").update({ status: p.status }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_bookings"] }); toast.success("Status updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_bookings"] }); setDetail(null); toast.success("Deleted"); },
  });

  const filtered = (data ?? []).filter((b: any) => {
    if (filter !== "All" && b.status !== filter) return false;
    if (q && !`${b.customer_name} ${b.phone} ${b.event_address}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} of {data?.length ?? 0} bookings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="w-56 pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Event</th>
                <th className="p-3">Date</th>
                <th className="p-3">Guests</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b: any) => (
                <tr key={b.id} className="border-t hover:bg-secondary/30">
                  <td className="p-3">
                    <button onClick={() => setDetail(b)} className="font-medium hover:text-primary">{b.customer_name}</button>
                    <div className="text-xs text-muted-foreground">{b.phone}</div>
                  </td>
                  <td className="p-3">
                    <div>{b.event_type}</div>
                    <div className="text-xs text-muted-foreground">{b.veg_pref} • {b.with_servers ? "With servers" : "No servers"}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">{b.slot_date}<div className="text-xs text-muted-foreground">{b.slot_time}</div></td>
                  <td className="p-3">{b.guest_count}</td>
                  <td className="p-3">
                    <Select value={b.status} onValueChange={(v) => updateStatus.mutate({ id: b.id, status: v })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <a href={`tel:${b.phone}`} className="rounded-md border p-2 hover:bg-secondary" title="Call"><Phone className="h-4 w-4" /></a>
                      <a href={waLink(`Hi ${b.customer_name}, this is Pandu Catering regarding your booking on ${b.slot_date}.`)} target="_blank" rel="noopener" className="rounded-md border p-2 hover:bg-secondary" title="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
                      <button onClick={() => del.mutate(b.id)} className="rounded-md border p-2 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No bookings.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Booking details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <Row k="Customer" v={detail.customer_name} />
              <Row k="Phone" v={detail.phone} />
              <Row k="Email" v={detail.email || "—"} />
              <Row k="Event" v={detail.event_type} />
              <Row k="Menu" v={detail.veg_pref} />
              <Row k="Date" v={`${detail.slot_date} • ${detail.slot_time}`} />
              <Row k="Guests" v={detail.guest_count} />
              <Row k="Servers" v={detail.with_servers ? "Yes" : "No"} />
              <Row k="Address" v={detail.event_address} />
              <Row k="Notes" v={detail.notes || "—"} />
              <Row k="Status" v={<Badge>{detail.status}</Badge>} />
              <Row k="Submitted" v={new Date(detail.created_at).toLocaleString()} />
            </div>
          )}
          <DialogFooter className="!flex-row gap-2">
            <Button asChild variant="outline" className="flex-1"><a href={`tel:${detail?.phone}`}><Phone className="h-4 w-4" /> Call</a></Button>
            <Button asChild className="flex-1 bg-[#25D366] text-white hover:bg-[#25D366]/90"><a href={waLink(`Hi ${detail?.customer_name}!`)} target="_blank" rel="noopener"><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
