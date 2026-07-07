import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MENU_CATEGORIES } from "@/lib/constants";
import { waLink } from "@/lib/constants";
import { MessageCircle, Search } from "lucide-react";
import dishBiryaniAsset from "@/assets/dish-biryani.jpg.asset.json";
const dishBiryani = dishBiryaniAsset.url;
import dishDosaAsset from "@/assets/dish-dosa.jpg.asset.json";
const dishDosa = dishDosaAsset.url;

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Pandu Catering Hyderabad" },
      { name: "description", content: "Browse our full catering menu: South Indian, North Indian, Chinese, snacks, desserts, beverages. Veg & non-veg." },
      { property: "og:title", content: "Menu — Pandu Catering" },
      { property: "og:description", content: "Authentic catering menu with veg & non-veg options." },
      { property: "og:url", content: "https://www.panducatering.in/menu" },
    ],
    links: [{ rel: "canonical", href: "https://www.panducatering.in/menu" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Pandu Catering Menu",
        url: "https://www.panducatering.in/menu",
        about: "Veg and non-veg catering menu including South Indian, North Indian, Chinese, snacks, desserts and beverages.",
        isPartOf: { "@type": "WebSite", name: "Pandu Catering", url: "https://www.panducatering.in" },
      }),
    }],
  }),
  component: MenuPage,
});


function MenuPage() {
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");

  const { data: items } = useQuery({
    queryKey: ["menu_full"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").eq("active", true).order("category").order("sort_order");
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    return (items ?? []).filter((m: any) => {
      if (vegFilter === "veg" && !m.is_veg) return false;
      if (vegFilter === "nonveg" && m.is_veg) return false;
      if (cat !== "All" && m.category !== cat) return false;
      if (q && !m.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, vegFilter, cat, q]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const m of filtered) {
      g[m.category] = g[m.category] || [];
      g[m.category].push(m);
    }
    // Order categories by the canonical MENU_CATEGORIES list, then any extras alphabetically
    const ordered: [string, any[]][] = [];
    for (const c of MENU_CATEGORIES) if (g[c]?.length) ordered.push([c, g[c]]);
    for (const c of Object.keys(g).sort()) if (!MENU_CATEGORIES.includes(c as any)) ordered.push([c, g[c]]);
    return ordered;
  }, [filtered]);

  return (
    <PublicLayout>
      <section className="relative bg-gradient-hero py-16 text-cream md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Our menu</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold md:text-6xl">A feast across cuisines, in every bite</h1>
          <p className="mt-4 max-w-2xl text-cream/90">From Hyderabadi biryani and crisp dosas to creamy paneer and Indo-Chinese favourites — pick anything for your event.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={vegFilter} onValueChange={(v) => setVegFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="veg">🟢 Veg</TabsTrigger>
              <TabsTrigger value="nonveg">🔴 Non-Veg</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap gap-2">
            {["All", ...MENU_CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes..." className="pl-9" />
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {grouped.map(([category, list]) => (
            <div key={category}>
              <h2 className="font-display text-2xl font-bold md:text-3xl"><span className="text-primary">{category}</span></h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m: any) => (
                  <Card key={m.id} className="overflow-hidden border-border/60 transition hover:shadow-warm">
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <img
                        src={m.image_url || (m.is_veg ? dishDosa : dishBiryani)}
                        alt={`${m.name} — ${m.is_veg ? "veg" : "non-veg"} ${m.category || "dish"} by Pandu Catering`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = m.is_veg ? dishDosa : dishBiryani; }}
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
                      <div className="mt-4 flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link to="/booking" search={{ item: m.name } as any}>Add to Booking</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" aria-label={`Enquire about ${m.name} on WhatsApp`}>
                          <a href={waLink(`Hi! I'd like to order: ${m.name} (₹${m.price}) for an upcoming event.`)} target="_blank" rel="noopener" aria-label={`Enquire about ${m.name} on WhatsApp`}>
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">No dishes match your filters.</p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
