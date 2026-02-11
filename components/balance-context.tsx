'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from '@descope/react-sdk';

interface Balance {
    cash: number;
    portfolio: number;
    lockedFunds: number;
    lockedUntil: Date | null;
    total: number;
}

interface BalanceContextType {
    balance: Balance;
    isLoading: boolean;
    refreshBalance: () => Promise<void>;
    updateBalance: (newBalance: Balance) => void;
    setupSocketListener: (onBalanceUpdate: (data: { cashBalance: number; portfolioBalance: number }) => void) => (() => void);
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
    const { sessionToken } = useSession();
    const [balance, setBalance] = useState<Balance>({
        cash: 0,
        portfolio: 0,
        lockedFunds: 0,
        lockedUntil: null,
        total: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchBalance = async () => {
        if (!sessionToken) return;

        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                console.error('API URL not configured');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/transactions/balance`, {
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
                    setBalance(data.balance);
                }
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshBalance = async () => {
        await fetchBalance();
    };

    const updateBalance = (newBalance: Balance) => {
        setBalance(newBalance);
    };

    const setupSocketListener = useCallback((onBalanceUpdate: (data: { cashBalance: number; portfolioBalance: number }) => void) => {
        const handleBalanceUpdate = (data: { cashBalance: number; portfolioBalance: number }) => {
            console.log('💰 Balance context received socket update:', data);
            // Update the balance state with the new values
            setBalance(prevBalance => ({
                ...prevBalance,
                cash: data.cashBalance,
                portfolio: data.portfolioBalance,
                total: data.cashBalance + data.portfolioBalance
            }));
            // Also call the provided callback if needed
            onBalanceUpdate(data);
        };

        // Return cleanup function
        return () => {
            // Cleanup if needed
        };
    }, []);

    // Fetch balance when session token is available
    useEffect(() => {
        if (sessionToken) {
            fetchBalance();
        }
    }, [sessionToken]);

    return (
        <BalanceContext.Provider value={{
            balance,
            isLoading,
            refreshBalance,
            updateBalance,
            setupSocketListener
        }}>
            {children}
        </BalanceContext.Provider>
    );
}

export function useBalance() {
    const context = useContext(BalanceContext);
    if (context === undefined) {
        throw new Error('useBalance must be used within a BalanceProvider');
    }
    return context;
}