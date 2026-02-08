'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAdminAuth = () => {
            const adminAuthenticated = localStorage.getItem('adminAuthenticated');
            const adminToken = localStorage.getItem('adminToken');

            if (!adminAuthenticated || !adminToken) {
                router.push('/admin/login');
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAdminAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-[#004B49] animate-pulse" />
                    </div>
                    <p className="text-white text-lg">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}