import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestDrawer } from "@/components/podcast/guest-drawer";
import type {
  PodcastGuest,
  PodcastQuestion,
  PodcastGuestQuestion,
  PodcastSessionNotes,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("podcast_guests")
    .select(`*, lead:leads(ragione_sociale, piva, email, telefoni, provincia)`)
    .eq("id", id)
    .single();

  if (!guest) notFound();

  const { data: gq } = await supabase
    .from("podcast_guest_questions")
    .select(`*, question:podcast_questions(*)`)
    .eq("guest_id", id)
    .order("order_idx");

  const { data: allQuestions } = await supabase
    .from("podcast_questions")
    .select("*")
    .eq("archived", false)
    .order("theme")
    .order("order_idx");

  const { data: notes } = await supabase
    .from("podcast_session_notes")
    .select("*")
    .eq("guest_id", id)
    .maybeSingle();

  return (
    <GuestDrawer
      guest={guest as PodcastGuest}
      guestQuestions={(gq ?? []) as PodcastGuestQuestion[]}
      allQuestions={(allQuestions ?? []) as PodcastQuestion[]}
      notes={(notes ?? null) as PodcastSessionNotes | null}
    />
  );
}
