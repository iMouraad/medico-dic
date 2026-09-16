import { notFound } from 'next/navigation';
import { ShieldCheck, MapPin, Stethoscope, Percent, Flame, Calendar, Award, GraduationCap, Globe, Star } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ContactButtons from '@/app/components/ContactButtons';
import BioTruncada from '@/app/components/BioTruncada';
import HorarioSemanalPublico from '@/app/components/HorarioSemanalPublico';
import EnviarMensajeLink from '@/app/components/EnviarMensajeLink';
import GaleriaConsultorio from '@/app/components/GaleriaConsultorio';
import UbicacionMapaCliente from '@/app/components/UbicacionMapaCliente';
import { HORARIO_ATENCION_DEFAULT, FOUNDER_LIMIT, type Doctor, type ActivityStreak } from '@/app/lib/types';

export default async function PerfilMedicoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .maybeSingle<Doctor>();

    if (!doctor) notFound();

    // No usar el resultado ni tirar la página si falla: es solo una métrica.
    await supabase.rpc('increment_doctor_stat', { target_id: doctor.id, stat_name: 'profile_views' });

    const { data: streak } = await supabase
        .from('activity_streak')
        .select('racha_actual')
        .eq('doctor_id', doctor.id)
        .maybeSingle<Pick<ActivityStreak, 'racha_actual'>>();

    // "Médico Fundador": entre los primeros FOUNDER_LIMIT médicos registrados
    // (id es secuencial, así que sirve como orden de registro sin necesitar
    // una columna aparte).
    const { count: posicionRegistro } = await supabase
        .from('doctors')
        .select('id', { count: 'exact', head: true })
        .lte('id', doctor.id);
    const esFundador = (posicionRegistro ?? 0) <= FOUNDER_LIMIT;

    const racha = streak?.racha_actual ?? 0;
    const horario = doctor.horario_atencion ?? HORARIO_ATENCION_DEFAULT;
    const tieneUbicacion = doctor.latitude != null && doctor.longitude != null;
    const tieneFormacion = !!doctor.formacion_universidad;
    const tieneIdiomas = !!doctor.idiomas;
    const anios =
        doctor.formacion_anio_inicio && doctor.formacion_anio_fin
            ? ` (${doctor.formacion_anio_inicio} - ${doctor.formacion_anio_fin})`
            : '';

    return (
        <div className="flex flex-col min-h-screen bg-page-bg/40">
            <Header />

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 pb-32">
                {/* Encabezado: foto, nombre, insignias, ubicación, verificado */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                        <img
                            src={doctor.profile_photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                            alt={doctor.name ?? 'Foto de perfil'}
                            className="w-28 h-28 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-blue-dark">{doctor.name ?? 'Médico'}</h1>
                                {doctor.verified_senescyt && (
                                    <ShieldCheck className="w-5 h-5 text-verified-blue fill-verified-blue/10 flex-shrink-0" />
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 text-sm font-bold text-brand-blue mb-2">
                                <Stethoscope className="w-4 h-4" />
                                {doctor.specialty ?? 'Especialidad no especificada'}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {racha > 0 && (
                                    <span className="inline-flex items-center gap-1.5 bg-racha-oro/15 border border-racha-oro/40 text-racha-oro font-bold text-[11px] px-3 py-1.5 rounded-full">
                                        <Flame className="w-3.5 h-3.5" />
                                        Racha · {racha} {racha === 1 ? 'semana' : 'semanas'}
                                    </span>
                                )}
                                {esFundador && (
                                    <span className="inline-flex items-center gap-1.5 bg-brand-blue-dark border border-brand-blue-dark text-white font-bold text-[11px] px-3 py-1.5 rounded-full">
                                        <Award className="w-3.5 h-3.5" />
                                        Médico Fundador
                                    </span>
                                )}
                            </div>

                            {doctor.city && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium mb-3">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {doctor.address ? `${doctor.address}, ${doctor.city}` : doctor.city}
                                    </span>
                                </div>
                            )}

                            {doctor.modalities && doctor.modalities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {doctor.modalities.map((m) => (
                                        <span key={m} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {doctor.verified_senescyt && (
                            <div className="sm:w-56 flex-shrink-0 bg-verified-blue/5 border border-verified-blue/20 rounded-2xl p-4 flex flex-col items-center text-center gap-1.5 self-start">
                                <ShieldCheck className="w-7 h-7 text-verified-blue" />
                                <span className="text-xs font-black text-verified-blue leading-tight">
                                    PERFIL VERIFICADO<br />por NeosDoc
                                </span>
                                <p className="text-[10px] text-slate-500 leading-snug">
                                    Verificamos la formación y especialidad de cada médico.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cuerpo: contenido principal + barra lateral de datos rápidos.
                    En escritorio se ven como dos columnas, en móvil se apilan
                    en el mismo orden (esto ya se veía bien). */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                    <div className="flex flex-col gap-6 min-w-0">
                        {(doctor.bio || doctor.areas_interes?.length > 0) && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-6">
                                {doctor.bio && (
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sobre mí</h2>
                                        <BioTruncada texto={doctor.bio} />
                                    </div>
                                )}
                                {doctor.areas_interes && doctor.areas_interes.length > 0 && (
                                    <div className="md:w-64 flex-shrink-0 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4">
                                        <h2 className="text-xs font-bold text-brand-blue-dark flex items-center gap-1.5 mb-2.5">
                                            <Star className="w-3.5 h-3.5 text-brand-blue fill-brand-blue/20" />
                                            Áreas de interés
                                        </h2>
                                        <ul className="flex flex-col gap-1.5">
                                            {doctor.areas_interes.map((area) => (
                                                <li key={area} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-brand-blue mt-1.5 flex-shrink-0" />
                                                    {area}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {doctor.galeria_urls && doctor.galeria_urls.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                                <GaleriaConsultorio fotos={doctor.galeria_urls} />
                            </div>
                        )}

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Horarios de atención
                            </h2>
                            <HorarioSemanalPublico horario={horario} />
                        </div>

                        {tieneUbicacion && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Ubicación del consultorio
                                </h2>
                                <UbicacionMapaCliente
                                    doctor={{
                                        id: doctor.id,
                                        name: doctor.name ?? 'Médico',
                                        specialty: doctor.specialty ?? '',
                                        city: doctor.city ?? '',
                                        consultation_price: doctor.consultation_price,
                                        profile_photo_url: doctor.profile_photo_url ?? '',
                                        verified_senescyt: doctor.verified_senescyt ?? false,
                                        latitude: doctor.latitude,
                                        longitude: doctor.longitude,
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex justify-center">
                            <EnviarMensajeLink doctor={doctor} />
                        </div>
                    </div>

                    {/* Barra lateral: datos rápidos */}
                    <div className="flex flex-col gap-6 lg:sticky lg:top-6">
                        {(doctor.specialty || tieneFormacion || tieneIdiomas) && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
                                <div className="flex items-start gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center flex-shrink-0">
                                        <Stethoscope className="w-4.5 h-4.5" />
                                    </span>
                                    <div className="min-w-0">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Especialidad</span>
                                        <span className="text-sm font-extrabold text-brand-blue-dark">{doctor.specialty ?? 'No especificada'}</span>
                                    </div>
                                </div>

                                {tieneFormacion && (
                                    <div className="flex items-start gap-3 pt-5 border-t border-slate-50">
                                        <span className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
                                            <GraduationCap className="w-4.5 h-4.5" />
                                        </span>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Formación académica</span>
                                            <span className="text-sm font-extrabold text-brand-blue-dark block">{doctor.formacion_universidad}</span>
                                            {doctor.formacion_titulo && (
                                                <span className="text-xs text-slate-500">{doctor.formacion_titulo}{anios}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {tieneIdiomas && (
                                    <div className="flex items-start gap-3 pt-5 border-t border-slate-50">
                                        <span className="w-10 h-10 rounded-xl bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-4.5 h-4.5" />
                                        </span>
                                        <div className="min-w-0">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Idiomas</span>
                                            <span className="text-sm font-extrabold text-brand-blue-dark block">{doctor.idiomas}</span>
                                            {doctor.idiomas_nivel && (
                                                <span className="text-xs text-slate-500">({doctor.idiomas_nivel})</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
                            <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-xl px-4 py-3">
                                <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block mb-0.5">Consulta</span>
                                <span className="text-lg font-extrabold text-brand-blue-dark">
                                    {doctor.consultation_price != null ? `$${doctor.consultation_price}` : 'Consultar'}
                                </span>
                            </div>

                            {doctor.ofrece_descuento && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <div>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                                            Descuento NEOSDOC
                                        </span>
                                        <span className="text-sm font-extrabold text-emerald-700">
                                            {doctor.descuento_porcentaje}% para pacientes que llegan por NEOSDOC
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <ContactButtons doctor={doctor} />

            <Footer />
        </div>
    );
}
