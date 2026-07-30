'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Doctor } from '@/app/lib/types';

interface Props {
    doctor: Doctor;
    onClose: () => void;
}

export default function AgendarCitaModal({ doctor, onClose }: Props) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', preferredAt: '', reason: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const update = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error: insertError } = await supabase.from('appointments').insert({
            doctor_id: doctor.id,
            patient_name: form.name,
            patient_email: form.email,
            patient_phone: form.phone,
            preferred_at: new Date(form.preferredAt).toISOString(),
            reason: form.reason || null,
        });

        if (insertError) {
            setError('No se pudo enviar tu solicitud. Intenta de nuevo.');
            setLoading(false);
            return;
        }

        await supabase.rpc('increment_doctor_stat', { target_id: doctor.id, stat_name: 'appointment_clicks' });
        setSuccess(true);
        setLoading(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
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
                        <h2 className="text-base font-extrabold text-slate-800">Solicitud enviada</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {doctor.name ?? 'El médico'} recibirá tu solicitud y se pondrá en contacto contigo para confirmar la cita.
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
                            <h2 className="text-base font-extrabold text-slate-800 mb-0.5">Agendar cita</h2>
                            <p className="text-xs text-slate-500">con {doctor.name ?? 'este médico'}</p>
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
                                value={form.name}
                                onChange={update('name')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Correo electrónico</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={update('email')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Teléfono</label>
                            <input
                                required
                                value={form.phone}
                                onChange={update('phone')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Fecha y hora preferida</label>
                            <input
                                type="datetime-local"
                                required
                                value={form.preferredAt}
                                onChange={update('preferredAt')}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Motivo (opcional)</label>
                            <textarea
                                rows={2}
                                value={form.reason}
                                onChange={update('reason')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                        >
                            {loading ? 'Enviando...' : 'Enviar solicitud'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
