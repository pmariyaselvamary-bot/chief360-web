/**
 * Chief360 Copilot API Service Layer
 * 
 * Handles all backend communication.
 * All endpoints use JWT Bearer auth from localStorage.
 */

const API_BASE_URL = "https://chief360-backend-production.up.railway.app/api";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
}

/**
 * Core fetch wrapper with centralized error handling and auth token injection
 */
async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const token = typeof window !== 'undefined' ? localStorage.getItem("auth-token") : null;

    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Error] ${method} ${endpoint}:`, error);
        throw error;
    }
}

// ═══════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    isTwoFactorEnabled: boolean;
    createdAt?: string;
}

export interface RoleEntity {
    id: string;
    name: string;
    title: string;
    icon: string;
    active: boolean;
    hours: number;
    taskCount: number;
    kpiStatus: string;
    color: string;
}

export interface TaskItem {
    id: string;
    title: string;
    context: string;
    deadline: string;
    completed: boolean;
    highImpact: boolean;
}

export interface ScheduleBlock {
    id: string;
    title: string;
    type: 'working' | 'free' | 'planning';
    startTime: string;
    endTime: string;
    context?: string;
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'warning' | 'info' | 'success' | 'error';
    icon: string;
    read: boolean;
    createdAt: string;
}

export interface DashboardMetrics {
    strategicScore: number;
    roleConcentration: { name: string; title: string; percentage: number; active: boolean }[];
    deepWorkBlocks: { title: string; type: string; startTime: string; endTime: string; context?: string }[];
    conflicts: { type: string; message: string; blocks: string[] }[];
    briefItems: string[];
    stats: {
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        totalRoles: number;
        totalScheduleBlocks: number;
    };
}

export interface IntelligenceBrief {
    weeklySummary: string;
    fatigue: { level: number; status: string; color: string; description: string };
    predictedDrain: string;
    conflictForecast: {
        date: string;
        severity: 'critical' | 'warning';
        title: string;
        description: string;
        blocks: string[];
    }[];
    stats: {
        totalRoles: number;
        totalHoursAllocated: number;
        completionRate: number;
        pendingHighImpact: number;
        upcomingConflicts: number;
    };
}

// ═══════════════════════════════════════════
//  API SERVICE
// ═══════════════════════════════════════════

export const ApiService = {
    // --- Authentication ---

    async login(credentials: Record<string, string>) {
        return apiFetch<{ token?: string; user?: UserProfile; requires2FA?: boolean; userId?: string }>("/auth/login", {
            method: "POST",
            body: credentials,
        });
    },

    async signup(payload: Record<string, string>) {
        return apiFetch<{ token: string; user: UserProfile }>("/auth/signup", {
            method: "POST",
            body: payload,
        });
    },

    async verify2FA(payload: { userId: string, token: string }) {
        return apiFetch<{ token: string; user: UserProfile }>("/auth/2fa/verify", {
            method: "POST",
            body: payload,
        });
    },

    // --- User Profile ---

    async getProfile() {
        return apiFetch<UserProfile>("/users/me");
    },

    async updateProfile(data: { name?: string; role?: string }) {
        return apiFetch<UserProfile>("/users/me", {
            method: "PUT",
            body: data,
        });
    },

    async updateAvatar(base64Image: string) {
        return apiFetch<{ avatarUrl: string }>("/users/me/avatar", {
            method: "PUT",
            body: { image: base64Image },
        });
    },

    // --- Dashboard ---

    async getDashboardMetrics() {
        return apiFetch<DashboardMetrics>("/dashboard/metrics");
    },

    // --- Intelligence ---

    async getIntelligenceBrief() {
        return apiFetch<IntelligenceBrief>("/intelligence/brief");
    },

    // --- AI Copilot ---

    async queryCopilot(message: string) {
        return apiFetch<{ response: string }>("/copilot/query", {
            method: "POST",
            body: { message },
        });
    },

    // --- Roles ---

    async getRoles() {
        return apiFetch<RoleEntity[]>("/roles");
    },

    async createRole(data: Partial<RoleEntity>) {
        return apiFetch<RoleEntity>("/roles", {
            method: "POST",
            body: data,
        });
    },

    async activateRole(roleId: string) {
        return apiFetch<RoleEntity>(`/roles/${roleId}/activate`, {
            method: "PATCH",
        });
    },

    async updateRole(roleId: string, data: Partial<RoleEntity>) {
        return apiFetch<RoleEntity>(`/roles/${roleId}`, {
            method: "PUT",
            body: data,
        });
    },

    async deleteRole(roleId: string) {
        return apiFetch<{ message: string }>(`/roles/${roleId}`, {
            method: "DELETE",
        });
    },

    // --- Notifications ---

    async getNotifications() {
        return apiFetch<NotificationItem[]>("/notifications");
    },
    async createNotification(data: { title: string; message: string; type: string; icon: string }) {
    return apiFetch<{ message: string }>("/notifications", {
        method: "POST",
        body: data,
    });
},

    async markNotificationRead(id: string) {
        return apiFetch(`/notifications/${id}/read`, {
            method: "PATCH",
        });
    },

    async markAllNotificationsRead() {
        return apiFetch("/notifications/read-all", {
            method: "PATCH",
        });
    },

    async dismissNotification(id: string) {
        return apiFetch(`/notifications/${id}`, {
            method: "DELETE",
        });
    },

    // --- Tasks ---

    async getTasks() {
        return apiFetch<TaskItem[]>("/tasks");
    },

    async createTask(data: { title: string; context: string; deadline: string; highImpact: boolean }) {
        return apiFetch<TaskItem>("/tasks", {
            method: "POST",
            body: data,
        });
    },

    async toggleTaskCompletion(taskId: string) {
        return apiFetch<TaskItem>(`/tasks/${taskId}/complete`, {
            method: 'PATCH',
        });
    },
    async deleteTask(taskId: string) {
    return apiFetch<{ message: string }>(`/tasks/${taskId}`, {
        method: "DELETE",
    });
},

    // --- Schedules ---

    async getSchedules() {
        return apiFetch<ScheduleBlock[]>("/schedules");
    },
    async forgotPassword(email: string) {
    return apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
    });
},
    async changePassword(data: { currentPassword: string; newPassword: string }) {
        return apiFetch<{ message: string }>("/auth/change-password", {
            method: "POST",
            body: data,
        });
    },

    async createSchedule(data: { title: string; type: string; startTime: string; endTime: string; context?: string }) {
        return apiFetch<ScheduleBlock>("/schedules", {
            method: "POST",
            body: data,
        });
    },
    async deleteSchedule(id: string) {
        return apiFetch<void>(`/schedules/${id}`, {
            method: "DELETE",
        });
    },
};
