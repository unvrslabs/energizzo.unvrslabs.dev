import { createClient } from "@/lib/supabase/server";
import { HotTopicsBoard } from "@/components/podcast/hot-topics-board";
import type { PodcastHotTopic } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TemiCaldiPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_hot_topics")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return <HotTopicsBoard topics={(data ?? []) as PodcastHotTopic[]} />;
}
