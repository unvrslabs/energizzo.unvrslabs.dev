import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  recipientName?: string;
  companyName: string;
  surveyUrl: string;
  senderName?: string;
  senderRole?: string;
  customMessage?: string;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  logoUrl?: string;
};

const DEFAULT_LOGO = "https://leads.energizzo.it/logo-energizzo.png";

export default function SurveyInviteEmail({
  recipientName,
  companyName,
  surveyUrl,
  senderName = "Emanuele Maccari",
  senderRole = "Founder, Energizzo",
  customMessage,
  videoUrl,
  videoThumbnailUrl,
  logoUrl = DEFAULT_LOGO,
}: Props) {
  const greeting = recipientName ? `Ciao ${recipientName},` : `Ciao team ${companyName},`;

  return (
    <Html lang="it">
      <Head />
      <Preview>Invito a partecipare allo Stato del Reseller Energia Italia 2026</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: "#0a1420",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', sans-serif",
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "24px 16px 40px",
            }}
          >
            {/* Logo + brand */}
            <Section style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <Img
                src={logoUrl}
                alt="Energizzo"
                width="72"
                height="72"
                style={{
                  display: "block",
                  margin: "0 auto",
                  borderRadius: "18px",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
                }}
              />
              <Text
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  marginTop: "12px",
                  fontWeight: 600,
                }}
              >
                Piattaforma AI · Reseller Energia
              </Text>
            </Section>

            {/* Main card */}
            <Section
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "24px",
                padding: "32px 28px",
                marginTop: "16px",
              }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "1px solid rgba(16,185,129,0.4)",
                  background: "rgba(16,185,129,0.1)",
                  marginBottom: "20px",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#10b981",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  📊 Report settore 2026
                </Text>
              </div>

              <Heading
                as="h1"
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#f8fafc",
                  lineHeight: 1.2,
                  margin: "0 0 16px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                Stato del Reseller Energia
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Italia 2026
                </span>
              </Heading>

              <Text
                style={{
                  color: "#cbd5e1",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  margin: "0 0 16px 0",
                }}
              >
                {greeting}
              </Text>

              <Text
                style={{
                  color: "#cbd5e1",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  margin: "0 0 20px 0",
                }}
              >
                {customMessage ||
                  `Stiamo realizzando la prima analisi definitiva del settore reseller energia in Italia: costi operativi, margini, switching rate, impatto dell'AI sul back-office. I dati arrivano direttamente dagli operatori come ${companyName}.`}
              </Text>

              {/* Video (optional) */}
              {videoUrl && videoThumbnailUrl && (
                <Section style={{ margin: "24px 0" }}>
                  <Link href={videoUrl} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Img
                        src={videoThumbnailUrl}
                        alt="Guarda il video introduttivo"
                        width="540"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          background: "rgba(16,185,129,0.9)",
                          boxShadow: "0 0 30px rgba(16,185,129,0.6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: "24px",
                            margin: 0,
                            lineHeight: 1,
                          }}
                        >
                          ▶
                        </Text>
                      </div>
                    </div>
                  </Link>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "12px",
                      marginTop: "8px",
                    }}
                  >
                    🎬 Guarda il video · 60 secondi
                  </Text>
                </Section>
              )}

              {/* Benefits */}
              <Section style={{ margin: "24px 0" }}>
                {[
                  { icon: "📖", text: "Ricevi il report completo gratis, in anteprima" },
                  { icon: "📊", text: "Benchmark aggregato e anonimo vs gli altri reseller" },
                  { icon: "⏱", text: "5 minuti del tuo tempo · domande secche" },
                  { icon: "🤫", text: "Risposte 100% anonime nel report pubblico" },
                ].map((it) => (
                  <Text
                    key={it.text}
                    style={{
                      color: "#cbd5e1",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      margin: "0 0 8px 0",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>{it.icon}</span>
                    {it.text}
                  </Text>
                ))}
              </Section>

              {/* CTA Button */}
              <Section style={{ textAlign: "center", margin: "32px 0 16px" }}>
                <Button
                  href={surveyUrl}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #0d9668)",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "16px 36px",
                    borderRadius: "999px",
                    textDecoration: "none",
                    display: "inline-block",
                    boxShadow: "0 8px 28px rgba(16,185,129,0.45)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Partecipa alla survey →
                </Button>
              </Section>

              <Text
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "11px",
                  margin: "16px 0 0 0",
                }}
              >
                Oppure copia e incolla questo link:
                <br />
                <Link
                  href={surveyUrl}
                  style={{
                    color: "#10b981",
                    fontSize: "11px",
                    wordBreak: "break-all",
                  }}
                >
                  {surveyUrl}
                </Link>
              </Text>
            </Section>

            {/* Signature */}
            <Section style={{ padding: "24px 8px 0" }}>
              <Text
                style={{
                  color: "#cbd5e1",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  margin: "0 0 4px 0",
                }}
              >
                Grazie per il tuo tempo.
              </Text>
              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: "14px",
                  fontWeight: 600,
                  margin: "16px 0 2px 0",
                }}
              >
                {senderName}
              </Text>
              <Text
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {senderRole}
              </Text>
            </Section>

            <Hr
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                margin: "32px 0 16px",
              }}
            />

            {/* Footer */}
            <Section style={{ textAlign: "center", padding: "0 8px" }}>
              <Text style={{ fontSize: "11px", color: "#64748b", margin: "0 0 8px 0" }}>
                Energizzo · Piattaforma AI per reseller energia ·{" "}
                <Link href="https://energizzo.it" style={{ color: "#10b981" }}>
                  energizzo.it
                </Link>
              </Text>
              <Text style={{ fontSize: "11px", color: "#475569", margin: 0 }}>
                Ricevi questa email perché la tua azienda ({companyName}) è nel registro ARERA
                degli operatori autorizzati. Se non vuoi più ricevere comunicazioni,{" "}
                <Link
                  href={`${surveyUrl}?unsubscribe=1`}
                  style={{ color: "#94a3b8", textDecoration: "underline" }}
                >
                  clicca qui
                </Link>
                .
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
