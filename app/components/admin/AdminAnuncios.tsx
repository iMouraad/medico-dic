'use client';

import { useMemo, useState } from 'react';
import { Trash2, Upload, Pause, Play, Megaphone, AlertCircle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import type { Ad } from '@/app/lib/types';
import StatCard from '../dashboard/StatCard';

interface Props {
    initialAds: Ad[];
}

const ESTADO_BADGE: Record<Ad['estado'], string> = {
    activo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pausado: 'bg-amber-50 text-amber-700 border-amber-200',
    finalizado: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function AdminAnuncios({ initialAds }: Props) {
    const [ads, setAds] = useState(initialAds);
    const [form, setForm] = useState({
        title: '',
        link_url: '',
        fecha_inicio: new Date().toISOString().slice(0, 10),
        fecha_fin: '',
    });
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const metrics = useMemo(
        () => ({
            total: ads.length,
            activos: ads.filter((a) => a.estado === 'activo').length,
            pausados: ads.filter((a) => a.estado === 'pausado').length,
        }),
        [ads]
    );

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');

        const supabase = createClient();
        const ext = file.name.split('.').pop();
        const path = `ad-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('anuncios').upload(path, file, { upsert: true });

        if (uploadError) {
            setError('No se pudo subir la imagen. Intenta de nuevo.');
        } else {
            const { data } = supabase.storage.from('anuncios').getPublicUrl(path);
            setImageUrl(data.publicUrl);
        }
        setUploading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const supabase = createClient();
        const { data, error: insertError } = await supabase
            .from('ads')
            .insert({
                title: form.title,
                image_url: imageUrl || null,
                link_url: form.link_url || null,
                fecha_inicio: form.fecha_inicio,
                fecha_fin: form.fecha_fin || null,
            })
            .select()
            .single();

        if (insertError) {
            setError('No se pudo crear el anuncio. Intenta de nuevo.');
        } else if (data) {
            setAds((prev) => [data as Ad, ...prev]);
            setForm({ title: '', link_url: '', fecha_inicio: new Date().toISOString().slice(0, 10), fecha_fin: '' });
            setImageUrl('');
        }
        setSaving(false);
    };

    const toggleEstado = async (ad: Ad) => {
        const nuevoEstado: Ad['estado'] = ad.estado === 'activo' ? 'pausado' : 'activo';
        const supabase = createClient();
        const { data, error: updateError } = await supabase
            .from('ads')
            .update({ estado: nuevoEstado })
            .eq('id', ad.id)
            .select()
            .single();
        if (!updateError && data) setAds((prev) => prev.map((a) => (a.id === ad.id ? (data as Ad) : a)));
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este anuncio? Esta acción no se puede deshacer.')) return;
        const supabase = createClient();
        const { error: deleteError } = await supabase.from('ads').delete().eq('id', id);
        if (!deleteError) setAds((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Anuncios totales" value={metrics.total} icon={Megaphone} color="blue" />
                <StatCard label="Activos" value={metrics.activos} icon={CheckCircle2} color="emerald" />
                <StatCard label="Pausados" value={metrics.pausados} icon={Pause} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                <form
                    onSubmit={handleCreate}
                    className="lg:col-span-2 lg:sticky lg:top-6 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col gap-4"
                >
                    <h2 className="text-sm font-extrabold text-slate-800">Nuevo anuncio</h2>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-xl">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-2">
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {imageUrl ? (
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            {uploading ? 'Subiendo...' : 'Subir imagen'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                        </label>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Título</label>
                        <input
                            required
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Enlace (opcional)</label>
                        <input
                            value={form.link_url}
                            onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                            placeholder="https://..."
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Fecha inicio</label>
                            <input
                                type="date"
                                required
                                value={form.fecha_inicio}
                                onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600">Fecha fin (opcional)</label>
                            <input
                                type="date"
                                value={form.fecha_fin}
                                onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded-xl transition duration-200 cursor-pointer"
                    >
                        {saving ? 'Guardando...' : 'Publicar anuncio'}
                    </button>
                </form>

                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    {ads.length === 0 ? (
                        <div className="p-10 text-center text-sm text-slate-400 font-medium">No hay anuncios todavía.</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {ads.map((ad) => (
                                <div key={ad.id} className="flex items-center justify-between gap-4 p-4 flex-wrap">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                            {ad.image_url ? (
                                                <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Megaphone className="w-5 h-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-800 truncate">{ad.title}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ESTADO_BADGE[ad.estado]}`}>
                                                    {ad.estado}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {ad.fecha_inicio} {ad.fecha_fin ? `→ ${ad.fecha_fin}` : '→ sin fecha fin'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {ad.estado !== 'finalizado' && (
                                            <button
                                                onClick={() => toggleEstado(ad)}
                                                aria-label={ad.estado === 'activo' ? 'Pausar' : 'Activar'}
                                                className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100/80 rounded-lg border border-amber-100 cursor-pointer"
                                            >
                                                {ad.estado === 'activo' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            aria-label="Eliminar"
                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100/80 rounded-lg border border-red-100 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
