import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { operator1, operator2 } from '@/data/mock';
import type { User } from '@/data/mock';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const VALID_CREDENTIALS: Record<string, string> = {
  egi: 'Desmarais123!',
  patrick: 'Desmarais123!',
};

const USER_MAP: Record<string, User> = {
  egi: { ...operator1, username: 'egi', displayName: 'egi', email: 'egi@primedesk.local' },
  patrick: { ...operator2, username: 'patrick', displayName: 'patrick', email: 'patrick@primedesk.local' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('primedesk_user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('primedesk_user');
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const validPassword = VALID_CREDENTIALS[username];
    if (validPassword && validPassword === password) {
      const user = USER_MAP[username];
      if (user) {
        localStorage.setItem('primedesk_user', JSON.stringify(user));
        setState({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('primedesk_user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
