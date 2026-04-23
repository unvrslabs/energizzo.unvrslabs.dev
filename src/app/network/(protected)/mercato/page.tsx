import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MercatoPage() {
  // Primo tab (elettrico) è placeholder finché ENTSO-E non attivo.
  // Landiamo su gas che è live e informativo da subito.
  redirect("/network/mercato/gas");
}
