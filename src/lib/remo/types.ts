export type RemoCategory = "luce" | "gas";

export type RemoSectionType = "intro" | "table" | "text";

export interface RemoColumn {
  key: string;
  label: string;
  unit?: string;
  align?: "left" | "right" | "center";
  highlight?: boolean;
}

export type RemoRow = Record<string, string | number | null>;

export interface RemoSection {
  id: string;
  order_index: number;
  slug: string;
  group_slug: string;
  group_label: string;
  type: RemoSectionType;
  title: string;
  subtitle: string | null;
  description: string | null;
  columns: RemoColumn[] | null;
  rows: RemoRow[] | null;
  footnote: string | null;
}

export interface RemoReport {
  id: string;
  month: string;
  category: RemoCategory;
  pdf_url: string | null;
  published_at: string | null;
  sections: RemoSection[];
}

export interface RemoReportMeta {
  month: string;
  category: RemoCategory;
}
