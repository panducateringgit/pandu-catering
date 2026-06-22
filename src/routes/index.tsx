import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/useSettings";
import { BRAND, telLink, waLink } from "@/lib/constants";
import {
  IndianRupee, Award, Soup, Truck, Users, Sparkles, Phone, MessageCircle,
  Cake, Briefcase, Home as HomeIcon, Heart, Crown, Star, ChevronRight,
} from "lucide-react";
import heroFeast from "@/assets/hero-feast.jpg";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishDosa from "@/assets/dish-dosa.jpg";
import eventWedding from "@/assets/event-wedding.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pandu Catering — Best South Indian Catering in Hyderabad" },
      { name: "description", content: "Top-rated South Indian catering in Hyderabad. Weddings, birthdays, corporate events. Veg & non-veg, with doorstep delivery. Call +91 99596 30445." },
      { property: "og:title", content: "Pandu Catering — Hyderabad" },
      { property: "og:description", content: "Authentic South Indian catering with doorstep delivery." },
    ],
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

const TESTIMONIALS = [
  { name: "Rajesh K.", role: "Wedding, Banjara Hills", text: "Pandu Catering made our wedding unforgettable. The biryani and dosa counter were the talk of the night." },
  { name: "Priya S.", role: "Birthday Party, Gachibowli", text: "Tasty, hot, and delivered right on time. Affordable too — exactly what we needed!" },
  { name: "Arvind M.", role: "Corporate Event, HITEC City", text: "Hygienic packaging, professional team, and authentic taste. Booking them every quarter now." },
  { name: "Lakshmi R.", role: "House Warming, Kukatpally", text: "Felt like home-cooked food. Guests asked who catered — happy to recommend Pandu!" },
];

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

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroFeast} alt="South Indian feast" className="h-full w-full object-cover" />
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
              <Link to="/booking">Book Now <ChevronRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/40 bg-white/10 text-cream backdrop-blur hover:bg-white/20">
              <a href={waLink("Hi Pandu Catering! I'd like to enquire.")} target="_blank" rel="noopener">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-cream hover:bg-white/10">
              <a href={telLink}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-cream/80">
            <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-turmeric text-turmeric" /><span className="text-sm">4.9 / 5 from 1200+ events</span></div>
            <div className="text-sm">• 10+ years in Hyderabad</div>
            <div className="text-sm">• 50,000+ guests served</div>
          </div>
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

      {/* TESTIMONIALS */}
      <section className="bg-gradient-warm py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cream/80">Loved across Hyderabad</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">What our customers say</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-0 bg-white/10 text-primary-foreground backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex gap-1 text-turmeric">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                  <p className="mt-4 text-sm leading-relaxed">"{t.text}"</p>
                  <div className="mt-5">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs opacity-80">{t.role}</div>
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
              <img src={g.url} alt={g.caption || ""} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-cream shadow-warm md:p-16">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-turmeric/20 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-4xl">Planning an event? Let's make it delicious.</h3>
              <p className="mt-3 max-w-xl text-cream/90">Talk to our team for a custom menu and quote — usually within 30 minutes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-turmeric text-turmeric-foreground hover:bg-turmeric/90"><Link to="/booking">Book Now</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-cream/40 bg-transparent text-cream hover:bg-white/10"><a href={waLink("Hi Pandu Catering!")}><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button>
              <Button asChild size="lg" variant="ghost" className="text-cream hover:bg-white/10"><a href={telLink}><Phone className="h-4 w-4" /> Call</a></Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
