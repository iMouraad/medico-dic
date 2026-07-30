'use client';

import { useMemo, useState } from 'react';
import { Check, X, Calendar, CheckCircle2, Mail, Phone, Clock } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { APPOINTMENT_STATUS_LABEL, type Appointment } from '@/app/lib/types';

interface Props {
    initialAppointments: Appointment[];
}

const TABS: { key: 'pendiente' | 'confirmada' | 'todas'; label: string }[] = [
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'confirmada', label: 'Confirmadas' },
    { key: 'todas', label: 'Todas' },
];

export default function CitasMedico({ initialAppointments }: Props) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [tab, setTab] = useState<'pendiente' | 'confirmada' | 'todas'>('pendiente');
    const [reprogramando, setReprogramando] = useState<number | null>(null);
    const [nuevaFecha, setNuevaFecha] = useState('');

    const counts = useMemo(
        () => ({
            pendiente: appointments.filter((a) => a.status === 'pendiente').length,
            confirmada: appointments.filter((a) => a.status === 'confirmada').length,
            todas: appointments.length,
        }),
        [appointments]
    );

    const visibles = tab === 'todas' ? appointments : appointments.filter((a) => a.status === tab);

    const updateAppointment = async (id: number, patch: Partial<Pick<Appointment, 'status' | 'preferred_at'>>) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('appointments').update(patch).eq('id', id).select().single();
        if (!error && data) {
            setAppointments((prev) => prev.map((a) => (a.id === id ? (data as Appointment) : a)));
        }
    };

    const handleReprogramar = async (id: number) => {
        if (!nuevaFecha) return;
        await updateAppointment(id, { preferred_at: new Date(nuevaFecha).toISOString(), status: 'confirmada' });
        setReprogramando(null);
        setNuevaFecha('');
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                            tab === key ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                    >
                        {label} ({counts[key]})
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {visibles.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400 font-medium">
                        No hay citas en esta vista.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {visibles.map((a) => (
                            <div key={a.id} className="flex flex-col gap-3 p-4">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-slate-800">{a.patient_name}</span>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${APPOINTMENT_STATUS_LABEL[a.status].className}`}
                                            >
                                                {APPOINTMENT_STATUS_LABEL[a.status].label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(a.preferred_at).toLocaleString('es-EC', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                {a.patient_email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                {a.patient_phone}
                                            </span>
                                        </div>
                                        {a.reason && <p className="text-xs text-slate-500 mt-1.5">{a.reason}</p>}
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {a.status !== 'confirmada' && a.status !== 'completada' && (
                                            <button
                                                onClick={() => updateAppointment(a.id, { status: 'confirmada' })}
                                                aria-label="Confirmar"
                                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-100 cursor-pointer"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        {a.status === 'confirmada' && (
                                            <button
                                                onClick={() => updateAppointment(a.id, { status: 'completada' })}
                                                aria-label="Marcar completada"
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-100 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {a.status !== 'cancelada' && a.status !== 'completada' && (
                                            <button
                                                onClick={() => setReprogramando(reprogramando === a.id ? null : a.id)}
                                                aria-label="Reprogramar"
                                                className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100/80 rounded-lg border border-amber-100 cursor-pointer"
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </button>
                                        )}
                                        {a.status !== 'cancelada' && a.status !== 'completada' && (
                                            <button
                                                onClick={() => updateAppointment(a.id, { status: 'cancelada' })}
                                                aria-label="Cancelar"
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100/80 rounded-lg border border-red-100 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {reprogramando === a.id && (
                                    <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-100 rounded-xl p-3">
                                        <input
                                            type="datetime-local"
                                            value={nuevaFecha}
                                            onChange={(e) => setNuevaFecha(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={() => handleReprogramar(a.id)}
                                            className="text-xs font-bold bg-blue-600 hover:bg-blue-750 text-white px-3.5 py-2 rounded-lg cursor-pointer"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
