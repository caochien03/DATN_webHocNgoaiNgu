import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LearningLanguageProvider } from "@/components/LearningLanguageProvider";
import { AppShell } from "@/components/ui-kit/AppShell";
import { InAppPushNotificationBanner } from "@/components/ui-kit/InAppPushNotificationBanner";
import { APP } from "@/components/ui-kit/brand";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans-custom",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono-custom",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["600", "700", "800"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
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
      className={`${beVietnamPro.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <LearningLanguageProvider>
            <AppShell>{children}</AppShell>
            <InAppPushNotificationBanner />
          </LearningLanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
