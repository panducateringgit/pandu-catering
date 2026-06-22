import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChefHat, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login — Pandu Catering" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" as any });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return toast.error(error.message);
    // Try to claim admin role if no admin exists yet
    await supabase.rpc("claim_first_admin");
    toast.success("Welcome back!");
    navigate({ to: "/admin" as any });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin + "/auth" },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    // If session was created (auto-confirm on), claim admin and route
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.rpc("claim_first_admin");
      toast.success("Account created!");
      navigate({ to: "/admin" as any });
    } else {
      toast.success("Check your email to confirm your account.");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-gradient-hero p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-turmeric text-turmeric-foreground"><ChefHat className="h-5 w-5" /></div>
          <span className="font-display text-xl font-bold">Pandu Catering</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">Admin Dashboard</h2>
          <p className="mt-4 max-w-md text-cream/85">Manage bookings, slots, menu, gallery and site content — all in one place.</p>
          <ul className="mt-8 space-y-2 text-sm text-cream/80">
            <li>✓ Add & manage available slots</li>
            <li>✓ View customer bookings and update status</li>
            <li>✓ Edit menu items and gallery</li>
            <li>✓ Update homepage and contact details</li>
          </ul>
        </div>
        <div className="text-xs text-cream/70">© Pandu Catering, Hyderabad</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md border-border/60 shadow-soft">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Admin only</span>
            </div>
            <h1 className="font-display text-3xl font-bold">Sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">First-time setup? Sign up to create your admin account.</p>

            <Tabs defaultValue="signin" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={signIn} className="mt-4 space-y-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={signUp} className="mt-4 space-y-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating..." : "Create admin account"}</Button>
                  <p className="text-xs text-muted-foreground">The first account to sign up becomes the admin automatically.</p>
                </form>
              </TabsContent>
            </Tabs>

            <Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-primary">← Back to website</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
