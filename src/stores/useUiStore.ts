import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  loading: boolean;
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    type: "success" | "error" | "info";
  }>;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addToast: (
    title: string,
    description?: string,
    type?: "success" | "error" | "info"
  ) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: true,
  loading: false,
  toasts: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ loading }),

  addToast: (title, description, type = "info") => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type }],
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
