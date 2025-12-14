import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary'; // Permite mudar a cor do botão de ação
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  isLoading = false,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Escuro (Fundo) */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Caixa do Modal */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho com Ícone e Botão Fechar */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-6 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          
          <div className="w-auto">
            <Button 
              onClick={onConfirm} 
              isLoading={isLoading}
              className={variant === 'danger' ? '!bg-red-600 hover:!bg-red-700' : ''}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};