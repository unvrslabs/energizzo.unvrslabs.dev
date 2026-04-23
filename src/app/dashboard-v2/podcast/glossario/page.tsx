import { createClient } from "@/lib/supabase/server";
import { GlossaryViewV2 } from "@/components/admin-v2/podcast/glossary-view-v2";
import type { PodcastGlossaryTerm } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Glossario · Admin v2" };

export default async function GlossarioV2Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("podcast_glossary").select("*").order("term");
  return <GlossaryViewV2 terms={(data ?? []) as PodcastGlossaryTerm[]} />;
}
