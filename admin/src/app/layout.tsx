import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
                className="antialiased bg-gray-50"
            >
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
