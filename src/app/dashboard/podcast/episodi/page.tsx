import { listEpisodes } from "@/lib/podcast-content";
import { EpisodesBoard } from "@/components/podcast/episodes-board";

export const dynamic = "force-dynamic";

export default function EpisodiIndex() {
  const episodes = listEpisodes();
  return <EpisodesBoard episodes={episodes} />;
}
