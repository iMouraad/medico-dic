'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, AlertCircle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function CompletarRegistroPage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [tieneSesion, setTieneSesion] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        // El enlace del correo ya deja la sesión activa (detectSessionInUrl
        // es true por defecto en el cliente de Supabase), solo hay que
        // esperar a que termine de procesarla.
        supabase.auth.getSession().then(({ data }) => {
            setTieneSesion(!!data.session);
            setChecking(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setTieneSesion(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError('No se pudo guardar la contraseña. Intenta de nuevo.');
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <KeyRound className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-extrabold text-slate-800">Elige tu contraseña</h1>
                        <p className="text-xs text-slate-500 text-center">
                            Tu correo ya quedó confirmado. Solo falta que definas tu contraseña
                            para terminar de crear tu cuenta.
                        </p>
                    </div>

                    {checking ? (
                        <p className="text-center text-xs text-slate-400 py-4">Verificando enlace...</p>
                    ) : !tieneSesion ? (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Este enlace ya no es válido o expiró. Vuelve a registrarte para recibir uno nuevo.</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {error && (
                                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                            >
                                {loading ? 'Guardando...' : 'Guardar y continuar'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
