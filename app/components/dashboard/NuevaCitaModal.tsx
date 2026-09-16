'use client';

import { useState } from 'react';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { DURACIONES_DISPONIBLES, getConflicts } from '@/app/lib/appointmentConflicts';
import { getHorarioWarning } from '@/app/lib/horarioAtencion';
import { formatHora } from '@/app/lib/dateFormat';
import { HORARIO_ATENCION_DEFAULT, type Appointment, type HorarioAtencion } from '@/app/lib/types';

interface Props {
    doctorId: number;
    initialDate?: string;
    defaultDuration: number;
    appointments: Appointment[];
    horario?: HorarioAtencion;
    diasBloqueados?: string[];
    onClose: () => void;
    onCreated: (appointment: Appointment) => void;
}

interface Warnings {
    conflicts: Appointment[];
    horario: string | null;
}

export default function NuevaCitaModal({
    doctorId,
    initialDate,
    defaultDuration,
    appointments,
    horario = HORARIO_ATENCION_DEFAULT,
    diasBloqueados = [],
    onClose,
    onCreated,
}: Props) {
    const [form, setForm] = useState({
        name: '',
        cedula: '',
        preferredAt: initialDate ? `${initialDate}T09:00` : '',
        duration: defaultDuration,
        email: '',
        phone: '',
        reason: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [warnings, setWarnings] = useState<Warnings | null>(null);

    const update = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setWarnings(null);
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const crear = async () => {
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { data, error: insertError } = await supabase
            .from('appointments')
            .insert({
                doctor_id: doctorId,
                patient_name: form.name,
                patient_cedula: form.cedula,
                patient_email: form.email || null,
                patient_phone: form.phone || null,
                preferred_at: new Date(form.preferredAt).toISOString(),
                duration_minutes: form.duration,
                reason: form.reason || null,
                status: 'confirmada',
            })
            .select()
            .single();

        if (insertError || !data) {
            setError('No se pudo registrar la cita. Intenta de nuevo.');
            setLoading(false);
            return;
        }

        onCreated(data as Appointment);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!warnings) {
            const startISO = new Date(form.preferredAt).toISOString();
            const encontrados = getConflicts(appointments, startISO, Number(form.duration));
            const avisoHorario = getHorarioWarning(horario, diasBloqueados, startISO, Number(form.duration));
            if (encontrados.length > 0 || avisoHorario) {
                setWarnings({ conflicts: encontrados, horario: avisoHorario });
                return;
            }
        }

        await crear();
    };

    const hayAvisos = warnings && (warnings.conflicts.length > 0 || warnings.horario);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-800 mb-0.5">Registrar cita</h2>
                        <p className="text-xs text-slate-500">Para pacientes que ya contactaste por WhatsApp o correo</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {hayAvisos && (
                        <div className="flex flex-col gap-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>Revisa antes de registrar:</span>
                            </div>
                            <ul className="pl-6 list-disc font-normal">
                                {warnings!.horario && <li>{warnings!.horario}</li>}
                                {warnings!.conflicts.map((c) => (
                                    <li key={c.id}>
                                        Se cruza con {c.patient_name} ·{' '}
                                        {formatHora(new Date(c.preferred_at))}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Nombre completo del paciente</label>
                        <input
                            required
                            value={form.name}
                            onChange={update('name')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Cédula</label>
                        <input
                            required
                            inputMode="numeric"
                            maxLength={13}
                            value={form.cedula}
                            onChange={update('cedula')}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Fecha y hora</label>
                            <input
                                type="datetime-local"
                                required
                                value={form.preferredAt}
                                onChange={update('preferredAt')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Duración</label>
                            <select
                                value={form.duration}
                                onChange={(e) => {
                                    setWarnings(null);
                                    setForm((prev) => ({ ...prev, duration: Number(e.target.value) }));
                                }}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                {DURACIONES_DISPONIBLES.map((min) => (
                                    <option key={min} value={min}>
                                        {min} min
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Correo (opcional)</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={update('email')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Teléfono (opcional)</label>
                            <input
                                value={form.phone}
                                onChange={update('phone')}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
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
                        className={`mt-1 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md ${
                            hayAvisos ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-750'
                        }`}
                    >
                        {loading ? 'Guardando...' : hayAvisos ? 'Registrar de todas formas' : 'Registrar cita'}
                    </button>
                </form>
            </div>
        </div>
    );
}
