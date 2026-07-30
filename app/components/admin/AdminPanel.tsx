'use client';

import { useMemo, useState } from 'react';
import { Check, X, Pencil, Trash2, Users, Clock, CheckCircle2, XCircle, Eye, Mail, MessageCircle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Doctor } from '@/app/lib/types';
import AdminEditModal from './AdminEditModal';

interface Props {
    initialDoctors: Doctor[];
}

const STATUS_BADGE: Record<Doctor['status'], string> = {
    pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
    aprobado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rechazado: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminPanel({ initialDoctors }: Props) {
    const [doctors, setDoctors] = useState(initialDoctors);
    const [tab, setTab] = useState<'pendientes' | 'todos'>(
        initialDoctors.some((d) => d.status === 'pendiente') ? 'pendientes' : 'todos'
    );
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    const metrics = useMemo(() => {
        const total = doctors.length;
        const pendientes = doctors.filter((d) => d.status === 'pendiente').length;
        const aprobados = doctors.filter((d) => d.status === 'aprobado').length;
        const rechazados = doctors.filter((d) => d.status === 'rechazado').length;
        return { total, pendientes, aprobados, rechazados };
    }, [doctors]);

    const engagement = useMemo(() => {
        return doctors.reduce(
            (acc, d) => ({
                profileViews: acc.profileViews + (d.profile_views ?? 0),
                appointmentClicks: acc.appointmentClicks + (d.appointment_clicks ?? 0),
                whatsappClicks: acc.whatsappClicks + (d.whatsapp_clicks ?? 0),
            }),
            { profileViews: 0, appointmentClicks: 0, whatsappClicks: 0 }
        );
    }, [doctors]);

    const visibleDoctors = tab === 'pendientes'
        ? doctors.filter((d) => d.status === 'pendiente')
        : doctors;

    const updateStatus = async (id: number, status: Doctor['status']) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('doctors')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (!error && data) {
            setDoctors((prev) => prev.map((d) => (d.id === id ? (data as Doctor) : d)));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este perfil de médico? Esta acción no se puede deshacer.')) return;
        const supabase = createClient();
        const { error } = await supabase.from('doctors').delete().eq('id', id);
        if (!error) setDoctors((prev) => prev.filter((d) => d.id !== id));
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total médicos', value: metrics.total, icon: Users, className: 'text-slate-600 bg-slate-50' },
                    { label: 'Pendientes', value: metrics.pendientes, icon: Clock, className: 'text-amber-600 bg-amber-50' },
                    { label: 'Aprobados', value: metrics.aprobados, icon: CheckCircle2, className: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Rechazados', value: metrics.rechazados, icon: XCircle, className: 'text-red-600 bg-red-50' },
                ].map(({ label, value, icon: Icon, className }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg font-black text-slate-800 leading-none">{value}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Engagement de la plataforma */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Visitas a perfiles', value: engagement.profileViews, icon: Eye, className: 'text-blue-600 bg-blue-50' },
                    { label: 'Solicitudes de cita', value: engagement.appointmentClicks, icon: Mail, className: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Contactos por WhatsApp', value: engagement.whatsappClicks, icon: MessageCircle, className: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, className }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg font-black text-slate-800 leading-none">{value}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setTab('pendientes')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                        tab === 'pendientes' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                >
                    Pendientes ({metrics.pendientes})
                </button>
                <button
                    onClick={() => setTab('todos')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                        tab === 'todos' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                >
                    Todos ({metrics.total})
                </button>
            </div>

            {/* Lista */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                {visibleDoctors.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400 font-medium">
                        No hay médicos en esta vista.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {visibleDoctors.map((doctor) => (
                            <div key={doctor.id} className="flex items-center justify-between gap-4 p-4 flex-wrap">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-bold text-slate-800 truncate">
                                            {doctor.name || 'Perfil incompleto'}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[doctor.status]}`}>
                                            {doctor.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {[doctor.specialty, doctor.city].filter(Boolean).join(' · ') || doctor.email}
                                        {doctor.ruc && <span className="text-slate-400"> · RUC {doctor.ruc}</span>}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {doctor.status !== 'aprobado' && (
                                        <button
                                            onClick={() => updateStatus(doctor.id, 'aprobado')}
                                            aria-label="Aprobar"
                                            className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-100 cursor-pointer"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    {doctor.status !== 'rechazado' && (
                                        <button
                                            onClick={() => updateStatus(doctor.id, 'rechazado')}
                                            aria-label="Rechazar"
                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100/80 rounded-lg border border-red-100 cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setEditingDoctor(doctor)}
                                        aria-label="Editar"
                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-100 cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doctor.id)}
                                        aria-label="Eliminar"
                                        className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingDoctor && (
                <AdminEditModal
                    doctor={editingDoctor}
                    onClose={() => setEditingDoctor(null)}
                    onSaved={(updated) => {
                        setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
                        setEditingDoctor(null);
                    }}
                />
            )}
        </div>
    );
}
