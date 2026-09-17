'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CrearUsuarioModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState<'medico' | 'admin'>('medico');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/admin/crear-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreCompleto, email, rol }),
        });
        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            setError(data.error ?? 'No se pudo crear el usuario.');
            return;
        }

        setOk(true);
        router.refresh();
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-brand-blue-dark/10 text-brand-blue-dark flex items-center justify-center">
                            <UserPlus className="w-4.5 h-4.5" />
                        </span>
                        <h2 className="text-sm font-extrabold text-slate-800">Crear usuario</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {ok ? (
                    <div className="flex flex-col items-center gap-2 text-center py-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        <p className="text-sm font-bold text-slate-800">Invitación enviada</p>
                        <p className="text-xs text-slate-500">
                            Le llegó un correo a <strong>{email}</strong> para que confirme y elija su contraseña.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-2 bg-brand-blue-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                        >
                            Listo
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        <p className="text-xs text-slate-500 -mt-1">
                            Se le manda una invitación por correo; la persona elige su propia contraseña al confirmar.
                        </p>

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
                                value={nombreCompleto}
                                onChange={(e) => setNombreCompleto(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Correo electrónico</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Rol</label>
                            <div className="flex gap-2">
                                {(['medico', 'admin'] as const).map((opcion) => (
                                    <button
                                        key={opcion}
                                        type="button"
                                        onClick={() => setRol(opcion)}
                                        className={`flex-1 text-xs font-bold px-3 py-2.5 rounded-xl border transition-colors cursor-pointer capitalize ${
                                            rol === opcion
                                                ? 'bg-brand-blue-dark text-white border-brand-blue-dark'
                                                : 'bg-white text-slate-500 border-slate-200'
                                        }`}
                                    >
                                        {opcion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 bg-brand-blue-dark hover:opacity-90 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition cursor-pointer"
                        >
                            {loading ? 'Enviando invitación...' : 'Crear usuario'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
