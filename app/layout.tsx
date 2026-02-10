import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedding Photo Vault",
  description: "Share a moment. Reveal the gallery after the celebration.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Wedding Photo Vault",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Wedding Photo Vault",
    description: "Share a moment. Reveal the gallery after the celebration.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Photo Vault",
    description: "Share a moment. Reveal the gallery after the celebration.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDFCF8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-cream text-espresso`}
      >
        {children}
      </body>
    </html>
  );
}
