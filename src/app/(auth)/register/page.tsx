'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterData } from '@/lib/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user', city: '', name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterData) => {
    try {
      setServerError('');
      await authService.register(data);
      toast('Conta criada com sucesso! Faça login.');
      router.push('/login');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setServerError('Este e-mail já está cadastrado.');
      } else {
        setServerError('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-40 0">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-900">Crie sua conta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nome Completo" 
            placeholder="Ex: João Silva"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input 
            label="E-mail" 
            type="email" 
            placeholder="seu@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <div className="flex gap-4">
             <div className="w-1/2">
                <Input 
                    label="Cidade (Opcional)" 
                    placeholder="Teresina"
                    {...register('city')}
                />
             </div>
             <div className="w-1/2 flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Tipo de Conta</label>
                <select 
                    {...register('role')}
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 outline-none text-black"
                >
                    <option value="user">Participante</option>
                    <option value="organizer">Organizador</option>
                </select>
             </div>
          </div>

          <Input 
            label="Senha" 
            type="password" 
            placeholder="Mínimo 6 caracteres"
            {...register('password')}
            error={errors.password?.message}
          />

          {serverError && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{serverError}</div>}

          <Button type="submit" isLoading={isSubmitting}>
            Cadastrar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Já tem conta? </span>
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}