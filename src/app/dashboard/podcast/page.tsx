import { createClient } from "@/lib/supabase/server";
import { PodcastHome } from "@/components/podcast/podcast-home";
import type { PodcastGuest, PodcastHotTopic, PodcastGuestQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PodcastHomePage() {
  const supabase = await createClient();

  const [{ data: guestsAll }, { data: topTopics }, { data: nextGuestRows }] = await Promise.all([
    supabase.from("podcast_guests").select("status"),
    supabase
      .from("podcast_hot_topics")
      .select("*")
      .eq("active", true)
      .eq("intensity", "bollente")
      .limit(3),
    supabase
      .from("podcast_guests")
      .select(`*, lead:leads(ragione_sociale, piva)`)
      .eq("status", "confirmed")
      .not("recorded_at", "is", null)
      .order("recorded_at", { ascending: true })
      .limit(1),
  ]);

  const next = (nextGuestRows?.[0] ?? null) as PodcastGuest | null;
  let nextQuestions: PodcastGuestQuestion[] = [];
  if (next) {
    const { data: gq } = await supabase
      .from("podcast_guest_questions")
      .select(`*, question:podcast_questions(*)`)
      .eq("guest_id", next.id)
      .order("order_idx")
      .limit(10);
    nextQuestions = (gq ?? []) as PodcastGuestQuestion[];
  }

  type GuestStatusRow = { status: string };
  const rows = (guestsAll ?? []) as GuestStatusRow[];
  const stats = {
    total: rows.length,
    invited: rows.filter((g) => g.status === "invited").length,
    confirmed: rows.filter((g) => g.status === "confirmed").length,
    published: rows.filter((g) => g.status === "published").length,
  };

  return (
    <PodcastHome
      stats={stats}
      nextGuest={next}
      nextQuestions={nextQuestions}
      hotTopics={(topTopics ?? []) as PodcastHotTopic[]}
    />
  );
}
