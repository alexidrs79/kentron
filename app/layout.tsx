import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  Inter,
  Noto_Sans_Armenian,
} from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { LocalRecordsProvider } from "@/components/local-records";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-armenian",
  weight: ["400", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Կենտրոն — What’s happening in Yerevan",
  description: "Planned events and live posts across Yerevan, seen on a map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${ibmPlexMono.variable} ${notoArmenian.variable}`}
    >
      <body>
        <LocalRecordsProvider>
          <AppShell>{children}</AppShell>
        </LocalRecordsProvider>
      </body>
    </html>
  );
}
