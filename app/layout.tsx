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
        <div className="flex items-center justify-center h-screen bg-black">
          <div className="mx-auto w-2/3 h-2/3 flex items-center justify-center">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
