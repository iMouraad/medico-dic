'use client';

import { useMemo, useState } from 'react';
import { Search, User, Calendar, Mail, Phone, Users, CalendarClock } from 'lucide-react';
import { APPOINTMENT_STATUS_LABEL, type Appointment } from '@/app/lib/types';
import { formatFechaHora } from '@/app/lib/dateFormat';
import StatCard from './StatCard';

interface Paciente {
    cedula: string;
    nombre: string;
    email: string | null;
    phone: string | null;
    citas: Appointment[];
}

export default function HistorialPacientes({ appointments }: { appointments: Appointment[] }) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string | null>(null);

    const pacientes = useMemo(() => {
        const map = new Map<string, Paciente>();
        // `appointments` viene ordenado por preferred_at descendente desde el
        // servidor, así que la primera vez que aparece una cédula ya trae el
        // nombre/contacto más reciente para ese paciente.
        for (const a of appointments) {
            if (!a.patient_cedula) continue;
            const existing = map.get(a.patient_cedula);
            if (existing) {
                existing.citas.push(a);
            } else {
                map.set(a.patient_cedula, {
                    cedula: a.patient_cedula,
                    nombre: a.patient_name,
                    email: a.patient_email,
                    phone: a.patient_phone,
                    citas: [a],
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => b.citas.length - a.citas.length);
    }, [appointments]);

    const filtrados = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return pacientes;
        return pacientes.filter((p) => p.cedula.includes(q) || p.nombre.toLowerCase().includes(q));
    }, [pacientes, query]);

    const pacienteSeleccionado = pacientes.find((p) => p.cedula === selected) ?? null;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Pacientes" value={pacientes.length} icon={Users} color="blue" />
                <StatCard
                    label="Citas con cédula"
                    value={appointments.filter((a) => a.patient_cedula).length}
                    icon={CalendarClock}
                    color="emerald"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por cédula o nombre..."
                            className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                        {filtrados.length === 0 ? (
                            <div className="p-10 text-center text-sm text-slate-400 font-medium">
                                {pacientes.length === 0
                                    ? 'Todavía no tienes citas con cédula registrada.'
                                    : 'No se encontraron pacientes con esa búsqueda.'}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 max-h-[560px] overflow-y-auto">
                                {filtrados.map((p) => {
                                    const activo = selected === p.cedula;
                                    return (
                                        <button
                                            key={p.cedula}
                                            onClick={() => setSelected(p.cedula)}
                                            className={`w-full flex items-center gap-3 p-4 text-left transition-colors cursor-pointer border-l-4 ${
                                                activo
                                                    ? 'bg-blue-50/50 border-blue-600'
                                                    : 'border-transparent hover:bg-slate-50/70'
                                            }`}
                                        >
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    activo ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                                                }`}
                                            >
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-800 truncate">{p.nombre}</div>
                                                <div className="text-xs text-slate-400">
                                                    Cédula {p.cedula} · {p.citas.length} cita{p.citas.length > 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 lg:sticky lg:top-6">
                    {!pacienteSeleccionado ? (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-10 flex flex-col items-center text-center gap-2">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-bold text-slate-700">Selecciona un paciente</p>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                                Elige un paciente de la lista para ver su historial completo de citas contigo.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                            <div className="p-5 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-extrabold text-slate-800 truncate">
                                        {pacienteSeleccionado.nombre}
                                    </h3>
                                    <p className="text-xs text-slate-400">Cédula {pacienteSeleccionado.cedula}</p>
                                </div>
                            </div>

                            {(pacienteSeleccionado.email || pacienteSeleccionado.phone) && (
                                <div className="px-5 py-3 border-b border-slate-50 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                                    {pacienteSeleccionado.email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" />
                                            {pacienteSeleccionado.email}
                                        </span>
                                    )}
                                    {pacienteSeleccionado.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5" />
                                            {pacienteSeleccionado.phone}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="p-2 divide-y divide-slate-50 max-h-[460px] overflow-y-auto">
                                {pacienteSeleccionado.citas.map((c) => (
                                    <div key={c.id} className="flex items-start justify-between gap-3 px-3 py-3">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-700">
                                                    {formatFechaHora(new Date(c.preferred_at))}
                                                </div>
                                                {c.reason && (
                                                    <div className="text-xs text-slate-400 mt-0.5">{c.reason}</div>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${APPOINTMENT_STATUS_LABEL[c.status].className}`}
                                        >
                                            {APPOINTMENT_STATUS_LABEL[c.status].label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
