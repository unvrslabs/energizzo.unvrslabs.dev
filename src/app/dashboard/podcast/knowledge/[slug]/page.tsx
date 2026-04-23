import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadDoc, listDocs } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Knowledge doc · Admin v2" };

export function generateStaticParams() {
  return listDocs().map((d) => ({ slug: d.slug }));
}

export default async function KnowledgeDocV2({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/dashboard/podcast/knowledge" className="v2-btn v2-btn--ghost w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> Torna a Knowledge
      </Link>
      <div className="v2-card p-6 md:p-8">
        <KnowledgeRenderer body={doc.body} />
      </div>
    </div>
  );
}
