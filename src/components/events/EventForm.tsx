import React from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateEventDTO, Event } from '@/types';

// Validation Schema
const eventFormSchema = z.object({
    title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
    description: z.string().min(10, 'A descrição deve ser mais detalhada'),
    localAddress: z.string().optional(),
    localUrl: z.string().url('URL inválida').optional().or(z.literal('')),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
    price: z.coerce.number().min(0, 'O preço não pode ser negativo'),
    type: z.enum(['free', 'paid']),
    maxAttendees: z.preprocess(
        (val) => (val === '' || val === null ? undefined : Number(val)),
        z.number().int().positive().optional()
    ).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    initialData?: Partial<Event>;
    onSubmit: (data: EventFormValues) => Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
}

export const EventForm = ({ initialData, onSubmit, isLoading, submitLabel = 'Salvar' }: EventFormProps) => {
    const defaultValues: Partial<EventFormValues> = {
        title: initialData?.title || '',
        description: initialData?.description || '',
        localAddress: initialData?.localAddress || '',
        localUrl: initialData?.localUrl || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
        price: initialData?.price || 0,
        type: initialData?.type || 'free',
        maxAttendees: initialData?.maxAttendees || undefined,
    };

    const { register, handleSubmit, formState: { errors }, watch } = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema) as Resolver<EventFormValues>,
        defaultValues,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
                label="Título"
                placeholder="Ex: Workshop de IA"
                className="text-gray-900"
                {...register('title')}
                error={errors.title?.message}
            />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                    {...register('description')}
                    className="p-3 border rounded-lg bg-gray-50 text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                    placeholder="Descreva o evento..."
                />
                {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Início"
                    type="datetime-local"
                    className="text-gray-900"
                    {...register('startDate')}
                    error={errors.startDate?.message}
                />
                <Input
                    label="Fim"
                    type="datetime-local"
                    className="text-gray-900"
                    {...register('endDate')}
                    error={errors.endDate?.message}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Local (Endereço)"
                    placeholder="Rua Exemplo, 123"
                    className="text-gray-900"
                    {...register('localAddress')}
                    error={errors.localAddress?.message}
                />
                <Input
                    label="Link Externo (Opcional)"
                    placeholder="https://meet.google.com/..."
                    className="text-gray-900"
                    {...register('localUrl')}
                    error={errors.localUrl?.message}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        {...register('type')}
                        className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 outline-none"
                    >
                        <option value="free">Gratuito</option>
                        <option value="paid">Pago</option>
                    </select>
                    {errors.type && <span className="text-xs text-red-500">{errors.type.message}</span>}
                </div>

                <Input
                    label="Preço (R$)"
                    type="number"
                    step="0.01"
                    className="text-gray-900"
                    {...register('price')}
                    error={errors.price?.message}
                />
            </div>

            <Input
                label="Máx. Participantes (Opcional)"
                type="number"
                className="text-gray-900"
                {...register('maxAttendees')}
                error={errors.maxAttendees?.message}
            />

            <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
                {submitLabel}
            </Button>
        </form>
    );
};
