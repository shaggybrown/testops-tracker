import { create } from "zustand";
import { Environment, EnvironmentConnection, EnvironmentReservation } from "@/types";
import { loadFromStorage, saveToStorage } from "@/stores/storage";

interface EnvironmentsState {
  environments: Environment[];
  connections: EnvironmentConnection[];
  reservations: EnvironmentReservation[];
  isLoading: boolean;
  error: string | null;
  fetchEnvironments: () => Promise<void>;
  fetchConnections: () => void;
  fetchReservations: () => Promise<void>;
  createEnvironment: (
    env: Omit<Environment, "id" | "createdAt" | "updatedAt">
  ) => Promise<Environment>;
  createConnection: (fromEnvironmentId: string, toEnvironmentId: string) => void;
  deleteConnection: (connectionId: string) => void;
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

const ENV_STORAGE_KEY = "testops.environments";
const CONNECTION_STORAGE_KEY = "testops.environment-connections";
const RESERVATION_STORAGE_KEY = "testops.environment-reservations";

const hydrateEnvironments = (envs: Environment[]) =>
  envs.map((env) => ({
    ...env,
    location: env.location || "on_prem",
    createdAt: new Date(env.createdAt),
    updatedAt: new Date(env.updatedAt),
    healthUpdatedAt: env.healthUpdatedAt ? new Date(env.healthUpdatedAt) : undefined,
  }));

const hydrateConnections = (connections: EnvironmentConnection[]) =>
  connections.map((connection) => ({
    ...connection,
    createdAt: new Date(connection.createdAt),
  }));

const hydrateReservations = (reservations: EnvironmentReservation[]) =>
  reservations.map((res) => ({
    ...res,
    startDate: new Date(res.startDate),
    endDate: new Date(res.endDate),
    createdAt: new Date(res.createdAt),
  }));

export const useEnvironmentsStore = create<EnvironmentsState>((set, get) => ({
  environments: [],
  connections: [],
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
          location: "aws",
          awsAccountName: "QA Account",
          awsAccountId: "123456789012",
          awsRegion: "us-east-1",
          instanceGroup: "qa",
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
          name: "QA-2",
          location: "aws",
          awsAccountName: "QA Account",
          awsAccountId: "123456789012",
          awsRegion: "us-east-1",
          instanceGroup: "qa",
          type: "qa",
          url: "https://qa2.example.com",
          active: true,
          health: "green",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "env-3",
          workspaceId: "1",
          name: "UAT",
          location: "on_prem",
          instanceGroup: "uat",
          type: "uat",
          url: "https://uat.example.com",
          active: true,
          health: "green",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const storedEnvs = loadFromStorage<Environment[]>(ENV_STORAGE_KEY, []);
      const environments = storedEnvs.length > 0 ? hydrateEnvironments(storedEnvs) : mockEnvs;
      set({ environments, isLoading: false });
      if (storedEnvs.length === 0) {
        saveToStorage(ENV_STORAGE_KEY, environments);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch environments",
        isLoading: false,
      });
    }
  },

  fetchConnections: () => {
    const storedConnections = loadFromStorage<EnvironmentConnection[]>(CONNECTION_STORAGE_KEY, []);
    const connections = storedConnections.length > 0 ? hydrateConnections(storedConnections) : [];
    set({ connections });
  },

  fetchReservations: async () => {
    try {
      // TODO: Replace with actual API call
      const storedReservations = loadFromStorage<EnvironmentReservation[]>(RESERVATION_STORAGE_KEY, []);
      const reservations = storedReservations.length > 0 ? hydrateReservations(storedReservations) : [];
      set({ reservations });
    } catch (error) {
      throw error;
    }
  },

  createEnvironment: async (env) => {
    try {
      const newEnv: Environment = {
        ...env,
        location: env.location || "on_prem",
        id: `env-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => {
        const environments = [...state.environments, newEnv];
        saveToStorage(ENV_STORAGE_KEY, environments);
        return { environments };
      });
      return newEnv;
    } catch (error) {
      throw error;
    }
  },

  createConnection: (fromEnvironmentId, toEnvironmentId) => {
    if (fromEnvironmentId === toEnvironmentId) return;
    const [left, right] =
      fromEnvironmentId < toEnvironmentId
        ? [fromEnvironmentId, toEnvironmentId]
        : [toEnvironmentId, fromEnvironmentId];

    set((state) => {
      const exists = state.connections.some(
        (connection) =>
          connection.direction === "bidirectional" &&
          ((connection.fromEnvironmentId === left && connection.toEnvironmentId === right) ||
            (connection.fromEnvironmentId === right && connection.toEnvironmentId === left))
      );
      if (exists) {
        return state;
      }

      const newConnection: EnvironmentConnection = {
        id: `conn-${Date.now()}`,
        workspaceId: "1",
        fromEnvironmentId: left,
        toEnvironmentId: right,
        direction: "bidirectional",
        createdAt: new Date(),
      };

      const connections = [...state.connections, newConnection];
      saveToStorage(CONNECTION_STORAGE_KEY, connections);
      return { connections };
    });
  },

  deleteConnection: (connectionId) => {
    set((state) => {
      const connections = state.connections.filter((connection) => connection.id !== connectionId);
      saveToStorage(CONNECTION_STORAGE_KEY, connections);
      return { connections };
    });
  },

  createReservation: async (res) => {
    try {
      const newRes: EnvironmentReservation = {
        ...res,
        id: `res-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => {
        const reservations = [...state.reservations, newRes];
        saveToStorage(RESERVATION_STORAGE_KEY, reservations);
        return { reservations };
      });
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
