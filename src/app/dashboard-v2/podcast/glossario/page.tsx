import { createClient } from "@/lib/supabase/server";
import { GlossaryView } from "@/components/podcast/glossary-view";
import type { PodcastGlossaryTerm } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Glossario · Admin v2" };

export default async function GlossarioV2Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("podcast_glossary").select("*").order("term");
  return <GlossaryView terms={(data ?? []) as PodcastGlossaryTerm[]} />;
}
