import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('bibliotech_token');
      const storedUser = authService.getCurrentUser();

      if (storedToken) {
        const decoded = authService.parseJwt(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded && decoded.exp && decoded.exp < currentTime) {
          // Token expired
          authService.logout();
          setUser(null);
          setToken(null);
        } else {
          setToken(storedToken);
          setUser(
            storedUser || {
              userId: decoded ? decoded.userId : null,
              username: decoded ? decoded.sub : 'User',
              role: decoded ? decoded.role : 'STUDENT',
            }
          );
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const role = user ? user.role : null;
  const isStudent = role === 'STUDENT';
  const isLibrarian = role === 'LIBRARIAN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isStudent,
        isLibrarian,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
