import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/endpoints';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  username: 'admin',
  nama: 'Cecep / Super Admin',
  email: 'admin@cvmaharani.com',
  role: 'Superadmin',
  departemen: 'Manajemen',
  perusahaan: 'CV. Maharani Untung Abadi'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cv_maharani_user');
      if (saved) return JSON.parse(saved);
      // Default initial login as admin if first visit
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cv_maharani_token') || 'token-cv-maharani-default';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cv_maharani_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cv_maharani_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('cv_maharani_token', token);
    } else {
      localStorage.removeItem('cv_maharani_token');
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      if (res.data.success) {
        const userData = res.data.user;
        const userToken = res.data.token;
        setUser(userData);
        setToken(userToken);
        toast.success(`Selamat datang, ${userData.nama || userData.username}!`);
        return { success: true, user: userData };
      } else {
        toast.error(res.data.message || 'Login gagal');
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal terhubung ke server login';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cv_maharani_user');
    localStorage.removeItem('cv_maharani_token');
    toast.success('Anda telah berhasil keluar (logout) dari sistem');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
