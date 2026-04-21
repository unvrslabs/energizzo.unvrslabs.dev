import Link from "next/link";
import { listDocs } from "@/lib/podcast-content";

export const dynamic = "force-dynamic";

export default function KnowledgeIndex() {
  const docs = listDocs();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl tracking-wide">Knowledge base regolatoria</h1>
      <p className="text-sm text-muted-foreground">
        Sintesi operative dei testi integrati ARERA, timeline fine tutela, dati mercato.
      </p>
      {docs.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-6 text-sm text-muted-foreground">
          Nessun documento ancora. I file markdown si caricano in{" "}
          <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">content/podcast/</code>.
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl p-5 space-y-2">
          {docs.map((d) => (
            <Link
              key={d.slug}
              href={`/dashboard/podcast/knowledge/${d.slug}`}
              className="block rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-semibold">{d.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
