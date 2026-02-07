'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './login-modal';
import LoginModal from './login-modal';

interface LoginGuardProps {
    children: ReactNode;
}

export default function LoginGuard({ children }: LoginGuardProps) {
    const { isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();

    const handleGoHome = () => {
        router.push('/');
    };

    if (!isAuthenticated) {
        return (
            <>
                <div className="min-h-screen bg-gradient-to-br from-[#004B49] to-[#00695C] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
                        <div className="text-red-500 text-6xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Authentication Required
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Please sign in to access this page
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="w-full bg-[#004B49] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#003d3a] transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={handleGoHome}
                                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>

                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLogin={() => setShowLoginModal(false)}
                />
            </>
        );
    }

    return <>{children}</>;
}
