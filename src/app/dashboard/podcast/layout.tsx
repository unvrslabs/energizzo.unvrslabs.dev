import { PodcastSubNav } from "@/components/podcast/podcast-sub-nav";

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <PodcastSubNav />
      {children}
    </div>
  );
}
