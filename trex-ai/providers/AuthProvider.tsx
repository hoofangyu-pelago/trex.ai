import React, { createContext, useCallback, useMemo, useState } from 'react';
import { MOCK_USERS } from '@/data/mockUsers';

export type UserRole = 'athlete' | 'coach' | 'master';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AppUser | null;
  role: UserRole | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const signIn = useCallback(async (email: string) => {
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found as AppUser);
      setRole((found.role as UserRole) ?? 'athlete');
      return;
    }
    // Fallback: first user
    const fallback = MOCK_USERS[0] as AppUser;
    setUser(fallback);
    setRole((fallback.role as UserRole) ?? 'athlete');
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ user, role, signIn, signOut }),
    [user, role, signIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

