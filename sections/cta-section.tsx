import { SectionTitle } from "@/components/section-title";

export const CtaSection = () => {
    const steps = [
        {
            number: 1,
            title: "Secure Your Position",
            subtitle: "Deposit and Lock.",
            description: "Select the amount you wish to put to work. By initiating a 30-day secure lock, you establish your foundation and instantly activate your daily \"Flight Power.\" Your funds remain protected and are returned in full at the end of the cycle.",
        },
        {
            number: 2,
            title: "Grow Your Level",
            subtitle: "Build Your Network.",
            description: "Starting at Level 1, you get one flight per day. Invite others to the ecosystem to unlock higher tiers. For every 5 active referrals, you level up, gaining more daily flight attempts and significantly increasing your earning potential.",
        },
        {
            number: 3,
            title: "Capture Daily Rewards",
            subtitle: "Fly and Cash Out.",
            description: "Log in every 24 hours to use your daily 1% betting power in the Aviator game. Use our guaranteed safety thresholds or your own strategy to multiply your rewards. All winnings are yours to keep, while your capital remains untouched.",
        },
    ];

    return (
        <div className="mt-30 border-t border-[#ffd700] pb-30">
            <div className="py-24">
                <SectionTitle
                    title="Three Steps to Take Flight"
                    description="Your journey from secure positioning to daily rewards is simple and streamlined."
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-[#ffd700]/20 backdrop-blur-sm rounded-lg hover:bg-[#ffd700]/30 p-10 text-center"
                    >
                        <div className="w-12 h-12 bg-[#ffd700] text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                            {step.number}
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
                        <p className="text-[#ffd700] font-medium mb-3">{step.subtitle}</p>
                        <p className="text-sm text-white">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
