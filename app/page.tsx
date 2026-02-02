import { CtaSection } from "@/sections/cta-section";
import { FaqSection } from "@/sections/faq-section";
import { FeatureSection } from "@/sections/feature-section";
import { HeroSection } from "@/sections/hero-section";



export default function Page() {
    return (
        <main className="mx-4 md:mx-16 lg:mx-24 xl:mx-32 border-x border-[#ffd700]">
            <HeroSection />
            <div className="border-t border-[#ffd700]"></div>
            <FeatureSection />
            <FaqSection />
            <CtaSection />
        </main>
    );
}