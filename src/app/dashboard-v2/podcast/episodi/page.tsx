import { createClient } from "@/lib/supabase/server";
import {
  listEpisodes,
  type EpisodePreview,
  type EpisodeProductionStatus,
} from "@/lib/podcast-content";
import { EpisodesBoard } from "@/components/podcast/episodes-board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Episodi · Admin v2" };

export default async function EpisodiV2Index() {
  const episodes = listEpisodes();
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from("podcast_guests")
    .select("selected_episode_slug, status")
    .not("selected_episode_slug", "is", null);

  const rows = (guests ?? []) as { selected_episode_slug: string; status: string }[];

  const byEp = new Map<string, { count: number; hasRecorded: boolean; hasPublished: boolean }>();
  for (const r of rows) {
    const prev = byEp.get(r.selected_episode_slug) ?? {
      count: 0,
      hasRecorded: false,
      hasPublished: false,
    };
    prev.count += 1;
    if (r.status === "recorded") prev.hasRecorded = true;
    if (r.status === "published") prev.hasPublished = true;
    byEp.set(r.selected_episode_slug, prev);
  }

  const enriched: EpisodePreview[] = episodes.map((ep) => {
    const agg = byEp.get(ep.slug);
    let status: EpisodeProductionStatus = "da_registrare";
    if (agg?.hasPublished) status = "pubblicata";
    else if (agg?.hasRecorded) status = "registrata";
    return {
      ...ep,
      production_status: status,
      guests_count: agg?.count ?? 0,
    };
  });

  return <EpisodesBoard episodes={enriched} basePath="/dashboard-v2/podcast/episodi" />;
}
