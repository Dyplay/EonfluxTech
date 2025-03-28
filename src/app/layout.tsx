import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { PathTracker } from "./components/PathTracker";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://eonfluxtech.com'),
  title: "Eonflux Technologies",
  description: "Innovative solutions for a connected world",
  openGraph: {
    title: 'Eonflux Technologies',
    description: 'Innovative solutions for a connected world',
    url: 'https://eonfluxtech.com',
    siteName: 'Eonflux Technologies',
    images: [
      {
        url: '/Creating universal and simple software that empowers developers and users alike. (1).png',
        width: 1200,
        height: 630,
        alt: 'Eonflux Technologies'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PathTracker />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
