import { create } from "zustand";
import { Environment, EnvironmentReservation } from "@/types";

interface EnvironmentsState {
  environments: Environment[];
  reservations: EnvironmentReservation[];
  isLoading: boolean;
  error: string | null;
  fetchEnvironments: () => Promise<void>;
  fetchReservations: () => Promise<void>;
  createEnvironment: (
    env: Omit<Environment, "id" | "createdAt" | "updatedAt">
  ) => Promise<Environment>;
  createReservation: (
    res: Omit<EnvironmentReservation, "id" | "createdAt" | "updatedAt">
  ) => Promise<EnvironmentReservation>;
  checkReservationConflict: (
    environmentId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ) => boolean;
}

export const useEnvironmentsStore = create<EnvironmentsState>((set, get) => ({
  environments: [],
  reservations: [],
  isLoading: false,
  error: null,

  fetchEnvironments: async () => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call
      const mockEnvs: Environment[] = [
        {
          id: "env-1",
          workspaceId: "1",
          name: "QA-1",
          type: "qa",
          url: "https://qa1.example.com",
          active: true,
          health: "green",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "env-2",
          workspaceId: "1",
          name: "UAT",
          type: "uat",
          url: "https://uat.example.com",
          active: true,
          health: "green",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      set({ environments: mockEnvs, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch environments",
        isLoading: false,
      });
    }
  },

  fetchReservations: async () => {
    try {
      // TODO: Replace with actual API call
      set({ reservations: [] });
    } catch (error) {
      throw error;
    }
  },

  createEnvironment: async (env) => {
    try {
      const newEnv: Environment = {
        ...env,
        id: `env-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ environments: [...state.environments, newEnv] }));
      return newEnv;
    } catch (error) {
      throw error;
    }
  },

  createReservation: async (res) => {
    try {
      const newRes: EnvironmentReservation = {
        ...res,
        id: `res-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ reservations: [...state.reservations, newRes] }));
      return newRes;
    } catch (error) {
      throw error;
    }
  },

  checkReservationConflict: (environmentId, startDate, endDate, excludeId) => {
    const { reservations } = get();
    return reservations.some((res) => {
      if (res.id === excludeId) return false;
      if (res.environmentId !== environmentId) return false;
      // Check if date ranges overlap
      return startDate < res.endDate && endDate > res.startDate;
    });
  },
}));
