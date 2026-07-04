import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { useSettings } from "@/hooks/useSettings";
import { Award, Heart, Soup, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroFeastAsset from "@/assets/hero-feast.jpg.asset.json";
const heroFeast = heroFeastAsset.url;

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Pandu Catering, Hyderabad" },
      { name: "description", content: "Our story, mission, and what makes Pandu Catering Hyderabad's most trusted South Indian catering service." },
      { property: "og:title", content: "About — Pandu Catering" },
      { property: "og:description", content: "Authentic Hyderabadi catering crafted with care for over a decade." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: s } = useSettings();
  const story = s?.about_story || "";
  const mission = s?.about_mission || "";

  const stats = [
    { icon: Users, label: "Guests Served", value: "50K+" },
    { icon: Award, label: "Events Catered", value: "1,200+" },
    { icon: Soup, label: "Signature Dishes", value: "80+" },
    { icon: Heart, label: "Years in Hyderabad", value: "10+" },
  ];

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-cream md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Our story</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold md:text-6xl">From a small Hyderabadi kitchen to a city's favourite caterer</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-warm">
            <img src={heroFeast} alt="Authentic South Indian feast" className="w-full" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Crafted with love, served with pride</h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">{story}</p>
            <div className="mt-6 rounded-2xl bg-secondary/60 p-5">
              <h3 className="font-display text-lg font-semibold text-primary">Our promise</h3>
              <p className="mt-2 text-sm text-muted-foreground">{mission}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link to="/booking">Plan an event</Link></Button>
              <Button asChild variant="outline"><Link to="/menu">See our menu</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-card p-6 text-center shadow-soft">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-warm text-primary-foreground"><s.icon className="h-6 w-6" /></div>
              <div className="mt-4 font-display text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
