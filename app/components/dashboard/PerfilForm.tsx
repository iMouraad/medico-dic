'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Upload, FileCheck2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { MODALIDADES_DISPONIBLES, type Doctor } from '@/app/lib/types';

interface Props {
    userId: string;
    userEmail: string;
    doctor: Doctor | null;
}

export default function PerfilForm({ userId, userEmail, doctor }: Props) {
    const router = useRouter();
    const [form, setForm] = useState({
        ruc: doctor?.ruc ?? '',
        name: doctor?.name ?? '',
        specialty: doctor?.specialty ?? '',
        city: doctor?.city ?? '',
        address: doctor?.address ?? '',
        whatsapp: doctor?.whatsapp ?? '',
        email: doctor?.email ?? userEmail,
        consultation_price: doctor?.consultation_price?.toString() ?? '',
        bio: doctor?.bio ?? '',
        modalities: doctor?.modalities ?? [],
        ofrece_descuento: doctor?.ofrece_descuento ?? false,
        descuento_porcentaje: doctor?.descuento_porcentaje?.toString() ?? '',
        acepta_ofertas_comerciales: doctor?.acepta_ofertas_comerciales ?? false,
    });
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(doctor?.profile_photo_url ?? '');
    const [certificadoPath, setCertificadoPath] = useState(doctor?.certificado_url ?? '');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingCertificado, setUploadingCertificado] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        setMessage(null);

        const supabase = createClient();
        const ext = file.name.split('.').pop();
        const path = `${userId}/foto-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('fotos-perfil').upload(path, file, { upsert: true });

        if (error) {
            setMessage({ type: 'error', text: 'No se pudo subir la foto. Intenta de nuevo.' });
        } else {
            const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path);
            setProfilePhotoUrl(data.publicUrl);
        }
        setUploadingPhoto(false);
    };

    const handleCertificadoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCertificado(true);
        setMessage(null);

        const supabase = createClient();
        const ext = file.name.split('.').pop();
        const path = `${userId}/certificado-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('certificados-medicos').upload(path, file, { upsert: true });

        if (error) {
            setMessage({ type: 'error', text: 'No se pudo subir el certificado. Intenta de nuevo.' });
        } else {
            setCertificadoPath(path);
        }
        setUploadingCertificado(false);
    };

    const handleVerCertificado = async () => {
        if (!certificadoPath) return;
        const supabase = createClient();
        const { data, error } = await supabase.storage
            .from('certificados-medicos')
            .createSignedUrl(certificadoPath, 60);
        if (!error && data) window.open(data.signedUrl, '_blank');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

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
            bio: form.bio || null,
            modalities: form.modalities,
            ofrece_descuento: form.ofrece_descuento,
            descuento_porcentaje: form.ofrece_descuento && form.descuento_porcentaje
                ? Number(form.descuento_porcentaje)
                : null,
            acepta_ofertas_comerciales: form.acepta_ofertas_comerciales,
            profile_photo_url: profilePhotoUrl || null,
            certificado_url: certificadoPath || null,
        };

        const { error } = doctor
            ? await supabase.from('doctors').update(payload).eq('id', doctor.id)
            : await supabase.from('doctors').insert({ ...payload, user_id: userId });

        if (error) {
            setMessage({ type: 'error', text: 'No se pudo guardar tu perfil. Intenta de nuevo.' });
        } else {
            setMessage({ type: 'success', text: 'Perfil guardado correctamente.' });
            router.refresh();
        }
        setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4">
            {message && (
                <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl border ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
                {/* Foto y certificado */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {profilePhotoUrl ? (
                                <img src={profilePhotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : (
                                <Upload className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <label className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                            {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}
                            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                        </label>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-2 bg-slate-50/70 border border-slate-100 rounded-xl p-4">
                        <span className="text-xs font-bold text-slate-600">Certificado / título profesional</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Solo lo pueden ver tú y el equipo de NEOSDOC para verificar tu perfil. Nunca se muestra al público.
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                {uploadingCertificado ? 'Subiendo...' : certificadoPath ? 'Reemplazar archivo' : 'Subir archivo'}
                                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCertificadoUpload} disabled={uploadingCertificado} />
                            </label>
                            {certificadoPath && (
                                <button type="button" onClick={handleVerCertificado} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer">
                                    <FileCheck2 className="w-3.5 h-3.5" />
                                    Ver archivo subido
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-600">RUC</label>
                        <input required inputMode="numeric" maxLength={13} value={form.ruc} onChange={update('ruc')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-600">Nombre completo</label>
                        <input required value={form.name} onChange={update('name')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Especialidad</label>
                        <input required value={form.specialty} onChange={update('specialty')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Ciudad</label>
                        <input required value={form.city} onChange={update('city')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-600">Dirección del consultorio</label>
                        <input value={form.address} onChange={update('address')} placeholder="Av. Amazonas y Naciones Unidas, torre X, piso Y" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">WhatsApp</label>
                        <input required value={form.whatsapp} onChange={update('whatsapp')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Correo de contacto</label>
                        <input type="email" value={form.email} onChange={update('email')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-600">Precio de consulta (USD)</label>
                        <input type="number" min="0" step="0.01" value={form.consultation_price} onChange={update('consultation_price')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
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
                        <label className="text-xs font-bold text-slate-600">Sobre ti (bio breve)</label>
                        <textarea rows={3} value={form.bio} onChange={update('bio')} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
                    </div>

                    <div className="sm:col-span-2 bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.ofrece_descuento}
                                onChange={(e) => setForm((prev) => ({ ...prev, ofrece_descuento: e.target.checked }))}
                                className="w-4 h-4 accent-blue-600"
                            />
                            ¿Ofreces un descuento a pacientes que llegan por NEOSDOC?
                        </label>
                        {form.ofrece_descuento && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.descuento_porcentaje}
                                    onChange={update('descuento_porcentaje')}
                                    className="w-24 px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                <span className="text-xs font-bold text-slate-500">% de descuento</span>
                            </div>
                        )}
                    </div>

                    <div className="sm:col-span-2 bg-slate-50/70 border border-slate-100 rounded-xl p-4">
                        <label className="flex items-start gap-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.acepta_ofertas_comerciales}
                                onChange={(e) => setForm((prev) => ({ ...prev, acepta_ofertas_comerciales: e.target.checked }))}
                                className="w-4 h-4 mt-0.5 accent-blue-600 flex-shrink-0"
                            />
                            <span className="font-normal text-slate-500 leading-relaxed">
                                Acepto recibir ofertas y beneficios de proveedores del sector salud a través de
                                NEOSDOC (opcional, nunca compartimos tu contacto directo con terceros).
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving || uploadingPhoto || uploadingCertificado}
                    className="bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                >
                    {saving ? 'Guardando...' : 'Guardar perfil'}
                </button>
            </form>
        </div>
    );
}
