import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button'; // Assuming Button is available
import { Event, CreateEventDTO } from '@/types';
import { toast } from 'sonner';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<CreateEventDTO>) => Promise<void>;
    event: Event | null;
}

export const EditEventModal = ({ isOpen, onClose, onSave, event }: EditEventModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CreateEventDTO>>({});

    useEffect(() => {
        if (event && isOpen) {
            setFormData({
                title: event.title,
                description: event.description,
                localAddress: event.localAddress || '',
                localUrl: event.localUrl || '',
                startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '', // Format for datetime-local
                endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
                price: event.price,
                maxAttendees: event.maxAttendees || undefined,
                type: event.type,
            });
        }
    }, [event, isOpen]);

    const handleChange = (field: keyof CreateEventDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;

        setLoading(true);
        try {
            // Enviar datas em ISO 8601 completo
            const payload = {
                ...formData,
                startDate: new Date(formData.startDate!).toISOString(),
                endDate: new Date(formData.endDate!).toISOString(),
            };

            await onSave(event.id, payload);
            toast.success('Evento atualizado com sucesso!');
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar evento.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Editar Evento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    <Input
                        label="Título do Evento"
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea
                            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            rows={4}
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Início"
                            type="datetime-local"
                            value={formData.startDate || ''}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            required
                        />
                        <Input
                            label="Fim"
                            type="datetime-local"
                            value={formData.endDate || ''}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Endereço Local (Opcional)"
                        value={formData.localAddress || ''}
                        onChange={(e) => handleChange('localAddress', e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Preço (R$)"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price !== undefined ? String(formData.price) : ''}
                            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                            required
                        />
                        <Input
                            label="Máx. Participantes"
                            type="number"
                            min="1"
                            value={formData.maxAttendees !== undefined ? String(formData.maxAttendees) : ''}
                            onChange={(e) => handleChange('maxAttendees', parseInt(e.target.value))}
                        />
                    </div>
                </form>

                <div className="p-6 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </div>
    );
};
