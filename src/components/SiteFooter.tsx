import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { BRAND, telLink, waLink } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";

export function SiteFooter() {
  const { data: s } = useSettings();
  return (
    <footer className="mt-20 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-turmeric font-display text-lg font-bold text-turmeric-foreground">P</div>
              <div className="font-display text-xl font-bold">{BRAND.name}</div>
            </div>
            <p className="mt-4 text-sm text-sidebar-foreground/80">
              Authentic South Indian catering with doorstep delivery across Hyderabad. Quality, hygiene, taste — every plate.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={s?.social_instagram || "#"} className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href={s?.social_facebook || "#"} className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              <a href={s?.social_youtube || "#"} className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/menu" className="hover:text-turmeric">Menu</Link></li>
              <li><Link to="/booking" className="hover:text-turmeric">Book Now</Link></li>
              <li><Link to="/gallery" className="hover:text-turmeric">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-turmeric">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-turmeric">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Reach Us</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-turmeric" /><span>{s?.address || "Hyderabad, Telangana, India"}</span></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-turmeric" /><a href={telLink} className="hover:text-turmeric">{BRAND.phoneDisplay}</a></li>
              <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-turmeric" /><a href={waLink("Hello Pandu Catering!")} className="hover:text-turmeric">WhatsApp us</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-turmeric" /><a href={`mailto:${s?.email || "hello@panducatering.in"}`} className="hover:text-turmeric">{s?.email || "hello@panducatering.in"}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Get our App</h4>
            <p className="mt-4 text-sm text-sidebar-foreground/80">Book faster on the Pandu Catering Android app.</p>
            <a
              href={s?.play_store_url || "#"}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-3 rounded-xl bg-background px-4 py-3 text-foreground shadow-soft transition hover:scale-[1.02]"
            >
              <svg viewBox="0 0 512 512" className="h-7 w-7"><path fill="#34A853" d="M325 234 89 470c8 4 17 4 26 0l263-152z"/><path fill="#FBBC04" d="m378 318 84-49c19-11 19-39 0-49l-79-46-92 87z"/><path fill="#4285F4" d="m291 256 88-87L116 18c-9-5-19-5-27 1z"/><path fill="#EA4335" d="M89 42v428c0 1 0 2 0 3l202-217z"/></svg>
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">GET IT ON</div>
                <div className="font-semibold">Google Play</div>
              </div>
            </a>
            <Link to="/booking" className="mt-4 block w-full rounded-md bg-turmeric px-4 py-3 text-center text-sm font-semibold text-turmeric-foreground hover:opacity-90">Book Now</Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/70 md:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p><Link to="/auth" className="hover:text-turmeric">Admin</Link></p>
        </div>
      </div>
    </footer>
  );
}
