'use client';

import { useState } from 'react';
import { registrationService } from '@/services/registrations';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function CheckInPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      await registrationService.checkIn(code);
      toast.success('Check-in realizado com sucesso!');
      setCode(''); // Limpa para o próximo
    } catch (error: any) {
      console.error(error);
      toast.error('Falha no check-in. Verifique o código ou status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Link>

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <QrCode className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Validar Check-in</h1>
            <p className="text-gray-500">Digite o código do ingresso do participante</p>
        </div>

        <form onSubmit={handleCheckIn} className="space-y-4">
            <Input 
                label="Código do Ingresso (ID)"
                placeholder="Ex: clq3..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
            />
            
            <Button type="submit" isLoading={loading} className="h-12 text-lg">
                Confirmar Presença
            </Button>
        </form>
      </div>
    </div>
  );
}