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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MENU_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: MenuAdminPage,
});

const empty = { id: "", name: "", description: "", category: "South Indian", is_veg: true, price: 0, image_url: "", active: true, sort_order: 0 };

function MenuAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ["admin_menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("category").order("sort_order");
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (item: any) => {
      const payload = { ...item, price: Number(item.price), sort_order: Number(item.sort_order) };
      if (item.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("menu_items").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id: _ignore, ...rest } = payload;
        const { error } = await supabase.from("menu_items").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_menu"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_menu"] }); toast.success("Deleted"); },
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.length ?? 0} items</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4" /> Add item</Button>
      </div>

      <Card className="mt-6">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((m: any) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3"><div className="font-medium">{m.name}</div><div className="line-clamp-1 text-xs text-muted-foreground">{m.description}</div></td>
                  <td className="p-3">{m.category}</td>
                  <td className="p-3"><Badge className={m.is_veg ? "bg-leaf text-white" : "bg-spice text-white"}>{m.is_veg ? "VEG" : "NON-VEG"}</Badge></td>
                  <td className="p-3 text-right font-medium">₹{Number(m.price).toFixed(0)}</td>
                  <td className="p-3"><Badge variant={m.active ? "secondary" : "outline"}>{m.active ? "Yes" : "No"}</Badge></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing({ ...m })} className="rounded-md border p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => confirm("Delete this item?") && del.mutate(m.id)} className="rounded-md border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit menu item" : "Add menu item"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required /></div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MENU_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" min={0} step={1} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="flex items-end gap-6"><label className="flex items-center gap-2"><Switch checked={editing.is_veg} onCheckedChange={(v) => setEditing({ ...editing, is_veg: v })} /> Veg</label><label className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label></div>
              </div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." /></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={save.isPending}>Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
