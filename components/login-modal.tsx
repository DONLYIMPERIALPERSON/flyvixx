'use client';

import React, { useState } from "react";
import { useDescope, useSession, Descope } from "@descope/react-sdk";
import { Mail, Key } from "lucide-react";
import { useReferral } from "./referral-context";

// Custom hook for authentication (real Descope authentication only)
export const useAuth = () => {
    const { isAuthenticated: isDescopeAuthenticated } = useSession();
    const { logout: descopeLogout } = useDescope();

    const logout = async () => {
        try {
            console.log('🚪 Starting logout process...');

            // Clear local storage and session storage
            localStorage.clear();
            sessionStorage.clear();

            // Use the API URL from environment variables
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            // Call backend logout endpoint
            const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                console.log('✅ Backend logout successful');
            } else {
                console.warn('⚠️ Backend logout failed, but continuing with client-side logout');
            }

            // Logout from Descope if authenticated
            if (isDescopeAuthenticated) {
                try {
                    await descopeLogout();
                    console.log('✅ Descope logout successful');
                } catch (descopeError) {
                    console.warn('⚠️ Descope logout failed:', descopeError);
                }
            }

            console.log('✅ Logout process completed, reloading page...');

            // Small delay to ensure state is cleared before reload
            setTimeout(() => {
                // Force page reload with cache busting to clear all state
                const separator = window.location.href.includes('?') ? '&' : '?';
                window.location.href = window.location.href.split('?')[0] + separator + 'logout=' + Date.now();
            }, 200);
        } catch (error) {
            console.error('❌ Logout failed:', error);
            console.log('🔄 Force reloading page after logout error...');
            // Force reload even on error
            window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
        }
    };

    return {
        isAuthenticated: isDescopeAuthenticated,
        logout
    };
};

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
    const sdk = useDescope();
    const { isAuthenticated } = useSession();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [isSdkLoading, setIsSdkLoading] = useState(true);
    const [isSdkReady, setIsSdkReady] = useState(false);

    // Handle SDK loading and readiness
    React.useEffect(() => {
        // Set minimum loading time for smooth UX
        const minLoadingTimer = setTimeout(() => {
            // Only hide loading if SDK is also ready
            if (isSdkReady) {
                setIsSdkLoading(false);
            }
        }, 1500); // Reduced from 2000ms for better UX

        return () => clearTimeout(minLoadingTimer);
    }, [isSdkReady]);

    // Fallback: Force hide loading after maximum time (10 seconds)
    React.useEffect(() => {
        const maxLoadingTimer = setTimeout(() => {
            setIsSdkLoading(false);
        }, 10000); // 10 seconds maximum

        return () => clearTimeout(maxLoadingTimer);
    }, []);

    // Monitor SDK readiness - use onReady callback instead
    const handleSdkReady = () => {
        setIsSdkReady(true);
    };

    // Handle successful authentication
    React.useEffect(() => {
        if (isAuthenticated) {
            onLogin();
            onClose();
        }
    }, [isAuthenticated, onLogin, onClose]);

    const { referralCode, setReferralCode } = useReferral();

    const handleDescopeSuccess = async (e: any) => {
        console.log('✅ Descope success:', e.detail.user);
        console.log('🔑 Session details:', e.detail.session);

        try {
            // Call our auth verification endpoint with referral code if present
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${e.detail.sessionJwt}`,
                },
                body: JSON.stringify({
                    referralCode: referralCode
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Auth verification successful:', data);

                // Clear referral code after successful signup
                if (referralCode) {
                    setReferralCode(null);
                }
            } else {
                console.error('❌ Auth verification failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Auth verification error:', error);
        }

        onLogin();
        onClose();
    };

    const handleDescopeError = (err: any) => {
        console.error('❌ Descope error:', err);
        console.error('Error details:', {
            error: err.error,
            errorDescription: err.errorDescription,
            errorCode: err.errorCode
        });

        // Show more specific error messages
        let errorMessage = 'Authentication failed. Please try again.';

        if (err.errorDescription) {
            errorMessage = err.errorDescription;
        } else if (err.error) {
            errorMessage = `Error: ${err.error}`;
        }

        alert(errorMessage);
    };

    // Add additional event handlers for debugging
    const handleDescopeReady = () => {
        console.log('🔄 Descope flow ready');

        // Check WebAuthn support
        const isWebAuthnSupported = !!(navigator.credentials && navigator.credentials.create);
        console.log('🔐 WebAuthn supported:', isWebAuthnSupported);

        // Check if we're on HTTPS (required for WebAuthn)
        const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        console.log('🔒 HTTPS/Localhost:', isHttps);

        // Check device type
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('📱 Is mobile:', isMobile);

        if (!isWebAuthnSupported) {
            console.warn('⚠️ WebAuthn not supported - passkeys may not work');
        }

        if (!isHttps) {
            console.warn('⚠️ HTTPS required for WebAuthn - passkeys may not work in development');
        }
    };

    const handleDescopeStarted = () => {
        console.log('🚀 Descope flow started');
    };

    const handleDescopeCompleted = (e: any) => {
        console.log('🎯 Descope flow completed:', e.detail);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl p-6 w-full max-w-md min-h-[40vh] transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex mb-6">
                    <button
                        className={`flex-1 py-2 text-center font-semibold ${activeTab === 'login' ? 'text-[#004B49] border-b-2 border-[#004B49]' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-2 text-center font-semibold ${activeTab === 'register' ? 'text-[#004B49] border-b-2 border-[#004B49]' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('register')}
                    >
                        Register
                    </button>
                </div>


                {isSdkLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        {/* Logo/Brand */}
                        <div className="flex flex-col items-center justify-center mb-4 space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="60" height="60" viewBox="0 0 375 374.999991" className="text-[#FFD700]">
                                <defs>
                                    <clipPath id="eee71c9bfb">
                                        <path d="M 37.503906 150 L 342.753906 150 L 342.753906 362.179688 L 37.503906 362.179688 Z M 37.503906 150 " clipRule="nonzero"/>
                                    </clipPath>
                                    <clipPath id="e224594083">
                                        <path d="M 37.503906 80 L 342.753906 80 L 342.753906 296 L 37.503906 296 Z M 37.503906 80 " clipRule="nonzero"/>
                                    </clipPath>
                                    <clipPath id="0a0bc97e8f">
                                        <path d="M 37.503906 12.679688 L 342.753906 12.679688 L 342.753906 228 L 37.503906 228 Z M 37.503906 12.679688 " clipRule="nonzero"/>
                                    </clipPath>
                                </defs>
                                <g clipPath="url(#eee71c9bfb)">
                                    <path fill="#ffd700" d="M 37.867188 361.9375 L 342.554688 362.179688 L 190.511719 150.601562 Z M 37.867188 361.9375 " fillOpacity="1" fillRule="nonzero"/>
                                </g>
                                <g clipPath="url(#e224594083)">
                                    <path fill="#ffd700" d="M 42.335938 290.808594 L 190.511719 85.632812 L 337.964844 290.929688 L 42.335938 290.808594 M 37.503906 290.808594 C 37.503906 291.53125 37.625 292.257812 37.988281 292.980469 C 38.832031 294.550781 40.523438 295.636719 42.335938 295.636719 L 337.964844 295.757812 C 339.777344 295.757812 341.464844 294.792969 342.3125 293.101562 C 342.671875 292.378906 342.792969 291.652344 342.792969 290.929688 C 342.792969 289.960938 342.433594 288.996094 341.828125 288.152344 L 194.375 82.851562 C 193.410156 81.644531 191.960938 80.800781 190.511719 80.800781 C 188.941406 80.800781 187.492188 81.523438 186.648438 82.851562 L 38.472656 287.910156 C 37.867188 288.753906 37.503906 289.722656 37.503906 290.808594 Z M 37.503906 290.808594 " fillOpacity="1" fillRule="nonzero"/>
                                </g>
                                <g clipPath="url(#0a0bc97e8f)">
                                    <path fill="#ffd700" d="M 42.578125 222.699219 L 190.753906 17.640625 L 338.207031 222.9375 L 42.578125 222.699219 M 37.746094 222.699219 C 37.746094 223.421875 37.867188 224.144531 38.230469 224.871094 C 39.074219 226.441406 40.765625 227.527344 42.578125 227.527344 L 338.207031 227.769531 C 340.015625 227.769531 341.707031 226.804688 342.554688 225.113281 C 342.914062 224.386719 343.035156 223.664062 343.035156 222.9375 C 343.035156 221.972656 342.671875 221.007812 342.070312 220.160156 L 194.617188 14.863281 C 193.652344 13.65625 192.203125 12.8125 190.753906 12.8125 C 189.183594 12.8125 187.734375 13.535156 186.890625 14.863281 L 38.710938 219.800781 C 38.109375 220.644531 37.746094 221.730469 37.746094 222.699219 Z M 37.746094 222.699219 " fillOpacity="1" fillRule="nonzero"/>
                                </g>
                            </svg>
                            <span className="text-[#004B49] font-bold text-xl tracking-wider">FLYVIXX</span>
                        </div>

                        {/* Animated loading indicator */}
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700]/20 border-t-[#FFD700]"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#004B49] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>

                        {/* Loading messages */}
                        <div className="text-center space-y-2">
                            <p className="text-gray-700 font-medium">Preparing secure login</p>
                            <p className="text-gray-500 text-sm">Setting up authentication...</p>
                        </div>

                        {/* Progress dots animation */}
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#004B49] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#004B49] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#004B49] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                ) : (
                    <Descope
                        flowId="sign-up-or-in-passwords"
                        onSuccess={handleDescopeSuccess}
                        onError={handleDescopeError}
                        onReady={handleSdkReady}
                        theme="light"
                    />
                )}
            </div>
        </div>
    );
}