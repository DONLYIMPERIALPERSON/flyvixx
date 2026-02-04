'use client';

import { useState } from "react";
import { Plane } from "lucide-react";
import PortfolioModal from "./portfolio-modal";

interface PortfolioSectionProps {
    isLoggedIn: boolean;
}

export default function PortfolioSection({ isLoggedIn }: PortfolioSectionProps) {
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);

    return (
        <section className="mx-2 md:mx-12 lg:mx-20 xl:mx-28 py-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">PORTFOLIO</h2>
            </div>
            <div
                className="bg-[#DCEFEE] border border-gray-200 rounded-lg p-4 shadow-lg flex items-center justify-between cursor-pointer hover:bg-[#DCEFEE]/80 transition-colors"
                onClick={() => setShowPortfolioModal(true)}
            >
                <div className="flex items-center space-x-4">
                    <Plane size={24} className="text-gray-600" />
                    <div className="flex flex-col">
                        <span className="text-base font-semibold text-[#004B49]">Aircraft-1234567890</span>
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600">Locked:</span>
                            <span className="font-bold text-[#004B49]">$120</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 text-[#004B49] text-xs px-2 py-1 rounded">
                    levels 4
                </div>
            </div>

            <PortfolioModal
                isOpen={showPortfolioModal}
                onClose={() => setShowPortfolioModal(false)}
            />
        </section>
    );
}
