"use client";

import { SectionTitle } from "@/components/section-title";
import { faqs } from "@/data/faqs";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

export const FaqSection = () => {
    const [showMore, setShowMore] = useState(false);
    return (
        <div className="mt-30 grid grid-cols-1 md:grid-cols-2 border-y md:divide-x divide-[#ffd700] border-[#ffd700]">
            <div className="p-6 md:p-18">
                <SectionTitle
                    title="Frequently Asked Questions"
                    description="Find answers to common questions about FLYVIXX platform mechanics, levels, referrals, and safety."
                    leftAlign
                />
            </div>
            <div>
                <h3 className="text-lg uppercase font-medium p-6 border-b border-[#ffd700]">
                    “General”
                </h3>
                {faqs.slice(0, showMore ? faqs.length : 5).map((faq, index) => (
                    <details key={index} open={index === 0} className='flex flex-col border-[#ffd700] border-b group last:border-b-0'>
                        <summary className='flex cursor-pointer items-start justify-between gap-4 py-5 px-4 font-medium select-none'>
                            {faq.question}
                            <MinusIcon className='size-5 shrink-0 text-gray-500 hidden group-open:block' />
                            <PlusIcon className='size-5 shrink-0 text-gray-500 group-open:hidden' />
                        </summary>
                        <p className='pb-5 px-4 pr-10 text-sm/6 text-gray-500'>
                            {faq.answer}
                        </p>
                    </details>
                ))}
                {faqs.length > 5 && (
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="w-full py-4 px-4 text-center text-[#ffd700] hover:bg-[#ffd700]/10 transition"
                    >
                        {showMore ? 'Show Less' : 'See More'}
                    </button>
                )}
            </div>
        </div>
    );
};