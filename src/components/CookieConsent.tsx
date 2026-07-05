import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const KEY = "pandu_cookie_consent_v1";

export type ConsentValue = "granted" | "denied";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(v: ConsentValue) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v);
  window.dispatchEvent(new CustomEvent("pandu:consent", { detail: v }));
}

/** Emits a change event whenever consent flips. Component-level hook. */
export function useConsent(): ConsentValue | null {
  const [v, setV] = useState<ConsentValue | null>(null);
  useEffect(() => {
    setV(getConsent());
    const onChange = (e: Event) => setV((e as CustomEvent).detail as ConsentValue);
    window.addEventListener("pandu:consent", onChange);
    return () => window.removeEventListener("pandu:consent", onChange);
  }, []);
  return v;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once, and never inside the Lovable editor preview iframe.
    if (typeof window === "undefined") return;
    if (window.location.hostname.includes("lovable.app") && window.self !== window.top) return;
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (v: ConsentValue) => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border bg-card p-4 shadow-warm md:inset-x-auto md:right-4 md:bottom-4 md:max-w-md"
    >
      <p className="text-sm text-foreground">
        We use cookies for essential site functions and — with your permission — Google Analytics to understand how visitors use our site.{" "}
        <Link to="/privacy" className="underline underline-offset-2">
          Learn more
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => choose("denied")}>
          Decline
        </Button>
        <Button size="sm" onClick={() => choose("granted")}>
          Accept analytics
        </Button>
      </div>
    </div>
  );
}
