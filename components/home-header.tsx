import { Search, Bell, User } from "lucide-react";

export default function HomeHeader() {
    return (
        <header className="flex items-center justify-between p-4">
            <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
            <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center">
                    <Search size={20} color="#ffd700" />
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center">
                    <Bell size={20} color="#ffd700" />
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center">
                    <User size={20} color="#ffd700" />
                </div>
            </div>
        </header>
    );
}
