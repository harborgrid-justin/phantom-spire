import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutComponent from "./LayoutComponent";
import ThemeRegistry from '../theme/ThemeRegistry';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phantom ML Studio",
  description: "Web-based ML Studio for Phantom Spire - Visual machine learning interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          <LayoutComponent>{children}</LayoutComponent>
        </ThemeRegistry>
      </body>
    </html>
  );
}