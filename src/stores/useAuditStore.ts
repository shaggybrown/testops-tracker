'use client';

import { create } from 'zustand';
import { AuditEvent } from '@/types';

interface AuditStore {
  events: AuditEvent[];
  logEvent: (event: Omit<AuditEvent, 'id' | 'createdAt'>) => void;
  getEventsByEntity: (entityType: string, entityId: string) => AuditEvent[];
  getRecentEvents: (limit?: number) => AuditEvent[];
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  events: [],

  logEvent: (event) => {
    const newEvent: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
    };
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 1000), // Keep last 1000 events
    }));
  },

  getEventsByEntity: (entityType, entityId) => {
    return get().events.filter(
      (e) => e.entityType === entityType && e.entityId === entityId
    );
  },

  getRecentEvents: (limit = 10) => {
    return get().events.slice(0, limit);
  },
}));
