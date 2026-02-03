import { Home, Plane, Clock, HelpCircle } from "lucide-react";

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <button className="flex flex-col items-center text-white hover:text-[#ffd700] transition">
                    <Home size={20} />
                    <span className="text-xs mt-1">Home</span>
                </button>
                <button className="flex flex-col items-center text-white hover:text-[#ffd700] transition">
                    <Plane size={20} />
                    <span className="text-xs mt-1">Fly</span>
                </button>
                <button className="flex flex-col items-center text-white hover:text-[#ffd700] transition">
                    <Clock size={20} />
                    <span className="text-xs mt-1">History</span>
                </button>
                <button className="flex flex-col items-center text-white hover:text-[#ffd700] transition">
                    <HelpCircle size={20} />
                    <span className="text-xs mt-1">Support</span>
                </button>
            </div>
        </nav>
    );
}
