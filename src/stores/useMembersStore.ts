import { create } from "zustand";
import { Member } from "@/types";
import { loadFromStorage, saveToStorage } from "@/stores/storage";

interface MembersState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  createMember: (member: Omit<Member, "id" | "createdAt" | "updatedAt">) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

const STORAGE_KEY = "testops.members";

const hydrateMembers = (members: Member[]) =>
  members.map((member) => ({
    ...member,
    createdAt: new Date(member.createdAt),
    updatedAt: new Date(member.updatedAt),
  }));

export const useMembersStore = create<MembersState>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true });
    try {
      // TODO: Replace with actual API call
      const mockMembers: Member[] = [
        {
          id: "member-1",
          workspaceId: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          roles: ["LEAD", "QE"],
          teamIds: ["team-1"],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "member-2",
          workspaceId: "1",
          name: "Bob Smith",
          email: "bob@example.com",
          roles: ["QE"],
          teamIds: ["team-1"],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "member-3",
          workspaceId: "1",
          name: "Carol White",
          email: "carol@example.com",
          roles: ["DEVELOPER"],
          teamIds: ["team-2"],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const storedMembers = loadFromStorage<Member[]>(STORAGE_KEY, []);
      const members = storedMembers.length > 0 ? hydrateMembers(storedMembers) : mockMembers;
      set({ members, isLoading: false });
      if (storedMembers.length === 0) {
        saveToStorage(STORAGE_KEY, members);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch members",
        isLoading: false,
      });
    }
  },

  createMember: async (member) => {
    try {
      const newMember: Member = {
        ...member,
        id: `member-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => {
        const members = [...state.members, newMember];
        saveToStorage(STORAGE_KEY, members);
        return { members };
      });
      return newMember;
    } catch (error) {
      throw error;
    }
  },

  updateMember: async (id, updates) => {
    try {
      set((state) => {
        const members = state.members.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
        );
        saveToStorage(STORAGE_KEY, members);
        return { members };
      });
    } catch (error) {
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      set((state) => {
        const members = state.members.filter((m) => m.id !== id);
        saveToStorage(STORAGE_KEY, members);
        return { members };
      });
    } catch (error) {
      throw error;
    }
  },
}));
