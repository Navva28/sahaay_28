import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  availableUsers: User[];
  isLoading: boolean;
  switchUser: (user: User) => void;
  login: (email: string, name?: string, role?: UserRole, location?: string) => Promise<User>;
  logout: () => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUsers = async () => {
    try {
      const users = await api.auth.getUsers();
      setAvailableUsers(users);

      // Restore active user from localStorage or pick default
      const savedUserId = localStorage.getItem('sahaay_active_user_id');
      if (savedUserId) {
        const found = users.find((u) => u.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          return;
        }
      }

      // Default to Anjali (Requester) if not selected
      if (users.length > 0 && !currentUser) {
        setCurrentUser(users[0]);
        localStorage.setItem('sahaay_active_user_id', users[0].id);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sahaay_active_user_id', user.id);
  };

  const login = async (email: string, name?: string, role: UserRole = 'requester', location = 'Bengaluru'): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await api.auth.login({ email, name, role, location });
      setCurrentUser(user);
      localStorage.setItem('sahaay_active_user_id', user.id);
      await refreshUsers();
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sahaay_active_user_id');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        isLoading,
        switchUser,
        login,
        logout,
        refreshUsers,
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
