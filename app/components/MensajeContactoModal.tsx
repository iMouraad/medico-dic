'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Doctor } from '@/app/lib/types';

interface Props {
    doctor: Doctor;
    onClose: () => void;
}

export default function MensajeContactoModal({ doctor, onClose }: Props) {
    const [form, setForm] = useState({ email: '', whatsapp: '', mensaje: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error: insertError } = await supabase.from('contact_messages').insert({
            doctor_id: doctor.id,
            email: form.email,
            whatsapp_paciente: form.whatsapp || null,
            mensaje: form.mensaje,
        });

        if (insertError) {
            setError('No se pudo enviar tu mensaje. Intenta de nuevo.');
            setLoading(false);
            return;
        }

        await supabase.rpc('increment_doctor_stat', { target_id: doctor.id, stat_name: 'appointment_clicks' });
        setSuccess(true);
        setLoading(false);
    };

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {success ? (
                    <div className="flex flex-col items-center text-center gap-3 py-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-base font-extrabold text-slate-800">Mensaje enviado</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {doctor.name ?? 'El médico'} recibirá tu mensaje y decidirá cómo contactarte.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-1 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-800 mb-0.5">Enviar mensaje</h2>
                            <p className="text-xs text-slate-500">a {doctor.name ?? 'este médico'}</p>
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
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">WhatsApp (opcional)</label>
                            <input
                                value={form.whatsapp}
                                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Mensaje</label>
                            <textarea
                                required
                                rows={4}
                                value={form.mensaje}
                                onChange={(e) => setForm((p) => ({ ...p, mensaje: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                        >
                            {loading ? 'Enviando...' : 'Enviar mensaje'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
