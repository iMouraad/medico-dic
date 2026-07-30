'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, AlertCircle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError || !data.user) {
            setError('Correo o contraseña incorrectos.');
            setLoading(false);
            return;
        }

        const next = searchParams.get('next');
        if (next) {
            router.push(next);
            router.refresh();
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        router.push(profile?.role === 'admin' ? '/admin' : '/dashboard');
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 mb-2">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <LogIn className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-extrabold text-slate-800">Ingresar</h1>
                <p className="text-xs text-slate-500 text-center">Acceso para médicos y administradores de NEOSDOC</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-bold text-slate-600">Correo electrónico</label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="tu@correo.com"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-600">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
            >
                {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <p className="text-center text-xs text-slate-500 mt-1">
                ¿Eres médico y no tienes cuenta?{' '}
                <Link href="/registro" className="text-blue-600 font-bold hover:text-blue-800">
                    Regístrate gratis
                </Link>
            </p>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <Suspense fallback={null}>
                    <LoginForm />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
