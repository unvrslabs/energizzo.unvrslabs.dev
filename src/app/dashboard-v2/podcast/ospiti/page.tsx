import { createClient } from "@/lib/supabase/server";
import { GuestsPipeline } from "@/components/podcast/guests-pipeline";
import type { PodcastGuest, Lead } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ospiti · Admin v2" };

export default async function OspitiV2Page() {
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from("podcast_guests")
    .select(`
      *,
      lead:leads(ragione_sociale, piva, email, telefoni, provincia)
    `)
    .order("updated_at", { ascending: false });

  const { data: leads } = await supabase
    .from("leads")
    .select("id, ragione_sociale, piva, provincia, email, telefoni")
    .order("ragione_sociale");

  return (
    <GuestsPipeline
      guests={(guests ?? []) as PodcastGuest[]}
      leads={
        (leads ?? []) as Pick<
          Lead,
          "id" | "ragione_sociale" | "piva" | "provincia" | "email" | "telefoni"
        >[]
      }
      leadBasePath="/dashboard-v2/lead"
    />
  );
}
