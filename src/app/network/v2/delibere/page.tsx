import { DelibereV2Client } from "@/components/network-v2/delibere-v2-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Delibere ARERA · Terminal",
};

export default async function DelibereV2Page({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Compliance · Delibere ARERA
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            Archivio delibere
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Decifrate per reseller · 4 punti chiave per atto · allegati pronti da scaricare
          </p>
        </div>
      </header>
      <DelibereV2Client initialCode={sp.open} />
    </div>
  );
}
