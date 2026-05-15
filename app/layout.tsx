import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "600", "700"],
  style: ["normal", "italic"],
  variable: "--serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flames-game.vercel.app"),
  title: "FLAMES — Relationship Destiny",
  description: "Discover your relationship destiny with the classic FLAMES game. Modern aesthetic, smooth animations, and instant results.",
  openGraph: {
    title: "FLAMES — Relationship Destiny",
    description: "Discover your relationship destiny with the classic FLAMES game.",
    type: "website",
    url: "https://flames-game.vercel.app", // Placeholder
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FLAMES Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FLAMES — Relationship Destiny",
    description: "Discover your relationship destiny.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
