import axios from 'axios';
import { supabase } from './lib/supabase';

const API = axios.create({ baseURL: '/api' });

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const shortenUrl = (data) => API.post('/shorten', data);
export const getStats = (code) => API.get(`/stats/${code}`);
export const getAllUrls = () => API.get('/urls');
export const deleteUrl = (code) => API.delete(`/urls/${code}`);

// Supabase Auth APIs
export const supabaseRegister = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
};

export const supabaseLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const supabaseLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const supabaseGetCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data;
};

export const supabaseGetSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
};

// Keep old APIs for backward compatibility during migration
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getCurrentUser = () => API.get('/auth/me');

