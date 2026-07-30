'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, AlertCircle, MailCheck } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const RUC_REGEX = /^\d{13}$/;

export default function RegistroPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        ruc: '',
        password: '',
        confirmPassword: '',
    });
    const [aceptaOfertasComerciales, setAceptaOfertasComerciales] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

    const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!RUC_REGEX.test(form.ruc)) {
            setError('El RUC debe tener 13 dígitos.');
            return;
        }
        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);
        const supabase = createClient();

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { ruc: form.ruc, acepta_ofertas_comerciales: aceptaOfertasComerciales },
            },
        });

        if (signUpError || !data.user) {
            setError(signUpError?.message === 'User already registered'
                ? 'Ya existe una cuenta con ese correo.'
                : 'No se pudo crear la cuenta. Intenta de nuevo.');
            setLoading(false);
            return;
        }

        setLoading(false);

        if (!data.session) {
            // "Confirm email" está activo en Supabase Auth: no hay sesión
            // todavía. La fila en doctors ya se creó igual, desde el
            // trigger del lado del servidor, así que solo falta que
            // confirme el correo e inicie sesión para completar su perfil.
            setAwaitingConfirmation(true);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    if (awaitingConfirmation) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50/50">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-sm flex flex-col items-center gap-3 text-center">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <MailCheck className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-extrabold text-slate-800">Revisa tu correo</h1>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>.
                            Confírmalo y luego inicia sesión para completar tu perfil médico.
                        </p>
                        <Link
                            href="/login"
                            className="mt-2 bg-blue-600 hover:bg-blue-750 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition duration-200"
                        >
                            Ir a iniciar sesión
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-sm flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-extrabold text-slate-800">Regístrate como médico</h1>
                        <p className="text-xs text-slate-500 text-center">
                            Tu perfil es 100% gratis. Después de crear tu cuenta, completas tus
                            datos médicos en tu panel y un admin de NEOSDOC lo revisa antes de publicarlo.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Correo electrónico</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={update('email')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">RUC</label>
                        <input
                            required
                            inputMode="numeric"
                            maxLength={13}
                            value={form.ruc}
                            onChange={update('ruc')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="13 dígitos"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={form.password}
                            onChange={update('password')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Confirmar contraseña</label>
                        <input
                            type="password"
                            required
                            value={form.confirmPassword}
                            onChange={update('confirmPassword')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed cursor-pointer">
                        <input
                            type="checkbox"
                            checked={aceptaOfertasComerciales}
                            onChange={(e) => setAceptaOfertasComerciales(e.target.checked)}
                            className="w-4 h-4 mt-0.5 accent-blue-600 flex-shrink-0"
                        />
                        <span>
                            Acepto recibir ofertas y beneficios de proveedores del sector salud a través de NEOSDOC
                            (opcional, nunca compartimos tu contacto directo con terceros).
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
                    </button>

                    <p className="text-center text-xs text-slate-500 mt-1">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-blue-600 font-bold hover:text-blue-800">
                            Inicia sesión
                        </Link>
                    </p>
                </form>
            </main>
            <Footer />
        </div>
    );
}
