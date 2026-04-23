import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadEpisode, listEpisodes } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Episodio · Admin v2" };

export function generateStaticParams() {
  return listEpisodes().map((ep) => ({ slug: ep.slug }));
}

export default async function EpisodeDetailV2({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ep = loadEpisode(slug);
  if (!ep) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard-v2/podcast/episodi"
        className="v2-btn v2-btn--ghost w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tutti gli episodi
      </Link>
      <div className="v2-card p-6 md:p-8">
        <KnowledgeRenderer body={ep.body} />
      </div>
    </div>
  );
}
