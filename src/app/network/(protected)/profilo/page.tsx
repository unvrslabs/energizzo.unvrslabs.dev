import { redirect } from "next/navigation";
import { Building2, Phone, User } from "lucide-react";
import { getNetworkMember } from "@/lib/network/session";
import { ChangePhoneForm } from "@/components/network-v2/change-phone-form";
import { LogoutButton } from "@/components/network-v2/logout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profilo · Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function ProfiloPage() {
  const member = await getNetworkMember();
  if (!member) redirect("/network/login");

  const fields: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    action?: React.ReactNode;
    hint?: string;
  }> = [
    {
      label: "Azienda",
      value: member.ragione_sociale,
      icon: Building2,
      hint: "P.IVA " + member.piva,
    },
    {
      label: "Referente",
      value: member.referente,
      icon: User,
    },
    {
      label: "Numero WhatsApp",
      value: member.phone,
      icon: Phone,
      action: <ChangePhoneForm currentPhone={member.phone} />,
      hint: "Usato per ricevere il codice OTP di accesso e le comunicazioni del network.",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header className="pb-1">
        <p
          className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Account
        </p>
        <h1
          className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
          style={{ color: "hsl(var(--v2-text))" }}
        >
          Profilo
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "hsl(var(--v2-text-dim))" }}
        >
          Dati raccolti dal questionario di onboarding. Il numero è modificabile con
          verifica OTP via WhatsApp.
        </p>
      </header>

      <section className="v2-card" style={{ padding: 0 }}>
        {fields.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.label}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                gap: 24,
                padding: "20px 24px",
                borderBottom:
                  i < fields.length - 1
                    ? "1px solid hsl(var(--v2-border))"
                    : "none",
                alignItems: "start",
              }}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: "hsl(var(--v2-text-mute))" }}
                />
                <span
                  className="v2-mono"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "hsl(var(--v2-text-mute))",
                  }}
                >
                  {f.label}
                </span>
              </div>
              <div className="flex flex-col gap-3 min-w-0">
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "hsl(var(--v2-text))",
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                  }}
                >
                  {f.value}
                </div>
                {f.hint && (
                  <div
                    className="v2-mono"
                    style={{
                      fontSize: 11,
                      color: "hsl(var(--v2-text-mute))",
                    }}
                  >
                    {f.hint}
                  </div>
                )}
                {f.action}
              </div>
            </div>
          );
        })}
      </section>

      <section
        className="v2-card"
        style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "hsl(var(--v2-text))",
              marginBottom: 4,
            }}
          >
            Sessione
          </div>
          <p
            style={{
              fontSize: 12.5,
              color: "hsl(var(--v2-text-dim))",
              lineHeight: 1.5,
            }}
          >
            Esci dal network per terminare questa sessione su questo dispositivo.
            Per rientrare ti servirà un nuovo codice OTP.
          </p>
        </div>
        <div>
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
