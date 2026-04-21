"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function KnowledgeRenderer({ body }: { body: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-table:text-xs">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
