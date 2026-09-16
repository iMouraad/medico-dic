'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Upload, FileCheck2, X, ImagePlus, MapPin, Search, Loader2 } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { DURACIONES_DISPONIBLES } from '@/app/lib/appointmentConflicts';
import { MODALIDADES_DISPONIBLES, SECTORES_ESTABLECIMIENTO, type Doctor, type Specialty } from '@/app/lib/types';
import UbicacionMapaPicker from './UbicacionMapaPickerCliente';

interface Props {
    userId: string;
    userEmail: string;
    doctor: Doctor | null;
    specialties: Specialty[];
}

function SeccionPerfil({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-7">
            <h2 className="text-sm font-extrabold text-slate-800">{title}</h2>
            {description && <p className="text-xs text-slate-400 mt-0.5 mb-4">{description}</p>}
            <div className={description ? '' : 'mt-4'}>{children}</div>
        </div>
    );
}

export default function PerfilForm({ userId, userEmail, doctor, specialties }: Props) {
    const router = useRouter();
    const [form, setForm] = useState({
        ruc: doctor?.ruc ?? '',
        name: doctor?.name ?? '',
        specialty: doctor?.specialty ?? '',
        city: doctor?.city ?? '',
        address: doctor?.address ?? '',
        sector: doctor?.sector ?? '',
        whatsapp: doctor?.whatsapp ?? '',
        email: doctor?.email ?? userEmail,
        consultation_price: doctor?.consultation_price?.toString() ?? '',
        duracion_consulta_minutos: doctor?.duracion_consulta_minutos ?? 30,
        bio: doctor?.bio ?? '',
        modalities: doctor?.modalities ?? [],
        ofrece_descuento: doctor?.ofrece_descuento ?? false,
        descuento_porcentaje: doctor?.descuento_porcentaje?.toString() ?? '',
        acepta_ofertas_comerciales: doctor?.acepta_ofertas_comerciales ?? false,
        formacion_universidad: doctor?.formacion_universidad ?? '',
        formacion_titulo: doctor?.formacion_titulo ?? '',
        formacion_anio_inicio: doctor?.formacion_anio_inicio?.toString() ?? '',
        formacion_anio_fin: doctor?.formacion_anio_fin?.toString() ?? '',
        idiomas: doctor?.idiomas ?? '',
        idiomas_nivel: doctor?.idiomas_nivel ?? '',
    });
    const [areasInteres, setAreasInteres] = useState<string[]>(doctor?.areas_interes ?? []);
    const [nuevaAreaInteres, setNuevaAreaInteres] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(doctor?.profile_photo_url ?? '');
    const [certificadoPath, setCertificadoPath] = useState(doctor?.certificado_url ?? '');
    const [galeriaUrls, setGaleriaUrls] = useState<string[]>(doctor?.galeria_urls ?? []);
    const [latitude, setLatitude] = useState<number | null>(doctor?.latitude ?? null);
    const [longitude, setLongitude] = useState<number | null>(doctor?.longitude ?? null);
    const [focusToken, setFocusToken] = useState(0);
    const [ubicacionTocada, setUbicacionTocada] = useState(false);
    const [buscandoEnMapa, setBuscandoEnMapa] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingCertificado, setUploadingCertificado] = useState(false);
    const [uploadingGaleria, setUploadingGaleria] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const update = (field: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const agregarAreaInteres = () => {
        const valor = nuevaAreaInteres.trim();
        if (!valor || areasInteres.includes(valor)) return;
        setAreasInteres((prev) => [...prev, valor]);
        setNuevaAreaInteres('');
    };

    const quitarAreaInteres = (valor: string) => {
        setAreasInteres((prev) => prev.filter((a) => a !== valor));
    };

    const toggleModalidad = (modalidad: string) => {
        setForm((prev) => ({
            ...prev,
            modalities: prev.modalities.includes(modalidad)
                ? prev.modalities.filter((m) => m !== modalidad)
                : [...prev.modalities, modalidad],
        }));
    };

    const buscarEnMapa = async () => {
        if (!form.city) return;
        setBuscandoEnMapa(true);
        setMessage(null);
        try {
            const res = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: form.address, city: form.city }),
            });
            const geo = await res.json();
            if (geo.latitude != null && geo.longitude != null) {
                setLatitude(geo.latitude);
                setLongitude(geo.longitude);
                setFocusToken((t) => t + 1);
                setUbicacionTocada(true);
            } else {
                setMessage({ type: 'error', text: 'No encontramos esa dirección en el mapa. Marca el punto manualmente.' });
            }
        } catch {
            setMessage({ type: 'error', text: 'No se pudo buscar la dirección. Marca el punto manualmente en el mapa.' });
        }
        setBuscandoEnMapa(false);
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

    const handleGaleriaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        // Límite razonable para no llenar el storage con una sola subida ni
        // sobrecargar la vista previa del perfil público.
        const disponibles = Math.max(0, 12 - galeriaUrls.length);
        const aSubir = files.slice(0, disponibles);

        setUploadingGaleria(true);
        setMessage(null);
        const supabase = createClient();
        const nuevasUrls: string[] = [];

        for (const file of aSubir) {
            const ext = file.name.split('.').pop();
            const path = `${userId}/galeria-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error } = await supabase.storage.from('galeria-consultorio').upload(path, file);
            if (!error) {
                const { data } = supabase.storage.from('galeria-consultorio').getPublicUrl(path);
                nuevasUrls.push(data.publicUrl);
            }
        }

        if (nuevasUrls.length < aSubir.length) {
            setMessage({ type: 'error', text: 'Algunas fotos no se pudieron subir. Intenta de nuevo con esas.' });
        }
        setGaleriaUrls((prev) => [...prev, ...nuevasUrls]);
        setUploadingGaleria(false);
        e.target.value = '';
    };

    const handleEliminarFotoGaleria = (url: string) => {
        setGaleriaUrls((prev) => prev.filter((u) => u !== url));
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

        // El médico ya puede marcar el pin él mismo en el mapa (fuente de
        // verdad). Solo si nunca lo tocó y no tiene coordenadas guardadas,
        // intentamos geocodificar automáticamente a partir de la dirección,
        // como respaldo.
        let finalLatitude = latitude;
        let finalLongitude = longitude;

        if (finalLatitude == null && finalLongitude == null && form.city) {
            try {
                const res = await fetch('/api/geocode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: form.address, city: form.city }),
                });
                const geo = await res.json();
                finalLatitude = geo.latitude ?? null;
                finalLongitude = geo.longitude ?? null;
            } catch {
                finalLatitude = null;
                finalLongitude = null;
            }
        }

        const supabase = createClient();
        const payload = {
            ruc: doctor?.ruc || form.ruc || null,
            name: form.name,
            specialty: form.specialty,
            city: form.city,
            address: form.address || null,
            sector: form.sector || null,
            whatsapp: form.whatsapp,
            email: form.email || null,
            consultation_price: form.consultation_price ? Number(form.consultation_price) : null,
            duracion_consulta_minutos: form.duracion_consulta_minutos,
            bio: form.bio || null,
            modalities: form.modalities,
            ofrece_descuento: form.ofrece_descuento,
            descuento_porcentaje: form.ofrece_descuento && form.descuento_porcentaje
                ? Number(form.descuento_porcentaje)
                : null,
            acepta_ofertas_comerciales: form.acepta_ofertas_comerciales,
            profile_photo_url: profilePhotoUrl || null,
            certificado_url: certificadoPath || null,
            galeria_urls: galeriaUrls,
            latitude: finalLatitude,
            longitude: finalLongitude,
            formacion_universidad: form.formacion_universidad || null,
            formacion_titulo: form.formacion_titulo || null,
            formacion_anio_inicio: form.formacion_anio_inicio ? Number(form.formacion_anio_inicio) : null,
            formacion_anio_fin: form.formacion_anio_fin ? Number(form.formacion_anio_fin) : null,
            idiomas: form.idiomas || null,
            idiomas_nivel: form.idiomas_nivel || null,
            areas_interes: areasInteres,
        };

        const { error } = doctor
            ? await supabase.from('doctors').update(payload).eq('id', doctor.id)
            : await supabase.from('doctors').insert({ ...payload, user_id: userId });

        if (error) {
            setMessage({ type: 'error', text: 'No se pudo guardar tu perfil. Intenta de nuevo.' });
        } else {
            setMessage({ type: 'success', text: 'Perfil guardado correctamente.' });
            setLatitude(finalLatitude);
            setLongitude(finalLongitude);
            setUbicacionTocada(false);
            router.refresh();
        }
        setSaving(false);
    };

    // Si el médico ya tenía una especialidad guardada que ya no está en el
    // catálogo (texto libre de antes de este cambio, o borrada por el
    // admin), la agregamos como opción para no perderla al mostrar el select.
    const specialtyOptions =
        form.specialty && !specialties.some((s) => s.name === form.specialty)
            ? [{ id: -1, name: form.specialty, created_at: '' }, ...specialties]
            : specialties;

    const inputClass =
        'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

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

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
                {/* Sidebar: foto, certificado, guardar */}
                <div className="flex flex-col gap-4 lg:sticky lg:top-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col items-center gap-3 text-center">
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
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Es la primera imagen que ve el paciente en tu perfil público.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-600">Certificado / título profesional</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Solo lo pueden ver tú y el equipo de NEOSDOC para verificar tu perfil. Nunca se muestra al público.
                        </p>
                        <div className="flex flex-col items-start gap-2 mt-1">
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

                    <button
                        type="submit"
                        disabled={saving || uploadingPhoto || uploadingCertificado || uploadingGaleria}
                        className="bg-blue-600 hover:bg-blue-750 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition duration-200 cursor-pointer active:scale-98 shadow-sm hover:shadow-md"
                    >
                        {saving ? 'Guardando...' : 'Guardar perfil'}
                    </button>
                </div>

                {/* Secciones del formulario */}
                <div className="flex flex-col gap-6 min-w-0">
                    <SeccionPerfil title="Datos básicos">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">RUC</label>
                                <input
                                    required
                                    inputMode="numeric"
                                    maxLength={13}
                                    value={form.ruc}
                                    onChange={update('ruc')}
                                    disabled={!!doctor?.ruc}
                                    className={`${inputClass} ${doctor?.ruc ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
                                />
                                {doctor?.ruc && (
                                    <p className="text-[11px] text-slate-400">
                                        No se puede modificar una vez guardado. Escríbenos si necesitas corregirlo.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600">Nombre completo</label>
                                <input required value={form.name} onChange={update('name')} className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Especialidad</label>
                                <select
                                    required
                                    value={form.specialty}
                                    onChange={(e) => setForm((prev) => ({ ...prev, specialty: e.target.value }))}
                                    className={`${inputClass} bg-white`}
                                >
                                    <option value="" disabled>
                                        Selecciona una especialidad
                                    </option>
                                    {specialtyOptions.map((s) => (
                                        <option key={s.id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {doctor?.status === 'aprobado' && (
                                    <p className="text-[11px] text-slate-400">
                                        Si la cambias, tu perfil vuelve a revisión antes de publicarse de nuevo.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">WhatsApp</label>
                                <input required value={form.whatsapp} onChange={update('whatsapp')} className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Correo de contacto</label>
                                <input type="email" value={form.email} onChange={update('email')} className={inputClass} />
                            </div>
                        </div>
                    </SeccionPerfil>

                    <SeccionPerfil
                        title="Ubicación del consultorio"
                        description="Escribe tu ciudad y dirección, y ajusta el pin en el mapa arrastrándolo hasta la puerta exacta de tu consultorio. Así el paciente te encuentra sin confusiones."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Ciudad</label>
                                <input required value={form.city} onChange={update('city')} className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Sector (opcional)</label>
                                <select
                                    value={form.sector}
                                    onChange={(e) => setForm((prev) => ({ ...prev, sector: e.target.value }))}
                                    className={`${inputClass} bg-white`}
                                >
                                    <option value="">Sin especificar</option>
                                    {SECTORES_ESTABLECIMIENTO.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600">Dirección del consultorio</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        value={form.address}
                                        onChange={update('address')}
                                        placeholder="Av. Amazonas y Naciones Unidas, torre X, piso Y"
                                        className={`${inputClass} flex-1`}
                                    />
                                    <button
                                        type="button"
                                        onClick={buscarEnMapa}
                                        disabled={!form.city || buscandoEnMapa}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-brand-turquoise/30 text-brand-turquoise text-xs font-bold hover:bg-brand-turquoise/5 disabled:opacity-50 transition-colors cursor-pointer flex-shrink-0"
                                    >
                                        {buscandoEnMapa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                        Buscar en el mapa
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-brand-turquoise" />
                            {latitude != null ? 'Arrastra el pin para ajustar la ubicación exacta' : 'Toca el mapa para marcar tu consultorio'}
                        </div>
                        <UbicacionMapaPicker
                            latitude={latitude}
                            longitude={longitude}
                            focusToken={focusToken}
                            onChange={(lat, lng) => {
                                setLatitude(lat);
                                setLongitude(lng);
                                setUbicacionTocada(true);
                            }}
                        />

                        {latitude != null && longitude != null && (
                            <div className="mt-3 flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-700">
                                    <span className="font-bold">Ubicación marcada</span> ({latitude.toFixed(5)}, {longitude.toFixed(5)}).
                                    {ubicacionTocada && ' Recuerda hacer clic en "Guardar perfil" abajo para que quede guardada.'}
                                </p>
                            </div>
                        )}
                    </SeccionPerfil>

                    <SeccionPerfil title="Consulta y modalidades">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Precio de consulta (USD)</label>
                                <input type="number" min="0" step="0.01" value={form.consultation_price} onChange={update('consultation_price')} className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Duración típica de consulta</label>
                                <select
                                    value={form.duracion_consulta_minutos}
                                    onChange={(e) => setForm((prev) => ({ ...prev, duracion_consulta_minutos: Number(e.target.value) }))}
                                    className={`${inputClass} bg-white`}
                                >
                                    {DURACIONES_DISPONIBLES.map((min) => (
                                        <option key={min} value={min}>
                                            {min} minutos
                                        </option>
                                    ))}
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
                        </div>
                    </SeccionPerfil>

                    <SeccionPerfil
                        title="Formación académica e idiomas"
                        description="Se muestra en tu perfil público junto a tu especialidad, para dar más confianza al paciente."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600">Universidad</label>
                                <input
                                    value={form.formacion_universidad}
                                    onChange={update('formacion_universidad')}
                                    placeholder="Universidad San Francisco de Quito"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-slate-600">Título</label>
                                <input
                                    value={form.formacion_titulo}
                                    onChange={update('formacion_titulo')}
                                    placeholder="Título de Médico Cirujano"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Año de inicio</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={form.formacion_anio_inicio}
                                    onChange={update('formacion_anio_inicio')}
                                    placeholder="2008"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Año de fin</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={form.formacion_anio_fin}
                                    onChange={update('formacion_anio_fin')}
                                    placeholder="2014"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Idiomas</label>
                                <input
                                    value={form.idiomas}
                                    onChange={update('idiomas')}
                                    placeholder="Español / Inglés"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-600">Nivel</label>
                                <input
                                    value={form.idiomas_nivel}
                                    onChange={update('idiomas_nivel')}
                                    placeholder="Nivel intermedio"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </SeccionPerfil>

                    <SeccionPerfil
                        title="Áreas de interés"
                        description="Temas o enfoques dentro de tu especialidad. Escribe uno y presiona Enter para agregarlo."
                    >
                        <div className="flex gap-2 mb-3">
                            <input
                                value={nuevaAreaInteres}
                                onChange={(e) => setNuevaAreaInteres(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        agregarAreaInteres();
                                    }
                                }}
                                placeholder="Ej. Prevención cardiovascular"
                                className={`${inputClass} flex-1`}
                            />
                            <button
                                type="button"
                                onClick={agregarAreaInteres}
                                className="px-4 py-2.5 rounded-xl border border-brand-turquoise/30 text-brand-turquoise text-xs font-bold hover:bg-brand-turquoise/5 transition-colors cursor-pointer flex-shrink-0"
                            >
                                Agregar
                            </button>
                        </div>
                        {areasInteres.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {areasInteres.map((area) => (
                                    <span
                                        key={area}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-blue/5 text-brand-blue-dark px-3 py-1.5 rounded-full"
                                    >
                                        {area}
                                        <button
                                            type="button"
                                            onClick={() => quitarAreaInteres(area)}
                                            aria-label={`Quitar ${area}`}
                                            className="cursor-pointer hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </SeccionPerfil>

                    <SeccionPerfil title="Sobre ti y galería">
                        <div className="flex flex-col gap-1.5 mb-5">
                            <label className="text-xs font-bold text-slate-600">Sobre ti (bio breve)</label>
                            <textarea rows={3} value={form.bio} onChange={update('bio')} className={`${inputClass} resize-none`} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-600">Galería de tu consultorio</label>
                            <p className="text-[11px] text-slate-400 -mt-1">
                                Hasta 12 fotos. Se muestran en tu perfil público para dar confianza al paciente.
                            </p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-2.5">
                                {galeriaUrls.map((url) => (
                                    <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100">
                                        <img src={url} alt="Foto del consultorio" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarFotoGaleria(url)}
                                            aria-label="Quitar foto"
                                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/60 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {galeriaUrls.length < 12 && (
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors">
                                        <ImagePlus className="w-5 h-5" />
                                        <span className="text-[10px] font-bold text-center px-1">
                                            {uploadingGaleria ? 'Subiendo...' : 'Agregar fotos'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleGaleriaUpload}
                                            disabled={uploadingGaleria}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </SeccionPerfil>

                    <SeccionPerfil title="Descuentos y consentimiento comercial">
                        <div className="flex flex-col gap-4">
                            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col gap-3">
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

                            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4">
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
                    </SeccionPerfil>
                </div>
            </form>
        </div>
    );
}
