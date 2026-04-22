import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadDoc, listDocs } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

export const dynamic = "force-dynamic";

export default async function PublicKnowledgePage({
  params,
}: {
  params: Promise<{ token: string; slug: string }>;
}) {
  const { token, slug } = await params;

  // validate UUID + token exists (cheap anon RPC round-trip)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    notFound();
  }
  const supabase = await createClient();
  const { data: guest } = await supabase.rpc("fetch_podcast_invite", { p_token: token });
  if (!guest) notFound();

  const doc = loadDoc(slug);
  if (!doc) notFound();

  const allDocs = listDocs();

  return (
    <main className="relative min-h-screen py-8 px-4 md:px-6">
      <AnimatedBackground />
      <div className="mx-auto max-w-3xl space-y-4 relative z-10">
        <Link
          href={`/podcast/invito/${token}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Torna al tuo invito
        </Link>

        <div className="liquid-glass rounded-2xl p-6">
          <KnowledgeRenderer body={doc.body} />
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Altre sezioni di approfondimento
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {allDocs
              .filter((d) => d.slug !== slug)
              .map((d) => (
                <Link
                  key={d.slug}
                  href={`/podcast/invito/${token}/k/${d.slug}`}
                  className="block rounded-lg px-3 py-2 hover:bg-white/5 text-sm"
                >
                  {d.title}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
