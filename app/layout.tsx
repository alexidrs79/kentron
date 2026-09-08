import type { Metadata, Viewport } from "next";
import { Archivo, Noto_Sans_Armenian } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { LocaleProvider } from "@/components/locale-provider";
import { LocalRecordsProvider } from "@/components/local-records";
import { PreferencesProvider } from "@/components/preferences";
import { UserLocationProvider } from "@/components/user-location";
import { getServerLocale } from "@/lib/i18n-server";
import { SavedEventsProvider } from "@/lib/saved-events";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-armenian",
  weight: ["400", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title:
      locale === "hy"
        ? "Կենտրոն — Ինչ է կատարվում Երևանում"
        : "Կենտրոն — What’s happening in Yerevan",
    description:
      locale === "hy"
        ? "Երևանի քարտեզային ուղեցույց՝ հիմա կատարվող ուղիղ գրառումներով և այս շաբաթվա միջոցառումներով։"
        : "A map-first guide to Yerevan. Live posts happening right now and planned events for the week ahead.",
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDE6DA" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${archivo.variable} ${notoArmenian.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var stored=JSON.parse(localStorage.getItem("kentron-preferences")||"null");var theme=stored&&stored.theme;var dark=theme==="dark"||(theme!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=dark?"dark":"light";document.documentElement.style.colorScheme=dark?"dark":"light";if(stored&&stored.reduceMotion)document.documentElement.dataset.reduceMotion="true"}catch(e){var os=matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=os?"dark":"light";document.documentElement.style.colorScheme=os?"dark":"light"}`,
          }}
        />
        <PreferencesProvider>
          <LocaleProvider initialLocale={locale}>
            <UserLocationProvider>
              <LocalRecordsProvider>
                <SavedEventsProvider>
                  <AppShell>{children}</AppShell>
                </SavedEventsProvider>
              </LocalRecordsProvider>
            </UserLocationProvider>
          </LocaleProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
