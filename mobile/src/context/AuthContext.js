import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);
const TOKEN_KEY = 'caresignal_token';
const USER_KEY = 'caresignal_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        if (storedToken[1] && storedUser[1]) {
          setToken(storedToken[1]);
          setUser(JSON.parse(storedUser[1]));
        }
      } catch (error) {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function saveSession(nextToken, nextUser) {
    await AsyncStorage.multiSet([[TOKEN_KEY, nextToken], [USER_KEY, JSON.stringify(nextUser)]]);
    setToken(nextToken);
    setUser(nextUser);
  }

  async function login(email, password) {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    await saveSession(data.token, data.user);
    return data;
  }

  async function register(name, email, password) {
    const { data } = await apiClient.post('/api/auth/register', { name, email, password });
    await saveSession(data.token, data.user);
    return data;
  }

  async function logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ token, user, isLoading, isAuthenticated: Boolean(token), login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
