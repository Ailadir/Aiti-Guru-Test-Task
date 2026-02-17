import { create } from "zustand";
import { authApi } from "../api/auth";
import type { LoginResponse } from "../api/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: LoginResponse | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: LoginResponse) => void;
  initializeAuth: () => void;
}

// Проверяем токен при инициализации
const storedToken = localStorage.getItem("authToken");
const initialAuth = !!storedToken;

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: initialAuth,
  user: null,
  token: storedToken,

  login: async (username: string, password: string) => {
    const response = await authApi.login({ username, password });

    // Сохраняем токен в localStorage
    localStorage.setItem("authToken", response.token);

    set({
      isAuthenticated: true,
      user: response,
      token: response.token,
    });
  },

  logout: () => {
    localStorage.removeItem("authToken");
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },

  setUser: (user: LoginResponse) => {
    set({ user, isAuthenticated: true });
  },

  initializeAuth: () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      set({
        isAuthenticated: true,
        token,
      });
    }
  },
}));
