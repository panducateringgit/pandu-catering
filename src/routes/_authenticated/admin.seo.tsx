import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink, Play, Download, Loader2 } from "lucide-react";
import { verifyMediaUrls } from "@/lib/verify-media.functions";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoPreviewPage,
});

type VerifyReport = Awaited<ReturnType<typeof verifyMediaUrls>>;

const SITE_URL = "https://www.panducatering.in";
const ROUTES = ["/", "/menu", "/veg", "/non-veg", "/booking", "/gallery", "/about", "/contact"];

function SeoPreviewPage() {
  const { data: settings } = useQuery({
    queryKey: ["seo_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value").in("key", ["gsc_verification", "logo_url", "favicon_url"]);
      const m: Record<string, string> = {};
      for (const r of data ?? []) m[(r as any).key] = (r as any).value ?? "";
      return m;
    },
  });

  const { data: robotsInfo } = useQuery({
    queryKey: ["seo_robots"],
    queryFn: async () => {
      try {
        const r = await fetch("/robots.txt", { cache: "no-store" });
        return { status: r.status, text: r.ok ? await r.text() : "" };
      } catch (e: any) { return { status: 0, text: "", error: String(e) }; }
    },
  });

  const { data: sitemapInfo } = useQuery({
    queryKey: ["seo_sitemap"],
    queryFn: async () => {
      try {
        const r = await fetch("/sitemap.xml", { cache: "no-store" });
        const text = r.ok ? await r.text() : "";
        const urls = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
        return { status: r.status, urls, raw: text };
      } catch (e: any) { return { status: 0, urls: [], raw: "", error: String(e) }; }
    },
  });

  const gsc = (settings?.gsc_verification || "").trim();
  const sitemapReferenced = (robotsInfo?.text || "").includes(`${SITE_URL}/sitemap.xml`);
  const sitemapCoversRoutes = sitemapInfo ? ROUTES.every((r) => sitemapInfo.urls.some((u) => u.endsWith(r) || u.endsWith(r + "/"))) : false;

  const runVerify = useServerFn(verifyMediaUrls);
  const [report, setReport] = useState<VerifyReport | null>(null);
  const verifyMut = useMutation({
    mutationFn: async () => (await runVerify()) as VerifyReport,
    onSuccess: (data) => setReport(data),
  });

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-url-report-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">SEO Preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Verify canonical, robots, sitemap, and Google Search Console verification before you redeploy.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Live media URL check</h2>
              <p className="text-sm text-muted-foreground">Runs the same check as CI against homepage settings, menu images, and gallery media.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => verifyMut.mutate()} disabled={verifyMut.isPending}>
                {verifyMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                {verifyMut.isPending ? "Checking…" : "Run checks now"}
              </Button>
              <Button variant="outline" onClick={downloadReport} disabled={!report}>
                <Download className="mr-2 h-4 w-4" /> Download report.json
              </Button>
            </div>
          </div>
          {verifyMut.isError && <p className="text-sm text-destructive">Failed: {String((verifyMut.error as any)?.message ?? verifyMut.error)}</p>}
          {report && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">Total: {report.total}</Badge>
                <Badge className="bg-leaf text-white">OK: {report.ok}</Badge>
                <Badge variant={report.failed ? "destructive" : "secondary"}>Failed: {report.failed}</Badge>
                <Badge variant="outline">gallery: {report.by_source.gallery_media}</Badge>
                <Badge variant="outline">menu: {report.by_source.menu_items}</Badge>
                <Badge variant="outline">settings: {report.by_source.site_settings}</Badge>
                <span className="text-muted-foreground">at {new Date(report.generated_at).toLocaleString()}</span>
              </div>
              <div className="max-h-72 overflow-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-secondary/60">
                    <tr className="text-left">
                      <th className="p-2">Status</th><th className="p-2">Source</th><th className="p-2">ID</th><th className="p-2">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((r, i) => (
                      <tr key={i} className={r.ok ? "" : "bg-destructive/10"}>
                        <td className="p-2 font-mono">{r.status || "ERR"}</td>
                        <td className="p-2">{r.source}</td>
                        <td className="p-2 font-mono truncate max-w-[8rem]" title={r.id}>{r.id}</td>
                        <td className="p-2 truncate"><a href={r.url} target="_blank" rel="noopener" className="underline">{r.url}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Google Search Console verification</h2>
            <StatusPill ok={!!gsc} okText="Configured" badText="Missing token" />
          </div>
          {gsc ? (
            <pre className="rounded-md border bg-secondary/40 p-3 text-xs overflow-x-auto">{`<meta name="google-site-verification" content="${gsc}" />`}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">Add your token in <a className="underline" href="/admin/settings">Site Settings → Google Search Console verification token</a>. The meta tag is emitted automatically once saved.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Canonical & site URL</h2>
            <Badge variant="secondary">{SITE_URL}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Each public route sets its own <code>&lt;link rel="canonical"&gt;</code> pointing at itself under this base URL.</p>
          <ul className="grid gap-1 text-sm md:grid-cols-2">
            {ROUTES.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <code className="rounded bg-secondary/40 px-1.5 py-0.5">{SITE_URL}{r === "/" ? "" : r}</code>
                <a href={r} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" /></a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">robots.txt</h2>
            <div className="flex items-center gap-2">
              <StatusPill ok={robotsInfo?.status === 200} okText={`HTTP ${robotsInfo?.status}`} badText={`HTTP ${robotsInfo?.status ?? "ERR"}`} />
              <StatusPill ok={sitemapReferenced} okText="Sitemap referenced" badText="Sitemap missing" />
            </div>
          </div>
          <pre className="max-h-56 overflow-auto rounded-md border bg-secondary/40 p-3 text-xs">{robotsInfo?.text || "(empty)"}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">sitemap.xml</h2>
            <div className="flex items-center gap-2">
              <StatusPill ok={sitemapInfo?.status === 200} okText={`HTTP ${sitemapInfo?.status}`} badText={`HTTP ${sitemapInfo?.status ?? "ERR"}`} />
              <StatusPill ok={sitemapCoversRoutes} okText={`${sitemapInfo?.urls.length ?? 0} URLs`} badText="Missing routes" />
            </div>
          </div>
          {sitemapInfo?.urls?.length ? (
            <ul className="max-h-56 overflow-auto rounded-md border bg-secondary/40 p-3 text-xs">
              {sitemapInfo.urls.map((u) => <li key={u}>{u}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No URLs parsed from sitemap.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-6">
          <h2 className="font-semibold">Favicon / logo</h2>
          <div className="flex items-center gap-4">
            <img src={settings?.favicon_url || settings?.logo_url || "/assets/pandu-logo.png"} alt="favicon preview" className="h-10 w-10 rounded border bg-white object-contain" />
            <div className="text-sm">
              <div>Favicon: <code className="rounded bg-secondary/40 px-1.5 py-0.5">{settings?.favicon_url || "(fallback to logo)"}</code></div>
              <div>Logo: <code className="rounded bg-secondary/40 px-1.5 py-0.5">{settings?.logo_url || "/assets/pandu-logo.png"}</code></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">Note: search engines cache crawls; changes may take hours to appear. Force refresh in the Google Rich Results test or Search Console URL Inspection.</p>
    </div>
  );
}

function StatusPill({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return ok
    ? <Badge className="bg-leaf text-white"><CheckCircle2 className="mr-1 h-3 w-3" /> {okText}</Badge>
    : <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> {badText}</Badge>;
}
