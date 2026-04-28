"use client";

import { useState, useEffect } from "react";
import AICopilot from "@/components/AICopilot";
import { CheckCircle2, AlertTriangle, TrendingUp, Clock, Target, Loader2 } from "lucide-react";
import { ApiService, DashboardMetrics } from "@/lib/api";

export default function CommandDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!metrics) return;
    const checkSchedules = async () => {
      try {
        const { ApiService } = await import('@/lib/api');
        const schedules = await ApiService.getSchedules();
        const now = new Date();
        schedules.forEach((schedule: any) => {
          const start = new Date(schedule.startTime);
          const diff = (start.getTime() - now.getTime()) / 60000;
          if (diff > 9 && diff < 11) {
            if (Notification.permission === 'granted') {
              new Notification('Chief360 Reminder', {
                body: `"${schedule.title}" starts in 10 minutes!`,
                icon: '/assets/chief360-removebg.png'
              });
            }
          }
        });
      } catch (err) {
        console.error('Notification check failed', err);
      }
    };
    const interval = setInterval(checkSchedules, 60000);
    checkSchedules();
    return () => clearInterval(interval);
  }, [metrics]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await ApiService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--aurora-pink)]" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-white/60 text-lg">{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto w-full">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Command Dashboard</h1>
          <p className="text-white/60 text-base md:text-lg">Executive snapshot for multiple entities.</p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto bg-white/5 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-white/5 md:border-none">
          <p className="text-sm md:text-base font-mono text-white/50 mb-1">Strategic Score</p>
          <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-end)]">
            {metrics.strategicScore}<span className="text-xl md:text-2xl text-white/30 font-normal">/100</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">

          {/* Active Roles Overview — from real data */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-[var(--aurora-pink)]" />
              Active Roles Concentration
            </h2>
            <div className="space-y-6">
              {metrics.roleConcentration.length > 0 ? (
                metrics.roleConcentration.map((role, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-base md:text-lg mb-2">
                      <span className={idx === 0 ? "font-medium text-white/90" : "text-white/70"}>
                        {role.name} — {role.title}
                      </span>
                      <span className={`font-mono ${idx === 0 ? "text-[var(--aurora-pink)] font-bold" : "text-white/50"}`}>
                        {role.percentage}%
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${idx === 0 ? "bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-end)]" : "bg-white/20"}`}
                        style={{ width: `${role.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/40 text-center py-4">No roles configured yet. Add roles in the Role Switch panel.</p>
              )}
            </div>
          </section>

          {/* Deep Work Blocks & Conflicts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-[var(--aurora-pink)]" />
                Deep Work Allocation
              </h2>
              <div className="space-y-4">
                {metrics.deepWorkBlocks.length > 0 ? (
                  metrics.deepWorkBlocks.map((block, idx) => {
                    const start = new Date(block.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const end = new Date(block.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={idx} className={`p-4 md:p-5 rounded-xl bg-black/30 border ${idx === 0 ? "border-[var(--aurora-pink)]/30 border-l-4 border-l-[var(--aurora-pink)]" : "border-white/10 border-l-4 border-l-white/30"}`}>
                        <p className={`text-base md:text-lg ${idx === 0 ? "font-semibold text-white" : "font-medium text-white/80"}`}>{block.title}</p>
                        <p className={`text-sm md:text-base mt-2 font-mono ${idx === 0 ? "text-[var(--aurora-pink)]" : "text-white/50"}`}>
                          {start} — {end}{block.context ? ` | ${block.context}` : ''}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-white/40 text-center py-4">No deep work blocks scheduled today.</p>
                )}
              </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Conflict Detection
              </h2>
              {metrics.conflicts.length > 0 ? (
                <div className="p-5 md:p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-base md:text-lg text-amber-300 leading-relaxed font-semibold mb-3">
                    {metrics.conflicts.length} conflict{metrics.conflicts.length > 1 ? 's' : ''} detected.
                  </p>
                  {metrics.conflicts.map((conflict, idx) => (
                    <p key={idx} className="text-sm md:text-base text-amber-200/70 mb-3 leading-relaxed">
                      {conflict.message}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="p-5 md:p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-base md:text-lg text-emerald-300 leading-relaxed font-semibold">
                    No conflicts detected. Schedule is clear.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Sidebar / Copilot Area */}
        <div className="space-y-8">
          <section className="bg-gradient-to-b from-[var(--aurora-pink)]/10 to-transparent border border-[var(--aurora-pink)]/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-5 flex items-center gap-3 text-[var(--aurora-pink)]">
              <TrendingUp className="w-6 h-6" />
              Intelligence Brief
            </h2>
            <ul className="space-y-5 text-base md:text-lg text-white/80">
              {metrics.briefItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-[var(--aurora-pink)] mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <AICopilot />
        </div>
      </div>
    </div>
  );
}
html.light .text-emerald-300 {
  color: #047857 !important;
}

html.light .text-amber-300 {
  color: #b45309 !important;
}

html.light .text-amber-200\/70 {
  color: rgba(120,53,15,0.8) !important;
}

html.light .bg-emerald-500\/10 {
  background-color: rgba(5,150,105,0.1) !important;
}

html.light .border-emerald-500\/20 {
  border-color: rgba(5,150,105,0.3) !important;
}
