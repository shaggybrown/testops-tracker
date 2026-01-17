import { create } from "zustand";
import { Team } from "@/types";
import { loadFromStorage, saveToStorage } from "@/stores/storage";

interface TeamsState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (team: Omit<Team, "id" | "createdAt" | "updatedAt">) => Promise<Team>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

const STORAGE_KEY = "testops.teams";

const hydrateTeams = (teams: Team[]) =>
  teams.map((team) => ({
    ...team,
    createdAt: new Date(team.createdAt),
    updatedAt: new Date(team.updatedAt),
  }));

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
      const storedTeams = loadFromStorage<Team[]>(STORAGE_KEY, []);
      const teams = storedTeams.length > 0 ? hydrateTeams(storedTeams) : mockTeams;
      set({ teams, isLoading: false });
      if (storedTeams.length === 0) {
        saveToStorage(STORAGE_KEY, teams);
      }
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
      set((state) => {
        const teams = [...state.teams, newTeam];
        saveToStorage(STORAGE_KEY, teams);
        return { teams };
      });
      return newTeam;
    } catch (error) {
      throw error;
    }
  },

  updateTeam: async (id, updates) => {
    try {
      set((state) => {
        const teams = state.teams.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        );
        saveToStorage(STORAGE_KEY, teams);
        return { teams };
      });
    } catch (error) {
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      set((state) => {
        const teams = state.teams.filter((t) => t.id !== id);
        saveToStorage(STORAGE_KEY, teams);
        return { teams };
      });
    } catch (error) {
      throw error;
    }
  },
}));
