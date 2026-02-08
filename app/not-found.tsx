'use client';

import { useRouter } from "next/navigation";
import { Plane, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const router = useRouter();

    const handleGoHome = () => {
        router.push('/');
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                {/* Animated Plane */}
                <div className="mb-8 relative">
                    <div className="animate-bounce">
                        <Plane
                            size={80}
                            className="text-[#FFD700] mx-auto transform rotate-45"
                        />
                    </div>
                    {/* Flying trail effect */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent animate-pulse"></div>
                    </div>
                </div>

                {/* Error Content */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h1 className="text-6xl font-bold text-[#FFD700] mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-white mb-4">Oops! Page Not Found</h2>
                    <p className="text-white/70 mb-8 leading-relaxed">
                        Looks like this flight route doesn't exist. The page you're looking for has flown away or never existed.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoHome}
                            className="w-full bg-[#FFD700] text-[#004B49] py-3 px-6 rounded-lg font-bold hover:bg-[#E6C200] transition-colors flex items-center justify-center space-x-2"
                        >
                            <Home size={20} />
                            <span>Return to Homepage</span>
                        </button>

                        <button
                            onClick={handleGoBack}
                            className="w-full bg-white/10 text-white py-3 px-6 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center space-x-2 border border-white/20"
                        >
                            <ArrowLeft size={20} />
                            <span>Go Back</span>
                        </button>
                    </div>

                    {/* Fun Message */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-white/50 text-sm">
                            🚀 While you're here, why not try the FlyVixx crash game?
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
