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
    title: "FLYVIXX - Strategic Gaming Platform | Lock Funds, Earn Daily Rewards",
    description: "Experience strategic gaming with FLYVIXX. Lock your funds for 30 days to earn daily flight power and play the Aviator game risk-free. Build your portfolio, level up, and maximize your earnings with our innovative gaming ecosystem.",
    keywords: "FLYVIXX, aviator game, strategic gaming, portfolio gaming, daily rewards, lock funds earn, risk-free gaming, multiplayer casino, online gaming platform, investment gaming",
    authors: [{ name: "FLYVIXX Team" }],
    creator: "FLYVIXX",
    publisher: "FLYVIXX",
    formatDetection: {
        telephone: false,
    },
    metadataBase: new URL('https://flyvixx.com'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "FLYVIXX - Strategic Gaming Platform | Lock Funds, Earn Daily Rewards",
        description: "Lock funds for 30 days, earn daily flight power, and play Aviator game risk-free. Build your portfolio and maximize earnings with FLYVIXX's innovative gaming ecosystem.",
        url: 'https://flyvixx.com',
        siteName: 'FLYVIXX',
        images: [
            {
                url: '/hero-section-image.png',
                width: 1200,
                height: 630,
                alt: 'FLYVIXX Gaming Platform',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "FLYVIXX - Strategic Gaming Platform",
        description: "Lock funds for 30 days, earn daily flight power, and play Aviator game risk-free.",
        images: ['/hero-section-image.png'],
        creator: '@flyvixx',
    },
    robots: {
        index: false, // Only index home page
        follow: false,
        nocache: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'none',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'odHXpgLcszLDBY-jXXXvGwzS_oiQ29bVuk-2Bh4LNVg',
    },
    category: 'gaming',
    classification: 'Online Gaming Platform',
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
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "FLYVIXX",
        "description": "Strategic gaming platform where users lock funds for 30 days to earn daily flight power and play the Aviator game risk-free",
        "url": "https://flyvixx.com",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "creator": {
            "@type": "Organization",
            "name": "FLYVIXX Team"
        },
        "featureList": [
            "Portfolio-based gaming",
            "Daily flight power rewards",
            "Risk-free Aviator gameplay",
            "Referral network system",
            "Real-time multiplayer gaming"
        ],
        "screenshot": "https://flyvixx.com/hero-section-image.png"
    };

    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
                {/* HubSpot chat styles - hide by default, show when triggered */}
                <style>
                    {`
                        #hubspot-messages-iframe-container.widget-closed,
                        #hubspot-messages-iframe-container:not(.widget-open) {
                            display: none !important;
                        }
                        /* Hide the default launcher button */
                        #hs-chat-launcher {
                            display: none !important;
                        }
                        /* Ensure chat appears above modals when opened */
                        #hubspot-messages-iframe-container.widget-open {
                            z-index: 9999 !important;
                        }
                    `}
                </style>
            </head>
            <body>
                <Providers>
                    <ClientLayout>{children}</ClientLayout>
                </Providers>
            </body>
        </html>
    );
}
