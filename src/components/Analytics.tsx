import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Injects Google Analytics 4 only when a Measurement ID is set in Site Settings
 * (admin/settings → "Google Analytics 4 Measurement ID"). Skipped in the editor
 * preview iframe so dev traffic doesn't pollute stats.
 */
export function Analytics() {
  const { data: settings } = useSettings();
  const id = settings?.ga_measurement_id?.trim();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!id || !/^G-[A-Z0-9]{6,}$/i.test(id)) return;
    // Skip in the Lovable editor preview iframe.
    if (window.location.hostname.includes("lovable.app") && window.self !== window.top) return;
    if (document.getElementById("ga4-src")) return;

    const s = document.createElement("script");
    s.async = true;
    s.id = "ga4-src";
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer!.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }, [id]);

  return null;
}

/** Fire a GA4 event if analytics is loaded. Safe to call anywhere. */
export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try { window.gtag("event", name, params ?? {}); } catch { /* noop */ }
}
