export const BRAND = {
  name: "Pandu Catering",
  tagline: "Delicious, Authentic & Affordable Catering in Hyderabad",
  phoneDial: "+919959630445",
  phoneDisplay: "+91 99596 30445",
  whatsappNumber: "919959630445",
  city: "Hyderabad",
  email: "pandudoddi71@gmail.com",
};

export const SOCIAL = {
  instagram: "https://www.instagram.com/pandudoddi?igsh=NmV6MmF6NGVmNDBs",
  facebook: "https://www.facebook.com/share/1BNzjT46bF/?mibextid=wwXIfr",
  youtube: "https://youtube.com/@doddipandu1987?si=MmAIyJVOljZYqCkx",
  justdial: "https://jsdl.in/DT-28VMIYOM449",
  maps: "https://maps.app.goo.gl/kEFjrRQJmbXQYaCd9",
};

export const waLink = (msg?: string) =>
  `https://wa.me/${BRAND.whatsappNumber}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;

export const ORDER_WA_MESSAGE =
  "Hello Pandu, I want to order food from your catering. I want to know about pricing and menu list for veg and non-veg. If you are available, please ping me or call me to confirm the order.";

export const orderWaLink = waLink(ORDER_WA_MESSAGE);

export const telLink = `tel:${BRAND.phoneDial}`;

export const MENU_CATEGORIES = [
  "Morning Tiffins",
  "Afternoon Lunch",
  "Evening Snacks",
  "Night Dinners",
  "South Indian",
  "North Indian",
  "Chinese",
  "Snacks",
  "Desserts",
  "Beverages",
] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const MEAL_TIME_CATEGORIES = [
  "Morning Tiffins",
  "Afternoon Lunch",
  "Evening Snacks",
  "Night Dinners",
] as const;

export const EVENT_TYPE_OPTIONS = [
  "Birthday Party",
  "Corporate Event",
  "House Party",
  "Family Function",
  "Wedding / Engagement",
  "Housewarming",
  "Other",
] as const;

export const SERVICE_OPTIONS = [
  "Food Only",
  "Food + Serving Staff",
  "Full Event Catering",
] as const;

export const SERVICE_AREAS = [
  "Kukatpally", "Miyapur", "Gachibowli", "Hitech City",
  "Banjara Hills", "Secunderabad", "LB Nagar", "Uppal",
];

export const TRUST_BADGES = [
  { value: "1200+", label: "Successful Events" },
  { value: "10+", label: "Years Experience" },
  { value: "5000+", label: "Happy Customers" },
  { value: "100%", label: "Hygienic Preparation" },
];

export const PRICING_TIERS = [
  {
    name: "Veg Basic",
    price: 120,
    popular: false,
    isVeg: true,
    features: [
      "3 curries + dal + rice + roti",
      "Rasam, curd, pickle, papad",
      "1 sweet + 1 snack",
      "Disposable plates included",
      "Doorstep delivery in Hyderabad",
    ],
  },
  {
    name: "Veg Premium",
    price: 180,
    popular: true,
    isVeg: true,
    features: [
      "Welcome drink + 2 starters",
      "4 curries + dal + biryani/rice",
      "Roti, rasam, curd, papad, pickle",
      "2 desserts (incl. seasonal special)",
      "Premium plates + serving staff option",
    ],
  },
  {
    name: "Non-Veg Basic",
    price: 220,
    popular: false,
    isVeg: false,
    features: [
      "Chicken curry + 2 veg curries",
      "Biryani / rice + dal + roti",
      "Rasam, curd, pickle, papad",
      "1 dessert + 1 starter",
      "Disposable plates included",
    ],
  },
  {
    name: "Non-Veg Premium",
    price: 300,
    popular: false,
    isVeg: false,
    features: [
      "Welcome drink + 3 starters (veg + non-veg)",
      "Chicken + Mutton biryani / curries",
      "Tandoor items, dal, naan, rice",
      "3 desserts + live counter option",
      "Full serving staff + setup",
    ],
  },
];

// Add-ons used by the live pricing estimator (per plate unless noted)
export const PRICING_ADDONS = [
  { id: "welcome_drink", label: "Welcome drink", price: 25 },
  { id: "extra_dessert", label: "Extra dessert", price: 35 },
  { id: "live_counter", label: "Live dosa/chaat counter", price: 60 },
  { id: "serving_staff", label: "Serving staff & setup", price: 20 },
  { id: "premium_plates", label: "Premium plates & cutlery", price: 15 },
];

export const FAQS = [
  { q: "What is the minimum order quantity?", a: "We cater events from 20 guests upwards — house parties, birthdays, corporate lunches and large weddings of 1000+ guests." },
  { q: "How many days in advance should I book?", a: "We recommend booking 5–7 days ahead for regular events and 3–4 weeks for weddings. Last-minute bookings are accommodated based on availability." },
  { q: "Do you provide serving staff?", a: "Yes. You can choose 'Food Only', 'Food + Serving Staff', or 'Full Event Catering' (including setup and cleanup) at booking." },
  { q: "Do you cater outside Hyderabad?", a: "We primarily serve Greater Hyderabad. For outstation events please call us — we evaluate based on distance, guest count and timeline." },
  { q: "Is transport / delivery included?", a: "Doorstep delivery is included for events within Hyderabad. Outstation deliveries are quoted separately." },
  { q: "Can I customise the menu?", a: "Absolutely. Pick from our menu or request custom dishes — Telugu specialties, Andhra meals, Hyderabadi spreads, North Indian, Chinese and more." },
  { q: "Are disposable plates included?", a: "Premium plates and cutlery are included in Veg Premium and Non-Veg Premium. Veg Basic includes hygienic disposable plates." },
  { q: "What payment methods do you accept?", a: "Cash, UPI, bank transfer and card payments. Typically 30% advance to confirm and remainder on event day." },
];

export const TESTIMONIALS_EXTENDED = [
  { name: "Rajesh K.", role: "Wedding", location: "Banjara Hills", date: "2026-03-12", rating: 5, text: "Pandu Catering made our wedding unforgettable. The biryani and dosa counter were the talk of the night." },
  { name: "Priya S.", role: "Birthday Party", location: "Gachibowli", date: "2026-04-02", rating: 5, text: "Tasty, hot, and delivered right on time. Affordable too — exactly what we needed!" },
  { name: "Arvind M.", role: "Corporate Event", location: "HITEC City", date: "2026-01-20", rating: 5, text: "Hygienic packaging, professional team, and authentic taste. Booking them every quarter now." },
  { name: "Lakshmi R.", role: "House Warming", location: "Kukatpally", date: "2026-02-08", rating: 5, text: "Felt like home-cooked food. Guests asked who catered — happy to recommend Pandu!" },
  { name: "Suresh V.", role: "Engagement", location: "Secunderabad", date: "2025-12-18", rating: 5, text: "Crisp dosas, soft idlis, and the mutton curry was spot on. Service was prompt and polite." },
  { name: "Anitha B.", role: "Family Function", location: "Miyapur", date: "2026-05-14", rating: 5, text: "Genuinely affordable without compromising taste. Our entire family loved every dish." },
];
