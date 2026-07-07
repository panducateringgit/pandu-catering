#!/usr/bin/env node
/**
 * Post-deploy verification: fetch every published gallery_media URL and
 * confirm it responds with HTTP 200. Exits non-zero if any URL is broken so
 * CI turns red on the deploy commit.
 *
 * Env:
 *   SUPABASE_URL      - Supabase project URL (required)
 *   SUPABASE_ANON_KEY - anon/publishable key (required)
 *   SITE_URL          - base URL for resolving relative /assets/... paths
 *                       (defaults to the published Lovable domain)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_URL = (process.env.SITE_URL || "https://www.panducatering.in").replace(/\/$/, "");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.");
  process.exit(2);
}

const res = await fetch(
  `${SUPABASE_URL}/rest/v1/gallery_media?select=id,url,caption&published=eq.true`,
  {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  },
);
if (!res.ok) {
  console.error(`Failed to list gallery_media: ${res.status} ${await res.text()}`);
  process.exit(2);
}
const rows = await res.json();
console.log(`Checking ${rows.length} published gallery items...`);

function resolveUrl(u) {
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return `${SITE_URL}/${u}`;
}

async function check(row) {
  const url = resolveUrl(row.url);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow" });
    // Some CDNs (incl. Supabase signed URLs) don't answer HEAD; retry with GET.
    if (r.status === 405 || r.status === 403 || r.status === 400) {
      r = await fetch(url, { method: "GET", redirect: "follow" });
    }
    return { row, url, status: r.status, ok: r.ok };
  } catch (e) {
    return { row, url, status: 0, ok: false, error: String(e) };
  }
}

const results = await Promise.all(rows.map(check));
const broken = results.filter((r) => !r.ok);

for (const r of results) {
  const tag = r.ok ? "OK " : "FAIL";
  console.log(`${tag} ${r.status || "ERR"} ${r.url}${r.error ? ` (${r.error})` : ""}`);
}

if (broken.length) {
  console.error(`\n${broken.length} of ${results.length} gallery image(s) failed to load.`);
  process.exit(1);
}
console.log(`\nAll ${results.length} gallery image(s) resolve successfully.`);
