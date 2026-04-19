"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  instituteId: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const COOKIE_NAME = "lms_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        setTokenCookie(token);
        set({ token, user });
      },
      logout: () => {
        clearTokenCookie();
        set({ token: null, user: null });
      },
    }),
    { name: "lms-auth" },
  ),
);

/** Re-sync cookie after zustand rehydrates (middleware reads cookies). */
export function syncAuthCookieFromStore() {
  const { token } = useAuthStore.getState();
  if (token) setTokenCookie(token);
  else clearTokenCookie();
}
