import { create, type StateCreator } from "zustand";
import type { AuthUser, LoginInput } from "../types/auth";
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
} from "../services/authService";

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "error";

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  logoutLoading: boolean;
  error: string | null;

  authStatus: AuthStatus;
  checkAuth: () => Promise<void>;

  login: (input: LoginInput) => Promise<boolean>;
  logout: () => Promise<void>;
}

const authStore: StateCreator<AuthStore> = (set, get) => ({
  user: null,
  loading: false,
  logoutLoading: false,
  error: null,
  authStatus: "checking",
  checkAuth: async () => {
    set({ authStatus: "checking", error: null });

    try {
      const user = await getCurrentUserApi();

      set({
        user,
        authStatus: user ? "authenticated" : "unauthenticated",
      });
    } catch (error) {
      set({
        user: null,
        authStatus: "error",
        error:
          error instanceof Error ? error.message : "Unable to verify session",
      });
    }
  },

  login: async (input) => {
    set({ loading: true, error: null });
    try {
      const user = await loginApi(input);

      set({
        user,
        error: null,
        authStatus: "authenticated",
      });

      return true;
    } catch (error) {
      set({
        user: null,
        authStatus: "unauthenticated",
        error: error instanceof Error ? error.message : "Login failed",
      });

      return false;
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    if(get().logoutLoading) return
    set({ logoutLoading: true, error: null });
    
    try {
      await logoutApi();
      set({
        user: null,
        authStatus: "unauthenticated",
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to logout",
      });
    } finally {
      set({ logoutLoading: false });
    }
  },
});

export const useAuthStore = create<AuthStore>()(authStore);
