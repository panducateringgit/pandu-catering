import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: EventsAdminPage,
});

const empty = { id: "", name: "", description: "", image_url: "", sort_order: 0, active: true };

function EventsAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ["admin_events"],
    queryFn: async () => (await supabase.from("event_types").select("*").order("sort_order")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (item: any) => {
      const payload = { ...item, sort_order: Number(item.sort_order) };
      if (item.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("event_types").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("event_types").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_events"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("event_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_events"] }); toast.success("Deleted"); },
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Event Types</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cards shown on the homepage.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((e: any) => (
          <Card key={e.id} className="overflow-hidden">
            {e.image_url && <img src={e.image_url} alt="" className="h-40 w-full object-cover" />}
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{e.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...e })} className="rounded-md border p-1.5 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => confirm("Delete?") && del.mutate(e.id)} className="rounded-md border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{e.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">Order: {e.sort_order} • {e.active ? "Active" : "Hidden"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit event type" : "Add event type"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-4" onSubmit={(ev) => { ev.preventDefault(); save.mutate(editing); }}>
              <div className="space-y-2"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="flex items-end"><label className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label></div>
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
