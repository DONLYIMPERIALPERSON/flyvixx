'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReferralContextType {
    referralCode: string | null;
    setReferralCode: (code: string | null) => void;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function ReferralProvider({ children }: { children: ReactNode }) {
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const searchParams = useSearchParams();

    // Check for referral code in URL parameters on mount
    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            setReferralCode(refParam);
            // Store in localStorage for persistence across page reloads
            localStorage.setItem('pendingReferralCode', refParam);
        } else {
            // Check if there's a stored referral code from previous visit
            const storedCode = localStorage.getItem('pendingReferralCode');
            if (storedCode) {
                setReferralCode(storedCode);
            }
        }
    }, [searchParams]);

    // Clear referral code after successful signup
    const clearReferralCode = () => {
        setReferralCode(null);
        localStorage.removeItem('pendingReferralCode');
    };

    return (
        <ReferralContext.Provider value={{
            referralCode,
            setReferralCode: (code) => {
                setReferralCode(code);
                if (code) {
                    localStorage.setItem('pendingReferralCode', code);
                } else {
                    localStorage.removeItem('pendingReferralCode');
                }
            }
        }}>
            {children}
        </ReferralContext.Provider>
    );
}

export function useReferral() {
    const context = useContext(ReferralContext);
    if (context === undefined) {
        throw new Error('useReferral must be used within a ReferralProvider');
    }
    return context;
}