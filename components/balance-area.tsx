'use client';

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function BalanceArea() {
    const [visible, setVisible] = useState(true);
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mx-2 md:mx-12 lg:mx-20 xl:mx-28 shadow-lg">
            <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6 items-center">
                    <div className="text-left">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide">Total Wealth</p>
                        <p className="text-base font-bold text-gray-900">{visible ? '$12,345.67' : '****'}</p>
                    </div>
                    <div className="flex justify-center">
                        {visible ? (
                            <Eye size={24} className="text-gray-600 cursor-pointer hover:text-gray-800" onClick={() => setVisible(false)} />
                        ) : (
                            <EyeOff size={24} className="text-gray-600 cursor-pointer hover:text-gray-800" onClick={() => setVisible(true)} />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide">Cash Wallet</p>
                        <p className="text-base font-bold text-gray-900">{visible ? '$1,234.56' : '****'}</p>
                    </div>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                    <button className="bg-[#DCEFEE]/30 text-[#004B49] px-6 py-2 rounded-lg text-xs hover:bg-[#DCEFEE]/50 transition border border-gray-300 leading-none" style={{ verticalAlign: 'baseline' }}>
                        Deposit
                    </button>
                    <button className="bg-[#DCEFEE]/30 text-[#004B49] px-6 py-2 rounded-lg text-xs hover:bg-[#DCEFEE]/50 transition border border-gray-300 leading-none" style={{ verticalAlign: 'baseline' }}>
                        Withdraw
                    </button>
                    <button className="bg-[#DCEFEE]/30 text-[#004B49] px-6 py-2 rounded-lg text-xs hover:bg-[#DCEFEE]/50 transition border border-gray-300 leading-none" style={{ verticalAlign: 'baseline' }}>
                        Transfer
                    </button>
                </div>
            </div>
        </div>
    );
}
