import { Geist, Urbanist } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "@/components/client-layout";

const geist = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
});

const urbanist = Urbanist({
    variable: "--font-urbanist",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mapple - PrebuiltUI",
    description: "Prebuilt UI is a free and open-source UI Kit for startups.",
    keywords: "prebuilt ui, ui kit, startup, free ui kit, open source ui kit",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
