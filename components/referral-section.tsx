'use client';

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useSession } from "@descope/react-sdk";
import ReferralModal from "./referral-modal";

interface ReferralSectionProps {
    isLoggedIn: boolean;
}

interface ReferralData {
    totalReferrals: number;
    activeReferrals: number;
    level: number;
}

export default function ReferralSection({ isLoggedIn }: ReferralSectionProps) {
    const { sessionToken } = useSession();
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch referral data when logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchReferralData();
        }
    }, [isLoggedIn]);

    const fetchReferralData = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                console.error('API URL not configured');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/referral/info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setReferralData({
                        totalReferrals: data.referral.totalReferrals,
                        activeReferrals: data.referral.activeReferrals,
                        level: data.referral.level
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch referral data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return null;
    }

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
                    <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? '...' : (referralData?.totalReferrals || 0)}
                    </p>
                </div>
            </div>

            <ReferralModal
                isOpen={showReferralModal}
                onClose={() => setShowReferralModal(false)}
            />
        </section>
    );
}
