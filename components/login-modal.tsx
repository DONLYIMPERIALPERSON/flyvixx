'use client';

import { useState } from "react";
import { Mail, Key } from "lucide-react";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [currentStep, setCurrentStep] = useState<'options' | 'email' | 'otp'>('options');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl p-6 w-full max-w-md min-h-[50vh] transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
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
                {currentStep === 'options' && (
                    <>
                        {activeTab === 'login' && (
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        alert('Passkey login demo');
                                        onLogin();
                                    }}
                                    className="w-full bg-transparent border border-[#004B49] text-[#004B49] p-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                >
                                    <Key size={20} />
                                    <span>Login with Passkey</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep('email')}
                                    className="w-full bg-transparent border border-red-500 text-red-500 p-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                >
                                    <Mail size={20} />
                                    <span>Continue with Gmail</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep('email')}
                                    className="w-full bg-transparent border border-black text-black p-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                >
                                    <Mail size={20} />
                                    <span>Login with Email</span>
                                </button>
                            </div>
                        )}
                        {activeTab === 'register' && (
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        alert('Passkey register demo');
                                        onLogin();
                                    }}
                                    className="w-full bg-transparent border border-[#004B49] text-[#004B49] p-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                >
                                    <Key size={20} />
                                    <span>Register with Passkey</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep('email')}
                                    className="w-full bg-transparent border border-red-500 text-red-500 p-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                >
                                    <Mail size={20} />
                                    <span>Register with Gmail</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep('email')}
                                    className="w-full bg-transparent border border-black text-black p-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                >
                                    <Mail size={20} />
                                    <span>Register with Email</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
                {currentStep === 'email' && (
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base"
                        />
                        <button
                            type="button"
                            onClick={() => setCurrentStep('otp')}
                            className="w-full bg-[#004B49] text-white p-3 rounded-lg font-semibold"
                        >
                            Send OTP
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep('options')}
                            className="w-full bg-gray-500 text-white p-3 rounded-lg font-semibold"
                        >
                            Back
                        </button>
                    </div>
                )}
                {currentStep === 'otp' && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg text-base"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                alert('OTP verified');
                                onLogin();
                            }}
                            className="w-full bg-[#004B49] text-white p-3 rounded-lg font-semibold"
                        >
                            Verify OTP
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep('email')}
                            className="w-full bg-gray-500 text-white p-3 rounded-lg font-semibold"
                        >
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
