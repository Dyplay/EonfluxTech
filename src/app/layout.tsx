import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/app/components/TranslationProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Eonflux Technologies",
  description: "Innovative solutions for a connected world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <TranslationProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
