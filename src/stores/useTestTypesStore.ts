'use client';

import { create } from 'zustand';
import { TestTypeDefinition } from '@/types';
import { loadFromStorage, saveToStorage } from '@/stores/storage';

interface TestTypesStore {
  testTypes: TestTypeDefinition[];
  fetchTestTypes: () => void;
  createTestType: (testType: Omit<TestTypeDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestType: (id: string, updates: Partial<TestTypeDefinition>) => void;
  deleteTestType: (id: string) => void;
  getTestType: (id: string) => TestTypeDefinition | undefined;
  getTestTypesByTeam: (teamId: string) => TestTypeDefinition[];
}

const STORAGE_KEY = 'testops.test-types';

const hydrateTestTypes = (testTypes: TestTypeDefinition[]) =>
  testTypes.map((tt) => ({
    ...tt,
    createdAt: new Date(tt.createdAt),
    updatedAt: new Date(tt.updatedAt),
  }));

const mockTestTypes: TestTypeDefinition[] = [
  {
    id: 'tt-1',
    workspaceId: 'ws-1',
    name: 'Regression Testing',
    description: 'Full regression test suite',
    ownerTeamId: 'team-1',
    participatingTeamIds: ['team-1', 'team-2'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tt-2',
    workspaceId: 'ws-1',
    name: 'Performance Testing',
    description: 'Load and stress testing',
    ownerTeamId: 'team-2',
    participatingTeamIds: ['team-2'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tt-3',
    workspaceId: 'ws-1',
    name: 'System Integration',
    description: 'Integration with third-party systems',
    ownerTeamId: 'team-1',
    participatingTeamIds: ['team-1', 'team-2'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tt-4',
    workspaceId: 'ws-1',
    name: 'Security Testing',
    description: 'Security vulnerability scanning',
    ownerTeamId: 'team-2',
    participatingTeamIds: ['team-2'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tt-5',
    workspaceId: 'ws-1',
    name: 'Regression Testing',
    description: 'General regression test suite - assign to team per test cycle',
    participatingTeamIds: ['team-1', 'team-2'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useTestTypesStore = create<TestTypesStore>((set, get) => ({
  testTypes: [],

  fetchTestTypes: () => {
    const storedTypes = loadFromStorage<TestTypeDefinition[]>(STORAGE_KEY, []);
    const testTypes = storedTypes.length > 0 ? hydrateTestTypes(storedTypes) : mockTestTypes;
    set({ testTypes });
    if (storedTypes.length === 0) {
      saveToStorage(STORAGE_KEY, testTypes);
    }
  },

  createTestType: (testType) => {
    const newTestType: TestTypeDefinition = {
      ...testType,
      id: `tt-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const testTypes = [...state.testTypes, newTestType];
      saveToStorage(STORAGE_KEY, testTypes);
      return { testTypes };
    });
  },

  updateTestType: (id, updates) => {
    set((state) => {
      const testTypes = state.testTypes.map((tt) =>
        tt.id === id
          ? { ...tt, ...updates, updatedAt: new Date() }
          : tt
      );
      saveToStorage(STORAGE_KEY, testTypes);
      return { testTypes };
    });
  },

  deleteTestType: (id) => {
    set((state) => {
      const testTypes = state.testTypes.filter((tt) => tt.id !== id);
      saveToStorage(STORAGE_KEY, testTypes);
      return { testTypes };
    });
  },

  getTestType: (id) => {
    return get().testTypes.find((tt) => tt.id === id);
  },

  getTestTypesByTeam: (teamId) => {
    return get().testTypes.filter(
      (tt) =>
        tt.ownerTeamId === teamId || tt.participatingTeamIds.includes(teamId)
    );
  },
}));
