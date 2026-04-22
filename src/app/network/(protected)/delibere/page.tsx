import { DelibereList } from "@/components/network-delibere/delibere-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Delibere ARERA — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default function DelibereArera() {
  return <DelibereList />;
}
