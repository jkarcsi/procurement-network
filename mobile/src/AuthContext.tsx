import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "./api";
import {
  saveToken,
  loadToken,
  clearToken,
  biometricsAvailable,
  authenticateBiometric,
} from "./session";

type Status = "loading" | "locked" | "signedOut" | "signedIn";

type AuthState = {
  status: Status;
  token: string | null;
  user: api.ApiUser | null;
  company: api.ApiCompany | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  unlock: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<api.ApiUser | null>(null);
  const [company, setCompany] = useState<api.ApiCompany | null>(null);

  const loadProfile = useCallback(async (t: string) => {
    try {
      const profile = await api.me(t);
      setUser(profile.user);
      setCompany(profile.company);
    } catch {
      // Stored token is no longer valid (expired / account disabled)
      await clearToken();
      setToken(null);
      setStatus("signedOut");
    }
  }, []);

  // On launch: if a token is stored, require biometrics before using it.
  useEffect(() => {
    (async () => {
      const stored = await loadToken();
      if (!stored) {
        setStatus("signedOut");
        return;
      }
      setToken(stored);
      const needsBiometric = await biometricsAvailable();
      setStatus(needsBiometric ? "locked" : "signedIn");
      if (!needsBiometric) await loadProfile(stored);
    })();
  }, [loadProfile]);

  const unlock = useCallback(async () => {
    const ok = await authenticateBiometric();
    if (!ok || !token) return;
    await loadProfile(token);
    setStatus("signedIn");
  }, [token, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    await saveToken(result.token);
    setToken(result.token);
    setUser(result.user);
    setCompany(result.company);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
    setCompany(null);
    setStatus("signedOut");
  }, []);

  return (
    <AuthContext.Provider value={{ status, token, user, company, signIn, signOut, unlock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
