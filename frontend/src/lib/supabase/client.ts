import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project.supabase.co") &&
    supabaseAnonKey !== "your-anon-key-here"
);

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  if (!isSupabaseConfigured) {
    return null;
  }

  if (!browserClient) {
    try {
      browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    } catch (err) {
      console.warn("Failed to initialize createBrowserClient, falling back to createClient:", err);
      browserClient = createClient(supabaseUrl!, supabaseAnonKey!);
    }
  }

  return browserClient;
}
