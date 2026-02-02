import { TrendingUpIcon, ZapIcon, ShieldCheckIcon, LockIcon, BarChartIcon, UsersIcon } from "lucide-react";
import { IFeature } from "../types";

export const features: IFeature[] = [
    {
        title: "Tiered Access Levels",
        description:
            "Level Up Your Potential. Progress through our referral tiers to increase your daily flight capacity. More levels mean more turns, giving you more opportunities to win every 24 hours.",
        icon: TrendingUpIcon
    },
    {
        title: "Risk-Free Flight Power",
        description:
            "Gaming Without the Drawback. Utilize 1% of your locked position as daily betting power. Experience the full thrill of the Aviator game without ever touching your initial principal.",
        icon: ZapIcon
    },
    {
        title: "Guaranteed Safety Threshold",
        description:
            "Strategic Safety Nets. Every flight is designed with a guaranteed floor. Use our auto-collect features to secure your daily gains before the crash, ensuring a consistent experience.",
        icon: ShieldCheckIcon
    },
    {
        title: "Capital Preservation",
        description:
            "Total Liquidity Security. Your primary funds remain locked and protected for the duration of the cycle. At the end of 30 days, your original deposit is unlocked in full, regardless of game outcomes.",
        icon: LockIcon,
    },
    {
        title: "Real-Time Earnings",
        description:
            "Instant Reward Distribution. Track your daily wins and flight performance in real time. Your winnings are processed instantly, giving you immediate access to the fruits of your strategy.",
        icon: BarChartIcon,
    },
    {
        title: "Scalable Network Growth",
        description:
            "The Power of Connection. Our infrastructure rewards community builders. As your network grows, so does your level, unlocking premium features and higher engagement limits automatically.",
        icon: UsersIcon,
    },
]
