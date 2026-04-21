import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "content/podcast");

export type KnowledgeDoc = { slug: string; title: string; body: string };

export function listDocs(): { slug: string; title: string }[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => /^\d{2}-.+\.md$/.test(f) && !f.startsWith("_"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const content = readFileSync(join(DIR, f), "utf-8");
      const titleLine = content.split("\n").find((l) => l.startsWith("# "));
      const title = titleLine?.replace(/^#\s*/, "") ?? slug;
      return { slug, title };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function loadDoc(slug: string): KnowledgeDoc | null {
  const safe = slug.replace(/[^a-z0-9-]/g, "");
  const path = join(DIR, `${safe}.md`);
  if (!existsSync(path)) return null;
  const body = readFileSync(path, "utf-8");
  const titleLine = body.split("\n").find((l) => l.startsWith("# "));
  return { slug: safe, title: titleLine?.replace(/^#\s*/, "") ?? safe, body };
}
