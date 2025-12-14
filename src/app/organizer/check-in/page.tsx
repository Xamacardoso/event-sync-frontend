'use client';

import { useState } from 'react';
import { registrationService } from '@/services/registrations';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, QrCode, Keyboard, Camera } from 'lucide-react';
import Link from 'next/link';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function CheckInPage() {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false); // Pausa o scanner após leitura

  // Função centralizada de Check-in
  const processCheckIn = async (ticketId: string) => {
    if (!ticketId) return;
    
    // Evita leituras duplicadas rápidas
    if (loading || paused) return;

    setLoading(true);
    setPaused(true); // Pausa a câmera enquanto processa

    try {
      await registrationService.checkIn(ticketId);
      toast.success('Check-in realizado com sucesso!');
      
      // Limpa o estado se for manual
      if (activeTab === 'manual') {
        setCode('');
      }
      
      // Se for câmera, espera um pouco antes de permitir nova leitura (UX)
      if (activeTab === 'camera') {
        setTimeout(() => {
            setPaused(false);
            toast.info('Pronto para o próximo!');
        }, 2000); 
      }

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Erro ao validar ingresso.';
      toast.error(msg);
      
      // Libera a câmera novamente após erro
      setTimeout(() => setPaused(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckIn(code);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-blue-600" />
                Validar Check-in
            </h1>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-gray-100">
            <button
                onClick={() => { setActiveTab('camera'); setPaused(false); }}
                className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'camera' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                        : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <Camera className="w-4 h-4" /> Câmera
            </button>
            <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'manual' 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                        : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
                <Keyboard className="w-4 h-4" /> Manual
            </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 min-h-[400px]">
            {activeTab === 'camera' ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative shadow-inner">
                        {/* Componente do Scanner */}
                        <Scanner 
                            onScan={(result) => {
                                if (result && result.length > 0 && !paused) {
                                    // Pega o valor bruto do primeiro código lido
                                    const rawValue = result[0].rawValue;
                                    processCheckIn(rawValue);
                                }
                            }}
                            allowMultiple={true} // Permitir múltiplos para controlarmos o pause manualmente
                            scanDelay={500}      // Delay entre tentativas de leitura
                            paused={paused}      // Controla se a câmera está processando
                        />
                        
                        {/* Overlay visual de "Processando" */}
                        {loading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            </div>
                        )}
                        
                        {/* Overlay visual de "Pausado/Sucesso" */}
                        {paused && !loading && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 backdrop-blur-[2px]">
                                <span className="bg-white text-green-700 px-4 py-2 rounded-full font-bold shadow-lg">
                                    Lido!
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Aponte a câmera para o QR Code do participante.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleManualSubmit} className="space-y-6 pt-4">
                    <div className="text-center text-gray-500 mb-6">
                        Digite o código (ID) que aparece abaixo do QR Code no ingresso.
                    </div>
                    
                    <Input 
                        label="Código do Ingresso"
                        placeholder="Ex: clq3..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        autoFocus
                    />
                    
                    <Button type="submit" isLoading={loading} className="h-12 text-lg w-full">
                        Confirmar Presença
                    </Button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}