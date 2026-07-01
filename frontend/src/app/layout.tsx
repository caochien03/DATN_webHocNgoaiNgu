import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LearningLanguageProvider } from "@/components/LearningLanguageProvider";
import { AppShell } from "@/components/ui-kit/AppShell";
import { APP } from "@/components/ui-kit/brand";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP.name} · ${APP.tagline}`,
  description: APP.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <LearningLanguageProvider>
            <AppShell>{children}</AppShell>
          </LearningLanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
