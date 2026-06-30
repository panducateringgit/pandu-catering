import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload, Loader2 } from "lucide-react";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
async function uploadGallery(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from("gallery").upload(path, file, { upsert: false, contentType: file.type });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from("gallery").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw signed.error ?? new Error("Sign URL failed");
  return signed.data.signedUrl;
}

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: GalleryAdminPage,
});

const empty = { id: "", media_type: "image" as "image" | "video", url: "", caption: "", sort_order: 0, featured: false };

function GalleryAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  async function handleFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadGallery(file);
      setEditing((p: any) => ({ ...(p ?? empty), url }));
      toast.success("Uploaded");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setUploading(false); }
  }

  const { data } = useQuery({
    queryKey: ["admin_gallery"],
    queryFn: async () => (await supabase.from("gallery_media").select("*").order("sort_order")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (item: any) => {
      const payload = { ...item, sort_order: Number(item.sort_order) };
      if (item.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("gallery_media").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("gallery_media").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); toast.success("Deleted"); },
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Images & videos shown on Home and Gallery pages.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4" /> Add media</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(data ?? []).map((g: any) => (
          <Card key={g.id} className="overflow-hidden">
            <div className="relative aspect-square overflow-hidden bg-muted">
              {g.media_type === "video"
                ? <video src={g.url} className="h-full w-full object-cover" muted />
                : <img src={g.url} alt={g.caption || ""} className="h-full w-full object-cover" />}
            </div>
            <CardContent className="p-3">
              <p className="line-clamp-1 text-sm">{g.caption || "Untitled"}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{g.media_type} • #{g.sort_order}</span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...g })} className="rounded-md border p-1.5 hover:bg-secondary"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => confirm("Delete?") && del.mutate(g.id)} className="rounded-md border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!data || data.length === 0) && <Card className="col-span-full"><CardContent className="p-10 text-center text-muted-foreground">No media yet. Click "Add media" to upload via URL.</CardContent></Card>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit media" : "Add media"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-4" onSubmit={(ev) => { ev.preventDefault(); save.mutate(editing); }}>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editing.media_type} onValueChange={(v) => setEditing({ ...editing, media_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Media URL</Label><Input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://..." required /></div>
              <div className="space-y-2"><Label>Caption</Label><Input value={editing.caption || ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="flex items-end"><label className="flex items-center gap-2"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /> Featured</label></div>
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
