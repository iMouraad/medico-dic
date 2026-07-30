'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Clock, ArrowRight, CalendarCheck } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { APPOINTMENT_STATUS_LABEL, type Appointment } from '@/app/lib/types';

interface Props {
    initialAppointments: Appointment[];
}

export default function ProximasCitas({ initialAppointments }: Props) {
    const [appointments, setAppointments] = useState(initialAppointments);

    const updateStatus = async (id: number, status: Appointment['status']) => {
        const supabase = createClient();
        const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
        if (!error && data) {
            setAppointments((prev) => prev.map((a) => (a.id === id ? (data as Appointment) : a)));
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600 bg-emerald-50">
                        <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 leading-none">Próximas citas</div>
                </div>
                <Link
                    href="/dashboard/citas"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex-shrink-0"
                >
                    Ver todas
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {appointments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No tienes citas próximas agendadas.
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-slate-50">
                    {appointments.map((a) => (
                        <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-bold text-slate-800 truncate">{a.patient_name}</span>
                                    <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${APPOINTMENT_STATUS_LABEL[a.status].className}`}
                                    >
                                        {APPOINTMENT_STATUS_LABEL[a.status].label}
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(a.preferred_at).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                            </div>

                            {a.status === 'pendiente' && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={() => updateStatus(a.id, 'confirmada')}
                                        aria-label="Confirmar"
                                        className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-100 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => updateStatus(a.id, 'cancelada')}
                                        aria-label="Cancelar"
                                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100/80 rounded-lg border border-red-100 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
