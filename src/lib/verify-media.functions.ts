import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SITE_URL = (process.env.SITE_URL || "https://www.panducatering.in").replace(/\/$/, "");
const TIMEOUT_MS = 10000;
const RETRIES = 1;

type Target = { source: string; id: string; label: string; url: string };
type Result = {
  source: string;
  id: string;
  label: string;
  url: string;
  status: number;
  ok: boolean;
  attempts: number;
  error: string | null;
};

function resolveUrl(u: string): string {
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return `${SITE_URL}/${u}`;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ac.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

async function check(target: Target): Promise<Result> {
  const url = resolveUrl(target.url);
  let lastStatus = 0;
  let lastError: string | null = null;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      let r = await fetchWithTimeout(url, { method: "HEAD" });
      if ([400, 403, 405].includes(r.status)) {
        r = await fetchWithTimeout(url, { method: "GET" });
      }
      lastStatus = r.status;
      if (r.ok) {
        return { ...target, url, status: r.status, ok: true, attempts: attempt + 1, error: null };
      }
      if (r.status < 500) break;
    } catch (e) {
      lastError = String(e);
    }
    if (attempt < RETRIES) await new Promise((res) => setTimeout(res, 400 * (attempt + 1)));
  }
  return { ...target, url, status: lastStatus, ok: false, attempts: RETRIES + 1, error: lastError };
}

export const verifyMediaUrls = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [galleryRes, menuRes, settingsRes] = await Promise.all([
      supabase.from("gallery_media").select("id,url,caption").eq("published", true),
      supabase.from("menu_items").select("id,name,image_url").not("image_url", "is", null),
      supabase.from("site_settings").select("key,value").in("key", ["hero_video_url", "logo_url", "favicon_url"]),
    ]);

    const targets: Target[] = [
      ...((galleryRes.data ?? []) as any[]).map((r) => ({ source: "gallery_media", id: String(r.id), label: r.caption ?? "", url: r.url })),
      ...((menuRes.data ?? []) as any[]).map((r) => ({ source: "menu_items", id: String(r.id), label: r.name ?? "", url: r.image_url })),
      ...((settingsRes.data ?? []) as any[])
        .filter((r) => r.value && String(r.value).trim())
        .map((r) => ({ source: "site_settings", id: r.key, label: r.key, url: r.value })),
    ];

    const results = await Promise.all(targets.map(check));
    const failed = results.filter((r) => !r.ok);
    return {
      site_url: SITE_URL,
      generated_at: new Date().toISOString(),
      total: results.length,
      ok: results.length - failed.length,
      failed: failed.length,
      by_source: {
        gallery_media: results.filter((r) => r.source === "gallery_media").length,
        menu_items: results.filter((r) => r.source === "menu_items").length,
        site_settings: results.filter((r) => r.source === "site_settings").length,
      },
      results,
    };
  });
