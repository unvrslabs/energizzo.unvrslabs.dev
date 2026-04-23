import Link from "next/link";
import { FileText } from "lucide-react";
import { listDocs } from "@/lib/podcast-content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Knowledge · Admin v2" };

export default function KnowledgeV2Index() {
  const docs = listDocs();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Knowledge base regolatoria
        </p>
        <p className="text-sm mt-2" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Sintesi operative dei testi integrati ARERA, timeline fine tutela, dati mercato.
        </p>
      </div>
      {docs.length === 0 ? (
        <div className="v2-card p-6 text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Nessun documento ancora. Carica file markdown in <code>content/podcast/</code>.
        </div>
      ) : (
        <div className="v2-card overflow-hidden">
          <ul>
            {docs.map((d) => (
              <li key={d.slug} style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}>
                <Link
                  href={`/dashboard/podcast/knowledge/${d.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <FileText className="w-4 h-4" style={{ color: "hsl(var(--v2-accent))" }} />
                  <span className="text-[13.5px] font-medium" style={{ color: "hsl(var(--v2-text))" }}>
                    {d.title}
                  </span>
                  <span className="v2-mono text-[10px] ml-auto" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {d.slug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
