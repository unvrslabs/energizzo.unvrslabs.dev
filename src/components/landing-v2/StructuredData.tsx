const SITE_URL = "https://ildispaccio.energy";

const FAQS = [
  {
    q: "Cos'è Il Dispaccio?",
    a: "Il primo network editoriale e operativo dedicato ai reseller energia italiani. Non è un software, non è un'associazione: è un hub di contenuti curati (delibere ARERA, tariffe, podcast) + un report indipendente annuale + una community privata per CEO e COO del settore.",
  },
  {
    q: "Quanto costa l'accesso a Il Dispaccio?",
    a: "L'accesso al network Il Dispaccio è gratuito, ora e per sempre. I costi operativi sono coperti da Energizzo, sponsor ufficiale. In cambio si partecipa al survey annuale che alimenta il report di settore.",
  },
  {
    q: "Come si entra nel network Il Dispaccio?",
    a: "Si compila il form con ragione sociale, P.IVA, referente e WhatsApp. Se il profilo rispetta i requisiti si riceve un invito editoriale con numero progressivo N/100 e un survey di 23 domande. Completato il survey si attiva l'accesso all'area riservata con OTP via WhatsApp.",
  },
  {
    q: "Cosa include l'area riservata de Il Dispaccio?",
    a: "Home con ticker PUN/PSV/TTF live, archivio delibere ARERA con riassunti AI in bullet operativi, scadenze regolatorie, preview del price engine (beta Q2 2026) e archivio podcast con trascrizioni riservate.",
  },
  {
    q: "Cosa include il report privato di Il Dispaccio?",
    a: "Il report privato della singola azienda contiene il posizionamento su costi operativi, switching rate, margine medio, adozione AI, esposizione morosità e compliance ARERA, confrontato in anonimato con i peer della stessa fascia dimensionale.",
  },
  {
    q: "I dati aziendali condivisi con Il Dispaccio sono al sicuro?",
    a: "Sì. Tutte le risposte sono aggregate: nessun dato individuale viene pubblicato o associato al nome dell'azienda. Solo il benchmark di fascia viene condiviso, e solo con i partecipanti.",
  },
  {
    q: "Chi gestisce Il Dispaccio?",
    a: "Il Dispaccio è una piattaforma indipendente sponsorizzata da Energizzo. La sponsorizzazione copre i costi operativi: redazione, contenuti e community restano indipendenti dai vendor di settore.",
  },
];

export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Il Dispaccio",
    alternateName: "Il Dispaccio Network",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Il primo network italiano dei reseller energia. Delibere ARERA decifrate, benchmark tariffario live, podcast Il Reseller, report indipendente annuale.",
    foundingDate: "2026",
    areaServed: { "@type": "Country", name: "Italy" },
    sameAs: [
      "https://www.linkedin.com/company/113185607/",
      "https://x.com/il_dispaccio",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "membri@ildispaccio.energy",
      availableLanguage: ["Italian"],
    },
    publisher: {
      "@type": "Organization",
      name: "UNVRS Labs",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Il Dispaccio",
    url: SITE_URL,
    inLanguage: "it-IT",
    description:
      "Network editoriale e area riservata operativa per i reseller energia italiani.",
    publisher: {
      "@type": "Organization",
      name: "Il Dispaccio",
      logo: `${SITE_URL}/logo.png`,
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
