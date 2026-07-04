import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderWaLink } from "@/lib/constants";
import { MessageCircle, Leaf, CheckCircle2 } from "lucide-react";
import dishDosaAsset from "@/assets/dish-dosa.jpg.asset.json";
const dishDosa = dishDosaAsset.url;

export const Route = createFileRoute("/veg")({
  head: () => ({
    meta: [
      { title: "Pure Veg Catering in Hyderabad | Pandu Catering — Weddings, Birthdays, Corporate" },
      { name: "description", content: "100% pure veg catering in Hyderabad. South Indian, North Indian & Chinese veg menus from ₹80/plate. Wedding, birthday & corporate catering — order on WhatsApp." },
      { property: "og:title", content: "Pure Veg Catering — Pandu Catering, Hyderabad" },
      { property: "og:description", content: "Authentic 100% vegetarian catering across Hyderabad. Order on WhatsApp." },
      { property: "og:url", content: "https://pandu-catering.lovable.app/veg" },
    ],
    links: [{ rel: "canonical", href: "https://pandu-catering.lovable.app/veg" }],
  }),
  component: () => <CategoryPage isVeg />,
});

export function CategoryPage({ isVeg }: { isVeg: boolean }) {
  const label = isVeg ? "Veg" : "Non-Veg";
  const accent = isVeg ? "from-leaf/90 to-leaf" : "from-spice/90 to-spice";

  const { data: items, isLoading } = useQuery({
    queryKey: ["category_menu", isVeg],
    queryFn: async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("active", true)
        .eq("is_veg", isVeg)
        .order("category")
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: gallery } = useQuery({
    queryKey: ["category_gallery", isVeg],
    queryFn: async () => {
      const { data } = await supabase
        .from("gallery_media")
        .select("*")
        .order("sort_order")
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <section className={`relative bg-gradient-to-br ${accent} py-20 text-white md:py-28`}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Badge className="bg-white/20 text-white hover:bg-white/30">
            {isVeg ? "🟢 100% Pure Veg" : "🔴 Premium Non-Veg"}
          </Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
            {isVeg
              ? "Pure Veg Catering in Hyderabad"
              : "Non-Veg Catering in Hyderabad — Biryani, Chicken & Mutton"}
          </h1>
          <p className="mt-4 max-w-2xl text-white/90 md:text-lg">
            {isVeg
              ? "Sattvik kitchens, separate vessels, classic South & North Indian veg spreads — perfect for weddings, housewarmings, temple events and corporate lunches."
              : "Hyderabadi dum biryani, butter chicken, mutton curry, kebabs and tandoor — cooked fresh, served hot, delivered on time across Hyderabad."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#25D366] text-white hover:bg-[#1ebe5d]"
            >
              <a href={orderWaLink} target="_blank" rel="noopener" aria-label={`Order ${label} catering on WhatsApp`}>
                <MessageCircle className="h-5 w-5" />
                Order on WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              <Link to="/booking">Get Instant Quote</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{label} Menu</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              {isVeg ? "Vegetarian dishes" : "Non-vegetarian dishes"} you can order today
            </h2>
          </div>
          <Button asChild variant="link" className="hidden md:inline-flex">
            <Link to="/menu">View full menu →</Link>
          </Button>
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && items && items.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m: any) => (
              <Card key={m.id} className="overflow-hidden border-border/60 transition hover:shadow-warm">
                <div className="relative h-44 overflow-hidden bg-muted">
                  <img
                    src={m.image_url || dishDosa}
                    alt={`${m.name} — ${label.toLowerCase()} catering by Pandu Catering Hyderabad`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <Badge className={`absolute left-3 top-3 ${isVeg ? "bg-leaf" : "bg-spice"} text-white`}>
                    {label.toUpperCase()}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                    <span className="whitespace-nowrap font-display text-lg font-bold text-primary">
                      ₹{Number(m.price).toFixed(0)}
                    </span>
                  </div>
                  {m.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!items || items.length === 0) && (
          <Card className="mt-8">
            <CardContent className="p-10 text-center text-muted-foreground">
              Our {label.toLowerCase()} menu is being updated. Tap "Order on WhatsApp" above and we'll share the full price list with you right away.
            </CardContent>
          </Card>
        )}
      </section>

      {gallery && gallery.length > 0 && (
        <section className="border-t bg-secondary/30 py-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="font-display text-3xl font-bold md:text-4xl">From our kitchen</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">A few shots from recent events and tastings.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((g: any) => (
                <div key={g.id} className="overflow-hidden rounded-xl shadow-soft">
                  <img src={g.url} alt={g.caption || `${label} catering by Pandu Catering`} loading="lazy" className="h-40 w-full object-cover transition hover:scale-105 md:h-56" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center md:px-6">
          <Leaf className="h-10 w-10 text-turmeric" />
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to plan your {label.toLowerCase()} feast?</h2>
          <p className="max-w-xl text-primary-foreground/85">
            Send us your event date and guest count — we'll respond within minutes with a custom quote.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d]">
              <a href={orderWaLink} target="_blank" rel="noopener" aria-label="Order on WhatsApp">
                <MessageCircle className="h-5 w-5" />
                Order on WhatsApp
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/40 bg-transparent text-cream hover:bg-cream/10">
              <Link to="/booking">
                <CheckCircle2 className="h-5 w-5" />
                Get Instant Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
