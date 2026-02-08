'use client';

import { useState, useEffect } from "react";
import HomeHeader from "@/components/home-header";
import BalanceArea from "@/components/balance-area";
import BannerSlider from "@/components/banner-slider";
import LearnSection from "@/components/learn-section";
import ReferralSection from "@/components/referral-section";
import PortfolioSection from "@/components/portfolio-section";
import { useAuth } from "@/components/login-modal";

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [isClient, setIsClient] = useState(false);

    // Prevent hydration mismatch by only showing authenticated content after client-side mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // During SSR and initial render, show unauthenticated state
    const showAuthenticated = isClient && isAuthenticated;

    return (
        <main className="mx-4 md:mx-16 lg:mx-24 xl:mx-32 pb-24">
            <HomeHeader isLoggedIn={showAuthenticated} />
            <BalanceArea isLoggedIn={showAuthenticated} />
            <LearnSection />
            {!showAuthenticated && <BannerSlider />}
            {showAuthenticated && <ReferralSection isLoggedIn={showAuthenticated} />}
            {showAuthenticated && <PortfolioSection isLoggedIn={showAuthenticated} />}
        </main>
    );
}
