"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  body: string;
  token: string;
};

export function PublicEpisodeRenderer({ body, token }: Props) {
  // Rewrite internal dashboard knowledge links to the public invite-scoped
  // knowledge viewer so the guest doesn't hit the login wall.
  const rewritten = body.replace(
    /\(\/dashboard\/podcast\/knowledge\/([a-z0-9-]+)\)/g,
    `(/podcast/invito/${token}/k/$1)`,
  );

  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-table:text-xs">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{rewritten}</ReactMarkdown>
    </div>
  );
}
