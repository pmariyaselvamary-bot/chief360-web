"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock, Calendar, Briefcase, Coffee, Plus, CheckCircle2, Play, Loader2 } from "lucide-react";
import { ApiService, ScheduleBlock, TaskItem } from "@/lib/api";

export default function SchedulePage() {
    const [view, setView] = useState<'today' | 'week'>('today');
    const [timeBlocks, setTimeBlocks] = useState<ScheduleBlock[]>([]);
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', context: '', deadline: '', highImpact: false });
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [newBlock, setNewBlock] = useState({ title: '', type: 'working', startTime: '', endTime: '' });

    useEffect(() => {
        async function fetchPipeline() {
            try {
                const [fetchedSchedules, fetchedTasks] = await Promise.all([
                    ApiService.getSchedules(),
                    ApiService.getTasks()
                ]);
                setTimeBlocks(fetchedSchedules);
                setTasks(fetchedTasks);
            } catch (error) {
                console.error("Failed to load pipeline data", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPipeline();
    }, []);

    const toggleTask = async (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        try {
            await ApiService.toggleTaskCompletion(id);
        } catch (error) {
            console.error("Failed to update task", error);
            setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }
    };

    // Dynamically compute pipeline stats from real data
    const pipelineStats = useMemo(() => {
        const working = timeBlocks.filter(b => b.type === 'working');
        const planning = timeBlocks.filter(b => b.type === 'planning');
        const free = timeBlocks.filter(b => b.type === 'free');

        const calcDuration = (blocks: ScheduleBlock[]) => {
            let totalMinutes = 0;
            blocks.forEach(b => {
                const start = new Date(b.startTime).getTime();
                const end = new Date(b.endTime).getTime();
                totalMinutes += (end - start) / 60000;
            });
            const hours = Math.floor(totalMinutes / 60);
            const mins = Math.round(totalMinutes % 60);
            return `${hours}h ${mins}m`;
        };

        return {
            working: { count: working.length, duration: calcDuration(working) },
            planning: { count: planning.length, duration: calcDuration(planning) },
            free: { count: free.length, duration: calcDuration(free) },
        };
    }, [timeBlocks]);

    const getBlockColor = (type: string) => {
        switch (type) {
            case 'working': return 'border-[var(--aurora-pink)] bg-[var(--aurora-pink)]/10 text-[var(--aurora-pink)]';
            case 'planning': return 'border-blue-500 bg-blue-500/10 text-blue-400';
            case 'free': return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
            default: return 'border-white/20 bg-white/5 text-white/80';
        }
    };

    const getBlockIcon = (type: string) => {
        switch (type) {
            case 'working': return <Briefcase className="w-5 h-5 flex-shrink-0" />;
            case 'planning': return <Play className="w-5 h-5 flex-shrink-0" />;
            case 'free': return <Coffee className="w-5 h-5 flex-shrink-0" />;
            default: return <Clock className="w-5 h-5 flex-shrink-0" />;
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDeadline = (dateStr: string) => {
        return new Date(dateStr).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--aurora-pink)]" />
            </div>
        );
    }
    const handleAddBlock = async () => {
    try {
        const saved = await ApiService.createSchedule(newBlock);
        setTimeBlocks(prev => [...prev, saved]);
        setShowAddBlock(false);
        setNewBlock({ title: '', type: 'working', startTime: '', endTime: '' });
    }
    const handleAddTask = async () => {
    try {
        const saved = await ApiService.createTask(newTask);
        setTasks(prev => [...prev, saved]);
        setShowAddTask(false);
        setNewTask({ title: '', context: '', deadline: '', highImpact: false });
    } catch (error) {
        console.error("Failed to add task", error);
    }
};catch (error) {
        console.error("Failed to add block", error);
    }
};

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto w-full">
            <header className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Executive Pipeline</h1>
                    <p className="text-white/60 text-base md:text-lg">Manage strict deadlines, planning blocks, and working sequences.</p>
                </div>

                <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden w-full md:w-auto">
                    <button
                        onClick={() => setView('today')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold tracking-wide transition-colors ${view === 'today' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold tracking-wide transition-colors ${view === 'week' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                        Week
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 pb-20">
                {/* Time Table / Schedule Column */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-[var(--aurora-pink)]" />
                            Time Table
                        </h2>
                        <button 
                            onClick={() => setShowAddBlock(true)}
                            className="text-sm font-bold text-[var(--aurora-pink)] hover:bg-[var(--aurora-pink)]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Block
                        </button>
                    </div>
                    {showAddBlock && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Add Schedule Block</h3>
            <input type="text" placeholder="Title" value={newBlock.title} onChange={(e) => setNewBlock({...newBlock, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--aurora-pink)]" />
            <select value={newBlock.type} onChange={(e) => setNewBlock({...newBlock, type: e.target.value})} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-white focus:outline-none">
                <option value="working">Working</option>
                <option value="planning">Planning</option>
                <option value="free">Free</option>
            </select>
            <input type="datetime-local" value={newBlock.startTime} onChange={(e) => setNewBlock({...newBlock, startTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
            <input type="datetime-local" value={newBlock.endTime} onChange={(e) => setNewBlock({...newBlock, endTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
            <div className="flex gap-3">
                <button onClick={() => setShowAddBlock(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5">Cancel</button>
                <button onClick={handleAddBlock} className="flex-1 py-3 rounded-xl bg-[var(--aurora-pink)] text-white font-bold hover:opacity-90">Add Block</button>
            </div>
        </div>
    </div>
)}
                    {showAddTask && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Add Task</h3>
            <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500" />
            <input type="text" placeholder="Context (e.g. Marketing)" value={newTask.context} onChange={(e) => setNewTask({...newTask, context: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500" />
            <input type="datetime-local" value={newTask.deadline} onChange={(e) => setNewTask({...newTask, deadline: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
            <label className="flex items-center gap-3 text-white/70 cursor-pointer">
                <input type="checkbox" checked={newTask.highImpact} onChange={(e) => setNewTask({...newTask, highImpact: e.target.checked})} className="w-4 h-4" />
                High Impact Task
            </label>
            <div className="flex gap-3">
                <button onClick={() => setShowAddTask(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5">Cancel</button>
                <button onClick={handleAddTask} className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold hover:opacity-90">Add Task</button>
            </div>
        </div>
    </div>
)}

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                        <div className="absolute left-[39px] md:left-[55px] top-8 bottom-8 w-px bg-white/10" />

                        <div className="space-y-6 relative z-10">
                            {timeBlocks.length > 0 ? (
                                timeBlocks.map((block) => (
                                    <div key={block.id} className="flex gap-4 md:gap-6 group">
                                        <div className="w-16 md:w-24 flex flex-col items-end pt-1 flex-shrink-0">
                                            <span className="text-sm md:text-base font-mono font-medium text-white/90">{formatTime(block.startTime)}</span>
                                            <span className="text-xs md:text-sm font-mono text-white/40">{formatTime(block.endTime)}</span>
                                        </div>

                                        <div className={`flex-1 p-4 rounded-xl border-l-4 border-y border-r border-y-white/5 border-r-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:translate-x-1 ${getBlockColor(block.type)}`}>
                                            <div className="flex items-start md:items-center gap-3">
                                                {getBlockIcon(block.type)}
                                                <div>
                                                    <h3 className="text-base md:text-lg font-bold text-white/90 tracking-wide">{block.title}</h3>
                                                    {block.context && (
                                                        <p className="text-xs md:text-sm uppercase tracking-widest opacity-70 mt-1 font-semibold">{block.context}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/40 text-center py-8">No schedule blocks. Add your first block above.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasks & Deadlines Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-amber-500" />
                            Active Deadlines
                        </h2>
                        <button 
    onClick={() => setShowAddTask(true)}
    className="text-sm font-bold text-amber-500 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
    <Plus className="w-4 h-4" /> Task
</button>
                    </div>

                    <div className="space-y-3">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`group p-4 rounded-xl border transition-all cursor-pointer ${task.completed
                                        ? 'bg-black/40 border-white/5 opacity-50'
                                        : task.highImpact
                                            ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_4px_15px_rgba(245,158,11,0.05)] hover:border-amber-500/50'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${task.completed
                                            ? 'bg-white/20 border-white/20'
                                            : task.highImpact
                                                ? 'border-amber-500/50'
                                                : 'border-white/30 group-hover:border-white/60'
                                            }`}>
                                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>

                                        <div className="flex-1">
                                            <p className={`text-base font-medium mb-1 ${task.completed ? 'line-through text-white/50' : 'text-white/90'}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs uppercase font-bold tracking-widest ${task.completed ? 'text-white/30' : 'text-white/50'}`}>
                                                    {task.context}
                                                </span>
                                                <span className={`text-xs font-mono font-medium ${task.completed ? 'text-white/30' : task.highImpact ? 'text-amber-400' : 'text-white/40'
                                                    }`}>
                                                    {formatDeadline(task.deadline)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white/40 text-center py-8">No tasks yet. Add your first task above.</p>
                        )}
                    </div>

                    {/* Dynamic Pipeline Stats */}
                    <div className="mt-8 p-6 bg-gradient-to-b from-white/5 to-transparent border border-white/5 rounded-2xl">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">Pipeline Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/60">Working Blocks</span>
                                <span className="font-mono font-medium text-white/90">{pipelineStats.working.count} ({pipelineStats.working.duration})</span>
                            </div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/60">Planning Blocks</span>
                                <span className="font-mono font-medium text-white/90">{pipelineStats.planning.count} ({pipelineStats.planning.duration})</span>
                            </div>
                            <div className="flex justify-between items-center text-sm md:text-base pt-3 border-t border-white/5">
                                <span className="text-white/60">Free Time / Rest</span>
                                <span className="font-mono font-medium text-emerald-400">{pipelineStats.free.count} ({pipelineStats.free.duration})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
