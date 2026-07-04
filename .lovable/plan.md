# Client-readiness hardening plan

Five independent workstreams. I'll do them in one build pass.

## 1. Security scan + fixes
- Run the backend security scan against the live database (RLS, exposed data, policy gaps).
- Triage findings: fix anything **critical/high** in the same pass (missing RLS, over-broad `anon` grants, function `search_path`, etc.) via a new migration.
- Anything low/informational: summarize and leave for your review (won't block client hand-off).

## 2. Leaked-password protection (HIBP)
- Turn on Supabase Auth's "Password HIBP check" so signup/password-change rejects passwords found in known breaches.
- No UI change needed — it's an auth-config flag.

## 3. Privacy Policy + Terms pages
Two new public routes, styled to match the existing site (turmeric/cream palette, `PublicLayout`, `SiteHeader`/`SiteFooter`):
- `/privacy` — what you collect (name, phone, email, event details via booking form), why, cookies/analytics, retention, contact for data requests.
- `/terms` — booking terms (quotes non-binding until confirmed, deposit/cancellation placeholder, food-allergen disclaimer, jurisdiction: Hyderabad, India).
- Add footer links to both from `SiteFooter`.
- Both pages carry a **"This page is maintained by Pandu Catering"** qualifier and a note that you should have a lawyer review before publishing.
- I'll leave clearly-marked `[EDIT]` placeholders for company legal name, GSTIN, cancellation window, and refund %.

## 4. Google Analytics 4
Defaulting to **GA4** (you asked for GA4 or Plausible; GA4 is free and matches your Search Console workflow).
- Add a `ga_measurement_id` field to Site Settings (admin can paste `G-XXXXXXXXXX` without a redeploy).
- Inject the gtag snippet from `__root.tsx` only when the ID is set and only in production (not in the editor preview).
- Fire a `booking_submitted` event on successful booking insert so you can track that conversion.
- Respect a simple consent banner? → **Not included** unless you want it (adds friction; ask if you need EU/GDPR compliance).

## 5. Move chat-uploaded images to the Lovable CDN
- Scan `src/assets/` for binary files >100 KB that were uploaded (photos), upload them to the CDN via `lovable-assets`, replace imports with `.asset.json` pointers, delete the originals.
- This shrinks the repo and speeds up cold loads. Existing `gallery_media` rows in the DB (admin-uploaded via Supabase Storage) are untouched — they already live in cloud storage.

## Technical notes
- Security fixes ship as one migration with `GRANT`s preserved.
- HIBP toggle uses `supabase--configure_auth`.
- GA4 script loads via a `<script>` tag in `__root.tsx` head, gated on `settings.ga_measurement_id` fetched at root.
- Privacy/Terms are static JSX — no DB, no loader.
- Asset migration follows the `migrate-to-assets` skill: preflight → upload → rewrite refs → delete originals → build check.

## Out of scope (say the word and I'll add)
- Cookie consent banner
- Custom domain hookup
- Payments (Stripe/Razorpay deposit)
- Sitemap resubmission in Search Console (you declined GSC connect earlier)