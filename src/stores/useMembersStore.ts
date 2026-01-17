import { create } from "zustand";
import { Member } from "@/types";

interface MembersState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  createMember: (member: Omit<Member, "id" | "createdAt" | "updatedAt">) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

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
      set({ members: mockMembers, isLoading: false });
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
      set((state) => ({ members: [...state.members, newMember] }));
      return newMember;
    } catch (error) {
      throw error;
    }
  },

  updateMember: async (id, updates) => {
    try {
      set((state) => ({
        members: state.members.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteMember: async (id) => {
    try {
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
