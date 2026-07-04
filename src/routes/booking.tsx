import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { PublicLayout } from "@/components/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BRAND, EVENT_TYPE_OPTIONS, SERVICE_OPTIONS, telLink, waLink } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";
import { trackEvent } from "@/components/Analytics";
import { CalendarCheck, MessageCircle, Phone, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book Catering — Pandu Catering Hyderabad" },
      { name: "description", content: "Book your catering in minutes. Pick date, menu type, guests and we'll handle the rest. Or WhatsApp / call us directly." },
      { property: "og:title", content: "Book Catering — Pandu Catering" },
      { property: "og:description", content: "Easy online booking for events in Hyderabad." },
    ],
  }),
  component: BookingPage,
});

const schema = z.object({
  event_type: z.string().min(1, "Required"),
  veg_pref: z.enum(["Veg", "Non-Veg", "Both"]),
  slot_date: z.string().min(1, "Pick a date"),
  slot_time: z.string().min(1, "Pick a slot"),
  with_servers: z.boolean(),
  guest_count: z.number().int().min(1, "Min 1 guest").max(5000),
  customer_name: z.string().trim().min(2, "Enter name").max(100),
  phone: z.string().trim().min(7, "Enter phone").max(20).regex(/^[\d\s+\-()]+$/, "Invalid phone"),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  event_address: z.string().trim().min(5, "Enter address").max(500),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

// crude rate-limit: 3 submissions per 10 min from same browser
const RATE_KEY = "pc_booking_submits";
function rateLimitOk() {
  if (typeof window === "undefined") return true;
  try {
    const now = Date.now();
    const raw = JSON.parse(localStorage.getItem(RATE_KEY) || "[]") as number[];
    const fresh = raw.filter((t) => now - t < 10 * 60_000);
    if (fresh.length >= 3) return false;
    fresh.push(now);
    localStorage.setItem(RATE_KEY, JSON.stringify(fresh));
    return true;
  } catch { return true; }
}

function BookingPage() {
  const qc = useQueryClient();
  const { data: settings } = useSettings();
  const capacity = Number(settings?.kitchen_capacity_per_day || 500);

  const [form, setForm] = useState({
    event_type: "Birthday Party",
    veg_pref: "Veg" as "Veg" | "Non-Veg" | "Both",
    slot_date: "",
    slot_time: "",
    with_servers: false,
    guest_count: 30,
    service_type: "Food Only" as (typeof SERVICE_OPTIONS)[number],
    menu_preferences: "",
    customer_name: "",
    phone: "",
    email: "",
    event_address: "",
    notes: "",
    website: "", // honeypot
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { data: slots } = useQuery({
    queryKey: ["slots_public"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("booking_slots").select("*").gte("slot_date", today).order("slot_date").order("slot_time");
      return data ?? [];
    },
  });

  // Capacity per selected date
  const { data: dayLoad } = useQuery({
    queryKey: ["day_load", form.slot_date],
    enabled: !!form.slot_date,
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings")
        .select("guest_count,status")
        .eq("slot_date", form.slot_date)
        .neq("status", "Cancelled");
      return (data ?? []).reduce((s: number, b: any) => s + (b.guest_count || 0), 0);
    },
  });

  const dates = Array.from(new Set((slots ?? []).map((s: any) => s.slot_date)));
  const timesForDate = (slots ?? []).filter((s: any) => s.slot_date === form.slot_date);

  const capacityWarning = useMemo(() => {
    if (!form.slot_date) return null;
    const used = dayLoad ?? 0;
    const projected = used + (form.guest_count || 0);
    if (projected > capacity) {
      return `We already have ${used} guests booked on this date (capacity ${capacity}). Adding ${form.guest_count} would exceed it — please pick another date or call us to confirm.`;
    }
    if (projected > capacity * 0.85) {
      return `This date is nearly full (${used}/${capacity} guests booked). Submit your request and we'll confirm quickly.`;
    }
    return null;
  }, [form.slot_date, form.guest_count, dayLoad, capacity]);

  const submit = useMutation({
    mutationFn: async () => {
      // honeypot
      if (form.website && form.website.length > 0) {
        throw new Error("Spam detected.");
      }
      if (!rateLimitOk()) {
        throw new Error("Too many submissions. Please wait a few minutes or call us.");
      }
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Invalid form");
      }
      // Hard block over capacity
      const used = dayLoad ?? 0;
      if (used + parsed.data.guest_count > capacity) {
        throw new Error(`Capacity exceeded for ${parsed.data.slot_date}. Try another date or call ${BRAND.phoneDisplay}.`);
      }
      const noteSuffix = `\n[Service: ${form.service_type}]${form.menu_preferences ? `\n[Menu prefs: ${form.menu_preferences}]` : ""}`;
      const newId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const payload = {
        id: newId,
        ...parsed.data,
        email: parsed.data.email || null,
        notes: (parsed.data.notes || "") + noteSuffix,
      };
      // Insert with return=minimal — anon has no SELECT policy on bookings,
      // so INSERT ... RETURNING would fail RLS. We supply the id client-side.
      const { error } = await supabase.from("bookings").insert(payload);
      if (error) throw error;
      return { id: newId };
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      setShowSuccess(true);
      qc.invalidateQueries({ queryKey: ["slots_public"] });
      qc.invalidateQueries({ queryKey: ["day_load"] });
      trackEvent("booking_submitted", {
        event_type: form.event_type,
        guest_count: form.guest_count,
        service_type: form.service_type,
        veg_pref: form.veg_pref,
      });
      toast.success("Booking request received!");
    },
    onError: (e: any) => toast.error(e.message || "Could not submit booking"),
  });

  const set = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const waMessage = `Hi Pandu Catering!%0A%0AI'd like to book catering:%0A• Event: ${form.event_type}%0A• Service: ${form.service_type}%0A• Menu: ${form.veg_pref}%0A• Date: ${form.slot_date} (${form.slot_time})%0A• Guests: ${form.guest_count}%0A• Servers: ${form.with_servers ? "Yes" : "No"}%0A• Name: ${form.customer_name}%0A• Phone: ${form.phone}%0A• Address: ${form.event_address}%0A${form.menu_preferences ? `• Menu prefs: ${form.menu_preferences}%0A` : ""}${form.notes ? `• Notes: ${form.notes}` : ""}`;

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-cream md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-turmeric">Book your event</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">Tell us about your event</h1>
          <p className="mt-4 max-w-2xl text-cream/90">We'll confirm availability within 30 minutes. Prefer talking? Call or WhatsApp us — we love that too.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-turmeric text-turmeric-foreground hover:bg-turmeric/90"><a href={waLink("Hi Pandu, I want to book catering.")}><MessageCircle className="h-4 w-4" /> WhatsApp</a></Button>
            <Button asChild variant="outline" className="border-cream/40 bg-white/10 text-cream hover:bg-white/20"><a href={telLink}><Phone className="h-4 w-4" /> {BRAND.phoneDisplay}</a></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <Card className="border-border/60 shadow-soft">
          <CardContent className="p-6 md:p-10">
            <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="grid gap-6">
              {/* Honeypot — hidden from real users */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <Label htmlFor="website">Website (leave blank)</Label>
                <Input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website")(e.target.value)} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Event type</Label>
                  <Select value={form.event_type} onValueChange={set("event_type")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Menu preference</Label>
                  <RadioGroup className="flex gap-3" value={form.veg_pref} onValueChange={set("veg_pref")}>
                    {(["Veg","Non-Veg","Both"] as const).map(v => (
                      <Label key={v} htmlFor={`veg-${v}`} className={`flex-1 cursor-pointer rounded-md border px-4 py-3 text-center transition ${form.veg_pref === v ? "border-primary bg-primary/5 text-primary" : ""}`}>
                        <RadioGroupItem id={`veg-${v}`} value={v} className="sr-only" />
                        {v}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Select value={form.slot_date} onValueChange={(v) => setForm((f) => ({ ...f, slot_date: v, slot_time: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select a date" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {dates.map((d) => <SelectItem key={d} value={d}>{new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time slot</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.slot_date ? timesForDate.length === 0 ? <p className="text-sm text-muted-foreground">No slots configured.</p> :
                      timesForDate.map((s: any) => (
                        <button
                          key={s.id}
                          type="button"
                          disabled={!s.available}
                          onClick={() => set("slot_time")(s.slot_time)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${form.slot_time === s.slot_time ? "border-primary bg-primary text-primary-foreground" : ""} ${!s.available ? "cursor-not-allowed opacity-40 line-through" : "hover:bg-secondary"}`}
                        >
                          {s.slot_time} {!s.available && "(Unavailable)"}
                        </button>
                      )) : <p className="text-sm text-muted-foreground">Pick a date first.</p>}
                  </div>
                </div>
              </div>

              {capacityWarning && (
                <div className="flex items-start gap-3 rounded-lg border border-turmeric/40 bg-turmeric/10 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-turmeric" />
                  <div>
                    <div className="font-semibold">Heads up</div>
                    <p className="mt-1 text-muted-foreground">{capacityWarning}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Number of guests</Label>
                  <Input type="number" min={1} max={5000} value={form.guest_count} onChange={(e) => set("guest_count")(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Required services</Label>
                  <Select value={form.service_type} onValueChange={(v) => setForm((f) => ({ ...f, service_type: v as any, with_servers: v !== "Food Only" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2"><Label>Your name</Label><Input value={form.customer_name} onChange={(e) => set("customer_name")(e.target.value)} required maxLength={100} /></div>
                <div className="space-y-2"><Label>Mobile number</Label><Input type="tel" value={form.phone} onChange={(e) => set("phone")(e.target.value)} required maxLength={20} /></div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2"><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} maxLength={255} /></div>
                <div className="space-y-2"><Label>Event location / address</Label><Input value={form.event_address} onChange={(e) => set("event_address")(e.target.value)} required maxLength={500} /></div>
              </div>

              <div className="space-y-2"><Label>Menu preferences (dishes, cuisines)</Label><Input value={form.menu_preferences} onChange={(e) => set("menu_preferences")(e.target.value)} placeholder="e.g. Hyderabadi biryani, Andhra meals, paneer dishes" maxLength={300} /></div>

              <div className="space-y-2"><Label>Additional notes</Label><Textarea rows={4} value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Allergies, theme, setup, decor coordination..." maxLength={1000} /></div>

              {/* reCAPTCHA placeholder — wire with VITE_RECAPTCHA_SITE_KEY when ready */}
              <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-leaf" />
                <span>Protected by spam filter & rate limiting. Add reCAPTCHA site key later for extra protection.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" size="lg" disabled={submit.isPending}>
                  <CalendarCheck className="h-4 w-4" /> {submit.isPending ? "Sending..." : "Submit Booking Request"}
                </Button>
                <span className="text-sm text-muted-foreground">or</span>
                <Button asChild type="button" size="lg" variant="outline">
                  <a href={`https://wa.me/${BRAND.whatsappNumber}?text=${waMessage}`} target="_blank" rel="noopener"><MessageCircle className="h-4 w-4" /> Send via WhatsApp</a>
                </Button>
                <Button asChild type="button" size="lg" variant="ghost">
                  <a href={telLink}><Phone className="h-4 w-4" /> Call Now</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-leaf/10"><CheckCircle2 className="h-8 w-8 text-leaf" /></div>
            <DialogTitle className="text-center font-display text-2xl">Booking received!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you{form.customer_name ? `, ${form.customer_name}` : ""}. We'll confirm your booking within 30 minutes.
              {bookingId && <><br /><Badge variant="outline" className="mt-3 font-mono">#{bookingId.slice(0, 8)}</Badge></>}
            </DialogDescription>
          </DialogHeader>
          <p className="text-center text-sm text-muted-foreground">
            For quick confirmation, also reach us via WhatsApp or phone.
          </p>
          <DialogFooter className="!flex-col gap-2 sm:!flex-col">
            <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90">
              <a href={`https://wa.me/${BRAND.whatsappNumber}?text=${waMessage}`} target="_blank" rel="noopener"><MessageCircle className="h-4 w-4" /> Send details on WhatsApp</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={telLink}><Phone className="h-4 w-4" /> Call {BRAND.phoneDisplay}</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
