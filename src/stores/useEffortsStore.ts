import { create } from "zustand";
import { TestEffort } from "@/types";
import { loadFromStorage, saveToStorage } from "@/stores/storage";

interface EffortsState {
  efforts: TestEffort[];
  isLoading: boolean;
  error: string | null;
  filters: {
    piId?: string;
    sprintId?: string;
    teamId?: string;
    assigneeId?: string;
    status?: string;
    testTypeDefinitionId?: string;
    search?: string;
  };
  fetchEfforts: () => Promise<void>;
  createEffort: (
    effort: Omit<TestEffort, "id" | "createdAt" | "updatedAt">
  ) => Promise<TestEffort>;
  updateEffort: (id: string, updates: Partial<TestEffort>) => Promise<void>;
  deleteEffort: (id: string) => Promise<void>;
  setFilters: (filters: Partial<EffortsState["filters"]>) => void;
  getFilteredEfforts: () => TestEffort[];
}

const STORAGE_KEY = "testops.efforts";

const hydrateEfforts = (efforts: TestEffort[]) =>
  efforts.map((effort) => ({
    ...effort,
    plannedStartDate: effort.plannedStartDate ? new Date(effort.plannedStartDate) : undefined,
    plannedEndDate: effort.plannedEndDate ? new Date(effort.plannedEndDate) : undefined,
    actualStartDate: effort.actualStartDate ? new Date(effort.actualStartDate) : undefined,
    actualEndDate: effort.actualEndDate ? new Date(effort.actualEndDate) : undefined,
    createdAt: new Date(effort.createdAt),
    updatedAt: new Date(effort.updatedAt),
    blockers: effort.blockers?.map((blocker) => ({
      ...blocker,
      createdAt: new Date(blocker.createdAt),
    })),
    links: effort.links?.map((link) => ({
      ...link,
      createdAt: new Date(link.createdAt),
    })),
  }));

export const useEffortsStore = create<EffortsState>((set, get) => ({
  efforts: [],
  isLoading: false,
  error: null,
  filters: {},

  fetchEfforts: async () => {
    set({ isLoading: true });
    try {
      // Mock data with realistic test efforts
      const mockEfforts: TestEffort[] = [
        {
          id: "effort-1",
          workspaceId: "1",
          piId: "pi-1",
          sprintId: "sprint-1",
          teamId: "team-1",
          testTypeDefinitionId: "tt-1",
          title: "API Regression Testing",
          description: "Full regression test suite for authentication API",
          status: "in_progress",
          priority: "high",
          assigneeId: "member-1",
          environmentIds: ["env-1"],
          plannedStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          plannedEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          estimate: 16,
          estimateUnit: "hours",
          progress: 60,
          tags: ["api", "authentication"],
          blockers: [],
          links: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "effort-2",
          workspaceId: "1",
          piId: "pi-1",
          sprintId: "sprint-1",
          teamId: "team-1",
          testTypeDefinitionId: "tt-1",
          title: "UI Smoke Tests",
          description: "Basic UI smoke test coverage",
          status: "planned",
          priority: "medium",
          assigneeId: "member-2",
          environmentIds: ["env-2"],
          plannedStartDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          plannedEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          estimate: 8,
          estimateUnit: "hours",
          progress: 0,
          tags: ["ui", "smoke"],
          blockers: [],
          links: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "effort-3",
          workspaceId: "1",
          piId: "pi-1",
          sprintId: "sprint-1",
          teamId: "team-2",
          testTypeDefinitionId: "tt-2",
          title: "Performance Test Automation",
          description: "Automation for performance benchmarks",
          status: "planned",
          priority: "medium",
          assigneeId: "member-3",
          environmentIds: ["env-1", "env-2"],
          plannedStartDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          plannedEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          estimate: 32,
          estimateUnit: "hours",
          progress: 0,
          tags: ["performance", "automation"],
          blockers: [],
          links: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "effort-4",
          workspaceId: "1",
          piId: "pi-1",
          sprintId: "sprint-1",
          teamId: "team-1",
          testTypeDefinitionId: "tt-3",
          title: "System Integration Testing",
          description: "End-to-end system integration testing",
          status: "blocked",
          priority: "high",
          assigneeId: "member-1",
          environmentIds: ["env-2"],
          plannedStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          plannedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          estimate: 12,
          estimateUnit: "hours",
          progress: 10,
          tags: ["integration"],
          blockers: [
            {
              id: "blocker-1",
              effortId: "effort-4",
              title: "Environment down",
              description: "UAT environment experiencing issues",
              category: "environment",
              severity: "high",
              createdAt: new Date(),
            },
          ],
          links: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const storedEfforts = loadFromStorage<TestEffort[]>(STORAGE_KEY, []);
      const efforts = storedEfforts.length > 0 ? hydrateEfforts(storedEfforts) : mockEfforts;
      set({ efforts, isLoading: false });
      if (storedEfforts.length === 0) {
        saveToStorage(STORAGE_KEY, efforts);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch efforts",
        isLoading: false,
      });
    }
  },

  createEffort: async (effort) => {
    try {
      const newEffort: TestEffort = {
        ...effort,
        id: `effort-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => {
        const efforts = [...state.efforts, newEffort];
        saveToStorage(STORAGE_KEY, efforts);
        return { efforts };
      });
      return newEffort;
    } catch (error) {
      throw error;
    }
  },

  updateEffort: async (id, updates) => {
    try {
      set((state) => {
        const efforts = state.efforts.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        );
        saveToStorage(STORAGE_KEY, efforts);
        return { efforts };
      });
    } catch (error) {
      throw error;
    }
  },

  deleteEffort: async (id) => {
    try {
      set((state) => {
        const efforts = state.efforts.filter((e) => e.id !== id);
        saveToStorage(STORAGE_KEY, efforts);
        return { efforts };
      });
    } catch (error) {
      throw error;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  getFilteredEfforts: () => {
    const { efforts, filters } = get();
    return efforts.filter((effort) => {
      if (filters.piId && effort.piId !== filters.piId)
        return false;
      if (filters.sprintId && effort.sprintId !== filters.sprintId)
        return false;
      if (filters.teamId && effort.teamId !== filters.teamId) return false;
      if (filters.assigneeId && effort.assigneeId !== filters.assigneeId)
        return false;
      if (filters.status && effort.status !== filters.status) return false;
      if (filters.testTypeDefinitionId && effort.testTypeDefinitionId !== filters.testTypeDefinitionId) return false;
      if (
        filters.search &&
        !effort.title
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  },
}));
