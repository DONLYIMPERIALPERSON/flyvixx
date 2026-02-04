'use client';

import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Send } from "lucide-react";
import TransactionHeader from "../../components/transaction-header";
import LoginGuard from "../../components/login-guard";
import { useEffect } from "react";

// HubSpot type declarations
declare global {
    interface Window {
        HubSpotConversations?: {
            widget: {
                load: () => void;
                open: () => void;
                remove: () => void;
            };
        };
    }
}

export default function SupportPage() {
    const router = useRouter();

    useEffect(() => {
        // Load HubSpot live chat script only on support page
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = 'hs-script-loader';
        script.async = true;
        script.defer = true;
        script.src = '//js-eu1.hs-scripts.com/147732252.js';
        document.body.appendChild(script);

        // Function to show HubSpot chat
        const showChat = () => {
            if (window.HubSpotConversations) {
                window.HubSpotConversations.widget.load();
                window.HubSpotConversations.widget.open();
            }
        };

        // Function to hide HubSpot chat
        const hideChat = () => {
            if (window.HubSpotConversations) {
                window.HubSpotConversations.widget.remove();
            }
        };

        // Show chat when script loads
        script.onload = () => {
            // Wait a bit for HubSpot to initialize
            setTimeout(showChat, 1000);
        };

        // Show chat immediately if already loaded
        if (window.HubSpotConversations) {
            showChat();
        }

        // Cleanup function to hide chat when component unmounts
        return () => {
            hideChat();
            const existingScript = document.getElementById('hs-script-loader');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    const handleBack = () => {
        router.push('/');
    };

    const handleTelegramJoin = () => {
        window.open('https://t.me/flyvixxcommunity', '_blank');
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
                            Hit the live chat icon to chat with a customer care representative or send us an email
                        </p>

                        {/* Support Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleTelegramJoin}
                                className="w-full bg-[#0088cc] text-white py-4 px-6 rounded-lg font-medium hover:bg-[#0077b3] transition-colors flex items-center justify-center space-x-3"
                            >
                                <Send size={20} />
                                <span>Join Telegram Community</span>
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
