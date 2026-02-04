'use client';

import { useState } from "react";
import { Users } from "lucide-react";
import ReferralModal from "./referral-modal";

interface ReferralSectionProps {
    isLoggedIn: boolean;
}

export default function ReferralSection({ isLoggedIn }: ReferralSectionProps) {
    const [showReferralModal, setShowReferralModal] = useState(false);

    return (
        <section className="mx-2 md:mx-12 lg:mx-20 xl:mx-28 py-4">
            <h2 className="text-lg font-bold text-left mb-4">Referral</h2>
            <div
                className="bg-[#DCEFEE] border border-gray-200 rounded-lg p-4 shadow-lg flex items-center justify-between cursor-pointer hover:bg-[#DCEFEE]/80 transition-colors"
                onClick={() => setShowReferralModal(true)}
            >
                <Users size={32} className="text-gray-600" />
                <div className="text-right">
                    <p className="text-sm text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
            </div>

            <ReferralModal
                isOpen={showReferralModal}
                onClose={() => setShowReferralModal(false)}
            />
        </section>
    );
}
