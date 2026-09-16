'use client';

import { useState } from 'react';
import { Plus, X, AlertCircle, Tags } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Specialty } from '@/app/lib/types';
import StatCard from '../dashboard/StatCard';

export default function AdminEspecialidades({ initialSpecialties }: { initialSpecialties: Specialty[] }) {
    const [specialties, setSpecialties] = useState(initialSpecialties);
    const [nombre, setNombre] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const agregar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return;
        setSaving(true);
        setError('');

        const supabase = createClient();
        const { data, error: insertError } = await supabase
            .from('specialties')
            .insert({ name: nombre.trim() })
            .select()
            .single();

        if (insertError) {
            setError(
                insertError.code === '23505' ? 'Esa especialidad ya existe.' : 'No se pudo agregar. Intenta de nuevo.'
            );
        } else if (data) {
            setSpecialties((prev) => [...prev, data as Specialty].sort((a, b) => a.name.localeCompare(b.name)));
            setNombre('');
        }
        setSaving(false);
    };

    const eliminar = async (id: number) => {
        if (!confirm('¿Quitar esta especialidad de la lista? Los médicos que ya la tengan asignada no se ven afectados.')) return;
        const supabase = createClient();
        const { error: deleteError } = await supabase.from('specialties').delete().eq('id', id);
        if (!deleteError) setSpecialties((prev) => prev.filter((s) => s.id !== id));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="max-w-xs">
                <StatCard label="Especialidades" value={specialties.length} icon={Tags} color="blue" />
            </div>

            <form onSubmit={agregar} className="flex items-end gap-2 max-w-lg">
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-bold text-slate-600">Nueva especialidad</label>
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. Medicina del Sueño"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar
                </button>
            </form>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl max-w-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
                {specialties.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400 font-medium">No hay especialidades registradas.</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {specialties.map((s) => (
                            <div
                                key={s.id}
                                className="group flex items-center gap-1.5 bg-blue-50/60 border border-blue-100 text-blue-700 text-xs font-bold pl-3.5 pr-2 py-2 rounded-xl"
                            >
                                <span>{s.name}</span>
                                <button
                                    onClick={() => eliminar(s.id)}
                                    aria-label={`Eliminar ${s.name}`}
                                    className="p-0.5 rounded-full text-blue-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
