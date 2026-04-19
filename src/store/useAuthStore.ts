import { create } from "zustand";

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    updateAvatar: (url: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    login: (user) => set({ isAuthenticated: true, user }),
    logout: () => set({ isAuthenticated: false, user: null }),
    updateAvatar: (avatarUrl) => set((state) => ({
        user: state.user ? { ...state.user, avatarUrl } : null
    })),
}));
