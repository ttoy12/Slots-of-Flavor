import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Slots of Flavor",
  description: "Random restuarant selector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen`}>
        <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#e0e0e0' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
