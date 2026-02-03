'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import LenisScroll from "@/components/lenis";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    return (
        <>
            {pathname !== '/' && <Navbar />}
            <LenisScroll />
            {children}
            <BottomNav />
            {pathname !== '/' && <Footer />}
        </>
    );
}