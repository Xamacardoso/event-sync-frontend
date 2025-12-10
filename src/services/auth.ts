import api from './api';
import { LoginData, RegisterData } from '@/lib/schemas';

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data; // Retorna { access_token, user }
  },
  
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/check-token'); 
    return response.data;
  }
};