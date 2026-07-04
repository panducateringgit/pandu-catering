import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pandu Catering" },
      { name: "description", content: "How Pandu Catering collects, uses, and protects your personal information when you book catering services in Hyderabad." },
      { property: "og:title", content: "Privacy Policy — Pandu Catering" },
      { property: "og:description", content: "How we handle your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "4 July 2026";
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <p className="mt-4 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          This page is maintained by {BRAND.name}. It describes our current practices for personal information collected through this website. Please have this reviewed by a lawyer before publishing for commercial use.
        </p>

        <div className="prose prose-neutral mt-8 max-w-none text-[15px] leading-relaxed">
          <h2 className="font-display text-2xl font-semibold mt-8">1. Who we are</h2>
          <p>{BRAND.name} ("we", "us", "our") operates this website and provides catering services in Hyderabad, Telangana, India. You can reach us at <a className="text-primary underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or {BRAND.phoneDisplay}.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">2. Information we collect</h2>
          <p>When you use our booking form, we collect:</p>
          <ul className="list-disc pl-6">
            <li>Your name and mobile number</li>
            <li>Email address (optional)</li>
            <li>Event details: type, date, time slot, guest count, address, menu preferences, notes</li>
          </ul>
          <p>We also automatically collect basic technical data (device type, pages viewed, referring source) through analytics cookies — see section 6.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">3. How we use it</h2>
          <ul className="list-disc pl-6">
            <li>To confirm and deliver your booking</li>
            <li>To contact you about your event (call, WhatsApp, email)</li>
            <li>To improve our menu, service and website</li>
          </ul>
          <p>We do not sell your data. We do not send marketing messages without your consent.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">4. Who we share it with</h2>
          <p>Booking details are shared only with our kitchen and service staff working your event. We use Lovable Cloud (Supabase) as our secure hosting and database provider; your data is stored on their infrastructure under their <a className="text-primary underline" href="https://supabase.com/privacy" target="_blank" rel="noopener">privacy terms</a>.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">5. How long we keep it</h2>
          <p>Booking records are retained for up to 3 years for business records and GST compliance, then deleted. Analytics data is retained per Google Analytics defaults (14 months).</p>

          <h2 className="font-display text-2xl font-semibold mt-8">6. Cookies & analytics</h2>
          <p>We use Google Analytics 4 to understand how visitors use our site. It sets first-party cookies that record pages viewed, referring source, and rough location. No advertising cookies are used.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">7. Your rights</h2>
          <p>You can ask us to view, correct or delete the personal data we hold about you by emailing <a className="text-primary underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>. We'll respond within 30 days.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">8. Security</h2>
          <p>Data in transit is encrypted with HTTPS. Access to the admin dashboard is restricted to authorized staff and protected by passwords checked against known data-breach lists.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">9. Changes</h2>
          <p>We may update this policy from time to time. Changes will be posted on this page with a new "Last updated" date.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">10. Contact</h2>
          <p>Questions? Email <a className="text-primary underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or call {BRAND.phoneDisplay}.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
