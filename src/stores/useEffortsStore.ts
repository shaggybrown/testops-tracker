import { create } from "zustand";
import { TestEffort } from "@/types";

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
  setFilters: (filters: Partial<EffortsState["filters"]>) => void;
  getFilteredEfforts: () => TestEffort[];
}

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
      set({ efforts: mockEfforts, isLoading: false });
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
      set((state) => ({ efforts: [...state.efforts, newEffort] }));
      return newEffort;
    } catch (error) {
      throw error;
    }
  },

  updateEffort: async (id, updates) => {
    try {
      set((state) => ({
        efforts: state.efforts.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
      }));
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
