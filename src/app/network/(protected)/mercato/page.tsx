import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MercatoPage() {
  redirect("/network/mercato/gas");
}
