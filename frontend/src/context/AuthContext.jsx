import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { login as loginRequest, signup as signupRequest } from '../services/auth.service';
import {
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
  clearStoredUser,
  clearToken,
} from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token && user);

  const clearError = useCallback(() => setError(null), []);

  const handleAuthSuccess = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setStoredUser(userData);
    setTokenState(accessToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginRequest(credentials);
      handleAuthSuccess(result.data.accessToken, result.data.user);
      return result;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthSuccess]);

  const signup = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      return await signupRequest(credentials);
    } catch (err) {
      setError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearStoredUser();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      loading,
      error,
      login,
      signup,
      logout,
      clearError,
    }),
    [user, token, isAuthenticated, loading, error, login, signup, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
