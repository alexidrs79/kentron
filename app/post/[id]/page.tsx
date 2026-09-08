import type { Metadata } from "next";
import { PostDetail } from "./post-detail";
import { getServerLocale } from "@/lib/i18n-server";

// Live posts are anonymous and expire after four hours, so they are given a
// stable generic title and kept out of the index rather than described.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: locale === "hy" ? "Ուղիղ գրառում — Կենտրոն" : "Live post — Kentron",
    description:
      locale === "hy"
        ? "Կարճատև քաղաքային գրառում Երևանից։ Այն չորս ժամ անց հեռանում է և չի արխիվացվում։"
        : "A short-lived field note from somewhere in Yerevan. Live posts leave Kentron after four hours and are not archived.",
    robots: { index: false, follow: true },
  };
}

export default function PostPage() {
  return <PostDetail />;
}
