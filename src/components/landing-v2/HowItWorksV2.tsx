import { ClipboardList, Mail, KeyRound } from "lucide-react";

const STEPS = [
  {
    num: "I.",
    Icon: ClipboardList,
    title: "Richiedi",
    desc: "Compila il form con ragione sociale, P.IVA, referente e WhatsApp. Ogni candidatura viene letta da un umano.",
  },
  {
    num: "II.",
    Icon: Mail,
    title: "Invito editoriale",
    desc: "Se il profilo rispetta i requisiti, ricevi un invito editoriale con il tuo numero N/100 e il survey di 23 domande da compilare in 2 minuti.",
  },
  {
    num: "III.",
    Icon: KeyRound,
    title: "Accesso alla piattaforma",
    desc: "Al completamento del survey attivi l'account: OTP via WhatsApp, entri nell'area riservata e hai accesso a delibere AI, podcast e benchmark.",
  },
];

export function HowItWorksV2() {
  return (
    <section id="come-entri" className="lv2-section">
      <div className="lv2-container">
        <div className="max-w-3xl mb-12">
          <div className="lv2-kicker mb-5">// Come si entra</div>
          <h2 className="lv2-h2 mb-4">
            In tre passi <em>sei dentro</em>.
          </h2>
          <p className="lv2-lede">
            L&apos;accesso è su invito. Ogni candidatura viene valutata
            individualmente per garantire la qualità del network.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="lv2-step">
              <div className="flex items-start justify-between">
                <span className="lv2-step-num">{s.num}</span>
                <span
                  className="grid place-items-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: "1px solid hsl(var(--lv2-border-strong))",
                    background: "hsl(var(--lv2-bg-elev))",
                    color: "hsl(var(--lv2-accent))",
                  }}
                >
                  <s.Icon className="w-4.5 h-4.5" />
                </span>
              </div>
              <h3 className="lv2-step-title mt-2">{s.title}</h3>
              <p className="lv2-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
