import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { useSettings } from "@/hooks/useSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BRAND, telLink, waLink } from "@/lib/constants";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Pandu Catering Hyderabad" },
      { name: "description", content: "Call, WhatsApp or message us for catering enquiries in Hyderabad." },
      { property: "og:title", content: "Contact — Pandu Catering" },
      { property: "og:description", content: "Reach us by phone, WhatsApp, or message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: s } = useSettings();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-cream md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">Let's talk catering</h1>
          <p className="mt-4 max-w-2xl text-cream/90">Tell us about your event — we'll respond within 30 minutes.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-5 md:px-6">
        <div className="space-y-4 md:col-span-2">
          {[
            { icon: Phone, title: "Call us", value: BRAND.phoneDisplay, href: telLink },
            { icon: MessageCircle, title: "WhatsApp", value: BRAND.phoneDisplay, href: waLink("Hi Pandu Catering!") },
            { icon: Mail, title: "Email", value: s?.email || "hello@panducatering.in", href: `mailto:${s?.email || "hello@panducatering.in"}` },
            { icon: MapPin, title: "Visit", value: s?.address || "Hyderabad, Telangana, India" },
          ].map((c) => (
            <Card key={c.title} className="border-border/60">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-warm text-primary-foreground"><c.icon className="h-5 w-5" /></div>
                <div>
                  <div className="font-display font-semibold">{c.title}</div>
                  {c.href ? <a className="text-sm text-muted-foreground hover:text-primary" href={c.href}>{c.value}</a> : <div className="text-sm text-muted-foreground">{c.value}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/60 md:col-span-3">
          <CardContent className="p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold">Send us a message</h2>
            <form
              className="mt-6 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.name || !form.phone || !form.message) { toast.error("Please fill all fields"); return; }
                const msg = `Hi Pandu Catering!%0AName: ${form.name}%0APhone: ${form.phone}%0A%0A${form.message}`;
                window.open(`https://wa.me/${BRAND.whatsappNumber}?text=${msg}`, "_blank");
                toast.success("Opening WhatsApp...");
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required maxLength={20} /></div>
              </div>
              <div className="space-y-2"><Label>Message</Label><Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={1000} /></div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit"><MessageCircle className="h-4 w-4" /> Send on WhatsApp</Button>
                <Button asChild type="button" variant="outline"><a href={telLink}><Phone className="h-4 w-4" /> Call Now</a></Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="overflow-hidden rounded-3xl border shadow-soft">
          <iframe
            title="Pandu Catering location"
            src={s?.map_embed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647!2d78.24!3d17.41!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sHyderabad!5e0!3m2!1sen!2sin!4v1700000000000"}
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
      </section>
    </PublicLayout>
  );
}
