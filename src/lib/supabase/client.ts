"use client";

import { createBrowserClient } from "@supabase/ssr";

// Il browser client usa l'anon key e ha RLS attiva → niente type generic
// per non trascinare problemi di inference su overload .rpc() sui client public.
// Lato server usiamo già Database types strict via createClient/createAdminClient.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
