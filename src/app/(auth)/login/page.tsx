'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginData } from '@/lib/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  
  // Configura o React Hook Form com Zod para validação
  // O funcionamento é assim: ao submeter o formulário, os dados são validados. De acordo com o resultado, o onSubmit é chamado ou os erros são populados.
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  // Função chamada ao submeter o formulário com dados válidos
  const onSubmit = async (data: LoginData) => {
    try {
      setError('');
      const response = await authService.login(data);
      // O backend retorna: { access_token: string, user: User }
      login(response.access_token, response.user);
    } catch (err: any) {
      console.log(err);
      setError('Credenciais inválidas ou erro no servidor.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-2 text-blue-900">EventSync AI</h1>
        <p className="text-center text-gray-700 mb-6">Entre para acessar seus eventos</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="E-mail" 
            type="email" 
            placeholder="seu@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Input 
            label="Senha" 
            type="password" 
            placeholder="******"
            {...register('password')}
            error={errors.password?.message}
          />

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <Button type="submit" isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Não tem conta? </span>
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Crie agora
          </Link>
        </div>
      </div>
    </div>
  );
}