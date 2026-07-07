/**
 * Client-side image URL validation. Returns { ok, reason } after confirming
 * the URL loads as an image in the browser. Used by admin forms to block
 * saving broken image URLs.
 */
export type ImageValidation = { ok: true } | { ok: false; reason: string };

export function isLikelyHttpUrl(u: string): boolean {
  if (!u) return false;
  try {
    const parsed = new URL(u, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateImageUrl(url: string, timeoutMs = 8000): Promise<ImageValidation> {
  return new Promise((resolve) => {
    if (!url || !url.trim()) return resolve({ ok: false, reason: "URL is empty" });
    if (!isLikelyHttpUrl(url)) return resolve({ ok: false, reason: "Not a valid http(s) URL" });
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      resolve({ ok: false, reason: `Image did not load within ${timeoutMs / 1000}s` });
    }, timeoutMs);
    img.onload = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (!img.naturalWidth) resolve({ ok: false, reason: "Image has zero dimensions" });
      else resolve({ ok: true });
    };
    img.onerror = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ok: false, reason: "Image failed to load (404 or blocked)" });
    };
    img.src = url;
  });
}
