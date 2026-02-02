import { XIcon } from "lucide-react";

export const Banner = () => {
    return (
        <div className="relative bg-secondary flex flex-wrap items-center justify-center gap-3 px-4 py-2">
            <p>
                Get 30% off on PrebuiltUI premium templates
            </p>
            <span className="px-3 py-1 rounded-full bg-primary text-black uppercase text-xs">
                Announcement
            </span>
            <button className="absolute right-8">
                <XIcon className="size-5" />
            </button>
        </div>
    );
};