import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'care_signal_token';
const USER_KEY = 'care_signal_user';

function tokenIsCurrent(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    return tokenIsCurrent(storedToken) ? storedToken : null;
  });
  const [user, setUser] = useState(() => tokenIsCurrent(localStorage.getItem(TOKEN_KEY)) ? readUser() : null);

  function login(nextToken, nextUser) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: Boolean(token) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
