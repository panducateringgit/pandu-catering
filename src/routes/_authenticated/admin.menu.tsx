import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/menu")({
  component: MenuAdminPage,
});

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const empty = { id: "", name: "", description: "", category: "Morning Tiffins", is_veg: true, price: 0, image_url: "", active: true, sort_order: 0 };

async function uploadToBucket(file: File, bucket: "menu" | "gallery"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw signed.error ?? new Error("Sign URL failed");
  return signed.data.signedUrl;
}

function MenuAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [filterCat, setFilterCat] = useState<string>("All");
  const [uploading, setUploading] = useState(false);
  const [customCat, setCustomCat] = useState("");

  const { data } = useQuery({
    queryKey: ["admin_menu"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("category").order("sort_order");
      return data ?? [];
    },
  });

  // Build complete category list = constants + any extras already in DB
  const allCategories = useMemo(() => {
    const set = new Set<string>(MENU_CATEGORIES as readonly string[]);
    for (const m of data ?? []) if (m.category) set.add(m.category);
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(
    () => (filterCat === "All" ? data ?? [] : (data ?? []).filter((m: any) => m.category === filterCat)),
    [data, filterCat],
  );

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
    onError: (e: any) => toast.error(e.message),
  });

  const swap = useMutation({
    mutationFn: async ({ a, b }: { a: any; b: any }) => {
      const e1 = await supabase.from("menu_items").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (e1.error) throw e1.error;
      const e2 = await supabase.from("menu_items").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (e2.error) throw e2.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_menu"] }),
    onError: (e: any) => toast.error(e.message),
  });

  function moveItem(item: any, dir: -1 | 1) {
    const sameCat = (data ?? []).filter((m: any) => m.category === item.category).sort((x: any, y: any) => x.sort_order - y.sort_order);
    const idx = sameCat.findIndex((m: any) => m.id === item.id);
    const target = sameCat[idx + dir];
    if (!target) return;
    // If they share sort_order, bump first
    if (target.sort_order === item.sort_order) {
      swap.mutate({ a: item, b: { ...target, sort_order: target.sort_order + dir } });
    } else {
      swap.mutate({ a: item, b: target });
    }
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadToBucket(file, "menu");
      setEditing((p: any) => ({ ...p, image_url: url }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.length ?? 0} items · use ↑/↓ to reorder within a category</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setCustomCat(""); setEditing({ ...empty, category: filterCat === "All" ? "Morning Tiffins" : filterCat }); }}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Order</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                      {m.image_url ? <img src={m.image_url} alt="" className="h-full w-full object-cover" /> : null}
                    </div>
                  </td>
                  <td className="p-3"><div className="font-medium">{m.name}</div><div className="line-clamp-1 text-xs text-muted-foreground">{m.description}</div></td>
                  <td className="p-3">{m.category}</td>
                  <td className="p-3"><Badge className={m.is_veg ? "bg-leaf text-white" : "bg-spice text-white"}>{m.is_veg ? "VEG" : "NON-VEG"}</Badge></td>
                  <td className="p-3 text-right font-medium">₹{Number(m.price).toFixed(0)}</td>
                  <td className="p-3"><Badge variant={m.active ? "secondary" : "outline"}>{m.active ? "Yes" : "No"}</Badge></td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => moveItem(m, -1)} className="rounded-md border p-1.5 hover:bg-secondary" aria-label="Move up"><ArrowUp className="h-3 w-3" /></button>
                      <button onClick={() => moveItem(m, 1)} className="rounded-md border p-1.5 hover:bg-secondary" aria-label="Move down"><ArrowDown className="h-3 w-3" /></button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setCustomCat(""); setEditing({ ...m }); }} className="rounded-md border p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => confirm("Delete this item?") && del.mutate(m.id)} className="rounded-md border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No items in this category yet.</td></tr>
              )}
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
                  <Select
                    value={allCategories.includes(editing.category) ? editing.category : "__custom"}
                    onValueChange={(v) => {
                      if (v === "__custom") setEditing({ ...editing, category: customCat || "" });
                      else setEditing({ ...editing, category: v });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value="__custom">+ New category…</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Type new category name"
                    value={customCat}
                    onChange={(e) => { setCustomCat(e.target.value); setEditing({ ...editing, category: e.target.value }); }}
                  />
                </div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" min={0} step={1} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="flex items-end gap-6"><label className="flex items-center gap-2"><Switch checked={editing.is_veg} onCheckedChange={(v) => setEditing({ ...editing, is_veg: v })} /> Veg</label><label className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label></div>
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex flex-wrap items-center gap-3">
                  {editing.image_url && (
                    <img src={editing.image_url} alt="" className="h-16 w-16 rounded-md object-cover" />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-secondary">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.currentTarget.value = ""; }}
                    />
                  </label>
                </div>
                <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="Or paste image URL" />
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={save.isPending || uploading}>Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
