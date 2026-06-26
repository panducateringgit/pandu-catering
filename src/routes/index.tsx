import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";
import {
  BRAND, SOCIAL, telLink, waLink, orderWaLink,
  TRUST_BADGES, PRICING_TIERS, SERVICE_AREAS, FAQS, TESTIMONIALS_EXTENDED,
} from "@/lib/constants";
import {
  IndianRupee, Award, Soup, Truck, Users, Sparkles, Phone, MessageCircle,
  Cake, Briefcase, Home as HomeIcon, Heart, Crown, Star, ChevronRight,
  ShieldCheck, MapPin, FileCheck2, Leaf, CheckCircle2, ExternalLink,
} from "lucide-react";
import heroFeast from "@/assets/hero-feast.jpg";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishDosa from "@/assets/dish-dosa.jpg";
import eventWedding from "@/assets/event-wedding.jpg";

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Pandu Catering",
  image: "https://pandu-catering.lovable.app/og.jpg",
  url: "https://pandu-catering.lovable.app",
  telephone: "+91-99596-30445",
  email: "pandudoddi71@gmail.com",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  areaServed: ["Hyderabad", "Secunderabad", "Gachibowli", "HITEC City", "Banjara Hills", "Kukatpally"],
  servesCuisine: ["South Indian", "Hyderabadi", "North Indian", "Chinese"],
  sameAs: [SOCIAL.instagram, SOCIAL.facebook, SOCIAL.youtube, SOCIAL.justdial],
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1200" },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Best Catering Services in Hyderabad | Pandu Catering — Wedding, Birthday, Corporate" },
      { name: "description", content: "Affordable South Indian catering in Hyderabad. Wedding caterers, birthday catering, corporate events. Veg & non-veg from ₹80/plate. Call +91 99596 30445." },
      { name: "keywords", content: "Best Catering Services in Hyderabad, Wedding Caterers Hyderabad, Birthday Catering Hyderabad, South Indian Catering Hyderabad, Affordable Catering Services Hyderabad" },
      { property: "og:title", content: "Pandu Catering — Hyderabad" },
      { property: "og:description", content: "Authentic South Indian catering with doorstep delivery." },
      { property: "og:url", content: "https://pandu-catering.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://pandu-catering.lovable.app/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(JSONLD) }],
  }),
  component: HomePage,
});


const WHY = [
  { icon: IndianRupee, title: "Affordable Pricing", desc: "Transparent rates with no hidden charges." },
  { icon: Award, title: "High Quality", desc: "Premium ingredients & chef-led kitchens." },
  { icon: Soup, title: "South Indian Specialty", desc: "Authentic Hyderabadi & Telugu flavours." },
  { icon: Truck, title: "Doorstep Delivery", desc: "On-time delivery across Hyderabad." },
  { icon: Users, title: "With / Without Servers", desc: "Flexible — choose what suits your event." },
  { icon: Sparkles, title: "Hygienic Preparation", desc: "Strict food-safety & cleanliness standards." },
];

const EVENT_ICONS: Record<string, any> = {
  "Weddings & Engagements": Crown,
  "Corporate Events": Briefcase,
  "Birthday Parties": Cake,
  "House Parties": HomeIcon,
  "Family Functions": Heart,
  "Other Events": Sparkles,
};

function HomePage() {
  const { data: settings } = useSettings();
  const { data: menu } = useQuery({
    queryKey: ["menu_preview"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").eq("active", true).order("sort_order").limit(50);
      return data ?? [];
    },
  });
  const { data: events } = useQuery({
    queryKey: ["event_types_home"],
    queryFn: async () => {
      const { data } = await supabase.from("event_types").select("*").eq("active", true).order("sort_order");
      return data ?? [];
    },
  });
  const { data: gallery } = useQuery({
    queryKey: ["gallery_home"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery_media").select("*").order("sort_order").limit(8);
      return data ?? [];
    },
  });

  const heroTitle = settings?.hero_title || BRAND.tagline;
  const heroSub = settings?.hero_subtitle || "";
  const mapEmbed = settings?.map_embed || "https://www.google.com/maps?q=Hyderabad,Telangana&output=embed";

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroFeast} alt="South Indian wedding feast spread by Pandu Catering Hyderabad" width="1920" height="1280" fetchPriority="high" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 py-20 md:px-6">
          <Badge className="w-fit bg-turmeric text-turmeric-foreground">★ Hyderabad's most-loved caterer</Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-cream text-balance md:text-6xl lg:text-7xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-cream/90 md:text-lg">{heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-turmeric text-turmeric-foreground hover:bg-turmeric/90">
              <Link to="/booking">Get Instant Quote <ChevronRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d]">
              <a href={orderWaLink} target="_blank" rel="noopener" aria-label="Order on WhatsApp">
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-cream hover:bg-white/10">
              <a href={telLink}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="rounded-xl border border-cream/20 bg-white/10 px-4 py-3 text-cream backdrop-blur">
                <div className="font-display text-2xl font-bold text-turmeric">{b.value}</div>
                <div className="text-xs leading-tight text-cream/85">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VEG / NON-VEG QUICK PICK */}
      <section className="border-y bg-secondary/40 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-2 md:px-6">
          <Link
            to="/veg"
            className="group flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-leaf/90 to-leaf p-6 text-white shadow-soft transition hover:shadow-warm"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-90">🟢 Pure Veg</div>
              <div className="mt-1 font-display text-2xl font-bold md:text-3xl">Veg Catering Menu →</div>
              <p className="mt-1 text-sm text-white/90">South Indian, North Indian & Chinese veg from ₹80/plate</p>
            </div>
            <ChevronRight className="h-8 w-8 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/non-veg"
            className="group flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-spice/90 to-spice p-6 text-white shadow-soft transition hover:shadow-warm"
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest opacity-90">🔴 Non-Veg</div>
              <div className="mt-1 font-display text-2xl font-bold md:text-3xl">Non-Veg Catering Menu →</div>
              <p className="mt-1 text-sm text-white/90">Hyderabadi biryani, chicken, mutton & tandoor from ₹200/plate</p>
            </div>
            <ChevronRight className="h-8 w-8 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>


      {/* WHY */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Why choose us</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Catering done the right way</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <Card key={w.title} className="group border-border/60 transition hover:-translate-y-1 hover:shadow-warm">
              <CardContent className="p-7">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-warm text-primary-foreground shadow-soft">
                  <w.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* EVENT TYPES */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">We cater for</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Every occasion, perfectly served</h2>
            </div>
            <Button asChild variant="outline"><Link to="/booking">Plan your event</Link></Button>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(events ?? []).map((e: any) => {
              const Icon = EVENT_ICONS[e.name] ?? Sparkles;
              return (
                <Card key={e.id} className="overflow-hidden border-0 shadow-soft transition hover:shadow-warm">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={e.image_url || eventWedding}
                      alt={e.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-cream">
                      <Icon className="h-5 w-5 text-turmeric" />
                      <span className="font-display text-lg font-semibold">{e.name}</span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{e.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Transparent pricing</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Plates starting at ₹80</h2>
          <p className="mt-3 text-muted-foreground">Indicative per-plate rates. Final quote depends on menu, guest count and services.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((t) => (
            <Card key={t.name} className={`relative border-2 transition hover:-translate-y-1 hover:shadow-warm ${t.popular ? "border-turmeric shadow-warm" : "border-border/60"}`}>
              {t.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-turmeric text-turmeric-foreground">★ Most Popular</Badge>
              )}
              <CardContent className="p-7">
                <h3 className="font-display text-2xl font-bold">{t.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">from</span>
                  <span className="font-display text-4xl font-bold text-primary">₹{t.price}</span>
                  <span className="text-sm text-muted-foreground">/plate</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /><span>{f}</span></li>
                  ))}
                </ul>
                <Button asChild className={`mt-6 w-full ${t.popular ? "bg-turmeric text-turmeric-foreground hover:bg-turmeric/90" : ""}`}>
                  <Link to="/booking">Request Custom Quote</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* MENU PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">A taste of our menu</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Crowd-favourite dishes</h2>
        </div>
        <Tabs defaultValue="veg" className="mt-10">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="veg">🟢 Veg</TabsTrigger>
              <TabsTrigger value="nonveg">🔴 Non-Veg</TabsTrigger>
            </TabsList>
          </div>
          {(["veg", "nonveg"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-8">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(menu ?? [])
                  .filter((m: any) => (tab === "veg" ? m.is_veg : !m.is_veg))
                  .slice(0, 6)
                  .map((m: any) => (
                    <Card key={m.id} className="overflow-hidden border-border/60 transition hover:shadow-warm">
                      <div className="relative h-44 overflow-hidden bg-muted">
                        <img
                          src={m.image_url || (m.category === "South Indian" ? dishDosa : dishBiryani)}
                          alt={m.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <Badge className={`absolute left-3 top-3 ${m.is_veg ? "bg-leaf" : "bg-spice"} text-white`}>
                          {m.is_veg ? "VEG" : "NON-VEG"}
                        </Badge>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                          <span className="whitespace-nowrap font-display text-lg font-bold text-primary">₹{Number(m.price).toFixed(0)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-10 text-center">
          <Button asChild size="lg" variant="outline"><Link to="/menu">View full menu <ChevronRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      {/* SERVICE AREAS + MAP */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Service Areas</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Serving across Hyderabad</h2>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-warm">
              <iframe
                src={mapEmbed}
                title="Pandu Catering — Hyderabad service area"
                width="100%"
                height="100%"
                loading="lazy"
                className="aspect-[4/3] w-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div>
              <h3 className="font-display text-2xl font-semibold">We deliver to:</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {SERVICE_AREAS.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm shadow-soft">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {a}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Don't see your area? We cover all of Greater Hyderabad — just call or WhatsApp us to confirm availability for your location.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild><a href={SOCIAL.maps} target="_blank" rel="noopener"><ExternalLink className="h-4 w-4" /> Open in Maps</a></Button>
                <Button asChild variant="outline"><a href={telLink}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / CERTIFICATIONS */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Trust & Compliance</p>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Catering you can trust</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: FileCheck2, title: "FSSAI Licensed", desc: settings?.fssai_license || "FSSAI registered kitchen" },
            { icon: ShieldCheck, title: "GST Registered", desc: settings?.gst_number || "GST compliant invoicing" },
            { icon: Award, title: "10+ Years Experience", desc: "Trusted by 5000+ families" },
            { icon: Sparkles, title: "Hygienic Kitchen", desc: "Daily-sanitised prep areas" },
            { icon: Leaf, title: "Fresh Ingredients", desc: "Sourced fresh, every event" },
          ].map((t) => (
            <Card key={t.title} className="border-border/60 text-center">
              <CardContent className="p-6">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-turmeric/15 text-turmeric">
                  <t.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-warm py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cream/80">Loved across Hyderabad</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">What our customers say</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS_EXTENDED.map((t) => (
              <Card key={t.name + t.date} className="border-0 bg-white/10 text-primary-foreground backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-turmeric font-display text-base font-bold text-turmeric-foreground">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">{t.name}</div>
                      <div className="text-xs opacity-80">{t.role} • {t.location}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1 text-turmeric">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">"{t.text}"</p>
                  <div className="mt-3 text-xs opacity-75">
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Past events</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">From our kitchen to your celebration</h2>
          </div>
          <Button asChild variant="outline"><Link to="/gallery">View gallery</Link></Button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(gallery && gallery.length ? gallery.slice(0,8) : [
            { id: "h1", url: heroFeast }, { id: "h2", url: dishBiryani }, { id: "h3", url: dishDosa }, { id: "h4", url: eventWedding },
            { id: "h5", url: heroFeast }, { id: "h6", url: dishBiryani }, { id: "h7", url: dishDosa }, { id: "h8", url: eventWedding },
          ]).map((g: any, i: number) => (
            <div key={g.id} className={`group relative overflow-hidden rounded-xl shadow-soft ${i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`}>
              <img src={g.url} alt={g.caption || `Pandu Catering event photo ${i + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/60">
                <AccordionTrigger className="text-left font-display text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-cream shadow-warm md:p-16">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-turmeric/20 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-4xl">Planning an event? Let's make it delicious.</h3>
              <p className="mt-3 max-w-xl text-cream/90">Talk to our team for a custom menu and quote — usually within 30 minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-turmeric text-turmeric-foreground hover:bg-turmeric/90"><Link to="/booking">Get Instant Quote</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-cream/40 bg-transparent text-cream hover:bg-white/10"><a href={waLink("Hi Pandu Catering!")}><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button>
              <Button asChild size="lg" variant="ghost" className="text-cream hover:bg-white/10"><a href={telLink}><Phone className="h-4 w-4" /> Call</a></Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
