'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Trash2, CalendarOff, Plus } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { DIAS_SEMANA_KEYS, DIAS_SEMANA_LABEL, type DiaBloqueado, type HorarioAtencion } from '@/app/lib/types';
import { formatFechaLarga } from '@/app/lib/dateFormat';

interface Props {
    doctorId: number;
    initialHorario: HorarioAtencion;
    initialDiasBloqueados: DiaBloqueado[];
}

export default function HorarioForm({ doctorId, initialHorario, initialDiasBloqueados }: Props) {
    const [horario, setHorario] = useState(initialHorario);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [diasBloqueados, setDiasBloqueados] = useState(initialDiasBloqueados);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [nuevoMotivo, setNuevoMotivo] = useState('');
    const [bloqueando, setBloqueando] = useState(false);
    const [bloqueoError, setBloqueoError] = useState('');

    const actualizarDia = (dia: keyof HorarioAtencion, campo: 'activo' | 'inicio' | 'fin', valor: boolean | string) => {
        setHorario((prev) => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }));
    };

    const guardarHorario = async () => {
        setSaving(true);
        setMessage(null);
        const supabase = createClient();
        const { error } = await supabase.from('doctors').update({ horario_atencion: horario }).eq('id', doctorId);
        setMessage(
            error
                ? { type: 'error', text: 'No se pudo guardar el horario. Intenta de nuevo.' }
                : { type: 'success', text: 'Horario guardado correctamente.' }
        );
        setSaving(false);
    };

    const agregarDiaBloqueado = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaFecha) return;
        setBloqueando(true);
        setBloqueoError('');

        const supabase = createClient();
        const { data, error } = await supabase
            .from('doctor_dias_bloqueados')
            .insert({ doctor_id: doctorId, fecha: nuevaFecha, motivo: nuevoMotivo || null })
            .select()
            .single();

        if (error) {
            setBloqueoError(
                error.code === '23505' ? 'Esa fecha ya está bloqueada.' : 'No se pudo bloquear la fecha. Intenta de nuevo.'
            );
        } else if (data) {
            setDiasBloqueados((prev) =>
                [...prev, data as DiaBloqueado].sort((a, b) => a.fecha.localeCompare(b.fecha))
            );
            setNuevaFecha('');
            setNuevoMotivo('');
        }
        setBloqueando(false);
    };

    const quitarDiaBloqueado = async (id: number) => {
        const supabase = createClient();
        const { error } = await supabase.from('doctor_dias_bloqueados').delete().eq('id', id);
        if (!error) setDiasBloqueados((prev) => prev.filter((d) => d.id !== id));
    };

    return (
        <div className="flex flex-col gap-6">
            {message && (
                <div
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl border ${
                        message.type === 'success'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-red-50 border-red-100 text-red-600'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col gap-4">
                <h2 className="text-sm font-extrabold text-slate-800">Horario semanal</h2>

                <div className="flex flex-col divide-y divide-slate-50">
                    {DIAS_SEMANA_KEYS.map((dia) => {
                        const config = horario[dia];
                        return (
                            <div key={dia} className="flex items-center gap-3 py-3 flex-wrap">
                                <label className="flex items-center gap-2 w-28 flex-shrink-0 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.activo}
                                        onChange={(e) => actualizarDia(dia, 'activo', e.target.checked)}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <span className={`text-xs font-bold ${config.activo ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {DIAS_SEMANA_LABEL[dia]}
                                    </span>
                                </label>

                                {config.activo ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={config.inicio}
                                            onChange={(e) => actualizarDia(dia, 'inicio', e.target.value)}
                                            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <span className="text-xs text-slate-400">a</span>
                                        <input
                                            type="time"
                                            value={config.fin}
                                            onChange={(e) => actualizarDia(dia, 'fin', e.target.value)}
                                            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">No atiendes este día</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={guardarHorario}
                    disabled={saving}
                    className="self-start bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                >
                    {saving ? 'Guardando...' : 'Guardar horario'}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col gap-4">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-800 mb-0.5">Días bloqueados</h2>
                    <p className="text-xs text-slate-500">Vacaciones, feriados propios o cualquier día que no atiendas.</p>
                </div>

                <form onSubmit={agregarDiaBloqueado} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Fecha</label>
                        <input
                            type="date"
                            required
                            value={nuevaFecha}
                            min={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setNuevaFecha(e.target.value)}
                            className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 w-full sm:w-auto">
                        <label className="text-xs font-bold text-slate-600">Motivo (opcional)</label>
                        <input
                            value={nuevoMotivo}
                            onChange={(e) => setNuevoMotivo(e.target.value)}
                            placeholder="Vacaciones"
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={bloqueando}
                        className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Bloquear
                    </button>
                </form>

                {bloqueoError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{bloqueoError}</span>
                    </div>
                )}

                {diasBloqueados.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                        No tienes días bloqueados próximamente.
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-50">
                        {diasBloqueados.map((d) => (
                            <div key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <CalendarOff className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                    <span className="text-xs font-bold text-slate-700">
                                        {formatFechaLarga(new Date(`${d.fecha}T00:00`))}
                                    </span>
                                    {d.motivo && <span className="text-xs text-slate-400 truncate">· {d.motivo}</span>}
                                </div>
                                <button
                                    onClick={() => quitarDiaBloqueado(d.id)}
                                    aria-label="Quitar bloqueo"
                                    className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100/80 rounded-lg border border-red-100 cursor-pointer flex-shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </div>
    );
}
