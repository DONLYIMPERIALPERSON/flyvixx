import HomeHeader from "@/components/home-header";
import BalanceArea from "@/components/balance-area";
import LearnSection from "@/components/learn-section";
import ReferralSection from "@/components/referral-section";
import PortfolioSection from "@/components/portfolio-section";

export default function Home() {
    return (
        <main className="mx-4 md:mx-16 lg:mx-24 xl:mx-32">
            <HomeHeader />
            <BalanceArea />
            <LearnSection />
            <ReferralSection />
            <PortfolioSection />
        </main>
    );
}
