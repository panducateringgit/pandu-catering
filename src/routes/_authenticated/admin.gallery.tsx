import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload, Loader2, GripVertical, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { CropDialog } from "@/components/admin/CropDialog";
import { validateImageUrl } from "@/lib/validate-image-url";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

async function uploadBlob(blob: Blob, ext: string): Promise<string> {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from("gallery").upload(path, blob, { upsert: false, contentType: blob.type });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from("gallery").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw signed.error ?? new Error("Sign URL failed");
  return signed.data.signedUrl;
}

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: GalleryAdminPage,
});

type Media = {
  id: string;
  media_type: "image" | "video";
  url: string;
  caption: string | null;
  sort_order: number;
  featured: boolean;
  published: boolean;
};

const empty: Media = {
  id: "",
  media_type: "image",
  url: "",
  caption: "",
  sort_order: 0,
  featured: false,
  published: true,
};

function GalleryAdminPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [order, setOrder] = useState<Media[]>([]);

  const { data } = useQuery({
    queryKey: ["admin_gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_media").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Media[];
    },
  });

  useEffect(() => { if (data) setOrder(data); }, [data]);

  const save = useMutation({
    mutationFn: async (item: Media) => {
      if (item.media_type === "image" && item.url) {
        const check = await validateImageUrl(item.url);
        if (!check.ok) throw new Error(`Image URL invalid: ${check.reason}`);
      }
      const payload = { ...item, sort_order: Number(item.sort_order) };
      if (item.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("gallery_media").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id: _drop, ...rest } = payload;
        const { error } = await supabase.from("gallery_media").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); qc.invalidateQueries({ queryKey: ["gallery_all"] }); qc.invalidateQueries({ queryKey: ["gallery_home"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); qc.invalidateQueries({ queryKey: ["gallery_all"] }); qc.invalidateQueries({ queryKey: ["gallery_home"] }); toast.success("Deleted"); },
  });

  const togglePublish = useMutation({
    mutationFn: async (item: Media) => {
      const { error } = await supabase.from("gallery_media").update({ published: !item.published }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); qc.invalidateQueries({ queryKey: ["gallery_all"] }); qc.invalidateQueries({ queryKey: ["gallery_home"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const persistOrder = useMutation({
    mutationFn: async (items: Media[]) => {
      // Save new sort_order for each row (small dataset, per-row update is fine).
      for (let i = 0; i < items.length; i++) {
        if (items[i].sort_order !== i) {
          const { error } = await supabase.from("gallery_media").update({ sort_order: i }).eq("id", items[i].id);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_gallery"] }); qc.invalidateQueries({ queryKey: ["gallery_all"] }); qc.invalidateQueries({ queryKey: ["gallery_home"] }); toast.success("Order saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(ev: DragEndEvent) {
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((x) => x.id === active.id);
    const newIndex = order.findIndex((x) => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    persistOrder.mutate(next);
  }

  async function handleCroppedUpload(blob: Blob) {
    setUploading(true);
    try {
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const url = await uploadBlob(blob, ext);
      setEditing((p) => ({ ...(p ?? empty), url }));
      setPendingFile(null);
      toast.success("Uploaded");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleVideoUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const url = await uploadBlob(file, ext);
      setEditing((p) => ({ ...(p ?? empty), url }));
      toast.success("Uploaded");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setUploading(false); }
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Media manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload, crop & resize, drag to reorder, and publish gallery items. Unpublished items are hidden from the public site.
          </p>
        </div>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4" /> Add media</Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order.map((o) => o.id)} strategy={rectSortingStrategy}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {order.map((g) => (
              <SortableCard
                key={g.id}
                item={g}
                onEdit={() => setEditing({ ...g })}
                onDelete={() => confirm("Delete this item?") && del.mutate(g.id)}
                onTogglePublish={() => togglePublish.mutate(g)}
              />
            ))}
            {order.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="p-10 text-center text-muted-foreground">
                  No media yet. Click "Add media" to upload your first photo or video.
                </CardContent>
              </Card>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit media" : "Add media"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid gap-4" onSubmit={(ev) => { ev.preventDefault(); save.mutate(editing); }}>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editing.media_type} onValueChange={(v) => setEditing({ ...editing, media_type: v as "image" | "video" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Media</Label>
                <div className="flex flex-wrap items-center gap-3">
                  {editing.url && editing.media_type === "image" && (
                    <img src={editing.url} alt="" className="h-16 w-16 rounded-md object-cover" />
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-secondary">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading…" : editing.media_type === "image" ? "Upload & crop" : "Upload video"}
                    <input
                      type="file"
                      accept={editing.media_type === "video" ? "video/*" : "image/*"}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        if (editing.media_type === "image") setPendingFile(f);
                        else handleVideoUpload(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <UrlValidatedInput
                  value={editing.url}
                  mediaType={editing.media_type}
                  onChange={(v) => setEditing({ ...editing, url: v })}
                />

              </div>
              <div className="space-y-2"><Label>Caption</Label><Input value={editing.caption || ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} /> Published</label>
                <label className="flex items-center gap-2"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /> Featured</label>
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={uploading}>Save</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <CropDialog
        file={pendingFile}
        busy={uploading}
        onCancel={() => setPendingFile(null)}
        onConfirm={handleCroppedUpload}
      />
    </div>
  );
}

function SortableCard({
  item,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  item: Media;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.media_type === "video"
          ? <video src={item.url} className="h-full w-full object-cover" muted />
          : <img src={item.url} alt={item.caption || ""} className="h-full w-full object-cover" />}
        <button
          type="button"
          className="absolute left-2 top-2 inline-flex cursor-grab items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs shadow-sm backdrop-blur active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" /> Drag
        </button>
        {!item.published && (
          <Badge variant="secondary" className="absolute right-2 top-2">Draft</Badge>
        )}
      </div>
      <CardContent className="p-3">
        <p className="line-clamp-1 text-sm">{item.caption || "Untitled"}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.media_type} • #{item.sort_order}</span>
          <div className="flex gap-1">
            <button
              onClick={onTogglePublish}
              className="rounded-md border p-1.5 hover:bg-secondary"
              title={item.published ? "Unpublish" : "Publish"}
            >
              {item.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            <button onClick={onEdit} className="rounded-md border p-1.5 hover:bg-secondary"><Pencil className="h-3 w-3" /></button>
            <button onClick={onDelete} className="rounded-md border p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UrlValidatedInput({
  value,
  mediaType,
  onChange,
}: {
  value: string;
  mediaType: "image" | "video";
  onChange: (v: string) => void;
}) {
  const [check, setCheck] = useState<{ status: "idle" | "checking" | "ok" | "bad"; reason?: string }>({ status: "idle" });
  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setCheck({ status: "idle" }); }}
        onBlur={async (e) => {
          const v = e.target.value.trim();
          if (!v || mediaType !== "image") return;
          setCheck({ status: "checking" });
          const r = await validateImageUrl(v);
          setCheck(r.ok ? { status: "ok" } : { status: "bad", reason: r.reason });
        }}
        placeholder="Or paste https://..."
        required
      />
      {check.status === "checking" && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Checking image…</p>}
      {check.status === "ok" && <p className="flex items-center gap-1 text-xs text-leaf"><CheckCircle2 className="h-3 w-3" /> Image loads OK</p>}
      {check.status === "bad" && <p className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" /> {check.reason}</p>}
    </div>
  );
}

