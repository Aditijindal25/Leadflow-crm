import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '../services/api';

const DEMO_USER = {
  id: 'demo-admin',
  name: 'Demo Admin',
  email: 'admin@leadflow.local',
  role: 'owner',
};

const demoModeEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

const AuthContext = createContext(null);

function getStoredDemoUser() {
  try {
    const value = localStorage.getItem('leadflow-demo-user');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoUser = getStoredDemoUser();
    if (demoModeEnabled && demoUser?.email === DEMO_USER.email) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data?.data?.user || null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const matchesDemoUser =
      normalizedEmail === DEMO_USER.email && String(password || '') === 'leadflow123';

    if (demoModeEnabled && matchesDemoUser) {
      localStorage.setItem('leadflow-demo-user', JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
      return DEMO_USER;
    }

    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });

      const authUser = data?.data?.user || null;
      localStorage.removeItem('leadflow-demo-user');
      setUser(authUser);
      return authUser;
    } catch (error) {
      if (demoModeEnabled && normalizedEmail === DEMO_USER.email && String(password || '') === 'leadflow123') {
        localStorage.setItem('leadflow-demo-user', JSON.stringify(DEMO_USER));
        setUser(DEMO_USER);
        return DEMO_USER;
      }

      throw error;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout errors in local demo mode
    } finally {
      localStorage.removeItem('leadflow-demo-user');
      setUser(null);
      window.location.replace('/login');
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}