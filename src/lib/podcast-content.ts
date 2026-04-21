import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "content/podcast");
const EPISODI_DIR = join(DIR, "episodi");

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

export type EpisodeProductionStatus = "da_registrare" | "registrata" | "pubblicata";

export type EpisodePreview = {
  slug: string;
  title: string;
  subtitle: string | null;
  intensity: string | null;
  numero: number | null;
  production_status?: EpisodeProductionStatus;
  guests_count?: number;
};

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    meta[key.trim()] = rest.join(":").trim().replace(/^['"]|['"]$/g, "");
  }
  return { meta, body: match[2] };
}

export function listEpisodes(): EpisodePreview[] {
  if (!existsSync(EPISODI_DIR)) return [];
  return readdirSync(EPISODI_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = readFileSync(join(EPISODI_DIR, f), "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      const titleLine = body.split("\n").find((l) => l.startsWith("# "));
      return {
        slug,
        title: meta.title ?? titleLine?.replace(/^#\s*/, "") ?? slug,
        subtitle: meta.subtitle ?? null,
        intensity: meta.intensity ?? null,
        numero: meta.numero ? Number(meta.numero) : null,
      };
    })
    .sort((a, b) => {
      if (a.numero !== null && b.numero !== null) return a.numero - b.numero;
      return a.slug.localeCompare(b.slug);
    });
}

export function loadEpisode(slug: string): KnowledgeDoc | null {
  const safe = slug.replace(/[^a-z0-9-]/g, "");
  const path = join(EPISODI_DIR, `${safe}.md`);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf-8");
  const { meta, body } = parseFrontmatter(raw);
  const titleLine = body.split("\n").find((l) => l.startsWith("# "));
  return {
    slug: safe,
    title: meta.title ?? titleLine?.replace(/^#\s*/, "") ?? safe,
    body,
  };
}
