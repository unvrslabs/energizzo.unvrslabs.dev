import { createClient } from "@/lib/supabase/server";
import { HotTopicsBoardV2 } from "@/components/admin-v2/podcast/hot-topics-board-v2";
import type { PodcastHotTopic } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Temi caldi · Admin v2" };

export default async function TemiCaldiV2Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_hot_topics")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return <HotTopicsBoardV2 topics={(data ?? []) as PodcastHotTopic[]} />;
}
