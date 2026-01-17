import { create } from "zustand";
import { Team, Member, TestType, Status } from "@/types";

interface ConfigState {
  testTypes: TestType[];
  statuses: Status[];
  tags: string[];
  setTestTypes: (types: TestType[]) => void;
  setStatuses: (statuses: Status[]) => void;
  setTags: (tags: string[]) => void;
}

const DEFAULT_TEST_TYPES: TestType[] = [
  "regression",
  "smoke",
  "exploratory",
  "performance",
  "security",
  "uat",
];

const DEFAULT_STATUSES: Status[] = [
  "planned",
  "in_progress",
  "blocked",
  "done",
];

export const useConfigStore = create<ConfigState>((set) => ({
  testTypes: DEFAULT_TEST_TYPES,
  statuses: DEFAULT_STATUSES,
  tags: ["backend", "frontend", "api", "ui", "database", "performance"],

  setTestTypes: (types) => set({ testTypes: types }),
  setStatuses: (statuses) => set({ statuses }),
  setTags: (tags) => set({ tags }),
}));
