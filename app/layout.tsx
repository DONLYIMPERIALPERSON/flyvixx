import { Geist, Urbanist } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "@/components/client-layout";
import Providers from "@/components/providers";

const geist = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
});

const urbanist = Urbanist({
    variable: "--font-urbanist",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "FLYVIXX - Aviator Game",
    description: "Play the exciting Aviator game with real-time multiplayer action. Experience casino-style gaming with synchronized gameplay across all devices.",
    keywords: "aviator game, casino game, online gambling, multiplayer game, pwa game",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    themeColor: "#ffd700",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "FLYVIXX",
        startupImage: [
            {
                url: "/apple-touch-icon.png",
                media: "(device-width: 768px) and (device-height: 1024px)",
            },
        ],
    },
    formatDetection: {
        telephone: false,
    },
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
        "apple-mobile-web-app-title": "FLYVIXX",
        "application-name": "FLYVIXX",
        "msapplication-TileColor": "#ffd700",
        "msapplication-config": "/browserconfig.xml",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
            </body>
        </html>
    );
}
