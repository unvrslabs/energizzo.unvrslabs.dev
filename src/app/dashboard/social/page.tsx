import { SocialClient } from "@/components/dashboard/social/social-client";
import {
  listRecentDelibereForPicker,
  listSocialPosts,
} from "@/actions/social-posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Social editor · Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function SocialPage() {
  const [posts, delibere] = await Promise.all([
    listSocialPosts({ limit: 200 }),
    listRecentDelibereForPicker(40),
  ]);

  return <SocialClient initialPosts={posts} initialDelibere={delibere} />;
}
