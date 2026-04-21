import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadEpisode, listEpisodes } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listEpisodes().map((ep) => ({ slug: ep.slug }));
}

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ep = loadEpisode(slug);
  if (!ep) notFound();
  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/podcast/episodi"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Episodi
      </Link>
      <div className="liquid-glass rounded-2xl p-6">
        <KnowledgeRenderer body={ep.body} />
      </div>
    </div>
  );
}
