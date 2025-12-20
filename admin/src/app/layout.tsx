import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CodeBazar Admin",
    description: "Admin Panel for CodeBazar",
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
            <body
                className={`${outfit.className} antialiased bg-gray-50`}
            >
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
