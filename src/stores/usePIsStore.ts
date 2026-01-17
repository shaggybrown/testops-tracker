'use client';

import { create } from 'zustand';
import { ProgramIncrement } from '@/types';
import { loadFromStorage, saveToStorage } from '@/stores/storage';

interface PIsStore {
  pis: ProgramIncrement[];
  fetchPIs: () => void;
  createPI: (pi: Omit<ProgramIncrement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePI: (id: string, updates: Partial<ProgramIncrement>) => void;
  deletePI: (id: string) => void;
  getPI: (id: string) => ProgramIncrement | undefined;
  getCurrentPI: () => ProgramIncrement | undefined;
}

const mockPIs: ProgramIncrement[] = [
  {
    id: 'pi-1',
    workspaceId: 'ws-1',
    name: 'PI 2026-01',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-03-15'),
    goal: 'Core platform features and API improvements',
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'pi-2',
    workspaceId: 'ws-1',
    name: 'PI 2026-02',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-06-15'),
    goal: 'Performance optimization and scaling',
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const STORAGE_KEY = 'testops.pis';

const hydratePIs = (pis: ProgramIncrement[]) =>
  pis.map((pi) => ({
    ...pi,
    startDate: new Date(pi.startDate),
    endDate: new Date(pi.endDate),
    createdAt: new Date(pi.createdAt),
    updatedAt: new Date(pi.updatedAt),
  }));

export const usePIsStore = create<PIsStore>((set, get) => ({
  pis: [],

  fetchPIs: () => {
    const storedPIs = loadFromStorage<ProgramIncrement[]>(STORAGE_KEY, []);
    const pis = storedPIs.length > 0 ? hydratePIs(storedPIs) : mockPIs;
    set({ pis });
    if (storedPIs.length === 0) {
      saveToStorage(STORAGE_KEY, pis);
    }
  },

  createPI: (pi) => {
    const newPI: ProgramIncrement = {
      ...pi,
      id: `pi-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const pis = [...state.pis, newPI];
      saveToStorage(STORAGE_KEY, pis);
      return { pis };
    });
  },

  updatePI: (id, updates) => {
    set((state) => {
      const pis = state.pis.map((pi) =>
        pi.id === id
          ? { ...pi, ...updates, updatedAt: new Date() }
          : pi
      );
      saveToStorage(STORAGE_KEY, pis);
      return { pis };
    });
  },

  deletePI: (id) => {
    set((state) => {
      const pis = state.pis.filter((pi) => pi.id !== id);
      saveToStorage(STORAGE_KEY, pis);
      return { pis };
    });
  },

  getPI: (id) => {
    return get().pis.find((pi) => pi.id === id);
  },

  getCurrentPI: () => {
    const now = new Date();
    return get().pis.find(
      (pi) => pi.startDate <= now && pi.endDate >= now && !pi.archived
    );
  },
}));
