'use client';

import { useState } from "react";
import { X, Search, TrendingUp, Users, DollarSign, Bell } from "lucide-react";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    id: number;
    type: 'feature' | 'user' | 'transaction' | 'notification';
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

const mockSearchResults: SearchResult[] = [
    {
        id: 1,
        type: 'feature',
        title: 'Daily Flights',
        subtitle: 'Risk-free gaming feature',
        icon: <TrendingUp className="w-5 h-5 text-blue-500" />
    },
    {
        id: 2,
        type: 'user',
        title: 'John Doe',
        subtitle: 'Active referral member',
        icon: <Users className="w-5 h-5 text-green-500" />
    },
    {
        id: 3,
        type: 'transaction',
        title: 'Flight Earnings',
        subtitle: '$50.00 received today',
        icon: <DollarSign className="w-5 h-5 text-yellow-500" />
    },
    {
        id: 4,
        type: 'notification',
        title: 'Level Up Bonus',
        subtitle: 'Congratulations on reaching Level 3',
        icon: <Bell className="w-5 h-5 text-purple-500" />
    },
    {
        id: 5,
        type: 'feature',
        title: 'Referral Program',
        subtitle: 'Earn more with active referrals',
        icon: <Users className="w-5 h-5 text-blue-500" />
    }
];

const recentSearches = [
    'Daily earnings',
    'Referral bonus',
    'Flight history',
    'Level progression'
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setSearchResults([]);
        } else {
            // Filter mock results based on search query
            const filtered = mockSearchResults.filter(result =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.subtitle.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[70vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Search</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search features, transactions, users..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                            style={{ fontSize: '16px' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto">
                    {searchQuery && searchResults.length > 0 && (
                        <div className="p-4">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">Search Results</h4>
                            <div className="space-y-3">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex-shrink-0">
                                            {result.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {result.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {result.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {searchQuery && searchResults.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-center">No results found</p>
                            <p className="text-sm text-center mt-1">Try searching for features, transactions, or users</p>
                        </div>
                    )}

                    {!searchQuery && (
                        <div className="p-4">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">Recent Searches</h4>
                            <div className="space-y-2">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(search)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                    >
                                        <Search className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">{search}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h4 className="text-sm font-semibold text-gray-600 mb-3">Popular Searches</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Earnings', 'Referrals', 'Flights', 'Bonuses', 'History'].map((tag, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearch(tag)}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}