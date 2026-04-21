import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadDoc, listDocs } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listDocs().map((d) => ({ slug: d.slug }));
}

export default async function KnowledgeDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) notFound();
  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/podcast/knowledge"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Knowledge
      </Link>
      <div className="liquid-glass rounded-2xl p-6">
        <KnowledgeRenderer body={doc.body} />
      </div>
    </div>
  );
}
