import { create, type StateCreator } from "zustand";
import type { AuthUser, LoginInput } from "../types/auth";
import { loginApi } from "../services/authService";


interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  login: (input: LoginInput) => Promise<boolean>;
  logout: () => void;
}

const authStore: StateCreator<AuthStore> = (set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (input) => {
    set({ loading: true, error: null });

    try {
      const user = await loginApi(input);

      set({ user, error: null });

      return true;
    } catch (error) {
      set({
        user: null,
        error: error instanceof Error ? error.message : "Login failed",
      });

      return false;
    } finally {
      set({ loading: false });
    }
  },
  logout: () => {
    set({ user: null, loading: false, error: null });
  },
});

export const useAuthStore = create<AuthStore>()(authStore);
