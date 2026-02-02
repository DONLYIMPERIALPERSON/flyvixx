import { IFaq } from "@/types";

export const faqs: IFaq[] = [
    {
        question: "What is FLYVIXX?",
        answer: "FLYVIXX is a strategic gaming ecosystem where your capital powers your daily play. By maintaining a 30-day locked position, you gain access to daily \"Risk-Free\" Aviator flights. Your original funds are never touched and are returned to you in full after the 30-day cycle.",
    },
    {
        question: "How do I earn daily?",
        answer: "Every 24 hours, you are granted \"Flight Power\" equivalent to 1% of your locked funds. You can use this to play the Aviator game. All winnings from these flights are yours to keep, while your initial capital remains safely locked and untouched.",
    },
    {
        question: "What is the \"Guaranteed Multiplier\"?",
        answer: "To ensure a consistent experience, the Aviator is programmed with a safety threshold. Users have the opportunity to secure their daily 1% position at a guaranteed point before a crash, allowing you to effectively \"capture\" your daily reward.",
    },
    {
        question: "How does the Level System work?",
        answer: "By default, all new users begin at Level 1, which grants one flight per day. To increase your daily earning potential, you can move up tiers by building your network:\n * Level 1: Default (1 Daily Flight)\n * Level 2: 5 Active Referrals (2 Daily Flights)\n * Level 3: 10 Active Referrals (3 Daily Flights)\n ...and so on. More active referrals directly translate to more daily opportunities to win.",
    },
    {
        question: "What defines an \"Active\" referral?",
        answer: "A referral is considered \"Active\" as long as they have funds currently locked in their FLYVIXX account. If a referral's 30-day cycle ends and they do not restart a new lock, they become \"Inactive.\"",
    },
    {
        question: "Can my Level change?",
        answer: "Yes. Your level is calculated in real-time based on your current Active referral count.\n * Upgrades: As soon as you hit the next milestone of active referrals (e.g., reaching 5), you are immediately upgraded.\n * Adjustments: If a referral becomes inactive and your total active count drops below a tier threshold, your account may be adjusted to the previous level.\n * Restoration: Once your referrals reactivate their accounts or you gain new ones, your elite level and daily flight count are instantly restored.",
    },
    {
        question: "Is my capital at risk during the Aviator game?",
        answer: "No. You are playing with \"Flight Power\" (the 1% benefit), not your actual locked funds. Even if a flight crashes before you cash out, your locked capital remains 100% intact and will be unlocked in full after 30 days.",
    },
    {
        question: "When can I withdraw my funds?",
        answer: "Your principal deposit is locked for a standard 30-day cycle to power your daily rewards. Once the 30 days are complete, your funds are fully unlocked and available for withdrawal or to be re-locked for a new cycle of daily flights.",
    },
];
