import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MercatoPage() {
  // Default all'elettrico (PUN + ENTSO-E attivi, ricchi di dati).
  redirect("/network/mercato/elettrico");
}
