'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Stethoscope, AlertCircle, MailCheck } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const RUC_REGEX = /^\d{13}$/;

export default function RegistroPage() {
    const [form, setForm] = useState({ nombreCompleto: '', email: '', ruc: '' });
    const [aceptaOfertasComerciales, setAceptaOfertasComerciales] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

    const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.nombreCompleto.trim()) {
            setError('Ingresa tu nombre completo.');
            return;
        }
        if (!RUC_REGEX.test(form.ruc)) {
            setError('El RUC debe tener 13 dígitos.');
            return;
        }

        setLoading(true);
        const supabase = createClient();

        const { data: rucDisponible } = await supabase.rpc('ruc_disponible', { p_ruc: form.ruc });
        if (rucDisponible === false) {
            setError('Ya existe una cuenta registrada con ese RUC.');
            setLoading(false);
            return;
        }

        // Sin contraseña todavía: se manda un enlace de acceso al correo y
        // recién al confirmarlo (en /registro/completar) el médico elige su
        // contraseña. El nombre y el RUC van en la metadata para que el
        // trigger del lado del servidor cree la fila inicial en doctors
        // (incluyendo el username autogenerado a partir del nombre).
        const { error: otpError } = await supabase.auth.signInWithOtp({
            email: form.email,
            options: {
                data: {
                    nombre_completo: form.nombreCompleto.trim(),
                    ruc: form.ruc,
                    acepta_ofertas_comerciales: aceptaOfertasComerciales,
                },
                emailRedirectTo: `${window.location.origin}/registro/completar`,
            },
        });

        setLoading(false);

        if (otpError) {
            setError('No se pudo enviar el enlace de confirmación. Intenta de nuevo.');
            return;
        }

        setAwaitingConfirmation(true);
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
                            Te enviamos un enlace a <strong>{form.email}</strong>. Ábrelo para
                            confirmar tu cuenta y elegir tu contraseña.
                        </p>
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
                            Tu perfil es 100% gratis. Te enviamos un enlace para confirmar tu
                            correo y elegir tu contraseña; luego completas tus datos médicos en
                            tu panel y un admin de NEOSDOC lo revisa antes de publicarlo.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Nombre completo</label>
                        <input
                            required
                            value={form.nombreCompleto}
                            onChange={update('nombreCompleto')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Nombres y apellidos"
                        />
                    </div>

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
                        {loading ? 'Enviando enlace...' : 'Continuar'}
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
