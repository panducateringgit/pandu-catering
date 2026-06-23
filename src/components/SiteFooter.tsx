import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Mail, Instagram, Facebook, Youtube, Clock, ExternalLink } from "lucide-react";
import { BRAND, SOCIAL, telLink, waLink } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";

export function SiteFooter() {
  const { data: s } = useSettings();
  const email = s?.email_contact || s?.email || BRAND.email;
  const hours = s?.business_hours || "Mon–Sun, 7:00 AM – 11:00 PM";
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
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={s?.social_instagram || SOCIAL.instagram} target="_blank" rel="noopener" className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href={s?.social_facebook || SOCIAL.facebook} target="_blank" rel="noopener" className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              <a href={s?.social_youtube || SOCIAL.youtube} target="_blank" rel="noopener" className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
              <a href={waLink("Hi Pandu Catering!")} target="_blank" rel="noopener" className="rounded-full bg-sidebar-accent p-2 hover:bg-turmeric hover:text-turmeric-foreground" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
              <a href={s?.social_justdial || SOCIAL.justdial} target="_blank" rel="noopener" className="rounded-full bg-sidebar-accent px-3 py-2 text-xs font-bold hover:bg-turmeric hover:text-turmeric-foreground" aria-label="Justdial">JD</a>
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
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-turmeric" /><a href={`mailto:${email}`} className="hover:text-turmeric break-all">{email}</a></li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-turmeric" /><span>{hours}</span></li>
              <li className="flex items-center gap-2"><ExternalLink className="h-4 w-4 text-turmeric" /><a href={s?.google_maps_url || SOCIAL.maps} target="_blank" rel="noopener" className="hover:text-turmeric">Get Directions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Book Faster</h4>
            <p className="mt-4 text-sm text-sidebar-foreground/80">Get an instant quote — usually within 30 minutes.</p>
            <Link to="/booking" className="mt-4 block w-full rounded-md bg-turmeric px-4 py-3 text-center text-sm font-semibold text-turmeric-foreground hover:opacity-90">Get Instant Quote</Link>
            <a href={waLink("Hi Pandu, I need a quick quote.")} target="_blank" rel="noopener" className="mt-2 block w-full rounded-md border border-sidebar-border px-4 py-3 text-center text-sm font-semibold hover:bg-sidebar-accent">
              WhatsApp Quote
            </a>
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
