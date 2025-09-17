import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
// import { ClientLayout } from "./components/ClientLayout";
import ThemeRegistry from "../theme/ThemeRegistry";

// const inter = Inter({
//   subsets: ["latin"],
//   display: 'swap',
//   variable: '--font-inter'
// });

export const metadata: Metadata = {
  title: {
    default: "Phantom ML Studio",
    template: "%s | Phantom ML Studio"
  },
  description: "Enterprise-grade machine learning platform with Hugging Face integration, AutoML capabilities, and advanced security features",
  keywords: ["machine learning", "AI", "AutoML", "Hugging Face", "cybersecurity", "threat intelligence"],
  authors: [{ name: "Phantom Spire" }],
  creator: "Phantom Spire",
  publisher: "Phantom Spire",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Phantom ML Studio",
    description: "Enterprise-grade machine learning platform",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeRegistry>
          {/* <ClientLayout> */}
            {children}
          {/* </ClientLayout> */}
        </ThemeRegistry>
      </body>
    </html>
  );
}