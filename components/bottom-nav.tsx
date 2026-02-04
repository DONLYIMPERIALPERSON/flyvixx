'use client';

import { useRouter } from "next/navigation";
import { Home, Plane, Clock, HelpCircle, ChevronRight } from "lucide-react";

interface BottomNavProps {
    isLoggedIn: boolean;
    onOpenLogin: () => void;
    onLogin: () => void;
}

export default function BottomNav({ isLoggedIn, onOpenLogin, onLogin }: BottomNavProps) {
    const router = useRouter();

    if (!isLoggedIn) {
        return (
            <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
                <div className="flex justify-center items-center">
                    <div className="bg-[#DCEFEE] rounded-2xl h-14 w-80 relative flex items-center justify-start px-4 cursor-pointer" onClick={onOpenLogin}>
                        <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                            <ChevronRight size={16} className="text-gray-600" />
                        </div>
                        <span className="text-gray-600 text-sm ml-4">slide to login</span>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="flex flex-col items-center text-white hover:text-[#ffd700] transition"
                >
                    <Home size={20} />
                    <span className="text-xs mt-1">Home</span>
                </button>
                <button
                    onClick={() => router.push('/fly')}
                    className="flex flex-col items-center text-white hover:text-[#ffd700] transition"
                >
                    <Plane size={20} />
                    <span className="text-xs mt-1">Fly</span>
                </button>
                <button
                    onClick={() => router.push('/transactions')}
                    className="flex flex-col items-center text-white hover:text-[#ffd700] transition"
                >
                    <Clock size={20} />
                    <span className="text-xs mt-1">History</span>
                </button>
                <button
                    onClick={() => router.push('/support')}
                    className="flex flex-col items-center text-white hover:text-[#ffd700] transition"
                >
                    <HelpCircle size={20} />
                    <span className="text-xs mt-1">Support</span>
                </button>
            </div>
        </nav>
    );
}
