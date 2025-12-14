'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { eventService } from '@/services/events';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import do Link para navegação
import { ArrowLeft } from 'lucide-react'; // Import do ícone de voltar
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Schema de validação
const eventFormSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'A descrição deve ser mais detalhada'),
  localAddress: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo'),
  type: z.enum(['free', 'paid']),
  maxAttendees: z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
});

export default function NewEventPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !user) return;
    if (user?.role !== 'organizer') {
      toast.error('Acesso restrito a organizadores.');
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      localAddress: '',
      startDate: '',
      endDate: '',
      price: 0,
      type: 'free' as const,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await eventService.create({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
      toast.success('Evento criado com sucesso!');
      router.push('/'); 
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar evento. Verifique os dados.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        <div className="mb-6"> {/* Botão Voltar */}
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para o Início
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-blue-900 mb-6">Novo Evento</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Título" 
            placeholder="Ex: Workshop de IA"
            className="text-gray-900"
            {...register('title')}
            error={errors.title?.message as string}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea 
              {...register('description')}
              className="p-3 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Descreva o evento..."
            />
            {errors.description && <span className="text-xs text-red-500">{errors.description.message as string}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Início" 
              type="datetime-local"
              className="text-gray-900"
              {...register('startDate')}
              error={errors.startDate?.message as string}
            />
            <Input 
              label="Fim" 
              type="datetime-local"
              className="text-gray-900"
              {...register('endDate')}
              error={errors.endDate?.message as string}
            />
          </div>

          <Input 
            label="Local" 
            placeholder="Endereço ou Link"
            className="text-gray-900"
            {...register('localAddress')}
            error={errors.localAddress?.message as string}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select 
                {...register('type')}
                className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
              >
                <option value="free">Gratuito</option>
                <option value="paid">Pago</option>
              </select>
            </div>
            
            <Input 
              label="Preço (R$)" 
              type="number" 
              step="0.01"
              className="text-gray-900"
              {...register('price')}
              error={errors.price?.message as string}
            />
          </div>

          <Input 
            label="Máx. Participantes (Opcional)" 
            type="number"
            className="text-gray-900"
            {...register('maxAttendees')}
            error={errors.maxAttendees?.message as string}
          />

          <Button type="submit" isLoading={isSubmitting}>
            Publicar Evento
          </Button>
        </form>
      </div>
    </div>
  );
}