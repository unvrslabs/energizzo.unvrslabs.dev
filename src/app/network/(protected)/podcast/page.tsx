import { PodcastClient } from "@/components/network-v2/podcast-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Podcast · Terminal",
};

export default function PodcastPage() {
  return <PodcastClient />;
}
