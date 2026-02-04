'use client';

import HomeHeader from "@/components/home-header";
import BalanceArea from "@/components/balance-area";
import BannerSlider from "@/components/banner-slider";
import LearnSection from "@/components/learn-section";
import ReferralSection from "@/components/referral-section";
import PortfolioSection from "@/components/portfolio-section";
import { useLogin } from "@/components/login-context";

export default function Home() {
    const { isLoggedIn, setIsLoggedIn } = useLogin();

    return (
        <main className="mx-4 md:mx-16 lg:mx-24 xl:mx-32 pb-24">
            <HomeHeader isLoggedIn={isLoggedIn} />
            <BalanceArea isLoggedIn={isLoggedIn} />
            <LearnSection />
            {!isLoggedIn && <BannerSlider />}
            {isLoggedIn && <ReferralSection isLoggedIn={isLoggedIn} />}
            {isLoggedIn && <PortfolioSection isLoggedIn={isLoggedIn} />}
            {/* Debug button to simulate login */}
            {!isLoggedIn && (
                <div className="fixed bottom-20 right-4 z-40">
                    <button
                        onClick={() => setIsLoggedIn(true)}
                        className="bg-[#FFD700] text-[#004B49] px-3 py-1.5 rounded-md text-sm font-medium shadow-md hover:bg-[#FFC107]"
                    >
                        Login
                    </button>
                </div>
            )}
        </main>
    );
}
