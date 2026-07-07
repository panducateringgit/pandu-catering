import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Analytics } from "@/components/Analytics";
import { CookieConsent } from "@/components/CookieConsent";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Back to Pandu Catering
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again or go back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">Try again</button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm">Go home</a>
        </div>
      </div>
    </div>
  );
}

async function loadBrandAssets() {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["logo_url", "favicon_url", "gsc_verification"]);
    const map: Record<string, string> = {};
    for (const r of data ?? []) map[(r as any).key] = (r as any).value ?? "";
    return {
      logoUrl: map.logo_url || "/assets/pandu-logo.png",
      faviconUrl: map.favicon_url || map.logo_url || "/assets/pandu-logo.png",
      gscToken: (map.gsc_verification || "").trim(),
    };
  } catch {
    return { logoUrl: "/assets/pandu-logo.png", faviconUrl: "/assets/pandu-logo.png", gscToken: "" };
  }
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: loadBrandAssets,
  head: ({ loaderData }) => {
    const logo = loaderData?.logoUrl ?? "/assets/pandu-logo.png";
    const favicon = loaderData?.faviconUrl ?? logo;
    const gscToken = loaderData?.gscToken ?? "";
    const faviconType = favicon.endsWith(".svg")
      ? "image/svg+xml"
      : favicon.endsWith(".ico")
        ? "image/x-icon"
        : favicon.endsWith(".png")
          ? "image/png"
          : "image/*";
    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#6e1d1d" },
      { property: "og:site_name", content: "Pandu Catering" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f38d4be-75a6-4b50-88b3-b3d2d5a86603/id-preview-0cf1c1d1--c9e8672b-2af6-4a72-872b-cfb240981814.lovable.app-1782115346618.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f38d4be-75a6-4b50-88b3-b3d2d5a86603/id-preview-0cf1c1d1--c9e8672b-2af6-4a72-872b-cfb240981814.lovable.app-1782115346618.png" },
    ];
    if (gscToken) meta.push({ name: "google-site-verification", content: gscToken });
    return {
    meta,
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: faviconType, href: favicon },
      { rel: "apple-touch-icon", href: logo },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Pandu Catering",
        url: "https://www.panducatering.in",
        logo: logo.startsWith("http") ? logo : `https://www.panducatering.in${logo}`,
        sameAs: [
          "https://www.instagram.com/pandu_catering",
          "https://www.facebook.com/pandu.catering",
        ],
      }),
    }],
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});


function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Analytics />
      <Outlet />
      <CookieConsent />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
