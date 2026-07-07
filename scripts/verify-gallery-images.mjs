#!/usr/bin/env node
/**
 * Post-deploy verification: fetch every published media URL referenced by
 * the site (gallery_media, menu_items images, site_settings hero/logo/favicon)
 * and confirm each responds with HTTP 200. Exits non-zero if any URL is broken
 * so CI turns red on the deploy commit or PR.
 *
 * Env:
 *   SUPABASE_URL      - Supabase project URL (required)
 *   SUPABASE_ANON_KEY - anon/publishable key (required)
 *   SITE_URL          - base URL for resolving relative /assets/... paths
 *   TIMEOUT_MS        - per-request timeout (default 10000)
 *   RETRIES           - retry attempts per URL on network/5xx (default 2)
 *   REPORT_PATH       - optional path to write JSON + CSV report of results
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SITE_URL = (process.env.SITE_URL || "https://www.panducatering.in").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 10000);
const RETRIES = Number(process.env.RETRIES || 2);
const REPORT_PATH = process.env.REPORT_PATH || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.");
  process.exit(2);
}

async function sbSelect(pathAndQuery) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!r.ok) {
    console.error(`Failed to query ${pathAndQuery}: ${r.status} ${await r.text()}`);
    process.exit(2);
  }
  return r.json();
}

const [galleryRows, menuRows, settingsRows] = await Promise.all([
  sbSelect("gallery_media?select=id,url,caption&published=eq.true"),
  sbSelect("menu_items?select=id,name,image_url&image_url=not.is.null"),
  sbSelect("site_settings?select=key,value&key=in.(hero_video_url,logo_url,favicon_url)"),
]);

const targets = [
  ...galleryRows.map((r) => ({ source: "gallery_media", id: r.id, label: r.caption || "", url: r.url })),
  ...menuRows.map((r) => ({ source: "menu_items", id: r.id, label: r.name || "", url: r.image_url })),
  ...settingsRows
    .filter((r) => r.value && r.value.trim())
    .map((r) => ({ source: "site_settings", id: r.key, label: r.key, url: r.value })),
];

console.log(
  `Checking ${targets.length} URLs (gallery=${galleryRows.length}, menu=${menuRows.length}, settings=${settingsRows.length}). ` +
    `timeout=${TIMEOUT_MS}ms retries=${RETRIES}`,
);

function resolveUrl(u) {
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${SITE_URL}${u}`;
  return `${SITE_URL}/${u}`;
}

async function fetchWithTimeout(url, opts) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: ac.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

async function check(target) {
  const url = resolveUrl(target.url);
  let lastStatus = 0;
  let lastError;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      let r = await fetchWithTimeout(url, { method: "HEAD" });
      // Some CDNs (incl. Supabase signed URLs) don't answer HEAD; retry with GET.
      if ([400, 403, 405].includes(r.status)) {
        r = await fetchWithTimeout(url, { method: "GET" });
      }
      lastStatus = r.status;
      if (r.ok) return { target, url, status: r.status, ok: true, attempts: attempt + 1 };
      // Retry only on 5xx; treat 4xx as terminal to fail fast.
      if (r.status < 500) break;
    } catch (e) {
      lastError = String(e);
    }
    if (attempt < RETRIES) await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
  }
  return { target, url, status: lastStatus, ok: false, error: lastError, attempts: RETRIES + 1 };
}

const results = await Promise.all(targets.map(check));
const broken = results.filter((r) => !r.ok);

for (const r of results) {
  const tag = r.ok ? "OK  " : "FAIL";
  console.log(
    `${tag} [${r.target.source}] id=${r.target.id} status=${r.status || "ERR"} attempts=${r.attempts} url=${r.url}` +
      (r.target.label ? ` label="${r.target.label}"` : "") +
      (r.error ? ` error=${r.error}` : ""),
  );
}

if (REPORT_PATH) {
  const dir = dirname(REPORT_PATH);
  if (dir && dir !== ".") mkdirSync(dir, { recursive: true });
  const summary = {
    site_url: SITE_URL,
    generated_at: new Date().toISOString(),
    total: results.length,
    ok: results.length - broken.length,
    failed: broken.length,
    results: results.map((r) => ({
      source: r.target.source,
      id: r.target.id,
      label: r.target.label,
      url: r.url,
      status: r.status,
      ok: r.ok,
      attempts: r.attempts,
      error: r.error ?? null,
    })),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
  const csvPath = REPORT_PATH.replace(/\.json$/i, "") + ".failed.csv";
  const csvRows = [
    "source,id,status,attempts,url,label,error",
    ...broken.map((b) => [
      b.target.source,
      b.target.id,
      b.status || "ERR",
      b.attempts,
      b.url,
      JSON.stringify(b.target.label || ""),
      JSON.stringify(b.error || ""),
    ].join(",")),
  ];
  writeFileSync(csvPath, csvRows.join("\n"));
  console.log(`\nReport written to ${REPORT_PATH} (+ ${csvPath})`);
}

if (broken.length) {
  console.error(`\n${broken.length} of ${results.length} URL(s) failed to load:`);
  for (const b of broken) {
    console.error(
      `  - [${b.target.source}] id=${b.target.id} status=${b.status || "ERR"} url=${b.url}` +
        (b.error ? ` (${b.error})` : ""),
    );
  }
  process.exit(1);
}
console.log(`\nAll ${results.length} URL(s) resolve successfully.`);

