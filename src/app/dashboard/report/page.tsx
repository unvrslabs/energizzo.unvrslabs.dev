import { permanentRedirect } from "next/navigation";

export default function ReportLegacyRedirect() {
  permanentRedirect("/dashboard/network/statistiche");
}
