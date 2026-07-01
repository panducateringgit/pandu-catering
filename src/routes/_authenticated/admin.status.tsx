import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Save, RefreshCw, Database, Cloud, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/status")({
  component: StatusPage,
});

const FIELDS: { key: string; label: string; type?: "text" | "textarea" | "url"; help?: string }[] = [
  { key: "hero_title", label: "Homepage hero headline" },
  { key: "hero_subtitle", label: "Homepage hero subtitle", type: "textarea" },
  { key: "hero_video_url", label: "Hero video URL (optional)", type: "url" },
  { key: "phone", label: "Phone (with country code)", help: "e.g. +919959630445" },
  { key: "whatsapp", label: "WhatsApp number (digits only)", help: "e.g. 919959630445" },
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

function StatusPage() {
  const qc = useQueryClient();

  const checks = useQuery({
    queryKey: ["admin_status_checks"],
    queryFn: async () => {
      const results: Record<string, { ok: boolean; detail: string }> = {};
      const started = performance.now();
      const [settings, bookings, menu, slots, gallery] = await Promise.all([
        supabase.from("site_settings").select("key", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("menu_items").select("id", { count: "exact", head: true }),
        supabase.from("booking_slots").select("id", { count: "exact", head: true }),
        supabase.from("gallery_images").select("id", { count: "exact", head: true }),
      ]);
      const latencyMs = Math.round(performance.now() - started);
      results.database = { ok: !settings.error, detail: settings.error ? settings.error.message : `Reachable • ${latencyMs} ms round-trip` };
      results.site_settings = { ok: !settings.error, detail: `${settings.count ?? 0} keys` };
      results.bookings = { ok: !bookings.error, detail: bookings.error ? bookings.error.message : `${bookings.count ?? 0} rows` };
      results.menu = { ok: !menu.error, detail: menu.error ? menu.error.message : `${menu.count ?? 0} items` };
      results.slots = { ok: !slots.error, detail: slots.error ? slots.error.message : `${slots.count ?? 0} slots` };
      results.gallery = { ok: !gallery.error, detail: gallery.error ? gallery.error.message : `${gallery.count ?? 0} images` };
      const { data: authData } = await supabase.auth.getUser();
      results.auth = { ok: !!authData.user, detail: authData.user ? authData.user.email ?? "signed in" : "no session" };
      return { results, checkedAt: new Date().toISOString() };
    },
    refetchOnWindowFocus: false,
  });

  const settingsQ = useQuery({
    queryKey: ["admin_status_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*")).data ?? [],
  });

  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (settingsQ.data) {
      const m: Record<string, string> = {};
      for (const r of settingsQ.data as any[]) m[r.key] = r.value ?? "";
      setForm(m);
    }
  }, [settingsQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = FIELDS.map((f) => ({ key: f.key, value: form[f.key] ?? "" }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_status_settings"] });
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Settings saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL ?? "";
  const projectRef = supabaseUrl.replace(/^https:\/\//, "").split(".")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Site status</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live database health checks and quick access to site settings.
          </p>
        </div>
        <Button variant="outline" onClick={() => checks.refetch()} disabled={checks.isFetching}>
          <RefreshCw className={`h-4 w-4 ${checks.isFetching ? "animate-spin" : ""}`} /> Re-check
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Backend connection</h2>
            </div>
            <dl className="space-y-2 text-sm">
              <Row k="Provider" v="Lovable Cloud" />
              <Row k="Project ref" v={<code className="rounded bg-muted px-2 py-0.5">{projectRef || "—"}</code>} />
              <Row k="API URL" v={<code className="break-all rounded bg-muted px-2 py-0.5 text-xs">{supabaseUrl || "—"}</code>} />
              <Row k="Client key" v={<Badge variant="secondary">anon / publishable</Badge>} />
              <Row k="Service role" v={<Badge variant="outline">server only</Badge>} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Full connection details, secrets, database, users and functions live in the sidebar under <strong>More → Cloud</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Health checks</h2>
            </div>
            {checks.isLoading && <p className="text-sm text-muted-foreground">Running checks…</p>}
            {checks.data && (
              <ul className="space-y-2 text-sm">
                {Object.entries(checks.data.results).map(([k, v]) => (
                  <li key={k} className="flex items-start justify-between gap-3 border-b pb-2 last:border-0">
                    <span className="flex items-center gap-2">
                      {v.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="capitalize">{k.replace("_", " ")}</span>
                    </span>
                    <span className="text-right text-xs text-muted-foreground">{v.detail}</span>
                  </li>
                ))}
              </ul>
            )}
            {checks.data && (
              <p className="mt-3 text-xs text-muted-foreground">Last checked {new Date(checks.data.checkedAt).toLocaleTimeString()}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="grid gap-5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Site settings</h2>
              <p className="text-sm text-muted-foreground">Same fields as the Settings page — edit here for quick tweaks.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/_authenticated/admin/settings"><ExternalLink className="h-4 w-4" /> Open full editor</Link>
            </Button>
          </div>
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {f.type === "textarea"
                ? <Textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                : <Input type={f.type === "url" ? "url" : "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
              {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
            </div>
          ))}
          <div className="pt-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="h-4 w-4" /> {save.isPending ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
