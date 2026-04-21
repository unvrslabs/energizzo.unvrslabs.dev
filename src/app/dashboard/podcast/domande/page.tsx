import { createClient } from "@/lib/supabase/server";
import { QuestionBank } from "@/components/podcast/question-bank";
import type { PodcastQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DomandePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_questions")
    .select("*")
    .eq("archived", false)
    .order("theme")
    .order("order_idx");
  return <QuestionBank questions={(data ?? []) as PodcastQuestion[]} />;
}
