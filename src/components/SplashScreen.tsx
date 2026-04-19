"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Show splash screen for 2.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800); // Trigger onComplete after exit animation
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                        className="relative w-64 h-64 md:w-80 md:h-80"
                    >
                        <Image
                            src="/assets/chief360-removebg.png"
                            alt="Chief360 Copilot Initializing"
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-8 text-sm tracking-[0.2em] font-mono text-foreground/50 uppercase"
                    >
                        Initializing AI Engine
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="mt-4 overflow-hidden rounded-full w-48 h-[2px] bg-white/10"
                    >
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-end)] w-1/2 shadow-[0_0_10px_var(--aurora-pink)]"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
