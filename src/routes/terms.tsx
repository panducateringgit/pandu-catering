import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { BRAND } from "@/lib/constants";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Pandu Catering" },
      { name: "description", content: "Booking terms, payment, cancellation and food-safety terms for Pandu Catering, Hyderabad." },
      { property: "og:title", content: "Terms of Service — Pandu Catering" },
      { property: "og:description", content: "Booking and service terms." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const updated = "4 July 2026";
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <p className="mt-4 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          This page is maintained by {BRAND.name}. Please have this reviewed by a lawyer before publishing for commercial use. Fields marked <code>[EDIT]</code> need your input.
        </p>

        <div className="prose prose-neutral mt-8 max-w-none text-[15px] leading-relaxed">
          <h2 className="font-display text-2xl font-semibold mt-8">1. About these terms</h2>
          <p>These terms govern the use of the {BRAND.name} website and the catering services we provide in Hyderabad, Telangana, India. By submitting a booking request you agree to these terms.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">2. Bookings & quotes</h2>
          <p>Submitting the booking form is a <strong>request</strong>, not a confirmed order. We aim to confirm availability within 30 minutes during business hours. A booking is confirmed only once we send written confirmation (WhatsApp, SMS or email) and any required deposit is received.</p>
          <p>All quotes are valid for <strong>[EDIT: 7]</strong> days from issue date and are subject to availability of ingredients and staff.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">3. Pricing, deposit & payment</h2>
          <ul className="list-disc pl-6">
            <li>A deposit of <strong>[EDIT: 25]%</strong> of the total quote is required to confirm bookings above ₹10,000.</li>
            <li>The remaining balance is due on or before the event date.</li>
            <li>Accepted payment methods: UPI, bank transfer, cash. GST is charged where applicable.</li>
            <li>Company name for invoicing: <strong>[EDIT: legal entity name]</strong>. GSTIN: <strong>[EDIT: GSTIN]</strong>.</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold mt-8">4. Cancellation & refunds</h2>
          <ul className="list-disc pl-6">
            <li>Cancellation <strong>7+ days</strong> before the event: full refund of deposit.</li>
            <li>Cancellation <strong>3–6 days</strong> before: <strong>[EDIT: 50]%</strong> of deposit refunded.</li>
            <li>Cancellation <strong>within 48 hours</strong>: deposit is non-refundable.</li>
            <li>We reserve the right to cancel and issue a full refund if we cannot safely deliver the event (e.g. force majeure).</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold mt-8">5. Guest count changes</h2>
          <p>Final guest count must be confirmed at least 48 hours before the event. Increases above 10% may not be possible on short notice. Reductions of more than 20% will still be charged at the confirmed count.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">6. Food allergens & safety</h2>
          <p>Our kitchen handles dairy, wheat, nuts, seafood and other common allergens. We cannot guarantee dishes are free from trace allergens. Customers must inform us of allergies at time of booking. Perishable food should be consumed within 2 hours of service.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">7. Venue, setup & our staff</h2>
          <p>The customer is responsible for providing a suitable serving space, power and water access. Setup requires reasonable access at least 1 hour before service. Our staff will act professionally; abusive behaviour towards staff may result in cancellation without refund.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">8. Liability</h2>
          <p>Our maximum liability for any claim is limited to the amount you have paid us for the event in question. We are not liable for indirect or consequential losses.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">9. Photos & marketing</h2>
          <p>We may photograph our food setup at events for use on our website and social media. No customer or guest photos will be used without permission.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">10. Governing law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Hyderabad, Telangana.</p>

          <h2 className="font-display text-2xl font-semibold mt-8">11. Contact</h2>
          <p>Questions about these terms? Email <a className="text-primary underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or call {BRAND.phoneDisplay}.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
