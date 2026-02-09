'use client';

import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Send } from "lucide-react";
import TransactionHeader from "../../components/transaction-header";
import LoginGuard from "../../components/login-guard";

export default function SupportPage() {
    const router = useRouter();

    const handleBack = () => {
        router.push('/');
    };

    const handleLiveChat = () => {
        if (window.HubSpotConversations?.widget) {
            window.HubSpotConversations.widget.open();
        } else {
            // Fallback if widget isn't loaded yet
            window.hsConversationsOnReady = window.hsConversationsOnReady || [];
            window.hsConversationsOnReady.push(function() {
                window.HubSpotConversations?.widget?.open();
            });
        }
    };

    const handleEmailSend = () => {
        window.location.href = 'mailto:help@flyvixx.com';
    };

    return (
        <LoginGuard>
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            <TransactionHeader onBack={handleBack} title="Support" />

            <main className="p-4">
                <div className="max-w-md mx-auto">
                    {/* Support Content */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
                        {/* Support Icon */}
                        <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle size={32} className="text-[#004B49]" />
                        </div>

                        {/* Support Text */}
                        <h2 className="text-white text-xl font-bold mb-4">Customer Support</h2>
                        <p className="text-white/80 text-sm leading-relaxed mb-8">
                            Chat with our customer care representative or send us an email
                        </p>

                        {/* Support Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleLiveChat}
                                className="w-full bg-[#0088cc] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#0077b3] transition-colors flex items-center justify-center space-x-3"
                            >
                                <MessageCircle size={20} />
                                <span>Live Chat Support</span>
                            </button>

                            <button
                                onClick={handleEmailSend}
                                className="w-full bg-[#FFD700] text-[#004B49] py-4 px-6 rounded-lg font-medium hover:bg-[#E6C200] transition-colors flex items-center justify-center space-x-3"
                            >
                                <Mail size={20} />
                                <span>Send us an email</span>
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 p-4 bg-white/5 rounded-lg">
                            <p className="text-white/60 text-xs">
                                Our support team is available 24/7 to assist you with any questions or concerns.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </LoginGuard>
    );
}
