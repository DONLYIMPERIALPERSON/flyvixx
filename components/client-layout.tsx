'use client';

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import LenisScroll from "@/components/lenis";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import LoginModal from "@/components/login-modal";
import { useLogin } from "@/components/login-context";
import PWARegister from "@/components/pwa-register";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const { isLoggedIn, setIsLoggedIn } = useLogin();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <PWARegister />
            {pathname !== '/' && pathname !== '/transactions' && pathname !== '/support' && pathname !== '/fly' && <Navbar />}
            <LenisScroll />
            {children}
            <BottomNav
                isLoggedIn={isLoggedIn}
                onOpenLogin={() => setShowLoginModal(true)}
                onLogin={() => setIsLoggedIn(true)}
            />
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={() => {
                    setIsLoggedIn(true);
                    setShowLoginModal(false);
                }}
            />
            {pathname !== '/' && pathname !== '/transactions' && pathname !== '/support' && pathname !== '/fly' && <Footer />}
        </>
    );
}
