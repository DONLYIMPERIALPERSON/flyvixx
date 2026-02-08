'use client';

import { useEffect, useState } from 'react';

export default function DesktopError() {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            // Check screen width (mobile breakpoint is typically 768px)
            const isDesktopScreen = window.innerWidth > 768;

            // Also check user agent for additional desktop detection
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

            // Consider it desktop if screen is wide AND user agent is not mobile
            setIsDesktop(isDesktopScreen && !isMobileUA);
        };

        // Check on mount
        checkDevice();

        // Listen for window resize
        window.addEventListener('resize', checkDevice);

        return () => {
            window.removeEventListener('resize', checkDevice);
        };
    }, []);

    if (!isDesktop) {
        return null; // Don't show anything for mobile users
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center p-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Text Content - Left Side */}
                    <div className="text-center lg:text-left">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                            <h1 className="text-4xl lg:text-5xl font-bold text-[#FFD700] mb-4">Desktop Not Supported</h1>
                            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">Oops! Mobile Only</h2>
                            <p className="text-white/70 mb-8 leading-relaxed text-lg">
                                You can't use this site on your desktop. Kindly switch to mobile to access FlyVixx.
                            </p>

                            {/* Mobile Instructions */}
                            <div className="bg-white/5 rounded-lg p-6 mb-6">
                                <p className="text-white/60 text-sm mb-3">📱 How to access:</p>
                                <ul className="text-white/70 text-sm text-left space-y-2">
                                    <li>• Open this site on your mobile browser</li>
                                    <li>• Or scan the QR code if available</li>
                                    <li>• Use your smartphone or tablet</li>
                                </ul>
                            </div>

                            {/* Fun Message */}
                            <div className="text-white/50 text-sm">
                                FlyVixx is optimized for mobile gaming experience!
                            </div>
                        </div>
                    </div>

                    {/* Desktop Error Image - Right Side */}
                    <div className="flex justify-center lg:justify-end">
                        <img
                            src="/desktop-error.svg"
                            alt="Desktop not supported"
                            className="w-[28rem] h-[28rem] lg:w-[32rem] lg:h-[32rem]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}