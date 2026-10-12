import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

export const metadata: Metadata = {
  title: "Slots of Flavor",
  description: "Can't decide where to eat? Pull the lever and get a random open restaurant nearby.",
};

export const viewport: Viewport = {
  // Lets the mobile result sheet extend under the notch / home indicator.
  viewportFit: "cover",
  themeColor: "#1d1226",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables go on <html> because Tailwind's theme tokens that read them are defined on :root.
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans">
        <div aria-hidden className="fixed inset-0 -z-10">
          <Image
            src="/possible_background.jpg"
            alt=""
            fill
            sizes="100vw"
            fetchPriority="high"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/60 to-background/95" />
        </div>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
