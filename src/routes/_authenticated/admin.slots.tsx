import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/slots")({
  component: SlotsPage,
});

function SlotsPage() {
  const qc = useQueryClient();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("Lunch");
  const [bulkDays, setBulkDays] = useState(14);

  const { data } = useQuery({
    queryKey: ["admin_slots"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("booking_slots").select("*").gte("slot_date", today).order("slot_date").order("slot_time");
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!date || !time) throw new Error("Pick date and time");
      const { error } = await supabase.from("booking_slots").insert({ slot_date: date, slot_time: time, available: true });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_slots"] }); toast.success("Slot added"); setDate(""); },
    onError: (e: any) => toast.error(e.message),
  });

  const bulk = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const rows: any[] = [];
      for (let i = 0; i < bulkDays; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i);
        const ds = d.toISOString().slice(0, 10);
        rows.push({ slot_date: ds, slot_time: "Lunch", available: true });
        rows.push({ slot_date: ds, slot_time: "Dinner", available: true });
      }
      const { error } = await supabase.from("booking_slots").upsert(rows, { onConflict: "slot_date,slot_time", ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_slots"] }); toast.success("Bulk slots added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (p: { id: string; available: boolean }) => {
      const { error } = await supabase.from("booking_slots").update({ available: p.available }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_slots"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("booking_slots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_slots"] }); toast.success("Removed"); },
  });

  // group by date
  const grouped: Record<string, any[]> = {};
  for (const s of data ?? []) { (grouped[s.slot_date] = grouped[s.slot_date] || []).push(s); }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Booking Slots</h1>
      <p className="mt-1 text-sm text-muted-foreground">Add available date-time slots customers can pick during booking.</p>

      <Card className="mt-6">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto_auto]">
          <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="space-y-2"><Label>Time slot</Label><Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. Lunch, Dinner, 19:00" /></div>
          <div className="flex items-end"><Button onClick={() => add.mutate()}><Plus className="h-4 w-4" /> Add slot</Button></div>
          <div className="flex items-end gap-2">
            <Input type="number" min={1} max={60} value={bulkDays} onChange={(e) => setBulkDays(Number(e.target.value))} className="w-24" />
            <Button variant="outline" onClick={() => bulk.mutate()}><CalendarPlus className="h-4 w-4" /> Bulk add days</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {Object.entries(grouped).map(([d, list]) => (
          <Card key={d}>
            <CardContent className="p-5">
              <h3 className="font-display text-lg font-semibold">
                {new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s: any) => (
                  <div key={s.id} className={`flex items-center justify-between rounded-lg border p-3 ${!s.available ? "bg-muted/40" : ""}`}>
                    <div className="font-medium">{s.slot_time}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs"><Switch checked={s.available} onCheckedChange={(v) => toggle.mutate({ id: s.id, available: v })} /><span>{s.available ? "Open" : "Closed"}</span></div>
                      <button onClick={() => del.mutate(s.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!data || data.length === 0) && <Card><CardContent className="p-10 text-center text-muted-foreground">No slots configured. Use "Bulk add days" to seed the next two weeks.</CardContent></Card>}
      </div>
    </div>
  );
}
