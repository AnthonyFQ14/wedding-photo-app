import type { Metadata, Viewport } from "next";
import {
  Bodoni_Moda,
  Cinzel,
  Cormorant_Garamond,
  Inter,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// High-contrast serif, like "WE'RE" on the invitation
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
});

// Formal script, like "Engaged!" and the couple's names
const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
});

// Engraved small caps, like the date and venue lines
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

// Italic serif, like "Raise a glass to celebrate..."
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const TITLE = "Taylor & Alexander · Engagement Photos";
const DESCRIPTION =
  "Raise a glass and share your photos from Taylor & Alexander's engagement party.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Taylor & Alexander",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0506",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bodoni.variable} ${pinyon.variable} ${cinzel.variable} ${cormorant.variable} antialiased bg-cream text-espresso`}
      >
        {children}
      </body>
    </html>
  );
}
