'use client';

import { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ReferralContextType {
    referralCode: string | null;
    setReferralCode: (code: string | null) => void;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

// 1. Separate component to handle the SearchParams hook safely
function ReferralParamsHandler({ setReferralCode }: { setReferralCode: (code: string | null) => void }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            setReferralCode(refParam);
            localStorage.setItem('pendingReferralCode', refParam);
        } else {
            const storedCode = localStorage.getItem('pendingReferralCode');
            if (storedCode) {
                setReferralCode(storedCode);
            }
        }
    }, [searchParams, setReferralCode]);

    return null; // This component doesn't render anything
}

export function ReferralProvider({ children }: { children: ReactNode }) {
    const [referralCode, setReferralCode] = useState<string | null>(null);

    const updateReferralCode = (code: string | null) => {
        setReferralCode(code);
        if (code) {
            localStorage.setItem('pendingReferralCode', code);
        } else {
            localStorage.removeItem('pendingReferralCode');
        }
    };

    return (
        <ReferralContext.Provider value={{
            referralCode,
            setReferralCode: updateReferralCode
        }}>
            {/* 2. Wrap the Params Handler in Suspense to fix the Build Error */}
            <Suspense fallback={null}>
                <ReferralParamsHandler setReferralCode={setReferralCode} />
            </Suspense>
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
