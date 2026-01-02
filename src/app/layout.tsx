import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI Chat Assistant",
    description: "Modern AI Chat System with file uploads and conversation history",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
