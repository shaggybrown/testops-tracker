import { create } from "zustand";
import { Team } from "@/types";

interface TeamsState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (team: Omit<Team, "id" | "createdAt" | "updatedAt">) => Promise<Team>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

export const useTeamsStore = create<TeamsState>((set) => ({
  teams: [],
  isLoading: false,
  error: null,

  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call
      const mockTeams: Team[] = [
        {
          id: "team-1",
          workspaceId: "1",
          name: "QA Team",
          description: "Quality assurance team",
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "team-2",
          workspaceId: "1",
          name: "Automation Team",
          description: "Test automation engineers",
          archived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      set({ teams: mockTeams, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch teams",
        isLoading: false,
      });
    }
  },

  createTeam: async (team) => {
    try {
      const newTeam: Team = {
        ...team,
        id: `team-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ teams: [...state.teams, newTeam] }));
      return newTeam;
    } catch (error) {
      throw error;
    }
  },

  updateTeam: async (id, updates) => {
    try {
      set((state) => ({
        teams: state.teams.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
