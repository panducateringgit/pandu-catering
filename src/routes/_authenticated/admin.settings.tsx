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

const FIELDS: { key: string; label: string; type?: "text" | "textarea" | "url"; help?: string }[] = [
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
];

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
              {f.type === "textarea"
                ? <Textarea rows={4} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                : <Input type={f.type === "url" ? "url" : "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
              {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
            </div>
          ))}
          <div className="pt-2"><Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> {save.isPending ? "Saving..." : "Save settings"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
