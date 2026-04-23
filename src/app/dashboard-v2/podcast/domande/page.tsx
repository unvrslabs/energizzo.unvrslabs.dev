import { createClient } from "@/lib/supabase/server";
import { QuestionBank } from "@/components/podcast/question-bank";
import type { PodcastQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Domande · Admin v2" };

export default async function DomandeV2Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_questions")
    .select("*")
    .eq("archived", false)
    .order("theme")
    .order("order_idx");
  return <QuestionBank questions={(data ?? []) as PodcastQuestion[]} />;
}
