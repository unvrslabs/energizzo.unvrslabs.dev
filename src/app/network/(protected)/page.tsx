import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Area riservata — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default function NetworkHomePage() {
  redirect("/network/delibere");
}
