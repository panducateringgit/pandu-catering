import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import heroFeast from "@/assets/hero-feast.jpg";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishDosa from "@/assets/dish-dosa.jpg";
import eventWedding from "@/assets/event-wedding.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Pandu Catering" },
      { name: "description", content: "Past events, food spreads and behind-the-scenes from Pandu Catering Hyderabad." },
      { property: "og:title", content: "Gallery — Pandu Catering" },
      { property: "og:description", content: "Food & event photos from our kitchens to your celebrations." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data } = useQuery({
    queryKey: ["gallery_all"],
    queryFn: async () => {
      const { data } = await supabase.from("gallery_media").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const fallback = [heroFeast, dishBiryani, dishDosa, eventWedding, heroFeast, dishBiryani, dishDosa, eventWedding, heroFeast, dishBiryani, dishDosa, eventWedding].map((url, i) => ({ id: `f${i}`, url, media_type: "image", caption: "" }));
  const items = (data && data.length ? data : fallback) as any[];

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-cream md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Our gallery</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">A taste of past events</h1>
          <p className="mt-4 max-w-2xl text-cream/90">Snapshots from weddings, corporate days and house parties we've catered across Hyderabad.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g, i) => (
            <figure key={g.id} className="group overflow-hidden rounded-2xl shadow-soft transition hover:shadow-warm">
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {g.media_type === "video" ? (
                  <video
                    controls
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  >
                    <source src={g.url} />
                  </video>
                ) : (
                  <img
                    src={g.url}
                    alt={g.caption || `Pandu Catering Hyderabad event photo ${i + 1}`}
                    loading={i < 4 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              {g.caption && (
                <figcaption className="bg-card p-3 text-sm text-muted-foreground">{g.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
