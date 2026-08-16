import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (username: string) => {
    const { startRegistration } = await import('@simplewebauthn/browser');
    const { options, userId } = await authApi.registerStart(username);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attestation = await startRegistration({ optionsJSON: options as any });
    await authApi.registerFinish(userId, attestation);
    const me = await authApi.getMe();
    setUser(me);
  }, []);

  const login = useCallback(async (username: string) => {
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const { options, userId } = await authApi.loginStart(username);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assertion = await startAuthentication({ optionsJSON: options as any });
    await authApi.loginFinish(userId, assertion);
    const me = await authApi.getMe();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
