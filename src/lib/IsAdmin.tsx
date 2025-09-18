import { supabase } from "@/lib/supabaseClient";

export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error checking admin:", error);
    return false;
  }

  return !!data?.is_admin;
}
