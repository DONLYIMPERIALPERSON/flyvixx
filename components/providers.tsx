'use client';

import { AuthProvider } from "@descope/react-sdk";
import { ReferralProvider } from "./referral-context";
import { LoginProvider } from "./login-context";
import { BalanceProvider } from "./balance-context";

interface ProvidersProps {
    children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider projectId={process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID || ""}>
            <LoginProvider>
                <ReferralProvider>
                    <BalanceProvider>
                        {children}
                    </BalanceProvider>
                </ReferralProvider>
            </LoginProvider>
        </AuthProvider>
    );
}
