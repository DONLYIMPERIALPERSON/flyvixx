import { Metadata } from "next";

export const metadata: Metadata = {
    title: "FLYVIXX - Strategic Gaming Platform | Lock Funds, Earn Daily Rewards",
    description: "Experience strategic gaming with FLYVIXX. Lock your funds for 30 days to earn daily flight power and play the Aviator game risk-free. Build your portfolio, level up, and maximize your earnings with our innovative gaming ecosystem.",
    keywords: "FLYVIXX, aviator game, strategic gaming, portfolio gaming, daily rewards, lock funds earn, risk-free gaming, multiplayer casino, online gaming platform, investment gaming",
    robots: {
        index: true, // Allow indexing only for home page
        follow: false,
        googleBot: {
            index: true,
            follow: false,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}