import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import flameGif from "@/assets/flame.gif";

export const metadata: Metadata = {
  title: "CodeBazar - Buy & Sell Code Projects",
  description: "Marketplace for premium coding projects and templates",
  icons: {
    icon: '/fevicon.png',
    shortcut: '/fevicon.png',
    apple: '/fevicon.png',
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
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-fuchsia-600 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-center text-center gap-2">
                <Image
                  src={flameGif}
                  alt="Offer"
                  width={20}
                  height={20}
                  className="h-5 w-5 sm:h-[20px] sm:w-[20px]"
                  priority
                />
                <span className="text-xs sm:text-sm font-semibold">
                  Up to <span className="font-bold">10% OFF</span> — Apply
                </span>
                <span className="text-xs sm:text-sm font-bold bg-white text-indigo-700 rounded-md p-0.5">
                  CODE10
                </span>
                <span className="text-xs sm:text-sm font-semibold">coupon code</span>
              </div>
            </div>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
