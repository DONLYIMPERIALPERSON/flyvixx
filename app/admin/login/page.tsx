'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Mail,
    Shield,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [emailPrefix, setEmailPrefix] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    useEffect(() => {
        // Check if already authenticated
        const isAuthenticated = localStorage.getItem('adminAuthenticated');
        if (isAuthenticated) {
            router.push('/admin/dashboard');
        }
    }, [router]);

    const handleSendCode = async () => {
        if (!emailPrefix.trim()) {
            setError('Please enter your email prefix');
            return;
        }

        setIsSendingCode(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: fullEmail,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setCodeSent(true);
                setSuccess('OTP code sent to your email!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error?.message || data.error || 'Failed to send OTP code');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!otp.trim()) {
            setError('Please enter the OTP code');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: fullEmail,
                    code: otp,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Store JWT token and authentication status
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminAuthenticated', 'true');
                localStorage.setItem('adminData', JSON.stringify(data.admin));
                router.push('/admin/dashboard');
            } else {
                setError(data.error?.message || data.error || 'Invalid OTP code. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fullEmail = emailPrefix ? `${emailPrefix}@flyvixx.com` : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-[#004B49]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-white/70">Access the FLYVIXX admin panel</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Email
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={emailPrefix}
                                    onChange={(e) => setEmailPrefix(e.target.value)}
                                    placeholder="admin"
                                    className="flex-1 bg-white/5 border border-white/20 rounded-l-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                                    required
                                />
                                <div className="bg-white/10 border border-l-0 border-white/20 rounded-r-lg px-4 py-3 text-white/70 flex items-center">
                                    @flyvixx.com
                                </div>
                            </div>
                            {fullEmail && (
                                <p className="text-white/60 text-sm mt-1">
                                    Full email: {fullEmail}
                                </p>
                            )}
                        </div>

                        {/* Send Code Button */}
                        <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={isSendingCode || !emailPrefix.trim()}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isSendingCode ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Mail size={16} />
                                    <span>Send Code</span>
                                </>
                            )}
                        </button>

                        {/* OTP Field */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                OTP Code
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                                maxLength={6}
                                required
                            />
                            <p className="text-white/60 text-sm mt-1">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
                                <CheckCircle size={20} className="text-green-400" />
                                <div className="text-green-400 text-sm">{success}</div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                                <AlertCircle size={20} className="text-red-400" />
                                <div className="text-red-400 text-sm">{error}</div>
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !otp.trim()}
                            className="w-full bg-[#FFD700] text-[#004B49] py-3 px-6 rounded-lg font-bold hover:bg-[#E6C200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#004B49]/20 border-t-[#004B49]"></div>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Shield size={20} />
                                    <span>Login</span>
                                </>
                            )}
                        </button>
                    </form>


                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-white/60 text-sm">
                        Secure admin access for FLYVIXX platform management
                    </p>
                </div>
            </div>
        </div>
    );
}
