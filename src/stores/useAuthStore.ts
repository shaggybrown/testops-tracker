import { create } from "zustand";
import { Member, Role } from "@/types";

interface AuthState {
  user: Member | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with actual auth API call
      const mockUser: Member = {
        id: "1",
        workspaceId: "1",
        name: "Demo User",
        email,
        roles: ["ADMIN"],
        teamIds: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set({ user: mockUser, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
    }
  },

  logout: () => {
    set({ user: null });
  },

  hasRole: (role: Role) => {
    const { user } = get();
    return user?.roles.includes(role) ?? false;
  },
}));
