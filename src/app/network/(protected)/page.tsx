import { Building2, FileText, Gavel, Users } from "lucide-react";
import { getNetworkMember } from "@/lib/network/session";
import { maskPhone } from "@/lib/network/phone";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Area riservata — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function NetworkHomePage() {
  const member = await getNetworkMember();
  if (!member) return null;

  return (
    <div className="space-y-10">
      <section>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Network member
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Benvenuto, {member.referente}.
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Stiamo costruendo la tua area riservata con report dedicati, delibere
          ARERA commentate e contenuti della community. Nel frattempo, qui
          trovi i tuoi dati.
        </p>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white/[0.02] to-transparent backdrop-blur-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Profilo azienda
          </h2>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Row label="Ragione sociale" value={member.ragione_sociale} />
          <Row label="P.IVA" value={member.piva} />
          <Row label="Referente" value={member.referente} />
          <Row label="WhatsApp" value={maskPhone(member.phone)} />
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">In arrivo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SoonCard
            icon={<FileText className="w-5 h-5" />}
            title="Report riservato"
            description="Analisi mensile del mercato energetico italiano dedicata al network."
          />
          <SoonCard
            icon={<Gavel className="w-5 h-5" />}
            title="Delibere ARERA"
            description="Commenti operativi sulle delibere che impattano il tuo lavoro."
          />
          <SoonCard
            icon={<Users className="w-5 h-5" />}
            title="Community"
            description="Spazio di confronto tra reseller ammessi al network."
          />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function SoonCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          In arrivo
        </span>
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
