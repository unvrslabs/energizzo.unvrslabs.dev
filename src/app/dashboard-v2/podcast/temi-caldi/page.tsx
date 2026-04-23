import { createClient } from "@/lib/supabase/server";
import { HotTopicsBoard } from "@/components/podcast/hot-topics-board";
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
  return <HotTopicsBoard topics={(data ?? []) as PodcastHotTopic[]} />;
}
