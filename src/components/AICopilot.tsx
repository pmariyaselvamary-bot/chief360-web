"use client";

import { useState } from "react";
import { Send, Sparkles, Bot, Loader2 } from "lucide-react";
import { ApiService } from "@/lib/api";

export default function AICopilot() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Chief360 Copilot online. I analyze your live data — roles, tasks, schedules, and conflicts. Try \"status\", \"tasks\", \"schedule\", \"conflicts\", or \"help\" for all commands.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setIsThinking(true);

        try {
            const data = await ApiService.queryCopilot(userMessage);
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: data.response,
                },
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "Connection to Copilot engine failed. Please check that the backend server is running.",
                },
            ]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] md:h-[700px] border border-white/10 rounded-2xl bg-white/5 overflow-hidden backdrop-blur-md">
            <div className="flex items-center gap-3 p-5 border-b border-white/10 bg-black/20">
                <Bot className="w-8 h-8 text-[var(--aurora-pink)]" />
                <h3 className="font-semibold text-lg md:text-xl">Chief360 Copilot</h3>
                <span className="ml-auto text-xs uppercase font-mono tracking-wider text-[var(--aurora-pink)] bg-[var(--aurora-pink)]/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                    Data-Driven Engine
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-base md:text-lg">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-4 md:p-5 ${msg.role === "user"
                                ? "bg-white/10 text-white shadow-inner"
                                : "bg-gradient-to-br from-[var(--aurora-pink)]/20 to-[var(--deep-rose-end)]/20 text-white/90 border border-[var(--aurora-pink)]/30 shadow-[0_4px_20px_rgba(247,37,133,0.1)]"
                                }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-br from-[var(--aurora-pink)]/20 to-[var(--deep-rose-end)]/20 border border-[var(--aurora-pink)]/30 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-[var(--aurora-pink)]" />
                            <span className="text-white/60 text-sm">Analyzing your data...</span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-4 md:p-5 border-t border-white/10 bg-black/20 relative">
                <Sparkles className="absolute left-7 md:left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--aurora-pink)]" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Command or query..."
                    disabled={isThinking}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 md:py-5 pl-14 pr-16 md:pl-16 md:pr-20 text-base md:text-lg focus:outline-none focus:border-[var(--aurora-pink)]/50 transition-colors placeholder:text-white/30 font-mono shadow-inner disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isThinking}
                    className="absolute right-6 md:right-7 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white active:scale-95 bg-white/5 disabled:opacity-50"
                >
                    <Send className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
}
