import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/constants";

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink("Hello Pandu Catering! I'd like to enquire about catering.")}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-warm transition hover:scale-110 md:bottom-7 md:right-7 md:h-16 md:w-16"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <MessageCircle className="relative h-7 w-7 md:h-8 md:w-8" />
    </a>
  );
}
