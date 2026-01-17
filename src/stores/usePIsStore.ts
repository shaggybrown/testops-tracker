'use client';

import { create } from 'zustand';
import { ProgramIncrement } from '@/types';

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

export const usePIsStore = create<PIsStore>((set, get) => ({
  pis: mockPIs,

  fetchPIs: () => {
    // In a real app, this would call an API
    set({ pis: mockPIs });
  },

  createPI: (pi) => {
    const newPI: ProgramIncrement = {
      ...pi,
      id: `pi-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      pis: [...state.pis, newPI],
    }));
  },

  updatePI: (id, updates) => {
    set((state) => ({
      pis: state.pis.map((pi) =>
        pi.id === id
          ? { ...pi, ...updates, updatedAt: new Date() }
          : pi
      ),
    }));
  },

  deletePI: (id) => {
    set((state) => ({
      pis: state.pis.filter((pi) => pi.id !== id),
    }));
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
