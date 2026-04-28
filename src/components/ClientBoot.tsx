"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import SplashScreen from "./SplashScreen";
import Sidebar from "./Sidebar";
import { useAuthStore } from "@/store/useAuthStore";

export default function ClientBoot({ children }: { children: React.ReactNode }) {
    const [isBooting, setIsBooting] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isBooting && !isAuthenticated && pathname !== "/login") {
            router.push("/login");
        }
    }, [isBooting, isAuthenticated, pathname, router]);

    // Close sidebar on navigation
    useEffect(() => {
        setTimeout(() => { setIsSidebarOpen(false); }, 0);
    }, [pathname]);

    if (pathname === "/login") {
        return <>{children}</>;
    }

    return (
        <>
            {isBooting ? (
                <SplashScreen onComplete={() => setIsBooting(false)} />
            ) : null}

            <div
                className={`flex h-screen overflow-hidden bg-background text-foreground transition-opacity duration-1000 ${isBooting ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
            >
                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 left-0 w-full h-20 bg-[#1A1A1A]/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-6">
                    <div className="relative w-40 h-12">
                        <Image src="/assets/chief360-black bg.png" alt="Chief360 Copilot App Logo" fill className="object-contain" priority />
                    </div>
                    <button onClick={() => setIsDark(!isDark)} className="p-2 text-white/80 hover:text-white bg-white/5 rounded-md mr-2">
                        <div style={{width:'44px',height:'24px',borderRadius:'12px',background:isDark?'#333':'#f0c040',position:'relative',transition:'background 0.3s'}}>
                            <div style={{width:'20px',height:'20px',borderRadius:'50%',background:isDark?'#aaa':'#fff',position:'absolute',top:'2px',left:isDark?'2px':'22px',transition:'left 0.3s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>
                            </div>
                        </div>
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white/80 hover:text-white bg-white/5 rounded-md">
                        {isSidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>

                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <main className="flex-1 relative overflow-auto pt-20 md:pt-0 pb-10">
                    {children}
                </main>
            </div>
        </>
    );
}
