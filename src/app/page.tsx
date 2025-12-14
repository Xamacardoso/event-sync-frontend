'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/events';
import { Event } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // <--- Import do Modal
import { Plus, Menu, X, Ticket, Home, User, LogOut, CalendarDays, ScanLine } from 'lucide-react'; // <--- Import do LogOut
import Link from 'next/link';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // <--- Estado do Modal

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.list();
      setEvents(data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Função que executa o logout de fato (chamada pelo modal)
  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative overflow-x-hidden">
      
      {/* --- MODAL DE LOGOUT --- */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sair da Conta"
        description="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar seus ingressos."
        confirmText="Sair"
        variant="danger" // Usa o estilo vermelho de alerta
      />

      {/* --- SIDEBAR & OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">Menu</h2>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100%-80px)] justify-between">
          <div className="space-y-2">
            {isAuthenticated && user && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                <div className="bg-blue-200 p-2 rounded-full text-blue-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              <Link 
                href="/" 
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                onClick={toggleSidebar}
              >
                <Home className="w-5 h-5 text-blue-500" />
                Início
              </Link>

              {isAuthenticated && user?.role === 'organizer' && (
                <>
                  <Link 
                    href="/organizer/my-events" 
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                    onClick={toggleSidebar}
                  >
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    Meus Eventos
                  </Link>

                  <Link 
                  href="/organizer/check-in" 
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  onClick={toggleSidebar}
                  >
                  <ScanLine className="w-5 h-5 text-blue-500" />
                  Validar Check-in
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <Link 
                  href="/my-tickets" 
                  className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  onClick={toggleSidebar}
                >
                  <Ticket className="w-5 h-5 text-blue-500" />
                  Minhas Inscrições
                </Link>
              )}
            </nav>
          </div>

          {/* Opção de Logout também na Sidebar (Opcional, mas boa prática UX) */}
          {isAuthenticated && (
            <button 
              onClick={() => { toggleSidebar(); setIsLogoutModalOpen(true); }}
              className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 font-medium w-full"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          )}
        </div>
      </aside>


      {/* --- HEADER --- */}
      <header className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-blue-900">EventSync</h1>
        </div>
        
        {/* Botão Logout no Header com Ícone */}
        <div>
          {isAuthenticated ? (
            <button 
              onClick={() => setIsLogoutModalOpen(true)} 
              className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" /> {/* Ícone adicionado */}
              <span>Sair</span>
            </button>
          ) : (
            <Link href="/login" className="text-sm text-blue-600 font-bold hover:underline">
              Entrar
            </Link>
          )}
        </div>
      </header>


      {/* --- FEED DE EVENTOS --- */}
      <main className="p-4 max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 ml-1">Próximos Eventos</h2>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Carregando...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Nenhum evento encontrado.</p>
            {user?.role === 'organizer' && (
              <p className="text-sm text-blue-600 mt-2">Comece criando um evento!</p>
            )}
          </div>
        )}
      </main>

      {/* --- BOTÃO CRIAR EVENTO (Organizador) --- */}
      {isAuthenticated && user?.role === 'organizer' && (
        <div className="fixed bottom-6 right-6 z-20">
          <Link 
            href="/events/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Criar novo evento</span>
          </Link>
        </div>
      )}

    </div>
  );
}