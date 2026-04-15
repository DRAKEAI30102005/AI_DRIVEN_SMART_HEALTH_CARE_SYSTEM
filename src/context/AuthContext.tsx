import React, {createContext, useContext, useEffect, useState} from 'react';

interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface UserProfile extends AuthUser {
  role: 'patient' | 'doctor' | 'admin';
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  loginPending: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin123';
const DEMO_STORAGE_KEY = 'healthpulse-demo-session';

const demoProfile: UserProfile = {
  uid: 'local-admin',
  email: 'admin@healthpulse.local',
  displayName: 'Admin Patient',
  photoURL: 'https://picsum.photos/seed/admin-healthpulse/200/200',
  role: 'admin',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);

  useEffect(() => {
    const hasDemoSession = localStorage.getItem(DEMO_STORAGE_KEY) === 'true';

    if (hasDemoSession) {
      setUser(demoProfile);
      setProfile(demoProfile);
    } else {
      setUser(null);
      setProfile(null);
    }

    setLoading(false);
    setLoginPending(false);
  }, []);

  const login = async ({username, password}: LoginCredentials) => {
    const trimmedUsername = username.trim();
    setAuthError(null);
    setLoginPending(true);

    if (trimmedUsername === DEMO_USERNAME && password === DEMO_PASSWORD) {
      localStorage.setItem(DEMO_STORAGE_KEY, 'true');
      setUser(demoProfile);
      setProfile(demoProfile);
      setLoginPending(false);
      return;
    }

    setAuthError('Invalid username or password. Use the local app credentials to continue.');
    setLoginPending(false);
  };

  const logout = async () => {
    setAuthError(null);
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setUser(null);
    setProfile(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{user, profile, loading, authError, loginPending, login, logout, clearAuthError}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
