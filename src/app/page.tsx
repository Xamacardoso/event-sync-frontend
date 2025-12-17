'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService } from '@/services/events';
import { userService } from '@/services/users'; // Import userService
import { Event } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'; // <--- Import do Modal
import { Plus, Menu, X, Ticket, Home, User, LogOut, CalendarDays, Search, Filter, Users, ChevronLeft, ChevronRight } from 'lucide-react'; // Add Users, ChevronLeft, ChevronRight
import Link from 'next/link';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      userService.getProfile()
        .then(data => setProfilePhoto(data.photoUrl || null))
        .catch(err => console.error("Failed to load profile photo"));
    }
  }, [isAuthenticated]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<undefined | 'free' | 'paid'>(undefined);
  const [filterStatus, setFilterStatus] = useState<undefined | 'published' | 'canceled' | 'finished'>('published');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    // Reset page to 1 when filters or search change
    setPage(1);
  }, [searchTerm, filterType, filterStatus]);

  useEffect(() => {
    // Debounce search and fetch on page change
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType, filterStatus, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.list({
        title: searchTerm || undefined,
        type: filterType,
        status: filterStatus,
        page: page,
        limit: 10,
      });
      setEvents(response.data);
      setTotalPages(response.meta.lastPage);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
        variant="danger"
      />

      {/* --- SIDEBAR & OVERLAY --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* ... SIDEBAR CONTENT (Manter igual) ... */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* ... manter conteúdo da sidebar ... */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">Menu</h2>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100%-80px)] justify-between">
          <div className="space-y-2">
            {isAuthenticated && user && (
              <Link
                href="/profile"
                onClick={toggleSidebar}
                className="mb-6 p-3 bg-blue-50 rounded-lg flex items-center gap-3 hover:bg-blue-100 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 group-hover:border-blue-300">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-200 flex items-center justify-center text-blue-700">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </Link>
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

              <Link
                href="/social"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                onClick={toggleSidebar}
              >
                <Users className="w-5 h-5 text-blue-500" />
                Rede Social
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

      {/* --- HEADER (Manter igual) --- */}
      <header className="bg-white p-4 sticky top-0 z-30 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-blue-900">EventSync</h1>
        </div>

        <div>
          {isAuthenticated ? (
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
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
        <div className="mb-6 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all text-gray-900 placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilterType(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!filterType ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('free')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'free' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Gratuitos
            </button>
            <button
              onClick={() => setFilterType('paid')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'paid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Pagos
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-2">
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'published' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Publicados
            </button>
            <button
              onClick={() => setFilterStatus('finished')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'finished' ? 'bg-gray-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Finalizados
            </button>
            <button
              onClick={() => setFilterStatus('canceled')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === 'canceled' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              Cancelados
            </button>
          </div>
        </div>

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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <span className="text-sm font-medium text-gray-600">
                  Página {page} de {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
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