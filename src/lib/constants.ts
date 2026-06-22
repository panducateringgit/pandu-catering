export const BRAND = {
  name: "Pandu Catering",
  tagline: "Delicious, Authentic & Affordable Catering in Hyderabad",
  phoneDial: "+919959630445",
  phoneDisplay: "+91 99596 30445",
  whatsappNumber: "919959630445",
  city: "Hyderabad",
};

export const waLink = (msg?: string) =>
  `https://wa.me/${BRAND.whatsappNumber}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;

export const telLink = `tel:${BRAND.phoneDial}`;

export const MENU_CATEGORIES = [
  "South Indian",
  "North Indian",
  "Chinese",
  "Snacks",
  "Desserts",
  "Beverages",
] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const EVENT_TYPE_OPTIONS = [
  "Birthday Party",
  "Corporate Event",
  "House Party",
  "Family Function",
  "Wedding / Engagement",
  "Other",
] as const;
