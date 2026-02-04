'use client';

import { ArrowLeft, History } from "lucide-react";
import Image from "next/image";

interface FlyHeaderProps {
    onBack?: () => void;
    onHistory?: () => void;
}

export default function FlyHeader({ onBack, onHistory }: FlyHeaderProps) {
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            // Default back behavior - could navigate to previous page
            window.history.back();
        }
    };

    const handleHistory = () => {
        if (onHistory) {
            onHistory();
        }
    };

    return (
        <header className="flex items-center justify-between p-4">
            {/* Back Button */}
            <div
                className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                onClick={handleBack}
            >
                <ArrowLeft size={20} color="#ffd700" />
            </div>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
                <Image
                    src="/logo.svg"
                    alt="Flyvixx Logo"
                    width={100}
                    height={24}
                    className="object-contain"
                />
            </div>

            {/* History Button */}
            <div
                className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                onClick={handleHistory}
            >
                <History size={20} color="#ffd700" />
            </div>
        </header>
    );
}
