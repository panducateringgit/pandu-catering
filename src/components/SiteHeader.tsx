import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { BRAND, telLink, orderWaLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import logo from "@/assets/pandu-logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/booking", label: "Book Now" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="Pandu Catering logo"
            width={48}
            height={48}
            className="h-10 w-10 rounded-full bg-cream object-contain shadow-soft md:h-12 md:w-12"
          />
          <div className="leading-tight">
            <div className="font-display text-lg font-bold text-primary md:text-xl">{BRAND.name}</div>
            <div className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
              Hyderabad · Since 2015
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-secondary hover:text-primary"
              activeProps={{ className: "text-primary bg-secondary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden bg-[#25D366] text-white hover:bg-[#1ebe5d] md:inline-flex">
            <a href={orderWaLink} target="_blank" rel="noopener" aria-label="Order on WhatsApp">
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <a href={telLink}>
              <Phone className="h-4 w-4" /> Call
            </a>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary"
                activeProps={{ className: "text-primary bg-secondary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <a href={telLink} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
              <Phone className="h-4 w-4" /> Call {BRAND.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
