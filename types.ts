import { LucideIcon } from "lucide-react";

export interface IFeature {
    icon: LucideIcon;
    title: string;
    description: string;
};

export interface IWork {
    title: string;
    image: string;
}

export interface ITestimonial {
    id: number;
    name: string;
    title: string;
    quote: string;
    avatar: string;
    handle: string;
    rating: 1 | 2 | 3 | 4 | 5;
}

export interface IFaq {
    question: string;
    answer: string;
}

// HubSpot Live Chat Type Declarations
declare global {
    interface Window {
        HubSpotConversations?: {
            widget: {
                load: () => void;
                open: () => void;
                close: () => void;
                remove: () => void;
            };
        };
        hsConversationsOnReady?: Array<() => void>;
        hsConversationsSettings?: {
            loadImmediately?: boolean;
            inlineEmbedSelector?: string;
            enableWidgetCookieBanner?: boolean;
            disableAttachment?: boolean;
        };
    }
}
