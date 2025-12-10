// Esse modulo gerencia a autenticação do usuário na aplicação inteira usando React Context API e cookies.
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer';
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Cria o contexto de autenticação
const AuthContext = createContext({} as AuthContextType);

// Provedor de autenticação que envolve a aplicação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Verifica se o usuário já está autenticado ao carregar o componente
  useEffect(() => {
    const token = Cookies.get('token');
    const storedUser = Cookies.get('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Função para fazer login
  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 1 }); // 1 dia
    Cookies.set('user', JSON.stringify(userData), { expires: 1 });
    setUser(userData);
    router.push('/'); // Redireciona para home
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Usa o hook para acessar o contexto de autenticação
// UseContext simplifica o acesso ao contexto em qualquer componente
export const useAuth = () => useContext(AuthContext);