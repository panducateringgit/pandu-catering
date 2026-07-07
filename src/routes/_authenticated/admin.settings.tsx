import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdminPage,
});

const FIELDS: { key: string; label: string; type?: "text" | "textarea" | "url" | "image"; help?: string }[] = [
  { key: "logo_url", label: "Site logo", type: "image", help: "Shown in the header and used as the browser tab icon fallback." },
  { key: "favicon_url", label: "Favicon (browser tab icon)", type: "image", help: "Square PNG/SVG/ICO. Falls back to the logo if empty." },
  { key: "hero_title", label: "Homepage hero headline" },
  { key: "hero_subtitle", label: "Homepage hero subtitle", type: "textarea" },
  { key: "hero_video_url", label: "Hero video URL (optional)", type: "url" },
  { key: "phone", label: "Phone (with country code)", help: "e.g. +919959630445" },
  { key: "whatsapp", label: "WhatsApp number (digits only, with country code)", help: "e.g. 919959630445" },
  { key: "email", label: "Public email" },
  { key: "address", label: "Address" },
  { key: "map_embed", label: "Google Maps embed URL", type: "url" },
  { key: "play_store_url", label: "Google Play Store URL", type: "url" },
  { key: "about_story", label: "About page — story", type: "textarea" },
  { key: "about_mission", label: "About page — mission", type: "textarea" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_youtube", label: "YouTube URL" },
  { key: "ga_measurement_id", label: "Google Analytics 4 Measurement ID", help: "e.g. G-XXXXXXXXXX. Leave blank to disable tracking." },
];

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
async function uploadBrandAsset(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `brand/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabase.storage.from("gallery").upload(path, file, { upsert: false, contentType: file.type });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from("gallery").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data) throw signed.error ?? new Error("Sign URL failed");
  return signed.data.signedUrl;
}


function SettingsAdminPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*")).data ?? [],
  });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) {
      const m: Record<string, string> = {};
      for (const r of data as any[]) m[r.key] = r.value ?? "";
      setForm(m);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = FIELDS.map((f) => ({ key: f.key, value: form[f.key] ?? "" }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin_settings"] }); qc.invalidateQueries({ queryKey: ["site_settings"] }); toast.success("Settings saved"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Site Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Edit homepage text, contact info, and links shown across the website.</p>

      <Card className="mt-6">
        <CardContent className="grid gap-5 p-6">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea rows={4} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : f.type === "image" ? (
                <div className="flex flex-wrap items-center gap-3">
                  {form[f.key] && <img src={form[f.key]} alt="" className="h-12 w-12 rounded-md border object-contain bg-white" />}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-secondary">
                    Upload
                    <input
                      type="file"
                      accept="image/*,.ico"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (!file) return;
                        try {
                          const url = await uploadBrandAsset(file);
                          setForm((p) => ({ ...p, [f.key]: url }));
                          toast.success("Uploaded — remember to save");
                        } catch (err: any) { toast.error(err.message ?? "Upload failed"); }
                      }}
                    />
                  </label>
                  <Input className="flex-1 min-w-[220px]" value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder="or paste https://..." />
                </div>
              ) : (
                <Input type={f.type === "url" ? "url" : "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
              {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
            </div>
          ))}

          <div className="pt-2"><Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? "Saving..." : "Save settings"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
