import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/lib/AuthContext";
import { SocketProvider } from "@/src/lib/SocketContext";

export const metadata: Metadata = {
    title: "DevCollab | Find Your Match",
    description: "Build something amazing together. Find your perfect co-founder or collaborator on DevCollab.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Condiment&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-background text-cream overflow-x-hidden">
                <AuthProvider>
                    <SocketProvider>
                        {children}
                    </SocketProvider>
                </AuthProvider>
            </body>
        </html>
    );
}