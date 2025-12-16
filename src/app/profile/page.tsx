'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService, UserDetails, UpdateUserDTO } from '@/services/users';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User, Mail, MapPin, Camera, Save, Loader2, Edit2, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Novo estado
    const [profile, setProfile] = useState<UserDetails | null>(null);

    const [formData, setFormData] = useState<UpdateUserDTO>({
        name: '',
        city: '',
        photoUrl: '',
        visibilityParticipation: true
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadProfile();
    }, [isAuthenticated, router]);

    const loadProfile = async () => {
        try {
            const data = await userService.getProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                city: data.city || '',
                photoUrl: data.photoUrl || '',
                visibilityParticipation: data.visibilityParticipation
            });
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            toast.error('Erro ao carregar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof UpdateUserDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.name,
                city: profile.city || '',
                photoUrl: profile.photoUrl || '',
                visibilityParticipation: profile.visibilityParticipation
            });
        }
        setIsEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatedUser = await userService.updateProfile(formData);
            setProfile(updatedUser);
            toast.success('Perfil atualizado com sucesso!');
            setIsEditing(false); // Sai do modo de edição
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-gray-500 hover:text-blue-600 mr-4">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Meu Perfil</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 mt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Header Visual */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
                        {profile?.role === 'organizer' && (
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
                                <span className="text-yellow-300 text-lg">★</span>
                                <span className="text-white font-bold text-lg">{profile.organizerRating ? Number(profile.organizerRating).toFixed(1) : '0.0'}</span>
                                <span className="text-blue-100 text-xs font-medium uppercase tracking-wide">Organizador</span>
                            </div>
                        )}
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                                {formData.photoUrl ? (
                                    <img
                                        src={formData.photoUrl}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover bg-gray-200"
                                        onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + formData.name)}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botão de Editar no Header (Opcional, ou pode ser abaixo) */}
                        <div className="absolute bottom-4 right-4">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar Perfil
                                </button>
                            ) : (
                                <button
                                    onClick={handleCancel}
                                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            className={`w-full pl-10 p-3 rounded-lg border ${isEditing ? 'border-gray-200 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500' : 'border-transparent bg-gray-50 text-gray-800'}`}
                                            value={formData.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            readOnly={!isEditing}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            className="w-full pl-10 p-3 rounded-lg border border-transparent bg-gray-50 text-gray-500 cursor-not-allowed"
                                            value={profile?.email || ''}
                                            disabled
                                        />
                                    </div>
                                    {isEditing && <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            className={`w-full pl-10 p-3 rounded-lg border ${isEditing ? 'border-gray-200 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500' : 'border-transparent bg-gray-50 text-gray-800'}`}
                                            value={formData.city || ''}
                                            onChange={(e) => handleChange('city', e.target.value)}
                                            placeholder={isEditing ? "Sua cidade" : "Não informado"}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Foto</label>
                                    <div className="relative">
                                        <Camera className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="url"
                                            className={`w-full pl-10 p-3 rounded-lg border ${isEditing ? 'border-gray-200 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500' : 'border-transparent bg-gray-50 text-gray-800'}`}
                                            value={formData.photoUrl || ''}
                                            onChange={(e) => handleChange('photoUrl', e.target.value)}
                                            placeholder={isEditing ? "https://..." : "Não informado"}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="visibility"
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                                    checked={formData.visibilityParticipation}
                                    onChange={(e) => handleChange('visibilityParticipation', e.target.checked)}
                                    disabled={!isEditing}
                                />
                                <label htmlFor="visibility" className="text-sm text-gray-700">Permitir que outros vejam meus eventos participados</label>
                            </div>

                            {isEditing && (
                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 animated-fade-in">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
