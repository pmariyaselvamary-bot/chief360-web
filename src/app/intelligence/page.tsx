"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, LineChart, Battery, Zap, Loader2 } from "lucide-react";
import { ApiService, IntelligenceBrief } from "@/lib/api";

export default function StrategicIntelligencePanel() {
    const [intel, setIntel] = useState<IntelligenceBrief | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchIntel() {
            try {
                const data = await ApiService.getIntelligenceBrief();
                setIntel(data);
            } catch (err) {
                console.error("Failed to load intelligence brief", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchIntel();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--aurora-pink)]" />
            </div>
        );
    }

    if (!intel) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-white/60 text-lg">Unable to load intelligence data.</p>
            </div>
        );
    }

    const fatigueColorClass = intel.fatigue.color === 'green' ? 'text-green-400' : intel.fatigue.color === 'amber' ? 'text-amber-500' : 'text-red-500';
    const fatigueBarColor = intel.fatigue.color === 'green' ? 'from-green-400 to-amber-500' : intel.fatigue.color === 'amber' ? 'from-amber-400 to-red-500' : 'from-red-400 to-red-600';

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto h-full overflow-y-auto w-full">
            <header className="mb-6 md:mb-10 flex flex-col items-start gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-[var(--aurora-pink)]" />
                    Strategic Intelligence
                </h1>
                <p className="text-white/60 text-base md:text-lg">AI-generated analysis from your live data.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 pb-20 md:pb-8">
                {/* Weekly Executive Summary */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                        <LineChart className="w-6 h-6 text-[var(--aurora-pink)]" />
                        Weekly Executive Summary
                    </h2>
                    <div className="prose prose-invert prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed max-w-none text-white/80 space-y-4">
                        <p>{intel.weeklySummary}</p>
                    </div>
                </section>

                {/* Decision Fatigue Meter */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                            <Battery className="w-6 h-6 text-green-400" />
                            Decision Fatigue Meter
                        </h2>

                        <div className="mb-8">
                            <div className="flex justify-between text-base md:text-lg mb-3">
                                <span className="text-white/80 font-medium">Current Cognitive Load</span>
                                <span className={`font-mono font-bold ${fatigueColorClass}`}>
                                    {intel.fatigue.status} ({intel.fatigue.level}%)
                                </span>
                            </div>
                            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${fatigueBarColor}`}
                                    style={{ width: `${intel.fatigue.level}%` }}
                                />
                            </div>
                            <p className="text-sm md:text-base text-white/50 mt-3 italic leading-relaxed">
                                {intel.fatigue.description}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 bg-black/30 rounded-xl border border-white/10">
                        <h3 className="text-base md:text-lg font-semibold mb-3 flex items-center gap-2 text-white/90">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Predicted Cognitive Impact
                        </h3>
                        <p className="text-sm md:text-base text-white/60 leading-relaxed">
                            {intel.predictedDrain}
                        </p>
                    </div>
                </section>

                {/* 30-Day Conflict Forecast */}
                <section className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--aurora-pink)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-xl md:text-2xl font-semibold mb-8 relative z-10">30-Day Conflict Forecast</h2>

                    <div className="space-y-5 relative z-10">
                        {intel.conflictForecast.length > 0 ? (
                            intel.conflictForecast.map((conflict, idx) => {
                                const date = new Date(conflict.date);
                                const isCritical = conflict.severity === 'critical';

                                return (
                                    <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 bg-black/30 p-5 md:p-6 rounded-xl border ${isCritical ? 'border-red-500/30' : 'border-white/10 hover:border-white/20 transition-colors'}`}>
                                        <div className="w-16 text-center shrink-0">
                                            <div className="text-sm text-white/50 uppercase font-semibold">
                                                {date.toLocaleString('default', { month: 'short' })}
                                            </div>
                                            <div className={`text-3xl font-bold ${isCritical ? 'text-red-500' : 'text-white/90'}`}>
                                                {date.getDate()}
                                            </div>
                                        </div>
                                        <div className={`hidden sm:block w-1.5 h-16 ${isCritical ? 'bg-red-500/50' : 'bg-white/20'} rounded-full shrink-0`} />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-white">{conflict.title}</h4>
                                            <p className="text-base text-white/70 mt-1 leading-relaxed">{conflict.description}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center">
                                <p className="text-lg text-emerald-300 font-semibold">No conflicts detected in the next 30 days. Schedule is clear.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
