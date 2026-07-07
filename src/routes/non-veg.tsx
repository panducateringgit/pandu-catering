import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "./veg";

export const Route = createFileRoute("/non-veg")({
  head: () => ({
    meta: [
      { title: "Non-Veg Catering in Hyderabad | Biryani, Chicken & Mutton — Pandu Catering" },
      { name: "description", content: "Hyderabadi dum biryani, butter chicken, mutton curry, tandoor & kebabs catering in Hyderabad. From ₹200/plate. Order on WhatsApp." },
      { property: "og:title", content: "Non-Veg Catering — Pandu Catering, Hyderabad" },
      { property: "og:description", content: "Biryani, chicken, mutton and tandoor catering across Hyderabad." },
      { property: "og:url", content: "https://www.panducatering.in/non-veg" },
    ],
    links: [{ rel: "canonical", href: "https://www.panducatering.in/non-veg" }],
  }),
  component: () => <CategoryPage isVeg={false} />,
});
