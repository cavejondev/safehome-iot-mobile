/**
 * Contexto global de autenticacao.
 * Ele centraliza login, cadastro, logout e reidratacao da sessao salva.
 */
import { createContext, useEffect, useState, type PropsWithChildren } from 'react';

import { login, register, type LoginPayload, type RegisterPayload } from '../api/auth.api';
import { appConfig } from '../config/env';
import { mockBackend } from '../services/mock.backend';
import type { AuthSession, AuthUser } from '../types/api';
import { clearSession, loadSession, saveSession } from '../services/auth.storage';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrap(): Promise<void> {
      try {
        if (appConfig.demoMode) {
          const demoSession = await mockBackend.getDemoSession();
          setSession(demoSession);
          return;
        }

        const storedSession = await loadSession();
        setSession(storedSession);
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, []);

  async function persistSession(nextSession: AuthSession): Promise<void> {
    if (appConfig.demoMode) {
      setSession(nextSession);
      return;
    }

    await saveSession(nextSession);
    setSession(nextSession);
  }

  async function signIn(payload: LoginPayload): Promise<void> {
    const nextSession = await login(payload);
    await persistSession(nextSession);
  }

  async function signUp(payload: RegisterPayload): Promise<void> {
    const nextSession = await register(payload);
    await persistSession(nextSession);
  }

  async function signOut(): Promise<void> {
    if (appConfig.demoMode) {
      const demoSession = await mockBackend.getDemoSession();
      setSession(demoSession);
      return;
    }

    await clearSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: Boolean(session?.token),
        token: session?.token ?? null,
        user: session?.user ?? null,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
