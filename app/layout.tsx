import { Geist, Urbanist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Metadata } from "next";
import LenisScroll from "@/components/lenis";

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
                <Navbar />
                <LenisScroll />
                {children}
                <Footer />
            </body>
        </html>
    );
}
