import { create } from "zustand";
import { Sprint } from "@/types";

interface SprintsState {
  sprints: Sprint[];
  isLoading: boolean;
  error: string | null;
  fetchSprints: () => Promise<void>;
  createSprint: (sprint: Omit<Sprint, "id" | "createdAt" | "updatedAt">) => Promise<Sprint>;
  updateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>;
  deleteSprint: (id: string) => Promise<void>;
  getSprintsByPI: (piId: string) => Sprint[];
}

export const useSprintsStore = create<SprintsState>((set, get) => ({
  sprints: [],
  isLoading: false,
  error: null,

  fetchSprints: async () => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call
      const now = new Date();
      const mockSprints: Sprint[] = [
        {
          id: "sprint-1",
          workspaceId: "1",
          piId: "pi-1",
          name: "Sprint 0",
          sprintNumber: 0,
          startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          goal: "Core authentication and team setup",
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "sprint-2",
          workspaceId: "1",
          piId: "pi-1",
          name: "Sprint 1",
          sprintNumber: 1,
          startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
          goal: "Environment management and reservations",
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "sprint-3",
          workspaceId: "1",
          piId: "pi-1",
          name: "Hardening Sprint",
          sprintNumber: 5,
          startDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
          endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
          goal: "Final testing and hardening",
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      set({ sprints: mockSprints, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch sprints",
        isLoading: false,
      });
    }
  },

  createSprint: async (sprint) => {
    try {
      const newSprint: Sprint = {
        ...sprint,
        id: `sprint-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ sprints: [...state.sprints, newSprint] }));
      return newSprint;
    } catch (error) {
      throw error;
    }
  },

  updateSprint: async (id, updates) => {
    try {
      set((state) => ({
        sprints: state.sprints.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteSprint: async (id) => {
    try {
      set((state) => ({
        sprints: state.sprints.filter((s) => s.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  getSprintsByPI: (piId) => {
    return get().sprints.filter((s) => s.piId === piId);
  },
}));

