'use client';

import { useState } from "react";
import { ArrowLeft, Search, HelpCircle } from "lucide-react";
import SearchModal from "./search-modal";

interface TransactionHeaderProps {
    onBack?: () => void;
    title?: string;
}

export default function TransactionHeader({ onBack, title = "Transactions" }: TransactionHeaderProps) {
    const [showSearchModal, setShowSearchModal] = useState(false);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            // Default back behavior - could navigate to previous page
            window.history.back();
        }
    };

    return (
        <>
            <header className="flex items-center justify-between p-4">
                {/* Back Button */}
                <div
                    className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={handleBack}
                >
                    <ArrowLeft size={20} color="#ffd700" />
                </div>

                {/* Title */}
                <h1 className="text-lg font-bold text-white">{title}</h1>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <div
                        className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={() => setShowSearchModal(true)}
                    >
                        <Search size={20} color="#ffd700" />
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                        <HelpCircle size={20} color="#ffd700" />
                    </div>
                </div>
            </header>

            <SearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
            />
        </>
    );
}