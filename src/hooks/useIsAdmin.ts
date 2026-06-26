import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Resolves to true when the signed-in user is on the admin allowlist
 * (or holds the legacy "admin" role). Implemented as a single SECURITY DEFINER
 * RPC so admin emails never leave the database.
 */
export function useIsAdmin() {
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      // is_admin() (no args) reads auth.uid() + auth.jwt() email server-side
      // and returns boolean — never exposes the allowlist rows.
      const { data, error } = await supabase.rpc("is_admin");
      if (error) {
        console.error("[useIsAdmin] rpc failed", error);
        return false;
      }
      return !!data;
    },
  });
}
