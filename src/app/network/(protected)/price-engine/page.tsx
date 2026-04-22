import Link from "next/link";
import { Download, FileText } from "lucide-react";
import {
  formatCategoryLabel,
  formatMonthLabel,
  getReport,
  listReportsMeta,
} from "@/lib/remo/queries";
import type { RemoCategory } from "@/lib/remo/types";
import { RemoSelector } from "@/components/network-remo/remo-selector";
import {
  RemoSectionNav,
  type RemoNavItem,
} from "@/components/network-remo/remo-section-nav";
import { RemoIntroCard } from "@/components/network-remo/remo-intro-card";
import { RemoTableCard } from "@/components/network-remo/remo-table-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Price Engine — Il Dispaccio",
  robots: { index: false, follow: false },
};

function resolveCategory(raw: string | undefined): RemoCategory {
  return raw === "gas" ? "gas" : "luce";
}

export default async function PriceEnginePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; month?: string }>;
}) {
  const params = await searchParams;
  const allReports = await listReportsMeta();

  const category = resolveCategory(params.cat);
  const monthsForCategory = allReports
    .filter((r) => r.category === category)
    .map((r) => r.month)
    .sort((a, b) => b.localeCompare(a));

  const month =
    params.month && monthsForCategory.includes(params.month)
      ? params.month
      : monthsForCategory[0];

  if (!month) {
    return (
      <EmptyState
        title="Report non ancora disponibili"
        body="I numeri RE.M.O. compariranno qui non appena verranno pubblicati."
        selector={
          <RemoSelector category={category} month="" reports={allReports} />
        }
      />
    );
  }

  const report = await getReport(month, category);

  if (!report) {
    return (
      <EmptyState
        title="Report non trovato"
        body="Non esiste un report per questa combinazione di categoria e mese."
        selector={
          <RemoSelector category={category} month={month} reports={allReports} />
        }
      />
    );
  }

  const navItems: RemoNavItem[] = dedupeByGroup(
    report.sections.map((s) => ({ slug: s.group_slug, label: s.group_label })),
  );

  const sectionsByGroup = groupSections(report.sections);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="flex items-start md:items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 mb-1">
              RE.M.O. · Retail Energy Market Outlook
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {formatCategoryLabel(category)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatMonthLabel(month)}
            </p>
          </div>
          {report.pdf_url && (
            <a
              href={report.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-foreground/85 hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              PDF originale
            </a>
          )}
        </div>

        <RemoSelector
          category={category}
          month={month}
          reports={allReports}
        />

        <RemoSectionNav items={navItems} />
      </header>

      <div className="space-y-10">
        {navItems.map((group) => {
          const sections = sectionsByGroup[group.slug] ?? [];
          return (
            <section
              key={group.slug}
              id={group.slug}
              className="scroll-mt-24 space-y-4"
            >
              {sections.map((s) =>
                s.type === "intro" ? (
                  <RemoIntroCard
                    key={s.id}
                    section={s}
                    category={category}
                  />
                ) : s.type === "table" ? (
                  <RemoTableCard key={s.id} section={s} />
                ) : (
                  <div
                    key={s.id}
                    className="dispaccio-card rounded-[1.75rem] p-6"
                  >
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    {s.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </section>
          );
        })}
      </div>

      <footer className="pt-4 pb-10 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          Dati elaborati su fonte ARERA, GME, Terna. Valori indicativi, non
          ufficiali.
        </p>
      </footer>
    </div>
  );
}

function dedupeByGroup(items: RemoNavItem[]): RemoNavItem[] {
  const seen = new Set<string>();
  const out: RemoNavItem[] = [];
  for (const it of items) {
    if (seen.has(it.slug)) continue;
    seen.add(it.slug);
    out.push(it);
  }
  return out;
}

function groupSections<T extends { group_slug: string }>(sections: T[]) {
  const map: Record<string, T[]> = {};
  for (const s of sections) {
    map[s.group_slug] = map[s.group_slug] ?? [];
    map[s.group_slug].push(s);
  }
  return map;
}

function EmptyState({
  title,
  body,
  selector,
}: {
  title: string;
  body: string;
  selector: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80 mb-1">
            RE.M.O. · Retail Energy Market Outlook
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Price Engine
          </h1>
        </div>
        {selector}
      </header>
      <div className="dispaccio-card rounded-[1.75rem] p-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{body}</p>
        <div className="mt-5">
          <Link
            href="/network/delibere"
            className="text-xs font-semibold text-primary hover:text-primary/80"
          >
            → Vai alle Delibere
          </Link>
        </div>
      </div>
    </div>
  );
}
