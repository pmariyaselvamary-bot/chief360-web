import { useState, useEffect } from "react";
import { X, Building2, Briefcase, GraduationCap, Network, Landmark } from "lucide-react";

export type RoleFormData = {
    name: string;
    title: string;
    icon: string;
    color: string;
};

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: RoleFormData) => Promise<void>;
    initialData?: RoleFormData | null;
    isEditing?: boolean;
}

const AVAILABLE_ICONS = [
    { id: "Building2", component: Building2 },
    { id: "Briefcase", component: Briefcase },
    { id: "GraduationCap", component: GraduationCap },
    { id: "Network", component: Network },
    { id: "Landmark", component: Landmark },
];

const AVAILABLE_COLORS = [
    "#f72585", // Pink
    "#3a0ca3", // Deep Purple
    "#4361ee", // Blue
    "#4cc9f0", // Light Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
];

export function RoleModal({ isOpen, onClose, onSave, initialData, isEditing }: RoleModalProps) {
    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        title: "",
        icon: "Building2",
        color: "#f72585",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({ name: "", title: "", icon: "Building2", color: "#f72585" });
            }
            setError("");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim() || !formData.title.trim()) {
            setError("Role Name and Title are required.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError((err as Error).message || "Failed to save role");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6">
                    {isEditing ? "Edit Context" : "Add New Context"}
                </h2>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">Entity / Program Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Acme Corp"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--aurora-pink)] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">Your Title / Role</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. CEO, Board Member"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--aurora-pink)] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Icon</label>
                        <div className="flex gap-3">
                            {AVAILABLE_ICONS.map(({ id, component: IconComponent }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: id })}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.icon === id
                                        ? "bg-[var(--aurora-pink)]/20 text-[var(--aurora-pink)] border border-[var(--aurora-pink)]"
                                        : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
                                        }`}
                                >
                                    <IconComponent className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Theme Color</label>
                        <div className="flex gap-3">
                            {AVAILABLE_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${formData.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#111]" : ""
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full mt-6 bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-end)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Create Context")}
                    </button>
                </form>
            </div>
        </div>
    );
} 
