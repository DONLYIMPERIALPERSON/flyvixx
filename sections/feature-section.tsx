import { SectionTitle } from "@/components/section-title";
import { features } from "@/data/features";

export const FeatureSection = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="py-24">
                <SectionTitle
                    title="The FLYVIXX Advantage"
                    description="A strategic approach to gaming. Explore a secure ecosystem designed for daily growth and risk-free engagement."
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-[#ffd700]/20 backdrop-blur-sm rounded-lg hover:bg-[#ffd700]/30 flex flex-col items-start justify-center p-10"
                    >
                        <div className="p-2 rounded-lg bg-secondary">
                            <feature.icon className="size-7" />
                        </div>
                        <h3 className="text-lg font-medium mt-6 text-white">{feature.title}</h3>
                        <p className="text-sm text-white mt-3">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};




