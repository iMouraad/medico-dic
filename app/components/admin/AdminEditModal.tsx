'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { DURACIONES_DISPONIBLES } from '@/app/lib/appointmentConflicts';
import { MODALIDADES_DISPONIBLES, type Doctor, type Specialty } from '@/app/lib/types';

interface Props {
    doctor: Doctor;
    specialties: Specialty[];
    onClose: () => void;
    onSaved: (doctor: Doctor) => void;
}

export default function AdminEditModal({ doctor, specialties, onClose, onSaved }: Props) {
    const [form, setForm] = useState({
        ruc: doctor.ruc ?? '',
        name: doctor.name ?? '',
        specialty: doctor.specialty ?? '',
        city: doctor.city ?? '',
        address: doctor.address ?? '',
        whatsapp: doctor.whatsapp ?? '',
        email: doctor.email ?? '',
        consultation_price: doctor.consultation_price?.toString() ?? '',
        duracion_consulta_minutos: doctor.duracion_consulta_minutos ?? 30,
        bio: doctor.bio ?? '',
        modalities: doctor.modalities ?? [],
        status: doctor.status,
        ofrece_descuento: doctor.ofrece_descuento,
        descuento_porcentaje: doctor.descuento_porcentaje?.toString() ?? '',
    });
    const [saving, setSaving] = useState(false);

    const update = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const toggleModalidad = (modalidad: string) => {
        setForm((prev) => ({
            ...prev,
            modalities: prev.modalities.includes(modalidad)
                ? prev.modalities.filter((m) => m !== modalidad)
                : [...prev.modalities, modalidad],
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const supabase = createClient();
        const payload = {
            ruc: form.ruc || null,
            name: form.name,
            specialty: form.specialty,
            city: form.city,
            address: form.address || null,
            whatsapp: form.whatsapp,
            email: form.email || null,
            consultation_price: form.consultation_price ? Number(form.consultation_price) : null,
            duracion_consulta_minutos: form.duracion_consulta_minutos,
            bio: form.bio || null,
            modalities: form.modalities,
            status: form.status,
            ofrece_descuento: form.ofrece_descuento,
            descuento_porcentaje: form.ofrece_descuento && form.descuento_porcentaje
                ? Number(form.descuento_porcentaje)
                : null,
        };

        const { data, error } = await supabase
            .from('doctors')
            .update(payload)
            .eq('id', doctor.id)
            .select()
            .single();

        setSaving(false);
        if (!error && data) onSaved(data as Doctor);
    };

    const specialtyOptions =
        form.specialty && !specialties.some((s) => s.name === form.specialty)
            ? [{ id: -1, name: form.specialty, created_at: '' }, ...specialties]
            : specialties;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
                    <h2 className="text-sm font-extrabold text-slate-800">Editar médico</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">RUC</label>
                            <input value={form.ruc} onChange={update('ruc')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Nombre</label>
                            <input value={form.name} onChange={update('name')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Especialidad</label>
                            <select
                                value={form.specialty}
                                onChange={(e) => setForm((prev) => ({ ...prev, specialty: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="">Sin especialidad</option>
                                {specialtyOptions.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Ciudad</label>
                            <input value={form.city} onChange={update('city')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-600">Dirección</label>
                            <input value={form.address} onChange={update('address')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">WhatsApp</label>
                            <input value={form.whatsapp} onChange={update('whatsapp')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Correo</label>
                            <input value={form.email} onChange={update('email')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Precio consulta</label>
                            <input type="number" value={form.consultation_price} onChange={update('consultation_price')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Duración consulta</label>
                            <select
                                value={form.duracion_consulta_minutos}
                                onChange={(e) => setForm((prev) => ({ ...prev, duracion_consulta_minutos: Number(e.target.value) }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                {DURACIONES_DISPONIBLES.map((min) => (
                                    <option key={min} value={min}>
                                        {min} minutos
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Doctor['status'] }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="rechazado">Rechazado</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-600">Modalidades</label>
                            <div className="flex flex-wrap gap-2">
                                {MODALIDADES_DISPONIBLES.map((modalidad) => (
                                    <button
                                        key={modalidad}
                                        type="button"
                                        onClick={() => toggleModalidad(modalidad)}
                                        className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-colors cursor-pointer ${
                                            form.modalities.includes(modalidad)
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                                        }`}
                                    >
                                        {modalidad}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-xs font-bold text-slate-600">Bio</label>
                            <textarea rows={3} value={form.bio} onChange={update('bio')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 sticky bottom-0 bg-white">
                    <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2.5 cursor-pointer">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                    >
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
