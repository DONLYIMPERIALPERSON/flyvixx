'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageCircle, Mail, X } from "lucide-react";
import TransactionHeader from "../../components/transaction-header";
import LoginGuard from "../../components/login-guard";

export default function SupportPage() {
    const router = useRouter();
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatLoaded, setChatLoaded] = useState(false);

    const handleBack = () => {
        router.push('/');
    };

    const handleLiveChat = () => {
        setShowChatModal(true);
    };

    const handleEmailSend = () => {
        window.location.href = 'mailto:help@flyvixx.com';
    };

    useEffect(() => {
        if (showChatModal && !chatLoaded) {
            // Configure HubSpot for inline embedding
            window.hsConversationsSettings = {
                loadImmediately: false,
                inlineEmbedSelector: '#hubspot-chat-container',
                enableWidgetCookieBanner: false,
                disableAttachment: false
            };

            // Check if HubSpot is already loaded
            if (window.HubSpotConversations?.widget) {
                // HubSpot already loaded, just load and open it
                setChatLoaded(true);
                setTimeout(() => {
                    if (window.HubSpotConversations?.widget?.load) {
                        window.HubSpotConversations.widget.load();
                        window.HubSpotConversations.widget.open();
                    }
                }, 500);
            } else {
                // Load HubSpot chat widget when modal opens
                const script = document.createElement('script');
                script.src = '//js-eu1.hs-scripts.com/147732252.js';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    setChatLoaded(true);
                    // Wait a bit for HubSpot to initialize, then load and open the widget
                    setTimeout(() => {
                        if (window.HubSpotConversations?.widget?.load) {
                            window.HubSpotConversations.widget.load();
                            window.HubSpotConversations.widget.open();

                            // Force resize the widget after loading
                            setTimeout(() => {
                                const container = document.getElementById('hubspot-chat-container');
                                if (container) {
                                    // Force the container and its contents to be larger
                                    container.style.height = '720px';
                                    container.style.minHeight = '720px';

                                    // Try to resize any iframes inside
                                    const iframes = container.querySelectorAll('iframe');
                                    iframes.forEach(iframe => {
                                        iframe.style.width = '100%';
                                        iframe.style.height = '720px';
                                        iframe.style.minHeight = '720px';
                                    });
                                }
                            }, 3000);
                        }
                    }, 2000);
                };
                document.head.appendChild(script);
            }
        }
    }, [showChatModal, chatLoaded]);

    const handleCloseChat = () => {
        setShowChatModal(false);
        setChatLoaded(false);
        // Close and remove HubSpot widget when modal closes
        if (window.HubSpotConversations?.widget?.close) {
            window.HubSpotConversations.widget.close();
        }
        if (window.HubSpotConversations?.widget?.remove) {
            window.HubSpotConversations.widget.remove();
        }
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

            {/* Chat Modal - Bottom slide-up modal like other modals */}
            {showChatModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={handleCloseChat}></div>
                    <div className={`bg-white rounded-t-xl w-full max-w-xl h-[85vh] max-h-[700px] transform transition-transform duration-300 ${showChatModal ? 'translate-y-0' : 'translate-y-full'}`}>
                        <div className="p-2 border-b border-gray-200">
                            <div className="flex justify-center mb-1">
                                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                            </div>

                            {/* Modal Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Live Chat Support</h3>
                                <button
                                    onClick={handleCloseChat}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Container */}
                        <div className="flex-1 h-full">
                            {!chatLoaded ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-4"></div>
                                    <p className="text-gray-600 mb-2">Connecting to support...</p>
                                    <p className="text-sm text-gray-500">Please wait while we load the chat interface</p>
                                </div>
                            ) : (
                                <div
                                    id="hubspot-chat-container"
                                    className="w-full h-full overflow-hidden"
                                    style={{
                                        height: 'calc(100% - 0px)',
                                        minHeight: '720px',
                                        maxHeight: '750px'
                                    }}
                                >
                                    {/* Custom CSS to make HubSpot chat larger */}
                                    <style>
                                        {`
                                            #hubspot-chat-container iframe {
                                                width: 100% !important;
                                                height: 100% !important;
                                                min-height: 720px !important;
                                                max-height: 750px !important;
                                            }
                                            #hubspot-chat-container .hs-conversations-widget {
                                                width: 100% !important;
                                                height: 100% !important;
                                                min-height: 720px !important;
                                                max-height: 750px !important;
                                            }
                                            #hubspot-chat-container .hs-conversations-iframe {
                                                width: 100% !important;
                                                height: 100% !important;
                                                min-height: 720px !important;
                                                max-height: 750px !important;
                                            }
                                            /* Make the chat input area larger */
                                            #hubspot-chat-container .hs-conversations-widget .hs-conversations-messages {
                                                min-height: 500px !important;
                                            }
                                            /* Ensure the widget takes full container space */
                                            #hubspot-chat-container > div {
                                                width: 100% !important;
                                                height: 100% !important;
                                            }
                                        `}
                                    </style>
                                    {/* HubSpot chat will be embedded here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
        </LoginGuard>
    );
}
