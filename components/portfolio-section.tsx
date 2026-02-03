import { Plane } from "lucide-react";

export default function PortfolioSection() {
    return (
        <section className="mx-2 md:mx-12 lg:mx-20 xl:mx-28 py-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">PORTFOLIO</h2>
                <button className="text-sm text-[#ffd700] hover:text-[#e6c200]">+ add new</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg relative">
                <div className="flex items-center space-x-4">
                    <Plane size={24} className="text-gray-600" />
                    <span className="text-base font-semibold text-[#004B49]">Aircraft-1234567890</span>
                    <span className="text-lg font-bold text-[#ffd700]">$120</span>
                </div>
                <div className="absolute top-2 right-2 bg-gray-100 text-[#004B49] text-xs px-2 py-1 rounded">
                    levels 4
                </div>
            </div>
        </section>
    );
}